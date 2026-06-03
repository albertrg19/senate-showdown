// Kiko Pangilinan — "The Policy Warrior"
// Archetype: Strategic Zoner / Counter-Fighter
// Color: Yellow/Green/White
// Playstyle: Control space with dual projectiles, punish with counter-stance,
//            anti-air with rising upper, zone the floor with ground shockwave,
//            and finish with a devastating 5-hit rush super.

export const KikoPangilinanData = {
  name: 'Kiko Pangilinan',
  title: 'The Policy Warrior',
  subtitle: 'Laban natin ito!',
  walkSpeed: 250,
  jumpForce: 680,
  color: { r: 255, g: 195, b: 0 },    // Yellow
  color2: { r: 45, g: 106, b: 79 },    // Green
  energyColor: 0x2D6A4F,
  portraitKey: 'kiko_portrait',
  faceKey: 'kiko_face',
  winQuote: '"Laban natin ito! Noted."',

  moves: {
    // ─── NORMALS ─────────────────────────────────────────────────────────
    // Kiko has longer-reaching normals than Robin, ideal for spacing and poking.
    lightPunch: {
      name: 'Noted Jab',
      frames: { startup: 3, active: 3, recovery: 7 },
      cancelable: true,
      cancelWindow: 6,
      hitbox: { x: 35, y: -60, w: 50, h: 18, damage: 4, hitstun: 10, blockstun: 5, knockback: 35, stun: 12 }
    },
    mediumPunch: {
      name: 'Bicameral Strike',
      frames: { startup: 6, active: 4, recovery: 10 },
      cancelable: true,
      cancelWindow: 5,
      hitbox: { x: 32, y: -62, w: 55, h: 24, damage: 7, hitstun: 14, blockstun: 8, knockback: 58, stun: 22 }
    },
    heavyPunch: {
      name: 'Gavel Slam',
      frames: { startup: 10, active: 5, recovery: 14 },
      hitbox: { x: 25, y: -70, w: 50, h: 35, damage: 11, hitstun: 20, blockstun: 12, knockback: 90, stun: 35 }
    },
    lightKick: {
      name: 'Kumilos Kick',
      frames: { startup: 5, active: 4, recovery: 9 },
      cancelable: true,
      cancelWindow: 4,
      hitbox: { x: 30, y: -40, w: 55, h: 22, damage: 5, hitstun: 12, blockstun: 7, knockback: 40, stun: 14 }
    },
    mediumKick: {
      name: 'Reform Stomp',
      frames: { startup: 7, active: 5, recovery: 11 },
      hitbox: { x: 28, y: -42, w: 60, h: 28, damage: 8, hitstun: 16, blockstun: 9, knockback: 65, stun: 26 }
    },
    heavyKick: {
      name: 'Laban Kick',
      frames: { startup: 11, active: 5, recovery: 16 },
      hitbox: { x: 20, y: -55, w: 60, h: 35, damage: 11, hitstun: 20, blockstun: 12, knockback: 110, stun: 38 }
    },
    crouchPunch: {
      name: 'Low Noted',
      frames: { startup: 4, active: 3, recovery: 8 },
      cancelable: true,
      cancelWindow: 5,
      hitbox: { x: 35, y: -25, w: 50, h: 18, damage: 4, hitstun: 10, blockstun: 5, knockback: 20, stun: 12 }
    },
    crouchKick: {
      name: 'Grassroots Sweep',
      frames: { startup: 8, active: 4, recovery: 18 },
      hitbox: { x: 20, y: -10, w: 70, h: 20, damage: 8, hitstun: 0, blockstun: 8, knockback: 60, stun: 18 }
    },
    jumpPunch: {
      name: 'Air Document',
      frames: { startup: 5, active: 5, recovery: 6 },
      hitbox: { x: 25, y: -55, w: 50, h: 30, damage: 6, hitstun: 14, blockstun: 8, knockback: 30, stun: 18 }
    },
    jumpKick: {
      name: 'Policy Kick',
      frames: { startup: 6, active: 5, recovery: 8 },
      hitbox: { x: 20, y: -35, w: 50, h: 35, damage: 7, hitstun: 16, blockstun: 10, knockback: 45, stun: 20 }
    },

    // ─── SPECIAL 1: GOODBYE GUTOM (QCF+P) ────────────────────────────────
    // Dual staggered vegetable projectile volley.
    // Fast carrot travels quickly, slow ampalaya follows behind.
    // Masterful space control — opponent must deal with two projectiles at once.
    special1: {
      name: 'GOODBYE GUTOM',
      frames: { startup: 12, active: 3, recovery: 16 },
      hitbox: { x: 45, y: -55, w: 25, h: 20, damage: 10, hitstun: 18, blockstun: 10, knockback: 50, stun: 8, chip: true },
      onActive: (fighter, frame) => {
        if (frame === 0) {
          // Fast carrot projectile
          fighter.projectiles.push({
            x: fighter.x + 50 * fighter.facing,
            y: fighter.y - 50,
            velX: fighter.facing * 9,
            w: 30, h: 20,
            damage: 8, hitstun: 16, blockstun: 8, knockback: 60,
            stun: 6, chip: true,
            life: 80, type: 'vegetable', color: 0xFF6B00
          });
          // Delayed slow ampalaya projectile (follows behind)
          fighter._delayedProjectile = {
            delay: 12,
            data: {
              x: fighter.x + 40 * fighter.facing,
              y: fighter.y - 60,
              velX: fighter.facing * 5,
              w: 25, h: 18,
              damage: 6, hitstun: 14, blockstun: 8, knockback: 50,
              stun: 8, chip: true,
              life: 100, type: 'vegetable2', color: 0x2D6A4F
            }
          };
        }
      },
      onUpdate: (fighter, frame) => {
        // Handle delayed projectile spawn
        if (fighter._delayedProjectile) {
          fighter._delayedProjectile.delay--;
          if (fighter._delayedProjectile.delay <= 0) {
            fighter.projectiles.push(fighter._delayedProjectile.data);
            fighter._delayedProjectile = null;
          }
        }
      }
    },

    // ─── SPECIAL 2: SAGIP SAKA UPPER (DP+P) ──────────────────────────────
    // Rising green uppercut — wider hitbox than Robin's DP but slower startup.
    // Excellent anti-air with a tall green energy trail.
    special2: {
      name: 'SAGIP SAKA UPPER',
      frames: { startup: 7, active: 8, recovery: 26 },
      hitbox: { x: 12, y: -100, w: 48, h: 60, damage: 14, hitstun: 26, blockstun: 14, knockback: 95, stun: 12, launch: true, chip: true },
      onUpdate: (fighter, frame) => {
        // Launch upward at startup end
        if (frame === 7) {
          fighter.velY = -580;
          fighter.isGrounded = false;
          fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.7 });
        }
        // Green energy trail during ascent
        if (frame > 7 && frame < 15) {
          fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.5 });
        }
      }
    },

    // ─── SPECIAL 3: PANGILINAN LAW (QCF+K) ───────────────────────────────
    // Counter-stance — Kiko adopts a defensive stance.
    // If he gets hit during the active frames, he automatically retaliates
    // with a powerful counter-strike dealing 1.5x the opponent's attack damage.
    // Master-level read/prediction tool.
    special3: {
      name: 'PANGILINAN LAW',
      frames: { startup: 4, active: 24, recovery: 10 },
      hitbox: { x: 25, y: -75, w: 50, h: 60, damage: 16, hitstun: 24, blockstun: 16, knockback: 140, stun: 10, chip: true },
      onUpdate: (fighter, frame) => {
        // Counter stance: blocking + absorbing during active frames
        if (frame >= 4 && frame < 28) {
          fighter.hurtbox = { x: -20, y: -80, w: 40, h: 80 };
          fighter.isBlocking = true;
          // Visual "ready" pulse
          if (frame % 6 === 0) {
            fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.3 });
          }
        }
        // End counter stance
        if (frame >= 28) {
          fighter.isBlocking = false;
          fighter.hurtbox = { x: -25, y: -80, w: 50, h: 80 };
        }
      }
    },

    // ─── SPECIAL 4: BATAS NG BAYAN (QCB+K) ───────────────────────────────
    // Ground-traveling shockwave — Kiko stomps the ground and sends a green
    // energy wave traveling along the floor.
    // Catches crouching opponents! Wide hitbox, travels low.
    // Complementary to GOODBYE GUTOM — controls ground while veggies control air.
    special4: {
      name: 'BATAS NG BAYAN',
      frames: { startup: 14, active: 3, recovery: 20 },
      hitbox: { x: 35, y: -15, w: 30, h: 30, damage: 10, hitstun: 18, blockstun: 10, knockback: 70, stun: 8, chip: true },
      onActive: (fighter, frame) => {
        if (frame === 0) {
          // Ground shockwave projectile — travels low along the floor
          fighter.projectiles.push({
            x: fighter.x + 40 * fighter.facing,
            y: fighter.y - 10,
            velX: fighter.facing * 7,
            w: 50, h: 30,
            damage: 10, hitstun: 18, blockstun: 10, knockback: 80,
            stun: 10, chip: true,
            life: 90, type: 'shockwave', color: 0x2D6A4F
          });
          // Stomp dust effect signal
          fighter.shockwaveSignal = true;
        }
      },
      onUpdate: (fighter, frame) => {
        // Stomp impact at startup end
        if (frame === 14) {
          fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.5 });
        }
      }
    },

    // ─── SUPER: PAGBABAGO ULTRA (2xQCF+P) ────────────────────────────────
    // 5-hit rush super: Rapid 4-punch barrage → Final massive uppercut.
    // Phase 1 (f18-30): Rush forward with rapid punches (4 hits)
    // Phase 2 (f31-36): Rising uppercut finisher (1 hit)
    super: {
      name: 'PAGBABAGO ULTRA',
      frames: { startup: 18, active: 18, recovery: 24 },
      hitbox: { x: 25, y: -80, w: 60, h: 65, damage: 9, hitstun: 8, blockstun: 4, knockback: 20, stun: 0, launch: false, chip: false },
      onUpdate: (fighter, frame) => {
        // Phase 1: Rush forward with rapid punches (frames 18-30)
        if (frame >= 18 && frame < 31) {
          fighter.velX = fighter.facing * 450;
          // Multi-hit: reset hitConnected every 3 frames for 4 rapid hits
          if ((frame - 18) % 3 === 0) {
            fighter.hitConnected = false;
          }
          if (frame % 2 === 0) {
            fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.7 });
          }
        }
        // Phase 2: Rising uppercut finisher (frames 31-36)
        if (frame === 31) {
          fighter.velY = -700;
          fighter.isGrounded = false;
          fighter.hitConnected = false; // Reset for final hit
          fighter.velX = fighter.facing * 80;
        }
        if (frame >= 31 && frame < 36) {
          fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.8 });
        }
        // Stop momentum after all phases
        if (frame >= 36) {
          fighter.velX = 0;
        }
      },
      onActive: (fighter, frame) => {
        if (frame === 0) {
          fighter.superHitSignal = true;
        }
        // Final uppercut hit has launch + big damage
        if (frame === 13) {
          fighter.hitConnected = false;
        }
      }
    }
  }
};
