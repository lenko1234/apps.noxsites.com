/**
 * NOX Nexus Background Effect
 * Optimized for Performance
 */

class NexusBackground {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
        this.particlesArray = [];
        this.glowsArray = [];
        this.animationId = null;

        // Colors
        this.EMERALD_RGB = '16, 185, 129';
        this.DARK_EMERALD = '16, 185, 129';

        // Performance optimization
        this.lastFrameTime = 0;
        this.fps = 30; // Limit to 30fps for better performance
        this.frameInterval = 1000 / this.fps;

        console.log('🌌 Nexus: Initializing canvas', canvas);

        this.resize();
        this.animate();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const parent = this.canvas.parentElement;
        const rect = parent.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;

        console.log('🌌 Nexus: Canvas size', this.width, 'x', this.height);

        if (!this.width || !this.height) {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
        }

        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.init();
    }

    init() {
        this.particlesArray = [];
        this.glowsArray = [];

        if (!this.width || !this.height) {
            console.warn('⚠️ Nexus: Invalid dimensions');
            return;
        }

        // Reduced glows for performance
        for (let i = 0; i < 3; i++) {
            this.glowsArray.push(new Glow(this.width, this.height, this.EMERALD_RGB));
        }

        // Significantly reduced particle count for smooth scrolling
        let quantity = Math.min((this.width * this.height) / 15000, 80);

        console.log('🌌 Nexus: Creating', Math.floor(quantity), 'particles');

        for (let i = 0; i < quantity; i++) {
            let size = Math.random() * 2 + 0.5;
            let x = Math.random() * this.width;
            let y = Math.random() * this.height;
            let dx = (Math.random() - 0.5) * 0.3;
            let dy = (Math.random() - 0.5) * 0.3;
            this.particlesArray.push(new Particle(x, y, dx, dy, size, this.EMERALD_RGB));
        }
    }

    connect() {
        // Increased connection distance for more visible network
        let maxDistance = 200;
        const len = this.particlesArray.length;

        for (let a = 0; a < len; a++) {
            // Check more nearby particles for denser network
            for (let b = a + 1; b < Math.min(a + 20, len); b++) {
                let dx = this.particlesArray[a].x - this.particlesArray[b].x;
                let dy = this.particlesArray[a].y - this.particlesArray[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    let opacity = 1 - (distance / maxDistance);
                    // More visible connections
                    this.ctx.strokeStyle = `rgba(${this.DARK_EMERALD}, ${opacity * 0.45})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particlesArray[a].x, this.particlesArray[a].y);
                    this.ctx.lineTo(this.particlesArray[b].x, this.particlesArray[b].y);
                    this.ctx.stroke();
                }
            }
        }
    }

    animate(currentTime = 0) {
        this.animationId = requestAnimationFrame((time) => this.animate(time));

        // Frame rate limiting for performance
        const elapsed = currentTime - this.lastFrameTime;
        if (elapsed < this.frameInterval) return;

        this.lastFrameTime = currentTime - (elapsed % this.frameInterval);

        this.ctx.clearRect(0, 0, this.width, this.height);

        // 1. Background Glows
        this.glowsArray.forEach(glow => {
            glow.update(this.width, this.height);
            glow.draw(this.ctx);
        });

        // 2. Connections
        this.connect();

        // 3. Particles
        this.particlesArray.forEach(particle => {
            particle.update(this.width, this.height);
            particle.draw(this.ctx);
        });
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

class Glow {
    constructor(canvasWidth, canvasHeight, color) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.size = Math.random() * 250 + 150;
        this.dx = (Math.random() - 0.5) * 0.15;
        this.dy = (Math.random() - 0.5) * 0.15;
        this.opacity = Math.random() * 0.08 + 0.04;
        this.color = color;
    }

    draw(ctx) {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, `rgba(${this.color}, ${this.opacity})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    update(width, height) {
        this.x += this.dx;
        this.y += this.dy;

        if (this.x < -this.size) this.x = width + this.size;
        if (this.x > width + this.size) this.x = -this.size;
        if (this.y < -this.size) this.y = height + this.size;
        if (this.y > height + this.size) this.y = -this.size;
    }
}

class Particle {
    constructor(x, y, dx, dy, size, color) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.size = size;
        this.color = color;
    }

    draw(ctx) {
        // Simplified drawing without shadow for performance
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, 0.7)`;
        ctx.fill();
    }

    update(width, height) {
        if (this.x > width) this.x = 0;
        if (this.x < 0) this.x = width;
        if (this.y > height) this.y = 0;
        if (this.y < 0) this.y = height;

        this.x += this.dx;
        this.y += this.dy;
    }
}

// Global initialization
window.initNexus = (selector) => {
    console.log('🌌 Nexus: Starting initialization for', selector);
    setTimeout(() => {
        const canvases = document.querySelectorAll(selector);
        console.log('🌌 Nexus: Found', canvases.length, 'canvases');
        canvases.forEach((canvas, index) => {
            console.log('🌌 Nexus: Initializing canvas', index + 1);
            new NexusBackground(canvas);
        });
    }, 100);
};
