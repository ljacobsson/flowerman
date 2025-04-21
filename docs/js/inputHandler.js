export class InputHandler {
    constructor() {
        this.keys = {
            left: false,
            right: false,
            up: false,
            restart: false
        };
        
        // Keyboard controls
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

        // Mobile controls
        this.gyroEnabled = false;
        this.gyroX = 0;
        this.gyroThreshold = 0.1; // Sensitivity threshold for gyroscope

        // Request permission for device orientation
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (event) => {
                if (this.gyroEnabled) {
                    // Normalize gamma (left/right tilt) to -1 to 1 range
                    this.gyroX = Math.max(-1, Math.min(1, event.gamma / 90));
                    
                    // Update movement based on tilt
                    this.keys.left = this.gyroX < -this.gyroThreshold;
                    this.keys.right = this.gyroX > this.gyroThreshold;
                }
            });

            // Request permission for iOS 13+
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                document.body.addEventListener('click', () => {
                    DeviceOrientationEvent.requestPermission()
                        .then(permissionState => {
                            if (permissionState === 'granted') {
                                this.gyroEnabled = true;
                            }
                        })
                        .catch(console.error);
                }, { once: true });
            } else {
                this.gyroEnabled = true;
            }
        }

        // Touch controls for jumping
        window.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent scrolling
            this.keys.up = true;
        });

        window.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys.up = false;
        });

        // Prevent scrolling on touch devices
        document.body.style.touchAction = 'none';
    }
} 