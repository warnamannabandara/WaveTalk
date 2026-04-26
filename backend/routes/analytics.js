const express = require('express');
const User = require('../models/User');
const Meeting = require('../models/Meeting');
const Message = require('../models/Message');
const Document = require('../models/Document');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/analytics/overview - general stats for current user
router.get('/overview', protect, async (req, res, next) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [totalMeetings, meetingsThisWeek, totalDocs, signHistoryCount] = await Promise.all([
            Meeting.countDocuments({ $or: [{ host: userId }, { participants: userId }] }),
            Meeting.countDocuments({
                $or: [{ host: userId }, { participants: userId }],
                createdAt: { $gte: weekAgo }
            }),
            Document.countDocuments({ $or: [{ owner: userId }, { sharedWith: userId }], deletedAt: null }),
            User.findById(userId).select('signLanguageHistory').then(u => u?.signLanguageHistory?.length || 0)
        ]);

        const meetingsByMonth = await Meeting.aggregate([
            { $match: { $or: [{ host: userId }, { participants: userId }], createdAt: { $gte: monthAgo } } },
            { $group: { _id: { $dayOfMonth: '$createdAt' }, count: { $sum: 1 } } },
            { $sort: { '_id': 1 } }
        ]);

        res.json({
            totalMeetings,
            meetingsThisWeek,
            totalDocuments: totalDocs,
            signLanguageDetections: signHistoryCount,
            meetingsByMonth
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/analytics/admin - admin dashboard stats
router.get('/admin', protect, adminOnly, async (req, res, next) => {
    try {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);

        const [
            totalUsers,
            activeUsers,
            inactiveUsers,
            bannedUsers,
            totalMeetings,
            activeMeetings,
            completedMeetings,
            totalDocs,
            totalMessages,
            storageResult,
            signLangCount,
            userGrowthWeek,
            userGrowthMonth,
            userGrowthYear,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ status: 'active' }),
            User.countDocuments({ status: 'inactive' }),
            User.countDocuments({ status: 'banned' }),
            Meeting.countDocuments(),
            Meeting.countDocuments({ status: 'active' }),
            Meeting.countDocuments({ status: 'ended' }),
            Document.countDocuments({ deletedAt: null }),
            Message.countDocuments({ deletedAt: null }),
            Document.aggregate([
                { $match: { deletedAt: null, fileSize: { $exists: true, $ne: null } } },
                { $group: { _id: null, total: { $sum: '$fileSize' } } }
            ]),
            User.aggregate([
                { $project: { count: { $size: { $ifNull: ['$signLanguageHistory', []] } } } },
                { $group: { _id: null, total: { $sum: '$count' } } }
            ]),
            User.countDocuments({ createdAt: { $gte: weekAgo } }),
            User.countDocuments({ createdAt: { $gte: monthAgo } }),
            User.countDocuments({ createdAt: { $gte: yearAgo } }),
        ]);

        // System metrics: user & meeting counts per month for last 6 months
        const [usersByMonth, meetingsByMonth] = await Promise.all([
            User.aggregate([
                { $match: { createdAt: { $gte: sixMonthsAgo } } },
                {
                    $group: {
                        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]),
            Meeting.aggregate([
                { $match: { createdAt: { $gte: sixMonthsAgo } } },
                {
                    $group: {
                        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ])
        ]);

        // Build a unified 6-month timeline
        const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const systemMetrics = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const yr = d.getFullYear();
            const mo = d.getMonth() + 1;
            const uEntry = usersByMonth.find(e => e._id.year === yr && e._id.month === mo);
            const mEntry = meetingsByMonth.find(e => e._id.year === yr && e._id.month === mo);
            systemMetrics.push({
                month: monthLabels[mo - 1],
                users: uEntry ? uEntry.count : 0,
                meetings: mEntry ? mEntry.count : 0,
            });
        }

        // Peak hours: meetings grouped by hour of startedAt
        const peakHoursRaw = await Meeting.aggregate([
            { $match: { startedAt: { $exists: true, $ne: null } } },
            { $group: { _id: { $hour: '$startedAt' }, count: { $sum: 1 } } },
            { $sort: { '_id': 1 } }
        ]);

        // Bucket into morning/afternoon/evening
        let morningCount = 0, afternoonCount = 0, eveningCount = 0, nightCount = 0;
        peakHoursRaw.forEach(({ _id: hour, count }) => {
            if (hour >= 9 && hour < 12) morningCount += count;
            else if (hour >= 12 && hour < 17) afternoonCount += count;
            else if (hour >= 17 && hour < 21) eveningCount += count;
            else nightCount += count;
        });
        const peakTotal = morningCount + afternoonCount + eveningCount + nightCount || 1;
        const peakHours = [
            { label: 'Morning (9-12)', count: morningCount, pct: Math.round((morningCount / peakTotal) * 100) },
            { label: 'Afternoon (12-5)', count: afternoonCount, pct: Math.round((afternoonCount / peakTotal) * 100) },
            { label: 'Evening (5-9)', count: eveningCount, pct: Math.round((eveningCount / peakTotal) * 100) },
            { label: 'Night (9+)', count: nightCount, pct: Math.round((nightCount / peakTotal) * 100) },
        ];

        // Meeting duration breakdown
        const durationRaw = await Meeting.aggregate([
            { $match: { startedAt: { $exists: true, $ne: null }, endedAt: { $exists: true, $ne: null } } },
            {
                $project: {
                    durationMin: {
                        $divide: [{ $subtract: ['$endedAt', '$startedAt'] }, 60000]
                    }
                }
            },
            {
                $bucket: {
                    groupBy: '$durationMin',
                    boundaries: [0, 30, 60, Infinity],
                    default: 'other',
                    output: { count: { $sum: 1 } }
                }
            }
        ]);

        const durShort = durationRaw.find(d => d._id === 0)?.count || 0;
        const durMed = durationRaw.find(d => d._id === 30)?.count || 0;
        const durLong = durationRaw.find(d => d._id === 60)?.count || 0;
        const durTotal = durShort + durMed + durLong || 1;
        const meetingDuration = [
            { label: '0-30 mins', count: durShort, pct: Math.round((durShort / durTotal) * 100) },
            { label: '30-60 mins', count: durMed, pct: Math.round((durMed / durTotal) * 100) },
            { label: '60+ mins', count: durLong, pct: Math.round((durLong / durTotal) * 100) },
        ];

        // Feature usage (normalised to 0-100 relative scale based on counts)
        const featureCounts = {
            'Video Calls': totalMeetings,
            'Chat': totalMessages,
            'Documents': totalDocs,
            'Sign Language': signLangCount[0]?.total || 0,
        };
        const maxFeature = Math.max(...Object.values(featureCounts), 1);
        const featureUsage = Object.entries(featureCounts).map(([label, val]) => ({
            label,
            count: val,
            pct: Math.round((val / maxFeature) * 100),
        }));

        const storageUsed = storageResult[0]?.total || 0;

        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email createdAt role status');

        res.json({
            totalUsers,
            activeUsers,
            inactiveUsers,
            bannedUsers,
            totalMeetings,
            activeMeetings,
            completedMeetings,
            totalDocuments: totalDocs,
            totalMessages,
            storageUsed,
            systemStatus: 'healthy',
            systemMetrics,
            featureUsage,
            peakHours,
            meetingDuration,
            userGrowth: {
                thisWeek: userGrowthWeek,
                thisMonth: userGrowthMonth,
                thisYear: userGrowthYear,
            },
            recentUsers,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
