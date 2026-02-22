// LocalStorage helpers
export function getStoredData(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
        return defaultValue;
    }
}

export function setStoredData(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

export const defaultSettings = {
    soundEnabled: false,
    musicEnabled: false,
    animationsEnabled: true,
    autoSaveEnabled: true,
    difficultyLevel: 'normal'
};

export function getSettings() {
    return getStoredData('gameSettings', defaultSettings);
}

export function saveSettingsToStorage(settings) {
    setStoredData('gameSettings', settings);
}

export function getTodayDateString() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

export function getDailyChallenge() {
    const today = getTodayDateString();
    const challenges = getStoredData('dailyChallenges', {});
    if (!challenges[today]) {
        const goals = [
            { type: 'lines', target: 30, description: 'Clear 30 lines' },
            { type: 'lines', target: 50, description: 'Clear 50 lines' },
            { type: 'lines', target: 75, description: 'Clear 75 lines' },
            { type: 'score', target: 5000, description: 'Score 5,000 points' },
            { type: 'score', target: 10000, description: 'Score 10,000 points' },
            { type: 'level', target: 3, description: 'Reach level 3' },
            { type: 'level', target: 5, description: 'Reach level 5' }
        ];
        const goal = goals[Math.floor(Math.random() * goals.length)];
        challenges[today] = { date: today, goal, progress: 0, completed: false, completedAt: null };
        setStoredData('dailyChallenges', challenges);
    }
    return challenges[today];
}
