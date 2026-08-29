/* ===================================================
   MINDMATE NER — Mock Data
   Centralized sample data for Phase 1 UI prototype
   =================================================== */

export const PATIENTS = [
  {
    id: 'p1',
    name: 'Ramesh Kumar',
    age: 72,
    gender: 'Male',
    status: 'Active',
    avatar: '👨‍🦳',
    gamesCompleted: 4,
    avgAccuracy: 78,
    memoryTrend: 'Improving',
    lastActive: 'Today',
    joinedDate: '2025-11-15',
  },
  {
    id: 'p2',
    name: 'Lakshmi Devi',
    age: 68,
    gender: 'Female',
    status: 'Active',
    avatar: '👩‍🦳',
    gamesCompleted: 6,
    avgAccuracy: 82,
    memoryTrend: 'Stable',
    lastActive: 'Today',
    joinedDate: '2025-12-02',
  },
  {
    id: 'p3',
    name: 'Anil Sharma',
    age: 75,
    gender: 'Male',
    status: 'Needs Attention',
    avatar: '👴',
    gamesCompleted: 2,
    avgAccuracy: 64,
    memoryTrend: 'Declining',
    lastActive: 'Yesterday',
    joinedDate: '2026-01-10',
  },
  {
    id: 'p4',
    name: 'Sunita Das',
    age: 70,
    gender: 'Female',
    status: 'Active',
    avatar: '👵',
    gamesCompleted: 5,
    avgAccuracy: 85,
    memoryTrend: 'Improving',
    lastActive: 'Today',
    joinedDate: '2026-03-05',
  },
];

export const GAMES_LIST = [
  {
    id: 'memory-match',
    title: 'Memory Match',
    description: 'Find the matching pairs of cards.',
    longDescription: 'Flip cards to reveal symbols and find their matching pairs. Train your memory and attention with this classic activity.',
    skills: ['Memory', 'Attention'],
    difficulty: 'Easy',
    icon: '🃏',
    color: '#2F5D50',
    estimatedTime: '3-5 min',
  },
  {
    id: 'pattern-recall',
    title: 'Pattern Recall',
    description: 'Remember and repeat the sequence.',
    longDescription: 'Watch a sequence of shapes light up, then tap them in the same order. Helps strengthen short-term memory and concentration.',
    skills: ['Memory', 'Concentration'],
    difficulty: 'Medium',
    icon: '🔷',
    color: '#C9785D',
    estimatedTime: '3-5 min',
  },
  {
    id: 'object-recognition',
    title: 'Object Recognition',
    description: 'Identify familiar everyday objects.',
    longDescription: 'Look at an object and choose the correct name from the options. A relaxing activity that exercises recognition and language skills.',
    skills: ['Recognition', 'Language'],
    difficulty: 'Easy',
    icon: '🍎',
    color: '#D9A441',
    estimatedTime: '2-4 min',
  },
];

export const getDefaultReminders = () => [
  {
    id: 'r1',
    type: 'medicine',
    icon: '💊',
    title: 'Morning Medicine',
    description: 'Take blood pressure tablet',
    time: '9:00 AM',
    status: 'completed',
  },
  {
    id: 'r2',
    type: 'hydration',
    icon: '💧',
    title: 'Drink Water',
    description: 'Stay hydrated — have a glass of water',
    time: '11:00 AM',
    status: 'completed',
  },
  {
    id: 'r3',
    type: 'activity',
    icon: '🚶',
    title: 'Take a Walk',
    description: '15 minute walk in the garden',
    time: '5:00 PM',
    status: 'pending',
  },
  {
    id: 'r4',
    type: 'medicine',
    icon: '💊',
    title: 'Evening Medicine',
    description: 'Take vitamin D supplement',
    time: '7:00 PM',
    status: 'upcoming',
  },
  {
    id: 'r5',
    type: 'appointment',
    icon: '🏥',
    title: 'Doctor Appointment',
    description: 'Monthly checkup with Dr. Patel',
    time: 'Tomorrow, 10:30 AM',
    status: 'upcoming',
  },
];

export const WEEKLY_PERFORMANCE = [
  { day: 'Mon', accuracy: 72, games: 1, score: 68 },
  { day: 'Tue', accuracy: 78, games: 1, score: 74 },
  { day: 'Wed', accuracy: 0, games: 0, score: 0 },
  { day: 'Thu', accuracy: 80, games: 2, score: 82 },
  { day: 'Fri', accuracy: 85, games: 1, score: 78 },
  { day: 'Sat', accuracy: 76, games: 1, score: 72 },
  { day: 'Sun', accuracy: 82, games: 0, score: 0 },
];

export const MONTHLY_ACCURACY = [
  { week: 'Week 1', accuracy: 68 },
  { week: 'Week 2', accuracy: 72 },
  { week: 'Week 3', accuracy: 76 },
  { week: 'Week 4', accuracy: 78 },
];

export const ACTIVITY_TIMELINE = [
  {
    id: 'a1',
    date: 'Today',
    events: [
      { time: '10:30 AM', type: 'game', title: 'Completed Memory Match', detail: 'Score: 82%', icon: '🃏' },
      { time: '9:00 AM', type: 'reminder', title: 'Medicine Reminder Completed', detail: 'Morning Medicine', icon: '💊' },
      { time: '8:15 AM', type: 'game', title: 'Completed Object Recognition', detail: 'Score: 90%', icon: '🍎' },
    ],
  },
  {
    id: 'a2',
    date: 'Yesterday',
    events: [
      { time: '4:30 PM', type: 'game', title: 'Pattern Recall', detail: 'Score: 74%', icon: '🔷' },
      { time: '11:00 AM', type: 'reminder', title: 'Hydration Reminder Completed', detail: 'Drink Water', icon: '💧' },
      { time: '9:15 AM', type: 'reminder', title: 'Medicine Reminder Completed', detail: 'Morning Medicine', icon: '💊' },
    ],
  },
  {
    id: 'a3',
    date: '2 Days Ago',
    events: [
      { time: '3:00 PM', type: 'game', title: 'Memory Match', detail: 'Score: 76%', icon: '🃏' },
      { time: '9:00 AM', type: 'reminder', title: 'Medicine Reminder Completed', detail: 'Morning Medicine', icon: '💊' },
    ],
  },
];

export const MEMORY_MATCH_SYMBOLS = [
  '🌻', '🌸', '🍂', '🌿', '🦋', '🐦', '☀️', '🌙', '🍎', '⭐', '🎈', '🐟',
];

export const PATTERN_SHAPES = [
  { id: 'circle', symbol: '●', label: 'Circle', color: '#2F5D50' },
  { id: 'triangle', symbol: '▲', label: 'Triangle', color: '#C9785D' },
  { id: 'square', symbol: '■', label: 'Square', color: '#D9A441' },
  { id: 'diamond', symbol: '◆', label: 'Diamond', color: '#7E9F8B' },
  { id: 'star', symbol: '★', label: 'Star', color: '#6B4C9A' },
  { id: 'hex', symbol: '⬡', label: 'Hexagon', color: '#3D6B8A' },
];

export const OBJECT_RECOGNITION_ROUNDS = [
  {
    id: 'or1',
    level: 'easy',
    object: '🍎',
    objectName: 'Apple',
    objectLabel: 'What is this fruit?',
    options: ['Apple', 'Orange', 'Banana', 'Grape'],
    correctAnswer: 'Apple',
  },
  {
    id: 'or2',
    level: 'easy',
    object: '🏠',
    objectName: 'House',
    objectLabel: 'What building is this?',
    options: ['School', 'Hospital', 'House', 'Shop'],
    correctAnswer: 'House',
  },
  {
    id: 'or3',
    level: 'easy',
    object: '📖',
    objectName: 'Book',
    objectLabel: 'What is this?',
    options: ['Newspaper', 'Book', 'Letter', 'Notebook'],
    correctAnswer: 'Book',
  },
  {
    id: 'or4',
    level: 'easy',
    object: '☀️',
    objectName: 'Sun',
    objectLabel: 'What is in the sky in the day?',
    options: ['Moon', 'Sun', 'Star', 'Cloud'],
    correctAnswer: 'Sun',
  },
  {
    id: 'or5',
    level: 'easy',
    object: '🐶',
    objectName: 'Dog',
    objectLabel: 'What animal is this?',
    options: ['Cat', 'Dog', 'Cow', 'Bird'],
    correctAnswer: 'Dog',
  },
  {
    id: 'or6',
    level: 'easy',
    object: '☕',
    objectName: 'Cup',
    objectLabel: 'What do you drink tea from?',
    options: ['Plate', 'Cup', 'Bowl', 'Spoon'],
    correctAnswer: 'Cup',
  },
  {
    id: 'or7',
    level: 'medium',
    object: '⌚',
    objectName: 'Watch',
    objectLabel: 'What is this item?',
    options: ['Phone', 'Watch', 'Ring', 'Compass'],
    correctAnswer: 'Watch',
  },
  {
    id: 'or8',
    level: 'medium',
    object: '☂️',
    objectName: 'Umbrella',
    objectLabel: 'What do you use on a rainy day?',
    options: ['Hat', 'Scarf', 'Umbrella', 'Sunglasses'],
    correctAnswer: 'Umbrella',
  },
  {
    id: 'or9',
    level: 'medium',
    object: '🌻',
    objectName: 'Sunflower',
    objectLabel: 'What is this flower?',
    options: ['Rose', 'Sunflower', 'Tulip', 'Lily'],
    correctAnswer: 'Sunflower',
  },
  {
    id: 'or10',
    level: 'medium',
    object: '🪑',
    objectName: 'Chair',
    objectLabel: 'What do you sit on?',
    options: ['Table', 'Chair', 'Bed', 'Shelf'],
    correctAnswer: 'Chair',
  },
  {
    id: 'or11',
    level: 'medium',
    object: '🔑',
    objectName: 'Key',
    objectLabel: 'What opens a door?',
    options: ['Coin', 'Key', 'Button', 'Pin'],
    correctAnswer: 'Key',
  },
  {
    id: 'or12',
    level: 'medium',
    object: '👓',
    objectName: 'Glasses',
    objectLabel: 'What helps you see more clearly?',
    options: ['Glasses', 'Earrings', 'Necklace', 'Hat'],
    correctAnswer: 'Glasses',
  },
  {
    id: 'or13',
    level: 'hard',
    object: '✂️',
    objectName: 'Scissors',
    objectLabel: 'What do you use to cut paper?',
    options: ['Knife', 'Scissors', 'Spoon', 'Pen'],
    correctAnswer: 'Scissors',
  },
  {
    id: 'or14',
    level: 'hard',
    object: '🫖',
    objectName: 'Kettle',
    objectLabel: 'What do you boil water in?',
    options: ['Kettle', 'Cup', 'Bowl', 'Jug'],
    correctAnswer: 'Kettle',
  },
  {
    id: 'or15',
    level: 'hard',
    object: '🧵',
    objectName: 'Thread',
    objectLabel: 'What do you sew with, besides a needle?',
    options: ['Rope', 'Thread', 'Wire', 'String bag'],
    correctAnswer: 'Thread',
  },
  {
    id: 'or16',
    level: 'hard',
    object: '🧭',
    objectName: 'Compass',
    objectLabel: 'What shows you north, south, east, and west?',
    options: ['Watch', 'Compass', 'Clock', 'Calendar'],
    correctAnswer: 'Compass',
  },
  {
    id: 'or17',
    level: 'hard',
    object: '🕯️',
    objectName: 'Candle',
    objectLabel: 'What gives light when there is no electricity?',
    options: ['Lamp', 'Candle', 'Torch phone', 'Matchbox'],
    correctAnswer: 'Candle',
  },
  {
    id: 'or18',
    level: 'hard',
    object: '🧴',
    objectName: 'Bottle',
    objectLabel: 'What is this container usually called?',
    options: ['Jar', 'Bottle', 'Tin', 'Box'],
    correctAnswer: 'Bottle',
  },
  {
    id: 'or19',
    level: 'hard',
    object: '🧺',
    objectName: 'Basket',
    objectLabel: 'What do you carry fruit or clothes in?',
    options: ['Basket', 'Bucket', 'Bag', 'Tray'],
    correctAnswer: 'Basket',
  },
  {
    id: 'or20',
    level: 'hard',
    object: '🔔',
    objectName: 'Bell',
    objectLabel: 'What rings to get your attention?',
    options: ['Bell', 'Drum', 'Whistle', 'Clock'],
    correctAnswer: 'Bell',
  },
];

export const VOICE_SUGGESTIONS = [
  { id: 'v1', text: 'What should I do now?', icon: '💡' },
  { id: 'v2', text: 'Show my reminders', icon: '📋' },
  { id: 'v3', text: 'Start a game', icon: '🎮' },
  { id: 'v4', text: 'Call my caregiver', icon: '📞' },
];

export const PROGRESS_SUMMARY = {
  gamesThisWeek: 4,
  avgAccuracy: 78,
  activeDays: 5,
  totalGames: 24,
  streak: 3,
  bestAccuracy: 92,
  favoriteGame: 'Memory Match',
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export const getFormattedDate = (locale = 'en-IN') => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date().toLocaleDateString(locale, options);
};
