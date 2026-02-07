/**
 * @fileoverview 政务处理核心逻辑模块
 *
 * 【功能概述】
 * - 处理政务事务的核心函数
 * - 计算资源消耗和数值变化
 * - 推进游戏时间
 * - 生成处理报告
 * - 日常公文生成
 * - 逾期政务检查
 *
 * 【设计理念】
 * - 政务处理是县令模拟器的核心玩法
 * - 每个政务有多个可选方案，每个方案有不同的消耗和效果
 * - 处理结果受县令属性、难度系数影响
 * - 时间推进与政务耗时挂钩
 * - 逾期政务会产生惩罚
 */

import type { GameTime } from '@/types/game';
import { useGameStateStore, type GovernmentAffair as StoreGovernmentAffair } from '@/stores/gameStateStore';
import {
  GOVERNMENT_AFFAIRS,
  getAffairById,
  type AffairOption,
  type GovernmentAffair as ConfigGovernmentAffair,
  type AffairUrgency,
  type AffairDifficulty,
} from '@/data/governmentAffairs';
import {
  calculateActualEffect,
  calculateSuccessRate,
  applyNaturalGrowth,
  checkThresholdPenalties,
  JURISDICTION_VALUE_RANGES,
} from '@/data/jurisdictionConfig';
import { normalizeGameTime, formatGameTimeDetailed } from '@/utils/time';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 政务处理结果
 */
export interface AffairProcessResult {
  /** 是否成功 */
  success: boolean;
  /** 处理后的时间 */
  新时间: GameTime;
  /** 资源消耗 */
  消耗: {
    银两?: number;
    粮食?: number;
    政绩?: number;
    威望?: number;
  };
  /** 数值变化 */
  变化: {
    民心?: number;
    治安?: number;
    繁荣度?: number;
    教化?: number;
    库银?: number;
    粮食?: number;
    政绩?: number;
    威望?: number;
  };
  /** 时间推进（分钟） */
  时间推进分钟: number;
  /** 结果描述 */
  描述: string;
  /** 特殊奖励 */
  特殊奖励?: string[];
  /** 是否触发剧情 */
  触发剧情?: boolean;
  /** 剧情提示词（可选） */
  剧情提示词?: string;
}

/**
 * 日常公文生成选项
 */
export interface DailyAffairOptions {
  /** 最小生成数量 */
  最小数量?: number;
  /** 最大生成数量 */
  最大数量?: number;
  /** 强制类型（可选，用于测试或特殊事件） */
  强制类型?: ConfigGovernmentAffair['type'];
  /** 是否只生成低紧急度的日常事务 */
  仅日常?: boolean;
}

/**
 * 逾期惩罚结果
 */
export interface OverduePenalty {
  /** 政务ID */
  affairId: string;
  /** 政务名称 */
  affairName: string;
  /** 逾期天数 */
  逾期天数: number;
  /** 惩罚效果 */
  惩罚: {
    民心变化?: number;
    治安变化?: number;
    繁荣变化?: number;
  };
  /** 惩罚描述 */
  描述: string;
}

// ============================================================================
// 核心函数：处理政务
// ============================================================================

/**
 * 处理政务事务
 *
 * @param affairId 政务事务ID
 * @param choiceIndex 选项索引（从0开始）
 * @returns 处理结果
 *
 * @example
 * ```typescript
 * const result = await handleAffair('disaster_drought', 0);
 * console.log(result.描述);
 * ```
 */
export async function handleAffair(
  affairId: string,
  choiceIndex: number
): Promise<AffairProcessResult> {
  const gameStateStore = useGameStateStore();

  // 1. 验证输入
  if (!gameStateStore.gameTime) {
    throw new Error('[handleAffair] 游戏时间未初始化');
  }

  // 2. 获取政务定义
  const affairConfig = getAffairById(affairId);
  if (!affairConfig) {
    throw new Error(`[handleAffair] 未找到政务定义: ${affairId}`);
  }

  // 3. 验证选项索引
  if (choiceIndex < 0 || choiceIndex >= affairConfig.options.length) {
    throw new Error(
      `[handleAffair] 选项索引超出范围: ${choiceIndex}（有效范围: 0-${affairConfig.options.length - 1}）`
    );
  }

  const choice = affairConfig.options[choiceIndex];

  // 4. 检查资源是否充足
  const resourceCheck = checkResourceSufficient(choice);
  if (!resourceCheck.充足) {
    throw new Error(`[handleAffair] 资源不足: ${resourceCheck.缺少资源.join(', ')}`);
  }

  // 5. 计算成功率
  const baseSuccessRate = choice.successRate ?? 0.5;
  const actualSuccessRate = calculateSuccessRate(
    baseSuccessRate,
    affairConfig.difficulty,
    getCharacterAttributes(gameStateStore)
  );

  // 6. 判定成功/失败
  const success = Math.random() < actualSuccessRate;

  // 7. 计算时间推进
  const timeAdvanceMinutes = calculateTimeAdvance(choice);
  const newTime = advanceTimeByMinutes(gameStateStore.gameTime, timeAdvanceMinutes);

  // 8. 计算效果
  const baseEffect = success ? choice.successEffect : (choice.failureEffect || choice.successEffect);
  // 移除 描述 字段，只传递数值
  const numericEffect: Record<string, number> = {};
  for (const [key, value] of Object.entries(baseEffect)) {
    if (key !== '描述' && typeof value === 'number') {
      numericEffect[key] = value;
    }
  }
  const actualEffect = calculateActualEffect(
    numericEffect,
    affairConfig.type,
    affairConfig.difficulty,
    getCharacterAttributes(gameStateStore)
  );

  // 9. 应用效果到游戏状态
  applyEffectToGameState(actualEffect, choice.cost);

  // 10. 从政务台移除待办事项
  gameStateStore.removeAffair(affairId, true);

  // 11. 推进游戏时间
  gameStateStore.updateState('gameTime', newTime);

  // 12. 构建结果
  const result: AffairProcessResult = {
    success,
    新时间: newTime,
    消耗: {
      银两: choice.cost?.银两,
      粮食: choice.cost?.粮食,
      政绩: choice.cost?.政绩,
      威望: choice.cost?.威望,
    },
    变化: {
      民心: actualEffect.民心,
      治安: actualEffect.治安,
      繁荣度: actualEffect.繁荣度,
      教化: actualEffect.教化,
      库银: actualEffect.库银,
      粮食: actualEffect.粮食,
      政绩: actualEffect.政绩,
      威望: actualEffect.威望,
    },
    时间推进分钟: timeAdvanceMinutes,
    描述: success
      ? (choice.successEffect.描述 || '处理成功')
      : (choice.failureEffect?.描述 || '处理失败'),
    特殊奖励: success ? choice.specialReward : undefined,
    触发剧情: success && !!affairConfig.aiPrompt,
    剧情提示词: success ? affairConfig.aiPrompt : undefined,
  };

  console.log(`[handleAffair] ✅ 处理完成: ${affairConfig.name} -> ${result.描述}`);
  return result;
}

// ============================================================================
// 辅助函数：资源检查
// ============================================================================

/**
 * 检查资源是否充足
 */
function checkResourceSufficient(
  choice: AffairOption
): { 充足: boolean; 缺少资源: string[] } {
  const gameStateStore = useGameStateStore();
  const 缺少资源: string[] = [];

  // 检查库银
  if (choice.cost?.银两 && choice.cost.银两 > 0) {
    const currentTreasury = getCurrentTreasury();
    if (currentTreasury < choice.cost.银两) {
      缺少资源.push(`库银（需要${choice.cost.银两}，当前${currentTreasury}）`);
    }
  }

  // 检查粮食
  if (choice.cost?.粮食 && choice.cost.粮食 > 0) {
    const currentFood = getCurrentFood();
    if (currentFood < choice.cost.粮食) {
      缺少资源.push(`粮食（需要${choice.cost.粮食}，当前${currentFood}）`);
    }
  }

  // 检查政绩
  if (choice.cost?.政绩 && choice.cost.政绩 > 0) {
    const current政绩 = getCurrent政绩();
    if (current政绩 < choice.cost.政绩) {
      缺少资源.push(`政绩（需要${choice.cost.政绩}，当前${current政绩}）`);
    }
  }

  return {
    充足: 缺少资源.length === 0,
    缺少资源,
  };
}

/**
 * 获取当前库银
 */
function getCurrentTreasury(): number {
  const gameStateStore = useGameStateStore();
  // 从 inventory.货币 中获取库银
  return gameStateStore.inventory?.货币?.库银?.数量 || 0;
}

/**
 * 获取当前粮食
 */
function getCurrentFood(): number {
  const gameStateStore = useGameStateStore();
  // 从 inventory.货币 中获取粮食
  return gameStateStore.inventory?.货币?.粮食?.数量 || 0;
}

/**
 * 获取当前政绩
 */
function getCurrent政绩(): number {
  const gameStateStore = useGameStateStore();
  // 从 attributes.政绩 中获取政绩
  return (gameStateStore.attributes as any)?.政绩?.当前 || 0;
}

/**
 * 获取县令属性
 */
function getCharacterAttributes(gameStateStore: ReturnType<typeof useGameStateStore>): Record<string, number> {
  const attributes = gameStateStore.attributes;
  if (!attributes) return {};

  return {
    智力: (attributes as any).智力?.当前 || 50,
    魅力: (attributes as any).魅力?.当前 || 50,
    政务: (attributes as any).政务?.当前 || 50,
  };
}

// ============================================================================
// 辅助函数：时间计算
// ============================================================================

/**
 * 计算时间推进（分钟）
 */
function calculateTimeAdvance(choice: AffairOption): number {
  if (!choice.cost?.时间) return 0;

  const 时间数值 = choice.cost.时间;
  const 时间单位 = choice.cost.时间单位 || '小时';

  switch (时间单位) {
    case '分钟':
      return 时间数值;
    case '小时':
      return 时间数值 * 60;
    case '天':
      return 时间数值 * 24 * 60;
    case '月':
      return 时间数值 * 30 * 24 * 60;
    default:
      console.warn(`[calculateTimeAdvance] 未知时间单位: ${时间单位}`);
      return 0;
  }
}

/**
 * 按分钟推进时间
 */
function advanceTimeByMinutes(currentTime: GameTime, minutes: number): GameTime {
  const newTime = {
    ...currentTime,
    分钟: currentTime.分钟 + minutes,
  };
  return normalizeGameTime(newTime);
}

// ============================================================================
// 辅助函数：效果应用
// ============================================================================

/**
 * 应用效果到游戏状态
 */
function applyEffectToGameState(
  effect: Record<string, number>,
  cost?: AffairOption['cost']
): void {
  const gameStateStore = useGameStateStore();

  // 应用资源消耗
  if (cost?.银两 && cost.银两 > 0) {
    const currentTreasury = getCurrentTreasury();
    const newTreasury = Math.max(0, currentTreasury - cost.银两);
    gameStateStore.updateState('inventory.货币.库银.数量', newTreasury);
  }

  if (cost?.粮食 && cost.粮食 > 0) {
    const currentFood = getCurrentFood();
    const newFood = Math.max(0, currentFood - cost.粮食);
    gameStateStore.updateState('inventory.货币.粮食.数量', newFood);
  }

  // 应用数值变化
  if (effect.民心) {
    // 假设民心中存储在 worldInfo.辖区统计.民心
    const current民心 = getCurrentStat('民心');
    const newValue = clampValue(current民心 + effect.民心, '民心');
    gameStateStore.updateState('worldInfo.辖区统计.民心.当前', newValue);
  }

  if (effect.治安) {
    const current治安 = getCurrentStat('治安');
    const newValue = clampValue(current治安 + effect.治安, '治安');
    gameStateStore.updateState('worldInfo.辖区统计.治安.当前', newValue);
  }

  if (effect.繁荣度) {
    const current繁荣度 = getCurrentStat('繁荣度');
    const newValue = clampValue(current繁荣度 + effect.繁荣度, '繁荣度');
    gameStateStore.updateState('worldInfo.辖区统计.繁荣度.当前', newValue);
  }

  if (effect.教化) {
    const current教化 = getCurrentStat('教化');
    const newValue = clampValue(current教化 + effect.教化, '教化');
    gameStateStore.updateState('worldInfo.辖区统计.教化.当前', newValue);
  }

  if (effect.库银) {
    const currentTreasury = getCurrentTreasury();
    const newTreasury = clampValue(currentTreasury + effect.库银, '库银');
    gameStateStore.updateState('inventory.货币.库银.数量', newTreasury);
  }

  if (effect.粮食) {
    const currentFood = getCurrentFood();
    const newFood = clampValue(currentFood + effect.粮食, '粮食');
    gameStateStore.updateState('inventory.货币.粮食.数量', newFood);
  }

  if (effect.政绩) {
    const current政绩 = getCurrent政绩();
    const new政绩 = current政绩 + effect.政绩;
    gameStateStore.updateState('attributes.政绩.当前', Math.max(0, new政绩));
  }

  if (effect.威望) {
    const current威望 = (gameStateStore.attributes as any)?.威望?.当前 || 0;
    const new威望 = current威望 + effect.威望;
    gameStateStore.updateState('attributes.威望.当前', Math.max(0, new威望));
  }
}

/**
 * 获取当前辖区统计值
 */
function getCurrentStat(statName: '民心' | '治安' | '繁荣度' | '教化'): number {
  const gameStateStore = useGameStateStore();
  const stats = (gameStateStore.worldInfo as any)?.辖区统计;
  return stats?.[statName]?.当前 || 50;
}

/**
 * 限制数值在有效范围内
 */
function clampValue(
  value: number,
  statName: '民心' | '治安' | '繁荣度' | '教化' | '库银' | '粮食'
): number {
  if (statName === '库银') {
    return Math.max(0, Math.min(TREASURY_CONFIG.最大库银, value));
  }
  if (statName === '粮食') {
    return Math.max(0, Math.min(TREASURY_CONFIG.最大粮食, value));
  }

  const range = JURISDICTION_VALUE_RANGES[statName];
  if (!range) return value;

  return Math.max(range.最小值, Math.min(range.最大值, value));
}

const TREASURY_CONFIG = {
  最大库银: 50000,
  最大粮食: 10000,
};

// ============================================================================
// 日常公文生成
// ============================================================================

/**
 * 生成日常公文
 *
 * @param gameTime 当前游戏时间
 * @param options 生成选项
 * @returns 生成的政务事务数量
 *
 * @example
 * ```typescript
 * const count = await generateDailyAffairs(gameStateStore.gameTime, {
 *   最小数量: 2,
 *   最大数量: 4,
 *   仅日常: true,
 * });
 * console.log(`生成了 ${count} 个日常政务`);
 * ```
 */
export async function generateDailyAffairs(
  gameTime: GameTime,
  options: DailyAffairOptions = {}
): Promise<number> {
  const gameStateStore = useGameStateStore();
  const 最小数量 = options.最小数量 ?? 2;
  const 最大数量 = options.最大数量 ?? 4;

  // 1. 确定生成数量
  const count = Math.floor(Math.random() * (最大数量 - 最小数量 + 1)) + 最小数量;

  // 2. 筛选可用的政务定义
  let availableAffairs = GOVERNMENT_AFFAIRS.filter(affair => {
    // 如果强制指定类型，只返回该类型的政务
    if (options.强制类型) {
      return affair.type === options.强制类型;
    }

    // 如果只生成日常事务，排除高紧急度的政务
    if (options.仅日常) {
      return affair.urgency === '低' || affair.urgency === '中';
    }

    return true;
  });

  // 3. 检查触发条件
  availableAffairs = availableAffairs.filter(affair => {
    if (!affair.triggerCondition) return true;

    const currentRank = (gameStateStore.attributes as any)?.官品?.品级 || 1;
    const currentTreasury = getCurrentTreasury();
    const currentPublicTrust = getCurrentStat('民心');

    if (affair.triggerCondition.minRank !== undefined && currentRank < affair.triggerCondition.minRank) {
      return false;
    }
    if (affair.triggerCondition.maxRank !== undefined && currentRank > affair.triggerCondition.maxRank) {
      return false;
    }
    if (affair.triggerCondition.minTreasury !== undefined && currentTreasury < affair.triggerCondition.minTreasury) {
      return false;
    }
    if (affair.triggerCondition.minPublicTrust !== undefined && currentPublicTrust < affair.triggerCondition.minPublicTrust) {
      return false;
    }

    return true;
  });

  // 4. 根据当前状态调整生成权重
  const currentStats = {
    民心: getCurrentStat('民心'),
    治安: getCurrentStat('治安'),
    繁荣度: getCurrentStat('繁荣度'),
  };

  // 如果民心低，增加救灾/教化类权重
  // 如果治安差，增加剿匪/审案类权重
  // 如果繁荣度低，增加商贸/建设类权重
  const weightedAffairs = applyAffairWeights(availableAffairs, currentStats);

  // 5. 随机选择政务
  const selectedAffairs: ConfigGovernmentAffair[] = [];
  for (let i = 0; i < count; i++) {
    if (weightedAffairs.length === 0) break;

    const randomIndex = Math.floor(Math.random() * weightedAffairs.length);
    const selected = weightedAffairs[randomIndex];
    selectedAffairs.push(selected);

    // 移除已选择的政务（避免重复）
    weightedAffairs.splice(randomIndex, 1);
  }

  // 6. 转换为 Store 格式并添加到政务台
  selectedAffairs.forEach(affairConfig => {
    const storeAffair: StoreGovernmentAffair = {
      id: `${affairConfig.id}_${Date.now()}`, // 添加时间戳避免ID冲突
      名称: affairConfig.name,
      类型: mapAffairType(affairConfig.type),
      描述: affairConfig.description,
      紧急度: mapUrgency(affairConfig.urgency),
      难度: mapDifficulty(affairConfig.difficulty),
      发布时间: formatGameTimeDetailed(gameTime),
      期限: calculateDeadline(gameTime, affairConfig.urgency),
      是否已处理: false,
    };

    gameStateStore.addAffair(storeAffair);
  });

  console.log(`[generateDailyAffairs] ✅ 生成了 ${selectedAffairs.length} 个日常政务`);
  return selectedAffairs.length;
}

/**
 * 应用政务权重（根据当前状态调整生成概率）
 */
function applyAffairWeights(
  affairs: ConfigGovernmentAffair[],
  currentStats: { 民心: number; 治安: number; 繁荣度: number }
): ConfigGovernmentAffair[] {
  // 创建副本并添加权重
  const weightedAffairs = affairs.map(affair => ({
    ...affair,
    weight: 1, // 基础权重
  }));

  // 根据当前状态调整权重
  weightedAffairs.forEach(affair => {
    // 民心低时，增加救灾、教化类权重
    if (currentStats.民心 < 40) {
      if (affair.type === '救灾' || affair.type === '教化') {
        affair.weight *= 2;
      }
    }

    // 治安差时，增加剿匪、审案、巡查类权重
    if (currentStats.治安 < 40) {
      if (affair.type === '剿匪' || affair.type === '审案' || affair.type === '巡查') {
        affair.weight *= 2;
      }
    }

    // 繁荣度低时，增加商贸、建设类权重
    if (currentStats.繁荣度 < 40) {
      if (affair.type === '商贸' || affair.type === '建设') {
        affair.weight *= 1.5;
      }
    }
  });

  // 按权重展开数组（权重越高，出现的次数越多）
  const result: ConfigGovernmentAffair[] = [];
  weightedAffairs.forEach(affair => {
    const count = Math.ceil(affair.weight);
    for (let i = 0; i < count; i++) {
      result.push(affair);
    }
  });

  return result;
}

/**
 * 映射政务类型
 */
function mapAffairType(type: ConfigGovernmentAffair['type']): StoreGovernmentAffair['类型'] {
  const typeMap: Record<string, StoreGovernmentAffair['类型']> = {
    救灾: '民生',
    剿匪: '治安',
    征税: '其他',
    审案: '纠纷',
    巡查: '治安',
    建设: '建设',
    教化: '其他',
    商贸: '其他',
    人事: '其他',
    外交: '其他',
  };
  return typeMap[type] || '其他';
}

/**
 * 映射紧急度
 */
function mapUrgency(urgency: AffairUrgency): StoreGovernmentAffair['紧急度'] {
  const urgencyMap: Record<string, StoreGovernmentAffair['紧急度']> = {
    低: '低',
    中: '中',
    高: '高',
    极高: '极高',
  };
  return urgencyMap[urgency];
}

/**
 * 映射难度
 */
function mapDifficulty(difficulty: AffairDifficulty): StoreGovernmentAffair['难度'] {
  const difficultyMap: Record<string, StoreGovernmentAffair['难度']> = {
    简单: '简单',
    普通: '普通',
    困难: '困难',
    极难: '极难',
  };
  return difficultyMap[difficulty];
}

/**
 * 计算截止时间
 */
function calculateDeadline(gameTime: GameTime, urgency: AffairUrgency): string {
  let hoursToAdd = 0;

  switch (urgency) {
    case '极高':
      hoursToAdd = 6; // 6小时内
      break;
    case '高':
      hoursToAdd = 24; // 1天内
      break;
    case '中':
      hoursToAdd = 72; // 3天内
      break;
    case '低':
      hoursToAdd = 168; // 7天内
      break;
  }

  const deadlineTime = advanceTimeByMinutes(gameTime, hoursToAdd * 60);
  return formatGameTimeDetailed(deadlineTime);
}

// ============================================================================
// 逾期政务检查
// ============================================================================

/**
 * 检查逾期政务并应用惩罚
 *
 * @param currentTime 当前游戏时间
 * @returns 逾期惩罚列表
 *
 * @example
 * ```typescript
 * const penalties = checkOverdueAffairs(gameStateStore.gameTime);
 * penalties.forEach(penalty => {
 *   console.log(`${penalty.affairName} 逾期 ${penalty.逾期天数} 天`);
 *   console.log(`惩罚: ${penalty.描述}`);
 * });
 * ```
 */
export function checkOverdueAffairs(currentTime: GameTime): OverduePenalty[] {
  const gameStateStore = useGameStateStore();
  const 待办事项 = gameStateStore.getAffairs();

  const penalties: OverduePenalty[] = [];

  待办事项.forEach(affair => {
    if (!affair.期限) return;

    const deadline = parseGameTime(affair.期限);
    if (!deadline) return;

    // 比较时间
    if (isTimeAfter(currentTime, deadline)) {
      // 计算逾期天数
      const overdueDays = calculateDaysBetween(deadline, currentTime);

      // 计算惩罚
      const penalty = calculateOverduePenalty(affair, overdueDays);

      // 应用惩罚
      applyOverduePenalty(penalty);

      penalties.push(penalty);
    }
  });

  if (penalties.length > 0) {
    console.log(`[checkOverdueAffairs] ⚠️ 发现 ${penalties.length} 个逾期政务`);
  }

  return penalties;
}

/**
 * 解析游戏时间字符串
 */
function parseGameTime(timeStr: string): GameTime | null {
  // 解析格式: "为官1年2月上旬3日 08:30"
  const match = timeStr.match(/为官(\d+)年(\d+)月(?:上旬|中旬|下旬)?(\d+)日\s+(\d+):(\d+)/);
  if (!match) return null;

  return {
    年: parseInt(match[1]),
    月: parseInt(match[2]),
    日: parseInt(match[3]),
    小时: parseInt(match[4]),
    分钟: parseInt(match[5]),
  };
}

/**
 * 比较两个时间（time1 是否晚于 time2）
 */
function isTimeAfter(time1: GameTime, time2: GameTime): boolean {
  const totalMinutes1 = time1.年 * 365 * 24 * 60 + time1.月 * 30 * 24 * 60 + time1.日 * 24 * 60 + time1.小时 * 60 + time1.分钟;
  const totalMinutes2 = time2.年 * 365 * 24 * 60 + time2.月 * 30 * 24 * 60 + time2.日 * 24 * 60 + time2.小时 * 60 + time2.分钟;

  return totalMinutes1 > totalMinutes2;
}

/**
 * 计算两个时间之间的天数
 */
function calculateDaysBetween(startTime: GameTime, endTime: GameTime): number {
  const totalMinutes1 = startTime.年 * 365 * 24 * 60 + startTime.月 * 30 * 24 * 60 + startTime.日 * 24 * 60 + startTime.小时 * 60 + startTime.分钟;
  const totalMinutes2 = endTime.年 * 365 * 24 * 60 + endTime.月 * 30 * 24 * 60 + endTime.日 * 24 * 60 + endTime.小时 * 60 + endTime.分钟;

  return Math.floor((totalMinutes2 - totalMinutes1) / (24 * 60));
}

/**
 * 计算逾期惩罚
 */
function calculateOverduePenalty(affair: StoreGovernmentAffair, overdueDays: number): OverduePenalty {
  // 基础惩罚
  let 民心变化 = 0;
  let 治安变化 = 0;
  let 繁荣变化 = 0;

  // 根据紧急度调整惩罚
  const urgencyMultipliers: Record<string, number> = {
    '低': 0.5,
    '中': 1,
    '高': 1.5,
    '极高': 2,
  };
  const urgencyMultiplier = urgencyMultipliers[affair.紧急度] || 1;

  // 根据逾期天数递增惩罚
  const daysMultiplier = Math.min(overdueDays * 0.5, 3); // 最多3倍

  // 根据类型调整惩罚
  switch (affair.类型) {
    case '民生':
      民心变化 = -2 * urgencyMultiplier * daysMultiplier;
      break;
    case '治安':
      治安变化 = -3 * urgencyMultiplier * daysMultiplier;
      民心变化 = -1 * urgencyMultiplier * daysMultiplier;
      break;
    case '建设':
      繁荣变化 = -2 * urgencyMultiplier * daysMultiplier;
      民心变化 = -1 * urgencyMultiplier * daysMultiplier;
      break;
    case '纠纷':
      治安变化 = -2 * urgencyMultiplier * daysMultiplier;
      民心变化 = -1 * urgencyMultiplier * daysMultiplier;
      break;
    default:
      民心变化 = -1 * urgencyMultiplier * daysMultiplier;
      break;
  }

  return {
    affairId: affair.id,
    affairName: affair.名称,
    逾期天数: overdueDays,
    惩罚: {
      民心变化: Math.round(民心变化),
      治安变化: Math.round(治安变化),
      繁荣变化: Math.round(繁荣变化),
    },
    描述: `政务"${affair.名称}"逾期${overdueDays}天未处理，导致民心下滑。`,
  };
}

/**
 * 应用逾期惩罚
 */
function applyOverduePenalty(penalty: OverduePenalty): void {
  const gameStateStore = useGameStateStore();

  if (penalty.惩罚.民心变化) {
    const current民心 = getCurrentStat('民心');
    const newValue = clampValue(current民心 + penalty.惩罚.民心变化, '民心');
    gameStateStore.updateState('worldInfo.辖区统计.民心.当前', newValue);
  }

  if (penalty.惩罚.治安变化) {
    const current治安 = getCurrentStat('治安');
    const newValue = clampValue(current治安 + penalty.惩罚.治安变化, '治安');
    gameStateStore.updateState('worldInfo.辖区统计.治安.当前', newValue);
  }

  if (penalty.惩罚.繁荣变化) {
    const current繁荣度 = getCurrentStat('繁荣度');
    const newValue = clampValue(current繁荣度 + penalty.惩罚.繁荣变化, '繁荣度');
    gameStateStore.updateState('worldInfo.辖区统计.繁荣度.当前', newValue);
  }
}
