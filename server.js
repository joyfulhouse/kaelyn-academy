const express = require('express');
const cookieSession = require('cookie-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Cookie session middleware
app.use(cookieSession({
    name: 'kaelyn-math-session',
    keys: [process.env.SESSION_SECRET || 'kaelyn-math-secret-key-2024'],
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: 'lax',
    httpOnly: true
}));

// Parse JSON bodies
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Initialize session state if not exists
function initializeSession(session) {
    if (!session.state) {
        session.state = {
            // User profile
            userName: 'Kaelyn',

            // Lesson progress (which lessons have been visited/completed)
            lessonsVisited: [],
            lessonsCompleted: [],

            // Module-specific progress
            numberPlaces: {
                questionsAttempted: 0,
                questionsCorrect: 0,
                highestNumber: 0
            },

            stackedMath: {
                additionAttempted: 0,
                additionCorrect: 0,
                subtractionAttempted: 0,
                subtractionCorrect: 0
            },

            multiplication: {
                questionsAttempted: 0,
                questionsCorrect: 0,
                tablesCompleted: [], // Which times tables they've practiced
                bestStreak: 0
            },

            division: {
                questionsAttempted: 0,
                questionsCorrect: 0,
                bestStreak: 0
            },

            // Carry-over module progress
            carryOver: {
                questionsAttempted: 0,
                questionsCorrect: 0,
                bestStreak: 0
            },

            // Borrowing module progress
            borrowing: {
                questionsAttempted: 0,
                questionsCorrect: 0,
                bestStreak: 0
            },

            // Practice area stats
            practice: {
                totalSessions: 0,
                totalProblems: 0,
                totalCorrect: 0,
                bestScore: 0,
                recentScores: [] // Last 10 scores
            },

            // Achievements/Stars earned
            totalStars: 0,
            achievements: [],

            // Last active timestamp
            lastActive: new Date().toISOString()
        };
    }
    return session.state;
}

// API: Get current session state
app.get('/api/state', (req, res) => {
    const state = initializeSession(req.session);
    state.lastActive = new Date().toISOString();
    res.json({ success: true, state });
});

// API: Update session state
app.post('/api/state', (req, res) => {
    const state = initializeSession(req.session);
    const updates = req.body;

    // Merge updates into state
    Object.keys(updates).forEach(key => {
        if (typeof updates[key] === 'object' && !Array.isArray(updates[key]) && state[key]) {
            // Deep merge for objects
            state[key] = { ...state[key], ...updates[key] };
        } else {
            state[key] = updates[key];
        }
    });

    state.lastActive = new Date().toISOString();
    req.session.state = state;

    res.json({ success: true, state });
});

// API: Update specific module progress
app.post('/api/progress/:module', (req, res) => {
    const state = initializeSession(req.session);
    const { module } = req.params;
    const updates = req.body;

    if (state[module] && typeof state[module] === 'object') {
        state[module] = { ...state[module], ...updates };
        state.lastActive = new Date().toISOString();
        req.session.state = state;
        res.json({ success: true, module, data: state[module] });
    } else {
        res.status(400).json({ success: false, error: 'Invalid module' });
    }
});

// API: Record lesson visit
app.post('/api/lesson/visit', (req, res) => {
    const state = initializeSession(req.session);
    const { lesson } = req.body;

    if (lesson && !state.lessonsVisited.includes(lesson)) {
        state.lessonsVisited.push(lesson);
    }

    state.lastActive = new Date().toISOString();
    req.session.state = state;

    res.json({ success: true, lessonsVisited: state.lessonsVisited });
});

// API: Mark lesson complete
app.post('/api/lesson/complete', (req, res) => {
    const state = initializeSession(req.session);
    const { lesson } = req.body;

    if (lesson && !state.lessonsCompleted.includes(lesson)) {
        state.lessonsCompleted.push(lesson);
    }

    state.lastActive = new Date().toISOString();
    req.session.state = state;

    res.json({ success: true, lessonsCompleted: state.lessonsCompleted });
});

// API: Add stars
app.post('/api/stars/add', (req, res) => {
    const state = initializeSession(req.session);
    const { stars } = req.body;

    if (typeof stars === 'number' && stars > 0) {
        state.totalStars += stars;
    }

    state.lastActive = new Date().toISOString();
    req.session.state = state;

    res.json({ success: true, totalStars: state.totalStars });
});

// API: Record practice session
app.post('/api/practice/record', (req, res) => {
    const state = initializeSession(req.session);
    const { correct, total, type } = req.body;

    state.practice.totalSessions++;
    state.practice.totalProblems += total;
    state.practice.totalCorrect += correct;

    const score = Math.round((correct / total) * 100);
    if (score > state.practice.bestScore) {
        state.practice.bestScore = score;
    }

    // Keep last 10 scores
    state.practice.recentScores.push({ score, type, date: new Date().toISOString() });
    if (state.practice.recentScores.length > 10) {
        state.practice.recentScores.shift();
    }

    // Award stars based on performance
    let starsEarned = 0;
    if (score >= 100) starsEarned = 5;
    else if (score >= 80) starsEarned = 4;
    else if (score >= 60) starsEarned = 3;
    else if (score >= 40) starsEarned = 2;
    else if (score >= 20) starsEarned = 1;

    state.totalStars += starsEarned;
    state.lastActive = new Date().toISOString();
    req.session.state = state;

    res.json({
        success: true,
        practice: state.practice,
        starsEarned,
        totalStars: state.totalStars
    });
});

// API: Reset session (for testing)
app.post('/api/reset', (req, res) => {
    req.session.state = null;
    const state = initializeSession(req.session);
    res.json({ success: true, message: 'Session reset', state });
});

// API endpoint to generate math problems
app.post('/api/generate-problems', (req, res) => {
    const { type, count = 5, difficulty = 'easy' } = req.body;
    const problems = [];

    for (let i = 0; i < count; i++) {
        problems.push(generateProblem(type, difficulty));
    }

    res.json({ problems });
});

function generateProblem(type, difficulty) {
    let maxNum, minNum;

    switch (difficulty) {
        case 'easy':
            minNum = 1;
            maxNum = 10;
            break;
        case 'medium':
            minNum = 10;
            maxNum = 100;
            break;
        case 'hard':
            minNum = 100;
            maxNum = 1000;
            break;
        default:
            minNum = 1;
            maxNum = 10;
    }

    const num1 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
    const num2 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;

    switch (type) {
        case 'addition':
            return {
                num1,
                num2,
                operator: '+',
                answer: num1 + num2,
                question: `${num1} + ${num2} = ?`
            };
        case 'subtraction':
            // Ensure positive result for children
            const larger = Math.max(num1, num2);
            const smaller = Math.min(num1, num2);
            return {
                num1: larger,
                num2: smaller,
                operator: '-',
                answer: larger - smaller,
                question: `${larger} - ${smaller} = ?`
            };
        case 'multiplication':
            // Keep multiplication simpler for beginners
            const mult1 = Math.floor(Math.random() * 12) + 1;
            const mult2 = Math.floor(Math.random() * 12) + 1;
            return {
                num1: mult1,
                num2: mult2,
                operator: '×',
                answer: mult1 * mult2,
                question: `${mult1} × ${mult2} = ?`
            };
        case 'division':
            // Generate clean division problems (no remainders)
            const divisor = Math.floor(Math.random() * 11) + 1;
            const quotient = Math.floor(Math.random() * 11) + 1;
            const dividend = divisor * quotient;
            return {
                num1: dividend,
                num2: divisor,
                operator: '÷',
                answer: quotient,
                question: `${dividend} ÷ ${divisor} = ?`
            };
        default:
            return generateProblem('addition', difficulty);
    }
}

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🎓 Kaelyn's Math Learning Website is running!`);
    console.log(`📚 Open http://localhost:${PORT} in your browser`);
});
