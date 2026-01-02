<template>
  <Transition name="lumbergh-appear">
    <div v-if="isProcessing" class="processing-badge">
      <!-- Lumbergh flair pin -->
      <div class="flair-pin">
        <div class="pin-border">
          <div class="pin-inner">
            <img 
              src="/lundberg.png" 
              alt="Bill Lumbergh" 
              class="lumbergh-face"
            />
          </div>
          <div class="pin-shine"></div>
        </div>
        <div class="pin-needle"></div>
      </div>
      
      <!-- Speech bubble -->
      <div class="speech-bubble">
        <div class="bubble-content">
          <p class="quote-text">Yeah, I'm gonna need you to</p>
          <p class="quote-action">
            <span class="action-word">PROCESS</span>
            <span class="dots">
              <span class="dot">.</span>
              <span class="dot">.</span>
              <span class="dot">.</span>
            </span>
          </p>
        </div>
        <div class="bubble-tail"></div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">

</script>

<style scoped>
.processing-badge {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 9999;
  pointer-events: none;
  user-select: none;
  display: flex;
  align-items: flex-end;
  gap: 15px;
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.3));
}

/* Flair Pin Badge */
.flair-pin {
  position: relative;
  animation: pin-float 3s ease-in-out infinite;
}

@keyframes pin-float {
  0%, 100% { 
    transform: translateY(0) rotate(-2deg); 
  }
  50% { 
    transform: translateY(-8px) rotate(2deg); 
  }
}

.pin-border {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b6b 0%, #dc143c 50%, #b71c1c 100%);
  padding: 6px;
  box-shadow: 
    0 6px 20px rgba(183, 28, 28, 0.5),
    inset 0 2px 4px rgba(255, 255, 255, 0.3),
    inset 0 -2px 4px rgba(0, 0, 0, 0.3);
  position: relative;
}

.pin-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  background: #f0f0f0;
  border: 3px solid #ffffff;
  box-shadow: 
    inset 0 2px 6px rgba(0, 0, 0, 0.2),
    0 2px 8px rgba(0, 0, 0, 0.2);
  position: relative;
}

.lumbergh-face {
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: subtle-zoom 4s ease-in-out infinite;
}

@keyframes subtle-zoom {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.pin-shine {
  position: absolute;
  top: 8px;
  left: 12px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: radial-gradient(
    circle at 30% 30%,
    rgba(255, 255, 255, 0.6) 0%,
    rgba(255, 255, 255, 0.2) 50%,
    transparent 70%
  );
  pointer-events: none;
  animation: shine-pulse 3s ease-in-out infinite;
}

@keyframes shine-pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.pin-needle {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 12px;
  background: linear-gradient(180deg, #c0c0c0 0%, #808080 100%);
  border-radius: 2px;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

/* Speech Bubble */
.speech-bubble {
  position: relative;
  background: linear-gradient(145deg, #fff740 0%, #fff176 60%, #ffee58 100%);
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 
    3px 4px 12px rgba(0, 0, 0, 0.25),
    -1px -1px 0 rgba(255, 255, 255, 0.5) inset,
    inset 0 0 30px rgba(0, 0, 0, 0.03);
  max-width: 200px;
  margin-bottom: 15px;
  animation: bubble-bounce 3s ease-in-out infinite;
}

@keyframes bubble-bounce {
  0%, 100% { 
    transform: translateY(0) scale(1); 
  }
  50% { 
    transform: translateY(-5px) scale(1.02); 
  }
}

.speech-bubble::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 8px 8px 0 0;
}

.bubble-tail {
  position: absolute;
  bottom: 8px;
  right: -12px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 12px 0 12px 15px;
  border-color: transparent transparent transparent #ffee58;
  filter: drop-shadow(2px 2px 3px rgba(0, 0, 0, 0.15));
}

.bubble-content {
  position: relative;
  z-index: 1;
}

.quote-text {
  font-family: 'Special Elite', monospace;
  font-size: 0.85rem;
  font-style: italic;
  color: #5d4037;
  margin: 0 0 0.4rem 0;
  line-height: 1.3;
}

.quote-action {
  font-family: 'VT323', monospace;
  font-size: 1.2rem;
  font-weight: bold;
  color: #b71c1c;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  letter-spacing: 0.08em;
}

.action-word {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Animated dots */
.dots {
  display: inline-flex;
  gap: 0.1em;
}

.dot {
  animation: dot-fade 1.5s ease-in-out infinite;
  opacity: 0;
}

.dot:nth-child(1) {
  animation-delay: 0s;
}

.dot:nth-child(2) {
  animation-delay: 0.5s;
}

.dot:nth-child(3) {
  animation-delay: 1s;
}

@keyframes dot-fade {
  0%, 33% { opacity: 0; }
  34%, 100% { opacity: 1; }
}

/* Entrance/Exit animations */
.lumbergh-appear-enter-active {
  animation: lumbergh-enter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.lumbergh-appear-leave-active {
  animation: lumbergh-exit 0.4s ease-in;
}

@keyframes lumbergh-enter {
  0% {
    opacity: 0;
    transform: translateX(100px) rotate(45deg) scale(0.3);
  }
  60% {
    opacity: 1;
    transform: translateX(-10px) rotate(-5deg) scale(1.1);
  }
  100% {
    opacity: 1;
    transform: translateX(0) rotate(0) scale(1);
  }
}

@keyframes lumbergh-exit {
  0% {
    opacity: 1;
    transform: scale(1) rotate(0);
  }
  100% {
    opacity: 0;
    transform: scale(0.5) rotate(-15deg) translateY(50px);
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .processing-badge {
    bottom: 20px;
    right: 15px;
    transform: scale(0.8);
    transform-origin: bottom right;
  }
  
  .speech-bubble {
    max-width: 160px;
    font-size: 0.9rem;
  }
  
  .quote-action {
    font-size: 1.1rem;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .pin-float,
  .subtle-zoom,
  .shine-pulse,
  .bubble-bounce,
  .dot {
    animation: none;
  }
  
  .dot {
    opacity: 1;
  }
  
  .lumbergh-face {
    transform: none;
  }
}
</style>
