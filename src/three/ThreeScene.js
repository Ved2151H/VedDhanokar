import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export class ThreeScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.mobile = isMobile();
    this.reduced = reduceMotion();
    this.particleCount = this.mobile ? 400 : 1400;
    this.nodeCount = this.mobile ? 18 : 42;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0a0a0b, 0.06);

    this.camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    this.camera.position.set(0, 0, 6);

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !this.mobile });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.mobile ? 1.5 : 2));
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    this.renderer.setClearColor(0x000000, 0);

    // Lights
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(3, 4, 5);
    this.scene.add(dir);
    const point = new THREE.PointLight(0xd9a441, 0.8, 20);
    point.position.set(-3, 2, 4);
    this.scene.add(point);

    // Groups
    this.particles = this.createParticles();
    this.scene.add(this.particles);
    this.neural = this.createNeural();
    this.scene.add(this.neural);
    this.floaters = this.createFloaters();
    this.scene.add(this.floaters);

    // Post processing
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    if (!this.mobile) {
      const bloom = new UnrealBloomPass(new THREE.Vector2(canvas.clientWidth, canvas.clientHeight), 0.6, 0.4, 0.85);
      this.composer.addPass(bloom);
    }

    // State
    this.mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    this.scroll = 0;
    this.targetScroll = 0;
    this.camPos = this.camera.position.clone();
    this.targetCam = new THREE.Vector3(0, 0, 6);
    this.time = 0;
    this.raf = null;
    this.visible = true;

    this.onResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.onResize);
    this.handleResize();

    this.onMouseMove = (e) => {
      this.mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', this.onMouseMove);

    this.onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      this.targetScroll = max > 0 ? window.scrollY / max : 0;
    };
    window.addEventListener('scroll', this.onScroll, { passive: true });
    this.onScroll();

    // Visibility
    this.io = new IntersectionObserver((entries) => {
      this.visible = entries[0].isIntersecting;
      if (this.visible && !this.raf) this.loop();
    }, { threshold: 0 });
    this.io.observe(canvas);

    this.loop();
  }

  createParticles() {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    const sizes = new Float32Array(this.particleCount);
    for (let i = 0; i < this.particleCount; i++) {
      positions[i*3] = (Math.random() - 0.5) * 18;
      positions[i*3+1] = (Math.random() - 0.5) * 12;
      positions[i*3+2] = (Math.random() - 0.5) * 14;
      sizes[i] = Math.random() * 1.5 + 0.5;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.04, transparent: true, opacity: 0.7, sizeAttenuation: true });
    const pts = new THREE.Points(geo, mat);
    pts.userData.base = positions.slice();
    return pts;
  }

  createNeural() {
    const group = new THREE.Group();
    const nodes = [];
    const nodeGeo = new THREE.SphereGeometry(0.06, 12, 12);
    const nodeMat = new THREE.MeshStandardMaterial({ color: 0xd9a441, emissive: 0xd9a441, emissiveIntensity: 0.6, metalness: 0.3, roughness: 0.4 });
    for (let i = 0; i < this.nodeCount; i++) {
      const m = new THREE.Mesh(nodeGeo, nodeMat);
      const r = 2.2 + Math.random() * 0.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      m.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta) * 0.6, r * Math.cos(phi));
      group.add(m);
      nodes.push(m);
    }
    // connections
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 });
    const lineGeo = new THREE.BufferGeometry();
    const linePositions = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() < 0.18) {
          linePositions.push(nodes[i].position.x, nodes[i].position.y, nodes[i].position.z);
          linePositions.push(nodes[j].position.x, nodes[j].position.y, nodes[j].position.z);
        }
      }
    }
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    group.add(lines);
    group.userData.nodes = nodes;
    return group;
  }

  createFloaters() {
    const group = new THREE.Group();
    const geo = new THREE.IcosahedronGeometry(0.4, 0);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.25 });
    for (let i = 0; i < 6; i++) {
      const m = new THREE.Mesh(geo, mat);
      m.position.set((Math.random()-0.5)*10, (Math.random()-0.5)*6, (Math.random()-0.5)*6 - 2);
      m.userData.speed = 0.2 + Math.random()*0.3;
      m.userData.offset = Math.random()*Math.PI*2;
      group.add(m);
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

  loop = () => {
    if (!this.visible) { this.raf = null; return; }
    this.raf = requestAnimationFrame(this.loop);
    this.time += 0.016;

    // mouse lerp
    this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.05;

    // scroll lerp
    this.scroll += (this.targetScroll - this.scroll) * 0.05;

    // camera target
    const s = this.scroll;
    this.targetCam.set(
      this.mouse.x * (this.reduced ? 0 : 0.6) + Math.sin(s * Math.PI) * 0.5,
      -this.mouse.y * (this.reduced ? 0 : 0.4) + (s - 0.5) * 0.6,
      6 - s * 9
    );
    this.camPos.lerp(this.targetCam, this.reduced ? 0.2 : 0.06);
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(0, 0, 0);

    // neural rotation
    if (!this.reduced) {
      this.neural.rotation.y += 0.002 + s * 0.003;
      this.neural.rotation.x = Math.sin(this.time * 0.3) * 0.15;
      this.neural.scale.setScalar(1 + s * 0.15);
    }

    // floaters
    this.floaters.children.forEach((m) => {
      if (this.reduced) return;
      m.rotation.x += 0.003 * m.userData.speed;
      m.rotation.y += 0.004 * m.userData.speed;
      m.position.y += Math.sin(this.time + m.userData.offset) * 0.002;
    });

    // particles drift
    const pos = this.particles.geometry.attributes.position;
    const base = this.particles.userData.base;
    for (let i = 0; i < this.particleCount; i++) {
      pos.array[i*3+1] = base[i*3+1] + Math.sin(this.time * 0.3 + i) * 0.15;
      pos.array[i*3] = base[i*3] + Math.cos(this.time * 0.2 + i * 0.5) * 0.05;
    }
    pos.needsUpdate = true;

    this.composer.render();
  };

  destroy() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('scroll', this.onScroll);
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
