/**
 * 衙门数据验证器
 * 确保AI生成的衙门数据逻辑一致性
 */

// 官品等级映射 - 支持带"品"和阶段的格式
// 注意：同一品级的不同阶段（初期、中期、后期、圆满、极境）都算同一等级
const RANK_LEVELS: Record<string, number> = {
  // 九品（最低）
  '九品': 1, '九品初品': 1, '九品中品': 1, '九品后品': 1, '九品圆满': 1, '九品极境': 1,
  // 八品
  '八品': 2, '八品初品': 2, '八品中品': 2, '八品后品': 2, '八品圆满': 2, '八品极境': 2,
  // 七品
  '七品': 3, '七品初品': 3, '七品中品': 3, '七品后品': 3, '七品圆满': 3, '七品极境': 3,
  // 六品
  '六品': 4, '六品初品': 4, '六品中品': 4, '六品后品': 4, '六品圆满': 4, '六品极境': 4,
  // 五品
  '五品': 5, '五品初品': 5, '五品中品': 5, '五品后品': 5, '五品圆满': 5, '五品极境': 5,
  // 四品
  '四品': 6, '四品初品': 6, '四品中品': 6, '四品后品': 6, '四品圆满': 6, '四品极境': 6,
  // 三品
  '三品': 7, '三品初品': 7, '三品中品': 7, '三品后品': 7, '三品圆满': 7, '三品极境': 7,
  // 二品
  '二品': 8, '二品初品': 8, '二品中品': 8, '二品后品': 8, '二品圆满': 8, '二品极境': 8,
  // 一品（最高）
  '一品': 9, '一品初品': 9, '一品中品': 9, '一品后品': 9, '一品圆满': 9, '一品极境': 9,

  // 兼容旧存档格式（修仙官品映射到对应官品）
  '练气': 1, '练气初品': 1, '练气中品': 1, '练气后品': 1, '练气圆满': 1, '练气极境': 1,
  '筑基': 2, '筑基初品': 2, '筑基中品': 2, '筑基后品': 2, '筑基圆满': 2, '筑基极境': 2,
  '金丹': 3, '金丹初品': 3, '金丹中品': 3, '金丹后品': 3, '金丹圆满': 3, '金丹极境': 3,
  '元婴': 4, '元婴初品': 4, '元婴中品': 4, '元婴后品': 4, '元婴圆满': 4, '元婴极境': 4,
  '化神': 5, '化神初品': 5, '化神中品': 5, '化神后品': 5, '化神圆满': 5, '化神极境': 5,
  '炼虚': 6, '炼虚初品': 6, '炼虚中品': 6, '炼虚后品': 6, '炼虚圆满': 6, '炼虚极境': 6,
  '合体': 7, '合体初品': 7, '合体中品': 7, '合体后品': 7, '合体圆满': 7, '合体极境': 7,
  '渡劫': 8, '渡劫初品': 8, '渡劫中品': 8, '渡劫后品': 8, '渡劫圆满': 8, '渡劫极境': 8,
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
export function validateAndFixGovernmentRealmData(governmentData: any): any {
  if (!governmentData) return governmentData;

  // 字段名兼容：将英文字段名转换为中文字段名
  if (governmentData.leadership && !governmentData.领导层) {
    governmentData.领导层 = governmentData.leadership;
    delete governmentData.leadership;
  }

  // 特殊规则：合欢衙门若缺失"圣女"，自动补齐（避免只生成衙门不生成关键职位）
  const governmentName = String(governmentData.名称 || governmentData.name || '');
  if (governmentName.includes('合欢')) {
    if (!governmentData.领导层) {
      governmentData.领导层 = {
        主官: '合欢老魔',
        主官品级: governmentData.最强品级 || '五品',
        最强品级: governmentData.最强品级 || '五品',
        圣女: '灰夫人(合欢圣女)'
      };
    } else if (!governmentData.领导层.圣女) {
      governmentData.领导层.圣女 = '灰夫人(合欢圣女)';
    }
  } else if (governmentData.领导层) {
    // 彩蛋限定：其他衙门不应出现"圣女/圣子"字段（即便AI生成了也移除）
    if ('圣女' in governmentData.领导层) delete governmentData.领导层.圣女;
    if ('圣子' in governmentData.领导层) delete governmentData.领导层.圣子;
  }

  // 处理 memberCount 字段
  if (governmentData.memberCount && !governmentData.成员数量) {
    governmentData.成员数量 = {
      总数: governmentData.memberCount.total,
      按官品: governmentData.memberCount.byRealm,
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

    // 转换 byPosition -> 按职位
    if (memberCount.byPosition && !memberCount.按职位) {
      memberCount.按职位 = memberCount.byPosition;
    }
  }

  // 获取最强品级等级
  const maxRealm = governmentData.领导层?.最强品级 || governmentData.最强品级;
  const maxLevel = getRankLevel(maxRealm);

  console.log(`[衙门验证] ${governmentData.名称}: 最强品级="${maxRealm}" → 等级=${maxLevel}`);
  console.log(`[衙门验证] ${governmentData.名称}: 原始官品分布=`, governmentData.成员数量?.按官品);

  // 🔥 智能修复：根据官品分布自动设置最强品级
  if (governmentData.成员数量?.按官品) {
    const realmDist = governmentData.成员数量.按官品;

    // 找出官品分布中的最高官品
    let highestRealmLevel = 0;
    let highestRealmName = '';

    Object.keys(realmDist).forEach(realm => {
      const count = realmDist[realm];
      if (count > 0) {
        const realmLevel = getRankLevel(realm);
        if (realmLevel > highestRealmLevel) {
          highestRealmLevel = realmLevel;
          highestRealmName = realm;
        }
      }
    });

    // 如果找到了最高官品，用它来更新最强品级
    if (highestRealmLevel > 0 && highestRealmName) {
      // 将"九品初期"转换为"九品圆满"等更合理的描述
      const realmNameWithoutSuffix = highestRealmName.replace('初期', '').replace('中期', '').replace('后期', '').replace('极境', '');
      const correctedMaxRealm = `${realmNameWithoutSuffix}圆满`;

      // 更新leadership中的最强品级
      if (governmentData.领导层) {
        const oldMaxRealm = governmentData.领导层.最强品级;
        governmentData.领导层.最强品级 = correctedMaxRealm;
        console.log(`[衙门验证] ${governmentData.名称}: 根据官品分布自动修正最强品级: "${oldMaxRealm}" → "${correctedMaxRealm}"`);

        // 如果主官品级低于最强品级，也更新主官品级
        const masterRealmLevel = getRankLevel(governmentData.领导层.主官品级 || '');
        if (masterRealmLevel < highestRealmLevel) {
          governmentData.领导层.主官品级 = correctedMaxRealm;
          console.log(`[衙门验证] ${governmentData.名称}: 同时更新主官品级为: "${correctedMaxRealm}"`);
        }
      }
    }

    console.log(`[衙门验证] ${governmentData.名称}: 官品分布包含:`, Object.keys(realmDist).filter(r => realmDist[r] > 0));
  }

  console.log(`[衙门验证] ${governmentData.名称}: 验证后官品分布=`, governmentData.成员数量?.按官品);

  // 验证资深官员数量与高品级官员数量的一致性
  if (governmentData.领导层?.资深官员数量 && governmentData.成员数量?.按官品) {
    const elderCount = governmentData.领导层.资深官员数量;
    const realmDist = governmentData.成员数量.按官品;

    // 计算六品及以上的官员总数
    let highRealmCount = 0;
    Object.keys(realmDist).forEach(realm => {
      const realmLevel = getRankLevel(realm);
      if (realmLevel >= 4) {
        highRealmCount += realmDist[realm] || 0;
      }
    });

    if (highRealmCount > elderCount * 1.5) {
      const ratio = elderCount * 1.2 / highRealmCount;
      Object.keys(realmDist).forEach(realm => {
        const realmLevel = getRankLevel(realm);
        if (realmLevel >= 4) {
          const originalCount = realmDist[realm];
          realmDist[realm] = Math.max(1, Math.round(originalCount * ratio));
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

  // 检查最强品级与官品分布的一致性
  const maxRealm = governmentData.领导层?.最强品级 || governmentData.最强品级;
  const maxLevel = getRankLevel(maxRealm);

  if (governmentData.成员数量?.按官品) {
    Object.keys(governmentData.成员数量.按官品).forEach(realm => {
      const realmLevel = getRankLevel(realm);
      if (realmLevel > maxLevel) {
        errors.push(`官品分布错误: 存在${realm}品官员，但最强品级仅为${maxRealm}`);
      }
    });
  }

  // 检查资深官员数量与高官品官员的合理性
  const elderCount = governmentData.领导层?.资深官员数量;
  if (elderCount && governmentData.成员数量?.按官品) {
    let highRealmCount = 0;
    Object.keys(governmentData.成员数量.按官品).forEach(realm => {
      const realmLevel = getRankLevel(realm);
      if (realmLevel >= 4) {
        highRealmCount += governmentData.成员数量.按官品[realm] || 0;
      }
    });

    if (highRealmCount > elderCount * 2) {
      errors.push(`人员配置不合理: 资深官员${elderCount}位，但六品以上官员${highRealmCount}人`);
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * 批量验证并修复衙门数据列表
 */
export function validateAndFixGovernmentDataList(governments: any[]): any[] {
  if (!Array.isArray(governments)) return governments;

  return governments.map(government => {
    const fixedGovernment = validateAndFixGovernmentRealmData(government);
    const validation = validateGovernmentConsistency(fixedGovernment);

    if (!validation.isValid) {
      console.warn(`[衙门验证] ${government.名称 || '未知衙门'}存在问题:`, validation.errors);
    }

    return fixedGovernment;
  });
}
