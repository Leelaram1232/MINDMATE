import {
  MEMORY_MATCH_SYMBOLS,
  PATTERN_SHAPES,
  OBJECT_RECOGNITION_ROUNDS,
} from '../data/mockData';

export const DIFFICULTY = {
  'memory-match': {
    easy: { pairCount: 4, columns: 4, previewMs: 2800, flipBackMs: 1100, label: 'Easy' },
    medium: { pairCount: 6, columns: 4, previewMs: 0, flipBackMs: 850, label: 'Medium' },
    hard: { pairCount: 10, columns: 5, previewMs: 0, flipBackMs: 580, label: 'Challenge' },
  },
  'pattern-recall': {
    easy: { startLevel: 1, maxLevel: 3, extra: 1, showMs: 720, gapMs: 1050, shapeCount: 3, label: 'Easy' },
    medium: { startLevel: 1, maxLevel: 5, extra: 2, showMs: 500, gapMs: 800, shapeCount: 4, label: 'Medium' },
    hard: { startLevel: 2, maxLevel: 6, extra: 3, showMs: 340, gapMs: 540, shapeCount: 6, label: 'Challenge' },
  },
  'object-recognition': {
    easy: { rounds: 4, optionCount: 2, pool: 'easy', label: 'Easy' },
    medium: { rounds: 6, optionCount: 4, pool: 'medium', label: 'Medium' },
    hard: { rounds: 8, optionCount: 4, pool: 'hard', label: 'Challenge' },
  },
};

export function levelDetail(gameId, settings) {
  if (gameId === 'memory-match') return `${settings.pairCount} pairs`;
  if (gameId === 'pattern-recall') return `${settings.maxLevel} levels`;
  if (gameId === 'object-recognition') return `${settings.rounds} questions`;
  return '';
}

export function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createMemoryBoard(pairCount) {
  const symbols = shuffleArray(MEMORY_MATCH_SYMBOLS).slice(0, pairCount);
  return shuffleArray([...symbols, ...symbols]).map((symbol, index) => ({
    id: index,
    symbol,
    flipped: false,
    matched: false,
  }));
}

export function patternShapesFor(shapeCount) {
  return PATTERN_SHAPES.slice(0, Math.min(shapeCount, PATTERN_SHAPES.length));
}

export function pickObjectRounds({ rounds, optionCount, pool }) {
  let poolRounds;
  if (pool === 'easy') {
    poolRounds = OBJECT_RECOGNITION_ROUNDS.filter((r) => (r.level || 'easy') === 'easy');
  } else if (pool === 'medium') {
    poolRounds = OBJECT_RECOGNITION_ROUNDS.filter((r) => r.level !== 'hard');
  } else {
    poolRounds = OBJECT_RECOGNITION_ROUNDS.filter((r) => r.level === 'hard' || r.level === 'medium');
    if (poolRounds.length < rounds) poolRounds = OBJECT_RECOGNITION_ROUNDS;
  }

  return shuffleArray(poolRounds).slice(0, rounds).map((round) => {
    const others = round.options.filter((o) => o !== round.correctAnswer);
    const picked = shuffleArray([
      round.correctAnswer,
      ...shuffleArray(others).slice(0, Math.max(0, optionCount - 1)),
    ]);
    return { ...round, options: picked };
  });
}
