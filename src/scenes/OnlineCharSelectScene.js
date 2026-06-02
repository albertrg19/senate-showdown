import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main.js';

export class OnlineCharSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'OnlineCharSelectScene' });
  }

  create() {
    this.cameras.main.fadeIn(400, 0, 0, 0);
    this.sound_mgr = this.registry.get('soundManager');
    this.conn = this.registry.get('p2pConnection');
    this.isHost = this.registry.get('isHost');

    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a0f, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Title
    this.add.text(GAME_WIDTH / 2, 22, 'SELECT YOUR SENATOR', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#FFD700',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);

    const connectionRole = this.isHost ? 'HOST (PLAYER 1)' : 'CHALLENGER (PLAYER 2)';
    this.add.text(GAME_WIDTH / 2, 42, `[ ONLINE MATCH: ${connectionRole} ]`, {
      fontFamily: 'Rajdhani',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#00FFCC',
      letterSpacing: 2
    }).setOrigin(0.5);

    // Decorative line
    const line = this.add.graphics();
    line.lineStyle(2, 0xFFD700, 0.4);
    line.lineBetween(GAME_WIDTH / 2 - 200, 54, GAME_WIDTH / 2 + 200, 54);

    // Player titles
    this.p1Label = this.add.text(GAME_WIDTH * 0.25, 65, 'PLAYER 1', {
      fontFamily: 'Orbitron', fontSize: '15px', color: '#E63946', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.p2Label = this.add.text(GAME_WIDTH * 0.75, 65, 'PLAYER 2', {
      fontFamily: 'Orbitron', fontSize: '15px', color: '#FFC300', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.characters = [
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

    // Local/Remote select trackers
    this.p1Selection = 0;
    this.p2Selection = 1;
    this.p1Confirmed = false;
    this.p2Confirmed = false;

    // Build the panels UI
    this.panels = [];
    const panelWidth = 200;
    const panelHeight = 300;
    const panelY = 100;

    this.characters.forEach((char, i) => {
      const panelX = GAME_WIDTH / 2 - (this.characters.length * (panelWidth + 20)) / 2 + i * (panelWidth + 20) + panelWidth / 2;

      // Draw Panel Background
      const panelG = this.add.graphics();
      panelG.fillStyle(0x1a1a2e, 0.8);
      panelG.fillRoundedRect(panelX - panelWidth / 2, panelY, panelWidth, panelHeight, 8);
      panelG.lineStyle(2, char.color, 0.5);
      panelG.strokeRoundedRect(panelX - panelWidth / 2, panelY, panelWidth, panelHeight, 8);

      // Portrait Image
      const portrait = this.add.image(panelX, panelY + 100, char.portraitKey);
      const scale = Math.min(180 / portrait.width, 160 / portrait.height);
      portrait.setScale(scale).setOrigin(0.5, 0.5);

      // Names & subtitles
      this.add.text(panelX, panelY + 200, char.name, {
        fontFamily: 'Orbitron', fontSize: '14px', color: '#FFF', fontStyle: 'bold'
      }).setOrigin(0.5);

      this.add.text(panelX, panelY + 220, char.title, {
        fontFamily: 'Rajdhani', fontSize: '13px', color: '#FFD700', fontStyle: 'bold'
      }).setOrigin(0.5);

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

      // Selection Borders (visual indicator for P1 and P2 active hover)
      const borderG = this.add.graphics().setDepth(5);
      
      this.panels.push({
        graphics: panelG,
        border: borderG,
        charIndex: i,
        panelX,
        panelWidth,
        panelHeight,
        panelY
      });

      // Touch / Mouse interactive zone
      const hitArea = this.add.zone(panelX, panelY + panelHeight / 2, panelWidth, panelHeight)
        .setInteractive({ useHandCursor: true });

      hitArea.on('pointerover', () => {
        if ((this.isHost && this.p1Confirmed) || (!this.isHost && this.p2Confirmed)) return;
        
        // Update local hover selection
        if (this.isHost) this.p1Selection = i;
        else this.p2Selection = i;

        this.sendSelectionState();
        this.updateVisualBorders();
        if (this.sound_mgr) this.sound_mgr.playMenuSelect();
      });

      hitArea.on('pointerdown', () => {
        this.confirmLocalSelection();
      });
    });

    // P2P Data Handlers
    if (this.conn) {
      this.conn.off('data'); // Clear previous data listeners from LobbyScene
      this.conn.on('data', (data) => {
        if (data && data.type === 'selection_update') {
          if (this.isHost) {
            // Host receives Challenger inputs (Player 2)
            this.p2Selection = data.selection;
            this.p2Confirmed = data.confirmed;
          } else {
            // Challenger receives Host inputs (Player 1)
            this.p1Selection = data.selection;
            this.p1Confirmed = data.confirmed;
          }
          this.updateVisualBorders();
          
          if (data.confirmed && this.sound_mgr) {
            this.sound_mgr.playMenuConfirm();
          }

          // Trigger fight transition if both side readied
          if (this.p1Confirmed && this.p2Confirmed) {
            this.startFightTransition();
          }
        }
      });
    }

    // Default borders rendering
    this.updateVisualBorders();

    // Key shortcut to lock selection
    this.input.keyboard.on('keydown-ENTER', () => {
      this.confirmLocalSelection();
    });

    // Back to Lobby on Esc
    this.input.keyboard.on('keydown-ESC', () => {
      this.backToLobby();
    });
  }

  confirmLocalSelection() {
    if (this.isHost) {
      if (this.p1Confirmed) return;
      this.p1Confirmed = true;
    } else {
      if (this.p2Confirmed) return;
      this.p2Confirmed = true;
    }

    if (this.sound_mgr) this.sound_mgr.playMenuConfirm();
    this.sendSelectionState();
    this.updateVisualBorders();

    if (this.p1Confirmed && this.p2Confirmed) {
      this.startFightTransition();
    }
  }

  sendSelectionState() {
    if (this.conn && this.conn.open) {
      this.conn.send({
        type: 'selection_update',
        selection: this.isHost ? this.p1Selection : this.p2Selection,
        confirmed: this.isHost ? this.p1Confirmed : this.p2Confirmed
      });
    }
  }

  updateVisualBorders() {
    this.panels.forEach((p, idx) => {
      p.border.clear();

      const isP1Here = this.p1Selection === idx;
      const isP2Here = this.p2Selection === idx;

      // Outer glowing selection rectangles
      if (isP1Here) {
        // Red outline for Player 1
        p.border.lineStyle(this.p1Confirmed ? 4 : 2, 0xE63946, 0.9);
        p.border.strokeRoundedRect(p.panelX - p.panelWidth / 2 - 4, p.panelY - 4, p.panelWidth + 8, p.panelHeight + 8, 10);
        
        if (this.p1Confirmed) {
          p.border.fillStyle(0xE63946, 0.2);
          p.border.fillRoundedRect(p.panelX - p.panelWidth / 2 - 4, p.panelY - 4, p.panelWidth + 8, p.panelHeight + 8, 10);
        }
      }

      if (isP2Here) {
        // Yellow outline for Player 2
        p.border.lineStyle(this.p2Confirmed ? 4 : 2, 0xFFC300, 0.9);
        p.border.strokeRoundedRect(p.panelX - p.panelWidth / 2 - 8, p.panelY - 8, p.panelWidth + 16, p.panelHeight + 16, 12);
        
        if (this.p2Confirmed) {
          p.border.fillStyle(0xFFC300, 0.2);
          p.border.fillRoundedRect(p.panelX - p.panelWidth / 2 - 8, p.panelY - 8, p.panelWidth + 16, p.panelHeight + 16, 12);
        }
      }

      // Sync player labels feedback text
      if (isP1Here) {
        this.p1Label.setText(`P1: ${this.characters[idx].name} ${this.p1Confirmed ? '(READY!)' : ''}`);
      }
      if (isP2Here) {
        this.p2Label.setText(`P2: ${this.characters[idx].name} ${this.p2Confirmed ? '(READY!)' : ''}`);
      }
    });
  }

  startFightTransition() {
    const charIds = ['robin', 'kiko'];
    this.registry.set('p1Character', charIds[this.p1Selection]);
    this.registry.set('p2Character', charIds[this.p2Selection]);

    const flash = this.add.graphics().setDepth(99);
    flash.fillStyle(0xFFFFFF, 1);
    flash.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    flash.setAlpha(0);

    this.tweens.add({
      targets: flash,
      alpha: { from: 0, to: 1 },
      duration: 300,
      yoyo: true,
      onComplete: () => {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('FightScene');
        });
      }
    });
  }

  backToLobby() {
    if (this.conn) {
      this.conn.close();
    }
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('LobbyScene');
    });
  }
}
