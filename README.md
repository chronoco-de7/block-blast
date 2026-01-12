# Block Blast Puzzle Game

A drag-and-drop puzzle game built with JavaScript, HTML, and CSS.

## Features

- **Drag & Drop**: Place shapes on the game board by dragging and dropping
- **Game Info**: Display score, lines cleared, and current level at the top
- **Shape Selection**: View upcoming blocks at the bottom of the screen
- **Game Controls**:
  - **Hint Button**: Shows where the next shape can be placed (transparent overlay)
  - **Pause/Resume Button**: Pause or resume the game
- **Game Over**: When no shapes can be placed, displays a congratulation modal with final score and restart option
- **Line Clearing**: Complete rows or columns to clear them and score points

## How to Play

1. Open `index.html` in a web browser
2. Drag shapes from the bottom container and drop them onto the game board
3. Try to fill complete rows or columns to clear them
4. Use the Hint button to see where shapes can be placed
5. Game ends when no shapes can be placed anywhere
6. Click "Play Again" to restart

## UI Design

- **Dark Theme**: Dark gradient background with blue accents
- **Smooth Gradients**: Color gradients on blocks and UI elements (2-3 similar colors)
- **No Box Shadow**: Clean design without shadows
- **No Transform**: Game info and buttons don't use CSS transforms
- **Transparent Hints**: Hint overlay uses transparency

## Scoring

- Points are awarded for placing blocks (based on current level)
- Bonus points for clearing lines
- Level increases every 10 lines cleared

## File Structure

- `index.html` - Main HTML structure
- `style.css` - Dark theme styling with gradients
- `script.js` - Game logic and drag & drop functionality

