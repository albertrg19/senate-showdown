// Robin Padilla — "The Bad Boy"
// Archetype: Aggressive Rushdown Brawler
// Color: Red/Black/Gold

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
    special1: {
      name: 'CONSTITUTION BREAKER',
      frames: { startup: 12, active: 3, recovery: 20 },
      hitbox: { x: 40, y: -60, w: 30, h: 20, damage: 12, hitstun: 20, blockstun: 12, knockback: 60, stun: 8, chip: true },
      onActive: (fighter, frame) => {
        if (frame === 0) {
          fighter.projectiles.push({
            x: fighter.x + 50 * fighter.facing,
            y: fighter.y - 55,
            velX: fighter.facing * 8,
            w: 40, h: 25,
            damage: 12, hitstun: 20, blockstun: 12, knockback: 80,
            stun: 8, chip: true,
            life: 80, type: 'fireball', color: 0xE63946
          });
        }
      }
    },
    special2: {
      name: 'RISING BAD BOY',
      frames: { startup: 5, active: 8, recovery: 22 },
      hitbox: { x: 15, y: -90, w: 40, h: 50, damage: 14, hitstun: 25, blockstun: 15, knockback: 100, stun: 10, launch: true, chip: true },
      onUpdate: (fighter, frame) => {
        if (frame === 5) {
          fighter.velY = -600;
          fighter.isGrounded = false;
          fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.6 });
        }
        if (frame > 5 && frame < 13) {
          fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.4 });
        }
      }
    },
    special3: {
      name: 'ACTION STAR RUSH',
      frames: { startup: 8, active: 15, recovery: 18 },
      hitbox: { x: 30, y: -60, w: 50, h: 30, damage: 3, hitstun: 8, blockstun: 4, knockback: 15, stun: 6, chip: true },
      onUpdate: (fighter, frame) => {
        if (frame >= 8 && frame < 23) {
          fighter.velX = fighter.facing * 400;
          if (frame % 3 === 0) {
            fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.5 });
          }
        }
      }
    },
    super: {
      name: 'FEDERALISM CRUSHER',
      frames: { startup: 20, active: 6, recovery: 30 },
      hitbox: { x: 30, y: -75, w: 70, h: 60, damage: 42, hitstun: 40, blockstun: 25, knockback: 200, stun: 0, launch: true, chip: false },
      onUpdate: (fighter, frame) => {
        // Charge forward during super
        if (frame >= 20 && frame < 26) {
          fighter.velX = fighter.facing * 600;
          if (frame % 2 === 0) {
            fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.7 });
          }
        }
        if (frame >= 26) {
          fighter.velX = 0;
        }
      },
      onActive: (fighter, frame) => {
        if (frame === 0) {
          // Earthquake effect (handled by FightScene)
          fighter.superHitSignal = true;
        }
      }
    }
  }
};
