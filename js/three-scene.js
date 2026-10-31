// FAIZ KHATRI — Awwwards SOTD Interactive WebGL Three.js Experience
// Autonomous Neural Singularity & Quantum Gyroscope with Physics Inertia

(function () {
  'use strict';

  const container = document.getElementById('hero-3d-container');
  if (!container) return;

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let isMobile = window.innerWidth < 768;

  // Visibility tracking via IntersectionObserver to pause rendering when hero is off-screen
  let isVisible = true;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
    });
  }, { threshold: 0.05 });
  observer.observe(container);

  // Mouse & Touch Tracking with Smooth Lerp Inertia
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;
  let windowHalfX = window.innerWidth / 2;
  let windowHalfY = window.innerHeight / 2;

  function updatePointer(clientX, clientY) {
    targetX = (clientX - windowHalfX) * 0.0016;
    targetY = (clientY - windowHalfY) * 0.0016;
  }

  window.addEventListener('mousemove', (e) => {
    updatePointer(e.clientX, e.clientY);
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      updatePointer(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  // ─────────────────────────────────────────────────────────────────
  // THREE.JS HIGH-END SCENE IMPLEMENTATION
  // ─────────────────────────────────────────────────────────────────
  if (typeof THREE !== 'undefined') {
    try {
      const scene = new THREE.Scene();

      // Camera
      const camera = new THREE.PerspectiveCamera(
        42,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      camera.position.z = isMobile ? 7.6 : 6.0;

      // WebGL Renderer
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !isMobile,
        powerPreference: 'high-performance'
      });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);

      // Master Group
      const masterGroup = new THREE.Group();
      scene.add(masterGroup);

      // Color Palette: Obsidian Black, Warm Off-White, Solar Amber
      const amberColor = new THREE.Color(0xe8b931);
      const amberGlow = new THREE.Color(0xffd866);
      const darkSurface = new THREE.Color(0x0e1118);
      const wireColor = new THREE.Color(0x9ca3af);

      // 1. Dual Geodesic Polyhedron (Icosahedron Inner Core)
      const coreGeo = new THREE.IcosahedronGeometry(isMobile ? 1.35 : 1.65, 2);

      // Inner Translucent Dark Facets
      const coreFacetMat = new THREE.MeshStandardMaterial({
        color: darkSurface,
        roughness: 0.25,
        metalness: 0.85,
        transparent: true,
        opacity: 0.78,
        flatShading: true
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreFacetMat);
      masterGroup.add(coreMesh);

      // Wireframe Lattice Shell
      const wireMat = new THREE.MeshBasicMaterial({
        color: wireColor,
        wireframe: true,
        transparent: true,
        opacity: 0.32
      });
      const wireMesh = new THREE.Mesh(coreGeo, wireMat);
      masterGroup.add(wireMesh);

      // 2. Vertex Nodes (Neural Singularity Points)
      const pointGeo = new THREE.BufferGeometry();
      const posAttr = coreGeo.attributes.position;
      pointGeo.setAttribute('position', posAttr);
      const pointMat = new THREE.PointsMaterial({
        color: amberGlow,
        size: isMobile ? 0.08 : 0.11,
        transparent: true,
        opacity: 0.95
      });
      const vertexPoints = new THREE.Points(pointGeo, pointMat);
      masterGroup.add(vertexPoints);

      // 3. Gyroscopic Orbital Gimbal Rings
      // Ring A — Equator tilt
      const ringAGeo = new THREE.TorusGeometry(isMobile ? 2.15 : 2.55, 0.016, 16, 120);
      const ringAMat = new THREE.MeshBasicMaterial({
        color: amberColor,
        transparent: true,
        opacity: 0.55
      });
      const ringA = new THREE.Mesh(ringAGeo, ringAMat);
      ringA.rotation.x = Math.PI / 3.2;
      masterGroup.add(ringA);

      // Ring B — Polar tilt
      const ringBGeo = new THREE.TorusGeometry(isMobile ? 2.35 : 2.85, 0.012, 16, 120);
      const ringBMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xf5f2eb),
        transparent: true,
        opacity: 0.28
      });
      const ringB = new THREE.Mesh(ringBGeo, ringBMat);
      ringB.rotation.y = Math.PI / 3.8;
      masterGroup.add(ringB);

      // 4. Floating Neural Constellation Particle Field
      const particleCount = isMobile ? 90 : 220;
      const particlePositions = new Float32Array(particleCount * 3);
      const particleVelocities = [];

      for (let i = 0; i < particleCount * 3; i += 3) {
        const radius = 2.6 + Math.random() * 2.8;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);

        particlePositions[i] = radius * Math.sin(phi) * Math.cos(theta);
        particlePositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        particlePositions[i + 2] = radius * Math.cos(phi);

        particleVelocities.push({
          thetaSpeed: (Math.random() - 0.5) * 0.005,
          phiSpeed: (Math.random() - 0.5) * 0.003
        });
      }

      const particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      const particleMat = new THREE.PointsMaterial({
        color: amberColor,
        size: isMobile ? 0.04 : 0.065,
        transparent: true,
        opacity: 0.7
      });
      const particleSystem = new THREE.Points(particleGeo, particleMat);
      masterGroup.add(particleSystem);

      // 5. Studio Lighting
      const keyLight = new THREE.DirectionalLight(0xfffaed, 2.2);
      keyLight.position.set(4, 5, 4);
      scene.add(keyLight);

      const amberRimLight = new THREE.DirectionalLight(amberColor, 3.0);
      amberRimLight.position.set(-5, -4, -3);
      scene.add(amberRimLight);

      const ambientLight = new THREE.AmbientLight(0x181a24, 1.2);
      scene.add(ambientLight);

      // Animation Loop
      let clock = new THREE.Clock();

      function animate() {
        requestAnimationFrame(animate);

        if (!isVisible) return;

        const time = clock.getElapsedTime();

        // Mouse smooth interpolation
        mouseX += (targetX - mouseX) * 0.045;
        mouseY += (targetY - mouseY) * 0.045;

        if (!isReducedMotion) {
          // Autonomous slow orbital rotation
          coreMesh.rotation.y += 0.0035;
          coreMesh.rotation.x += 0.0018;
          wireMesh.rotation.y = coreMesh.rotation.y;
          wireMesh.rotation.x = coreMesh.rotation.x;
          vertexPoints.rotation.y = coreMesh.rotation.y;
          vertexPoints.rotation.x = coreMesh.rotation.x;

          ringA.rotation.z += 0.0055;
          ringA.rotation.y += 0.0025;

          ringB.rotation.x -= 0.0045;
          ringB.rotation.z -= 0.002;

          particleSystem.rotation.y -= 0.0012;
          particleSystem.rotation.x += 0.0008;

          // Harmonic breathing scale
          const scale = 1 + Math.sin(time * 1.4) * 0.028;
          coreMesh.scale.set(scale, scale, scale);
          wireMesh.scale.set(scale, scale, scale);
          vertexPoints.scale.set(scale, scale, scale);
        }

        // Apply mouse gyroscopic torque to master group
        masterGroup.rotation.y = mouseX * 1.5;
        masterGroup.rotation.x = mouseY * 1.5;

        renderer.render(scene, camera);
      }

      animate();

      // Responsive Resize
      window.addEventListener('resize', () => {
        if (!container) return;
        isMobile = window.innerWidth < 768;
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.position.z = isMobile ? 7.6 : 6.0;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 2));
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
      }, { passive: true });

      return; // Three.js loaded and active!
    } catch (err) {
      console.warn('Three.js initialization fallback:', err);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 2D CANVAS FALLBACK (Zero External Dependencies, Crisp 60+ FPS)
  // ─────────────────────────────────────────────────────────────────
  const canvas = document.createElement('canvas');
  canvas.className = 'hero-fallback-canvas';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let W, H;
  function resize2D() {
    W = canvas.width = container.clientWidth;
    H = canvas.height = container.clientHeight;
  }
  resize2D();
  window.addEventListener('resize', resize2D, { passive: true });

  const numNodes = isMobile ? 28 : 50;
  const nodes = [];
  for (let i = 0; i < numNodes; i++) {
    nodes.push({
      x: Math.random() * (W || 400),
      y: Math.random() * (H || 400),
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      radius: Math.random() * 2 + 1.2,
      color: Math.random() > 0.5 ? '#e8b931' : '#f5f2eb'
    });
  }

  function render2D() {
    requestAnimationFrame(render2D);
    if (!isVisible || !ctx) return;

    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < nodes.length; i++) {
      const n1 = nodes[i];
      if (!isReducedMotion) {
        n1.x += n1.vx;
        n1.y += n1.vy;
        if (n1.x < 0 || n1.x > W) n1.vx *= -1;
        if (n1.y < 0 || n1.y > H) n1.vy *= -1;
      }

      for (let j = i + 1; j < nodes.length; j++) {
        const n2 = nodes[j];
        const dx = n1.x - n2.x;
        const dy = n1.y - n2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = isMobile ? 85 : 120;

        if (dist < maxDist) {
          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.strokeStyle = `rgba(232, 185, 49, ${(1 - dist / maxDist) * 0.35})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      ctx.beginPath();
      ctx.arc(n1.x, n1.y, n1.radius, 0, Math.PI * 2);
      ctx.fillStyle = n1.color;
      ctx.shadowBlur = 6;
      ctx.shadowColor = n1.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
  render2D();

})();
