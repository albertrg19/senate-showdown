import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GROUND_Y, ROUND_TIME, ROUNDS_TO_WIN } from '../main.js';
import { Fighter, States } from '../fighters/Fighter.js';
import { RobinPadillaData } from '../fighters/characters/RobinPadilla.js';
import { KikoPangilinanData } from '../fighters/characters/KikoPangilinan.js';
import { InputManager } from '../input/InputManager.js';
import { FighterRenderer } from '../rendering/FighterRenderer.js';
import { StageRenderer } from '../rendering/StageRenderer.js';
import { HUD } from '../rendering/HUD.js';
import { ParticleEffects } from '../rendering/ParticleEffects.js';
import { AIController } from '../fighters/AIController.js';

const CHARACTER_DATA = {
  robin: RobinPadillaData,
  kiko:  KikoPangilinanData
};

// Only 3 game states — the game loop NEVER pauses during combat.
// All hit effects (flash, shake, particles) are non-blocking visual tweens.
const FIGHT_STATES = {
  ROUND_INTRO: 'roundIntro',
  FIGHTING:    'fighting',
  ROUND_END:   'roundEnd',
  MATCH_END:   'matchEnd'
};

export class FightScene extends Phaser.Scene {
  constructor() {
    super({ key: 'FightScene' });
  }

  create() {
    const p1Char = this.registry.get('p1Character') || 'robin';
    const p2Char = this.registry.get('p2Character') || 'kiko';

    // Systems
    this.inputManager    = new InputManager(this);
    this.stageRenderer   = new StageRenderer(this);
    this.fighterRenderer = new FighterRenderer(this);
    this.hud             = new HUD(this);
    this.particles       = new ParticleEffects(this);
    this.sound_mgr       = this.registry.get('soundManager');

    // Match mode
    this.gameMode = this.registry.get('gameMode') || 'local';

    // Fighters
    this.p1 = new Fighter(280, GROUND_Y,  1, CHARACTER_DATA[p1Char]);
    this.p2 = new Fighter(680, GROUND_Y, -1, CHARACTER_DATA[p2Char]);
    this.fighterRenderer.createFaceSprite(this.p1, this.p1.data.faceKey);
    this.fighterRenderer.createFaceSprite(this.p2, this.p2.data.faceKey);

    // AI
    this.aiController = null;
    if (this.gameMode === 'solo') {
      this.aiController = new AIController(this.p2);
    }

    // Match state
    this.p1Wins        = 0;
    this.p2Wins        = 0;
    this.currentRound  = 1;
    this.roundTimer    = ROUND_TIME;
    this.fightState    = FIGHT_STATES.ROUND_INTRO;
    this.roundEndTimer = 0;

    // Online buffer setup
    this.isDisconnecting = false;
    if (this.gameMode === 'online') {
      this.conn = this.registry.get('p2pConnection');
      this.isHost = this.registry.get('isHost');
      
      this.simulationFrame = 0;
      this.localInputBuffer = {};
      this.remoteInputBuffer = {};
      
      // Clear previous data, close, and error listeners from CharacterSelectScene
      this.conn.off('data');
      this.conn.off('close');
      this.conn.off('error');
      
      this.conn.on('data', (data) => {
        if (data && data.type === 'frame_input') {
          this.remoteInputBuffer[data.frame] = data.input;
        }
      });
      
      this.conn.on('close', () => this.handleDisconnect());
      this.conn.on('error', () => this.handleDisconnect());
    }

    // Perfect round
    this.p1TookDamage = false;
    this.p2TookDamage = false;

    // Camera shake — decays naturally, never blocks the loop
    this.shakeIntensity    = 0;
    this.dizzyParticleTick = 0;

    // Non-blocking flash overlay (just a Phaser graphics object for tweens)
    this.flashOverlay = this.add.graphics().setDepth(92).setAlpha(0);

    this.startRoundIntro();
  }

  // ─── Round intro ────────────────────────────────────────────────────────
  startRoundIntro() {
    this.fightState = FIGHT_STATES.ROUND_INTRO;
    this.p1.reset(280);
    this.p2.reset(680);
    this.roundTimer   = ROUND_TIME;
    this.p1TookDamage = false;
    this.p2TookDamage = false;

    this.time.delayedCall(300, () => {
      if (this.sound_mgr) this.sound_mgr.playRoundStart();
      this.hud.showRoundStart(this.currentRound);
      // Start fighting after the "FIGHT!" announcement finishes (~2 s)
      this.time.delayedCall(1800, () => {
        this.fightState = FIGHT_STATES.FIGHTING;
      });
    });
  }

  // ─── Main loop (NEVER pauses) ────────────────────────────────────────────
  update(time, delta) {
    this.stageRenderer.draw();
    this.particles.update();

    // Camera shake (decays every frame regardless of game state)
    if (this.shakeIntensity > 0.5) {
      this.cameras.main.setScroll(
        (Math.random() - 0.5) * this.shakeIntensity,
        (Math.random() - 0.5) * this.shakeIntensity
      );
      this.shakeIntensity *= 0.85;
    } else {
      this.cameras.main.setScroll(0, 0);
      this.shakeIntensity = 0;
    }

    // Dizzy star particles
    this.dizzyParticleTick++;
    if (this.dizzyParticleTick % 8 === 0) {
      if (this.p1.dizzyTimer > 0) this.particles.spawnDizzyEffect(this.p1.x, this.p1.y);
      if (this.p2.dizzyTimer > 0) this.particles.spawnDizzyEffect(this.p2.x, this.p2.y);
    }

    switch (this.fightState) {
      case FIGHT_STATES.ROUND_INTRO:
        // Fighters stand idle during countdown — still render, no input
        this.fighterRenderer.clear();
        this.fighterRenderer.draw(this.p1);
        this.fighterRenderer.draw(this.p2);
        this.hud.update(this.p1, this.p2, this.roundTimer, this.p1Wins, this.p2Wins);
        break;

      case FIGHT_STATES.FIGHTING:
        this._updateFighting(delta);
        break;

      case FIGHT_STATES.ROUND_END:
        // Fighters play victory/defeat anims; timer frozen
        this.p1.stateFrame++;
        this.p2.stateFrame++;
        this.roundEndTimer--;
        this.fighterRenderer.clear();
        this.fighterRenderer.draw(this.p1);
        this.fighterRenderer.draw(this.p2);
        this.hud.update(this.p1, this.p2, this.roundTimer, this.p1Wins, this.p2Wins);

        if (this.roundEndTimer <= 0) {
          if (this.p1Wins >= ROUNDS_TO_WIN || this.p2Wins >= ROUNDS_TO_WIN) {
            this._endMatch();
          } else {
            this.currentRound++;
            this.startRoundIntro();
          }
        }
        break;

      case FIGHT_STATES.MATCH_END:
        this.p1.stateFrame++;
        this.p2.stateFrame++;
        this.fighterRenderer.clear();
        this.fighterRenderer.draw(this.p1);
        this.fighterRenderer.draw(this.p2);
        this.hud.update(this.p1, this.p2, this.roundTimer, this.p1Wins, this.p2Wins);
        break;
    }
  }

  // ─── Fighting logic (runs every frame — no pausing) ──────────────────────
  _updateFighting(delta) {
    let p1Input, p2Input;

    if (this.gameMode === 'online') {
      const INPUT_DELAY = 4; // 4 frames (66ms) delay budget for WebRTC transit
      
      // Capture local input physically (always 'p1' config layout in local browser)
      const localInput = this.inputManager.getInput('p1', this.isHost ? this.p1.facing : this.p2.facing);
      
      // Schedule local input for execution INPUT_DELAY frames in the future
      const targetFrame = this.simulationFrame + INPUT_DELAY;
      this.localInputBuffer[targetFrame] = localInput;
      
      // Broadcast this scheduled input to the remote peer
      if (this.conn && this.conn.open) {
        this.conn.send({
          type: 'frame_input',
          frame: targetFrame,
          input: localInput
        });
      }
      
      const currentFrame = this.simulationFrame;
      
      // Default empty input structure for startup frames
      const emptyInput = {
        left: false, right: false, up: false, down: false,
        lp: false, mp: false, hp: false, lk: false, mk: false, hk: false,
        forward: false, backward: false, superMove: false,
        special1: false, special2: false, special3: false, special4: false
      };
      
      let p1FrameInput, p2FrameInput;
      
      if (currentFrame < INPUT_DELAY) {
        // Startup buffer loading phase: both players stand idle
        p1FrameInput = emptyInput;
        p2FrameInput = emptyInput;
      } else {
        // Execution phase: fetch ready inputs from the buffer queues
        const myInput = this.localInputBuffer[currentFrame];
        const theirInput = this.remoteInputBuffer[currentFrame];
        
        if (!myInput || !theirInput) {
          // Freeze simulation only if a packet gets dropped or highly delayed
          this.fighterRenderer.clear();
          this.fighterRenderer.draw(this.p1);
          this.fighterRenderer.draw(this.p2);
          return;
        }
        
        p1FrameInput = this.isHost ? myInput : theirInput;
        p2FrameInput = this.isHost ? theirInput : myInput;
      }
      
      p1Input = p1FrameInput;
      p2Input = p2FrameInput;
      this.simulationFrame++;
    } else {
      // Offline local battle / VS CPU
      p1Input = this.inputManager.getInput('p1', this.p1.facing);
      p2Input = this.aiController 
        ? this.aiController.getInput(this.p1) 
        : this.inputManager.getInput('p2', this.p2.facing);
    }

    this.p1.update(p1Input, this.p2);
    this.p2.update(p2Input, this.p1);

    // Handle special move signal effects (explosion, shockwave particles)
    [this.p1, this.p2].forEach(fighter => {
      if (fighter.explosionSignal) {
        this.particles.spawnExplosionEffect(fighter.x + 30 * fighter.facing, fighter.y - 50);
        this.shakeIntensity = 10;
        fighter.explosionSignal = false;
      }
      if (fighter.shockwaveSignal) {
        this.particles.spawnShockwaveEffect(fighter.x, fighter.y);
        this.shakeIntensity = 6;
        fighter.shockwaveSignal = false;
      }
    });

    this._handlePushCollision();
    this._checkHits();
    this._checkProjectileHits();

    // Round timer
    this.roundTimer -= delta / 1000;

    // Round-end conditions
    if (this.p1.isDead() || this.p2.isDead()) {
      this._endRound(this.p1.isDead() ? 'p2' : 'p1', true);
    } else if (this.roundTimer <= 0) {
      this.roundTimer = 0;
      const winner = this.p1.health > this.p2.health ? 'p1' :
                     this.p2.health > this.p1.health ? 'p2' : 'draw';
      this._endRound(winner, false);
    }

    this.fighterRenderer.clear();
    this.fighterRenderer.draw(this.p1);
    this.fighterRenderer.draw(this.p2);
    this.hud.update(this.p1, this.p2, this.roundTimer, this.p1Wins, this.p2Wins);
  }

  // ─── Push separation ─────────────────────────────────────────────────────
  _handlePushCollision() {
    const a = this.p1.getWorldHurtbox();
    const b = this.p2.getWorldHurtbox();

    if (a.x < b.x + b.w && a.x + a.w > b.x &&
        a.y < b.y + b.h && a.y + a.h > b.y) {
      const overlap = (a.x + a.w / 2) < (b.x + b.w / 2)
        ? (a.x + a.w) - b.x
        : (b.x + b.w) - a.x;
      const dir = this.p1.x < this.p2.x ? -1 : 1;
      this.p1.x += dir * overlap * 0.5;
      this.p2.x -= dir * overlap * 0.5;
    }
  }

  // ─── Hit detection ────────────────────────────────────────────────────────
  _checkHits() {
    this._checkFighterHit(this.p1, this.p2);
    this._checkFighterHit(this.p2, this.p1);
  }

  _checkFighterHit(attacker, defender) {
    const hitbox  = attacker.getWorldHitbox();
    if (!hitbox) return;
    const hurtbox = defender.getWorldHurtbox();

    // AABB test
    if (!(hitbox.x < hurtbox.x + hurtbox.w &&
          hitbox.x + hitbox.w > hurtbox.x &&
          hitbox.y < hurtbox.y + hurtbox.h &&
          hitbox.y + hitbox.h > hurtbox.y)) return;

    if (attacker.hitConnected) return;
    attacker.hitConnected = true;

    const result = defender.takeDamage(hitbox);

    // Midpoint of collision — used for particle spawning
    const hitX = (hitbox.x + hitbox.w / 2 + hurtbox.x + hurtbox.w / 2) / 2;
    const hitY = (hitbox.y + hurtbox.y) / 2;

    // Attacker builds super meter on every hit/block
    attacker.superMeter = Math.min(attacker.maxSuper, attacker.superMeter + 8);

    // Perfect-round tracking
    if (result === 'hit' || result === 'dizzy') {
      if (defender === this.p2) this.p2TookDamage = true;
      else                      this.p1TookDamage = true;
    }
    if (result === 'blocked' && hitbox.chip) {
      if (defender === this.p2) this.p2TookDamage = true;
      else                      this.p1TookDamage = true;
    }

    const isSuper   = attacker.state === States.SUPER;
    const isSpecial = [States.SPECIAL1, States.SPECIAL2, States.SPECIAL3, States.SPECIAL4].includes(attacker.state);
    const isHeavy   = [States.HEAVY_PUNCH, States.HEAVY_KICK].includes(attacker.state);

    // ── HIT ───────────────────────────────────────────────────────────────
    if (result === 'hit' || result === 'dizzy') {

      if (isSuper) {
        // Super hit — big non-blocking visual flash + particles
        this._doSuperHitEffect(attacker, hitX, hitY);

      } else if (isSpecial) {
        this.particles.spawnHitSparks(hitX, hitY, attacker.data.energyColor);
        if (attacker.data.name === 'Robin Padilla') this.particles.spawnFireEffect(hitX, hitY);
        else                                         this.particles.spawnLeafEffect(hitX, hitY);
        this.shakeIntensity = 8;
        if (this.sound_mgr) this.sound_mgr.playSpecial();

      } else if (isHeavy) {
        this.particles.spawnHitSparks(hitX, hitY, 0xFFD700);
        this.shakeIntensity = 5;
        if (this.sound_mgr) this.sound_mgr.playHitHeavy();

      } else {
        // Light or medium punch
        this.particles.spawnHitSparks(hitX, hitY, 0xFFFFFF);
        this.shakeIntensity = 2;
        if (this.sound_mgr) this.sound_mgr.playHitLight();
      }

      // Dizzy trigger
      if (result === 'dizzy') {
        this.hud.showDizzy(defender);
        this.particles.spawnSuperEffect(defender.x, defender.y - 50, 0xFFFF00);
      }

    // ── BLOCKED ───────────────────────────────────────────────────────────
    } else if (result === 'blocked') {
      this.particles.spawnBlockSparks(hitX, hitY);
      if (hitbox.chip) {
        this.particles.spawnChipEffect(hitX, hitY);
        this.hud.showChipDamage(hitX, hitY - 20);
      }
      if (this.sound_mgr) this.sound_mgr.playBlock();

    // ── INVINCIBLE ────────────────────────────────────────────────────────
    } else if (result === 'invincible') {
      this.particles.spawnBlockSparks(hitX, hitY);
    }
  }

  // ─── Super hit effect (non-blocking — just tweens) ────────────────────────
  _doSuperHitEffect(attacker, hitX, hitY) {
    // Big particle burst
    this.particles.spawnSuperEffect(hitX, hitY, attacker.data.energyColor);
    this.particles.spawnKOEffect(hitX, hitY);
    this.shakeIntensity = 20;

    // Brief white screen flash via tween (does NOT stop the game loop)
    this.flashOverlay.clear();
    this.flashOverlay.fillStyle(0xFFFFFF, 1);
    this.flashOverlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.tweens.add({
      targets:  this.flashOverlay,
      alpha:    { from: 0.85, to: 0 },
      duration: 250,
      ease:     'Power2'
    });

    // HUD super name banner
    this.hud.showSuperFlash(attacker);
    if (this.sound_mgr) this.sound_mgr.playSpecial();
  }

  // ─── Projectile hits ──────────────────────────────────────────────────────
  _checkProjectileHits() {
    // P1 projectiles → P2
    for (let i = this.p1.projectiles.length - 1; i >= 0; i--) {
      const proj    = this.p1.projectiles[i];
      const hurtbox = this.p2.getWorldHurtbox();
      if (this._projHits(proj, hurtbox)) {
        const result = this.p2.takeDamage(proj);
        this._onProjectileHit(result, proj, this.p2, this.p1.data.energyColor);
        this.p1.superMeter = Math.min(this.p1.maxSuper, this.p1.superMeter + 5);
        this.p1.projectiles.splice(i, 1);
      }
    }

    // P2 projectiles → P1
    for (let j = this.p2.projectiles.length - 1; j >= 0; j--) {
      const proj    = this.p2.projectiles[j];
      const hurtbox = this.p1.getWorldHurtbox();
      if (this._projHits(proj, hurtbox)) {
        const result = this.p1.takeDamage(proj);
        this._onProjectileHit(result, proj, this.p1, this.p2.data.energyColor);
        this.p2.superMeter = Math.min(this.p2.maxSuper, this.p2.superMeter + 5);
        this.p2.projectiles.splice(j, 1);
      }
    }

    // Projectile vs projectile clash
    for (let a = this.p1.projectiles.length - 1; a >= 0; a--) {
      for (let b = this.p2.projectiles.length - 1; b >= 0; b--) {
        const pa = this.p1.projectiles[a];
        const pb = this.p2.projectiles[b];
        if (pa && pb && Math.abs(pa.x - pb.x) < 30 && Math.abs(pa.y - pb.y) < 20) {
          this.particles.spawnHitSparks((pa.x + pb.x) / 2, (pa.y + pb.y) / 2, 0xFFFFFF);
          this.p1.projectiles.splice(a, 1);
          this.p2.projectiles.splice(b, 1);
          if (this.sound_mgr) this.sound_mgr.playBlock();
        }
      }
    }
  }

  _projHits(proj, hurtbox) {
    return proj.x - proj.w / 2 < hurtbox.x + hurtbox.w &&
           proj.x + proj.w / 2 > hurtbox.x &&
           proj.y - proj.h / 2 < hurtbox.y + hurtbox.h &&
           proj.y + proj.h / 2 > hurtbox.y;
  }

  _onProjectileHit(result, proj, defender, energyColor) {
    if (result === 'hit' || result === 'dizzy') {
      this.particles.spawnHitSparks(proj.x, proj.y, proj.color || energyColor);
      this.shakeIntensity = 4;
      if (defender === this.p2) this.p2TookDamage = true;
      else                      this.p1TookDamage = true;
      if (this.sound_mgr) this.sound_mgr.playHitHeavy();
      if (result === 'dizzy') {
        this.hud.showDizzy(defender);
        this.particles.spawnSuperEffect(defender.x, defender.y - 50, 0xFFFF00);
      }
    } else if (result === 'blocked') {
      this.particles.spawnBlockSparks(proj.x, proj.y);
      if (proj.chip) {
        this.particles.spawnChipEffect(proj.x, proj.y);
        this.hud.showChipDamage(proj.x, proj.y - 20);
        if (defender === this.p2) this.p2TookDamage = true;
        else                      this.p1TookDamage = true;
      }
      if (this.sound_mgr) this.sound_mgr.playBlock();
    }
  }

  // ─── End round ────────────────────────────────────────────────────────────
  _endRound(winner, isKO) {
    if (this.fightState === FIGHT_STATES.ROUND_END ||
        this.fightState === FIGHT_STATES.MATCH_END) return;

    this.fightState    = FIGHT_STATES.ROUND_END;
    this.roundEndTimer = 150; // 2.5 s at 60 fps

    const isPerfect =
      (winner === 'p1' && !this.p1TookDamage) ||
      (winner === 'p2' && !this.p2TookDamage);

    if (winner === 'p1') {
      this.p1Wins++;
      this.p1.setState(States.VICTORY);
      this.p2.setState(States.DEFEAT);
    } else if (winner === 'p2') {
      this.p2Wins++;
      this.p2.setState(States.VICTORY);
      this.p1.setState(States.DEFEAT);
    }

    if (isKO) {
      const loser = winner === 'p1' ? this.p2 : this.p1;
      this.particles.spawnKOEffect(loser.x, loser.y - 40);
      if (this.sound_mgr) this.sound_mgr.playKO();
      this.shakeIntensity = 15;
      this.hud.showKO();
    } else {
      this.hud.showTimeOver();
    }

    if (isPerfect && isKO) {
      this.hud.showPerfect();
      this.particles.spawnConfetti(GAME_WIDTH / 2, 100);
      this.particles.spawnSuperEffect(GAME_WIDTH / 2, GAME_HEIGHT / 2, 0xFFD700);
    }
  }

  // ─── End match ────────────────────────────────────────────────────────────
  _endMatch() {
    this.fightState = FIGHT_STATES.MATCH_END;
    const winnerId = this.p1Wins >= ROUNDS_TO_WIN ? 'p1' : 'p2';
    const winner   = winnerId === 'p1' ? this.p1 : this.p2;

    this.particles.spawnConfetti(GAME_WIDTH / 2, 100);
    if (this.sound_mgr) this.sound_mgr.playVictory();

    this.time.delayedCall(2500, () => {
      this.scene.start('VictoryScene', {
        winner: winner.data,
        winnerId,
        p1Wins: this.p1Wins,
        p2Wins: this.p2Wins
      });
    });
  }

  // ─── Cleanup ──────────────────────────────────────────────────────────────
  shutdown() {
    if (this.inputManager)    this.inputManager.destroy();
    if (this.stageRenderer)   this.stageRenderer.destroy();
    if (this.fighterRenderer) this.fighterRenderer.destroy();
    if (this.hud)             this.hud.destroy();
    if (this.particles)       this.particles.destroy();
    if (this.flashOverlay)    this.flashOverlay.destroy();
  }

  handleDisconnect() {
    if (this.isDisconnecting) return;
    this.isDisconnecting = true;
    
    const disconnectText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'ONLINE CONNECTION LOST\nRETURNING TO LOBBY...', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '24px',
      color: '#FF3333',
      align: 'center',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 5
    }).setOrigin(0.5).setDepth(200);
    
    this.time.delayedCall(3000, () => {
      this.scene.start('LobbyScene');
    });
  }
}
