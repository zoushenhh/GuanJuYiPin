<template>
  <div class="data-clear-container">
    <div class="clear-buttons">
      <!-- 清除自定义数据（自定义+AI生成），保留本地基础+云端数据 -->
      <button 
        @click="clearCustomData" 
        class="clear-button custom"
        :disabled="!hasCustomData"
        title="清除自定义和AI生成的数据"
      >
        <span class="clear-icon">🗑️</span>
        <span class="clear-text">清除自定义</span>
      </button>

      <!-- 清除云端数据，保留本地基础+自定义数据 -->
      <!-- 🔥 暂时隐藏：后端未上线 -->
      <button
        v-if="false"
        @click="clearCloudData"
        class="clear-button cloud"
        :disabled="!hasCloudData"
        title="清除从云端获取的数据"
      >
        <span class="clear-icon">☁️</span>
        <span class="clear-text">清除云端</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useUIStore } from '@/stores/uiStore';
import { useCharacterCreationStore } from '../../stores/characterCreationStore';
import { toast } from '../../utils/toast';
import { getTavernHelper } from '../../utils/tavern';
import { LOCAL_REGIONS, LOCAL_POST_HEAVENS, LOCAL_BACKGROUNDS, LOCAL_APTITUDES, LOCAL_ABILITIES } from '../../data/creationData';

// Props
defineProps<{
  variant?: 'horizontal' | 'vertical';
  size?: 'small' | 'medium' | 'large';
}>();

// Emits
const emit = defineEmits<{
  dataCleared: [type: string, count: number];
}>();

// Store
const store = useCharacterCreationStore();
const uiStore = useUIStore();

// 检查是否有自定义数据
const hasCustomData = computed(() => {
  // 检查是否有ID大于本地基础数据最大ID的项目（这些是自定义或AI生成的）
  const maxLocalRegionId = Math.max(...LOCAL_REGIONS.map(w => w.id));
  const maxLocalPostHeavenId = Math.max(...LOCAL_POST_HEAVENS.map(t => t.id));
  const maxLocalBackgroundId = Math.max(...LOCAL_BACKGROUNDS.map(o => o.id));
  const maxLocalAptitudeId = Math.max(...LOCAL_APTITUDES.map(s => s.id));
  const maxLocalAbilityId = Math.max(...LOCAL_ABILITIES.map(t => t.id));

  const data = store.creationData;
  if (!data) return false;

  return (data.worlds || []).some(w => w.source === 'cloud' || w.id > maxLocalRegionId) ||
         (data.backgrounds || []).some(t => t.source === 'cloud' || t.id > maxLocalPostHeavenId) ||
         (data.aptitudes || []).some(o => o.source === 'cloud' || o.id > maxLocalBackgroundId) ||
         (data.postHeavens || []).some(s => s.source === 'cloud' || s.id > maxLocalAptitudeId) ||
         (data.abilities || []).some(t => t.source === 'cloud' || t.id > maxLocalAbilityId);
});

// 检查是否有云端数据
const hasCloudData = computed(() => {
  const data = store.creationData;
  if (!data) return false;

  return (data.worlds || []).some(w => w.source === 'cloud') ||
         (data.backgrounds || []).some(t => t.source === 'cloud') ||
         (data.aptitudes || []).some(o => o.source === 'cloud') ||
         (data.postHeavens || []).some(s => s.source === 'cloud') ||
         (data.abilities || []).some(t => t.source === 'cloud');
});

// 清理酒馆全局变量中的自定义数据
async function clearTavernCustomData() {
  try {
    const helper = getTavernHelper();
    if (!helper) {
      console.warn('酒馆助手不可用，跳过清理酒馆自定义数据');
      return;
    }

    // 清理酒馆全局变量中的 DAD_creationData
    await helper.deleteVariable('DAD_creationData', { type: 'global' });
    console.log('已清理酒馆全局变量 DAD_creationData');

    // 也清理可能存在的其他自定义数据相关变量
    const globalVars = await helper.getVariables({ type: 'global' });
    const customDataKeys = Object.keys(globalVars).filter(key => 
      key.includes('DAD_') || key.includes('custom') || key.includes('自定义')
    );
    
    if (customDataKeys.length > 0) {
      await Promise.all(customDataKeys.map(key => 
        helper.deleteVariable(key, { type: 'global' })
      ));
      console.log(`已清理 ${customDataKeys.length} 个自定义数据相关的酒馆变量:`, customDataKeys);
    }
  } catch (error) {
    console.error('清理酒馆自定义数据时出错:', error);
    // 不抛出错误，让主流程继续
  }
}

// 清除自定义数据，保留本地基础+云端数据
async function clearCustomData() {
  if (!hasCustomData.value) return;
  uiStore.showRetryDialog({
    title: '清除自定义数据',
    message: '确定要清除自定义数据吗？这将清除所有自定义和AI生成的数据，保留本地基础数据和云端数据。此操作不可撤销！',
    confirmText: '确认清除',
    cancelText: '取消',
    onConfirm: async () => {
      const data = store.creationData;
      const originalCounts = {
        worlds: data.worlds?.length || 0,
        backgrounds: data.backgrounds?.length || 0,
        aptitudes: data.aptitudes?.length || 0,
        postHeavens: data.postHeavens?.length || 0,
        abilities: data.abilities?.length || 0
      };

      const maxLocalRegionId = Math.max(...LOCAL_REGIONS.map(w => w.id));
      const maxLocalPostHeavenId = Math.max(...LOCAL_POST_HEAVENS.map(t => t.id));
      const maxLocalBackgroundId = Math.max(...LOCAL_BACKGROUNDS.map(o => o.id));
      const maxLocalAptitudeId = Math.max(...LOCAL_APTITUDES.map(s => s.id));
      const maxLocalAbilityId = Math.max(...LOCAL_ABILITIES.map(t => t.id));

      data.worlds = (data.worlds || []).filter(w => w.source === 'local' || w.id <= maxLocalRegionId);
      data.backgrounds = (data.backgrounds || []).filter(t => t.source === 'local' || t.id <= maxLocalPostHeavenId);
      data.aptitudes = (data.aptitudes || []).filter(o => o.source === 'local' || o.id <= maxLocalBackgroundId);
      data.postHeavens = (data.postHeavens || []).filter(s => s.source === 'local' || s.id <= maxLocalAptitudeId);
      data.abilities = (data.abilities || []).filter(t => t.source === 'local' || t.id <= maxLocalAbilityId);

      const removedCount = (originalCounts.worlds - (data.worlds?.length || 0)) +
                           (originalCounts.backgrounds - (data.backgrounds?.length || 0)) +
                           (originalCounts.aptitudes - (data.aptitudes?.length || 0)) +
                           (originalCounts.postHeavens - (data.postHeavens?.length || 0)) +
                           (originalCounts.abilities - (data.abilities?.length || 0));

      store.resetCharacter();
      
      // 重要：同时清理酒馆全局变量中的自定义数据
      await clearTavernCustomData();
      
      await store.persistCustomData();
      toast.success(`已清除${removedCount} 项自定义数据，保留本地基础数据和云端数据`);
      emit('dataCleared', 'custom', removedCount);
    },
    onCancel: () => {}
  });
}

// 清除云端数据，保留本地基础+自定义数据
async function clearCloudData() {
  if (!hasCloudData.value) return;
  uiStore.showRetryDialog({
    title: '清除云端数据',
    message: '确定要清除云端数据吗？这将清除从云端获取的数据，保留本地基础数据和自定义数据。此操作不可撤销！',
    confirmText: '确认清除',
    cancelText: '取消',
    onConfirm: async () => {
      const data = store.creationData;
      const originalCounts = {
        worlds: data.worlds?.length || 0,
        backgrounds: data.backgrounds?.length || 0,
        aptitudes: data.aptitudes?.length || 0,
        postHeavens: data.postHeavens?.length || 0,
        abilities: data.abilities?.length || 0
      };

      data.worlds = (data.worlds || []).filter(w => w.source !== 'cloud');
      data.backgrounds = (data.backgrounds || []).filter(t => t.source !== 'cloud');
      data.aptitudes = (data.aptitudes || []).filter(o => o.source !== 'cloud');
      data.postHeavens = (data.postHeavens || []).filter(s => s.source !== 'cloud');
      data.abilities = (data.abilities || []).filter(t => t.source !== 'cloud');

      const removedCount = (originalCounts.worlds - (data.worlds?.length || 0)) +
                           (originalCounts.backgrounds - (data.backgrounds?.length || 0)) +
                           (originalCounts.aptitudes - (data.aptitudes?.length || 0)) +
                           (originalCounts.postHeavens - (data.postHeavens?.length || 0)) +
                           (originalCounts.abilities - (data.abilities?.length || 0));

      store.resetCharacter();
      await store.persistCustomData();
      toast.success(`已清除${removedCount} 项云端数据，保留本地数据和自定义数据`);
      emit('dataCleared', 'cloud', removedCount);
    },
    onCancel: () => {}
  });
}
</script>

<style scoped>
.data-clear-container {
  display: flex;
  align-items: center;
}

.clear-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.clear-button {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface-light);
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
  white-space: nowrap;
}

.clear-button:hover:not(:disabled) {
  background: rgba(var(--color-danger-rgb), 0.1);
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.clear-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.clear-icon {
  font-size: 1em;
  flex-shrink: 0;
}

.clear-text {
  font-weight: 500;
}

/* 不同类型按钮的特定样式 */
.clear-button.extra:hover:not(:disabled) {
  background: rgba(255, 165, 0, 0.2);
  border-color: orange;
  color: orange;
}

.clear-button.sync:hover:not(:disabled) {
  background: rgba(135, 206, 235, 0.2);
  border-color: skyblue;
  color: skyblue;
}
</style>

