<template>
    <div class="tohka-page" role="main" aria-label="夜刀神 十香 人物概览">
        <!-- 背景光与装饰 -->
        <div class="bg-layer">
            <div class="orb orb--left" aria-hidden="true"></div>
            <div class="orb orb--right" aria-hidden="true"></div>
            <canvas ref="particleCanvas" class="particle-canvas" aria-hidden="true"></canvas>
        </div>

        <div class="bg-layer">
            <div class="orb orb--left" aria-hidden="true"></div>
            <div class="orb orb--right" aria-hidden="true"></div>
            <canvas ref="particleCanvas" class="particle-canvas" aria-hidden="true"></canvas>
        </div>

        <!-- Hero 区 -->
        <header class="hero">
            <div class="hero__content container">
                <div class="hero__badge">〈公主〉Princess</div>
                <h1 class="hero__title">
                    夜刀神 十香
                    <span>Yatogami Tohka</span>
                </h1>
                <p class="hero__subtitle">
                    剑之精灵 · 天使「鏖杀公（Sandalphon）」 · 灵装「神威灵装·十番（Adonai Melek）」
                </p>
                <div class="hero__tags" role="list">
                    <span role="listitem" class="chip">天然呆</span>
                    <span role="listitem" class="chip">吃货</span>
                    <span role="listitem" class="chip">战斗力强</span>
                    <span role="listitem" class="chip">纯真发展</span>
                </div>
            </div>
        </header>

        <!-- 主体内容 -->
        <div class="container main">

            <!-- 基础档案 -->
            <section class="panel panel--info" aria-labelledby="info-title">
                <h2 id="info-title" class="section-title">基础档案</h2>
                <ul class="info-grid">
                    <li class="info-item"><span class="k">中文名</span><span class="v">夜刀神 十香</span></li>
                    <li class="info-item"><span class="k">罗马音</span><span class="v">Yatogami Tohka</span></li>
                    <li class="info-item"><span class="k">生日</span><span class="v">4 月 10 日</span></li>
                    <li class="info-item"><span class="k">身高</span><span class="v">155 cm</span></li>
                    <li class="info-item"><span class="k">三围</span><span class="v">84 / 58 / 83 cm</span></li>
                    <li class="info-item"><span class="k">识别名</span><span class="v">〈公主〉Princess</span></li>
                    <li class="info-item"><span class="k">配音</span><span class="v">井上麻里奈</span></li>
                    <li class="info-item"><span class="k">等级</span><span
                            class="v">AAA-Class（Spirit），SS-Class（Inverse）</span></li>
                </ul>
            </section>

            <!-- 人物概述：详细性格、成长、背景 -->
            <section class="panel panel--profile" aria-labelledby="profile-title">
                <h2 id="profile-title" class="section-title">人物概述</h2>
                <div class="profile-grid">
                    <article class="profile-text">
                        <p class="lead">初登场时对人类冷漠且敌意满满，因多次被 AST
                            攻击。直到与士道第一次正式接触（同日命名）、第二次约会并被封印之吻打破防线后，逐渐解开心结，变得纯真可爱、善良乐观。</p>
                        <p>她对地球上的万物都十分好奇，生活常识欠缺，食量惊人，尤其爱吃黄豆粉面包（kinako bread）。也会因为不懂社交而被利用，常需要士道在身后引导。</p>
                        <p>她具有高度战斗直觉与判断力：在与折纸（Origami）战斗时能迅速适应并制定对策；她本能地依赖战斗经验成为少数清晰记得战斗的精灵之一。</p>
                        <div class="pill-list">
                            <span class="pill">纯真成长</span>
                            <span class="pill">食量惊人</span>
                            <span class="pill">情绪敏感</span>
                            <span class="pill">战斗直觉</span>
                        </div>
                    </article>

                    <figure class="profile-art">
                        <img src="@/assets/xiang.webp" alt="夜刀神 十香 精灵形态立绘" class="art-img" />
                        <figcaption class="art-caption">精灵形态立绘（请替换为正式素材）</figcaption>
                        <div class="art-gloss"></div>
                    </figure>
                </div>
            </section>

            <!-- 形象与装备解析 -->
            <section class="panel panel--design" aria-labelledby="design-title">
                <h2 id="design-title" class="section-title">造型与装备</h2>
                <ul class="design-list">
                    <li>
                        长至膝的深紫发用蝴蝶结轻束，搭配如水晶般的紫瞳，第一印象“美得宛如暴力” :contentReference[oaicite:3]{index=3}。
                    </li>
                    <li>
                        Astral Dress（神威灵装·十番）融合公主裙与铠甲，背部开口、裙摆渐变粉白，武装肩铠与护甲装饰整体既柔美又坚韧
                        :contentReference[oaicite:4]{index=4}。
                    </li>
                    <li>
                        Inverse（暴虐形态）时发色渐变紫白，眼瞳转为红紫，服装变得深紫更暴露，武装更具攻击性 :contentReference[oaicite:5]{index=5}。
                    </li>
                </ul>
            </section>

            <!-- 能力体系 -->
            <section class="panel panel--abilities" aria-labelledby="ability-title">
                <h2 id="ability-title" class="section-title">能力体系</h2>
                <div class="abilities-grid">
                    <div class="ability-card">
                        <div class="icon">⚔️</div>
                        <div class="meta">
                            <h3>天使「鏖杀公（Sandalphon）」 / Astral Dress</h3>
                            <p>座椅形态与巨剑合一，最终形态 Halvanhelev，可极大提升攻击力与破坏范围 :contentReference[oaicite:6]{index=6}。</p>
                        </div>
                    </div>
                    <div class="ability-card">
                        <div class="icon">💥</div>
                        <div class="meta">
                            <h3>战斗能力</h3>
                            <p>通过 Mana 增幅自身攻防，具备强力斩击、能量爆破与屏障。即使在被封印状态下，情绪激动时亦可临时恢复部分力量
                                :contentReference[oaicite:7]{index=7}。</p>
                        </div>
                    </div>
                    <div class="ability-card">
                        <div class="icon">🌑</div>
                        <div class="meta">
                            <h3>Inverse / 暴虐形态</h3>
                            <p>天使变为 Nahemah、武装变为 Paverschlev，更强攻击力但失去理智；直到士道之吻唤回记忆、恢复正常状态
                                :contentReference[oaicite:8]{index=8}。</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 珍珠美人设提示 -->
            <section class="panel panel--extra" aria-labelledby="extra-title">
                <h2 id="extra-title" class="section-title">其他情报</h2>
                <ul class="extra-list">
                    <li><strong>命名来历：</strong>士道为她命名“十香”，基于首次邂逅的日期（4 月 10 日）:contentReference[oaicite:9]{index=9}。</li>
                    <li><strong>感情线发展：</strong>第 12 卷中意识到自己对士道的爱，性格成熟度与情感表达明显提升:contentReference[oaicite:10]{index=10}。
                    </li>
                    <li><strong>双重人格：</strong>Inverse 又称
                        Tenka，在极端情绪中替代她出现；这也暗示多个灵装/形态并存的可能:contentReference[oaicite:11]{index=11}。</li>
                </ul>
            </section>
        </div>
    </div>
</template>

<script setup lang="ts">
// 简单加一点交互效果：图片视差（鼠标移动）、prefers-reduced-motion 检测
import { onMounted, ref, onBeforeUnmount } from 'vue';

const particleCanvas = ref < HTMLCanvasElement | null > (null);
let rafId: number | null = null;
let mouseX = 0;
let mouseY = 0;

function handlePointerMove(e: PointerEvent) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    const img = document.querySelector('.art-img') as HTMLElement | null;
    if (img && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const rect = img.getBoundingClientRect();
        const dx = (mouseX - (rect.left + rect.width / 2)) / rect.width;
        const dy = (mouseY - (rect.top + rect.height / 2)) / rect.height;
        img.style.transform = `translate(${dx * 6}px, ${dy * 6}px) scale(1.01)`;
    }
}

function resetImageTransform() {
    const img = document.querySelector('.art-img') as HTMLElement | null;
    if (img) img.style.transform = '';
}

// 简易粒子背景（轻量、仅美观）
// 注意：如果你不想用 canvas 可以移除以下代码块
function startParticles(canvas: HTMLCanvasElement) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight * 0.7;
    const particles: { x: number; y: number; r: number; vx: number; vy: number; alpha: number }[] = [];
    const N = Math.max(12, Math.floor((w * h) / 100000));
    for (let i = 0; i < N; i++) {
        particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: 1 + Math.random() * 2.5,
            vx: (Math.random() - 0.5) * 0.1,
            vy: -0.05 - Math.random() * 0.2,
            alpha: 0.08 + Math.random() * 0.12
        });
    }

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight * 0.7;
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);
        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.y < -10) {
                p.y = h + 10;
                p.x = Math.random() * w;
            }
            ctx.beginPath();
            ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        }
        rafId = requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    draw();

    return () => {
        window.removeEventListener('resize', resize);
        if (rafId) cancelAnimationFrame(rafId);
    };
}

let stopParticles: (() => void) | undefined;
onMounted(() => {
    // 鼠标移动视差
    window.addEventListener('pointermove', handlePointerMove);

    // 启动 canvas 粒子（受 prefers-reduced-motion 影响）
    const canvas = particleCanvas.value;
    if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        stopParticles = startParticles(canvas) as any;
    }
});

onBeforeUnmount(() => {
    window.removeEventListener('pointermove', handlePointerMove);
    resetImageTransform();
    if (stopParticles) stopParticles();
    if (rafId) cancelAnimationFrame(rafId);
});
</script>

<style scoped lang="scss">
// 变量与基础样式
:root {
    --bg: #0b0a12;
    --card: rgba(255, 255, 255, 0.06);
    --glass: rgba(255, 255, 255, 0.04);
    --text: #eef1ff;
    --muted: #b6b8d6;
    --accent: #8b5cf6; // 主紫
    --accent-2: #22d3ee; // 副青
    --radius: 14px;
    --shadow-strong: 0 18px 40px rgba(11, 10, 18, 0.6);
    --shadow-soft: 0 8px 18px rgba(11, 10, 18, 0.45);
    --glass-border: rgba(255, 255, 255, 0.12);
    --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
        "Noto Sans", "PingFang SC", "Hiragino Sans GB", "Microsoft Yahei", Arial, sans-serif;
}

* {
    box-sizing: border-box;
}

.tohka-page {
    min-height: 100vh;
    color: var(--text);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background:
        radial-gradient(800px 420px at 18% 6%, rgba(139, 92, 246, 0.18), transparent 45%),
        radial-gradient(600px 320px at 85% 12%, rgba(34, 211, 238, 0.10), transparent 40%),
        linear-gradient(180deg, #06050a 0%, var(--bg) 100%);
    position: relative;
    overflow-x: hidden;

    // 背景图层
    .bg-layer {
        position: absolute;
        inset: 0;
        pointer-events: none;

        .orb {
            position: absolute;
            width: 700px;
            height: 700px;
            filter: blur(60px);
            opacity: 0.9;
        }

        .orb--left {
            left: -18%;
            top: -12%;
            background: radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.26), rgba(139, 92, 246, 0.06) 40%, transparent 60%);
            transform: rotate(-12deg);
        }

        .orb--right {
            right: -12%;
            bottom: -6%;
            width: 520px;
            height: 520px;
            background: radial-gradient(circle at 70% 40%, rgba(34, 211, 238, 0.16), transparent 50%);
        }

        .particle-canvas {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 60vh;
            pointer-events: none;
            mix-blend-mode: screen;
            opacity: 0.7;
        }
    }
}

/* 容器 */
.container {
    max-width: 1120px;
    margin: 0 auto;
    padding: 28px 20px;
}

/* Hero */
.hero {
    padding: 56px 0 18px;

    .hero__content {
        text-align: center;

        .hero__badge {
            display: inline-block;
            padding: 6px 14px;
            border-radius: 999px;
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02));
            border: 1px solid rgba(255, 255, 255, 0.08);
            color: var(--text);
            font-weight: 600;
            letter-spacing: .06em;
            font-size: 12px;
            margin-bottom: 8px;
        }

        .hero__title {
            margin: 8px 0;
            font-size: clamp(28px, 4.6vw, 44px);
            font-weight: 800;
            line-height: 1.02;
            letter-spacing: -0.02em;

            span {
                display: block;
                font-size: 0.44em;
                color: var(--muted);
                font-weight: 500;
                margin-top: 6px;
            }
        }

        .hero__subtitle {
            color: var(--muted);
            margin: 8px 0 12px;
            font-size: 14px;
        }

        .hero__tags {
            margin-top: 8px;

            .chip {
                display: inline-block;
                padding: 6px 10px;
                margin: 6px 6px 0 0;
                font-size: 12px;
                border-radius: 999px;
                background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
                border: 1px solid rgba(255, 255, 255, 0.06);
            }
        }
    }
}

/* 主区网格 */
.main {
    display: grid;
    gap: 20px;
    margin-top: 6px;
}

/* 共用 panel 基础 */
.panel {
    border-radius: var(--radius);
    padding: 18px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01));
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow-soft);
    position: relative;
    overflow: hidden;
    transition: transform .28s cubic-bezier(.2, .9, .2, 1), box-shadow .28s;

    &:hover {
        transform: translateY(-6px);
        box-shadow: var(--shadow-strong);
    }

    .section-title {
        font-size: 16px;
        font-weight: 700;
        margin-bottom: 12px;
        letter-spacing: .02em;
    }
}

/* 信息卡：Grid 风格 + 左侧渐变条 */
.panel--info {
    padding: 18px;

    &:before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        width: 6px;
        height: 100%;
        background: linear-gradient(180deg, var(--accent), var(--accent-2));
        border-top-left-radius: var(--radius);
        border-bottom-left-radius: var(--radius);
    }

    .info-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        list-style: none;
        margin: 6px 0 0 0;
        padding: 0;

        .info-item {
            display: flex;
            flex-direction: column;
            gap: 6px;
            padding: 10px;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.01);
            border: 1px solid rgba(255, 255, 255, 0.03);

            .k {
                color: var(--muted);
                font-size: 12px;
            }

            .v {
                font-weight: 600;
                font-size: 14px;
            }

            &:hover {
                background: rgba(139, 92, 246, 0.03);
            }
        }
    }

    // 渐入动画（错落）
    .info-item {
        opacity: 0;
        transform: translateY(8px);
        animation: infoIn .52s forwards ease;

        @for $i from 1 through 12 {
            &:nth-child(#{$i}) {
                animation-delay: ($i * 0.04) + 0.08s;
            }
        }
    }
}

/* 人物概述面板：文本与立绘并列，立绘带光泽与视差 */
.panel--profile {
    .profile-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
        align-items: center;

        .profile-text {
            .lead {
                font-size: 15px;
                font-weight: 600;
                color: var(--text);
                margin-bottom: 8px;
            }

            p {
                color: rgba(238, 241, 255, 0.92);
                line-height: 1.55;
                margin: 6px 0;
            }

            .pill-list {
                margin-top: 12px;

                .pill {
                    display: inline-block;
                    margin-right: 8px;
                    padding: 6px 12px;
                    border-radius: 999px;
                    background: linear-gradient(180deg, rgba(139, 92, 246, 0.14), rgba(139, 92, 246, 0.06));
                    border: 1px solid rgba(139, 92, 246, 0.24);
                    color: var(--text);
                    font-size: 12px;
                    font-weight: 600;
                }
            }
        }

        .profile-art {
            position: relative;
            justify-self: center;

            .art-img {
                width: 100%;
                max-width: 420px;
                border-radius: 12px;
                box-shadow: 0 18px 40px rgba(12, 10, 18, 0.6);
                transition: transform .45s cubic-bezier(.2, .9, .2, 1);
                will-change: transform;
                transform-origin: center;
            }

            .art-caption {
                margin-top: 8px;
                color: var(--muted);
                font-size: 12px;
                text-align: center;
            }

            .art-gloss {
                position: absolute;
                inset: 0;
                border-radius: 12px;
                background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent);
                pointer-events: none;
                mix-blend-mode: overlay;
                opacity: .8;
            }
        }
    }
}

/* 能力卡：每张卡片有自己的色调与微交互 */
.panel--abilities {
    .abilities-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 10px;

        .ability-card {
            display: flex;
            gap: 14px;
            align-items: flex-start;
            padding: 12px;
            border-radius: 12px;
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.01), rgba(255, 255, 255, 0.005));
            border: 1px solid rgba(255, 255, 255, 0.03);
            transition: transform .28s, box-shadow .28s;

            &:hover {
                transform: translateY(-6px) scale(1.01);
                box-shadow: 0 22px 48px rgba(11, 10, 18, 0.55);
            }

            .icon {
                width: 52px;
                height: 52px;
                display: grid;
                place-items: center;
                border-radius: 10px;
                font-size: 22px;
                background: linear-gradient(145deg, rgba(139, 92, 246, 0.16), rgba(34, 211, 238, 0.12));
                box-shadow: 0 8px 20px rgba(139, 92, 246, 0.06);
                animation: iconPulse 2.6s infinite ease-in-out;
            }

            .meta h3 {
                margin: 0 0 6px;
                font-size: 15px;
            }

            .meta p {
                margin: 0;
                color: rgba(238, 241, 255, 0.9);
                font-size: 14px;
            }
        }
    }
}


/* 动画关键帧 */
@keyframes infoIn {
    from {
        opacity: 0;
        transform: translateY(8px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes quoteIn {
    from {
        opacity: 0;
        transform: translateX(-8px) scale(0.995);
    }

    to {
        opacity: 1;
        transform: translateX(0) scale(1);
    }
}

@keyframes iconPulse {
    0% {
        transform: translateY(0) scale(1);
        box-shadow: 0 8px 20px rgba(139, 92, 246, 0.06);
    }

    50% {
        transform: translateY(-4px) scale(1.02);
        box-shadow: 0 18px 36px rgba(139, 92, 246, 0.08);
    }

    100% {
        transform: translateY(0) scale(1);
        box-shadow: 0 8px 20px rgba(139, 92, 246, 0.06);
    }
}

/* 响应式 - 移动端优化 */
@media (max-width: 900px) {
    .container {
        padding: 18px;
    }

    .panel--info .info-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .panel--profile .profile-grid {
        grid-template-columns: 1fr;

        .profile-art {
            justify-self: center;
        }

        .profile-text {
            order: 2;
        }
    }

    .panel--abilities .abilities-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 600px) {
    .hero {
        padding: 40px 0 10px;
    }

    .hero__title {
        font-size: clamp(20px, 8vw, 28px);
    }

    .panel {
        padding: 14px;
        border-radius: 12px;
    }

    .panel--info .info-grid {
        grid-template-columns: 1fr;
    }

    .profile-art .art-img {
        max-width: 92%;
    }

    .quote blockquote {
        font-size: 15px;
    }
}

/* 无动画偏好处理 */
@media (prefers-reduced-motion: reduce) {
    * {
        animation: none !important;
        transition: none !important;
    }

    .art-img {
        transform: none !important;
    }
}
</style>
