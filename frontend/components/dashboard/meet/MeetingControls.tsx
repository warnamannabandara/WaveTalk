"use client";

import {
    Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, PhoneOff,
    Hand, RotateCcw, Loader2, FileText, Volume2, ImagePlay, Settings, Clock,
    MessageSquare, PenLine, UserPlus, Circle, Square,
} from 'lucide-react';

interface MeetingControlsProps {
    micOn: boolean;
    videoOn: boolean;
    screenSharing: boolean;
    signLangOn: boolean;
    flaskConnected: boolean;
    modelLoading: boolean;
    sttOn: boolean;
    ttsOpen: boolean;
    bgOpen: boolean;
    settingsOpen: boolean;
    transcriptOpen: boolean;
    chatOpen: boolean;
    whiteboardOpen: boolean;
    isRecording: boolean;
    recordingDuration: string;
    breakCountdown: string;
    unreadChat: number;
    disableScreenShare?: boolean;
    onToggleMic: () => void;
    onToggleVideo: () => void;
    onToggleScreenShare: () => void;
    onToggleSignLang: () => void;
    onResetSentence: () => void;
    onToggleSTT: () => void;
    onToggleTTS: () => void;
    onToggleBG: () => void;
    onToggleSettings: () => void;
    onToggleTranscript: () => void;
    onToggleChat: () => void;
    onToggleWhiteboard: () => void;
    onToggleRecord: () => void;
    onInvite: () => void;
    onEnd: () => void;
}

const MeetingControls = ({
    micOn, videoOn, screenSharing, signLangOn, flaskConnected, modelLoading,
    sttOn, ttsOpen, bgOpen, settingsOpen, transcriptOpen, chatOpen, whiteboardOpen,
    isRecording, recordingDuration, breakCountdown, unreadChat, disableScreenShare,
    onToggleMic, onToggleVideo, onToggleScreenShare, onToggleSignLang,
    onResetSentence, onToggleSTT, onToggleTTS, onToggleBG, onToggleSettings,
    onToggleTranscript, onToggleChat, onToggleWhiteboard, onToggleRecord, onInvite, onEnd,
}: MeetingControlsProps) => {
    const iconBtn = (active: boolean, danger = false) =>
        `relative w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${
            danger
                ? active
                    ? 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30'
                    : 'bg-transparent text-gray-400 border-white/5 hover:bg-white/5 hover:text-white'
                : active
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-transparent text-gray-400 border-white/5 hover:bg-white/5 hover:text-white'
        }`;

    return (
        <div className="bg-[#141B18] px-6 py-5 rounded-b-2xl border-x border-b border-[#2A3430] flex flex-col items-center gap-4">
            {/* Main controls row */}
            <div className="flex items-center gap-2 flex-wrap justify-center">

                {/* Mic */}
                <button onClick={onToggleMic} title={micOn ? 'Mute' : 'Unmute'}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
                        micOn
                            ? 'bg-emerald-500 text-[#141B18] hover:bg-emerald-400 shadow-emerald-500/20'
                            : 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                    }`}>
                    {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>

                {/* Camera */}
                <button onClick={onToggleVideo} title={videoOn ? 'Stop video' : 'Start video'}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
                        videoOn
                            ? 'bg-emerald-500 text-[#141B18] hover:bg-emerald-400 shadow-emerald-500/20'
                            : 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                    }`}>
                    {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>

                {/* Screen share */}
                <button 
                    onClick={onToggleScreenShare} 
                    disabled={disableScreenShare}
                    title={disableScreenShare ? 'Someone else is sharing' : (screenSharing ? 'Stop sharing' : 'Share screen')}
                    className={`${iconBtn(screenSharing)} ${disableScreenShare ? 'opacity-50 cursor-not-allowed cursor-help' : ''}`}>
                    {screenSharing ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                </button>

                <div className="w-px h-8 bg-[#2A3430]" />

                {/* Sign language */}
                <button
                    onClick={onToggleSignLang}
                    disabled={modelLoading}
                    title={signLangOn ? 'Turn off sign language' : 'Sign language translation'}
                    className={`${iconBtn(signLangOn)} disabled:opacity-60 disabled:cursor-wait`}>
                    {modelLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Hand className="w-4 h-4" />}
                    {signLangOn && (
                        <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[#141B18] ${
                            flaskConnected ? 'bg-emerald-400' : 'bg-yellow-400 animate-pulse'
                        }`} />
                    )}
                </button>

                {/* Reset sentence */}
                {signLangOn && (
                    <button onClick={onResetSentence} title="Clear sign sentence"
                        className={iconBtn(false)}>
                        <RotateCcw className="w-4 h-4" />
                    </button>
                )}

                {/* Speech-to-text / Transcript */}
                <button onClick={onToggleSTT} title={sttOn ? 'Stop transcription' : 'Start speech-to-text'}
                    className={iconBtn(sttOn || transcriptOpen)}>
                    <FileText className="w-4 h-4" />
                    {sttOn && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[#141B18] bg-emerald-400 animate-pulse" />
                    )}
                </button>

                {/* Chat */}
                <button onClick={onToggleChat} title="Meeting chat"
                    className={iconBtn(chatOpen)}>
                    <MessageSquare className="w-4 h-4" />
                    {unreadChat > 0 && !chatOpen && (
                        <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 rounded-full border-2 border-[#141B18] bg-emerald-500 text-[#141B18] text-[9px] font-bold flex items-center justify-center px-0.5">
                            {unreadChat > 9 ? '9+' : unreadChat}
                        </span>
                    )}
                </button>

                {/* Whiteboard */}
                <button onClick={onToggleWhiteboard} title="Whiteboard"
                    className={iconBtn(whiteboardOpen)}>
                    <PenLine className="w-4 h-4" />
                </button>

                {/* Text-to-speech */}
                <button onClick={onToggleTTS} title="Text to speech"
                    className={iconBtn(ttsOpen)}>
                    <Volume2 className="w-4 h-4" />
                </button>

                {/* Background */}
                <button onClick={onToggleBG} title="Background effects"
                    className={iconBtn(bgOpen)}>
                    <ImagePlay className="w-4 h-4" />
                </button>

                {/* Invite */}
                <button onClick={onInvite} title="Invite participants"
                    className={iconBtn(false)}>
                    <UserPlus className="w-4 h-4" />
                </button>

                {/* Record */}
                <button
                    onClick={onToggleRecord}
                    title={isRecording ? `Stop recording (${recordingDuration})` : 'Record meeting'}
                    className={iconBtn(isRecording, isRecording)}>
                    {isRecording
                        ? <Square className="w-3.5 h-3.5 fill-red-400" />
                        : <Circle className="w-4 h-4" />
                    }
                    {isRecording && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[#141B18] bg-red-500 animate-pulse" />
                    )}
                </button>

                {/* Settings */}
                <button onClick={onToggleSettings} title="Meeting settings"
                    className={iconBtn(settingsOpen)}>
                    <Settings className="w-4 h-4" />
                </button>

                <div className="w-px h-8 bg-[#2A3430]" />

                {/* Leave */}
                <button onClick={onEnd} title="Leave meeting"
                    className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-400 transition-all shadow-lg shadow-red-500/20">
                    <PhoneOff className="w-5 h-5" />
                </button>
            </div>

            {/* Status strip */}
            <div className="flex items-center gap-4 flex-wrap justify-center">
                {signLangOn && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Hand className="w-3 h-3 text-emerald-500" />
                        <span>Sign translation active</span>
                        <span className={flaskConnected ? 'text-emerald-400' : 'text-yellow-400'}>
                            · {flaskConnected ? 'Model connected' : modelLoading ? 'Loading…' : 'Connecting…'}
                        </span>
                    </div>
                )}
                {sttOn && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                        <span>Transcribing speech</span>
                    </div>
                )}
                {isRecording && (
                    <div className="flex items-center gap-2 text-xs text-red-400">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                        <span>Recording {recordingDuration}</span>
                    </div>
                )}
                {breakCountdown && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Clock className="w-3 h-3" />
                        <span>Break in {breakCountdown}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MeetingControls;
