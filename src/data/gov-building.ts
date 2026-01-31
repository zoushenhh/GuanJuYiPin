/**
 * @fileoverview 政府建筑系统数据
 * 定义县令模拟器中可建造的各类政府建筑及其效果
 */

// ============================================================================
// 类型定义
// ============================================================================

/** 建筑效果类型 */
export interface BuildingEffect {
  /** 民心影响 */
  民心?: number;
  /** 赋税收入影响 */
  赋税?: number;
  /** 治安影响 */
  治安?: number;
  /** 商业影响 */
  商业?: number;
  /** 农业影响 */
  农业?: number;
  /** 教化影响 */
  教化?: number;
  /** 威望影响 */
  威望?: number;
  /** 特殊效果描述 */
  特殊效果?: string[];
}

/** 政府建筑定义 */
export interface GovBuilding {
  /** 建筑唯一标识 */
  id: string;
  /** 建筑名称 */
  name: string;
  /** 建筑描述 */
  description: string;
  /** 建造所需银两 */
  cost: number;
  /** 建造所需时间（月） */
  buildTime: number;
  /** 建筑等级 */
  level: 1 | 2 | 3;
  /** 建筑效果 */
  effect: BuildingEffect;
  /** 解锁条件（官品要求） */
  unlockRank?: number;
  /** 维护费用（每月） */
  maintenanceCost?: number;
}

// ============================================================================
// 基础建筑数据
// ============================================================================

/** 基础建筑列表 - 县级官府可建造 */
export const BASIC_BUILDINGS: GovBuilding[] = [
  {
    id: 'yamen',
    name: '县衙',
    description: '县治核心建筑，处理日常政务，维持地方秩序。县衙的存在象征皇权在地方的延伸，是官员行使权力的场所。',
    cost: 0,
    buildTime: 0,
    level: 1,
    effect: {
      治安: 10,
      民心: 5,
      赋税: 5,
      特殊效果: ['可处理政务', '可审判案件', '可征收赋税']
    }
  },
  {
    id: 'school',
    name: '县学',
    description: '兴办教育，教化百姓，培养人才。县学不仅教授儒家经典，更传播礼义廉耻，是地方教化的中心。',
    cost: 2000,
    buildTime: 3,
    level: 1,
    effect: {
      教化: 15,
      民心: 10,
      威望: 5,
      特殊效果: ['提升科举通过率', '培养本地人才']
    },
    maintenanceCost: 50
  },
  {
    id: 'clinic',
    name: '医馆',
    description: '救死扶伤，悬壶济世。医馆为百姓提供基本医疗服务，减少疫病传播，体现官府仁政。',
    cost: 1500,
    buildTime: 2,
    level: 1,
    effect: {
      民心: 15,
      特殊效果: ['降低疫病发生', '提升百姓健康']
    },
    maintenanceCost: 30
  },
  {
    id: 'market',
    name: '集市',
    description: '商贾云集，贸易繁荣。集市的建立促进商品流通，增加商税收入，带动地方经济发展。',
    cost: 1000,
    buildTime: 2,
    level: 1,
    effect: {
      商业: 20,
      赋税: 10,
      民心: 5,
      特殊效果: ['增加商税收入', '促进物资流通']
    },
    maintenanceCost: 20
  },
  {
    id: 'granary',
    name: '粮仓',
    description: '储备粮食，以备荒年。粮仓是地方稳定的重要保障，可在灾荒时开仓放粮，维持社会安定。',
    cost: 800,
    buildTime: 2,
    level: 1,
    effect: {
      民心: 10,
      农业: 5,
      特殊效果: ['储备粮食', '灾荒时可开仓放粮']
    },
    maintenanceCost: 15
  },
  {
    id: 'prison',
    name: '牢狱',
    description: '关押罪犯，维护治安。牢狱的威慑作用可减少犯罪，但其严苛也可能引起民怨。',
    cost: 600,
    buildTime: 1,
    level: 1,
    effect: {
      治安: 15,
      民心: -5,
      特殊效果: ['关押罪犯', '威慑犯罪']
    },
    maintenanceCost: 10
  },
  {
    id: 'station',
    name: '驿站',
    description: '传递公文，接待过往官员。驿站是官府信息传递的重要节点，也是连接中央与地方的纽带。',
    cost: 500,
    buildTime: 1,
    level: 1,
    effect: {
      威望: 5,
      特殊效果: ['加快公文传递', '接待过往官员']
    },
    maintenanceCost: 10
  },
  {
    id: 'temple',
    name: '城隍庙',
    description: '祭祀城隍，祈求平安。城隍庙是百姓信仰寄托之所，也是宣扬因果报应、劝人向善的场所。',
    cost: 400,
    buildTime: 1,
    level: 1,
    effect: {
      民心: 10,
      教化: 5,
      特殊效果: ['提升百姓信仰', '劝善惩恶']
    },
    maintenanceCost: 5
  }
];

// ============================================================================
// 进阶建筑数据
// ============================================================================

/** 进阶建筑列表 - 需要更高官品 */
export const ADVANCED_BUILDINGS: GovBuilding[] = [
  {
    id: 'confucian_temple',
    name: '孔庙',
    description: '供奉至圣先师孔子，弘扬儒学。孔庙是地方文教精神的象征，可大幅提升教化效果，培养更多人才。',
    cost: 5000,
    buildTime: 6,
    level: 2,
    effect: {
      教化: 30,
      威望: 15,
      民心: 10,
      特殊效果: ['大幅提升科举通过率', '吸引文人墨客', '提升文化影响力']
    },
    unlockRank: 5,
    maintenanceCost: 100
  },
  {
    id: 'military_camp',
    name: '兵营',
    description: '驻扎官兵，保卫地方。兵营可维持地方治安，剿灭盗匪，是维护社会秩序的重要力量。',
    cost: 4000,
    buildTime: 4,
    level: 2,
    effect: {
      治安: 30,
      民心: -10,
      威望: 10,
      特殊效果: ['可征召民兵', '剿灭盗匪', '应对外敌']
    },
    unlockRank: 4,
    maintenanceCost: 150
  },
  {
    id: 'workshop',
    name: '工坊',
    description: '制造器物，发展手工业。工坊可生产各类用品，增加税收收入，促进地方经济发展。',
    cost: 3000,
    buildTime: 3,
    level: 2,
    effect: {
      商业: 25,
      赋税: 15,
      威望: 5,
      特殊效果: ['生产器具', '提供就业', '增加税收']
    },
    unlockRank: 4,
    maintenanceCost: 80
  },
  {
    id: 'irrigation',
    name: '水利',
    description: '兴修水利，灌溉农田。水利工程是农业发展的基础，可大幅提升农业产量，减少水旱灾害。',
    cost: 3500,
    buildTime: 5,
    level: 2,
    effect: {
      农业: 30,
      民心: 15,
      赋税: 10,
      特殊效果: ['提升农业产量', '减少水旱灾害', '长期收益']
    },
    unlockRank: 5,
    maintenanceCost: 50
  },
  {
    id: 'archive',
    name: '档案库',
    description: '保存档案，记录历史。档案库保存地方户籍、田亩、税收等重要记录，是治理地方的重要参考。',
    cost: 2000,
    buildTime: 3,
    level: 2,
    effect: {
      威望: 10,
      教化: 5,
      特殊效果: ['保存地方记录', '便于查阅历史', '提升治理效率']
    },
    unlockRank: 5,
    maintenanceCost: 30
  }
];

// ============================================================================
// 高级建筑数据
// ============================================================================

/** 高级建筑列表 - 需要高官品 */
export const ELITE_BUILDINGS: GovBuilding[] = [
  {
    id: 'academy',
    name: '书院',
    description: '高等学府，培养栋梁。书院是地方最高学府，可培养出进入仕途的人才，显著提升地方文化影响力。',
    cost: 10000,
    buildTime: 12,
    level: 3,
    effect: {
      教化: 50,
      威望: 25,
      民心: 15,
      特殊效果: ['培养高阶人才', '提升文化影响力', '吸引名士']
    },
    unlockRank: 3,
    maintenanceCost: 200
  },
  {
    id: 'arsenal',
    name: '武库',
    description: '储备军械，备战所需。武库储备大量兵器铠甲，可武装大批官兵，是地方军事力量的保障。',
    cost: 8000,
    buildTime: 8,
    level: 3,
    effect: {
      治安: 40,
      威望: 20,
      民心: -15,
      特殊效果: ['武装官兵', '威慑外敌', '提升军事力量']
    },
    unlockRank: 3,
    maintenanceCost: 250
  },
  {
    id: 'mint',
    name: '铸币局',
    description: '铸造钱币，掌控金融。铸币局可铸造官方货币，调控地方经济，增加财政收入。',
    cost: 12000,
    buildTime: 10,
    level: 3,
    effect: {
      商业: 40,
      赋税: 30,
      威望: 20,
      特殊效果: ['铸造货币', '调控经济', '增加收入']
    },
    unlockRank: 2,
    maintenanceCost: 300
  },
  {
    id: 'observatory',
    name: '观象台',
    description: '观天象，授农时。观象台可观测天象，制定历法，指导农业生产，彰显官府智慧。',
    cost: 15000,
    buildTime: 15,
    level: 3,
    effect: {
      教化: 25,
      农业: 20,
      威望: 30,
      特殊效果: ['预测天象', '制定历法', '彰显智慧']
    },
    unlockRank: 2,
    maintenanceCost: 150
  },
  {
    id: 'pavilion',
    name: '藏书阁',
    description: '藏书万卷，传承文明。藏书阁收藏各类典籍，是地方文化的瑰宝，可吸引学者前来研读。',
    cost: 8000,
    buildTime: 10,
    level: 3,
    effect: {
      教化: 40,
      威望: 25,
      特殊效果: ['收藏典籍', '吸引学者', '传承文化']
    },
    unlockRank: 2,
    maintenanceCost: 100
  }
];

// ============================================================================
// 导出汇总
// ============================================================================

/** 所有政府建筑 */
export const ALL_BUILDINGS: GovBuilding[] = [
  ...BASIC_BUILDINGS,
  ...ADVANCED_BUILDINGS,
  ...ELITE_BUILDINGS
];

/** 建筑类型分类 */
export const BUILDING_CATEGORIES = {
  基础: BASIC_BUILDINGS,
  进阶: ADVANCED_BUILDINGS,
  高级: ELITE_BUILDINGS
} as const;

/**
 * 根据ID获取建筑定义
 */
export function getBuildingById(id: string): GovBuilding | undefined {
  return ALL_BUILDINGS.find(b => b.id === id);
}

/**
 * 根据官品获取可建造建筑列表
 */
export function getBuildingsByRank(rank: number): GovBuilding[] {
  return ALL_BUILDINGS.filter(b => !b.unlockRank || b.unlockRank >= rank);
}

/**
 * 计算建筑总维护费用
 */
export function calculateMaintenanceCost(buildingIds: string[]): number {
  return buildingIds.reduce((total, id) => {
    const building = getBuildingById(id);
    return total + (building?.maintenanceCost || 0);
  }, 0);
}
