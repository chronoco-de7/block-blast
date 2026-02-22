import { BOARD_SIZE } from './config.js';
import { gameState, boardCanvas, boardCtx, CELL_SIZE } from './state.js';
import { hslToRgba } from './utils.js';
import { drawCell, drawShape, drawBreakingCell } from './draw.js';
import { canPlaceShape } from './board.js';
import { getShapePivot } from './shapeUtils.js';

export { drawShape };

export function drawPlacementPreview(shape, x, y) {
    if (!boardCtx) return;
    if (x < 0 || y < 0 || x >= BOARD_SIZE || y >= BOARD_SIZE) return;

    const matrix = shape.matrix;
    const rows = matrix.length;
    const cols = matrix[0].length;
    const pivot = getShapePivot(shape);
    let canPlace = canPlaceShape(shape, x, y);
    if (x + cols > BOARD_SIZE || y + rows > BOARD_SIZE) canPlace = false;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (matrix[row][col] === 1) {
                const cellX = (x + col) * CELL_SIZE;
                const cellY = (y + row) * CELL_SIZE;
                const isPivot = (row === pivot.row && col === pivot.col);

                if (!canPlace) {
                    boardCtx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                    boardCtx.fillRect(cellX + 2, cellY + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                    boardCtx.strokeStyle = isPivot ? 'rgba(255, 0, 0, 0.9)' : 'rgba(255, 0, 0, 0.6)';
                    boardCtx.lineWidth = isPivot ? 3 : 2;
                    boardCtx.strokeRect(cellX + 2, cellY + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                } else {
                    const primaryColor = hslToRgba(shape.color.primary, 0.35);
                    const secondaryColor = hslToRgba(shape.color.secondary, 0.28);
                    const tertiaryColor = hslToRgba(shape.color.tertiary, 0.2);
                    boardCtx.shadowColor = shape.color.primary;
                    boardCtx.shadowBlur = 4;
                    const gradient = boardCtx.createLinearGradient(cellX, cellY, cellX + CELL_SIZE, cellY + CELL_SIZE);
                    gradient.addColorStop(0, primaryColor);
                    gradient.addColorStop(0.4, secondaryColor);
                    gradient.addColorStop(1, tertiaryColor);
                    const highlight = boardCtx.createLinearGradient(cellX, cellY, cellX + CELL_SIZE * 0.6, cellY + CELL_SIZE * 0.6);
                    highlight.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
                    highlight.addColorStop(0.4, 'rgba(255, 255, 255, 0.02)');
                    highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    boardCtx.fillStyle = gradient;
                    boardCtx.fillRect(cellX + 2, cellY + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                    boardCtx.fillStyle = highlight;
                    boardCtx.fillRect(cellX + 2, cellY + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                    boardCtx.shadowBlur = 0;
                    boardCtx.strokeStyle = isPivot ? hslToRgba(shape.color.primary, 0.7) : hslToRgba(shape.color.primary, 0.45);
                    boardCtx.lineWidth = isPivot ? 3 : 2;
                    boardCtx.strokeRect(cellX + 2, cellY + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                }
            }
        }
    }
}

function drawHintPosition() {
    if (!boardCtx || gameState.shapes.length === 0) return;
    const shape = gameState.shapes[0];
    const pivot = getShapePivot(shape);
    const matrix = shape.matrix;
    const rows = matrix.length;
    const cols = matrix[0].length;

    for (let y = 0; y <= BOARD_SIZE - rows; y++) {
        for (let x = 0; x <= BOARD_SIZE - cols; x++) {
            if (canPlaceShape(shape, x, y)) {
                for (let row = 0; row < rows; row++) {
                    for (let col = 0; col < cols; col++) {
                        if (matrix[row][col] === 1) {
                            const cellX = (x + col) * CELL_SIZE;
                            const cellY = (y + row) * CELL_SIZE;
                            boardCtx.shadowColor = 'rgba(0, 220, 255, 0.5)';
                            boardCtx.shadowBlur = 8;
                            boardCtx.fillStyle = 'rgba(0, 200, 255, 0.25)';
                            boardCtx.fillRect(cellX + 2, cellY + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                            boardCtx.shadowBlur = 0;
                            boardCtx.strokeStyle = (row === pivot.row && col === pivot.col) ? 'rgba(0, 230, 255, 0.95)' : 'rgba(0, 220, 255, 0.7)';
                            boardCtx.lineWidth = (row === pivot.row && col === pivot.col) ? 3 : 2;
                            boardCtx.strokeRect(cellX + 2, cellY + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                        }
                    }
                }
                return;
            }
        }
    }
}

export function render() {
    if (!boardCtx || !boardCanvas) return;

    boardCtx.fillStyle = '#060a12';
    boardCtx.fillRect(0, 0, boardCanvas.width, boardCanvas.height);

    boardCtx.strokeStyle = 'rgba(0, 220, 255, 0.25)';
    boardCtx.lineWidth = 1;
    boardCtx.shadowColor = 'rgba(0, 200, 255, 0.4)';
    boardCtx.shadowBlur = 4;
    for (let i = 0; i <= BOARD_SIZE; i++) {
        boardCtx.beginPath();
        boardCtx.moveTo(i * CELL_SIZE, 0);
        boardCtx.lineTo(i * CELL_SIZE, BOARD_SIZE * CELL_SIZE);
        boardCtx.stroke();
        boardCtx.beginPath();
        boardCtx.moveTo(0, i * CELL_SIZE);
        boardCtx.lineTo(BOARD_SIZE * CELL_SIZE, i * CELL_SIZE);
        boardCtx.stroke();
    }
    boardCtx.shadowBlur = 0;

    const clearingLines = gameState.clearingLines;
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = gameState.board[row][col];
            if (cell !== 0 && cell !== null) {
                const isInClearingRow = clearingLines.rows.includes(row);
                const isInClearingCol = clearingLines.cols.includes(col);
                const isClearing = isInClearingRow || isInClearingCol;
                if (isClearing && clearingLines.isAnimating) {
                    drawBreakingCell(boardCtx, col * CELL_SIZE, row * CELL_SIZE, cell.color, clearingLines.animationTime);
                } else {
                    drawCell(boardCtx, col * CELL_SIZE, row * CELL_SIZE, cell.color);
                }
            }
        }
    }

    if (gameState.hintActive) drawHintPosition();
}
