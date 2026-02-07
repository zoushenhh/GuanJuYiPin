/**
 * @fileoverview 政务结算系统
 * 负责处理时间推进后的政务结算逻辑：
 * - 逾期惩罚
 * - 自然趋势
 * - 建设项目进度更新
 * - 随机事件触发
 *
 * @see docs/save-schema-v3.md 存档数据结构
 * @see src/data/jurisdictionConfig.ts 数值配置
 */

import type { GameTime } from '@/types/game';
import type { GovernmentDesk, GovernmentAffair, ConstructionProject } from '@/stores/gameStateStore';
import {
  NATURAL_GROWTH_RATES,
  TREASURY_GROWTH_RATES,
  JURISDICTION_VALUE_RANGES,
  THRESHOLD_PENALTIES,
  EXCELLENCE_BONUSES,
  applyNaturalGrowth,
  checkThresholdPenalties,
  checkExcellenceBonuses,
} from '@/data/jurisdictionConfig';
import { formatGameTimeDetailed } from '@/utils/time';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 政务结算报告
 */
export interface SettlementReport {
  /** 结算时间（游戏时间） */
  结算时间: string;
  /** 推进时长（小时） */
  推进时长: number;
  /** 逾期惩罚列表 */
  逾期惩罚: Array<{
    政务ID: string;
    政务名称: string;
    逾期天数: number;
    惩罚描述: string;
  }>;
  /** 自然趋势变化 */
  自然趋势: {
    民心变化: number;
    治安变化: number;
    繁荣度变化: number;
    教化变化: number;
    库银变化: number;
    粮食变化: number;
  };
  /** 阈值效果 */
  阈值效果: {
    惩罚: Array<{ 类型: string; 描述: string }>;
    奖励: Array<{ 类型: string; 描述: string }>;
  };
  /** 建设项目进度更新 */
  项目更新: Array<{
    项目ID: string;
    项目名称: string;
    进度变化: number;
    是否完成: boolean;
    当前进度?: number;  // 添加当前进度字段
  }>;
  /** 新增事件（如有） */
  新增事件?: string[];
}

/**
 * 县城治理状态
 */
interface JurisdictionStats {
  民心: number;
  治安: number;
  繁荣度: number;
  教化: number;
  库银: number;
  粮食: number;
}

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 计算两个游戏时间之间的小时数差
 * @param startTime 开始时间
 * @param endTime 结束时间
 * @returns 小时数差
 */
function calculateHoursBetween(startTime: GameTime, endTime: GameTime): number {
  const startTotalMinutes = startTime.年 * 365 * 24 * 60 +
                            startTime.月 * 30 * 24 * 60 +
                            startTime.日 * 24 * 60 +
                            startTime.小时 * 60 +
                            startTime.分钟;
  const endTotalMinutes = endTime.年 * 365 * 24 * 60 +
                          endTime.月 * 30 * 24 * 60 +
                          endTime.日 * 24 * 60 +
                          endTime.小时 * 60 +
                          endTime.分钟;
  return Math.abs(endTotalMinutes - startTotalMinutes) / 60;
}

/**
 * 将游戏时间字符串转换为 GameTime 对象
 * @param timeStr 时间字符串（格式：YYYY-MM-DDTHH:mm）
 * @returns GameTime 对象
 */
function parseTimeString(timeStr: string): GameTime {
  const match = timeStr.match(/(\d+)-(\d+)-(\d+)T(\d+):(\d+)/);
  if (!match) {
    console.warn('[政务结算] 无效的时间字符串:', timeStr);
    return { 年: 1, 月: 1, 日: 1, 小时: 8, 分钟: 0 }; // 默认开局时间
  }
  return {
    年: parseInt(match[1]),
    月: parseInt(match[2]),
    日: parseInt(match[3]),
    小时: parseInt(match[4]),
    分钟: parseInt(match[5]),
  };
}

// ============================================================================
// 核心结算逻辑
// ============================================================================

/**
 * 检查逾期政务并应用惩罚
 * @param governmentDesk 政务台状态
 * @param currentTime 当前游戏时间
 * @returns 逾期惩罚列表
 */
function checkOverdueAffairs(
  governmentDesk: GovernmentDesk,
  currentTime: GameTime
): SettlementReport['逾期惩罚'] {
  const overduePenalties: SettlementReport['逾期惩罚'] = [];

  if (!governmentDesk.待办事项 || governmentDesk.待办事项.length === 0) {
    return overduePenalties;
  }

  governmentDesk.待办事项.forEach((affair: GovernmentAffair) => {
    // 跳过已处理的政务
    if (affair.是否已处理) return;

    // 检查是否有期限
    if (!affair.期限) return;

    // 计算逾期天数
    const deadline = parseTimeString(affair.期限);
    const hoursOverdue = calculateHoursBetween(deadline, currentTime);
    const daysOverdue = Math.floor(hoursOverdue / 24);

    if (daysOverdue > 0) {
      // 应用逾期惩罚
      const penaltyMultiplier = daysOverdue * (affair.紧急度 === '极高' ? 2 : 1);

      // 民心和治安惩罚
      const 民心惩罚 = -2 * penaltyMultiplier;
      const 治安惩罚 = -3 * penaltyMultiplier;

      // 更新政务的影响记录
      if (!affair.影响) {
        affair.影响 = {};
      }
      affair.影响.民心变化 = (affair.影响.民心变化 || 0) + 民心惩罚;
      affair.影响.治安变化 = (affair.影响.治安变化 || 0) + 治安惩罚;

      // 更新状态为已逾期
      affair.是否已处理 = true;
      affair.处理结果 = `逾期${daysOverdue}天未处理`;

      overduePenalties.push({
        政务ID: affair.id,
        政务名称: affair.名称,
        逾期天数: daysOverdue,
        惩罚描述: `民心${民心惩罚 > 0 ? '+' : ''}${民心惩罚}，治安${治安惩罚 > 0 ? '+' : ''}${治安惩罚}`,
      });
    }
  });

  return overduePenalties;
}

/**
 * 应用自然趋势
 * @param jurisdiction 县城治理状态
 * @param hoursPassed 经过的时长（小时）
 * @returns 自然趋势变化
 */
function applyNaturalTrends(
  jurisdiction: JurisdictionStats,
  hoursPassed: number
): SettlementReport['自然趋势'] {
  const changes: SettlementReport['自然趋势'] = {
    民心变化: 0,
    治安变化: 0,
    繁荣度变化: 0,
    教化变化: 0,
    库银变化: 0,
    粮食变化: 0,
  };

  // 应用各指标的自然增长
  const statTypes = ['民心', '治安', '繁荣度', '教化'] as const;
  statTypes.forEach(statType => {
    const oldValue = jurisdiction[statType];
    const newValue = applyNaturalGrowth(oldValue, statType, hoursPassed);
    changes[`${statType}变化` as keyof typeof changes] = newValue - oldValue;
    jurisdiction[statType] = newValue;
  });

  // 应用财政自然消耗
  const daysPassed = hoursPassed / 24;
  const 库银消耗 = TREASURY_GROWTH_RATES.库银每日消耗 * daysPassed;
  const 粮食消耗 = TREASURY_GROWTH_RATES.粮食每日消耗 * daysPassed;

  changes.库银变化 = -库银消耗;
  changes.粮食变化 = -粮食消耗;

  jurisdiction.库银 = Math.max(0, jurisdiction.库银 - 库银消耗);
  jurisdiction.粮食 = Math.max(0, jurisdiction.粮食 - 粮食消耗);

  return changes;
}

/**
 * 更新建设项目进度
 * @param projects 建设项目列表
 * @param hoursPassed 经过的时长（小时）
 * @returns 项目更新列表
 */
function updateProjectProgress(
  projects: ConstructionProject[],
  hoursPassed: number
): SettlementReport['项目更新'] {
  const updates: SettlementReport['项目更新'] = [];

  projects.forEach(project => {
    // 兼容不同的状态值
    const isCompleted = project.状态 === '已完成' || project.状态 === '完工';
    if (isCompleted) return;

    // 计算进度增长（每小时进度 = 100 / 总工时）
    const progressPerHour = 100 / project.预计工时;
    const progressGain = progressPerHour * hoursPassed;

    const oldProgress = project.进度;
    project.进度 = Math.min(100, project.进度 + progressGain);
    const newProgress = project.进度;

    const isNowCompleted = newProgress >= 100;
    if (isNowCompleted) {
      project.状态 = '已完成';
      if ('完成时间' in project) {
        (project as any).完成时间 = new Date().toISOString();
      }
    }

    updates.push({
      项目ID: project.id,
      项目名称: project.名称,
      进度变化: newProgress - oldProgress,
      是否完成: isNowCompleted,
      当前进度: newProgress,
    });
  });

  return updates;
}

/**
 * 检查阈值效果（惩罚和奖励）
 * @param jurisdiction 县城治理状态
 * @returns 阈值效果
 */
function checkThresholdEffects(
  jurisdiction: JurisdictionStats
): SettlementReport['阈值效果'] {
  const stats = {
    民心: jurisdiction.民心,
    治安: jurisdiction.治安,
    繁荣度: jurisdiction.繁荣度,
    教化: jurisdiction.教化,
  };

  const penalties = checkThresholdPenalties(stats);
  const bonuses = checkExcellenceBonuses(stats);

  // 应用惩罚
  penalties.forEach(penalty => {
    Object.entries(penalty.效果).forEach(([key, value]) => {
      const statKey = key as keyof JurisdictionStats;
      if (typeof value === 'number') {
        jurisdiction[statKey] += value;
      }
    });
  });

  // 应用奖励
  bonuses.forEach(bonus => {
    Object.entries(bonus.效果).forEach(([key, value]) => {
      const statKey = key as keyof JurisdictionStats;
      if (typeof value === 'number') {
        jurisdiction[statKey] += value;
      }
    });
  });

  return {
    惩罚: penalties.map(p => ({ 类型: p.类型, 描述: p.描述 })),
    奖励: bonuses.map(b => ({ 类型: b.类型, 描述: b.描述 })),
  };
}

// ============================================================================
// 主结算函数
// ============================================================================

/**
 * 政务结算主函数
 *
 * 在时间推进后调用，处理以下内容：
 * 1. 检查逾期政务并应用惩罚
 * 2. 应用自然趋势（民心、治安等的自然变化）
 * 3. 更新建设项目进度
 * 4. 检查阈值效果（警戒值惩罚、优秀值奖励）
 * 5. （可选）触发随机事件
 *
 * @param gameState 游戏状态对象（包含 governmentDesk 和 location）
 * @param hoursPassed 经过的时长（小时）
 * @param options 可选配置
 * @returns 结算报告
 */
export function settleGovernmentAffairs(
  gameState: {
    governmentDesk: GovernmentDesk | null;
    location: any; // Location 类型，包含县城数值
    gameTime: GameTime;
  },
  hoursPassed: number,
  options?: {
    /** 是否触发随机事件 */
    triggerEvents?: boolean;
    /** 事件概率（0-1） */
    eventProbability?: number;
  }
): SettlementReport {
  console.log(`[政务结算] 开始结算，推进时长: ${hoursPassed.toFixed(1)} 小时`);

  // 准备县城治理状态
  const jurisdiction: JurisdictionStats = {
    民心: gameState.location?.民心支持度 ?? 60,
    治安: gameState.location?.治安 ?? 70,
    繁荣度: gameState.location?.发展活力 ?? 50,
    教化: 40, // 默认值
    库银: 1000, // 默认值
    粮食: 500, // 默认值
  };

  const report: SettlementReport = {
    结算时间: formatGameTimeDetailed(gameState.gameTime),
    推进时长: hoursPassed,
    逾期惩罚: [],
    自然趋势: {
      民心变化: 0,
      治安变化: 0,
      繁荣度变化: 0,
      教化变化: 0,
      库银变化: 0,
      粮食变化: 0,
    },
    阈值效果: {
      惩罚: [],
      奖励: [],
    },
    项目更新: [],
  };

  // 1. 检查逾期政务
  if (gameState.governmentDesk) {
    report.逾期惩罚 = checkOverdueAffairs(gameState.governmentDesk, gameState.gameTime);

    // 2. 更新建设项目进度
    if (gameState.governmentDesk.正在进行) {
      report.项目更新 = updateProjectProgress(
        gameState.governmentDesk.正在进行,
        hoursPassed
      );
    }
  }

  // 3. 应用自然趋势
  report.自然趋势 = applyNaturalTrends(jurisdiction, hoursPassed);

  // 4. 检查阈值效果
  report.阈值效果 = checkThresholdEffects(jurisdiction);

  // 5. 将更新后的数值写回 gameState
  if (gameState.location) {
    gameState.location.民心支持度 = jurisdiction.民心;
    gameState.location.治安 = jurisdiction.治安;
    gameState.location.发展活力 = jurisdiction.繁荣度;
  }

  // 6. （可选）触发随机事件
  if (options?.triggerEvents && options.eventProbability) {
    const shouldTrigger = Math.random() < options.eventProbability;
    if (shouldTrigger) {
      report.新增事件 = ['随机事件：新政务待处理']; // TODO: 实现事件生成逻辑
    }
  }

  console.log('[政务结算] 结算完成:', report);

  return report;
}

/**
 * 格式化结算报告为可读文本
 * @param report 结算报告
 * @returns 格式化文本
 */
export function formatSettlementReport(report: SettlementReport): string {
  const lines: string[] = [];

  lines.push(`【时间推进】${report.结算时间}`);
  lines.push(`推进时长: ${report.推进时长.toFixed(1)} 小时`);

  if (report.逾期惩罚.length > 0) {
    lines.push('\n【逾期惩罚】');
    report.逾期惩罚.forEach(p => {
      lines.push(`- ${p.政务名称}: 逾期${p.逾期天数}天，${p.惩罚描述}`);
    });
  }

  lines.push('\n【自然趋势】');
  const trends = report.自然趋势;
  const trendLines = [
    `民心${trends.民心变化 > 0 ? '+' : ''}${trends.民心变化.toFixed(2)}`,
    `治安${trends.治安变化 > 0 ? '+' : ''}${trends.治安变化.toFixed(2)}`,
    `繁荣度${trends.繁荣度变化 > 0 ? '+' : ''}${trends.繁荣度变化.toFixed(2)}`,
    `教化${trends.教化变化 > 0 ? '+' : ''}${trends.教化变化.toFixed(2)}`,
    `库银${trends.库银变化 > 0 ? '+' : ''}${trends.库银变化.toFixed(2)}`,
    `粮食${trends.粮食变化 > 0 ? '+' : ''}${trends.粮食变化.toFixed(2)}`,
  ];
  lines.push(trendLines.join('，'));

  if (report.阈值效果.惩罚.length > 0) {
    lines.push('\n【阈值惩罚】');
    report.阈值效果.惩罚.forEach(p => {
      lines.push(`- ${p.类型}: ${p.描述}`);
    });
  }

  if (report.阈值效果.奖励.length > 0) {
    lines.push('\n【优秀奖励】');
    report.阈值效果.奖励.forEach(b => {
      lines.push(`- ${b.类型}: ${b.描述}`);
    });
  }

  if (report.项目更新.length > 0) {
    lines.push('\n【项目进度】');
    report.项目更新.forEach(u => {
      const status = u.是否完成 ? '（已完成）' : `（+${u.进度变化.toFixed(1)}%）`;
      const currentProgress = (u as any).当前进度 ?? 0;
      lines.push(`- ${u.项目名称}: ${currentProgress.toFixed(1)}% ${status}`);
    });
  }

  if (report.新增事件 && report.新增事件.length > 0) {
    lines.push('\n【新增事件】');
    report.新增事件.forEach(e => lines.push(`- ${e}`));
  }

  return lines.join('\n');
}
