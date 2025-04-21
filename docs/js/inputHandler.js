export class InputHandler {
    constructor(game) {
        this.game = game;
        this.keys = {};
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        
        // Keyboard events
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            this.game.handleKeyDown(e);
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // Touch events
        window.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
            
            // Handle leaderboard input click
            this.game.handleClick(e.touches[0].clientX, e.touches[0].clientY);
        });
        
        window.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.touchEndX = e.touches[0].clientX;
            this.touchEndY = e.touches[0].clientY;
        });
        
        window.addEventListener('touchend', (e) => {
            const deltaX = this.touchEndX - this.touchStartX;
            const deltaY = this.touchEndY - this.touchStartY;
            
            // Handle jump on touch end
            if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY < 0) {
                this.keys[' '] = true;
                setTimeout(() => {
                    this.keys[' '] = false;
                }, 100);
            }
        });
        
        // Device motion events for mobile tilt controls
        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', (e) => {
                if (e.accelerationIncludingGravity) {
                    const tilt = e.accelerationIncludingGravity.x;
                    if (tilt > 1) {
                        this.keys['ArrowRight'] = true;
                        this.keys['ArrowLeft'] = false;
                    } else if (tilt < -1) {
                        this.keys['ArrowLeft'] = true;
                        this.keys['ArrowRight'] = false;
                    } else {
                        this.keys['ArrowLeft'] = false;
                        this.keys['ArrowRight'] = false;
                    }
                }
            });
        }
    }
} 