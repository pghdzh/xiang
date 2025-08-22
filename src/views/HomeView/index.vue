<template>
    <main class="home-page" role="main">

        <div class="threeDom" ref="nightRef"></div>
        <!-- 主体：垂直居中（标题 + 打字机 + 入口按钮） -->
        <section class="center-wrap" aria-live="polite">
            <header class="hero" role="banner" aria-hidden="false">
                <h1 class="title">十香 · 电子设定集</h1>
            </header>

            <div class="type-area" role="status" aria-atomic="true">
                <div class="typebox" :aria-label="displayText || '正在加载台词'">


                    <div class="type-content">
                        <div class="line-and-tag">
                            <span class="typed">{{ displayText }}</span>
                            <span class="cursor" aria-hidden="true">▌</span>
                        </div>

                    </div>
                </div>

                <router-link to="/overview" class="enter-btn" aria-label="进入人物概览">
                    进入人物概览
                    <span class="btn-glow" aria-hidden="true"></span>
                </router-link>
            </div>
        </section>

        <!-- 页脚 -->
        <footer class="site-footer" role="contentinfo">
            <div class="footer-inner">
                <div class="left">
                    <small>© {{ new Date().getFullYear() }} 十香电子设定集</small>
                    <span class="dot">•</span>
                    <small>制作：霜落天亦</small>
                </div>

            </div>
        </footer>
    </main>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import initNight from "./threeInit/initNight"
const nightRef = ref()
type Line = {
    text: string;
};

// 台词数组（带语言/出处标签）。我选用较中性的“动画台词 / 剧情台词 / 粉丝常引用”等标签，避免误引具体集数
const lines = ref<Line[]>([
    { text: '士道，我会一直守护着你。' },
    { text: '这是我的名字——十香。' },
    { text: '一起看着星空，好吗？' },
    { text: '我才不会被那种话欺骗呢！笨～蛋！' },
    { text: '守护你，就是我的全部。' },
    { text: '你知道吗？在没有名字的世界，那份 ‘属于我’ 的感觉，就是你给的。' },
    { text: '恐惧、未知、那些我从没有感觉过的事物，都在你身边变成勇气。' }
]);

const displayText = ref('');
const lineIndex = ref(0);
const charIndex = ref(0);

const TYPING_SPEED = 100;
const DELETING_SPEED = 30;
const PAUSE_AFTER_FULL = 1400;

let typingTimer: number | null = null;
let pauseTimer: number | null = null;

const currentLine = computed(() => lines.value[lineIndex.value] || { text: '' });

function typeStep() {
    const cur = lines.value[lineIndex.value].text;
    if (charIndex.value <= cur.length) {
        displayText.value = cur.slice(0, charIndex.value);
        charIndex.value++;
        typingTimer = window.setTimeout(typeStep, TYPING_SPEED);
    } else {
        pauseTimer = window.setTimeout(startDeleting, PAUSE_AFTER_FULL);
    }
}

function startDeleting() {
    const cur = lines.value[lineIndex.value].text;
    if (charIndex.value >= 0) {
        displayText.value = cur.slice(0, charIndex.value);
        charIndex.value--;
        typingTimer = window.setTimeout(startDeleting, DELETING_SPEED);
    } else {
        lineIndex.value = (lineIndex.value + 1) % lines.value.length;
        pauseTimer = window.setTimeout(() => {
            charIndex.value = 0;
            typeStep();
        }, 600);
    }
}
let bgCleanup: any = null;
onMounted(() => {
    const { cleanup } = initNight(nightRef)
    bgCleanup = cleanup;
    pauseTimer = window.setTimeout(() => {
        charIndex.value = 0;
        typeStep();
    }, 1000);
});

onUnmounted(() => {
    typingTimer && clearTimeout(typingTimer);
    pauseTimer && clearTimeout(pauseTimer);
    if (bgCleanup) bgCleanup();
});
</script>

<style scoped lang="scss">
.home-page {
    --bg-1: #04020a;
    --bg-2: #0b0620;
    --accent: #9b6cff;
    --accent-2: #ffd0f9;
    min-height: 100vh;
    position: relative;
    overflow: hidden;
    font-family: "Noto Sans SC", "PingFang SC", system-ui, -apple-system, "Segoe UI", Roboto, Arial;
    color: #fdfcff;
    background: linear-gradient(180deg, var(--bg-1) 0%, var(--bg-2) 60%, #0d0420 100%);
    padding-top: 50px;

    .threeDom {
        width: 100%;
        height: calc(100vh - 60px);
        background-color: #fff;
        position: fixed;
        left: 0;
        top: 0;
    }

    // 居中容器（将标题与打字机一并垂直居中）
    .center-wrap {

        z-index: 6;
        position: relative;
        min-height: calc(100vh - 96px); // 留出页脚高度
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2.2rem 1rem;
        gap: 1.6rem;
        text-align: center;

        .hero {
            .title {
                margin: 0;
                font-size: 2rem;
                line-height: 1;
                letter-spacing: 2px;
                background: linear-gradient(90deg, var(--accent), var(--accent-2));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-shadow: 0 10px 30px rgba(110, 60, 210, 0.12);
                border: 1px solid rgba(255, 255, 255, 0.06);
                padding: 1.0rem 1.2rem;
                border-radius: 14px;
                box-shadow: 0 16px 48px rgba(12, 6, 30, 0.6);
                backdrop-filter: blur(6px);

            }


        }

        .type-area {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            width: 100%;
            max-width: 820px;

            .typebox {
                display: flex;
                align-items: center;
                gap: 14px;
                background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02));
                border: 1px solid rgba(255, 255, 255, 0.06);
                padding: 1.0rem 1.2rem;
                border-radius: 14px;
                box-shadow: 0 16px 48px rgba(12, 6, 30, 0.6);
                backdrop-filter: blur(6px);
                min-width: 280px;
                max-width: 100%;
                transition: transform .18s ease, box-shadow .18s ease;
                will-change: transform;



                .type-content {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 6px;

                    .line-and-tag {
                        display: flex;
                        align-items: baseline;
                        gap: 8px;
                        flex-wrap: wrap;

                        .typed {
                            font-size: 1.18rem;
                            font-weight: 600;
                            color: #fff;
                            letter-spacing: .4px;
                            max-width: 62ch;
                            text-shadow: 0 6px 18px rgba(10, 6, 30, 0.6);
                        }

                        .cursor {
                            font-size: 1.18rem;
                            color: rgba(255, 255, 255, 0.95);
                            animation: blink 1s steps(2, start) infinite;
                        }
                    }


                }

                &:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 26px 64px rgba(12, 6, 30, 0.7);
                }
            }

            .enter-btn {
                position: relative;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 0.62rem 1.05rem;
                border-radius: 12px;
                font-weight: 700;
                letter-spacing: .4px;
                text-decoration: none;
                color: #110b20;
                background: linear-gradient(90deg, #ffd5fb, #c9a3ff);
                box-shadow: 0 10px 30px rgba(150, 100, 255, 0.12);
                border: none;
                cursor: pointer;
                transition: transform .15s ease, box-shadow .18s ease;
                overflow: visible;
                z-index: 6;

                .btn-glow {
                    position: absolute;
                    left: -6px;
                    right: -6px;
                    top: -6px;
                    bottom: -6px;
                    border-radius: 14px;
                    background: radial-gradient(ellipse at center, rgba(255, 200, 255, 0.12), transparent 35%);
                    filter: blur(10px);
                    opacity: 0;
                    transition: opacity .18s ease;
                    pointer-events: none;
                }

                &:hover {
                    transform: translateY(-4px) scale(1.02);
                    box-shadow: 0 20px 50px rgba(150, 100, 255, 0.18);

                    .btn-glow {
                        opacity: 1;
                    }
                }

                &:focus {
                    outline: none;
                    box-shadow: 0 0 0 4px rgba(155, 108, 255, 0.16);
                }
            }
        }
    }

    // 页脚
    .site-footer {
        z-index: 6;
        width: 100%;
        border-top: 1px solid rgba(255, 255, 255, 0.03);
        padding: 1rem;
        margin-top: auto;
        background: linear-gradient(180deg, rgba(6, 4, 18, 0), rgba(6, 4, 18, 0.35));

        .footer-inner {
            max-width: 980px;
            margin: 0 auto;
            display: flex;
            justify-content: center;
            align-items: center;
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.9rem;

            .left {
                display: flex;
                gap: .6rem;
                align-items: center;
                color: rgba(255, 255, 255, 0.75);
            }

            .dot {
                opacity: .45;
                margin: 0 .4rem;
            }

        }
    }

    // 动画 keyframes
    @keyframes blink {

        0%,
        49% {
            opacity: 1;
        }

        50%,
        100% {
            opacity: 0;
        }
    }

    @keyframes slow-rotate {
        from {
            transform: rotate(0deg);
        }

        to {
            transform: rotate(360deg);
        }
    }

    @keyframes float {
        0% {
            transform: translateY(0) translateX(0) scale(1);
        }

        50% {
            transform: translateY(-10px) translateX(6px) scale(1.05);
        }

        100% {
            transform: translateY(0) translateX(0) scale(1);
        }
    }

    // 响应式
    @media (max-width: 880px) {
        .center-wrap {
            padding: 1.4rem;

            .hero .title {
                font-size: 1.6rem;
            }



            .type-area .typebox {
                padding: .86rem 1rem;

                .typed {
                    font-size: 1.02rem;
                }
            }

            .enter-btn {
                padding: .5rem .9rem;
            }
        }

        .site-footer .footer-inner {
            font-size: .86rem;
            padding: 0 6px;
        }
    }

    @media (max-width: 480px) {
        .center-wrap {
            min-height: calc(100vh - 120px);
            gap: 0.9rem;

            .hero .title {
                font-size: 1.25rem;
            }

            .type-area .typebox {
                padding: .65rem .75rem;

                .typed {
                    font-size: .96rem;
                }
            }

            .enter-btn {
                padding: .46rem .7rem;
                font-size: .92rem;
            }
        }
    }
}
</style>
