import { States } from '../fighters/Fighter.js';
import { GROUND_Y } from '../main.js';

// Renders fighters using authentic 16-bit retro arcade spritesheets with dynamic 128x256 rectangular frame animations
export class FighterRenderer {
  constructor(scene) {
    this.scene = scene;
    this.graphics = scene.add.graphics();
    this.sprites = {};

    // Initialize clean Phaser frame-by-frame animations
    this.createAnimations();
  }

  createAnimations() {
    const scene = this.scene;

    // ─── New 5-row layout (Math.floor frameHeight=204, all 40 frames accessible) ───
    // Row 0 (0-7):   Idle stance
    // Row 1 (8-15):  Walk forward
    // Row 2 (16-23): Punch attack
    // Row 3 (24-31): Kick attack
    // Row 4 (32-39): Jump(32-33) | Hurt(34-35) | Knockdown(36-37) | Victory(38-39)

    // ── Robin Padilla ──────────────────────────────────────────────────────
    if (!scene.anims.exists('robin_idle')) {
      scene.anims.create({ key: 'robin_idle',    frames: scene.anims.generateFrameNumbers('robin_pixel_clean_sheet', { start: 0,  end: 7  }), frameRate: 6,  repeat: -1 });
      scene.anims.create({ key: 'robin_walk',    frames: scene.anims.generateFrameNumbers('robin_pixel_clean_sheet', { start: 8,  end: 15 }), frameRate: 8,  repeat: -1 });
      scene.anims.create({ key: 'robin_punch',   frames: scene.anims.generateFrameNumbers('robin_pixel_clean_sheet', { start: 16, end: 23 }), frameRate: 14, repeat: 0  });
      scene.anims.create({ key: 'robin_kick',    frames: scene.anims.generateFrameNumbers('robin_pixel_clean_sheet', { start: 24, end: 31 }), frameRate: 14, repeat: 0  });
      scene.anims.create({ key: 'robin_jump',    frames: scene.anims.generateFrameNumbers('robin_pixel_clean_sheet', { start: 32, end: 33 }), frameRate: 6,  repeat: -1 });
      scene.anims.create({ key: 'robin_hurt',    frames: scene.anims.generateFrameNumbers('robin_pixel_clean_sheet', { start: 34, end: 35 }), frameRate: 10, repeat: 0  });
      scene.anims.create({ key: 'robin_down',    frames: scene.anims.generateFrameNumbers('robin_pixel_clean_sheet', { start: 36, end: 37 }), frameRate: 6,  repeat: 0  });
      scene.anims.create({ key: 'robin_victory', frames: scene.anims.generateFrameNumbers('robin_pixel_clean_sheet', { start: 38, end: 39 }), frameRate: 4,  repeat: -1 });
    }

    // ── Kiko Pangilinan ────────────────────────────────────────────────────
    if (!scene.anims.exists('kiko_idle')) {
      scene.anims.create({ key: 'kiko_idle',    frames: scene.anims.generateFrameNumbers('kiko_pixel_clean_sheet', { start: 0,  end: 7  }), frameRate: 6,  repeat: -1 });
      scene.anims.create({ key: 'kiko_walk',    frames: scene.anims.generateFrameNumbers('kiko_pixel_clean_sheet', { start: 8,  end: 15 }), frameRate: 8,  repeat: -1 });
      scene.anims.create({ key: 'kiko_punch',   frames: scene.anims.generateFrameNumbers('kiko_pixel_clean_sheet', { start: 16, end: 23 }), frameRate: 14, repeat: 0  });
      scene.anims.create({ key: 'kiko_kick',    frames: scene.anims.generateFrameNumbers('kiko_pixel_clean_sheet', { start: 24, end: 31 }), frameRate: 14, repeat: 0  });
      scene.anims.create({ key: 'kiko_jump',    frames: scene.anims.generateFrameNumbers('kiko_pixel_clean_sheet', { start: 32, end: 33 }), frameRate: 6,  repeat: -1 });
      scene.anims.create({ key: 'kiko_hurt',    frames: scene.anims.generateFrameNumbers('kiko_pixel_clean_sheet', { start: 34, end: 35 }), frameRate: 10, repeat: 0  });
      scene.anims.create({ key: 'kiko_down',    frames: scene.anims.generateFrameNumbers('kiko_pixel_clean_sheet', { start: 36, end: 37 }), frameRate: 6,  repeat: 0  });
      scene.anims.create({ key: 'kiko_victory', frames: scene.anims.generateFrameNumbers('kiko_pixel_clean_sheet', { start: 38, end: 39 }), frameRate: 4,  repeat: -1 });
    }
  }

  createFaceSprite(fighter, textureKey) {
    const sheetKey = fighter.name === 'Robin Padilla' ? 'robin_pixel_clean_sheet' : 'kiko_pixel_clean_sheet';

    // Create 16-bit retro arcade sprite anchored at bottom-center (offset to 0.87 to account for transparency padding)
    const sprite = this.scene.add.sprite(fighter.x, fighter.y, sheetKey);
    sprite.setOrigin(0.5, 0.87);
    sprite.setScale(0.85); // Perfect arcade size scale for 128x205 frames
    sprite.setDepth(15);

    this.sprites[fighter.name] = sprite;
  }

  draw(fighter) {
    const sprite = this.sprites[fighter.name];
    if (!sprite) return;

    const { x, y, facing, state, data } = fighter;

    // Anchor sprite perfectly on floor coordinates with bottom-center origin
    sprite.setPosition(x, y);
    sprite.setFlipX(facing === -1);

    // Map fighter state to Phaser anims
    const prefix = fighter.name === 'Robin Padilla' ? 'robin_' : 'kiko_';
    // ── Map Fighter state → animation key ─────────────────────────────────
    let animKey = prefix + 'idle'; // safe default

    switch (state) {
      // ── Grounded movement ─────────────────────────────────────────────
      case States.IDLE:
      case States.CROUCH:
      case States.GETUP:
        animKey = prefix + 'idle';
        break;

      case States.WALK_F:
      case States.WALK_B:
        animKey = prefix + 'walk';
        break;

      // ── Airborne ──────────────────────────────────────────────────────
      case States.JUMP:
      case States.JUMP_F:
      case States.JUMP_B:
        animKey = prefix + 'jump';
        break;

      // ── Punch attacks ─────────────────────────────────────────────────
      case States.LIGHT_PUNCH:
      case States.MEDIUM_PUNCH:
      case States.HEAVY_PUNCH:
      case States.CROUCH_PUNCH:
      case States.JUMP_PUNCH:
      case States.SPECIAL1:
      case States.SPECIAL3:
      case States.SUPER:
        animKey = prefix + 'punch';
        break;

      // ── Kick attacks ──────────────────────────────────────────────────
      case States.LIGHT_KICK:
      case States.MEDIUM_KICK:
      case States.HEAVY_KICK:
      case States.CROUCH_KICK:
      case States.JUMP_KICK:
      case States.SPECIAL2:
        animKey = prefix + 'kick';
        break;

      // ── Damage reactions ──────────────────────────────────────────────
      case States.HIT_STUN:
      case States.BLOCK_STUN:
      case States.DIZZY:
        animKey = prefix + 'hurt';
        break;

      case States.KNOCKDOWN:
      case States.DEFEAT:
        animKey = prefix + 'down';
        break;

      // ── End-of-round ──────────────────────────────────────────────────
      case States.VICTORY:
        animKey = prefix + 'victory'; // frames 38-39: fighter with fist raised
        break;
    }

    // Play animation — guard against missing frames throwing TypeError
    if (animKey && sprite.anims.currentAnim?.key !== animKey) {
      // Only play if the animation is registered (prevents crash on missing frames)
      if (this.scene.anims.exists(animKey)) {
        try {
          sprite.play(animKey);
        } catch (e) {
          console.warn(`[FighterRenderer] Failed to play "${animKey}":`, e.message);
        }
      }
    }

    // Flash red on taking damage
    const isFlashing = fighter.flashTimer > 0 && fighter.flashTimer % 2 === 0;
    if (isFlashing) {
      sprite.setTint(0xff0000);
    } else {
      sprite.clearTint();
    }

    // Draw active energy glow
    const g = this.graphics;
    if (fighter.isAttacking() && (state === States.SPECIAL1 || state === States.SPECIAL2 || state === States.SPECIAL3)) {
      g.lineStyle(3, data.energyColor, 0.4 + Math.sin(fighter.stateFrame * 0.3) * 0.3);
      g.strokeCircle(x, y - 40, 50 + Math.sin(fighter.stateFrame * 0.2) * 10);
    }

    // Super move energy aura (cinematic gold glow around fighter)
    if (state === States.SUPER) {
      const superAlpha = 0.3 + Math.sin(fighter.stateFrame * 0.5) * 0.2;
      g.lineStyle(6, data.energyColor, superAlpha);
      g.strokeRoundedRect(x - 35, y - 90, 70, 90, 8);
      g.lineStyle(3, 0xFFD700, superAlpha * 0.8);
      g.strokeRoundedRect(x - 40, y - 95, 80, 100, 10);
    }

    // Dizzy stars orbiting above head
    if (fighter.dizzyTimer > 0 && fighter.dizzyStars.length > 0) {
      fighter.dizzyStars.forEach(star => {
        const sx = x + Math.cos(star.angle) * star.radius;
        const sy = (y - 100) + Math.sin(star.angle) * (star.radius * 0.3);
        g.fillStyle(0xFFDD00, 0.9);
        g.fillCircle(sx, sy, 5);
        g.fillStyle(0xFFFFFF, 0.5);
        g.fillCircle(sx, sy, 2);
        star.angle += 0.12;
      });
    }

    // Cancel window pulse (subtle blue outline) — Street Fighter cancel feedback
    if (fighter.inCancelWindow) {
      g.lineStyle(2, 0x00CCFF, 0.5);
      g.strokeRoundedRect(x - 28, y - 82, 56, 82, 4);
    }

    // Super meter full indicator — gold aura pulse on fighter
    if (fighter.superMeter >= fighter.maxSuper && fighter.isGrounded) {
      const t = Date.now() * 0.006;
      g.lineStyle(2, 0xFFD700, 0.2 + Math.sin(t) * 0.2);
      g.strokeCircle(x, y - 45, 40 + Math.sin(t) * 5);
    }

    // Draw active projectiles
    fighter.projectiles.forEach(p => {
      this.drawProjectile(g, p, data);
    });
  }

  drawProjectile(g, proj, data) {
    const t = Date.now() * 0.01;

    if (proj.type === 'fireball') {
      g.fillStyle(0xE63946, 0.8);
      g.fillRoundedRect(proj.x - 15, proj.y - 10, 30, 20, 5);
      g.fillStyle(0xFF6B35, 0.6);
      g.fillRoundedRect(proj.x - 12, proj.y - 7, 24, 14, 3);
      g.fillStyle(0xFFD700, 0.5);
      g.fillCircle(proj.x - 10 + Math.sin(t) * 5, proj.y - 12 + Math.cos(t) * 3, 4);
    } else if (proj.type === 'vegetable') {
      g.fillStyle(0xFF6B00, 0.9);
      g.fillRoundedRect(proj.x - 10, proj.y - 6, 20, 12, 6);
      g.fillStyle(0x2D6A4F, 0.8);
      g.fillTriangle(proj.x - 12, proj.y - 6, proj.x - 8, proj.y - 14, proj.x - 4, proj.y - 6);
    } else if (proj.type === 'vegetable2') {
      g.fillStyle(0x8B4513, 0.9);
      g.fillEllipse(proj.x, proj.y, 18, 12);
    }
  }

  clear() {
    this.graphics.clear();
  }

  destroy() {
    this.graphics.destroy();
    Object.values(this.sprites).forEach(sprite => {
      sprite.destroy();
    });
  }
}
