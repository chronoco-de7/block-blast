import { getStoredData, setStoredData, getSettings, getDailyChallenge, defaultSettings, saveSettingsToStorage } from './storage.js';
import { showScreenshot } from './game.js';

export function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
}

export function getScores() {
    return getStoredData('gameScores', []);
}

export function getStatistics() {
    const scores = getScores();
    if (scores.length === 0) return { totalGames: 0, totalLines: 0, bestLevel: 0, avgScore: 0 };
    return {
        totalGames: scores.length,
        totalLines: scores.reduce((sum, g) => sum + g.lines, 0),
        bestLevel: Math.max(...scores.map(g => g.level)),
        avgScore: Math.round(scores.reduce((sum, g) => sum + g.score, 0) / scores.length)
    };
}

export function loadScoresPage() {
    const scores = getScores();
    const stats = getStatistics();
    const totalGames = document.getElementById('totalGames');
    const totalLines = document.getElementById('totalLines');
    const bestLevel = document.getElementById('bestLevel');
    const avgScore = document.getElementById('avgScore');
    if (totalGames) totalGames.textContent = stats.totalGames;
    if (totalLines) totalLines.textContent = stats.totalLines;
    if (bestLevel) bestLevel.textContent = stats.bestLevel;
    if (avgScore) avgScore.textContent = stats.avgScore.toLocaleString();

    const bestScoresList = document.getElementById('bestScoresList');
    if (bestScoresList) {
        bestScoresList.innerHTML = '';
        const topScores = scores.slice(0, 10);
        topScores.forEach((game, index) => {
            const item = document.createElement('div');
            item.className = 'score-item';
            item.innerHTML = `
                <div class="score-item-rank">#${index + 1}</div>
                <div class="score-item-details">
                    <div class="score-item-value">${game.score.toLocaleString()}</div>
                    <div class="score-item-meta">${game.lines} lines • Level ${game.level} • ${formatDate(game.date)}</div>
                </div>
            `;
            if (game.screenshot) {
                const ss = document.createElement('div');
                ss.className = 'score-item-screenshot';
                ss.onclick = () => showScreenshot(game.screenshot);
                const img = document.createElement('img');
                img.src = game.screenshot;
                img.alt = 'Game screenshot';
                ss.appendChild(img);
                item.appendChild(ss);
            }
            bestScoresList.appendChild(item);
        });
        if (topScores.length === 0) bestScoresList.innerHTML = '<div style="text-align: center; color: rgba(255,255,255,0.6); padding: 20px;">No scores yet. Play a game to get started!</div>';
    }

    const recentScoresList = document.getElementById('recentScoresList');
    if (recentScoresList) {
        recentScoresList.innerHTML = '';
        const recent = [...scores].reverse().slice(0, 10);
        recent.forEach(game => {
            const item = document.createElement('div');
            item.className = 'score-item';
            item.innerHTML = `
                <div class="score-item-rank">${game.score.toLocaleString()}</div>
                <div class="score-item-details">
                    <div class="score-item-value">${game.lines} lines cleared</div>
                    <div class="score-item-meta">Level ${game.level} • ${formatDate(game.date)}</div>
                </div>
            `;
            if (game.screenshot) {
                const ss = document.createElement('div');
                ss.className = 'score-item-screenshot';
                ss.onclick = () => showScreenshot(game.screenshot);
                const img = document.createElement('img');
                img.src = game.screenshot;
                img.alt = 'Game screenshot';
                ss.appendChild(img);
                item.appendChild(ss);
            }
            recentScoresList.appendChild(item);
        });
        if (recent.length === 0) recentScoresList.innerHTML = '<div style="text-align: center; color: rgba(255,255,255,0.6); padding: 20px;">No recent games.</div>';
    }
}

export function loadChallengePage() {
    const challenge = getDailyChallenge();
    const goalEl = document.getElementById('challengeGoal');
    const progressBar = document.getElementById('challengeProgressBar');
    const progressText = document.getElementById('challengeProgressText');
    const statusEl = document.getElementById('challengeStatus');
    if (goalEl) goalEl.textContent = challenge.goal.description;
    const progressPercent = Math.min((challenge.progress / challenge.goal.target) * 100, 100);
    if (progressBar) progressBar.style.width = progressPercent + '%';
    if (progressText) progressText.textContent = `${challenge.progress} / ${challenge.goal.target} ${challenge.goal.type === 'lines' ? 'lines' : challenge.goal.type === 'score' ? 'points' : 'level'}`;
    if (statusEl) {
        statusEl.textContent = challenge.completed ? 'Completed! 🎉' : 'In Progress';
        statusEl.style.color = challenge.completed ? 'rgba(0, 240, 255, 1)' : '#fff';
    }

    const challenges = getStoredData('dailyChallenges', {});
    const historyList = document.getElementById('challengeHistoryList');
    if (historyList) {
        historyList.innerHTML = '';
        const historyDates = Object.keys(challenges).sort().reverse().slice(0, 7);
        historyDates.forEach(dateStr => {
            const ch = challenges[dateStr];
            const date = new Date(dateStr);
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <div class="history-item-date">${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                <div class="history-item-status ${ch.completed ? 'completed' : 'failed'}">${ch.completed ? '✓ Completed' : 'Incomplete'}</div>
            `;
            historyList.appendChild(item);
        });
        if (historyDates.length === 0) historyList.innerHTML = '<div style="text-align: center; color: rgba(255,255,255,0.6); padding: 20px;">No challenge history yet.</div>';
    }
}

export function loadSettingsPage() {
    const settings = getSettings();
    const soundEl = document.getElementById('soundEnabled');
    const musicEl = document.getElementById('musicEnabled');
    const animEl = document.getElementById('animationsEnabled');
    const autoEl = document.getElementById('autoSaveEnabled');
    if (soundEl) soundEl.checked = settings.soundEnabled;
    if (musicEl) musicEl.checked = settings.musicEnabled;
    if (animEl) animEl.checked = settings.animationsEnabled;
    if (autoEl) autoEl.checked = settings.autoSaveEnabled;

    const difficulty = settings.difficultyLevel || 'normal';
    document.querySelectorAll('.difficulty-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.difficulty === difficulty);
    });
    const diffInput = document.getElementById('difficultyLevel');
    if (diffInput) diffInput.value = difficulty;
}

export function saveSettings() {
    const diffInput = document.getElementById('difficultyLevel');
    const settings = {
        soundEnabled: document.getElementById('soundEnabled')?.checked ?? false,
        musicEnabled: document.getElementById('musicEnabled')?.checked ?? false,
        animationsEnabled: document.getElementById('animationsEnabled')?.checked ?? true,
        autoSaveEnabled: document.getElementById('autoSaveEnabled')?.checked ?? true,
        difficultyLevel: diffInput?.value ?? 'normal'
    };
    saveSettingsToStorage(settings);
    applySettings(settings);
}

export function applySettings(settings) {
    // Placeholder for applying settings to game behavior
}

export function toggleSetting(settingId) {
    const cb = document.getElementById(settingId);
    if (cb) { cb.checked = !cb.checked; saveSettings(); }
}

export function selectDifficulty(level) {
    document.querySelectorAll('.difficulty-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.difficulty === level);
    });
    const diffInput = document.getElementById('difficultyLevel');
    if (diffInput) diffInput.value = level;
    saveSettings();
}

export function resetSettings() {
    if (confirm('Reset all settings to default values?')) {
        localStorage.removeItem('gameSettings');
        loadSettingsPage();
        saveSettings();
    }
}

export function clearAllScores() {
    if (confirm('Are you sure you want to clear all scores? This cannot be undone.')) {
        localStorage.removeItem('gameScores');
        loadScoresPage();
    }
}

export function navigateToPage(pageName) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pageMap = { game: 'gamePage', scores: 'scoresPage', challenge: 'challengePage', settings: 'settingsPage' };
    const pageId = pageMap[pageName];
    if (pageId) {
        const page = document.getElementById(pageId);
        if (page) page.classList.add('active');
        if (pageName === 'scores') loadScoresPage();
        else if (pageName === 'challenge') loadChallengePage();
        else if (pageName === 'settings') loadSettingsPage();
    }
}
