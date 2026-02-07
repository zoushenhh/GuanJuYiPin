/**
 * @fileoverview 县城数值配置
 * 定义县城治理系统的基准值、自然增长率、政务影响系数等数值参数
 *
 * 【设计理念】
 * - 提供平衡的初始数值，确保游戏可玩性
 * - 通过自然增长率模拟县城动态发展
 * - 政务影响系数体现不同事务的重要性
 * - 数值范围限制防止极端情况
 */

// ============================================================================
// 核心数值范围配置
// ============================================================================

/**
 * 县城核心指标范围
 */
export interface JurisdictionValueRange {
  最小值: number;
  最大值: number;
  初始值: number;
  警戒值: number;  // 低于此值会产生负面影响
  优秀值: number;  // 高于此值会产生额外加成
}

/**
 * 核心指标范围配置
 */
export const JURISDICTION_VALUE_RANGES: Record<'民心' | '治安' | '繁荣度' | '教化', JurisdictionValueRange> = {
  民心: {
    最小值: 0,
    最大值: 100,
    初始值: 60,
    警戒值: 30,
    优秀值: 80,
  },
  治安: {
    最小值: 0,
    最大值: 100,
    初始值: 70,
    警戒值: 40,
    优秀值: 85,
  },
  繁荣度: {
    最小值: 0,
    最大值: 100,
    初始值: 50,
    警戒值: 30,
    优秀值: 75,
  },
  教化: {
    最小值: 0,
    最大值: 100,
    初始值: 40,
    警戒值: 20,
    优秀值: 70,
  },
};

/**
 * 财政资源配置
 */
export interface TreasuryConfig {
  初始库银: number;
  初始粮食: number;
  最小库银: number;  // 低于此值无法进行消耗库银的操作
  最大库银: number;  // 库银上限
  最小粮食: number;
  最大粮食: number;
}

/**
 * 财政配置
 */
export const TREASURY_CONFIG: TreasuryConfig = {
  初始库银: 1000,
  初始粮食: 500,
  最小库银: 0,
  最大库银: 50000,
  最小粮食: 0,
  最大粮食: 10000,
};

// ============================================================================
// 自然增长率配置
// ============================================================================

/**
 * 自然增长率配置
 *
 * 定义各指标在无外部干预情况下的自然变化趋势
 */
export interface NaturalGrowthRate {
  /** 每日自然变化 */
  每日变化: number;
  /** 每周自然变化 */
  每周变化: number;
  /** 每月自然变化 */
  每月变化: number;
  /** 是否有上限/下限约束 */
  约束?: {
    最小值?: number;
    最大值?: number;
  };
}

/**
 * 自然增长率配置表
 */
export const NATURAL_GROWTH_RATES: Record<'民心' | '治安' | '繁荣度' | '教化', NaturalGrowthRate> = {
  民心: {
    每日变化: 0.05,
    每周变化: 0.3,
    每月变化: 1.0,
    约束: {
      最小值: 20,
      最大值: 90,
    },
  },
  治安: {
    每日变化: 0.03,
    每周变化: 0.2,
    每月变化: 0.8,
    约束: {
      最小值: 30,
      最大值: 95,
    },
  },
  繁荣度: {
    每日变化: 0.02,
    每周变化: 0.1,
    每月变化: 0.5,
    约束: {
      最小值: 10,
      最大值: 95,
    },
  },
  教化: {
    每日变化: 0.04,
    每周变化: 0.25,
    每月变化: 1.0,
    约束: {
      最小值: 10,
      最大值: 95,
    },
  },
};

/**
 * 财政自然增长率
 */
export const TREASURY_GROWTH_RATES = {
  /** 库银每日自然消耗（衙门开销） */
  库银每日消耗: 5,
  /** 粮食每日自然消耗（损耗） */
  粮食每日消耗: 2,
  /** 税收自然增长系数（基于繁荣度） */
  税收增长系数: 0.1,  // 每1点繁荣度每月增加0.1银两税收
};

// ============================================================================
// 政务影响系数配置
// ============================================================================

/**
 * 政务影响系数
 *
 * 定义不同类型政务事务对各项指标的影响倍率
 * 基础影响 × 倍率 = 实际影响
 */
export interface AffairImpactMultiplier {
  民心倍率: number;
  治安倍率: number;
  繁荣度倍率: number;
  教化倍率: number;
  库银倍率: number;
  粮食倍率: number;
  政绩倍率: number;
  威望倍率: number;
}

/**
 * 政务类型影响系数表
 */
export const AFFAIR_IMPACT_MULTIPLIERS: Record<string, AffairImpactMultiplier> = {
  // 救灾类：主要影响民心、治安
  救灾: {
    民心倍率: 1.2,
    治安倍率: 1.0,
    繁荣度倍率: 0.5,
    教化倍率: 0.3,
    库银倍率: 1.0,
    粮食倍率: 1.5,
    政绩倍率: 1.3,
    威望倍率: 1.1,
  },

  // 剿匪类：主要影响治安
  剿匪: {
    民心倍率: 0.8,
    治安倍率: 1.5,
    繁荣度倍率: 0.3,
    教化倍率: 0.2,
    库银倍率: 1.0,
    粮食倍率: 0.5,
    政绩倍率: 1.2,
    威望倍率: 1.4,
  },

  // 征税类：主要影响库银、民心
  征税: {
    民心倍率: 1.3,
    治安倍率: 0.5,
    繁荣度倍率: 0.6,
    教化倍率: 0.3,
    库银倍率: 2.0,
    粮食倍率: 0.3,
    政绩倍率: 1.5,
    威望倍率: 0.5,
  },

  // 审案类：影响治安、民心、教化
  审案: {
    民心倍率: 1.0,
    治安倍率: 1.2,
    繁荣度倍率: 0.4,
    教化倍率: 1.0,
    库银倍率: 0.5,
    粮食倍率: 0.3,
    政绩倍率: 1.1,
    威望倍率: 0.8,
  },

  // 巡查类：微量影响各项
  巡查: {
    民心倍率: 0.8,
    治安倍率: 1.0,
    繁荣度倍率: 0.5,
    教化倍率: 0.3,
    库银倍率: 0.3,
    粮食倍率: 0.2,
    政绩倍率: 0.6,
    威望倍率: 0.4,
  },

  // 建设类：主要影响繁荣度、民心
  建设: {
    民心倍率: 1.1,
    治安倍率: 0.5,
    繁荣度倍率: 1.5,
    教化倍率: 0.8,
    库银倍率: 1.0,
    粮食倍率: 0.3,
    政绩倍率: 1.4,
    威望倍率: 1.2,
  },

  // 教化类：主要影响教化、民心
  教化: {
    民心倍率: 1.0,
    治安倍率: 0.5,
    繁荣度倍率: 0.4,
    教化倍率: 1.8,
    库银倍率: 0.3,
    粮食倍率: 0.2,
    政绩倍率: 1.0,
    威望倍率: 1.0,
  },

  // 商贸类：主要影响繁荣度、库银
  商贸: {
    民心倍率: 0.6,
    治安倍率: 0.4,
    繁荣度倍率: 1.6,
    教化倍率: 0.3,
    库银倍率: 1.8,
    粮食倍率: 0.3,
    政绩倍率: 0.8,
    威望倍率: 0.5,
  },

  // 人事类：影响政绩、威望
  人事: {
    民心倍率: 0.5,
    治安倍率: 0.5,
    繁荣度倍率: 0.3,
    教化倍率: 0.3,
    库银倍率: 0.5,
    粮食倍率: 0.2,
    政绩倍率: 1.6,
    威望倍率: 1.3,
  },

  // 外交类：影响威望、政绩
  外交: {
    民心倍率: 0.4,
    治安倍率: 0.3,
    繁荣度倍率: 0.6,
    教化倍率: 0.3,
    库银倍率: 0.8,
    粮食倍率: 0.3,
    政绩倍率: 1.2,
    威望倍率: 1.8,
  },
};

// ============================================================================
// 难度和属性修正系数
// ============================================================================

/**
 * 难度修正系数
 *
 * 政务难度影响成功率和效果
 */
export const DIFFICULTY_MULTIPLIERS: Record<string, { 成功率修正: number; 效果修正: number }> = {
  简单: {
    成功率修正: 1.2,  // 成功率 +20%
    效果修正: 0.8,    // 效果 -20%
  },
  普通: {
    成功率修正: 1.0,  // 无修正
    效果修正: 1.0,    // 无修正
  },
  困难: {
    成功率修正: 0.8,  // 成功率 -20%
    效果修正: 1.3,    // 效果 +30%
  },
  极难: {
    成功率修正: 0.6,  // 成功率 -40%
    效果修正: 1.6,    // 效果 +60%
  },
};

/**
 * 属性修正系数
 *
 * 县令属性影响政务成功率
 */
export interface AttributeBonusConfig {
  /** 属性名称 */
  属性: string;
  /** 对成功率的加成（每1点属性加成） */
  成功率加成: number;
  /** 对效果的影响（每1点属性影响） */
  效果加成: number;
}

/**
 * 属性加成配置表
 */
export const ATTRIBUTE_BONUS_CONFIGS: AttributeBonusConfig[] = [
  {
    属性: '智力',
    成功率加成: 0.01,  // 每1点智力 +1% 成功率
    效果加成: 0.005,   // 每1点智力 +0.5% 效果
  },
  {
    属性: '魅力',
    成功率加成: 0.008, // 每1点魅力 +0.8% 成功率
    效果加成: 0.01,    // 每1点魅力 +1% 效果（民心加成）
  },
  {
    属性: '政务',
    成功率加成: 0.015, // 每1点政务 +1.5% 成功率
    效果加成: 0.008,   // 每1点政务 +0.8% 效果
  },
];

// ============================================================================
// 警戒值惩罚配置
// ============================================================================

/**
 * 警戒值惩罚效果
 *
 * 当指标低于警戒值时触发的负面效果
 */
export interface ThresholdPenalty {
  /** 触发条件（低于警戒值多少） */
  触发阈值: number;
  /** 惩罚效果 */
  惩罚效果: {
    民心变化?: number;
    治安变化?: number;
    繁荣度变化?: number;
    教化变化?: number;
    库银变化?: number;
  };
  /** 描述 */
  描述: string;
}

/**
 * 警戒值惩罚配置表
 */
export const THRESHOLD_PENALTIES: Record<'民心' | '治安' | '繁荣度' | '教化', ThresholdPenalty[]> = {
  民心: [
    {
      触发阈值: 30,
      惩罚效果: {
        治安变化: -0.5,
        繁荣度变化: -0.3,
      },
      描述: '民心低落，治安恶化，商贸萧条。',
    },
    {
      触发阈值: 20,
      惩罚效果: {
        治安变化: -1.0,
        繁荣度变化: -0.5,
        库银变化: -5,
      },
      描述: '民怨沸腾，可能爆发民变。',
    },
    {
      触发阈值: 10,
      惩罚效果: {
        治安变化: -2.0,
        繁荣度变化: -1.0,
        库银变化: -10,
      },
      描述: '民不聊生，县城濒临崩溃。',
    },
  ],
  治安: [
    {
      触发阈值: 40,
      惩罚效果: {
        民心变化: -0.3,
        繁荣度变化: -0.5,
      },
      描述: '治安恶化，盗匪横行。',
    },
    {
      触发阈值: 30,
      惩罚效果: {
        民心变化: -0.8,
        繁荣度变化: -1.0,
        库银变化: -5,
      },
      描述: '县城秩序混乱，百姓惶恐。',
    },
    {
      触发阈值: 20,
      惩罚效果: {
        民心变化: -1.5,
        繁荣度变化: -2.0,
        库银变化: -10,
      },
      描述: '盗匪猖獗，县城陷入混乱。',
    },
  ],
  繁荣度: [
    {
      触发阈值: 30,
      惩罚效果: {
        民心变化: -0.2,
        库银变化: -2,
      },
      描述: '经济萧条，百姓生活困难。',
    },
    {
      触发阈值: 20,
      惩罚效果: {
        民心变化: -0.5,
        库银变化: -5,
      },
      描述: '百业凋敝，财政困难。',
    },
  ],
  教化: [
    {
      触发阈值: 20,
      惩罚效果: {
        治安变化: -0.3,
      },
      描述: '教化不足，民风粗野。',
    },
  ],
};

/**
 * 优秀值额外奖励
 *
 * 当指标高于优秀值时触发的正面效果
 */
export interface EXCELLENCE_BONUS {
  /** 触发条件（高于优秀值多少） */
  触发阈值: number;
  /** 奖励效果 */
  奖励效果: {
    民心变化?: number;
    治安变化?: number;
    繁荣度变化?: number;
    教化变化?: number;
    库银变化?: number;
  };
  /** 描述 */
  描述: string;
}

/**
 * 优秀值奖励配置表
 */
export const EXCELLENCE_BONUSES: Record<'民心' | '治安' | '繁荣度' | '教化', EXCELLENCE_BONUS[]> = {
  民心: [
    {
      触发阈值: 80,
      奖励效果: {
        治安变化: 0.3,
        繁荣度变化: 0.2,
      },
      描述: '民心拥戴，治安良好，商贸兴旺。',
    },
    {
      触发阈值: 90,
      奖励效果: {
        治安变化: 0.5,
        繁荣度变化: 0.3,
        库银变化: 5,
      },
      描述: '万民拥戴，县城繁荣昌盛。',
    },
  ],
  治安: [
    {
      触发阈值: 85,
      奖励效果: {
        民心变化: 0.2,
        繁荣度变化: 0.3,
      },
      描述: '夜不闭户，百姓安居乐业。',
    },
  ],
  繁荣度: [
    {
      触发阈值: 75,
      奖励效果: {
        民心变化: 0.2,
        库银变化: 5,
      },
      描述: '经济繁荣，百姓生活富足。',
    },
    {
      触发阈值: 85,
      奖励效果: {
        民心变化: 0.3,
        库银变化: 10,
      },
      描述: '百业兴旺，财源广进。',
    },
  ],
  教化: [
    {
      触发阈值: 70,
      奖励效果: {
        治安变化: 0.2,
      },
      描述: '教化昌盛，民风淳朴。',
    },
  ],
};

// ============================================================================
// 时间系统配置
// ============================================================================

/**
 * 时间流逝配置
 *
 * 定义不同操作的时间消耗
 */
export const TIME_COST_CONFIG = {
  /** 日常公文处理时间 */
  日常公文: {
    最短时间: 1,
    最长时间: 3,
    平均时间: 2,
    单位: '小时' as const,
  },
  /** 突发事务处理时间 */
  突发事务: {
    最短时间: 2,
    最长时间: 6,
    平均时间: 4,
    单位: '小时' as const,
  },
  /** 重点工程建设时间 */
  重点工程: {
    最短时间: 5,
    最长时间: 15,
    平均时间: 10,
    单位: '天' as const,
  },
  /** 巡查时间 */
  巡查: {
    最短时间: 1,
    最长时间: 3,
    平均时间: 2,
    单位: '小时' as const,
  },
};

/**
 * 自然恢复时间配置
 */
export const NATURAL_RECOVERY_TIME = {
  /** 民心自然恢复周期（小时） */
  民心恢复周期: 24,
  /** 治安自然恢复周期（小时） */
  治安恢复周期: 48,
  /** 繁荣度自然恢复周期（小时） */
  繁荣恢复周期: 72,
  /** 教化自然恢复周期（小时） */
  教化恢复周期: 36,
};

// ============================================================================
// 导出配置集合
// ============================================================================

/**
 * 完整配置对象
 */
export const JURISDICTION_CONFIG = {
  // 数值范围
  VALUE_RANGES: JURISDICTION_VALUE_RANGES,
  TREASURY: TREASURY_CONFIG,

  // 自然增长
  NATURAL_GROWTH: NATURAL_GROWTH_RATES,
  TREASURY_GROWTH: TREASURY_GROWTH_RATES,

  // 政务影响
  AFFAIR_IMPACT: AFFAIR_IMPACT_MULTIPLIERS,
  DIFFICULTY: DIFFICULTY_MULTIPLIERS,
  ATTRIBUTE_BONUS: ATTRIBUTE_BONUS_CONFIGS,

  // 阈值效果
  THRESHOLD_PENALTIES,
  EXCELLENCE_BONUSES,

  // 时间系统
  TIME_COST: TIME_COST_CONFIG,
  RECOVERY_TIME: NATURAL_RECOVERY_TIME,
};

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 计算实际政务效果
 *
 * @param baseEffect 基础效果
 * @param affairType 政务类型
 * @param difficulty 政务难度
 * @param attributes 县令属性
 * @returns 实际效果
 */
export function calculateActualEffect(
  baseEffect: Record<string, number>,
  affairType: string,
  difficulty: string,
  attributes: Record<string, number>
): Record<string, number> {
  const actualEffect: Record<string, number> = { ...baseEffect };

  // 应用难度修正
  const diffMultiplier = DIFFICULTY_MULTIPLIERS[difficulty];
  if (diffMultiplier) {
    Object.keys(actualEffect).forEach(key => {
      actualEffect[key] *= diffMultiplier.效果修正;
    });
  }

  // 应用属性修正
  ATTRIBUTE_BONUS_CONFIGS.forEach(config => {
    const attributeValue = attributes[config.属性];
    if (attributeValue) {
      const bonus = attributeValue * config.效果加成;
      Object.keys(actualEffect).forEach(key => {
        actualEffect[key] *= (1 + bonus);
      });
    }
  });

  // 应用政务类型倍率
  const typeMultiplier = AFFAIR_IMPACT_MULTIPLIERS[affairType];
  if (typeMultiplier) {
    Object.keys(actualEffect).forEach(key => {
      const multiplierKey = key + '倍率' as keyof AffairImpactMultiplier;
      const multiplier = typeMultiplier[multiplierKey];
      if (typeof multiplier === 'number') {
        actualEffect[key] *= multiplier;
      }
    });
  }

  return actualEffect;
}

/**
 * 计算政务成功率
 *
 * @param baseRate 基础成功率
 * @param difficulty 政务难度
 * @param attributes 县令属性
 * @returns 实际成功率
 */
export function calculateSuccessRate(
  baseRate: number,
  difficulty: string,
  attributes: Record<string, number>
): number {
  let successRate = baseRate;

  // 应用难度修正
  const diffMultiplier = DIFFICULTY_MULTIPLIERS[difficulty];
  if (diffMultiplier) {
    successRate *= diffMultiplier.成功率修正;
  }

  // 应用属性加成
  ATTRIBUTE_BONUS_CONFIGS.forEach(config => {
    const attributeValue = attributes[config.属性];
    if (attributeValue) {
      const bonus = attributeValue * config.成功率加成;
      successRate += bonus;
    }
  });

  // 限制在 [0, 1] 范围内
  return Math.max(0, Math.min(1, successRate));
}

/**
 * 应用自然增长
 *
 * @param currentValue 当前值
 * @param statType 指标类型
 * @param timePassed 经过的时间（小时）
 * @returns 新的数值
 */
export function applyNaturalGrowth(
  currentValue: number,
  statType: '民心' | '治安' | '繁荣度' | '教化',
  timePassed: number
): number {
  const growthConfig = NATURAL_GROWTH_RATES[statType];
  if (!growthConfig) return currentValue;

  // 计算自然增长量
  const daysPassed = timePassed / 24;
  const growth = growthConfig.每日变化 * daysPassed;

  let newValue = currentValue + growth;

  // 应用约束
  if (growthConfig.约束) {
    if (growthConfig.约束.最小值 !== undefined) {
      newValue = Math.max(newValue, growthConfig.约束.最小值);
    }
    if (growthConfig.约束.最大值 !== undefined) {
      newValue = Math.min(newValue, growthConfig.约束.最大值);
    }
  }

  // 应用范围限制
  const range = JURISDICTION_VALUE_RANGES[statType];
  newValue = Math.max(range.最小值, Math.min(range.最大值, newValue));

  return newValue;
}

/**
 * 检查警戒值并应用惩罚
 *
 * @param currentStats 当前各项指标
 * @returns 惩罚效果列表
 */
export function checkThresholdPenalties(
  currentStats: Record<'民心' | '治安' | '繁荣度' | '教化', number>
): Array<{ 类型: string; 效果: Record<string, number>; 描述: string }> {
  const penalties: Array<{ 类型: string; 效果: Record<string, number>; 描述: string }> = [];

  (Object.keys(THRESHOLD_PENALTIES) as Array<'民心' | '治安' | '繁荣度' | '教化'>).forEach(statType => {
    const currentValue = currentStats[statType];
    const statPenalties = THRESHOLD_PENALTIES[statType];

    statPenalties.forEach(penalty => {
      if (currentValue < penalty.触发阈值) {
        penalties.push({
          类型: statType,
          效果: penalty.惩罚效果,
          描述: penalty.描述,
        });
      }
    });
  });

  return penalties;
}

/**
 * 检查优秀值并应用奖励
 *
 * @param currentStats 当前各项指标
 * @returns 奖励效果列表
 */
export function checkExcellenceBonuses(
  currentStats: Record<'民心' | '治安' | '繁荣度' | '教化', number>
): Array<{ 类型: string; 效果: Record<string, number>; 描述: string }> {
  const bonuses: Array<{ 类型: string; 效果: Record<string, number>; 描述: string }> = [];

  (Object.keys(EXCELLENCE_BONUSES) as Array<'民心' | '治安' | '繁荣度' | '教化'>).forEach(statType => {
    const currentValue = currentStats[statType];
    const statBonuses = EXCELLENCE_BONUSES[statType];

    statBonuses.forEach(bonus => {
      if (currentValue > bonus.触发阈值) {
        bonuses.push({
          类型: statType,
          效果: bonus.奖励效果,
          描述: bonus.描述,
        });
      }
    });
  });

  return bonuses;
}
