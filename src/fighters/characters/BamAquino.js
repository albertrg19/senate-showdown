// Bam Aquino — "The Millennial Senator"
// Archetype: Mid-Range Zoner / Strategist
// Color: Yellow/Blue
// Playstyle: Fast energy fireballs, long-range pokes, and strong anti-airs.

export const BamAquinoData = {
  name: 'Bam Aquino',
  title: 'The Millennial Senator',
  subtitle: 'Para sa Bayan, Go Bam!',
  walkSpeed: 260,
  jumpForce: 680,
  color: { r: 255, g: 215, b: 0 },    // Yellow
  color2: { r: 0, g: 56, b: 168 },     // Blue
  energyColor: 0xFFC300,
  portraitKey: 'bam_portrait',
  faceKey: 'bam_face',
  winQuote: '"Mas maliwanag ang bukas para sa kabataan!"',

  moves: {
    // ─── NORMALS ─────────────────────────────────────────────────────────
    lightPunch: {
      name: 'Millennial Jab',
      frames: { startup: 3, active: 3, recovery: 7 },
      cancelable: true,
      cancelWindow: 6,
      hitbox: { x: 32, y: -60, w: 48, h: 18, damage: 4, hitstun: 10, blockstun: 5, knockback: 35, stun: 12 }
    },
    mediumPunch: {
      name: 'Tech Cross',
      frames: { startup: 6, active: 4, recovery: 10 },
      cancelable: true,
      cancelWindow: 5,
      hitbox: { x: 30, y: -62, w: 52, h: 22, damage: 7, hitstun: 14, blockstun: 8, knockback: 55, stun: 20 }
    },
    heavyPunch: {
      name: 'Education Hammer',
      frames: { startup: 9, active: 5, recovery: 14 },
      hitbox: { x: 26, y: -68, w: 54, h: 32, damage: 11, hitstun: 19, blockstun: 11, knockback: 85, stun: 34 }
    },
    lightKick: {
      name: 'Go Kick',
      frames: { startup: 5, active: 4, recovery: 8 },
      cancelable: true,
      cancelWindow: 4,
      hitbox: { x: 30, y: -40, w: 52, h: 20, damage: 5, hitstun: 12, blockstun: 6, knockback: 38, stun: 14 }
    },
    mediumKick: {
      name: 'Youth Sweep',
      frames: { startup: 8, active: 5, recovery: 12 },
      hitbox: { x: 28, y: -42, w: 58, h: 28, damage: 8, hitstun: 15, blockstun: 9, knockback: 65, stun: 24 }
    },
    heavyKick: {
      name: 'Micro-Finance Kick',
      frames: { startup: 11, active: 5, recovery: 16 },
      hitbox: { x: 22, y: -55, w: 58, h: 34, damage: 12, hitstun: 20, blockstun: 12, knockback: 115, stun: 38 }
    },
    crouchPunch: {
      name: 'Low Tech',
      frames: { startup: 4, active: 3, recovery: 8 },
      cancelable: true,
      cancelWindow: 5,
      hitbox: { x: 32, y: -25, w: 46, h: 18, damage: 4, hitstun: 10, blockstun: 5, knockback: 20, stun: 12 }
    },
    crouchKick: {
      name: 'Startup Sweep',
      frames: { startup: 8, active: 4, recovery: 18 },
      hitbox: { x: 22, y: -10, w: 68, h: 20, damage: 8, hitstun: 0, blockstun: 8, knockback: 60, stun: 18 }
    },
    jumpPunch: {
      name: 'Air Millennial',
      frames: { startup: 5, active: 5, recovery: 6 },
      hitbox: { x: 25, y: -55, w: 48, h: 28, damage: 6, hitstun: 14, blockstun: 8, knockback: 30, stun: 18 }
    },
    jumpKick: {
      name: 'Flying Go-Kick',
      frames: { startup: 6, active: 5, recovery: 8 },
      hitbox: { x: 20, y: -35, w: 48, h: 32, damage: 7, hitstun: 16, blockstun: 10, knockback: 45, stun: 20 }
    },

    // ─── SPECIAL 1: MILLENNIAL SPARK (QCF+P) ─────────────────────────────
    special1: {
      name: 'MILLENNIAL SPARK',
      frames: { startup: 11, active: 3, recovery: 16 },
      hitbox: { x: 45, y: -55, w: 25, h: 20, damage: 11, hitstun: 18, blockstun: 10, knockback: 50, stun: 8, chip: true },
      onActive: (fighter, frame) => {
        if (frame === 0) {
          // Yellow energy projectile
          fighter.projectiles.push({
            x: fighter.x + 50 * fighter.facing,
            y: fighter.y - 50,
            velX: fighter.facing * 8.5,
            w: 30, h: 20,
            damage: 11, hitstun: 18, blockstun: 10, knockback: 60,
            stun: 8, chip: true,
            life: 80, type: 'fireball', color: 0xFFC300
          });
          fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.5 });
        }
      }
    },

    // ─── SPECIAL 2: GO-BAM UPPER (DP+P) ──────────────────────────────────
    special2: {
      name: 'GO-BAM UPPER',
      frames: { startup: 5, active: 8, recovery: 25 },
      hitbox: { x: 14, y: -95, w: 44, h: 58, damage: 14, hitstun: 25, blockstun: 14, knockback: 95, launch: true, chip: true },
      onUpdate: (fighter, frame) => {
        if (frame < 5) {
          fighter.isInvincible = true;
        } else {
          fighter.isInvincible = false;
        }
        if (frame === 5) {
          fighter.velY = -620;
          fighter.isGrounded = false;
          fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.7 });
        }
        if (frame > 5 && frame < 13) {
          fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.5 });
        }
      }
    },

    // ─── SPECIAL 3: ENTRE-PRESSURE STRIKE (QCF+K) ────────────────────────
    special3: {
      name: 'ENTRE-PRESSURE STRIKE',
      frames: { startup: 8, active: 18, recovery: 18 },
      hitbox: { x: 30, y: -60, w: 50, h: 30, damage: 9, hitstun: 18, blockstun: 9, knockback: 80, chip: true },
      onUpdate: (fighter, frame) => {
        if (frame >= 8 && frame < 26) {
          fighter.velX = fighter.facing * 420;
          if (frame % 3 === 0) {
            fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.5 });
          }
        }
        if (frame >= 26) {
          fighter.velX = 0;
        }
      }
    },

    // ─── SPECIAL 4: YOUTH SHIELD (QCB+K) ──────────────────────────────────
    special4: {
      name: 'YOUTH SHIELD',
      frames: { startup: 4, active: 22, recovery: 12 },
      hitbox: { x: 25, y: -75, w: 48, h: 60, damage: 10, hitstun: 22, blockstun: 15, knockback: 120 },
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

    // ─── SUPER: BAM BOOM ULTRA (2xQCF+P) ─────────────────────────────────
    super: {
      name: 'BAM BOOM ULTRA',
      frames: { startup: 18, active: 20, recovery: 24 },
      hitbox: { x: 30, y: -80, w: 60, h: 60, damage: 25, hitstun: 35, blockstun: 20, knockback: 180, launch: true, chip: true },
      onUpdate: (fighter, frame) => {
        if (frame >= 18 && frame < 38) {
          fighter.velX = fighter.facing * 200;
          if (frame % 4 === 0) {
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
          // Spawn big super projectile
          fighter.projectiles.push({
            x: fighter.x + 60 * fighter.facing,
            y: fighter.y - 50,
            velX: fighter.facing * 12,
            w: 60, h: 40,
            damage: 25, hitstun: 35, blockstun: 20, knockback: 150,
            stun: 0, chip: true,
            life: 90, type: 'fireball', color: 0xFFC300
          });
        }
      }
    }
  }
};
