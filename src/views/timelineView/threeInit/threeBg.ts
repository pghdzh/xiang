// threeInit/threeBg.ts
import * as THREE from 'three';

type Handle = { cleanup?: () => void };

export default function threeInit(containerRef: { value: HTMLElement | null }): Handle {
  const container = containerRef?.value;
  if (!container) {
    console.warn('threeInit: containerRef is empty');
    return {};
  }

  // ---------- 基本配置 ----------
  const DPR = Math.min(window.devicePixelRatio || 1, 1.8);
  const isMobile = Math.min(window.innerWidth, window.innerHeight) < 780;

  // Scene / Camera / Renderer
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04000a); // 深紫黑底

  const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 60);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(DPR);
  renderer.setSize(container.clientWidth, container.clientHeight, false);
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.inset = '0';
  renderer.domElement.style.zIndex = '0';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.appendChild(renderer.domElement);

  // Root group
  const root = new THREE.Group();
  scene.add(root);

  // ---------- 软点纹理（用于粒子） ----------
  function makeSoftDot(size = 128, inner = '#ffffff', outer = '#a978ff') {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, size, size);
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, inner);
    grad.addColorStop(0.45, outer);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    return tex;
  }

  const softDot = makeSoftDot(128, '#ffffff', '#b490ff');

  // ---------- 中央光晕（后向面 Shader） ----------
  const glowGeo = new THREE.SphereGeometry(10, 28, 28);
  const glowMat = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(0xc9a7ff) },
      uIntensity: { value: 0.8 }
    },
    vertexShader: `
      varying vec3 vNormal;
      void main(){
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      uniform vec3 uColor;
      uniform float uIntensity;
      void main(){
        float intensity = pow(1.0 - max(0.0, dot(vNormal, vec3(0.0,0.0,1.0))), 2.0);
        gl_FragColor = vec4(uColor * 0.9, intensity * uIntensity);
      }
    `,
    side: THREE.BackSide,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const glowMesh = new THREE.Mesh(glowGeo, glowMat);
  glowMesh.scale.set(1.5, 1.2, 1.5);
  root.add(glowMesh);

  // ---------- 能量丝带（ribbons） ----------
  const ribbonCount = isMobile ? 2 : 4;
  const ribbons: THREE.Mesh[] = [];

  const ribbonVS = `
    uniform float uTime;
    uniform float uOffset;
    varying float vAlpha;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec3 p = position;
      float freq = 1.8;
      float amp = 2.2;
      float wave = sin((p.x * 0.12 + uTime * 0.6) * freq + uOffset) * amp * (0.8 + 0.6 * (1.0 - abs(p.y)));
      p.z += wave * (0.8 + 0.4 * sin(uTime * 0.5 + uOffset));
      float taper = smoothstep(1.0, 0.0, abs(p.x) / 40.0);
      p.y *= 0.85 + 0.3 * (1.0 - abs(p.x) / 60.0);
      vAlpha = 0.5 * taper * (0.7 + 0.3 * sin(uTime * 0.4 + uOffset));
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
  `;

  const ribbonFS = `
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    varying float vAlpha;
    varying vec2 vUv;
    void main() {
      vec3 col = mix(uColorA, uColorB, smoothstep(0.0,1.0,vUv.y));
      float alpha = vAlpha * (1.0 - smoothstep(0.9,1.0,vUv.y));
      gl_FragColor = vec4(col, alpha);
    }
  `;

  for (let i = 0; i < ribbonCount; i++) {
    const width = 80;
    const height = 10 + i * 4;
    const segX = 120;
    const segY = 2;
    const plane = new THREE.PlaneGeometry(width, height, segX, segY); // PlaneGeometry for compatibility
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOffset: { value: i * 0.8 },
        uColorA: { value: new THREE.Color(0xceb0ff) },
        uColorB: { value: new THREE.Color(0x7b5cff) }
      },
      vertexShader: ribbonVS,
      fragmentShader: ribbonFS,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(plane, mat);
    mesh.position.x = (i - (ribbonCount - 1) / 2) * 6;
    mesh.position.y = (i - (ribbonCount - 1) / 2) * 3;
    mesh.rotation.z = (i % 2 === 0 ? -1 : 1) * 0.15;
    mesh.renderOrder = 1;
    root.add(mesh);
    ribbons.push(mesh);
  }

  // ---------- 细碎光尘（particles） ----------
  const particleBase = Math.floor((container.clientWidth * container.clientHeight) / 12000);
  const particleCount = isMobile ? Math.max(200, Math.floor(particleBase * 0.25)) : Math.max(800, particleBase);

  const pos = new Float32Array(particleCount * 3);
  const asz = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    pos[i * 3] = (Math.random() * 2 - 1) * 80;
    pos[i * 3 + 1] = (Math.random() * 2 - 1) * 48;
    pos[i * 3 + 2] = (Math.random() * 2 - 1) * 40;
    asz[i] = Math.random() * (isMobile ? 0.6 : 1.4) + 0.2;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  particleGeo.setAttribute('aSize', new THREE.BufferAttribute(asz, 1));

  const particleMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uTex: { value: softDot },
      uPixelRatio: { value: DPR }
    },
    vertexShader: `
      attribute float aSize;
      uniform float uTime;
      uniform float uPixelRatio;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        float t = uTime * 0.6 + position.x * 0.02;
        p.y += sin(t + position.z * 0.05) * 0.6;
        gl_PointSize = aSize * (uPixelRatio * 2.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        float depth = gl_Position.z / 200.0;
        vAlpha = 1.0 - clamp(abs(depth), 0.0, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uTex;
      varying float vAlpha;
      void main() {
        vec4 t = texture2D(uTex, gl_PointCoord);
        float alpha = t.a * vAlpha;
        vec3 tint = vec3(0.78, 0.5, 1.0);
        vec3 col = tint * t.rgb;
        gl_FragColor = vec4(col, alpha);
        if (gl_FragColor.a < 0.01) discard;
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  root.add(particles);

  // ---------- 交互：视差（鼠标/触控） ----------
  let pointerX = 0;
  let pointerY = 0;
  let smoothX = 0;
  let smoothY = 0;

  function handlePointer(ev: PointerEvent | TouchEvent) {
    let x = 0;
    let y = 0;
    if ('touches' in ev && ev.touches.length > 0) {
      x = ev.touches[0].clientX;
      y = ev.touches[0].clientY;
    } else if ('clientX' in ev) {
      x = (ev as PointerEvent).clientX;
      y = (ev as PointerEvent).clientY;
    }
    pointerX = (x / window.innerWidth) * 2 - 1;
    pointerY = (y / window.innerHeight) * 2 - 1;
  }

  window.addEventListener('mousemove', handlePointer, { passive: true });
  window.addEventListener('touchmove', handlePointer, { passive: true });

  // ---------- 动画循环 ----------
  let rafId = 0;
  const clock = new THREE.Clock();
  let visible = true;

  function onVisibilityChange() {
    visible = document.visibilityState === 'visible';
  }

  document.addEventListener('visibilitychange', onVisibilityChange);

  function renderLoop() {
    rafId = requestAnimationFrame(renderLoop);
    if (!visible) return;

    const t = clock.getElapsedTime();

    smoothX += (pointerX - smoothX) * 0.06;
    smoothY += (pointerY - smoothY) * 0.06;

    camera.position.x = smoothX * 6;
    camera.position.y = -smoothY * 3;
    camera.lookAt(0, 0, 0);

    ribbons.forEach((r, idx) => {
      const mat = r.material as THREE.ShaderMaterial;
      mat.uniforms.uTime.value = t * (0.9 + idx * 0.08);
      r.rotation.z = Math.sin(t * 0.12 + idx) * 0.06;
    });

    const glowIntensity = 0.6 + Math.sin(t * 0.9) * 0.12;
    (glowMat.uniforms.uIntensity as { value: number }).value = glowIntensity;

    (particleMat.uniforms.uTime as { value: number }).value = t;

    root.rotation.y += 0.002;
    root.rotation.x += 0.0006;

    renderer.render(scene, camera);
  }

  rafId = requestAnimationFrame(renderLoop);

  // ---------- Resize 支持 ----------
  function handleResize() {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    (particleMat.uniforms.uPixelRatio as { value: number }).value = DPR;
  }

  const ro = new ResizeObserver(handleResize);
  ro.observe(container);
  window.addEventListener('resize', handleResize);

  // ---------- Cleanup ----------
  function cleanup() {
    cancelAnimationFrame(rafId);
    ro.disconnect();
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('mousemove', handlePointer);
    window.removeEventListener('touchmove', handlePointer);
    document.removeEventListener('visibilitychange', onVisibilityChange);

    try {
      scene.traverse((obj) => {
        // dispose geometries & materials
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          if (mesh.geometry) {
            mesh.geometry.dispose();
          }
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else if (mesh.material) {
            mesh.material.dispose();
          }
        } else if ((obj as THREE.Points).isPoints) {
          const pts = obj as THREE.Points;
          if (pts.geometry) {
            pts.geometry.dispose();
          }
          if (pts.material) {
            pts.material.dispose();
          }
        }
      });

      // dispose custom textures / shader materials
      try {
        softDot.dispose();
      } catch (e) {
        // ignore
      }

      try {
        glowMat.dispose();
      } catch (e) {
        // ignore
      }

      try {
        particleMat.dispose();
      } catch (e) {
        // ignore
      }

      try {
        particleGeo.dispose();
      } catch (e) {
        // ignore
      }

      // renderer cleanup
      try {
        renderer.forceContextLoss();
      } catch (e) {
        // ignore
      }

      try {
        renderer.dispose();
      } catch (e) {
        // ignore
      }

      if (renderer.domElement && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    } catch (err) {
      // swallow cleanup errors
      // console.warn('three cleanup error', err);
    }
  }

  return { cleanup };
}
