import { GROUND_Y, GRAVITY } from '../main.js';

// Fighter states
export const States = {
  IDLE: 'idle',
  WALK_F: 'walkForward',
  WALK_B: 'walkBackward',
  CROUCH: 'crouch',
  JUMP: 'jump',
  JUMP_F: 'jumpForward',
  JUMP_B: 'jumpBackward',
  LIGHT_PUNCH: 'lightPunch',
  MEDIUM_PUNCH: 'mediumPunch',
  HEAVY_PUNCH: 'heavyPunch',
  LIGHT_KICK: 'lightKick',
  MEDIUM_KICK: 'mediumKick',
  HEAVY_KICK: 'heavyKick',
  CROUCH_PUNCH: 'crouchPunch',
  CROUCH_KICK: 'crouchKick',
  JUMP_PUNCH: 'jumpPunch',
  JUMP_KICK: 'jumpKick',
  SPECIAL1: 'special1',
  SPECIAL2: 'special2',
  SPECIAL3: 'special3',
  SPECIAL4: 'special4',
  SUPER: 'super',
  HIT_STUN: 'hitStun',
  BLOCK_STUN: 'blockStun',
  KNOCKDOWN: 'knockDown',
  GETUP: 'getUp',
  DIZZY: 'dizzy',
  VICTORY: 'victory',
  DEFEAT: 'defeat'
};

// Base Fighter class
export class Fighter {
  constructor(x, y, facing, characterData) {
    this.x = x;
    this.y = y;
    this.velX = 0;
    this.velY = 0;
    this.facing = facing; // 1 = right, -1 = left

    // Character data
    this.data = characterData;
    this.name = characterData.name;

    // Stats
    this.health = 100;
    this.maxHealth = 100;
    this.superMeter = 0;
    this.maxSuper = 100;

    // Stun system (Street Fighter dizzy mechanic)
    this.stunMeter = 0;
    this.maxStun = 150;
    this.stunDecay = 1.5;         // per frame when not being hit
    this.dizzyTimer = 0;          // frames remaining dizzy
    this.stunCooldown = 0;        // frames after leaving dizzy before stun can build again

    // State
    this.state = States.IDLE;
    this.stateFrame = 0;
    this.stateTimer = 0;
    this.isGrounded = true;
    this.isBlocking = false;
    this.isInvincible = false;    // super startup invincibility
    this.comboCount = 0;
    this.comboTimer = 0;
    this.lastComboCount = 0;
    this.hitstunFrames = 0;
    this.blockstunFrames = 0;

    // Cancel window (SF mechanic — cancel normals into specials)
    this.inCancelWindow = false;

    // Hitbox
    this.hurtbox = { x: -25, y: -80, w: 50, h: 80 };
    this.activeHitbox = null;
    this.hitConnected = false;

    // Projectile
    this.projectiles = [];

    // Visual
    this.flashTimer = 0;
    this.shakeAmount = 0;
    this.afterimages = [];
    this.dizzyStars = [];         // visual dizzy star positions

    // Animation
    this.animFrame = 0;
    this.animTimer = 0;

    // Dimensions
    this.width = 50;
    this.height = 80;

    // Knockdown
    this.knockdownTimer = 0;
    this.getupTimer = 0;
  }

  getWorldHurtbox() {
    return {
      x: this.x + this.hurtbox.x,
      y: this.y + this.hurtbox.y,
      w: this.hurtbox.w,
      h: this.hurtbox.h
    };
  }

  getWorldHitbox() {
    if (!this.activeHitbox) return null;
    return {
      x: this.x + this.activeHitbox.x * this.facing,
      y: this.y + this.activeHitbox.y,
      w: this.activeHitbox.w,
      h: this.activeHitbox.h,
      damage: this.activeHitbox.damage,
      hitstun: this.activeHitbox.hitstun,
      blockstun: this.activeHitbox.blockstun,
      knockback: this.activeHitbox.knockback,
      launch: this.activeHitbox.launch || false,
      stun: this.activeHitbox.stun || 0,
      chip: this.activeHitbox.chip || false
    };
  }

  update(input, opponent) {
    this.stateFrame++;
    this.animTimer++;

    // Decrement timers
    if (this.comboTimer > 0) {
      this.comboTimer--;
      if (this.comboTimer <= 0) {
        this.lastComboCount = this.comboCount;
        this.comboCount = 0;
      }
    }
    if (this.flashTimer > 0) this.flashTimer--;
    if (this.shakeAmount > 0) this.shakeAmount *= 0.9;
    if (this.stunCooldown > 0) this.stunCooldown--;

    // Stun meter decay (when not in hitstun)
    if (this.state !== States.HIT_STUN && this.state !== States.KNOCKDOWN && this.state !== States.DIZZY) {
      this.stunMeter = Math.max(0, this.stunMeter - this.stunDecay);
    }

    // Afterimages decay
    this.afterimages = this.afterimages.filter(a => {
      a.alpha -= 0.08;
      return a.alpha > 0;
    });

    // Dizzy star rotation
    if (this.state === States.DIZZY) {
      this.dizzyStars = this.dizzyStars.map((s, i) => ({
        ...s,
        angle: s.angle + 0.12
      }));
    }

    // Update projectiles
    this.projectiles = this.projectiles.filter(p => {
      p.x += p.velX;
      p.life--;
      return p.life > 0 && p.x > 0 && p.x < 960;
    });

    // Auto-face opponent
    if (this.isActionState()) {
      // Don't change facing during attacks
    } else if (opponent) {
      this.facing = opponent.x > this.x ? 1 : -1;
    }

    // State machine
    this.updateState(input, opponent);

    // Physics
    this.applyPhysics();

    // Boundaries
    this.x = Math.max(40, Math.min(920, this.x));
  }

  applyPhysics() {
    if (!this.isGrounded) {
      this.velY += GRAVITY / 60;
      this.y += this.velY / 60;

      if (this.y >= GROUND_Y) {
        this.y = GROUND_Y;
        this.velY = 0;
        this.isGrounded = true;

        if (this.state === States.KNOCKDOWN) {
          this.knockdownTimer = 40;
        } else if (this.state === States.JUMP || this.state === States.JUMP_F || this.state === States.JUMP_B ||
                   this.state === States.JUMP_PUNCH || this.state === States.JUMP_KICK) {
          this.setState(States.IDLE);
        }
      }
    }

    this.x += this.velX / 60;
  }

  updateState(input, opponent) {
    this.activeHitbox = null;
    this.inCancelWindow = false;

    // Handle horizontal air drift / steering when airborne
    const isJumpState = [
      States.JUMP, States.JUMP_F, States.JUMP_B,
      States.JUMP_PUNCH, States.JUMP_KICK
    ].includes(this.state);

    if (!this.isGrounded && isJumpState) {
      if (input) {
        if (input.forward) {
          this.velX = this.data.walkSpeed * this.facing;
          if (!this.isAttacking()) {
            if (this.state !== States.JUMP_F) {
              this.setState(States.JUMP_F);
            }
          }
        } else if (input.backward) {
          this.velX = -this.data.walkSpeed * this.facing * 0.7;
          if (!this.isAttacking()) {
            if (this.state !== States.JUMP_B) {
              this.setState(States.JUMP_B);
            }
          }
        }
      }
    }

    switch (this.state) {
      case States.IDLE:
        this.velX = 0;
        this.isInvincible = false;
        this.handleIdleInput(input);
        break;

      case States.WALK_F:
        this.velX = this.data.walkSpeed * this.facing;
        if (!input.forward) this.setState(States.IDLE);
        else this.handleMovementAttacks(input);
        break;

      case States.WALK_B:
        this.velX = -this.data.walkSpeed * this.facing * 0.7;
        this.isBlocking = true;
        if (!input.backward) {
          this.isBlocking = false;
          this.setState(States.IDLE);
        } else {
          this.handleBackwardMovementAttacks(input);
        }
        break;

      case States.CROUCH:
        this.velX = 0;
        this.isBlocking = input.backward;
        this.hurtbox = { x: -25, y: -50, w: 50, h: 50 };
        if (!input.down) {
          this.hurtbox = { x: -25, y: -80, w: 50, h: 80 };
          this.isBlocking = false;
          this.setState(States.IDLE);
        } else if (input.lp || input.mp || input.hp) {
          this.setState(States.CROUCH_PUNCH);
        } else if (input.lk || input.mk || input.hk) {
          this.setState(States.CROUCH_KICK);
        }
        break;

      case States.JUMP:
      case States.JUMP_F:
      case States.JUMP_B:
        if (input.lp || input.mp || input.hp) this.setState(States.JUMP_PUNCH);
        else if (input.lk || input.mk || input.hk) this.setState(States.JUMP_KICK);
        break;

      case States.LIGHT_PUNCH:
        this.handleAttackState(this.data.moves.lightPunch, input);
        break;
      case States.MEDIUM_PUNCH:
        this.handleAttackState(this.data.moves.mediumPunch || this.data.moves.heavyPunch, input);
        break;
      case States.HEAVY_PUNCH:
        this.handleAttackState(this.data.moves.heavyPunch, input);
        break;
      case States.LIGHT_KICK:
        this.handleAttackState(this.data.moves.lightKick, input);
        break;
      case States.MEDIUM_KICK:
        this.handleAttackState(this.data.moves.mediumKick || this.data.moves.heavyKick, input);
        break;
      case States.HEAVY_KICK:
        this.handleAttackState(this.data.moves.heavyKick, input);
        break;
      case States.CROUCH_PUNCH:
        this.hurtbox = { x: -25, y: -50, w: 50, h: 50 };
        this.handleAttackState(this.data.moves.crouchPunch, input);
        break;
      case States.CROUCH_KICK:
        this.hurtbox = { x: -25, y: -50, w: 50, h: 50 };
        this.handleAttackState(this.data.moves.crouchKick, input);
        break;
      case States.JUMP_PUNCH:
        this.handleAttackState(this.data.moves.jumpPunch, input);
        break;
      case States.JUMP_KICK:
        this.handleAttackState(this.data.moves.jumpKick, input);
        break;
      case States.SPECIAL1:
        this.handleAttackState(this.data.moves.special1, input);
        break;
      case States.SPECIAL2:
        this.handleAttackState(this.data.moves.special2, input);
        break;
      case States.SPECIAL3:
        this.handleAttackState(this.data.moves.special3, input);
        break;
      case States.SPECIAL4:
        this.handleAttackState(this.data.moves.special4, input);
        break;
      case States.SUPER:
        this.isInvincible = this.stateFrame < (this.data.moves.super?.frames?.startup || 20);
        this.handleAttackState(this.data.moves.super, input);
        break;

      case States.HIT_STUN:
        this.velX = 0;
        if (this.hitstunFrames > 0) {
          this.hitstunFrames--;
        } else {
          this.setState(States.IDLE);
        }
        break;

      case States.BLOCK_STUN:
        this.velX = 0;
        if (this.blockstunFrames > 0) {
          this.blockstunFrames--;
        } else {
          this.isBlocking = false;
          this.setState(States.IDLE);
        }
        break;

      case States.KNOCKDOWN:
        if (this.isGrounded) {
          if (this.knockdownTimer > 0) {
            this.knockdownTimer--;
          } else {
            this.setState(States.GETUP);
          }
        }
        break;

      case States.GETUP:
        if (this.stateFrame > 20) {
          this.setState(States.IDLE);
        }
        break;

      case States.DIZZY:
        this.velX = 0;
        if (this.dizzyTimer > 0) {
          this.dizzyTimer--;
          // Spin stars
          if (this.dizzyStars.length === 0) {
            for (let i = 0; i < 5; i++) {
              this.dizzyStars.push({ angle: (Math.PI * 2 / 5) * i, radius: 30 });
            }
          }
        } else {
          this.dizzyStars = [];
          this.stunMeter = 0;
          this.stunCooldown = 120; // 2 seconds before stun can build again
          this.setState(States.IDLE);
        }
        break;

      case States.VICTORY:
      case States.DEFEAT:
        this.velX = 0;
        this.isInvincible = false;
        break;
    }
  }

  handleIdleInput(input) {
    // Priority: super > specials > heavy > medium > light > movement
    if (input.superMove && this.superMeter >= this.maxSuper) {
      this.superMeter = 0;
      this.setState(States.SUPER);
    } else if (input.special2) {
      this.setState(States.SPECIAL2);
    } else if (input.special1) {
      this.setState(States.SPECIAL1);
    } else if (input.special3) {
      this.setState(States.SPECIAL3);
    } else if (input.special4) {
      this.setState(States.SPECIAL4);
    } else if (input.up) {
      if (input.forward) this.startJump(1);
      else if (input.backward) this.startJump(-1);
      else this.startJump(0);
    } else if (input.down) {
      this.setState(States.CROUCH);
    } else if (input.hp) {
      this.setState(States.HEAVY_PUNCH);
    } else if (input.mp) {
      this.setState(States.MEDIUM_PUNCH);
    } else if (input.lp) {
      this.setState(States.LIGHT_PUNCH);
    } else if (input.hk) {
      this.setState(States.HEAVY_KICK);
    } else if (input.mk) {
      this.setState(States.MEDIUM_KICK);
    } else if (input.lk) {
      this.setState(States.LIGHT_KICK);
    } else if (input.forward) {
      this.setState(States.WALK_F);
    } else if (input.backward) {
      this.setState(States.WALK_B);
    }
  }

  handleMovementAttacks(input) {
    if (input.superMove && this.superMeter >= this.maxSuper) {
      this.superMeter = 0;
      this.setState(States.SUPER);
    } else if (input.special2) this.setState(States.SPECIAL2);
    else if (input.special1) this.setState(States.SPECIAL1);
    else if (input.special3) this.setState(States.SPECIAL3);
    else if (input.special4) this.setState(States.SPECIAL4);
    else if (input.up) this.startJump(1);
    else if (input.hp) this.setState(States.HEAVY_PUNCH);
    else if (input.mp) this.setState(States.MEDIUM_PUNCH);
    else if (input.lp) this.setState(States.LIGHT_PUNCH);
    else if (input.hk) this.setState(States.HEAVY_KICK);
    else if (input.mk) this.setState(States.MEDIUM_KICK);
    else if (input.lk) this.setState(States.LIGHT_KICK);
  }

  handleBackwardMovementAttacks(input) {
    if (input.superMove && this.superMeter >= this.maxSuper) {
      this.superMeter = 0;
      this.setState(States.SUPER);
    } else if (input.special2) this.setState(States.SPECIAL2);
    else if (input.special1) this.setState(States.SPECIAL1);
    else if (input.special3) this.setState(States.SPECIAL3);
    else if (input.up) this.startJump(-1); // Jump backward!
    else if (input.hp) this.setState(States.HEAVY_PUNCH);
    else if (input.mp) this.setState(States.MEDIUM_PUNCH);
    else if (input.lp) this.setState(States.LIGHT_PUNCH);
    else if (input.hk) this.setState(States.HEAVY_KICK);
    else if (input.mk) this.setState(States.MEDIUM_KICK);
    else if (input.lk) this.setState(States.LIGHT_KICK);
  }

  startJump(direction) {
    this.isGrounded = false;
    this.velY = -this.data.jumpForce;
    this.velX = direction * this.data.walkSpeed * this.facing;
    if (direction > 0) this.setState(States.JUMP_F);
    else if (direction < 0) this.setState(States.JUMP_B);
    else this.setState(States.JUMP);
  }

  handleAttackState(moveData, input) {
    if (!moveData) {
      this.setState(States.IDLE);
      return;
    }

    const frame = this.stateFrame;
    const { startup, active, recovery } = moveData.frames;

    // Cancel window (SF mechanic) — during startup/active/early recovery of cancelable normals
    if (moveData.cancelable && frame >= startup && frame < startup + active + (moveData.cancelWindow || 4)) {
      this.inCancelWindow = true;
      // Check for special move inputs during cancel window
      if (input && (input.special1 || input.special2 || input.special3 || input.special4)) {
        this.hitConnected = false;
        this.hurtbox = { x: -25, y: -80, w: 50, h: 80 };
        if (input.special1) this.setState(States.SPECIAL1);
        else if (input.special2) this.setState(States.SPECIAL2);
        else if (input.special3) this.setState(States.SPECIAL3);
        else if (input.special4) this.setState(States.SPECIAL4);
        return;
      }
    }

    if (frame >= startup && frame < startup + active) {
      // Active frames — hitbox is out
      if (!this.hitConnected) {
        this.activeHitbox = moveData.hitbox;
      }
      // Handle special move behavior
      if (moveData.onActive) {
        moveData.onActive(this, frame - startup);
      }
    }

    if (frame >= startup + active + recovery) {
      // Attack is done
      this.hitConnected = false;
      this.hurtbox = { x: -25, y: -80, w: 50, h: 80 };
      this.inCancelWindow = false;
      if (this.isGrounded) {
        this.setState(States.IDLE);
      } else {
        // Return to active jump state when airborne, allowing further air actions!
        this.setState(States.JUMP);
      }
    }

    if (moveData.onUpdate) {
      moveData.onUpdate(this, frame);
    }
  }

  takeDamage(hitbox) {
    // Invincible during super startup
    if (this.isInvincible) return 'invincible';

    // Cannot be hit while dizzy (already a free punish — don't double punish)
    // Actually in SF you CAN be hit while dizzy

    // Check if blocking
    if (this.isBlocking && this.isGrounded) {
      this.blockstunFrames = hitbox.blockstun || 10;
      this.setState(States.BLOCK_STUN);
      this.x -= hitbox.knockback * 0.3 * (hitbox.x > this.x ? -1 : 1) * -this.facing;
      this.superMeter = Math.min(this.maxSuper, this.superMeter + 2);

      // Chip damage on blocked specials (Street Fighter mechanic)
      if (hitbox.chip) {
        const chipDmg = hitbox.damage * 0.25;
        this.health = Math.max(0, this.health - chipDmg);
        this.flashTimer = 4;
      }

      return 'blocked';
    }

    // Leave dizzy state when hit
    if (this.state === States.DIZZY) {
      this.dizzyStars = [];
      this.stunMeter = 0;
      this.stunCooldown = 120;
    }

    // Take hit
    const scaledDamage = hitbox.damage * Math.max(0.2, 1 - this.comboCount * 0.1);
    this.health = Math.max(0, this.health - scaledDamage);
    this.flashTimer = 8;
    this.comboCount++;
    this.comboTimer = 45;
    this.superMeter = Math.min(this.maxSuper, this.superMeter + 5);

    // Build stun meter (Street Fighter dizzy system)
    if (this.stunCooldown <= 0) {
      const stunGain = hitbox.stun || (hitbox.damage * 1.2);
      this.stunMeter = Math.min(this.maxStun, this.stunMeter + stunGain);

      // Trigger dizzy!
      if (this.stunMeter >= this.maxStun) {
        this.stunMeter = this.maxStun;
        this.dizzyTimer = 180; // 3 seconds at 60fps
        this.dizzyStars = [];
        for (let i = 0; i < 5; i++) {
          this.dizzyStars.push({ angle: (Math.PI * 2 / 5) * i, radius: 30 });
        }
        this.setState(States.DIZZY);
        return 'dizzy';
      }
    }

    if (hitbox.launch) {
      this.velY = -500;
      this.velX = hitbox.knockback * -this.facing;
      this.isGrounded = false;
      this.setState(States.KNOCKDOWN);
    } else if (hitbox.knockback > 200) {
      this.setState(States.KNOCKDOWN);
      this.velX = hitbox.knockback * -this.facing * 0.5;
      this.velY = -300;
      this.isGrounded = false;
    } else {
      this.hitstunFrames = hitbox.hitstun || 15;
      this.setState(States.HIT_STUN);
      this.x -= hitbox.knockback * 0.5 * -this.facing;
    }

    return 'hit';
  }

  setState(newState) {
    if (this.state === newState) return;
    this.state = newState;
    this.stateFrame = 0;
    this.animFrame = 0;
    this.animTimer = 0;
    this.hitConnected = false;
    this.inCancelWindow = false;

    if (newState === States.IDLE || newState === States.WALK_F || newState === States.WALK_B) {
      this.hurtbox = { x: -25, y: -80, w: 50, h: 80 };
      this.isBlocking = newState === States.WALK_B;
    }

    if (newState !== States.SUPER) {
      this.isInvincible = false;
    }
  }

  isActionState() {
    return [
      States.LIGHT_PUNCH, States.MEDIUM_PUNCH, States.HEAVY_PUNCH,
      States.LIGHT_KICK, States.MEDIUM_KICK, States.HEAVY_KICK,
      States.CROUCH_PUNCH, States.CROUCH_KICK, States.JUMP_PUNCH, States.JUMP_KICK,
      States.SPECIAL1, States.SPECIAL2, States.SPECIAL3, States.SPECIAL4, States.SUPER,
      States.HIT_STUN, States.BLOCK_STUN, States.KNOCKDOWN, States.GETUP, States.DIZZY
    ].includes(this.state);
  }

  isAttacking() {
    return [
      States.LIGHT_PUNCH, States.MEDIUM_PUNCH, States.HEAVY_PUNCH,
      States.LIGHT_KICK, States.MEDIUM_KICK, States.HEAVY_KICK,
      States.CROUCH_PUNCH, States.CROUCH_KICK, States.JUMP_PUNCH, States.JUMP_KICK,
      States.SPECIAL1, States.SPECIAL2, States.SPECIAL3, States.SPECIAL4, States.SUPER
    ].includes(this.state);
  }

  isDead() {
    return this.health <= 0;
  }

  reset(x) {
    this.x = x;
    this.y = GROUND_Y;
    this.velX = 0;
    this.velY = 0;
    this.health = this.maxHealth;
    this.superMeter = 0;
    this.stunMeter = 0;
    this.dizzyTimer = 0;
    this.dizzyStars = [];
    this.stunCooldown = 0;
    this.state = States.IDLE;
    this.stateFrame = 0;
    this.isGrounded = true;
    this.isBlocking = false;
    this.isInvincible = false;
    this.comboCount = 0;
    this.comboTimer = 0;
    this.activeHitbox = null;
    this.hitConnected = false;
    this.projectiles = [];
    this.flashTimer = 0;
    this.shakeAmount = 0;
    this.afterimages = [];
    this.knockdownTimer = 0;
    this.inCancelWindow = false;
  }
}
