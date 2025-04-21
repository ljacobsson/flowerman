import { Star } from './star.js';

export class LevelGenerator {
    constructor(game) {
        this.game = game;
        this.platformWidth = 100;
        this.platformHeight = 20;
        this.minGap = 50;
        this.maxGap = 150;
        this.minHeight = 100;
        this.maxHeight = 300;
    }
    
    generateLevel(level) {
        const platforms = [];
        const stars = [];
        let currentX = 50;
        let currentY = this.game.height - 100;
        
        // Always create a starting platform
        const startPlatform = {
            x: 50,
            y: this.game.height - 150,
            width: this.platformWidth,
            height: this.platformHeight
        };
        platforms.push(startPlatform);
        
        // Add a flower to the starting platform
        stars.push(new Star(
            startPlatform.x + startPlatform.width/2 - 10,
            startPlatform.y - 30
        ));
        
        // Only create ground platform in early levels
        if (level <= 2) {
            platforms.push({
                x: 0,
                y: this.game.height - 20,
                width: this.game.width * 2,
                height: this.platformHeight
            });
        }
        
        // Generate platforms with guaranteed path
        const numPlatforms = Math.floor(this.game.width / 100) + level * 3;
        
        // Create a main path with alternating platforms
        for (let i = 0; i < numPlatforms; i++) {
            const gap = this.minGap + Math.random() * (this.maxGap - this.minGap);
            const height = this.minHeight + Math.random() * (this.maxHeight - this.minHeight);
            
            currentX += gap;
            currentY = Math.max(
                this.game.height - this.maxHeight,
                Math.min(
                    this.game.height - this.minHeight,
                    currentY + (Math.random() > 0.5 ? height : -height)
                )
            );
            
            // Create platform
            const platform = {
                x: currentX,
                y: currentY,
                width: this.platformWidth,
                height: this.platformHeight
            };
            platforms.push(platform);
            
            // Add stars on every third platform to spread them out
            if (i % 3 === 0 && stars.length < 10) {
                const starCount = this.getRandomInt(1, 2);
                for (let j = 0; j < starCount && stars.length < 10; j++) {
                    stars.push(new Star(
                        platform.x + (platform.width / (starCount + 1)) * (j + 1) - 10,
                        platform.y - 30
                    ));
                }
            }
            
            // Add side platforms for additional stars, but less frequently
            if (Math.random() < 0.3 && i > 0 && i < numPlatforms - 1 && stars.length < 10) {
                const sidePlatform = {
                    x: platform.x + this.platformWidth + 50,
                    y: platform.y - this.getRandomInt(50, 100),
                    width: this.platformWidth,
                    height: this.platformHeight
                };
                platforms.push(sidePlatform);
                
                // Add a single star to side platforms
                if (stars.length < 10) {
                    stars.push(new Star(
                        sidePlatform.x + sidePlatform.width/2 - 10,
                        sidePlatform.y - 30
                    ));
                }
            }
        }
        
        // Add final platform with special stars
        const finalPlatform = {
            x: currentX + 50,
            y: currentY - 50,
            width: this.platformWidth,
            height: this.platformHeight
        };
        platforms.push(finalPlatform);
        
        // Add final stars if we haven't reached 10 yet
        const remainingStars = 10 - stars.length;
        if (remainingStars > 0) {
            const finalStarCount = Math.min(remainingStars, 3);
            for (let i = 0; i < finalStarCount; i++) {
                stars.push(new Star(
                    finalPlatform.x + (finalPlatform.width / (finalStarCount + 1)) * (i + 1) - 10,
                    finalPlatform.y - 30
                ));
            }
        }
        
        // Ensure we have exactly 10 flowers, spread out on random platforms
        while (stars.length < 10) {
            // Choose a random platform that doesn't already have a star
            let randomPlatform;
            let attempts = 0;
            do {
                randomPlatform = platforms[this.getRandomInt(0, platforms.length - 1)];
                attempts++;
            } while (this.platformHasStar(randomPlatform, stars) && attempts < 10);
            
            stars.push(new Star(
                randomPlatform.x + randomPlatform.width/2 - 10,
                randomPlatform.y - 30
            ));
        }
        
        return { platforms, stars };
    }
    
    platformHasStar(platform, stars) {
        return stars.some(star => 
            star.x >= platform.x && 
            star.x <= platform.x + platform.width &&
            Math.abs(star.y - (platform.y - 30)) < 10
        );
    }
    
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
} 