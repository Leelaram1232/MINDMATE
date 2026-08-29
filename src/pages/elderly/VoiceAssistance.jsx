import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX, Phone } from 'lucide-react';
import { VOICE_SUGGESTIONS } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getReminders, getGameSessions, computeProgressSummary, getVoiceMessages, saveVoiceMessage, getMyCaregivers } from '../../lib/db';
import { chatWithCompanion, isAiConfigured } from '../../lib/ai';
import { canListen, canSpeak, speak, stopSpeaking, startListening, unlockVoice, wasVoiceUnlocked } from '../../lib/voice';
import { readVoiceSettings, writeVoiceSettings } from '../../lib/voiceSettings';
import { callPhone } from '../../lib/phone';
import './VoiceAssistance.css';

function wantsCaregiverCall(text) {
  const t = text.toLowerCase();
  return (
    /call my caregiver/.test(t) ||
    (/\b(call|phone|dial)\b/.test(t) && /\b(caregiver|family)\b/.test(t)) ||
    /देखभाल|कॉल करो|కాల్|సంరక్షక|அழை|பராமரிப்பாளர்/.test(text)
  );
}

export default function VoiceAssistance({ onNavigate }) {
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();
  const introText = t('voice.intro');
  const [messages, setMessages] = useState(() => [
    { id: 'intro', sender: 'assistant', text: introText },
  ]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'intro') {
        return [{ id: 'intro', sender: 'assistant', text: introText }];
      }
      return prev;
    });
  }, [introText]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceOn, setVoiceOn] = useState(() => readVoiceSettings().responsesOn !== false);
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
        language,
      });
    });
    return () => { active = false; };
  }, [user, profile, language]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, busy]);

  const hearLatest = () => {
    unlockVoice();
    setNeedsTap(false);
    if (!voiceOn || !canSpeak()) return;
    const last = [...messages].reverse().find((m) => m.sender === 'assistant');
    speak(last?.text || t('voice.intro'), { lang: language });
    spokeIntro.current = true;
  };

  useEffect(() => {
    if (!voiceOn || !canSpeak() || spokeIntro.current || needsTap) return undefined;
    spokeIntro.current = true;
    const timer = setTimeout(() => speak(t('voice.intro'), { lang: language }), 200);
    return () => clearTimeout(timer);
  }, [voiceOn, needsTap, language, t]);

  useEffect(() => () => {
    stopSpeaking();
    listenCtl.current?.stop();
  }, []);

  const speakReply = (text) => {
    unlockVoice();
    setNeedsTap(false);
    if (voiceOn && canSpeak()) speak(text, { lang: language });
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
      const fallbackText = t('voice.noKey');
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, sender: 'assistant', text: fallbackText }]);
      speakReply(fallbackText);
      return;
    }

    setBusy(true);
    const { text: reply, open, call, error: aiError } = await chatWithCompanion({
      userMessage: text,
      history: [...messages, userMsg],
      context: { ...context, language },
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
        setError(t('voice.connectFirst'));
      } else {
        setError(t('voice.noPhone'));
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
    const next = !voiceOn;
    if (!next) stopSpeaking();
    writeVoiceSettings({ responsesOn: next });
    setVoiceOn(next);
  };

  const openLabels = {
    games: t('voice.openGames'),
    reminders: t('voice.openReminders'),
    progress: t('voice.openProgress'),
    home: t('voice.goHome'),
  };

  return (
    <div className="voice-page page animate-fade-in">
      <div className="voice-title-row">
        <div>
          <h1 className="page-title">{t('voice.title')}</h1>
          <p className="page-subtitle">{t('voice.sub')}</p>
        </div>
        <button
          className="btn btn-ghost btn-icon"
          onClick={toggleVoice}
          aria-label={voiceOn ? t('voice.repliesOff') : t('voice.repliesOn')}
          title={voiceOn ? t('voice.responsesOn') : t('voice.responsesOff')}
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
              <p>{t('voice.thinking')}</p>
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
          <Phone size={18} /> {t('voice.call', { name: callTarget.name })}
        </button>
      )}

      {error && <p className="voice-error">{error}</p>}

      {needsTap && voiceOn && canSpeak() && (
        <button className="btn btn-primary voice-unlock-btn" onClick={hearLatest}>
          {t('voice.tapHear')}
        </button>
      )}

      <div className="voice-suggestions">
        <p className="voice-suggestions-label">{t('voice.try')}</p>
        <div className="voice-suggestion-list">
          {VOICE_SUGGESTIONS.map((s, i) => {
            const text = t(`voice.s${i + 1}`);
            return (
            <button
              key={s.id}
              className="voice-suggestion-btn"
              onClick={() => sendText(text)}
              disabled={busy}
            >
              <span>{s.icon}</span> {text}
            </button>
            );
          })}
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
          placeholder={isListening ? t('voice.listening') : t('voice.placeholder')}
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
            ? t('voice.listening')
            : canListen()
              ? t('voice.tapMic')
              : t('voice.typeInstead')}
        </p>
      </div>
    </div>
  );
}
