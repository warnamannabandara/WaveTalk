"use client";

import { useEffect, useRef } from 'react';
import { MicOff, VideoOff, Volume2, Monitor } from 'lucide-react';
import type { RemoteParticipant, SignCaption } from '@/hooks/useMeeting';
import type { SignDetectionState } from '@/hooks/useSignLanguage';

// ── Caption bar ──────────────────────────────────────────────────────────────
function CaptionBar({ word, sentence, speechText }: { word: string; sentence: string; speechText?: string }) {
    return (
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-linear-to-t from-black/80 to-transparent px-4 py-3">
            {speechText && (
                <p className="text-white text-sm font-medium leading-snug line-clamp-2">{speechText}</p>
            )}
            {sentence && sentence !== 'Waiting for gestures...' && !speechText && (
                <p className="text-white text-sm font-medium leading-snug line-clamp-2">{sentence}</p>
            )}
            {word && word !== '...' && (
                <p className="text-emerald-400 text-xs mt-0.5 font-semibold tracking-wide uppercase">{word}</p>
            )}
        </div>
    );
}

// ── Active speaker wave ───────────────────────────────────────────────────────
function SpeakerWave() {
    return (
        <div className="flex items-end gap-0.5 h-4">
            {[1, 2, 3, 2, 1].map((h, i) => (
                <div
                    key={i}
                    className="w-1 bg-emerald-400 rounded-full animate-pulse"
                    style={{ height: `${h * 4}px`, animationDelay: `${i * 0.1}s` }}
                />
            ))}
        </div>
    );
}

// ── Single video tile ─────────────────────────────────────────────────────────
interface VideoTileProps {
    stream: MediaStream | null;
    name: string;
    micOn: boolean;
    videoOn: boolean;
    caption?: { word: string; sentence: string; speechText?: string } | null;
    isLocal?: boolean;
    isActiveSpeaker?: boolean;
    speechCaption?: string;
    compact?: boolean;
}

function VideoTile({ stream, name, micOn, videoOn, caption, isLocal, isActiveSpeaker, speechCaption, compact }: VideoTileProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const showVideo = !!stream && videoOn;

    useEffect(() => {
        if (videoRef.current) videoRef.current.srcObject = stream ?? null;
    }, [stream, showVideo]);

    return (
        <div className={`relative bg-[#2A3430]/30 rounded-2xl border overflow-hidden flex items-center justify-center transition-all h-full ${
            isActiveSpeaker
                ? 'border-emerald-400/60 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-400/30'
                : 'border-emerald-500/10 hover:border-emerald-500/30'
        }`}>
            {showVideo ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={isLocal}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            ) : (
                <>
                    <div className="absolute inset-0 bg-[#2D4A3E]/40" />
                    <div className={`${compact ? 'w-10 h-10 text-base' : 'w-20 h-20 text-2xl'} rounded-full bg-emerald-900/50 border border-emerald-500/30 flex items-center justify-center font-semibold text-emerald-200 z-10`}>
                        {name.charAt(0).toUpperCase()}
                    </div>
                </>
            )}

            {/* Name + active speaker */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 z-20">
                <div className={`bg-[#141B18]/80 backdrop-blur-md ${compact ? 'px-1.5 py-0.5' : 'px-2.5 py-1'} rounded-lg border border-white/5 flex items-center gap-1`}>
                    {isActiveSpeaker && micOn && <Volume2 className="w-2.5 h-2.5 text-emerald-400" />}
                    <span className={`${compact ? 'text-[10px]' : 'text-xs'} font-medium text-white truncate max-w-20`}>
                        {isLocal ? `${name} (You)` : name}
                    </span>
                </div>
                {!compact && isActiveSpeaker && micOn && (
                    <div className="bg-[#141B18]/80 backdrop-blur-md px-2 py-1 rounded-lg border border-emerald-500/20">
                        <SpeakerWave />
                    </div>
                )}
            </div>

            {/* Mic / video-off badges */}
            <div className="absolute top-2 right-2 flex gap-1 z-20">
                {!micOn && (
                    <div className="bg-red-500/90 p-1 rounded-md shadow-lg shadow-red-500/20">
                        <MicOff className="w-3 h-3 text-white" />
                    </div>
                )}
                {!videoOn && (
                    <div className="bg-gray-700/90 p-1 rounded-md">
                        <VideoOff className="w-3 h-3 text-white" />
                    </div>
                )}
            </div>

            {/* Captions */}
            {!compact && ((caption && (caption.word || caption.sentence)) || speechCaption) && (
                <CaptionBar
                    word={caption?.word ?? ''}
                    sentence={caption?.sentence ?? ''}
                    speechText={speechCaption}
                />
            )}
        </div>
    );
}

// ── Grid ──────────────────────────────────────────────────────────────────────
interface ParticipantGridProps {
    localStream: MediaStream | null;
    screenStream: MediaStream | null;
    screenSharing: boolean;
    localName: string;
    micOn: boolean;
    videoOn: boolean;
    localCaption: SignDetectionState | null;
    localSpeechCaption?: string;
    remoteParticipants: RemoteParticipant[];
    participantCaptions: Map<string, SignCaption>;
    activeSpeakerId: string | null;
    activeSpeakerFocusEnabled: boolean;
}

const ParticipantGrid = ({
    localStream,
    screenStream,
    screenSharing,
    localName,
    micOn,
    videoOn,
    localCaption,
    localSpeechCaption,
    remoteParticipants,
    participantCaptions,
    activeSpeakerId,
    activeSpeakerFocusEnabled,
}: ParticipantGridProps) => {
    const screenVideoRef = useRef<HTMLVideoElement>(null);

    const remoteScreenSharer = remoteParticipants.find(p => p.isScreenSharing);
    const isScreenShareActive = screenSharing || !!remoteScreenSharer;
    const activeScreenStream = screenSharing ? screenStream : (remoteScreenSharer ? remoteScreenSharer.stream : null);

    useEffect(() => {
        if (screenVideoRef.current) {
            screenVideoRef.current.srcObject = activeScreenStream ?? null;
        }
    }, [activeScreenStream]);

    // ── Screen-sharing layout: large screen + compact participant strip ──────
    if (isScreenShareActive && activeScreenStream) {
        return (
            <div className="flex flex-1 min-h-0 bg-[#141B18] border-x border-[#2A3430] p-3 gap-3">
                {/* Main screen share area */}
                <div className="flex-1 relative rounded-xl overflow-hidden bg-black flex items-center justify-center min-w-0">
                    <video
                        ref={screenVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-contain"
                    />
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-[#141B18]/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/5 text-xs text-white">
                        <Monitor className="w-3 h-3 text-emerald-400" />
                        {screenSharing ? 'You are sharing your screen' : `${remoteScreenSharer?.userName} is sharing their screen`}
                    </div>
                </div>

                {/* Compact participant sidebar */}
                <div className="w-36 flex flex-col gap-2 overflow-y-auto shrink-0">
                    {/* Local camera tile */}
                    <div className="h-24 shrink-0">
                        <VideoTile
                            stream={localStream}
                            name={localName}
                            micOn={micOn}
                            videoOn={videoOn}
                            caption={localCaption}
                            speechCaption={localSpeechCaption}
                            isLocal
                            isActiveSpeaker={activeSpeakerFocusEnabled && activeSpeakerId === 'local'}
                            compact
                        />
                    </div>

                    {remoteParticipants.map(p => (
                        <div key={p.userId} className="h-24 shrink-0">
                            <VideoTile
                                stream={p.isScreenSharing ? null : p.stream}
                                name={p.userName}
                                micOn={p.micOn}
                                videoOn={p.isScreenSharing ? false : p.videoOn}
                                caption={participantCaptions.get(p.userId) ?? null}
                                isActiveSpeaker={activeSpeakerFocusEnabled && activeSpeakerId === p.userId}
                                compact
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ── Regular grid layout ───────────────────────────────────────────────────
    const total = remoteParticipants.length + 1;
    const cols =
        total === 1 ? 'grid-cols-1' :
        total <= 4  ? 'grid-cols-2' :
        total <= 9  ? 'grid-cols-3' :
                      'grid-cols-4';

    // Row count hint for height distribution
    const rows =
        total === 1 ? 1 :
        total <= 4  ? 2 :
        total <= 9  ? 3 : 4;

    return (
        <div
            className={`grid ${cols} gap-3 flex-1 min-h-0 bg-[#141B18] p-4 border-x border-[#2A3430]`}
            style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}
        >
            <VideoTile
                stream={localStream}
                name={localName}
                micOn={micOn}
                videoOn={videoOn}
                caption={localCaption}
                speechCaption={localSpeechCaption}
                isLocal
                isActiveSpeaker={activeSpeakerFocusEnabled && activeSpeakerId === 'local'}
            />
            {remoteParticipants.map(p => (
                <VideoTile
                    key={p.userId}
                    stream={p.stream}
                    name={p.userName}
                    micOn={p.micOn}
                    videoOn={p.videoOn}
                    caption={participantCaptions.get(p.userId) ?? null}
                    isActiveSpeaker={activeSpeakerFocusEnabled && activeSpeakerId === p.userId}
                />
            ))}
        </div>
    );
};

export default ParticipantGrid;
