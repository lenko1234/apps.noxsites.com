// NOX Hero Abstract Visual Setup
// Uses Three.js for interactive particle orb and handles dynamic scroll-based assembly

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('heroCanvasContainer');
    if (!container || !window.THREE) return;

    const THREE = window.THREE;
    let containerWidth = container.clientWidth;
    let containerHeight = container.clientHeight;

    // Standard fallback if dimensions are 0 (e.g. hidden elements)
    if (!containerWidth || !containerHeight) {
        containerWidth = window.innerWidth;
        containerHeight = 600;
    }

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, containerWidth / containerHeight, 0.1, 1000);
    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerWidth, containerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Particle System Setup - 1800 particles
    const particleCount = 1800; 
    const particleGeometry = new THREE.BufferGeometry();
    const initialPositions = new Float32Array(particleCount * 3);  // Target Sphere Positions
    const scatteredPositions = new Float32Array(particleCount * 3); // Dispersed Starting Positions
    const currentPositions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // Distribute particles in spherical coordinates
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Random spherical coordinates
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        
        // Target sphere radius
        const radius = 32 + Math.random() * 6;
        
        // Target Sphere position
        initialPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        initialPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        initialPositions[i3 + 2] = radius * Math.cos(phi);
        
        // Scattered starting position (purely spherical)
        const scatterDistance = radius * (1.8 + Math.random() * 2.8);
        scatteredPositions[i3] = scatterDistance * Math.sin(phi) * Math.cos(theta);
        scatteredPositions[i3 + 1] = scatterDistance * Math.sin(phi) * Math.sin(theta);
        scatteredPositions[i3 + 2] = scatterDistance * Math.cos(phi);
        
        sizes[i] = Math.random() * 2 + 1;
    }

    // Set initial layout
    for (let i = 0; i < initialPositions.length; i++) {
        currentPositions[i] = scatteredPositions[i];
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));

    // Create a custom soft particle texture programmatically
    const createParticleTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.3, 'rgba(16, 185, 129, 0.8)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 16, 16);
        return new THREE.CanvasTexture(canvas);
    };

    // Material config for glowing green particles
    const particleMaterial = new THREE.PointsMaterial({
        color: 0x10b981,
        size: 0.95,
        map: createParticleTexture(),
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // Core Wireframe Sphere constructed as LineSegments to animate edge-by-edge
    const coreGeometry = new THREE.IcosahedronGeometry(16, 2);
    const wireframeGeom = new THREE.WireframeGeometry(coreGeometry);
    const coreMaterial = new THREE.LineBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0, 
        blending: THREE.AdditiveBlending
    });
    const coreMesh = new THREE.LineSegments(wireframeGeom, coreMaterial);
    scene.add(coreMesh);



    // Separate scroll tracking for particles and wireframe core (target and current for smooth lerp damping)
    let targetProgressParticles = 0;
    let targetProgressWireframe = 0;
    let currentProgressParticles = 0;
    let currentProgressWireframe = 0;
    
    const updateScrollProgress = () => {
        const currentScroll = window.scrollY;
        
        // 1. Particles start converging early (starts at 80px, ends at 500px)
        const startScrollP = 80;
        const endScrollP = 500;
        if (currentScroll < startScrollP) {
            targetProgressParticles = 0;
        } else {
            targetProgressParticles = Math.min((currentScroll - startScrollP) / (endScrollP - startScrollP), 1);
        }

        // 2. Wireframe starts drawing later (starts at 200px, ends at 480px)
        const startScrollW = 200;
        const endScrollW = 480;
        if (currentScroll < startScrollW) {
            targetProgressWireframe = 0;
        } else {
            targetProgressWireframe = Math.min((currentScroll - startScrollW) / (endScrollW - startScrollW), 1);
        }
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress(); // Initial run

    // Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
        requestAnimationFrame(animate);

        const time = clock.getElapsedTime();
        
        // Smoothly interpolate scroll progress to prevent abrupt jumps during fast scrolling
        currentProgressParticles += (targetProgressParticles - currentProgressParticles) * 0.06;
        currentProgressWireframe += (targetProgressWireframe - currentProgressWireframe) * 0.05;

        // Rotate particle system and wireframe core mesh (slower and more paused)
        particleSystem.rotation.y = time * 0.025;
        particleSystem.rotation.x = time * 0.015;
        coreMesh.rotation.y = -time * 0.04;
        coreMesh.rotation.x = -time * 0.02;

        // Reset camera position to default center
        camera.position.x = 0;
        camera.position.y = 0;
        camera.lookAt(scene.position);

        // Animate wireframe lines appearing one by one ("nodo por nodo")
        const totalVertices = wireframeGeom.attributes.position.count;
        const totalLines = totalVertices / 2;
        const lineProgress = Math.pow(currentProgressWireframe, 2.5);
        const activeLinesCount = Math.floor(lineProgress * totalLines);
        wireframeGeom.setDrawRange(0, activeLinesCount * 2);

        // Core wireframe opacity fades in quickly based on its own scroll
        coreMaterial.opacity = 0.15 * Math.min(currentProgressWireframe * 1.5, 1);

        // Deform Particle positions using dynamic wave equations + scroll interpolation
        const positions = particleGeometry.attributes.position.array;
        
        // Cap convergence at 80% (0.8) based on particles scroll progress
        const easeT = Math.pow(currentProgressParticles, 1.8) * 0.8;

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Scattered starting coordinates
            const sx = scatteredPositions[i3];
            const sy = scatteredPositions[i3 + 1];
            const sz = scatteredPositions[i3 + 2];
            
            // Target sphere coordinates
            const tx = initialPositions[i3];
            const ty = initialPositions[i3 + 1];
            const tz = initialPositions[i3 + 2];
            
            // Interpolate position based on capped progress
            const px = sx * (1 - easeT) + tx * easeT;
            const py = sy * (1 - easeT) + ty * easeT;
            const pz = sz * (1 - easeT) + tz * easeT;
            
            // Apply dynamic wave deformation (slower and more paused)
            const waveFactor = 
                Math.sin(px * 0.06 + time * 0.4) * 
                Math.cos(py * 0.06 + time * 0.3) * 
                Math.sin(pz * 0.06 + time * 0.5);
            
            const scale = 1.0 + waveFactor * 0.15 * easeT;
            
            positions[i3] = px * scale;
            positions[i3 + 1] = py * scale;
            positions[i3 + 2] = pz * scale;
        }
        
        particleGeometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
    };

    animate();

    // Handle container resizing - stretches to full window width
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth || window.innerWidth;
        const newHeight = container.clientHeight || 600;
        
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        
        renderer.setSize(newWidth, newHeight);
    });
});
