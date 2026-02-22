import { gameState } from './state.js';
import { callbacks } from './state.js';
import { generateShapes } from './shapes.js';
import { render } from './render.js';
import { checkGameOver, updateUI } from './game.js';
import { onDragMove, onDragEnd, removeDragGhost } from './drag.js';
import { initGame } from './game.js';
import { getSettings, getDailyChallenge } from './storage.js';
import {
    navigateToPage, clearAllScores, resetSettings, saveSettings,
    toggleSetting, selectDifficulty, applySettings
} from './pages.js';
import { showScreenshot, closeScreenshotModal, togglePause, showHint, hideHint, restartGame } from './game.js';
import { renderShapes } from './shapes.js';

// Wire callbacks
callbacks.generateShapes = generateShapes;
callbacks.renderShapes = renderShapes;
callbacks.checkGameOver = checkGameOver;
callbacks.updateUI = updateUI;
callbacks.render = render;

function closeApp() {
    if (window.electronAPI?.closeApp) window.electronAPI.closeApp();
    else if (typeof window.close === 'function') window.close();
}

function setupEventListeners() {
    document.getElementById('hintBtn')?.addEventListener('click', () => {
        if (gameState.isPaused || gameState.isGameOver) return;
        gameState.hintActive = !gameState.hintActive;
        gameState.hintActive ? showHint() : hideHint();
    });

    document.getElementById('pauseBtn')?.addEventListener('click', () => {
        if (gameState.isGameOver) return;
        togglePause();
    });

    document.getElementById('resumeBtn')?.addEventListener('click', togglePause);
    document.getElementById('restartBtn')?.addEventListener('click', restartGame);

    document.addEventListener('mousemove', (e) => {
        if (gameState.dragging) onDragMove(e.clientX, e.clientY);
    }, { passive: true });

    document.addEventListener('mouseup', (e) => {
        if (gameState.dragging) {
            onDragEnd(e.clientX, e.clientY);
            e.preventDefault();
        }
    });

    document.addEventListener('touchmove', (e) => {
        if (gameState.dragging && e.touches.length === 1) {
            onDragMove(e.touches[0].clientX, e.touches[0].clientY);
            e.preventDefault();
        }
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
        if (gameState.dragging && e.changedTouches?.length > 0) {
            const t = e.changedTouches[0];
            onDragEnd(t.clientX, t.clientY);
            e.preventDefault();
        }
    }, { passive: false });

    document.addEventListener('touchcancel', () => {
        if (gameState.dragging) {
            gameState.dragging.shapeItem?.classList.remove('dragging');
            removeDragGhost();
            gameState.dragging = null;
            render();
        }
    });

    document.addEventListener('mouseleave', () => {
        if (gameState.dragging) {
            gameState.dragging.shapeItem?.classList.remove('dragging');
            removeDragGhost();
            gameState.dragging = null;
            render();
        }
    });

    document.addEventListener('dragover', e => e.preventDefault());
    document.addEventListener('drop', e => e.preventDefault());

    document.getElementById('screenshotModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'screenshotModal') closeScreenshotModal();
    });
}

// Expose globals for onclick handlers
window.navigateToPage = navigateToPage;
window.clearAllScores = clearAllScores;
window.resetSettings = resetSettings;
window.saveSettings = saveSettings;
window.startChallenge = () => {
    navigateToPage('game');
    if (gameState.isGameOver || gameState.score === 0) restartGame();
};
window.toggleSetting = toggleSetting;
window.selectDifficulty = selectDifficulty;
window.showScreenshot = showScreenshot;
window.closeScreenshotModal = closeScreenshotModal;
window.closeApp = closeApp;

// Init
document.addEventListener('DOMContentLoaded', () => {
    try {
        initGame(setupEventListeners);
        const settings = getSettings();
        applySettings(settings);
        getDailyChallenge();
    } catch (err) {
        console.error('Game init error:', err);
    }
});
