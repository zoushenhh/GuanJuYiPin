/**
 * @fileoverview 官阶品级系统数据
 * 定义宋代官制中的品级、职位、俸禄等信息
 */

// ============================================================================
// 类型定义
// ============================================================================

/** 官品类别 */
export type RankCategory = '文官' | '武官';

/** 阶段 */
export type RankStage = '初期' | '中期' | '后期' | '圆满';

/** 官品定义 */
export interface OfficialRank {
  /** 官品等级（1-9，数字越小等级越高） */
  level: number;
  /** 品级名称（如"正一品"、"从七品"） */
  rankName: string;
  /** 正从区分 */
  type: '正' | '从';
  /** 官品类别 */
  category: RankCategory;
  /** 常见职位 */
  titles: string[];
  /** 月俸（贯） */
  salary: number;
  /** 晋升所需政绩 */
  meritRequired: number;
  /** 品级描述 */
  description: string;
  /** 特权与限制 */
  privileges: string[];
  /** 阶段信息 */
  stages?: RankStageDefinition[];
}

/** 阶段定义 */
export interface RankStageDefinition {
  /** 阶段名称 */
  stage: RankStage;
  /** 阶段称号 */
  title: string;
  /** 晋升难度 */
  breakthrough_difficulty: '简单' | '普通' | '困难' | '极难' | '逆天';
  /** 政绩倍数 */
  merit_multiplier: number;
  /** 威望加成 */
  prestige_bonus: number;
  /** 特殊能力 */
  special_abilities: string[];
  /** 可否越级升迁 */
  can_cross_rank_battle?: boolean;
}

// ============================================================================
// 辅助函数
// ============================================================================

function createStandardStages(rankLevel: number): RankStageDefinition[] {
  const baseMultiplier = 1 + (9 - rankLevel) * 0.15;

  return [
    {
      stage: '初期',
      title: '初任',
      breakthrough_difficulty: '普通',
      merit_multiplier: baseMultiplier,
      prestige_bonus: Math.floor(rankLevel * 2),
      special_abilities: []
    },
    {
      stage: '中期',
      title: '历练',
      breakthrough_difficulty: '普通',
      merit_multiplier: baseMultiplier * 1.3,
      prestige_bonus: Math.floor(rankLevel * 4),
      special_abilities: ['政务熟练']
    },
    {
      stage: '后期',
      title: '资深',
      breakthrough_difficulty: '困难',
      merit_multiplier: baseMultiplier * 1.6,
      prestige_bonus: Math.floor(rankLevel * 6),
      special_abilities: ['政务熟练', '同僚敬重']
    },
    {
      stage: '圆满',
      title: '政绩斐然',
      breakthrough_difficulty: '困难',
      merit_multiplier: baseMultiplier * 2,
      prestige_bonus: Math.floor(rankLevel * 10),
      special_abilities: ['政务熟练', '同僚敬重', '百姓爱戴']
    }
  ];
}

// ============================================================================
// 官品数据（文官）
// ============================================================================

/** 一品官（正从一品） */
export const RANK_1: OfficialRank[] = [
  {
    level: 1,
    rankName: '正一品',
    type: '正',
    category: '文官',
    titles: ['太师', '太傅', '太保', '左丞相', '右丞相'],
    salary: 300,
    meritRequired: 0,
    description: '一品大员，位极人臣。位列朝堂最高层，辅佐皇帝处理国家大事，一言可影响天下万民。',
    privileges: ['可参与朝政', '可举荐官员', '可制定政策', '享最高礼遇'],
    stages: createStandardStages(1)
  },
  {
    level: 1,
    rankName: '从一品',
    type: '从',
    category: '文官',
    titles: ['少师', '少傅', '少保', '枢密使', '节度使'],
    salary: 250,
    meritRequired: 0,
    description: '从一品官员，亦是朝堂重臣。虽略逊于正一品，但仍是权力核心成员，权倾一方。',
    privileges: ['可参与朝政', '可举荐官员', '享高等级礼遇'],
    stages: createStandardStages(1)
  }
];

/** 二品官（正从二品） */
export const RANK_2: OfficialRank[] = [
  {
    level: 2,
    rankName: '正二品',
    type: '正',
    category: '文官',
    titles: ['尚书左丞', '尚书右丞', '知枢密院事'],
    salary: 200,
    meritRequired: 50000,
    description: '二品高官，朝廷栋梁。主政一部或掌管军机要务，责任重大，地位尊崇。',
    privileges: ['可参与部务', '可举荐下级', '享高等级礼遇'],
    stages: createStandardStages(2)
  },
  {
    level: 2,
    rankName: '从二品',
    type: '从',
    category: '文官',
    titles: ['翰林学士承旨', '观文殿大学士'],
    salary: 180,
    meritRequired: 50000,
    description: '从二品官员，文坛领袖。多为当世大儒，学问渊博，声名远播。',
    privileges: ['可参与部务', '享优厚礼遇'],
    stages: createStandardStages(2)
  }
];

/** 三品官（正从三品） */
export const RANK_3: OfficialRank[] = [
  {
    level: 3,
    rankName: '正三品',
    type: '正',
    category: '文官',
    titles: ['六部侍郎', '御史中丞', '开封府尹'],
    salary: 150,
    meritRequired: 100000,
    description: '三品大员，一方大员。或辅佐尚书处理部务，或出任地方大员，治理一方。',
    privileges: ['可独立处理政务', '可任免下属', '享较高礼遇'],
    stages: createStandardStages(3)
  },
  {
    level: 3,
    rankName: '从三品',
    type: '从',
    category: '文官',
    titles: ['光禄卿', '卫尉卿', '太仆卿'],
    salary: 130,
    meritRequired: 100000,
    description: '从三品官员，九卿之一。掌管宫廷事务或皇家侍卫，地位尊贵。',
    privileges: ['可处理专项事务', '享较高礼遇'],
    stages: createStandardStages(3)
  }
];

/** 四品官（正从四品） */
export const RANK_4: OfficialRank[] = [
  {
    level: 4,
    rankName: '正四品',
    type: '正',
    category: '文官',
    titles: ['六部郎中', '少卿', '知州'],
    salary: 100,
    meritRequired: 200000,
    description: '四品官员，中层骨干。或主持部内司务，或出任知州治理州县，是朝廷的中坚力量。',
    privileges: ['可独立处理政务', '可提拔下属'],
    stages: createStandardStages(4)
  },
  {
    level: 4,
    rankName: '从四品',
    type: '从',
    category: '文官',
    titles: ['国子司业', '少府监', '将作监'],
    salary: 85,
    meritRequired: 200000,
    description: '从四品官员，专司一职。多负责教育、营造等专门事务。',
    privileges: ['可处理专项事务'],
    stages: createStandardStages(4)
  }
];

/** 五品官（正从五品） */
export const RANK_5: OfficialRank[] = [
  {
    level: 5,
    rankName: '正五品',
    type: '正',
    category: '文官',
    titles: ['六部员外郎', '知州', '通判'],
    salary: 70,
    meritRequired: 400000,
    description: '五品官员，地方长官。多出任知州、通判等地方要职，治理一方百姓。',
    privileges: ['可治理地方', '可任免下属'],
    stages: createStandardStages(5)
  },
  {
    level: 5,
    rankName: '从五品',
    type: '从',
    category: '文官',
    titles: ['各寺丞', '大理寺丞'],
    salary: 60,
    meritRequired: 400000,
    description: '从五品官员，寺监副职。辅助正职处理专门事务，是升迁的必经之路。',
    privileges: ['可协助处理事务'],
    stages: createStandardStages(5)
  }
];

/** 六品官（正从六品） */
export const RANK_6: OfficialRank[] = [
  {
    level: 6,
    rankName: '正六品',
    type: '正',
    category: '文官',
    titles: ['六部主事', '知县', '县令'],
    salary: 50,
    meritRequired: 700000,
    description: '六品官员，县级行政长官。知县、县令是地方治理的核心，直接面对百姓，责任重大。',
    privileges: ['可治理县域', '可审判案件', '可征收赋税'],
    stages: createStandardStages(6)
  },
  {
    level: 6,
    rankName: '从六品',
    type: '从',
    category: '文官',
    titles: ['翰林修撰', '国子博士'],
    salary: 40,
    meritRequired: 700000,
    description: '从六品官员，文教职务。多从事教育、编修等文化工作。',
    privileges: ['可从事文教事务'],
    stages: createStandardStages(6)
  }
];

/** 七品官（正从七品） */
export const RANK_7: OfficialRank[] = [
  {
    level: 7,
    rankName: '正七品',
    type: '正',
    category: '文官',
    titles: ['县令', '县丞', '推官'],
    salary: 30,
    meritRequired: 1000000,
    description: '七品官员，基层长官。正七品县令是百姓口中的"父母官"，直接治理一方，是官场的基础。',
    privileges: ['可治理县域', '可审判案件', '可征收赋税'],
    stages: createStandardStages(7)
  },
  {
    level: 7,
    rankName: '从七品',
    type: '从',
    category: '文官',
    titles: ['县丞', '主簿', '教谕'],
    salary: 25,
    meritRequired: 1000000,
    description: '从七品官员，县衙佐官。辅佐县令处理政务，是县级治理的重要助手。',
    privileges: ['可协助处理政务'],
    stages: createStandardStages(7)
  }
];

/** 八品官（正从八品） */
export const RANK_8: OfficialRank[] = [
  {
    level: 8,
    rankName: '正八品',
    type: '正',
    category: '文官',
    titles: ['县尉', '巡检', '训导'],
    salary: 20,
    meritRequired: 1500000,
    description: '八品官员，基层吏员。负责治安、教化等具体事务。',
    privileges: ['可处理基层事务'],
    stages: createStandardStages(8)
  },
  {
    level: 8,
    rankName: '从八品',
    type: '从',
    category: '文官',
    titles: ['典史', '驿丞'],
    salary: 15,
    meritRequired: 1500000,
    description: '从八品官员，办事人员。负责文书、接待等具体工作。',
    privileges: ['可处理具体事务'],
    stages: createStandardStages(8)
  }
];

/** 九品官（正从九品） */
export const RANK_9: OfficialRank[] = [
  {
    level: 9,
    rankName: '正九品',
    type: '正',
    category: '文官',
    titles: ['县丞', '主簿', '照磨'],
    salary: 10,
    meritRequired: 2000000,
    description: '九品官员，吏员之首。是进入仕途的起点，负责县级基础工作。',
    privileges: ['可处理基础事务'],
    stages: createStandardStages(9)
  },
  {
    level: 9,
    rankName: '从九品',
    type: '从',
    category: '文官',
    titles: ['典吏', '攒典'],
    salary: 8,
    meritRequired: 2000000,
    description: '从九品官员，基层吏员。是官场的最底层，但也是升迁的起点。',
    privileges: ['可处理基础事务'],
    stages: createStandardStages(9)
  }
];

// ============================================================================
// 官品数据（武官）
// ============================================================================

/** 武官品级（简化版） */
export const MILITARY_RANKS: OfficialRank[] = [
  {
    level: 1,
    rankName: '正一品武',
    type: '正',
    category: '武官',
    titles: ['太尉', '枢密使'],
    salary: 280,
    meritRequired: 0,
    description: '武官一品，统领全国军马。是军队的最高统帅，掌管军政大权。',
    privileges: ['可统领全军', '可制定军事策略', '享最高武官礼遇'],
    stages: createStandardStages(1)
  },
  {
    level: 2,
    rankName: '正二品武',
    type: '正',
    category: '武官',
    titles: ['节度使', '统制'],
    salary: 180,
    meritRequired: 50000,
    description: '武官二品，镇守一方。统领一地军队，负责防务和征讨。',
    privileges: ['可统领一方军队', '可任免武官'],
    stages: createStandardStages(2)
  },
  {
    level: 3,
    rankName: '正三品武',
    type: '正',
    category: '武官',
    titles: ['都指挥使', '团练使'],
    salary: 130,
    meritRequired: 100000,
    description: '武官三品，将领之职。统领部队作战，是军队的中坚力量。',
    privileges: ['可统领部队', '可执行军事任务'],
    stages: createStandardStages(3)
  },
  {
    level: 4,
    rankName: '正四品武',
    type: '正',
    category: '武官',
    titles: ['都监', '钤辖'],
    salary: 90,
    meritRequired: 200000,
    description: '武官四品，中上级军官。负责具体防务和训练。',
    privileges: ['可负责防务', '可训练士兵'],
    stages: createStandardStages(4)
  },
  {
    level: 5,
    rankName: '正五品武',
    type: '正',
    category: '武官',
    titles: ['指挥使', '巡检'],
    salary: 60,
    meritRequired: 400000,
    description: '武官五品，中级军官。统领一支部队，负责地方防务。',
    privileges: ['可统领部队', '可维持地方治安'],
    stages: createStandardStages(5)
  },
  {
    level: 6,
    rankName: '正六品武',
    type: '正',
    category: '武官',
    titles: ['副都指挥使', '县尉'],
    salary: 45,
    meritRequired: 700000,
    description: '武官六品，下级军官。协助上级军官，负责具体防务。',
    privileges: ['可协助防务', '可维持治安'],
    stages: createStandardStages(6)
  },
  {
    level: 7,
    rankName: '正七品武',
    type: '正',
    category: '武官',
    titles: ['副指挥使', '将官'],
    salary: 25,
    meritRequired: 1000000,
    description: '武官七品，基层军官。统领基层部队，执行具体任务。',
    privileges: ['可统领基层部队'],
    stages: createStandardStages(7)
  },
  {
    level: 8,
    rankName: '正八品武',
    type: '正',
    category: '武官',
    titles: ['队将', '小校'],
    salary: 18,
    meritRequired: 1500000,
    description: '武官八品，下级军官。带领一小队士兵，执行日常任务。',
    privileges: ['可带领小队'],
    stages: createStandardStages(8)
  },
  {
    level: 9,
    rankName: '正九品武',
    type: '正',
    category: '武官',
    titles: ['伍长', '士兵'],
    salary: 10,
    meritRequired: 2000000,
    description: '武官九品，军队基层。是军队的最基本单元。',
    privileges: ['可带领伍'],
    stages: createStandardStages(9)
  }
];

// ============================================================================
// 导出汇总
// ============================================================================

/** 所有文官品级 */
export const ALL_CIVIL_RANKS: OfficialRank[] = [
  ...RANK_1,
  ...RANK_2,
  ...RANK_3,
  ...RANK_4,
  ...RANK_5,
  ...RANK_6,
  ...RANK_7,
  ...RANK_8,
  ...RANK_9
];

/** 所有官品（文武） */
export const ALL_OFFICIAL_RANKS: OfficialRank[] = [
  ...ALL_CIVIL_RANKS,
  ...MILITARY_RANKS
];

/**
 * 根据品级获取官品定义
 */
export function getRankByLevel(level: number, category: RankCategory = '文官'): OfficialRank | undefined {
  const ranks = category === '文官' ? ALL_CIVIL_RANKS : MILITARY_RANKS;
  return ranks.find(r => r.level === level && r.type === '正');
}

/**
 * 根据品级名称获取官品定义
 */
export function getRankByName(rankName: string): OfficialRank | undefined {
  return ALL_OFFICIAL_RANKS.find(r => r.rankName === rankName);
}

/**
 * 获取官品阶段信息
 */
export function getRankStageInfo(rankLevel: number, stage: RankStage, category: RankCategory = '文官') {
  const rank = getRankByLevel(rankLevel, category);
  const stageInfo = rank?.stages?.find(s => s.stage === stage);

  return {
    rankName: rank?.rankName || '未知官品',
    stageInfo,
    fullTitle: stageInfo ? `${rank?.rankName}${stage}·${stageInfo.title}` : `${rank?.rankName || '未知'}${stage}`
  };
}

/**
 * 获取下一品级
 */
export function getNextRank(currentLevel: number, category: RankCategory = '文官'): OfficialRank | undefined {
  return getRankByLevel(Math.max(1, currentLevel - 1), category);
}

/**
 * 判断是否可晋升
 */
export function canPromote(currentMerit: number, currentLevel: number, category: RankCategory = '文官'): boolean {
  const currentRank = getRankByLevel(currentLevel, category);
  if (!currentRank) return false;
  return currentMerit >= currentRank.meritRequired;
}

// ============================================================================
// 官品颜色主题系统
// ============================================================================

/** 官品颜色主题 */
export type RankColorTheme =
  | 'rank-high-noble'   // 一品：黄色（高阶显贵）
  | 'rank-high-minister' // 二品至三品：紫色（高位重臣）
  | 'rank-mid-senior'    // 四品至五品：红色（中层资深）
  | 'rank-mid-junior'    // 六品：蓝色（中层初级）
  | 'rank-low-senior'    // 七品：绿色（基层资深）
  | 'rank-low-junior';   // 八品至九品：灰色（基层初级）

/** 官品颜色主题映射 */
export const RANK_COLOR_THEMES: Record<RankColorTheme, { description: string; cssClass: string }> = {
  'rank-high-noble': {
    description: '一品高官，身着紫袍金带，位极人臣',
    cssClass: 'high-noble-rank'
  },
  'rank-high-minister': {
    description: '二至三品大员，身着紫袍，朝廷重臣',
    cssClass: 'high-minister-rank'
  },
  'rank-mid-senior': {
    description: '四至五品官员，身着红袍，中层骨干',
    cssClass: 'mid-senior-rank'
  },
  'rank-mid-junior': {
    description: '六品官员，身着绿袍，中层干部',
    cssClass: 'mid-junior-rank'
  },
  'rank-low-senior': {
    description: '七品官员，身着青袍，基层长官',
    cssClass: 'low-senior-rank'
  },
  'rank-low-junior': {
    description: '八九品吏员，身着皂袍，基层办事',
    cssClass: 'low-junior-rank'
  }
};

/**
 * 根据品级获取颜色主题
 */
export function getRankColorTheme(rankLevel: number): RankColorTheme {
  if (rankLevel === 1) return 'rank-high-noble';
  if (rankLevel <= 3) return 'rank-high-minister';
  if (rankLevel <= 5) return 'rank-mid-senior';
  if (rankLevel === 6) return 'rank-mid-junior';
  if (rankLevel === 7) return 'rank-low-senior';
  return 'rank-low-junior';
}

/**
 * 根据品级字符串获取颜色主题
 * 支持格式：'正一品'、'从二品'、'七品' 等
 */
export function parseRankColorTheme(rankString?: string): RankColorTheme | 'civilian' {
  if (!rankString) return 'civilian';

  // 提取品级数字
  const match = rankString.match(/(\d+)品/);
  if (!match) return 'civilian';

  const level = parseInt(match[1], 10);
  return getRankColorTheme(level);
}
