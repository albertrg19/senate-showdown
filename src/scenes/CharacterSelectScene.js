import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main.js';

export class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CharacterSelectScene' });
  }

  create() {
    this.cameras.main.fadeIn(400, 0, 0, 0);
    this.sound_mgr = this.registry.get('soundManager');
    this.gameMode = this.registry.get('gameMode') || 'local'; // 'solo' (VS CPU) or 'local'

    // Define 2x5 Grid Slots
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
        id: 'bam',
        name: 'Bam Aquino',
        title: 'THE MILLENNIAL SENATOR',
        subtitle: 'Para sa Bayan, Go Bam!',
        color: 0xFFD700,
        portraitKey: 'bam_portrait',
        faceKey: 'bam_face_pixel',
        stats: { pwr: 6, spd: 7, def: 6, spc: 8 },
        locked: false
      },
      {
        id: 'alan',
        name: 'Alan Peter Cayetano',
        title: 'THE COMPASSIONATE LEADER',
        subtitle: 'Aksyon, hindi salita',
        color: 0x0056A8,
        portraitKey: 'alan_portrait',
        faceKey: 'alan_face_pixel',
        stats: { pwr: 7, spd: 6, def: 7, spc: 8 },
        locked: false
      },
      {
        id: 'bato',
        name: 'Bato Dela Rosa',
        title: 'THE GRAV-CRUSHER',
        subtitle: 'Rough justice is here!',
        color: 0x555555,
        portraitKey: 'bato_portrait',
        faceKey: 'bato_face_pixel',
        stats: { pwr: 9, spd: 5, def: 9, spc: 5 },
        locked: false
      },
      {
        id: 'raffy',
        name: 'Raffy Tulfo',
        title: 'THE ACTION MAN',
        subtitle: 'Isumbong mo kay Tulfo!',
        color: 0xFF6B35,
        portraitKey: 'raffy_portrait',
        faceKey: 'raffy_face_pixel',
        stats: { pwr: 8, spd: 7, def: 6, spc: 8 },
        locked: false
      },
      {
        id: 'risa',
        name: 'Risa Hontiveros',
        title: 'THE PINK SHIELD',
        subtitle: 'Para sa karapatan ng lahat!',
        color: 0xFF69B4,
        portraitKey: 'risa_portrait',
        faceKey: 'risa_face_pixel',
        stats: { pwr: 6, spd: 8, def: 7, spc: 9 },
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

    // Grid Positions calculation (2 rows, 5 columns)
    this.gridCols = 5;
    this.gridRows = 2;
    this.cellW = 70;
    this.cellH = 70;
    this.cellSpacing = 10;
    
    // Grid center: X = 480, Y = 310
    this.gridStartX = GAME_WIDTH / 2 - ((this.cellW * this.gridCols) + (this.cellSpacing * (this.gridCols - 1))) / 2 + this.cellW / 2;
    this.gridStartY = 240;

    // Player selection trackers
    this.p1Index = 0; // Starts on Robin
    this.p2Index = 1; // Starts on Kiko
    this.p1Confirmed = false;
    this.p2Confirmed = false;

    // Random portrait cycling variables
    this.randomCycleIndex = 0;
    this.time.addEvent({
      delay: 120,
      loop: true,
      callback: () => {
        this.randomCycleIndex = (this.randomCycleIndex + 1) % 7;
        if (this.p1Index === 9 && !this.p1Confirmed) this.updateP1Panel();
        if (this.p2Index === 9 && !this.p2Confirmed) this.updateP2Panel();
      }
    });

    // Background decoration
    this.bgGraphics = this.add.graphics();
    this.bgOffset = 0;

    // Header Title
    const headerTitle = this.add.text(GAME_WIDTH / 2, 28, 'SELECT YOUR SENATOR', {
      fontFamily: 'Orbitron', fontSize: '28px', fontStyle: 'bold', color: '#FFD700',
      stroke: '#000', strokeThickness: 5
    }).setOrigin(0.5);

    const modeText = this.gameMode === 'solo' ? 'VS CPU BATTLE' : 'LOCAL BATTLE';
    this.add.text(GAME_WIDTH / 2, 54, `[ ${modeText} ]`, {
      fontFamily: 'Rajdhani', fontSize: '13px', fontStyle: 'bold',
      color: this.gameMode === 'solo' ? '#FFC300' : '#E63946',
      letterSpacing: 2
    }).setOrigin(0.5);

    // Decorative hazard bars at top and bottom
    const headerLine = this.add.graphics();
    headerLine.lineStyle(2, 0xFFD700, 0.4);
    headerLine.lineBetween(GAME_WIDTH / 2 - 250, 68, GAME_WIDTH / 2 + 250, 68);

    // Keyboard bindings for P1 & P2
    const kb = this.input.keyboard;
    this.p1Keys = {
      up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      confirm1: kb.addKey(Phaser.Input.Keyboard.KeyCodes.U),
      confirm2: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      cancel: kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
    };

    this.p2Keys = {
      up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      confirm1: kb.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_SEVEN),
      confirm2: kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
      cancel: kb.addKey(Phaser.Input.Keyboard.KeyCodes.BACKSPACE)
    };

    // Draw the Roster Grid
    this.gridContainers = [];
    this.drawSelectionGrid();

    // Create Left & Right Preview Panels
    this.createP1Panel();
    this.createP2Panel();

    // Update panels initially
    this.updateP1Panel();
    this.updateP2Panel();

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
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 38, 'P1: WASD + SPACE/U to lock  |  P2: ARROWS + ENTER/NUM7 to lock', {
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

    // CPU roulette timer tracking
    this.cpuRouletteActive = false;
  }

  // Draw roster boxes
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
        const tag = this.add.text(0, this.cellH / 2 - 10, char.name.split(' ')[1].toUpperCase(), {
          fontFamily: 'Rajdhani', fontSize: '9px', color: '#666', fontStyle: 'bold'
        }).setOrigin(0.5);
        cellContainer.add(tag);
      } else if (char.id === 'random') {
        // Draw Random "?"
        const qText = this.add.text(0, -6, '?', {
          fontFamily: 'Orbitron', fontSize: '28px', fontStyle: 'bold', color: '#00FFCC'
        }).setOrigin(0.5);
        const tag = this.add.text(0, this.cellH / 2 - 10, 'RANDOM', {
          fontFamily: 'Rajdhani', fontSize: '9px', color: '#00FFCC', fontStyle: 'bold'
        }).setOrigin(0.5);
        cellContainer.add([qText, tag]);

        // Neon blink effect on random slot
        this.tweens.add({
          targets: qText,
          alpha: 0.3,
          duration: 350,
          yoyo: true,
          repeat: -1
        });
      } else {
        // Render Pixelated Face Thumbnail
        const faceImg = this.add.image(0, -8, char.faceKey);
        faceImg.setDisplaySize(this.cellW - 10, this.cellH - 24);
        faceImg.setOrigin(0.5);

        // Name tag
        const lastName = char.name.split(' ')[1].toUpperCase();
        const tag = this.add.text(0, this.cellH / 2 - 10, lastName, {
          fontFamily: 'Rajdhani', fontSize: '9px', color: '#FFF', fontStyle: 'bold'
        }).setOrigin(0.5);
        cellContainer.add([faceImg, tag]);
      }

      // Mouse interactivity
      const hit = this.add.zone(0, 0, this.cellW, this.cellH).setInteractive({ useHandCursor: true });
      cellContainer.add(hit);

      hit.on('pointerover', () => {
        if (this.cpuRouletteActive) return;
        // P1 hover local cursor
        if (!this.p1Confirmed) {
          this.p1Index = i;
          this.updateP1Panel();
          if (this.sound_mgr) this.sound_mgr.playMenuSelect();
        } else if (!this.p2Confirmed && this.gameMode === 'local') {
          this.p2Index = i;
          this.updateP2Panel();
          if (this.sound_mgr) this.sound_mgr.playMenuSelect();
        }
      });

      hit.on('pointerdown', () => {
        if (this.cpuRouletteActive) return;
        if (!this.p1Confirmed) {
          this.confirmP1();
        } else if (!this.p2Confirmed && this.gameMode === 'local') {
          this.confirmP2();
        }
      });

      this.gridContainers.push(cellContainer);
    });
  }

  // Create P1 left preview panel
  createP1Panel() {
    this.p1Panel = this.add.container(0, 80);

    // Diagonal backing glow
    this.p1BackGlow = this.add.graphics();
    this.p1Panel.add(this.p1BackGlow);

    // Large Portrait
    this.p1Portrait = this.add.image(130, 180, 'robin_portrait').setDepth(1);
    this.p1Portrait.setOrigin(0.5);
    this.p1Panel.add(this.p1Portrait);

    // Silhouette mask graphics
    this.p1Sil = this.add.graphics();
    this.p1Panel.add(this.p1Sil);

    // Character Card Text Info
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

    // Stats bar group
    this.p1StatsBar = this.add.graphics();
    this.p1Panel.add(this.p1StatsBar);

    // P1 Status Tag
    this.p1StatusBg = this.add.graphics();
    this.p1StatusTxt = this.add.text(130, 445, 'SELECTING', {
      fontFamily: 'Orbitron', fontSize: '16px', fontStyle: 'bold', color: '#FFF'
    }).setOrigin(0.5);
    this.p1Panel.add([this.p1StatusBg, this.p1StatusTxt]);
  }

  // Create P2 right preview panel
  createP2Panel() {
    this.p2Panel = this.add.container(GAME_WIDTH - 280, 80);

    // Diagonal backing glow
    this.p2BackGlow = this.add.graphics();
    this.p2Panel.add(this.p2BackGlow);

    // Large Portrait (flipped)
    this.p2Portrait = this.add.image(150, 180, 'kiko_portrait').setDepth(1);
    this.p2Portrait.setOrigin(0.5);
    this.p2Portrait.setFlipX(true);
    this.p2Panel.add(this.p2Portrait);

    // Character Card Text Info
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

    // Stats bar group
    this.p2StatsBar = this.add.graphics();
    this.p2Panel.add(this.p2StatsBar);

    // P2 Status Tag
    this.p2StatusBg = this.add.graphics();
    this.p2StatusTxt = this.add.text(130, 445, 'SELECTING', {
      fontFamily: 'Orbitron', fontSize: '16px', fontStyle: 'bold', color: '#FFF'
    }).setOrigin(0.5);
    this.p2Panel.add([this.p2StatusBg, this.p2StatusTxt]);
  }

  // Update P1 left panel visuals
  updateP1Panel() {
    let char = this.characters[this.p1Index];
    
    // Random cycle handling
    if (this.p1Index === 5 && !this.p1Confirmed) {
      char = this.characters[this.randomCycleIndex];
    }

    // Colors & textures
    this.p1Name.setText(char.name.toUpperCase());
    this.p1Title.setText(char.title);
    this.p1Title.setColor(char.locked ? '#888' : Phaser.Display.Color.IntegerToColor(char.color).rgba);
    this.p1Subtitle.setText(char.subtitle);

    // Large portrait image
    this.p1Portrait.setTexture(char.portraitKey);
    this.p1Portrait.setVisible(true);

    if (char.locked) {
      // Locked: Display a dark silhouette and lock message
      this.p1Portrait.setTint(0x151515);
      this.p1Name.setText('🔒 LOCKED');
    } else {
      this.p1Portrait.clearTint();
    }

    // Redraw backing glow slash
    const glow = this.p1BackGlow;
    glow.clear();
    glow.fillStyle(char.locked ? 0x222222 : char.color, 0.15);
    glow.beginPath();
    glow.moveTo(0, 0);
    glow.lineTo(260, 0);
    glow.lineTo(190, 420);
    glow.lineTo(0, 420);
    glow.closePath();
    glow.fillPath();

    glow.lineStyle(2.5, char.locked ? 0x555555 : char.color, 0.4);
    glow.lineBetween(260, 0, 190, 420);

    // Draw Stats comparison bars
    const stats = this.p1StatsBar;
    stats.clear();
    const statKeys = ['PWR', 'SPD', 'DEF', 'SPC'];
    const statVals = [char.stats.pwr, char.stats.spd, char.stats.def, char.stats.spc];
    
    statKeys.forEach((key, idx) => {
      const sy = 358 + idx * 14;
      // Label
      this.add.text(35, 80 + sy, key, {
        fontFamily: 'Rajdhani', fontSize: '10px', color: '#999'
      }).setDepth(10);
      
      // Bar backing
      stats.fillStyle(0x22222c, 0.9);
      stats.fillRoundedRect(70, sy, 160, 6, 2);
      // Filled bar
      stats.fillStyle(char.locked ? 0x444444 : char.color, 0.85);
      stats.fillRoundedRect(70, sy, statVals[idx] * 16, 6, 2);
    });

    // Update Status Tag
    const sBg = this.p1StatusBg;
    sBg.clear();
    const p1Scale = Math.min(230 / this.p1Portrait.width, 220 / this.p1Portrait.height);
    if (this.p1Confirmed) {
      sBg.fillStyle(0xE63946, 0.95);
      sBg.fillRoundedRect(30, 430, 200, 30, 4);
      sBg.lineStyle(1.5, 0xFFFFFF, 0.8);
      sBg.strokeRoundedRect(30, 430, 200, 30, 4);
      this.p1StatusTxt.setText('READY!').setColor('#FFF');
      this.p1StatusTxt.setPosition(130, 445);
      this.p1Portrait.setScale(p1Scale * 1.08); // Pop forward!
    } else {
      sBg.fillStyle(0x13131a, 0.8);
      sBg.fillRoundedRect(30, 430, 200, 30, 4);
      sBg.lineStyle(1.5, 0x444, 0.5);
      sBg.strokeRoundedRect(30, 430, 200, 30, 4);
      this.p1StatusTxt.setText('SELECTING').setColor('#E63946');
      this.p1StatusTxt.setPosition(130, 445);
      this.p1Portrait.setScale(p1Scale);
    }
  }

  // Update P2 right panel visuals
  updateP2Panel() {
    let char = this.characters[this.p2Index];

    // Random cycle handling
    if (this.p2Index === 9 && !this.p2Confirmed) {
      char = this.characters[this.randomCycleIndex];
    }

    // Colors & textures
    this.p2Name.setText(char.name.toUpperCase());
    this.p2Title.setText(char.title);
    this.p2Title.setColor(char.locked ? '#888' : Phaser.Display.Color.IntegerToColor(char.color).rgba);
    this.p2Subtitle.setText(char.subtitle);

    // Large portrait image
    this.p2Portrait.setTexture(char.portraitKey);
    this.p2Portrait.setVisible(true);

    if (char.locked) {
      // Locked: Display a dark silhouette
      this.p2Portrait.setTint(0x151515);
      this.p2Name.setText('🔒 LOCKED');
    } else {
      this.p2Portrait.clearTint();
    }

    // Redraw backing glow slash
    const glow = this.p2BackGlow;
    glow.clear();
    glow.fillStyle(char.locked ? 0x222222 : char.color, 0.15);
    glow.beginPath();
    glow.moveTo(20, 0);
    glow.lineTo(280, 0);
    glow.lineTo(280, 420);
    glow.lineTo(90, 420);
    glow.closePath();
    glow.fillPath();

    glow.lineStyle(2.5, char.locked ? 0x555555 : char.color, 0.4);
    glow.lineBetween(20, 0, 90, 420);

    // Draw Stats comparison bars
    const stats = this.p2StatsBar;
    stats.clear();
    const statKeys = ['PWR', 'SPD', 'DEF', 'SPC'];
    const statVals = [char.stats.pwr, char.stats.spd, char.stats.def, char.stats.spc];

    statKeys.forEach((key, idx) => {
      const sy = 358 + idx * 14;
      // Label
      this.add.text(GAME_WIDTH - 280 + 35, 80 + sy, key, {
        fontFamily: 'Rajdhani', fontSize: '10px', color: '#999'
      }).setDepth(10);

      // Bar backing
      stats.fillStyle(0x22222c, 0.9);
      stats.fillRoundedRect(70, sy, 160, 6, 2);
      // Filled bar
      stats.fillStyle(char.locked ? 0x444444 : char.color, 0.85);
      stats.fillRoundedRect(70, sy, statVals[idx] * 16, 6, 2);
    });

    // Update Status Tag
    const sBg = this.p2StatusBg;
    sBg.clear();
    const p2Scale = Math.min(230 / this.p2Portrait.width, 220 / this.p2Portrait.height);
    if (this.p2Confirmed) {
      sBg.fillStyle(0x0038A8, 0.95); // Blue ready
      sBg.fillRoundedRect(30, 430, 200, 30, 4);
      sBg.lineStyle(1.5, 0xFFFFFF, 0.8);
      sBg.strokeRoundedRect(30, 430, 200, 30, 4);
      this.p2StatusTxt.setText('READY!').setColor('#FFF');
      this.p2StatusTxt.setPosition(130, 445);
      this.p2Portrait.setScale(p2Scale * 1.08);
    } else {
      sBg.fillStyle(0x13131a, 0.8);
      sBg.fillRoundedRect(30, 430, 200, 30, 4);
      sBg.lineStyle(1.5, 0x444, 0.5);
      sBg.strokeRoundedRect(30, 430, 200, 30, 4);
      this.p2StatusTxt.setText('SELECTING').setColor('#FFC300');
      this.p2StatusTxt.setPosition(130, 445);
      this.p2Portrait.setScale(p2Scale);
    }
  }

  confirmP1() {
    const char = this.characters[this.p1Index];
    if (char.locked) {
      this.lockedBuzzer(true);
      return;
    }

    this.p1Confirmed = true;
    if (this.sound_mgr) this.sound_mgr.playMenuConfirm();

    // Random resolve
    if (this.p1Index === 9) {
      const playables = [0, 1, 2, 3, 4, 5, 6];
      const roll = playables[Math.floor(Math.random() * playables.length)];
      this.p1Index = roll;
    }
    this.updateP1Panel();

    // Trigger VS CPU flow if in solo mode
    if (this.gameMode === 'solo') {
      this.startCpuRoulette();
    }
  }

  confirmP2() {
    const char = this.characters[this.p2Index];
    if (char.locked) {
      this.lockedBuzzer(false);
      return;
    }

    this.p2Confirmed = true;
    if (this.sound_mgr) this.sound_mgr.playMenuConfirm();

    // Random resolve
    if (this.p2Index === 9) {
      const playables = [0, 1, 2, 3, 4, 5, 6];
      const roll = playables[Math.floor(Math.random() * playables.length)];
      this.p2Index = roll;
    }
    this.updateP2Panel();

    this.checkLaunchMatchup();
  }

  startCpuRoulette() {
    this.cpuRouletteActive = true;
    let ticks = 0;
    const maxTicks = 14;

    const selectables = [0, 1, 2, 3, 4, 5, 6, 9]; // Indexes of selectable cards

    const timer = this.time.addEvent({
      delay: 85,
      repeat: maxTicks,
      callback: () => {
        ticks++;
        if (ticks < maxTicks) {
          // Cycle
          this.p2Index = selectables[ticks % selectables.length];
          this.updateP2Panel();
          if (this.sound_mgr) this.sound_mgr.playMenuSelect();
        } else {
          // Pick opposing character to P1 as a nice default, or random
          const playables = [0, 1, 2, 3, 4, 5, 6].filter(idx => idx !== this.p1Index);
          const roll = playables[Math.floor(Math.random() * playables.length)];
          this.p2Index = roll;
          this.p2Confirmed = true;
          this.updateP2Panel();
          if (this.sound_mgr) this.sound_mgr.playMenuConfirm();
          
          this.cpuRouletteActive = false;
          this.checkLaunchMatchup();
        }
      }
    });
  }

  lockedBuzzer(isP1) {
    if (this.sound_mgr) this.sound_mgr.playBuzzer();
    
    // Shake panel visual feedback
    const panel = isP1 ? this.p1Panel : this.p2Panel;
    this.tweens.add({
      targets: panel,
      x: panel.x + (isP1 ? 8 : -8),
      duration: 50,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        panel.x = isP1 ? 0 : GAME_WIDTH - 280;
      }
    });
  }

  checkLaunchMatchup() {
    if (this.p1Confirmed && this.p2Confirmed) {
      const p1Char = this.characters[this.p1Index].id;
      const p2Char = this.characters[this.p2Index].id;

      this.registry.set('p1Character', p1Char);
      this.registry.set('p2Character', p2Char);

      // Brief flash then load VS Scene!
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
          this.scene.start('MapSelectScene');
        }
      });
    }
  }

  update(time, delta) {
    // Background scanning hazard lines
    this.bgGraphics.clear();
    this.bgOffset = (this.bgOffset + 0.4) % 40;
    
    // Subtle backdrop grid overlay lines
    this.bgGraphics.lineStyle(1, 0x1d1d2e, 0.6);
    for (let x = 0; x < GAME_WIDTH; x += 40) {
      this.bgGraphics.lineBetween(x, 0, x, GAME_HEIGHT);
    }
    for (let y = 0; y < GAME_HEIGHT; y += 40) {
      this.bgGraphics.lineBetween(0, y, GAME_WIDTH, y);
    }

    // Grid details background
    this.bgGraphics.fillStyle(0x06060c, 0.4);
    this.bgGraphics.fillRect(GAME_WIDTH / 2 - 180, 180, 360, 220);

    // Keyboard navigation polling
    if (!this.cpuRouletteActive) {
      this.handleP1Keys();
      this.handleP2Keys();
    }

    // Render Neon Cursor outlines in real-time
    this.drawCursors();
  }

  handleP1Keys() {
    if (this.p1Confirmed) {
      // Allow P1 to cancel selection with ESC
      if (Phaser.Input.Keyboard.JustDown(this.p1Keys.cancel)) {
        this.p1Confirmed = false;
        if (this.sound_mgr) this.sound_mgr.playMenuSelect();
        this.updateP1Panel();
      }
      return;
    }

    // Navigate 2x3 grid
    let col = this.p1Index % this.gridCols;
    let row = Math.floor(this.p1Index / this.gridCols);
    let moved = false;

    if (Phaser.Input.Keyboard.JustDown(this.p1Keys.left)) {
      col = (col - 1 + this.gridCols) % this.gridCols;
      moved = true;
    } else if (Phaser.Input.Keyboard.JustDown(this.p1Keys.right)) {
      col = (col + 1) % this.gridCols;
      moved = true;
    }

    if (Phaser.Input.Keyboard.JustDown(this.p1Keys.up)) {
      row = (row - 1 + this.gridRows) % this.gridRows;
      moved = true;
    } else if (Phaser.Input.Keyboard.JustDown(this.p1Keys.down)) {
      row = (row + 1) % this.gridRows;
      moved = true;
    }

    if (moved) {
      this.p1Index = row * this.gridCols + col;
      this.updateP1Panel();
      if (this.sound_mgr) this.sound_mgr.playMenuSelect();
    }

    // Confirm keys
    if (Phaser.Input.Keyboard.JustDown(this.p1Keys.confirm1) || Phaser.Input.Keyboard.JustDown(this.p1Keys.confirm2)) {
      this.confirmP1();
    }

    // Back to menu
    if (Phaser.Input.Keyboard.JustDown(this.p1Keys.cancel)) {
      if (this.sound_mgr) this.sound_mgr.playMenuConfirm();
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    }
  }

  handleP2Keys() {
    // Only support local player 2 inputs if in local mode
    if (this.gameMode !== 'local') return;

    if (this.p2Confirmed) {
      // Allow P2 to cancel with BACKSPACE/ESC
      if (Phaser.Input.Keyboard.JustDown(this.p2Keys.cancel)) {
        this.p2Confirmed = false;
        if (this.sound_mgr) this.sound_mgr.playMenuSelect();
        this.updateP2Panel();
      }
      return;
    }

    // Navigate 2x3 grid
    let col = this.p2Index % this.gridCols;
    let row = Math.floor(this.p2Index / this.gridCols);
    let moved = false;

    if (Phaser.Input.Keyboard.JustDown(this.p2Keys.left)) {
      col = (col - 1 + this.gridCols) % this.gridCols;
      moved = true;
    } else if (Phaser.Input.Keyboard.JustDown(this.p2Keys.right)) {
      col = (col + 1) % this.gridCols;
      moved = true;
    }

    if (Phaser.Input.Keyboard.JustDown(this.p2Keys.up)) {
      row = (row - 1 + this.gridRows) % this.gridRows;
      moved = true;
    } else if (Phaser.Input.Keyboard.JustDown(this.p2Keys.down)) {
      row = (row + 1) % this.gridRows;
      moved = true;
    }

    if (moved) {
      this.p2Index = row * this.gridCols + col;
      this.updateP2Panel();
      if (this.sound_mgr) this.sound_mgr.playMenuSelect();
    }

    // Confirm keys
    if (Phaser.Input.Keyboard.JustDown(this.p2Keys.confirm1) || Phaser.Input.Keyboard.JustDown(this.p2Keys.confirm2)) {
      this.confirmP2();
    }
  }

  // Draw custom glowing selection boxes around cards
  drawCursors() {
    const cg = this.cursorGraphics;
    cg.clear();

    const t = this.time.now;
    const pulseOffset = Math.sin(t * 0.01) * 3;

    // Player 1 Cursor (Red)
    const p1Col = this.p1Index % this.gridCols;
    const p1Row = Math.floor(this.p1Index / this.gridCols);
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

    // small "P1" tag
    cg.fillStyle(0xE63946, 1);
    cg.fillRect(p1x - this.cellW / 2 - 3 - pulseOffset, p1y - this.cellH / 2 - 14 - pulseOffset, 22, 12);
    this.drawCursorTagText('P1', p1x - this.cellW / 2 + 8 - pulseOffset, p1y - this.cellH / 2 - 8 - pulseOffset);

    // Player 2 Cursor (Yellow/Gold)
    // Only display cursor if in local mode, or if Cpu roulette is active/finishing
    if (this.gameMode === 'local' || this.p1Confirmed) {
      const p2Col = this.p2Index % this.gridCols;
      const p2Row = Math.floor(this.p2Index / this.gridCols);
      const p2x = this.gridStartX + p2Col * (this.cellW + this.cellSpacing);
      const p2y = this.gridStartY + p2Row * (this.cellH + this.cellSpacing);

      // If P1 and P2 are on same index, make P2 cursor slightly larger so both outlines are visible!
      const overlapOffset = (this.p1Index === this.p2Index) ? 4 : 0;

      cg.lineStyle(this.p2Confirmed ? 4 : 2, 0xFFC300, 1);
      cg.strokeRoundedRect(
        p2x - this.cellW / 2 - 3 - overlapOffset - pulseOffset,
        p2y - this.cellH / 2 - 3 - overlapOffset - pulseOffset,
        this.cellW + 6 + (overlapOffset + pulseOffset) * 2,
        this.cellH + 6 + (overlapOffset + pulseOffset) * 2,
        8
      );

      // small "P2" tag
      cg.fillStyle(0xFFC300, 1);
      cg.fillRect(p2x + this.cellW / 2 - 19 + overlapOffset + pulseOffset, p2y - this.cellH / 2 - 14 - overlapOffset - pulseOffset, 22, 12);
      this.drawCursorTagText('P2', p2x + this.cellW / 2 - 8 + overlapOffset + pulseOffset, p2y - this.cellH / 2 - 8 - overlapOffset - pulseOffset);
    }
  }

  // Draw simple bitmap P1/P2 cursor tags so we don't have to manage text gameobjects moving
  drawCursorTagText(txt, x, y) {
    // Simple mock draw (this doesn't need actual rendering since we can just let tags exist,
    // but drawing simple line graphics for text is a cool retro hack!
    // Or we can just use 1 tiny text object per player that we reposition.
    // Yes! Let's reposition two simple text objects.
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
      this.p2CursorTagObj.setPosition(x, y).setVisible(this.gameMode === 'local' || this.p1Confirmed);
    }
  }
}
