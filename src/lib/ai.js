import { getActiveLanguage, getLanguageMeta, t } from './i18n';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'groq/compound-mini';

export function isAiConfigured() {
  return Boolean(import.meta.env.VITE_GROQ_API_KEY);
}

async function groqChat(messages, { json = false, maxTokens = 280 } = {}) {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  if (!key) {
    return { error: { message: 'Add your Groq API key as VITE_GROQ_API_KEY in the .env file, then restart the app.' } };
  }

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.6,
      max_tokens: maxTokens,
      ...(json ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = payload?.error?.message || `Groq request failed (${res.status}).`;
    return { error: { message } };
  }

  const text = payload?.choices?.[0]?.message?.content?.trim() || '';
  return { text };
}

function parseOpenTag(reply) {
  const match = reply.match(/\[\[(open|call):(games|reminders|progress|home|caregiver)\]\]/i);
  const cleaned = reply.replace(/\s*\[\[(?:open|call):[^\]]+\]\]\s*/gi, '').trim();
  if (!match) return { text: cleaned, open: null, call: false };
  const kind = match[1].toLowerCase();
  const target = match[2].toLowerCase();
  return {
    text: cleaned,
    open: kind === 'open' ? target : null,
    call: kind === 'call' || target === 'caregiver',
  };
}

const GAME_IDS = ['memory-match', 'pattern-recall', 'object-recognition'];
const MOODS = ['idle', 'proud', 'cheer', 'gentle'];
const TIERS = ['easy', 'medium', 'hard'];

function langInstruction(lang) {
  const meta = getLanguageMeta(lang);
  return `Write every user-facing sentence in ${meta.name} (${meta.native}). Do not use English unless the chosen language is English.`;
}

export function getCoachFallback({
  name = 'friend',
  sessions = [],
  recommendedTitle = 'Memory Match',
  justFinished,
} = {}) {
  const first = (name || 'friend').split(' ')[0];
  const game = justFinished?.gameTitle || recommendedTitle;

  if (justFinished) {
    const acc = justFinished.accuracy ?? 0;
    if (acc >= 85) {
      return { mood: 'proud', line: t('coach.proudLine', { name: first, game }), tip: t('coach.proudTip') };
    }
    if (acc >= 65) {
      return { mood: 'cheer', line: t('coach.cheerLine', { name: first }), tip: t('coach.cheerTip') };
    }
    return { mood: 'gentle', line: t('coach.gentleLine', { name: first }), tip: t('coach.gentleTip') };
  }

  const last = sessions[0];
  if (!last) {
    return { mood: 'idle', line: t('coach.helloLine', { name: first }), tip: t('coach.helloTip', { game }) };
  }
  if ((last.accuracy || 0) >= 85) {
    return { mood: 'proud', line: t('coach.wellLine', { game: last.game_title }), tip: t('coach.wellTip', { next: game }) };
  }
  if ((last.accuracy || 0) < 60) {
    return { mood: 'gentle', line: t('coach.trickyLine'), tip: t('coach.trickyTip', { game }) };
  }
  return { mood: 'idle', line: t('coach.backLine', { name: first }), tip: t('coach.backTip', { game }) };
}

export function heuristicPlayPlan(sessions = []) {
  const difficulties = {};
  const notes = {};

  GAME_IDS.forEach((id) => {
    const recent = sessions.filter((s) => s.game_id === id).slice(0, 3);
    const avg = recent.length
      ? recent.reduce((sum, s) => sum + (s.accuracy || 0), 0) / recent.length
      : 70;
    let tier = 'medium';
    if (recent.length >= 2 && avg >= 85) tier = 'hard';
    else if (recent.length >= 2 && avg <= 60) tier = 'easy';
    difficulties[id] = tier;
    notes[id] =
      tier === 'hard' ? t('coach.noteHard') : tier === 'easy' ? t('coach.noteEasy') : t('coach.noteMedium');
  });

  const ranked = GAME_IDS.map((id) => {
    const recent = sessions.filter((s) => s.game_id === id).slice(0, 3);
    const avg = recent.length
      ? recent.reduce((sum, s) => sum + (s.accuracy || 0), 0) / recent.length
      : 70;
    return { id, avg, n: recent.length };
  }).sort((a, b) => a.avg - b.avg);

  const recommendedGameId = sessions.length === 0 ? 'memory-match' : ranked[0].id;

  return {
    recommendedGameId,
    difficulties,
    notes,
    reason: 'Picked from your last few scores.',
    source: 'heuristic',
  };
}

function clampWords(text, maxWords, lang = getActiveLanguage()) {
  const raw = String(text || '').trim();
  if (lang !== 'en') return raw.slice(0, Math.max(40, maxWords * 10));
  const words = raw.split(/\s+/).filter(Boolean);
  return words.slice(0, maxWords).join(' ');
}

export async function coachWithMira({
  name,
  sessions = [],
  recommendedTitle,
  justFinished,
  language,
} = {}) {
  const lang = language || getActiveLanguage();
  const fallback = getCoachFallback({ name, sessions, recommendedTitle, justFinished });
  if (!isAiConfigured()) return fallback;

  const first = (name || 'friend').split(' ')[0];
  const recent = sessions.slice(0, 6).map((s) => ({
    game: s.game_title || s.game_id,
    accuracy: s.accuracy,
  }));

  const { text, error } = await groqChat(
    [
      {
        role: 'system',
        content:
          `You are Mira, a warm game companion for an older adult. ${langInstruction(lang)} Return JSON only: {"mood":"idle|proud|cheer|gentle","line":"...","tip":"..."}. Simple words. No medical advice. line under 18 words. tip under 16 words.`,
      },
      {
        role: 'user',
        content: JSON.stringify({
          name: first,
          recommendedTitle,
          justFinished: justFinished
            ? {
                gameTitle: justFinished.gameTitle,
                accuracy: justFinished.accuracy,
                score: justFinished.score,
              }
            : null,
          recentGames: recent,
        }),
      },
    ],
    { json: true, maxTokens: 160 }
  );

  if (error || !text) return fallback;
  try {
    const parsed = JSON.parse(text);
    const mood = MOODS.includes(parsed.mood) ? parsed.mood : fallback.mood;
    const line = clampWords(parsed.line, 22, lang);
    const tip = clampWords(parsed.tip, 20, lang);
    if (!line) return fallback;
    return { mood, line, tip: tip || fallback.tip, source: 'ai' };
  } catch {
    return fallback;
  }
}

export async function suggestPlayPlan({ sessions = [] } = {}) {
  const lang = getActiveLanguage();
  const fallback = heuristicPlayPlan(sessions);
  if (!isAiConfigured()) return fallback;

  const recent = sessions.slice(0, 12).map((s) => ({
    gameId: s.game_id,
    accuracy: s.accuracy,
  }));

  const { text, error } = await groqChat(
    [
      {
        role: 'system',
        content:
          `You adapt cognitive games for an older adult. ${langInstruction(lang)} Return JSON only: {"recommendedGameId":"memory-match|pattern-recall|object-recognition","difficulties":{"memory-match":"easy|medium|hard","pattern-recall":"easy|medium|hard","object-recognition":"easy|medium|hard"},"notes":{"memory-match":"...","pattern-recall":"...","object-recognition":"..."}}. Raise difficulty only after two strong scores. Lower it after two weak scores. notes are one short kind sentence each. No medical advice.`,
      },
      {
        role: 'user',
        content: JSON.stringify({ recentGames: recent, fallback }),
      },
    ],
    { json: true, maxTokens: 260 }
  );

  if (error || !text) return fallback;
  try {
    const parsed = JSON.parse(text);
    const recommendedGameId = GAME_IDS.includes(parsed.recommendedGameId)
      ? parsed.recommendedGameId
      : fallback.recommendedGameId;
    const difficulties = { ...fallback.difficulties };
    GAME_IDS.forEach((id) => {
      const tier = parsed.difficulties?.[id];
      if (TIERS.includes(tier)) difficulties[id] = tier;
    });
    const notes = { ...fallback.notes };
    GAME_IDS.forEach((id) => {
      if (parsed.notes?.[id]) notes[id] = clampWords(parsed.notes[id], 18, lang);
    });
    return { recommendedGameId, difficulties, notes, reason: fallback.reason, source: 'ai' };
  } catch {
    return fallback;
  }
}

export async function chatWithCompanion({ userMessage, history = [], context = {} }) {
  const name = context.name || 'friend';
  const reminderLine = context.reminders?.length
    ? context.reminders
        .map((r) => `${r.title} at ${r.time_label || 'sometime'} (${r.status})`)
        .join('; ')
    : 'No reminders yet.';
  const summary = context.summary || {};

  const lang = context.language || getActiveLanguage();
  const system = [
    `You are Mira, the MindMate companion — a warm, patient friend for an older adult named ${name}.`,
    langInstruction(lang),
    'Speak in short, simple sentences. Be encouraging. Never give medical diagnoses or dosage advice.',
    'You can help with games (Memory Match, Pattern Recall, Object Recognition), reminders, progress, and calling their caregiver.',
    `Today's reminders: ${reminderLine}`,
    `Progress: ${summary.gamesThisWeek ?? 0} games this week, ${summary.avgAccuracy ?? 0}% average accuracy, ${summary.streak ?? 0}-day streak.`,
    context.caregiverName
      ? `Their caregiver is ${context.caregiverName}${context.caregiverPhone ? `. A call button will open.` : ', but no phone number is saved yet.'}`
      : 'They are not linked to a caregiver yet.',
    'If they want to play a game, end with [[open:games]]. For reminders use [[open:reminders]]. For progress use [[open:progress]]. If they want to call their caregiver, end with [[call:caregiver]].',
  ].join(' ');

  const recent = history.slice(-10).map((m) => ({
    role: m.sender === 'user' ? 'user' : 'assistant',
    content: m.text,
  }));

  const { text, error } = await groqChat([
    { role: 'system', content: system },
    ...recent,
    { role: 'user', content: userMessage },
  ]);

  if (error) return { error };
  return parseOpenTag(text);
}

export async function generateCareInsights({ patientName, summary, trend, reminders, language }) {
  const first = (patientName || 'the patient').split(' ')[0];
  const completed = reminders.filter((r) => r.status === 'completed').length;
  const fallback = heuristicInsights(first, summary, trend, reminders, completed);
  const lang = language || getActiveLanguage();

  if (!isAiConfigured()) return fallback;

  const { text, error } = await groqChat(
    [
      {
        role: 'system',
        content:
          `You write brief caregiver insights for a cognitive wellness app. ${langInstruction(lang)} Return JSON only: {"insights":[{"title":"...","text":"..."},{"title":"...","text":"..."}]}. No medical diagnosis. Two insights, each under 40 words.`,
      },
      {
        role: 'user',
        content: JSON.stringify({
          name: first,
          gamesThisWeek: summary.gamesThisWeek,
          totalGames: summary.totalGames,
          avgAccuracy: summary.avgAccuracy,
          streak: summary.streak,
          favoriteGame: summary.favoriteGame,
          trend,
          remindersTotal: reminders.length,
          remindersCompleted: completed,
        }),
      },
    ],
    { json: true, maxTokens: 320 }
  );

  if (error || !text) return fallback;
  try {
    const parsed = JSON.parse(text);
    const list = Array.isArray(parsed.insights) ? parsed.insights : [];
    const clean = list
      .filter((i) => i?.title && i?.text)
      .slice(0, 2)
      .map((i) => ({ title: String(i.title), text: String(i.text) }));
    return clean.length ? clean : fallback;
  } catch {
    return fallback;
  }
}

function heuristicInsights(first, summary, trend, reminders, completed) {
  const insights = [];
  if (summary.totalGames === 0) {
    insights.push({
      title: 'Getting started',
      text: `${first} has not completed a game yet. Encourage a short Memory Match session to begin tracking progress.`,
    });
  } else {
    insights.push({
      title: 'Weekly participation',
      text: `${first} completed ${summary.gamesThisWeek} ${summary.gamesThisWeek === 1 ? 'activity' : 'activities'} this week with ${summary.avgAccuracy}% average accuracy.`,
    });
    insights.push({
      title: trend === 'Needs Attention' ? 'Accuracy dip' : 'Memory trend',
      text:
        trend === 'Needs Attention'
          ? 'Recent scores are lower than earlier sessions. Suggest shorter games in a quiet morning window.'
          : `${first} is ${trend.toLowerCase()}. Keep the current routine to protect the ${summary.streak}-day streak.`,
    });
  }
  if (reminders.length) {
    insights.push({
      title: 'Reminder adherence',
      text: `${completed} of ${reminders.length} reminders are completed.`,
    });
  }
  return insights.slice(0, 2);
}
