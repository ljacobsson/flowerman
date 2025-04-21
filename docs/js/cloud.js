export class Cloud {
    constructor(game) {
        this.game = game;
        this.width = Math.random() * 100 + 50; // Random width between 50 and 150
        this.height = this.width * 0.5; // Height is half of width
        this.x = -this.width; // Start off-screen to the left
        this.y = Math.random() * (this.game.height * 0.4); // Random height in top 40% of screen
        this.speed = Math.random() * 0.5 + 0.2; // Random speed between 0.2 and 0.7
        
        // Generate random cloud segments
        this.segments = [];
        const numSegments = Math.floor(Math.random() * 3) + 3; // 3-5 segments
        for (let i = 0; i < numSegments; i++) {
            this.segments.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: (this.height * 0.4) + Math.random() * (this.height * 0.3)
            });
        }
    }

    update() {
        this.x += this.speed;
        // Reset cloud position when it goes off-screen
        if (this.x > this.game.width) {
            this.x = -this.width;
            this.y = Math.random() * (this.game.height * 0.4);
            // Regenerate segments for variety
            this.segments = [];
            const numSegments = Math.floor(Math.random() * 3) + 3;
            for (let i = 0; i < numSegments; i++) {
                this.segments.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    radius: (this.height * 0.4) + Math.random() * (this.height * 0.3)
                });
            }
        }
    }

    draw(ctx) {
        ctx.save();
        
        // Draw each cloud segment with blueish-white color
        this.segments.forEach(segment => {
            ctx.beginPath();
            ctx.fillStyle = '#E8F4FF'; // Blueish-white color
            ctx.arc(
                this.x + segment.x,
                this.y + segment.y,
                segment.radius,
                0,
                Math.PI * 2
            );
            ctx.fill();
        });
        
        ctx.restore();
    }
} 