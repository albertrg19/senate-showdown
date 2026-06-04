// Raffy Tulfo — "The Rampaging Journalist"
// Archetype: High-Mobility Pressurer
// Color: Blue/Orange
// Playstyle: Fast normals, projectile zoning, and quick sliding pressure.

export const RaffyTulfoData = {
  name: 'Raffy Tulfo',
  title: 'The Rampaging Journalist',
  subtitle: 'Ipa-Tulfo natin yan!',
  walkSpeed: 270,
  jumpForce: 690,
  color: { r: 0, g: 56, b: 168 },      // Blue
  color2: { r: 255, g: 110, b: 0 },    // Orange
  energyColor: 0x00A8FF,
  portraitKey: 'raffy_portrait',
  faceKey: 'raffy_face',
  winQuote: '"Dapat pakinggan ang boses ng bawat mamamayan!"',

  moves: {
    // ─── NORMALS ─────────────────────────────────────────────────────────
    lightPunch: {
      name: 'Radio Jab',
      frames: { startup: 3, active: 3, recovery: 6 },
      cancelable: true,
      cancelWindow: 6,
      hitbox: { x: 32, y: -60, w: 46, h: 20, damage: 4, hitstun: 10, blockstun: 5, knockback: 30, stun: 12 }
    },
    mediumPunch: {
      name: 'On-Air Hook',
      frames: { startup: 5, active: 4, recovery: 10 },
      cancelable: true,
      cancelWindow: 5,
      hitbox: { x: 30, y: -62, w: 52, h: 24, damage: 7, hitstun: 14, blockstun: 8, knockback: 55, stun: 20 }
    },
    heavyPunch: {
      name: 'Broadcast Slam',
      frames: { startup: 8, active: 4, recovery: 14 },
      hitbox: { x: 26, y: -65, w: 56, h: 30, damage: 10, hitstun: 18, blockstun: 10, knockback: 80, stun: 34 }
    },
    lightKick: {
      name: 'Mic Kick',
      frames: { startup: 5, active: 4, recovery: 8 },
      cancelable: true,
      cancelWindow: 4,
      hitbox: { x: 30, y: -40, w: 50, h: 24, damage: 5, hitstun: 12, blockstun: 6, knockback: 38, stun: 14 }
    },
    mediumKick: {
      name: 'Hotline Kick',
      frames: { startup: 8, active: 5, recovery: 12 },
      hitbox: { x: 28, y: -45, w: 56, h: 28, damage: 8, hitstun: 15, blockstun: 9, knockback: 68, stun: 24 }
    },
    heavyKick: {
      name: 'Wanted Dropkick',
      frames: { startup: 10, active: 5, recovery: 16 },
      hitbox: { x: 24, y: -55, w: 60, h: 32, damage: 12, hitstun: 20, blockstun: 12, knockback: 115, stun: 38 }
    },
    crouchPunch: {
      name: 'Low Broadcast',
      frames: { startup: 4, active: 3, recovery: 8 },
      cancelable: true,
      cancelWindow: 5,
      hitbox: { x: 30, y: -30, w: 42, h: 20, damage: 4, hitstun: 10, blockstun: 5, knockback: 20, stun: 12 }
    },
    crouchKick: {
      name: 'Rampage Sweep',
      frames: { startup: 7, active: 4, recovery: 18 },
      hitbox: { x: 24, y: -10, w: 64, h: 20, damage: 8, hitstun: 0, blockstun: 8, knockback: 60, stun: 18 }
    },
    jumpPunch: {
      name: 'Air Press',
      frames: { startup: 4, active: 5, recovery: 6 },
      hitbox: { x: 24, y: -50, w: 46, h: 28, damage: 6, hitstun: 14, blockstun: 8, knockback: 30, stun: 18 }
    },
    jumpKick: {
      name: 'Air Hotline',
      frames: { startup: 5, active: 6, recovery: 8 },
      hitbox: { x: 20, y: -30, w: 48, h: 34, damage: 8, hitstun: 16, blockstun: 10, knockback: 48, stun: 22 }
    },

    // ─── SPECIAL 1: IPA-TULFO FIREBALL (QCF+P) ───────────────────────────
    special1: {
      name: 'IPA-TULFO FIREBALL',
      frames: { startup: 10, active: 3, recovery: 17 },
      hitbox: { x: 42, y: -60, w: 26, h: 20, damage: 11, hitstun: 19, blockstun: 11, knockback: 55, stun: 8, chip: true },
      onActive: (fighter, frame) => {
        if (frame === 0) {
          // Blue microphone projectile
          fighter.projectiles.push({
            x: fighter.x + 50 * fighter.facing,
            y: fighter.y - 55,
            velX: fighter.facing * 9.5,
            w: 32, h: 18,
            damage: 11, hitstun: 18, blockstun: 10, knockback: 65,
            stun: 8, chip: true,
            life: 80, type: 'fireball', color: 0x00A8FF
          });
        }
      }
    },

    // ─── SPECIAL 2: JOURNALIST UPPER (DP+P) ──────────────────────────────
    special2: {
      name: 'JOURNALIST UPPER',
      frames: { startup: 5, active: 8, recovery: 24 },
      hitbox: { x: 14, y: -90, w: 42, h: 50, damage: 14, hitstun: 25, blockstun: 14, knockback: 95, launch: true, chip: true },
      onUpdate: (fighter, frame) => {
        if (frame < 5) {
          fighter.isInvincible = true;
        } else {
          fighter.isInvincible = false;
        }
        if (frame === 5) {
          fighter.velY = -630;
          fighter.isGrounded = false;
          fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.7 });
        }
        if (frame > 5 && frame < 13) {
          fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.5 });
        }
      }
    },

    // ─── SPECIAL 3: ACTION STAR SLIDE (QCF+K) ────────────────────────────
    special3: {
      name: 'ACTION STAR SLIDE',
      frames: { startup: 8, active: 18, recovery: 18 },
      hitbox: { x: 26, y: -15, w: 52, h: 22, damage: 8, hitstun: 12, blockstun: 8, knockback: 60, chip: true },
      onUpdate: (fighter, frame) => {
        if (frame >= 8 && frame < 26) {
          fighter.velX = fighter.facing * 460;
          // Render low sliding profile
          fighter.hurtbox = { x: -25, y: -40, w: 50, h: 40 };
          if (frame % 3 === 0) {
            fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.5 });
          }
        }
        if (frame >= 26) {
          fighter.velX = 0;
          fighter.hurtbox = { x: -25, y: -80, w: 50, h: 80 };
        }
      }
    },

    // ─── SPECIAL 4: TRUTH BARRIER (QCB+K) ────────────────────────────────
    special4: {
      name: 'TRUTH BARRIER',
      frames: { startup: 4, active: 20, recovery: 12 },
      hitbox: { x: 25, y: -75, w: 46, h: 60, damage: 8, hitstun: 24, blockstun: 18, knockback: 110 },
      onUpdate: (fighter, frame) => {
        if (frame >= 4 && frame < 24) {
          fighter.hurtbox = { x: -20, y: -80, w: 40, h: 80 };
          fighter.isBlocking = true;
          if (frame % 5 === 0) {
            fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.3 });
          }
        }
        if (frame >= 24) {
          fighter.isBlocking = false;
          fighter.hurtbox = { x: -25, y: -80, w: 50, h: 80 };
        }
      }
    },

    // ─── SUPER: WANTED SA RADYO BLAST (2xQCF+P) ──────────────────────────
    super: {
      name: 'WANTED SA RADYO BLAST',
      frames: { startup: 18, active: 22, recovery: 26 },
      hitbox: { x: 30, y: -80, w: 70, h: 60, damage: 27, hitstun: 38, blockstun: 24, knockback: 200, launch: true, chip: true },
      onUpdate: (fighter, frame) => {
        if (frame >= 18 && frame < 40) {
          fighter.velX = fighter.facing * 180;
          if (frame % 3 === 0) {
            fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.7 });
          }
        }
        if (frame >= 40) {
          fighter.velX = 0;
        }
      },
      onActive: (fighter, frame) => {
        if (frame === 0) {
          fighter.superHitSignal = true;
          // Spawn massive soundwave projectile
          fighter.projectiles.push({
            x: fighter.x + 55 * fighter.facing,
            y: fighter.y - 50,
            velX: fighter.facing * 11,
            w: 70, h: 45,
            damage: 27, hitstun: 38, blockstun: 22, knockback: 160,
            stun: 0, chip: true,
            life: 90, type: 'shockwave', color: 0x00A8FF
          });
        }
      }
    }
  }
};
