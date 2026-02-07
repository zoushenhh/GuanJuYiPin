<template>
  <div class="government-panel">
    <!-- 顶部：县城数值仪表盘 -->
    <div class="county-dashboard">
      <div class="dashboard-title">
        <FileText :size="18" class="title-icon" />
        <span>{{ t('政务办公') }}</span>
      </div>

      <div class="metrics-grid">
        <!-- 民心 -->
        <div class="metric-card">
          <div class="metric-icon support">
            <Heart :size="20" />
          </div>
          <div class="metric-content">
            <span class="metric-label">{{ t('民心') }}</span>
            <span class="metric-value">{{ Math.round(countyMetrics.民心 || 50) }}%</span>
          </div>
        </div>

        <!-- 治安 -->
        <div class="metric-card">
          <div class="metric-icon security">
            <Shield :size="20" />
          </div>
          <div class="metric-content">
            <span class="metric-label">{{ t('治安') }}</span>
            <span class="metric-value">{{ Math.round(countyMetrics.治安 || 50) }}%</span>
          </div>
        </div>

        <!-- 繁荣度 -->
        <div class="metric-card">
          <div class="metric-icon prosperity">
            <Sparkles :size="20" />
          </div>
          <div class="metric-content">
            <span class="metric-label">{{ t('繁荣度') }}</span>
            <span class="metric-value">{{ Math.round(countyMetrics.繁荣度 || 50) }}</span>
          </div>
        </div>

        <!-- 库银 -->
        <div class="metric-card">
          <div class="metric-icon silver">
            <Coins :size="20" />
          </div>
          <div class="metric-content">
            <span class="metric-label">{{ t('库银') }}</span>
            <span class="metric-value">{{ formatNumber(countyMetrics.库银 || 0) }}</span>
          </div>
        </div>

        <!-- 粮食 -->
        <div class="metric-card">
          <div class="metric-icon grain">
            <Wheat :size="20" />
          </div>
          <div class="metric-content">
            <span class="metric-label">{{ t('粮食') }}</span>
            <span class="metric-value">{{ formatNumber(countyMetrics.粮食 || 0) }}</span>
          </div>
        </div>

        <!-- 教化 -->
        <div class="metric-card">
          <div class="metric-icon education">
            <BookOpen :size="20" />
          </div>
          <div class="metric-content">
            <span class="metric-label">{{ t('教化') }}</span>
            <span class="metric-value">{{ Math.round(countyMetrics.教化 || 50) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 中部：标签页和筛选 -->
    <div class="affairs-header">
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-button"
          :class="{ active: currentTab === tab.key }"
          @click="currentTab = tab.key"
        >
          {{ tab.label }}
          <span v-if="tab.count > 0" class="tab-count">{{ tab.count }}</span>
        </button>
      </div>

      <div class="filters">
        <select
          v-model="filterType"
          class="filter-select"
          :aria-label="t('按类型筛选')"
        >
          <option value="">{{ t('全部类型') }}</option>
          <option v-for="type in affairTypes" :key="type" :value="type">
            {{ t(type) }}
          </option>
        </select>

        <select
          v-model="filterUrgency"
          class="filter-select"
          :aria-label="t('按紧急度筛选')"
        >
          <option value="">{{ t('全部紧急度') }}</option>
          <option v-for="urgency in urgencyLevels" :key="urgency" :value="urgency">
            {{ t(urgency) }}
          </option>
        </select>
      </div>
    </div>

    <!-- 待办公文列表 -->
    <div class="affairs-list">
      <!-- 空状态 -->
      <div v-if="filteredAffairs.length === 0" class="empty-state">
        <FileText :size="48" class="empty-icon" />
        <p class="empty-text">{{ t('暂无待办政务') }}</p>
        <p class="empty-hint">{{ t('一切尽在掌握中') }}</p>
      </div>

      <!-- 政务列表 -->
      <div v-else class="affairs-items">
        <div
          v-for="affair in filteredAffairs"
          :key="affair.id"
          class="affair-item"
          :class="{
            expanded: selectedAffair?.id === affair.id,
            [`urgency-${affair.紧急度}`]: true
          }"
          @click="selectAffair(affair)"
        >
          <div class="affair-header">
            <div class="affair-title-row">
              <span class="affair-type">{{ affair.类型 }}</span>
              <span class="affair-urgency" :class="`urgency-${affair.紧急度}`">
                {{ t(affair.紧急度) }}
              </span>
              <span class="affair-difficulty">{{ t(affair.难度) }}</span>
            </div>
            <h3 class="affair-name">{{ affair.名称 }}</h3>
          </div>

          <!-- 展开的详情 -->
          <div v-if="selectedAffair?.id === affair.id" class="affair-details">
            <div class="affair-description">
              <p>{{ affair.描述 }}</p>
              <p v-if="affair.详情" class="affair-details-text">{{ affair.详情 }}</p>
            </div>

            <!-- 选项列表 -->
            <div class="affair-options">
              <p class="options-title">{{ t('处理方案') }}</p>
              <div
                v-for="option in affair.选项"
                :key="option.id"
                class="option-card"
                @click.stop="handleOption(affair, option)"
              >
                <div class="option-header">
                  <span class="option-type" :class="`type-${option.类型}`">
                    {{ t(option.类型) }}
                  </span>
                  <span v-if="option.successRate" class="option-success-rate">
                    {{ t('成功率') }}: {{ Math.round(option.successRate * 100) }}%
                  </span>
                </div>

                <p class="option-description">{{ option.描述 }}</p>

                <!-- 资源消耗 -->
                <div v-if="option.cost" class="option-cost">
                  <span v-if="option.cost.银两" class="cost-item">
                    <Coins :size="12" />
                    {{ formatNumber(option.cost.银两) }}
                  </span>
                  <span v-if="option.cost.粮食" class="cost-item">
                    <Wheat :size="12" />
                    {{ formatNumber(option.cost.粮食) }}
                  </span>
                  <span v-if="option.cost.时间" class="cost-item">
                    <Clock :size="12" />
                    {{ option.cost.时间 }}{{ t(option.cost.时间单位 || '小时') }}
                  </span>
                  <span v-if="option.cost.政绩" class="cost-item">
                    <Star :size="12" />
                    {{ option.cost.政绩 }}
                  </span>
                </div>

                <!-- 预期效果 -->
                <div class="option-effects">
                  <div class="effect-section">
                    <span class="effect-label success">{{ t('成功效果') }}:</span>
                    <span class="effect-value">{{ formatEffect(option.successEffect) }}</span>
                  </div>
                  <div v-if="option.failureEffect" class="effect-section">
                    <span class="effect-label failure">{{ t('失败效果') }}:</span>
                    <span class="effect-value">{{ formatEffect(option.failureEffect) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 处理结果弹窗 -->
    <div v-if="showResultModal" class="modal-overlay" @click="closeResultModal">
      <div class="result-modal" @click.stop>
        <div class="modal-header" :class="resultSuccess ? 'success' : 'failure'">
          <CheckCircle v-if="resultSuccess" :size="24" />
          <XCircle v-else :size="24" />
          <h3>{{ resultSuccess ? t('处理成功') : t('处理失败') }}</h3>
          <button class="modal-close" @click="closeResultModal">
            <X :size="20" />
          </button>
        </div>
        <div class="modal-body">
          <p class="result-description">{{ resultDescription }}</p>

          <!-- 数值变化 -->
          <div v-if="resultChanges && resultChanges.length > 0" class="result-changes">
            <div
              v-for="change in resultChanges"
              :key="change.key"
              class="change-item"
              :class="{ positive: change.value > 0, negative: change.value < 0 }"
            >
              <span class="change-label">{{ t(change.key) }}:</span>
              <span class="change-value">
                {{ change.value > 0 ? '+' : '' }}{{ change.value }}
              </span>
            </div>
          </div>

          <!-- 消耗提示 -->
          <div v-if="resultCost" class="result-cost">
            <p class="cost-title">{{ t('资源消耗') }}:</p>
            <div class="cost-items">
              <span v-if="resultCost.银两" class="cost-item">
                <Coins :size="14" />
                {{ formatNumber(resultCost.银两) }}
              </span>
              <span v-if="resultCost.粮食" class="cost-item">
                <Wheat :size="14" />
                {{ formatNumber(resultCost.粮食) }}
              </span>
              <span v-if="resultCost.时间" class="cost-item">
                <Clock :size="14" />
                {{ resultCost.时间 }}{{ t(resultCost.时间单位 || '小时') }}
              </span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-primary" @click="closeResultModal">
            {{ t('确定') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from '@/i18n';
import { useGameStateStore } from '@/stores/gameStateStore';
import { handleAffair } from '@/utils/governmentAffairHandler';
import type { AffairProcessResult } from '@/utils/governmentAffairHandler';
import {
  FileText,
  Heart,
  Shield,
  Sparkles,
  Coins,
  Wheat,
  BookOpen,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  X,
} from 'lucide-vue-next';

// ============================================================================
// 类型定义
// ============================================================================

interface CountyMetrics {
  民心?: number;
  治安?: number;
  繁荣度?: number;
  库银?: number;
  粮食?: number;
  教化?: number;
}

interface AffairOption {
  id: string;
  描述: string;
  类型: '处理' | '观察' | '搁置' | '委托';
  cost?: {
    银两?: number;
    粮食?: number;
    时间?: number;
    时间单位?: '分钟' | '小时' | '天' | '月';
    政绩?: number;
    威望?: number;
  };
  successRate?: number;
  successEffect: {
    民心?: number;
    治安?: number;
    繁荣度?: number;
    教化?: number;
    库银?: number;
    粮食?: number;
    政绩?: number;
    威望?: number;
    描述?: string;
  };
  failureEffect?: {
    民心?: number;
    治安?: number;
    繁荣度?: number;
    教化?: number;
    库银?: number;
    粮食?: number;
    政绩?: number;
    威望?: number;
    描述?: string;
  };
}

interface GovernmentAffair {
  id: string;
  名称: string;
  类型: string;
  描述: string;
  详情?: string;
  紧急度: '低' | '中' | '高' | '极高';
  难度: '简单' | '普通' | '困难' | '极难';
  选项: AffairOption[];
}

// ============================================================================
// 组件状态
// ============================================================================

const { t } = useI18n();
const gameStateStore = useGameStateStore();

const currentTab = ref<'pending' | 'inProgress' | 'completed'>('pending');
const filterType = ref('');
const filterUrgency = ref('');
const selectedAffair = ref<GovernmentAffair | null>(null);

// 处理结果弹窗
const showResultModal = ref(false);
const resultSuccess = ref(false);
const resultDescription = ref('');
const resultChanges = ref<Array<{ key: string; value: number }>>([]);
const resultCost = ref<AffairOption['cost'] | null>(null);

// ============================================================================
// 标签页配置
// ============================================================================

const tabs = computed(() => [
  {
    key: 'pending',
    label: t('待办'),
    count: gameStateStore.governmentDesk?.待办事项.length || 0,
  },
  {
    key: 'inProgress',
    label: t('进行中'),
    count: gameStateStore.governmentDesk?.正在进行.length || 0,
  },
  {
    key: 'completed',
    label: t('已完成'),
    count: gameStateStore.governmentDesk?.已完成事项?.length || 0,
  },
]);

// ============================================================================
// 县城数值
// ============================================================================

const countyMetrics = computed<CountyMetrics>(() => {
  const location = gameStateStore.location;
  const countyState = location?.县城状态;
  const inventory = gameStateStore.inventory;

  return {
    民心: countyState?.民心 ?? 50,
    治安: countyState?.治安 ?? 50,
    繁荣度: countyState?.发展活力 ?? 50,
    库银: countyState?.库银 ?? 0,
    粮食: countyState?.粮食 ?? 0,
    教化: countyState?.教化 ?? 50,
  };
});

// ============================================================================
// 政务列表
// ============================================================================

const affairTypes = computed(() => {
  const affairs = gameStateStore.governmentDesk?.待办事项 || [];
  const types = new Set(affairs.map((a) => a.类型));
  return Array.from(types);
});

const urgencyLevels = ['低', '中', '高', '极高'] as const;

const currentAffairs = computed(() => {
  if (currentTab.value === 'pending') {
    return gameStateStore.governmentDesk?.待办事项 || [];
  } else if (currentTab.value === 'inProgress') {
    return gameStateStore.governmentDesk?.正在进行 || [];
  } else {
    return gameStateStore.governmentDesk?.已完成事项 || [];
  }
});

const filteredAffairs = computed(() => {
  let affairs = [...currentAffairs.value];

  // 按类型筛选
  if (filterType.value) {
    affairs = affairs.filter((a) => a.类型 === filterType.value);
  }

  // 按紧急度筛选
  if (filterUrgency.value) {
    affairs = affairs.filter((a) => a.紧急度 === filterUrgency.value);
  }

  // 排序：紧急度优先
  const urgencyOrder = { 极高: 0, 高: 1, 中: 2, 低: 3 };
  affairs.sort((a, b) => {
    const orderA = urgencyOrder[a.紧急度] ?? 999;
    const orderB = urgencyOrder[b.紧急度] ?? 999;
    return orderA - orderB;
  });

  return affairs;
});

// ============================================================================
// 方法
// ============================================================================

const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}${t('万')}`;
  }
  return num.toString();
};

const formatEffect = (effect: AffairOption['successEffect']): string => {
  if (!effect) return '';

  const parts: string[] = [];
  const mapping: Record<string, string> = {
    民心: '民心',
    治安: '治安',
    繁荣度: '繁荣度',
    教化: '教化',
    库银: '库银',
    粮食: '粮食',
    政绩: '政绩',
    威望: '威望',
  };

  for (const [key, value] of Object.entries(effect)) {
    if (key !== '描述' && typeof value === 'number') {
      const label = mapping[key] || key;
      const sign = value > 0 ? '+' : '';
      parts.push(`${label} ${sign}${value}`);
    }
  }

  if (effect.描述) {
    parts.push(effect.描述);
  }

  return parts.join(' | ') || t('无特殊效果');
};

const selectAffair = (affair: GovernmentAffair) => {
  if (selectedAffair.value?.id === affair.id) {
    selectedAffair.value = null;
  } else {
    selectedAffair.value = affair;
  }
};

const handleOption = async (affair: GovernmentAffair, option: AffairOption) => {
  try {
    // 调用政务处理逻辑
    const result: AffairProcessResult = await handleAffair(affair.id, affair.选项.indexOf(option));

    // 显示处理结果
    resultSuccess.value = result.success;
    resultDescription.value = result.描述;
    resultCost.value = {
      银两: result.消耗.银两,
      粮食: result.消耗.粮食,
      时间: result.时间推进分钟 / 60, // 转换为小时
      时间单位: '小时' as const,
    };

    // 提取数值变化
    const changes: Array<{ key: string; value: number }> = [];
    const mapping: Record<string, string> = {
      民心: '民心',
      治安: '治安',
      繁荣度: '繁荣度',
      教化: '教化',
      库银: '库银',
      粮食: '粮食',
      政绩: '政绩',
      威望: '威望',
    };

    for (const [key, value] of Object.entries(result.变化)) {
      if (value !== 0) {
        const label = mapping[key] || key;
        changes.push({ key: label, value });
      }
    }
    resultChanges.value = changes;

    showResultModal.value = true;
    selectedAffair.value = null;
  } catch (error) {
    console.error('[GovernmentPanel] 处理政务失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';

    // 显示错误提示
    resultSuccess.value = false;
    resultDescription.value = `处理失败: ${errorMessage}`;
    resultCost.value = null;
    resultChanges.value = [];
    showResultModal.value = true;
  }
};

const closeResultModal = () => {
  showResultModal.value = false;
  resultSuccess.value = false;
  resultDescription.value = '';
  resultChanges.value = [];
  resultCost.value = null;
};

// ============================================================================
// 生命周期
// ============================================================================

onMounted(() => {
  // 如果没有待办事项，添加一些示例数据
  if (!gameStateStore.governmentDesk?.待办事项.length) {
    // 可以在这里触发政务生成逻辑
    console.log('[GovernmentPanel] 暂无待办政务');
  }
});
</script>

<style scoped>
/* ============================================================================
  布局容器
  ============================================================================ */

.government-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #e8e8e8;
}

/* ============================================================================
  县城数值仪表盘
  ============================================================================ */

.county-dashboard {
  padding: 1rem;
  border-bottom: 1px solid rgba(218, 165, 32, 0.2);
  background: rgba(0, 0, 0, 0.3);
}

.dashboard-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #daa520;
}

.title-icon {
  color: #daa520;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(218, 165, 32, 0.2);
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.metric-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(218, 165, 32, 0.4);
  transform: translateY(-2px);
}

.metric-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.metric-icon.support {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.metric-icon.security {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.metric-icon.prosperity {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.metric-icon.silver {
  background: rgba(218, 165, 32, 0.2);
  color: #daa520;
}

.metric-icon.grain {
  background: rgba(234, 179, 8, 0.2);
  color: #eab308;
}

.metric-icon.education {
  background: rgba(139, 92, 246, 0.2);
  color: #8b5cf6;
}

.metric-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.metric-label {
  font-size: 0.75rem;
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.metric-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #f3f4f6;
}

/* ============================================================================
  标签页和筛选
  ============================================================================ */

.affairs-header {
  padding: 1rem;
  border-bottom: 1px solid rgba(218, 165, 32, 0.2);
  background: rgba(0, 0, 0, 0.2);
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tab-button {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: 1px solid rgba(218, 165, 32, 0.3);
  border-radius: 0.375rem;
  color: #9ca3af;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-button:hover {
  background: rgba(218, 165, 32, 0.1);
  border-color: rgba(218, 165, 32, 0.5);
  color: #daa520;
}

.tab-button.active {
  background: rgba(218, 165, 32, 0.2);
  border-color: #daa520;
  color: #daa520;
  font-weight: 600;
}

.tab-count {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.375rem;
  background: rgba(218, 165, 32, 0.3);
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.filters {
  display: flex;
  gap: 0.5rem;
}

.filter-select {
  flex: 1;
  padding: 0.5rem 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(218, 165, 32, 0.3);
  border-radius: 0.375rem;
  color: #e8e8e8;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-select:hover {
  border-color: rgba(218, 165, 32, 0.5);
}

.filter-select:focus {
  outline: none;
  border-color: #daa520;
  box-shadow: 0 0 0 2px rgba(218, 165, 32, 0.1);
}

.filter-select option {
  background: #1a1a2e;
  color: #e8e8e8;
}

/* ============================================================================
  政务列表
  ============================================================================ */

.affairs-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.affairs-list::-webkit-scrollbar {
  width: 0.5rem;
}

.affairs-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}

.affairs-list::-webkit-scrollbar-thumb {
  background: rgba(218, 165, 32, 0.3);
  border-radius: 0.25rem;
}

.affairs-list::-webkit-scrollbar-thumb:hover {
  background: rgba(218, 165, 32, 0.5);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.empty-icon {
  margin-bottom: 1rem;
  color: rgba(218, 165, 32, 0.3);
}

.empty-text {
  font-size: 1rem;
  color: #9ca3af;
  margin-bottom: 0.5rem;
}

.empty-hint {
  font-size: 0.875rem;
  color: #6b7280;
}

/* ============================================================================
  政务卡片
  ============================================================================ */

.affair-item {
  margin-bottom: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(218, 165, 32, 0.2);
  border-radius: 0.5rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.affair-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(218, 165, 32, 0.4);
  transform: translateX(4px);
}

.affair-item.expanded {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(218, 165, 32, 0.5);
}

.affair-item.urgency-极高 {
  border-color: rgba(239, 68, 68, 0.5);
}

.affair-item.urgency-高 {
  border-color: rgba(249, 115, 22, 0.5);
}

.affair-header {
  padding: 0.75rem 1rem;
}

.affair-title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.affair-type {
  padding: 0.125rem 0.5rem;
  background: rgba(218, 165, 32, 0.2);
  border: 1px solid rgba(218, 165, 32, 0.4);
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: #daa520;
}

.affair-urgency {
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.affair-urgency.urgency-低 {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.affair-urgency.urgency-中 {
  background: rgba(234, 179, 8, 0.2);
  color: #eab308;
}

.affair-urgency.urgency-高 {
  background: rgba(249, 115, 22, 0.2);
  color: #f97316;
}

.affair-urgency.urgency-极高 {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.affair-difficulty {
  padding: 0.125rem 0.5rem;
  background: rgba(107, 114, 128, 0.2);
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: #9ca3af;
}

.affair-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #f3f4f6;
}

/* ============================================================================
  政务详情
  ============================================================================ */

.affair-details {
  padding: 0 1rem 1rem;
  border-top: 1px solid rgba(218, 165, 32, 0.1);
}

.affair-description {
  margin: 1rem 0;
  color: #d1d5db;
  line-height: 1.6;
}

.affair-description p {
  margin: 0.25rem 0;
}

.affair-details-text {
  color: #9ca3af;
  font-size: 0.875rem;
  font-style: italic;
}

.options-title {
  margin: 1rem 0 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #daa520;
}

.option-card {
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(218, 165, 32, 0.2);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.option-card:hover {
  background: rgba(0, 0, 0, 0.5);
  border-color: rgba(218, 165, 32, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.option-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.option-type {
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.option-type.type-处理 {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.option-type.type-观察 {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.option-type.type-搁置 {
  background: rgba(107, 114, 128, 0.2);
  color: #9ca3af;
}

.option-type.type-委托 {
  background: rgba(168, 85, 247, 0.2);
  color: #a855f7;
}

.option-success-rate {
  font-size: 0.75rem;
  color: #22c55e;
  font-weight: 600;
}

.option-description {
  margin: 0.5rem 0;
  color: #d1d5db;
  font-size: 0.875rem;
  line-height: 1.5;
}

.option-cost {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(218, 165, 32, 0.1);
}

.cost-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: #fca5a5;
}

.option-effects {
  margin-top: 0.75rem;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.effect-section {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.effect-section:last-child {
  margin-bottom: 0;
}

.effect-label {
  font-weight: 600;
  flex-shrink: 0;
}

.effect-label.success {
  color: #22c55e;
}

.effect-label.failure {
  color: #ef4444;
}

.effect-value {
  color: #9ca3af;
}

/* ============================================================================
  结果弹窗
  ============================================================================ */

.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 1000;
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.result-modal {
  width: 100%;
  max-width: 28rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid rgba(218, 165, 32, 0.4);
  border-radius: 0.75rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(218, 165, 32, 0.2);
  border-radius: 0.75rem 0.75rem 0 0;
}

.modal-header.success {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.modal-header.failure {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.modal-header h3 {
  flex: 1;
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  color: currentColor;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 1.25rem;
}

.result-description {
  margin: 0 0 1rem;
  color: #d1d5db;
  line-height: 1.6;
}

.result-changes {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 0.375rem;
}

.change-item {
  display: flex;
  justify-content: space-between;
  padding: 0.375rem 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.change-item.positive {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.change-item.negative {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.change-label {
  font-weight: 600;
}

.change-value {
  font-weight: 700;
}

.result-cost {
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 0.375rem;
}

.cost-title {
  margin: 0 0 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #fca5a5;
}

.cost-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.modal-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid rgba(218, 165, 32, 0.2);
  border-radius: 0 0 0.75rem 0.75rem;
}

.btn-primary {
  width: 100%;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #daa520 0%, #f59e0b 100%);
  border: none;
  border-radius: 0.5rem;
  color: #1a1a2e;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(218, 165, 32, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
}

/* ============================================================================
  响应式设计
  ============================================================================ */

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .affair-title-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .result-changes {
    grid-template-columns: 1fr;
  }
}
</style>
