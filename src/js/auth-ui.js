// Auth UI and coin display
import {
    createAccount, signIn, signOut, getCurrentUser, getCoins,
    canAffordGame, getGameCost, payForGame
} from './auth.js';
import { restartGame } from './game.js';
import { generateShapes } from './shapes.js';
import { resetGameState } from './state.js';
import { render } from './render.js';
import { updateUI } from './game.js';

export function updateCoinDisplay() {
    const el = document.getElementById('coinDisplay');
    if (el) el.textContent = getCoins().toLocaleString();
}

export function updateUserInfoDisplay() {
    const user = getCurrentUser();
    const nameEl = document.getElementById('headerUsername');
    const userInfo = document.getElementById('headerUserInfo');
    if (user) {
        if (nameEl) nameEl.textContent = user.username;
        if (userInfo) userInfo.style.display = 'flex';
        closeUserCombo();
    } else {
        if (nameEl) nameEl.textContent = '';
        if (userInfo) userInfo.style.display = 'none';
        closeUserCombo();
    }
}

export function toggleUserCombo() {
    const el = document.getElementById('headerUserInfo');
    if (el) el.classList.toggle('open');
}

export function closeUserCombo() {
    document.getElementById('headerUserInfo')?.classList.remove('open');
}

export function signOutUser() {
    closeUserCombo();
    signOut();
    updateCoinDisplay();
    updateUserInfoDisplay();
    showAuthOverlay();
    showStartGameOverlay();
    document.getElementById('gameOverModal')?.classList.remove('show');
    document.getElementById('dailyChallengeRewardModal')?.classList.remove('show');
    resetGameState();
    generateShapes(0);
    render();
}

export function showAuthOverlay() {
    document.getElementById('authOverlay')?.classList.add('show');
}

export function hideAuthOverlay() {
    document.getElementById('authOverlay')?.classList.remove('show');
}

export function showStartGameOverlay() {
    const overlay = document.getElementById('startGameOverlay');
    const coinsEl = document.getElementById('startGameCoins');
    const costEl = document.getElementById('gameCostDisplay');
    const insufficientEl = document.getElementById('insufficientCoinsMsg');
    if (overlay) overlay.classList.remove('hidden');
    if (coinsEl) coinsEl.textContent = getCoins().toLocaleString();
    if (costEl) costEl.textContent = getGameCost();
    if (insufficientEl) insufficientEl.style.display = canAffordGame() ? 'none' : 'block';
}

export function hideStartGameOverlay() {
    document.getElementById('startGameOverlay')?.classList.add('hidden');
}

export { isGameInProgress } from './state.js';

export function setupAuthUI(setupEventListeners) {
    const authOverlay = document.getElementById('authOverlay');
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    const signInBtn = document.getElementById('signInBtn');
    const signUpBtn = document.getElementById('signUpBtn');
    const signInError = document.getElementById('signInError');
    const signUpError = document.getElementById('signUpError');

    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const which = tab.dataset.tab;
            signInForm?.classList.toggle('hidden', which !== 'signin');
            signUpForm?.classList.toggle('hidden', which !== 'signup');
            signInError.textContent = '';
            signUpError.textContent = '';
        });
    });

    signInBtn?.addEventListener('click', () => {
        const username = document.getElementById('signInUsername')?.value || '';
        const password = document.getElementById('signInPassword')?.value || '';
        signInError.textContent = '';
        const result = signIn(username, password);
        if (result.ok) {
            hideAuthOverlay();
            updateCoinDisplay();
            onUserReady();
        } else {
            signInError.textContent = result.error || 'Sign in failed';
        }
    });

    signUpBtn?.addEventListener('click', () => {
        const username = document.getElementById('signUpUsername')?.value || '';
        const password = document.getElementById('signUpPassword')?.value || '';
        signUpError.textContent = '';
        const result = createAccount(username, password);
        if (result.ok) {
            hideAuthOverlay();
            updateCoinDisplay();
            onUserReady();
        } else {
            signUpError.textContent = result.error || 'Sign up failed';
        }
    });
}

function onUserReady() {
    const user = getCurrentUser();
    if (!user) return;
    updateCoinDisplay();
    updateUserInfoDisplay();
    showStartGameOverlay();
}

export function handleStartGame() {
    if (!canAffordGame()) {
        document.getElementById('insufficientCoinsMsg').style.display = 'block';
        return;
    }
    const result = payForGame();
    if (!result.ok) return;
    updateCoinDisplay();
    hideStartGameOverlay();
    resetGameState();
    generateShapes(3);
    updateUI();
    render();
}

export function handlePlayAgain() {
    if (!canAffordGame()) {
        alert('Not enough coins. You need 10 coins to play again.');
        return;
    }
    payForGame();
    updateCoinDisplay();
    hideStartGameOverlay();
    restartGame();
}
