import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main.js';

export class MapSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MapSelectScene' });
  }

  init() {
    this.sound_mgr = this.registry.get('soundManager');
    this.gameMode = this.registry.get('gameMode') || 'local';
    this.conn = this.registry.get('p2pConnection');
    this.isHost = this.registry.get('isHost');

    this.stages = [
      {
        key: 'senate_hall',
        name: 'SENATE SESSION HALL',
        location: 'PASAY CITY, METRO MANILA',
        description: 'The historic session hall where legislative debates shape the nation.'
      },
      {
        key: 'the_ruins',
        name: 'THE RUINS MANSION',
        location: 'TALISAY CITY, NEGROS OCCIDENTAL',
        description: 'Neo-Roman architectural columns standing tall against a vibrant blue sky.'
      },
      {
        key: 'bohol',
        name: 'CHOCOLATE HILLS',
        location: 'CARMEN, BOHOL PROVINCE',
        description: 'The deck view of the majestic green geological domes stretching to the horizon.'
      },
      {
        key: 'ifugao',
        name: 'IFUGAO RICE TERRACES',
        location: 'BANAUE, IFUGAO PROVINCE',
        description: 'Majestic hand-carved agricultural terraces scaling the mountainous landscape.'
      },
      {
        key: 'albay',
        name: 'MAYON VOLCANO ruins',
        location: 'DARAGA, ALBAY PROVINCE',
        description: 'The iconic perfect-cone volcano backdrop and stone church belltower ruins.'
      }
    ];

    this.selectedIndex = 0;
    this.confirmed = false;
  }

  create() {
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // Decorative backdrop grid
    this.bgGraphics = this.add.graphics();
    this.bgOffset = 0;

    // Header Title
    this.add.text(GAME_WIDTH / 2, 28, 'SELECT BATTLEGROUND', {
      fontFamily: 'Orbitron', fontSize: '28px', fontStyle: 'bold', color: '#FFD700',
      stroke: '#000', strokeThickness: 5
    }).setOrigin(0.5);

    const modeText = this.gameMode === 'online'
      ? (this.isHost ? 'ONLINE MATCH: HOST SELECTING' : 'ONLINE MATCH: WAITING FOR HOST')
      : (this.gameMode === 'solo' ? 'VS CPU BATTLE' : 'LOCAL BATTLE');
      
    this.add.text(GAME_WIDTH / 2, 54, `[ ${modeText} ]`, {
      fontFamily: 'Rajdhani', fontSize: '13px', fontStyle: 'bold',
      color: this.isHost || this.gameMode !== 'online' ? '#E63946' : '#FFC300',
      letterSpacing: 2
    }).setOrigin(0.5);

    // Dynamic hazard line
    const headerLine = this.add.graphics();
    headerLine.lineStyle(2, 0xFFD700, 0.4);
    headerLine.lineBetween(GAME_WIDTH / 2 - 250, 68, GAME_WIDTH / 2 + 250, 68);

    // Layout values for stage cards
    this.cardWidth = 142;
    this.cardHeight = 44;
    this.cardSpacing = 14;
    const totalW = this.stages.length * this.cardWidth + (this.stages.length - 1) * this.cardSpacing;
    this.gridStartX = (GAME_WIDTH - totalW) / 2 + this.cardWidth / 2;
    this.gridY = 105;

    // Draw stage cards
    this.cardContainers = [];
    this.stages.forEach((stage, i) => {
      const cx = this.gridStartX + i * (this.cardWidth + this.cardSpacing);
      const container = this.add.container(cx, this.gridY);

      // Card outline / backing
      const cardBg = this.add.graphics();
      cardBg.fillStyle(0x13131e, 0.85);
      cardBg.fillRoundedRect(-this.cardWidth / 2, -this.cardHeight / 2, this.cardWidth, this.cardHeight, 4);
      cardBg.lineStyle(1.5, 0x33334c, 0.8);
      cardBg.strokeRoundedRect(-this.cardWidth / 2, -this.cardHeight / 2, this.cardWidth, this.cardHeight, 4);
      container.add(cardBg);

      // Small stage name text
      const nameTxt = this.add.text(0, 0, stage.name, {
        fontFamily: 'Orbitron', fontSize: '9px', fontStyle: 'bold', color: '#888',
        align: 'center', wordWrap: { width: this.cardWidth - 10 }
      }).setOrigin(0.5);
      container.add(nameTxt);

      container.bg = cardBg;
      container.txt = nameTxt;
      this.cardContainers.push(container);
    });

    // Central Preview Stage Area
    this.previewX = GAME_WIDTH / 2;
    this.previewY = 275;
    this.previewW = 440;
    this.previewH = 210;

    // Outer glow graphics
    this.previewGlow = this.add.graphics();
    
    // Large stage preview sprite
    this.previewSprite = this.add.image(this.previewX, this.previewY, 'senate_hall');
    this.previewSprite.setDisplaySize(this.previewW, this.previewH);
    
    // Preview label details
    this.stageNameTxt = this.add.text(GAME_WIDTH / 2, 400, 'SENATE SESSION HALL', {
      fontFamily: 'Orbitron', fontSize: '20px', fontStyle: 'bold', color: '#FFF',
      stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5);

    this.stageLocationTxt = this.add.text(GAME_WIDTH / 2, 423, 'PASAY CITY, METRO MANILA', {
      fontFamily: 'Rajdhani', fontSize: '13px', fontStyle: 'bold', color: '#FFD700',
      letterSpacing: 1.5
    }).setOrigin(0.5);

    this.stageDescTxt = this.add.text(GAME_WIDTH / 2, 444, 'The historic session hall where legislative debates shape the nation.', {
      fontFamily: 'Rajdhani', fontSize: '12px', color: '#ccc', align: 'center',
      wordWrap: { width: 480 }
    }).setOrigin(0.5);

    // Keyboard controls instructions footer
    const controlsMsg = (this.gameMode === 'online' && !this.isHost)
      ? 'PLEASE WAIT FOR HOST TO SELECT ARENA...'
      : 'P1: PRESS A/D TO HIGHLIGHT STAGE  |  SPACE TO SELECT';
    this.footerText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 26, controlsMsg, {
      fontFamily: 'Rajdhani', fontSize: '12px', color: '#777', fontStyle: 'bold',
      letterSpacing: 1
    }).setOrigin(0.5);

    // Setup input keys
    const kb = this.input.keyboard;
    this.keys = {
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      arrowLeft: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      arrowRight: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      confirm1: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      confirm2: kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
      confirm3: kb.addKey(Phaser.Input.Keyboard.KeyCodes.U),
      cancel: kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
    };

    // Listen for WebRTC data if online
    if (this.gameMode === 'online' && this.conn) {
      this.conn.off('data');
      this.conn.on('data', (data) => {
        if (data && data.type === 'stage_highlight') {
          this.selectedIndex = data.index;
          this.updateHighlight();
          if (this.sound_mgr) this.sound_mgr.playMenuSelect();
        } else if (data && data.type === 'stage_confirm') {
          this.registry.set('selectedStage', data.stageKey);
          this.confirmed = true;
          if (this.sound_mgr) this.sound_mgr.playMenuConfirm();
          this.startMatchTransition();
        }
      });

      this.conn.on('close', () => this.handleDisconnect());
      this.conn.on('error', () => this.handleDisconnect());
    }

    // Initialize display highlight
    this.updateHighlight();
  }

  update(time, delta) {
    // Backdrop lines
    this.bgGraphics.clear();
    this.bgOffset = (this.bgOffset + 0.4) % 40;
    this.bgGraphics.lineStyle(1, 0x1d1d2e, 0.6);
    for (let x = 0; x < GAME_WIDTH; x += 40) {
      this.bgGraphics.lineBetween(x, 0, x, GAME_HEIGHT);
    }
    for (let y = 0; y < GAME_HEIGHT; y += 40) {
      this.bgGraphics.lineBetween(0, y, GAME_WIDTH, y);
    }

    // Animate stage preview outer neon frame
    this.drawPreviewFrame(time);

    // Keyboard checks for selector (Host or Offline only)
    if (!this.confirmed && (this.gameMode !== 'online' || this.isHost)) {
      let moved = false;

      if (Phaser.Input.Keyboard.JustDown(this.keys.left) || Phaser.Input.Keyboard.JustDown(this.keys.arrowLeft)) {
        this.selectedIndex = (this.selectedIndex - 1 + this.stages.length) % this.stages.length;
        moved = true;
      } else if (Phaser.Input.Keyboard.JustDown(this.keys.right) || Phaser.Input.Keyboard.JustDown(this.keys.arrowRight)) {
        this.selectedIndex = (this.selectedIndex + 1) % this.stages.length;
        moved = true;
      }

      if (moved) {
        this.updateHighlight();
        if (this.sound_mgr) this.sound_mgr.playMenuSelect();

        // Sync highlight to client
        if (this.gameMode === 'online' && this.conn && this.conn.open) {
          this.conn.send({
            type: 'stage_highlight',
            index: this.selectedIndex
          });
        }
      }

      // Confirm keys
      if (Phaser.Input.Keyboard.JustDown(this.keys.confirm1) || Phaser.Input.Keyboard.JustDown(this.keys.confirm2) || Phaser.Input.Keyboard.JustDown(this.keys.confirm3)) {
        this.confirmSelection();
      }

      // Back key
      if (Phaser.Input.Keyboard.JustDown(this.keys.cancel)) {
        if (this.gameMode === 'online') {
          this.handleDisconnect();
        } else {
          if (this.sound_mgr) this.sound_mgr.playMenuConfirm();
          this.scene.start('CharacterSelectScene');
        }
      }
    }
  }

  updateHighlight() {
    const stage = this.stages[this.selectedIndex];

    // Update center details
    this.previewSprite.setTexture(stage.key);
    this.stageNameTxt.setText(stage.name);
    this.stageLocationTxt.setText(stage.location);
    this.stageDescTxt.setText(stage.description);

    // Update cards styling
    this.cardContainers.forEach((container, idx) => {
      const isSelected = (idx === this.selectedIndex);
      const bg = container.bg;
      const txt = container.txt;

      bg.clear();
      if (isSelected) {
        bg.fillStyle(0xE63946, 0.2);
        bg.fillRoundedRect(-this.cardWidth / 2, -this.cardHeight / 2, this.cardWidth, this.cardHeight, 4);
        bg.lineStyle(2, 0xE63946, 1);
        bg.strokeRoundedRect(-this.cardWidth / 2, -this.cardHeight / 2, this.cardWidth, this.cardHeight, 4);

        txt.setColor('#FFF');
        txt.setFontSize('10px');
      } else {
        bg.fillStyle(0x13131e, 0.85);
        bg.fillRoundedRect(-this.cardWidth / 2, -this.cardHeight / 2, this.cardWidth, this.cardHeight, 4);
        bg.lineStyle(1.5, 0x33334c, 0.8);
        bg.strokeRoundedRect(-this.cardWidth / 2, -this.cardHeight / 2, this.cardWidth, this.cardHeight, 4);

        txt.setColor('#888');
        txt.setFontSize('9px');
      }
    });
  }

  confirmSelection() {
    this.confirmed = true;
    const stage = this.stages[this.selectedIndex];
    this.registry.set('selectedStage', stage.key);

    if (this.sound_mgr) this.sound_mgr.playMenuConfirm();

    // Sync stage key to peer
    if (this.gameMode === 'online' && this.conn && this.conn.open) {
      this.conn.send({
        type: 'stage_confirm',
        stageKey: stage.key
      });
    }

    this.startMatchTransition();
  }

  startMatchTransition() {
    // Dynamic screen flash
    const flash = this.add.graphics().setDepth(999);
    flash.fillStyle(0xFFFFFF, 1);
    flash.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    flash.setAlpha(0);

    this.tweens.add({
      targets: flash,
      alpha: { from: 0, to: 0.85 },
      duration: 180,
      yoyo: true,
      onComplete: () => {
        this.scene.start('VSScene');
      }
    });
  }

  drawPreviewFrame(time) {
    const g = this.previewGlow;
    g.clear();

    const glowColor = 0xE63946; // Red outline
    const pulse = Math.sin(time * 0.006) * 2;

    // Draw double neon border outline
    g.lineStyle(2 + pulse / 2, glowColor, 0.7);
    g.strokeRect(
      this.previewX - this.previewW / 2 - 2,
      this.previewY - this.previewH / 2 - 2,
      this.previewW + 4,
      this.previewH + 4
    );

    g.lineStyle(1, 0xFFFFFF, 0.3);
    g.strokeRect(
      this.previewX - this.previewW / 2 - 5,
      this.previewY - this.previewH / 2 - 5,
      this.previewW + 10,
      this.previewH + 10
    );
  }

  handleDisconnect() {
    if (this.conn) {
      this.conn.close();
    }
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('LobbyScene');
    });
  }
}
