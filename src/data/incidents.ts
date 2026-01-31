/**
 * @fileoverview 突发事件系统数据
 * 定义县令模拟器中可能发生的各类突发事件
 */

// ============================================================================
// 类型定义
// ============================================================================

/** 事件类型 */
export type IncidentType =
  | '天灾'      // 自然灾害
  | '人祸'      // 人为事件
  | '民生'      // 民生事件
  | '商业'      // 商业事件
  | '治安'      // 治安事件
  | '教化'      // 教化事件
  | '特殊'      // 特殊事件
  | '机遇';     // 机遇事件

/** 事件难度 */
export type IncidentDifficulty = '简单' | '普通' | '困难' | '极难' | '逆天';

/** 事件紧急度 */
export type IncidentUrgency = '低' | '中' | '高' | '极高';

/** 选择类型 */
export type ChoiceType = '处理' | '观察' | '寻求帮助' | '放弃';

/** 事件选择结果 */
export interface IncidentChoice {
  /** 选择ID */
  id: string;
  /** 选择描述 */
  description: string;
  /** 选择类型 */
  type: ChoiceType;
  /** 所需资源（银两、政绩等） */
  cost?: {
    银两?: number;
    政绩?: number;
    威望?: number;
  };
  /** 成功率 */
  successRate?: number;
  /** 成功效果 */
  successEffect: {
    民心?: number;
    赋税?: number;
    治安?: number;
    威望?: number;
    政绩?: number;
    描述?: string;
    银两?: number;
    教化?: number;
    商业?: number;
  };
  /** 失败效果 */
  failureEffect?: {
    民心?: number;
    赋税?: number;
    治安?: number;
    威望?: number;
    政绩?: number;
    描述?: string;
    银两?: number;
    教化?: number;
    商业?: number;
  };
  /** 特殊奖励 */
  specialReward?: string[] | {
    描述?: string;
    效果?: string[];
  };
}

/** 突发事件定义 */
export interface Incident {
  /** 事件唯一标识 */
  id: string;
  /** 事件名称 */
  name: string;
  /** 事件类型 */
  type: IncidentType;
  /** 事件描述 */
  description: string;
  /** 事件难度 */
  difficulty: IncidentDifficulty;
  /** 事件紧急度 */
  urgency: IncidentUrgency;
  /** 可用选择 */
  choices: IncidentChoice[];
  /** 是否一次性事件（触发后不再出现） */
  oneTime?: boolean;
  /** 触发条件 */
  triggerCondition?: {
    /** 最低官品要求 */
    minRank?: number;
    /** 最高官品限制 */
    maxRank?: number;
    /** 特定建筑要求 */
    requiredBuilding?: string;
    /** 特定政令要求 */
    requiredPolicy?: string;
    /** 概率（千分比） */
    probability?: number;
  };
  /** 事件结果（后续可能触发的事件） */
  followUpEvents?: string[];
}

// ============================================================================
// 天灾事件
// ============================================================================

export const NATURAL_DISASTERS: Incident[] = [
  {
    id: 'drought',
    name: '旱灾',
    type: '天灾',
    description: '连月未雨，田地龟裂，庄稼枯死。百姓颗粒无收，嗷嗷待哺。若不及时处置，恐生民变。',
    difficulty: '困难',
    urgency: '极高',
    choices: [
      {
        id: 'open_granary',
        type: '处理',
        description: '开仓放粮，救济灾民',
        cost: { 银两: 500, 政绩: 1000 },
        successRate: 0.8,
        successEffect: {
          民心: 30,
          威望: 20,
          政绩: 15,
          描述: '百姓得救，称颂不已'
        },
        failureEffect: {
          民心: -10,
          政绩: -5,
          描述: '粮食不足，部分百姓仍受饥荒'
        }
      },
      {
        id: 'pray_rain',
        type: '处理',
        description: '设坛求雨，祈求上天',
        cost: { 银两: 200 },
        successRate: 0.3,
        successEffect: {
          民心: 20,
          威望: 15,
          政绩: 10,
          描述: '天降甘霖，旱灾解除'
        },
        failureEffect: {
          民心: -20,
          威望: -10,
          描述: '求雨无果，百姓失望'
        }
      },
      {
        id: 'report_drought',
        type: '寻求帮助',
        description: '上报朝廷，请求赈灾',
        cost: { 政绩: 500 },
        successRate: 0.6,
        successEffect: {
          民心: 15,
          政绩: 5,
          描述: '朝廷拨下赈灾粮款'
        },
        failureEffect: {
          民心: -30,
          政绩: -20,
          描述: '朝廷未予理睬，百姓不满'
        }
      },
      {
        id: 'ignore_drought',
        type: '放弃',
        description: '不予理会，听天由命',
        successEffect: {
          民心: -50,
          威望: -30,
          政绩: -25,
          描述: '饿殍遍野，民怨沸腾'
        }
      }
    ],
    oneTime: true,
    triggerCondition: { probability: 30 }
  },
  {
    id: 'flood',
    name: '水灾',
    type: '天灾',
    description: '连日暴雨，河水暴涨，堤坝溃决。农田被淹，房屋倒塌，百姓流离失所。',
    difficulty: '极难',
    urgency: '极高',
    choices: [
      {
        id: 'repair_dam',
        type: '处理',
        description: '组织抢险，加固堤坝',
        cost: { 银两: 1000, 政绩: 2000 },
        successRate: 0.7,
        successEffect: {
          民心: 25,
          威望: 25,
          政绩: 20,
          描述: '堤坝加固，水患得到控制'
        },
        failureEffect: {
          民心: -15,
          政绩: -10,
          银两: -500,
          描述: '堤坝再次溃决，损失加重'
        }
      },
      {
        id: 'evacuate',
        type: '处理',
        description: '疏散百姓，转移到安全地带',
        cost: { 银两: 300 },
        successRate: 0.9,
        successEffect: {
          民心: 20,
          威望: 15,
          政绩: 10,
          描述: '百姓安全转移，无人员伤亡'
        },
        failureEffect: {
          民心: -5,
          描述: '部分百姓不愿撤离'
        }
      },
      {
        id: 'report_flood',
        type: '寻求帮助',
        description: '上报朝廷，请求援助',
        cost: { 政绩: 1000 },
        successRate: 0.5,
        successEffect: {
          民心: 10,
          政绩: 5,
          描述: '朝廷派兵协助抢险'
        },
        failureEffect: {
          民心: -25,
          政绩: -15,
          描述: '朝廷援助迟迟未到'
        }
      }
    ],
    oneTime: true,
    triggerCondition: { probability: 20 }
  },
  {
    id: 'locusts',
    name: '蝗灾',
    type: '天灾',
    description: '蝗虫过境，铺天盖地。庄稼被啃食殆尽，即将成熟的粮食化为乌有。',
    difficulty: '困难',
    urgency: '高',
    choices: [
      {
        id: 'exterminate_locusts',
        type: '处理',
        description: '组织百姓捕杀蝗虫',
        cost: { 银两: 400, 政绩: 800 },
        successRate: 0.6,
        successEffect: {
          民心: 15,
          威望: 15,
          政绩: 12,
          描述: '蝗灾得到控制，损失减轻'
        },
        failureEffect: {
          民心: -10,
          政绩: -5,
          描述: '蝗虫太多，捕杀效果有限'
        }
      },
      {
        id: 'locust_food',
        type: '处理',
        description: '号召百姓捕捉蝗虫为食',
        cost: { 银两: 100 },
        successRate: 0.8,
        successEffect: {
          民心: 10,
          威望: 5,
          政绩: 8,
          描述: '百姓以蝗虫充饥，度过难关'
        },
        failureEffect: {
          民心: -5,
          描述: '部分百姓不愿食用'
        }
      },
      {
        id: 'ignore_locusts',
        type: '放弃',
        description: '任由蝗虫肆虐',
        successEffect: {
          民心: -30,
          威望: -20,
          政绩: -15,
          描述: '粮食绝收，百姓饥饿'
        }
      }
    ],
    oneTime: true,
    triggerCondition: { probability: 15 }
  },
  {
    id: 'earthquake',
    name: '地震',
    type: '天灾',
    description: '地动山摇，房屋倒塌，百姓死伤无数。满目疮痍，哀鸿遍野。',
    difficulty: '逆天',
    urgency: '极高',
    choices: [
      {
        id: 'rescue_survivors',
        type: '处理',
        description: '全力救援，挖掘幸存者',
        cost: { 银两: 2000, 政绩: 3000 },
        successRate: 0.5,
        successEffect: {
          民心: 40,
          威望: 35,
          政绩: 30,
          描述: '救出大量幸存者，百姓感激'
        },
        specialReward: ['青天之名', '百姓爱戴'],
        failureEffect: {
          民心: -10,
          政绩: -10,
          银两: -1000,
          描述: '余震不断，救援困难'
        }
      },
      {
        id: 'rebuild',
        type: '处理',
        description: '安置灾民，重建家园',
        cost: { 银两: 3000, 政绩: 2500 },
        successRate: 0.7,
        successEffect: {
          民心: 35,
          威望: 30,
          政绩: 25,
          描述: '灾民得到安置，重建开始'
        },
        failureEffect: {
          民心: -15,
          政绩: -10,
          描述: '资源不足，重建缓慢'
        }
      },
      {
        id: 'report_earthquake',
        type: '寻求帮助',
        description: '上报朝廷，请求赈灾',
        cost: { 政绩: 1500 },
        successRate: 0.7,
        successEffect: {
          民心: 20,
          政绩: 10,
          描述: '朝廷拨下赈灾款'
        },
        failureEffect: {
          民心: -20,
          政绩: -15,
          描述: '朝廷援助不足'
        }
      }
    ],
    oneTime: true,
    triggerCondition: { probability: 5 }
  }
];

// ============================================================================
// 人祸事件
// ============================================================================

export const HUMAN_DISASTERS: Incident[] = [
  {
    id: 'bandit_attack',
    name: '盗匪来袭',
    type: '人祸',
    description: '一伙盗匪突然袭击县城，烧杀抢掠。百姓惊恐万分，请求官府保护。',
    difficulty: '普通',
    urgency: '高',
    choices: [
      {
        id: 'send_troops',
        type: '处理',
        description: '派兵剿匪',
        cost: { 银两: 600, 政绩: 1000 },
        successRate: 0.7,
        successEffect: {
          治安: 25,
          威望: 20,
          政绩: 15,
          描述: '盗匪被击溃，百姓安全'
        },
        failureEffect: {
          治安: -10,
          威望: -10,
          政绩: -10,
          描述: '官兵战败，盗匪更加猖獗'
        }
      },
      {
        id: 'negotiate',
        type: '处理',
        description: '招安盗匪',
        cost: { 银两: 400, 政绩: 800 },
        successRate: 0.5,
        successEffect: {
          治安: 15,
          威望: 10,
          政绩: 10,
          描述: '盗匪接受招安，成为民团'
        },
        failureEffect: {
          治安: -15,
          威望: -5,
          描述: '招安失败，盗匪拒绝'
        }
      },
      {
        id: 'defend_city',
        type: '观察',
        description: '坚守城池，等待援兵',
        cost: { 银两: 200 },
        successRate: 0.6,
        successEffect: {
          治安: 10,
          威望: 5,
          描述: '盗匪撤退，县城安全'
        },
        failureEffect: {
          治安: -20,
          威望: -15,
          描述: '盗匪攻破城池，劫掠一番后离去'
        }
      }
    ],
    triggerCondition: { probability: 40 }
  },
  {
    id: 'rebellion',
    name: '民变',
    type: '人祸',
    description: '赋税繁重，加上连年灾荒，百姓忍无可忍，聚集起来反抗官府。',
    difficulty: '极难',
    urgency: '极高',
    choices: [
      {
        id: 'suppress_rebellion',
        type: '处理',
        description: '派兵镇压',
        cost: { 银两: 1500, 政绩: 3000 },
        successRate: 0.4,
        successEffect: {
          治安: 20,
          威望: -10,
          政绩: 10,
          描述: '民变被镇压，但百姓心怀怨恨'
        },
        failureEffect: {
          治安: -40,
          威望: -30,
          政绩: -25,
          描述: '官兵战败，民变扩大'
        }
      },
      {
        id: 'reduce_tax',
        type: '处理',
        description: '减免赋税，安抚百姓',
        cost: { 银两: 1000, 政绩: 2000 },
        successRate: 0.7,
        successEffect: {
          民心: 30,
          威望: 20,
          政绩: 15,
          描述: '百姓满意，民变平息'
        },
        failureEffect: {
          民心: -10,
          政绩: -10,
          描述: '部分百姓仍不满足'
        }
      },
      {
        id: 'negotiate_rebellion',
        type: '寻求帮助',
        description: '与百姓代表谈判',
        cost: { 政绩: 1500 },
        successRate: 0.6,
        successEffect: {
          民心: 20,
          威望: 15,
          政绩: 10,
          描述: '谈判成功，民变和平解决'
        },
        failureEffect: {
          民心: -20,
          威望: -15,
          描述: '谈判破裂，冲突升级'
        }
      }
    ],
    oneTime: true,
    triggerCondition: { minRank: 7, probability: 10 }
  },
  {
    id: 'corruption_exposed',
    name: '贪腐暴露',
    type: '人祸',
    description: '下属官员贪腐的证据被发现，百姓愤怒，要求严惩。',
    difficulty: '困难',
    urgency: '高',
    choices: [
      {
        id: 'punish_corrupt',
        type: '处理',
        description: '严惩贪官，追回赃款',
        cost: { 政绩: 1500 },
        successRate: 0.8,
        successEffect: {
          民心: 30,
          威望: 25,
          政绩: 20,
          描述: '贪官被严惩，百姓称快'
        },
        failureEffect: {
          民心: -10,
          威望: -10,
          描述: '证据不足，难以定罪'
        }
      },
      {
        id: 'cover_up',
        type: '观察',
        description: '掩盖事实，保护下属',
        cost: { 银两: 500 },
        successRate: 0.5,
        successEffect: {
          民心: -20,
          威望: -15,
          描述: '事情平息，但百姓不满'
        },
        failureEffect: {
          民心: -40,
          威望: -35,
          政绩: -30,
          描述: '掩盖失败，民怨沸腾'
        }
      },
      {
        id: 'investigate',
        type: '处理',
        description: '深入调查，查清真相',
        cost: { 政绩: 2000, 银两: 300 },
        successRate: 0.7,
        successEffect: {
          民心: 25,
          威望: 20,
          政绩: 15,
          描述: '真相大白，贪官落马'
        },
        failureEffect: {
          民心: -15,
          政绩: -10,
          描述: '调查受阻，真相不明'
        }
      }
    ],
    triggerCondition: { minRank: 6, probability: 25 }
  }
];

// ============================================================================
// 民生事件
// ============================================================================

export const LIVELIHOOD_INCIDENTS: Incident[] = [
  {
    id: 'epidemic',
    name: '瘟疫',
    type: '民生',
    description: '瘟疫流行，百姓染病死亡。医馆人满为患，人心惶惶。',
    difficulty: '困难',
    urgency: '极高',
    choices: [
      {
        id: 'establish_quarantine',
        type: '处理',
        description: '隔离病患，防止扩散',
        cost: { 银两: 800, 政绩: 1500 },
        successRate: 0.7,
        successEffect: {
          民心: 20,
          威望: 20,
          政绩: 15,
          描述: '瘟疫得到控制，死亡人数减少'
        },
        failureEffect: {
          民心: -10,
          政绩: -10,
          描述: '隔离措施不当，效果有限'
        }
      },
      {
        id: 'free_medicine',
        type: '处理',
        description: '施药施医，救治病患',
        cost: { 银两: 1200, 政绩: 2000 },
        successRate: 0.8,
        successEffect: {
          民心: 35,
          威望: 30,
          政绩: 25,
          描述: '大量患者得到救治，百姓感激'
        },
        specialReward: ['仁医之名'],
        failureEffect: {
          民心: -5,
          描述: '药材不足，部分患者无法救治'
        }
      },
      {
        id: 'pray_plague',
        type: '观察',
        description: '设坛祈福，祈求神明',
        cost: { 银两: 200 },
        successRate: 0.2,
        successEffect: {
          民心: 15,
          威望: 10,
          描述: '瘟疫奇迹般地消退'
        },
        failureEffect: {
          民心: -15,
          威望: -10,
          描述: '祈福无效，瘟疫继续蔓延'
        }
      }
    ],
    oneTime: true,
    triggerCondition: { requiredBuilding: 'clinic', probability: 20 }
  },
  {
    id: 'famine_refugees',
    name: '流民涌入',
    type: '民生',
    description: '外地灾荒，大量流民涌入县城。需要安置和救济。',
    difficulty: '普通',
    urgency: '中',
    choices: [
      {
        id: 'accept_refugees',
        type: '处理',
        description: '接纳流民，提供安置',
        cost: { 银两: 600, 政绩: 1200 },
        successRate: 0.7,
        successEffect: {
          民心: 25,
          威望: 20,
          政绩: 15,
          描述: '流民得到安置，人口增加'
        },
        failureEffect: {
          民心: -10,
          治安: -10,
          描述: '资源不足，安置困难'
        }
      },
      {
        id: 'reject_refugees',
        type: '放弃',
        description: '拒绝流民，驱逐出境',
        cost: { 银两: 200 },
        successEffect: {
          民心: -20,
          威望: -15,
          描述: '流民被驱赶，但民怨增加'
        }
      },
      {
        id: 'employ_refugees',
        type: '处理',
        description: '雇佣流民参与建设',
        cost: { 银两: 400, 政绩: 800 },
        successRate: 0.8,
        successEffect: {
          民心: 20,
          威望: 15,
          政绩: 15,
          描述: '流民成为劳动力，促进建设'
        },
        failureEffect: {
          民心: -5,
          描述: '部分流民不愿工作'
        }
      }
    ],
    triggerCondition: { probability: 30 }
  }
];

// ============================================================================
// 商业事件
// ============================================================================

export const COMMERCE_INCIDENTS: Incident[] = [
  {
    id: 'merchant_guild',
    name: '商会崛起',
    type: '商业',
    description: '本地商人组织商会，势力日益壮大。希望官府给予优惠政策。',
    difficulty: '普通',
    urgency: '中',
    choices: [
      {
        id: 'support_guild',
        type: '处理',
        description: '支持商会，给予优惠',
        cost: { 政绩: 800 },
        successRate: 0.9,
        successEffect: {
          商业: 30,
          赋税: 20,
          威望: 10,
          描述: '商会壮大，商业繁荣'
        },
        failureEffect: {
          民心: -10,
          描述: '百姓不满商人特权'
        }
      },
      {
        id: 'regulate_guild',
        type: '处理',
        description: '监管商会，防止垄断',
        cost: { 政绩: 1000 },
        successRate: 0.7,
        successEffect: {
          商业: 15,
          民心: 15,
          威望: 10,
          描述: '商会发展，但受到监管'
        },
        failureEffect: {
          商业: -10,
          描述: '商会不满，发展受阻'
        }
      },
      {
        id: 'reject_guild',
        type: '放弃',
        description: '拒绝商会要求',
        successEffect: {
          商业: -20,
          威望: -10,
          描述: '商会不满，商业受挫'
        }
      }
    ],
    triggerCondition: { requiredBuilding: 'market', probability: 35 }
  },
  {
    id: 'trade_route',
    name: '商路开通',
    type: '商业',
    description: '一条新的商路经过本县，带来巨大商机。',
    difficulty: '简单',
    urgency: '低',
    choices: [
      {
        id: 'develop_route',
        type: '处理',
        description: '发展商路，建设驿站',
        cost: { 银两: 1000, 政绩: 1500 },
        successRate: 0.8,
        successEffect: {
          商业: 40,
          赋税: 25,
          威望: 15,
          政绩: 15,
          描述: '商路繁荣，贸易发达'
        },
        failureEffect: {
          商业: 10,
          描述: '投资过大，收益有限'
        }
      },
      {
        id: 'observe_route',
        type: '观察',
        description: '顺其自然，不做干预',
        successEffect: {
          商业: 15,
          赋税: 10,
          描述: '商路自然发展'
        }
      }
    ],
    triggerCondition: { probability: 25 }
  }
];

// ============================================================================
// 治安事件
// ============================================================================

export const SECURITY_INCIDENTS: Incident[] = [
  {
    id: 'murder_case',
    name: '命案',
    type: '治安',
    description: '县内发生命案，死者身份不明，百姓人心惶惶。',
    difficulty: '普通',
    urgency: '高',
    choices: [
      {
        id: 'investigate_case',
        type: '处理',
        description: '亲自调查，追查真凶',
        cost: { 政绩: 800 },
        successRate: 0.7,
        successEffect: {
          治安: 20,
          威望: 20,
          政绩: 15,
          描述: '真凶落网，百姓称颂'
        },
        failureEffect: {
          治安: -10,
          威望: -10,
          描述: '调查无果，真凶逍遥法外'
        }
      },
      {
        id: 'bounty_hunt',
        type: '处理',
        description: '悬赏缉拿凶手',
        cost: { 银两: 400, 政绩: 600 },
        successRate: 0.6,
        successEffect: {
          治安: 15,
          威望: 15,
          政绩: 10,
          描述: '凶手被抓，悬赏见效'
        },
        failureEffect: {
          治安: -5,
          描述: '悬赏期满，凶手未获'
        }
      },
      {
        id: 'close_case',
        type: '放弃',
        description: '草草结案，不了了之',
        successEffect: {
          治安: -25,
          威望: -20,
          描述: '百姓不满，治安恶化'
        }
      }
    ],
    triggerCondition: { probability: 45 }
  },
  {
    id: 'theft_ring',
    name: '盗窃团伙',
    type: '治安',
    description: '县内出现一个有组织的盗窃团伙，专门针对富商大户。',
    difficulty: '困难',
    urgency: '中',
    choices: [
      {
        id: 'undercover_investigation',
        type: '处理',
        description: '派遣密探，深入调查',
        cost: { 银两: 500, 政绩: 1200 },
        successRate: 0.6,
        successEffect: {
          治安: 30,
          威望: 25,
          政绩: 20,
          描述: '盗窃团伙被一网打尽'
        },
        failureEffect: {
          治安: -10,
          威望: -5,
          描述: '密探被发现，调查失败'
        }
      },
      {
        id: 'set_trap',
        type: '处理',
        description: '设下埋伏，诱捕盗匪',
        cost: { 银两: 300, 政绩: 800 },
        successRate: 0.5,
        successEffect: {
          治安: 20,
          威望: 15,
          政绩: 12,
          描述: '部分盗匪被抓'
        },
        failureEffect: {
          治安: -15,
          描述: '埋伏失败，盗匪逃脱'
        }
      }
    ],
    triggerCondition: { probability: 30 }
  }
];

// ============================================================================
// 教化事件
// ============================================================================

export const EDUCATION_INCIDENTS: Incident[] = [
  {
    id: 'famous_scholar_visit',
    name: '名儒来访',
    type: '教化',
    description: '一位当世名儒路过本县，当地士子希望官府挽留讲学。',
    difficulty: '简单',
    urgency: '低',
    choices: [
      {
        id: 'invite_scholar',
        type: '处理',
        description: '盛情邀请，设宴款待',
        cost: { 银两: 600, 政绩: 500 },
        successRate: 0.9,
        successEffect: {
          教化: 30,
          威望: 20,
          政绩: 10,
          描述: '名儒讲学，文风大盛'
        },
        failureEffect: {
          描述: '名儒婉拒，但表示赞赏'
        }
      },
      {
        id: 'simple_reception',
        type: '观察',
        description: '简单接待，以礼相待',
        cost: { 银两: 200 },
        successRate: 1,
        successEffect: {
          教化: 10,
          威望: 5,
          描述: '名儒满意离去'
        }
      },
      {
        id: 'ignore_scholar',
        type: '放弃',
        description: '不予理会',
        successEffect: {
          教化: -15,
          威望: -10,
          描述: '名儒失望离去，士子不满'
        }
      }
    ],
    triggerCondition: { requiredBuilding: 'school', probability: 20 }
  },
  {
    id: 'exam_success',
    name: '科举高中',
    type: '教化',
    description: '本县学子在科举中高中进士，光宗耀祖，全县欢庆。',
    difficulty: '简单',
    urgency: '低',
    choices: [
      {
        id: 'celebrate',
        type: '处理',
        description: '举办庆典，表彰学子',
        cost: { 银两: 400, 政绩: 300 },
        successRate: 1,
        successEffect: {
          教化: 25,
          民心: 20,
          威望: 15,
          政绩: 10,
          描述: '全县欢庆，文风更盛'
        }
      },
      {
        id: 'reward',
        type: '处理',
        description: '赏赐学子，鼓励后进',
        cost: { 银两: 300 },
        successRate: 1,
        successEffect: {
          教化: 15,
          威望: 10,
          描述: '学子感恩，激励后进'
        }
      }
    ],
    triggerCondition: { requiredBuilding: 'school', probability: 15 }
  }
];

// ============================================================================
// 特殊事件
// ============================================================================

export const SPECIAL_INCIDENTS: Incident[] = [
  {
    id: 'imperial_edict',
    name: '圣旨到',
    type: '特殊',
    description: '朝廷派太监传旨，不知是福是祸。',
    difficulty: '普通',
    urgency: '高',
    choices: [
      {
        id: 'receive_edict',
        type: '处理',
        description: '恭敬接旨',
        cost: { 银两: 200 },
        successRate: 1,
        successEffect: {
          威望: 20,
          政绩: 15,
          描述: '圣旨嘉奖，升迁有望'
        }
      }
    ],
    oneTime: true,
    triggerCondition: { minRank: 6, probability: 10 }
  },
  {
    id: 'secret_visit',
    name: '微服私访',
    type: '特殊',
    description: '有传言说朝廷派大员微服私访，考察地方官政绩。',
    difficulty: '普通',
    urgency: '中',
    choices: [
      {
        id: 'prepare_well',
        type: '处理',
        description: '整顿吏治，准备迎接',
        cost: { 银两: 500, 政绩: 1000 },
        successRate: 0.7,
        successEffect: {
          威望: 25,
          政绩: 20,
          描述: '政绩斐然，获得褒奖'
        },
        failureEffect: {
          描述: '传言不实，白忙一场'
        }
      },
      {
        id: 'continue_as_usual',
        type: '观察',
        description: '照常处理政务',
        successEffect: {
          威望: 10,
          描述: '若无其事，自然应对'
        }
      }
    ],
    oneTime: true,
    triggerCondition: { minRank: 7, probability: 12 }
  }
];

// ============================================================================
// 机遇事件
// ============================================================================

export const OPPORTUNITY_INCIDENTS: Incident[] = [
  {
    id: 'merchant_investment',
    name: '富商投资',
    type: '机遇',
    description: '一位富商看好本县发展前景，愿意投资建设。',
    difficulty: '简单',
    urgency: '低',
    choices: [
      {
        id: 'accept_investment',
        type: '处理',
        description: '接受投资，促进发展',
        cost: { 政绩: 500 },
        successRate: 0.8,
        successEffect: {
          商业: 35,
          赋税: 20,
          威望: 10,
          政绩: 10,
          描述: '投资到位，商业大发展'
        },
        failureEffect: {
          威望: -5,
          描述: '富商撤资，关系破裂'
        }
      },
      {
        id: 'negotiate_terms',
        type: '处理',
        description: '谈判条件，争取更多',
        cost: { 政绩: 800 },
        successRate: 0.6,
        successEffect: {
          商业: 30,
          赋税: 25,
          威望: 15,
          政绩: 12,
          描述: '谈判成功，获得更好条件'
        },
        failureEffect: {
          描述: '谈判失败，富商离开'
        }
      },
      {
        id: 'reject_investment',
        type: '放弃',
        description: '拒绝投资',
        successEffect: {
          描述: '富商失望离去'
        }
      }
    ],
    triggerCondition: { requiredBuilding: 'market', probability: 20 }
  },
  {
    id: 'talent_discovered',
    name: '发现人才',
    type: '机遇',
    description: '你在巡查时发现一位难得的人才，可为自己效力。',
    difficulty: '简单',
    urgency: '低',
    choices: [
      {
        id: 'recruit_talent',
        type: '处理',
        description: '招揽人才，纳入麾下',
        cost: { 银两: 300, 政绩: 400 },
        successRate: 0.7,
        successEffect: {
          威望: 20,
          政绩: 15,
          描述: '人才归心，如虎添翼'
        },
        specialReward: ['得力下属'],
        failureEffect: {
          威望: -5,
          描述: '人才婉拒'
        }
      },
      {
        id: 'recommend_talent',
        type: '处理',
        description: '推荐给朝廷',
        cost: { 政绩: 600 },
        successRate: 0.9,
        successEffect: {
          威望: 25,
          政绩: 20,
          描述: '人才得到重用，你获得推荐之功'
        },
        failureEffect: {
          描述: '推荐未获批准'
        }
      },
      {
        id: 'ignore_talent',
        type: '放弃',
        description: '不予理会',
        successEffect: {
          描述: '人才失望离去'
        }
      }
    ],
    triggerCondition: { probability: 25 }
  }
];

// ============================================================================
// 导出汇总
// ============================================================================

/** 所有突发事件 */
export const ALL_INCIDENTS: Incident[] = [
  ...NATURAL_DISASTERS,
  ...HUMAN_DISASTERS,
  ...LIVELIHOOD_INCIDENTS,
  ...COMMERCE_INCIDENTS,
  ...SECURITY_INCIDENTS,
  ...EDUCATION_INCIDENTS,
  ...SPECIAL_INCIDENTS,
  ...OPPORTUNITY_INCIDENTS
];

/** 事件分类 */
export const INCIDENT_CATEGORIES = {
  天灾: NATURAL_DISASTERS,
  人祸: HUMAN_DISASTERS,
  民生: LIVELIHOOD_INCIDENTS,
  商业: COMMERCE_INCIDENTS,
  治安: SECURITY_INCIDENTS,
  教化: EDUCATION_INCIDENTS,
  特殊: SPECIAL_INCIDENTS,
  机遇: OPPORTUNITY_INCIDENTS
} as const;

/**
 * 根据ID获取事件
 */
export function getIncidentById(id: string): Incident | undefined {
  return ALL_INCIDENTS.find(i => i.id === id);
}

/**
 * 根据类型获取事件列表
 */
export function getIncidentsByType(type: IncidentType): Incident[] {
  return ALL_INCIDENTS.filter(i => i.type === type);
}

/**
 * 根据官品获取可触发事件
 */
export function getIncidentsByRank(rank: number): Incident[] {
  return ALL_INCIDENTS.filter(i => {
    const cond = i.triggerCondition;
    if (!cond) return true;
    if (cond.minRank !== undefined && rank < cond.minRank) return false;
    if (cond.maxRank !== undefined && rank > cond.maxRank) return false;
    return true;
  });
}

/**
 * 随机抽取一个可触发事件
 */
export function getRandomIncident(rank: number): Incident | undefined {
  const available = getIncidentsByRank(rank);
  if (available.length === 0) return undefined;

  // 根据概率权重随机选择
  const totalWeight = available.reduce((sum, i) => sum + (i.triggerCondition?.probability || 10), 0);
  let random = Math.random() * totalWeight;

  for (const incident of available) {
    random -= (incident.triggerCondition?.probability || 10);
    if (random <= 0) return incident;
  }

  return available[Math.floor(Math.random() * available.length)];
}
