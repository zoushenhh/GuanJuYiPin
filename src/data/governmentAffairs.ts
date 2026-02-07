/**
 * @fileoverview 政务事务系统数据
 * 定义县令模拟器中可处理的各类政务事务
 *
 * 【设计理念】
 * - 政务事务是县令日常工作的主要内容
 * - 每个事务有明确的时间消耗、资源消耗和结果
 * - 不同类型的事务影响不同的县城指标
 * - 事务难度和紧急度影响处理成功率
 */

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 政务类型
 */
export type GovernmentAffairType =
  | '救灾'      // 灾害救助（旱灾、水灾、疫病）
  | '剿匪'      // 清剿盗匪
  | '征税'      // 税收征收
  | '审案'      // 审理案件
  | '巡查'      // 巡查民情
  | '建设'      // 基础设施建设
  | '教化'      // 教化民众
  | '商贸'      // 促进商贸
  | '人事'      // 人事任免
  | '外交';     // 外交事务

/**
 * 政务紧急度
 */
export type AffairUrgency = '低' | '中' | '高' | '极高';

/**
 * 政务难度
 */
export type AffairDifficulty = '简单' | '普通' | '困难' | '极难';

/**
 * 政务状态
 */
export type AffairStatus = '待处理' | '处理中' | '已完成' | '已搁置';

/**
 * 时间单位
 */
export type TimeUnit = '分钟' | '小时' | '天' | '月';

/**
 * 政务选项
 */
export interface AffairOption {
  /** 选项ID */
  id: string;
  /** 选项描述 */
  description: string;
  /** 选项类型 */
  type: '处理' | '观察' | '搁置' | '委托';

  /** 资源消耗 */
  cost?: {
    银两?: number;
    粮食?: number;
    时间?: number;
    时间单位?: TimeUnit;
    政绩?: number;
    威望?: number;
  };

  /** 成功率（基础成功率，受属性影响） */
  successRate?: number;

  /** 成功效果 */
  successEffect: {
    民心?: number;
    治安?: number;
    繁荣度?: number;
    教化?: number;
    库银?: number;
    粮食?: number;
    政绩?: number;
    威望?: number;
    描述?: string;
  };

  /** 失败效果 */
  failureEffect?: {
    民心?: number;
    治安?: number;
    繁荣度?: number;
    教化?: number;
    库银?: number;
    粮食?: number;
    政绩?: number;
    威望?: number;
    描述?: string;
  };

  /** 特殊奖励 */
  specialReward?: string[];
}

/**
 * 政务事务定义
 */
export interface GovernmentAffair {
  /** 事务唯一标识 */
  id: string;
  /** 事务名称 */
  name: string;
  /** 事务类型 */
  type: GovernmentAffairType;
  /** 事务紧急度 */
  urgency: AffairUrgency;
  /** 事务难度 */
  difficulty: AffairDifficulty;

  /** 事务描述 */
  description: string;
  /** 详细说明（可选） */
  details?: string;

  /** 可用选项 */
  options: AffairOption[];

  /** 触发条件 */
  triggerCondition?: {
    /** 最低官品要求 */
    minRank?: number;
    /** 最高官品限制 */
    maxRank?: number;
    /** 最低民心要求 */
    minPublicTrust?: number;
    /** 最低库银要求 */
    minTreasury?: number;
    /** 特定事件触发 */
    eventTrigger?: string;
  };

  /** 是否一次性事务（处理完后不再出现） */
  oneTime?: boolean;

  /** 刷新时间（小时，非一次性事务刷新间隔） */
  refreshTime?: number;

  /** AI提示词（用于生成剧情） */
  aiPrompt?: string;
}

// ============================================================================
// 政务事务数据
// ============================================================================

/**
 * 救灾类政务事务
 */
const DISASTER_AFFAIRS: GovernmentAffair[] = [
  {
    id: 'disaster_drought',
    name: '旱灾救助',
    type: '救灾',
    urgency: '高',
    difficulty: '困难',
    description: '境内遭遇旱灾，田地龟裂，粮食减产，百姓生计艰难。',
    details: '旱情已持续两月，多处村庄水源枯竭。如不及时救助，恐生民变。',
    options: [
      {
        id: 'disaster_drought_relief',
        type: '处理',
        description: '开仓放粮，组织抗旱（消耗500银两、200石粮食）',
        cost: {
          银两: 500,
          粮食: 200,
          时间: 8,
          时间单位: '小时',
        },
        successRate: 0.75,
        successEffect: {
          民心: 15,
          治安: 5,
          政绩: 10,
          威望: 5,
          描述: '开仓放粮，民心大悦，旱情得到缓解。',
        },
        failureEffect: {
          民心: 5,
          库银: -500,
          粮食: -200,
          政绩: -5,
          描述: '救灾效果有限，粮食损耗较大，但勉强缓解了旱情。',
        },
      },
      {
        id: 'disaster_drought_pray',
        type: '处理',
        description: '组织祈雨仪式（消耗100银两，提升民心但效果有限）',
        cost: {
          银两: 100,
          时间: 4,
          时间单位: '小时',
        },
        successRate: 0.5,
        successEffect: {
          民心: 8,
          教化: 3,
          威望: 2,
          描述: '祈雨仪式圆满完成，虽无降雨，但百姓感念诚意。',
        },
        failureEffect: {
          民心: -5,
          教化: -2,
          库银: -100,
          描述: '祈雨仪式失败，百姓失望，质疑县令能力。',
        },
      },
      {
        id: 'disaster_drought_wait',
        type: '观察',
        description: '观察旱情发展（暂无消耗，但可能恶化）',
        cost: {
          时间: 2,
          时间单位: '小时',
        },
        successEffect: {
          民心: -3,
          描述: '旱情持续观察中，百姓对县令的消极态度有所不满。',
        },
      },
    ],
    oneTime: true,
    refreshTime: 168, // 7天刷新
    aiPrompt: '描述旱灾对县城的影响，百姓的苦难，以及县令救灾过程中的具体场景和人物互动。',
  },
  {
    id: 'disaster_flood',
    name: '水灾救助',
    type: '救灾',
    urgency: '极高',
    difficulty: '极难',
    description: '连日暴雨导致河水泛滥，多处村庄被淹，百姓流离失所。',
    details: '洪水已冲毁农田千亩，民房百余间，急需安置灾民、修缮堤坝。',
    options: [
      {
        id: 'disaster_flood_emergency',
        type: '处理',
        description: '紧急救灾，修缮堤坝（消耗800银两、300石粮食）',
        cost: {
          银两: 800,
          粮食: 300,
          时间: 16,
          时间单位: '小时',
        },
        successRate: 0.65,
        successEffect: {
          民心: 20,
          治安: 10,
          政绩: 15,
          威望: 8,
          描述: '救灾及时，堤坝修缮完毕，灾民得到妥善安置。',
        },
        failureEffect: {
          民心: 3,
          治安: -5,
          库银: -800,
          粮食: -300,
          政绩: -3,
          描述: '洪水太过猛烈，虽尽力救灾，但损失依然惨重。',
        },
      },
      {
        id: 'disaster_flood_evacuate',
        type: '处理',
        description: '组织灾民撤离（消耗200银两、100石粮食）',
        cost: {
          银两: 200,
          粮食: 100,
          时间: 6,
          时间单位: '小时',
        },
        successRate: 0.85,
        successEffect: {
          民心: 10,
          治安: 5,
          政绩: 5,
          描述: '及时撤离，避免人员伤亡，百姓感激。',
        },
        failureEffect: {
          民心: -8,
          治安: -10,
          库银: -200,
          粮食: -100,
          政绩: -8,
          描述: '撤离混乱，导致部分人员伤亡，百姓怨声载道。',
        },
      },
    ],
    oneTime: true,
    refreshTime: 240, // 10天刷新
    aiPrompt: '描述洪水肆虐的场景，县令组织救灾的紧急情况，以及灾民的苦难和希望。',
  },
  {
    id: 'disaster_plague',
    name: '疫病防控',
    type: '救灾',
    urgency: '极高',
    difficulty: '困难',
    description: '境内爆发疫病，已有数十人感染，疫情有蔓延趋势。',
    details: '疫病传播迅速，百姓恐慌。需立即隔离病患、调配药材。',
    options: [
      {
        id: 'disaster_plague_quarantine',
        type: '处理',
        description: '隔离病患，调配药材（消耗600银两）',
        cost: {
          银两: 600,
          时间: 12,
          时间单位: '小时',
        },
        successRate: 0.7,
        successEffect: {
          民心: 12,
          治安: 8,
          政绩: 12,
          威望: 6,
          描述: '隔离及时，药材充足，疫情得到控制。',
        },
        failureEffect: {
          民心: -10,
          治安: -15,
          库银: -600,
          政绩: -10,
          描述: '疫情失控，感染者增加，民心惶惶。',
        },
      },
      {
        id: 'disaster_plague_pray',
        type: '处理',
        description: '祭祀祈福（消耗200银两，效果有限）',
        cost: {
          银两: 200,
          时间: 6,
          时间单位: '小时',
        },
        successRate: 0.4,
        successEffect: {
          民心: 5,
          教化: 5,
          描述: '祈福仪式虽然不能阻止疫情，但给予百姓精神慰藉。',
        },
        failureEffect: {
          民心: -15,
          教化: -3,
          库银: -200,
          描述: '疫情蔓延，百姓质疑县令的不作为。',
        },
      },
    ],
    oneTime: true,
    refreshTime: 192, // 8天刷新
    aiPrompt: '描述疫病爆发的恐慌场景，县令采取的防疫措施，以及医者救治病患的过程。',
  },
];

/**
 * 治安类政务事务
 */
const SECURITY_AFFAIRS: GovernmentAffair[] = [
  {
    id: 'security_bandits',
    name: '剿匪行动',
    type: '剿匪',
    urgency: '高',
    difficulty: '困难',
    description: '境内盗匪猖獗，劫掠村庄，商道受阻，百姓惶恐不安。',
    details: '据报有土匪百余人盘踞山中，时常下山劫掠，需派兵清剿。',
    options: [
      {
        id: 'security_bandits_attack',
        type: '处理',
        description: '调兵剿匪（消耗400银两）',
        cost: {
          银两: 400,
          时间: 10,
          时间单位: '小时',
        },
        successRate: 0.7,
        successEffect: {
          民心: 10,
          治安: 15,
          政绩: 10,
          威望: 8,
          描述: '剿匪成功，匪首被擒，百姓安居乐业。',
        },
        failureEffect: {
          民心: -5,
          治安: -8,
          库银: -400,
          政绩: -8,
          威望: -5,
          描述: '剿匪失败，官兵伤亡，盗匪气焰更盛。',
        },
      },
      {
        id: 'security_bandits_recruit',
        type: '处理',
        description: '招安匪首（消耗200银两）',
        cost: {
          银两: 200,
          时间: 6,
          时间单位: '小时',
        },
        successRate: 0.6,
        successEffect: {
          民心: 5,
          治安: 10,
          政绩: 8,
          描述: '招安成功，盗匪编入民团，成为县城保卫力量。',
        },
        failureEffect: {
          民心: -3,
          治安: -5,
          库银: -200,
          政绩: -5,
          描述: '招安失败，匪首假意投降后继续作乱。',
        },
      },
      {
        id: 'security_bandits_defense',
        type: '处理',
        description: '加强防卫（消耗300银两，减少盗匪影响）',
        cost: {
          银两: 300,
          时间: 8,
          时间单位: '小时',
        },
        successRate: 0.85,
        successEffect: {
          治安: 8,
          政绩: 5,
          描述: '防卫加强，盗匪无法得逞，县城治安稳定。',
        },
        failureEffect: {
          治安: -3,
          库银: -300,
          描述: '防卫措施有限，盗匪仍有机可乘。',
        },
      },
    ],
    refreshTime: 120, // 5天刷新
    aiPrompt: '描述盗匪劫掠的场景，县令制定剿匪策略的过程，以及官兵与盗匪的战斗。',
  },
  {
    id: 'security_inspection',
    name: '治安巡查',
    type: '巡查',
    urgency: '中',
    difficulty: '简单',
    description: '定期巡查县城治安状况，防范犯罪行为。',
    details: '巡查街道、市场、酒肆等场所，维护治安秩序。',
    options: [
      {
        id: 'security_inspection_patrol',
        type: '处理',
        description: '亲自巡查（消耗2小时，微量提升各项数值）',
        cost: {
          时间: 2,
          时间单位: '小时',
        },
        successRate: 0.95,
        successEffect: {
          民心: 3,
          治安: 5,
          政绩: 2,
          描述: '巡查发现并制止了几起纠纷，治安有所改善。',
        },
        failureEffect: {
          政绩: -1,
          描述: '巡查过程平淡，未发现异常。',
        },
      },
      {
        id: 'security_inspection_delegate',
        type: '委托',
        description: '委托捕头巡查（无消耗，效果较低）',
        cost: {
          时间: 1,
          时间单位: '小时',
        },
        successRate: 0.8,
        successEffect: {
          治安: 2,
          政绩: 1,
          描述: '捕头巡查完毕，报告治安状况良好。',
        },
      },
    ],
    refreshTime: 24, // 1天刷新
    aiPrompt: '描述县令巡查县城的场景，与百姓的互动，发现并处理的小问题。',
  },
];

/**
 * 财政类政务事务
 */
const FINANCE_AFFAIRS: GovernmentAffair[] = [
  {
    id: 'finance_taxation',
    name: '征税工作',
    type: '征税',
    urgency: '中',
    difficulty: '普通',
    description: '年度税收征收时间到了，需组织税收工作。',
    details: '税收是县衙主要财源，既要保证税收，又不能过度征收激怒百姓。',
    options: [
      {
        id: 'finance_taxation_normal',
        type: '处理',
        description: '按标准税率征收（正常税收）',
        cost: {
          时间: 6,
          时间单位: '小时',
        },
        successRate: 0.9,
        successEffect: {
          库银: 800,
          民心: -2,
          政绩: 8,
          描述: '税收顺利完成，库银充盈。',
        },
        failureEffect: {
          民心: -5,
          政绩: -3,
          描述: '税收过程中出现纠纷，百姓有怨言。',
        },
      },
      {
        id: 'finance_taxation_heavy',
        type: '处理',
        description: '加重赋税（增加库银，但降低民心）',
        cost: {
          时间: 6,
          时间单位: '小时',
        },
        successRate: 0.85,
        successEffect: {
          库银: 1200,
          民心: -10,
          政绩: 5,
          描述: '税收超额完成，但百姓负担加重，怨声载道。',
        },
        failureEffect: {
          民心: -20,
          治安: -5,
          政绩: -10,
          描述: '重税激起民怨，甚至发生抗税事件。',
        },
      },
      {
        id: 'finance_taxation_light',
        type: '处理',
        description: '减免赋税（降低库银，但提升民心）',
        cost: {
          时间: 4,
          时间单位: '小时',
        },
        successRate: 0.95,
        successEffect: {
          库银: 500,
          民心: 8,
          政绩: 3,
          威望: 5,
          描述: '减免税收，百姓感激涕零，赞颂县令仁政。',
        },
        failureEffect: {
          库银: 400,
          政绩: -2,
          描述: '税收不足，财政吃紧。',
        },
      },
    ],
    refreshTime: 720, // 30天刷新（每月一次）
    aiPrompt: '描述征税的场景，县令在税收政策上的考量，以及百姓对税收的反应。',
  },
];

/**
 * 司法类政务事务
 */
const JUDICIAL_AFFAIRS: GovernmentAffair[] = [
  {
    id: 'judicial_trial',
    name: '审理案件',
    type: '审案',
    urgency: '中',
    difficulty: '普通',
    description: '有多起案件等待审理，需公正判决。',
    details: '包括盗窃、纠纷、斗殴等案件，需仔细审查证据，做出公正判决。',
    options: [
      {
        id: 'judicial_trial_fair',
        type: '处理',
        description: '公正审理（消耗4小时，提升治安和民心）',
        cost: {
          时间: 4,
          时间单位: '小时',
        },
        successRate: 0.85,
        successEffect: {
          民心: 6,
          治安: 8,
          政绩: 6,
          教化: 3,
          描述: '案件审理公正，百姓称颂县令明察秋毫。',
        },
        failureEffect: {
          民心: -3,
          治安: -5,
          政绩: -3,
          描述: '审理过程中出现失误，判决引起争议。',
        },
      },
      {
        id: 'judicial_trial_severe',
        type: '处理',
        description: '严惩不贷（消耗4小时，提升治安但可能降低民心）',
        cost: {
          时间: 4,
          时间单位: '小时',
        },
        successRate: 0.8,
        successEffect: {
          治安: 12,
          民心: -3,
          政绩: 5,
          描述: '严厉惩处罪犯，治安明显好转。',
        },
        failureEffect: {
          民心: -10,
          治安: -5,
          政绩: -5,
          描述: '刑罚过重，引起百姓不满，认为县令残暴。',
        },
      },
      {
        id: 'judicial_trial_educate',
        type: '处理',
        description: '教化为主（消耗4小时，提升教化和民心）',
        cost: {
          时间: 4,
          时间单位: '小时',
        },
        successRate: 0.75,
        successEffect: {
          教化: 10,
          民心: 5,
          政绩: 4,
          描述: '以教化为主，感化罪犯，百姓称赞县令仁德。',
        },
        failureEffect: {
          治安: -8,
          教化: -3,
          政绩: -4,
          描述: '教化效果不佳，罪犯不知悔改，继续作案。',
        },
      },
    ],
    refreshTime: 48, // 2天刷新
    aiPrompt: '描述县令审理案件的过程，案件的细节，以及判决对县城的影响。',
  },
];

/**
 * 建设类政务事务
 */
const CONSTRUCTION_AFFAIRS: GovernmentAffair[] = [
  {
    id: 'construction_road',
    name: '修筑道路',
    type: '建设',
    urgency: '低',
    difficulty: '普通',
    description: '县城道路年久失修，影响交通和商贸。',
    details: '修筑道路可促进商贸往来，提升繁荣度。',
    options: [
      {
        id: 'construction_road_standard',
        type: '处理',
        description: '标准修筑（消耗600银两，5天工期）',
        cost: {
          银两: 600,
          时间: 5,
          时间单位: '天',
        },
        successRate: 0.9,
        successEffect: {
          繁荣度: 10,
          民心: 5,
          政绩: 8,
          描述: '道路修筑完成，交通便利，商贸兴旺。',
        },
        failureEffect: {
          库银: -600,
          政绩: -3,
          描述: '修筑过程中出现质量问题，道路质量一般。',
        },
      },
      {
        id: 'construction_road_quality',
        type: '处理',
        description: '精工修筑（消耗1000银两，7天工期）',
        cost: {
          银两: 1000,
          时间: 7,
          时间单位: '天',
        },
        successRate: 0.85,
        successEffect: {
          繁荣度: 15,
          民心: 8,
          政绩: 12,
          威望: 5,
          描述: '精工修筑，道路宽敞平整，百姓称赞。',
        },
        failureEffect: {
          库银: -1000,
          政绩: -5,
          描述: '投入过大，但效果未达预期。',
        },
      },
    ],
    oneTime: true,
    aiPrompt: '描述修筑道路的场景，工匠施工的过程，以及道路修成后对县城的积极影响。',
  },
  {
    id: 'construction_school',
    name: '兴建学堂',
    type: '建设',
    urgency: '低',
    difficulty: '普通',
    description: '县城缺乏学堂，儿童无法接受教育。',
    details: '兴建学堂可提升教化水平，培养人才。',
    options: [
      {
        id: 'construction_school_build',
        type: '处理',
        description: '兴建学堂（消耗800银两，10天工期）',
        cost: {
          银两: 800,
          时间: 10,
          时间单位: '天',
        },
        successRate: 0.85,
        successEffect: {
          教化: 15,
          民心: 8,
          政绩: 10,
          威望: 8,
          描述: '学堂建成，儿童入学读书，教化水平显著提升。',
        },
        failureEffect: {
          库银: -800,
          政绩: -5,
          描述: '学堂建成后师资不足，效果有限。',
        },
      },
    ],
    oneTime: true,
    aiPrompt: '描述兴建学堂的过程，县令对教育的重视，以及学堂开学时的场景。',
  },
  {
    id: 'construction_clinic',
    name: '开设医馆',
    type: '建设',
    urgency: '低',
    difficulty: '普通',
    description: '县城缺乏医馆，百姓看病困难。',
    details: '开设医馆可保障百姓健康，提升民心。',
    options: [
      {
        id: 'construction_clinic_build',
        type: '处理',
        description: '开设医馆（消耗700银两，8天工期）',
        cost: {
          银两: 700,
          时间: 8,
          时间单位: '天',
        },
        successRate: 0.85,
        successEffect: {
          民心: 12,
          政绩: 10,
          威望: 6,
          描述: '医馆开业，百姓看病方便，感激县令关怀。',
        },
        failureEffect: {
          库银: -700,
          政绩: -5,
          描述: '医馆建成后药材不足，效果有限。',
        },
      },
    ],
    oneTime: true,
    aiPrompt: '描述开设医馆的过程，县令对百姓健康的关怀，以及医馆治病救人的场景。',
  },
];

/**
 * 教化类政务事务
 */
const EDUCATION_AFFAIRS: GovernmentAffair[] = [
  {
    id: 'education_lecture',
    name: '宣讲教化',
    type: '教化',
    urgency: '低',
    difficulty: '简单',
    description: '定期向百姓宣讲礼仪道德，提升教化水平。',
    details: '宣讲内容包括圣贤教诲、为人之道、和睦邻里等。',
    options: [
      {
        id: 'education_lecture_personal',
        type: '处理',
        description: '亲自宣讲（消耗2小时）',
        cost: {
          时间: 2,
          时间单位: '小时',
        },
        successRate: 0.9,
        successEffect: {
          教化: 6,
          民心: 4,
          政绩: 3,
          描述: '县令亲自宣讲，百姓深受感动，教化水平提升。',
        },
        failureEffect: {
          教化: 1,
          描述: '宣讲效果一般，百姓收获有限。',
        },
      },
      {
        id: 'education_lecture_scholar',
        type: '委托',
        description: '委托士子宣讲（消耗1小时）',
        cost: {
          时间: 1,
          时间单位: '小时',
        },
        successRate: 0.8,
        successEffect: {
          教化: 3,
          政绩: 2,
          描述: '士子宣讲完毕，教化水平有所提升。',
        },
      },
    ],
    refreshTime: 48, // 2天刷新
    aiPrompt: '描述县令宣讲教化的场景，百姓聆听的神情，以及教化对县城民风的影响。',
  },
];

/**
 * 商贸类政务事务
 */
const COMMERCE_AFFAIRS: GovernmentAffair[] = [
  {
    id: 'commerce_market',
    name: '举办集市',
    type: '商贸',
    urgency: '低',
    difficulty: '简单',
    description: '定期举办集市，促进商贸往来。',
    details: '集市可吸引外地商贾，增加税收，提升繁荣度。',
    options: [
      {
        id: 'commerce_market_standard',
        type: '处理',
        description: '举办集市（消耗100银两）',
        cost: {
          银两: 100,
          时间: 4,
          时间单位: '小时',
        },
        successRate: 0.9,
        successEffect: {
          繁荣度: 8,
          库银: 300,
          政绩: 5,
          描述: '集市举办成功，商贾云集，贸易兴旺。',
        },
        failureEffect: {
          库银: -100,
          政绩: -2,
          描述: '集市参与者较少，效果有限。',
        },
      },
    ],
    refreshTime: 168, // 7天刷新
    aiPrompt: '描述举办集市的场景，商贾云集的热闹场面，以及集市对县城经济的促进。',
  },
];

// ============================================================================
// 导出数据
// ============================================================================

/**
 * 所有政务事务
 */
export const GOVERNMENT_AFFAIRS: GovernmentAffair[] = [
  ...DISASTER_AFFAIRS,
  ...SECURITY_AFFAIRS,
  ...FINANCE_AFFAIRS,
  ...JUDICIAL_AFFAIRS,
  ...CONSTRUCTION_AFFAIRS,
  ...EDUCATION_AFFAIRS,
  ...COMMERCE_AFFAIRS,
];

/**
 * 按类型分组的政务事务
 */
export const AFFAIRS_BY_TYPE: Record<GovernmentAffairType, GovernmentAffair[]> = {
  救灾: DISASTER_AFFAIRS,
  剿匪: SECURITY_AFFAIRS,
  征税: FINANCE_AFFAIRS,
  审案: JUDICIAL_AFFAIRS,
  巡查: SECURITY_AFFAIRS.filter(a => a.type === '巡查'),
  建设: CONSTRUCTION_AFFAIRS,
  教化: EDUCATION_AFFAIRS,
  商贸: COMMERCE_AFFAIRS,
  人事: [],
  外交: [],
};

/**
 * 按紧急度分组的政务事务
 */
export const AFFAIRS_BY_URGENCY: Record<AffairUrgency, GovernmentAffair[]> = {
  低: [],
  中: [],
  高: [],
  极高: [],
};

// 填充紧急度分组
GOVERNMENT_AFFAIRS.forEach(affair => {
  AFFAIRS_BY_URGENCY[affair.urgency].push(affair);
});

/**
 * 按难度分组的政务事务
 */
export const AFFAIRS_BY_DIFFICULTY: Record<AffairDifficulty, GovernmentAffair[]> = {
  简单: [],
  普通: [],
  困难: [],
  极难: [],
};

// 填充难度分组
GOVERNMENT_AFFAIRS.forEach(affair => {
  AFFAIRS_BY_DIFFICULTY[affair.difficulty].push(affair);
});

/**
 * 获取随机政务事务
 */
export function getRandomAffair(): GovernmentAffair {
  return GOVERNMENT_AFFAIRS[Math.floor(Math.random() * GOVERNMENT_AFFAIRS.length)];
}

/**
 * 根据类型获取政务事务
 */
export function getAffairsByType(type: GovernmentAffairType): GovernmentAffair[] {
  return AFFAIRS_BY_TYPE[type] || [];
}

/**
 * 根据ID获取政务事务
 */
export function getAffairById(id: string): GovernmentAffair | undefined {
  return GOVERNMENT_AFFAIRS.find(affair => affair.id === id);
}

/**
 * 检查政务事务是否可用
 */
export function isAffairAvailable(
  affair: GovernmentAffair,
  currentRank: number,
  currentPublicTrust: number,
  currentTreasury: number
): boolean {
  if (affair.triggerCondition) {
    const { minRank, maxRank, minPublicTrust, minTreasury } = affair.triggerCondition;

    if (minRank !== undefined && currentRank < minRank) return false;
    if (maxRank !== undefined && currentRank > maxRank) return false;
    if (minPublicTrust !== undefined && currentPublicTrust < minPublicTrust) return false;
    if (minTreasury !== undefined && currentTreasury < minTreasury) return false;
  }

  return true;
}

/**
 * 获取可用的政务事务列表
 */
export function getAvailableAffairs(
  currentRank: number = 1,
  currentPublicTrust: number = 50,
  currentTreasury: number = 0
): GovernmentAffair[] {
  return GOVERNMENT_AFFAIRS.filter(affair =>
    isAffairAvailable(affair, currentRank, currentPublicTrust, currentTreasury)
  );
}
