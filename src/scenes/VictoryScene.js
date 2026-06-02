import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main.js';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'VictoryScene' });
  }

  init(data) {
    this.winnerData = data.winner;
    this.winnerId = data.winnerId;
    this.p1Wins = data.p1Wins;
    this.p2Wins = data.p2Wins;
  }

  create() {
    this.cameras.main.fadeIn(500, 0, 0, 0);
    this.sound_mgr = this.registry.get('soundManager');

    const bg = this.add.graphics();

    // Animated dark background with winner's color
    const winColor = this.winnerData.energyColor;
    this.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        bg.clear();
        bg.fillStyle(0x0a0a0f, 1);
        bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        const t = this.time.now * 0.001;
        // Radial glow
        for (let i = 5; i > 0; i--) {
          bg.fillStyle(winColor, 0.02 * i);
          bg.fillCircle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 100 + i * 60 + Math.sin(t) * 20);
        }

        // Confetti-like particles
        bg.fillStyle(0xFFD700, 0.1);
        for (let i = 0; i < 20; i++) {
          const px = Math.sin(t * 0.5 + i * 17.3) * 400 + GAME_WIDTH / 2;
          const py = (t * 30 + i * 47) % (GAME_HEIGHT + 50) - 25;
          bg.fillRect(px, py, 3, 8);
        }
      }
    });

    // Winner portrait
    const portrait = this.add.image(GAME_WIDTH / 2, 200, this.winnerData.portraitKey);
    const scale = Math.min(250 / portrait.width, 250 / portrait.height);
    portrait.setScale(scale);
    portrait.setOrigin(0.5, 0.5);

    // Portrait glow ring
    const ring = this.add.graphics();
    this.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        ring.clear();
        ring.lineStyle(3, winColor, 0.5 + Math.sin(this.time.now * 0.003) * 0.3);
        ring.strokeCircle(GAME_WIDTH / 2, 200, 130 + Math.sin(this.time.now * 0.002) * 5);
      }
    });

    // "WINS" text
    this.add.text(GAME_WIDTH / 2, 30, 'WINNER!', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '42px',
      fontStyle: 'bold',
      color: '#FFD700',
      stroke: '#000',
      strokeThickness: 5
    }).setOrigin(0.5);

    // Character name
    this.add.text(GAME_WIDTH / 2, 340, this.winnerData.name, {
      fontFamily: 'Orbitron, monospace',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#FFF',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Title
    this.add.text(GAME_WIDTH / 2, 370, this.winnerData.title, {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '18px',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Win quote
    this.add.text(GAME_WIDTH / 2, 400, this.winnerData.winQuote, {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '16px',
      color: '#aaa',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Score
    this.add.text(GAME_WIDTH / 2, 435, `${this.p1Wins} — ${this.p2Wins}`, {
      fontFamily: 'Orbitron', fontSize: '24px', color: '#FFD700',
      fontStyle: 'bold', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5);

    // Buttons
    const rematchBtn = this.add.text(GAME_WIDTH / 2 - 120, 485, '🔄 REMATCH', {
      fontFamily: 'Orbitron', fontSize: '18px', color: '#FFF',
      fontStyle: 'bold', stroke: '#000', strokeThickness: 3,
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const menuBtn = this.add.text(GAME_WIDTH / 2 + 120, 485, '🏠 MENU', {
      fontFamily: 'Orbitron', fontSize: '18px', color: '#FFF',
      fontStyle: 'bold', stroke: '#000', strokeThickness: 3,
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    // Button interactions
    [rematchBtn, menuBtn].forEach(btn => {
      btn.on('pointerover', () => {
        btn.setColor('#FFD700');
        btn.setScale(1.1);
        if (this.sound_mgr) this.sound_mgr.playMenuSelect();
      });
      btn.on('pointerout', () => {
        btn.setColor('#FFF');
        btn.setScale(1);
      });
    });

    rematchBtn.on('pointerdown', () => {
      if (this.sound_mgr) this.sound_mgr.playMenuConfirm();
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('FightScene');
      });
    });

    menuBtn.on('pointerdown', () => {
      if (this.sound_mgr) this.sound_mgr.playMenuConfirm();
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    });

    // Keyboard shortcuts
    this.input.keyboard.on('keydown-ENTER', () => {
      this.scene.start('FightScene');
    });
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.start('MenuScene');
    });

    // PH flag bar
    const flagBar = this.add.graphics();
    flagBar.fillStyle(0x0038A8, 0.6);
    flagBar.fillRect(0, GAME_HEIGHT - 4, GAME_WIDTH / 3, 4);
    flagBar.fillStyle(0xCE1126, 0.6);
    flagBar.fillRect(GAME_WIDTH / 3, GAME_HEIGHT - 4, GAME_WIDTH / 3, 4);
    flagBar.fillStyle(0xFCD116, 0.6);
    flagBar.fillRect(GAME_WIDTH * 2 / 3, GAME_HEIGHT - 4, GAME_WIDTH / 3, 4);
  }
}
