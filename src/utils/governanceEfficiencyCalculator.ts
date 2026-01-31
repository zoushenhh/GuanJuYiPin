/**
 * @fileoverview 县令政务判定计算器
 *
 * 基于"短板乘区"理论设计的政务判定系统
 * 核心公式：最终判定值 = (基础效能 + 骰子修正) × 状态乘区 - 阻力值
 *
 * 设计理念：
 * - 使用乘法产生"短板效应"（精力低/民心低会严重拖累整体表现）
 * - 动态难度（随繁荣度和任期增长）
 * - 阈值锁定（地区属性不满足时，最高判定结果受限）
 * - 季节/天时影响（不同季节对不同政务有显著加成/减益）
 */

import type { Magistrate } from '@/types/magistrate';
import type { CountyState } from '@/types/county';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 季节类型
 */
export type Season = '春' | '夏' | '秋' | '冬';

/**
 * 政务类型
 */
export type GovernmentTaskType =
  | '断案'       // 依赖: 断案能力 + 治安 + 民心
  | '征税'       // 依赖: 经济能力 + 繁荣度 + 民心
  | '建设'       // 依赖: 建设能力 + 库银 + 人口
  | '教化'       // 依赖: 教化能力 + 学堂 + 民心
  | '赈灾'       // 依赖: 威望 + 库银 + 民心
  | '治安'       // 依赖: 治安能力 + 城墙 + 衙役
  | '外交'       // 依赖: 外交能力 + 威望 + 交通
  | '考核';      // 依赖: 综合政绩 + 上级关系

/**
 * 判定结果等级
 */
export type JudgmentResult =
  | '大失败'  // 判定值 < 难度-30，严重后果
  | '失败'    // 判定值 < 难度，有代价的挫折
  | '成功'    // 判定值 >= 难度，正常收益
  | '大成功'  // 判定值 >= 难度+30，额外收益
  | '完美';   // 判定值 >= 难度+50，特殊解锁

/**
 * 判定上下文
 */
export interface JudgmentContext {
  magistrate: Magistrate;
  county: CountyState;
  taskType: GovernmentTaskType;
  baseDifficulty: number;  // 基础难度 0-100
  season: Season;
}

/**
 * 判定结果详情
 */
export interface JudgmentResultDetail {
  result: JudgmentResult;
  finalScore: number;
  targetDifficulty: number;
  breakdown: {
    basePower: number;        // 基础效能
    statusMultiplier: number;  // 状态乘区
    rollBonus: number;         // 骰子修正
    resistance: number;        // 阻力值
    seasonalModifier: number;  // 季节修正
    criticalFactor?: string;   // 关键因素（用于AI叙事）
    thresholdLock?: string;    // 阈值锁定说明
  };
}

/**
 * 基础设施等级对应的数值加成
 */
const FACILITY_LEVEL_VALUES: Record<string, number> = {
  '破败': -20,
  '简陋': -10,
  '普通': 0,
  '完善': 10,
  '精良': 20,
  '宏伟': 30
};

/**
 * 人口密度对应的数值
 */
const POPULATION_DENSITY_VALUES: Record<string, number> = {
  '稀疏': 20,
  '适中': 50,
  '稠密': 80,
  '拥挤': 100
};

// ============================================================================
// 核心判定函数
// ============================================================================

/**
 * 计算政务判定结果
 *
 * @param context 判定上下文
 * @returns 判定结果详情
 */
export function calculateJudgment(context: JudgmentContext): JudgmentResultDetail {
  const { magistrate, county, taskType, baseDifficulty, season } = context;

  // 1. 检查阈值锁定（地区属性不满足时，最高判定结果受限）
  const thresholdLock = checkThresholdLock(county, taskType);
  if (thresholdLock) {
    // 即使数值达标，也被锁定在较低等级
    return createLockedResult(context, thresholdLock);
  }

  // 2. 计算基础效能
  const basePower = calculateBasePower(magistrate, county, taskType);

  // 3. 计算状态乘区（短板效应核心）
  const statusMultiplier = calculateStatusMultiplier(magistrate, county);

  // 4. 计算季节修正
  const seasonalModifier = getSeasonalModifier(taskType, season);

  // 5. 计算骰子修正（根据心境决定波动范围）
  const rollBonus = calculateRollBonus(magistrate);

  // 6. 计算阻力值
  const resistance = calculateResistance(county, baseDifficulty, season);

  // 7. 最终计算
  const rawScore = (basePower + rollBonus) * statusMultiplier;
  const finalScore = rawScore - resistance + seasonalModifier;

  // 8. 动态难度判定
  const dynamicDifficulty = calculateDynamicDifficulty(baseDifficulty, county, magistrate);

  // 9. 判定结果等级
  const result = determineResultLevel(finalScore, dynamicDifficulty);

  // 10. 提取关键因素（用于AI叙事）
  const criticalFactor = extractCriticalFactor(magistrate, county, statusMultiplier, result);

  return {
    result,
    finalScore: Math.round(finalScore),
    targetDifficulty: Math.round(dynamicDifficulty),
    breakdown: {
      basePower: Math.round(basePower),
      statusMultiplier: parseFloat(statusMultiplier.toFixed(3)),
      rollBonus: Math.round(rollBonus),
      resistance: Math.round(resistance),
      seasonalModifier,
      criticalFactor
    }
  };
}

// ============================================================================
// 辅助计算函数
// ============================================================================

/**
 * 检查阈值锁定
 * 若关键地区属性不满足，返回锁定说明
 */
function checkThresholdLock(county: CountyState, taskType: GovernmentTaskType): string | null {
  const locks: Record<GovernmentTaskType, () => string | null> = {
    '断案': () => {
      if (county.治安.当前 < 20) return '治安崩坏（<20），县令权威不足，最高判定锁定为"失败"';
      if (county.民心.当前 < 30) return '民心过低（<30），百姓不信任，最高判定锁定为"成功"';
      return null;
    },
    '征税': () => {
      if (county.民心.当前 < 20) return '民心极低（<20），抗税风险极高，最高判定锁定为"失败"';
      if (county.繁荣度.当前 < 20) return '县治破败（<20），无税可征，最高判定锁定为"成功"';
      return null;
    },
    '建设': () => {
      if (county.人口.总人口 < 100) return '人口过少（<100），劳动力不足，最高判定锁定为"成功"';
      if (county.库银.现有库银 < 50) return '库银枯竭（<50），无法建设，最高判定锁定为"失败"';
      return null;
    },
    '教化': () => {
      if (county.基础设施.学堂 === '破败') return '学堂破败，无法施教，最高判定锁定为"失败"';
      if (county.民心.当前 < 30) return '民心冷漠，不愿配合，最高判定锁定为"成功"';
      return null;
    },
    '赈灾': () => {
      if (county.库银.现有库银 < 100) return '库银不足（<100），无力赈灾，最高判定锁定为"失败"';
      return null;
    },
    '治安': () => {
      if (county.基础设施.城墙 === '破败') return '城墙破败，无法防御，最高判定锁定为"失败"';
      return null;
    },
    '外交': () => {
      if (county.地理位置.交通 === '闭塞') return '交通闭塞，无法联络，最高判定锁定为"成功"';
      return null;
    },
    '考核': () => {
      if (county.民心.当前 < 40) return '民心不足（<40），政绩不彰，最高判定锁定为"成功"';
      if (county.治安.当前 < 40) return '治安不靖（<40），考核扣分，最高判定锁定为"成功"';
      return null;
    }
  };

  return locks[taskType]?.() ?? null;
}

/**
 * 创建锁定结果
 */
function createLockedResult(context: JudgmentContext, lockReason: string): JudgmentResultDetail {
  return {
    result: '失败',  // 锁定时返回失败
    finalScore: 0,
    targetDifficulty: 999,  // 表示无法达成
    breakdown: {
      basePower: 0,
      statusMultiplier: 0,
      rollBonus: 0,
      resistance: 0,
      seasonalModifier: 0,
      thresholdLock: lockReason
    }
  };
}

/**
 * 计算基础效能
 * = 能力×0.4 + 六司×1.5 + 基建加成
 */
function calculateBasePower(magistrate: Magistrate, county: CountyState, taskType: GovernmentTaskType): number {
  // 获取对应的能力值
  const abilityMap = {
    '断案': magistrate.治理能力.断案能力,
    '征税': magistrate.治理能力.经济能力,
    '建设': magistrate.治理能力.建设能力,
    '教化': magistrate.治理能力.教化能力,
    '赈灾': magistrate.威望.当前 / 100,  // 威望转换为0-100
    '治安': magistrate.治理能力.治安能力,
    '外交': magistrate.治理能力.外交能力,
    '考核': Object.values(magistrate.治理能力).reduce((a, b) => a + b, 0) / 6  // 平均能力
  };

  const ability = abilityMap[taskType] ?? 50;

  // 六司加成（上限10，权重1.5）
  const sixSi = Object.values(magistrate.先天六司).reduce((a, b) => a + b, 0) * 1.5;

  // 基建加成
  const facilityBonus = getFacilityBonus(county, taskType);

  return ability * 0.4 + sixSi + facilityBonus;
}

/**
 * 获取基建加成
 */
function getFacilityBonus(county: CountyState, taskType: GovernmentTaskType): number {
  const facilityMap = {
    '断案': county.基础设施.县衙,
    '征税': county.基础设施.市场,
    '建设': county.基础设施.道路,
    '教化': county.基础设施.学堂,
    '赈灾': county.基础设施.县衙,  // 县衙组织能力强
    '治安': county.基础设施.城墙,
    '外交': county.基础设施.道路,
    '考核': county.基础设施.县衙
  };

  const facilityLevel = facilityMap[taskType] ?? '普通';
  return FACILITY_LEVEL_VALUES[facilityLevel] ?? 0;
}

/**
 * 计算状态乘区（短板效应核心）
 * 使用乘法而非加法，任一状态差都会严重影响整体表现
 */
function calculateStatusMultiplier(magistrate: Magistrate, county: CountyState): number {
  let multiplier = 1.0;

  // 精力系数（疲劳惩罚）
  const energyRatio = magistrate.精力.当前 / magistrate.精力.上限;
  if (energyRatio < 0.2) multiplier *= 0.5;   // 极度疲劳
  else if (energyRatio < 0.3) multiplier *= 0.6;  // 非常疲劳
  else if (energyRatio < 0.5) multiplier *= 0.8;  // 疲劳
  else if (energyRatio > 0.9) multiplier *= 1.1;  // 精力充沛

  // 健康系数
  const healthRatio = magistrate.健康.当前 / magistrate.健康.上限;
  if (healthRatio < 0.3) multiplier *= 0.6;   // 重伤
  else if (healthRatio < 0.5) multiplier *= 0.8;  // 轻伤

  // 心境系数
  const moodRatio = magistrate.心境.当前 / magistrate.心境.上限;
  if (moodRatio < 0.3) multiplier *= 0.7;   // 心境混乱
  else if (moodRatio < 0.5) multiplier *= 0.9;  // 心境不稳

  // 民心系数（刁民难管）
  if (county.民心.当前 < 30) multiplier *= 0.7;
  else if (county.民心.当前 > 70) multiplier *= 1.1;

  // 协同系数（路不拾遗，治理轻松）
  if (county.治安.当前 > 80 && county.教化.当前 > 80) {
    multiplier *= 1.15;
  }

  return multiplier;
}

/**
 * 计算骰子修正
 * 根据心境决定波动范围：心境越稳，波动越小
 */
function calculateRollBonus(magistrate: Magistrate): number {
  const moodRatio = magistrate.心境.当前 / magistrate.心境.上限;

  // 不稳定度：心境越低，波动越大
  const instability = (1 - moodRatio) * 20;  // 最大波动 ±20

  const random = Math.random() * 2 - 1;  // -1 到 1
  return random * instability;
}

/**
 * 计算阻力值
 */
function calculateResistance(county: CountyState, baseDifficulty: number, season: Season): number {
  let resistance = baseDifficulty;

  // 地形修正
  if (county.地理位置.地形 === '山地' || county.地理位置.地形 === '盆地') {
    resistance += 10;  // 交通不便，治理更难
  } else if (county.地理位置.地形 === '平原' || county.地理位置.地形 === '河谷') {
    resistance -= 5;   // 地利优势
  }

  // 气候修正
  if (county.地理位置.气候 === '高原') {
    resistance += 15;  // 高原环境艰苦
  }

  return resistance;
}

/**
 * 获取季节修正
 */
export function getSeasonalModifier(taskType: GovernmentTaskType, season: Season): number {
  const modifiers: Record<GovernmentTaskType, Record<Season, number>> = {
    '断案': { '春': 0, '夏': -5, '秋': 5, '冬': 0 },
    '征税': { '春': -10, '夏': 0, '秋': 20, '冬': -5 },
    '建设': { '春': 20, '夏': -10, '秋': 0, '冬': -30 },
    '教化': { '春': 0, '夏': 5, '秋': 0, '冬': 10 },
    '赈灾': { '春': 0, '夏': 5, '秋': 0, '冬': 10 },
    '治安': { '春': -10, '夏': -5, '秋': 0, '冬': 10 },
    '外交': { '春': 0, '夏': 5, '秋': 10, '冬': -5 },
    '考核': { '春': 0, '夏': 0, '秋': 10, '冬': 0 }
  };

  return modifiers[taskType]?.[season] ?? 0;
}

/**
 * 计算动态难度
 * 随繁荣度和任期增长
 */
function calculateDynamicDifficulty(baseDifficulty: number, county: CountyState, magistrate: Magistrate): number {
  const prosperityLevel = county.繁荣度.当前;
  const tenureYears = magistrate.任期.当前;

  // 动态难度 = 基础难度 + (繁荣度等级 × 5) + (任期年数 × 2)
  const dynamicBonus = (prosperityLevel / 20) * 5 + tenureYears * 2;

  return baseDifficulty + dynamicBonus;
}

/**
 * 判定结果等级
 */
function determineResultLevel(finalScore: number, difficulty: number): JudgmentResult {
  const diff = finalScore - difficulty;

  if (diff >= 50) return '完美';
  if (diff >= 30) return '大成功';
  if (diff >= 0) return '成功';
  if (diff >= -30) return '失败';
  return '大失败';
}

/**
 * 提取关键因素（用于AI叙事）
 */
function extractCriticalFactor(
  magistrate: Magistrate,
  county: CountyState,
  statusMultiplier: number,
  result: JudgmentResult
): string {
  const factors: string[] = [];

  // 精力状态
  const energyRatio = magistrate.精力.当前 / magistrate.精力.上限;
  if (energyRatio < 0.3) factors.push('精力极度疲劳');
  else if (energyRatio > 0.9) factors.push('精力充沛');

  // 健康状态
  const healthRatio = magistrate.健康.当前 / magistrate.健康.上限;
  if (healthRatio < 0.5) factors.push('带伤坚持');

  // 心境状态
  const moodRatio = magistrate.心境.当前 / magistrate.心境.上限;
  if (moodRatio < 0.5) factors.push('心境不稳');
  else if (moodRatio > 0.8) factors.push('心境澄明');

  // 民心状态
  if (county.民心.当前 < 30) factors.push('民心冷漠');
  else if (county.民心.当前 > 70) factors.push('民心拥戴');

  // 状态乘区异常
  if (statusMultiplier < 0.8) factors.push('状态不佳严重影响发挥');
  else if (statusMultiplier > 1.1) factors.push('状态绝佳，如有神助');

  // 根据结果选择关键因素
  if (result === '大失败' || result === '失败') {
    // 失败时，找负面因素
    const negativeFactors = factors.filter(f =>
      f.includes('疲劳') || f.includes('带伤') || f.includes('不稳') ||
      f.includes('冷漠') || f.includes('严重影响')
    );
    return negativeFactors.length > 0 ? negativeFactors[0] : '判定值不足';
  } else if (result === '大成功' || result === '完美') {
    // 成功时，找正面因素
    const positiveFactors = factors.filter(f =>
      f.includes('充沛') || f.includes('澄明') || f.includes('拥戴') ||
      f.includes('神助')
    );
    return positiveFactors.length > 0 ? positiveFactors[0] : '发挥出色';
  }

  return '正常发挥';
}

// ============================================================================
// 导出函数
// ============================================================================

/**
 * 快速判定（简化版，用于不需要详细分解的场景）
 */
export function quickJudgment(
  magistrate: Magistrate,
  county: CountyState,
  taskType: GovernmentTaskType,
  difficulty: number = 50
): JudgmentResult {
  const context: JudgmentContext = {
    magistrate,
    county,
    taskType,
    baseDifficulty: difficulty,
    season: '春'  // 默认春季
  };

  return calculateJudgment(context).result;
}

/**
 * 获取当前季节（基于游戏时间）
 */
export function getCurrentSeason(month: number): Season {
  if (month >= 3 && month <= 5) return '春';
  if (month >= 6 && month <= 8) return '夏';
  if (month >= 9 && month <= 11) return '秋';
  return '冬';
}
