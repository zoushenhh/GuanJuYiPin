/**
 * Vue 组件中使用政务处理系统的示例
 *
 * 本文件展示如何在 Vue 组件中集成政务处理功能
 */

// ============================================================================
// 示例 1: 政务面板组件 (GovernmentDeskPanel.vue)
// ============================================================================

/**
 * 政务面板组件
 * 显示待办政务列表，提供处理按钮
 */
/*
<template>
  <div class="government-desk-panel">
    <h2>政务台</h2>

    <!-- 待办事项列表 -->
    <div class="affair-list">
      <div
        v-for="affair in 待办事项"
        :key="affair.id"
        class="affair-item"
        :class="getUrgencyClass(affair.紧急度)"
      >
        <div class="affair-header">
          <span class="affair-name">{{ affair.名称 }}</span>
          <span class="affair-urgency">{{ affair.紧急度 }}</span>
        </div>

        <div class="affair-info">
          <span class="affair-type">{{ affair.类型 }}</span>
          <span class="affair-difficulty">{{ affair.难度 }}</span>
        </div>

        <p class="affair-description">{{ affair.描述 }}</p>

        <div class="affair-deadline" v-if="affair.期限">
          截止时间：{{ affair.期限 }}
        </div>

        <!-- 处理按钮 -->
        <button @click="openAffairDetail(affair)" class="btn-process">
          处理政务
        </button>
      </div>
    </div>

    <!-- 政务详情弹窗 -->
    <AffairDetailModal
      v-if="selectedAffair"
      :affair="selectedAffair"
      @confirm="handleAffairConfirm"
      @close="selectedAffair = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useGameStateStore } from '@/stores/gameStateStore';
import { handleAffair, checkOverdueAffairs } from '@/utils/governmentAffairHandler';
import type { GovernmentAffair } from '@/stores/gameStateStore';

const gameStateStore = useGameStateStore();
const selectedAffair = ref<GovernmentAffair | null>(null);

// 获取待办事项
const 待办事项 = computed(() => gameStateStore.getAffairs());

// 打开政务详情
const openAffairDetail = (affair: GovernmentAffair) => {
  selectedAffair.value = affair;
};

// 处理政务确认
const handleAffairConfirm = async (choiceIndex: number) => {
  if (!selectedAffair.value) return;

  try {
    // 显示加载提示
    showLoading('正在处理政务...');

    // 调用政务处理函数
    const result = await handleAffair(selectedAffair.value.id, choiceIndex);

    // 显示处理结果
    showResult(result);

    // 关闭弹窗
    selectedAffair.value = null;

    // 保存游戏
    await gameStateStore.saveGame();
  } catch (error) {
    // 显示错误信息
    showError(error.message);
  } finally {
    hideLoading();
  }
};

// 显示处理结果
const showResult = (result: any) => {
  const message = `
    处理${result.success ? '成功' : '失败'}！
    ${result.描述}

    消耗：
    ${result.消耗.银两 ? `- 库银：${result.消耗.银两}` : ''}
    ${result.消耗.粮食 ? `- 粮食：${result.消耗.粮食}` : ''}

    变化：
    ${result.变化.民心 ? `- 民心：${result.变化.民心 > 0 ? '+' : ''}${result.变化.民心}` : ''}
    ${result.变化.治安 ? `- 治安：${result.变化.治安 > 0 ? '+' : ''}${result.变化.治安}` : ''}
    ${result.变化.政绩 ? `- 政绩：${result.变化.政绩 > 0 ? '+' : ''}${result.变化.政绩}` : ''}

    时间推进：${Math.floor(result.时间推进分钟 / 60)}小时
  `;

  alert(message);
};

// 获取紧急度样式类
const getUrgencyClass = (urgency: string) => {
  return `urgency-${urgency}`;
};

// 组件挂载时检查逾期政务
onMounted(() => {
  const penalties = checkOverdueAffairs(gameStateStore.gameTime);
  if (penalties.length > 0) {
    console.warn(`⚠️ 检测到 ${penalties.length} 个逾期政务`);
  }
});
</script>

<style scoped>
.government-desk-panel {
  padding: 20px;
}

.affair-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  transition: all 0.3s;
}

.affair-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.urgency-极高 {
  border-left: 4px solid #ff4444;
  background-color: #fff5f5;
}

.urgency-高 {
  border-left: 4px solid #ff8800;
  background-color: #fffbf0;
}

.urgency-中 {
  border-left: 4px solid #ffcc00;
  background-color: #fffff0;
}

.urgency-低 {
  border-left: 4px solid #44cc44;
  background-color: #f0fff0;
}

.affair-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.affair-name {
  font-weight: bold;
  font-size: 18px;
}

.affair-urgency {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.affair-info {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.affair-type,
.affair-difficulty {
  padding: 2px 6px;
  background-color: #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
}

.affair-description {
  margin: 10px 0;
  color: #666;
}

.affair-deadline {
  font-size: 12px;
  color: #999;
  margin-bottom: 10px;
}

.btn-process {
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-process:hover {
  background-color: #45a049;
}
</style>
*/

// ============================================================================
// 示例 2: 政务详情弹窗 (AffairDetailModal.vue)
// ============================================================================

/**
 * 政务详情弹窗组件
 * 显示政务详细信息和可选方案
 */
/*
<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ affair.名称 }}</h3>
        <button @click="$emit('close')" class="btn-close">×</button>
      </div>

      <div class="modal-body">
        <div class="affair-meta">
          <span class="tag">{{ affair.类型 }}</span>
          <span class="tag urgency">{{ affair.紧急度 }}</span>
          <span class="tag difficulty">{{ affair.难度 }}</span>
        </div>

        <p class="affair-description">{{ affair.描述 }}</p>

        <div class="affair-deadline" v-if="affair.期限">
          <strong>截止时间：</strong>{{ affair.期限 }}
        </div>

        <h4>可选方案：</h4>

        <div class="options-list">
          <div
            v-for="(option, index) in affairOptions"
            :key="index"
            class="option-item"
            :class="{ selected: selectedOption === index }"
            @click="selectedOption = index"
          >
            <div class="option-header">
              <input
                type="radio"
                :id="`option-${index}`"
                :value="index"
                v-model="selectedOption"
              />
              <label :for="`option-${index}`">{{ option.description }}</label>
            </div>

            <div class="option-details" v-if="selectedOption === index">
              <div class="option-cost" v-if="option.cost">
                <strong>消耗：</strong>
                <span v-if="option.cost.银两">库银 {{ option.cost.银两 }}</span>
                <span v-if="option.cost.粮食">粮食 {{ option.cost.粮食 }}</span>
                <span v-if="option.cost.时间">
                  时间 {{ option.cost.时间 }} {{ option.cost.时间单位 }}
                </span>
              </div>

              <div class="option-effect">
                <strong>成功效果：</strong>
                <ul>
                  <li v-if="option.successEffect.民心">民心：{{ option.successEffect.民心 }}</li>
                  <li v-if="option.successEffect.治安">治安：{{ option.successEffect.治安 }}</li>
                  <li v-if="option.successEffect.繁荣度">繁荣度：{{ option.successEffect.繁荣度 }}</li>
                  <li v-if="option.successEffect.政绩">政绩：{{ option.successEffect.政绩 }}</li>
                </ul>
              </div>

              <div class="option-failure" v-if="option.failureEffect">
                <strong>失败效果：</strong>
                <ul>
                  <li v-if="option.failureEffect.民心">民心：{{ option.failureEffect.民心 }}</li>
                  <li v-if="option.failureEffect.治安">治安：{{ option.failureEffect.治安 }}</li>
                  <li v-if="option.failureEffect.政绩">政绩：{{ option.failureEffect.政绩 }}</li>
                </ul>
              </div>

              <div class="option-rate" v-if="option.successRate">
                <strong>成功率：</strong>{{ Math.round(option.successRate * 100) }}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-cancel">取消</button>
        <button
          @click="handleConfirm"
          class="btn-confirm"
          :disabled="selectedOption === null"
        >
          确认处理
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { getAffairById } from '@/data/governmentAffairs';
import type { GovernmentAffair } from '@/stores/gameStateStore';

const props = defineProps<{
  affair: GovernmentAffair;
}>();

const emit = defineEmits<{
  (e: 'confirm', choiceIndex: number): void;
  (e: 'close'): void;
}>();

const selectedOption = ref<number | null>(null);

// 获取政务定义和选项
const affairConfig = computed(() => getAffairById(props.affair.id));
const affairOptions = computed(() => affairConfig.value?.options || []);

// 确认处理
const handleConfirm = () => {
  if (selectedOption.value === null) return;
  emit('confirm', selectedOption.value);
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #eee;
}

.affair-meta {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.tag {
  padding: 4px 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
}

.tag.urgency {
  background-color: #fff3cd;
}

.tag.difficulty {
  background-color: #d1ecf1;
}

.option-item {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.option-item:hover {
  background-color: #f9f9f9;
}

.option-item.selected {
  border-color: #4caf50;
  background-color: #f0fff0;
}

.option-details {
  margin-top: 10px;
  padding-left: 20px;
  font-size: 14px;
}

.option-details ul {
  margin: 5px 0;
  padding-left: 20px;
}

.btn-confirm {
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-confirm:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-cancel {
  padding: 8px 16px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
*/

// ============================================================================
// 示例 3: 在游戏主面板中集成政务系统
// ============================================================================

/**
 * 游戏主面板中集成政务系统
 * 在每次推进时间时检查逾期政务、生成新公文
 */
/*
<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useGameStateStore } from '@/stores/gameStateStore';
import { generateDailyAffairs, checkOverdueAffairs } from '@/utils/governmentAffairHandler';

const gameStateStore = useGameStateStore();

// 游戏初始化时生成第一批政务
onMounted(async () => {
  await generateDailyAffairs(gameStateStore.gameTime, {
    最小数量: 3,
    最大数量: 5,
  });
});

// 监听游戏时间变化
watch(
  () => gameStateStore.gameTime,
  async (newTime, oldTime) => {
    if (!newTime || !oldTime) return;

    // 检查是否跨日（日期变化）
    if (newTime.日 !== oldTime.日) {
      console.log('新的一天开始，生成新的日常政务');

      // 生成新的日常政务
      await generateDailyAffairs(newTime, {
        最小数量: 2,
        最大数量: 4,
        仅日常: true,
      });

      // 检查逾期政务
      const penalties = checkOverdueAffairs(newTime);
      if (penalties.length > 0) {
        console.warn(`⚠️ 检测到 ${penalties.length} 个逾期政务`);

        // 显示逾期警告
        penalties.forEach(penalty => {
          console.error(`${penalty.affairName} 逾期${penalty.逾期天数}天`);
          console.error(`惩罚：${penalty.描述}`);
        });
      }
    }
  },
  { deep: true }
);
</script>
*/

export {};
