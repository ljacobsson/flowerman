import { Player } from './player.js';
import { LevelGenerator } from './levelGenerator.js';
import { InputHandler } from './inputHandler.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Set initial canvas size
        this.resizeCanvas();
        
        // Handle window resize
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.inputHandler = new InputHandler();
        this.player = new Player(this);
        this.levelGenerator = new LevelGenerator(this);
        
        this.gravity = 0.5;
        this.friction = 0.8;
        this.platforms = [];
        this.stars = [];
        this.camera = { x: 0, y: 0 };
        
        this.score = 0;
        this.level = 1;
        this.gameState = 'playing'; // 'playing', 'completed', 'gameOver'
        
        // Fire properties
        this.fireParticles = [];
        this.fireAnimationFrame = 0;
        this.fireHeight = 40; // Height of the fire effect
        this.fireOffset = 100; // Distance below lowest platform
        
        this.generateInitialLevel();
    }
    
    resizeCanvas() {
        // Set canvas size to window size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Update game properties
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Adjust player position if needed
        if (this.player) {
            this.player.x = Math.min(this.player.x, this.width - this.player.width);
            this.player.y = Math.min(this.player.y, this.height - this.player.height);
        }
    }
    
    generateInitialLevel() {
        const levelData = this.levelGenerator.generateLevel(this.level);
        this.platforms = levelData.platforms;
        this.stars = levelData.stars;
        
        // Reset player's collected flowers
        this.player.collectedFlowers = [];
        
        // Position player on the starting platform
        const startPlatform = this.platforms[0]; // First platform is always the starting platform
        this.player.x = startPlatform.x + startPlatform.width/2 - this.player.width/2;
        this.player.y = startPlatform.y - this.player.height;
        this.player.velocityY = 0;
    }
    
    update() {
        if (this.gameState === 'playing') {
            this.player.update();
            this.updateCamera();
            
            // Check for death by falling into fire
            const lowestPlatform = Math.max(...this.platforms.map(p => p.y));
            const fireY = lowestPlatform + this.fireOffset;
            
            if (this.player.y > fireY) {
                this.gameState = 'dying';
                this.player.startDyingAnimation();
                setTimeout(() => {
                    this.gameState = 'gameOver';
                    setTimeout(() => {
                        this.resetGame();
                    }, 2000);
                }, 1500);
            }
            
            // Update stars
            this.stars.forEach(star => {
                if (!star.collected) {
                    star.update();
                    
                    if (this.checkCollision(this.player, star)) {
                        star.collected = true;
                        this.player.addFlower(star);
                        this.score += 1;
                        
                        if (this.stars.every(star => star.collected)) {
                            this.gameState = 'completed';
                            setTimeout(() => {
                                this.level++;
                                this.generateInitialLevel();
                                this.gameState = 'playing';
                            }, 2000);
                        }
                    }
                }
            });
        }
    }
    
    checkCollision(player, object) {
        return player.x < object.x + object.width &&
               player.x + player.width > object.x &&
               player.y < object.y + object.height &&
               player.y + player.height > object.y;
    }
    
    updateCamera() {
        // Center camera on player with some offset
        this.camera.x = this.player.x - this.width / 2;
        this.camera.y = this.player.y - this.height / 2;
    }
    
    updateFire() {
        this.fireAnimationFrame += 0.1;
        
        // Find the lowest platform
        const lowestPlatform = Math.max(...this.platforms.map(p => p.y));
        const fireY = lowestPlatform + this.fireOffset;
        
        // Generate fire particles in screen coordinates
        if (this.fireParticles.length < 100) {
            this.fireParticles.push({
                x: Math.random() * this.width, // Screen X coordinate
                y: fireY - this.camera.y, // Screen Y coordinate
                size: Math.random() * 10 + 5,
                speed: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.5,
                sway: Math.random() * 2 - 1
            });
        }
        
        // Update and remove old particles
        this.fireParticles = this.fireParticles.filter(particle => {
            particle.y -= particle.speed;
            particle.x += particle.sway * 0.5;
            particle.opacity -= 0.02;
            return particle.opacity > 0 && particle.y > fireY - this.camera.y - this.fireHeight;
        });
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw fire first (before any camera transformations)
        this.updateFire();
        this.drawFire();
        
        // Draw platforms and stars
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        this.platforms.forEach(platform => {
            // Draw platform base
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Draw grass on top
            this.ctx.fillStyle = '#7CFC00';
            this.ctx.fillRect(platform.x, platform.y - 5, platform.width, 5);
            
            // Draw grass tufts
            this.ctx.fillStyle = '#228B22';
            for (let i = 0; i < platform.width; i += 15) {
                const x = platform.x + i;
                const height = Math.random() * 3 + 2;
                this.ctx.fillRect(x, platform.y - height - 5, 2, height);
            }
        });
        
        this.stars.forEach(star => star.draw(this.ctx));
        this.player.draw(this.ctx);
        
        this.ctx.restore();
        
        // Draw UI
        this.drawUI();
    }
    
    drawFire() {
        // Find the lowest platform
        const lowestPlatform = Math.max(...this.platforms.map(p => p.y));
        const fireY = lowestPlatform + this.fireOffset;
        
        // Convert world coordinates to screen coordinates
        const screenFireY = fireY - this.camera.y;
        
        this.ctx.save();
        
        // Draw fire base - extending to bottom of screen
        const gradient = this.ctx.createLinearGradient(0, screenFireY - this.fireHeight, 0, this.height);
        gradient.addColorStop(0, 'rgba(255, 100, 0, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 50, 0, 0.9)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 1)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, screenFireY - this.fireHeight, this.width, this.height - (screenFireY - this.fireHeight));
        
        // Draw fire particles (already in screen coordinates)
        this.fireParticles.forEach(particle => {
            this.ctx.fillStyle = `rgba(255, ${Math.random() * 100 + 100}, 0, ${particle.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.restore();
    }
    
    drawUI() {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        
        // Add padding from the top
        const padding = 20;
        
        // Draw score and level centered at the top
        this.ctx.fillText(`Flowers: ${this.score}`, this.width/2, padding + 20);
        this.ctx.fillText(`Level: ${this.level}`, this.width/2, padding + 50);
        
        if (this.gameState === 'completed') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Level Complete!', this.width/2, this.height/2);
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Loading next level...', this.width/2, this.height/2 + 40);
        } else if (this.gameState === 'dying' || this.gameState === 'gameOver') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.gameState === 'dying' ? 'Ouch!' : 'Game Over!', this.width/2, this.height/2);
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Press R to restart', this.width/2, this.height/2 + 40);
        }
    }
    
    resetGame() {
        this.score = 0;
        this.level = 1;
        this.gameState = 'playing';
        this.generateInitialLevel();
        this.player.reset();
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    start() {
        this.gameLoop();
    }

} 