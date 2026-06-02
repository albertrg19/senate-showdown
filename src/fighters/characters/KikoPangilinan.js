// Kiko Pangilinan — "The Policy Warrior"
// Archetype: Strategic Zoner / Counter-fighter
// Color: Yellow/Green/White

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
    special1: {
      name: 'GOODBYE GUTOM',
      frames: { startup: 14, active: 3, recovery: 18 },
      hitbox: { x: 45, y: -55, w: 25, h: 20, damage: 10, hitstun: 18, blockstun: 10, knockback: 50, stun: 8, chip: true },
      onActive: (fighter, frame) => {
        if (frame === 0) {
          fighter.projectiles.push({
            x: fighter.x + 50 * fighter.facing,
            y: fighter.y - 50,
            velX: fighter.facing * 7,
            w: 30, h: 20,
            damage: 10, hitstun: 18, blockstun: 10, knockback: 70,
            stun: 8, chip: true,
            life: 90, type: 'vegetable', color: 0x2D6A4F
          });
          setTimeout(() => {
            fighter.projectiles.push({
              x: fighter.x + 40 * fighter.facing,
              y: fighter.y - 60,
              velX: fighter.facing * 6,
              w: 25, h: 18,
              damage: 6, hitstun: 12, blockstun: 6, knockback: 40,
              stun: 6, chip: true,
              life: 85, type: 'vegetable2', color: 0xFF8C00
            });
          }, 100);
        }
      }
    },
    special2: {
      name: 'SAGIP SAKA UPPER',
      frames: { startup: 6, active: 7, recovery: 24 },
      hitbox: { x: 15, y: -95, w: 40, h: 55, damage: 13, hitstun: 24, blockstun: 14, knockback: 90, stun: 10, launch: true, chip: true },
      onUpdate: (fighter, frame) => {
        if (frame === 6) {
          fighter.velY = -550;
          fighter.isGrounded = false;
          fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.6 });
        }
        if (frame > 6 && frame < 13) {
          fighter.afterimages.push({ x: fighter.x, y: fighter.y, alpha: 0.4 });
        }
      }
    },
    special3: {
      name: 'PANGILINAN LAW',
      frames: { startup: 6, active: 20, recovery: 12 },
      hitbox: { x: 20, y: -75, w: 40, h: 60, damage: 8, hitstun: 22, blockstun: 15, knockback: 120, stun: 8, chip: true },
      onUpdate: (fighter, frame) => {
        if (frame >= 6 && frame < 26) {
          fighter.hurtbox = { x: -20, y: -80, w: 40, h: 80 };
          fighter.isBlocking = true;
        }
        if (frame >= 26) {
          fighter.isBlocking = false;
        }
      }
    },
    super: {
      name: 'PAGBABAGO ULTRA',
      frames: { startup: 18, active: 8, recovery: 28 },
      hitbox: { x: 25, y: -80, w: 65, h: 65, damage: 40, hitstun: 40, blockstun: 22, knockback: 180, stun: 0, launch: true, chip: false },
      onUpdate: (fighter, frame) => {
        // Multi-hit projectile barrage
        if (frame >= 18 && frame < 26) {
          fighter.velX = fighter.facing * 500;
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
          fighter.superHitSignal = true;
        }
      }
    }
  }
};
