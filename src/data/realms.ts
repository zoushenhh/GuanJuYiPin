import type { RealmDefinition, RealmStageDefinition, RealmStage } from '../types/game';

// 通用子阶段定义函数
function createStandardStages(realmLevel: number): RealmStageDefinition[] {
  const baseMultiplier = 1 + realmLevel * 0.2;

  return [
    {
      stage: '初期' as RealmStage,
      title: '初具规模',
      breakthrough_difficulty: '普通' as const,
      resource_multiplier: baseMultiplier,
      lifespan_bonus: 0,
      special_abilities: []
    },
    {
      stage: '中期' as RealmStage,
      title: '蒸蒸日上',
      breakthrough_difficulty: '普通' as const,
      resource_multiplier: baseMultiplier * 1.3,
      lifespan_bonus: Math.floor(realmLevel * 10),
      special_abilities: []
    },
    {
      stage: '后期' as RealmStage,
      title: '繁荣昌盛',
      breakthrough_difficulty: '困难' as const,
      resource_multiplier: baseMultiplier * 1.6,
      lifespan_bonus: Math.floor(realmLevel * 20),
      special_abilities: []
    },
    {
      stage: '圆满' as RealmStage,
      title: '富甲一方',
      breakthrough_difficulty: '困难' as const,
      resource_multiplier: baseMultiplier * 2,
      lifespan_bonus: Math.floor(realmLevel * 30),
      special_abilities: [`${getRealmName(realmLevel)}圆满`, '城市稳固']
    },
    {
      stage: '极境' as RealmStage,
      title: '万城来朝',
      breakthrough_difficulty: '逆天' as const,
      resource_multiplier: baseMultiplier * 3,
      lifespan_bonus: Math.floor(realmLevel * 50),
      special_abilities: [
        '同阶无敌',
        '有限跨阶',
        '城市威望',
        '发展加速'
      ],
      can_cross_realm_battle: true
    }
  ];
}

function getRealmName(level: number): string {
  const names = ['荒村', '集镇', '县城', '府城', '州城', '都城', '皇城', '京畿', '天下'];
  return names[level] || '未知城市等级';
}

// 导出getRealmName函数供其他模块使用
export { getRealmName };

export const REALM_DEFINITIONS: RealmDefinition[] = [
  {
    level: 0,
    name: '荒村',
    title: '贫瘠村落',
    coreFeature: '人口稀少，基础设施简陋',
    lifespan: '约百载',
    activityScope: '村级',
    gapDescription: '一处贫瘠的村落，只有寥寥数户人家，基础设施极其简陋，需要大量建设才能发展。'
  },
  {
    level: 1,
    name: '集镇',
    title: '初具规模',
    coreFeature: '商贾往来，市井兴起',
    lifespan: '约120载',
    activityScope: '镇级',
    gapDescription: '已形成初步的市集，商贾往来，人口逐渐增多。基础设施开始建设，但要成为县城还需努力。',
    stages: createStandardStages(1)
  },
  {
    level: 2,
    name: '县城',
    title: '正式治所',
    coreFeature: '县衙设立，功能齐全',
    lifespan: '约250载',
    activityScope: '县级',
    gapDescription: '正式成为县级治所，县衙、学堂、医馆等基础设施齐全。商业繁荣，人口稳定增长。',
    stages: createStandardStages(2)
  },
  {
    level: 3,
    name: '府城',
    title: '区域中心',
    coreFeature: '交通枢纽，贸易发达',
    lifespan: '500-800载',
    activityScope: '府级',
    gapDescription: '发展成为区域中心，交通便利，贸易发达。各类建筑林立，城市功能完善，吸引大量人口涌入。',
    stages: createStandardStages(3)
  },
  {
    level: 4,
    name: '州城',
    title: '州府治所',
    coreFeature: '文教昌盛，工艺发达',
    lifespan: '1500-2000载',
    activityScope: '州级',
    gapDescription: '升为州府治所，文教事业兴盛，手工业发达。城市规划合理，公共设施完善，成为周边地区的经济文化中心。',
    stages: createStandardStages(4)
  },
  {
    level: 5,
    name: '都城',
    title: '繁华都会',
    coreFeature: '百业兴旺，万商云集',
    lifespan: '约5000载',
    activityScope: '府级',
    gapDescription: '已是繁华的都会，百业兴旺，商贾云集。城市规模宏大，建筑精美，是区域内最重要的商业和文化中心。',
    stages: createStandardStages(5)
  },
  {
    level: 6,
    name: '皇城',
    title: '帝王居所',
    coreFeature: '皇宫巍峨，制度完善',
    lifespan: '万载以上',
    activityScope: '多府之地',
    gapDescription: '皇城所在地，皇宫巍峨壮丽。城市管理制度完善，各项制度健全，是帝国的政治中心。',
    stages: createStandardStages(6)
  },
  {
    level: 7,
    name: '京畿',
    title: '京畿重地',
    coreFeature: '天子脚下，富庶繁华',
    lifespan: '与世同君',
    activityScope: '省级',
    gapDescription: '天子脚下的京畿重地，富庶繁华，甲于天下。城市规模庞大，人口众多，是帝国的核心区域。',
    stages: createStandardStages(7)
  },
  {
    level: 8,
    name: '天下',
    title: '天下名城',
    coreFeature: '万国来朝，举世瞩目',
    lifespan: '不定（永恒）',
    activityScope: '举世闻名',
    gapDescription: '已成为天下名城，万国来朝，举世瞩目。城市发展达到顶峰，是文明与繁荣的象征。',
    stages: createStandardStages(8)
  }
];

/**
 * 获取特定城市等级的定义
 */
export function getRealmDefinition(level: number): RealmDefinition | undefined {
  return REALM_DEFINITIONS.find(realm => realm.level === level);
}

/**
 * 获取城市等级子阶段信息
 */
export function getRealmStageInfo(realmLevel: number, stage: RealmStage) {
  const realm = getRealmDefinition(realmLevel);
  const stageInfo = realm?.stages?.find(s => s.stage === stage);

  return {
    realmName: realm?.name || '未知城市等级',
    stageInfo,
    fullTitle: stageInfo ? `${realm?.name}${stage}·${stageInfo.title}` : `${realm?.name || '未知'}${stage}`
  };
}
