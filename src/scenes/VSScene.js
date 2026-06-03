import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main.js';

export class VSScene extends Phaser.Scene {
  constructor() {
    super({ key: 'VSScene' });
  }

  create() {
    this.sound_mgr = this.registry.get('soundManager');
    
    // Background image
    const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'vs_screen');
    bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    bg.setAlpha(0.85);

    // Hazard stripes graphics overlay
    this.stripesGraphics = this.add.graphics();
    this.stripesOffset = 0;

    // Get selected characters from registry
    const p1Id = this.registry.get('p1Character') || 'robin';
    const p2Id = this.registry.get('p2Character') || 'kiko';

    const charDetails = {
      robin: {
        name: 'Robin Padilla',
        title: 'THE BAD BOY',
        color: '#E63946',
        portrait: 'robin_portrait',
      },
      kiko: {
        name: 'Kiko Pangilinan',
        title: 'THE POLICY WARRIOR',
        color: '#FFC300',
        portrait: 'kiko_portrait',
      }
    };

    const p1Data = charDetails[p1Id] || charDetails.robin;
    const p2Data = charDetails[p2Id] || charDetails.kiko;

    // Center graphics for visual flair
    const overlayG = this.add.graphics();
    
    // Slide-in portraits
    // Player 1 (Left Side)
    const p1Portrait = this.add.image(-300, GAME_HEIGHT / 2 - 20, p1Data.portrait);
    p1Portrait.setScale(0.85);
    p1Portrait.setOrigin(0.5, 0.5);

    // Player 2 (Right Side)
    const p2Portrait = this.add.image(GAME_WIDTH + 300, GAME_HEIGHT / 2 - 20, p2Data.portrait);
    p2Portrait.setScale(0.85);
    p2Portrait.setOrigin(0.5, 0.5);
    p2Portrait.setFlipX(true); // Flip so characters face each other!

    // Slide them in
    this.tweens.add({
      targets: p1Portrait,
      x: 220,
      duration: 600,
      ease: 'Power3.easeOut'
    });

    this.tweens.add({
      targets: p2Portrait,
      x: GAME_WIDTH - 220,
      duration: 600,
      ease: 'Power3.easeOut'
    });

    // Subtle breathing animation for both characters after slide-in
    this.tweens.add({
      targets: p1Portrait,
      y: GAME_HEIGHT / 2 - 10,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 600
    });

    this.tweens.add({
      targets: p2Portrait,
      y: GAME_HEIGHT / 2 - 10,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 600
    });

    // P1 Name Banner
    const p1Container = this.add.container(-400, GAME_HEIGHT - 110);
    const p1Bar = this.add.graphics();
    p1Bar.fillStyle(0xE63946, 0.85);
    p1Bar.fillRoundedRect(0, 0, 360, 60, { tl: 0, tr: 20, bl: 0, br: 0 });
    p1Bar.lineStyle(2, 0xffffff, 0.6);
    p1Bar.strokeRoundedRect(0, 0, 360, 60, { tl: 0, tr: 20, bl: 0, br: 0 });
    p1Container.add(p1Bar);

    const p1NameTxt = this.add.text(35, 8, p1Data.name.toUpperCase(), {
      fontFamily: 'Orbitron', fontSize: '24px', fontStyle: 'bold', color: '#FFF',
      stroke: '#000', strokeThickness: 2
    });
    const p1TitleTxt = this.add.text(35, 34, p1Data.title, {
      fontFamily: 'Rajdhani', fontSize: '13px', fontStyle: 'bold', color: '#FFD700'
    });
    p1Container.add([p1NameTxt, p1TitleTxt]);

    // P2 Name Banner
    const p2Container = this.add.container(GAME_WIDTH + 400, GAME_HEIGHT - 110);
    const p2Bar = this.add.graphics();
    p2Bar.fillStyle(0x0038A8, 0.85); // Flag Blue
    p2Bar.fillRoundedRect(-360, 0, 360, 60, { tl: 20, tr: 0, bl: 0, br: 0 });
    p2Bar.lineStyle(2, 0xffffff, 0.6);
    p2Bar.strokeRoundedRect(-360, 0, 360, 60, { tl: 20, tr: 0, bl: 0, br: 0 });
    p2Container.add(p2Bar);

    const p2NameTxt = this.add.text(-260, 8, p2Data.name.toUpperCase(), {
      fontFamily: 'Orbitron', fontSize: '24px', fontStyle: 'bold', color: '#FFF',
      stroke: '#000', strokeThickness: 2
    });
    const p2TitleTxt = this.add.text(-260, 34, p2Data.title, {
      fontFamily: 'Rajdhani', fontSize: '13px', fontStyle: 'bold', color: '#FFC300'
    });
    p2Container.add([p2NameTxt, p2TitleTxt]);

    // Slide in Name Banners
    this.tweens.add({
      targets: p1Container,
      x: 0,
      duration: 500,
      delay: 200,
      ease: 'Back.easeOut'
    });

    this.tweens.add({
      targets: p2Container,
      x: GAME_WIDTH,
      duration: 500,
      delay: 200,
      ease: 'Back.easeOut'
    });

    // Huge glowing VS text in the center
    const vsText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'VS', {
      fontFamily: 'Orbitron',
      fontSize: '120px',
      fontStyle: 'bold italic',
      color: '#FFD700',
      stroke: '#000',
      strokeThickness: 8
    }).setOrigin(0.5).setAlpha(0).setScale(6);

    // VS ring slam/pulse graphics
    const vsGlow = this.add.graphics();
    vsGlow.setAlpha(0);

    // Animate VS text slam down
    this.tweens.add({
      targets: vsText,
      scale: 1,
      alpha: 1,
      duration: 400,
      delay: 500,
      ease: 'Bounce.easeOut',
      onComplete: () => {
        // Play epic cinematic slam sound
        if (this.sound_mgr) this.sound_mgr.playCinematicHit();
        this.cameras.main.shake(300, 0.016);

        // Flash and expand a glow circle around VS
        vsGlow.setAlpha(1);
        this.tweens.add({
          targets: vsGlow,
          alpha: 0,
          scale: 3,
          duration: 500,
          ease: 'Power2.easeOut'
        });
      }
    });

    // Draw the glow pulse circle expanding
    this.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        vsGlow.clear();
        vsGlow.lineStyle(6, 0xFFD700, 0.8);
        vsGlow.strokeCircle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 70);
      }
    });

    // Dynamic background slashes and caution bars
    this.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        overlayG.clear();
        this.stripesOffset = (this.stripesOffset + 1.2) % 40;

        // Animated red backing behind Player 1
        overlayG.fillStyle(0xE63946, 0.22);
        overlayG.beginPath();
        overlayG.moveTo(0, 0);
        overlayG.lineTo(GAME_WIDTH * 0.44, 0);
        overlayG.lineTo(GAME_WIDTH * 0.34, GAME_HEIGHT);
        overlayG.lineTo(0, GAME_HEIGHT);
        overlayG.closePath();
        overlayG.fillPath();

        // Animated blue backing behind Player 2
        overlayG.fillStyle(0x0038A8, 0.22);
        overlayG.beginPath();
        overlayG.moveTo(GAME_WIDTH, 0);
        overlayG.lineTo(GAME_WIDTH * 0.56, 0);
        overlayG.lineTo(GAME_WIDTH * 0.66, GAME_HEIGHT);
        overlayG.lineTo(GAME_WIDTH, GAME_HEIGHT);
        overlayG.closePath();
        overlayG.fillPath();

        // Dark horizontal band backing the caution lines
        overlayG.fillStyle(0x06060c, 0.7);
        overlayG.fillRect(0, GAME_HEIGHT / 2 - 40, GAME_WIDTH, 80);

        // Caution borders
        overlayG.lineStyle(2, 0xFCD116, 0.5);
        overlayG.lineBetween(0, GAME_HEIGHT / 2 - 40, GAME_WIDTH, GAME_HEIGHT / 2 - 40);
        overlayG.lineBetween(0, GAME_HEIGHT / 2 + 40, GAME_WIDTH, GAME_HEIGHT / 2 + 40);

        // Draw moving diagonal caution hashes inside the bar
        overlayG.lineStyle(3, 0xFCD116, 0.35);
        const hashSpacing = 30;
        const hashWidth = 14;
        const totalHashes = GAME_WIDTH / hashSpacing + 4;
        for (let i = -2; i < totalHashes; i++) {
          const x = i * hashSpacing + this.stripesOffset;
          overlayG.lineBetween(x, GAME_HEIGHT / 2 - 35, x + hashWidth, GAME_HEIGHT / 2 + 35);
        }
      }
    });

    // Set depths
    overlayG.setDepth(-1);
    bg.setDepth(-2);
    p1Portrait.setDepth(1);
    p2Portrait.setDepth(1);
    vsText.setDepth(3);
    vsGlow.setDepth(2);
    p1Container.setDepth(4);
    p2Container.setDepth(4);

    // Flashing subtitle prompt
    const subtitleTxt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 35, 'DECIDE THE DESTINY OF THE SENATE!', {
      fontFamily: 'Orbitron', fontSize: '15px', color: '#FFF', fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: subtitleTxt,
      alpha: 1,
      duration: 300,
      delay: 900,
      onComplete: () => {
        this.tweens.add({
          targets: subtitleTxt,
          alpha: 0.3,
          duration: 450,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    });

    // Auto-transition to FightScene after 2.8 seconds
    this.time.delayedCall(2800, () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('FightScene');
      });
    });
  }
}
