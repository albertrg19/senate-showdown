import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../main.js';
import { SoundManager } from '../audio/SoundManager.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // Sound
    this.sound_mgr = new SoundManager(this);
    this.sound_mgr.init();

    // Store in registry for other scenes
    this.registry.set('soundManager', this.sound_mgr);

    const bg = this.add.graphics();

    // Animated background
    this.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        bg.clear();
        const t = this.time.now * 0.001;

        // Dark gradient
        for (let i = 0; i < 30; i++) {
          const y = i * (GAME_HEIGHT / 30);
          bg.fillStyle(0x0a0a0f, 1);
          bg.fillRect(0, y, GAME_WIDTH, GAME_HEIGHT / 30 + 1);
        }

        // Animated rays
        bg.fillStyle(0x0038A8, 0.03);
        for (let i = 0; i < 6; i++) {
          const angle = t * 0.3 + i * Math.PI / 3;
          const len = 600;
          bg.fillTriangle(
            GAME_WIDTH / 2, GAME_HEIGHT / 2,
            GAME_WIDTH / 2 + Math.cos(angle) * len, GAME_HEIGHT / 2 + Math.sin(angle) * len,
            GAME_WIDTH / 2 + Math.cos(angle + 0.15) * len, GAME_HEIGHT / 2 + Math.sin(angle + 0.15) * len
          );
        }

        // Senate silhouette
        bg.fillStyle(0x1a1520, 0.5);
        bg.fillRect(200, 350, 560, 190);
        // Columns
        for (let i = 0; i < 8; i++) {
          bg.fillRect(220 + i * 70, 280, 20, 260);
        }
        // Dome
        bg.lineStyle(2, 0x1a1520, 0.3);
        bg.beginPath();
        bg.arc(480, 300, 150, Math.PI, 0, false);
        bg.strokePath();
      }
    });

    // Title
    const titleShadow = this.add.text(GAME_WIDTH / 2 + 3, 103, 'SENATE\nSHOWDOWN', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '64px',
      fontStyle: 'bold',
      color: '#000',
      align: 'center',
      lineSpacing: -10
    }).setOrigin(0.5);

    const title = this.add.text(GAME_WIDTH / 2, 100, 'SENATE\nSHOWDOWN', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '64px',
      fontStyle: 'bold',
      color: '#FFD700',
      align: 'center',
      lineSpacing: -10,
      stroke: '#8B6914',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Title glow pulse
    this.tweens.add({
      targets: title,
      alpha: { from: 0.85, to: 1 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 175, '🇵🇭  ANG LABAN NG BAYAN SA SENADO  🇵🇭', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '18px',
      color: '#CE1126',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Decorative line
    const line = this.add.graphics();
    line.lineStyle(2, 0xFFD700, 0.5);
    line.lineBetween(GAME_WIDTH / 2 - 180, 195, GAME_WIDTH / 2 + 180, 195);
    line.fillStyle(0xFFD700, 0.8);
    line.fillCircle(GAME_WIDTH / 2, 195, 4);

    // Menu options
    const menuItems = [
      { text: '⚔️  LOCAL BATTLE', scene: 'CharacterSelectScene', mode: 'local' },
      { text: '🤺  VS CPU', scene: 'CharacterSelectScene', mode: 'solo' },
      { text: '🌐  ONLINE BATTLE', scene: 'LobbyScene', mode: 'online' },
    ];

    const menuGroup = [];
    menuItems.forEach((item, i) => {
      const y = 260 + i * 55;

      const btn = this.add.text(GAME_WIDTH / 2, y, item.text, {
        fontFamily: 'Orbitron, monospace',
        fontSize: '24px',
        fontStyle: 'bold',
        color: item.disabled ? '#444' : '#FFF',
        stroke: '#000',
        strokeThickness: 3,
        padding: { x: 30, y: 10 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: !item.disabled });

      if (item.disabled) {
        const soon = this.add.text(GAME_WIDTH / 2 + 160, y, 'SOON', {
          fontFamily: 'Rajdhani', fontSize: '12px', color: '#FFD700', fontStyle: 'bold'
        }).setOrigin(0.5);
      }

      if (!item.disabled) {
        btn.on('pointerover', () => {
          btn.setColor('#FFD700');
          btn.setScale(1.08);
          this.sound_mgr.resume();
          this.sound_mgr.playMenuSelect();
        });
        btn.on('pointerout', () => {
          btn.setColor('#FFF');
          btn.setScale(1);
        });
        btn.on('pointerdown', () => {
          this.sound_mgr.playMenuConfirm();
          this.registry.set('gameMode', item.mode);
          this.cameras.main.fadeOut(400, 0, 0, 0);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start(item.scene);
          });
        });
      }

      menuGroup.push(btn);
    });

    // Controls info — Street Fighter 6-button layout
    this.add.text(GAME_WIDTH / 2, 428, 'P1: WASD  |  LP:U  MP:O  HP:I  |  LK:J  MK:L  HK:K', {
      fontFamily: 'Rajdhani, sans-serif', fontSize: '13px', color: '#666'
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 446, 'P2: ARROWS  |  LP:7  MP:9  HP:8  |  LK:4  MK:6  HK:5', {
      fontFamily: 'Rajdhani, sans-serif', fontSize: '13px', color: '#555'
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 463, 'Special: ↓↘→+P  |  DP: →↓↘+P  |  SUPER: ↓↘→↓↘→+P (Full Meter)', {
      fontFamily: 'Rajdhani, sans-serif', fontSize: '12px', color: '#444'
    }).setOrigin(0.5);

    // Version
    this.add.text(GAME_WIDTH - 10, GAME_HEIGHT - 10, 'v1.0 BETA', {
      fontFamily: 'Rajdhani', fontSize: '11px', color: '#333'
    }).setOrigin(1, 1);

    // PH flag accent at bottom
    const flagBar = this.add.graphics();
    flagBar.fillStyle(0x0038A8, 0.6);
    flagBar.fillRect(0, GAME_HEIGHT - 4, GAME_WIDTH / 3, 4);
    flagBar.fillStyle(0xCE1126, 0.6);
    flagBar.fillRect(GAME_WIDTH / 3, GAME_HEIGHT - 4, GAME_WIDTH / 3, 4);
    flagBar.fillStyle(0xFCD116, 0.6);
    flagBar.fillRect(GAME_WIDTH * 2 / 3, GAME_HEIGHT - 4, GAME_WIDTH / 3, 4);

    // Keyboard shortcut to start
    this.input.keyboard.on('keydown-ENTER', () => {
      this.sound_mgr.resume();
      this.sound_mgr.playMenuConfirm();
      this.registry.set('gameMode', 'local');
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('CharacterSelectScene');
      });
    });
  }
}
