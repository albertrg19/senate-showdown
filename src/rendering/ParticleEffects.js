export class ParticleEffects {
  constructor(scene) {
    this.scene = scene;
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(50);
    this.particles = [];
  }

  update() {
    this.graphics.clear();
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity || 0;
      p.life -= p.decay;
      p.alpha = Math.max(0, p.life);
      p.size *= (p.shrink || 0.98);

      if (p.life <= 0) return false;

      this.graphics.fillStyle(p.color, p.alpha);
      if (p.shape === 'circle') {
        this.graphics.fillCircle(p.x, p.y, p.size);
      } else {
        this.graphics.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }

      return true;
    });
  }

  spawnHitSparks(x, y, color = 0xFFD700) {
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 / 12) * i + Math.random() * 0.5;
      const speed = 2 + Math.random() * 5;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 2 + Math.random() * 3,
        life: 1,
        decay: 0.04 + Math.random() * 0.03,
        color,
        gravity: 0.15,
        shape: Math.random() > 0.5 ? 'circle' : 'rect',
        shrink: 0.95
      });
    }
    // Central flash
    this.particles.push({
      x, y,
      vx: 0, vy: 0,
      size: 20,
      life: 1,
      decay: 0.15,
      color: 0xFFFFFF,
      shape: 'circle',
      shrink: 0.85
    });
  }

  spawnBlockSparks(x, y) {
    for (let i = 0; i < 6; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
      const speed = 2 + Math.random() * 3;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 2,
        life: 1,
        decay: 0.06,
        color: 0x4488FF,
        gravity: 0.1,
        shape: 'rect',
        shrink: 0.96
      });
    }
  }

  spawnFireEffect(x, y) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 2,
        vy: -2 - Math.random() * 3,
        size: 3 + Math.random() * 4,
        life: 1,
        decay: 0.03,
        color: [0xE63946, 0xFF6B35, 0xFFD700][Math.floor(Math.random() * 3)],
        gravity: -0.05,
        shape: 'circle',
        shrink: 0.97
      });
    }
  }

  spawnLeafEffect(x, y) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 15,
        vx: (Math.random() - 0.5) * 3,
        vy: -1 - Math.random() * 2,
        size: 3 + Math.random() * 3,
        life: 1,
        decay: 0.02,
        color: [0x2D6A4F, 0x40916C, 0x95D5B2][Math.floor(Math.random() * 3)],
        gravity: 0.05,
        shape: Math.random() > 0.3 ? 'rect' : 'circle',
        shrink: 0.98
      });
    }
  }

  spawnKOEffect(x, y) {
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 / 30) * i;
      const speed = 3 + Math.random() * 8;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        life: 1,
        decay: 0.015,
        color: [0xFFD700, 0xFF4444, 0xFFFFFF, 0x0038A8][Math.floor(Math.random() * 4)],
        gravity: 0.1,
        shape: Math.random() > 0.5 ? 'circle' : 'rect',
        shrink: 0.97
      });
    }
  }

  spawnDustCloud(x, y) {
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 1.5,
        size: 4 + Math.random() * 4,
        life: 0.6,
        decay: 0.02,
        color: 0x8B7355,
        gravity: 0,
        shape: 'circle',
        shrink: 1.02
      });
    }
  }

  spawnConfetti(x, y) {
    for (let i = 0; i < 40; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 200,
        y: y - 100,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 3,
        size: 3 + Math.random() * 3,
        life: 1,
        decay: 0.005,
        color: [0xE63946, 0xFFC300, 0x0038A8, 0xFFFFFF, 0x2D6A4F][Math.floor(Math.random() * 5)],
        gravity: 0.08,
        shape: 'rect',
        shrink: 1
      });
    }
  }

  // Street Fighter super move cinematic explosion
  spawnSuperEffect(x, y, color = 0xFFD700) {
    // Big outer ring burst
    for (let i = 0; i < 40; i++) {
      const angle = (Math.PI * 2 / 40) * i;
      const speed = 5 + Math.random() * 12;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 6,
        life: 1,
        decay: 0.018,
        color: [color, 0xFFFFFF, 0xFFD700][Math.floor(Math.random() * 3)],
        gravity: 0,
        shape: Math.random() > 0.4 ? 'circle' : 'rect',
        shrink: 0.96
      });
    }
    // Central column of fire
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y,
        vx: (Math.random() - 0.5) * 3,
        vy: -5 - Math.random() * 8,
        size: 6 + Math.random() * 8,
        life: 1,
        decay: 0.012,
        color: [color, 0xFF6B35, 0xFFD700][Math.floor(Math.random() * 3)],
        gravity: 0,
        shape: 'circle',
        shrink: 0.98
      });
    }
    // Flash rings (quick bright particles)
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * 2,
        vy: Math.sin(angle) * 2,
        size: 30 - i * 2,
        life: 1,
        decay: 0.12,
        color: 0xFFFFFF,
        shape: 'circle',
        shrink: 1.15
      });
    }
  }

  // Dizzy star particles orbiting fighter head
  spawnDizzyEffect(x, y) {
    const colors = [0xFFD700, 0xFFFFFF, 0xFF8800];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 / 6) * i;
      this.particles.push({
        x: x + Math.cos(angle) * 25,
        y: y - 90 + Math.sin(angle) * 12,
        vx: Math.cos(angle + Math.PI / 2) * 1.5,
        vy: Math.sin(angle + Math.PI / 2) * 1.5 - 0.5,
        size: 4 + Math.random() * 3,
        life: 0.8,
        decay: 0.025,
        color: colors[i % colors.length],
        shape: 'circle',
        shrink: 0.97,
        gravity: -0.02
      });
    }
  }

  // Chip damage effect (small sparks when blocking specials)
  spawnChipEffect(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.6;
      const speed = 1.5 + Math.random() * 3;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 2,
        life: 1,
        decay: 0.07,
        color: 0xFF8800,
        shape: 'rect',
        shrink: 0.95,
        gravity: 0.05
      });
    }
  }

  // Robin's Pistolero Blast — close-range red/orange/gold explosion burst
  spawnExplosionEffect(x, y) {
    // Outer ring of fiery particles
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 / 20) * i;
      const speed = 4 + Math.random() * 8;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 6,
        life: 1,
        decay: 0.025,
        color: [0xE63946, 0xFF6B35, 0xFFD700][Math.floor(Math.random() * 3)],
        gravity: 0.05,
        shape: Math.random() > 0.4 ? 'circle' : 'rect',
        shrink: 0.95
      });
    }
    // Central bright flash
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 15,
        y: y + (Math.random() - 0.5) * 15,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: 15 + Math.random() * 10,
        life: 1,
        decay: 0.12,
        color: 0xFFFFFF,
        shape: 'circle',
        shrink: 0.88
      });
    }
    // Smoke puffs
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y,
        vx: (Math.random() - 0.5) * 3,
        vy: -2 - Math.random() * 4,
        size: 6 + Math.random() * 8,
        life: 0.8,
        decay: 0.015,
        color: 0x333333,
        gravity: -0.02,
        shape: 'circle',
        shrink: 1.03
      });
    }
  }

  // Kiko's Batas ng Bayan — green ground-ripple shockwave particles
  spawnShockwaveEffect(x, y) {
    // Ground-level green energy burst
    for (let i = 0; i < 14; i++) {
      const spread = (Math.random() - 0.5) * Math.PI * 0.4;
      const speed = 3 + Math.random() * 5;
      this.particles.push({
        x, y,
        vx: Math.cos(spread) * speed * (Math.random() > 0.5 ? 1 : -1),
        vy: -1 - Math.random() * 3,
        size: 3 + Math.random() * 4,
        life: 1,
        decay: 0.03,
        color: [0x2D6A4F, 0x40916C, 0x95D5B2, 0xFCD116][Math.floor(Math.random() * 4)],
        gravity: 0.08,
        shape: Math.random() > 0.3 ? 'rect' : 'circle',
        shrink: 0.97
      });
    }
    // Ground crack lines (horizontal streaks)
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 60,
        y: y + Math.random() * 5,
        vx: (Math.random() - 0.5) * 8,
        vy: 0,
        size: 2 + Math.random() * 3,
        life: 0.7,
        decay: 0.04,
        color: 0xFCD116,
        shape: 'rect',
        shrink: 0.96,
        gravity: 0
      });
    }
    // Dust cloud at stomp point
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 2,
        size: 5 + Math.random() * 5,
        life: 0.5,
        decay: 0.02,
        color: 0x8B7355,
        gravity: 0,
        shape: 'circle',
        shrink: 1.02
      });
    }
  }

  destroy() {
    this.graphics.destroy();
  }
}
