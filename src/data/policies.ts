/**
 * @fileoverview 政令方略系统数据
 * 定义县令模拟器中可颁布的各类政令及其效果
 */

// ============================================================================
// 类型定义
// ============================================================================

/** 政令类型 */
export type PolicyType = '赋税' | '民生' | '治安' | '教化' | '商业' | '农业' | '军事' | '特殊';

/** 政令持续时间类型 */
export type PolicyDuration = '临时' | '短期' | '中期' | '长期' | '永久';

/** 政令效果类型 */
export interface PolicyEffect {
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
  /** 政绩影响 */
  政绩?: number;
  /** 银两消耗/收入 */
  银两?: number;
  /** 特殊效果描述 */
  特殊效果?: string[];
  /** 副作用描述 */
  副作用?: string[];
}

/** 政令定义 */
export interface Policy {
  /** 政令唯一标识 */
  id: string;
  /** 政令名称 */
  name: string;
  /** 政令类型 */
  type: PolicyType;
  /** 政令描述 */
  description: string;
  /** 持续时间 */
  duration: PolicyDuration;
  /** 实施所需政绩 */
  meritCost: number;
  /** 实施所需官品 */
  requiredRank?: number;
  /** 政令效果 */
  effect: PolicyEffect;
  /** 是否已实施 */
  implemented?: boolean;
  /** 实施时间（游戏时间） */
  implementTime?: string;
  /** 冷却时间（月） */
  cooldown?: number;
}

// ============================================================================
// 赋税政令
// ============================================================================

export const TAX_POLICIES: Policy[] = [
  {
    id: 'tax_reduce',
    name: '减税令',
    type: '赋税',
    description: '减免百姓赋税，减轻负担，可大幅提升民心，但减少财政收入。',
    duration: '中期',
    meritCost: 5000,
    effect: {
      民心: 20,
      赋税: -30,
      威望: 10,
      特殊效果: ['百姓称颂', '可能引发上级不满']
    }
  },
  {
    id: 'tax_increase',
    name: '加税令',
    type: '赋税',
    description: '增加赋税征收，提高财政收入，但会引起民怨。',
    duration: '中期',
    meritCost: 3000,
    effect: {
      民心: -20,
      赋税: 30,
      威望: -10,
      副作用: ['民怨沸腾', '可能引发民变']
    }
  },
  {
    id: 'tax_exempt_disaster',
    name: '灾年免税',
    type: '赋税',
    description: '灾荒之年免除赋税，救济百姓，可大幅提升民心和威望。',
    duration: '临时',
    meritCost: 10000,
    effect: {
      民心: 40,
      赋税: -100,
      威望: 30,
      政绩: 20,
      特殊效果: ['仁政之名', '百姓感激涕零']
    }
  },
  {
    id: 'tax_reform',
    name: '税制改革',
    type: '赋税',
    description: '改革税制，清理苛捐杂税，建立公平税制。短期内收入下降，长期效益显著。',
    duration: '永久',
    meritCost: 50000,
    requiredRank: 5,
    effect: {
      民心: 30,
      赋税: -20,
      威望: 25,
      政绩: 30,
      特殊效果: ['税制公平', '长期收益', '青史留名']
    }
  },
  {
    id: 'merchant_tax_cut',
    name: '商税减免',
    type: '赋税',
    description: '减免商税，促进商业发展，可带动地方经济繁荣。',
    duration: '长期',
    meritCost: 8000,
    effect: {
      商业: 30,
      赋税: -15,
      民心: 10,
      特殊效果: ['商贾云集', '经济繁荣']
    }
  }
];

// ============================================================================
// 民生政令
// ============================================================================

export const LIVELIHOOD_POLICIES: Policy[] = [
  {
    id: 'relief_grain',
    name: '开仓放粮',
    type: '民生',
    description: '打开官仓，救济灾民。消耗储备粮食，但可救活大量百姓。',
    duration: '临时',
    meritCost: 15000,
    effect: {
      民心: 35,
      威望: 25,
      政绩: 20,
      银两: -500,
      特殊效果: ['救命之恩', '百姓爱戴']
    }
  },
  {
    id: 'infrastructure',
    name: '兴修水利',
    type: '民生',
    description: '兴修水利工程，灌溉农田，防洪抗旱。需要大量投入，但长期效益显著。',
    duration: '永久',
    meritCost: 30000,
    effect: {
      农业: 25,
      民心: 20,
      威望: 15,
      银两: -2000,
      特殊效果: ['灌溉良田', '防洪抗旱', '造福子孙']
    }
  },
  {
    id: 'road_building',
    name: '修筑道路',
    type: '民生',
    description: '修筑道路，便利交通，促进物资流通和商业发展。',
    duration: '永久',
    meritCost: 20000,
    effect: {
      商业: 20,
      民心: 15,
      威望: 10,
      银两: -1500,
      特殊效果: ['交通便利', '商旅往来']
    }
  },
  {
    id: 'orphanage',
    name: '设立养济院',
    type: '民生',
    description: '设立养济院，收养孤儿和老人，体现官府仁政。',
    duration: '永久',
    meritCost: 25000,
    requiredRank: 6,
    effect: {
      民心: 25,
      教化: 15,
      威望: 20,
      银两: -800,
      特殊效果: ['老有所养', '幼有所教', '仁政典范']
    }
  }
];

// ============================================================================
// 治安政令
// ============================================================================

export const SECURITY_POLICIES: Policy[] = [
  {
    id: 'patrol_increase',
    name: '加强巡逻',
    type: '治安',
    description: '增加官兵巡逻频次，维护地方治安。',
    duration: '中期',
    meritCost: 5000,
    effect: {
      治安: 25,
      银两: -300,
      特殊效果: ['盗匪减少', '百姓安居']
    }
  },
  {
    id: 'bounty_hunt',
    name: '悬赏缉捕',
    type: '治安',
    description: '悬赏缉捕盗匪和通缉犯，鼓励百姓举报。',
    duration: '短期',
    meritCost: 8000,
    effect: {
      治安: 35,
      银两: -1000,
      威望: 15,
      特殊效果: ['盗匪落网', '治安好转']
    }
  },
  {
    id: 'militia_formation',
    name: '组建民团',
    type: '治安',
    description: '组织地方青壮年组建民团，协助维护治安。',
    duration: '长期',
    meritCost: 15000,
    requiredRank: 5,
    effect: {
      治安: 30,
      民心: -5,
      威望: 10,
      银两: -500,
      特殊效果: ['民团协助', '共同防御'],
      副作用: ['百姓负担加重']
    }
  },
  {
    id: 'curfew',
    name: '宵禁令',
    type: '治安',
    description: '实行夜间宵禁，禁止夜间出行，以维护治安。',
    duration: '中期',
    meritCost: 3000,
    effect: {
      治安: 20,
      民心: -10,
      商业: -10,
      特殊效果: ['夜间治安好转'],
      副作用: ['百姓不便', '商业受损']
    }
  }
];

// ============================================================================
// 教化政令
// ============================================================================

export const EDUCATION_POLICIES: Policy[] = [
  {
    id: 'school_found',
    name: '兴办学堂',
    type: '教化',
    description: '兴办地方学堂，教授儒家经典，教化百姓。',
    duration: '永久',
    meritCost: 20000,
    effect: {
      教化: 30,
      民心: 20,
      威望: 15,
      银两: -1000,
      特殊效果: ['开启民智', '培养人才', '文化昌盛']
    }
  },
  {
    id: 'scholar_invitation',
    name: '延请名儒',
    type: '教化',
    description: '延请当世大儒前来讲学，提升地方文化水平。',
    duration: '临时',
    meritCost: 12000,
    effect: {
      教化: 25,
      威望: 20,
      银两: -800,
      特殊效果: ['名儒讲学', '士子云集', '文化提升']
    }
  },
  {
    id: 'exam_support',
    name: '科举资助',
    type: '教化',
    description: '资助寒门学子参加科举，让更多人才有机会进入仕途。',
    duration: '长期',
    meritCost: 10000,
    effect: {
      教化: 20,
      民心: 25,
      威望: 15,
      银两: -500,
      特殊效果: ['寒门出贵子', '人才涌现']
    }
  },
  {
    id: 'moral_campaign',
    name: '教化宣传',
    type: '教化',
    description: '宣扬礼义廉耻，教化百姓，提升民风。',
    duration: '中期',
    meritCost: 5000,
    effect: {
      教化: 15,
      民心: 10,
      特殊效果: ['民风改善', '礼义兴邦']
    }
  }
];

// ============================================================================
// 商业政令
// ============================================================================

export const COMMERCE_POLICIES: Policy[] = [
  {
    id: 'market_free',
    name: '开放集市',
    type: '商业',
    description: '开放更多集市，促进商品流通和贸易繁荣。',
    duration: '永久',
    meritCost: 15000,
    effect: {
      商业: 35,
      赋税: 20,
      民心: 10,
      特殊效果: ['商贾云集', '贸易繁荣', '税收增加']
    }
  },
  {
    id: 'guild_support',
    name: '扶持商帮',
    type: '商业',
    description: '扶持本地商帮发展，给予优惠政策，促进商业繁荣。',
    duration: '长期',
    meritCost: 10000,
    effect: {
      商业: 25,
      赋税: 15,
      威望: 10,
      特殊效果: ['商帮壮大', '商业繁荣']
    }
  },
  {
    id: 'fair_hosting',
    name: '举办庙会',
    type: '商业',
    description: '举办大型庙会，吸引各地商贾和百姓，促进商业和娱乐。',
    duration: '临时',
    meritCost: 8000,
    effect: {
      商业: 30,
      民心: 20,
      威望: 10,
      银两: -500,
      特殊效果: ['万商云集', '百姓欢乐', '盛况空前']
    }
  },
  {
    id: 'craft_development',
    name: '发展手工业',
    type: '商业',
    description: '扶持本地手工业发展，生产特色产品，增加税收。',
    duration: '长期',
    meritCost: 18000,
    effect: {
      商业: 20,
      赋税: 15,
      民心: 15,
      银两: -1000,
      特殊效果: ['技艺精湛', '特产丰富', '名声远播']
    }
  }
];

// ============================================================================
// 农业政令
// ============================================================================

export const AGRICULTURE_POLICIES: Policy[] = [
  {
    id: 'new_crop',
    name: '推广良种',
    type: '农业',
    description: '推广优良作物品种，提高农业产量。',
    duration: '永久',
    meritCost: 12000,
    effect: {
      农业: 30,
      民心: 15,
      赋税: 10,
      特殊效果: ['丰收在望', '粮食充足']
    }
  },
  {
    id: 'farming_tech',
    name: '改进农具',
    type: '农业',
    description: '改进农具设计，提高农业生产效率。',
    duration: '永久',
    meritCost: 10000,
    effect: {
      农业: 25,
      民心: 10,
      银两: -800,
      特殊效果: ['效率提升', '省力增产']
    }
  },
  {
    id: 'land_reclamation',
    name: '开垦荒地',
    type: '农业',
    description: '组织百姓开垦荒地，扩大耕地面积。',
    duration: '永久',
    meritCost: 20000,
    effect: {
      农业: 35,
      民心: 20,
      赋税: 15,
      银两: -1200,
      特殊效果: ['耕地增加', '粮食增产', '长期受益']
    }
  },
  {
    id: 'farming_guide',
    name: '农技指导',
    type: '农业',
    description: '派遣农技人员指导百姓耕作，推广先进农业技术。',
    duration: '中期',
    meritCost: 6000,
    effect: {
      农业: 20,
      民心: 15,
      特殊效果: ['技艺提升', '科学种田']
    }
  }
];

// ============================================================================
// 军事政令
// ============================================================================

export const MILITARY_POLICIES: Policy[] = [
  {
    id: 'recruitment',
    name: '征召士兵',
    type: '军事',
    description: '征召本地青壮年入伍，扩充地方武装力量。',
    duration: '长期',
    meritCost: 15000,
    requiredRank: 6,
    effect: {
      治安: 25,
      民心: -15,
      威望: 10,
      银两: -1000,
      特殊效果: ['兵员充足', '防御增强'],
      副作用: ['百姓负担加重']
    }
  },
  {
    id: 'fortification',
    name: '加固城防',
    type: '军事',
    description: '加固城墙城门，提升城市防御能力。',
    duration: '永久',
    meritCost: 25000,
    requiredRank: 5,
    effect: {
      治安: 20,
      威望: 15,
      银两: -3000,
      特殊效果: ['城防坚固', '固若金汤']
    }
  },
  {
    id: 'military_training',
    name: '军事训练',
    type: '军事',
    description: '加强士兵训练，提升部队战斗力。',
    duration: '中期',
    meritCost: 10000,
    requiredRank: 6,
    effect: {
      治安: 15,
      威望: 10,
      银两: -500,
      特殊效果: ['战力提升', '纪律严明']
    }
  }
];

// ============================================================================
// 特殊政令
// ============================================================================

export const SPECIAL_POLICIES: Policy[] = [
  {
    id: 'amnesty',
    name: '大赦天下',
    type: '特殊',
    description: '赦免部分轻罪犯人，释放监狱空间，体现仁政。',
    duration: '临时',
    meritCost: 30000,
    requiredRank: 4,
    effect: {
      民心: 30,
      威望: 25,
      政绩: 20,
      特殊效果: ['皇恩浩荡', '百姓感激', '威望大增'],
      副作用: ['部分罪犯可能重新犯罪']
    }
  },
  {
    id: 'talent_search',
    name: '招贤纳士',
    type: '特殊',
    description: '广发英雄帖，招揽天下英才，为地方发展储备人才。',
    duration: '长期',
    meritCost: 20000,
    requiredRank: 5,
    effect: {
      威望: 20,
      教化: 15,
      银两: -1500,
      特殊效果: ['人才云集', '名士来访', '实力大增']
    }
  },
  {
    id: 'celebration',
    name: '举办庆典',
    type: '特殊',
    description: '举办盛大庆典，庆祝节日或重大成就，提升民心和威望。',
    duration: '临时',
    meritCost: 10000,
    effect: {
      民心: 25,
      威望: 15,
      银两: -2000,
      特殊效果: ['百姓欢腾', '盛世景象', '名声远播']
    }
  },
  {
    id: 'anti_corruption',
    name: '整顿吏治',
    type: '特殊',
    description: '整顿官场，打击贪腐，建立清廉政府。',
    duration: '永久',
    meritCost: 40000,
    requiredRank: 4,
    effect: {
      民心: 40,
      威望: 35,
      政绩: 30,
      特殊效果: ['吏治清明', '贪官敛迹', '青天之名'],
      副作用: ['可能得罪权贵']
    }
  }
];

// ============================================================================
// 导出汇总
// ============================================================================

/** 所有政令 */
export const ALL_POLICIES: Policy[] = [
  ...TAX_POLICIES,
  ...LIVELIHOOD_POLICIES,
  ...SECURITY_POLICIES,
  ...EDUCATION_POLICIES,
  ...COMMERCE_POLICIES,
  ...AGRICULTURE_POLICIES,
  ...MILITARY_POLICIES,
  ...SPECIAL_POLICIES
];

/** 政令分类 */
export const POLICY_CATEGORIES = {
  赋税: TAX_POLICIES,
  民生: LIVELIHOOD_POLICIES,
  治安: SECURITY_POLICIES,
  教化: EDUCATION_POLICIES,
  商业: COMMERCE_POLICIES,
  农业: AGRICULTURE_POLICIES,
  军事: MILITARY_POLICIES,
  特殊: SPECIAL_POLICIES
} as const;

/**
 * 根据ID获取政令
 */
export function getPolicyById(id: string): Policy | undefined {
  return ALL_POLICIES.find(p => p.id === id);
}

/**
 * 根据类型获取政令列表
 */
export function getPoliciesByType(type: PolicyType): Policy[] {
  return ALL_POLICIES.filter(p => p.type === type);
}

/**
 * 根据官品获取可实施政令
 */
export function getPoliciesByRank(rank: number): Policy[] {
  return ALL_POLICIES.filter(p => !p.requiredRank || p.requiredRank >= rank);
}

/**
 * 获取已实施政令
 */
export function getImplementedPolicies(): Policy[] {
  return ALL_POLICIES.filter(p => p.implemented);
}
