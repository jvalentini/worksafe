<template>
  <div 
    class="postit" 
    :class="color"
    :style="{ transform: `rotate(${rotation}deg)` }"
  >
    <div class="postit-content">
      <slot />
    </div>
    <div class="postit-curl"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    color?: "yellow" | "pink" | "blue" | "green" | "orange";
    rotate?: number;
  }>(),
  {
    color: "yellow",
    rotate: 0,
  },
);

const _rotation = computed(() => {
  if (props.rotate !== 0) return props.rotate;
  return Math.random() * 4 - 2;
});
</script>

<style scoped>
.postit {
  position: relative;
  padding: 1rem 1.25rem;
  font-family: 'Special Elite', 'Courier New', monospace;
  font-size: 1rem;
  line-height: 1.5;
  min-width: 180px;
  box-shadow: 
    3px 4px 8px rgba(0,0,0,0.25),
    -1px -1px 0 rgba(255,255,255,0.5) inset;
}

.postit.yellow {
  background: linear-gradient(145deg, #fff740 0%, #fff176 60%, #ffee58 100%);
  color: #5d4037;
}

.postit.pink {
  background: linear-gradient(145deg, #ff7eb9 0%, #f48fb1 60%, #f06292 100%);
  color: #4a148c;
}

.postit.blue {
  background: linear-gradient(145deg, #7afcff 0%, #80deea 60%, #4dd0e1 100%);
  color: #01579b;
}

.postit.green {
  background: linear-gradient(145deg, #7fff7f 0%, #a5d6a7 60%, #81c784 100%);
  color: #1b5e20;
}

.postit.orange {
  background: linear-gradient(145deg, #ff9a3c 0%, #ffb74d 60%, #ffa726 100%);
  color: #4e342e;
}

.postit-content {
  position: relative;
  z-index: 1;
}

.postit-curl {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 0 25px 25px;
  border-color: transparent transparent rgba(0,0,0,0.15) transparent;
}

.postit::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: rgba(0,0,0,0.08);
}
</style>
