import { GAME_WIDTH, GAME_HEIGHT } from '../main.js';

// Street Fighter-style HUD with:
// - Health bars with character name plates and portraits
// - Stun (dizzy) meters under health bars
// - Round win indicators (stars)
// - Super meters at bottom
// - Centered timer
// - PERFECT! / ROUND announcements
// - Combo counter
export class HUD {
  constructor(scene) {
    this.scene = scene;
    this.g = scene.add.graphics();
    this.g.setDepth(80);

    // State
    this.p1Health = 1;
    this.p2Health = 1;
    this.p1Stun = 0;
    this.p2Stun = 0;
    this.p1Super = 0;
    this.p2Super = 0;
    this.timer = 99;
    this.p1Wins = 0;
    this.p2Wins = 0;
    this.p1Name = '';
    this.p2Name = '';

    // Layout constants
    this.BAR_Y        = 28;
    this.STUN_Y       = 52;
    this.BAR_H        = 20;
    this.STUN_H       = 8;
    this.BAR_W        = 320;
    this.SUPER_Y      = GAME_HEIGHT - 22;
    this.SUPER_H      = 14;
    this.SUPER_W      = 280;
    this.CENTER_X     = GAME_WIDTH / 2;
    this.P1_BAR_X     = 10;
    this.P2_BAR_X     = GAME_WIDTH - this.BAR_W - 10;

    this._buildStaticUI();
    this._buildDynamicTexts();
  }

  _buildStaticUI() {
    const g = this.g;

    // ── Top panel background ──────────────────────────────────────────────
    g.fillStyle(0x000000, 0.75);
    g.fillRect(0, 0, GAME_WIDTH, 78);

    // Thin gold separator line
    g.lineStyle(1, 0xFFD700, 0.5);
    g.strokeRect(0, 78, GAME_WIDTH, 0);

    // ── Health bar borders ───────────────────────────────────────────────
    // P1 health frame
    g.lineStyle(2, 0xFFD700, 0.9);
    g.strokeRect(this.P1_BAR_X - 1, this.BAR_Y - 1, this.BAR_W + 2, this.BAR_H + 2);
    // P2 health frame
    g.strokeRect(this.P2_BAR_X - 1, this.BAR_Y - 1, this.BAR_W + 2, this.BAR_H + 2);

    // ── Health bar backgrounds (dark) ─────────────────────────────────────
    g.fillStyle(0x1a0000, 1);
    g.fillRect(this.P1_BAR_X, this.BAR_Y, this.BAR_W, this.BAR_H);
    g.fillStyle(0x1a0000, 1);
    g.fillRect(this.P2_BAR_X, this.BAR_Y, this.BAR_W, this.BAR_H);

    // ── Stun bar borders ────────────────────────────────────────────────
    g.lineStyle(1, 0x888800, 0.7);
    g.strokeRect(this.P1_BAR_X, this.STUN_Y, this.BAR_W, this.STUN_H);
    g.strokeRect(this.P2_BAR_X, this.STUN_Y, this.BAR_W, this.STUN_H);

    // ── Stun bar backgrounds ─────────────────────────────────────────────
    g.fillStyle(0x111100, 1);
    g.fillRect(this.P1_BAR_X, this.STUN_Y, this.BAR_W, this.STUN_H);
    g.fillStyle(0x111100, 1);
    g.fillRect(this.P2_BAR_X, this.STUN_Y, this.BAR_W, this.STUN_H);

    // ── Timer box ────────────────────────────────────────────────────────
    g.fillStyle(0x000000, 0.9);
    g.fillRoundedRect(this.CENTER_X - 30, 4, 60, 36, 4);
    g.lineStyle(2, 0xFFD700, 0.8);
    g.strokeRoundedRect(this.CENTER_X - 30, 4, 60, 36, 4);

    // ── Super meter backgrounds at bottom ─────────────────────────────────
    g.fillStyle(0x000000, 0.8);
    g.fillRect(0, GAME_HEIGHT - 32, GAME_WIDTH, 32);

    g.fillStyle(0x000033, 1);
    g.fillRect(this.CENTER_X - this.SUPER_W / 2 - 2, this.SUPER_Y - 2, this.SUPER_W + 4, this.SUPER_H + 4);
    g.fillStyle(0x000033, 1);
    g.fillRect(GAME_WIDTH - this.CENTER_X - this.SUPER_W / 2 - 2, this.SUPER_Y - 2, this.SUPER_W + 4, this.SUPER_H + 4);
  }

  _buildDynamicTexts() {
    const scene = this.scene;
    const fontMain = { fontFamily: 'Orbitron, monospace', fontSize: '13px', color: '#FFF', stroke: '#000', strokeThickness: 2 };
    const fontSmall = { fontFamily: 'Rajdhani, sans-serif', fontSize: '10px', color: '#FFD700' };
    const fontTimer = { fontFamily: 'Orbitron, monospace', fontSize: '26px', fontStyle: 'bold', color: '#FFD700', stroke: '#000', strokeThickness: 4 };

    // P1 name
    this.p1NameText = scene.add.text(this.P1_BAR_X + 2, 12, '', fontMain).setDepth(81);
    // P2 name (right-aligned)
    this.p2NameText = scene.add.text(this.P2_BAR_X + this.BAR_W - 2, 12, '', { ...fontMain, align: 'right' }).setDepth(81).setOrigin(1, 0);

    // Timer
    this.timerText = scene.add.text(this.CENTER_X, 22, '99', fontTimer).setDepth(81).setOrigin(0.5, 0.5);

    // Win stars (below health bars)
    this.p1StarTexts = [];
    this.p2StarTexts = [];
    for (let i = 0; i < 2; i++) {
      this.p1StarTexts.push(
        scene.add.text(this.P1_BAR_X + 8 + i * 20, 63, '☆', { fontFamily: 'Arial', fontSize: '14px', color: '#555' }).setDepth(81)
      );
      this.p2StarTexts.push(
        scene.add.text(this.P2_BAR_X + this.BAR_W - 8 - i * 20, 63, '☆', { fontFamily: 'Arial', fontSize: '14px', color: '#555', align: 'right' }).setDepth(81).setOrigin(1, 0)
      );
    }

    // Super label P1
    scene.add.text(this.CENTER_X - this.SUPER_W / 2 - 2, this.SUPER_Y - 12, 'SUPER', fontSmall).setDepth(81).setOrigin(0, 0);
    // Super label P2
    scene.add.text(GAME_WIDTH - this.CENTER_X + this.SUPER_W / 2 + 2, this.SUPER_Y - 12, 'SUPER', { ...fontSmall, align: 'right' }).setDepth(81).setOrigin(1, 0);

    // Combo counter texts
    this.p1ComboText = scene.add.text(200, GAME_HEIGHT - 100, '', {
      fontFamily: 'Orbitron, monospace', fontSize: '28px', fontStyle: 'bold',
      color: '#FFD700', stroke: '#000', strokeThickness: 4
    }).setDepth(82).setAlpha(0);

    this.p2ComboText = scene.add.text(GAME_WIDTH - 200, GAME_HEIGHT - 100, '', {
      fontFamily: 'Orbitron, monospace', fontSize: '28px', fontStyle: 'bold',
      color: '#FFD700', stroke: '#000', strokeThickness: 4
    }).setDepth(82).setAlpha(0).setOrigin(1, 0.5);

    // Center announcement text
    this.announcementText = scene.add.text(this.CENTER_X, GAME_HEIGHT / 2 - 60, '', {
      fontFamily: 'Orbitron, monospace', fontSize: '52px', fontStyle: 'bold',
      color: '#FFD700', stroke: '#000', strokeThickness: 6
    }).setDepth(100).setOrigin(0.5, 0.5).setAlpha(0);

    // Sub-announcement (PERFECT, etc.)
    this.subAnnouncementText = scene.add.text(this.CENTER_X, GAME_HEIGHT / 2 + 20, '', {
      fontFamily: 'Orbitron, monospace', fontSize: '32px', fontStyle: 'bold',
      color: '#FF4444', stroke: '#000', strokeThickness: 5
    }).setDepth(100).setOrigin(0.5, 0.5).setAlpha(0);

    // Dizzy text (floats above dizzy character)
    this.dizzyText = scene.add.text(0, 0, '💫 DIZZY! 💫', {
      fontFamily: 'Orbitron, monospace', fontSize: '16px', fontStyle: 'bold',
      color: '#FFFF00', stroke: '#000', strokeThickness: 3
    }).setDepth(90).setOrigin(0.5, 1).setAlpha(0);
  }

  // ── Called each frame ───────────────────────────────────────────────────
  update(p1, p2, timer, p1Wins, p2Wins) {
    this.p1Health = p1.health / p1.maxHealth;
    this.p2Health = p2.health / p2.maxHealth;
    this.p1Stun   = p1.stunMeter / p1.maxStun;
    this.p2Stun   = p2.stunMeter / p2.maxStun;
    this.p1Super  = p1.superMeter / p1.maxSuper;
    this.p2Super  = p2.superMeter / p2.maxSuper;
    this.timer    = timer;
    this.p1Name   = p1.name;
    this.p2Name   = p2.name;

    this._drawDynamic(p1, p2, p1Wins, p2Wins);
    this._updateTexts(p1Wins, p2Wins);
    this._updateCombos(p1, p2);
    this._updateDizzyIndicator(p1, p2);
    this._updateSuperGlow(p1, p2);
  }

  _drawDynamic(p1, p2, p1Wins, p2Wins) {
    const g = this.g;
    const t = this.scene.time.now * 0.001;

    // Rebuild every frame (cleared + redrawn)
    g.clear();

    // ── Top panel ─────────────────────────────────────────────────────────
    g.fillStyle(0x000000, 0.75);
    g.fillRect(0, 0, GAME_WIDTH, 78);

    // ── Stun bar borders ─────────────────────────────────────────────────
    g.lineStyle(1, 0x888800, 0.7);
    g.strokeRect(this.P1_BAR_X, this.STUN_Y, this.BAR_W, this.STUN_H);
    g.strokeRect(this.P2_BAR_X, this.STUN_Y, this.BAR_W, this.STUN_H);
    g.fillStyle(0x111100, 1);
    g.fillRect(this.P1_BAR_X, this.STUN_Y, this.BAR_W, this.STUN_H);
    g.fillRect(this.P2_BAR_X, this.STUN_Y, this.BAR_W, this.STUN_H);

    // ── P1 Health bar (fills left to right) ──────────────────────────────
    const p1W = Math.max(0, this.BAR_W * this.p1Health);
    const p1Color = this._healthColor(this.p1Health);
    g.fillStyle(0x1a0000, 1);
    g.fillRect(this.P1_BAR_X, this.BAR_Y, this.BAR_W, this.BAR_H);
    if (p1W > 0) {
      g.fillStyle(p1Color, 1);
      g.fillRect(this.P1_BAR_X, this.BAR_Y, p1W, this.BAR_H);
      // Shine stripe
      g.fillStyle(0xFFFFFF, 0.15);
      g.fillRect(this.P1_BAR_X, this.BAR_Y, p1W, this.BAR_H / 3);
    }
    g.lineStyle(2, 0xFFD700, 0.9);
    g.strokeRect(this.P1_BAR_X - 1, this.BAR_Y - 1, this.BAR_W + 2, this.BAR_H + 2);

    // ── P2 Health bar (fills RIGHT to LEFT) ──────────────────────────────
    const p2W = Math.max(0, this.BAR_W * this.p2Health);
    const p2Color = this._healthColor(this.p2Health);
    g.fillStyle(0x1a0000, 1);
    g.fillRect(this.P2_BAR_X, this.BAR_Y, this.BAR_W, this.BAR_H);
    if (p2W > 0) {
      g.fillStyle(p2Color, 1);
      g.fillRect(this.P2_BAR_X + (this.BAR_W - p2W), this.BAR_Y, p2W, this.BAR_H);
      g.fillStyle(0xFFFFFF, 0.15);
      g.fillRect(this.P2_BAR_X + (this.BAR_W - p2W), this.BAR_Y, p2W, this.BAR_H / 3);
    }
    g.lineStyle(2, 0xFFD700, 0.9);
    g.strokeRect(this.P2_BAR_X - 1, this.BAR_Y - 1, this.BAR_W + 2, this.BAR_H + 2);

    // ── P1 Stun bar (yellow, left to right) ──────────────────────────────
    if (this.p1Stun > 0) {
      const stunAlpha = 0.7 + Math.sin(t * 6) * 0.15;
      g.fillStyle(this.p1Stun > 0.8 ? 0xFF4400 : 0xFFCC00, stunAlpha);
      g.fillRect(this.P1_BAR_X, this.STUN_Y, this.BAR_W * this.p1Stun, this.STUN_H);
    }

    // ── P2 Stun bar (yellow, right to left) ──────────────────────────────
    if (this.p2Stun > 0) {
      const stunAlpha = 0.7 + Math.sin(t * 6) * 0.15;
      g.fillStyle(this.p2Stun > 0.8 ? 0xFF4400 : 0xFFCC00, stunAlpha);
      const sw = this.BAR_W * this.p2Stun;
      g.fillRect(this.P2_BAR_X + this.BAR_W - sw, this.STUN_Y, sw, this.STUN_H);
    }

    // ── Timer box ────────────────────────────────────────────────────────
    const timerColor = this.timer <= 10 ? 0x880000 : 0x000000;
    g.fillStyle(timerColor, 0.9);
    g.fillRoundedRect(this.CENTER_X - 30, 4, 60, 36, 4);
    const timerBorderColor = this.timer <= 10 ? 0xFF0000 : 0xFFD700;
    g.lineStyle(2, timerBorderColor, 0.8);
    g.strokeRoundedRect(this.CENTER_X - 30, 4, 60, 36, 4);

    // ── Bottom panel ──────────────────────────────────────────────────────
    g.fillStyle(0x000000, 0.85);
    g.fillRect(0, GAME_HEIGHT - 32, GAME_WIDTH, 32);

    // ── P1 Super meter (left side, left to right) ────────────────────────
    const p1SuperX = this.CENTER_X - this.SUPER_W / 2;
    g.fillStyle(0x001133, 1);
    g.fillRect(p1SuperX - 2, this.SUPER_Y - 2, this.SUPER_W + 4, this.SUPER_H + 4);
    if (this.p1Super > 0) {
      const superGlow = this.p1Super >= 1 ? (0.6 + Math.sin(t * 8) * 0.4) : 1;
      const superColor = this.p1Super >= 1 ? 0xFFD700 : 0x0088FF;
      g.fillStyle(superColor, superGlow);
      g.fillRect(p1SuperX, this.SUPER_Y, this.SUPER_W * this.p1Super, this.SUPER_H);
      g.fillStyle(0xFFFFFF, 0.2);
      g.fillRect(p1SuperX, this.SUPER_Y, this.SUPER_W * this.p1Super, this.SUPER_H / 3);
      // Segment dividers
      for (let i = 1; i < 4; i++) {
        g.fillStyle(0x000000, 0.5);
        g.fillRect(p1SuperX + (this.SUPER_W / 4) * i - 1, this.SUPER_Y, 2, this.SUPER_H);
      }
    }
    g.lineStyle(1, 0x0044AA, 0.8);
    g.strokeRect(p1SuperX - 2, this.SUPER_Y - 2, this.SUPER_W + 4, this.SUPER_H + 4);

    // ── P2 Super meter (right side, right to left) ────────────────────────
    const p2SuperX = GAME_WIDTH - this.CENTER_X - this.SUPER_W / 2;
    g.fillStyle(0x001133, 1);
    g.fillRect(p2SuperX - 2, this.SUPER_Y - 2, this.SUPER_W + 4, this.SUPER_H + 4);
    if (this.p2Super > 0) {
      const superGlow = this.p2Super >= 1 ? (0.6 + Math.sin(t * 8) * 0.4) : 1;
      const superColor = this.p2Super >= 1 ? 0xFFD700 : 0x0088FF;
      const sw2 = this.SUPER_W * this.p2Super;
      g.fillStyle(superColor, superGlow);
      g.fillRect(p2SuperX + this.SUPER_W - sw2, this.SUPER_Y, sw2, this.SUPER_H);
      g.fillStyle(0xFFFFFF, 0.2);
      g.fillRect(p2SuperX + this.SUPER_W - sw2, this.SUPER_Y, sw2, this.SUPER_H / 3);
      for (let i = 1; i < 4; i++) {
        g.fillStyle(0x000000, 0.5);
        g.fillRect(p2SuperX + (this.SUPER_W / 4) * i - 1, this.SUPER_Y, 2, this.SUPER_H);
      }
    }
    g.lineStyle(1, 0x0044AA, 0.8);
    g.strokeRect(p2SuperX - 2, this.SUPER_Y - 2, this.SUPER_W + 4, this.SUPER_H + 4);
  }

  _updateTexts(p1Wins, p2Wins) {
    this.p1NameText.setText(this.p1Name.toUpperCase());
    this.p2NameText.setText(this.p2Name.toUpperCase());
    this.timerText.setText(String(Math.max(0, Math.ceil(this.timer))));

    // Update win stars
    for (let i = 0; i < 2; i++) {
      this.p1StarTexts[i].setText(i < p1Wins ? '⭐' : '☆');
      this.p1StarTexts[i].setColor(i < p1Wins ? '#FFD700' : '#555');
      this.p2StarTexts[i].setText(i < p2Wins ? '⭐' : '☆');
      this.p2StarTexts[i].setColor(i < p2Wins ? '#FFD700' : '#555');
    }
  }

  _updateCombos(p1, p2) {
    if (p1.comboCount >= 2) {
      this.p1ComboText.setText(`${p1.comboCount} HIT`).setAlpha(1);
      this.scene.tweens.add({ targets: this.p1ComboText, scaleX: 1.2, scaleY: 1.2, duration: 80, yoyo: true, ease: 'Bounce' });
    } else if (p1.comboCount === 0) {
      this.scene.tweens.add({ targets: this.p1ComboText, alpha: 0, duration: 300, delay: 200 });
    }

    if (p2.comboCount >= 2) {
      this.p2ComboText.setText(`${p2.comboCount} HIT`).setAlpha(1);
      this.scene.tweens.add({ targets: this.p2ComboText, scaleX: 1.2, scaleY: 1.2, duration: 80, yoyo: true, ease: 'Bounce' });
    } else if (p2.comboCount === 0) {
      this.scene.tweens.add({ targets: this.p2ComboText, alpha: 0, duration: 300, delay: 200 });
    }
  }

  _updateDizzyIndicator(p1, p2) {
    if (p1.dizzyTimer > 0) {
      this.dizzyText.setPosition(p1.x, p1.y - 100).setAlpha(0.9);
    } else if (p2.dizzyTimer > 0) {
      this.dizzyText.setPosition(p2.x, p2.y - 100).setAlpha(0.9);
    } else {
      this.dizzyText.setAlpha(0);
    }
  }

  _updateSuperGlow(p1, p2) {
    // When P1 super is full, make P1 combo text pulse gold
    // (visual done in _drawDynamic via animated gold fill)
  }

  _healthColor(ratio) {
    if (ratio > 0.5) return 0x00DD44;      // Green
    if (ratio > 0.25) return 0xFFAA00;     // Orange
    return 0xFF2222;                        // Red (critical)
  }

  // ── Public announcement methods ─────────────────────────────────────────

  showRoundStart(roundNum) {
    this._flashAnnouncement(`ROUND ${roundNum}`, '#FFD700', 1200, () => {
      this._flashAnnouncement('FIGHT!', '#FF4444', 900);
    });
  }

  showKO() {
    this._flashAnnouncement('K.O.', '#FF4444', 2000);
  }

  showPerfect() {
    this.scene.time.delayedCall(400, () => {
      this.subAnnouncementText.setText('PERFECT!').setColor('#FFD700');
      this.scene.tweens.add({
        targets: this.subAnnouncementText,
        alpha: { from: 0, to: 1 },
        scaleX: { from: 2, to: 1 },
        scaleY: { from: 2, to: 1 },
        duration: 400,
        ease: 'Expo.Out',
        onComplete: () => {
          this.scene.tweens.add({
            targets: this.subAnnouncementText,
            alpha: 0,
            delay: 1500,
            duration: 500
          });
        }
      });
    });
  }

  showTimeOver() {
    this._flashAnnouncement('TIME OVER', '#FF8800', 2000);
  }

  showSuperFlash(character) {
    // White flash is handled by FightScene tween — HUD only shows the name banner
    this._flashAnnouncement(character.data.moves.super.name, '#FFD700', 1000);
  }

  showDizzy(fighter) {
    const dText = this.scene.add.text(fighter.x, fighter.y - 110, '★ DIZZY! ★', {
      fontFamily: 'Orbitron, monospace', fontSize: '18px', fontStyle: 'bold',
      color: '#FFFF00', stroke: '#333', strokeThickness: 4
    }).setDepth(90).setOrigin(0.5);

    this.scene.tweens.add({
      targets: dText,
      y: dText.y - 20,
      alpha: { from: 1, to: 0 },
      duration: 1200,
      ease: 'Power1',
      onComplete: () => dText.destroy()
    });
  }

  _flashAnnouncement(text, color, duration, callback) {
    const aText = this.announcementText;
    aText.setText(text).setColor(color).setScale(1).setAlpha(0);

    this.scene.tweens.add({
      targets: aText,
      alpha: { from: 0, to: 1 },
      scaleX: { from: 1.8, to: 1 },
      scaleY: { from: 1.8, to: 1 },
      duration: 250,
      ease: 'Back.Out',
      onComplete: () => {
        this.scene.time.delayedCall(duration - 300, () => {
          this.scene.tweens.add({
            targets: aText,
            alpha: 0,
            duration: 300,
            onComplete: () => {
              if (callback) callback();
            }
          });
        });
      }
    });
  }

  // ── CHIP DAMAGE flash ───────────────────────────────────────────────────
  showChipDamage(x, y) {
    const chip = this.scene.add.text(x, y, 'CHIP', {
      fontFamily: 'Orbitron, monospace', fontSize: '12px',
      color: '#FF8800', stroke: '#000', strokeThickness: 2
    }).setDepth(90).setOrigin(0.5);

    this.scene.tweens.add({
      targets: chip,
      y: y - 25, alpha: { from: 1, to: 0 },
      duration: 600, ease: 'Power1',
      onComplete: () => chip.destroy()
    });
  }

  // ── Cancel flash ──────────────────────────────────────────────────────
  showCancel(x, y) {
    const cancel = this.scene.add.text(x, y - 60, 'CANCEL!', {
      fontFamily: 'Orbitron, monospace', fontSize: '14px', fontStyle: 'bold',
      color: '#00FFFF', stroke: '#000', strokeThickness: 3
    }).setDepth(90).setOrigin(0.5);

    this.scene.tweens.add({
      targets: cancel,
      y: y - 90, alpha: { from: 1, to: 0 },
      duration: 500, ease: 'Power1',
      onComplete: () => cancel.destroy()
    });
  }

  destroy() {
    this.g.destroy();
  }
}
