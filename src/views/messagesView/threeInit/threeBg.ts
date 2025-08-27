// threeTohkaBg.ts
import * as THREE from 'three';

type Handle = { cleanup?: () => void };
type Opts = {
  baseColor?: number; // 主题色
  enableLightShafts?: boolean;
  mobileMax?: number; // mobile 判定阈值 px
};

export default function threeTohkaBg(containerRef: { value: HTMLElement | null }, opts: Opts = {}): Handle {
  const container = containerRef?.value;
  if (!container) {
    console.warn('threeTohkaBg: no container');
    return {};
  }

  // ---------- 配置 ----------
  const BASE_COLOR = opts.baseColor ?? 0x8f59e6; // 紫色基调
  const ENABLE_SHAFTS = opts.enableLightShafts ?? true;
  const MOBILE_THRESHOLD = opts.mobileMax ?? 780;
  const DPR = Math.min(window.devicePixelRatio || 1, 1.6);
  const isMobile = Math.min(window.innerWidth, window.innerHeight) < MOBILE_THRESHOLD;

  // Scene / Camera / Renderer
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x06020b); // 深暗底色，给页面留对比

  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 90);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(DPR);
  renderer.setSize(container.clientWidth, container.clientHeight, false);
  // 不修改容器布局，仅确保 canvas 不拦截交互
  renderer.domElement.style.pointerEvents = 'none';
  renderer.domElement.style.display = 'block';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.appendChild(renderer.domElement);

  // Root group
  const root = new THREE.Group();
  scene.add(root);

  // ----------------- 工具：生成 sprite 贴图 -----------------
  function makePetalTexture(size = 128, fill = '#ffdfe8', edge = '#e8cfff') {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, size, size);

    // petal shape: use bezier to form simple petal
    ctx.translate(size / 2, size / 2);
    ctx.rotate(-0.3);
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.18);
    ctx.bezierCurveTo(size * 0.28, -size * 0.28, size * 0.28, size * 0.12, 0, size * 0.36);
    ctx.bezierCurveTo(-size * 0.28, size * 0.12, -size * 0.28, -size * 0.28, 0, -size * 0.18);
    ctx.closePath();

    // fill gradient
    const g = ctx.createLinearGradient(0, -size * 0.18, 0, size * 0.36);
    g.addColorStop(0, fill);
    g.addColorStop(1, edge);
    ctx.fillStyle = g;
    ctx.fill();

    // subtle highlight
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.ellipse(size * 0.08, -size * 0.02, size * 0.18, size * 0.28, -0.6, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }

  function makeSoftCircle(size = 128, inner = '#ffffff', outer = '#caa6ff') {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d')!;
    const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    grad.addColorStop(0, inner);
    grad.addColorStop(0.5, outer);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,size,size);
    const t = new THREE.CanvasTexture(c);
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.needsUpdate = true;
    return t;
  }

  const petalTex = makePetalTexture(128, '#ffdfe8', '#f0d8ff');
  const orbTex = makeSoftCircle(128, '#ffffff', '#caa6ff');

  // ----------------- 中央柔光球 -----------------
  const glowG = new THREE.SphereGeometry(10, 32, 32);
  const glowM = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(BASE_COLOR) }, uStrength: { value: 0.9 } },
    vertexShader: `
      varying vec3 vNormal;
      void main(){ vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      uniform vec3 uColor;
      uniform float uStrength;
      void main(){
        float i = pow(1.0 - max(0.0, dot(vNormal, vec3(0.,0.,1.))), 2.0);
        gl_FragColor = vec4(uColor * 0.92, i * uStrength);
      }
    `,
    transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false
  });
  const glow = new THREE.Mesh(glowG, glowM);
  glow.scale.set(1.8, 1.05, 1.8);
  glow.position.set(0, -6, -12);
  root.add(glow);

  // ----------------- 樱瓣群（使用 Points + sprite） -----------------
  const petalCount = isMobile ? 140 : 420;
  const petalPos = new Float32Array(petalCount * 3);
  const petalRot = new Float32Array(petalCount);
  const petalSpeed = new Float32Array(petalCount);

  for (let i = 0; i < petalCount; i++) {
    petalPos[i*3] = (Math.random() * 2 - 1) * 120;
    petalPos[i*3 + 1] = (Math.random() * 2 - 1) * 80;
    petalPos[i*3 + 2] = (Math.random() * 2 - 1) * 40;
    petalRot[i] = Math.random() * Math.PI * 2;
    petalSpeed[i] = 0.2 + Math.random() * 0.9;
  }

  const petalGeo = new THREE.BufferGeometry();
  petalGeo.setAttribute('position', new THREE.BufferAttribute(petalPos, 3));
  petalGeo.setAttribute('aRot', new THREE.BufferAttribute(petalRot, 1));
  petalGeo.setAttribute('aSpeed', new THREE.BufferAttribute(petalSpeed, 1));

  const petalMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uScale: { value: isMobile ? 0.6 : 1.0 }, uTex: { value: petalTex } },
    vertexShader: `
      attribute float aRot;
      attribute float aSpeed;
      uniform float uTime;
      uniform float uScale;
      varying float vAlpha;
      varying vec2 vUv;
      void main(){
        vec3 p = position;
        float t = uTime * aSpeed * 0.01 + position.x * 0.01;
        p.y -= fract(t) * 40.0 * (0.6 + 0.8 * aSpeed);
        float sway = sin(t * 2.0 + position.z * 0.3) * 6.0;
        p.x += sway;
        vAlpha = 0.7 * (0.8 + 0.2 * sin(uTime + aSpeed));
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (12.0 + aSpeed * 8.0) * (uScale * (300.0 / -mv.z));
      }
    `,
    fragmentShader: `
      uniform sampler2D uTex;
      varying float vAlpha;
      void main(){
        vec4 t = texture2D(uTex, gl_PointCoord);
        gl_FragColor = vec4(t.rgb, t.a * vAlpha);
        if (gl_FragColor.a < 0.02) discard;
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const petalPoints = new THREE.Points(petalGeo, petalMat);
  root.add(petalPoints);

  // ----------------- 漂浮小光斑（orbs） -----------------
  const orbCount = isMobile ? 30 : 80;
  const orbPos = new Float32Array(orbCount * 3);
  const orbSize = new Float32Array(orbCount);
  for (let i = 0; i < orbCount; i++) {
    orbPos[i*3] = (Math.random() * 2 - 1) * 90;
    orbPos[i*3 + 1] = (Math.random() * 2 - 1) * 60;
    orbPos[i*3 + 2] = (Math.random() * 2 - 1) * 30;
    orbSize[i] = 0.6 + Math.random() * 1.6;
  }
  const orbGeo = new THREE.BufferGeometry();
  orbGeo.setAttribute('position', new THREE.BufferAttribute(orbPos, 3));
  orbGeo.setAttribute('aSize', new THREE.BufferAttribute(orbSize, 1));

  const orbMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uTex: { value: orbTex }, uPixelRatio: { value: DPR } },
    vertexShader: `
      attribute float aSize;
      uniform float uTime;
      uniform float uPixelRatio;
      varying float vAlpha;
      void main(){
        vec3 p = position;
        float t = uTime * 0.6 + position.x * 0.02;
        p.y += sin(t + position.z * 0.05) * 2.0;
        gl_PointSize = aSize * (uPixelRatio * 10.0);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float depth = gl_Position.z / 100.0;
        vAlpha = 1.0 - clamp(abs(depth), 0.0, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uTex;
      varying float vAlpha;
      void main(){
        vec4 t = texture2D(uTex, gl_PointCoord);
        vec3 tint = vec3(0.9,0.75,1.0);
        gl_FragColor = vec4(tint * t.rgb, t.a * vAlpha * 0.9);
        if (gl_FragColor.a < 0.01) discard;
      }
    `,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
  });
  const orbs = new THREE.Points(orbGeo, orbMat);
  root.add(orbs);

  // ----------------- 轻薄光柱（若启用） -----------------
  const shafts: THREE.Mesh[] = [];
  if (ENABLE_SHAFTS && !isMobile) {
    const shaftVS = `
      uniform float uTime;
      varying vec2 vUv;
      void main(){
        vUv = uv;
        vec3 p = position;
        float f = sin(uTime * 0.4 + position.x * 0.06) * 2.0;
        p.y += f * (1.0 - abs(position.x) / 100.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `;
    const shaftFS = `
      varying vec2 vUv;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      void main(){
        float g = smoothstep(0.0, 0.6, 1.0 - abs(vUv.x - 0.5)*2.0);
        vec3 col = mix(uColorA, uColorB, vUv.y);
        float alpha = g * (1.0 - vUv.y) * 0.3;
        gl_FragColor = vec4(col, alpha);
      }
    `;
    for (let i = 0; i < 3; i++) {
      const plane = new THREE.PlaneGeometry(40, 140, 1, 1);
      const mat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uColorA: { value: new THREE.Color(0xfff6ff) }, uColorB: { value: new THREE.Color(BASE_COLOR) } },
        vertexShader: shaftVS, fragmentShader: shaftFS,
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(plane, mat);
      mesh.position.set((i - 1) * 36, -10, -18 - i * 2);
      mesh.rotation.z = (i - 1) * 0.08;
      mesh.renderOrder = 0;
      root.add(mesh);
      shafts.push(mesh);
    }
  }

  // ----------------- 交互：视差 -----------------
  let pointerX = 0, pointerY = 0;
  let smoothX = 0, smoothY = 0;
  function handlePointer(ev: PointerEvent | TouchEvent) {
    let x = 0, y = 0;
    if ('touches' in ev && ev.touches.length) {
      x = ev.touches[0].clientX; y = ev.touches[0].clientY;
    } else if ('clientX' in ev) {
      x = (ev as PointerEvent).clientX; y = (ev as PointerEvent).clientY;
    }
    pointerX = (x / window.innerWidth) * 2 - 1;
    pointerY = (y / window.innerHeight) * 2 - 1;
  }
  window.addEventListener('mousemove', handlePointer, { passive: true });
  window.addEventListener('touchmove', handlePointer, { passive: true });

  // ----------------- 动画 Loop -----------------
  const clock = new THREE.Clock();
  let raf = 0;
  let visible = true;
  function onVis() { visible = document.visibilityState === 'visible'; }
  document.addEventListener('visibilitychange', onVis);

  function animate() {
    raf = requestAnimationFrame(animate);
    if (!visible) return;

    const t = clock.getElapsedTime();
    smoothX += (pointerX - smoothX) * 0.06;
    smoothY += (pointerY - smoothY) * 0.06;

    // camera 微动
    camera.position.x = smoothX * 10;
    camera.position.y = -smoothY * 5;
    camera.lookAt(0, 0, 0);

    // petal update: 利用 uniform uTime（shader 内做位移），无需 CPU 更新位置
    (petalMat.uniforms.uTime as any).value = t;
    (petalMat.uniforms.uScale as any).value = isMobile ? 0.6 : 1.0;

    // orbs
    (orbMat.uniforms.uTime as any).value = t;

    // glow pulse
    (glowM.uniforms.uStrength as any).value = 0.7 + Math.sin(t * 1.2) * 0.18;

    // shafts
    shafts.forEach((s, idx) => {
      (s.material as any).uniforms.uTime.value = t * (0.6 + idx * 0.15);
      s.rotation.z = Math.sin(t * 0.12 + idx) * 0.02 + (idx - 1) * 0.06;
    });

    // root 微旋转让画面更灵动
    root.rotation.y += 0.0008;
    root.rotation.x += 0.00025;

    renderer.render(scene, camera);
  }
  animate();

  // ----------------- Resize 支持 -----------------
  function handleResize() {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    (orbMat.uniforms.uPixelRatio as any) && ((orbMat.uniforms.uPixelRatio as any).value = DPR);
  }
  const ro = new ResizeObserver(handleResize);
  ro.observe(container);
  window.addEventListener('resize', handleResize);

  // ----------------- Cleanup -----------------
  function cleanup() {
    cancelAnimationFrame(raf);
    ro.disconnect();
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('mousemove', handlePointer);
    window.removeEventListener('touchmove', handlePointer);
    document.removeEventListener('visibilitychange', onVis);

    try {
      scene.traverse((obj) => {
        if ((obj as any).isMesh || (obj as any).isPoints) {
          const o: any = obj;
          if (o.geometry) o.geometry.dispose();
          if (Array.isArray(o.material)) o.material.forEach((m: any) => m.dispose());
          else if (o.material) o.material.dispose();
        }
      });
      petalTex.dispose && petalTex.dispose();
      orbTex.dispose && orbTex.dispose();
      glowM.dispose && glowM.dispose();
      petalMat.dispose && petalMat.dispose();
      orbMat.dispose && orbMat.dispose();
    } catch (e) {
      // swallow
    }

    try { (renderer as any).forceContextLoss && (renderer as any).forceContextLoss(); } catch (e) {}
    renderer.dispose();
    if (renderer.domElement && renderer.domElement.parentNode === container) {
      container.removeChild(renderer.domElement);
    }
  }

  return { cleanup };
}
