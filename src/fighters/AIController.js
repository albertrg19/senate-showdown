import { States } from './Fighter.js';

export class AIController {
  constructor(aiFighter) {
    this.ai = aiFighter;
    // Decision cooldown to avoid perfect instant frame reactions and make it feel human/arcade
    this.reactionDelay = 12; // frames of reaction delay
    this.delayTimer = 0;
    this.currentInput = this._getEmptyInput();
  }

  _getEmptyInput() {
    return {
      forward: false,
      backward: false,
      up: false,
      down: false,
      lp: false,
      mp: false,
      hp: false,
      lk: false,
      mk: false,
      hk: false,
      special1: false,
      special2: false,
      special3: false,
      special4: false,
      superMove: false
    };
  }

  getInput(player) {
    // If AI is in hitstun, knockdown, victory or dizzy, return empty input
    if (!this.ai.isGrounded && this.ai.state !== States.JUMP && this.ai.state !== States.JUMP_F && this.ai.state !== States.JUMP_B) {
      return this._getEmptyInput();
    }
    if ([States.HIT_STUN, States.BLOCK_STUN, States.KNOCKDOWN, States.DIZZY, States.DEFEAT, States.VICTORY].includes(this.ai.state)) {
      return this._getEmptyInput();
    }

    // Tick delay timer
    if (this.delayTimer > 0) {
      this.delayTimer--;
      // Keep holding movement but clear one-frame attack buttons
      const persistentInput = { ...this.currentInput };
      persistentInput.lp = false;
      persistentInput.mp = false;
      persistentInput.hp = false;
      persistentInput.lk = false;
      persistentInput.mk = false;
      persistentInput.hk = false;
      persistentInput.special1 = false;
      persistentInput.special2 = false;
      persistentInput.special3 = false;
      persistentInput.special4 = false;
      persistentInput.superMove = false;
      return persistentInput;
    }

    // Reset decision timer with slight random variance
    this.delayTimer = this.reactionDelay + Math.floor(Math.random() * 8);

    const input = this._getEmptyInput();
    const dx = player.x - this.ai.x;
    const absDx = Math.abs(dx);
    const playerFacingAI = (player.x > this.ai.x && player.facing === -1) || (player.x < this.ai.x && player.facing === 1);
    
    // Determine direction
    const forwardKey = dx > 0 ? 'forward' : 'backward';
    const backwardKey = dx > 0 ? 'backward' : 'forward';

    // Check player's threat level (is player attacking?)
    const playerAttacking = player.isAttacking();
    
    // 1. BLOCKING DECISION
    // If player is attacking and close enough, block! (Hold backward)
    if (playerAttacking && absDx < 160) {
      const blockChance = this.ai.name === 'Kiko Pangilinan' ? 0.85 : 0.7; // Kiko blocks more strategically
      if (Math.random() < blockChance) {
        input[backwardKey] = true;
        // If player is doing crouch attack, crouch block!
        if (player.state === States.CROUCH_KICK || player.state === States.CROUCH_PUNCH) {
          input.down = true;
        }
        this.currentInput = input;
        return input;
      }
    }

    // 2. CHARACTER SPECIFIC BEHAVIORS
    if (this.ai.name === 'Robin Padilla') {
      // ─── ROBIN PADILLA: AGGRESSIVE RUSHDOWN ───
      
      // Super Move trigger
      if (this.ai.superMeter >= this.ai.maxSuper && absDx < 200 && Math.random() < 0.25) {
        input.superMove = true;
        this.currentInput = input;
        return input;
      }

      // Anti-Air: If player is jumping and close, Rising Bad Boy (Special 2)
      if (!player.isGrounded && absDx < 120 && Math.random() < 0.8) {
        input.special2 = true;
        this.currentInput = input;
        return input;
      }

      // Close quarters attacks (Combos / Pressure)
      if (absDx < 75) {
        const rand = Math.random();
        if (rand < 0.3) {
          input.lp = true; // Utol Jab
        } else if (rand < 0.55) {
          input.mp = true; // Bad Boy Cross
        } else if (rand < 0.75) {
          input.hp = true; // Bad Boy Haymaker
        } else if (rand < 0.9) {
          input.hk = true; // Federalism Dropkick
        } else if (rand < 0.85) {
          // Special 4: Pistolero Blast (close-range explosive)
          input.special4 = true;
        } else {
          // Special 3: Action Star Rush (slide punch forward)
          input.special3 = true;
        }
      } 
      // Medium range attacks
      else if (absDx < 130) {
        const rand = Math.random();
        if (rand < 0.35) {
          input.special3 = true; // Rush forward
        } else if (rand < 0.6) {
          input.mk = true; // Senate Roundhouse
        } else if (rand < 0.75 && Math.random() < 0.4) {
          // Jump forward punch/kick
          input.up = true;
          input[forwardKey] = true;
          this.timeOutAttack('lk', 200); // Trigger jump kick mid-air
        } else {
          input[forwardKey] = true; // Walk forward aggressively
        }
      } 
      // Far range
      else {
        const rand = Math.random();
        if (rand < 0.2 && Math.random() < 0.5) {
          input.special1 = true; // Throw fireball
        } else {
          input[forwardKey] = true; // Chase down the opponent
        }
      }
    } 
    else {
      // ─── KIKO PANGILINAN: STRATEGIC ZONER ───

      // Super Move trigger
      if (this.ai.superMeter >= this.ai.maxSuper && absDx < 180 && Math.random() < 0.3) {
        input.superMove = true;
        this.currentInput = input;
        return input;
      }

      // Anti-Air: If player is jumping and close, Sagip Saka Upper (Special 2)
      if (!player.isGrounded && absDx < 110 && Math.random() < 0.85) {
        input.special2 = true;
        this.currentInput = input;
        return input;
      }

      // If player is too close, push them away or counter
      if (absDx < 70) {
        const rand = Math.random();
        if (rand < 0.35) {
          input.special3 = true; // Pangilinan Law counter-block
        } else if (rand < 0.6) {
          input.lp = true; // Noted Jab (fast escape)
        } else if (rand < 0.8) {
          input.mk = true; // Reform Stomp
        } else {
          input[backwardKey] = true; // Retreat to zoning distance
        }
      }
      // Zoning range (perfect for Kiko)
      else if (absDx >= 140 && absDx <= 280) {
        const rand = Math.random();
        if (rand < 0.35) {
          input.special1 = true; // GOODBYE GUTOM (Veggie Projectile)
        } else if (rand < 0.55) {
          input.special4 = true; // BATAS NG BAYAN (Ground shockwave)
        } else if (rand < 0.75) {
          input[backwardKey] = true; // Keep maintaining distance
        } else {
          input.down = true; // Crouch to bait player action
        }
      }
      // Very far away
      else if (absDx > 280) {
        const rand = Math.random();
        if (rand < 0.55) {
          input.special1 = true; // Projectile spam
        } else {
          input[forwardKey] = true; // Walk slightly forward to engage
        }
      }
      // Medium range transition
      else {
        const rand = Math.random();
        if (rand < 0.3) {
          input.special1 = true;
        } else if (rand < 0.6) {
          input.hp = true; // Gavel Slam (anti-rushdown hitbox)
        } else {
          input[backwardKey] = true; // Back up to zoners sweet spot
        }
      }
    }

    this.currentInput = input;
    return input;
  }

  // Helper to schedule aerial attacks during a jump
  timeOutAttack(btn, ms) {
    setTimeout(() => {
      if (this.ai && this.currentInput) {
        this.currentInput[btn] = true;
      }
    }, ms);
  }
}
