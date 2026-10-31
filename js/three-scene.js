// FAIZ KHATRI — Experimental Digital Engineering WebGL Experience
// Full-Screen Three.js Spatial Universe, Quantum Gyroscope & Particle Fluid Inertia

(function () {
  'use strict';

  const container = document.getElementById('hero-3d-canvas-wrap');
  if (!container) return;

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let isMobile = window.innerWidth < 768;

  // Visibility tracking via IntersectionObserver
  let isVisible = true;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
    });
  }, { threshold: 0.05 });
  observer.observe(container);

  // Mouse & Touch Coordinates with Smooth Spring Lerp
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;
  let windowHalfX = window.innerWidth / 2;
  let windowHalfY = window.innerHeight / 2;

  function updatePointer(clientX, clientY) {
    targetX = (clientX - windowHalfX) * 0.0014;
    targetY = (clientY - windowHalfY) * 0.0014;
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
  // THREE.JS HIGH-END SPATIAL UNIVERSE
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
      camera.position.z = isMobile ? 8.2 : 6.4;

      // Renderer
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !isMobile,
        powerPreference: 'high-performance'
      });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      container.appendChild(renderer.domElement);

      // Master 3D Group
      const masterGroup = new THREE.Group();
      scene.add(masterGroup);

      // Electric Acid Lime & Titanium Studio Palette
      const limeColor = new THREE.Color(0xccff00);
      const limeGlow = new THREE.Color(0xe0ff4f);
      const darkFacet = new THREE.Color(0x07090e);
      const wireColor = new THREE.Color(0x64748b);

      // 1. Central Quantum Geodesic Polyhedron (Icosahedron)
      const coreGeo = new THREE.IcosahedronGeometry(isMobile ? 1.5 : 1.85, 2);

      // Dark Translucent Facets
      const coreFacetMat = new THREE.MeshStandardMaterial({
        color: darkFacet,
        roughness: 0.2,
        metalness: 0.9,
        transparent: true,
        opacity: 0.82,
        flatShading: true
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreFacetMat);
      masterGroup.add(coreMesh);

      // Wireframe Lattice Cage
      const wireMat = new THREE.MeshBasicMaterial({
        color: wireColor,
        wireframe: true,
        transparent: true,
        opacity: 0.38
      });
      const wireMesh = new THREE.Mesh(coreGeo, wireMat);
      masterGroup.add(wireMesh);

      // 2. Vertex Nodes (Neural Singularity Points)
      const pointGeo = new THREE.BufferGeometry();
      const posAttr = coreGeo.attributes.position;
      pointGeo.setAttribute('position', posAttr);
      const pointMat = new THREE.PointsMaterial({
        color: limeGlow,
        size: isMobile ? 0.08 : 0.12,
        transparent: true,
        opacity: 0.95
      });
      const vertexPoints = new THREE.Points(pointGeo, pointMat);
      masterGroup.add(vertexPoints);

      // 3. Gyroscopic Orbital Gimbal Rings
      // Ring A — Equator tilt
      const ringAGeo = new THREE.TorusGeometry(isMobile ? 2.3 : 2.8, 0.018, 16, 120);
      const ringAMat = new THREE.MeshBasicMaterial({
        color: limeColor,
        transparent: true,
        opacity: 0.6
      });
      const ringA = new THREE.Mesh(ringAGeo, ringAMat);
      ringA.rotation.x = Math.PI / 3.2;
      masterGroup.add(ringA);

      // Ring B — Polar tilt
      const ringBGeo = new THREE.TorusGeometry(isMobile ? 2.55 : 3.1, 0.014, 16, 120);
      const ringBMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xf9fafb),
        transparent: true,
        opacity: 0.35
      });
      const ringB = new THREE.Mesh(ringBGeo, ringBMat);
      ringB.rotation.y = Math.PI / 3.6;
      masterGroup.add(ringB);

      // 4. Surrounding Neural Stardust Constellation
      const particleCount = isMobile ? 100 : 260;
      const particlePositions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount * 3; i += 3) {
        const radius = 2.8 + Math.random() * 3.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);

        particlePositions[i] = radius * Math.sin(phi) * Math.cos(theta);
        particlePositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        particlePositions[i + 2] = radius * Math.cos(phi);
      }

      const particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      const particleMat = new THREE.PointsMaterial({
        color: limeColor,
        size: isMobile ? 0.045 : 0.07,
        transparent: true,
        opacity: 0.75
      });
      const particleSystem = new THREE.Points(particleGeo, particleMat);
      masterGroup.add(particleSystem);

      // 5. Studio Lighting
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
      keyLight.position.set(5, 5, 5);
      scene.add(keyLight);

      const limeRimLight = new THREE.DirectionalLight(limeColor, 3.2);
      limeRimLight.position.set(-5, -4, -4);
      scene.add(limeRimLight);

      const ambientLight = new THREE.AmbientLight(0x11131c, 1.4);
      scene.add(ambientLight);

      // Animation Loop with Fluid Inertia
      let clock = new THREE.Clock();

      function animate() {
        requestAnimationFrame(animate);

        if (!isVisible) return;

        const time = clock.getElapsedTime();

        // Mouse smooth spring interpolation
        mouseX += (targetX - mouseX) * 0.045;
        mouseY += (targetY - mouseY) * 0.045;

        if (!isReducedMotion) {
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

          // Harmonic scale pulse
          const scale = 1 + Math.sin(time * 1.4) * 0.026;
          coreMesh.scale.set(scale, scale, scale);
          wireMesh.scale.set(scale, scale, scale);
          vertexPoints.scale.set(scale, scale, scale);
        }

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
        camera.position.z = isMobile ? 8.2 : 6.4;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 2));
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
      }, { passive: true });

      return;
    } catch (err) {
      console.warn('Three.js initialization fallback:', err);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 2D CANVAS FALLBACK
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

  const numNodes = isMobile ? 32 : 55;
  const nodes = [];
  for (let i = 0; i < numNodes; i++) {
    nodes.push({
      x: Math.random() * (W || 400),
      y: Math.random() * (H || 400),
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      radius: Math.random() * 2 + 1.2,
      color: Math.random() > 0.5 ? '#ccff00' : '#f9fafb'
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
        const maxDist = isMobile ? 85 : 125;

        if (dist < maxDist) {
          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.strokeStyle = `rgba(204, 255, 0, ${(1 - dist / maxDist) * 0.35})`;
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
