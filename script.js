// Game configuration
const BOARD_SIZE = 10;
const CELL_SIZE = 36;
const PREVIEW_CELL_SIZE = 20; // Smaller size for preview shapes

// Game state
let gameState = {
    board: [],
    shapes: [],
    currentShape: null,
    score: 0,
    lines: 0,
    level: 1,
    isPaused: false,
    isGameOver: false,
    hintActive: false,
    dragging: null,
    dragOffset: { x: 0, y: 0 },
    clearingLines: {
        rows: [],
        cols: [],
        animationTime: 0,
        isAnimating: false
    }
};

// Drag ghost element
let dragGhost = null;

// Shape definitions (Tetris-like blocks)
const SHAPE_DEFINITIONS = [
    // Single block
    [[[1]]],
    // Two blocks horizontal
    [[[1, 1]]],
    // Two blocks vertical
    [[[1], [1]]],
    // L-shapes
    [[[1, 0], [1, 1]]],
    [[[0, 1], [1, 1]]],
    [[[1, 1], [1, 0]]],
    [[[1, 1], [0, 1]]],
    // Three blocks
    [[[1, 1, 1]]],
    [[[1], [1], [1]]],
    // T-shapes
    [[[1, 1, 1], [0, 1, 0]]],
    [[[0, 1, 0], [1, 1, 1]]],
    [[[1, 0], [1, 1], [1, 0]]],
    [[[0, 1], [1, 1], [0, 1]]],
    // Square 2x2
    [[[1, 1], [1, 1]]],
    // Four blocks line
    [[[1, 1, 1, 1]]],
    [[[1], [1], [1], [1]]],
    // Z-shapes
    [[[1, 1, 0], [0, 1, 1]]],
    [[[0, 1, 1], [1, 1, 0]]],
    // Cross
    [[[0, 1, 0], [1, 1, 1], [0, 1, 0]]],
    // Large L
    [[[1, 0, 0], [1, 1, 1]]],
    [[[0, 0, 1], [1, 1, 1]]],
    [[[1, 1, 1], [1, 0, 0]]],
    [[[1, 1, 1], [0, 0, 1]]]
];

// Canvas and context
let boardCanvas, boardCtx;
let shapeCanvases = [];

// Initialize game
function initGame() {
    // Initialize board
    gameState.board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
    
    // Get canvas
    boardCanvas = document.getElementById('gameBoard');
    boardCtx = boardCanvas.getContext('2d');
    
    // Generate initial shapes
    generateShapes(3);
    
    // Setup event listeners
    setupEventListeners();
    
    // Start game loop
    render();
}

// Generate random shapes
function generateShapes(count) {
    gameState.shapes = [];
    for (let i = 0; i < count; i++) {
        const shapeDef = SHAPE_DEFINITIONS[Math.floor(Math.random() * SHAPE_DEFINITIONS.length)];
        gameState.shapes.push({
            id: i,
            matrix: shapeDef[0], // Extract the 2D matrix from the nested array
            color: generateColor()
        });
    }
    renderShapes();
}

// Generate random color with gradient
function generateColor() {
    const hues = [
        { h: 200, s: 70, l: 50 }, // Blue
        { h: 280, s: 70, l: 50 }, // Purple
        { h: 320, s: 70, l: 50 }, // Pink
        { h: 160, s: 70, l: 50 }, // Cyan
        { h: 40, s: 70, l: 50 },  // Orange
        { h: 120, s: 70, l: 50 }  // Green
    ];
    const hue = hues[Math.floor(Math.random() * hues.length)];
    return {
        primary: `hsl(${hue.h}, ${hue.s}%, ${hue.l}%)`,
        secondary: `hsl(${hue.h}, ${hue.s}%, ${hue.l - 10}%)`,
        tertiary: `hsl(${hue.h}, ${hue.s}%, ${hue.l - 20}%)`
    };
}

// Render shapes in the bottom container
function renderShapes() {
    const shapesList = document.getElementById('shapesList');
    shapesList.innerHTML = '';
    shapeCanvases = [];
    
    gameState.shapes.forEach((shape, index) => {
        const shapeItem = document.createElement('div');
        shapeItem.className = 'shape-item';
        shapeItem.dataset.shapeIndex = index;
        
        const canvas = document.createElement('canvas');
        canvas.className = 'shape-canvas';
        
        const matrix = shape.matrix;
        const cols = matrix[0].length;
        const rows = matrix.length;
        const size = Math.max(cols, rows);
        
        // Use smaller cell size for preview
        canvas.width = size * PREVIEW_CELL_SIZE;
        canvas.height = size * PREVIEW_CELL_SIZE;
        
        const ctx = canvas.getContext('2d');
        // Clear canvas with transparent background
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawShape(ctx, matrix, shape.color, 0, 0, size * PREVIEW_CELL_SIZE);
        
        shapeItem.appendChild(canvas);
        shapesList.appendChild(shapeItem);
        shapeCanvases.push(canvas);
        
        // Make draggable
        setupDragAndDrop(shapeItem, shape, index);
    });
}

// Create drag ghost element
function createDragGhost(shape) {
    // Remove existing ghost if any
    if (dragGhost) {
        dragGhost.remove();
    }
    
    dragGhost = document.createElement('div');
    dragGhost.className = 'drag-ghost';
    dragGhost.style.display = 'block';
    dragGhost.style.position = 'fixed';
    dragGhost.style.pointerEvents = 'none';
    dragGhost.style.zIndex = '1000';
    dragGhost.style.opacity = '0.8';
    dragGhost.style.cursor = 'grabbing';
    
    const canvas = document.createElement('canvas');
    const matrix = shape.matrix;
    const cols = matrix[0].length;
    const rows = matrix.length;
    const size = Math.max(cols, rows);
    const pivot = getShapePivot(shape);
    
    canvas.width = size * CELL_SIZE;
    canvas.height = size * CELL_SIZE;
    
    const ctx = canvas.getContext('2d');
    // Clear canvas and draw shape
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawShape(ctx, matrix, shape.color, 0, 0, size * CELL_SIZE);
    
    // Draw pivot marker (small circle at pivot cell center)
    const cellSize = size * CELL_SIZE / Math.max(rows, cols);
    const pivotX = pivot.col * cellSize + cellSize / 2;
    const pivotY = pivot.row * cellSize + cellSize / 2;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    dragGhost.appendChild(canvas);
    document.body.appendChild(dragGhost);
    
    return dragGhost;
}

// Get pivot point for shape (center of shape)
function getShapePivot(shape) {
    const matrix = shape.matrix;
    const rows = matrix.length;
    const cols = matrix[0].length;
    
    // Calculate center of the shape's bounding box
    const centerRow = Math.ceil((rows - 1) / 2);
    const centerCol = Math.ceil((cols - 1) / 2);
    
    // Find the closest cell with value 1 to the center
    let closestRow = centerRow;
    let closestCol = centerCol;
    let minDistance = Infinity;
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (matrix[row][col] === 1) {
                // Calculate distance from center
                const distance = Math.sqrt(
                    Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2)
                );
                if (distance < minDistance) {
                    minDistance = distance;
                    closestRow = row;
                    closestCol = col;
                }
            }
        }
    }
    
    return { row: closestRow, col: closestCol };
}

// Update drag ghost position with pivot alignment
function updateDragGhost(x, y) {
    if (!dragGhost || !gameState.dragging) return;
    
    const shape = gameState.dragging.shape;
    const pivot = getShapePivot(shape);
    const rect = boardCanvas.getBoundingClientRect();
    
    // Calculate which cell the mouse is over
    const mouseX = x - rect.left;
    const mouseY = y - rect.top;
    const cellX = Math.floor(mouseX / CELL_SIZE);
    const cellY = Math.floor(mouseY / CELL_SIZE);
    
    // Calculate where to place the shape (pivot cell aligns with mouse cell)
    const placeX = cellX - pivot.col;
    const placeY = cellY - pivot.row;
    
    // Calculate the pixel position for the ghost
    // The ghost should show the shape at (placeX, placeY) position
    const ghostX = rect.left + placeX * CELL_SIZE;
    const ghostY = rect.top + placeY * CELL_SIZE;
    
    dragGhost.style.display = 'block';
    dragGhost.style.left = ghostX + 'px';
    dragGhost.style.top = ghostY + 'px';
}

// Remove drag ghost
function removeDragGhost() {
    if (dragGhost) {
        dragGhost.remove();
        dragGhost = null;
    }
}

// Setup drag and drop
function setupDragAndDrop(shapeItem, shape, shapeIndex) {
    shapeItem.addEventListener('mousedown', (e) => {
        if (gameState.isPaused || gameState.isGameOver) return;
        
        gameState.dragging = {
            shape: shape,
            shapeIndex: shapeIndex,
            startX: e.clientX,
            startY: e.clientY,
            shapeItem: shapeItem
        };
        
        shapeItem.classList.add('dragging');
        
        // Create and position drag ghost
        createDragGhost(shape);
        updateDragGhost(e.clientX, e.clientY);
        
        const rect = boardCanvas.getBoundingClientRect();
        gameState.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!gameState.dragging) return;
        
        // Update drag ghost position with pivot alignment
        updateDragGhost(e.clientX, e.clientY);
        
        // Update board to show placement preview
        const rect = boardCanvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const x = Math.floor(mouseX / CELL_SIZE);
        const y = Math.floor(mouseY / CELL_SIZE);
        
        // Calculate placement position based on pivot
        const shape = gameState.dragging.shape;
        const pivot = getShapePivot(shape);
        const placeX = x - pivot.col;
        const placeY = y - pivot.row;
        
        // Redraw board with preview
        render();
        
        if (placeX >= 0 && placeY >= 0 && placeX < BOARD_SIZE && placeY < BOARD_SIZE) {
            drawPlacementPreview(shape, placeX, placeY);
        }
        
        e.preventDefault();
    });
    
    document.addEventListener('mouseup', (e) => {
        if (!gameState.dragging) return;
        
        const rect = boardCanvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const cellX = Math.floor(mouseX / CELL_SIZE);
        const cellY = Math.floor(mouseY / CELL_SIZE);
        
        // Calculate placement position based on pivot
        const shape = gameState.dragging.shape;
        const pivot = getShapePivot(shape);
        const placeX = cellX - pivot.col;
        const placeY = cellY - pivot.row;
        
        // Only place if dropped on the board and position is valid
        if (placeX >= 0 && placeY >= 0 && placeX < BOARD_SIZE && placeY < BOARD_SIZE) {
            placeShape(gameState.dragging.shapeIndex, placeX, placeY);
        }
        
        // Clean up drag state
        if (gameState.dragging.shapeItem) {
            gameState.dragging.shapeItem.classList.remove('dragging');
        }
        removeDragGhost();
        gameState.dragging = null;
        render();
        
        e.preventDefault();
    });
}

// Check if shape can be placed
function canPlaceShape(shape, x, y) {
    const matrix = shape.matrix;
    const rows = matrix.length;
    const cols = matrix[0].length;
    
    if (x + cols > BOARD_SIZE || y + rows > BOARD_SIZE) {
        return false;
    }
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (matrix[row][col] === 1) {
                if (gameState.board[y + row][x + col] !== 0) {
                    return false;
                }
            }
        }
    }
    
    return true;
}

// Place shape on board
function placeShape(shapeIndex, x, y) {
    if (gameState.isPaused || gameState.isGameOver) return;
    
    const shape = gameState.shapes[shapeIndex];
    if (!shape) return;
    
    if (!canPlaceShape(shape, x, y)) {
        checkGameOver();
        return;
    }
    
    // Calculate blocks placed for score
    const blocksPlaced = shape.matrix.flat().filter(cell => cell === 1).length;
    
    // Place the shape
    const matrix = shape.matrix;
    const rows = matrix.length;
    const cols = matrix[0].length;
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (matrix[row][col] === 1) {
                gameState.board[y + row][x + col] = {
                    color: shape.color,
                    permanent: true
                };
            }
        }
    }
    
    // Remove used shape
    gameState.shapes.splice(shapeIndex, 1);
    
    // Check for completed lines/columns
    const linesCleared = clearLines();
    
    // Update score (points for placing blocks + bonus for clearing lines)
    gameState.score += blocksPlaced * gameState.level * 10;
    if (linesCleared > 0) {
        gameState.score += linesCleared * gameState.level * 100;
    }
    
    // Generate new shape if needed
    if (gameState.shapes.length === 0) {
        generateShapes(3);
    } else {
        renderShapes();
    }
    
    // Hide hint if active
    if (gameState.hintActive) {
        gameState.hintActive = false;
        hideHint();
    }
    
    updateUI();
    render();
}

// Clear completed lines and columns
// Find lines to clear
function findLinesToClear() {
    const rowsToClear = [];
    const colsToClear = [];
    
    // Check rows
    for (let row = 0; row < BOARD_SIZE; row++) {
        let isFull = true;
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (gameState.board[row][col] === 0 || !gameState.board[row][col]?.permanent) {
                isFull = false;
                break;
            }
        }
        if (isFull) {
            rowsToClear.push(row);
        }
    }
    
    // Check columns
    for (let col = 0; col < BOARD_SIZE; col++) {
        let isFull = true;
        for (let row = 0; row < BOARD_SIZE; row++) {
            if (gameState.board[row][col] === 0 || !gameState.board[row][col]?.permanent) {
                isFull = false;
                break;
            }
        }
        if (isFull) {
            colsToClear.push(col);
        }
    }
    
    return { rowsToClear, colsToClear };
}

// Clear lines with shake/breaking effect
function clearLines() {
    const { rowsToClear, colsToClear } = findLinesToClear();
    const clearedCount = rowsToClear.length + colsToClear.length;
    
    if (clearedCount === 0) {
        return 0;
    }
    
    // Start animation
    gameState.clearingLines.rows = rowsToClear;
    gameState.clearingLines.cols = colsToClear;
    gameState.clearingLines.isAnimating = true;
    gameState.clearingLines.animationTime = 0;
    
    // Add shake class to board
    const boardContainer = document.querySelector('.game-board-container');
    boardContainer.classList.add('shake');
    
    // Animate and clear after shake effect
    animateClearing(() => {
        // Clear the rows
        rowsToClear.forEach(row => {
            for (let col = 0; col < BOARD_SIZE; col++) {
                gameState.board[row][col] = 0;
            }
        });
        
        // Clear the columns
        colsToClear.forEach(col => {
            for (let row = 0; row < BOARD_SIZE; row++) {
                gameState.board[row][col] = 0;
            }
        });
        
        // Remove shake class
        boardContainer.classList.remove('shake');
        
        // Update stats
        gameState.lines += clearedCount;
        gameState.level = Math.floor(gameState.lines / 10) + 1;
        updateUI();
        
        gameState.clearingLines.isAnimating = false;
        render();
    });
    
    return clearedCount;
}

// Animate clearing effect
function animateClearing(callback) {
    const duration = 600; // 600ms animation
    const startTime = performance.now();
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        gameState.clearingLines.animationTime = progress;
        
        // Update render during animation
        render();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            callback();
        }
    }
    
    requestAnimationFrame(animate);
}

// Check if game is over
function checkGameOver() {
    // Check if any shape can be placed anywhere
    for (let shapeIndex = 0; shapeIndex < gameState.shapes.length; shapeIndex++) {
        const shape = gameState.shapes[shapeIndex];
        for (let y = 0; y <= BOARD_SIZE - shape.matrix.length; y++) {
            for (let x = 0; x <= BOARD_SIZE - shape.matrix[0].length; x++) {
                if (canPlaceShape(shape, x, y)) {
                    return; // Game can continue
                }
            }
        }
    }
    
    // No shapes can be placed
    gameState.isGameOver = true;
    showGameOverModal();
}

// Show game over modal
function showGameOverModal() {
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('finalLines').textContent = gameState.lines;
    document.getElementById('gameOverModal').classList.add('show');
}

// Restart game
function restartGame() {
    // Clean up drag state
    removeDragGhost();
    
    // Remove shake class if present
    const boardContainer = document.querySelector('.game-board-container');
    if (boardContainer) {
        boardContainer.classList.remove('shake');
    }
    
    gameState = {
        board: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0)),
        shapes: [],
        currentShape: null,
        score: 0,
        lines: 0,
        level: 1,
        isPaused: false,
        isGameOver: false,
        hintActive: false,
        dragging: null,
        dragOffset: { x: 0, y: 0 },
        clearingLines: {
            rows: [],
            cols: [],
            animationTime: 0,
            isAnimating: false
        }
    };
    
    generateShapes(3);
    updateUI();
    document.getElementById('gameOverModal').classList.remove('show');
    render();
}


// Update UI elements
function updateUI() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('lines').textContent = gameState.lines;
    document.getElementById('level').textContent = gameState.level;
}

// Helper to convert HSL to RGBA
function hslToRgba(hslString, alpha) {
    const match = hslString.match(/\d+/g);
    if (!match || match.length < 3) return `rgba(74, 144, 226, ${alpha})`;
    
    const h = parseInt(match[0]) / 360;
    const s = parseInt(match[1]) / 100;
    const l = parseInt(match[2]) / 100;
    
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    
    return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`;
}

// Draw placement preview on board
function drawPlacementPreview(shape, x, y) {
    if (x < 0 || y < 0 || x >= BOARD_SIZE || y >= BOARD_SIZE) return;
    
    const matrix = shape.matrix;
    const rows = matrix.length;
    const cols = matrix[0].length;
    const pivot = getShapePivot(shape);
    
    // Check bounds and placement validity
    let canPlace = canPlaceShape(shape, x, y);
    if (x + cols > BOARD_SIZE || y + rows > BOARD_SIZE) {
        canPlace = false;
    }
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (matrix[row][col] === 1) {
                const cellX = (x + col) * CELL_SIZE;
                const cellY = (y + row) * CELL_SIZE;
                const isPivot = (row === pivot.row && col === pivot.col);
                
                if (!canPlace) {
                    // Draw invalid placement (red tint)
                    boardCtx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                    boardCtx.fillRect(cellX + 2, cellY + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                    
                    // Highlight pivot cell more prominently
                    boardCtx.strokeStyle = isPivot ? 'rgba(255, 0, 0, 0.9)' : 'rgba(255, 0, 0, 0.6)';
                    boardCtx.lineWidth = isPivot ? 3 : 2;
                    boardCtx.strokeRect(cellX + 2, cellY + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                } else {
                    // Draw valid placement preview
                    const primaryColor = hslToRgba(shape.color.primary, 0.5);
                    const secondaryColor = hslToRgba(shape.color.secondary, 0.4);
                    const tertiaryColor = hslToRgba(shape.color.tertiary, 0.3);
                    
                    const gradient = boardCtx.createLinearGradient(cellX, cellY, cellX + CELL_SIZE, cellY + CELL_SIZE);
                    gradient.addColorStop(0, primaryColor);
                    gradient.addColorStop(0.5, secondaryColor);
                    gradient.addColorStop(1, tertiaryColor);
                    
                    boardCtx.fillStyle = gradient;
                    boardCtx.fillRect(cellX + 2, cellY + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                    
                    // Highlight pivot cell more prominently
                    boardCtx.strokeStyle = isPivot ? hslToRgba(shape.color.primary, 0.9) : hslToRgba(shape.color.primary, 0.6);
                    boardCtx.lineWidth = isPivot ? 3 : 2;
                    boardCtx.strokeRect(cellX + 2, cellY + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                }
            }
        }
    }
}

// Render game board
function render() {
    if (!boardCtx) return;
    
    // Clear canvas
    boardCtx.fillStyle = '#0a0e1a';
    boardCtx.fillRect(0, 0, boardCanvas.width, boardCanvas.height);
    
    // Draw grid
    boardCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    boardCtx.lineWidth = 1;
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
    
    // Draw placed blocks
    const clearingLines = gameState.clearingLines;
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = gameState.board[row][col];
            if (cell !== 0 && cell !== null) {
                // Check if this cell is in a line being cleared
                const isInClearingRow = clearingLines.rows.includes(row);
                const isInClearingCol = clearingLines.cols.includes(col);
                const isClearing = isInClearingRow || isInClearingCol;
                
                if (isClearing && clearingLines.isAnimating) {
                    // Draw breaking effect
                    drawBreakingCell(boardCtx, col * CELL_SIZE, row * CELL_SIZE, cell.color, clearingLines.animationTime);
                } else {
                    drawCell(boardCtx, col * CELL_SIZE, row * CELL_SIZE, cell.color);
                }
            }
        }
    }
    
    // Draw hint positions
    if (gameState.hintActive && gameState.shapes.length > 0) {
        drawHintPosition();
    }
}

// Draw a single cell
function drawCell(ctx, x, y, color) {
    const gradient = ctx.createLinearGradient(x, y, x + CELL_SIZE, y + CELL_SIZE);
    gradient.addColorStop(0, color.primary);
    gradient.addColorStop(0.5, color.secondary);
    gradient.addColorStop(1, color.tertiary);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
    
    // Add border
    ctx.strokeStyle = color.primary;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
}

// Draw breaking cell with shake effect
function drawBreakingCell(ctx, x, y, color, progress) {
    // Calculate shake offset
    const shakeIntensity = Math.sin(progress * Math.PI * 8) * (1 - progress) * 8;
    const offsetX = (Math.random() - 0.5) * shakeIntensity * 2;
    const offsetY = (Math.random() - 0.5) * shakeIntensity * 2;
    
    // Calculate scale and opacity for breaking effect
    const scale = 1 - progress * 0.3;
    const opacity = 1 - progress;
    
    ctx.save();
    ctx.translate(x + CELL_SIZE / 2 + offsetX, y + CELL_SIZE / 2 + offsetY);
    ctx.scale(scale, scale);
    ctx.globalAlpha = opacity;
    
    // Draw cell with gradient
    const cellX = -CELL_SIZE / 2 + 2;
    const cellY = -CELL_SIZE / 2 + 2;
    const cellSize = CELL_SIZE - 4;
    
    const gradient = ctx.createLinearGradient(cellX, cellY, cellX + cellSize, cellY + cellSize);
    gradient.addColorStop(0, color.primary);
    gradient.addColorStop(0.5, color.secondary);
    gradient.addColorStop(1, color.tertiary);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(cellX, cellY, cellSize, cellSize);
    
    // Add border with glowing effect
    ctx.strokeStyle = color.primary;
    ctx.lineWidth = 2 + progress * 3;
    ctx.strokeRect(cellX, cellY, cellSize, cellSize);
    
    // Draw crack lines
    if (progress > 0.3) {
        ctx.strokeStyle = 'rgba(255, 255, 255, ' + (progress * 0.8) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Random crack pattern
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

// Draw shape
function drawShape(ctx, matrix, color, offsetX, offsetY, size) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const cellSize = size / Math.max(rows, cols);
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (matrix[row][col] === 1) {
                const x = offsetX + col * cellSize;
                const y = offsetY + row * cellSize;
                
                const gradient = ctx.createLinearGradient(x, y, x + cellSize, y + cellSize);
                gradient.addColorStop(0, color.primary);
                gradient.addColorStop(0.5, color.secondary);
                gradient.addColorStop(1, color.tertiary);
                
                ctx.fillStyle = gradient;
                ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
                
                ctx.strokeStyle = color.primary;
                ctx.lineWidth = 2;
                ctx.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
            }
        }
    }
}

// Draw hint position on board with pivot alignment
function drawHintPosition() {
    if (gameState.shapes.length === 0) return;
    
    const shape = gameState.shapes[0];
    const pivot = getShapePivot(shape);
    const matrix = shape.matrix;
    const rows = matrix.length;
    const cols = matrix[0].length;
    
    // Find first valid position (considering pivot)
    // We need to ensure the entire shape fits, accounting for pivot offset
    for (let y = 0; y <= BOARD_SIZE - rows; y++) {
        for (let x = 0; x <= BOARD_SIZE - cols; x++) {
            if (canPlaceShape(shape, x, y)) {
                // Draw hint on canvas with transparent overlay
                for (let row = 0; row < rows; row++) {
                    for (let col = 0; col < cols; col++) {
                        if (matrix[row][col] === 1) {
                            const cellX = (x + col) * CELL_SIZE;
                            const cellY = (y + row) * CELL_SIZE;
                            
                            // Draw transparent hint
                            boardCtx.fillStyle = 'rgba(74, 144, 226, 0.3)';
                            boardCtx.fillRect(cellX + 2, cellY + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                            
                            // Draw hint border (highlight pivot cell more prominently)
                            if (row === pivot.row && col === pivot.col) {
                                boardCtx.strokeStyle = 'rgba(74, 144, 226, 0.9)';
                                boardCtx.lineWidth = 3;
                            } else {
                                boardCtx.strokeStyle = 'rgba(74, 144, 226, 0.6)';
                                boardCtx.lineWidth = 2;
                            }
                            boardCtx.strokeRect(cellX + 2, cellY + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                        }
                    }
                }
                
                return; // Found and drawn, exit
            }
        }
    }
    
    // No valid position found, show overlay anyway
    document.getElementById('hintOverlay').classList.add('active');
}

// Show hint
function showHint() {
    gameState.hintActive = true;
    document.getElementById('hintOverlay').classList.add('active');
    render();
}

// Hide hint
function hideHint() {
    document.getElementById('hintOverlay').classList.remove('active');
    gameState.hintActive = false;
    if (boardCtx) {
        render();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Hint button
    document.getElementById('hintBtn').addEventListener('click', () => {
        if (gameState.isPaused || gameState.isGameOver) return;
        
        gameState.hintActive = !gameState.hintActive;
        if (gameState.hintActive) {
            showHint();
        } else {
            hideHint();
        }
    });
    
    // Pause button
    document.getElementById('pauseBtn').addEventListener('click', () => {
        if (gameState.isGameOver) return;
        
        gameState.isPaused = !gameState.isPaused;
        const pauseBtnText = document.getElementById('pauseBtnText');
        const pauseBtnIcon = document.getElementById('pauseBtn').querySelector('.btn-icon');
        pauseBtnText.textContent = gameState.isPaused ? 'Resume' : 'Pause';
        
        if (gameState.isPaused) {
            pauseBtnIcon.className = 'btn-icon icon-play';
        } else {
            pauseBtnIcon.className = 'btn-icon icon-pause';
        }
    });
    
    // Restart button
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    
    // Handle mouse leaving window during drag
    document.addEventListener('mouseleave', () => {
        if (gameState.dragging) {
            if (gameState.dragging.shapeItem) {
                gameState.dragging.shapeItem.classList.remove('dragging');
            }
            removeDragGhost();
            gameState.dragging = null;
            render();
        }
    });
    
    // Prevent default drag behavior
    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => e.preventDefault());
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', initGame);

