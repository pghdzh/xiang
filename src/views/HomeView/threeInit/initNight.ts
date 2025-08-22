// three-bg.ts  (可直接替换原文件内容)
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

type CleanupFn = () => void;

/**
 * threeRef: Vue ref 指向容器 DOM 元素（threeRef.value）
 * 返回：{ cleanup }  在组件卸载时调用 cleanup() 清理资源
 */
export default (threeRef: any) => {
  const dom = threeRef.value as HTMLElement;
  if (!dom) {
    console.warn('threeRef.value 为空');
    return { cleanup: () => {} };
  }

  // ---------- 1. 初始化 renderer/scene/camera/controls ----------
  let width = dom.clientWidth;
  let height = dom.clientHeight;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x160016);

  const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
  camera.position.set(0, 4, 21);

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height);
  dom.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;

  // ---------- 2. CanvasTexture 生成星尘精灵 ----------
  function createStarTexture(size = 128) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    // 清背景透明
    ctx.clearRect(0, 0, size, size);

    // 中心径向渐变（可根据需要调色）
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0.0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(220,180,255,0.9)');
    g.addColorStop(0.5, 'rgba(150,100,255,0.6)');
    g.addColorStop(1.0, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);

    // 可选：轻微高光
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    ctx.arc(size * 0.62, size * 0.38, size * 0.08, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false; // 小纹理可关
    tex.needsUpdate = true;

    return { tex, canvas };
  }

  const { tex: pointTexture, canvas: textureCanvas } = createStarTexture(128);

  // ---------- 3. 根据设备能力估算点数 ----------
  function estimateParticleCount() {
    const ua = navigator.userAgent || '';
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
    const cores = (navigator as any).hardwareConcurrency || 4;
    const deviceMem = (navigator as any).deviceMemory || 4; // GB, 不一定存在

    // 基本策略（经验值，可按需调整）
    if (isMobile) {
      // 移动设备：更低
      if (deviceMem <= 1) return 8000;
      if (deviceMem <= 2) return 14000;
      if (deviceMem <= 4) return 24000;
      return 32000;
    } else {
      // 桌面：根据并发和内存分级
      if (deviceMem <= 2 || cores <= 2) return 35000;
      if (deviceMem <= 4 || cores <= 4) return 70000;
      return 110000; // 高性能桌面
    }
  }

  const PARTICLE_COUNT = estimateParticleCount();

  // ---------- 4. 构造 BufferGeometry（TypedArray） ----------
  const count = PARTICLE_COUNT;
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const shifts = new Float32Array(count * 4);

  // 填充点分布（结合球面与环带分布，避免过多 GC）
  for (let i = 0; i < count; i++) {
    // 33% 球面云，67% 圆环带
    if (i < count * 0.33) {
      // 随机球面点（均匀性不要求极致）
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = (Math.random() * 0.5 + 9.5);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 0] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    } else {
      // 圆柱/圆环带分布
      const rand = Math.pow(Math.random(), 1.5);
      const rSmall = 10; const rLarge = 40;
      const radius = Math.sqrt(rLarge * rLarge * rand + (1 - rand) * rSmall * rSmall);
      const ang = Math.random() * Math.PI * 2;
      positions[i * 3 + 0] = radius * Math.cos(ang);
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 2] = radius * Math.sin(ang);
    }

    sizes[i] = Math.random() * 1.6 + 0.6; // 基础随机尺寸

    // shift 四维：x, y, zspeedFactor, weight
    shifts[i * 4 + 0] = Math.random() * Math.PI;
    shifts[i * 4 + 1] = Math.random() * Math.PI * 2;
    shifts[i * 4 + 2] = (Math.random() * 0.9 + 0.1) * Math.PI * 0.1;
    shifts[i * 4 + 3] = Math.random() * 0.9 + 0.1;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('sizes', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('shift', new THREE.BufferAttribute(shifts, 4));
  geometry.computeBoundingSphere();

  // ---------- 5. PointsMaterial + onBeforeCompile （使用 pointTexture） ----------
  const material = new THREE.PointsMaterial({
    size: 0.14,
    map: pointTexture,
    transparent: true,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    alphaTest: 0.001,
    // vertexColors: false
  });

  // uniform 容器
  const uniforms: any = { time: { value: 0 }, pointTexture: { value: pointTexture } };

  // 注入 shader 修改（在 vertex 上做位移）：
  material.onBeforeCompile = (shader) => {
    // 合并 uniforms（确保 time 与纹理被绑定）
    shader.uniforms.time = uniforms.time;
    shader.uniforms.pointTexture = uniforms.pointTexture;

    // 注入头部声明（包含 PI2）
    shader.vertexShader = `
      uniform float time;
      attribute float sizes;
      attribute vec4 shift;
      varying vec3 vColor;
      const float PI2 = 6.28318530718;
    ` + shader.vertexShader;

    // 修改 gl_PointSize 对 sizes 生效
    shader.vertexShader = shader.vertexShader.replace(
      `gl_PointSize = size;`,
      `gl_PointSize = size * sizes;`
    );

    // 在 color 计算处注入颜色混合（基于 position 距离）
    shader.vertexShader = shader.vertexShader.replace(
      `#include <color_vertex>`,
      `#include <color_vertex>
        float d = length(position / vec3(40.0, 10.0, 40.0));
        d = clamp(d, 0.0, 1.0);
        vColor = mix(vec3(227.0,155.0,0.0), vec3(100.0,50.0,255.0), d) / 255.0;`
    );

    // 在顶点变换部分加入运动
    shader.vertexShader = shader.vertexShader.replace(
      `#include <begin_vertex>`,
      `#include <begin_vertex>
        float t = time;
        float moveT = mod(shift.x + shift.z * t, PI2);
        float moveS = mod(shift.y + shift.z * t, PI2);
        transformed += vec3(cos(moveS) * sin(moveT), cos(moveT), sin(moveS) * sin(moveT)) * shift.w;
      `
    );

    // 用纹理采样来渲染片元（基于 pointTexture，乘以 vColor alpha）
    shader.fragmentShader = `
      uniform sampler2D pointTexture;
      varying vec3 vColor;
      void main() {
        vec4 tex = texture2D(pointTexture, gl_PointCoord);
        // 软边裁切（保留 alpha 乘以 tex.a）
        float alpha = tex.a;
        if (alpha < 0.02) discard;
        gl_FragColor = vec4(vColor, alpha);
      }
    `;
  };

  const points = new THREE.Points(geometry, material);
  points.rotation.order = 'ZYX';
  points.rotation.z = 0.2;
  scene.add(points);

  // ---------- 6. 渲染循环 / 时间 uniform ----------
  const clock = new THREE.Clock();

  function tick() {
    controls.update();
    const t = clock.getElapsedTime() * 0.5;
    uniforms.time.value = t * Math.PI;
    points.rotation.y = t * 0.05;
    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(tick);

  // ---------- 7. Resize 支持 ----------
  function handleResize() {
    width = dom.clientWidth;
    height = dom.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  }
  window.addEventListener('resize', handleResize);

  // ---------- 8. Cleanup（非常重要） ----------
  const cleanup: CleanupFn = () => {
    renderer.setAnimationLoop(null);
    window.removeEventListener('resize', handleResize);
    controls.dispose();

    // 从场景移除
    scene.remove(points);

    // 释放几何与材质与纹理
    geometry.dispose();
    material.dispose();
    pointTexture.dispose();

    // 移除 canvas DOM
    if (renderer.domElement && renderer.domElement.parentNode === dom) {
      dom.removeChild(renderer.domElement);
    }
    // 释放 renderer
    try { renderer.dispose(); } catch (e) { /* ignore */ }
  };

  // 返回 cleanup 给调用方
  return { cleanup };
};
