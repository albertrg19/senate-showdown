import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main.js';

export class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CharacterSelectScene' });
  }

  create() {
    this.cameras.main.fadeIn(400, 0, 0, 0);
    this.sound_mgr = this.registry.get('soundManager');

    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a0f, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Title
    const mode = this.registry.get('gameMode') === 'solo' ? 'VS CPU' : 'LOCAL BATTLE';
    
    this.add.text(GAME_WIDTH / 2, 22, 'SELECT YOUR SENATOR', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#FFD700',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 42, `[ ${mode} ]`, {
      fontFamily: 'Rajdhani',
      fontSize: '12px',
      fontStyle: 'bold',
      color: mode === 'VS CPU' ? '#FFC300' : '#E63946',
      letterSpacing: 2
    }).setOrigin(0.5);

    // Decorative line
    const line = this.add.graphics();
    line.lineStyle(2, 0xFFD700, 0.4);
    line.lineBetween(GAME_WIDTH / 2 - 200, 54, GAME_WIDTH / 2 + 200, 54);

    // P1 and P2 labels
    this.add.text(GAME_WIDTH * 0.25, 65, 'PLAYER 1', {
      fontFamily: 'Orbitron', fontSize: '16px', color: '#E63946', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH * 0.75, 65, 'PLAYER 2', {
      fontFamily: 'Orbitron', fontSize: '16px', color: '#FFC300', fontStyle: 'bold'
    }).setOrigin(0.5);

    // Character data for selection
    const characters = [
      {
        id: 'robin',
        name: 'Robin Padilla',
        title: 'THE BAD BOY',
        subtitle: '"Utol mo sa Senado"',
        color: 0xE63946,
        portraitKey: 'robin_portrait',
        stats: { power: 9, speed: 7, defense: 5, special: 8 }
      },
      {
        id: 'kiko',
        name: 'Kiko Pangilinan',
        title: 'THE POLICY WARRIOR',
        subtitle: '"Laban natin ito!"',
        color: 0xFFC300,
        portraitKey: 'kiko_portrait',
        stats: { power: 6, speed: 6, defense: 8, special: 9 }
      }
    ];

    this.p1Selection = 0;
    this.p2Selection = 1;
    this.p1Confirmed = false;
    this.p2Confirmed = false;

    // Character panels
    const panelWidth = 200;
    const panelHeight = 300;
    const panelY = 100;

    // Draw character panels
    characters.forEach((char, i) => {
      const panelX = GAME_WIDTH / 2 - (characters.length * (panelWidth + 20)) / 2 + i * (panelWidth + 20) + panelWidth / 2;

      // Panel background
      const panel = this.add.graphics();
      panel.fillStyle(0x1a1a2e, 0.8);
      panel.fillRoundedRect(panelX - panelWidth / 2, panelY, panelWidth, panelHeight, 8);
      panel.lineStyle(2, char.color, 0.5);
      panel.strokeRoundedRect(panelX - panelWidth / 2, panelY, panelWidth, panelHeight, 8);

      // Portrait
      const portrait = this.add.image(panelX, panelY + 100, char.portraitKey);
      const scale = Math.min(180 / portrait.width, 160 / portrait.height);
      portrait.setScale(scale);
      portrait.setOrigin(0.5, 0.5);

      // Character name
      this.add.text(panelX, panelY + 200, char.name, {
        fontFamily: 'Orbitron', fontSize: '14px', color: '#FFF', fontStyle: 'bold'
      }).setOrigin(0.5);

      // Title
      this.add.text(panelX, panelY + 220, char.title, {
        fontFamily: 'Rajdhani', fontSize: '13px', color: '#FFD700', fontStyle: 'bold'
      }).setOrigin(0.5);

      // Subtitle
      this.add.text(panelX, panelY + 238, char.subtitle, {
        fontFamily: 'Rajdhani', fontSize: '11px', color: '#aaa', fontStyle: 'italic'
      }).setOrigin(0.5);

      // Stats
      const statY = panelY + 258;
      const statNames = ['PWR', 'SPD', 'DEF', 'SPC'];
      const statValues = [char.stats.power, char.stats.speed, char.stats.defense, char.stats.special];
      const statBar = this.add.graphics();

      statNames.forEach((stat, si) => {
        const sy = statY + si * 14;
        this.add.text(panelX - 80, sy, stat, {
          fontFamily: 'Rajdhani', fontSize: '10px', color: '#888'
        });

        statBar.fillStyle(0x333, 1);
        statBar.fillRoundedRect(panelX - 45, sy + 2, 100, 6, 2);
        statBar.fillStyle(char.color, 0.8);
        statBar.fillRoundedRect(panelX - 45, sy + 2, statValues[si] * 10, 6, 2);
      });

      // Make interactive
      const hitArea = this.add.zone(panelX, panelY + panelHeight / 2, panelWidth, panelHeight)
        .setInteractive({ useHandCursor: true });

      hitArea.on('pointerover', () => {
        panel.clear();
        panel.fillStyle(0x1a1a2e, 0.9);
        panel.fillRoundedRect(panelX - panelWidth / 2, panelY, panelWidth, panelHeight, 8);
        panel.lineStyle(3, char.color, 0.9);
        panel.strokeRoundedRect(panelX - panelWidth / 2, panelY, panelWidth, panelHeight, 8);
        if (this.sound_mgr) this.sound_mgr.playMenuSelect();
      });

      hitArea.on('pointerout', () => {
        panel.clear();
        panel.fillStyle(0x1a1a2e, 0.8);
        panel.fillRoundedRect(panelX - panelWidth / 2, panelY, panelWidth, panelHeight, 8);
        panel.lineStyle(2, char.color, 0.5);
        panel.strokeRoundedRect(panelX - panelWidth / 2, panelY, panelWidth, panelHeight, 8);
      });

      hitArea.on('pointerdown', () => {
        if (!this.p1Confirmed) {
          this.p1Selection = i;
          this.p1Confirmed = true;
          this.p2Selection = i === 0 ? 1 : 0;
          this.p2Confirmed = true;
          this.startFight();
        }
      });
    });

    // VS text in center
    this.add.text(GAME_WIDTH / 2, panelY + 100, 'VS', {
      fontFamily: 'Orbitron', fontSize: '32px', color: '#FFD700',
      fontStyle: 'bold', stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0.4);

    // Instructions
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 40, 'Click a character to start  |  Press ENTER for default matchup', {
      fontFamily: 'Rajdhani', fontSize: '14px', color: '#666'
    }).setOrigin(0.5);

    // PH flag bar
    const flagBar = this.add.graphics();
    flagBar.fillStyle(0x0038A8, 0.6);
    flagBar.fillRect(0, GAME_HEIGHT - 4, GAME_WIDTH / 3, 4);
    flagBar.fillStyle(0xCE1126, 0.6);
    flagBar.fillRect(GAME_WIDTH / 3, GAME_HEIGHT - 4, GAME_WIDTH / 3, 4);
    flagBar.fillStyle(0xFCD116, 0.6);
    flagBar.fillRect(GAME_WIDTH * 2 / 3, GAME_HEIGHT - 4, GAME_WIDTH / 3, 4);

    // Quick start
    this.input.keyboard.on('keydown-ENTER', () => {
      if (!this.p1Confirmed) {
        this.p1Selection = 0;
        this.p2Selection = 1;
        this.p1Confirmed = true;
        this.p2Confirmed = true;
        this.startFight();
      }
    });
  }

  startFight() {
    if (this.sound_mgr) this.sound_mgr.playMenuConfirm();

    const charIds = ['robin', 'kiko'];

    this.registry.set('p1Character', charIds[this.p1Selection]);
    this.registry.set('p2Character', charIds[this.p2Selection]);

    // Brief VS flash
    const flash = this.add.graphics();
    flash.fillStyle(0xFFFFFF, 1);
    flash.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    flash.setAlpha(0);

    this.tweens.add({
      targets: flash,
      alpha: { from: 0, to: 1 },
      duration: 200,
      yoyo: true,
      onComplete: () => {
        this.scene.start('FightScene');
      }
    });
  }
}
