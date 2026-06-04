import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main.js';

// ─── Motion Input Parser ────────────────────────────────────────────────────
// Implements Street Fighter's classic directional input buffering system.
export class MotionInputParser {
  constructor() {
    this.bufferSize = 30;
    this.directionBuffer = [];
    this.qcfTimestamps = [];   // Track each completed QCF for double-QCF super
  }

  addDirection(dir) {
    const entry = { dir, time: Date.now() };
    this.directionBuffer.push(entry);
    if (this.directionBuffer.length > this.bufferSize) {
      this.directionBuffer.shift();
    }
  }

  // Quarter-circle forward: ↓ ↘ →
  checkQCF(facing) {
    const seq = facing === 1
      ? ['down', 'down-forward', 'forward']
      : ['down', 'down-back', 'back'];
    return this._checkSequence(seq, 350);
  }

  // Quarter-circle back: ↓ ↙ ←
  checkQCB(facing) {
    const seq = facing === 1
      ? ['down', 'down-back', 'back']
      : ['down', 'down-forward', 'forward'];
    return this._checkSequence(seq, 350);
  }

  // Dragon punch: → ↓ ↘
  checkDP(facing) {
    const seq = facing === 1
      ? ['forward', 'down', 'down-forward']
      : ['back', 'down', 'down-back'];
    return this._checkSequence(seq, 350);
  }

  // Double QCF: ↓↘→ ↓↘→ (Street Fighter super motion)
  checkDoubleQCF(facing) {
    const now = Date.now();
    const superWindowMs = 700; // 700ms total window for both QCFs

    if (this.checkQCF(facing)) {
      if (!this.qcfTimestamps.length || now - this.qcfTimestamps[this.qcfTimestamps.length - 1] > 100) {
        this.qcfTimestamps.push(now);
      }
    }

    this.qcfTimestamps = this.qcfTimestamps.filter(t => now - t < superWindowMs);
    return this.qcfTimestamps.length >= 2;
  }

  _checkSequence(sequence, windowMs = 300) {
    const now = Date.now();
    const recent = this.directionBuffer.filter(d => now - d.time < windowMs);
    if (recent.length < sequence.length) return false;

    let seqIdx = 0;
    for (let i = 0; i < recent.length && seqIdx < sequence.length; i++) {
      if (recent[i].dir === sequence[seqIdx]) seqIdx++;
    }
    return seqIdx >= sequence.length;
  }

  clear() {
    this.directionBuffer = [];
    this.qcfTimestamps = [];
  }
}

// ─── Input Manager ──────────────────────────────────────────────────────────
export class InputManager {
  constructor(scene) {
    this.scene = scene;
    this.keys = {};
    this.motionParsers = {
      p1: new MotionInputParser(),
      p2: new MotionInputParser()
    };
    
    this.virtualControlsActive = false;
    this.virtualInput = {
      left: false, right: false, up: false, down: false,
      lp: false, mp: false, hp: false,
      lk: false, mk: false, hk: false,
      superMove: false, special1: false, special2: false, special3: false, special4: false
    };
    
    this.setupKeys();
    this.setupVirtualControls();
  }

  setupKeys() {
    const kb = this.scene.input.keyboard;
    if (!kb) return;

    // Player 1: WASD movement, 6-button attack layout
    this.keys.p1 = {
      left:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      up:    kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      lp:    kb.addKey(Phaser.Input.Keyboard.KeyCodes.U),   // Light Punch
      mp:    kb.addKey(Phaser.Input.Keyboard.KeyCodes.O),   // Medium Punch
      hp:    kb.addKey(Phaser.Input.Keyboard.KeyCodes.I),   // Heavy Punch
      lk:    kb.addKey(Phaser.Input.Keyboard.KeyCodes.J),   // Light Kick
      mk:    kb.addKey(Phaser.Input.Keyboard.KeyCodes.L),   // Medium Kick
      hk:    kb.addKey(Phaser.Input.Keyboard.KeyCodes.K),   // Heavy Kick
    };

    // Player 2: Arrow keys + Numpad 6-button layout with standard number keys as fallbacks
    this.keys.p2 = {
      left:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      up:    kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      lp:    [kb.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_SEVEN), kb.addKey(Phaser.Input.Keyboard.KeyCodes.SEVEN)], // Light Punch
      mp:    [kb.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_NINE), kb.addKey(Phaser.Input.Keyboard.KeyCodes.NINE)],  // Medium Punch
      hp:    [kb.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_EIGHT), kb.addKey(Phaser.Input.Keyboard.KeyCodes.EIGHT)], // Heavy Punch
      lk:    [kb.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_FOUR), kb.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR)],  // Light Kick
      mk:    [kb.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_SIX), kb.addKey(Phaser.Input.Keyboard.KeyCodes.SIX)],   // Medium Kick
      hk:    [kb.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_FIVE), kb.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE)],  // Heavy Kick
    };
  }

  setupVirtualControls() {
    const scene = this.scene;
    
    // Auto-detect mobile devices or touch capacity
    const isTouchDevice = scene.sys.game.device.input.touch || navigator.maxTouchPoints > 0;
    
    if (!isTouchDevice) return;
    
    this.virtualControlsActive = true;
    this.virtualControlsGroup = scene.add.group();
    
    // ─── LEFT SIDE: D-PAD (MOUNTED IN BOTTOM-LEFT) ───
    const dpadX = 140;
    const dpadY = GAME_HEIGHT - 130;
    const dpadRadius = 75;
    
    const dpadBg = scene.add.circle(dpadX, dpadY, dpadRadius, 0x11111a, 0.4)
      .setStrokeStyle(3, 0x00FFCC, 0.6)
      .setDepth(100)
      .setScrollFactor(0);
    this.virtualControlsGroup.add(dpadBg);
    
    const dirButtons = [
      { name: 'up',    dx: 0,   dy: -48, r: 24, label: '▲' },
      { name: 'down',  dx: 0,   dy: 48,  r: 24, label: '▼' },
      { name: 'left',  dx: -48, dy: 0,   r: 24, label: '◀' },
      { name: 'right', dx: 48,  dy: 0,   r: 24, label: '▶' }
    ];
    
    dirButtons.forEach(b => {
      const btn = scene.add.circle(dpadX + b.dx, dpadY + b.dy, b.r, 0x222233, 0.7)
        .setStrokeStyle(2, 0x00FFCC, 0.5)
        .setInteractive()
        .setDepth(101)
        .setScrollFactor(0);
      
      const txt = scene.add.text(dpadX + b.dx, dpadY + b.dy, b.label, {
        fontFamily: 'monospace', fontSize: '18px', color: '#FFF'
      }).setOrigin(0.5).setDepth(102).setScrollFactor(0);
      
      this.virtualControlsGroup.add(btn);
      this.virtualControlsGroup.add(txt);
      
      btn.on('pointerdown', () => {
        this.virtualInput[b.name] = true;
        btn.setFillStyle(0x00FFCC, 0.9);
      });
      btn.on('pointerout', () => {
        this.virtualInput[b.name] = false;
        btn.setFillStyle(0x222233, 0.7);
      });
      btn.on('pointerup', () => {
        this.virtualInput[b.name] = false;
        btn.setFillStyle(0x222233, 0.7);
      });
    });
    
    // ─── RIGHT SIDE: ARCADE ACTION BUTTONS ───
    const buttonsX = GAME_WIDTH - 280;
    const buttonsY = GAME_HEIGHT - 150;
    const btnRadius = 22;
    const spacingX = 58;
    const spacingY = 58;
    
    const actionButtons = [
      // Top row: Punches (Red)
      { name: 'lp', label: 'LP', col: 0, row: 0, color: 0xE63946 },
      { name: 'mp', label: 'MP', col: 1, row: 0, color: 0xE63946 },
      { name: 'hp', label: 'HP', col: 2, row: 0, color: 0xE63946 },
      // Bottom row: Kicks (Yellow)
      { name: 'lk', label: 'LK', col: 0, row: 1, color: 0xFFC300 },
      { name: 'mk', label: 'MK', col: 1, row: 1, color: 0xFFC300 },
      { name: 'hk', label: 'HK', col: 2, row: 1, color: 0xFFC300 },
      // Dedicated Shortcuts: Special & Super (Cyan & Gold)
      { name: 'special1', label: 'SP1', col: 3, row: 0, color: 0x00CCFF, size: 24 },
      { name: 'special4', label: 'SP2', col: 4, row: 0, color: 0x00AADD, size: 24 },
      { name: 'superMove', label: 'SPR', col: 3, row: 1, color: 0xFFD700, size: 24 }
    ];
    
    actionButtons.forEach(b => {
      const bx = buttonsX + b.col * spacingX;
      const by = buttonsY + b.row * spacingY;
      const radius = b.size || btnRadius;
      
      const btn = scene.add.circle(bx, by, radius, b.color, 0.6)
        .setStrokeStyle(2, 0xFFFFFF, 0.8)
        .setInteractive()
        .setDepth(101)
        .setScrollFactor(0);
      
      const txt = scene.add.text(bx, by, b.label, {
        fontFamily: 'Orbitron, sans-serif', fontSize: '11px', color: '#FFF', fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(102).setScrollFactor(0);
      
      this.virtualControlsGroup.add(btn);
      this.virtualControlsGroup.add(txt);
      
      btn.on('pointerdown', () => {
        this.virtualInput[b.name] = true;
        btn.setAlpha(1.0);
      });
      btn.on('pointerup', () => {
        btn.setAlpha(0.6);
      });
      btn.on('pointerout', () => {
        btn.setAlpha(0.6);
      });
    });
  }

  getInput(player, facing) {
    const k = this.keys[player];
    const parser = this.motionParsers[player];
    const JustDown = Phaser.Input.Keyboard.JustDown;

    const isDown = (key) => {
      if (!key) return false;
      if (Array.isArray(key)) return key.some(kbKey => kbKey.isDown);
      return key.isDown;
    };

    const isJustDown = (key) => {
      if (!key) return false;
      if (Array.isArray(key)) return key.some(kbKey => JustDown(kbKey));
      return JustDown(key);
    };

    let input;

    // Combine virtual controls input for P1 if active
    if (player === 'p1' && this.virtualControlsActive) {
      input = {
        left:  this.virtualInput.left || (k && isDown(k.left)),
        right: this.virtualInput.right || (k && isDown(k.right)),
        up:    this.virtualInput.up || (k && isJustDown(k.up)),
        down:  this.virtualInput.down || (k && isDown(k.down)),
        lp:    this.virtualInput.lp || (k && isJustDown(k.lp)),
        mp:    this.virtualInput.mp || (k && isJustDown(k.mp)),
        hp:    this.virtualInput.hp || (k && isJustDown(k.hp)),
        lk:    this.virtualInput.lk || (k && isJustDown(k.lk)),
        mk:    this.virtualInput.mk || (k && isJustDown(k.mk)),
        hk:    this.virtualInput.hk || (k && isJustDown(k.hk)),
        // Direct mobile touch special keys
        superMove: this.virtualInput.superMove,
        special1:  this.virtualInput.special1,
        special2:  this.virtualInput.special2,
        special3:  this.virtualInput.special3,
        special4:  this.virtualInput.special4,
        forward: false,
        backward: false
      };
      
      // LATCHED RESET: Clear one-frame virtual inputs immediately upon reading them
      // This solves the race condition, ensuring attacks trigger 100% reliably on tap!
      this.virtualInput.up = false;
      this.virtualInput.lp = false;
      this.virtualInput.mp = false;
      this.virtualInput.hp = false;
      this.virtualInput.lk = false;
      this.virtualInput.mk = false;
      this.virtualInput.hk = false;
      this.virtualInput.superMove = false;
      this.virtualInput.special1 = false;
      this.virtualInput.special2 = false;
      this.virtualInput.special3 = false;
      this.virtualInput.special4 = false;
      
      input.forward  = facing === 1 ? input.right : input.left;
      input.backward = facing === 1 ? input.left  : input.right;
    } else {
      // Standard keyboard controls
      input = {
        left:  k ? isDown(k.left) : false,
        right: k ? isDown(k.right) : false,
        up:    k ? isJustDown(k.up) : false,
        down:  k ? isDown(k.down) : false,
        lp:    k ? isJustDown(k.lp) : false,
        mp:    k ? isJustDown(k.mp) : false,
        hp:    k ? isJustDown(k.hp) : false,
        lk:    k ? isJustDown(k.lk) : false,
        mk:    k ? isJustDown(k.mk) : false,
        hk:    k ? isJustDown(k.hk) : false,
        forward:  k ? (facing === 1 ? isDown(k.right) : isDown(k.left)) : false,
        backward: k ? (facing === 1 ? isDown(k.left)  : isDown(k.right)) : false,
        superMove: false,
        special1: false,
        special2: false,
        special3: false,
        special4: false
      };
    }

    // Feed direction to motion parser
    let dir = 'neutral';
    if      (input.down && input.forward)  dir = facing === 1 ? 'down-forward' : 'down-back';
    else if (input.down && input.backward) dir = facing === 1 ? 'down-back'    : 'down-forward';
    else if (input.down)                   dir = 'down';
    else if (input.forward)                dir = 'forward';
    else if (input.backward)              dir = 'back';
    parser.addDirection(dir);

    const anyPunch = input.lp || input.mp || input.hp;
    const anyKick  = input.lk || input.mk || input.hk;

    // Detect Double QCF (Street Fighter super motion) from keys
    if (!input.superMove) {
      const dqcMotion = parser.checkDoubleQCF(facing);
      input.superMove = dqcMotion && anyPunch;
    }

    // Detect standard specials from keys
    if (!input.superMove) {
      const qcfMotion = parser.checkQCF(facing);
      const dpMotion  = parser.checkDP(facing);
      const qcbMotion = parser.checkQCB(facing);

      if (!input.special1) input.special1 = qcfMotion && anyPunch;
      if (!input.special2) input.special2 = dpMotion  && anyPunch;
      if (!input.special3) input.special3 = qcfMotion && anyKick;
      if (!input.special4) input.special4 = qcbMotion && anyKick;
    }

    return input;
  }

  destroy() {
    if (this.virtualControlsGroup) {
      this.virtualControlsGroup.destroy(true);
    }
  }
}
