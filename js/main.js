import { Game } from './game.js';

// Initialize the game
window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    canvas.width = 800;
    canvas.height = 600;
    
    const game = new Game(canvas);
    game.start();
}); 