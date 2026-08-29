import { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { VOICE_SUGGESTIONS } from '../../data/mockData';
import './VoiceAssistance.css';

const MOCK_RESPONSES = {
  'What should I do now?': "It's a great time for a quick Memory Match game! You haven't played one today yet.",
  'Show my reminders': 'You have 2 reminders left today: Take a Walk at 5:00 PM and Evening Medicine at 7:00 PM.',
  'Start a game': 'Sure! I can start Memory Match for you. Would you like to play?',
  'Call my caregiver': 'I can help you contact your caregiver, Priya. Shall I connect you now?',
};

export default function VoiceAssistance({ onNavigate }) {
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([
    { id: 'intro', sender: 'assistant', text: 'Hello! How can I help you today?' },
  ]);

  const handleSuggestionClick = (suggestion) => {
    const userMsg = { id: `u-${Date.now()}`, sender: 'user', text: suggestion.text };
    const response = MOCK_RESPONSES[suggestion.text] || "I'm here to help! Try asking about your reminders or games.";
    const assistantMsg = { id: `a-${Date.now()}`, sender: 'assistant', text: response };

    setMessages(prev => [...prev, userMsg]);
    setTimeout(() => {
      setMessages(prev => [...prev, assistantMsg]);
    }, 800);
  };

  const toggleListening = () => {
    setIsListening(prev => !prev);
    if (!isListening) {
      // Simulate a short listening period
      setTimeout(() => {
        setIsListening(false);
        const mockMsg = { id: `u-${Date.now()}`, sender: 'user', text: 'What should I do now?' };
        const response = { id: `a-${Date.now() + 1}`, sender: 'assistant', text: MOCK_RESPONSES['What should I do now?'] };
        setMessages(prev => [...prev, mockMsg]);
        setTimeout(() => setMessages(prev => [...prev, response]), 800);
      }, 2000);
    }
  };

  return (
    <div className="voice-page page animate-fade-in">
      <h1 className="page-title">Voice Assistance</h1>
      <p className="page-subtitle">Tap the microphone or choose a suggestion below.</p>

      {/* Chat Area */}
      <div className="voice-chat" role="log" aria-live="polite">
        {messages.map(msg => (
          <div key={msg.id} className={`voice-message voice-message-${msg.sender}`}>
            {msg.sender === 'assistant' && <span className="voice-avatar">🧠</span>}
            <div className={`voice-bubble voice-bubble-${msg.sender}`}>
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      <div className="voice-suggestions">
        <p className="voice-suggestions-label">Try saying:</p>
        <div className="voice-suggestion-list">
          {VOICE_SUGGESTIONS.map(s => (
            <button
              key={s.id}
              className="voice-suggestion-btn"
              onClick={() => handleSuggestionClick(s)}
            >
              <span>{s.icon}</span> {s.text}
            </button>
          ))}
        </div>
      </div>

      {/* Mic Button */}
      <div className="voice-mic-area">
        <button
          className={`voice-mic-btn ${isListening ? 'voice-mic-listening' : ''}`}
          onClick={toggleListening}
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
        >
          {isListening ? <MicOff size={28} /> : <Mic size={28} />}
        </button>
        <p className="voice-mic-label">
          {isListening ? 'Listening...' : 'Tap to speak'}
        </p>
      </div>
    </div>
  );
}
