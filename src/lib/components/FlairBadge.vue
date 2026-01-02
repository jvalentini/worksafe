<template>
  <div class="flair-pin-container" :title="title">
    <div class="flair-pin-backing"></div>
    <div 
      class="flair-pin" 
      :style="{ background: gradientStyle }"
    >
      {{ emoji }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    emoji?: string;
    color?: "red" | "blue" | "green" | "yellow" | "purple" | "orange";
    title?: string;
  }>(),
  {
    emoji: "⭐",
    color: "red",
    title: "15 pieces of flair",
  },
);

const colorMap: Record<string, [string, string]> = {
  red: ["#e53935", "#b71c1c"],
  blue: ["#1e88e5", "#0d47a1"],
  green: ["#43a047", "#1b5e20"],
  yellow: ["#fdd835", "#f57f17"],
  purple: ["#8e24aa", "#4a148c"],
  orange: ["#fb8c00", "#e65100"],
};

const gradientStyle = computed(() => {
  const [light, dark] = colorMap[props.color] || colorMap.red;
  return `linear-gradient(180deg, ${light} 0%, ${dark} 100%)`;
});
</script>

<style scoped>
.flair-pin-container {
  position: relative;
  display: inline-block;
  cursor: default;
  user-select: none;
  transition: transform 0.2s ease;
}

.flair-pin-container:hover {
  transform: rotate(5deg) scale(1.05);
}

.flair-pin-backing {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 30px;
  background: linear-gradient(135deg, #c0c0c0 0%, #808080 50%, #606060 100%);
  border-radius: 3px 3px 8px 8px;
  box-shadow: 
    inset 1px 1px 2px rgba(255,255,255,0.5),
    inset -1px -1px 2px rgba(0,0,0,0.3),
    0 4px 8px rgba(0,0,0,0.4);
  z-index: 0;
}

.flair-pin-backing::before {
  content: '';
  position: absolute;
  top: 3px;
  left: 50%;
  transform: translateX(-50%);
  width: 3px;
  height: 8px;
  background: linear-gradient(180deg, #e0e0e0 0%, #909090 100%);
  border-radius: 2px;
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.8);
}

.flair-pin {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  font-size: 3rem;
  color: white;
  text-shadow: 
    2px 2px 4px rgba(0,0,0,0.5),
    0 0 20px rgba(255,255,255,0.3);
  box-shadow: 
    0 6px 12px rgba(0,0,0,0.4),
    0 2px 4px rgba(0,0,0,0.3),
    inset 0 3px 0 rgba(255,255,255,0.5),
    inset 0 -4px 8px rgba(0,0,0,0.3);
  border: 3px solid rgba(255,255,255,0.2);
}
</style>
