/**
 * 衙门数据自动计算器
 * 用算法确保数据的一致性和合理性，不依赖AI生成
 */

export interface GovernmentCalculationData {
  名称: string;
  类型: string;
  等级: string;
  县令政绩?: string;
  最强政绩?: string;
  幕僚数量?: number;
  核心吏员数?: number;
  正式吏员数?: number;
  临时雇员数?: number;
}

export interface CalculatedGovernmentData {
  声望值: number;
  综合实力: number;
}

/**
 * 官品实力映射表 - 用于计算实力
 */
const _RANK_POWER_MAP: Record<string, number> = {
  '九品下': 5, '九品中': 8, '九品上': 12, '九品': 15,
  '八品下': 20, '八品中': 25, '八品上': 30, '八品': 35,
  '七品下': 45, '七品中': 52, '七品上': 60, '七品': 68,
  '六品下': 80, '六品中': 88, '六品上': 95, '六品': 102,
  '五品下': 115, '五品中': 125, '五品上': 135, '五品': 145,
  '四品下': 160, '四品中': 170, '四品上': 180, '四品': 190,
  '三品下': 210, '三品中': 225, '三品上': 240, '三品': 255,
  '二品下': 280, '二品中': 310, '二品上': 340, '二品': 370,
  '一品': 400
};

/**
 * 衙门等级基础倍数
 */
const _GOVERNMENT_LEVEL_MULTIPLIER: Record<string, number> = {
  '府级': 1.2,
  '州级': 1.0,
  '县级': 0.8,
  '镇级': 0.6,
  '村级': 0.4
};

/**
 * 衙门类型修正系数
 */
const GOVERNMENT_TYPE_MODIFIER: Record<string, number> = {
  '知县衙门': 1.0,
  '行政衙门': 1.0,
  '军事衙门': 1.1,
  '世袭衙门': 0.9,
  '商业衙门': 0.7,
  '中立衙门': 0.85,
  '民间组织': 0.75
};

/**
 * 计算衙门综合实力 - 重新设计更合理的评分系统
 */
function calculateGovernmentPower(data: GovernmentCalculationData): number {
  let baseScore = 0;
  const maxRank = data.最强政绩 || data.县令政绩 || '';

  if (maxRank.includes('九品')) baseScore = 5;
  else if (maxRank.includes('八品')) baseScore = 15;
  else if (maxRank.includes('七品')) baseScore = 25;
  else if (maxRank.includes('六品')) baseScore = 35;
  else if (maxRank.includes('五品')) baseScore = 45;
  else if (maxRank.includes('四品')) baseScore = 55;
  else if (maxRank.includes('三品')) baseScore = 65;
  else if (maxRank.includes('二品')) baseScore = 75;
  else baseScore = 20;

  const advisorCount = data.幕僚数量 || 0;
  const totalMembers = (data.核心吏员数 || 0) + (data.正式吏员数 || 0) + (data.临时雇员数 || 0);

  let scaleScore = 0;
  if (advisorCount >= 50) scaleScore += 15;
  else if (advisorCount >= 30) scaleScore += 12;
  else if (advisorCount >= 20) scaleScore += 10;
  else if (advisorCount >= 10) scaleScore += 7;
  else if (advisorCount >= 5) scaleScore += 4;
  else scaleScore += Math.max(0, advisorCount);

  if (totalMembers >= 10000) scaleScore += 10;
  else if (totalMembers >= 5000) scaleScore += 8;
  else if (totalMembers >= 2000) scaleScore += 6;
  else if (totalMembers >= 1000) scaleScore += 4;
  else if (totalMembers >= 500) scaleScore += 2;
  else scaleScore += Math.max(0, Math.floor(totalMembers / 250));

  let levelBonus = 0;
  switch (data.等级) {
    case '府级':
    case '府级衙门':
      levelBonus = 10;
      break;
    case '州级':
    case '州级衙门':
      levelBonus = 7;
      break;
    case '县级':
    case '县级衙门':
      levelBonus = 4;
      break;
    case '镇级':
    case '镇级衙门':
      levelBonus = 2;
      break;
    default:
      levelBonus = 0;
  }

  let typeBonus = 0;
  switch (data.类型) {
    case '军事衙门':
    case '武衙门':
      typeBonus = 3;
      break;
    case '行政衙门':
    case '知县衙门':
      typeBonus = 1;
      break;
    case '世袭衙门':
    case '家族衙门':
      typeBonus = -1;
      break;
    case '商业衙门':
    case '商税衙门':
      typeBonus = -3;
      break;
    case '民间组织':
      typeBonus = -2;
      break;
    default:
      typeBonus = 0;
  }

  let finalScore = baseScore + scaleScore + levelBonus + typeBonus;

  if (maxRank.includes('二品')) finalScore = Math.max(finalScore, 85);
  else if (maxRank.includes('三品')) finalScore = Math.max(finalScore, 75);
  else if (maxRank.includes('四品')) finalScore = Math.max(finalScore, 65);
  else if (maxRank.includes('五品')) finalScore = Math.max(finalScore, 55);

  return Math.min(100, Math.max(1, Math.round(finalScore)));
}

/**
 * 计算衙门声望值
 */
function calculateGovernmentReputation(data: GovernmentCalculationData): number {
  let baseReputation = 5;

  switch (data.等级) {
    case '府级':
    case '府级衙门':
      baseReputation = 25;
      break;
    case '州级':
    case '州级衙门':
      baseReputation = 20;
      break;
    case '县级':
    case '县级衙门':
      baseReputation = 15;
      break;
    case '镇级':
    case '镇级衙门':
      baseReputation = 10;
      break;
    default:
      baseReputation = 5;
  }

  const typeBonus = GOVERNMENT_TYPE_MODIFIER[data.类型] || 1.0;

  let scaleBonus = 0;
  const advisorCount = data.幕僚数量 || 0;
  if (advisorCount >= 10) scaleBonus += 3;
  else if (advisorCount >= 5) scaleBonus += 2;
  else if (advisorCount >= 3) scaleBonus += 1;

  const randomFactor = 0.8 + Math.random() * 0.4;
  const finalReputation = Math.round((baseReputation * typeBonus + scaleBonus) * randomFactor);

  return Math.min(30, Math.max(0, finalReputation));
}

/**
 * 计算衙门数据的主函数
 */
export function calculateGovernmentData(data: GovernmentCalculationData): CalculatedGovernmentData {
  return {
    声望值: calculateGovernmentReputation(data),
    综合实力: calculateGovernmentPower(data)
  };
}

/**
 * 批量计算多个衙门数据
 */
export function batchCalculateGovernmentData(governmentList: GovernmentCalculationData[]): (GovernmentCalculationData & CalculatedGovernmentData)[] {
  return governmentList.map(gov => ({
    ...gov,
    ...calculateGovernmentData(gov)
  }));
}
