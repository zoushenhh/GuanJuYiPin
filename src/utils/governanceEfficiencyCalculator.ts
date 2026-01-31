/**
 * @fileoverview 施政效率计算模块（县令主题）
 *
 * 【职责】
 * - 计算施政效率的各项因子
 * - 综合计算最终施政速度
 * - 预估升职时间
 *
 * 【核心公式】
 * 最终速度 = 基础速度 × 民心系数 × 六司系数 × 状态系数 × (1 + 方略加成 + 环境加成)
 * 六司系数 = 先天六司系数 × 0.7 + 后天六司系数 × 0.3
 *
 * 【术语对照】
 * - 政绩增长 = 效率 × 时间 × 难度系数
 * - 税收 = 人口 × 税率 × 治安系数
 * - 民心变化 = 政策效果 + 突发事件影响
 */

// 从修炼速度计算器导出所有相关类型和函数
export {
  // 六司相关
  calculateInnateSixSiFactor,
  calculateAcquiredSixSiFactor,
  calculateCombinedSixSiFactor,
  type SixSiData,

  // 民心支持度（灵气浓度的别名）
  calculatePublicTrustFactor,
  getPublicTrustDescription,

  // 方略加成（功法加成的别名）
  calculateStrategyBonus,

  // 状态效果
  calculateStatusEffectFactor,
  type StatusEffect,

  // 官品晋升（境界突破的别名）
  RANK_PROMOTION_STANDARDS,
  getBreakthroughStandard,
  validateCultivationProgress,

  // 施政速度（修炼速度的别名）
  calculateAdministrationSpeed,
  type AdministrationSpeedInput,
  type AdministrationSpeedResult,
  type AdministrationSpeedFactors,

  // 常量
  SIX_SI_WEIGHTS,
} from '@/utils/cultivationSpeedCalculator';

// ============================================================================
// 县治特有计算公式
// ============================================================================

/**
 * 县治核心参数
 */
export interface CountyParams {
  人口: number;
  人口上限: number;
  税率: number; // 0.1 - 0.5
  民心: number; // 0-100
  治安: number; // 0-100
  教育: number; // 0-100
}

/**
 * 计算税收
 * 公式：税收 = 人口 × 税率 × 治安系数 × 民心系数
 */
export function calculateTaxRevenue(params: CountyParams): number {
  const baseTax = params.人口 * params.税率;
  const securityFactor = params.治安 / 100;
  const supportFactor = params.民心 / 100;
  return Math.floor(baseTax * securityFactor * supportFactor);
}

/**
 * 计算民心变化
 * @param currentSupport 当前民心
 * @param policyEffect 政策效果
 * @param randomEventEffect 随机事件影响（默认0）
 * @returns 新的民心值（0-100）
 */
export function calculatePublicSupportChange(
  currentSupport: number,
  policyEffect: number,
  randomEventEffect: number = 0
): number {
  const change = policyEffect + randomEventEffect;
  const newValue = currentSupport + change;
  return Math.max(0, Math.min(100, newValue));
}

/**
 * 计算治安变化
 */
export function calculateSecurityChange(
  currentSecurity: number,
  policyEffect: number,
  randomEventEffect: number = 0
): number {
  const change = policyEffect + randomEventEffect;
  const newValue = currentSecurity + change;
  return Math.max(0, Math.min(100, newValue));
}

/**
 * 计算人口增长
 * @param params 县治参数
 * @param foodStock 粮食库存
 * @returns 人口变化量
 */
export function calculatePopulationGrowth(params: CountyParams, foodStock: number): number {
  const { 人口, 人口上限, 民心, 治安 } = params;

  // 粮食不足时人口减少
  if (foodStock < 人口 * 0.1) {
    const decrease = Math.floor(人口 * 0.01);
    return -Math.max(0, decrease);
  }

  // 民心和治安都较好时人口增长
  if (民心 >= 60 && 治安 >= 60 && 人口 < 人口上限) {
    const growth = Math.floor(人口 * 0.005);
    return Math.min(人口上限 - 人口, growth);
  }

  return 0;
}

/**
 * 计算政绩增长（批阅公文）
 * 公式：政绩增长 = 效率 × 时间 × 难度系数
 *
 * @param efficiency 施政效率（来自 calculateAdministrationSpeed）
 * @param timeSpent 花费时间（小时）
 * @param difficulty 公文难度系数（0.5 - 2.0，默认1.0）
 * @returns 政绩增长量
 */
export function calculateMeritGain(
  efficiency: number,
  timeSpent: number,
  difficulty: number = 1.0
): number {
  return Math.floor(efficiency * timeSpent * difficulty);
}

/**
 * 公文难度配置
 */
export const DOCUMENT_DIFFICULTY = {
  容易: 0.5,
  普通: 1.0,
  困难: 1.5,
  极难: 2.0,
} as const;

/**
 * 民心等级描述
 */
export function getPublicSupportLevel(support: number): string {
  if (support >= 80) return '民心鼎盛';
  if (support >= 60) return '民心安稳';
  if (support >= 40) return '民心平平';
  if (support >= 20) return '民心不稳';
  return '民心动荡';
}

/**
 * 治安等级描述
 */
export function getSecurityLevel(security: number): string {
  if (security >= 80) return '路不拾遗';
  if (security >= 60) return '治安良好';
  if (security >= 40) return '治安一般';
  if (security >= 20) return '盗匪横行';
  return '民不聊生';
}

/**
 * 官品等级映射
 */
export const RANK_LEVELS = [
  { 品级: '九品', 上限: 100 },
  { 品级: '八品', 上限: 200 },
  { 品级: '七品', 上限: 400 },
  { 品级: '六品', 上限: 800 },
  { 品级: '五品', 上限: 1500 },
  { 品级: '四品', 上限: 3000 },
  { 品级: '三品', 上限: 6000 },
  { 品级: '二品', 上限: 10000 },
  { 品级: '一品', 上限: 99999 },
] as const;

/**
 * 根据政绩计算对应官品
 */
export function calculateRankByMerit(totalMerit: number): string {
  for (const rank of RANK_LEVELS) {
    if (totalMerit < rank.上限) {
      return rank.品级;
    }
  }
  return '一品';
}

/**
 * 计算到下一官品所需政绩
 */
export function getMeritToNextRank(currentRank: string, currentMerit: number): number {
  const currentIndex = RANK_LEVELS.findIndex(r => r.品级 === currentRank);
  if (currentIndex === -1 || currentIndex === RANK_LEVELS.length - 1) {
    return 0; // 已达最高品级
  }
  const nextRank = RANK_LEVELS[currentIndex + 1];
  return nextRank.上限 - currentMerit;
}

// ============================================================================
// 政策效果配置
// ============================================================================

/**
 * 政策效果类型
 */
export interface PolicyEffect {
  民心?: number;
  治安?: number;
  经济?: number;
  教育?: number;
}

/**
 * 预设政策效果
 */
export const POLICY_EFFECTS: Record<string, PolicyEffect> = {
  减免税赋: { 民心: 10, 经济: -5 },
  严打盗匪: { 治安: 15, 民心: -5 },
  兴办学堂: { 教育: 20, 民心: 5 },
  修缮水利: { 经济: 15, 民心: 10 },
  赈济灾民: { 民心: 20, 经济: -10 },
  招募兵勇: { 治安: 10, 经济: -15 },
  发展商业: { 经济: 20, 民心: 5 },
  推广农技: { 经济: 10, 民心: 8 },
};

/**
 * 计算政策实施后的综合效果
 */
export function calculatePolicyEffect(
  policyName: string,
  params: CountyParams
): {
  民心变化: number;
  治安变化: number;
  经济变化: number;
  教育变化: number;
  新民心: number;
  新治安: number;
  新教育: number;
} {
  const effect = POLICY_EFFECTS[policyName] || {};

  const 民心变化 = effect.民心 || 0;
  const 治安变化 = effect.治安 || 0;
  const 经济变化 = effect.经济 || 0;
  const 教育变化 = effect.教育 || 0;

  return {
    民心变化,
    治安变化,
    经济变化,
    教育变化,
    新民心: calculatePublicSupportChange(params.民心, 民心变化),
    新治安: calculateSecurityChange(params.治安, 治安变化),
    新教育: Math.min(100, Math.max(0, params.教育 + 教育变化)),
  };
}
