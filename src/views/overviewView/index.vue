<template>
    <div class="tohka-page" role="main" aria-label="夜刀神 十香 人物概览">
        <div class="threeDom" ref="threeRef"></div>

        <header class="hero container">
            <div class="hero__badge">〈公主〉Princess</div>
            <h1 class="hero__title">
                夜刀神 十香
                <span>Yatogami Tohka</span>
            </h1>
            <p class="hero__subtitle">
                剑之精灵 · 天使「鏖杀公（Sandalphon）」 · 灵装「神威灵装·十番」
            </p>
            <div class="hero__tags" role="list">
                <span role="listitem" class="chip">天然呆</span>
                <span role="listitem" class="chip">吃货</span>
                <span role="listitem" class="chip">战斗力强</span>
                <span role="listitem" class="chip">纯真发展</span>
            </div>
        </header>

        <main class="container main">
            <section class="panel panel--info panel--prominent" aria-labelledby="info-title">
                <h2 id="info-title" class="section-title">基础档案</h2>
                <ul class="info-grid">
                    <li class="info-item"><span class="k">中文名</span><span class="v">夜刀神 十香</span></li>
                    <li class="info-item"><span class="k">罗马音</span><span class="v">Yatogami Tohka</span></li>
                    <li class="info-item"><span class="k">生日</span><span class="v">4 月 10 日</span></li>
                    <li class="info-item"><span class="k">身高</span><span class="v">155 cm</span></li>
                    <li class="info-item"><span class="k">三围</span><span class="v">84 / 58 / 83 cm</span></li>
                    <li class="info-item"><span class="k">识别名</span><span class="v">〈公主〉Princess</span></li>
                    <li class="info-item"><span class="k">配音</span><span class="v">井上麻里奈</span></li>
                    <li class="info-item"><span class="k">等级</span><span class="v">AAA（Spirit） / SS（Inverse）</span></li>
                </ul>
            </section>

            <section class="panel panel--profile" aria-labelledby="profile-title">
                <h2 id="profile-title" class="section-title">人物概述</h2>
                <div class="profile-grid">
                    <article class="profile-text">
                        <p class="lead">
                            初登场时对人类怀有恐惧与敌意，因屡遭攻击。与五河士道接触并被封印后逐渐改变，对人类世界充满好奇与温情，性格由谨慎转为纯真、热情。
                        </p>
                        <p>
                            生活常识不足、食量惊人，喜欢黄豆粉面包（kinako bread）。战斗时具高度直觉与适应能力，情绪波动会显著影响力量，会在极端状态下进入暴虐形态（Inverse）。
                        </p>
                        <div class="pill-list">
                            <span class="pill">纯真成长</span>
                            <span class="pill">食量惊人</span>
                            <span class="pill">情绪敏感</span>
                            <span class="pill">战斗直觉</span>
                        </div>
                    </article>

                    <figure class="profile-art">
                        <img src="@/assets/xiang.webp" alt="夜刀神 十香 立绘" class="art-img" loading="lazy" />
                        <figcaption class="art-caption">香香真可爱（(*╹▽╹*)）</figcaption>
                    </figure>
                </div>
            </section>

            <section class="panel panel--design panel--prominent" aria-labelledby="design-title">
                <h2 id="design-title" class="section-title">造型与装备</h2>
                <ul class="design-list">
                    <li>深紫色长发至膝，紫色晶瞳；外表柔美但兼具战斗气势。</li>
                    <li>神威灵装·十番（Astral Dress）：礼裙与铠甲结合，兼顾防御与仪态。</li>
                    <li>Inverse（暴虐形态）：颜色与造型更暗更具攻击性，行为更激烈。</li>
                </ul>
            </section>

            <section class="panel panel--abilities" aria-labelledby="ability-title">
                <h2 id="ability-title" class="section-title">能力体系</h2>
                <div class="abilities-grid">
                    <div class="ability-card">
                        <div class="meta">
                            <h3>天使 · 鏖杀公（Sandalphon）</h3>
                            <p>近战主体，结合座椅与巨剑的象征，最终形态能大幅提升破坏与防御能力。</p>
                        </div>
                    </div>

                    <div class="ability-card">
                        <div class="meta">
                            <h3>灵装 · 神威灵装·十番</h3>
                            <p>礼裙与护甲融合的战斗装，既具美感又能导引灵力形成护体与斩击。</p>
                        </div>
                    </div>

                    <div class="ability-card">
                        <div class="meta">
                            <h3>Inverse / 暴虐形态</h3>
                            <p>力量与破坏性剧增，但会伴随记忆错乱与冷酷，需外力或士道唤回。</p>
                        </div>
                    </div>
                </div>
            </section>

            <section class="panel panel--extra" aria-labelledby="extra-title">
                <h2 id="extra-title" class="section-title">其他情报</h2>
                <ul class="extra-list">
                    <li><strong>命名：</strong>士道基于首次相遇日（4 月 10 日）命名为“十香”。</li>
                    <li><strong>兴趣：</strong>黄豆粉面包、对人类文化充满好奇。</li>
                </ul>
            </section>
        </main>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount } from 'vue';
import threeInit from './threeInit/threeBg';

const threeRef = ref<HTMLElement | null>(null);
let bgHandle: { cleanup?: () => void } | null = null;

onMounted(() => {
    bgHandle = threeInit(threeRef);
});

onBeforeUnmount(() => {
    if (bgHandle && typeof bgHandle.cleanup === 'function') {
        bgHandle.cleanup();
        bgHandle = null;
    }
});
</script>

<style scoped lang="scss">
/* 明亮玻璃风格（颜色写死，SCSS 嵌套） */

/* 基本重置 */
* {
    box-sizing: border-box;
}

.tohka-page {
    min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans", "PingFang SC", "Microsoft Yahei", Arial, sans-serif;
    color: #000000;
    position: relative;
    z-index: 1;
    padding-top: 80px;
    .threeDom {
        position: fixed;
        inset: 0;
        z-index: -1;
        pointer-events: none;
    }

    .container {
        max-width: 1100px;
        margin: 0 auto;
        padding: 28px 18px;
    }

    /* Hero 区 */
    .hero {
        padding: 36px 0 12px;
        text-align: center;
        
        .hero__badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid rgba(0, 0, 0, 0.06);
            color: #000;
            font-weight: 600;
            font-size: 12px;
        }

        .hero__title {
            margin: 10px 0;
            font-size: clamp(24px, 5.6vw, 40px);
            font-weight: 800;
            color: #fff;

            span {
                display: block;
                font-size: 0.45em;
                color: #fff;
                font-weight: 500;
                margin-top: 6px;
            }
        }

        .hero__subtitle {
            color: #fff;
            margin-top: 8px;
            font-size: 14px;
        }

        .hero__tags {
            margin-top: 10px;

            .chip {
                display: inline-block;
                padding: 6px 10px;
                margin: 6px 6px 0 0;
                font-size: 12px;
                border-radius: 999px;
                background: rgba(255, 255, 255, 0.9);
                border: 1px solid rgba(0, 0, 0, 0.06);
                color: #000000;
            }
        }
    }

    /* 主区 */
    .main {
        display: grid;
        gap: 18px;
        margin-top: 8px;
        opacity: 0.9;
        /* 公共 panel（明亮玻璃基础样式） */
        .panel {
            background: rgba(255, 255, 255, 0.92);
            border-radius: 12px;
            padding: 16px;
            border: 1px solid rgba(0, 0, 0, 0.06);
            box-shadow: 0 8px 18px rgba(16, 24, 40, 0.06); // 默认：更柔和
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
            color: #000000;
            transition: transform 0.22s ease, box-shadow 0.22s ease;
            position: relative;
            z-index: 2;

            &:hover {
                transform: translateY(-6px);
                box-shadow: 0 20px 48px rgba(16, 24, 40, 0.12);
            }

            &.panel--prominent {
                // 更明显的阴影（适用于需要更强层次的卡片）
                box-shadow: 0 18px 48px rgba(16, 24, 40, 0.14);

                &:hover {
                    box-shadow: 0 32px 80px rgba(16, 24, 40, 0.18);
                    transform: translateY(-10px);
                }
            }

            .section-title {
                font-size: 15px;
                font-weight: 700;
                color: #000000;
                margin-bottom: 10px;
            }

            p {
                color: #111827;
                line-height: 1.6;
                font-size: 15px;
                margin: 0 0 10px 0;
            }
        }

        /* info */
        .panel--info {
            padding: 14px;

            .info-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 12px;
                margin-top: 6px;
                padding: 0;
                list-style: none;

                .info-item {
                    background: rgba(255, 255, 255, 0.98);
                    border-radius: 10px;
                    padding: 12px;
                    border: 1px solid rgba(0, 0, 0, 0.04);

                    .k {
                        display: block;
                        color: #6b7280;
                        font-size: 12px;
                        margin-bottom: 6px;
                    }

                    .v {
                        font-weight: 600;
                        color: #000000;
                        font-size: 14px;
                    }
                }
            }
        }

        /* profile */
        .panel--profile {
            .profile-grid {
                display: grid;
                grid-template-columns: 1fr 360px;
                gap: 16px;
                align-items: center;

                .profile-text {
                    .lead {
                        font-size: 15px;
                        font-weight: 700;
                        color: #000000;
                        margin-bottom: 8px;
                    }

                    p {
                        margin: 8px 0;
                        color: #111827;
                        line-height: 1.6;
                        font-size: 14px;
                    }

                    .pill-list {
                        margin-top: 12px;

                        .pill {
                            display: inline-block;
                            margin-right: 8px;
                            padding: 6px 12px;
                            border-radius: 999px;
                            background: rgba(0, 0, 0, 0.04);
                            color: #000000;
                            font-weight: 600;
                            font-size: 13px;
                        }
                    }
                }

                .profile-art {
                    justify-self: center;
                    position: relative;

                    .art-img {
                        width: 100%;
                        max-width: 360px;
                        border-radius: 10px;
                        box-shadow: 0 12px 30px rgba(8, 10, 20, 0.06);
                        display: block;
                    }

                    .art-caption {
                        margin-top: 8px;
                        font-size: 12px;
                        color: #4b5563;
                        text-align: center;
                    }
                }
            }
        }

        /* design */
        .panel--design {
            .design-list {
                margin-top: 8px;
                list-style: disc inside;

                li {
                    margin-bottom: 8px;
                    color: #111827;
                    font-size: 14px;
                    line-height: 1.6;
                }
            }
        }

        /* abilities */
        .panel--abilities {
            .abilities-grid {
                display: grid;
                gap: 10px;

                .ability-card {
                    padding: 12px;
                    border-radius: 10px;
                    background: rgba(255, 255, 255, 0.98);
                    border: 1px solid rgba(0, 0, 0, 0.04);

                    .meta {
                        h3 {
                            margin: 0 0 6px 0;
                            font-size: 15px;
                            color: #000000;
                        }

                        p {
                            margin: 0;
                            color: #111827;
                            font-size: 14px;
                        }
                    }
                }
            }
        }

        /* extra */
        .panel--extra {
            padding: 12px;

            .extra-list {
                margin: 8px 0 0 0;
                padding-left: 18px;

                li {
                    margin-bottom: 8px;
                    color: #111827;
                    font-size: 14px;

                    strong {
                        color: #000000;
                    }
                }
            }
        }
    }

    /* 交互/响应 */
    /* 仅在支持 hover 的设备上启用 hover 效果 */
    @media (hover:hover) and (pointer: fine) {
        .main .panel:hover {
            transform: translateY(-6px);
        }
    }

    /* 移动端单列、简化阴影、禁用复杂 hover */
    @media (max-width: 900px) {
        .container {
            padding: 20px 14px;
        }

        .main {
            gap: 14px;

            .panel {
                padding: 14px;
                border-radius: 10px;
                box-shadow: 0 6px 12px rgba(16, 24, 40, 0.04); // 移动端更柔和

                &:hover {
                    transform: none;
                    box-shadow: 0 6px 12px rgba(16, 24, 40, 0.04);
                }
            }

            .panel--info {
                .info-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
            }

            .panel--profile {
                .profile-grid {
                    grid-template-columns: 1fr;
                }

                .profile-art .art-img {
                    max-width: 92%;
                    margin: 0 auto;
                }
            }
        }

        .hero {
            padding: 24px 0 10px;
        }

        .hero__title {
            font-size: clamp(20px, 8vw, 30px);
        }
    }

    /* 更小屏幕优化 */
    @media (max-width: 600px) {
        .main .panel {
            padding: 12px;
        }

        .main .panel--info .info-grid {
            grid-template-columns: 1fr;
        }

        .hero__title {
            font-size: clamp(18px, 10vw, 26px);
        }
    }

    /* 减少动画/过渡（偏好） */
    @media (prefers-reduced-motion: reduce) {
        * {
            transition: none !important;
            animation: none !important;
        }

        .main .panel {
            transform: none !important;
        }
    }
}
</style>
