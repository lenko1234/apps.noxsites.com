// Intersection Observer for fade-in animations (reversible with direction)
let lastScrollY = window.scrollY;
let scrollDirection = 'down';

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
    lastScrollY = currentScrollY;
}, { passive: true });

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Add visible class and direction class
            entry.target.classList.add('visible');
            entry.target.classList.add(`scroll-${scrollDirection}`);
        } else {
            // Remove classes when scrolling away
            entry.target.classList.remove('visible', 'scroll-down', 'scroll-up');
        }
    });
}, observerOptions);

// --- Dynamic Looping Typewriter for Hero ---
class Typewriter {
    constructor(el, phrases, period) {
        this.el = el;
        this.phrases = phrases;
        this.period = parseInt(period, 10) || 2000;
        this.txt = '';
        this.loopNum = 0;
        this.isDeleting = false;
        this.tick();
    }

    tick() {
        const i = this.loopNum % this.phrases.length;
        const fullTxt = this.phrases[i];
        if (this.isDeleting) {
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }
        this.el.innerHTML = this.txt + '<span class="cursor">|</span>'; // Re-added cursor here if needed
        let delta = 200 - Math.random() * 100;
        if (this.isDeleting) { delta /= 2; }
        if (!this.isDeleting && this.txt === fullTxt) {
            delta = this.period;
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            this.loopNum++;
            delta = 500;
        }
        setTimeout(() => this.tick(), delta);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) window.lucide.createIcons();

    const heroTypewriterEl = document.getElementById('typewriter-text');
    if (heroTypewriterEl) {
        let phrases = ['alto impacto', 'estética premium', 'conversión real', 'puro diseño'];
        const rawPhrases = heroTypewriterEl.getAttribute('data-phrases');
        if (rawPhrases) {
            try {
                phrases = JSON.parse(rawPhrases);
            } catch (e) {
                console.error("Error parsing typewriter phrases:", e);
            }
        }
        new Typewriter(heroTypewriterEl, phrases, 2500);
    }

    // Reversible animations for comparison cards and other fade-in elements
    document.querySelectorAll('.fade-in, .comp-card').forEach(el => observer.observe(el));

    // One-time animation for price cards (they stay visible after first animation)
    const priceObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entry.target.classList.add(`scroll-${scrollDirection}`);
                // Unobserve after first animation - keeps it visible
                priceObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.price-card').forEach(el => priceObserver.observe(el));

    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
        document.addEventListener('mousemove', (e) => {
            const x = (window.innerWidth / 2 - e.pageX) / 40;
            const y = (window.innerHeight / 2 - e.pageY) / 40;
            heroVisual.style.transform = `translateX(${x}px) translateY(${y}px)`;
        });
    }

    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => navLinks.classList.toggle('active'));
    }

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks) navLinks.classList.remove('active');
        });
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) targetElement.scrollIntoView({ behavior: 'smooth' });
        });
    });

    const boidsBtn = document.getElementById('portfolio-btn');
    const canvas = document.getElementById('boids-canvas');
    if (canvas && window.THREE) {
        const THREE = window.THREE;
        const width = boidsBtn.offsetWidth;
        const height = boidsBtn.offsetHeight;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 25;
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        const geometry = new THREE.ConeGeometry(0.5, 2, 3);
        geometry.rotateX(Math.PI / 2);
        const material = new THREE.MeshPhongMaterial({ color: 0x10b981, emissive: 0x064e3b, shininess: 100, transparent: true, opacity: 0.8 });
        const count = 30;
        const mesh = new THREE.InstancedMesh(geometry, material, count);
        scene.add(mesh);
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const pointLight = new THREE.PointLight(0x10b981, 2, 50);
        pointLight.position.set(0, 0, 10);
        scene.add(pointLight);
        const dummy = new THREE.Object3D();
        const positions = []; const velocities = [];
        function getBounds() {
            const aspect = width / height;
            const vFOV = THREE.MathUtils.degToRad(camera.fov);
            const visibleHeight = 2 * Math.tan(vFOV / 2) * camera.position.z;
            const visibleWidth = visibleHeight * aspect;
            return { x: visibleWidth / 1.5, y: visibleHeight / 1.5, z: 15 };
        }
        let bounds = getBounds();
        let isHovered = false;
        boidsBtn.addEventListener('mouseenter', () => isHovered = true);
        boidsBtn.addEventListener('mouseleave', () => isHovered = false);
        for (let i = 0; i < count; i++) {
            positions.push(new THREE.Vector3((Math.random() - 0.5) * bounds.x * 2, (Math.random() - 0.5) * bounds.y * 2, (Math.random() - 0.5) * bounds.z));
            velocities.push(new THREE.Vector3((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.1));
        }
        function animate() {
            requestAnimationFrame(animate);
            const speedFactor = isHovered ? 2.5 : 1.0;
            for (let i = 0; i < count; i++) {
                const pos = positions[i]; const vel = velocities[i];
                pos.x += vel.x * speedFactor; pos.y += vel.y * speedFactor; pos.z += vel.z * speedFactor;
                if (pos.x > bounds.x) pos.x = -bounds.x; if (pos.x < -bounds.x) pos.x = bounds.x;
                if (pos.y > bounds.y) pos.y = -bounds.y; if (pos.y < -bounds.y) pos.y = bounds.y;
                if (pos.z > bounds.z) pos.z = -bounds.z; if (pos.z < -bounds.z) pos.z = bounds.z;
                dummy.position.copy(pos); dummy.lookAt(pos.clone().add(vel)); dummy.updateMatrix();
                mesh.setMatrixAt(i, dummy.matrix);
            }
            mesh.instanceMatrix.needsUpdate = true; renderer.render(scene, camera);
        }
        window.addEventListener('resize', () => {
            const newWidth = boidsBtn.offsetWidth; const newHeight = boidsBtn.offsetHeight;
            camera.aspect = newWidth / newHeight; camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight); bounds = getBounds();
        });
        animate();
    }
});
