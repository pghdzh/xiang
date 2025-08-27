<template>
  <div id="app">
    <transition name="fade" v-if="showIntro">
      <div class="intro-container" @click="showIntro = false">
        <video class="video-background" :src="videoSrc" autoplay muted loop playsinline></video>
        <div class="intro-content">
          <h1 class="welcome-text">欢迎进入</h1>
          <h2 class="title">十香的电子设定集</h2>
        </div>
      </div>
    </transition>
    <div v-else>
      <navbar />

      <main class="main-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import navbar from './components/navbar.vue';
const showIntro = ref(true)
const videoSrc = ref('') // 新增

onMounted(() => {
  // 检测是否为移动端
  const isMobile = window.innerWidth <= 768
  const folder = isMobile ? '/mp41' : '/mp42'
  const index = Math.floor(Math.random() * 2) + 1 // 随机 1 或 2
  videoSrc.value = `${folder}/1 (${index}).mp4`

  setTimeout(() => {
    showIntro.value = false
  }, 5000) // 播放动画 4 秒后进入主页
})
</script>

<style scoped>
#app {
  position: relative;
  min-height: 100vh;
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 欢迎页样式 */
.intro-container {
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse at center, #111 0%, #000 100%);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  flex-direction: column;
}

.intro-content {
  text-align: center;
  color: #fff;
  z-index: 10;
  animation: zoomIn 2s ease-out;
}

.welcome-text {
  font-size: 2.5rem;
  letter-spacing: 2px;
  opacity: 0;
  animation: fadeIn 1.5s ease forwards;
}

.title {
  margin-top: 20px;
  font-size: 3rem;
  font-weight: 800;
  /* 渐变文字（主推荐）*/
  background: linear-gradient(90deg, #8A5FBF 0%, #CDB4E4 45%, #F6C6C2 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent; /* 使文字呈现背景渐变 */
  position: relative;
  opacity: 0;
  /* 先淡入，再让渐变缓慢移动（两个动画合并） */
  animation: fadeIn 1.1s ease forwards, gradientMove 6s ease infinite;
  animation-delay: 1s, 2s; /* 文字先淡入，随后渐变开始缓动 */
  text-shadow:
    0 10px 30px rgba(138,95,191,0.12),
    0 0 36px rgba(246,198,194,0.06);
}

/* 渐变缓慢移动的关键帧 */
@keyframes gradientMove {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 保持无障碍：偏好减少动效时停用动画 */
@media (prefers-reduced-motion: reduce) {
  .title {
    animation: fadeIn 0.9s ease forwards; /* 只保留淡入，去掉移动 */
    background-size: 100% 100%;
  }
}


.video-background {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.4;
  z-index: 1;
  pointer-events: none;
  /* 避免遮挡点击 */
}



/* 动画定义 */
@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

@keyframes zoomIn {
  0% {
    transform: scale(0.95);
    opacity: 0.7;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
