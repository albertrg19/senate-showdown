// Robin Padilla — "The Bad Boy"
// Archetype: Aggressive Rushdown Brawler
// Color: Red/Black/Gold
// Playstyle: Fast, in-your-face pressure. Quick fireball, invincible DP,
//            multi-hit dash rush, explosive close-range command strike,
//            and a devastating 3-hit cinematic super.

export const RobinPadillaData = {
  name: 'Robin Padilla',
  title: 'The Bad Boy',
  subtitle: 'Utol mo sa Senado',
  walkSpeed: 280,
  jumpForce: 700,
  color: { r: 230, g: 57, b: 70 },   // Red
  color2: { r: 255, g: 215, b: 0 },   // Gold
  energyColor: 0xE63946,
  portraitKey: 'robin_portrait',
  faceKey: 'robin_face',
  winQuote: '"Utol, sa susunod mas malakas pa!"',

  moves: {
    // ─── NORMALS ─────────────────────────────────────────────────────────
    lightPunch: {
      name: 'Utol Jab',
      frames: { startup: 3, active: 3, recovery: 6 },
      cancelable: true,
      cancelWindow: 6,
      hitbox: { x: 30, y: -60, w: 45, h: 20, damage: 4, hitstun: 10, blockstun: 5, knockback: 30, stun: 12 }
    },
    mediumPunch: {
      name: 'Bad Boy Cross',
      frames: { startup: 5, active: 4, recovery: 10 },
      cancelable: true,
      cancelWindow: 5,
      hitbox: { x: 30, y: -62, w: 50, h: 24, damage: 7, hitstun: 14, blockstun: 8, knockback: 55, stun: 22 }
    },
    heavyPunch: {
      name: 'Bad Boy Haymaker',
      frames: { startup: 8, active: 4, recovery: 14 },
      hitbox: { x: 25, y: -65, w: 55, h: 30, damage: 10, hitstun: 18, blockstun: 10, knockback: 80, stun: 35 }
    },
    lightKick: {
      name: 'Senado Kick',
      frames: { startup: 5, active: 4, recovery: 8 },
      cancelable: true,
      cancelWindow: 4,
      hitbox: { x: 30, y: -40, w: 50, h: 25, damage: 5, hitstun: 12, blockstun: 6, knockback: 40, stun: 14 }
    },
    mediumKick: {
      name: 'Senate Roundhouse',
      frames: { startup: 8, active: 5, recovery: 12 },
      hitbox: { x: 28, y: -45, w: 58, h: 30, damage: 8, hitstun: 16, blockstun: 9, knockback: 70, stun: 26 }
    },
    heavyKick: {
      name: 'Federalism Dropkick',
      frames: { startup: 10, active: 5, recovery: 16 },
      hitbox: { x: 25, y: -55, w: 60, h: 35, damage: 12, hitstun: 20, blockstun: 12, knockback: 120, stun: 40 }
    },
    crouchPunch: {
      name: 'Low Blow',
      frames: { startup: 4, active: 3, recovery: 8 },
      cancelable: true,
      cancelWindow: 5,
      hitbox: { x: 30, y: -30, w: 40, h: 20, damage: 4, hitstun: 10, blockstun: 5, knockback: 20, stun: 12 }
    },
    crouchKick: {
      name: 'Sweep the Floor',
      frames: { startup: 7, active: 4, recovery: 18 },
      hitbox: { x: 25, y: -10, w: 65, h: 20, damage: 8, hitstun: 0, blockstun: 8, knockback: 60, stun: 20, launch: false },
      onActive: (fighter, frame) => {
        if (frame === 0) {
          fighter.velX = fighter.facing * 100;
        }
      }
    },
    jumpPunch: {
      name: 'Air Utol',
      frames: { startup: 4, active: 5, recovery: 6 },
      hitbox: { x: 25, y: -50, w: 45, h: 30, damage: 6, hitstun: 14, blockstun: 8, knockback: 30, stun: 18 }
    },
    jumpKick: {
      name: 'Diving Kick',
      frames: { startup: 5, active: 6, recovery: 8 },
      hitbox: { x: 20, y: -30, w: 50, h: 40, damage: 8, hitstun: 16, blockstun: 10, knockback: 50, stun: 22 }
    },

    // ─── SPECIAL 1: CONSTITUTION BREAKER (QCF+P) ──────────────────────────
    // Fast red fireball — Robin's signature zoning tool.
    // Travels fast and hits hard. Can be used to control neutral and pressure.
    special1: {
      name: 'CONSTITUTION BREAKER',
      frames: { startup: 10, active: 3, recovery: 18 },
      hitbox: { x: 40, y: -60, w: 30, h: 20, damage: 12, hitstun: 20, blockstun: 12, knockback: 60, stun: 8, chip: true },
      onActive: (fighter, frame) => {
        if (frame === 0) {
          // Fast red fireball
          fighter.projectiles.push({
            x: fighter.x + 50 * fighter.facing,
            y: fighter.y - 55,
            velX: fighter.facing * 10,
            w: 40, h: 25,
            damage: 12, hitstun: 20, blockstun: 12, knockback: 80,
            stun: 8, chip: true,
            life: 70, type: 'fireball', color: 0xE63946
          });
          // Trailing ember
          fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.4 });
        }
      }
    },

    // ─── SPECIAL 2: RISING BAD BOY (DP+P) ─────────────────────────────────
    // Invincible rising uppercut — the classic anti-air Dragon Punch.
    // 3 frames of full invincibility on startup. Huge risk on block/whiff.
    special2: {
      name: 'RISING BAD BOY',
      frames: { startup: 5, active: 8, recovery: 24 },
      hitbox: { x: 15, y: -90, w: 40, h: 50, damage: 15, hitstun: 25, blockstun: 15, knockback: 100, stun: 12, launch: true, chip: true },
      onUpdate: (fighter, frame) => {
        // Invincible during startup (frames 0-4)
        if (frame < 5) {
          fighter.isInvincible = true;
        } else {
          fighter.isInvincible = false;
        }
        // Launch upward at frame 5
        if (frame === 5) {
          fighter.velY = -650;
          fighter.isGrounded = false;
          fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.7 });
        }
        // Trail afterimages during ascent
        if (frame > 5 && frame < 13) {
          fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.5 });
        }
      }
    },

    // ─── SPECIAL 3: ACTION STAR RUSH (QCF+K) ─────────────────────────────
    // Multi-hit forward dash rush — 5 rapid hits while charging forward.
    // Classic Tatsu-style pressure tool. Cancels into super on hit!
    special3: {
      name: 'ACTION STAR RUSH',
      frames: { startup: 8, active: 20, recovery: 18 },
      hitbox: { x: 30, y: -60, w: 50, h: 30, damage: 3, hitstun: 6, blockstun: 3, knockback: 10, stun: 5, chip: true },
      onUpdate: (fighter, frame) => {
        if (frame >= 8 && frame < 28) {
          fighter.velX = fighter.facing * 420;
          // Multi-hit: reset hitConnected every 4 frames for 5 total hits
          if ((frame - 8) % 4 === 0) {
            fighter.hitConnected = false;
          }
          if (frame % 2 === 0) {
            fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.5 });
          }
        }
        if (frame >= 28) {
          fighter.velX = 0;
        }
      }
    },

    // ─── SPECIAL 4: PISTOLERO BLAST (QCB+K) ──────────────────────────────
    // Close-range explosive strike — Robin dashes in short range and detonates.
    // High risk/reward: devastating on hit, extremely punishable on whiff.
    // Creates an explosion visual effect on impact.
    special4: {
      name: 'PISTOLERO BLAST',
      frames: { startup: 10, active: 4, recovery: 28 },
      hitbox: { x: 20, y: -70, w: 55, h: 50, damage: 18, hitstun: 28, blockstun: 18, knockback: 160, stun: 45, chip: true },
      onUpdate: (fighter, frame) => {
        // Quick dash forward during startup
        if (frame >= 6 && frame < 10) {
          fighter.velX = fighter.facing * 500;
          fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.6 });
        }
        // Stop dash when active
        if (frame >= 10) {
          fighter.velX = 0;
        }
      },
      onActive: (fighter, frame) => {
        if (frame === 0) {
          // Explosion blast — spawn particles from FightScene
          fighter.explosionSignal = true;
        }
      }
    },

    // ─── SUPER: FEDERALISM CRUSHER (2xQCF+P) ─────────────────────────────
    // 3-hit cinematic super: Dash forward → Uppercut launch → Falling slam.
    // Phase 1 (f20-25): Charge forward with invincibility
    // Phase 2 (f26-30): Rising uppercut launches opponent
    // Phase 3 (f31-35): Falling slam finisher
    super: {
      name: 'FEDERALISM CRUSHER',
      frames: { startup: 20, active: 16, recovery: 26 },
      hitbox: { x: 30, y: -75, w: 70, h: 60, damage: 15, hitstun: 40, blockstun: 25, knockback: 200, stun: 0, launch: true, chip: false },
      onUpdate: (fighter, frame) => {
        // Phase 1: Charge forward (frames 20-25)
        if (frame >= 20 && frame < 26) {
          fighter.velX = fighter.facing * 600;
          if (frame % 2 === 0) {
            fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.8 });
          }
        }
        // Phase 2: Rising uppercut (frames 26-30)
        if (frame === 26) {
          fighter.velY = -700;
          fighter.isGrounded = false;
          fighter.hitConnected = false; // Reset for second hit
        }
        if (frame >= 26 && frame < 31) {
          fighter.velX = fighter.facing * 100;
          fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.7 });
        }
        // Phase 3: Falling slam (frames 31-35)
        if (frame === 31) {
          fighter.velY = 800;
          fighter.hitConnected = false; // Reset for third hit
        }
        if (frame >= 31 && frame < 36) {
          fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.6 });
        }
        // Stop momentum
        if (frame >= 36) {
          fighter.velX = 0;
        }
      },
      onActive: (fighter, frame) => {
        if (frame === 0) {
          fighter.superHitSignal = true;
        }
        // Multi-hit: reset hitConnected at key phases
        if (frame === 6) {
          fighter.hitConnected = false;
        }
        if (frame === 11) {
          fighter.hitConnected = false;
        }
      }
    }
  }
};
