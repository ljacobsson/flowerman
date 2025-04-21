export class Star {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 15;
        this.height = 15;
        this.collected = false;
        this.animationFrame = 0;
        this.animationSpeed = 0.1;
        
        // Randomly choose a petal color
        const colors = ['#FF0000', '#FFD700', '#FFFFFF'];
        this.petalColor = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        // Simple floating animation
        this.animationFrame += this.animationSpeed;
        this.y += Math.sin(this.animationFrame) * 0.5;
    }

    draw(ctx) {
        if (this.collected) return;

        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        
        // Draw flower petals
        ctx.fillStyle = this.petalColor;
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI) / 5;
            const petalSize = 5;
            ctx.beginPath();
            ctx.ellipse(
                Math.cos(angle) * 7,
                Math.sin(angle) * 7,
                petalSize,
                petalSize * 1.5,
                angle,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
        
        // Draw flower center
        ctx.fillStyle = '#FFD700'; // Yellow center
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect
        ctx.shadowColor = this.petalColor;
        ctx.shadowBlur = 8;
        
        // Draw stem
        ctx.fillStyle = '#228B22'; // Green stem
        ctx.fillRect(-1, 10, 2, 8);
        
        // Draw leaves
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.ellipse(-4, 15, 2, 4, Math.PI/4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(4, 15, 2, 4, -Math.PI/4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
} 