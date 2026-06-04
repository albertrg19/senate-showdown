import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main.js';
import { RobinPadillaData } from '../fighters/characters/RobinPadilla.js';
import { KikoPangilinanData } from '../fighters/characters/KikoPangilinan.js';
import { BamAquinoData } from '../fighters/characters/BamAquino.js';
import { AlanCayetanoData } from '../fighters/characters/AlanCayetano.js';
import { BatoDelaRosaData } from '../fighters/characters/BatoDelaRosa.js';
import { RaffyTulfoData } from '../fighters/characters/RaffyTulfo.js';
import { RisaHontiverosData } from '../fighters/characters/RisaHontiveros.js';

export class VSScene extends Phaser.Scene {
  constructor() {
    super({ key: 'VSScene' });
  }

  create() {
    this.cameras.main.fadeIn(200, 0, 0, 0);
    this.sound_mgr = this.registry.get('soundManager');

    // Get selected characters from registry
    const p1Id = this.registry.get('p1Character') || 'robin';
    const p2Id = this.registry.get('p2Character') || 'kiko';

    const charDetails = {
      robin: {
        name: RobinPadillaData.name.toUpperCase(),
        title: RobinPadillaData.title.toUpperCase(),
        hexColor: RobinPadillaData.energyColor,
        portrait: RobinPadillaData.portraitKey,
      },
      kiko: {
        name: KikoPangilinanData.name.toUpperCase(),
        title: KikoPangilinanData.title.toUpperCase(),
        hexColor: KikoPangilinanData.energyColor,
        portrait: KikoPangilinanData.portraitKey,
      },
      bam: {
        name: BamAquinoData.name.toUpperCase(),
        title: BamAquinoData.title.toUpperCase(),
        hexColor: BamAquinoData.energyColor,
        portrait: BamAquinoData.portraitKey,
      },
      alan: {
        name: AlanCayetanoData.name.toUpperCase(),
        title: AlanCayetanoData.title.toUpperCase(),
        hexColor: AlanCayetanoData.energyColor,
        portrait: AlanCayetanoData.portraitKey,
      },
      bato: {
        name: BatoDelaRosaData.name.toUpperCase(),
        title: BatoDelaRosaData.title.toUpperCase(),
        hexColor: BatoDelaRosaData.energyColor,
        portrait: BatoDelaRosaData.portraitKey,
      },
      raffy: {
        name: RaffyTulfoData.name.toUpperCase(),
        title: RaffyTulfoData.title.toUpperCase(),
        hexColor: RaffyTulfoData.energyColor,
        portrait: RaffyTulfoData.portraitKey,
      },
      risa: {
        name: RisaHontiverosData.name.toUpperCase(),
        title: RisaHontiverosData.title.toUpperCase(),
        hexColor: RisaHontiverosData.energyColor,
        portrait: RisaHontiverosData.portraitKey,
      }
    };

    const p1Data = charDetails[p1Id] || charDetails.robin;
    const p2Data = charDetails[p2Id] || charDetails.kiko;

    // ── LAYER 0: Dark background ──
    const bgFill = this.add.graphics().setDepth(0);
    bgFill.fillStyle(0x050508, 1);
    bgFill.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // ── LAYER 1: Animated diagonal split background ──
    const splitBg = this.add.graphics().setDepth(1);
    this.stripesOffset = 0;

    this.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        splitBg.clear();
        this.stripesOffset = (this.stripesOffset + 1.5) % 60;

        // P1 diagonal wedge (red tint)
        splitBg.fillStyle(p1Data.hexColor, 0.12);
        splitBg.beginPath();
        splitBg.moveTo(0, 0);
        splitBg.lineTo(GAME_WIDTH * 0.52, 0);
        splitBg.lineTo(GAME_WIDTH * 0.42, GAME_HEIGHT);
        splitBg.lineTo(0, GAME_HEIGHT);
        splitBg.closePath();
        splitBg.fillPath();

        // P2 diagonal wedge (blue/gold tint)
        splitBg.fillStyle(p2Data.hexColor, 0.12);
        splitBg.beginPath();
        splitBg.moveTo(GAME_WIDTH, 0);
        splitBg.lineTo(GAME_WIDTH * 0.48, 0);
        splitBg.lineTo(GAME_WIDTH * 0.58, GAME_HEIGHT);
        splitBg.lineTo(GAME_WIDTH, GAME_HEIGHT);
        splitBg.closePath();
        splitBg.fillPath();

        // Diagonal separator line (golden)
        splitBg.lineStyle(3, 0xFFD700, 0.6);
        splitBg.lineBetween(GAME_WIDTH * 0.52, 0, GAME_WIDTH * 0.42, GAME_HEIGHT);
        splitBg.lineBetween(GAME_WIDTH * 0.48, 0, GAME_WIDTH * 0.58, GAME_HEIGHT);

        // Scrolling scan lines for CRT effect
        splitBg.lineStyle(1, 0xFFFFFF, 0.03);
        for (let y = 0; y < GAME_HEIGHT; y += 4) {
          splitBg.lineBetween(0, y, GAME_WIDTH, y);
        }

        // Moving caution hash band in the center
        const bandY = GAME_HEIGHT / 2 - 25;
        const bandH = 50;
        splitBg.fillStyle(0x08080f, 0.85);
        splitBg.fillRect(0, bandY, GAME_WIDTH, bandH);

        splitBg.lineStyle(2, 0xFCD116, 0.45);
        splitBg.lineBetween(0, bandY, GAME_WIDTH, bandY);
        splitBg.lineBetween(0, bandY + bandH, GAME_WIDTH, bandY + bandH);

        // Animated diagonal hashes inside the caution band
        splitBg.lineStyle(2, 0xFCD116, 0.25);
        const hashSpacing = 25;
        const totalHashes = Math.ceil(GAME_WIDTH / hashSpacing) + 4;
        for (let i = -2; i < totalHashes; i++) {
          const x = i * hashSpacing + this.stripesOffset;
          splitBg.lineBetween(x, bandY + 4, x + 12, bandY + bandH - 4);
        }
      }
    });

    // ── LAYER 2: Character Portraits ──
    // Calculate proper scale to fit portraits nicely (max height ~420px, max width ~350px)
    const p1Portrait = this.add.image(-400, GAME_HEIGHT / 2 + 10, p1Data.portrait).setDepth(2);
    const p1TargetScale = Math.min(350 / p1Portrait.width, 420 / p1Portrait.height);
    p1Portrait.setScale(p1TargetScale);
    p1Portrait.setOrigin(0.5, 0.5);

    const p2Portrait = this.add.image(GAME_WIDTH + 400, GAME_HEIGHT / 2 + 10, p2Data.portrait).setDepth(2);
    const p2TargetScale = Math.min(350 / p2Portrait.width, 420 / p2Portrait.height);
    p2Portrait.setScale(p2TargetScale);
    p2Portrait.setOrigin(0.5, 0.5);
    p2Portrait.setFlipX(true);

    // Slide P1 in from left
    this.tweens.add({
      targets: p1Portrait,
      x: GAME_WIDTH * 0.22,
      duration: 500,
      ease: 'Back.easeOut',
      delay: 100
    });

    // Slide P2 in from right
    this.tweens.add({
      targets: p2Portrait,
      x: GAME_WIDTH * 0.78,
      duration: 500,
      ease: 'Back.easeOut',
      delay: 100
    });

    // Subtle idle breathing after landing
    this.time.delayedCall(650, () => {
      this.tweens.add({
        targets: p1Portrait,
        y: GAME_HEIGHT / 2 + 15,
        duration: 1800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      this.tweens.add({
        targets: p2Portrait,
        y: GAME_HEIGHT / 2 + 15,
        duration: 1800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });

    // ── LAYER 3: Portrait glow borders ──
    const glowG = this.add.graphics().setDepth(3);
    this.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        glowG.clear();
        const pulse = 0.4 + Math.sin(this.time.now * 0.005) * 0.2;

        // P1 glow outline
        if (p1Portrait.x > 0) {
          glowG.lineStyle(3, p1Data.hexColor, pulse);
          const hw = (p1Portrait.width * p1Portrait.scaleX) / 2;
          const hh = (p1Portrait.height * p1Portrait.scaleY) / 2;
          glowG.strokeRect(p1Portrait.x - hw - 4, p1Portrait.y - hh - 4, hw * 2 + 8, hh * 2 + 8);
        }

        // P2 glow outline
        if (p2Portrait.x < GAME_WIDTH) {
          glowG.lineStyle(3, p2Data.hexColor, pulse);
          const hw = (p2Portrait.width * p2Portrait.scaleX) / 2;
          const hh = (p2Portrait.height * p2Portrait.scaleY) / 2;
          glowG.strokeRect(p2Portrait.x - hw - 4, p2Portrait.y - hh - 4, hw * 2 + 8, hh * 2 + 8);
        }
      }
    });

    // ── LAYER 5: VS Text (starts hidden, slams in) ──
    const vsText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'VS', {
      fontFamily: 'Orbitron',
      fontSize: '100px',
      fontStyle: 'bold',
      color: '#FFD700',
      stroke: '#000',
      strokeThickness: 10
    }).setOrigin(0.5).setAlpha(0).setScale(5).setDepth(5);

    // VS slam animation
    this.tweens.add({
      targets: vsText,
      scale: 1,
      alpha: 1,
      duration: 350,
      delay: 450,
      ease: 'Bounce.easeOut',
      onStart: () => {
        // White flash overlay
        const flash = this.add.graphics().setDepth(99);
        flash.fillStyle(0xFFFFFF, 0.7);
        flash.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        this.tweens.add({
          targets: flash,
          alpha: 0,
          duration: 300,
          onComplete: () => flash.destroy()
        });
      },
      onComplete: () => {
        // Play epic cinematic slam sound
        if (this.sound_mgr) this.sound_mgr.playCinematicHit();
        this.cameras.main.shake(250, 0.02);

        // Pulsing glow ring
        const vsRing = this.add.graphics().setDepth(4);
        let ringAlpha = 1;
        let ringRadius = 50;
        const ringTimer = this.time.addEvent({
          delay: 16,
          repeat: 30,
          callback: () => {
            vsRing.clear();
            ringAlpha -= 0.03;
            ringRadius += 3;
            vsRing.lineStyle(4, 0xFFD700, Math.max(0, ringAlpha));
            vsRing.strokeCircle(GAME_WIDTH / 2, GAME_HEIGHT / 2, ringRadius);
          }
        });
      }
    });

    // VS text idle glow pulse after slam
    this.time.delayedCall(900, () => {
      this.tweens.add({
        targets: vsText,
        scale: { from: 1.0, to: 1.08 },
        alpha: { from: 1, to: 0.85 },
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });

    // ── LAYER 6: Name Banners ──
    // P1 Name Banner (slides from left)
    const p1BannerContainer = this.add.container(-500, GAME_HEIGHT - 80).setDepth(6);
    const p1Banner = this.add.graphics();
    p1Banner.fillStyle(p1Data.hexColor, 0.9);
    p1Banner.fillRoundedRect(0, 0, 340, 52, { tl: 0, tr: 12, bl: 0, br: 0 });
    p1Banner.lineStyle(2, 0xFFFFFF, 0.5);
    p1Banner.strokeRoundedRect(0, 0, 340, 52, { tl: 0, tr: 12, bl: 0, br: 0 });
    p1BannerContainer.add(p1Banner);

    const p1NameText = this.add.text(25, 6, p1Data.name, {
      fontFamily: 'Orbitron', fontSize: '20px', fontStyle: 'bold', color: '#FFF',
      stroke: '#000', strokeThickness: 2
    });
    const p1TitleText = this.add.text(25, 30, p1Data.title, {
      fontFamily: 'Rajdhani', fontSize: '13px', fontStyle: 'bold', color: '#FFD700'
    });
    p1BannerContainer.add([p1NameText, p1TitleText]);

    // P2 Name Banner (slides from right)
    const p2BannerContainer = this.add.container(GAME_WIDTH + 500, GAME_HEIGHT - 80).setDepth(6);
    const p2Banner = this.add.graphics();
    p2Banner.fillStyle(0x0038A8, 0.9);
    p2Banner.fillRoundedRect(-340, 0, 340, 52, { tl: 12, tr: 0, bl: 0, br: 0 });
    p2Banner.lineStyle(2, 0xFFFFFF, 0.5);
    p2Banner.strokeRoundedRect(-340, 0, 340, 52, { tl: 12, tr: 0, bl: 0, br: 0 });
    p2BannerContainer.add(p2Banner);

    const p2NameText = this.add.text(-315, 6, p2Data.name, {
      fontFamily: 'Orbitron', fontSize: '20px', fontStyle: 'bold', color: '#FFF',
      stroke: '#000', strokeThickness: 2
    });
    const p2TitleText = this.add.text(-315, 30, p2Data.title, {
      fontFamily: 'Rajdhani', fontSize: '13px', fontStyle: 'bold', color: p2Data.cssColor
    });
    p2BannerContainer.add([p2NameText, p2TitleText]);

    // Slide in banners
    this.tweens.add({
      targets: p1BannerContainer,
      x: 0,
      duration: 450,
      delay: 250,
      ease: 'Power3.easeOut'
    });
    this.tweens.add({
      targets: p2BannerContainer,
      x: GAME_WIDTH,
      duration: 450,
      delay: 250,
      ease: 'Power3.easeOut'
    });

    // ── LAYER 7: Subtitle text ──
    const subtitle = this.add.text(GAME_WIDTH / 2, 35, 'DECIDE THE DESTINY OF THE SENATE!', {
      fontFamily: 'Orbitron', fontSize: '14px', color: '#FFD700', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 2, letterSpacing: 3
    }).setOrigin(0.5).setAlpha(0).setDepth(7);

    this.tweens.add({
      targets: subtitle,
      alpha: 1,
      duration: 400,
      delay: 850,
      onComplete: () => {
        this.tweens.add({
          targets: subtitle,
          alpha: 0.4,
          duration: 500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    });

    // PH flag accent bar at bottom
    const flagBar = this.add.graphics().setDepth(7);
    flagBar.fillStyle(0x0038A8, 0.7);
    flagBar.fillRect(0, GAME_HEIGHT - 5, GAME_WIDTH / 3, 5);
    flagBar.fillStyle(0xCE1126, 0.7);
    flagBar.fillRect(GAME_WIDTH / 3, GAME_HEIGHT - 5, GAME_WIDTH / 3, 5);
    flagBar.fillStyle(0xFCD116, 0.7);
    flagBar.fillRect(GAME_WIDTH * 2 / 3, GAME_HEIGHT - 5, GAME_WIDTH / 3, 5);

    // ── Auto-transition to FightScene ──
    this.time.delayedCall(3000, () => {
      // Final dramatic flash before fight
      const finalFlash = this.add.graphics().setDepth(100);
      finalFlash.fillStyle(0xFFFFFF, 1);
      finalFlash.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      finalFlash.setAlpha(0);

      this.tweens.add({
        targets: finalFlash,
        alpha: 1,
        duration: 200,
        onComplete: () => {
          this.scene.start('FightScene');
        }
      });
    });
  }
}
