import Phaser from 'phaser';
import { Peer } from 'peerjs';
import { GAME_WIDTH, GAME_HEIGHT } from '../main.js';

export class LobbyScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LobbyScene' });
  }

  create() {
    this.cameras.main.fadeIn(400, 0, 0, 0);
    this.sound_mgr = this.registry.get('soundManager');

    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a0f, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Title
    this.add.text(GAME_WIDTH / 2, 60, 'ONLINE MULTIPLAYER', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#FFD700',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.statusText = this.add.text(GAME_WIDTH / 2, 140, 'Ready to establish P2P connection...', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '18px',
      color: '#aaa'
    }).setOrigin(0.5);

    // Host & Join Buttons
    this.hostBtn = this.add.text(GAME_WIDTH / 2, 230, '👑  HOST A BATTLE', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#FFF',
      stroke: '#000',
      strokeThickness: 3,
      padding: { x: 30, y: 15 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.joinBtn = this.add.text(GAME_WIDTH / 2, 320, '⚔️  JOIN A BATTLE', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#FFF',
      stroke: '#000',
      strokeThickness: 3,
      padding: { x: 30, y: 15 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.backBtn = this.add.text(GAME_WIDTH / 2, 420, '◀  BACK TO MENU', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '16px',
      color: '#888',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    // Buttons Group for easier control
    const buttons = [this.hostBtn, this.joinBtn, this.backBtn];

    buttons.forEach(btn => {
      btn.on('pointerover', () => {
        if (btn === this.backBtn) btn.setColor('#FFF');
        else btn.setColor('#FFD700').setScale(1.05);
        if (this.sound_mgr) this.sound_mgr.playMenuSelect();
      });
      btn.on('pointerout', () => {
        if (btn === this.backBtn) btn.setColor('#888');
        else btn.setColor('#FFF').setScale(1);
      });
    });

    this.hostBtn.on('pointerdown', () => this.hostMatch());
    this.joinBtn.on('pointerdown', () => this.joinMatch());
    this.backBtn.on('pointerdown', () => {
      if (this.sound_mgr) this.sound_mgr.playMenuConfirm();
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.cleanupPeer();
        this.scene.start('MenuScene');
      });
    });

    // PH Flag accent
    const flagBar = this.add.graphics();
    flagBar.fillStyle(0x0038A8, 0.6);
    flagBar.fillRect(0, GAME_HEIGHT - 4, GAME_WIDTH / 3, 4);
    flagBar.fillStyle(0xCE1126, 0.6);
    flagBar.fillRect(GAME_WIDTH / 3, GAME_HEIGHT - 4, GAME_WIDTH / 3, 4);
    flagBar.fillStyle(0xFCD116, 0.6);
    flagBar.fillRect(GAME_WIDTH * 2 / 3, GAME_HEIGHT - 4, GAME_WIDTH / 3, 4);

    this.peer = null;
    this.conn = null;
  }

  hostMatch() {
    if (this.sound_mgr) this.sound_mgr.playMenuConfirm();
    this.disableButtons();
    
    this.statusText.setText('Connecting to WebRTC broker server...');
    const roomCode = Math.floor(1000 + Math.random() * 9000).toString();
    this.peerId = 'SENATE-' + roomCode;

    try {
      this.peer = new Peer(this.peerId);
      
      this.peer.on('open', (id) => {
        this.statusText.setText(`ROOM HOSTED! Share this 4-digit code:\n\n[ ${roomCode} ]\n\nWaiting for challenger to connect...`);
      });

      this.peer.on('connection', (conn) => {
        this.conn = conn;
        this.setupConnectionHandlers(true);
      });

      this.peer.on('error', (err) => {
        console.error('PeerJS error:', err);
        this.statusText.setText('Matchmaking Broker Error. Please try again.');
        this.enableButtons();
      });
    } catch (e) {
      console.error(e);
      this.statusText.setText('Failed to start WebRTC server.');
      this.enableButtons();
    }
  }

  joinMatch() {
    if (this.sound_mgr) this.sound_mgr.playMenuConfirm();
    
    const roomCode = window.prompt("Enter friend's 4-digit Battle Room Code:");
    if (!roomCode || roomCode.trim() === '') return;

    this.disableButtons();
    this.statusText.setText('Connecting to matchmaking server...');

    try {
      this.peer = new Peer();

      this.peer.on('open', () => {
        this.statusText.setText(`Connecting to Room [ ${roomCode} ]...`);
        this.conn = this.peer.connect('SENATE-' + roomCode.trim());
        this.setupConnectionHandlers(false);
      });

      this.peer.on('error', (err) => {
        console.error('PeerJS error:', err);
        this.statusText.setText('Matchmaking Broker Error. Please try again.');
        this.enableButtons();
      });
    } catch (e) {
      console.error(e);
      this.statusText.setText('Failed to connect to matchmaking server.');
      this.enableButtons();
    }
  }

  setupConnectionHandlers(isHost) {
    const startP2PMatch = () => {
      this.statusText.setText('CHALLENGER FOUND! Securing data channels...');
      
      // Store P2P credentials in Phaser registry
      this.registry.set('p2pConnection', this.conn);
      this.registry.set('isHost', isHost);
      this.registry.set('gameMode', 'online');

      // Sync character selection scene transition
      this.time.delayedCall(1000, () => {
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('OnlineCharSelectScene');
        });
      });
    };

    // PeerJS Gotcha Fix: If connection is already open, fire transition immediately!
    if (this.conn.open) {
      startP2PMatch();
    } else {
      this.conn.on('open', startP2PMatch);
    }

    this.conn.on('error', (err) => {
      console.error('P2P Connection error:', err);
      this.statusText.setText('P2P Connection lost. Please re-host/re-join.');
      this.enableButtons();
    });
  }

  disableButtons() {
    this.hostBtn.disableInteractive().setAlpha(0.3);
    this.joinBtn.disableInteractive().setAlpha(0.3);
  }

  enableButtons() {
    this.hostBtn.setInteractive().setAlpha(1);
    this.joinBtn.setInteractive().setAlpha(1);
  }

  cleanupPeer() {
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}
