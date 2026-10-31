// FAIZ KHATRI — Interactive 3D Neural Core & Quantum Lattice Scene
// Built with Three.js with automatic high-performance 2D Canvas fallback

(function () {
  'use strict';

  const container = document.getElementById('hero-3d-container');
  if (!container) return;

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;

  // Track visibility to pause rendering when hero is scrolled out of view
  let isVisible = true;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
    });
  }, { threshold: 0.05 });
  observer.observe(container);

  // Mouse & Pointer Tracking with Smooth Lerp
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  function onPointerMove(e) {
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : windowHalfX);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : windowHalfY);
    targetX = (clientX - windowHalfX) * 0.0012;
    targetY = (clientY - windowHalfY) * 0.0012;
  }

  window.addEventListener('mousemove', onPointerMove, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });

  // ─────────────────────────────────────────────────────────────────
  // THREE.JS IMPLEMENTATION
  // ─────────────────────────────────────────────────────────────────
  if (typeof THREE !== 'undefined') {
    try {
      const scene = new THREE.Scene();

      // Camera
      const camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      camera.position.z = isMobile ? 7.2 : 5.8;

      // Renderer
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !isMobile,
        powerPreference: 'high-performance'
      });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
      container.appendChild(renderer.domElement);

      // Master Group
      const masterGroup = new THREE.Group();
      scene.add(masterGroup);

      // Colors
      const limeColor = new THREE.Color(0xd4ff32);
      const cyanColor = new THREE.Color(0x38bdf8);
      const darkColor = new THREE.Color(0x131722);

      // 1. Inner Geodesic Core (Icosahedron)
      const coreGeo = new THREE.IcosahedronGeometry(isMobile ? 1.4 : 1.7, 1);
      const coreWireMat = new THREE.MeshBasicMaterial({
        color: cyanColor,
        wireframe: true,
        transparent: true,
        opacity: 0.45
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreWireMat);
      masterGroup.add(coreMesh);

      // Inner Core Solid Translucent Body
      const coreSolidMat = new THREE.MeshBasicMaterial({
        color: darkColor,
        transparent: true,
        opacity: 0.65,
        wireframe: false
      });
      const coreSolid = new THREE.Mesh(coreGeo, coreSolidMat);
      masterGroup.add(coreSolid);

      // 2. Core Vertices Points (Neural Nodes)
      const pointGeo = new THREE.BufferGeometry();
      const posAttr = coreGeo.attributes.position;
      pointGeo.setAttribute('position', posAttr);
      const pointMat = new THREE.PointsMaterial({
        color: limeColor,
        size: isMobile ? 0.08 : 0.11,
        transparent: true,
        opacity: 0.95
      });
      const corePoints = new THREE.Points(pointGeo, pointMat);
      masterGroup.add(corePoints);

      // 3. Orbital Ring 1 (Equatorial Gimbal Ring)
      const ring1Geo = new THREE.TorusGeometry(isMobile ? 2.1 : 2.5, 0.015, 12, 100);
      const ring1Mat = new THREE.MeshBasicMaterial({
        color: limeColor,
        transparent: true,
        opacity: 0.4
      });
      const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
      ring1.rotation.x = Math.PI / 3;
      masterGroup.add(ring1);

      // 4. Orbital Ring 2 (Polar Gimbal Ring)
      const ring2Geo = new THREE.TorusGeometry(isMobile ? 2.3 : 2.8, 0.012, 12, 100);
      const ring2Mat = new THREE.MeshBasicMaterial({
        color: cyanColor,
        transparent: true,
        opacity: 0.35
      });
      const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
      ring2.rotation.y = Math.PI / 4;
      masterGroup.add(ring2);

      // 5. Surrounding Neural Constellation Particle Field
      const particleCount = isMobile ? 80 : 180;
      const particlesGeo = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particleCount * 3);
      const particleScales = new Float32Array(particleCount);

      for (let i = 0; i < particleCount * 3; i += 3) {
        const radius = 2.8 + Math.random() * 2.6;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);

        particlePositions[i] = radius * Math.sin(phi) * Math.cos(theta);
        particlePositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        particlePositions[i + 2] = radius * Math.cos(phi);
        particleScales[i / 3] = Math.random();
      }

      particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      const particlesMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: isMobile ? 0.04 : 0.06,
        transparent: true,
        opacity: 0.55
      });
      const particleSystem = new THREE.Points(particlesGeo, particlesMat);
      masterGroup.add(particleSystem);

      // Subtle lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);

      // Animation Loop
      let clock = new THREE.Clock();

      function animate() {
        requestAnimationFrame(animate);

        if (!isVisible) return;

        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        // Mouse smooth interpolation
        mouseX += (targetX - mouseX) * 0.05;
        mouseY += (targetY - mouseY) * 0.05;

        if (!isReducedMotion) {
          // Autonomous slow orbital rotation
          coreMesh.rotation.y += 0.004;
          coreMesh.rotation.x += 0.002;

          ring1.rotation.z += 0.006;
          ring1.rotation.y += 0.003;

          ring2.rotation.x -= 0.005;
          ring2.rotation.z -= 0.002;

          particleSystem.rotation.y -= 0.0015;
          particleSystem.rotation.x += 0.001;

          // Breathing scale effect
          const scale = 1 + Math.sin(time * 1.5) * 0.025;
          coreMesh.scale.set(scale, scale, scale);
          corePoints.scale.set(scale, scale, scale);
        }

        // Apply mouse tilt to master group
        masterGroup.rotation.y = mouseX * 1.4;
        masterGroup.rotation.x = mouseY * 1.4;

        renderer.render(scene, camera);
      }

      animate();

      // Responsive Resize
      window.addEventListener('resize', () => {
        if (!container) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.position.z = window.innerWidth < 768 ? 7.2 : 5.8;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2));
      }, { passive: true });

      return; // Three.js initialized successfully!
    } catch (err) {
      console.warn('Three.js initialization failed, falling back to 2D Canvas neural network:', err);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 2D CANVAS FALLBACK (Zero Dependencies, 60+ FPS, Crisp)
  // ─────────────────────────────────────────────────────────────────
  const canvas = document.createElement('canvas');
  canvas.className = 'hero-fallback-canvas';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let W, H;
  function resize() {
    W = canvas.width = container.clientWidth;
    H = canvas.height = container.clientHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const numNodes = isMobile ? 32 : 55;
  const nodes = [];
  for (let i = 0; i < numNodes; i++) {
    nodes.push({
      x: Math.random() * (W || 400),
      y: Math.random() * (H || 400),
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 2 + 1.5,
      color: Math.random() > 0.6 ? '#d4ff32' : '#38bdf8'
    });
  }

  function render2D() {
    requestAnimationFrame(render2D);
    if (!isVisible) return;

    ctx.clearRect(0, 0, W, H);

    // Update and draw connections
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
        const maxDist = isMobile ? 90 : 130;

        if (dist < maxDist) {
          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.strokeStyle = `rgba(56, 189, 248, ${(1 - dist / maxDist) * 0.25})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Draw node
      ctx.beginPath();
      ctx.arc(n1.x, n1.y, n1.radius, 0, Math.PI * 2);
      ctx.fillStyle = n1.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = n1.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
  render2D();

})();

