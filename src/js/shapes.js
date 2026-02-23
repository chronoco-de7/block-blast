import { PREVIEW_CELL_SIZE, SHAPE_DEFINITIONS, FIVE_BLOCK_RATE } from './config.js';
import { gameState, shapeCanvases, setShapeCanvases } from './state.js';
import { getSettings } from './storage.js';
import { drawShape } from './draw.js';
import { setupDragAndDrop } from './drag.js';
import { callbacks } from './state.js';

const COLOR_PALETTES = [
    { h: 210, s: 85, l: 55 }, { h: 270, s: 80, l: 60 }, { h: 330, s: 75, l: 65 },
    { h: 180, s: 80, l: 55 }, { h: 25, s: 90, l: 60 }, { h: 140, s: 75, l: 55 },
    { h: 15, s: 85, l: 65 }, { h: 260, s: 70, l: 70 }, { h: 195, s: 85, l: 50 },
    { h: 45, s: 90, l: 60 }, { h: 300, s: 80, l: 60 }, { h: 150, s: 80, l: 50 }
];

export function generateColor() {
    const c = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
    return {
        primary: `hsl(${c.h}, ${c.s}%, ${c.l}%)`,
        secondary: `hsl(${c.h}, ${c.s}%, ${c.l - 8}%)`,
        tertiary: `hsl(${c.h}, ${c.s}%, ${c.l - 15}%)`
    };
}

export { getShapePivot } from './shapeUtils.js';

const FIVE_BLOCK_SHAPES = SHAPE_DEFINITIONS.filter(s => s.complexity === 4);
const NON_FIVE_BLOCK_SHAPES = SHAPE_DEFINITIONS.filter(s => s.complexity < 4);

/** Pick a shape: 5-block rate by difficulty, else random from 1–4 block shapes. */
function pickShapeForLevel() {
    const settings = getSettings();
    const difficulty = settings.difficultyLevel || 'normal';
    const fiveBlockRate = FIVE_BLOCK_RATE[difficulty] ?? FIVE_BLOCK_RATE.normal;

    if (Math.random() < fiveBlockRate && FIVE_BLOCK_SHAPES.length > 0) {
        return FIVE_BLOCK_SHAPES[Math.floor(Math.random() * FIVE_BLOCK_SHAPES.length)];
    }
    return NON_FIVE_BLOCK_SHAPES[Math.floor(Math.random() * NON_FIVE_BLOCK_SHAPES.length)];
}

export function generateShapes(count) {
    gameState.shapes = [];
    for (let i = 0; i < count; i++) {
        const def = pickShapeForLevel();
        gameState.shapes.push({ id: i, matrix: def.matrix, color: generateColor() });
    }
    renderShapes();
    if (!gameState.isGameOver) callbacks.checkGameOver?.();
}

export function renderShapes() {
    const shapesList = document.getElementById('shapesList');
    if (!shapesList) return;
    shapesList.innerHTML = '';
    const canvases = [];

    gameState.shapes.forEach((shape, index) => {
        const shapeItem = document.createElement('div');
        shapeItem.className = 'shape-item';
        shapeItem.dataset.shapeIndex = index;

        const canvas = document.createElement('canvas');
        canvas.className = 'shape-canvas';
        const matrix = shape.matrix;
        const cols = matrix[0].length;
        const rows = matrix.length;
        const cellSize = PREVIEW_CELL_SIZE;
        canvas.width = cols * cellSize;
        canvas.height = rows * cellSize;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawShape(ctx, matrix, shape.color, 0, 0, Math.max(cols, rows) * cellSize);

        shapeItem.appendChild(canvas);
        shapesList.appendChild(shapeItem);
        canvases.push(canvas);
        setupDragAndDrop(shapeItem, shape, index);
    });
    setShapeCanvases(canvases);
}
