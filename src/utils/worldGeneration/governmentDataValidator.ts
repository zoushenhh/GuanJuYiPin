/**
 * 衙门数据验证器
 * 确保AI生成的衙门数据逻辑一致性
 */

// 官品等级映射 - 支持带"品"和不带"品"的格式
// 注意：同一官品的不同阶段（下、中、上）都算同一等级
const RANK_LEVELS: Record<string, number> = {
  // 不带阶的格式
  '九品': 1, '九品下': 1, '九品中': 1, '九品上': 1,
  '八品': 2, '八品下': 2, '八品中': 2, '八品上': 2,
  '七品': 3, '七品下': 3, '七品中': 3, '七品上': 3,
  '六品': 4, '六品下': 4, '六品中': 4, '六品上': 4,
  '五品': 5, '五品下': 5, '五品中': 5, '五品上': 5,
  '四品': 6, '四品下': 6, '四品中': 6, '四品上': 6,
  '三品': 7, '三品下': 7, '三品中': 7, '三品上': 7,
  '二品': 8, '二品下': 8, '二品中': 8, '二品上': 8,

  // 带阶的格式
  '九品阶': 1, '八品阶': 2, '七品阶': 3, '六品阶': 4,
  '五品阶': 5, '四品阶': 6, '三品阶': 7, '二品阶': 8
};

/**
 * 获取官品等级
 */
function getRankLevel(rank: string): number {
  return RANK_LEVELS[rank] || 0;
}

/**
 * 验证并修复衙门官品分布数据
 */
export function validateAndFixGovernmentRankData(governmentData: any): any {
  if (!governmentData) return governmentData;

  // 字段名兼容：将英文字段名转换为中文字段名
  if (governmentData.leadership && !governmentData.领导层) {
    governmentData.领导层 = governmentData.leadership;
    delete governmentData.leadership;
  }

  // 特殊规则：特殊衙门若缺失关键职位，自动补齐（避免只生成衙门不生成关键职位）
  const govName = String(governmentData.名称 || governmentData.name || '');
  if (govName.includes('府')) {
    if (!governmentData.领导层) {
      governmentData.领导层 = {
        县令: '知府大人',
        县令政绩: governmentData.最强政绩 || '五品',
        最强政绩: governmentData.最强政绩 || '五品',
        通判: '府衙通判'
      };
    } else if (!governmentData.领导层.通判) {
      governmentData.领导层.通判 = '府衙通判';
    }
  } else if (governmentData.领导层) {
    // 彩蛋限定：其他衙门不应出现特殊职位字段（即便AI生成了也移除）
    if ('通判' in governmentData.领导层 && !govName.includes('府')) delete governmentData.领导层.通判;
    if ('同知' in governmentData.领导层 && !govName.includes('府')) delete governmentData.领导层.同知;
  }

  // 处理 memberCount 字段
  if (governmentData.memberCount && !governmentData.成员数量) {
    governmentData.成员数量 = {
      总数: governmentData.memberCount.total,
      按官品: governmentData.memberCount.byRank,
      按职位: governmentData.memberCount.byPosition
    };
    delete governmentData.memberCount;
  }

  // 处理已存在的成员数量字段中的英文子字段
  if (governmentData.成员数量) {
    const memberCount = governmentData.成员数量;

    // 转换 total -> 总数
    if (memberCount.total !== undefined && memberCount.总数 === undefined) {
      memberCount.总数 = memberCount.total;
    }

    // 转换 byRealm -> 按官品
    if (memberCount.byRealm && !memberCount.按官品) {
      memberCount.按官品 = memberCount.byRealm;
    }
    // 转换 byRank -> 按官品
    if (memberCount.byRank && !memberCount.按官品) {
      memberCount.按官品 = memberCount.byRank;
    }

    // 转换 byPosition -> 按职位
    if (memberCount.byPosition && !memberCount.按职位) {
      memberCount.按职位 = memberCount.byPosition;
    }
  }

  // 获取最强政绩等级
  const maxRank = governmentData.领导层?.最强政绩 || governmentData.最强政绩;
  const maxLevel = getRankLevel(maxRank);

  console.log(`[衙门验证] ${governmentData.名称}: 最强政绩="${maxRank}" → 等级=${maxLevel}`);
  console.log(`[衙门验证] ${governmentData.名称}: 原始官品分布=`, governmentData.成员数量?.按官品);

  // 智能修复：根据官品分布自动设置最强政绩
  if (governmentData.成员数量?.按官品) {
    const rankDist = governmentData.成员数量.按官品;

    // 找出官品分布中的最高官品
    let highestRankLevel = 0;
    let highestRankName = '';

    Object.keys(rankDist).forEach(rank => {
      const count = rankDist[rank];
      if (count > 0) {
        const rankLevel = getRankLevel(rank);
        if (rankLevel > highestRankLevel) {
          highestRankLevel = rankLevel;
          highestRankName = rank;
        }
      }
    });

    // 如果找到了最高官品，用它来更新最强政绩
    if (highestRankLevel > 0 && highestRankName) {
      // 将"九品阶"转换为"九品上"等更合理的描述
      const rankNameWithoutSuffix = highestRankName.replace('阶', '').replace('品', '品');
      const correctedMaxRank = `${rankNameWithoutSuffix}上`;

      // 更新leadership中的最强政绩
      if (governmentData.领导层) {
        const oldMaxRank = governmentData.领导层.最强政绩;
        governmentData.领导层.最强政绩 = correctedMaxRank;
        console.log(`[衙门验证] ${governmentData.名称}: 根据官品分布自动修正最强政绩: "${oldMaxRank}" → "${correctedMaxRank}"`);

        // 如果县令政绩低于最强政绩，也更新县令政绩
        const magistrateRankLevel = getRankLevel(governmentData.领导层.县令政绩 || '');
        if (magistrateRankLevel < highestRankLevel) {
          governmentData.领导层.县令政绩 = correctedMaxRank;
          console.log(`[衙门验证] ${governmentData.名称}: 同时更新县令政绩为: "${correctedMaxRank}"`);
        }
      }
    }

    console.log(`[衙门验证] ${governmentData.名称}: 官品分布包含:`, Object.keys(rankDist).filter(r => rankDist[r] > 0));
  }

  console.log(`[衙门验证] ${governmentData.名称}: 验证后官品分布=`, governmentData.成员数量?.按官品);

  // 验证幕僚数量与高官品吏员数量的一致性
  if (governmentData.领导层?.幕僚数量 && governmentData.成员数量?.按官品) {
    const advisorCount = governmentData.领导层.幕僚数量;
    const rankDist = governmentData.成员数量.按官品;

    // 计算六品及以上的官员总数
    let highRankCount = 0;
    Object.keys(rankDist).forEach(rank => {
      const rankLevel = getRankLevel(rank);
      if (rankLevel >= 4) {
        highRankCount += rankDist[rank] || 0;
      }
    });

    if (highRankCount > advisorCount * 1.5) {
      const ratio = advisorCount * 1.2 / highRankCount;
      Object.keys(rankDist).forEach(rank => {
        const rankLevel = getRankLevel(rank);
        if (rankLevel >= 4) {
          const originalCount = rankDist[rank];
          rankDist[rank] = Math.max(1, Math.round(originalCount * ratio));
        }
      });
    }
  }

  return governmentData;
}

/**
 * 验证衙门数据的整体一致性
 */
export function validateGovernmentConsistency(governmentData: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!governmentData) {
    errors.push('衙门数据为空');
    return { isValid: false, errors };
  }

  // 检查最强政绩与官品分布的一致性
  const maxRank = governmentData.领导层?.最强政绩 || governmentData.最强政绩;
  const maxLevel = getRankLevel(maxRank);

  if (governmentData.成员数量?.按官品) {
    Object.keys(governmentData.成员数量.按官品).forEach(rank => {
      const rankLevel = getRankLevel(rank);
      if (rankLevel > maxLevel) {
        errors.push(`官品分布错误: 存在${rank}官员，但最强政绩仅为${maxRank}`);
      }
    });
  }

  // 检查幕僚数量与高官品官员的合理性
  const advisorCount = governmentData.领导层?.幕僚数量;
  if (advisorCount && governmentData.成员数量?.按官品) {
    let highRankCount = 0;
    Object.keys(governmentData.成员数量.按官品).forEach(rank => {
      const rankLevel = getRankLevel(rank);
      if (rankLevel >= 4) {
        highRankCount += governmentData.成员数量.按官品[rank] || 0;
      }
    });

    if (highRankCount > advisorCount * 2) {
      errors.push(`人员配置不合理: 幕僚${advisorCount}位，但六品以上官员${highRankCount}人`);
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * 批量验证并修复衙门数据列表
 */
export function validateAndFixGovernmentDataList(governments: any[]): any[] {
  if (!Array.isArray(governments)) return governments;

  return governments.map(gov => {
    const fixedGov = validateAndFixGovernmentRankData(gov);
    const validation = validateGovernmentConsistency(fixedGov);

    if (!validation.isValid) {
      console.warn(`[衙门验证] ${gov.名称 || '未知衙门'}存在问题:`, validation.errors);
    }

    return fixedGov;
  });
}
