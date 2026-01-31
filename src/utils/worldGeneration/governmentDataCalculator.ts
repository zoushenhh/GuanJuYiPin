/**
 * 衙门数据自动计算器
 * 用算法确保数据的一致性和合理性，不依赖AI生成
 */

export interface GovernmentCalculationData {
  名称: string;
  类型: string;
  等级: string;
  主官政绩?: string;
  最强政绩?: string;
  高级官吏数量?: number;
  核心下属数?: number;
  内门下属数?: number;
  外门下属数?: number;
}

export interface CalculatedGovernmentData {
  声望值: number;
  综合战力: number;
}

/**
 * 官品实力映射表 - 用于计算战力
 */
const _OFFICIAL_RANK_POWER_MAP: Record<string, number> = {
  '九品初期': 5, '九品中期': 8, '九品后期': 12, '九品圆满': 15, '九品极境': 18,
  '八品初期': 20, '八品中期': 25, '八品后期': 30, '八品圆满': 35, '八品极境': 40,
  '七品初期': 45, '七品中期': 52, '七品后期': 60, '七品圆满': 68, '七品极境': 75,
  '六品初期': 80, '六品中期': 88, '六品后期': 95, '六品圆满': 102, '六品极境': 110,
  '五品初期': 115, '五品中期': 125, '五品后期': 135, '五品圆满': 145, '五品极境': 155,
  '四品初期': 160, '四品中期': 170, '四品后期': 180, '四品圆满': 190, '四品极境': 200,
  '三品初期': 210, '三品中期': 225, '三品后期': 240, '三品圆满': 255, '三品极境': 270,
  '二品初期': 280, '二品中期': 310, '二品后期': 340, '二品圆满': 370, '二品极境': 400,
  '九品': 10, '八品': 25, '七品': 55, '六品': 90, '五品': 130,
  '四品': 175, '三品': 235, '二品': 325
};

/**
 * 衙门等级基础倍数
 */
const _GOVERNMENT_LEVEL_MULTIPLIER: Record<string, number> = {
  '超级': 1.2,
  '超级衙门': 1.2,
  '一流': 1.0,
  '一流衙门': 1.0,
  '二流': 0.8,
  '二流衙门': 0.8,
  '三流': 0.6,
  '三流衙门': 0.6,
  '末流': 0.4,
  '末流衙门': 0.4
};

/**
 * 衙门类型修正系数
 */
const GOVERNMENT_TYPE_MODIFIER: Record<string, number> = {
  '地方衙门': 1.0,
  '清流派': 1.0,
  '贪腐派': 1.1,
  '贪腐势力': 1.1,
  '官宦世家': 0.9,
  '世家': 0.9,
  '商会': 0.7,
  '商会组织': 0.7,
  '中立衙门': 0.85,
  '平民联盟': 0.75
};

/**
 * 计算衙门综合战力 - 重新设计更合理的评分系统
 */
function calculateGovernmentPower(data: GovernmentCalculationData): number {
  let baseScore = 0;
  const maxRank = data.最强政绩 || data.主官政绩 || '';

  if (maxRank.includes('九品')) baseScore = 5;
  else if (maxRank.includes('八品')) baseScore = 15;
  else if (maxRank.includes('七品')) baseScore = 25;
  else if (maxRank.includes('六品')) baseScore = 35;
  else if (maxRank.includes('五品')) baseScore = 45;
  else if (maxRank.includes('四品')) baseScore = 55;
  else if (maxRank.includes('三品')) baseScore = 65;
  else if (maxRank.includes('二品')) baseScore = 75;
  else baseScore = 20;

  const seniorOfficialCount = data.高级官吏数量 || 0;
  const totalMembers = (data.核心下属数 || 0) + (data.内门下属数 || 0) + (data.外门下属数 || 0);
  
  let scaleScore = 0;
  if (seniorOfficialCount >= 50) scaleScore += 15;
  else if (seniorOfficialCount >= 30) scaleScore += 12;
  else if (seniorOfficialCount >= 20) scaleScore += 10;
  else if (seniorOfficialCount >= 10) scaleScore += 7;
  else if (seniorOfficialCount >= 5) scaleScore += 4;
  else scaleScore += Math.max(0, seniorOfficialCount);
  
  if (totalMembers >= 10000) scaleScore += 10;
  else if (totalMembers >= 5000) scaleScore += 8;
  else if (totalMembers >= 2000) scaleScore += 6;
  else if (totalMembers >= 1000) scaleScore += 4;
  else if (totalMembers >= 500) scaleScore += 2;
  else scaleScore += Math.max(0, Math.floor(totalMembers / 250));
  
  let levelBonus = 0;
  switch (data.等级) {
    case '超级':
    case '超级衙门':
      levelBonus = 10;
      break;
    case '一流':
    case '一流衙门':
      levelBonus = 7;
      break;
    case '二流':
    case '二流衙门':
      levelBonus = 4;
      break;
    case '三流':
    case '三流衙门':
      levelBonus = 2;
      break;
    default:
      levelBonus = 0;
  }
  
  let typeBonus = 0;
  switch (data.类型) {
    case '贪腐派':
    case '贪腐势力':
      typeBonus = 3;
      break;
    case '清流派':
    case '地方衙门':
      typeBonus = 1;
      break;
    case '官宦世家':
    case '世家':
      typeBonus = -1;
      break;
    case '商会':
    case '商会组织':
      typeBonus = -3;
      break;
    case '平民联盟':
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
    case '超级':
    case '超级衙门':
      baseReputation = 25;
      break;
    case '一流':
    case '一流衙门':
      baseReputation = 20;
      break;
    case '二流':
    case '二流衙门':
      baseReputation = 15;
      break;
    case '三流':
    case '三流衙门':
      baseReputation = 10;
      break;
    default:
      baseReputation = 5;
  }
  
  const typeBonus = GOVERNMENT_TYPE_MODIFIER[data.类型] || 1.0;
  
  let scaleBonus = 0;
  const seniorOfficialCount = data.高级官吏数量 || 0;
  if (seniorOfficialCount >= 10) scaleBonus += 3;
  else if (seniorOfficialCount >= 5) scaleBonus += 2;
  else if (seniorOfficialCount >= 3) scaleBonus += 1;
  
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
    综合战力: calculateGovernmentPower(data)
  };
}

/**
 * 批量计算多个衙门数据
 */
export function batchCalculateGovernmentData(governmentList: GovernmentCalculationData[]): (GovernmentCalculationData & CalculatedGovernmentData)[] {
  return governmentList.map(government => ({
    ...government,
    ...calculateGovernmentData(government)
  }));
}