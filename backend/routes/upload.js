const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const {
    S3Client,
    PutObjectCommand,
    CreateBucketCommand,
    HeadBucketCommand,
    PutBucketPolicyCommand,
} = require('@aws-sdk/client-s3');

const router = express.Router();

const MINIO_ENDPOINT   = process.env.MINIO_ENDPOINT   || 'localhost';
const MINIO_PORT       = parseInt(process.env.MINIO_PORT || '9000', 10);
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'minioadmin';
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'minioadmin';
const MINIO_BUCKET     = process.env.MINIO_BUCKET     || 'wavetalk';
const MINIO_USE_SSL    = process.env.MINIO_USE_SSL === 'true';
const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL || 'http://localhost:9000';

const s3 = new S3Client({
    endpoint: `http${MINIO_USE_SSL ? 's' : ''}://${MINIO_ENDPOINT}:${MINIO_PORT}`,
    region: 'us-east-1',
    credentials: {
        accessKeyId: MINIO_ACCESS_KEY,
        secretAccessKey: MINIO_SECRET_KEY,
    },
    forcePathStyle: true, // required for MinIO path-style URLs
});

const PUBLIC_POLICY = JSON.stringify({
    Version: '2012-10-17',
    Statement: [{
        Effect: 'Allow',
        Principal: '*',
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${MINIO_BUCKET}/*`],
    }],
});

async function ensureBucket() {
    try {
        await s3.send(new CreateBucketCommand({ Bucket: MINIO_BUCKET }));
        await s3.send(new PutBucketPolicyCommand({ Bucket: MINIO_BUCKET, Policy: PUBLIC_POLICY }));
        console.log(`[MinIO] Created bucket "${MINIO_BUCKET}" with public-read policy`);
    } catch (err) {
        const code = err?.name || err?.Code || '';
        if (code !== 'BucketAlreadyOwnedByYou' && code !== 'BucketAlreadyExists') {
            throw err;
        }
        // Bucket already exists — apply policy anyway
        try {
            await s3.send(new PutBucketPolicyCommand({ Bucket: MINIO_BUCKET, Policy: PUBLIC_POLICY }));
        } catch { /* policy may already be set */ }
    }
}

async function initBucket(attemptsLeft = 10, delayMs = 2000) {
    try {
        await s3.send(new HeadBucketCommand({ Bucket: MINIO_BUCKET }));
        console.log(`[MinIO] Bucket "${MINIO_BUCKET}" ready`);
    } catch (err) {
        const code = err?.name || err?.Code || '';
        const status = err?.$metadata?.httpStatusCode;
        const missing = code === 'NoSuchBucket' || code === 'NotFound' || code === '404' || status === 404;
        if (missing) {
            await ensureBucket();
        } else if (attemptsLeft > 0) {
            console.log(`[MinIO] Not ready, retrying in ${delayMs}ms… (${attemptsLeft} left)`);
            await new Promise(r => setTimeout(r, delayMs));
            await initBucket(attemptsLeft - 1, delayMs);
        } else {
            console.error('[MinIO] Could not connect after all retries:', err.message);
        }
    }
}

initBucket();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedExts = /jpeg|jpg|png|gif|webp|mp4|mov|avi|webm|pdf|doc|docx|txt|zip|csv/;
        const ext = path.extname(file.originalname).toLowerCase().slice(1);
        if (allowedExts.test(ext)) {
            cb(null, true);
        } else {
            cb(new Error('File type not allowed'));
        }
    }
});

router.post('/', protect, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    try {
        const ext = path.extname(req.file.originalname);
        const key = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

        try {
            await s3.send(new PutObjectCommand({
                Bucket: MINIO_BUCKET,
                Key: key,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
            }));
        } catch (putErr) {
            const code = putErr?.name || putErr?.Code || '';
            const status = putErr?.$metadata?.httpStatusCode;
            if (code === 'NoSuchBucket' || code === 'NotFound' || status === 404) {
                await ensureBucket();
                await s3.send(new PutObjectCommand({
                    Bucket: MINIO_BUCKET,
                    Key: key,
                    Body: req.file.buffer,
                    ContentType: req.file.mimetype,
                }));
            } else {
                throw putErr;
            }
        }

        res.json({
            fileUrl: `${MINIO_PUBLIC_URL}/${MINIO_BUCKET}/${key}`,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
        });
    } catch (err) {
        console.error('[MinIO] Upload error:', err.message);
        res.status(500).json({ message: 'Upload failed', error: err.message });
    }
});

module.exports = router;
