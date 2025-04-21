export class InputHandler {
    constructor() {
        this.keys = {
            left: false,
            right: false,
            up: false,
            restart: false
        };
        
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.gyroX = 0;
        this.gyroY = 0;
        this.gyroSmoothing = 0.1; // Smoothing factor for gyro input
        this.gyroMultiplier = 0.1; // Reduced sensitivity multiplier
        
        // Keyboard event listeners
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Touch events
        window.addEventListener('touchstart', this.handleTouchStart.bind(this));
        window.addEventListener('touchend', this.handleTouchEnd.bind(this));
        window.addEventListener('touchmove', this.handleTouchMove.bind(this));
        
        // Gyroscope event listener
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (e) => {
                // Smooth the gyro input
                this.gyroX = this.gyroX * (1 - this.gyroSmoothing) + 
                            (e.gamma * this.gyroMultiplier) * this.gyroSmoothing;
                
                // Update movement based on tilt
                this.keys.left = this.gyroX < -0.2;
                this.keys.right = this.gyroX > 0.2;
            });
            
            // Request permission for iOS 13+
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                document.body.addEventListener('click', () => {
                    DeviceOrientationEvent.requestPermission()
                        .then(permissionState => {
                            if (permissionState === 'granted') {
                                // Permission granted
                            }
                        })
                        .catch(console.error);
                }, { once: true });
            }
        }
        
        // Prevent scrolling on touch devices
        document.body.style.touchAction = 'none';
    }
    
    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
    }
    
    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].clientX;
        this.touchEndY = e.changedTouches[0].clientY;
        
        // Calculate swipe direction
        const dx = this.touchEndX - this.touchStartX;
        const dy = this.touchEndY - this.touchStartY;
        
        // Determine if it's a horizontal or vertical swipe
        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal swipe
            if (dx > 0) {
                this.keys.right = true;
                this.keys.left = false;
            } else {
                this.keys.left = true;
                this.keys.right = false;
            }
        } else {
            // Vertical swipe
            if (dy < 0) {
                this.keys.up = true;
            }
        }
        
        // Reset keys after a short delay
        setTimeout(() => {
            this.keys.up = false;
            this.keys.left = false;
            this.keys.right = false;
        }, 100);
    }
    
    handleTouchMove(e) {
        e.preventDefault(); // Prevent scrolling
    }
    
    handleKeyDown(e) {
        switch(e.key) {
            case 'ArrowLeft':
            case 'a':
                this.keys.left = true;
                break;
            case 'ArrowRight':
            case 'd':
                this.keys.right = true;
                break;
            case 'ArrowUp':
            case 'w':
            case ' ':
                this.keys.up = true;
                break;
            case 'r':
            case 'R':
                this.keys.restart = true;
                break;
        }
    }
    
    handleKeyUp(e) {
        switch(e.key) {
            case 'ArrowLeft':
            case 'a':
                this.keys.left = false;
                break;
            case 'ArrowRight':
            case 'd':
                this.keys.right = false;
                break;
            case 'ArrowUp':
            case 'w':
            case ' ':
                this.keys.up = false;
                break;
            case 'r':
            case 'R':
                this.keys.restart = false;
                break;
        }
    }
    
    isKeyPressed(key) {
        return this.keys[key] || false;
    }
    
    getGyroX() {
        return this.gyroX;
    }
    
    getGyroY() {
        return this.gyroY;
    }
} 