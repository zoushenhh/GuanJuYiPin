<template>
  <div class="spirit-root-selection-container">
    <div v-if="store.isLoading" class="loading-state">{{ $t('勤能补拙，探查后天...') }}</div>
    <div v-else-if="store.error" class="error-state">{{ $t('推演紊乱：') }}{{ store.error }}</div>

    <div v-else class="spirit-root-layout">
      <!-- 左侧面板：选择和操作 -->
      <div class="spirit-root-left-panel">
        <!-- 顶部功能按钮 -->
        <div class="top-actions-container">
          <button
            v-if="store.isLocalCreation"
            @click="isAdvancedCustomVisible = true"
            class="action-item shimmer-on-hover"
          >
            <span class="action-name">{{ $t('高级自定义') }}</span>
          </button>
          <button
            @click="handleAIGenerate"
            class="action-item shimmer-on-hover"
          >
            <span class="action-name">{{ $t('AI推演') }}</span>
          </button>
        </div>

        <!-- 预设后天列表 -->
        <div class="spirit-root-list-container">
          <div
            class="spirit-root-item"
            :class="{ selected: isRandomSelected }"
            @click="handleSelectRandom"
            @mouseover="activeSpiritRoot = 'random'"
          >
            <span class="spirit-root-name">{{ $t('随机后天') }}</span>
            <span class="spirit-root-cost">{{ $t('0 点') }}</span>
          </div>
          <div class="divider"></div>
          <div
            v-for="root in filteredSpiritRoots"
            :key="root.id"
            class="spirit-root-item"
            :class="{
              selected: store.characterPayload.spirit_root_id === root.id,
              disabled: !canSelect(root),
            }"
            @click="handleSelectSpiritRoot(root)"
            @mouseover="activeSpiritRoot = root"
          >
            <div class="item-content">
              <div class="spirit-root-name-container">
                <span class="spirit-root-name">{{ getSpiritRootBaseName(root.name) }}</span>
                <span v-if="getSpiritRootTier(root)" class="spirit-root-tier" :class="`tier-${getSpiritRootTier(root)}`">
                  {{ getSpiritRootTier(root) }}
                </span>
              </div>
              <span class="spirit-root-cost">{{ root.talent_cost }} {{ $t('点') }}</span>
            </div>
            <div v-if="root.source === 'cloud' && store.isLocalCreation" class="action-buttons">
              <button @click.stop="openEditModal(root)" class="edit-btn" title="编辑此项">
                <Edit :size="14" />
              </button>
              <button @click.stop="handleDeleteSpiritRoot(root.id)" class="delete-btn" title="删除此项">
                <Trash2 :size="14" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧详情 -->
      <div class="spirit-root-details-container">
        <div v-if="activeSpiritRoot" class="spirit-root-details">
          <h2>{{ getActiveDisplayName() }}</h2>
          <div class="description-scroll">
            <p>{{ getActiveDescription() }}</p>
          </div>
          <div class="stats-display">
            <div class="stat-item">
              <span class="stat-label">{{ $t('政务效率:') }}</span>
              <span class="stat-value">{{ getActiveMultiplier() }}x</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">{{ $t('消耗官品点:') }}</span>
              <span class="stat-value">{{ getActiveCost() }}{{ $t('点') }}</span>
            </div>
          </div>
        </div>
        <div v-else class="placeholder">{{ $t('请选择一种后天，或听天由命。') }}</div>
      </div>
    </div>

    <!-- 高级自定义模态框 -->
    <CustomCreationModal
      :visible="isAdvancedCustomVisible"
      :title="$t('高级自定义后天')"
      :fields="advancedCustomFields"
      :validationFn="validateAdvancedCustom"
      @close="isAdvancedCustomVisible = false"
      @submit="handleAdvancedCustomSubmit"
    />
    
    <!-- 编辑模态框 -->
    <CustomCreationModal
      :visible="isEditModalVisible"
      :title="$t('编辑后天')"
      :fields="advancedCustomFields"
      :validationFn="validateAdvancedCustom"
      :initialData="editInitialData"
      @close="isEditModalVisible = false; editingSpiritRoot = null"
      @submit="handleEditSubmit"
    />

    <!-- AI推演输入弹窗 -->
    <AIPromptModal
      :visible="isAIPromptModalVisible"
      @close="isAIPromptModalVisible = false"
      @submit="handleAIPromptSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Trash2, Edit } from 'lucide-vue-next'
import { useCharacterCreationStore } from '../../stores/characterCreationStore'
import type { SpiritRoot } from '../../types'
import CustomCreationModal, { type ModalField } from './CustomCreationModal.vue'
import AIPromptModal from './AIPromptModal.vue'
import { toast } from '../../utils/toast'
import { generateWithRawPrompt } from '../../utils/tavernCore'
import { SPIRIT_ROOT_ITEM_GENERATION_PROMPT } from '../../utils/prompts/tasks/gameElementPrompts'
import { parseJsonFromText } from '@/utils/jsonExtract'

const emit = defineEmits(['ai-generate'])
const store = useCharacterCreationStore()
// UI状态
const activeSpiritRoot = ref<SpiritRoot | 'random' | null>(null)
const isAdvancedCustomVisible = ref(false)
const isEditModalVisible = ref(false)
const isAIPromptModalVisible = ref(false)
const editingSpiritRoot = ref<SpiritRoot | null>(null)

// 后天品级配置 - 完整的县令品级体系
const spiritRootTiers = [
  { key: 'common', name: '凡品', multiplier: 1.0, cost: 0, desc: '平平无奇的普通后天' },
  { key: 'low', name: '下品', multiplier: 1.1, cost: 3, desc: '略有天赋，勉强可用' },
  { key: 'middle', name: '中品', multiplier: 1.3, cost: 6, desc: '资质尚可，小有成就' },
  { key: 'high', name: '上品', multiplier: 1.6, cost: 10, desc: '天赋卓越，前途无量' },
  { key: 'supreme', name: '极品', multiplier: 2.0, cost: 15, desc: '万中无一，天之骄子' },
  { key: 'heaven', name: '卓越', multiplier: 2.4, cost: 20, desc: '出类拔萃，举世罕见' },
  { key: 'divine', name: '超凡', multiplier: 2.8, cost: 25, desc: '超凡脱俗，惊才绝艳' },
  { key: 'special', name: '特殊', multiplier: 0, cost: 0, desc: '特殊体质，另有奥妙' }
]

const filteredSpiritRoots = computed(() => {
  const data = store.creationData.postHeavens || [];
  if (store.isLocalCreation) {
    return data.filter(root =>
      root.source === 'local' || root.source === 'cloud'
    );
  } else {
    return data.filter(root =>
      root.source === 'cloud'
    );
  }
});

// 高级自定义字段 - 使用动态列表格式
// 根据 types/index.ts 中的 SpiritRoot 接口定义字段
const advancedCustomFields: readonly ModalField[] = [
  { key: 'name', label: '后天名称', type: 'text', placeholder: '例如：混沌后天' },
  { key: 'tier', label: '品级', type: 'select', options: spiritRootTiers.map(t => ({ value: t.key, label: t.name })) },
  { key: 'description', label: '后天描述', type: 'textarea', placeholder: '描述这个后天的特性和背景故事...' },
  { key: 'cultivation_speed', label: '施政速度', type: 'text', placeholder: '例如：极快、快速、普通、缓慢' },
  { key: 'base_multiplier', label: '政务效率', type: 'number', placeholder: '例如：1.5' },
  { key: 'talent_cost', label: '消耗官品点', type: 'number', placeholder: '例如：10' },
  { key: 'rarity', label: '稀有度', type: 'number', placeholder: '1-10，数值越高越稀有' },
  {
    key: 'special_effects',
    label: '特殊效果',
    type: 'dynamic-list',
    columns: [
      {
        key: 'effect',
        placeholder: '效果描述，如：雷系法术威力+80%'
      }
    ]
  }
]

// 为自定义后天数据定义完整类型 - 与标准数据格式保持一致
type CustomSpiritRootData = {
  name: string;
  tier: string;
  description: string;
  cultivation_speed: string;
  base_multiplier: string | number;
  talent_cost: string | number;
  rarity: string | number;
  special_effects: { effect: string }[];
};

function validateCustomSpiritRoot(data: Partial<CustomSpiritRootData>) {
    const errors: Record<string, string> = {};

    // 必填字段验证
    if (!data.name?.trim()) errors.name = '后天名称不可为空';
    if (!data.tier) errors.tier = '请选择品级';
    if (!data.description?.trim()) errors.description = '后天描述不可为空';

    // 数值字段验证
    const baseMultiplier = Number(data.base_multiplier);
    if (data.base_multiplier !== undefined && data.base_multiplier !== '' && isNaN(baseMultiplier)) {
      errors.base_multiplier = '政务效率必须为数字';
    }

    const talentCost = Number(data.talent_cost);
    if (data.talent_cost !== undefined && data.talent_cost !== '' && isNaN(talentCost)) {
      errors.talent_cost = '消耗点数必须为数字';
    }

    const rarity = Number(data.rarity);
    if (data.rarity !== undefined && data.rarity !== '' && (isNaN(rarity) || rarity < 1 || rarity > 10)) {
      errors.rarity = '稀有度必须在1-10之间';
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors: Object.values(errors),
    };
}

async function handleCustomSubmit(data: CustomSpiritRootData) {
  // 处理特殊效果数组 - 处理动态列表格式
  const specialEffects = data.special_effects?.length
    ? data.special_effects
        .filter(item => item.effect?.trim())
        .map(item => item.effect.trim())
    : [];

  // 创建完整的标准化后天对象
  const newRoot: SpiritRoot = {
    id: Date.now(),
    name: data.name,
    tier: spiritRootTiers.find(t => t.key === data.tier)?.name || data.tier,
    description: data.description,
    cultivation_speed: data.cultivation_speed || '普通',
    special_effects: specialEffects,
    base_multiplier: Number(data.base_multiplier) || 1.0,
    talent_cost: Number(data.talent_cost) || 0,
    rarity: Number(data.rarity) || 1,
    source: 'cloud' as const // 自定义的都算作cloud
  }

  try {
    store.addSpiritRoot(newRoot);
    handleSelectSpiritRoot(newRoot);
    isAdvancedCustomVisible.value = false;
    toast.success(`自定义后天 "${newRoot.name}" 已保存！`);
  } catch (e) {
    console.error('保存自定义后天失败:', e);
    toast.error('保存自定义后天失败！');
  }
}

const isRandomSelected = computed(() => store.characterPayload.spirit_root_id === null);

// New computed properties for hover display
const activeDisplayName = computed(() => {
 if (activeSpiritRoot.value === 'random') return '随机后天'
 if (activeSpiritRoot.value && typeof activeSpiritRoot.value === 'object') return activeSpiritRoot.value.name
 return ''
});

const activeDescription = computed(() => {
 if (activeSpiritRoot.value === 'random')
   return '时运无常，造化弄人。选择此项，你的后天将完全随机生成，可能出类拔萃，亦可能平庸无奇。'
 if (activeSpiritRoot.value && typeof activeSpiritRoot.value === 'object') return activeSpiritRoot.value.description || '后天信息不明。'
 return '后天信息不明。'
});

const activeCost = computed(() => {
 if (activeSpiritRoot.value === 'random') return 0
 if (activeSpiritRoot.value && typeof activeSpiritRoot.value === 'object') return activeSpiritRoot.value.talent_cost || 0
 return 0
});

const canSelect = (root: SpiritRoot): boolean => {
  if (store.characterPayload.spirit_root_id === root.id) {
    return true;
  }
  const currentCost = store.selectedSpiritRoot?.talent_cost ?? 0;
  const availablePoints = store.remainingTalentPoints + currentCost;
  return availablePoints >= root.talent_cost;
}

function handleSelectSpiritRoot(root: SpiritRoot) {
  if (!canSelect(root)) {
    toast.warning('官品点不足，无法选择此后天。')
    return
  }
  const newRootId = store.characterPayload.spirit_root_id === root.id ? null : root.id;
  store.selectSpiritRoot(newRootId);
}

function handleSelectRandom() {
  store.selectSpiritRoot(null);
}

function handleAIGenerate() {
  if (store.isLocalCreation) {
    isAIPromptModalVisible.value = true;
  } else {
    emit('ai-generate')
  }
}

async function handleAIPromptSubmit(userPrompt: string) {
  const toastId = 'ai-generate-spirit-root';
  toast.loading('智能推演中，请稍候...', { id: toastId });

  try {
    const aiResponse = await generateWithRawPrompt(userPrompt, SPIRIT_ROOT_ITEM_GENERATION_PROMPT, false);

    if (!aiResponse) {
      toast.error('AI推演失败', { id: toastId });
      return;
    }

    console.log('【AI推演-后天】完整响应:', aiResponse);

    // 解析AI返回的JSON
    let parsedRoot: Record<string, unknown>;
    try {
      parsedRoot = parseJsonFromText(aiResponse);
    } catch (parseError) {
      console.error('【AI推演-后天】JSON解析失败:', parseError);
      toast.error('AI推演结果格式错误，无法解析', { id: toastId });
      return;
    }

    // 验证必需字段
    if (!parsedRoot.name && !parsedRoot.名称) {
      toast.error('AI推演结果缺少后天名称', { id: toastId });
      return;
    }

    // 创建后天对象
    const newRoot: SpiritRoot = {
      id: Date.now(),
      name: String(parsedRoot.name || parsedRoot['名称'] || '未命名后天'),
      tier: String(parsedRoot.tier || parsedRoot['品级'] || parsedRoot['等级'] || ''),
      description: String(parsedRoot.description || parsedRoot['描述'] || parsedRoot['说明'] || ''),
      base_multiplier: Number(parsedRoot.base_multiplier || parsedRoot['政务效率']) || 1.0,
      talent_cost: Number(parsedRoot.talent_cost || parsedRoot['官品点消耗'] || parsedRoot['点数消耗']) || 5,
      rarity: Number(parsedRoot.rarity || parsedRoot['稀有度']) || 3,
      source: 'local'
    };

    // 保存并选择后天
    store.addSpiritRoot(newRoot);
    handleSelectSpiritRoot(newRoot);
    isAIPromptModalVisible.value = false;

    toast.success(`AI推演完成！后天 "${newRoot.name}" 已生成`, { id: toastId });

  } catch (e: unknown) {
    console.error('【AI推演-后天】失败:', e);
    const errorMessage = e instanceof Error ? e.message : '未知错误';
    toast.error(`AI推演失败: ${errorMessage}`, { id: toastId });
  }
}

// 解析后天名称和等级
function getSpiritRootBaseName(name: string): string {
  // 现在名称中不再包含品级前缀，直接返回名称
  return name;
}

function getSpiritRootTier(root: SpiritRoot): string {
  // 直接使用tier字段
  return root.tier || '';
}

// 活跃显示相关函数
function getActiveDisplayName(): string {
  return activeDisplayName.value;
}

function getActiveDescription(): string {
  return activeDescription.value;
}

function getActiveMultiplier(): string {
  if (activeSpiritRoot.value === 'random') return '随机'
  if (activeSpiritRoot.value && typeof activeSpiritRoot.value === 'object') return (activeSpiritRoot.value.base_multiplier || 1.0).toString()
  return '1.0'
}

function getActiveCost(): string {
  return activeCost.value.toString();
}

// 高级自定义相关
function validateAdvancedCustom(data: Partial<CustomSpiritRootData>) {
  return validateCustomSpiritRoot(data);
}

function handleAdvancedCustomSubmit(data: CustomSpiritRootData) {
  handleCustomSubmit(data);
}

// 编辑功能
function openEditModal(root: SpiritRoot) {
  editingSpiritRoot.value = root;
  isEditModalVisible.value = true;
}

// 删除功能
async function handleDeleteSpiritRoot(id: number) {
  try {
    await store.removeSpiritRoot(id);
    console.log(`【后天选择】成功删除后天 ID: ${id}`);
  } catch (error) {
    console.error(`【后天选择】删除后天失败 ID: ${id}`, error);
  }
}

async function handleEditSubmit(data: CustomSpiritRootData) {
  if (!editingSpiritRoot.value) return;
  
  // 处理特殊效果数组
  const specialEffects = data.special_effects?.length
    ? data.special_effects
        .filter(item => item.effect?.trim())
        .map(item => item.effect.trim())
    : [];

  // 创建更新数据对象
  const updateData: Partial<SpiritRoot> = {
    name: data.name,
    tier: spiritRootTiers.find(t => t.key === data.tier)?.name || data.tier,
    description: data.description,
    cultivation_speed: `${data.base_multiplier}x`,
    special_effects: specialEffects,
    base_multiplier: parseFloat(String(data.base_multiplier)) || 1.0,
    talent_cost: parseInt(String(data.talent_cost), 10) || 0
  };

  try {
    const success = store.updateSpiritRoot(editingSpiritRoot.value.id, updateData);
    if (success) {
      isEditModalVisible.value = false;
      editingSpiritRoot.value = null;
      toast.success(`后天 "${updateData.name}" 已更新！`);
    } else {
      toast.error('更新后天失败！');
    }
  } catch (e) {
    console.error('更新后天失败:', e);
    toast.error('更新后天失败！');
  }
}

// 编辑模态框的初始数据
const editInitialData = computed(() => {
  if (!editingSpiritRoot.value) return {};

  return {
    name: editingSpiritRoot.value.name,
    tier: spiritRootTiers.find(t => t.name === editingSpiritRoot.value!.tier)?.key || 'common',
    description: editingSpiritRoot.value.description,
    base_multiplier: editingSpiritRoot.value.base_multiplier?.toString() || '1.0',
    talent_cost: editingSpiritRoot.value.talent_cost.toString(),
    special_effects: editingSpiritRoot.value.special_effects?.map(effect => ({ effect })) || []
  };
});

// fetchData 和 defineExpose 不再需要
</script>

<style scoped>
.spirit-root-selection-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* ========== 深色玻璃拟态风格 ========== */
.loading-state, .error-state, .placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 1.1rem;
  color: #94a3b8;
  font-style: italic;
}

.spirit-root-layout {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1.5rem;
  height: 100%;
  overflow: hidden;
}

/* ========== 左侧面板 ========== */
.spirit-root-left-panel {
  display: flex;
  flex-direction: column;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  overflow: hidden;
}

/* 预设模式样式 */
.spirit-root-list-container {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(147, 197, 253, 0.3) transparent;
}

.spirit-root-list-container::-webkit-scrollbar { width: 6px; }
.spirit-root-list-container::-webkit-scrollbar-track { background: transparent; }
.spirit-root-list-container::-webkit-scrollbar-thumb { background: rgba(147, 197, 253, 0.3); border-radius: 3px; }
.spirit-root-list-container::-webkit-scrollbar-thumb:hover { background: rgba(147, 197, 253, 0.5); }

/* ========== 选项卡样式 ========== */
.spirit-root-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.1rem 1.2rem;
  margin-bottom: 0.6rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid transparent;
  background: rgba(30, 41, 59, 0.4);
}

.item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-grow: 1;
}

/* 按钮组容器 */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  opacity: 0;
  transition: opacity 0.2s;
  margin-left: 0.5rem;
}

.spirit-root-item:hover .action-buttons {
  opacity: 1;
}

.edit-btn, .delete-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #94a3b8;
  cursor: pointer;
  padding: 0.35rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  color: #93c5fd;
  background: rgba(147, 197, 253, 0.1);
}

.delete-btn:hover {
  color: #f87171;
  background: rgba(248, 113, 113, 0.1);
}

.spirit-root-name-container {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.spirit-root-tier {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-align: center;
  min-width: 28px;
  flex-shrink: 0;
}

.spirit-root-tier.tier-下品 {
  background: linear-gradient(135deg, #8B5CF6, #A78BFA);
  color: white;
}

.spirit-root-tier.tier-中品 {
  background: linear-gradient(135deg, #3B82F6, #60A5FA);
  color: white;
}

.spirit-root-tier.tier-上品 {
  background: linear-gradient(135deg, #10B981, #34D399);
  color: white;
}

.spirit-root-tier.tier-极品 {
  background: linear-gradient(135deg, #F59E0B, #FBBF24);
  color: white;
}

.spirit-root-tier.tier-天品 {
  background: linear-gradient(135deg, #EF4444, #F87171);
  color: white;
}

.spirit-root-tier.tier-神品 {
  background: linear-gradient(135deg, #DC2626, #F87171);
  color: white;
}

.spirit-root-tier.tier-特殊 {
  background: linear-gradient(135deg, #7C3AED, #A78BFA);
  color: white;
  border: 1px solid #A78BFA;
}

.spirit-root-tier.tier-凡品 {
  background: rgba(156, 163, 175, 0.2);
  color: #6B7280;
  border: 1px solid #9CA3AF;
}

.spirit-root-item:hover {
  background: rgba(51, 65, 85, 0.6);
  border-color: rgba(147, 197, 253, 0.2);
}

.spirit-root-item.selected {
  background: rgba(30, 58, 138, 0.4);
  border-color: rgba(147, 197, 253, 0.4);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

.spirit-root-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.spirit-root-item.disabled:hover {
  background: rgba(30, 41, 59, 0.4);
  border-color: transparent;
}

.spirit-root-name {
  font-weight: 500;
  color: #f1f5f9;
}

.spirit-root-item.selected .spirit-root-name {
  color: #bfdbfe;
}

.spirit-root-cost {
  color: #fbbf24;
  font-size: 0.85rem;
  font-weight: 500;
}

.divider {
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(147, 197, 253, 0.2), transparent);
  margin: 0.5rem 0;
}

.single-actions-container {
  border-top: 1px solid var(--color-border);
  background: rgba(0, 0, 0, 0.3);
  padding: 0.5rem;
  display: flex;
  gap: 0.5rem;
}

.action-item {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.8rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 1px solid var(--color-border);
  background: var(--color-surface-light);
  color: var(--color-text);
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.action-item:hover {
  background: var(--color-surface-lighter);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.action-name {
  font-weight: 500;
}

/* ========== 右侧详情面板 ========== */
.spirit-root-details-container {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.spirit-root-details {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.spirit-root-details h2 {
  margin: 0 0 1rem 0;
  color: #93c5fd;
  flex-shrink: 0;
  font-size: 1.5rem;
  text-shadow: 0 0 20px rgba(147, 197, 253, 0.3);
}

.description-scroll {
  flex: 1;
  overflow-y: auto;
  line-height: 1.7;
  padding-right: 0.5rem;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(147, 197, 253, 0.3) transparent;
}

.description-scroll p {
  margin: 0;
  white-space: pre-wrap;
  color: #94a3b8;
}

.description-scroll::-webkit-scrollbar { width: 6px; }
.description-scroll::-webkit-scrollbar-track { background: transparent; }
.description-scroll::-webkit-scrollbar-thumb { background: rgba(147, 197, 253, 0.3); border-radius: 3px; }

.cost-display {
  text-align: right;
  font-weight: 600;
  color: #fbbf24;
  flex-shrink: 0;
  margin-top: 1rem;
}

/* 响应式适配 - 手机端优化 */
@media (max-width: 1200px) {
  .spirit-root-layout {
    grid-template-columns: 1fr 1.8fr;
    gap: 1.5rem;
  }
}

@media (max-width: 1024px) {
  .spirit-root-layout {
    grid-template-columns: 1fr 1.5fr;
    gap: 1.2rem;
  }
  
  .spirit-root-details h2 {
    font-size: 1.6rem;
  }
}

@media (max-width: 640px) {
  .top-actions-container {
    flex-wrap: wrap;
    justify-content: stretch;
  }
  .top-actions-container .action-item {
    flex-grow: 1;
    text-align: center;
  }
  .spirit-root-layout {
    /* 改为垂直堆叠布局 */
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    gap: 1rem;
    height: auto;
    overflow: visible;
    padding: 0.8rem;
  }
  
  .spirit-root-left-panel {
    order: 1;
    /* 移除max-height限制，让flex布局正常工作 */
  }
  
  .spirit-root-details-container {
    order: 2;
    min-height: 300px;
  }
  
  .spirit-root-list-container {
    /* 移除max-height限制，让flex布局正常工作 */
    /* 添加触摸滚动优化 */
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
  }
  
  /* 优化触摸体验 */
  .spirit-root-item,
  .action-item {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
}

@media (max-width: 640px) {
  .spirit-root-layout {
    gap: 0.8rem;
    padding: 0.6rem;
  }
  
  
  .spirit-root-list-container {
    padding: 0.5rem;
  }
  
  .spirit-root-item {
    padding: 0.7rem;
    font-size: 0.95rem;
    margin-bottom: 0.4rem;
  }
  
  .single-actions-container {
    padding: 0.5rem;
    gap: 0.4rem;
  }
  
  .action-item {
    padding: 0.7rem 1rem;
    font-size: 0.9rem;
  }
  
  .spirit-root-details-container {
    padding: 1.2rem;
    min-height: 250px;
  }
  
  .spirit-root-details h2 {
    font-size: 1.4rem;
    margin-bottom: 0.8rem;
  }
}

@media (max-width: 480px) {
  .top-actions-container {
    flex-direction: column;
    align-items: stretch;
  }
  .spirit-root-selection-container {
    padding: 0.4rem;
    height: auto;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .spirit-root-layout {
    gap: 0.6rem;
    padding: 0;
    height: auto;
    min-height: 0;
  }
  
  .spirit-root-left-panel {
    border-radius: 6px;
  }
  
  .spirit-root-list-container {
    padding: 0.4rem;
  }
  
  .spirit-root-item {
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
    margin-bottom: 0.3rem;
    border-radius: 4px;
  }
  
  .spirit-root-name {
    font-size: 0.9rem;
  }
  
  .spirit-root-cost {
    font-size: 0.8rem;
  }
  
  .divider {
    margin: 0.3rem 0;
  }
  
  .single-actions-container {
    flex-direction: column;
    gap: 0.4rem;
    padding: 0.4rem;
  }
  
  .action-item {
    padding: 0.6rem;
    font-size: 0.85rem;
    border-radius: 4px;
  }
  
  .spirit-root-details-container {
    padding: 1rem;
    min-height: 200px;
    border-radius: 6px;
  }
  
  .spirit-root-details h2 {
    font-size: 1.3rem;
    margin-bottom: 0.6rem;
  }
  
  .description-scroll {
    font-size: 0.9rem;
    line-height: 1.5;
    padding-right: 0.3rem;
  }
  
  .cost-display {
    font-size: 1rem;
    text-align: center;
    margin-top: 0.8rem;
  }
  
  .placeholder {
    font-size: 1rem;
    padding: 1rem;
    text-align: center;
    min-height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .top-actions-container {
    flex-direction: column;
    align-items: stretch;
    padding: 0.5rem;
  }
  .top-actions-container .action-item {
    text-align: center;
  }
}

@media (max-width: 360px) {
  .spirit-root-selection-container {
    padding: 0.3rem;
  }
  
  .spirit-root-layout {
    gap: 0.4rem;
  }
  
  
  .spirit-root-list-container {
    padding: 0.3rem;
  }
  
  .spirit-root-item {
    padding: 0.5rem 0.6rem;
    font-size: 0.85rem;
    margin-bottom: 0.2rem;
  }
  
  .spirit-root-name {
    font-size: 0.8rem;
  }
  
  .spirit-root-cost {
    font-size: 0.75rem;
  }
  
  .spirit-root-details-container {
    padding: 0.8rem;
    min-height: 180px;
  }
  
  .spirit-root-details h2 {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }
  
  .description-scroll {
    font-size: 0.85rem;
    line-height: 1.4;
  }
  
  .cost-display {
    font-size: 0.9rem;
    margin-top: 0.6rem;
  }
  
  .action-item {
    padding: 0.5rem;
    font-size: 0.8rem;
  }
  
  .placeholder {
    font-size: 0.9rem;
    padding: 0.8rem;
    min-height: 120px;
  }
}

/* 自定义模式样式 */
.stats-display {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.stat-value {
  color: var(--color-accent);
  font-weight: 600;
}

/* 顶部功能按钮 - 深色玻璃拟态风格 */
.top-actions-container {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(30, 41, 59, 0.3);
  justify-content: center;
}

.top-actions-container .action-item {
  padding: 0.5rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(30, 41, 59, 0.6);
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.25s ease;
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
  letter-spacing: 0.05em;
}

.top-actions-container .action-item:hover {
  background: rgba(51, 65, 85, 0.8);
  border-color: rgba(147, 197, 253, 0.3);
  color: #f1f5f9;
}

/* 亮色主题顶部按钮 */
[data-theme="light"] .top-actions-container {
  background: rgba(241, 245, 249, 0.6);
  border-bottom-color: rgba(59, 130, 246, 0.15);
}

[data-theme="light"] .top-actions-container .action-item {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(59, 130, 246, 0.3);
  color: #2563eb;
}

[data-theme="light"] .top-actions-container .action-item:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
  color: #1e40af;
}

/* 兼容新等级名称"仙品" */
.spirit-root-tier.tier-仙品 { background: linear-gradient(135deg, #EF4444, #F87171); color: white; }

/* ========== 亮色主题适配 ========== */
[data-theme="light"] .spirit-root-left-panel,
[data-theme="light"] .spirit-root-details-container {
  background: rgba(248, 250, 252, 0.8);
  border-color: rgba(0, 0, 0, 0.08);
}

[data-theme="light"] .spirit-root-item {
  background: rgba(255, 255, 255, 0.6);
}

[data-theme="light"] .spirit-root-item:hover {
  background: rgba(241, 245, 249, 0.95);
  border-color: rgba(59, 130, 246, 0.2);
}

[data-theme="light"] .spirit-root-item.selected {
  background: rgba(219, 234, 254, 0.8);
  border-color: rgba(59, 130, 246, 0.4);
}

[data-theme="light"] .spirit-root-name {
  color: #1e293b;
}

[data-theme="light"] .spirit-root-item.selected .spirit-root-name {
  color: #1e40af;
}

[data-theme="light"] .spirit-root-details h2 {
  color: #2563eb;
}

[data-theme="light"] .description-scroll p {
  color: #475569;
}

/* 亮色主题下的编辑/删除按钮 */
[data-theme="light"] .edit-btn,
[data-theme="light"] .delete-btn {
  background: rgba(241, 245, 249, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.15);
  color: #475569;
}

[data-theme="light"] .edit-btn:hover {
  color: #2563eb;
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}

[data-theme="light"] .delete-btn:hover {
  color: #dc2626;
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
}
</style>
