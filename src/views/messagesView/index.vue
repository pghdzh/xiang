<template>
    <div class="tohka-board" aria-live="polite">

        <div ref="threeRef" class="threeDom"></div>
        <!-- 顶部大标题（带立绘框） -->
        <header class="header" role="banner">

            <div class="title">
                <h1>十香の信箱</h1>
                <p class="sub">若这是命运，我愿站在你身旁。</p>
            </div>
            <div class="header-ornament" aria-hidden="true">
                <span class="ribbon"></span>
            </div>
        </header>

        <!-- 留言列表区 -->
        <section class="list" ref="listRef">
            <transition-group name="msg" tag="div" class="list-inner">
                <div v-if="loading" class="skeletons" key="skeleton">
                    <div class="skeleton" v-for="i in 3" :key="i">
                        <div class="sk-avatar"></div>
                        <div class="sk-body">
                            <div class="sk-line short"></div>
                            <div class="sk-line"></div>
                        </div>
                    </div>
                </div>

                <article v-for="(m, idx) in messages" :key="m.id || m._tempId || idx" class="card" :tabindex="0"
                    role="article" :aria-label="`留言来自 ${m.name || '匿名'}，内容：${m.content}`">
                    <div class="card-left">
                        <div class="avatar" :title="m.name || '匿名'">{{ getInitial(m.name) }}</div>
                    </div>
                    <div class="card-right">
                        <div class="card-head">
                            <div class="name">{{ m.name || '匿名' }}</div>
                            <div class="time">{{ formatTime(m.created_at) }}</div>
                        </div>
                        <div class="content">{{ m.content }}</div>

                    </div>
                </article>
            </transition-group>
        </section>

        <!-- 表单区域（玻璃质感） -->
        <form class="form" @submit.prevent="submitMessage" aria-label="写下你的留言">
            <div class="form-inner">
                <input id="name" v-model="name" placeholder="你的昵称（可选）" />
                <textarea id="content" v-model="content" placeholder="写下对十香的话..."
                    @keydown.ctrl.enter.prevent="submitMessage" @input="autoGrow" ref="ta"></textarea>
            </div>

            <div class="ops">
                <div class="hint">按 <kbd>Ctrl</kbd> + <kbd>Enter</kbd> 快捷发送</div>
                <div class="buttons">
                    <button type="button" class="ghost" @click="clearInput">清空</button>
                    <button type="submit" :disabled="isSending || !content.trim()" class="send">
                        <span v-if="!isSending">寄出</span>
                        <span v-else>寄送中…</span>
                    </button>
                </div>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue';
import { getMessageList, createMessage } from '@/api/modules/message';
import threeInit from './threeInit/threeBg';

const messages = ref<any[]>([]);
const name = ref(localStorage.getItem('tohka_name') || '');
const content = ref('');
const loading = ref(true);
const isSending = ref(false);

const ta = ref<HTMLTextAreaElement | null>(null);
const listRef = ref<HTMLElement | null>(null);

const fetchMessages = async () => {
    loading.value = true;
    try {
        const res = await getMessageList({ page: 1, pageSize: 9999 });
        messages.value = (res && res.data) ? res.data : [];
        // 最近的放在上面：按时间降序
        messages.value.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        await nextTick();
        if (listRef.value) listRef.value.scrollTop = 0;
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
};

const submitMessage = async () => {
    if (!content.value.trim() || isSending.value) return;
    isSending.value = true;
    const payload = { name: name.value || '匿名', content: content.value };
    try {
        localStorage.setItem('tohka_name', name.value);
        const temp = { _tempId: Date.now() + Math.random(), name: payload.name, content: payload.content, created_at: new Date().toISOString() };
        messages.value.unshift(temp);
        content.value = '';
        await nextTick();
        autoGrow();
        await createMessage(payload);
        await fetchMessages();
    } catch (e) {
        console.error(e);
    } finally {
        isSending.value = false;
    }
};

const formatTime = (t?: string) => {
    if (!t) return '';
    const d = new Date(t);
    const y = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${mm}-${dd} ${hh}:${mi}`;
};

const getInitial = (n?: string) => {
    if (!n) return '十';
    const s = n.trim();
    if (!s) return '十';
    return s.slice(0, 1).toUpperCase();
};

const autoGrow = () => {
    const el = ta.value;
    if (!el) return;
    el.style.height = 'auto';
    const h = Math.min(el.scrollHeight, 220);
    el.style.height = h + 'px';
};

const clearInput = () => {
    name.value = '';
    content.value = '';
    localStorage.removeItem('tohka_name');
    nextTick(() => autoGrow());
};
const threeRef = ref<HTMLElement | null>(null);
let bgHandle: { cleanup?: () => void } | null = null;

onMounted(() => {
    bgHandle = threeInit(threeRef);
    fetchMessages();
    nextTick(() => autoGrow());
});
onBeforeUnmount(() => {
    if (bgHandle && typeof bgHandle.cleanup === 'function') {
        bgHandle.cleanup();
        bgHandle = null;
    }
});
</script>

<style scoped lang="scss">
// 嵌套 SCSS：新的布局、颜色、动效
.tohka-board {
    min-height: 100vh;
    padding: 80px 16px 220px;
    box-sizing: border-box;
    font-family: "Noto Sans", "Helvetica Neue", Arial, sans-serif;
   
    color: #221b28;
    position: relative;
    overflow: hidden;

    .threeDom {
        position: fixed;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        z-index: -1;
    }

    // 顶部标题（更具标识性）
    .header {

        margin: 0 auto;
        width: calc(100% - 32px);
        max-width: 1000px;
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 18px;
        border-radius: 16px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(249, 246, 255, 0.98));
        box-shadow: 0 18px 48px rgba(140, 90, 150, 0.08);
        border: 1px solid rgba(235, 220, 240, 0.7);
        z-index: 20;


        .title {
            flex: 1;

            h1 {
                margin: 0;
                font-size: 22px;
                color: #4a1f84;
                letter-spacing: 0.6px;
            }

            .sub {
                margin: 4px 0 0;
                font-size: 13px;
                color: #8f6ea3;
            }
        }

        .header-ornament .ribbon {
            width: 44px;
            height: 44px;
            border-radius: 10px;
            background: linear-gradient(180deg, #f9eef9, #fdeff7);
            box-shadow: 0 6px 12px rgba(190, 140, 180, 0.06);
        }
    }

    .list {
        max-width: 1000px;
        margin: 0 auto;
        padding: 8px;
        box-sizing: border-box;
        overflow: auto;
        height: calc(100vh - 320px);
        z-index: 9;
        .list-inner {
            display: flex;
            flex-direction: column;
            gap: 18px;
        }
    }

    /* 卡片：交替背景 + 光泽边缘 + 悬浮倾斜 */
    .card {
        display: flex;
        gap: 14px;
        align-items: flex-start;
        padding: 14px;
        border-radius: 14px;
        border: 1px solid rgba(230, 220, 240, 0.85);
        background: linear-gradient(180deg, #fff, #fffafc);
        box-shadow: 0 10px 30px rgba(140, 100, 150, 0.04);
        transform-origin: center;
        transition: transform 320ms cubic-bezier(.2, .9, .2, 1), box-shadow 320ms;


        &:hover {
            transform: translateY(-8px) rotateX(1.2deg) rotateZ(-0.4deg) scale(1.01);
            box-shadow: 0 22px 54px rgba(120, 70, 140, 0.12);
        }

        // 交替色（偶数／奇数）
        &:nth-child(odd) {
            background: linear-gradient(180deg, rgba(243, 235, 255, 0.9), rgba(253, 246, 255, 0.98));
            border-color: rgba(220, 200, 240, 0.9);
        }

        &:nth-child(even) {
            background: linear-gradient(180deg, rgba(255, 247, 244, 0.95), rgba(255, 250, 252, 0.98));
            border-color: rgba(245, 230, 235, 0.9);
        }

        .card-left {
            .avatar {
                width: 62px;
                height: 62px;
                border-radius: 12px;
                font-weight: 900;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                color: #fff;
                background: linear-gradient(180deg, #8f59e6, #5b2aa8);
                box-shadow: inset 0 -6px 12px rgba(255, 255, 255, 0.04);
            }
        }

        .card-right {
            flex: 1;

            .card-head {
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                gap: 8px;
                margin-bottom: 8px;

                .name {
                    font-weight: 900;
                    color: #4b1e82;
                    font-size: 15px;
                }

                .time {
                    font-size: 12px;
                    color: #a089b8;
                }
            }

            .content {
                font-size: 15px;
                color: #2c2630;
                line-height: 1.7;
                white-space: pre-wrap;
            }


        }
    }

    /* skeleton */
    .skeletons {
        .skeleton {
            display: flex;
            gap: 12px;
            align-items: center;
            padding: 12px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.9);
            box-shadow: 0 6px 18px rgba(120, 90, 130, 0.02);
        }

        .sk-avatar {
            width: 62px;
            height: 62px;
            border-radius: 12px;
            background: linear-gradient(90deg, rgba(210, 180, 255, 0.6), rgba(240, 220, 255, 0.6));
        }

        .sk-body {
            flex: 1;

            .sk-line {
                height: 10px;
                border-radius: 6px;
                background: linear-gradient(90deg, #fff, #f7f0ff);
                margin-bottom: 8px;

                &.short {
                    width: 44%;
                }
            }
        }
    }

    /* 表单：玻璃质感 + 发光发送按钮 + 小动画 */
    .form {
        position: fixed;
        left: 50%;
        transform: translateX(-50%);
        bottom: 20px;
        width: calc(100% - 32px);
        max-width: 1000px;
        padding: 14px;
        box-sizing: border-box;
        border-radius: 16px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(250, 248, 255, 0.62));
        backdrop-filter: blur(6px) saturate(1.05);
        border: 1px solid rgba(230, 220, 240, 0.55);
        z-index: 30;
        box-shadow: 0 20px 60px rgba(120, 70, 140, 0.06);

        .form-inner {
            display: flex;
            gap: 12px;
            flex-direction: column;
        }

        input,
        textarea {
            width: 100%;
            padding: 12px 14px;
            border-radius: 12px;
            border: 1px solid rgba(220, 210, 235, 0.6);
            font-size: 14px;
            outline: none;
            background: rgba(255, 255, 255, 0.9);
        }

        input:focus,
        textarea:focus {
            box-shadow: 0 10px 30px rgba(150, 100, 170, 0.06);
            border-color: rgba(160, 110, 220, 0.6);
        }

        textarea {
            min-height: 72px;
            max-height: 220px;
            resize: none;
            line-height: 1.7;
        }

        .ops {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            margin-top: 10px;
        }

        .hint {
            font-size: 13px;
            color: #9b81b0;
        }

        .buttons {
            display: flex;
            gap: 10px;
        }

        button {
            padding: 8px 16px;
            border-radius: 12px;
            border: none;
            font-weight: 800;
            cursor: pointer;
        }

        .ghost {
            background: transparent;
            color: #6f4b8a;
            border: 1px solid rgba(120, 90, 140, 0.08);
        }

        .send {
            background: linear-gradient(180deg, #b66ef2, #7b2cc8);
            color: #fff;
            box-shadow: 0 10px 30px rgba(150, 80, 170, 0.18);
            position: relative;
            overflow: hidden;

            &:not(:disabled):hover {
                transform: translateY(-3px);
            }

            &:not(:disabled)::after {
                content: '';
                position: absolute;
                left: -30%;
                top: -40%;
                width: 160%;
                height: 200%;
                background: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.12), transparent 16%);
                transform: rotate(20deg);
                animation: sheen 2200ms linear infinite;
                opacity: 0.35;
            }

            &:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                box-shadow: none;
            }
        }
    }




    @keyframes sheen {
        0% {
            transform: translateX(-120%) rotate(20deg);
        }

        100% {
            transform: translateX(120%) rotate(20deg);
        }
    }

    @media (max-width: 720px) {

        .header {
            left: 12px;
            transform: none;
            width: calc(100% - 24px);
            padding: 12px;

            .portrait {
                display: none;
            }
        }

        .list {
            height: calc(100vh - 260px);
        }

        .card {
            padding: 12px;

            .card-left .avatar {
                width: 52px;
                height: 52px;
                font-size: 18px;
            }
        }

        .form {
            left: 12px;
            transform: none;
            width: calc(100% - 24px);
            bottom: 12px;
            padding: 12px;
        }
    }
}
</style>
