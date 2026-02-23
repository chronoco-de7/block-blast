#!/usr/bin/env node
/**
 * Build app icons from logo SVG.
 * Generates: icon.png (1024x1024), icon.icns (macOS), icon.ico (Windows)
 */
const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, '..', 'build');
const ICON_SVG = path.join(BUILD_DIR, 'icon.svg');
const ICON_PNG = path.join(BUILD_DIR, 'icon.png');
const ICON_ICNS = path.join(BUILD_DIR, 'icon.icns');
const ICON_ICO = path.join(BUILD_DIR, 'icon.ico');

async function main() {
  const sharp = require('sharp');
  const png2icons = require('png2icons');

  if (!fs.existsSync(ICON_SVG)) {
    console.error('icon.svg not found in build/');
    process.exit(1);
  }

  // Generate 1024x1024 PNG
  await sharp(ICON_SVG)
    .resize(1024, 1024)
    .png()
    .toFile(ICON_PNG);
  console.log('Created icon.png (1024x1024)');

  const pngBuffer = fs.readFileSync(ICON_PNG);

  // Windows .ico
  const icoBuffer = png2icons.createICO(pngBuffer, png2icons.BICUBIC, 0, true);
  fs.writeFileSync(ICON_ICO, icoBuffer);
  console.log('Created icon.ico (Windows)');

  // macOS .icns
  const icnsBuffer = png2icons.createICNS(pngBuffer, png2icons.BICUBIC, 0);
  fs.writeFileSync(ICON_ICNS, icnsBuffer);
  console.log('Created icon.icns (macOS)');

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
