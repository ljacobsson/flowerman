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
        this.gyroX = 0;
        this.gyroY = 0;
        this.gyroSmoothing = 0.1; // Smoothing factor for gyro input
        this.gyroMultiplier = 0.2; // Reduced sensitivity multiplier
        
        // Keyboard event listeners
        window.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    this.keys.left = true;
                    break;
                case 'ArrowRight':
                    this.keys.right = true;
                    break;
                case 'ArrowUp':
                case ' ':
                    this.keys.up = true;
                    break;
                case 'r':
                case 'R':
                    this.keys.restart = true;
                    break;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    this.keys.left = false;
                    break;
                case 'ArrowRight':
                    this.keys.right = false;
                    break;
                case 'ArrowUp':
                case ' ':
                    this.keys.up = false;
                    break;
                case 'r':
                case 'R':
                    this.keys.restart = false;
                    break;
            }
        });
        
        // Touch event listeners
        window.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent scrolling
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
            this.keys.up = true; // Jump on touch
        });
        
        window.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touchX = e.touches[0].clientX;
            const touchY = e.touches[0].clientY;
            
            // Calculate touch movement
            const deltaX = touchX - this.touchStartX;
            
            // Update movement based on touch
            this.keys.left = deltaX < -20;
            this.keys.right = deltaX > 20;
            
            // Update touch start position for next move
            this.touchStartX = touchX;
            this.touchStartY = touchY;
        });
        
        window.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys.up = false;
            this.keys.left = false;
            this.keys.right = false;
        });
        
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