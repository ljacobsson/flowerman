export class InputHandler {
    constructor() {
        this.keys = {
            left: false,
            right: false,
            up: false,
            restart: false
        };
        
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
    }
} 