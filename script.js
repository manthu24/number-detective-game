let targetNumber = '';
let playerName = '';
let guessCount = 0;
let startTime = 0;
let timerInterval;
const MAX_GUESSES = 8; // Maximum allowed guesses

// Generate a 4-digit number with unique digits
function generateTargetNumber() {
    const digits = [];
    while (digits.length < 4) {
        const digit = Math.floor(Math.random() * 10).toString();
        if (!digits.includes(digit)) digits.push(digit);
    }
    return digits.join('');
}

// Start the game
function startGame() {
    playerName = document.getElementById('player-name').value.trim();
    if (!playerName) {
        alert('🕵️‍♂️ Enter your spy name!');
        return;
    }

    targetNumber = generateTargetNumber();
    guessCount = 0;
    startTime = Date.now();
    document.getElementById('current-player').textContent = playerName;
    document.getElementById('guess-count').textContent = guessCount;
    document.getElementById('feedback').innerHTML = '';

    // Switch screens
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    document.getElementById('leaderboard').classList.add('hidden');

    // Start timer
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        document.getElementById('timer').textContent = elapsed;
    }, 1000);
}

// Submit guess
function submitGuess() {
    const guess = document.getElementById('guess-input').value;

    // Validate input
    if (guess.length !== 4 || isNaN(guess) || new Set(guess).size !== 4) {
        alert('❌ Invalid code! Use 4 unique digits.');
        return;
    }

    guessCount++;
    document.getElementById('guess-count').textContent = guessCount;

    // Calculate feedback
    let feedback = '';
    for (let i = 0; i < 4; i++) {
        if (guess[i] === targetNumber[i]) {
            feedback += '+'; // Correct digit and position
        } else if (targetNumber.includes(guess[i])) {
            feedback += '-'; // Correct digit, wrong position
        } else {
            feedback += '*'; // Digit not in code
        }
    }

    // Display feedback
    const feedbackDiv = document.getElementById('feedback');
    const feedbackItem = document.createElement('div');
    feedbackItem.className = 'feedback-item';
    feedbackItem.innerHTML = `
        <span>${guess}</span>
        <span>${feedback.split('').join(' ')}</span>
    `;
    feedbackDiv.prepend(feedbackItem);

    // Clear input
    document.getElementById('guess-input').value = '';

    // Check for win
    if (feedback === '++++') {
        clearInterval(timerInterval);
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);
        const score = calculateScore(timeTaken, guessCount);
        alert(`🎉 Mission accomplished, ${playerName}!\nScore: ${score}`);
        saveScore(playerName, score, timeTaken, guessCount); // Save score
        showLeaderboard();
    }

    // Check for loss (max guesses reached)
    if (guessCount >= MAX_GUESSES && feedback !== '++++') {
        clearInterval(timerInterval);
        alert(`😢 Mission failed, ${playerName}!\nThe correct code was: ${targetNumber}`);
        showLeaderboard();
    }
}

// Calculate score
function calculateScore(time, guesses) {
    return Math.round((10000 / (time + 1)) * (10 - Math.min(guesses, 10)));
}

// Save score to backend
async function saveScore(name, score, time, guesses) {
    try {
        const response = await fetch('http://localhost:5000/api/save-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, score, time, guesses })
        });
        const data = await response.json();
        console.log(data.message);
    } catch (err) {
        console.error('Error saving score:', err);
    }
}

// Fetch leaderboard from backend
async function fetchLeaderboard() {
    try {
        const response = await fetch('http://localhost:5000/api/leaderboard');
        const leaderboard = await response.json();
        const leaderboardList = document.getElementById('leaderboard-list');
        leaderboardList.innerHTML = leaderboard.map((player, index) => `
            <li>${index + 1}. ${player.name} - Score: ${player.score}</li>
        `).join('');
    } catch (err) {
        console.error('Error fetching leaderboard:', err);
    }
}

// Show leaderboard
function showLeaderboard() {
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('leaderboard').classList.remove('hidden');
    fetchLeaderboard(); // Fetch and display leaderboard
}

// Reset game
function showGameScreen() {
    document.getElementById('leaderboard').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
}