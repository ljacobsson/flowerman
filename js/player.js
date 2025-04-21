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

// Draw smile (grows with collected flowers)
if (!this.isDying) {
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 4; // Made thicker
    const smileWidth = 10 + (this.collectedFlowers.length * 2); // Increased base width
    const smileHeight = 4 + (this.collectedFlowers.length * 0.5); // Increased base height
    const smileX = this.x + this.width/2;
    const smileY = this.y - 2; // Moved up more
    
    // Draw main smile curve
    ctx.beginPath();
    ctx.moveTo(smileX - smileWidth, smileY);
    ctx.quadraticCurveTo(
        smileX,
        smileY + smileHeight * 2,
        smileX + smileWidth,
        smileY
    );
    ctx.stroke();
    
    // Add a second curve for more definition
    ctx.beginPath();
    ctx.moveTo(smileX - smileWidth * 0.8, smileY);
    ctx.quadraticCurveTo(
        smileX,
        smileY + smileHeight,
        smileX + smileWidth * 0.8,
        smileY
    );
    ctx.stroke();
} 