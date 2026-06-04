// Alan Peter Cayetano — "The Debate Master"
// Archetype: Defensive Frame-Trap Specialist
// Color: Blue/Red
// Playstyle: Heavy counters, frame traps, and parries.

export const AlanCayetanoData = {
  name: 'Alan Peter Cayetano',
  title: 'The Debate Master',
  subtitle: '10K Ayuda para sa lahat!',
  walkSpeed: 250,
  jumpForce: 670,
  color: { r: 0, g: 56, b: 168 },     // Blue
  color2: { r: 206, g: 11, b: 38 },    // Red
  energyColor: 0xCE1126,
  portraitKey: 'alan_portrait',
  faceKey: 'alan_face',
  winQuote: '"Ang aking priority ay ang tulong sa bawat pamilya!"',

  moves: {
    // ─── NORMALS ─────────────────────────────────────────────────────────
    lightPunch: {
      name: 'Rebuttal Jab',
      frames: { startup: 3, active: 3, recovery: 7 },
      cancelable: true,
      cancelWindow: 6,
      hitbox: { x: 34, y: -60, w: 46, h: 18, damage: 4, hitstun: 10, blockstun: 5, knockback: 35, stun: 12 }
    },
    mediumPunch: {
      name: 'Point of Order',
      frames: { startup: 6, active: 4, recovery: 10 },
      cancelable: true,
      cancelWindow: 5,
      hitbox: { x: 32, y: -62, w: 50, h: 22, damage: 7, hitstun: 14, blockstun: 8, knockback: 55, stun: 20 }
    },
    heavyPunch: {
      name: 'Congressional Gavel',
      frames: { startup: 10, active: 5, recovery: 14 },
      hitbox: { x: 26, y: -70, w: 52, h: 32, damage: 11, hitstun: 20, blockstun: 12, knockback: 90, stun: 35 }
    },
    lightKick: {
      name: 'Debate Sweep',
      frames: { startup: 5, active: 4, recovery: 9 },
      cancelable: true,
      cancelWindow: 4,
      hitbox: { x: 30, y: -40, w: 54, h: 20, damage: 5, hitstun: 12, blockstun: 7, knockback: 40, stun: 14 }
    },
    mediumKick: {
      name: 'Ayuda Stomp',
      frames: { startup: 7, active: 5, recovery: 11 },
      hitbox: { x: 28, y: -42, w: 56, h: 26, damage: 8, hitstun: 16, blockstun: 9, knockback: 65, stun: 26 }
    },
    heavyKick: {
      name: 'Resolusyon Kick',
      frames: { startup: 11, active: 5, recovery: 16 },
      hitbox: { x: 22, y: -55, w: 56, h: 32, damage: 11, hitstun: 20, blockstun: 12, knockback: 110, stun: 38 }
    },
    crouchPunch: {
      name: 'Low Objection',
      frames: { startup: 4, active: 3, recovery: 8 },
      cancelable: true,
      cancelWindow: 5,
      hitbox: { x: 34, y: -25, w: 46, h: 18, damage: 4, hitstun: 10, blockstun: 5, knockback: 20, stun: 12 }
    },
    crouchKick: {
      name: 'Low Rebuttal',
      frames: { startup: 8, active: 4, recovery: 18 },
      hitbox: { x: 22, y: -10, w: 66, h: 20, damage: 8, hitstun: 0, blockstun: 8, knockback: 60, stun: 18 }
    },
    jumpPunch: {
      name: 'Air Objection',
      frames: { startup: 5, active: 5, recovery: 6 },
      hitbox: { x: 25, y: -55, w: 46, h: 28, damage: 6, hitstun: 14, blockstun: 8, knockback: 30, stun: 18 }
    },
    jumpKick: {
      name: 'Air Ayuda',
      frames: { startup: 6, active: 5, recovery: 8 },
      hitbox: { x: 20, y: -35, w: 48, h: 32, damage: 7, hitstun: 16, blockstun: 10, knockback: 45, stun: 20 }
    },

    // ─── SPECIAL 1: 10K AYUDA BLAST (QCF+P) ──────────────────────────────
    special1: {
      name: '10K AYUDA BLAST',
      frames: { startup: 12, active: 3, recovery: 17 },
      hitbox: { x: 45, y: -55, w: 25, h: 20, damage: 11, hitstun: 18, blockstun: 10, knockback: 50, stun: 8, chip: true },
      onActive: (fighter, frame) => {
        if (frame === 0) {
          // Blue cash packet energy fireball
          fighter.projectiles.push({
            x: fighter.x + 50 * fighter.facing,
            y: fighter.y - 50,
            velX: fighter.facing * 8,
            w: 35, h: 18,
            damage: 11, hitstun: 18, blockstun: 10, knockback: 60,
            stun: 8, chip: true,
            life: 80, type: 'fireball', color: 0x0038A8
          });
        }
      }
    },

    // ─── SPECIAL 2: DEBATE REBUTTAL (DP+P) ────────────────────────────────
    special2: {
      name: 'DEBATE REBUTTAL',
      frames: { startup: 6, active: 8, recovery: 26 },
      hitbox: { x: 15, y: -95, w: 42, h: 56, damage: 13, hitstun: 24, blockstun: 14, knockback: 90, launch: true, chip: true },
      onUpdate: (fighter, frame) => {
        if (frame < 6) {
          fighter.isInvincible = true;
        } else {
          fighter.isInvincible = false;
        }
        if (frame === 6) {
          fighter.velY = -560;
          fighter.isGrounded = false;
          fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.6 });
        }
        if (frame > 6 && frame < 13) {
          fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.4 });
        }
      }
    },

    // ─── SPECIAL 3: BICAMERAL DASH (QCF+K) ───────────────────────────────
    special3: {
      name: 'BICAMERAL DASH',
      frames: { startup: 9, active: 16, recovery: 18 },
      hitbox: { x: 30, y: -60, w: 48, h: 30, damage: 9, hitstun: 16, blockstun: 10, knockback: 75, chip: true },
      onUpdate: (fighter, frame) => {
        if (frame >= 9 && frame < 25) {
          fighter.velX = fighter.facing * 430;
          if (frame % 3 === 0) {
            fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.5 });
          }
        }
        if (frame >= 25) {
          fighter.velX = 0;
        }
      }
    },

    // ─── SPECIAL 4: HEARING STANCE (QCB+K) ───────────────────────────────
    special4: {
      name: 'HEARING STANCE',
      frames: { startup: 4, active: 24, recovery: 10 },
      hitbox: { x: 25, y: -75, w: 46, h: 60, damage: 12, hitstun: 22, blockstun: 16, knockback: 130 },
      onUpdate: (fighter, frame) => {
        if (frame >= 4 && frame < 28) {
          fighter.hurtbox = { x: -22, y: -80, w: 44, h: 80 };
          fighter.isBlocking = true;
          if (frame % 6 === 0) {
            fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.3 });
          }
        }
        if (frame >= 28) {
          fighter.isBlocking = false;
          fighter.hurtbox = { x: -25, y: -80, w: 50, h: 80 };
        }
      }
    },

    // ─── SUPER: CONGRESSIONAL CRUSHER (2xQCF+P) ──────────────────────────
    super: {
      name: 'CONGRESSIONAL CRUSHER',
      frames: { startup: 18, active: 18, recovery: 24 },
      hitbox: { x: 28, y: -80, w: 60, h: 60, damage: 26, hitstun: 35, blockstun: 22, knockback: 180, launch: true, chip: true },
      onUpdate: (fighter, frame) => {
        if (frame >= 18 && frame < 36) {
          fighter.velX = fighter.facing * 440;
          if (frame % 2 === 0) {
            fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.7 });
          }
        }
        if (frame >= 36) {
          fighter.velX = 0;
        }
      },
      onActive: (fighter, frame) => {
        if (frame === 0) {
          fighter.superHitSignal = true;
        }
      }
    }
  }
};
