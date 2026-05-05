"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import InMeetingHeader from './InMeetingHeader';
import ParticipantGrid from './ParticipantGrid';
import MeetingControls from './MeetingControls';
import TranscriptPanel from './TranscriptPanel';
import TextToSpeechPanel from './TextToSpeechPanel';
import BackgroundSelector from './BackgroundSelector';
import MeetingSettingsPanel from './MeetingSettingsPanel';
import BreakReminderBanner from './BreakReminderBanner';
import ChatPanel from './ChatPanel';
import WhiteboardPanel from './WhiteboardPanel';
import InviteModal from './InviteModal';
import { useMeeting } from '@/hooks/useMeeting';
import { useSignLanguage } from '@/hooks/useSignLanguage';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useActiveSpeaker } from '@/hooks/useActiveSpeaker';
import { useBreakReminder } from '@/hooks/useBreakReminder';
import { useBackgroundBlur } from '@/hooks/useBackgroundBlur';
import { useRecording } from '@/hooks/useRecording';
import { useAuth } from '@/contexts/AuthContext';
import type { BackgroundConfig } from '@/hooks/useBackgroundBlur';
import type { MeetingInfo } from '@/hooks/useMeeting';
import api from '@/lib/api';

interface ActiveMeetingProps {
    meetingId: string;
    onEnd: () => void;
}

function formatTimestamp(ts: number) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDuration(secs: number) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

const ActiveMeeting = ({ meetingId, onEnd }: ActiveMeetingProps) => {
    const { user } = useAuth();

    // ── UI panel state ────────────────────────────────────────────────────────
    const [signLangEnabled, setSignLangEnabled] = useState(false);
    const [sttOn, setSttOn] = useState(false);
    const [transcriptOpen, setTranscriptOpen] = useState(false);
    const [ttsOpen, setTtsOpen] = useState(false);
    const [bgOpen, setBgOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [whiteboardOpen, setWhiteboardOpen] = useState(false);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [unreadChat, setUnreadChat] = useState(0);

    // ── Settings state ────────────────────────────────────────────────────────
    const [noiseCancellation, setNoiseCancellation] = useState(true);
    const [language, setLanguage] = useState('auto');
    // Actual BCP-47 code fed to the STT engine when in auto-detect mode.
    // Kept separate so `language` can stay 'auto' and keep triggering re-detection.
    const [recognitionLang, setRecognitionLang] = useState('');
    const [breakReminderEnabled, setBreakReminderEnabled] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('meeting_breakReminderEnabled') !== 'false';
        }
        return true;
    });
    const [breakIntervalMinutes, setBreakIntervalMinutes] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('meeting_breakIntervalMinutes');
            return saved ? parseInt(saved, 10) : 30;
        }
        return 30;
    });
    const [activeSpeakerFocusEnabled, setActiveSpeakerFocusEnabled] = useState(true);
    const [bgConfig, setBgConfig] = useState<BackgroundConfig>({ type: 'none' });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('meeting_breakReminderEnabled', String(breakReminderEnabled));
        }
    }, [breakReminderEnabled]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('meeting_breakIntervalMinutes', String(breakIntervalMinutes));
        }
    }, [breakIntervalMinutes]);

    // ── Core meeting ──────────────────────────────────────────────────────────
    const {
        localStream, screenStream, remoteParticipants, micOn, videoOn, screenSharing,
        toggleMic, toggleVideo, toggleScreenShare, leaveMeeting,
        meetingInfo, participantCaptions, chatMessages, sendChatMessage,
        remoteDraws, remoteClearCount, remoteWhiteboardOpener,
        broadcastWhiteboardOpen, sendWhiteboardDraw, sendWhiteboardClear,
        error, localJoinedAt,
    } = useMeeting(meetingId, onEnd, noiseCancellation);

    // Keep a stable ref to meetingInfo so recording callback can access it after meeting ends
    const meetingInfoRef = useRef<MeetingInfo | null>(null);
    if (meetingInfo) meetingInfoRef.current = meetingInfo;

    // ── Background blur (camera only, not screen share) ───────────────────────
    const { outputStream } = useBackgroundBlur(localStream, bgConfig);

    // ── Sign language ─────────────────────────────────────────────────────────
    const { detection, flaskConnected, modelLoading, resetSentence } =
        useSignLanguage(outputStream, meetingId, signLangEnabled);

    // ── Speech to text ────────────────────────────────────────────────────────
    const { transcript, interimText, isListening, sttError, isSupported: sttSupported, clearTranscript } = useSpeechToText({
        language: language === 'auto' ? recognitionLang : language,
        speakerName: 'You',
        enabled: sttOn,
    });

    // Keep stable ref so handleEndMeeting always sees latest transcript
    const transcriptRef = useRef(transcript);
    transcriptRef.current = transcript;

    // ── Text to speech ────────────────────────────────────────────────────────
    const tts = useTextToSpeech();

    // ── Active speaker ────────────────────────────────────────────────────────
    const { activeSpeakerId } = useActiveSpeaker(localStream, remoteParticipants);

    // ── Break reminder ────────────────────────────────────────────────────────
    const { breakDue, countdown, breakCount, dismissBreak, snoozeBreak } = useBreakReminder({
        intervalMinutes: breakIntervalMinutes,
        enabled: breakReminderEnabled,
    });

    // ── Recording callback: upload blob + save document after recording stops ─
    const handleRecordingStop = useCallback(async (blob: Blob, durationSecs: number) => {
        const info = meetingInfoRef.current;
        if (!info) return;
        try {
            const filename = `recording-${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}.webm`;
            const formData = new FormData();
            formData.append('file', blob, filename);
            const { data: uploaded } = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            await api.post('/documents', {
                title: `${info.title} — Recording`,
                type: 'recording',
                meeting: info._id,
                status: 'past',
                description: `Duration: ${formatDuration(durationSecs)}`,
                fileUrl: uploaded.fileUrl,
                fileSize: blob.size,
            });
        } catch (e) {
            console.error('[ActiveMeeting] Failed to save recording document:', e);
        }
    }, []);

    // ── Recording (records processed camera stream + audio) ───────────────────
    const { isRecording, durationFormatted, startRecording, stopRecording } = useRecording(outputStream, handleRecordingStop);

    // Keep stable ref so handleEndMeeting always sees latest chat messages
    const chatMessagesRef = useRef(chatMessages);
    chatMessagesRef.current = chatMessages;

    // ── End-of-meeting: save transcript + chat file attachments ───────────────
    const handleEndMeeting = useCallback(() => {
        // Stop recording first — onstop fires async and uploads via handleRecordingStop
        if (isRecording) stopRecording();

        const info = meetingInfoRef.current;
        const currentTranscript = transcriptRef.current;
        const currentMessages = chatMessagesRef.current;

        if (info) {
            // Save transcript
            if (currentTranscript.length > 0) {
                const lines = currentTranscript
                    .map(e => `[${formatTimestamp(e.timestamp)}] ${e.speaker}: ${e.text}`)
                    .join('\n');
                api.post('/documents', {
                    title: `${info.title} — Transcript`,
                    type: 'transcript',
                    content: lines,
                    meeting: info._id,
                    status: 'past',
                    description: `${currentTranscript.length} segments`,
                }).catch(e => console.error('[ActiveMeeting] Failed to save transcript:', e));
            }

            // Save each file attachment from in-meeting chat as a report
            const fileMessages = currentMessages.filter(m => m.fileData);
            fileMessages.forEach(async (msg) => {
                if (!msg.fileData) return;
                try {
                    const res = await fetch(msg.fileData.dataUrl);
                    const blob = await res.blob();
                    const formData = new FormData();
                    formData.append('file', blob, msg.fileData.name);
                    const { data: uploaded } = await api.post('/upload', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    await api.post('/documents', {
                        title: msg.fileData.name,
                        type: 'report',
                        meeting: info._id,
                        status: 'past',
                        fileUrl: uploaded.fileUrl,
                        fileSize: msg.fileData.size,
                    });
                } catch (e) {
                    console.error('[ActiveMeeting] Failed to save chat file:', e);
                }
            });
        }

        leaveMeeting();
    }, [isRecording, stopRecording, leaveMeeting]);

    // Auto-open whiteboard when a remote participant opens theirs
    useEffect(() => {
        if (remoteWhiteboardOpener) setWhiteboardOpen(true);
    }, [remoteWhiteboardOpener]);

    // Broadcast to peers when we open our whiteboard
    useEffect(() => {
        if (whiteboardOpen) broadcastWhiteboardOpen();
    }, [whiteboardOpen, broadcastWhiteboardOpen]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleToggleSTT = () => {
        const next = !sttOn;
        setSttOn(next);
        if (next) setTranscriptOpen(true);
    };

    const closeTranscript = () => {
        setTranscriptOpen(false);
        setSttOn(false);
    };

    const handleToggleChat = () => {
        setChatOpen(v => {
            if (!v) setUnreadChat(0); // clear badge when opening
            return !v;
        });
    };

    // Track unread messages when chat is closed
    const prevMsgCount = useRef(chatMessages.length);
    if (chatMessages.length > prevMsgCount.current) {
        const newCount = chatMessages.length - prevMsgCount.current;
        prevMsgCount.current = chatMessages.length;
        if (!chatOpen) {
            setUnreadChat(u => u + newCount);
        }
    }

    const localSpeechCaption = interimText ||
        (transcript.length > 0 ? transcript[transcript.length - 1]?.text : undefined);

    const sidePanelOpen = transcriptOpen || ttsOpen || bgOpen || settingsOpen || chatOpen || whiteboardOpen;

    return (
        <div className="relative flex h-full gap-4 animate-in fade-in zoom-in-95 duration-500">
            {/* Break reminder modal */}
            {breakDue && (
                <BreakReminderBanner
                    breakDue={breakDue}
                    countdown={countdown}
                    breakCount={breakCount}
                    onDismiss={dismissBreak}
                    onSnooze={snoozeBreak}
                />
            )}

            {/* Invite modal (overlay) */}
            {inviteOpen && meetingInfo && (
                <InviteModal
                    meetingId={meetingInfo.meetingId}
                    onClose={() => setInviteOpen(false)}
                />
            )}

            {/* ── Main meeting column ─────────────────────────────────────── */}
            <div className="flex flex-col flex-1 min-w-0 min-h-0">
                {error && (
                    <div className="mb-2 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-4 py-2">
                        {error}
                    </div>
                )}

                <InMeetingHeader
                    meetingInfo={meetingInfo}
                    participantCount={remoteParticipants.length + 1}
                    signLangEnabled={signLangEnabled}
                    flaskConnected={flaskConnected}
                    modelLoading={modelLoading}
                    localName="You"
                    micOn={micOn}
                    videoOn={videoOn}
                    remoteParticipants={remoteParticipants}
                    localJoinedAt={localJoinedAt}
                />

                {/* Pass camera + screen streams separately so grid handles layout */}
                <ParticipantGrid
                    localStream={outputStream}
                    screenStream={screenSharing ? screenStream : null}
                    screenSharing={screenSharing}
                    localName="You"
                    micOn={micOn}
                    videoOn={videoOn}
                    localCaption={signLangEnabled && (detection.sentence || detection.word) ? detection : null}
                    localSpeechCaption={sttOn ? localSpeechCaption : undefined}
                    remoteParticipants={remoteParticipants}
                    participantCaptions={participantCaptions}
                    activeSpeakerId={activeSpeakerId}
                    activeSpeakerFocusEnabled={activeSpeakerFocusEnabled}
                />

                <MeetingControls
                    micOn={micOn}
                    videoOn={videoOn}
                    screenSharing={screenSharing}
                    signLangOn={signLangEnabled}
                    flaskConnected={flaskConnected}
                    modelLoading={modelLoading}
                    sttOn={sttOn}
                    ttsOpen={ttsOpen}
                    bgOpen={bgOpen}
                    settingsOpen={settingsOpen}
                    transcriptOpen={transcriptOpen}
                    chatOpen={chatOpen}
                    whiteboardOpen={whiteboardOpen}
                    isRecording={isRecording}
                    recordingDuration={durationFormatted}
                    breakCountdown={breakReminderEnabled && !breakDue ? countdown : ''}
                    unreadChat={unreadChat}
                    disableScreenShare={remoteParticipants.some(p => p.isScreenSharing)}
                    onToggleMic={toggleMic}
                    onToggleVideo={toggleVideo}
                    onToggleScreenShare={toggleScreenShare}
                    onToggleSignLang={() => setSignLangEnabled(v => !v)}
                    onResetSentence={resetSentence}
                    onToggleSTT={handleToggleSTT}
                    onToggleTTS={() => setTtsOpen(v => !v)}
                    onToggleBG={() => setBgOpen(v => !v)}
                    onToggleSettings={() => setSettingsOpen(v => !v)}
                    onToggleTranscript={() => setTranscriptOpen(v => !v)}
                    onToggleChat={handleToggleChat}
                    onToggleWhiteboard={() => setWhiteboardOpen(v => !v)}
                    onToggleRecord={isRecording ? stopRecording : startRecording}
                    onInvite={() => setInviteOpen(true)}
                    onEnd={handleEndMeeting}
                />
            </div>

            {/* ── Side panels ────────────────────────────────────────────── */}
            {sidePanelOpen && (
                <div className="w-80 shrink-0 flex flex-col gap-3 overflow-y-auto pb-2">

                    {transcriptOpen && (
                        <div className={transcriptOpen && !ttsOpen && !bgOpen && !settingsOpen && !chatOpen && !whiteboardOpen
                            ? 'flex flex-col flex-1 min-h-0'
                            : 'flex flex-col'
                        } style={
                            transcriptOpen && !ttsOpen && !bgOpen && !settingsOpen && !chatOpen && !whiteboardOpen
                                ? {}
                                : { height: '480px' }
                        }>
                            <TranscriptPanel
                                transcript={transcript}
                                interimText={interimText}
                                isListening={isListening}
                                sttError={sttError}
                                isSupported={sttSupported}
                                language={language}
                                onLanguageChange={setRecognitionLang}
                                onClose={closeTranscript}
                                onClear={clearTranscript}
                            />
                        </div>
                    )}

                    {chatOpen && (
                        <ChatPanel
                            messages={chatMessages}
                            onSendMessage={sendChatMessage}
                            onClose={() => setChatOpen(false)}
                            currentUserId={(user as { _id?: string })?._id ?? ''}
                        />
                    )}

                    {whiteboardOpen && (
                        <WhiteboardPanel
                            onClose={() => setWhiteboardOpen(false)}
                            onDraw={sendWhiteboardDraw}
                            onClear={sendWhiteboardClear}
                            remoteDraws={remoteDraws}
                            remoteClearCount={remoteClearCount}
                        />
                    )}

                    {ttsOpen && (
                        <TextToSpeechPanel
                            tts={tts}
                            onClose={() => setTtsOpen(false)}
                        />
                    )}

                    {bgOpen && (
                        <BackgroundSelector
                            config={bgConfig}
                            onChange={setBgConfig}
                            onClose={() => setBgOpen(false)}
                        />
                    )}

                    {settingsOpen && (
                        <MeetingSettingsPanel
                            noiseCancellation={noiseCancellation}
                            onToggleNoiseCancellation={() => setNoiseCancellation(v => !v)}
                            language={language}
                            onLanguageChange={setLanguage}
                            breakIntervalMinutes={breakIntervalMinutes}
                            onBreakIntervalChange={setBreakIntervalMinutes}
                            breakReminderEnabled={breakReminderEnabled}
                            onToggleBreakReminder={() => setBreakReminderEnabled(v => !v)}
                            activeSpeakerFocus={activeSpeakerFocusEnabled}
                            onToggleActiveSpeakerFocus={() => setActiveSpeakerFocusEnabled(v => !v)}
                            onClose={() => setSettingsOpen(false)}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default ActiveMeeting;