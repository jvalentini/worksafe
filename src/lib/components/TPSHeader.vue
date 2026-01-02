<template>
  <header class="tps-header">
    <div class="perforation-strip"></div>
    
    <div class="header-content">
      <div class="logo-area">
        <div class="logo-badge">
          <img src="/stapler.png" alt="Red Swingline Stapler" class="stapler-icon" />
        </div>
        <div class="logo-text">
          <h1>WORKSAFE<sup>®</sup></h1>
          <div class="division">LANGUAGE COMPLIANCE SYSTEM</div>
        </div>
      </div>

      <div class="stamps-area">
        <div class="stamp approved">APPROVED</div>
        <div class="stamp internal">INTERNAL USE ONLY</div>
      </div>
    </div>

    <div class="memo-bar">
      <div class="memo-field">
        <span class="label">DATE:</span>
        <span class="value">{{ currentDate }}</span>
      </div>
      <div class="memo-field">
        <span class="label">TO:</span>
        <span class="value">ALL PERSONNEL</span>
      </div>
      <div class="memo-field">
        <span class="label">FROM:</span>
        <span class="value">MANAGEMENT</span>
      </div>
      <div class="memo-field">
        <span class="label">RE:</span>
        <span class="value">TPS REPORT #{{ reportNumber }}</span>
      </div>
    </div>

    <div class="lumbergh-quote">
      <p>"Yeah, I'm going to need you to use professional language. That would be great."</p>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";

const currentDate = computed(() => {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const reportNumber = computed(() => {
  return Date.now().toString().slice(-6);
});
</script>

<style scoped>
.tps-header {
  background: linear-gradient(180deg, #faf8f3 0%, #f0ebe0 100%);
  border-bottom: 3px double #4a4a4a;
  position: relative;
}

.perforation-strip {
  height: 12px;
  background: 
    repeating-linear-gradient(
      90deg,
      transparent 0px,
      transparent 8px,
      rgba(0,0,0,0.1) 8px,
      rgba(0,0,0,0.1) 10px,
      transparent 10px,
      transparent 20px
    );
  border-bottom: 1px dashed #a8a8a8;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-badge {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #e8e4d9 0%, #d4d0c5 100%);
  border: 3px solid #4a4a4a;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    3px 3px 0 rgba(0,0,0,0.2),
    inset 0 1px 0 rgba(255,255,255,0.3);
  padding: 10px;
}

.stapler-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.4));
}

.logo-text h1 {
  font-family: 'Arial Black', 'Arial', sans-serif;
  font-size: 2.8rem;
  font-weight: 900;
  letter-spacing: 0.15em;
  color: #1a1a1a;
  margin: 0;
  line-height: 1;
  text-transform: uppercase;
  text-shadow: 
    3px 3px 0 rgba(0,0,0,0.15),
    1px 1px 0 rgba(255,255,255,0.5);
  background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-text h1 sup {
  font-size: 0.35em;
  vertical-align: super;
  color: #7a7a7a;
  -webkit-text-fill-color: #7a7a7a;
}

.division {
  font-family: 'Arial', sans-serif;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  color: #6a6a6a;
  margin-top: 0.35rem;
  text-transform: uppercase;
}

.stamps-area {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.stamp {
  font-family: 'Special Elite', monospace;
  font-size: 0.85rem;
  font-weight: bold;
  letter-spacing: 0.15em;
  padding: 0.4rem 0.8rem;
  border: 3px solid currentColor;
  transform: rotate(-6deg);
  opacity: 0.9;
}

.stamp.approved {
  color: #166534;
  animation: stamp-slam 0.5s ease-out;
}

.stamp.internal {
  color: #1e3a8a;
  transform: rotate(-3deg);
  animation: stamp-slam 0.5s ease-out 0.15s both;
}

@keyframes stamp-slam {
  0% {
    transform: rotate(-6deg) scale(1.8);
    opacity: 0;
  }
  60% {
    transform: rotate(-6deg) scale(0.95);
    opacity: 1;
  }
  100% {
    transform: rotate(-6deg) scale(1);
    opacity: 0.9;
  }
}

.memo-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 2rem;
  padding: 0.75rem 2rem;
  background: #e8e4d9;
  border-top: 1px solid #c9b896;
  border-bottom: 1px solid #c9b896;
}

.memo-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Courier Prime', monospace;
  font-size: 0.8rem;
}

.memo-field .label {
  font-weight: bold;
  color: #4a4a4a;
  text-decoration: underline;
}

.memo-field .value {
  color: #1a1a1a;
}

.lumbergh-quote {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem 2rem;
  background: linear-gradient(90deg, #fff59d 0%, #fff740 50%, #fff59d 100%);
  font-family: 'Special Elite', monospace;
  font-size: 1.15rem;
  color: #4e342e;
  border-top: 2px dashed #d4a700;
}

.lumbergh-quote p {
  margin: 0;
  font-style: italic;
  text-align: center;
  font-weight: bold;
  text-shadow: 
    1px 1px 0 rgba(255,255,255,0.6),
    0 0 1px rgba(78,52,46,0.1);
  letter-spacing: 0.02em;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .stamps-area {
    align-items: center;
    flex-direction: row;
  }

  .logo-text h1 {
    font-size: 1.8rem;
  }

  .memo-bar {
    justify-content: center;
  }
}
</style>
