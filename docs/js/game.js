import { Player } from './player.js';
import { LevelGenerator } from './levelGenerator.js';
import { InputHandler } from './inputHandler.js';
import { Cloud } from './cloud.js';
import { Sun } from './sun.js';

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
        this.showSplash = true; // Add flag to control splash screen
        
        // Check if device is mobile
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Leaderboard properties
        this.leaderboard = [];
        this.playerName = '';
        this.showNameInput = false;
        this.nameInput = '';
        
        // Fire properties
        this.fireParticles = [];
        this.fireAnimationFrame = 0;
        this.fireHeight = 40; // Height of the fire effect
        this.fireOffset = 100; // Distance below lowest platform
        
        // Cloud properties
        this.clouds = [];
        this.maxClouds = 5;
        this.generateClouds();
        
        // Add sun
        this.sun = new Sun(this);
        
        this.generateInitialLevel();
        
        // Load leaderboard
        this.loadLeaderboard();
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
    
    generateClouds() {
        // Create initial clouds
        for (let i = 0; i < this.maxClouds; i++) {
            this.clouds.push(new Cloud(this));
            // Stagger the initial positions
            this.clouds[i].x = Math.random() * this.width - this.clouds[i].width;
        }
    }
    
    update() {
        if (this.gameState === 'playing') {
            this.player.update();
            this.updateCamera();
            
            // Update clouds and sun
            this.clouds.forEach(cloud => cloud.update());
            this.sun.update();
            
            // Hide splash screen when player moves
            if (this.showSplash && (this.player.velocityX !== 0 || this.player.velocityY !== 0)) {
                this.showSplash = false;
            }
            
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
        
        // Draw sun and clouds first (before any camera transformations)
        this.sun.draw(this.ctx);
        this.clouds.forEach(cloud => cloud.draw(this.ctx));
        
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
        
        // Show splash screen for level 1
        if (this.level === 1 && this.showSplash) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '48px Arial';
            this.ctx.fillText('Pick all the flowers!', this.width/2, this.height/2);
            this.ctx.font = '24px Arial';
            
            // Show different controls based on device type
            if (this.isMobile) {
                this.ctx.fillText('Tilt your phone to move', this.width/2, this.height/2 + 50);
                this.ctx.fillText('Tap screen to jump', this.width/2, this.height/2 + 80);
                this.ctx.fillText('Tap anywhere to start', this.width/2, this.height/2 + 110);
            } else {
                this.ctx.fillText('Use arrow keys to move', this.width/2, this.height/2 + 50);
                this.ctx.fillText('Press space to jump', this.width/2, this.height/2 + 80);
                this.ctx.fillText('Press any key to start', this.width/2, this.height/2 + 110);
            }
        }
        
        if (this.gameState === 'completed') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '48px Arial';
            this.ctx.fillText('Level Complete!', this.width/2, this.height/2);
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Loading next level...', this.width/2, this.height/2 + 40);
        } else if (this.gameState === 'dying' || this.gameState === 'gameOver') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '48px Arial';
            this.ctx.fillText(this.gameState === 'dying' ? 'Ouch!' : 'Game Over!', this.width/2, this.height/2 - 100);
            
            if (this.showNameInput) {
                // Draw name input
                this.ctx.font = '24px Arial';
                this.ctx.fillText('Enter your name:', this.width/2, this.height/2);
                
                // Draw input box
                this.ctx.fillStyle = 'white';
                this.ctx.strokeStyle = 'white';
                this.ctx.lineWidth = 2;
                const inputWidth = 200;
                const inputHeight = 40;
                const inputX = this.width/2 - inputWidth/2;
                const inputY = this.height/2 + 30;
                this.ctx.strokeRect(inputX, inputY, inputWidth, inputHeight);
                
                // Draw current input
                this.ctx.fillText(this.nameInput || 'Type here...', this.width/2, inputY + inputHeight/2 + 8);
                
                // Draw submit button
                this.ctx.fillStyle = '#4CAF50';
                this.ctx.fillRect(inputX, inputY + inputHeight + 20, inputWidth, 40);
                this.ctx.fillStyle = 'white';
                this.ctx.fillText('Submit', this.width/2, inputY + inputHeight + 45);
            } else {
                // Draw leaderboard
                this.ctx.font = '24px Arial';
                this.ctx.fillText('Leaderboard', this.width/2, this.height/2);
                
                // Draw top 5 scores
                this.ctx.font = '20px Arial';
                for (let i = 0; i < Math.min(5, this.leaderboard.length); i++) {
                    const entry = this.leaderboard[i];
                    this.ctx.fillText(
                        `${i + 1}. ${entry.name} - ${entry.score} flowers (Level ${entry.level})`,
                        this.width/2,
                        this.height/2 + 50 + i * 30
                    );
                }
                
                // Draw restart prompt
                this.ctx.fillText('Press R to restart', this.width/2, this.height/2 + 250);
            }
        }
    }
    
    resetGame() {
        this.score = 0;
        this.level = 1;
        this.gameState = 'playing';
        this.showSplash = true;
        this.showNameInput = true;
        this.nameInput = '';
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

    async loadLeaderboard() {
        try {
            const response = await fetch('YOUR_GET_LEADERBOARD_URL');
            const data = await response.json();
            this.leaderboard = data;
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
        }
    }

    async submitScore() {
        if (!this.playerName) return;
        
        try {
            const response = await fetch('YOUR_PUT_LEADERBOARD_URL', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: this.playerName,
                    score: this.score,
                    level: this.level
                })
            });
            
            if (response.ok) {
                await this.loadLeaderboard();
            }
        } catch (error) {
            console.error('Failed to submit score:', error);
        }
    }

    handleKeyDown(e) {
        if (this.gameState === 'gameOver' && this.showNameInput) {
            if (e.key === 'Enter') {
                this.playerName = this.nameInput;
                this.showNameInput = false;
                this.submitScore();
            } else if (e.key === 'Backspace') {
                this.nameInput = this.nameInput.slice(0, -1);
            } else if (e.key.length === 1 && this.nameInput.length < 20) {
                this.nameInput += e.key;
            }
        } else if (this.showSplash) {
            // Hide splash screen on any key press
            this.showSplash = false;
        }
    }

    handleClick(x, y) {
        if (this.gameState === 'gameOver' && this.showNameInput) {
            const inputWidth = 200;
            const inputHeight = 40;
            const inputX = this.width/2 - inputWidth/2;
            const inputY = this.height/2 + 30;
            
            // Check if submit button was clicked
            if (x >= inputX && x <= inputX + inputWidth &&
                y >= inputY + inputHeight + 20 && y <= inputY + inputHeight + 60) {
                this.playerName = this.nameInput;
                this.showNameInput = false;
                this.submitScore();
            }
        } else if (this.showSplash) {
            // Hide splash screen on any tap
            this.showSplash = false;
        }
    }
} 