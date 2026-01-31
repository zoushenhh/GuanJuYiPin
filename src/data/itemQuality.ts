/**
 * 物品品质系统定义
 * 县令主题品质等级：皇、宫、府、州、县、乡、民
 * 品级：0 残缺；1-3 下品；4-6 中品；7-9 上品；10 极品
 */

export interface QualityInfo {
  color: string;
  rarity: string; // 文案描述
}

export interface GradeInfo {
  name: string; // 残缺/下品/中品/上品/极品
  description: string;
  effect: string; // 可用于UI特效描述
}

export interface ItemQualitySystem {
  // 品质等级（皇、宫、府、州、县、乡、民）
  qualities: {
    皇: QualityInfo;
    宫: QualityInfo;
    府: QualityInfo;
    州: QualityInfo;
    县: QualityInfo;
    乡: QualityInfo;
    民: QualityInfo;
  };

  // 品级（0 残缺；1-3 下品；4-6 中品；7-9 上品；10 极品）
  grades: {
    0: GradeInfo;
    1: GradeInfo;
    2: GradeInfo;
    3: GradeInfo;
    4: GradeInfo;
    5: GradeInfo;
    6: GradeInfo;
    7: GradeInfo;
    8: GradeInfo;
    9: GradeInfo;
    10: GradeInfo;
  };
}

export const ITEM_QUALITY_SYSTEM: ItemQualitySystem = {
  qualities: {
    皇: { color: '#9932CC', rarity: '御赐之物，源自皇帝亲赐，举国之内绝无仅有的至宝。' },
    宫: { color: '#FFD700', rarity: '宫廷御用，汇聚天下珍材，是官员梦寐以求的瑰宝。' },
    府: { color: '#FF69B4', rarity: '官府极品，由上级官府倾力打造，威能赫赫，足以震慑一方。' },
    州: { color: '#00CED1', rarity: '州府珍品，产自大型工坊，材质与工艺俱佳，是官场的中坚力量。' },
    县: { color: '#9370DB', rarity: '县衙精品，出自能工巧匠之手，蕴含奇特功效，是行走官场的必备之物。' },
    乡: { color: '#DAA520', rarity: '乡间珍品，地方流通的珍品，虽不顶尖，但已具备不凡效力。' },
    民: { color: '#808080', rarity: '平民之物，百姓日常所用，未入官场门槛，仅具基本功能。' },
  },

  grades: {
    0: { name: '残缺', description: '破损不堪', effect: '破损效果' },
    1: { name: '下品', description: '品质一般', effect: '淡色光效' },
    2: { name: '下品', description: '品质一般', effect: '淡色光效' },
    3: { name: '下品', description: '品质一般', effect: '淡色光效' },
    4: { name: '中品', description: '品质中等', effect: '中等光效' },
    5: { name: '中品', description: '品质中等', effect: '中等光效' },
    6: { name: '中品', description: '品质中等', effect: '中等光效' },
    7: { name: '上品', description: '品质上乘', effect: '强烈光效' },
    8: { name: '上品', description: '品质上乘', effect: '强烈光效' },
    9: { name: '上品', description: '品质上乘', effect: '强烈光效' },
    10: { name: '极品', description: '完美无瑕', effect: '炫目特效' },
  },
};

export type QualityType = keyof typeof ITEM_QUALITY_SYSTEM.qualities;
export type GradeType = keyof typeof ITEM_QUALITY_SYSTEM.grades;

export function getQualityInfo(quality: QualityType): QualityInfo {
  return ITEM_QUALITY_SYSTEM.qualities[quality];
}

export function getGradeInfo(grade: GradeType): GradeInfo {
  return ITEM_QUALITY_SYSTEM.grades[grade];
}

export function getFullQualityDescription(quality: QualityType, grade: GradeType): string {
  const qualityInfo = getQualityInfo(quality);
  const gradeInfo = getGradeInfo(grade);
  return `${quality}·${gradeInfo.name} - ${qualityInfo.rarity}`;
}

export function getItemColor(quality: QualityType, grade: GradeType): string {
  if (grade === 0) return '#666666';
  return getQualityInfo(quality).color;
}

export function getGradeRange(grade: number): string {
  if (grade === 0) return '残缺';
  if (grade >= 1 && grade <= 3) return '下品';
  if (grade >= 4 && grade <= 6) return '中品';
  if (grade >= 7 && grade <= 9) return '上品';
  if (grade === 10) return '极品';
  return '未知';
}

export function generateQualitySystemPrompt(): string {
  return `
## 物品品质系统 (重要参考)
此世界的物品分为两个维度：品质等级 与 品级

### 品质等级 (从低到高):
- 民品: ${ITEM_QUALITY_SYSTEM.qualities.民.rarity}
- 乡品: ${ITEM_QUALITY_SYSTEM.qualities.乡.rarity}
- 县品: ${ITEM_QUALITY_SYSTEM.qualities.县.rarity}
- 州品: ${ITEM_QUALITY_SYSTEM.qualities.州.rarity}
- 府品: ${ITEM_QUALITY_SYSTEM.qualities.府.rarity}
- 宫品: ${ITEM_QUALITY_SYSTEM.qualities.宫.rarity}
- 皇品: ${ITEM_QUALITY_SYSTEM.qualities.皇.rarity}

### 品级 (物品完美程度):
- 残缺 (0): 破损不堪，效果大减
- 下品 (1-3): 品质一般，淡色光效
- 中品 (4-6): 品质中等，中等光效
- 上品 (7-9): 品质上乘，强烈光效
- 极品 (10): 完美无瑕，炫目特效

### 物品命名规则 (建议):
两种推荐的命名格式：

格式1 - 简洁版（推荐）: [物品名]
示例：
- "清心丸" (民品下品的清心丸)
- "安神汤" (民品中品的安神汤)
- "铁印" (民品下品的铁印)
- "玉印" (县品中品的玉印)

格式2 - 完整版（特殊情况）: [品质][品级][物品名]
示例：
- "民品下品清心丸"
- "县品中品安神汤"
- "府品上品金印"
- "宫品极品御赐令牌"

命名建议：
- 日常物品使用简洁版命名
- 高品质或特殊物品可使用完整版
- 避免使用 "民下" 这种连写格式
- 如需标注品级，使用 "民品下品" 的分离格式

重要提示：初始角色通常只有民品或乡品的下品物品，高品质物品极其稀少。
`;
}
