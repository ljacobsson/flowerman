export class Sun {
    constructor(game) {
        this.game = game;
        this.radius = 60;
        this.x = this.game.width - 100;
        this.y = 100;
        this.rays = 12;
        this.rayLength = 20;
        this.rayWidth = 4;
        this.rotation = 0;
        this.rotationSpeed = 0.005;
    }

    update() {
        // Slowly rotate the sun's rays
        this.rotation += this.rotationSpeed;
    }

    draw(ctx) {
        ctx.save();
        
        // Draw sun rays
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        for (let i = 0; i < this.rays; i++) {
            const angle = (i * Math.PI * 2) / this.rays;
            ctx.save();
            ctx.rotate(angle);
            
            // Draw ray
            ctx.fillStyle = 'rgba(255, 255, 0, 0.6)';
            ctx.fillRect(0, -this.rayWidth/2, this.rayLength, this.rayWidth);
            
            ctx.restore();
        }
        
        // Draw main sun body
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(1, '#FFA500');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
} 