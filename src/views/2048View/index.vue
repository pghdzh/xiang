<template>
    <div class="tohka-2048">
        <header class="hud">
            <div class="left-controls">
                <button class="btn small" @click="handleNewGame">新游戏</button>
                <button class="btn small" @click="undo" :disabled="!canUndo">撤销</button>
            </div>

            <div class="title-area">
                <h1>十香的2048</h1>
                <p class="subtitle">合并相同的头像，得到更高的羁绊</p>
            </div>

            <div class="scores">
                <div class="score">
                    <div class="label">得分</div>
                    <div class="num">{{ score }}</div>
                </div>
                <div class="score high">
                    <div class="label">最高</div>
                    <div class="num">{{ highScore }}</div>
                </div>
            </div>
        </header>

        <section class="controls mobile-hint">
            <div class="hint">键盘 ↑↓←→ 或 WSAD，移动或滑动以操作（按键可在页面任意处触发）</div>
        </section>

        <main ref="boardWrapRef" class="board-wrap"
            :class="{ 'reduced-motion': prefersReduced, ['dir-' + boardDir]: !!boardDir }" tabindex="0"
            @keydown.prevent="onKey">
            <div class="board">
                <div v-for="(row, r) in size" :key="r" class="board-row">
                    <div v-for="(col, c) in size" :key="c" class="cell">
                        <div v-if="grid[r][c] !== 0" class="tile" :class="[
                            'tile-' + grid[r][c],
                            { merged: mergedMap[rcKey(r, c)], new: newTiles[rcKey(r, c)] }
                        ]" :style="tileStyle(grid[r][c])">
                            <div class="tile-inner">
                                <img v-if="tileImage(grid[r][c])" :src="tileImage(grid[r][c])"
                                    :alt="`图标 ${grid[r][c]}`" />
                                <span class="fallback">{{ grid[r][c] }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue'

// ------- 配置区：替换为你的头像图片路径 -------
const IMAGE_MAP: Record<number, string> = {
    2: '/QImages/1 (1).png',
    4: '/QImages/1 (2).png',
    8: '/QImages/1 (3).png',
    16: '/QImages/1 (4).png',
    32: '/QImages/1 (5).png',
    64: '/QImages/1 (1).png',
    128: '/QImages/1 (2).png',
    256: '/QImages/1 (3).png',
    512: '/QImages/1 (4).png',
    1024: '/QImages/1 (5).png',
    2048: '/QImages/1 (1).png'
}
// ----------------------------------------------

const size = 4 // 4x4
const STORAGE_KEY = 'tohka-2048-state-v1'

function emptyGrid() {
    return Array.from({ length: size }, () => Array(size).fill(0))
}

const grid = ref<number[][]>(emptyGrid())
const score = ref(0)
const highScore = ref<number>(Number(localStorage.getItem('tohka-2048-high') || '0'))

// undo
let lastState: { grid: number[][]; score: number } | null = null
const canUndo = ref(false)

// mergedMap 用于标记刚合并的格子以触发合并动画
const mergedMap = ref<Record<string, boolean>>({})
function rcKey(r: number, c: number) { return `${r}_${c}` }

// track newly spawned tiles for drop-in animation
const newTiles = ref<Record<string, boolean>>({})

// board direction to trigger a short slide animation class
const boardDir = ref<'up' | 'down' | 'left' | 'right' | ''>('')

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ grid: grid.value, score: score.value }))
}
function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
        try {
            const parsed = JSON.parse(raw)
            if (parsed && parsed.grid) {
                grid.value = parsed.grid
                score.value = parsed.score || 0
            }
        } catch (e) { console.warn('load failed', e) }
    }
}

function newGame() {
    grid.value = emptyGrid()
    score.value = 0
    canUndo.value = false
    lastState = null
    addRandom(true)
    addRandom(true)
    saveState()
}

function cloneGrid(g: number[][]) {
    return g.map(row => row.slice())
}

function addRandom(markNew = false) {
    const empties: { r: number, c: number }[] = []
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (grid.value[r][c] === 0) empties.push({ r, c })
    if (empties.length === 0) return false
    const pick = empties[Math.floor(Math.random() * empties.length)]
    grid.value[pick.r][pick.c] = Math.random() < 0.9 ? 2 : 4
    if (markNew) {
        const key = rcKey(pick.r, pick.c)
        newTiles.value[key] = true
        // 清除标记
        setTimeout(() => { delete newTiles.value[key] }, 420)
    }
    return true
}

function setBoardDirectionClass(dir: 'up' | 'down' | 'left' | 'right') {
    boardDir.value = dir
    // 清除类，留出动画时间
    setTimeout(() => { boardDir.value = '' }, 160)
}

function move(direction: 'up' | 'down' | 'left' | 'right') {
    // 保存以便撤销
    lastState = { grid: cloneGrid(grid.value), score: score.value }
    canUndo.value = true

    mergedMap.value = {}
    let moved = false

    const rotateTimes = { up: 0, right: 1, down: 2, left: 3 }[direction]
    let g = cloneGrid(grid.value)

    // rotate grid so that we can always move 'up'
    for (let k = 0; k < rotateTimes; k++) g = rotateLeft(g)

    for (let c = 0; c < size; c++) {
        // extract column
        const col: number[] = []
        for (let r = 0; r < size; r++) col.push(g[r][c])

        // compress
        const { newCol, gained, changed, mergedPositions } = compressAndMerge(col)
        if (changed) moved = true
        // write back
        for (let r = 0; r < size; r++) g[r][c] = newCol[r]

        // mark merged positions (relative to rotated grid)
        mergedPositions.forEach((rIdx: number) => {
            const real = rotateCoordsBack(rIdx, c, rotateTimes)
            mergedMap.value[rcKey(real.r, real.c)] = true
        })

        if (gained > 0) score.value += gained
    }

    // rotate back
    for (let k = 0; k < (4 - rotateTimes) % 4; k++) g = rotateLeft(g)

    grid.value = g

    // trigger board-wide slide effect so users feel movement
    if (moved) setBoardDirectionClass(direction)

    if (moved) {
        // 新增的 tile 标记（视觉上的 drop-in）
        // 先记录哪些格子为空 -> after move, addRandom will place new tiles and mark them
        addRandom(true)
        saveState()
        if (score.value > highScore.value) {
            highScore.value = score.value
            localStorage.setItem('tohka-2048-high', String(highScore.value))
        }
    } else {
        // 如果没有移动，那么不记录为上一步
        lastState = null
        canUndo.value = false
    }
}

function undo() {
    if (!lastState) return
    grid.value = cloneGrid(lastState.grid)
    score.value = lastState.score
    lastState = null
    canUndo.value = false
    saveState()
}

// helper: compress column (上移逻辑)，返回 new column, gained score, changed flag, merged positions
function compressAndMerge(col: number[]) {
    const filtered = col.filter(v => v !== 0)
    const mergedPositions: number[] = []
    let gained = 0
    let changed = false
    const out: number[] = []
    for (let i = 0; i < filtered.length; i++) {
        if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
            const val = filtered[i] * 2
            out.push(val)
            gained += val
            mergedPositions.push(out.length - 1) // 记录合并后的位置索引
            i++
            changed = true
        } else {
            out.push(filtered[i])
        }
    }
    while (out.length < size) out.push(0)
    if (out.some((v, i) => v !== col[i])) changed = true
    return { newCol: out, gained, changed, mergedPositions }
}

function rotateLeft(g: number[][]) {
    const n = g.length
    const res = Array.from({ length: n }, () => Array(n).fill(0))
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) res[n - 1 - c][r] = g[r][c]
    return res
}

function rotateCoordsBack(r: number, c: number, rotateTimes: number) {
    // r,c are coords in the rotated grid (after rotating rotateTimes times to the left)
    let rr = r, cc = c
    for (let k = 0; k < rotateTimes; k++) {
        const nr = cc
        const nc = (size - 1) - rr
        rr = nr; cc = nc
    }
    return { r: rr, c: cc }
}

// keyboard handling
function onKey(e: KeyboardEvent) {
    const key = e.key
    if (['ArrowUp', 'w', 'W'].includes(key)) { e.preventDefault(); move('up') }
    if (['ArrowDown', 's', 'S'].includes(key)) { e.preventDefault(); move('down') }
    if (['ArrowLeft', 'a', 'A'].includes(key)) { e.preventDefault(); move('left') }
    if (['ArrowRight', 'd', 'D'].includes(key)) { e.preventDefault(); move('right') }
}

// global key handler: ensure keys work even when focus isn't on board
function globalKeyHandler(e: KeyboardEvent) {
    const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D']
    if (!keys.includes(e.key)) return
    // focus board so that visual focus exists and onKey works as well
    focusBoardWrap()
    // call onKey directly
    onKey(e)
}

// touch swipe support
let touchStartX = 0, touchStartY = 0
function onTouchStart(e: TouchEvent) {
    const t = e.touches[0]
    touchStartX = t.clientX; touchStartY = t.clientY
}
function onTouchEnd(e: TouchEvent) {
    const t = e.changedTouches[0]
    const dx = t.clientX - touchStartX
    const dy = t.clientY - touchStartY
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) move('right')
        else move('left')
    } else {
        if (dy > 0) move('down')
        else move('up')
    }
}

// helpers for template
function tileImage(value: number) { return IMAGE_MAP[value] || '' }
function tileStyle(value: number) { return {} }

// focus helpers
const boardWrapRef = ref<HTMLElement | null>(null)
function focusBoardWrap() {
    if (boardWrapRef.value && typeof boardWrapRef.value.focus === 'function') {
        boardWrapRef.value.focus()
    }
}

function handleNewGame() {
    newGame()
    // wait DOM 更新后把焦点移回棋盘，保证后续按键生效
    nextTick(() => focusBoardWrap())
}

// reduced motion
const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

onMounted(() => {
    loadState()
    if (!grid.value.flat().some(v => v !== 0)) newGame()

    // dom 事件绑定 touch
    const wrap = boardWrapRef.value || document.querySelector('.board-wrap')
    if (wrap) {
        wrap.addEventListener('touchstart', onTouchStart)
        wrap.addEventListener('touchend', onTouchEnd)
    }

    // 全局键盘支持，保证即便焦点不在棋盘也能控制
    window.addEventListener('keydown', globalKeyHandler)

    // 初次确保聚焦（便于在桌面按键测试）
    nextTick(() => focusBoardWrap())
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', globalKeyHandler)
    const wrap = boardWrapRef.value || document.querySelector('.board-wrap')
    if (wrap) {
        wrap.removeEventListener('touchstart', onTouchStart)
        wrap.removeEventListener('touchend', onTouchEnd)
    }
})
</script>

<style lang="scss" scoped>
$bg: #0b0710;
$accent: #8A5FBF;
$panel-alpha: 0.03;
$cell-gap-desktop: 12px;
$cell-gap-mobile: 8px;
$board-max: 560px; // 更大的最大值，便于桌面显示

.tohka-2048 {
    color: #fff;
    min-height: 100vh;
    padding: 24px;
    padding-top: 84px; // 留出顶部 nav 空间
    background: radial-gradient(1200px 400px at 10% 10%, rgba(138, 95, 191, 0.08), transparent), #07040a;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;

    .hud {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        margin-bottom: 14px;

        .left-controls {
            display: flex;
            gap: 10px;

            .btn.small {
                padding: 6px 10px;
                font-size: 0.85rem;
            }
        }

        .title-area {
            text-align: center;
            flex: 1;

            h1 {
                margin: 0;
                font-size: 1.45rem;
                color: $accent;
                letter-spacing: 1px;
                font-weight: 800;
            }

            .subtitle {
                margin: 0;
                font-size: 0.9rem;
                opacity: 0.95;
            }
        }

        .scores {
            display: flex;
            gap: 10px;

            .score {
                background: linear-gradient(180deg, rgba(255, 255, 255, $panel-alpha), rgba(255, 255, 255, 0.01));
                padding: 10px 14px;
                border-radius: 10px;
                min-width: 92px;
                text-align: center;

                .label {
                    font-size: 0.75rem;
                    opacity: 0.85
                }

                .num {
                    font-weight: 800;
                    font-size: 1.15rem
                }
            }

            .score.high {
                background: linear-gradient(90deg, #6f4fb5, #cdb4e4);
                color: #fff;
            }
        }
    }

    .controls {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-bottom: 12px;

        .hint {
            font-size: 0.85rem;
            opacity: 0.9
        }
    }



    .board-wrap {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10px;
        outline: none;

        .board {
            position: relative;
            width: min(92vmin, $board-max);
            aspect-ratio: 1 / 1;
            background: rgba(255, 255, 255, 0.02);
            border-radius: 16px;
            padding: 16px;
            box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.02);
            display: flex;
            flex-direction: column;
            gap: $cell-gap-desktop;

            // 强化网格线：使用伪元素绘制等间隔线
            &::before {
                content: '';
                position: absolute;
                inset: 16px; // 跟 padding 保持一致
                pointer-events: none;
                background-image: linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
                background-size: calc(100% / 4) 100%, 100% calc(100% / 4);
                background-position: left top, left top;
                background-repeat: repeat-x, repeat-y;
                mix-blend-mode: overlay;
                opacity: 0.95;
                border-radius: 10px;
            }

            .board-row {
                display: flex;
                gap: $cell-gap-desktop;
                flex: 1;
            }

            .cell {
                flex: 1;
                background: linear-gradient(180deg, rgba(255, 255, 255, 0.012), rgba(255, 255, 255, 0.004));
                border-radius: 12px;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                border: 1px solid rgba(255, 255, 255, 0.03);
                box-shadow: inset 0 -6px 12px rgba(0, 0, 0, 0.45);

                &:before {
                    content: '';
                    position: absolute;
                    inset: 12% 12%;
                    border-radius: 8px;
                    background: transparent;
                    pointer-events: none;
                }
            }

            .tile {
                position: absolute;
                inset: 0;
                margin: 6px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 8px 22px rgba(0, 0, 0, 0.6);
                overflow: hidden;
                transform-origin: center center;
                transition: transform 180ms ease, box-shadow 180ms ease, opacity 220ms ease;

                .tile-inner {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }

                img {
                    width: 82%;
                    height: 82%;
                    object-fit: contain;
                    pointer-events: none;
                    user-select: none;
                    filter: blur(2px)
                }

                .fallback {
                    position: absolute;
                    color: rgba(255, 255, 255, 0.98);
                    font-weight: 900;
                    font-size: 2.25rem;
                    letter-spacing: 0.5px;
                }

                &.merged {
                    animation: mergePop 220ms ease
                }

                &.new {
                    animation: dropIn 340ms cubic-bezier(.2, .9, .2, 1)
                }
            }

            @keyframes mergePop {
                0% {
                    transform: scale(1)
                }

                50% {
                    transform: scale(1.14)
                }

                100% {
                    transform: scale(1)
                }
            }

            @keyframes dropIn {
                0% {
                    transform: translateY(-26%) scale(0.95);
                    opacity: 0
                }

                80% {
                    transform: translateY(6%) scale(1.02);
                    opacity: 1
                }

                100% {
                    transform: translateY(0) scale(1)
                }
            }

            // board-wide slide illusions — 给人移动方向感
            &.dir-up .tile {
                animation: slideUp 140ms ease both
            }

            &.dir-down .tile {
                animation: slideDown 140ms ease both
            }

            &.dir-left .tile {
                animation: slideLeft 140ms ease both
            }

            &.dir-right .tile {
                animation: slideRight 140ms ease both
            }

            @keyframes slideUp {
                0% {
                    transform: translateY(6%)
                }

                100% {
                    transform: translateY(0)
                }
            }

            @keyframes slideDown {
                0% {
                    transform: translateY(-6%)
                }

                100% {
                    transform: translateY(0)
                }
            }

            @keyframes slideLeft {
                0% {
                    transform: translateX(6%)
                }

                100% {
                    transform: translateX(0)
                }
            }

            @keyframes slideRight {
                0% {
                    transform: translateX(-6%)
                }

                100% {
                    transform: translateX(0)
                }
            }

            .tile-2 {
                background: linear-gradient(180deg, rgba(138, 95, 191, 0.14), rgba(138, 95, 191, 0.06));

                .fallback {
                    color: #cdb4e4;
                }
            }

            .tile-4 {
                background: linear-gradient(180deg, rgba(205, 180, 228, 0.14), rgba(205, 180, 228, 0.04));
            }

            .tile-8 {
                background: linear-gradient(180deg, rgba(246, 198, 194, 0.12), rgba(246, 198, 194, 0.03));
            }

            .tile-16 {
                background: linear-gradient(180deg, rgba(230, 183, 123, 0.12), rgba(230, 183, 123, 0.03));
            }

            .tile-32 {
                background: linear-gradient(180deg, rgba(138, 95, 191, 0.18), rgba(246, 198, 194, 0.02));
            }

            .tile-64 {
                background: linear-gradient(180deg, rgba(94, 37, 123, 0.22), rgba(138, 95, 191, 0.03));
            }

            .tile-128 {
                background: linear-gradient(180deg, rgba(255, 220, 200, 0.2), rgba(255, 220, 200, 0.04));
            }

            .tile-256 {
                background: linear-gradient(180deg, rgba(200, 120, 220, 0.18), rgba(200, 120, 220, 0.04));
            }

            .tile-512 {
                background: linear-gradient(180deg, rgba(255, 200, 120, 0.18), rgba(255, 200, 120, 0.04));
            }

            .tile-1024 {
                background: linear-gradient(180deg, rgba(120, 180, 255, 0.14), rgba(120, 180, 255, 0.03));
            }

            .tile-2048 {
                background: linear-gradient(90deg, $accent, #CDB4E4);
                box-shadow: 0 12px 34px rgba(138, 95, 191, 0.2)
            }

            // 个性化的渐变文字（fallback）——用 background-clip 技术实现文本渐变
            .tile-2 .fallback {
                background: linear-gradient(90deg, #F6E6FB, #CDB4E4);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .tile-4 .fallback {
                background: linear-gradient(90deg, #FFD3E2, #FFB6C1);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .tile-8 .fallback {
                background: linear-gradient(90deg, #FFCDA1, #FF9F80);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .tile-16 .fallback {
                background: linear-gradient(90deg, #FFE8B5, #FFC66B);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .tile-32 .fallback {
                background: linear-gradient(90deg, #EBD6FF, #F6D3E6);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .tile-64 .fallback {
                background: linear-gradient(90deg, #E0C1FF, #B08AE6);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .tile-128 .fallback {
                background: linear-gradient(90deg, #FFF2E6, #FFDAB3);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .tile-256 .fallback {
                background: linear-gradient(90deg, #EFC3FF, #D89BFF);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .tile-512 .fallback {
                background: linear-gradient(90deg, #FFE9C9, #FFD18A);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .tile-1024 .fallback {
                background: linear-gradient(90deg, #C9E6FF, #8FCBFF);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .tile-2048 .fallback {
                background: linear-gradient(90deg, #FFD6FF, #CDB4E4);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            &.reduced-motion .tile {
                transition: none;
                animation: none
            }
        }
    }

    // small screens 优化
    @media (max-width: 600px) {
        padding-top: 72px;

        .hud {
            gap: 8px;

            .title-area {
                h1 {
                    font-size: 1.05rem
                }

                .subtitle {
                    display: none
                }
            }

            .scores {
                display: none
            }
        }

        .mobile-hint {
            display: block;
            margin-bottom: 8px
        }

        .board-wrap .board {
            gap: $cell-gap-mobile;
            padding: 12px;
            border-radius: 12px;

            .board-row {
                gap: $cell-gap-mobile
            }

            .tile .fallback {
                font-size: 1rem
            }

            .tile img {
                width: 78%;
                height: 78%
            }
        }
    }
}
</style>