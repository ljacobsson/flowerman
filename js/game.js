drawUI() {
    // Draw score
    this.ctx.fillStyle = 'black';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Flowers: ${this.score}`, 20, 40);
    
    // Draw level
    this.ctx.fillText(`Level: ${this.level}`, 20, 70);
    
    // Draw game over message
    if (this.gameState === 'gameOver') {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over', this.width/2, this.height/2);
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Press R to restart', this.width/2, this.height/2 + 40);
        this.ctx.textAlign = 'left';
    }
    
    // Draw level complete message
    if (this.gameState === 'completed') {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Level Complete!', this.width/2, this.height/2);
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Moving to next level...', this.width/2, this.height/2 + 40);
        this.ctx.textAlign = 'left';
    }
}

checkCollisions() {
    // Check for collisions with platforms
    this.platforms.forEach(platform => {
        if (this.player.x < platform.x + platform.width &&
            this.player.x + this.player.width > platform.x &&
            this.player.y + this.player.height > platform.y &&
            this.player.y < platform.y + platform.height) {
            // Collision with platform
            if (this.player.velocityY > 0 && this.player.y + this.player.height - this.player.velocityY <= platform.y) {
                // Landing on platform
                this.player.y = platform.y - this.player.height;
                this.player.velocityY = 0;
                this.player.isJumping = false;
            }
        }
    });

    // Check for collisions with flowers
    this.stars.forEach((star, index) => {
        if (this.player.x < star.x + star.width &&
            this.player.x + this.player.width > star.x &&
            this.player.y + this.player.height > star.y &&
            this.player.y < star.y + star.height) {
            // Collect the flower
            this.player.addFlower(star);
            this.stars.splice(index, 1);
            this.score += 1; // Changed from += 10 to += 1
            
            // Check if all flowers are collected
            if (this.stars.length === 0) {
                this.levelComplete = true;
            }
        }
    });
} 