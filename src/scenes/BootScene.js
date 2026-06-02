import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Loading bar
    const barW = 400;
    const barH = 20;
    const barX = (GAME_WIDTH - barW) / 2;
    const barY = GAME_HEIGHT / 2 + 40;

    const progressBg = this.add.graphics();
    progressBg.fillStyle(0x1a1a2e, 1);
    progressBg.fillRoundedRect(barX - 2, barY - 2, barW + 4, barH + 4, 6);

    const progressBar = this.add.graphics();

    const titleText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'SENATE SHOWDOWN', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#FFD700',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);

    const loadingText = this.add.text(GAME_WIDTH / 2, barY + 30, 'Loading...', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '16px',
      color: '#aaa'
    }).setOrigin(0.5);

    // PH flag colors cycling on the bar
    this.load.on('progress', (value) => {
      progressBar.clear();
      // Blue section
      progressBar.fillStyle(0x0038A8, 1);
      progressBar.fillRoundedRect(barX, barY, barW * Math.min(value, 0.33), barH, 4);
      // Red section
      if (value > 0.33) {
        progressBar.fillStyle(0xCE1126, 1);
        progressBar.fillRoundedRect(barX + barW * 0.33, barY, barW * Math.min(value - 0.33, 0.34), barH, 0);
      }
      // Yellow section
      if (value > 0.67) {
        progressBar.fillStyle(0xFCD116, 1);
        progressBar.fillRoundedRect(barX + barW * 0.67, barY, barW * (value - 0.67), barH, 4);
      }
      loadingText.setText(`Loading... ${Math.floor(value * 100)}%`);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBg.destroy();
      titleText.destroy();
      loadingText.destroy();
    });

    // Load character assets
    this.load.image('robin_face', 'assets/characters/robin_face.jpg');
    this.load.image('kiko_face', 'assets/characters/kiko_face.png');
    this.load.image('robin_portrait', 'assets/characters/robin_portrait.png');
    this.load.image('kiko_portrait', 'assets/characters/kiko_portrait.png');
    this.load.image('vs_screen', 'assets/vs_screen.png');
    this.load.image('senate_hall', 'assets/stage/senate_hall.png');

    // Load raw spritesheets with cache busting to bypass browser cache
    this.load.image('robin_pixel_raw', 'assets/characters/robin_pixel.png?cb=' + Date.now());
    this.load.image('kiko_pixel_raw', 'assets/characters/kiko_pixel.png?cb=' + Date.now());
  }

  create() {
    // Generate gorgeous retro pixelated faces from high-quality photographs dynamically
    this.pixelateTexture('robin_face', 'robin_face_pixel', 10);
    this.pixelateTexture('kiko_face', 'kiko_face_pixel', 10);

    // Run clean transparentizer processing
    this.makeTextureTransparent('robin_pixel_raw', 'robin_pixel_clean', false);
    this.makeTextureTransparent('kiko_pixel_raw', 'kiko_pixel_clean', true);

    // Transition to menu
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MenuScene');
    });
  }

  pixelateTexture(sourceKey, targetKey, scaleFactor) {
    const source = this.textures.get(sourceKey).getSourceImage();
    const tinyW = Math.max(1, Math.round(source.width / scaleFactor));
    const tinyH = Math.max(1, Math.round(source.height / scaleFactor));
    
    const canvas = this.textures.createCanvas(targetKey, source.width, source.height);
    const ctx = canvas.getContext();
    
    // Disable smoothing to force clean, blocky pixel-art rendering!
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    
    // Create tiny canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = tinyW;
    tempCanvas.height = tinyH;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(source, 0, 0, tinyW, tinyH);
    
    // Scale it back up to normal size dynamically!
    ctx.drawImage(tempCanvas, 0, 0, tinyW, tinyH, 0, 0, source.width, source.height);
    
    canvas.refresh();
  }

  makeTextureTransparent(sourceKey, targetKey, isKiko = false) {
    const source = this.textures.get(sourceKey).getSourceImage();
    
    // Create target canvas at exactly 1024x1020 (5 rows * exactly 204px height)
    const targetW = 1024;
    const targetH = 5 * 204; // 1020 px
    
    const canvas = this.textures.createCanvas(targetKey, targetW, targetH);
    const ctx = canvas.getContext();
    
    const cellW = 128;
    const srcCellH = source.height / 5; // 204.8 px
    const dstCellH = 204;
    
    // 1. Resample each cell from float row bounds to exact integer row bounds
    // This perfectly aligns the canvas cells with Phaser's integer spritesheet slicing bounds!
    for (let cy = 0; cy < 5; cy++) {
      for (let cx = 0; cx < 8; cx++) {
        const srcX = Math.round(cx * cellW);
        const srcY = Math.round(cy * srcCellH);
        const srcNextX = Math.round((cx + 1) * cellW);
        const srcNextY = Math.round((cy + 1) * srcCellH);
        
        const dstX = cx * cellW;
        const dstY = cy * dstCellH;
        
        ctx.drawImage(
          source,
          srcX, srcY, srcNextX - srcX, srcNextY - srcY,
          dstX, dstY, cellW, dstCellH
        );
      }
    }
    
    const imgData = ctx.getImageData(0, 0, targetW, targetH);
    const data = imgData.data;
    const w = targetW;
    const h = targetH;
    
    // 2. Safety flood-fill starting strictly from borders to prevent shirt leakage
    for (let cy = 0; cy < 5; cy++) {
      for (let cx = 0; cx < 8; cx++) {
        const startX = cx * cellW;
        const startY = cy * dstCellH;
        
        const visited = new Uint8Array(cellW * dstCellH);
        const queue = [];
        const margin = 6;
        
        for (let y = 0; y < dstCellH; y++) {
          for (let x = 0; x < cellW; x++) {
            if (x < margin || x >= cellW - margin || y < margin || y >= dstCellH - margin) {
              const idx = ((startY + y) * w + (startX + x)) * 4;
              const r = data[idx];
              const g = data[idx+1];
              const b = data[idx+2];
              
              if (r > 248 && g > 248 && b > 248) {
                const nidx = y * cellW + x;
                if (!visited[nidx]) {
                  visited[nidx] = 1;
                  queue.push({ x, y });
                }
              }
            }
          }
        }
        
        while (queue.length > 0) {
          const p = queue.shift();
          const globalX = startX + p.x;
          const globalY = startY + p.y;
          const idx = (globalY * w + globalX) * 4;
          
          const r = data[idx];
          const g = data[idx+1];
          const b = data[idx+2];
          
          if (r > 248 && g > 248 && b > 248) {
            data[idx+3] = 0; // Make transparent
            
            const dirs = [
              { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
              { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
            ];
            
            for (const d of dirs) {
              const nx = p.x + d.dx;
              const ny = p.y + d.dy;
              
              if (nx >= 0 && nx < cellW && ny >= 0 && ny < dstCellH) {
                const nidx = ny * cellW + nx;
                if (!visited[nidx]) {
                  visited[nidx] = 1;
                  queue.push({ x: nx, y: ny });
                }
              }
            }
          }
        }
      }
    }
    
    // 3. High-precision border defringer (2 iterations) to clean up off-white outline halos
    for (let iter = 0; iter < 2; iter++) {
      const alphas = new Uint8Array(w * h);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          alphas[y * w + x] = data[(y * w + x) * 4 + 3];
        }
      }
      
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = (y * w + x) * 4;
          if (data[idx+3] === 0) continue;
          
          const r = data[idx];
          const g = data[idx+1];
          const b = data[idx+2];
          
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const sat = max - min;
          
          // Target pixels close to transparent edges that are grey/white/halo-like
          if (r > 195 && g > 195 && b > 195 && sat < 25) {
            const hasTransparentNeighbor = 
              alphas[(y - 1) * w + x] === 0 ||
              alphas[(y + 1) * w + x] === 0 ||
              alphas[y * w + (x - 1)] === 0 ||
              alphas[y * w + (x + 1)] === 0;
              
            if (hasTransparentNeighbor) {
              data[idx+3] = 0; // erase fuzzy outline pixels
            }
          }
        }
      }
    }
    
    // 4. Clear grid borders and category markers cleanly
    for (let y = 0; y < h; y++) {
      const cellYOffset = y % dstCellH;
      for (let x = 0; x < w; x++) {
        const cellXOffset = x % cellW;
        
        // Exact mathematical grid lines check on exact integer boundaries
        let erase = (cellXOffset <= 2 || cellW - cellXOffset <= 2 || cellYOffset <= 2 || dstCellH - cellYOffset <= 2);
        
        // Character-specific corner labels / row numbers cleanup
        if (isKiko) {
          // Erase top 22px in the side zones to completely wipe grid numbers
          if (cellYOffset < 22 && (cellXOffset < 25 || cellXOffset > 85)) {
            erase = true;
          }
        } else {
          // Erase top-left corner only for Robin's row labels
          if (cellYOffset < 12 && cellXOffset < 32) {
            erase = true;
          }
        }

        if (erase) {
          const idx = (y * w + x) * 4;
          data[idx + 3] = 0;
        }
      }
    }
    
    ctx.putImageData(imgData, 0, 0);
    canvas.refresh();

    const sheetKey = targetKey + '_sheet';
    this.textures.addSpriteSheet(sheetKey, canvas.canvas, { frameWidth: cellW, frameHeight: dstCellH });
  }
}
