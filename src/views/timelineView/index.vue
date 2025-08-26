<template>
    <div class="tohka-timeline" role="main" aria-label="十香 时间线">
        <div ref="threeRef" class="threeDom"></div>
        <header class="hero container">
            <h1 class="title">夜刀神 十香 • 时间线</h1>

        </header>

        <section class="timeline container">
            <div class="event-card" v-for="(item, idx) in events" :key="idx">
                <div class="circle">{{ idx + 1 }}</div>
                <h3>{{ item.title }}</h3>
                <p v-html="item.content"></p>
                <div class="source">出处：{{ item.source }}</div>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount } from 'vue';
import threeInit from './threeInit/threeBg';

const events = [
    {
        title: "初次相遇",
        content:
            "十香伴随空间震登场，与士道相遇。她忧郁又悲伤，对身份毫无印象，最终与折纸战斗，士道被 Ratatoskr 回收。",
        source: "动画 第1季 EP01 / 小说 Vol.1"
    },
    {
        title: "命名·“十香”",
        content:
            "在教室再次见面，士道为她取名“十香”，她第一次露出笑容。后来期待与士道的约会，却因折纸突袭被迫中断。",
        source: "动画 第1季 EP02 / 小说 Vol.1"
    },
    {
        title: "封印·最后之剑",
        content:
            "约会中折纸狙击士道，十香愤怒释放“最後之剑”。士道用吻完成封印，十香成为转校生入住五河家。",
        source: "动画 第1季 EP03-EP04 / 小说 Vol.1"
    },
    {
        title: "日常与校内冲突（四糸乃篇）",
        content:
            "封印后融入日常，但与折纸关系紧张。因担心士道外出独自寻找，撞见他与四糸乃，误会引发战斗，最终原谅士道。",
        source: "动画 第1季 EP05-EP06 / 小说 Vol.2"
    },
    {
        title: "狂三登场与团体战斗",
        content:
            "狂三初登场时，十香曾与她短暂交锋。士道受伤时，十香显现灵装保护他，并与 Ratatoskr 一同作战。",
        source: "动画 第1季 EP07-EP10 / 小说 Vol.3"
    },
    {
        title: "灵结晶反转·魔王形态",
        content:
            "被 DEM 抓获实验后人格反转，展现“暴虐公”。最终被士道吻醒恢复原状。",
        source: "动画 第2季 EP09-EP10 / 小说 Vol.8"
    },
    {
        title: "折纸篇·理性与成长",
        content:
            "折纸暴走时，十香发挥力量协助士道恢复其理智，进一步展现成长。",
        source: "动画 第2季 EP11-EP12 / 小说 Vol.10"
    },
    {
        title: "六喰篇·太空战",
        content:
            "与士道和众精灵一同进入宇宙，与六喰的战斗中发挥重要作用。返回地球后失忆，后逐渐恢复。",
        source: "动画 第3季 EP11-EP12 / 小说 Vol.15"
    },
    {
        title: "澪篇与最终战",
        content:
            "与士道一同面对澪，化身创造“十香世界”却因灵力耗尽消失，最终在士道努力下复活归来。",
        source: "小说 Vol.18-22 (结局)"
    }
];
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
.tohka-timeline {
  
    min-height: 100vh;
    padding: 20px;
    padding-top: 80px;
    .threeDom{
        position: fixed;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        z-index: -1;
    }
    .container {
        max-width: 900px;
        margin: 0 auto;
    }

    .hero {
        text-align: center;
        margin-bottom: 30px;
        z-index: 9;
        .title {
            font-size: clamp(26px, 6vw, 40px);
            font-weight: 700;
            color: #fff;
            margin-bottom: 10px;
        }

    }

    .timeline {
        display: flex;
        flex-direction: column;
        gap: 24px;

        .event-card {
            position: relative;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 20px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            backdrop-filter: blur(10px);
            padding: 24px;
            transition: transform 0.25s ease, box-shadow 0.25s ease;

            &:hover {
                transform: translateY(-4px);
                box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2);
            }

            .circle {
                position: absolute;
                left: -12px;
                top: 20px;
                width: 32px;
                height: 32px;
                background: #8b5cf6;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                font-weight: bold;
                font-size: 14px;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
            }

            h3 {
                margin: 0 0 10px;
                font-size: 18px;
                color: #1f2937;
            }

            p {
                font-size: 14px;
                line-height: 1.6;
                color: #374151;
            }

            .source {
                margin-top: 10px;
                font-size: 12px;
                color: #6b7280;
                font-style: italic;
            }
        }
    }

    @media (max-width: 600px) {
        .timeline .event-card {
            padding: 18px;

            .circle {
                left: -10px;
                top: 18px;
                width: 26px;
                height: 26px;
                font-size: 12px;
            }

            h3 {
                font-size: 16px;
            }

            p {
                font-size: 13px;
            }
        }
    }
}
</style>
