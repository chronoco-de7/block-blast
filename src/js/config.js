// Game configuration constants
export const BOARD_SIZE = 10;
export const PREVIEW_CELL_SIZE = 20;

// Chance of 5-block shapes per difficulty (0–1)
export const FIVE_BLOCK_RATE = {
    easy: 0,
    normal: 0.05,
    hard: 0.1
};

// Shape definitions with complexity tier (0=simplest, 4=most complex)
// Complexity based on block count: 1→0, 2→1, 3→2, 4→3, 5+→4
export const SHAPE_DEFINITIONS = [
    { matrix: [[1]], complexity: 0 },
    { matrix: [[1, 1]], complexity: 1 },
    { matrix: [[1], [1]], complexity: 1 },
    { matrix: [[1, 0], [1, 1]], complexity: 2 },
    { matrix: [[0, 1], [1, 1]], complexity: 2 },
    { matrix: [[1, 1], [1, 0]], complexity: 2 },
    { matrix: [[1, 1], [0, 1]], complexity: 2 },
    { matrix: [[1, 1, 1]], complexity: 2 },
    { matrix: [[1], [1], [1]], complexity: 2 },
    { matrix: [[1, 1, 1], [0, 1, 0]], complexity: 3 },
    { matrix: [[0, 1, 0], [1, 1, 1]], complexity: 3 },
    { matrix: [[1, 0], [1, 1], [1, 0]], complexity: 3 },
    { matrix: [[0, 1], [1, 1], [0, 1]], complexity: 3 },
    { matrix: [[1, 1], [1, 1]], complexity: 3 },
    { matrix: [[1, 1, 1, 1]], complexity: 3 },
    { matrix: [[1], [1], [1], [1]], complexity: 3 },
    { matrix: [[1, 1, 0], [0, 1, 1]], complexity: 3 },
    { matrix: [[0, 1, 1], [1, 1, 0]], complexity: 3 },
    { matrix: [[1, 0, 0], [1, 1, 1]], complexity: 3 },
    { matrix: [[0, 0, 1], [1, 1, 1]], complexity: 3 },
    { matrix: [[1, 1, 1], [1, 0, 0]], complexity: 3 },
    { matrix: [[1, 1, 1], [0, 0, 1]], complexity: 3 },
    // Additional 5-block shapes
    { matrix: [[0, 1, 0], [1, 1, 1], [0, 1, 0]], complexity: 4 },
    { matrix: [[1, 0, 1], [1, 1, 1]], complexity: 4 },
    { matrix: [[1, 1, 1], [1, 0, 1]], complexity: 4 },
    { matrix: [[1, 1, 0], [0, 1, 1], [0, 1, 0]], complexity: 4 },
    { matrix: [[0, 1, 1], [1, 1, 0], [0, 1, 0]], complexity: 4 },
    { matrix: [[1, 1], [1, 1], [1, 0]], complexity: 4 },
    { matrix: [[1, 1], [1, 1], [0, 1]], complexity: 4 },
    { matrix: [[1, 0, 0], [1, 1, 0], [0, 1, 1]], complexity: 4 },
    { matrix: [[0, 0, 1], [0, 1, 1], [1, 1, 0]], complexity: 4 },
    { matrix: [[1, 1, 1, 1], [0, 0, 1, 0]], complexity: 4 },
    { matrix: [[0, 0, 1, 0], [1, 1, 1, 1]], complexity: 4 },
    { matrix: [[0, 1, 1], [1, 1, 0], [1, 0, 0]], complexity: 4 },
    { matrix: [[1, 1, 0], [0, 1, 1], [0, 0, 1]], complexity: 4 },
    { matrix: [[1, 1, 1], [1, 0, 0], [1, 1, 1]], complexity: 4 },
    { matrix: [[1, 1, 1], [0, 0, 1], [1, 1, 1]], complexity: 4 },
    { matrix: [[1, 1, 1, 1], [0, 0, 0, 1]], complexity: 4 },
    { matrix: [[1, 1, 1, 1], [1, 0, 0, 0]], complexity: 4 },
    { matrix: [[1, 0, 0, 0], [1, 1, 1, 1]], complexity: 4 },
    { matrix: [[0, 0, 0, 1], [1, 1, 1, 1]], complexity: 4 }
];
