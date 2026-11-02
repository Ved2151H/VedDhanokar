import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const mobile = () => window.matchMedia('(max-width: 768px)').matches;
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export class ProjectLabScene {
  constructor(canvas, projects) {
    this.canvas = canvas;
    this.projects = projects;
    this.isMobile = mobile();
    this.isReduced = reduced();
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.hovered = false;
    this.activeIndex = 0;
    this.prevIndex = null;
    this.transition = 1; // 0..1
    this.targetTransition = 1;
    this.mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    this.time = 0;
    this.raf = null;
    this.visible = true;
    this.onSelect = null;
    this.projectGroups = [];

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0a0a0b, 0.04);

    this.camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    this.camera.position.set(0, 0, 7);

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !this.isMobile });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2));
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    this.renderer.setClearColor(0x000000, 0);

    // Lights
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const dir = new THREE.DirectionalLight(0xffffff, 0.7);
    dir.position.set(4, 6, 5);
    this.scene.add(dir);
    const accent = new THREE.PointLight(0xd9a441, 1.0, 25);
    accent.position.set(0, 2, 4);
    this.scene.add(accent);
    this.accentLight = accent;

    // Subtle particles
    this.particles = this.createParticles();
    this.scene.add(this.particles);

    // Project environments (all at origin, visibility controlled by transition)
    this.projects.forEach((p, i) => {
      const group = this.createProjectEnvironment(i, p.id);
      group.visible = (i === 0);
      group.scale.setScalar(i === 0 ? 1 : 0.001);
      this.projectGroups.push(group);
      this.scene.add(group);
    });

    // Post processing
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    if (!this.isMobile) {
      const bloom = new UnrealBloomPass(new THREE.Vector2(canvas.clientWidth, canvas.clientHeight), 0.3, 0.4, 0.9);
      this.composer.addPass(bloom);
    }

    // Events
    this.onResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.onResize);
    this.handleResize();

    this.onMouseMove = (e) => {
      this.mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
      this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', this.onMouseMove);

    this.onClick = () => {
      if (this.onSelect) this.onSelect(this.activeIndex);
    };
    canvas.addEventListener('click', this.onClick);

    this.io = new IntersectionObserver((entries) => {
      this.visible = entries[0].isIntersecting;
      if (this.visible && !this.raf) this.loop();
    }, { threshold: 0 });
    this.io.observe(canvas);

    this.loop();
  }

  createParticles() {
    const count = this.isMobile ? 150 : 400;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i*3] = (Math.random() - 0.5) * 16;
      positions[i*3+1] = (Math.random() - 0.5) * 10;
      positions[i*3+2] = (Math.random() - 0.5) * 12 - 2;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.02, transparent: true, opacity: 0.3, sizeAttenuation: true });
    const pts = new THREE.Points(geo, mat);
    pts.userData.base = positions.slice();
    pts.userData.count = count;
    return pts;
  }

  // Helper to create a node (sphere)
  node(r = 0.12, color = 0xd9a441, emissive = 0.4) {
    return new THREE.Mesh(
      new THREE.SphereGeometry(r, 12, 12),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: emissive, metalness: 0.3, roughness: 0.5 })
    );
  }
  // Helper line
  line(a, b, color = 0xffffff, opacity = 0.2) {
    return new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity })
    );
  }

  createProjectEnvironment(index, id) {
    const group = new THREE.Group();
    group.userData.index = index;
    group.userData.id = id;

    if (id === 'multi-firm') {
      // Central database core
      const db = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.6, 24), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xd9a441, emissiveIntensity: 0.25, metalness: 0.5, roughness: 0.3, transparent: true, opacity: 0.9 }));
      db.rotation.x = Math.PI / 2;
      group.add(db);

      // Firm nodes (left and right)
      const firmGeo = new THREE.BoxGeometry(0.45, 0.45, 0.45);
      const firmMat = new THREE.MeshStandardMaterial({ color: 0xd9a441, emissive: 0xd9a441, emissiveIntensity: 0.35 });
      const firmA = new THREE.Mesh(firmGeo, firmMat.clone());
      firmA.position.set(-2.6, 0.6, 0);
      const firmB = new THREE.Mesh(firmGeo, firmMat.clone());
      firmB.position.set(2.6, -0.4, 0);
      group.add(firmA, firmB);

      // Connect firms to db
      group.add(this.line([-2.6,0.6,0], [0,0,0], 0xd9a441, 0.4));
      group.add(this.line([2.6,-0.4,0], [0,0,0], 0xd9a441, 0.4));

      // Staff/records nodes around each firm
      const subPositions = [[-3.6, 1.4, 0.5], [-3.2, -0.2, 0.8], [-2.0, 1.6, -0.5]];
      subPositions.forEach((pos) => {
        const n = this.node(0.1, 0xffffff, 0.2);
        n.position.set(...pos);
        group.add(n);
        group.add(this.line(pos, [-2.6, 0.6, 0], 0xffffff, 0.15));
      });
      const subPositionsB = [[3.6, 0.4, 0.5], [3.2, -1.2, 0.8], [2.0, 0.6, -0.5]];
      subPositionsB.forEach((pos) => {
        const n = this.node(0.1, 0xffffff, 0.2);
        n.position.set(...pos);
        group.add(n);
        group.add(this.line(pos, [2.6, -0.4, 0], 0xffffff, 0.15));
      });

      // Data packets
      group.userData.packets = [];
      const targets = [[-2.6,0.6,0],[2.6,-0.4,0]];
      for (let i = 0; i < 10; i++) {
        const pkt = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        pkt.position.set(0, 0, 0);
        const t = targets[i % targets.length];
        pkt.userData.target = new THREE.Vector3(...t);
        pkt.userData.progress = Math.random();
        group.add(pkt);
        group.userData.packets.push(pkt);
      }
    } else if (id === 'accident') {
      // Camera
      const camBody = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.5), new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.6, roughness: 0.3 }));
      camBody.position.set(-2.2, 0.8, 0);
      group.add(camBody);
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.25, 16), new THREE.MeshStandardMaterial({ color: 0x111, metalness: 0.8, roughness: 0.2 }));
      lens.rotation.x = Math.PI / 2;
      lens.position.set(-1.9, 0.8, 0);
      group.add(lens);

      // Detection frame
      const frame = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2), new THREE.MeshBasicMaterial({ color: 0xd9a441, transparent: true, opacity: 0.06, side: THREE.DoubleSide }));
      frame.position.set(1.2, 0, 0);
      group.add(frame);

      // Bounding boxes
      const boxMat = new THREE.LineBasicMaterial({ color: 0xd9a441 });
      const boxes = [[0.2, 0.3], [1.0, -0.2], [1.8, 0.1]];
      boxes.forEach(([x, y]) => {
        const b = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.6, 0.45, 0.01)), boxMat);
        b.position.set(x, y, 0.05);
        group.add(b);
      });

      // Tracking lines
      const trackMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 });
      for (let i = 0; i < 2; i++) {
        const pts = [];
        for (let j = 0; j < 5; j++) pts.push(new THREE.Vector3(0.2 + j*0.5, -0.4 + Math.sin(j + i)*0.3, 0));
        const track = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), trackMat);
        track.position.set(0.5, 0, 0);
        group.add(track);
      }

      // Alert indicator
      const alert = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), new THREE.MeshBasicMaterial({ color: 0xff4444 }));
      alert.position.set(2.6, 1.2, 0);
      group.add(alert);
      group.userData.alert = alert;
    } else if (id === 'zero-ui') {
      // Phone
      const phone = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, 0.08), new THREE.MeshStandardMaterial({ color: 0x111, metalness: 0.4, roughness: 0.5 }));
      group.add(phone);
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 1.05), new THREE.MeshBasicMaterial({ color: 0xd9a441, transparent: true, opacity: 0.15 }));
      screen.position.set(0, 0, 0.05);
      group.add(screen);

      // Sensor waves
      group.userData.waves = [];
      for (let i = 0; i < 3; i++) {
        const wave = new THREE.Mesh(new THREE.TorusGeometry(0.5 + i*0.3, 0.012, 8, 48), new THREE.MeshBasicMaterial({ color: 0xd9a441, transparent: true, opacity: 0.4 - i*0.1 }));
        wave.rotation.x = Math.PI / 2;
        group.add(wave);
        group.userData.waves.push(wave);
      }
      // GPS ring
      const gps = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.01, 8, 64), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12 }));
      gps.rotation.x = Math.PI / 2;
      group.add(gps);
      group.userData.gps = gps;
    } else if (id === 'ecommerce') {
      // Product boxes
      const boxGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
      const boxMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.3, roughness: 0.5, transparent: true, opacity: 0.85 });
      const positions = [[-1.2, 0.6, 0.3], [0, 0.8, -0.2], [1.2, 0.6, 0.3], [-0.6, -0.5, 0.1], [0.6, -0.5, -0.1]];
      positions.forEach((pos) => {
        const m = new THREE.Mesh(boxGeo, boxMat.clone());
        m.position.set(...pos);
        group.add(m);
      });
      // Cart
      const cart = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.5), new THREE.MeshStandardMaterial({ color: 0xd9a441, emissive: 0xd9a441, emissiveIntensity: 0.3 }));
      cart.position.set(0, -1.3, 0);
      group.add(cart);
      // DB node
      const dbNode = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.25 }));
      dbNode.position.set(0, 1.5, -0.4);
      group.add(dbNode);
      // API lines
      positions.forEach((pos) => {
        group.add(this.line(pos, [0, 1.5, -0.4], 0xffffff, 0.12));
      });
    } else if (id === 'documind') {
      // Document planes
      const docGeo = new THREE.PlaneGeometry(0.6, 0.8);
      const docMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
      for (let i = 0; i < 4; i++) {
        const doc = new THREE.Mesh(docGeo, docMat.clone());
        doc.position.set(-2.2 + i * 0.5, 0.4 + (i % 2) * 0.25, 0.3);
        doc.rotation.y = (Math.random() - 0.5) * 0.3;
        group.add(doc);
      }
      // AI core
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), new THREE.MeshStandardMaterial({ color: 0xd9a441, emissive: 0xd9a441, emissiveIntensity: 0.5, transparent: true, opacity: 0.85 }));
      core.position.set(1.8, 0, 0);
      group.add(core);
      group.userData.aiCore = core;
      // vector points
      const vecGeo = new THREE.BufferGeometry();
      const vecPos = new Float32Array(50 * 3);
      for (let i = 0; i < 50; i++) {
        vecPos[i*3] = 1.8 + (Math.random()-0.5)*1.3;
        vecPos[i*3+1] = (Math.random()-0.5)*1.3;
        vecPos[i*3+2] = (Math.random()-0.5)*1.3;
      }
      vecGeo.setAttribute('position', new THREE.BufferAttribute(vecPos, 3));
      const vecPts = new THREE.Points(vecGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.04, transparent: true, opacity: 0.6 }));
      group.add(vecPts);
      // connection lines
      for (let i = 0; i < 4; i++) {
        group.add(this.line([-2.2 + i*0.5, 0.4 + (i%2)*0.25, 0.3], [1.8, 0, 0], 0xffffff, 0.1));
      }
    }

    return group;
  }

  handleResize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (w === 0 || h === 0) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h);
  }

  setActive(index) {
    if (index === this.activeIndex) return;
    this.prevIndex = this.activeIndex;
    this.activeIndex = index;
    this.transition = 0;
    this.targetTransition = 1;
    // show new group
    const g = this.projectGroups[index];
    if (g) { g.visible = true; g.scale.setScalar(0.001); }
  }

  zoomTo() {} // no-op: detail view handled by HTML
  resetCamera() {}

  loop = () => {
    if (!this.visible) { this.raf = null; return; }
    this.raf = requestAnimationFrame(this.loop);
    this.time += 0.016;

    // mouse lerp
    this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.05;

    // transition animation
    if (this.transition < this.targetTransition) {
      this.transition = Math.min(this.targetTransition, this.transition + 0.025);
    }
    const t = this.isReduced ? 1 : this.transition;
    const ease = t * t * (3 - 2 * t); // smoothstep

    // update group visibility/scale
    this.projectGroups.forEach((g, i) => {
      if (i === this.activeIndex) {
        g.visible = true;
        const s = this.isReduced ? 1 : 0.3 + ease * 0.7;
        g.scale.setScalar(s);
        g.position.x = (1 - ease) * 0; // stays centered
        // subtle mouse parallax
        g.rotation.y = this.mouse.x * 0.15;
        g.rotation.x = -this.mouse.y * 0.1;
      } else if (i === this.prevIndex && this.transition < 1) {
        g.visible = true;
        const s = 1 - ease;
        g.scale.setScalar(Math.max(0.001, s));
        g.rotation.y = this.mouse.x * 0.15;
      } else {
        g.visible = false;
        g.scale.setScalar(0.001);
      }
    });

    // camera subtle mouse parallax
    this.camera.position.x += (this.mouse.x * 0.3 - this.camera.position.x) * 0.05;
    this.camera.position.y += (-this.mouse.y * 0.2 - this.camera.position.y) * 0.05;
    this.camera.position.z = 7;
    this.camera.lookAt(0, 0, 0);

    // animate active project internals
    const active = this.projectGroups[this.activeIndex];
    if (active && !this.isReduced) {
      // multi-firm packets
      if (active.userData.packets) {
        active.userData.packets.forEach((pkt) => {
          pkt.userData.progress += 0.01;
          if (pkt.userData.progress >= 1) pkt.userData.progress = 0;
          const t2 = pkt.userData.progress;
          const target = pkt.userData.target;
          pkt.position.set(target.x * t2, target.y * t2, target.z * t2);
        });
      }
      // zero-ui waves
      if (active.userData.waves) {
        active.userData.waves.forEach((wave, i) => {
          const s = 1 + Math.sin(this.time * 2 + i) * 0.12;
          wave.scale.setScalar(s);
        });
      }
      if (active.userData.gps) {
        active.userData.gps.rotation.z += 0.008;
      }
      // accident alert pulse
      if (active.userData.alert) {
        const s = 1 + Math.sin(this.time * 4) * 0.2;
        active.userData.alert.scale.setScalar(s);
      }
      // documind core pulse
      if (active.userData.aiCore) {
        const c = active.userData.aiCore;
        const s = 1 + Math.sin(this.time * 2) * 0.06;
        c.scale.setScalar(s);
      }
    }

    // particles drift
    const pos = this.particles.geometry.attributes.position;
    const base = this.particles.userData.base;
    const count = this.particles.userData.count;
    for (let i = 0; i < count; i++) {
      pos.array[i*3+1] = base[i*3+1] + Math.sin(this.time * 0.2 + i) * 0.08;
    }
    pos.needsUpdate = true;

    this.accentLight.position.x = Math.sin(this.time * 0.4) * 1.5;

    this.composer.render();
  };

  destroy() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('click', this.onClick);
    this.io.disconnect();
    this.scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        if (Array.isArray(o.material)) o.material.forEach(m => m.dispose());
        else o.material.dispose();
      }
    });
    this.renderer.dispose();
    this.composer.dispose();
  }
}
