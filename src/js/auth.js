// Account management and virtual coin system
import { getStoredData, setStoredData } from './storage.js';

const STORAGE_KEY = 'blockBlastUsers';
const CURRENT_USER_KEY = 'blockBlastCurrentUser';
const INITIAL_COINS = 1000;
const GAME_COST = 10;

function hashPassword(password) {
    let h = 0;
    for (let i = 0; i < password.length; i++) {
        h = ((h << 5) - h) + password.charCodeAt(i);
        h = h & h;
    }
    return 'h' + Math.abs(h).toString(36);
}

export function createAccount(username, password) {
    const trimmed = String(username).trim();
    if (!trimmed || trimmed.length < 2) return { ok: false, error: 'Username must be at least 2 characters' };
    if (!password || password.length < 4) return { ok: false, error: 'Password must be at least 4 characters' };

    const users = getStoredData(STORAGE_KEY, {});
    if (users[trimmed]) return { ok: false, error: 'Username already exists' };

    users[trimmed] = {
        p: hashPassword(password),
        c: INITIAL_COINS
    };
    setStoredData(STORAGE_KEY, users);
    setStoredData(CURRENT_USER_KEY, trimmed);
    return { ok: true, coins: INITIAL_COINS };
}

export function signIn(username, password) {
    const trimmed = String(username).trim();
    if (!trimmed || !password) return { ok: false, error: 'Please enter username and password' };

    const users = getStoredData(STORAGE_KEY, {});
    const user = users[trimmed];
    if (!user) return { ok: false, error: 'Invalid username or password' };
    if (user.p !== hashPassword(password)) return { ok: false, error: 'Invalid username or password' };

    setStoredData(CURRENT_USER_KEY, trimmed);
    return { ok: true, coins: user.c };
}

export function signOut() {
    setStoredData(CURRENT_USER_KEY, null);
}

export function getCurrentUser() {
    const username = getStoredData(CURRENT_USER_KEY, null);
    if (!username) return null;
    const users = getStoredData(STORAGE_KEY, {});
    const user = users[username];
    if (!user) return null;
    return { username, coins: user.c };
}

export function getCoins() {
    const u = getCurrentUser();
    return u ? u.coins : 0;
}

export function addCoins(amount) {
    const username = getStoredData(CURRENT_USER_KEY, null);
    if (!username) return 0;
    const users = getStoredData(STORAGE_KEY, {});
    const user = users[username];
    if (!user) return 0;
    user.c = Math.max(0, (user.c || 0) + amount);
    setStoredData(STORAGE_KEY, users);
    return user.c;
}

export function deductCoins(amount) {
    const username = getStoredData(CURRENT_USER_KEY, null);
    if (!username) return { ok: false, coins: 0 };
    const users = getStoredData(STORAGE_KEY, {});
    const user = users[username];
    if (!user) return { ok: false, coins: 0 };
    const current = user.c || 0;
    if (current < amount) return { ok: false, coins: current };
    user.c = current - amount;
    setStoredData(STORAGE_KEY, users);
    return { ok: true, coins: user.c };
}

export function canAffordGame() {
    return getCoins() >= GAME_COST;
}

export function getGameCost() {
    return GAME_COST;
}

export function payForGame() {
    return deductCoins(GAME_COST);
}

export function updateUsername(newUsername) {
    const trimmed = String(newUsername).trim();
    if (!trimmed || trimmed.length < 2) return { ok: false, error: 'Username must be at least 2 characters' };

    const currentUsername = getStoredData(CURRENT_USER_KEY, null);
    if (!currentUsername) return { ok: false, error: 'Not signed in' };
    if (trimmed === currentUsername) return { ok: true };

    const users = getStoredData(STORAGE_KEY, {});
    if (users[trimmed]) return { ok: false, error: 'Username already exists' };

    const user = users[currentUsername];
    if (!user) return { ok: false, error: 'User not found' };

    users[trimmed] = user;
    delete users[currentUsername];
    setStoredData(STORAGE_KEY, users);
    setStoredData(CURRENT_USER_KEY, trimmed);
    return { ok: true };
}

export function updatePassword(newPassword) {
    if (!newPassword || newPassword.length < 4) return { ok: false, error: 'Password must be at least 4 characters' };

    const username = getStoredData(CURRENT_USER_KEY, null);
    if (!username) return { ok: false, error: 'Not signed in' };

    const users = getStoredData(STORAGE_KEY, {});
    const user = users[username];
    if (!user) return { ok: false, error: 'User not found' };

    user.p = hashPassword(newPassword);
    setStoredData(STORAGE_KEY, users);
    return { ok: true };
}
