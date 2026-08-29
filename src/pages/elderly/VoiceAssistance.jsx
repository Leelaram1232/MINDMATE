import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX, Phone } from 'lucide-react';
import { VOICE_SUGGESTIONS } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { getReminders, getGameSessions, computeProgressSummary, getVoiceMessages, saveVoiceMessage, getMyCaregivers } from '../../lib/db';
import { chatWithCompanion, isAiConfigured } from '../../lib/ai';
import { canListen, canSpeak, speak, stopSpeaking, startListening, unlockVoice, wasVoiceUnlocked } from '../../lib/voice';
import { callPhone } from '../../lib/phone';
import './VoiceAssistance.css';

function wantsCaregiverCall(text) {
  const t = text.toLowerCase();
  return /call my caregiver/.test(t) || (/\b(call|phone|dial)\b/.test(t) && /\b(caregiver|family)\b/.test(t));
}

const INTRO = { id: 'intro', sender: 'assistant', text: 'Hello, I am Mira. How can I help you today?' };

export default function VoiceAssistance({ onNavigate }) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState([INTRO]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [needsTap, setNeedsTap] = useState(() => canSpeak() && !wasVoiceUnlocked());
  const [error, setError] = useState('');
  const [pendingOpen, setPendingOpen] = useState(null);
  const [callTarget, setCallTarget] = useState(null);
  const [context, setContext] = useState({ name: 'friend', reminders: [], summary: {} });
  const chatRef = useRef(null);
  const listenCtl = useRef(null);
  const spokeIntro = useRef(false);

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    Promise.all([
      getVoiceMessages(user.id),
      getReminders(user.id),
      getGameSessions(user.id),
      getMyCaregivers(user.id),
    ]).then(([history, reminders, sessions, caregivers]) => {
      if (!active) return;
      if (history.length) {
        setMessages(history.map((m) => ({ id: m.id, sender: m.sender, text: m.text })));
      }
      const caregiver = caregivers.find((c) => c.phone) || caregivers[0] || null;
      setContext({
        name: profile?.full_name?.trim() || 'friend',
        reminders,
        summary: computeProgressSummary(sessions),
        caregiverName: caregiver?.full_name?.trim() || '',
        caregiverPhone: caregiver?.phone || '',
      });
    });
    return () => { active = false; };
  }, [user, profile]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, busy]);

  const hearLatest = () => {
    unlockVoice();
    setNeedsTap(false);
    if (!voiceOn || !canSpeak()) return;
    const last = [...messages].reverse().find((m) => m.sender === 'assistant');
    speak(last?.text || INTRO.text);
    spokeIntro.current = true;
  };

  useEffect(() => {
    if (!voiceOn || !canSpeak() || spokeIntro.current || needsTap) return undefined;
    spokeIntro.current = true;
    const timer = setTimeout(() => speak(INTRO.text), 200);
    return () => clearTimeout(timer);
  }, [voiceOn, needsTap]);

  useEffect(() => () => {
    stopSpeaking();
    listenCtl.current?.stop();
  }, []);

  const speakReply = (text) => {
    unlockVoice();
    setNeedsTap(false);
    if (voiceOn && canSpeak()) speak(text);
  };

  const sendText = async (raw) => {
    const text = raw.trim();
    if (!text || busy) return;
    unlockVoice();
    setNeedsTap(false);
    stopSpeaking();
    listenCtl.current?.stop();
    setIsListening(false);
    setError('');
    setPendingOpen(null);
    setCallTarget(null);
    setDraft('');

    const userMsg = { id: `u-${Date.now()}`, sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    if (user) saveVoiceMessage({ userId: user.id, sender: 'user', text });

    if (!isAiConfigured()) {
      const fallbackText = 'I am ready to chat once a Groq API key is added.';
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, sender: 'assistant', text: fallbackText }]);
      speakReply(fallbackText);
      return;
    }

    setBusy(true);
    const { text: reply, open, call, error: aiError } = await chatWithCompanion({
      userMessage: text,
      history: [...messages, userMsg],
      context,
    });
    setBusy(false);

    if (aiError) {
      setError(aiError.message);
      return;
    }

    const assistantMsg = { id: `a-${Date.now()}`, sender: 'assistant', text: reply };
    setMessages((prev) => [...prev, assistantMsg]);
    if (user) saveVoiceMessage({ userId: user.id, sender: 'assistant', text: reply });
    if (open) setPendingOpen(open);
    speakReply(reply);

    if (call || wantsCaregiverCall(text)) {
      if (context.caregiverPhone) {
        setCallTarget({ name: context.caregiverName || 'your caregiver', phone: context.caregiverPhone });
        setTimeout(() => callPhone(context.caregiverPhone), 700);
      } else if (!context.caregiverName) {
        setError('Connect with a caregiver on Home first, then you can call them from here.');
      } else {
        setError('Your caregiver has not added a phone number yet. Ask them to save it in Settings.');
      }
    }
  };

  const toggleListening = () => {
    if (isListening) {
      listenCtl.current?.stop();
      setIsListening(false);
      return;
    }

    unlockVoice();
    setNeedsTap(false);
    stopSpeaking();
    setError('');
    setDraft('');
    setIsListening(true);
    listenCtl.current = startListening({
      onInterim: (piece) => setDraft(piece),
      onResult: (spoken) => {
        setIsListening(false);
        setDraft('');
        sendText(spoken);
      },
      onError: (message) => {
        setIsListening(false);
        setError(message);
      },
      onEnd: () => setIsListening(false),
    });
  };

  const toggleVoice = () => {
    if (voiceOn) stopSpeaking();
    setVoiceOn((on) => !on);
  };

  const openLabels = { games: 'Open Games', reminders: 'Open Reminders', progress: 'Open Progress', home: 'Go Home' };

  return (
    <div className="voice-page page animate-fade-in">
      <div className="voice-title-row">
        <div>
          <h1 className="page-title">Talk with Mira</h1>
          <p className="page-subtitle">Your AI companion. Speak or type — she will answer.</p>
        </div>
        <button
          className="btn btn-ghost btn-icon"
          onClick={toggleVoice}
          aria-label={voiceOn ? 'Turn voice replies off' : 'Turn voice replies on'}
          title={voiceOn ? 'Voice on' : 'Voice off'}
        >
          {voiceOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
        </button>
      </div>

      <div className="voice-chat" role="log" aria-live="polite" ref={chatRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`voice-message voice-message-${msg.sender}`}>
            {msg.sender === 'assistant' && <span className="voice-avatar">🧠</span>}
            <div className={`voice-bubble voice-bubble-${msg.sender}`}>
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        {busy && (
          <div className="voice-message voice-message-assistant">
            <span className="voice-avatar">🧠</span>
            <div className="voice-bubble voice-bubble-assistant">
              <p>Thinking…</p>
            </div>
          </div>
        )}
      </div>

      {pendingOpen && (
        <button className="btn btn-primary voice-open-btn" onClick={() => onNavigate(pendingOpen)}>
          {openLabels[pendingOpen] || 'Open'}
        </button>
      )}

      {callTarget && (
        <button className="btn btn-accent voice-open-btn" onClick={() => callPhone(callTarget.phone)}>
          <Phone size={18} /> Call {callTarget.name}
        </button>
      )}

      {error && <p className="voice-error">{error}</p>}

      {needsTap && voiceOn && canSpeak() && (
        <button className="btn btn-primary voice-unlock-btn" onClick={hearLatest}>
          Tap to hear Mira
        </button>
      )}

      <div className="voice-suggestions">
        <p className="voice-suggestions-label">Try saying:</p>
        <div className="voice-suggestion-list">
          {VOICE_SUGGESTIONS.map((s) => (
            <button
              key={s.id}
              className="voice-suggestion-btn"
              onClick={() => sendText(s.text)}
              disabled={busy}
            >
              <span>{s.icon}</span> {s.text}
            </button>
          ))}
        </div>
      </div>

      <form
        className="voice-composer"
        onSubmit={(e) => {
          e.preventDefault();
          sendText(draft);
        }}
      >
        <input
          className="voice-input"
          placeholder={isListening ? 'Listening…' : 'Type a message…'}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={busy}
          aria-label="Message to MindMate"
        />
        <button type="submit" className="voice-send-btn" disabled={busy || !draft.trim()} aria-label="Send">
          <Send size={18} />
        </button>
      </form>

      <div className="voice-mic-area">
        <button
          className={`voice-mic-btn ${isListening ? 'voice-mic-listening' : ''}`}
          onClick={toggleListening}
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
        >
          {isListening ? <MicOff size={28} /> : <Mic size={28} />}
        </button>
        <p className="voice-mic-label">
          {isListening
            ? 'Listening… tap again to stop'
            : canListen()
              ? 'Tap the mic, then speak'
              : 'Type a message — this browser cannot listen'}
        </p>
      </div>
    </div>
  );
}
