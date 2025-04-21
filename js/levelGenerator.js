import { Star } from './star.js';

export class LevelGenerator {
    constructor(game) {
        this.game = game;
        this.platformWidth = 100;
        this.platformHeight = 20;
        this.minGap = 50;
        this.maxGap = 150;
        this.minHeight = 50;
        this.maxHeight = 200;
        this.maxJumpHeight = 200;
    }
    
    generateLevel() {
        const platforms = [];
        const stars = [];
        let currentX = 0;
        let currentY = this.game.height - 100;
        
        // Create ground platform
        platforms.push({
            x: 0,
            y: this.game.height - 20,
            width: this.game.width * 2,
            height: this.platformHeight
        });
        
        // Generate platforms with guaranteed path
        const levelLength = this.game.width * 2;
        const platformCount = Math.floor(levelLength / (this.platformWidth + this.minGap));
        
        // Create a main path with alternating platforms
        for (let i = 0; i < platformCount; i++) {
            // Calculate next platform position
            const gap = this.getRandomInt(this.minGap, this.maxGap);
            const heightChange = this.getRandomInt(-this.maxJumpHeight/2, this.maxJumpHeight/2);
            
            // Ensure the next platform is reachable
            const nextY = Math.max(
                this.game.height - this.maxHeight,
                Math.min(
                    this.game.height - 100,
                    currentY + heightChange
                )
            );
            
            // Create platform
            const platform = {
                x: currentX + gap,
                y: nextY,
                width: this.platformWidth,
                height: this.platformHeight
            };
            platforms.push(platform);
            
            // Add stars on every other platform
            if (i % 2 === 0) {
                const starCount = this.getRandomInt(1, 2);
                for (let j = 0; j < starCount; j++) {
                    stars.push(new Star(
                        platform.x + (platform.width / (starCount + 1)) * (j + 1) - 10,
                        platform.y - 30
                    ));
                }
            }
            
            currentX += gap + this.platformWidth;
            currentY = nextY;
            
            // Occasionally create a side platform for additional stars
            if (Math.random() < 0.3 && i > 0 && i < platformCount - 1) {
                const sidePlatform = {
                    x: platform.x + this.platformWidth + 50,
                    y: platform.y - this.getRandomInt(50, 100),
                    width: this.platformWidth,
                    height: this.platformHeight
                };
                platforms.push(sidePlatform);
                
                // Add a star to the side platform
                stars.push(new Star(
                    sidePlatform.x + sidePlatform.width/2 - 10,
                    sidePlatform.y - 30
                ));
            }
        }
        
        // Add final platform with special star
        const finalPlatform = {
            x: currentX + 50,
            y: currentY - 50,
            width: this.platformWidth,
            height: this.platformHeight
        };
        platforms.push(finalPlatform);
        
        // Add special final star
        stars.push(new Star(
            finalPlatform.x + finalPlatform.width/2 - 10,
            finalPlatform.y - 30
        ));
        
        return { platforms, stars };
    }
    
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
} 