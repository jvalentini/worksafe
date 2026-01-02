<template>
  <Transition name="terminal-boot">
    <div v-if="isProcessing" class="processing-terminal">
      <!-- CRT Screen bezel -->
      <div class="crt-bezel">
        <!-- Glass reflection -->
        <div class="crt-glass"></div>
        
        <!-- Scanlines overlay -->
        <div class="scanlines"></div>
        
        <!-- Screen content -->
        <div class="terminal-screen">
          <!-- Blinking power LED -->
          <div class="power-led"></div>
          
          <!-- Terminal text -->
          <div class="terminal-line">
            <span class="prompt">&gt;</span>
            <span class="command">PROCESSING</span>
            <span class="dots">
              <span class="dot dot-1">.</span>
              <span class="dot dot-2">.</span>
              <span class="dot dot-3">.</span>
            </span>
          </div>
          
          <!-- Blinking cursor -->
          <span class="cursor">█</span>
          
          <!-- System info -->
          <div class="system-info">
            <span class="info-label">AI_MODE</span>
            <span class="info-status">ACTIVE</span>
          </div>
        </div>
        
        <!-- Phosphor glow effect -->
        <div class="phosphor-glow"></div>
      </div>
      
      <!-- Monitor stand -->
      <div class="monitor-stand">
        <div class="stand-neck"></div>
        <div class="stand-base"></div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { isProcessing } from "$lib/state";
</script>

<style scoped>
.processing-terminal {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 9999;
  pointer-events: none;
  user-select: none;
  filter: drop-shadow(0 10px 30px rgba(0, 255, 65, 0.4));
}

/* CRT Monitor Bezel */
.crt-bezel {
  position: relative;
  width: 280px;
  height: 200px;
  background: linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%);
  border-radius: 12px 12px 8px 8px;
  padding: 18px;
  box-shadow: 
    inset 0 2px 4px rgba(255,255,255,0.1),
    inset 0 -3px 8px rgba(0,0,0,0.8),
    0 15px 40px rgba(0,0,0,0.6);
  overflow: hidden;
}

/* Glass reflection on screen */
.crt-glass {
  position: absolute;
  top: 15px;
  left: 15px;
  right: 15px;
  height: 40%;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.15) 0%,
    transparent 50%
  );
  border-radius: 8px 8px 0 0;
  pointer-events: none;
  z-index: 3;
}

/* Scanlines */
.scanlines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15) 0px,
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 3px
  );
  pointer-events: none;
  z-index: 2;
  animation: scanline-scroll 8s linear infinite;
}

@keyframes scanline-scroll {
  0% { transform: translateY(0); }
  100% { transform: translateY(3px); }
}

/* Terminal Screen */
.terminal-screen {
  position: relative;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    ellipse at center,
    #001a00 0%,
    #000d00 60%,
    #000500 100%
  );
  border: 3px solid #0a0a0a;
  border-radius: 6px;
  padding: 20px 16px;
  box-shadow: 
    inset 0 0 50px rgba(0, 255, 65, 0.1),
    inset 0 0 20px rgba(0, 255, 65, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

/* Power LED */
.power-led {
  position: absolute;
  top: 8px;
  right: 10px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00ff41;
  box-shadow: 
    0 0 8px #00ff41,
    0 0 15px rgba(0, 255, 65, 0.6),
    inset 0 1px 2px rgba(255, 255, 255, 0.4);
  animation: led-pulse 2s ease-in-out infinite;
}

@keyframes led-pulse {
  0%, 100% { 
    opacity: 1;
    box-shadow: 
      0 0 8px #00ff41,
      0 0 15px rgba(0, 255, 65, 0.6);
  }
  50% { 
    opacity: 0.7;
    box-shadow: 
      0 0 4px #00ff41,
      0 0 10px rgba(0, 255, 65, 0.4);
  }
}

/* Terminal Text */
.terminal-line {
  font-family: 'VT323', 'Courier New', monospace;
  font-size: 1.6rem;
  color: #00ff41;
  text-shadow: 
    0 0 10px rgba(0, 255, 65, 0.8),
    0 0 20px rgba(0, 255, 65, 0.4),
    0 0 2px #00ff41;
  letter-spacing: 0.08em;
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 0.3em;
  margin-bottom: 0.5em;
}

.prompt {
  color: #00cc33;
  font-weight: bold;
  text-shadow: 
    0 0 8px rgba(0, 204, 51, 0.8),
    0 0 2px #00cc33;
}

.command {
  font-weight: bold;
  letter-spacing: 0.12em;
}

/* Animated dots */
.dots {
  display: inline-flex;
  gap: 0.1em;
  min-width: 1.5em;
}

.dot {
  animation: dot-fade 1.5s ease-in-out infinite;
  opacity: 0;
}

.dot-1 {
  animation-delay: 0s;
}

.dot-2 {
  animation-delay: 0.5s;
}

.dot-3 {
  animation-delay: 1s;
}

@keyframes dot-fade {
  0%, 33% { opacity: 0; }
  34%, 100% { opacity: 1; }
}

/* Blinking cursor */
.cursor {
  font-family: 'VT323', monospace;
  font-size: 1.6rem;
  color: #00ff41;
  text-shadow: 
    0 0 10px rgba(0, 255, 65, 0.8),
    0 0 2px #00ff41;
  animation: cursor-blink 1s step-end infinite;
  margin-left: 0.2em;
}

@keyframes cursor-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* System info */
.system-info {
  position: absolute;
  bottom: 8px;
  left: 12px;
  font-family: 'VT323', monospace;
  font-size: 0.75rem;
  display: flex;
  gap: 0.5em;
  align-items: center;
}

.info-label {
  color: #00aa33;
  text-shadow: 0 0 6px rgba(0, 170, 51, 0.6);
  letter-spacing: 0.1em;
}

.info-status {
  color: #00ff41;
  text-shadow: 
    0 0 8px rgba(0, 255, 65, 0.8),
    0 0 2px #00ff41;
  letter-spacing: 0.08em;
  font-weight: bold;
  animation: status-pulse 2s ease-in-out infinite;
}

@keyframes status-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Phosphor glow (CRT bloom effect) */
.phosphor-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  height: 80%;
  background: radial-gradient(
    ellipse at center,
    rgba(0, 255, 65, 0.15) 0%,
    transparent 70%
  );
  border-radius: 50%;
  pointer-events: none;
  animation: phosphor-pulse 3s ease-in-out infinite;
  z-index: 1;
}

@keyframes phosphor-pulse {
  0%, 100% { 
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1);
  }
  50% { 
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.05);
  }
}

/* Monitor stand */
.monitor-stand {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -5px;
}

.stand-neck {
  width: 60px;
  height: 25px;
  background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%);
  border-radius: 0 0 8px 8px;
  box-shadow: 
    inset 0 -2px 4px rgba(0,0,0,0.5),
    0 2px 6px rgba(0,0,0,0.4);
}

.stand-base {
  width: 100px;
  height: 12px;
  background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
  border-radius: 6px;
  margin-top: -2px;
  box-shadow: 
    inset 0 1px 2px rgba(0,0,0,0.6),
    0 3px 8px rgba(0,0,0,0.5);
}

/* Entrance animation */
.terminal-boot-enter-active {
  animation: boot-sequence 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.terminal-boot-leave-active {
  animation: shutdown-sequence 0.4s ease-in;
}

@keyframes boot-sequence {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(50px);
    filter: blur(10px) brightness(3);
  }
  40% {
    opacity: 0.5;
    filter: blur(5px) brightness(2);
  }
  70% {
    opacity: 0.8;
    transform: scale(1.05) translateY(0);
    filter: blur(1px) brightness(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
    filter: blur(0) brightness(1);
  }
}

@keyframes shutdown-sequence {
  0% {
    opacity: 1;
    filter: brightness(1);
  }
  50% {
    filter: brightness(3);
  }
  100% {
    opacity: 0;
    transform: scale(0.1);
    filter: brightness(0);
  }
}

/* Subtle CRT flicker */
@keyframes crt-flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.98; }
}

.terminal-screen::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 255, 65, 0.02);
  animation: crt-flicker 0.15s infinite;
  pointer-events: none;
  z-index: 10;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .processing-terminal {
    bottom: 20px;
    right: 20px;
    transform: scale(0.75);
    transform-origin: bottom right;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .scanlines,
  .power-led,
  .dot,
  .cursor,
  .status-pulse,
  .phosphor-glow,
  .terminal-screen::before {
    animation: none;
  }
  
  .dot {
    opacity: 1;
  }
  
  .cursor {
    opacity: 1;
  }
}
</style>
