import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { CharacterSelectScene } from './scenes/CharacterSelectScene.js';
import { FightScene } from './scenes/FightScene.js';
import { VictoryScene } from './scenes/VictoryScene.js';
import { LobbyScene } from './scenes/LobbyScene.js';
import { OnlineCharSelectScene } from './scenes/OnlineCharSelectScene.js';
import { VSScene } from './scenes/VSScene.js';

const config = {
  type: Phaser.CANVAS,
  width: 960,
  height: 540,
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  backgroundColor: '#0a0a0f',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [BootScene, MenuScene, CharacterSelectScene, VSScene, FightScene, VictoryScene, LobbyScene, OnlineCharSelectScene],
  render: {
    pixelArt: false,
    antialias: true
  },
  fps: {
    target: 60,
    forceSetTimeOut: false
  },
  audio: {
    disableWebAudio: false
  }
};

const game = new Phaser.Game(config);

// Game constants
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;
export const GROUND_Y = 440;
export const GRAVITY = 1800;
export const ROUND_TIME = 99;
export const ROUNDS_TO_WIN = 2;

// Color palettes
export const COLORS = {
  robin: {
    primary: 0xE63946,
    secondary: 0x1D1D1D,
    accent: 0xFFD700,
    energy: 0xFF4500
  },
  kiko: {
    primary: 0xFFC300,
    secondary: 0x2D6A4F,
    accent: 0xF8F9FA,
    energy: 0x00FF88
  },
  ph: {
    blue: 0x0038A8,
    red: 0xCE1126,
    yellow: 0xFCD116,
    white: 0xFFFFFF
  },
  ui: {
    gold: 0xFFD700,
    dark: 0x0a0a0f,
    panel: 0x1a1a2e
  }
};
