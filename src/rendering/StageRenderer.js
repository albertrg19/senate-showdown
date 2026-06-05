import { GAME_WIDTH, GAME_HEIGHT, GROUND_Y } from '../main.js';

export class StageRenderer {
  constructor(scene, stageKey = 'senate_hall') {
    this.scene = scene;
    this.graphics = scene.add.graphics();
    this.bgGraphics = scene.add.graphics();
    this.bgGraphics.setDepth(-10);
    this.graphics.setDepth(-5);
    this.time = 0;

    // Load static image background if available
    if (scene.textures.exists(stageKey)) {
      this.bgSprite = scene.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, stageKey);
      this.bgSprite.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
      this.bgSprite.setDepth(-15);
    }
  }

  draw() {
    this.time += 0.016;
    this.bgGraphics.clear();
    this.graphics.clear();

    if (!this.bgSprite) {
      this.drawBackground();
      this.drawFloor();
    } else {
      // If we have the image background, draw dynamic spotlight overlays and reflections to make the arena pop!
      this.drawDynamicSpotlights();
    }
  }

  drawBackground() {
    const g = this.bgGraphics;

    // Sky gradient (dark blue to darker)
    for (let i = 0; i < 20; i++) {
      const y = i * (GROUND_Y / 20);
      const alpha = 1 - i * 0.03;
      const blue = Math.floor(15 + i * 2);
      const color = (0x05 << 16) | (0x05 << 8) | blue;
      g.fillStyle(color, alpha);
      g.fillRect(0, y, GAME_WIDTH, GROUND_Y / 20 + 1);
    }

    // Senate hall columns
    const columnWidth = 30;
    const columnGap = 140;
    const startX = 50;

    for (let i = 0; i < 8; i++) {
      const cx = startX + i * columnGap;

      // Column shadow
      g.fillStyle(0x1a1520, 0.8);
      g.fillRect(cx - columnWidth / 2 + 3, 60, columnWidth, GROUND_Y - 60);

      // Column body
      const gradient = 0.4 + Math.sin(this.time * 0.5 + i) * 0.1;
      g.fillStyle(0x2a2035, gradient);
      g.fillRect(cx - columnWidth / 2, 60, columnWidth, GROUND_Y - 60);

      // Column highlight
      g.fillStyle(0x3a3045, 0.3);
      g.fillRect(cx - columnWidth / 2, 60, 4, GROUND_Y - 60);

      // Column capital (top decoration)
      g.fillStyle(0x3a3045, 0.6);
      g.fillRect(cx - columnWidth / 2 - 5, 55, columnWidth + 10, 12);
      g.fillRect(cx - columnWidth / 2 - 3, 67, columnWidth + 6, 5);

      // Column base
      g.fillStyle(0x3a3045, 0.5);
      g.fillRect(cx - columnWidth / 2 - 5, GROUND_Y - 10, columnWidth + 10, 10);
    }

    // No flag drawn in center background to ensure a clean legal presentation

    // Arch/dome at top center
    g.lineStyle(2, 0x2a2035, 0.4);
    g.beginPath();
    g.arc(GAME_WIDTH / 2, 80, 200, Math.PI, 0, false);
    g.strokePath();
    g.lineStyle(1, 0x3a3045, 0.3);
    g.beginPath();
    g.arc(GAME_WIDTH / 2, 80, 210, Math.PI, 0, false);
    g.strokePath();

    // Crowd silhouettes in background
    for (let i = 0; i < 30; i++) {
      const cx = 40 + i * 30 + Math.sin(i * 1.7) * 10;
      const cy = 180 + Math.sin(i * 2.3) * 8;
      const bobble = Math.sin(this.time * 1.5 + i * 0.7) * 2;
      g.fillStyle(0x151520, 0.6);
      g.fillCircle(cx, cy + bobble, 8); // head
      g.fillRect(cx - 6, cy + 8 + bobble, 12, 15); // body
    }

    // Spotlights
    this.drawSpotlight(g, GAME_WIDTH * 0.25, 0, 0x0038A8, 0.06);
    this.drawSpotlight(g, GAME_WIDTH * 0.5, 0, 0xFCD116, 0.04);
    this.drawSpotlight(g, GAME_WIDTH * 0.75, 0, 0xCE1126, 0.06);

    // Ambient particles (dust motes in spotlights)
    g.fillStyle(0xFFFFFF, 0.15);
    for (let i = 0; i < 15; i++) {
      const px = 100 + Math.sin(this.time * 0.3 + i * 47.3) * 400 + 380;
      const py = 50 + Math.sin(this.time * 0.2 + i * 31.7) * 180 + 150;
      g.fillCircle(px, py, 1);
    }
  }

  drawSpotlight(g, x, y, color, alpha) {
    for (let i = 0; i < 8; i++) {
      g.fillStyle(color, alpha * (1 - i * 0.12));
      g.fillTriangle(
        x - 30 - i * 20, GROUND_Y,
        x + 30 + i * 20, GROUND_Y,
        x, y
      );
    }
  }

  drawFloor() {
    const g = this.graphics;

    // Main floor
    g.fillStyle(0x1a1520, 1);
    g.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);

    // Floor line
    g.lineStyle(2, 0xFFD700, 0.3);
    g.lineBetween(0, GROUND_Y, GAME_WIDTH, GROUND_Y);

    // Floor tiles pattern
    g.lineStyle(1, 0x252030, 0.3);
    for (let i = 0; i < 20; i++) {
      const tx = i * 50;
      g.lineBetween(tx, GROUND_Y, tx, GAME_HEIGHT);
    }

    // Floor reflection effect
    g.fillStyle(0x0038A8, 0.03);
    g.fillRect(0, GROUND_Y, GAME_WIDTH * 0.3, 30);
    g.fillStyle(0xCE1126, 0.03);
    g.fillRect(GAME_WIDTH * 0.7, GROUND_Y, GAME_WIDTH * 0.3, 30);
    g.fillStyle(0xFCD116, 0.02);
    g.fillRect(GAME_WIDTH * 0.35, GROUND_Y, GAME_WIDTH * 0.3, 20);

    // Bottom bar
    g.fillStyle(0x0a0a0f, 1);
    g.fillRect(0, GAME_HEIGHT - 10, GAME_WIDTH, 10);
    g.lineStyle(1, 0xFFD700, 0.2);
    g.lineBetween(0, GAME_HEIGHT - 10, GAME_WIDTH, GAME_HEIGHT - 10);
  }

  drawDynamicSpotlights() {
    const g = this.graphics;
    const t = this.time;
    
    // Ambient light reflections on the floor area
    g.fillStyle(0x0038A8, 0.04 + Math.sin(t) * 0.01);
    g.fillRect(0, GROUND_Y, GAME_WIDTH * 0.35, GAME_HEIGHT - GROUND_Y);
    
    g.fillStyle(0xCE1126, 0.04 + Math.cos(t) * 0.01);
    g.fillRect(GAME_WIDTH * 0.65, GROUND_Y, GAME_WIDTH * 0.35, GAME_HEIGHT - GROUND_Y);

    g.fillStyle(0xFCD116, 0.03 + Math.sin(t * 1.5) * 0.01);
    g.fillRect(GAME_WIDTH * 0.35, GROUND_Y, GAME_WIDTH * 0.3, GAME_HEIGHT - GROUND_Y);

    // Floor edge divider
    g.lineStyle(1.5, 0xFFD700, 0.2);
    g.lineBetween(0, GROUND_Y, GAME_WIDTH, GROUND_Y);

    // Dynamic ambient dust motes
    g.fillStyle(0xFFFFFF, 0.15);
    for (let i = 0; i < 10; i++) {
      const px = 100 + Math.sin(t * 0.3 + i * 47.3) * 400 + 380;
      const py = 50 + Math.sin(t * 0.2 + i * 31.7) * 180 + 150;
      g.fillCircle(px, py, 1);
    }
  }

  destroy() {
    this.graphics.destroy();
    this.bgGraphics.destroy();
  }
}
