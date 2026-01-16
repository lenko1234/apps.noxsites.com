// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Add 'fade-in' class to elements we want to animate
    const animatedElements = document.querySelectorAll('.fade-in');
    animatedElements.forEach(el => observer.observe(el));

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Close menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Button 3D Boids Animation (THREE.js) ---
    const boidsBtn = document.getElementById('portfolio-btn');
    const canvas = document.getElementById('boids-canvas');

    if (canvas && window.THREE) {
        const THREE = window.THREE;
        const width = boidsBtn.offsetWidth;
        const height = boidsBtn.offsetHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 25;

        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Geometry & Material (Same as Portfolio)
        const geometry = new THREE.ConeGeometry(0.5, 2, 3);
        geometry.rotateX(Math.PI / 2);
        const material = new THREE.MeshPhongMaterial({
            color: 0x10b981,
            emissive: 0x064e3b,
            shininess: 100,
            transparent: true,
            opacity: 0.8
        });

        const count = 30;
        const mesh = new THREE.InstancedMesh(geometry, material, count);
        scene.add(mesh);

        // Lights
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const pointLight = new THREE.PointLight(0x10b981, 2, 50);
        pointLight.position.set(0, 0, 10);
        scene.add(pointLight);

        // Boids Data
        const dummy = new THREE.Object3D();
        const positions = [];
        const velocities = [];

        // Initial Bounds Calculation
        function getBounds() {
            const aspect = width / height;
            const vFOV = THREE.MathUtils.degToRad(camera.fov);
            const visibleHeight = 2 * Math.tan(vFOV / 2) * camera.position.z;
            const visibleWidth = visibleHeight * aspect;
            return {
                x: visibleWidth / 1.5, // Slightly less than half to keep boids mostly visible
                y: visibleHeight / 1.5,
                z: 15
            };
        }

        let bounds = getBounds();
        let isHovered = false;

        boidsBtn.addEventListener('mouseenter', () => isHovered = true);
        boidsBtn.addEventListener('mouseleave', () => isHovered = false);

        for (let i = 0; i < count; i++) {
            positions.push(new THREE.Vector3(
                (Math.random() - 0.5) * bounds.x * 2,
                (Math.random() - 0.5) * bounds.y * 2,
                (Math.random() - 0.5) * bounds.z
            ));
            velocities.push(new THREE.Vector3(
                (Math.random() - 0.5) * 0.3,
                (Math.random() - 0.5) * 0.3,
                (Math.random() - 0.5) * 0.1
            ));
        }

        function animate() {
            requestAnimationFrame(animate);

            // Speed factor based on hover
            const speedFactor = isHovered ? 2.5 : 1.0;

            for (let i = 0; i < count; i++) {
                const pos = positions[i];
                const vel = velocities[i];

                // Apply velocity with speed factor
                pos.x += vel.x * speedFactor;
                pos.y += vel.y * speedFactor;
                pos.z += vel.z * speedFactor;

                // Boundary Wrap (Teleport to other side for continuous flow)
                if (pos.x > bounds.x) pos.x = -bounds.x;
                if (pos.x < -bounds.x) pos.x = bounds.x;
                if (pos.y > bounds.y) pos.y = -bounds.y;
                if (pos.y < -bounds.y) pos.y = bounds.y;
                if (pos.z > bounds.z) pos.z = -bounds.z;
                if (pos.z < -bounds.z) pos.z = bounds.z;

                dummy.position.copy(pos);
                dummy.lookAt(pos.clone().add(vel));
                dummy.updateMatrix();
                mesh.setMatrixAt(i, dummy.matrix);
            }

            mesh.instanceMatrix.needsUpdate = true;
            renderer.render(scene, camera);
        }

        window.addEventListener('resize', () => {
            const newWidth = boidsBtn.offsetWidth;
            const newHeight = boidsBtn.offsetHeight;
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
            bounds = getBounds(); // Recalculate on resize
        });

        animate();
    }
});
