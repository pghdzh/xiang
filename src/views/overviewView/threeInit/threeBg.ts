// three-bg.ts
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

type CleanupFn = () => void;

/**
 * threeRef: Vue ref 指向容器 DOM 元素（threeRef.value）
 * 如果 threeRef.value 为空，会自动挂到 document.body
 * 返回 { cleanup }，在组件卸载时调用 cleanup() 清理资源
 */
export default (threeRef: any) => {
  const mountTarget = (threeRef && threeRef.value) || document.body;
  if (!mountTarget) {
    console.warn('three-bg: no mount target');
    return { cleanup: () => {} };
  }

  // 若已有旧 canvas（data-three-bg），移除避免重复
  try {
    const existing = mountTarget.querySelector && (mountTarget.querySelector('[data-three-bg]') as HTMLElement | null);
    if (existing) existing.remove();
  } catch (e) {}

  // 场景与相机
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2.6, 18);

  // 渲染器：alpha true 以便可叠加在任意背景上（你想要黑底可以让 body 背景黑或改为不透明）
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  // 限制 DPR，避免移动端过高
  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(DPR);
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.setClearColor(0x000000, 0); // 透明
  renderer.domElement.style.position = 'fixed';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.width = '100vw';
  renderer.domElement.style.height = '100vh';
  renderer.domElement.style.zIndex = '-9999';
  renderer.domElement.style.pointerEvents = 'none';
  renderer.domElement.setAttribute('data-three-bg', 'true');

  mountTarget.appendChild(renderer.domElement);

  // 输出编码 - 让颜色更稳定
  renderer.outputEncoding = THREE.sRGBEncoding;

  // Controls 只用于内部平滑（不允许用户交互）
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.autoRotate = false;

  // 轻量光源，保持色调
  const ambient = new THREE.AmbientLight(0xffffff, 0.45);
  scene.add(ambient);
  const dir = new THREE.DirectionalLight(0xffffff, 0.2);
  dir.position.set(4, 8, 6);
  scene.add(dir);

  // 设备/偏好判断（影响数量）
  const ua = navigator.userAgent || '';
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
  const deviceMem = (navigator as any).deviceMemory || 4;
  const cores = (navigator as any).hardwareConcurrency || 4;
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 数量策略（移动端更低）
  const BASE_PARTICLES = isMobile ? 800 : (deviceMem <= 2 ? 1800 : 3800);
  const PARTICLES = prefersReduced ? Math.max(500, Math.floor(BASE_PARTICLES * 0.45)) : BASE_PARTICLES;

  // Seeded RNG（保证每次启动外观稳定，避免刷新色差）
  function mulberry32(seed: number) {
    return function() {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = mulberry32(1234567);

  // ---------- 背景 Quad（宇宙/深色） ----------
  const quadGeo = new THREE.PlaneGeometry(2, 2);
  const quadMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    },
    vertexShader: `
      varying vec2 vUv;
      void main(){
        vUv = uv;
        gl_Position = vec4(position,1.0);
      }
    `,
    fragmentShader: `
      precision mediump float;
      varying vec2 vUv;
      uniform float u_time;

      // 深空渐变：黑 -> 深蓝 -> 暗紫（优雅且不抢镜）
      void main() {
        vec2 uv = vUv;
        float y = uv.y;
        vec3 black = vec3(0.02,0.02,0.03);
        vec3 deepBlue = vec3(0.03,0.07,0.16);
        vec3 deepPurple = vec3(0.06,0.03,0.12);
        vec3 col = mix(black, deepBlue, smoothstep(0.0, 0.7, y));
        col = mix(col, deepPurple, pow(1.0 - (uv.x-0.5)*(uv.x-0.5)*2.0, 0.9));
        // 星云光斑（缓慢移动）
        float t = u_time * 0.06;
        float n = exp(-6.0 * ((uv.x - 0.45 - 0.06*sin(t))*(uv.x - 0.45 - 0.06*sin(t)) + (uv.y - 0.6 + 0.04*cos(t))*(uv.y - 0.6 + 0.04*cos(t))));
        vec3 neb = vec3(0.5,0.35,0.9) * n * 0.18;
        // 总体混合，降低强度以免遮盖内容
        vec3 final = col + neb;
        final = mix(vec3(0.02,0.02,0.03), final, 0.95);
        gl_FragColor = vec4(final, 0.96);
      }
    `
  });
  const quad = new THREE.Mesh(quadGeo, quadMat);
  quad.frustumCulled = false;
  scene.add(quad);

  // ---------- 星尘（Points） ----------
  // 生成小圆点纹理
  function makeStarTexture(sz = 64) {
    const c = document.createElement('canvas');
    c.width = c.height = sz;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0,0,sz,sz);
    const g = ctx.createRadialGradient(sz/2, sz/2, 0, sz/2, sz/2, sz/2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.3, 'rgba(220,200,255,0.92)');
    g.addColorStop(0.7, 'rgba(160,120,255,0.55)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,sz,sz);
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    ctx.arc(sz*0.6, sz*0.35, sz*0.05, 0, Math.PI*2);
    ctx.fill();
    const tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }
  const starTex = makeStarTexture(isMobile ? 40 : 96);

  // BufferGeometry 属性
  const pGeo = new THREE.BufferGeometry();
  const count = Math.max(6, Math.floor(PARTICLES));
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const r = 8 + rand() * 42;
    const ang = rand() * Math.PI * 2;
    positions[i*3 + 0] = Math.cos(ang) * r * (0.6 + rand() * 0.8);
    positions[i*3 + 1] = (rand() - 0.5) * 6.0;
    positions[i*3 + 2] = Math.sin(ang) * r * (0.6 + rand() * 0.8);
    sizes[i] = 0.7 + rand() * 1.6;
    phases[i] = rand() * Math.PI * 2;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute('a_size', new THREE.BufferAttribute(sizes, 1));
  pGeo.setAttribute('a_phase', new THREE.BufferAttribute(phases, 1));

  // ShaderMaterial 控制深度衰减 & 色彩
  const starMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      u_time: { value: 0 },
      u_point: { value: starTex },
      u_camZ: { value: camera.position.z }
    },
    vertexShader: `
      attribute float a_size;
      attribute float a_phase;
      uniform float u_time;
      varying float vPhase;
      varying float vDepth;
      void main() {
        vPhase = a_phase;
        vec3 transformed = position;
        float t = u_time * 0.42;
        transformed.x += 0.45 * sin(a_phase + t * 0.28);
        transformed.y += 0.38 * cos(a_phase * 0.7 + t * 0.36);
        transformed.z += 0.48 * sin(a_phase * 0.5 + t * 0.22);
        vec4 mv = modelViewMatrix * vec4(transformed, 1.0);
        float psize = a_size * (140.0 / -mv.z);
        gl_PointSize = clamp(psize, 1.0, 38.0);
        gl_Position = projectionMatrix * mv;
        vDepth = -mv.z;
      }
    `,
    fragmentShader: `
      uniform sampler2D u_point;
      varying float vPhase;
      varying float vDepth;
      void main() {
        vec4 tex = texture2D(u_point, gl_PointCoord);
        float depthFactor = smoothstep(0.0, 50.0, vDepth);
        float alpha = tex.a * (1.0 - depthFactor * 0.6);
        if (alpha < 0.02) discard;
        float hueMix = 0.5 + 0.5 * sin(vPhase * 1.2);
        vec3 color = mix(vec3(0.9,0.85,1.0), vec3(0.7,0.95,1.0), hueMix);
        // 微弱蓝紫色调并稍微降低亮度，避免抢眼
        color *= 0.9;
        gl_FragColor = vec4(color, alpha * 0.94);
      }
    `
  });

  const stars = new THREE.Points(pGeo, starMat);
  scene.add(stars);

  // ---------- 交互（视差） ----------
  let tx = 0, ty = 0, cx = 0, cy = 0;
  function onPointer(e: PointerEvent) {
    const rect = renderer.domElement.getBoundingClientRect();
    tx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    ty = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }
  // 移动端不启用 pointer 视差（或启用时幅度更小）
  if (!prefersReduced && !isMobile) {
    window.addEventListener('pointermove', onPointer, { passive: true });
  }

  // 初始渲染（确保首帧稳定）
  quadMat.uniforms.u_time.value = 0;
  starMat.uniforms.u_time.value = 0;
  renderer.render(scene, camera);

  // ---------- 动画循环 ----------
  const clock = new THREE.Clock();
  let rafId: number | null = null;
  function animate() {
    const t = clock.getElapsedTime();
    cx += (tx - cx) * 0.06;
    cy += (ty - cy) * 0.06;

    // 摄像机微调，产生非常细微的视差
    camera.position.x += (cx * (isMobile ? 0.6 : 1.2) - camera.position.x) * 0.06;
    camera.position.y += (cy * (isMobile ? 0.3 : 0.6) + 2.6 - camera.position.y) * 0.06;
    camera.lookAt(0, 0.6, 0);

    quadMat.uniforms.u_time.value = t;
    quadMat.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
    starMat.uniforms.u_time.value = t;
    starMat.uniforms.u_camZ.value = camera.position.z;

    // 轻微旋转整个星层
    stars.rotation.y = t * 0.01 * (isMobile ? 0.6 : 1.0);

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(animate);
  }
  rafId = requestAnimationFrame(animate);

  // ---------- resize ----------
  function onResize() {
    const w = Math.max(1, window.innerWidth);
    const h = Math.max(1, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    quadMat.uniforms.u_resolution.value.set(w, h);
  }
  window.addEventListener('resize', onResize, { passive: true });

  // ---------- cleanup ----------
  const cleanup: CleanupFn = () => {
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener('resize', onResize);
    if (!prefersReduced && !isMobile) window.removeEventListener('pointermove', onPointer);

    try { scene.remove(stars); } catch (e) {}
    try { scene.remove(quad); } catch (e) {}

    try { pGeo.dispose(); } catch (e) {}
    try { starMat.dispose(); } catch (e) {}
    try { starTex.dispose(); } catch (e) {}
    try { quadGeo.dispose(); } catch (e) {}
    try { quadMat.dispose(); } catch (e) {}

    try { controls.dispose(); } catch (e) {}

    try { renderer.domElement && renderer.domElement.parentNode && renderer.domElement.parentNode.removeChild(renderer.domElement); } catch (e) {}
    try { renderer.dispose(); } catch (e) {}
  };

  return { cleanup };
};
