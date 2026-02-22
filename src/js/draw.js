// Pure drawing functions (no game logic)
import { gameState, boardCanvas, boardCtx, CELL_SIZE } from './state.js';
import { BOARD_SIZE } from './config.js';
import { hslToRgba } from './utils.js';

export function drawCell(ctx, x, y, color) {
    const pad = 2;
    const sz = CELL_SIZE - 4;
    const cx = x + pad;
    const cy = y + pad;

    ctx.shadowColor = color.primary;
    ctx.shadowBlur = 8;
    ctx.globalAlpha = 1;

    const gradient = ctx.createLinearGradient(cx, cy, cx + sz, cy + sz);
    gradient.addColorStop(0, color.primary);
    gradient.addColorStop(0.4, color.secondary);
    gradient.addColorStop(1, color.tertiary);
    const highlight = ctx.createLinearGradient(cx, cy, cx + sz * 0.6, cy + sz * 0.6);
    highlight.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    highlight.addColorStop(0.4, 'rgba(255, 255, 255, 0.05)');
    highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(cx, cy, sz, sz);
    ctx.fillStyle = highlight;
    ctx.fillRect(cx, cy, sz, sz);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = color.primary;
    ctx.lineWidth = 2;
    ctx.strokeRect(cx, cy, sz, sz);
}

export function drawShape(ctx, matrix, color, offsetX, offsetY, size) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const cellSize = size / Math.max(rows, cols);

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (matrix[row][col] === 1) {
                const x = offsetX + col * cellSize;
                const y = offsetY + row * cellSize;
                const pad = 2;
                const sz = cellSize - 4;
                const cx = x + pad;
                const cy = y + pad;

                ctx.shadowColor = color.primary;
                ctx.shadowBlur = 6;
                const gradient = ctx.createLinearGradient(cx, cy, cx + sz, cy + sz);
                gradient.addColorStop(0, color.primary);
                gradient.addColorStop(0.4, color.secondary);
                gradient.addColorStop(1, color.tertiary);
                const highlight = ctx.createLinearGradient(cx, cy, cx + sz * 0.6, cy + sz * 0.6);
                highlight.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
                highlight.addColorStop(0.4, 'rgba(255, 255, 255, 0.05)');
                highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(cx, cy, sz, sz);
                ctx.fillStyle = highlight;
                ctx.fillRect(cx, cy, sz, sz);
                ctx.shadowBlur = 0;
                ctx.strokeStyle = color.primary;
                ctx.lineWidth = 2;
                ctx.strokeRect(cx, cy, sz, sz);
            }
        }
    }
}

export function drawBreakingCell(ctx, x, y, color, progress) {
    const shakeIntensity = Math.sin(progress * Math.PI * 8) * (1 - progress) * 8;
    const offsetX = (Math.random() - 0.5) * shakeIntensity * 2;
    const offsetY = (Math.random() - 0.5) * shakeIntensity * 2;
    const scale = 1 - progress * 0.3;
    const opacity = 1 - progress;

    ctx.save();
    ctx.translate(x + CELL_SIZE / 2 + offsetX, y + CELL_SIZE / 2 + offsetY);
    ctx.scale(scale, scale);
    ctx.globalAlpha = opacity;

    const cellX = -CELL_SIZE / 2 + 2;
    const cellY = -CELL_SIZE / 2 + 2;
    const cellSize = CELL_SIZE - 4;
    const gradient = ctx.createLinearGradient(cellX, cellY, cellX + cellSize, cellY + cellSize);
    gradient.addColorStop(0, color.primary);
    gradient.addColorStop(0.5, color.secondary);
    gradient.addColorStop(1, color.tertiary);
    ctx.fillStyle = gradient;
    ctx.fillRect(cellX, cellY, cellSize, cellSize);
    ctx.strokeStyle = color.primary;
    ctx.lineWidth = 2 + progress * 3;
    ctx.strokeRect(cellX, cellY, cellSize, cellSize);

    if (progress > 0.3) {
        ctx.strokeStyle = 'rgba(255, 255, 255, ' + (progress * 0.8) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
            const startX = cellX + Math.random() * cellSize;
            const startY = cellY + Math.random() * cellSize;
            const endX = cellX + Math.random() * cellSize;
            const endY = cellY + Math.random() * cellSize;
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
        }
        ctx.stroke();
    }
    ctx.restore();
}
