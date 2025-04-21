export class Player {
    constructor(game) {
        this.game = game;
        this.width = 40;
        this.height = 60;
        this.x = 100;
        this.y = 100;
        this.velocityX = 0;
        this.velocityY = 0;
        this.jumpForce = -15;
        this.speed = 5;
        this.isJumping = false;
        this.isFacingRight = true;
        
        // Animation states
        this.animationStates = {
            idle: { frame: 0, maxFrames: 4 },
            running: { frame: 0, maxFrames: 6 },
            jumping: { frame: 0, maxFrames: 2 },
            dying: { frame: 0, maxFrames: 8 }
        };
        this.currentState = 'idle';
        this.animationTimer = 0;
        this.animationInterval = 100; // ms
        
        // Dying animation properties
        this.dyingRotation = 0;
        this.dyingScale = 1;
        this.isDying = false;
        
        // Bouquet properties
        this.collectedFlowers = [];
        this.maxFlowers = 5; // Maximum number of flowers to show in hand
    }
    
    reset() {
        this.x = 100;
        this.y = 100;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isJumping = false;
        this.isFacingRight = true;
        this.currentState = 'idle';
        this.isDying = false;
        this.dyingRotation = 0;
        this.dyingScale = 1;
        this.collectedFlowers = []; // Reset collected flowers
    }
    
    startDyingAnimation() {
        this.isDying = true;
        this.currentState = 'dying';
        this.velocityX = 0;
        this.velocityY = -5; // Small upward bounce
    }
    
    update() {
        if (this.isDying) {
            this.dyingRotation += 0.2;
            this.dyingScale -= 0.02;
            this.velocityY += this.game.gravity;
            this.y += this.velocityY;
            
            if (this.dyingScale <= 0) {
                this.dyingScale = 0;
            }
            return;
        }
        
        // Handle input
        if (this.game.inputHandler.keys.right) {
            this.velocityX = this.speed;
            this.isFacingRight = true;
            this.currentState = 'running';
        } else if (this.game.inputHandler.keys.left) {
            this.velocityX = -this.speed;
            this.isFacingRight = false;
            this.currentState = 'running';
        } else {
            this.velocityX *= this.game.friction;
            this.currentState = 'idle';
        }
        
        // Jump
        if (this.game.inputHandler.keys.up && !this.isJumping) {
            this.velocityY = this.jumpForce;
            this.isJumping = true;
            this.currentState = 'jumping';
        }
        
        // Apply gravity
        this.velocityY += this.game.gravity;
        
        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Check for platform collisions
        this.checkPlatformCollisions();
        
        // Update animation
        this.updateAnimation();
    }
    
    checkPlatformCollisions() {
        this.isJumping = true;
        
        this.game.platforms.forEach(platform => {
            if (this.velocityY > 0 && // Moving down
                this.x + this.width > platform.x &&
                this.x < platform.x + platform.width &&
                this.y + this.height > platform.y &&
                this.y + this.height < platform.y + 20) {
                
                this.y = platform.y - this.height;
                this.velocityY = 0;
                this.isJumping = false;
            }
        });
    }
    
    updateAnimation() {
        this.animationTimer += 16; // Assuming 60fps
        if (this.animationTimer >= this.animationInterval) {
            this.animationTimer = 0;
            this.animationStates[this.currentState].frame++;
            if (this.animationStates[this.currentState].frame >= this.animationStates[this.currentState].maxFrames) {
                this.animationStates[this.currentState].frame = 0;
            }
        }
    }
    
    addFlower(flower) {
        this.collectedFlowers.push({
            color: flower.petalColor,
            offset: (this.collectedFlowers.length + 1) * 5 // Add 1 to ensure first flower has offset
        });
    }
    
    draw(ctx) {
        ctx.save();
        
        if (this.isDying) {
            ctx.translate(this.x + this.width/2, this.y + this.height/2);
            ctx.rotate(this.dyingRotation);
            ctx.scale(this.dyingScale, this.dyingScale);
            ctx.translate(-(this.x + this.width/2), -(this.y + this.height/2));
        }
        
        // Draw player body (rounded rectangle)
        const bodyHeight = this.height - 20; // Reduce body height to make room for legs
        const radius = 10; // Corner radius for rounded rectangle
        
        // Draw rounded rectangle for body
        ctx.fillStyle = this.isDying ? '#FF0000' : '#FF6347';
        ctx.beginPath();
        ctx.moveTo(this.x + radius, this.y);
        ctx.lineTo(this.x + this.width - radius, this.y);
        ctx.quadraticCurveTo(this.x + this.width, this.y, this.x + this.width, this.y + radius);
        ctx.lineTo(this.x + this.width, this.y + bodyHeight - radius);
        ctx.quadraticCurveTo(this.x + this.width, this.y + bodyHeight, this.x + this.width - radius, this.y + bodyHeight);
        ctx.lineTo(this.x + radius, this.y + bodyHeight);
        ctx.quadraticCurveTo(this.x, this.y + bodyHeight, this.x, this.y + bodyHeight - radius);
        ctx.lineTo(this.x, this.y + radius);
        ctx.quadraticCurveTo(this.x, this.y, this.x + radius, this.y);
        ctx.closePath();
        ctx.fill();
        
        // Draw head
        ctx.fillStyle = this.isDying ? '#FF0000' : '#FFD700';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y - 10, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw eyes
        ctx.fillStyle = '#87CEEB'; // Light blue eyes
        const eyeOffset = this.isFacingRight ? 5 : -5;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2 - eyeOffset, this.y - 15, 3, 0, Math.PI * 2);
        ctx.arc(this.x + this.width/2 + eyeOffset, this.y - 15, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw pupils
        ctx.fillStyle = 'black';
        const pupilOffset = this.isFacingRight ? 3 : -3;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2 - eyeOffset + pupilOffset, this.y - 15, 1.5, 0, Math.PI * 2);
        ctx.arc(this.x + this.width/2 + eyeOffset + pupilOffset, this.y - 15, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw nose
        ctx.fillStyle = '#FFA07A';
        ctx.beginPath();
        const noseX = this.isFacingRight ? this.x + this.width/2 + 8 : this.x + this.width/2 - 8;
        ctx.arc(noseX, this.y - 10, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw smile that grows with collected flowers
        if (!this.isDying) {
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 3;
            const baseWidth = 8;
            const baseHeight = 3;
            const flowerBonus = this.collectedFlowers.length * 2; // Each flower adds 2 pixels to width and 0.5 to height
            
            ctx.beginPath();
            const smileX = this.x + this.width/2;
            const smileY = this.y - 3;
            const smileWidth = baseWidth + flowerBonus;
            const smileHeight = baseHeight + (flowerBonus * 0.25);
            
            // Draw curved smile
            ctx.moveTo(smileX - smileWidth/2, smileY);
            ctx.quadraticCurveTo(
                smileX, smileY + smileHeight,
                smileX + smileWidth/2, smileY
            );
            ctx.stroke();
        }
        
        // Draw hair/hat
        ctx.fillStyle = '#8B4513'; // Brown hair
        // Draw the hat brim
        ctx.fillRect(this.x + this.width/2 - 20, this.y - 25, 40, 5);
        // Draw the hat top
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y - 25, 15, Math.PI, Math.PI * 2);
        ctx.fill();
        
        // Draw arms
        ctx.fillStyle = this.isDying ? '#FF0000' : '#FF6347';
        const armLength = 25;
        const armWidth = 8;
        
        if (this.currentState === 'running' || this.currentState === 'jumping') {
            // Animated arms when moving
            const armOffset = Math.sin(this.animationStates[this.currentState].frame * 0.5) * 10;
            if (this.isFacingRight) {
                // Right arm
                ctx.save();
                ctx.translate(this.x + this.width, this.y + 15);
                ctx.rotate(armOffset * 0.1);
                ctx.fillRect(0, 0, armLength, armWidth);
                ctx.restore();
                
                // Left arm
                ctx.save();
                ctx.translate(this.x, this.y + 15);
                ctx.rotate(-armOffset * 0.1);
                ctx.fillRect(-armLength, 0, armLength, armWidth);
                ctx.restore();
            } else {
                // Right arm
                ctx.save();
                ctx.translate(this.x + this.width, this.y + 15);
                ctx.rotate(-armOffset * 0.1);
                ctx.fillRect(0, 0, armLength, armWidth);
                ctx.restore();
                
                // Left arm
                ctx.save();
                ctx.translate(this.x, this.y + 15);
                ctx.rotate(armOffset * 0.1);
                ctx.fillRect(-armLength, 0, armLength, armWidth);
                ctx.restore();
            }
        } else {
            // Static arms when idle
            ctx.fillRect(this.x - armLength, this.y + 15, armLength, armWidth);
            ctx.fillRect(this.x + this.width, this.y + 15, armLength, armWidth);
        }
        
        // Draw collected flowers in hand
        if (this.collectedFlowers.length > 0) {
            // Calculate arm rotation for left arm
            let armRotation = 0;
            if (this.currentState === 'running' || this.currentState === 'jumping') {
                const armOffset = Math.sin(this.animationStates[this.currentState].frame * 0.5) * 10;
                armRotation = this.isFacingRight ? -armOffset * 0.1 : armOffset * 0.1;
            }
            
            // Position flowers at the end of the left arm
            const handX = this.isFacingRight ? this.x : this.x + this.width;
            const handY = this.y + 15;
            
            // Draw flowers with arm rotation
            ctx.save();
            ctx.translate(handX, handY);
            ctx.rotate(armRotation);
            
            // Draw flower stems
            ctx.fillStyle = '#228B22';
            this.collectedFlowers.forEach((flower, index) => {
                // Calculate angle for bouquet spread
                const totalFlowers = this.collectedFlowers.length;
                let angle;
                if (totalFlowers === 1) {
                    // Single flower points straight up
                    angle = 0;
                } else {
                    // Multiple flowers spread out
                    const maxSpread = Math.PI / 4; // 45 degrees max spread
                    // Invert the angle calculation when facing left
                    const baseAngle = (index / (totalFlowers - 1)) * maxSpread - maxSpread/2;
                    angle = this.isFacingRight ? baseAngle : -baseAngle;
                }
                
                // Calculate stem length and position
                const stemLength = 20 + index * 2; // Longer stems for outer flowers
                const stemX = this.isFacingRight ? -armLength : armLength;
                const stemEndX = stemX + Math.sin(angle) * stemLength;
                const stemEndY = -Math.cos(angle) * stemLength;
                
                // Draw curved stem
                ctx.beginPath();
                ctx.moveTo(stemX, 0);
                ctx.quadraticCurveTo(
                    stemX + (stemEndX - stemX) * 0.5,
                    stemEndY * 0.5,
                    stemEndX,
                    stemEndY
                );
                ctx.strokeStyle = '#228B22';
                ctx.lineWidth = 3;
                ctx.stroke();
                
                // Draw petals
                ctx.fillStyle = flower.color;
                for (let i = 0; i < 5; i++) {
                    const petalAngle = (i * 2 * Math.PI) / 5 + angle;
                    const petalSize = 5;
                    ctx.beginPath();
                    ctx.ellipse(
                        stemEndX,
                        stemEndY,
                        petalSize,
                        petalSize * 1.5,
                        petalAngle,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                }
                
                // Draw center
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(stemEndX, stemEndY, 3, 0, Math.PI * 2);
                ctx.fill();
            });
            
            ctx.restore();
        }
        
        // Draw legs
        ctx.fillStyle = '#000000';
        const legHeight = 20;
        const legWidth = 10;
        const legY = this.y + bodyHeight; // Start legs at bottom of body
        
        if (this.currentState === 'running' || this.currentState === 'jumping') {
            const legOffset = Math.sin(this.animationStates[this.currentState].frame * 0.5) * 5;
            
            if (this.isFacingRight) {
                // Right leg (front)
                ctx.fillRect(this.x + 5, legY, legWidth, legHeight + legOffset);
                // Left leg (back)
                ctx.fillRect(this.x + this.width - 15, legY, legWidth, legHeight - legOffset);
            } else {
                // Right leg (back)
                ctx.fillRect(this.x + 5, legY, legWidth, legHeight - legOffset);
                // Left leg (front)
                ctx.fillRect(this.x + this.width - 15, legY, legWidth, legHeight + legOffset);
            }
        } else {
            // Static legs when idle
            ctx.fillRect(this.x + 5, legY, legWidth, legHeight);
            ctx.fillRect(this.x + this.width - 15, legY, legWidth, legHeight);
        }
        
        ctx.restore();
    }
} 