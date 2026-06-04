// Risa Hontiveros — "The Citizen Shield"
// Archetype: Strategic Grace / Speed
// Color: Pink/White
// Playstyle: High mobility, long-range slicing waves, and strong defensive counters.

export const RisaHontiverosData = {
  name: 'Risa Hontiveros',
  title: 'The Citizen Shield',
  subtitle: 'Healthy buhay, ligtas na bukas!',
  walkSpeed: 260,
  jumpForce: 700,
  color: { r: 255, g: 105, b: 180 },    // Hot Pink
  color2: { r: 255, g: 255, b: 255 },   // White
  energyColor: 0xFF5EA2,
  portraitKey: 'risa_portrait',
  faceKey: 'risa_face',
  winQuote: '"Healthy buhay, ligtas na bukas para sa bawat Pilipino!"',

  moves: {
    // ─── NORMALS ─────────────────────────────────────────────────────────
    lightPunch: {
      name: 'Shield Jab',
      frames: { startup: 3, active: 3, recovery: 7 },
      cancelable: true,
      cancelWindow: 6,
      hitbox: { x: 34, y: -60, w: 48, h: 18, damage: 4, hitstun: 10, blockstun: 5, knockback: 35, stun: 12 }
    },
    mediumPunch: {
      name: 'Policy Pierce',
      frames: { startup: 5, active: 4, recovery: 10 },
      cancelable: true,
      cancelWindow: 5,
      hitbox: { x: 32, y: -62, w: 52, h: 22, damage: 7, hitstun: 14, blockstun: 8, knockback: 55, stun: 20 }
    },
    heavyPunch: {
      name: 'Glow Strike',
      frames: { startup: 8, active: 5, recovery: 14 },
      hitbox: { x: 26, y: -65, w: 54, h: 30, damage: 11, hitstun: 19, blockstun: 11, knockback: 80, stun: 34 }
    },
    lightKick: {
      name: 'Grace Kick',
      frames: { startup: 4, active: 4, recovery: 8 },
      cancelable: true,
      cancelWindow: 4,
      hitbox: { x: 30, y: -40, w: 52, h: 20, damage: 5, hitstun: 12, blockstun: 6, knockback: 38, stun: 14 }
    },
    mediumKick: {
      name: 'Citizen Sweep',
      frames: { startup: 7, active: 5, recovery: 11 },
      hitbox: { x: 28, y: -42, w: 58, h: 26, damage: 8, hitstun: 15, blockstun: 9, knockback: 65, stun: 24 }
    },
    heavyKick: {
      name: 'Ligtas Dropkick',
      frames: { startup: 10, active: 5, recovery: 16 },
      hitbox: { x: 22, y: -55, w: 58, h: 32, damage: 11, hitstun: 20, blockstun: 12, knockback: 115, stun: 38 }
    },
    crouchPunch: {
      name: 'Low Grace',
      frames: { startup: 4, active: 3, recovery: 8 },
      cancelable: true,
      cancelWindow: 5,
      hitbox: { x: 34, y: -25, w: 46, h: 18, damage: 4, hitstun: 10, blockstun: 5, knockback: 20, stun: 12 }
    },
    crouchKick: {
      name: 'Shield Sweep',
      frames: { startup: 8, active: 4, recovery: 18 },
      hitbox: { x: 22, y: -10, w: 66, h: 20, damage: 8, hitstun: 0, blockstun: 8, knockback: 60, stun: 18 }
    },
    jumpPunch: {
      name: 'Air Grace',
      frames: { startup: 4, active: 5, recovery: 6 },
      hitbox: { x: 25, y: -55, w: 48, h: 28, damage: 6, hitstun: 14, blockstun: 8, knockback: 30, stun: 18 }
    },
    jumpKick: {
      name: 'Diving Shield',
      frames: { startup: 5, active: 5, recovery: 8 },
      hitbox: { x: 20, y: -35, w: 48, h: 32, damage: 7, hitstun: 16, blockstun: 10, knockback: 45, stun: 20 }
    },

    // ─── SPECIAL 1: HEALTHY BUHAY SLASH (QCF+P) ──────────────────────────
    special1: {
      name: 'HEALTHY BUHAY SLASH',
      frames: { startup: 10, active: 3, recovery: 16 },
      hitbox: { x: 45, y: -55, w: 25, h: 20, damage: 11, hitstun: 18, blockstun: 10, knockback: 50, stun: 8, chip: true },
      onActive: (fighter, frame) => {
        if (frame === 0) {
          // Pink slicing wind projectile
          fighter.projectiles.push({
            x: fighter.x + 50 * fighter.facing,
            y: fighter.y - 50,
            velX: fighter.facing * 9,
            w: 30, h: 20,
            damage: 11, hitstun: 18, blockstun: 10, knockback: 60,
            stun: 8, chip: true,
            life: 80, type: 'shockwave', color: 0xFF5EA2
          });
        }
      }
    },

    // ─── SPECIAL 2: GRACEFUL ASCENT (DP+P) ───────────────────────────────
    special2: {
      name: 'GRACEFUL ASCENT',
      frames: { startup: 5, active: 8, recovery: 24 },
      hitbox: { x: 14, y: -95, w: 44, h: 58, damage: 14, hitstun: 25, blockstun: 14, knockback: 95, launch: true, chip: true },
      onUpdate: (fighter, frame) => {
        if (frame < 5) {
          fighter.isInvincible = true;
        } else {
          fighter.isInvincible = false;
        }
        if (frame === 5) {
          fighter.velY = -640;
          fighter.isGrounded = false;
          fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.7 });
        }
        if (frame > 5 && frame < 13) {
          fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.5 });
        }
      }
    },

    // ─── SPECIAL 3: CITIZEN SHIELD (QCF+K) ───────────────────────────────
    special3: {
      name: 'CITIZEN SHIELD',
      frames: { startup: 8, active: 18, recovery: 18 },
      hitbox: { x: 30, y: -60, w: 50, h: 30, damage: 9, hitstun: 18, blockstun: 10, knockback: 80, chip: true },
      onUpdate: (fighter, frame) => {
        if (frame >= 8 && frame < 26) {
          fighter.velX = fighter.facing * 440;
          if (frame % 3 === 0) {
            fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.5 });
          }
        }
        if (frame >= 26) {
          fighter.velX = 0;
        }
      }
    },

    // ─── SPECIAL 4: CARE COUNTER (QCB+K) ─────────────────────────────────
    special4: {
      name: 'CARE COUNTER',
      frames: { startup: 4, active: 22, recovery: 12 },
      hitbox: { x: 25, y: -75, w: 46, h: 60, damage: 10, hitstun: 22, blockstun: 15, knockback: 120 },
      onUpdate: (fighter, frame) => {
        if (frame >= 4 && frame < 26) {
          fighter.hurtbox = { x: -20, y: -80, w: 40, h: 80 };
          fighter.isBlocking = true;
          if (frame % 6 === 0) {
            fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.3 });
          }
        }
        if (frame >= 26) {
          fighter.isBlocking = false;
          fighter.hurtbox = { x: -25, y: -80, w: 50, h: 80 };
        }
      }
    },

    // ─── SUPER: PAGKANDILI ULTRA (2xQCF+P) ────────────────────────────────
    super: {
      name: 'PAGKANDILI ULTRA',
      frames: { startup: 18, active: 20, recovery: 24 },
      hitbox: { x: 30, y: -80, w: 60, h: 60, damage: 26, hitstun: 35, blockstun: 22, knockback: 180, launch: true, chip: true },
      onUpdate: (fighter, frame) => {
        if (frame >= 18 && frame < 38) {
          fighter.velX = fighter.facing * 450;
          if (frame % 2 === 0) {
            fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.7 });
          }
        }
        if (frame >= 38) {
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
