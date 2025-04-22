export class InputHandler {
    constructor(game) {
        this.game = game;
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
        this.gyroSmoothing = 0.2;
        this.gyroMultiplier = 0.05;
        
        // Check if iOS
        this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        
        // Keyboard event listeners
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Touch events with iOS specific handling
        if (this.isIOS) {
            // iOS specific touch handling
            document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
            document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
            document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        } else {
            // Standard touch handling for other devices
            window.addEventListener('touchstart', this.handleTouchStart.bind(this));
            window.addEventListener('touchend', this.handleTouchEnd.bind(this));
            window.addEventListener('touchmove', this.handleTouchMove.bind(this));
        }
        
        // Gyroscope event listener with iOS specific handling
        if (window.DeviceOrientationEvent) {
            if (this.isIOS) {
                // iOS 13+ requires permission
                document.addEventListener('click', () => {
                    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                        DeviceOrientationEvent.requestPermission()
                            .then(permissionState => {
                                if (permissionState === 'granted') {
                                    window.addEventListener('deviceorientation', this.handleDeviceOrientation.bind(this));
                                }
                            })
                            .catch(console.error);
                    }
                }, { once: true });
            } else {
                window.addEventListener('deviceorientation', this.handleDeviceOrientation.bind(this));
            }
        }
        
        // Prevent scrolling on touch devices
        document.body.style.touchAction = 'none';
    }
    
    handleDeviceOrientation(e) {
        if (!e.gamma) return; // Skip if no gamma value
        
        // Smooth the gyro input
        this.gyroX = this.gyroX * (1 - this.gyroSmoothing) + 
                    (e.gamma * this.gyroMultiplier) * this.gyroSmoothing;
        
        // Update movement based on tilt
        this.keys.left = this.gyroX < -0.3;
        this.keys.right = this.gyroX > 0.3;
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.keys.up = true;
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        this.touchEndX = e.changedTouches[0].clientX;
        this.touchEndY = e.changedTouches[0].clientY;
        
        // Calculate swipe direction
        const dx = this.touchEndX - this.touchStartX;
        
        // Only handle horizontal movement
        if (Math.abs(dx) > 20) {
            if (dx > 0) {
                this.keys.right = true;
                this.keys.left = false;
            } else {
                this.keys.left = true;
                this.keys.right = false;
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
        e.preventDefault();
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