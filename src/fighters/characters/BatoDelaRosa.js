// Bato Dela Rosa — "The Rough Justice"
// Archetype: Heavy Grappler / Aggressive Brawler
// Color: Black/Grey/Gold
// Playstyle: Heavy-hitting strikes, ground shockwaves, and close-range command grabs.

export const BatoDelaRosaData = {
  name: 'Bato Dela Rosa',
  title: 'The Rough Justice',
  subtitle: 'Sige, laban kung laban!',
  walkSpeed: 240,
  jumpForce: 640,
  color: { r: 30, g: 30, b: 30 },      // Dark Grey
  color2: { r: 218, g: 165, b: 32 },    // Gold
  energyColor: 0xDA5300,
  portraitKey: 'bato_portrait',
  faceKey: 'bato_face',
  winQuote: '"Wala nang drama-drama pa. Sige, laban!"',

  moves: {
    // ─── NORMALS ─────────────────────────────────────────────────────────
    lightPunch: {
      name: 'Police Jab',
      frames: { startup: 4, active: 3, recovery: 7 },
      cancelable: true,
      cancelWindow: 5,
      hitbox: { x: 30, y: -60, w: 42, h: 22, damage: 5, hitstun: 11, blockstun: 5, knockback: 35, stun: 15 }
    },
    mediumPunch: {
      name: 'Rough Hook',
      frames: { startup: 7, active: 4, recovery: 11 },
      cancelable: true,
      cancelWindow: 4,
      hitbox: { x: 28, y: -62, w: 48, h: 26, damage: 8, hitstun: 15, blockstun: 8, knockback: 60, stun: 24 }
    },
    heavyPunch: {
      name: 'Hammer of Law',
      frames: { startup: 11, active: 5, recovery: 16 },
      hitbox: { x: 24, y: -65, w: 56, h: 36, damage: 13, hitstun: 22, blockstun: 12, knockback: 100, stun: 40, launch: true }
    },
    lightKick: {
      name: 'Heavy Stomper',
      frames: { startup: 6, active: 4, recovery: 9 },
      cancelable: true,
      cancelWindow: 4,
      hitbox: { x: 28, y: -30, w: 46, h: 22, damage: 5, hitstun: 12, blockstun: 6, knockback: 40, stun: 14 }
    },
    mediumKick: {
      name: 'Bato Kick',
      frames: { startup: 9, active: 5, recovery: 13 },
      hitbox: { x: 26, y: -45, w: 52, h: 28, damage: 9, hitstun: 16, blockstun: 9, knockback: 70, stun: 26 }
    },
    heavyKick: {
      name: 'Tactical Sweep',
      frames: { startup: 12, active: 5, recovery: 18 },
      hitbox: { x: 22, y: -50, w: 58, h: 32, damage: 12, hitstun: 20, blockstun: 12, knockback: 115, stun: 42 }
    },
    crouchPunch: {
      name: 'Low Strike',
      frames: { startup: 5, active: 3, recovery: 9 },
      cancelable: true,
      cancelWindow: 4,
      hitbox: { x: 28, y: -25, w: 42, h: 22, damage: 5, hitstun: 10, blockstun: 5, knockback: 25, stun: 14 }
    },
    crouchKick: {
      name: 'Ground Stomp',
      frames: { startup: 9, active: 4, recovery: 18 },
      hitbox: { x: 22, y: -10, w: 62, h: 20, damage: 9, hitstun: 0, blockstun: 8, knockback: 65, stun: 20 }
    },
    jumpPunch: {
      name: 'Diving Hammer',
      frames: { startup: 6, active: 5, recovery: 7 },
      hitbox: { x: 22, y: -50, w: 46, h: 30, damage: 7, hitstun: 15, blockstun: 9, knockback: 35, stun: 20 }
    },
    jumpKick: {
      name: 'Air Dropkick',
      frames: { startup: 7, active: 5, recovery: 9 },
      hitbox: { x: 18, y: -35, w: 50, h: 34, damage: 8, hitstun: 16, blockstun: 10, knockback: 50, stun: 22 }
    },

    // ─── SPECIAL 1: ROUGH JUSTICE STOMP (QCF+P) ──────────────────────────
    special1: {
      name: 'ROUGH JUSTICE STOMP',
      frames: { startup: 14, active: 3, recovery: 21 },
      hitbox: { x: 35, y: -15, w: 30, h: 30, damage: 11, hitstun: 18, blockstun: 10, knockback: 70, stun: 10, chip: true },
      onActive: (fighter, frame) => {
        if (frame === 0) {
          // Stomp dust shockwave
          fighter.projectiles.push({
            x: fighter.x + 40 * fighter.facing,
            y: fighter.y - 10,
            velX: fighter.facing * 6.5,
            w: 48, h: 30,
            damage: 11, hitstun: 18, blockstun: 10, knockback: 80,
            stun: 10, chip: true,
            life: 80, type: 'shockwave', color: 0xDA5300
          });
          fighter.shockwaveSignal = true;
        }
      }
    },

    // ─── SPECIAL 2: SIGE UPPER (DP+P) ────────────────────────────────────
    special2: {
      name: 'SIGE UPPER',
      frames: { startup: 7, active: 8, recovery: 27 },
      hitbox: { x: 12, y: -100, w: 48, h: 60, damage: 15, hitstun: 26, blockstun: 14, knockback: 105, launch: true, chip: true },
      onUpdate: (fighter, frame) => {
        if (frame === 7) {
          fighter.velY = -590;
          fighter.isGrounded = false;
          fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.7 });
        }
        if (frame > 7 && frame < 15) {
          fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.5 });
        }
      }
    },

    // ─── SPECIAL 3: CRUSHER CHARGE (QCF+K) ───────────────────────────────
    special3: {
      name: 'CRUSHER CHARGE',
      frames: { startup: 10, active: 20, recovery: 20 },
      hitbox: { x: 26, y: -65, w: 48, h: 40, damage: 12, hitstun: 24, blockstun: 5, knockback: 120, launch: true, chip: true },
      onUpdate: (fighter, frame) => {
        if (frame >= 10 && frame < 30) {
          fighter.velX = fighter.facing * 440;
          if (frame % 3 === 0) {
            fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.6 });
          }
        }
        if (frame >= 30) {
          fighter.velX = 0;
        }
      }
    },

    // ─── SPECIAL 4: IRON JUSTICE SHIELD (QCB+K) ──────────────────────────
    special4: {
      name: 'IRON JUSTICE SHIELD',
      frames: { startup: 4, active: 20, recovery: 14 },
      hitbox: { x: 25, y: -75, w: 50, h: 60, damage: 6, hitstun: 28, blockstun: 20, knockback: 100 },
      onUpdate: (fighter, frame) => {
        if (frame >= 4 && frame < 24) {
          fighter.hurtbox = { x: -25, y: -80, w: 50, h: 80 };
          fighter.isBlocking = true;
        }
        if (frame >= 24) {
          fighter.isBlocking = false;
        }
      }
    },

    // ─── SUPER: FEDERALISM SLAM (2xQCF+P) ────────────────────────────────
    super: {
      name: 'FEDERALISM SLAM',
      frames: { startup: 20, active: 16, recovery: 26 },
      hitbox: { x: 30, y: -75, w: 70, h: 60, damage: 28, hitstun: 40, blockstun: 25, knockback: 220, launch: true, chip: false },
      onUpdate: (fighter, frame) => {
        if (frame >= 20 && frame < 26) {
          fighter.velX = fighter.facing * 550;
          if (frame % 2 === 0) {
            fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.8 });
          }
        }
        if (frame === 26) {
          fighter.velY = -650;
          fighter.isGrounded = false;
          fighter.hitConnected = false;
        }
        if (frame >= 26 && frame < 31) {
          fighter.velX = fighter.facing * 100;
          fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.7 });
        }
        if (frame === 31) {
          fighter.velY = 850;
          fighter.hitConnected = false;
        }
        if (frame >= 31 && frame < 36) {
          fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.6 });
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
