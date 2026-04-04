// webgl.js - Interactive Three.js Background

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    // SCENE SETUP
    const scene = new THREE.Scene();
    
    // CAMERA
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // optimize pixel ratio

    // PARTICLES / GEOMETRY
    // Creating an abstract interactive particle field reminiscent of Monogrid's digital style
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 3000; // number of dots
    
    const posArray = new Float32Array(particlesCount * 3);
    
    // Fill array with random positions in a sphere/grid
    for(let i = 0; i < particlesCount * 3; i++) {
        // spread particles out
        posArray[i] = (Math.random() - 0.5) * 100;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    // MATERIAL
    const material = new THREE.PointsMaterial({
        size: 0.1,
        color: 0xffffff, // White particles
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    // MESH
    const particlesMesh = new THREE.Points(particlesGeometry, material);
    scene.add(particlesMesh);

    // MOUSE INTERACTION
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // RESIZE HANDLER
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ANIMATION LOOP
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        
        const elapsedTime = clock.getElapsedTime();

        // Rotate particles slowly
        particlesMesh.rotation.y = elapsedTime * 0.05;
        particlesMesh.rotation.x = elapsedTime * 0.02;

        // Mouse interaction: smoothly move particle system towards mouse
        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;
        
        particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);
        particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);

        renderer.render(scene, camera);
    }

    animate();
});
