import { supabase } from './supabaseClient';
import { isAiConfigured, suggestPlayPlan } from './ai';
import { DIFFICULTY, levelDetail } from './gameLevels';

// ============================================================
// MindMate data layer (Phase B)
// A thin wrapper around Supabase queries so components stay clean
// and we have a single place to evolve the schema access.
// ============================================================

const DEFAULT_REMINDERS = [
  { type: 'medicine', icon: '💊', title: 'Morning Medicine', description: 'Take blood pressure tablet', time_label: '9:00 AM', status: 'pending' },
  { type: 'hydration', icon: '💧', title: 'Drink Water', description: 'Stay hydrated — have a glass of water', time_label: '11:00 AM', status: 'pending' },
  { type: 'activity', icon: '🚶', title: 'Take a Walk', description: '15 minute walk in the garden', time_label: '5:00 PM', status: 'pending' },
  { type: 'medicine', icon: '💊', title: 'Evening Medicine', description: 'Take vitamin D supplement', time_label: '7:00 PM', status: 'upcoming' },
];

// ---------- Reminders ----------

export async function getReminders(userId) {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) {
    console.warn('[db] getReminders:', error.message);
    return [];
  }
  return data;
}

// Seed the starter reminders for a brand-new elderly user (only if empty).
export async function seedDefaultReminders(userId, createdBy = userId) {
  if (!supabase || !userId) return [];
  const rows = DEFAULT_REMINDERS.map((r) => ({ ...r, user_id: userId, created_by: createdBy }));
  const { data, error } = await supabase.from('reminders').insert(rows).select();
  if (error) {
    console.warn('[db] seedDefaultReminders:', error.message);
    return [];
  }
  return data;
}

export async function addReminder(reminder) {
  if (!supabase) return { error: { message: 'Not configured' } };
  return supabase.from('reminders').insert(reminder).select().single();
}

export async function setReminderStatus(id, status) {
  if (!supabase) return { error: { message: 'Not configured' } };
  return supabase.from('reminders').update({ status }).eq('id', id);
}

export async function deleteReminder(id) {
  if (!supabase) return { error: { message: 'Not configured' } };
  return supabase.from('reminders').delete().eq('id', id);
}

// Live updates for a given elderly user's reminders. Returns an unsubscribe fn.
export function subscribeReminders(userId, onChange) {
  if (!supabase || !userId) return () => {};
  const channel = supabase
    .channel(`reminders:${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'reminders', filter: `user_id=eq.${userId}` },
      () => onChange()
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

// ---------- Game sessions ----------

export async function logGameSession({ userId, gameId, gameTitle, accuracy, score, durationSeconds }) {
  if (!supabase || !userId) return { error: { message: 'Not configured' } };
  return supabase.from('game_sessions').insert({
    user_id: userId,
    game_id: gameId,
    game_title: gameTitle,
    accuracy: Math.round(accuracy ?? 0),
    score: score ?? null,
    duration_seconds: durationSeconds ?? null,
  });
}

export async function getGameSessions(userId, { sinceDays } = {}) {
  if (!supabase || !userId) return [];
  let query = supabase
    .from('game_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (sinceDays) {
    const since = new Date();
    since.setDate(since.getDate() - sinceDays);
    query = query.gte('created_at', since.toISOString());
  }
  const { data, error } = await query;
  if (error) {
    console.warn('[db] getGameSessions:', error.message);
    return [];
  }
  return data;
}

// Turn raw sessions into the summary numbers the progress screens need.
export function computeProgressSummary(sessions) {
  const total = sessions.length;
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const thisWeek = sessions.filter((s) => new Date(s.created_at) >= weekAgo);

  const avgAccuracy = total
    ? Math.round(sessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / total)
    : 0;
  const bestAccuracy = total ? Math.max(...sessions.map((s) => s.accuracy || 0)) : 0;

  // Active days in the last 7 days.
  const dayKeys = new Set(thisWeek.map((s) => new Date(s.created_at).toDateString()));
  const activeDays = dayKeys.size;

  // Favorite game = most played.
  const counts = {};
  sessions.forEach((s) => {
    counts[s.game_title || s.game_id] = (counts[s.game_title || s.game_id] || 0) + 1;
  });
  const favoriteGame = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || '—';

  return {
    totalGames: total,
    gamesThisWeek: thisWeek.length,
    avgAccuracy,
    bestAccuracy,
    activeDays,
    favoriteGame,
    streak: computeStreak(sessions),
  };
}

// Consecutive days (ending today or yesterday) with at least one session.
function computeStreak(sessions) {
  if (!sessions.length) return 0;
  const days = new Set(sessions.map((s) => new Date(s.created_at).toDateString()));
  let streak = 0;
  const cursor = new Date();
  // Allow the streak to count even if they haven't played yet today.
  if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1);
  while (days.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// Weekly bars (Mon..Sun) for the current week from sessions.
export function computeWeeklyPerformance(sessions) {
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const buckets = labels.map((day) => ({ day, games: 0, accSum: 0 }));
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  weekAgo.setHours(0, 0, 0, 0);

  sessions.forEach((s) => {
    const d = new Date(s.created_at);
    if (d >= weekAgo) {
      const b = buckets[d.getDay()];
      b.games += 1;
      b.accSum += s.accuracy || 0;
    }
  });

  // Reorder Mon..Sun for display.
  const order = [1, 2, 3, 4, 5, 6, 0];
  return order.map((i) => {
    const b = buckets[i];
    return { day: b.day, games: b.games, accuracy: b.games ? Math.round(b.accSum / b.games) : 0 };
  });
}

// ---------- Activity timeline (derived from games + reminders) ----------

export async function getActivityFeed(userId) {
  if (!supabase || !userId) return [];
  const [sessions, reminders] = await Promise.all([
    getGameSessions(userId, { sinceDays: 7 }),
    getReminders(userId),
  ]);

  const events = [];
  sessions.forEach((s) => {
    events.push({
      at: new Date(s.created_at),
      type: 'game',
      title: `Completed ${s.game_title || s.game_id}`,
      detail: `Score: ${s.accuracy ?? 0}%`,
      icon: '🎮',
    });
  });
  reminders
    .filter((r) => r.status === 'completed')
    .forEach((r) => {
      events.push({
        at: new Date(r.updated_at || r.created_at),
        type: 'reminder',
        title: `${r.title} completed`,
        detail: r.description || '',
        icon: r.icon || '🔔',
      });
    });

  return events.sort((a, b) => b.at - a.at);
}

export function groupActivityByDay(events) {
  const groups = [];
  const map = new Map();
  events.forEach((e) => {
    const key = dayLabel(e.at);
    if (!map.has(key)) {
      const group = { date: key, events: [] };
      map.set(key, group);
      groups.push(group);
    }
    map.get(key).events.push({
      time: e.at.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }),
      type: e.type,
      title: e.title,
      detail: e.detail,
      icon: e.icon,
    });
  });
  return groups;
}

function dayLabel(date) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function computeMemoryTrend(sessions) {
  if (sessions.length < 3) return 'Building';
  const recent = sessions.slice(0, Math.min(5, sessions.length));
  const older = sessions.slice(5, 10);
  const avg = (list) => list.reduce((sum, s) => sum + (s.accuracy || 0), 0) / list.length;
  if (!older.length) {
    const recentAvg = avg(recent);
    if (recentAvg >= 80) return 'Improving';
    if (recentAvg < 60) return 'Needs Attention';
    return 'Stable';
  }
  const delta = avg(recent) - avg(older);
  if (delta > 5) return 'Improving';
  if (delta < -5) return 'Needs Attention';
  return 'Stable';
}

// ---------- Care links & invites ----------

function randomCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Caregiver generates a code an elderly user can enter to link accounts.
export async function generateInviteCode(caregiverId) {
  if (!supabase || !caregiverId) return { error: { message: 'Not configured' } };
  // Try a few times in case of a rare collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const { error } = await supabase.from('invite_codes').insert({
      code,
      created_by: caregiverId,
      created_by_role: 'caregiver',
    });
    if (!error) return { code };
    if (!String(error.message).toLowerCase().includes('duplicate')) {
      return { error };
    }
  }
  return { error: { message: 'Could not generate a code, please try again.' } };
}

// Elderly user redeems a caregiver's code → creates the care link.
export async function redeemInviteCode(code, elderlyId) {
  if (!supabase || !elderlyId) return { error: { message: 'Not configured' } };
  const normalized = code.trim().toUpperCase();

  const { data: invite, error: findError } = await supabase
    .from('invite_codes')
    .select('*')
    .eq('code', normalized)
    .maybeSingle();

  if (findError) return { error: findError };
  if (!invite) return { error: { message: 'That code was not found. Please check and try again.' } };
  if (invite.created_by_role !== 'caregiver') {
    return { error: { message: 'This code is not a caregiver invite.' } };
  }
  if (invite.used_by) return { error: { message: 'This code has already been used.' } };
  if (new Date(invite.expires_at) < new Date()) {
    return { error: { message: 'This code has expired. Ask your caregiver for a new one.' } };
  }
  if (invite.created_by === elderlyId) {
    return { error: { message: 'You cannot link to your own code.' } };
  }

  const { error: linkError } = await supabase.from('care_links').insert({
    caregiver_id: invite.created_by,
    elderly_id: elderlyId,
    status: 'active',
  });
  if (linkError) {
    if (String(linkError.message).toLowerCase().includes('duplicate')) {
      return { error: { message: 'You are already linked with this caregiver.' } };
    }
    return { error: linkError };
  }

  await supabase.from('invite_codes').update({ used_by: elderlyId }).eq('code', normalized);
  return { success: true };
}

// Elderly users linked to a caregiver (with their profiles).
export async function getLinkedElderly(caregiverId) {
  if (!supabase || !caregiverId) return [];
  const { data: links, error } = await supabase
    .from('care_links')
    .select('elderly_id')
    .eq('caregiver_id', caregiverId)
    .eq('status', 'active');
  if (error || !links?.length) return [];

  const ids = links.map((l) => l.elderly_id);
  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('*')
    .in('id', ids);
  if (pErr) {
    console.warn('[db] getLinkedElderly profiles:', pErr.message);
    return [];
  }
  return profiles;
}

// Caregivers linked to an elderly user (used to show "connected" state).
export async function getMyCaregivers(elderlyId) {
  if (!supabase || !elderlyId) return [];
  const { data: links, error } = await supabase
    .from('care_links')
    .select('caregiver_id')
    .eq('elderly_id', elderlyId)
    .eq('status', 'active');
  if (error || !links?.length) return [];
  const ids = links.map((l) => l.caregiver_id);
  const { data: profiles } = await supabase.from('profiles').select('*').in('id', ids);
  return profiles || [];
}

// ---------- Voice companion history ----------

export async function getVoiceMessages(userId, limit = 30) {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase
    .from('voice_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) {
    console.warn('[db] getVoiceMessages:', error.message);
    return [];
  }
  return data;
}

export async function saveVoiceMessage({ userId, sender, text }) {
  if (!supabase || !userId || !text) return { error: { message: 'Not configured' } };
  return supabase.from('voice_messages').insert({ user_id: userId, sender, text });
}

// ---------- Adaptive difficulty ----------

const playPlanCache = { key: '', promise: null, value: null };

function loadPlayPlan(userId, sessions) {
  const key = `${userId}:${sessions[0]?.id || 'none'}:${sessions.length}`;
  if (playPlanCache.key === key && playPlanCache.value) return Promise.resolve(playPlanCache.value);
  if (playPlanCache.key === key && playPlanCache.promise) return playPlanCache.promise;
  playPlanCache.key = key;
  playPlanCache.value = null;
  playPlanCache.promise = suggestPlayPlan({ sessions }).then((plan) => {
    playPlanCache.value = plan;
    return plan;
  });
  return playPlanCache.promise;
}

export async function getAdaptiveDifficulty(userId, gameId) {
  const defaults = DIFFICULTY[gameId]?.medium || { label: 'Medium' };
  if (!userId || !DIFFICULTY[gameId]) {
    return { tier: 'medium', ...defaults, sessionsUsed: 0, source: 'default' };
  }

  const sessions = await getGameSessions(userId);
  const gameSessions = sessions.filter((s) => s.game_id === gameId).slice(0, 3);
  const avg = gameSessions.length
    ? gameSessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / gameSessions.length
    : 70;

  let tier = 'medium';
  if (gameSessions.length >= 2 && avg >= 85) tier = 'hard';
  else if (gameSessions.length >= 2 && avg <= 60) tier = 'easy';

  let plan = null;
  if (isAiConfigured()) {
    plan = await Promise.race([
      loadPlayPlan(userId, sessions),
      new Promise((resolve) => setTimeout(() => resolve(null), 2000)),
    ]);
    if (plan?.difficulties?.[gameId]) tier = plan.difficulties[gameId];
  }

  const settings = DIFFICULTY[gameId][tier] || defaults;
  return {
    tier,
    avgAccuracy: Math.round(avg),
    sessionsUsed: gameSessions.length,
    recommendedGameId: plan?.recommendedGameId || null,
    coachNote: plan?.notes?.[gameId] || null,
    source: plan?.source || 'heuristic',
    detail: levelDetail(gameId, settings),
    ...settings,
  };
}
