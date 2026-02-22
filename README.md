# Block Blast - Neon Glass Edition 🎮

A beautiful, modern block puzzle game with stunning neon glass aesthetics and smooth animations.

![Block Blast Game](assets/screenshot.png)
<!-- To add your screenshot: 
1. Open index.html in your browser (or visit http://localhost:8765)
2. Play a few moves to make the board look interesting
3. Take a screenshot (Cmd+Shift+4 on Mac, Win+Shift+S on Windows)
4. Save it as 'screenshot.png' in this directory
-->

## Features ✨

- **Stunning Neon Glass UI** - Beautiful glassmorphic design with glowing effects
- **Smooth Animations** - Fluid block placement and line-clearing animations
- **Drag & Drop Gameplay** - Intuitive drag-and-drop mechanics with visual feedback
- **Score System** - Track your score, lines cleared, and current level
- **Hint System** - Get help when you're stuck
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- **No Scrolling** - Optimized fixed layout that fits any screen

## How to Play 🎯

1. **Drag blocks** from the "Next Blocks" panel onto the 10×10 grid
2. **Complete rows or columns** to clear them and earn bonus points
3. **Plan ahead** - You can see the next 3 blocks coming
4. **Use hints** when needed - the Hint button shows valid placement positions
5. **Game over** when no more blocks can be placed

## Scoring 💯

- **Block Placement**: Points based on block size × level × 10
- **Line Clears**: Bonus points for each line cleared × level × 100
- **Level Up**: Every 10 lines cleared increases your level

## Controls 🎮

- **Mouse Drag**: Click and drag blocks to place them on the board
- **Hint Button**: Shows where the next block can be placed
- **Pause Button**: Pause/resume the game

## Tech Stack 🛠️

- Pure **Vanilla JavaScript** - No frameworks, just clean JS
- **HTML5 Canvas** - For smooth rendering and animations
- **Modern CSS** - Glassmorphism, gradients, and backdrop filters
- **Electron** - Desktop app framework
- **Responsive Design** - Works on all devices

## Installation & Running 🚀

### Option 1: Electron Desktop App (Recommended)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the app:**
   ```bash
   npm start
   ```

3. **Run in development mode (with DevTools):**
   ```bash
   npm run dev
   ```

4. **Build distributable apps:**
   ```bash
   # Build for current platform
   npm run dist

   # Build for specific platforms
   npm run dist:mac    # macOS
   npm run dist:win    # Windows
   npm run dist:linux  # Linux
   ```

   Built apps will be in the `dist/` directory.

### Option 2: Direct Open (Web Browser)
Simply open `index.html` in your web browser.

### Option 3: Local Server
```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Then visit http://localhost:8000
```

## Project Structure 📁

```
block-blast-v2/
├── index.html              # Main HTML entry
├── main.js                 # Electron main process
├── preload.js              # Electron preload script
├── package.json            # Dependencies and build config
├── src/
│   ├── css/
│   │   └── style.css       # Styles and theming
│   └── js/
│       └── script.js      # Game logic and rendering
├── assets/
│   └── icons/             # UI icons (SVG)
├── build/                  # Electron app icons
├── .gitignore
└── README.md
```

## Browser Support 🌐

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

Requires support for:
- CSS `backdrop-filter`
- CSS `color-mix()`
- HTML5 Canvas
- ES6+ JavaScript

## Customization 🎨

### Colors
The game uses CSS variables defined in `:root`. Edit these in `src/css/style.css`:
```css
:root {
  --bg0: #07162c;
  --bg1: #0b2142;
  --bg2: #0e2a57;
  /* ... more variables */
}
```

### Game Configuration
Modify constants in `src/js/script.js`:
```javascript
const BOARD_SIZE = 10;        // Grid size (10×10)
const CELL_SIZE = 36;         // Cell size in pixels
const PREVIEW_CELL_SIZE = 20; // Preview block size
```

## Building for Distribution 📦

The app uses `electron-builder` for creating distributable packages. Before building:

1. **Optional: Add app icons**
   - Create a `build/` directory
   - Add icons:
     - `build/icon.png` (512x512) - Linux
     - `build/icon.icns` - macOS
     - `build/icon.ico` - Windows
   - If icons are not provided, default Electron icons will be used

2. **Build commands:**
   ```bash
   npm run dist        # Build for current platform
   npm run dist:mac    # Build macOS app (.zip)
   npm run dist:win    # Build Windows portable (.exe)
   npm run dist:linux  # Build Linux AppImage
   ```

3. **Output:** Built applications will be in the `dist/` directory

## System Requirements 💻

- **Node.js** 16+ (for development)
- **npm** or **yarn** (for package management)
- **macOS 10.13+**, **Windows 10+**, or **Linux** (for running Electron app)

## License 📄

This project is open source and available for personal and educational use.

## Credits 🙏

Design inspired by modern glassmorphic UI trends and classic block puzzle games.

---

Made with ❤️ by [Your Name]

Enjoy the game! 🎮✨
