/**
 * useCountyState - 县治状态管理
 *
 * 职责：
 * - 管理县治特有的状态（人口、税收、民心、治安、政绩）
 * - 提供县治相关的计算方法
 * - 处理批阅公文、政策实施等核心政务逻辑
 *
 * 核心公式：
 * - 政绩增长 = 效率 × 时间 × 难度系数
 * - 税收 = 人口 × 税率 × 治安系数
 * - 民心变化 = 政策效果 + 突发事件影响
 */

import { computed, ref } from 'vue';
import { useGameStateStore } from '@/stores/gameStateStore';
import { calculateAdministrationSpeed, type AdministrationSpeedInput, type SixSiData } from '@/utils/cultivationSpeedCalculator';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 县治核心状态
 */
export interface CountyStateData {
  // 基础数据
  人口: number;
  人口上限: number;

  // 经济指标
  税收: number;
  税率: number; // 0.1 - 0.5
  库存: {
    粮食: number;
    银两: number;
    材料: number;
  };

  // 民生指标
  民心: number; // 0-100
  治安: number; // 0-100
  教育: number; // 0-100

  // 政务指标
  待办公文: number;
  已办公文: number;
  政绩: number;
  政绩进度: number; // 当前官品进度百分比
}

/**
 * 县治事件
 */
export interface CountyEvent {
  id: string;
  类型: '政策' | '突发事件' | '民生' | '经济' | '治安';
  名称: string;
  描述: string;
  严重程度: '轻微' | '普通' | '严重' | '危急';
  民心影响?: number;
  治安影响?: number;
  经济影响?: number;
  时间: {
    年: number;
    月: number;
    日: number;
  };
  已处理?: boolean;
}

/**
 * 政策配置
 */
export interface PolicyConfig {
  id: string;
  名称: string;
  类型: '民生' | '经济' | '治安' | '教育';
  效果: {
    民心?: number;
    治安?: number;
    经济?: number;
    教育?: number;
  };
  消耗: {
    银两?: number;
    粮食?: number;
    材料?: number;
  };
  实施难度: '容易' | '普通' | '困难' | '极难';
  描述: string;
}

// ============================================================================
// 预设数据
// ============================================================================

/**
 * 默认县治状态
 */
export const DEFAULT_COUNTY_STATE: CountyStateData = {
  人口: 1000,
  人口上限: 5000,

  税收: 0,
  税率: 0.2, // 20%
  库存: {
    粮食: 1000,
    银两: 500,
    材料: 200,
  },

  民心: 50,
  治安: 50,
  教育: 30,

  待办公文: 5,
  已办公文: 0,
  政绩: 0,
  政绩进度: 0,
};

/**
 * 预设政策列表
 */
export const PRESET_POLICIES: PolicyConfig[] = [
  {
    id: 'policy_relax_tax',
    名称: '减免税赋',
    类型: '民生',
    效果: { 民心: 10, 经济: -5 },
    消耗: { 银两: 100 },
    实施难度: '容易',
    描述: '减轻百姓税赋负担，提升民心',
  },
  {
    id: 'policy_crackdown',
    名称: '严打盗匪',
    类型: '治安',
    效果: { 治安: 15, 民心: -5 },
    消耗: { 银两: 200 },
    实施难度: '普通',
    描述: '派遣官兵清剿盗匪，提升治安',
  },
  {
    id: 'policy_build_school',
    名称: '兴办学堂',
    类型: '教育',
    效果: { 教育: 20, 民心: 5 },
    消耗: { 银两: 300, 粮食: 100 },
    实施难度: '困难',
    描述: '建立学堂，提升教育水平',
  },
  {
    id: 'policy_repair_infrastructure',
    名称: '修缮水利',
    类型: '经济',
    效果: { 经济: 15, 民心: 10 },
    消耗: { 银两: 400, 材料: 200 },
    实施难度: '普通',
    描述: '修缮水利设施，促进农业生产',
  },
];

// ============================================================================
// Composable
// ============================================================================

export function useCountyState() {
  const gameState = useGameStateStore();

  // 本地状态（县治特有）
  const countyState = ref<CountyStateData>({ ...DEFAULT_COUNTY_STATE });
  const pendingEvents = ref<CountyEvent[]>([]);
  const eventHistory = ref<CountyEvent[]>([]);
  const activePolicies = ref<PolicyConfig[]>([]);

  // ==================== 只读计算属性 ====================

  /**
   * 当前官品（从 attributes 获取）
   */
  const currentRank = computed(() => {
    const rank = gameState.attributes?.官品;
    if (typeof rank === 'object' && rank !== null) {
      return rank.名称 || '九品';
    }
    if (typeof rank === 'string') {
      return rank;
    }
    return '九品';
  });

  /**
   * 当前官品阶段
   */
  const currentRankStage = computed(() => {
    const rank = gameState.attributes?.官品;
    if (typeof rank === 'object' && rank !== null) {
      return rank.阶段 || '初期';
    }
    return '初期';
  });

  /**
   * 当前官品进度
   */
  const currentRankProgress = computed(() => {
    const rank = gameState.attributes?.官品;
    if (typeof rank === 'object' && rank !== null) {
      return rank.当前进度 ?? 0;
    }
    return 0;
  });

  /**
   * 民心支持度描述
   */
  const publicSupportDescription = computed(() => {
    const support = countyState.value.民心;
    if (support >= 80) return '民心鼎盛';
    if (support >= 60) return '民心安稳';
    if (support >= 40) return '民心平平';
    if (support >= 20) return '民心不稳';
    return '民心动荡';
  });

  /**
   * 治安状况描述
   */
  const securityDescription = computed(() => {
    const security = countyState.value.治安;
    if (security >= 80) return '路不拾遗';
    if (security >= 60) return '治安良好';
    if (security >= 40) return '治安一般';
    if (security >= 20) return '盗匪横行';
    return '民不聊生';
  });

  // ==================== 核心计算方法 ====================

  /**
   * 计算税收
   * 公式：税收 = 人口 × 税率 × 治安系数 × 民心系数
   */
  const calculateTaxRevenue = (): number => {
    const baseTax = countyState.value.人口 * countyState.value.税率;
    const securityFactor = countyState.value.治安 / 100;
    const supportFactor = countyState.value.民心 / 100;
    return Math.floor(baseTax * securityFactor * supportFactor);
  };

  /**
   * 计算民心变化
   * @param policyEffect 政策效果
   * @param randomEventEffect 随机事件影响
   */
  const calculatePublicSupportChange = (policyEffect: number, randomEventEffect: number = 0): number => {
    const change = policyEffect + randomEventEffect;
    const newValue = countyState.value.民心 + change;
    // 限制在 0-100 范围内
    countyState.value.民心 = Math.max(0, Math.min(100, newValue));
    return change;
  };

  /**
   * 计算治安变化
   */
  const calculateSecurityChange = (policyEffect: number, randomEventEffect: number = 0): number => {
    const change = policyEffect + randomEventEffect;
    const newValue = countyState.value.治安 + change;
    countyState.value.治安 = Math.max(0, Math.min(100, newValue));
    return change;
  };

  /**
   * 计算人口增长
   * 基于民心、治安、粮食库存
   */
  const calculatePopulationGrowth = (): number => {
    const { 人口, 人口上限, 库存, 民心, 治安 } = countyState.value;

    // 粮食不足时人口减少
    if (库存.粮食 < 人口 * 0.1) {
      const decrease = Math.floor(人口 * 0.01);
      countyState.value.人口 = Math.max(100, 人口 - decrease);
      return -decrease;
    }

    // 民心和治安都较好时人口增长
    if (民心 >= 60 && 治安 >= 60 && 人口 < 人口上限) {
      const growth = Math.floor(人口 * 0.005);
      countyState.value.人口 = Math.min(人口上限, 人口 + growth);
      return growth;
    }

    return 0;
  };

  // ==================== 政务操作方法 ====================

  /**
   * 批阅公文获得政绩
   * @param count 批阅公文数量
   */
  const reviewDocuments = (count: number = 1): {
    政绩增加: number;
    新政绩: number;
    剩余公文: number;
  } => {
    if (countyState.value.待办公文 <= 0) {
      return {
        政绩增加: 0,
        新政绩: countyState.value.政绩,
        剩余公文: 0,
      };
    }

    const actualCount = Math.min(count, countyState.value.待办公文);

    // 构建施政速度计算输入
    const input: AdministrationSpeedInput = {
      民心支持度: countyState.value.民心,

      先天六司: (gameState.character?.先天六司 || {}) as SixSiData,
      后天六司: (gameState.character?.后天六司 || {}) as SixSiData,

      当前效果: gameState.effects || undefined,
      方略品质: (gameState.cultivation as any)?.政绩方略?.品质,
      施政进度: (gameState.cultivation as any)?.政绩方略?.政绩进度,

      当前官品: currentRank.value,
      当前阶段: currentRankStage.value,
      当前进度: currentRankProgress.value,
      下一级所需: (gameState.attributes?.官品 as any)?.下一级所需 || 100,

      环境加成: 0.1, // 在县衙办公有加成
    };

    const result = calculateAdministrationSpeed(input);
    const meritGain = Math.floor(result.最终速度 * actualCount);

    countyState.value.政绩 += meritGain;
    countyState.value.待办公文 -= actualCount;
    countyState.value.已办公文 += actualCount;

    return {
      政绩增加: meritGain,
      新政绩: countyState.value.政绩,
      剩余公文: countyState.value.待办公文,
    };
  };

  /**
   * 收取税收
   */
  const collectTax = (): {
    税收: number;
    新银两: number;
  } => {
    const revenue = calculateTaxRevenue();
    countyState.value.税收 = revenue;
    countyState.value.库存.银两 += revenue;

    // 收税会略微降低民心
    calculatePublicSupportChange(-2);

    return {
      税收: revenue,
      新银两: countyState.value.库存.银两,
    };
  };

  /**
   * 实施政策
   */
  const implementPolicy = (policy: PolicyConfig): {
    成功: boolean;
    消息: string;
  } => {
    // 检查资源是否足够
    if (policy.消耗.银两 && countyState.value.库存.银两 < policy.消耗.银两) {
      return { 成功: false, 消息: '银两不足' };
    }
    if (policy.消耗.粮食 && countyState.value.库存.粮食 < policy.消耗.粮食) {
      return { 成功: false, 消息: '粮食不足' };
    }
    if (policy.消耗.材料 && countyState.value.库存.材料 < policy.消耗.材料) {
      return { 成功: false, 消息: '材料不足' };
    }

    // 扣除消耗
    if (policy.消耗.银两) countyState.value.库存.银两 -= policy.消耗.银两;
    if (policy.消耗.粮食) countyState.value.库存.粮食 -= policy.消耗.粮食;
    if (policy.消耗.材料) countyState.value.库存.材料 -= policy.消耗.材料;

    // 应用效果
    if (policy.效果.民心) calculatePublicSupportChange(policy.效果.民心);
    if (policy.效果.治安) calculateSecurityChange(policy.效果.治安);

    // 添加到活跃政策
    activePolicies.value.push(policy);

    return { 成功: true, 消息: `成功实施政策：${policy.名称}` };
  };

  /**
   * 处理突发事件
   */
  const handleEvent = (event: CountyEvent): {
    成功: boolean;
    结果: string;
  } => {
    // 应用事件影响
    if (event.民心影响) {
      calculatePublicSupportChange(event.民心影响);
    }
    if (event.治安影响) {
      calculateSecurityChange(event.治安影响);
    }
    if (event.经济影响) {
      countyState.value.库存.银两 += event.经济影响;
    }

    // 标记为已处理
    event.已处理 = true;
    eventHistory.value.push({ ...event });

    // 从待处理列表移除
    const index = pendingEvents.value.findIndex(e => e.id === event.id);
    if (index >= 0) {
      pendingEvents.value.splice(index, 1);
    }

    return {
      成功: true,
      结果: `已处理事件：${event.名称}`,
    };
  };

  /**
   * 生成新的突发事件
   */
  const generateRandomEvent = (): CountyEvent | null => {
    const events: Omit<CountyEvent, 'id'>[] = [
      {
        类型: '突发事件',
        名称: '盗匪袭扰',
        描述: '有盗匪在县境出没，百姓人心惶惶',
        严重程度: '普通',
        治安影响: -10,
        民心影响: -5,
        时间: { 年: 1, 月: 1, 日: 1 },
      },
      {
        类型: '民生',
        名称: '干旱灾害',
        描述: '连月干旱，庄稼歉收',
        严重程度: '严重',
        经济影响: -200,
        民心影响: -15,
        时间: { 年: 1, 月: 1, 日: 1 },
      },
      {
        类型: '经济',
        名称: '商队过境',
        描述: '有商队经过县境，带来商机',
        严重程度: '轻微',
        经济影响: 150,
        时间: { 年: 1, 月: 1, 日: 1 },
      },
    ];

    const randomIndex = Math.floor(Math.random() * events.length);
    const event = events[randomIndex];

    return {
      ...event,
      id: `event_${Date.now()}_${randomIndex}`,
    };
  };

  /**
   * 更新县治状态（每旬调用）
   */
  const updateCountyState = (): {
    税收: number;
    人口变化: number;
    新公文: number;
  } => {
    // 收税
    const taxResult = collectTax();

    // 人口变化
    const popChange = calculatePopulationGrowth();

    // 生成新公文（随机）
    const newDocuments = Math.floor(Math.random() * 3) + 1;
    countyState.value.待办公文 += newDocuments;

    // 有概率生成突发事件
    if (Math.random() < 0.3) {
      const newEvent = generateRandomEvent();
      if (newEvent) {
        pendingEvents.value.push(newEvent);
      }
    }

    return {
      税收: taxResult.税收,
      人口变化: popChange,
      新公文: newDocuments,
    };
  };

  /**
   * 重置县治状态
   */
  const resetCountyState = () => {
    countyState.value = { ...DEFAULT_COUNTY_STATE };
    pendingEvents.value = [];
    eventHistory.value = [];
    activePolicies.value = [];
  };

  // ==================== 返回接口 ====================

  return {
    // 状态
    countyState,
    pendingEvents,
    eventHistory,
    activePolicies,

    // 计算属性
    currentRank,
    currentRankStage,
    currentRankProgress,
    publicSupportDescription,
    securityDescription,

    // 计算方法
    calculateTaxRevenue,
    calculatePublicSupportChange,
    calculateSecurityChange,
    calculatePopulationGrowth,

    // 政务操作
    reviewDocuments,
    collectTax,
    implementPolicy,
    handleEvent,
    generateRandomEvent,
    updateCountyState,

    // 工具方法
    resetCountyState,

    // 常量
    DEFAULT_COUNTY_STATE,
    PRESET_POLICIES,
  };
}
