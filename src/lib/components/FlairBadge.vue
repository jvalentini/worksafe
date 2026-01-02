<template>
  <span 
    class="flair-pin" 
    :style="{ background: gradientStyle }"
    :title="title"
  >
    {{ emoji }}
  </span>
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

const _gradientStyle = computed(() => {
  const [light, dark] = colorMap[props.color] || colorMap.red;
  return `linear-gradient(180deg, ${light} 0%, ${dark} 100%)`;
});
</script>

<style scoped>
.flair-pin {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 0.9rem;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.4);
  box-shadow: 
    0 2px 4px rgba(0,0,0,0.3),
    inset 0 1px 0 rgba(255,255,255,0.4),
    inset 0 -2px 4px rgba(0,0,0,0.2);
  cursor: default;
  transition: transform 0.15s ease;
  user-select: none;
}

.flair-pin:hover {
  transform: scale(1.15) rotate(8deg);
}
</style>
