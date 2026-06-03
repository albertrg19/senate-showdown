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
    this.isHost = this.registry.get('isHost'); // Host controls P1, Challenger controls P2

    // Define 2x3 Grid Slots
    this.characters = [
      {
        id: 'robin',
        name: 'Robin Padilla',
        title: 'THE BAD BOY',
        subtitle: '"Utol mo sa Senado"',
        color: 0xE63946,
        portraitKey: 'robin_portrait',
        faceKey: 'robin_face_pixel',
        stats: { pwr: 9, spd: 7, def: 5, spc: 8 },
        locked: false
      },
      {
        id: 'kiko',
        name: 'Kiko Pangilinan',
        title: 'THE POLICY WARRIOR',
        subtitle: '"Laban natin ito!"',
        color: 0xFFC300,
        portraitKey: 'kiko_portrait',
        faceKey: 'kiko_face_pixel',
        stats: { pwr: 6, spd: 6, def: 8, spc: 9 },
        locked: false
      },
      {
        id: 'pacquiao',
        name: 'Manny Pacquiao',
        title: 'THE FIGHTING SENATOR',
        subtitle: '🔒 LOCKED CHARACTER',
        color: 0x888888,
        portraitKey: 'robin_portrait',
        faceKey: 'lock_box',
        stats: { pwr: 10, spd: 8, def: 6, spc: 5 },
        locked: true
      },
      {
        id: 'miriam',
        name: 'Miriam Santiago',
        title: 'THE IRON LADY',
        subtitle: '🔒 LOCKED CHARACTER',
        color: 0x888888,
        portraitKey: 'kiko_portrait',
        faceKey: 'lock_box',
        stats: { pwr: 8, spd: 7, def: 6, spc: 10 },
        locked: true
      },
      {
        id: 'bato',
        name: 'Bato Dela Rosa',
        title: 'THE ROUGH JUSTICE',
        subtitle: '🔒 LOCKED CHARACTER',
        color: 0x888888,
        portraitKey: 'robin_portrait',
        faceKey: 'lock_box',
        stats: { pwr: 8, spd: 5, def: 9, spc: 6 },
        locked: true
      },
      {
        id: 'random',
        name: 'RANDOM SELECT',
        title: 'DECIDE BY DESTINY',
        subtitle: 'Roll the Dice!',
        color: 0x00FFCC,
        portraitKey: 'random_cycle',
        faceKey: 'random_box',
        stats: { pwr: 7, spd: 7, def: 7, spc: 7 },
        locked: false
      }
    ];

    // Grid Positions calculation (2 rows, 3 columns)
    this.gridCols = 3;
    this.gridRows = 2;
    this.cellW = 85;
    this.cellH = 85;
    this.cellSpacing = 16;
    
    // Grid center: X = 480, Y = 310
    this.gridStartX = GAME_WIDTH / 2 - ((this.cellW * this.gridCols) + (this.cellSpacing * (this.gridCols - 1))) / 2 + this.cellW / 2;
    this.gridStartY = 240;

    // Selections state
    this.p1Selection = 0; // Host (P1)
    this.p2Selection = 1; // Challenger (P2)
    this.p1Confirmed = false;
    this.p2Confirmed = false;

    // Map local index pointer to host/challenger variables
    this.localIndex = this.isHost ? 0 : 1;

    // Random cycle
    this.randomCycleIndex = 0;
    this.time.addEvent({
      delay: 120,
      loop: true,
      callback: () => {
        this.randomCycleIndex = (this.randomCycleIndex + 1) % 2;
        this.updatePanels();
      }
    });

    // Background graphics
    this.bgGraphics = this.add.graphics();
    this.bgOffset = 0;

    // Title Texts
    this.add.text(GAME_WIDTH / 2, 28, 'SELECT YOUR SENATOR', {
      fontFamily: 'Orbitron', fontSize: '28px', fontStyle: 'bold', color: '#FFD700',
      stroke: '#000', strokeThickness: 5
    }).setOrigin(0.5);

    const connectionRole = this.isHost ? 'HOST (PLAYER 1)' : 'CHALLENGER (PLAYER 2)';
    this.add.text(GAME_WIDTH / 2, 54, `[ ONLINE MATCH: ${connectionRole} ]`, {
      fontFamily: 'Rajdhani', fontSize: '12px', fontStyle: 'bold', color: '#00FFCC',
      letterSpacing: 2
    }).setOrigin(0.5);

    // Decorative line
    const headerLine = this.add.graphics();
    headerLine.lineStyle(2, 0xFFD700, 0.4);
    headerLine.lineBetween(GAME_WIDTH / 2 - 250, 68, GAME_WIDTH / 2 + 250, 68);

    // Keyboard bindings for the local player
    const kb = this.input.keyboard;
    this.localKeys = {
      up: [kb.addKey(Phaser.Input.Keyboard.KeyCodes.W), kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP)],
      left: [kb.addKey(Phaser.Input.Keyboard.KeyCodes.A), kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT)],
      down: [kb.addKey(Phaser.Input.Keyboard.KeyCodes.S), kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN)],
      right: [kb.addKey(Phaser.Input.Keyboard.KeyCodes.D), kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)],
      confirm: [
        kb.addKey(Phaser.Input.Keyboard.KeyCodes.U),
        kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        kb.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_SEVEN),
        kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
      ],
      cancel: [kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC), kb.addKey(Phaser.Input.Keyboard.KeyCodes.BACKSPACE)]
    };

    // Draw selection grid
    this.drawSelectionGrid();

    // Create Left & Right Preview Panels
    this.createP1Panel();
    this.createP2Panel();

    // Render joint cursors
    this.cursorGraphics = this.add.graphics().setDepth(10);

    // Central VS text
    this.vsText = this.add.text(GAME_WIDTH / 2, 140, 'VS', {
      fontFamily: 'Orbitron', fontSize: '40px', fontStyle: 'bold italic',
      color: '#FFD700', stroke: '#000', strokeThickness: 5
    }).setOrigin(0.5).setAlpha(0.65);

    this.tweens.add({
      targets: this.vsText,
      scale: { from: 0.9, to: 1.1 },
      alpha: { from: 0.5, to: 0.8 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Control instructions footer
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 38, 'Use WASD / ARROWS to browse  |  SPACE / ENTER to lock  |  ESC to disconnect', {
      fontFamily: 'Rajdhani', fontSize: '13px', color: '#888'
    }).setOrigin(0.5);

    // PH Flag accent line
    const flagBar = this.add.graphics();
    flagBar.fillStyle(0x0038A8, 0.6);
    flagBar.fillRect(0, GAME_HEIGHT - 4, GAME_WIDTH / 3, 4);
    flagBar.fillStyle(0xCE1126, 0.6);
    flagBar.fillRect(GAME_WIDTH / 3, GAME_HEIGHT - 4, GAME_WIDTH / 3, 4);
    flagBar.fillStyle(0xFCD116, 0.6);
    flagBar.fillRect(GAME_WIDTH * 2 / 3, GAME_HEIGHT - 4, GAME_WIDTH / 3, 4);

    // PeerJS Connection data handler
    if (this.conn) {
      this.conn.off('data'); // Clear previous handlers
      this.conn.on('data', (data) => {
        if (data && data.type === 'selection_update') {
          if (this.isHost) {
            // Host gets Challenger inputs
            this.p2Selection = data.selection;
            this.p2Confirmed = data.confirmed;
          } else {
            // Challenger gets Host inputs
            this.p1Selection = data.selection;
            this.p1Confirmed = data.confirmed;
          }
          this.updatePanels();

          if (data.confirmed && this.sound_mgr) {
            this.sound_mgr.playMenuConfirm();
          }

          if (this.p1Confirmed && this.p2Confirmed) {
            this.startFightTransition();
          }
        }
      });
    }

    // Initial panel draw
    this.updatePanels();
  }

  // Draw selection grid cards
  drawSelectionGrid() {
    this.characters.forEach((char, i) => {
      const col = i % this.gridCols;
      const row = Math.floor(i / this.gridCols);
      const cx = this.gridStartX + col * (this.cellW + this.cellSpacing);
      const cy = this.gridStartY + row * (this.cellH + this.cellSpacing);

      const cellContainer = this.add.container(cx, cy).setDepth(2);

      // Card Background
      const bg = this.add.graphics();
      bg.fillStyle(0x13131e, 0.85);
      bg.fillRoundedRect(-this.cellW / 2, -this.cellH / 2, this.cellW, this.cellH, 6);
      bg.lineStyle(1.5, 0x333344, 0.8);
      bg.strokeRoundedRect(-this.cellW / 2, -this.cellH / 2, this.cellW, this.cellH, 6);
      cellContainer.add(bg);

      // Thumbnail Face / Icon
      if (char.locked) {
        // Draw Lock Silhouette
        const lock = this.add.graphics();
        lock.fillStyle(0x22222a, 0.9);
        lock.fillCircle(0, -6, 12);
        lock.fillStyle(0x13131e, 1);
        lock.fillCircle(0, -6, 8);
        lock.fillStyle(0x33333c, 1);
        lock.fillRoundedRect(-14, 0, 28, 22, 3);
        lock.fillStyle(0xCE1126, 1);
        lock.fillRect(-2, 8, 4, 6);
        cellContainer.add(lock);

        // Name Tag
        const tag = this.add.text(0, this.cellH / 2 - 12, char.name.split(' ')[1].toUpperCase(), {
          fontFamily: 'Rajdhani', fontSize: '10px', color: '#666', fontStyle: 'bold'
        }).setOrigin(0.5);
        cellContainer.add(tag);
      } else if (char.id === 'random') {
        const qText = this.add.text(0, -5, '?', {
          fontFamily: 'Orbitron', fontSize: '38px', fontStyle: 'bold', color: '#00FFCC'
        }).setOrigin(0.5);
        const tag = this.add.text(0, this.cellH / 2 - 12, 'RANDOM', {
          fontFamily: 'Rajdhani', fontSize: '10px', color: '#00FFCC', fontStyle: 'bold'
        }).setOrigin(0.5);
        cellContainer.add([qText, tag]);

        this.tweens.add({
          targets: qText,
          alpha: 0.3,
          duration: 350,
          yoyo: true,
          repeat: -1
        });
      } else {
        const faceImg = this.add.image(0, -8, char.faceKey);
        faceImg.setDisplaySize(this.cellW - 12, this.cellH - 28);
        faceImg.setOrigin(0.5);

        const tag = this.add.text(0, this.cellH / 2 - 12, char.name.split(' ')[1].toUpperCase(), {
          fontFamily: 'Rajdhani', fontSize: '11px', color: '#FFF', fontStyle: 'bold'
        }).setOrigin(0.5);
        cellContainer.add([faceImg, tag]);
      }

      // Mouse interactivity for online
      const hit = this.add.zone(0, 0, this.cellW, this.cellH).setInteractive({ useHandCursor: true });
      cellContainer.add(hit);

      hit.on('pointerover', () => {
        const isSelfConfirmed = this.isHost ? this.p1Confirmed : this.p2Confirmed;
        if (isSelfConfirmed) return;

        this.localIndex = i;
        if (this.isHost) this.p1Selection = i;
        else this.p2Selection = i;

        if (this.sound_mgr) this.sound_mgr.playMenuSelect();
        this.sendSelectionState();
        this.updatePanels();
      });

      hit.on('pointerdown', () => {
        this.confirmLocalSelection();
      });
    });
  }

  // Create P1 preview panel
  createP1Panel() {
    this.p1Panel = this.add.container(0, 80);
    this.p1BackGlow = this.add.graphics();
    this.p1Panel.add(this.p1BackGlow);

    this.p1Portrait = this.add.image(130, 180, 'robin_portrait').setOrigin(0.5).setDepth(1);
    this.p1Panel.add(this.p1Portrait);

    this.p1Name = this.add.text(35, 290, 'ROBIN PADILLA', {
      fontFamily: 'Orbitron', fontSize: '20px', fontStyle: 'bold', color: '#FFF',
      stroke: '#000', strokeThickness: 3
    });
    this.p1Title = this.add.text(35, 314, 'THE BAD BOY', {
      fontFamily: 'Rajdhani', fontSize: '13px', fontStyle: 'bold', color: '#E63946'
    });
    this.p1Subtitle = this.add.text(35, 330, '"Utol mo sa Senado"', {
      fontFamily: 'Rajdhani', fontSize: '11px', color: '#aaa', fontStyle: 'italic'
    });
    this.p1Panel.add([this.p1Name, this.p1Title, this.p1Subtitle]);

    this.p1StatsBar = this.add.graphics();
    this.p1Panel.add(this.p1StatsBar);

    this.p1StatusBg = this.add.graphics();
    this.p1StatusTxt = this.add.text(140, 110, 'SELECTING', {
      fontFamily: 'Orbitron', fontSize: '16px', fontStyle: 'bold', color: '#FFF'
    }).setOrigin(0.5);
    this.p1Panel.add([this.p1StatusBg, this.p1StatusTxt]);
  }

  // Create P2 preview panel
  createP2Panel() {
    this.p2Panel = this.add.container(GAME_WIDTH - 280, 80);
    this.p2BackGlow = this.add.graphics();
    this.p2Panel.add(this.p2BackGlow);

    this.p2Portrait = this.add.image(150, 180, 'kiko_portrait').setOrigin(0.5).setFlipX(true).setDepth(1);
    this.p2Panel.add(this.p2Portrait);

    this.p2Name = this.add.text(35, 290, 'KIKO PANGILINAN', {
      fontFamily: 'Orbitron', fontSize: '20px', fontStyle: 'bold', color: '#FFF',
      stroke: '#000', strokeThickness: 3
    });
    this.p2Title = this.add.text(35, 314, 'THE POLICY WARRIOR', {
      fontFamily: 'Rajdhani', fontSize: '13px', fontStyle: 'bold', color: '#FFC300'
    });
    this.p2Subtitle = this.add.text(35, 330, '"Laban natin ito!"', {
      fontFamily: 'Rajdhani', fontSize: '11px', color: '#aaa', fontStyle: 'italic'
    });
    this.p2Panel.add([this.p2Name, this.p2Title, this.p2Subtitle]);

    this.p2StatsBar = this.add.graphics();
    this.p2Panel.add(this.p2StatsBar);

    this.p2StatusBg = this.add.graphics();
    this.p2StatusTxt = this.add.text(140, 110, 'SELECTING', {
      fontFamily: 'Orbitron', fontSize: '16px', fontStyle: 'bold', color: '#FFF'
    }).setOrigin(0.5);
    this.p2Panel.add([this.p2StatusBg, this.p2StatusTxt]);
  }

  // Update both panel visual outputs
  updatePanels() {
    // ── P1 Panel ──
    let p1Char = this.characters[this.p1Selection];
    if (this.p1Selection === 5 && !this.p1Confirmed) {
      p1Char = this.characters[this.randomCycleIndex];
    }

    this.p1Name.setText(p1Char.name.toUpperCase());
    this.p1Title.setText(p1Char.title);
    this.p1Title.setColor(p1Char.locked ? '#888' : Phaser.Display.Color.IntegerToColor(p1Char.color).rgba);
    this.p1Subtitle.setText(p1Char.subtitle);
    this.p1Portrait.setTexture(p1Char.portraitKey);
    if (p1Char.locked) {
      this.p1Portrait.setTint(0x151515);
      this.p1Name.setText('🔒 LOCKED');
    } else {
      this.p1Portrait.clearTint();
    }

    // Glow P1
    const p1Glow = this.p1BackGlow;
    p1Glow.clear();
    p1Glow.fillStyle(p1Char.locked ? 0x222222 : p1Char.color, 0.15);
    p1Glow.beginPath();
    p1Glow.moveTo(0, 0);
    p1Glow.lineTo(260, 0);
    p1Glow.lineTo(190, 420);
    p1Glow.lineTo(0, 420);
    p1Glow.closePath();
    p1Glow.fillPath();
    p1Glow.lineStyle(2.5, p1Char.locked ? 0x555555 : p1Char.color, 0.4);
    p1Glow.lineBetween(260, 0, 190, 420);

    // Stats P1
    const p1Stats = this.p1StatsBar;
    p1Stats.clear();
    const statKeys = ['PWR', 'SPD', 'DEF', 'SPC'];
    const p1Vals = [p1Char.stats.pwr, p1Char.stats.spd, p1Char.stats.def, p1Char.stats.spc];
    statKeys.forEach((key, idx) => {
      const sy = 358 + idx * 14;
      p1Stats.fillStyle(0x22222c, 0.9);
      p1Stats.fillRoundedRect(70, sy, 160, 6, 2);
      p1Stats.fillStyle(p1Char.locked ? 0x444444 : p1Char.color, 0.85);
      p1Stats.fillRoundedRect(70, sy, p1Vals[idx] * 16, 6, 2);
    });

    // P1 Status Ready Box
    const p1SBg = this.p1StatusBg;
    p1SBg.clear();
    const p1Scale = Math.min(230 / this.p1Portrait.width, 220 / this.p1Portrait.height);
    if (this.p1Confirmed) {
      p1SBg.fillStyle(0xE63946, 0.95);
      p1SBg.fillRoundedRect(40, 95, 200, 30, 4);
      p1SBg.lineStyle(1.5, 0xffffff, 0.8);
      p1SBg.strokeRoundedRect(40, 95, 200, 30, 4);
      this.p1StatusTxt.setText('READY!').setColor('#FFF');
      this.p1Portrait.setScale(p1Scale * 1.08);
    } else {
      p1SBg.fillStyle(0x13131a, 0.8);
      p1SBg.fillRoundedRect(40, 95, 200, 30, 4);
      p1SBg.lineStyle(1.5, 0x444, 0.5);
      p1SBg.strokeRoundedRect(40, 95, 200, 30, 4);
      this.p1StatusTxt.setText(this.isHost ? 'YOUR TURN' : 'SELECTING').setColor('#E63946');
      this.p1Portrait.setScale(p1Scale);
    }

    // ── P2 Panel ──
    let p2Char = this.characters[this.p2Selection];
    if (this.p2Selection === 5 && !this.p2Confirmed) {
      p2Char = this.characters[this.randomCycleIndex];
    }

    this.p2Name.setText(p2Char.name.toUpperCase());
    this.p2Title.setText(p2Char.title);
    this.p2Title.setColor(p2Char.locked ? '#888' : Phaser.Display.Color.IntegerToColor(p2Char.color).rgba);
    this.p2Subtitle.setText(p2Char.subtitle);
    this.p2Portrait.setTexture(p2Char.portraitKey);
    if (p2Char.locked) {
      this.p2Portrait.setTint(0x151515);
      this.p2Name.setText('🔒 LOCKED');
    } else {
      this.p2Portrait.clearTint();
    }

    // Glow P2
    const p2Glow = this.p2BackGlow;
    p2Glow.clear();
    p2Glow.fillStyle(p2Char.locked ? 0x222222 : p2Char.color, 0.15);
    p2Glow.beginPath();
    p2Glow.moveTo(20, 0);
    p2Glow.lineTo(280, 0);
    p2Glow.lineTo(280, 420);
    p2Glow.lineTo(90, 420);
    p2Glow.closePath();
    p2Glow.fillPath();
    p2Glow.lineStyle(2.5, p2Char.locked ? 0x555555 : p2Char.color, 0.4);
    p2Glow.lineBetween(20, 0, 90, 420);

    // Stats P2
    const p2Stats = this.p2StatsBar;
    p2Stats.clear();
    const p2Vals = [p2Char.stats.pwr, p2Char.stats.spd, p2Char.stats.def, p2Char.stats.spc];
    statKeys.forEach((key, idx) => {
      const sy = 358 + idx * 14;
      p2Stats.fillStyle(0x22222c, 0.9);
      p2Stats.fillRoundedRect(70, sy, 160, 6, 2);
      p2Stats.fillStyle(p2Char.locked ? 0x444444 : p2Char.color, 0.85);
      p2Stats.fillRoundedRect(70, sy, p2Vals[idx] * 16, 6, 2);
    });

    // P2 Status Ready Box
    const p2SBg = this.p2StatusBg;
    p2SBg.clear();
    const p2Scale = Math.min(230 / this.p2Portrait.width, 220 / this.p2Portrait.height);
    if (this.p2Confirmed) {
      p2SBg.fillStyle(0x0038A8, 0.95);
      p2SBg.fillRoundedRect(40, 95, 200, 30, 4);
      p2SBg.lineStyle(1.5, 0xffffff, 0.8);
      p2SBg.strokeRoundedRect(40, 95, 200, 30, 4);
      this.p2StatusTxt.setText('READY!').setColor('#FFF');
      this.p2Portrait.setScale(p2Scale * 1.08);
    } else {
      p2SBg.fillStyle(0x13131a, 0.8);
      p2SBg.fillRoundedRect(40, 95, 200, 30, 4);
      p2SBg.lineStyle(1.5, 0x444, 0.5);
      p2SBg.strokeRoundedRect(40, 95, 200, 30, 4);
      this.p2StatusTxt.setText(!this.isHost ? 'YOUR TURN' : 'SELECTING').setColor('#FFC300');
      this.p2Portrait.setScale(p2Scale);
    }
  }

  confirmLocalSelection() {
    const isSelfConfirmed = this.isHost ? this.p1Confirmed : this.p2Confirmed;
    if (isSelfConfirmed) return;

    const char = this.characters[this.localIndex];
    if (char.locked) {
      if (this.sound_mgr) this.sound_mgr.playBuzzer();
      
      const panel = this.isHost ? this.p1Panel : this.p2Panel;
      this.tweens.add({
        targets: panel,
        x: panel.x + (this.isHost ? 8 : -8),
        duration: 50,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
          panel.x = this.isHost ? 0 : GAME_WIDTH - 280;
        }
      });
      return;
    }

    if (this.isHost) {
      this.p1Confirmed = true;
      if (this.p1Selection === 5) {
        this.p1Selection = Math.random() < 0.5 ? 0 : 1;
      }
    } else {
      this.p2Confirmed = true;
      if (this.p2Selection === 5) {
        this.p2Selection = Math.random() < 0.5 ? 0 : 1;
      }
    }

    if (this.sound_mgr) this.sound_mgr.playMenuConfirm();
    this.sendSelectionState();
    this.updatePanels();

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

  startFightTransition() {
    const p1Char = this.characters[this.p1Selection].id;
    const p2Char = this.characters[this.p2Selection].id;

    this.registry.set('p1Character', p1Char);
    this.registry.set('p2Character', p2Char);

    const flash = this.add.graphics().setDepth(999);
    flash.fillStyle(0xFFFFFF, 1);
    flash.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    flash.setAlpha(0);

    this.tweens.add({
      targets: flash,
      alpha: { from: 0, to: 0.8 },
      duration: 150,
      yoyo: true,
      onComplete: () => {
        this.scene.start('VSScene');
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

  update() {
    // Backdrop grid
    this.bgGraphics.clear();
    this.bgOffset = (this.bgOffset + 0.4) % 40;
    this.bgGraphics.lineStyle(1, 0x1d1d2e, 0.6);
    for (let x = 0; x < GAME_WIDTH; x += 40) {
      this.bgGraphics.lineBetween(x, 0, x, GAME_HEIGHT);
    }
    for (let y = 0; y < GAME_HEIGHT; y += 40) {
      this.bgGraphics.lineBetween(0, y, GAME_WIDTH, y);
    }

    this.bgGraphics.fillStyle(0x06060c, 0.4);
    this.bgGraphics.fillRect(GAME_WIDTH / 2 - 180, 180, 360, 220);

    // Keyboard navigation
    this.handleKeyboardNav();

    // Cursors outline
    this.drawCursors();
  }

  handleKeyboardNav() {
    const isSelfConfirmed = this.isHost ? this.p1Confirmed : this.p2Confirmed;
    
    // Check Escape back to lobby
    let escDown = false;
    this.localKeys.cancel.forEach(k => {
      if (Phaser.Input.Keyboard.JustDown(k)) escDown = true;
    });

    if (escDown) {
      if (isSelfConfirmed) {
        // Unlock
        if (this.isHost) this.p1Confirmed = false;
        else this.p2Confirmed = false;
        if (this.sound_mgr) this.sound_mgr.playMenuSelect();
        this.sendSelectionState();
        this.updatePanels();
      } else {
        this.backToLobby();
      }
      return;
    }

    if (isSelfConfirmed) return;

    let col = this.localIndex % this.gridCols;
    let row = Math.floor(this.localIndex / this.gridCols);
    let moved = false;

    // Left
    this.localKeys.left.forEach(k => {
      if (Phaser.Input.Keyboard.JustDown(k)) {
        col = (col - 1 + this.gridCols) % this.gridCols;
        moved = true;
      }
    });
    // Right
    this.localKeys.right.forEach(k => {
      if (Phaser.Input.Keyboard.JustDown(k)) {
        col = (col + 1) % this.gridCols;
        moved = true;
      }
    });
    // Up
    this.localKeys.up.forEach(k => {
      if (Phaser.Input.Keyboard.JustDown(k)) {
        row = (row - 1 + this.gridRows) % this.gridRows;
        moved = true;
      }
    });
    // Down
    this.localKeys.down.forEach(k => {
      if (Phaser.Input.Keyboard.JustDown(k)) {
        row = (row + 1) % this.gridRows;
        moved = true;
      }
    });

    if (moved) {
      this.localIndex = row * this.gridCols + col;
      if (this.isHost) this.p1Selection = this.localIndex;
      else this.p2Selection = this.localIndex;

      if (this.sound_mgr) this.sound_mgr.playMenuSelect();
      this.sendSelectionState();
      this.updatePanels();
    }

    // Confirm
    let confDown = false;
    this.localKeys.confirm.forEach(k => {
      if (Phaser.Input.Keyboard.JustDown(k)) confDown = true;
    });

    if (confDown) {
      this.confirmLocalSelection();
    }
  }

  drawCursors() {
    const cg = this.cursorGraphics;
    cg.clear();

    const t = this.time.now;
    const pulseOffset = Math.sin(t * 0.01) * 3;

    // P1 Cursor (Red)
    const p1Col = this.p1Selection % this.gridCols;
    const p1Row = Math.floor(this.p1Selection / this.gridCols);
    const p1x = this.gridStartX + p1Col * (this.cellW + this.cellSpacing);
    const p1y = this.gridStartY + p1Row * (this.cellH + this.cellSpacing);

    cg.lineStyle(this.p1Confirmed ? 4 : 2, 0xE63946, 1);
    cg.strokeRoundedRect(
      p1x - this.cellW / 2 - 3 - pulseOffset,
      p1y - this.cellH / 2 - 3 - pulseOffset,
      this.cellW + 6 + pulseOffset * 2,
      this.cellH + 6 + pulseOffset * 2,
      8
    );

    cg.fillStyle(0xE63946, 1);
    cg.fillRect(p1x - this.cellW / 2 - 3 - pulseOffset, p1y - this.cellH / 2 - 14 - pulseOffset, 22, 12);
    this.drawCursorTagText('P1', p1x - this.cellW / 2 + 8 - pulseOffset, p1y - this.cellH / 2 - 8 - pulseOffset);

    // P2 Cursor (Gold)
    const p2Col = this.p2Selection % this.gridCols;
    const p2Row = Math.floor(this.p2Selection / this.gridCols);
    const p2x = this.gridStartX + p2Col * (this.cellW + this.cellSpacing);
    const p2y = this.gridStartY + p2Row * (this.cellH + this.cellSpacing);

    const overlapOffset = (this.p1Selection === this.p2Selection) ? 4 : 0;

    cg.lineStyle(this.p2Confirmed ? 4 : 2, 0xFFC300, 1);
    cg.strokeRoundedRect(
      p2x - this.cellW / 2 - 3 - overlapOffset - pulseOffset,
      p2y - this.cellH / 2 - 3 - overlapOffset - pulseOffset,
      this.cellW + 6 + (overlapOffset + pulseOffset) * 2,
      this.cellH + 6 + (overlapOffset + pulseOffset) * 2,
      8
    );

    cg.fillStyle(0xFFC300, 1);
    cg.fillRect(p2x + this.cellW / 2 - 19 + overlapOffset + pulseOffset, p2y - this.cellH / 2 - 14 - overlapOffset - pulseOffset, 22, 12);
    this.drawCursorTagText('P2', p2x + this.cellW / 2 - 8 + overlapOffset + pulseOffset, p2y - this.cellH / 2 - 8 - overlapOffset - pulseOffset);
  }

  drawCursorTagText(txt, x, y) {
    if (!this.p1CursorTagObj) {
      this.p1CursorTagObj = this.add.text(0, 0, 'P1', {
        fontFamily: 'monospace', fontSize: '9px', fontStyle: 'bold', color: '#FFF'
      }).setOrigin(0.5).setDepth(11);
    }
    if (!this.p2CursorTagObj) {
      this.p2CursorTagObj = this.add.text(0, 0, 'P2', {
        fontFamily: 'monospace', fontSize: '9px', fontStyle: 'bold', color: '#000'
      }).setOrigin(0.5).setDepth(11);
    }

    if (txt === 'P1') {
      this.p1CursorTagObj.setPosition(x, y).setVisible(true);
    } else {
      this.p2CursorTagObj.setPosition(x, y).setVisible(true);
    }
  }
}
