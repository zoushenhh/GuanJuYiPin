<template>
  <div class="world-map-route">
    <!-- 单机模式：仅显示图形地图 -->
    <GameMapPanel :is-online="false" />
  </div>
</template>

<script setup lang="ts">
import GameMapPanel from '@/components/dashboard/GameMapPanel.vue';
</script>

<style scoped>
.world-map-route {
  width: 100%;
  height: 100%;
}
</style>
