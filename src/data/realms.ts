/**
 * @fileoverview 城市等级与官品系统数据
 * 定义县令模拟器中的城市等级（原境界系统）和官品晋升体系
 */

// ============================================================================
// 类型定义
// ============================================================================

/** 城市阶段 */
export type CityStage = '初期' | '中期' | '后期' | '圆满' | '极境';

/** 城市等级定义 */
export interface CityLevelDefinition {
  /** 城市等级（0-8） */
  level: number;
  /** 等级名称 */
  name: string;
  /** 等级称号 */
  title: string;
  /** 核心特征 */
  coreFeature: string;
  /** 预期发展周期 */
  lifespan: string;
  /** 活动范围 */
  activityScope: string;
  /** 等级描述 */
  description: string;
  /** 阶段列表 */
  stages?: CityStageDefinition[];
}

/** 城市阶段定义 */
export interface CityStageDefinition {
  /** 阶段名称 */
  stage: CityStage;
  /** 阶段称号 */
  title: string;
  /** 晋升难度 */
  breakthrough_difficulty: '简单' | '普通' | '困难' | '极难' | '逆天';
  /** 资源倍数 */
  resource_multiplier: number;
  /** 威望加成 */
  prestige_bonus: number;
  /** 特殊能力 */
  special_abilities: string[];
  /** 可否越级挑战 */
  can_cross_level_battle?: boolean;
}

// ============================================================================
// 辅助函数
// ============================================================================

function createStandardStages(cityLevel: number): CityStageDefinition[] {
  const baseMultiplier = 1 + cityLevel * 0.15;

  return [
    {
      stage: '初期',
      title: '初具规模',
      breakthrough_difficulty: '普通',
      resource_multiplier: baseMultiplier,
      prestige_bonus: Math.floor(cityLevel * 5),
      special_abilities: []
    },
    {
      stage: '中期',
      title: '蒸蒸日上',
      breakthrough_difficulty: '普通',
      resource_multiplier: baseMultiplier * 1.3,
      prestige_bonus: Math.floor(cityLevel * 10),
      special_abilities: ['商业发展', '人口增长']
    },
    {
      stage: '后期',
      title: '繁荣昌盛',
      breakthrough_difficulty: '困难',
      resource_multiplier: baseMultiplier * 1.6,
      prestige_bonus: Math.floor(cityLevel * 20),
      special_abilities: ['商业发展', '人口增长', '文化兴盛']
    },
    {
      stage: '圆满',
      title: '富甲一方',
      breakthrough_difficulty: '困难',
      resource_multiplier: baseMultiplier * 2,
      prestige_bonus: Math.floor(cityLevel * 30),
      special_abilities: ['商业发展', '人口增长', '文化兴盛', '城市稳固']
    },
    {
      stage: '极境',
      title: '万城来朝',
      breakthrough_difficulty: '逆天',
      resource_multiplier: baseMultiplier * 3,
      prestige_bonus: Math.floor(cityLevel * 50),
      special_abilities: [
        '同阶无敌',
        '有限跨级',
        '城市威望',
        '发展加速',
        '区域中心'
      ],
      can_cross_level_battle: true
    }
  ];
}

function getCityLevelName(level: number): string {
  const names = ['荒村', '集镇', '县城', '府城', '州城', '都城', '皇城', '京畿', '天下'];
  return names[level] || '未知城市等级';
}

// 导出函数供其他模块使用
export { getCityLevelName };

// ============================================================================
// 城市等级数据
// ============================================================================

export const CITY_LEVEL_DEFINITIONS: CityLevelDefinition[] = [
  {
    level: 0,
    name: '荒村',
    title: '贫瘠村落',
    coreFeature: '人口稀少，基础设施简陋',
    lifespan: '约百载',
    activityScope: '村级',
    description: '一处贫瘠的村落，只有寥寥数户人家，基础设施极其简陋，需要大量建设才能发展。'
  },
  {
    level: 1,
    name: '集镇',
    title: '初具规模',
    coreFeature: '商贾往来，市井兴起',
    lifespan: '约120载',
    activityScope: '镇级',
    description: '已形成初步的市集，商贾往来，人口逐渐增多。基础设施开始建设，但要成为县城还需努力。',
    stages: createStandardStages(1)
  },
  {
    level: 2,
    name: '县城',
    title: '正式治所',
    coreFeature: '县衙设立，功能齐全',
    lifespan: '约250载',
    activityScope: '县级',
    description: '正式成为县级治所，县衙、学堂、医馆等基础设施齐全。商业繁荣，人口稳定增长。',
    stages: createStandardStages(2)
  },
  {
    level: 3,
    name: '府城',
    title: '区域中心',
    coreFeature: '交通枢纽，贸易发达',
    lifespan: '500-800载',
    activityScope: '府级',
    description: '发展成为区域中心，交通便利，贸易发达。各类建筑林立，城市功能完善，吸引大量人口涌入。',
    stages: createStandardStages(3)
  },
  {
    level: 4,
    name: '州城',
    title: '州府治所',
    coreFeature: '文教昌盛，工艺发达',
    lifespan: '1500-2000载',
    activityScope: '州级',
    description: '升为州府治所，文教事业兴盛，手工业发达。城市规划合理，公共设施完善，成为周边地区的经济文化中心。',
    stages: createStandardStages(4)
  },
  {
    level: 5,
    name: '都城',
    title: '繁华都会',
    coreFeature: '百业兴旺，万商云集',
    lifespan: '约5000载',
    activityScope: '府级',
    description: '已是繁华的都会，百业兴旺，商贾云集。城市规模宏大，建筑精美，是区域内最重要的商业和文化中心。',
    stages: createStandardStages(5)
  },
  {
    level: 6,
    name: '皇城',
    title: '帝王居所',
    coreFeature: '皇宫巍峨，制度完善',
    lifespan: '万载以上',
    activityScope: '多府之地',
    description: '皇城所在地，皇宫巍峨壮丽。城市管理制度完善，各项制度健全，是帝国的政治中心。',
    stages: createStandardStages(6)
  },
  {
    level: 7,
    name: '京畿',
    title: '京畿重地',
    coreFeature: '天子脚下，富庶繁华',
    lifespan: '与世同君',
    activityScope: '省级',
    description: '天子脚下的京畿重地，富庶繁华，甲于天下。城市规模庞大，人口众多，是帝国的核心区域。',
    stages: createStandardStages(7)
  },
  {
    level: 8,
    name: '天下',
    title: '天下名城',
    coreFeature: '万国来朝，举世瞩目',
    lifespan: '不定（永恒）',
    activityScope: '举世闻名',
    description: '已成为天下名城，万国来朝，举世瞩目。城市发展达到顶峰，是文明与繁荣的象征。',
    stages: createStandardStages(8)
  }
];

// ============================================================================
// 官品与城市等级对应关系
// ============================================================================

/** 官品与城市等级对应表 */
export const RANK_TO_CITY_LEVEL: Record<number, number> = {
  9: 1,  // 九品 -> 集镇
  8: 1,  // 八品 -> 集镇
  7: 2,  // 七品 -> 县城
  6: 2,  // 六品 -> 县城
  5: 3,  // 五品 -> 府城
  4: 3,  // 四品 -> 府城
  3: 4,  // 三品 -> 州城
  2: 5,  // 二品 -> 都城
  1: 6   // 一品 -> 皇城
};

// ============================================================================
// 导出函数
// ============================================================================

/**
 * 获取特定城市等级的定义
 */
export function getCityLevelDefinition(level: number): CityLevelDefinition | undefined {
  return CITY_LEVEL_DEFINITIONS.find(city => city.level === level);
}

/**
 * 获取城市等级阶段信息
 */
export function getCityStageInfo(cityLevel: number, stage: CityStage) {
  const city = getCityLevelDefinition(cityLevel);
  const stageInfo = city?.stages?.find(s => s.stage === stage);

  return {
    cityName: city?.name || '未知城市等级',
    stageInfo,
    fullTitle: stageInfo ? `${city?.name}${stage}·${stageInfo.title}` : `${city?.name || '未知'}${stage}`
  };
}

/**
 * 根据官品获取对应城市等级
 */
export function getCityLevelByRank(rank: number): number {
  return RANK_TO_CITY_LEVEL[rank] || 1;
}

/**
 * 获取下一城市等级
 */
export function getNextCityLevel(currentLevel: number): CityLevelDefinition | undefined {
  return getCityLevelDefinition(Math.min(currentLevel + 1, 8));
}

/**
 * 获取上一城市等级
 */
export function getPreviousCityLevel(currentLevel: number): CityLevelDefinition | undefined {
  return getCityLevelDefinition(Math.max(currentLevel - 1, 0));
}

/**
 * 计算城市等级提升所需政绩
 */
export function calculateLevelUpMerit(currentLevel: number): number {
  const baseMerit = [0, 50000, 200000, 700000, 1500000, 3000000, 6000000, 12000000, 25000000];
  return baseMerit[currentLevel] || 50000000;
}

/**
 * 判断是否可以升级城市等级
 */
export function canLevelUp(currentMerit: number, currentLevel: number): boolean {
  return currentMerit >= calculateLevelUpMerit(currentLevel) && currentLevel < 8;
}
