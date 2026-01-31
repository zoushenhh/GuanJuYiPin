import type { RealmDefinition, RealmStageDefinition, RealmStage } from '../types/game';

// 通用子阶段定义函数
function createStandardStages(realmLevel: number): RealmStageDefinition[] {
  const baseMultiplier = 1 + realmLevel * 0.2;

  return [
    {
      stage: '初期' as RealmStage,
      title: '初入官场',
      breakthrough_difficulty: '普通' as const,
      resource_multiplier: baseMultiplier,
      lifespan_bonus: 0,
      special_abilities: []
    },
    {
      stage: '中期' as RealmStage,
      title: '渐有政声',
      breakthrough_difficulty: '普通' as const,
      resource_multiplier: baseMultiplier * 1.3,
      lifespan_bonus: Math.floor(realmLevel * 10),
      special_abilities: []
    },
    {
      stage: '后期' as RealmStage,
      title: '政绩卓著',
      breakthrough_difficulty: '困难' as const,
      resource_multiplier: baseMultiplier * 1.6,
      lifespan_bonus: Math.floor(realmLevel * 20),
      special_abilities: []
    },
    {
      stage: '圆满' as RealmStage,
      title: '口碑载道',
      breakthrough_difficulty: '困难' as const,
      resource_multiplier: baseMultiplier * 2,
      lifespan_bonus: Math.floor(realmLevel * 30),
      special_abilities: [`${getRealmName(realmLevel)}圆满`, '政声稳固']
    },
    {
      stage: '极境' as RealmStage,
      title: '权倾一方',
      breakthrough_difficulty: '逆天' as const,
      resource_multiplier: baseMultiplier * 3,
      lifespan_bonus: Math.floor(realmLevel * 50),
      special_abilities: [
        '同阶无敌',
        '有限跨阶',
        '官威如山',
        '升迁加速'
      ],
      can_cross_realm_battle: true
    }
  ];
}

function getRealmName(level: number): string {
  const names = ['布衣', '九品', '八品', '七品', '六品', '五品', '四品', '三品', '二品'];
  return names[level] || '未知官品';
}

// 导出getRealmName函数供其他模块使用
export { getRealmName };

export const REALM_DEFINITIONS: RealmDefinition[] = [
  {
    level: 0,
    name: '布衣',
    title: '未入仕途',
    coreFeature: '平民百姓，未入官场',
    lifespan: '约百载',
    activityScope: '民间',
    gapDescription: '未入仕途，仍是平民百姓。'
  },
  {
    level: 1,
    name: '九品',
    title: '县丞',
    coreFeature: '初入官场，辅佐县令',
    lifespan: '约120载',
    activityScope: '县级',
    gapDescription: '县衙佐官，协助县令处理日常政务，是官场的入门之阶。',
    stages: createStandardStages(1)
  },
  {
    level: 2,
    name: '八品',
    title: '县令',
    coreFeature: '执掌一县，为民父母',
    lifespan: '约250载',
    activityScope: '县级',
    gapDescription: '正式成为一县之主，掌管全县行政、司法、税收大权，百姓尊称"父母官"。',
    stages: createStandardStages(2)
  },
  {
    level: 3,
    name: '七品',
    title: '知县',
    coreFeature: '治理有方，政声远播',
    lifespan: '500-800载',
    activityScope: '县级至州级',
    gapDescription: '治理有方，政绩显著。其名号在民间流传，百姓称颂，上级赏识。',
    stages: createStandardStages(3)
  },
  {
    level: 4,
    name: '六品',
    title: '知州',
    coreFeature: '掌管一州，威望显赫',
    lifespan: '1500-2000载',
    activityScope: '州级',
    gapDescription: '升任知州，掌管一州政务。其一言可定一州政策，是地方的实权官员。',
    stages: createStandardStages(4)
  },
  {
    level: 5,
    name: '五品',
    title: '知府',
    coreFeature: '治理府城，位高权重',
    lifespan: '约5000载',
    activityScope: '府级',
    gapDescription: '官拜知府，治理数县之地。县级政务于他已如观掌纹，不在话下。',
    stages: createStandardStages(5)
  },
  {
    level: 6,
    name: '四品',
    title: '道台',
    coreFeature: '监察一方，督察司法',
    lifespan: '万载以上',
    activityScope: '多府之地',
    gapDescription: '官拜道台，监察数府政务，督察司法，位高权重。',
    stages: createStandardStages(6)
  },
  {
    level: 7,
    name: '三品',
    title: '按察使',
    coreFeature: '司法大权，声威显赫',
    lifespan: '与世同君',
    activityScope: '省级',
    gapDescription: '官拜按察使，掌管一省司法大权，其政令影响深远，稳定一方民生。',
    stages: createStandardStages(7)
  },
  {
    level: 8,
    name: '二品',
    title: '巡抚',
    coreFeature: '封疆大吏，位极人臣',
    lifespan: '不定（任期）',
    activityScope: '一省或多省',
    gapDescription: '已是地方官之巅峰，巡抚一方，准备入阁拜相。每一次升迁都是朝堂盛事。',
    stages: createStandardStages(8)
  }
];

/**
 * 获取特定官品的定义
 */
export function getRealmDefinition(level: number): RealmDefinition | undefined {
  return REALM_DEFINITIONS.find(realm => realm.level === level);
}

/**
 * 获取官品子阶段信息
 */
export function getRealmStageInfo(realmLevel: number, stage: RealmStage) {
  const realm = getRealmDefinition(realmLevel);
  const stageInfo = realm?.stages?.find(s => s.stage === stage);

  return {
    realmName: realm?.name || '未知官品',
    stageInfo,
    fullTitle: stageInfo ? `${realm?.name}${stage}·${stageInfo.title}` : `${realm?.name || '未知'}${stage}`
  };
}
