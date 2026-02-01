/**
 * @fileoverview 官僚制度系统数据
 * 定义县令模拟器中的官僚机构、官制体系、人事任免等
 */

// ============================================================================
// 类型定义
// ============================================================================

/** 官僚机构类型 */
export type BureaucracyType =
  | '中央'      // 中央机构（六部、翰林院等）
  | '地方'      // 地方机构（州府县衙）
  | '监察'      // 监察机构（御史台）
  | '军事'      // 军事机构（枢密院、兵部）
  | '司法';     // 司法机构（大理寺、刑部）

/** 机构等级 */
export type BureauLevel = 1 | 2 | 3 | 4 | 5;

/** 职位类别 */
export type PositionCategory = '长官' | '副职' | '属官' | '吏员';

/** 官僚机构定义 */
export interface BureaucracyBureau {
  /** 机构唯一标识 */
  id: string;
  /** 机构名称 */
  name: string;
  /** 机构类型 */
  type: BureaucracyType;
  /** 机构等级 */
  level: BureauLevel;
  /** 机构描述 */
  description: string;
  /** 机构职能 */
  functions: string[];
  /** 上级机构 */
  parentBureau?: string;
  /** 下级机构 */
  subBureaus?: string[];
  /** 职位列表 */
  positions: BureauPosition[];
  /** 编制人数 */
  staffing: {
    长官: number;
    副职: number;
    属官: number;
    吏员: number;
  };
  /** 机构特权 */
  privileges: string[];
}

/** 机构职位定义 */
export interface BureauPosition {
  /** 职位ID */
  id: string;
  /** 职位名称 */
  name: string;
  /** 职位类别 */
  category: PositionCategory;
  /** 对应官品 */
  rankLevel: number;
  /** 职位描述 */
  description: string;
  /** 职权范围 */
  authority: string[];
  /** 月俸 */
  salary: number;
  /** 是否可任命 */
  appointable: boolean;
}

/** 人事任命记录 */
export interface Appointment {
  /** 任命ID */
  id: string;
  /** 任命人员姓名 */
  appointeeName: string;
  /** 任命职位 */
  positionId: string;
  /** 所属机构 */
  bureauId: string;
  /** 任命时间 */
  appointmentTime: string;
  /** 任命类型 */
  appointmentType: '新任' | '升迁' | '调任' | '降职';
  /** 任期结束时间 */
  termEndTime?: string;
  /** 任命状态 */
  status: '在任' | '卸任' | '罢免' | '致仕';
}

// ============================================================================
// 六部数据（中央机构）
// ============================================================================

export const SIX_MINISTRIES: BureaucracyBureau[] = [
  {
    id: 'ministry_of_personnel',
    name: '吏部',
    type: '中央',
    level: 5,
    description: '六部之首，掌管天下文官的选任、考课、勋阶、封爵等事务。',
    functions: [
      '掌管文官选任',
      '考核官吏政绩',
      '确定官员品级',
      '拟定人事政策',
      '管理官员档案'
    ],
    positions: [
      {
        id: 'minister_of_personnel',
        name: '吏部尚书',
        category: '长官',
        rankLevel: 2,
        description: '吏部最高长官，统领天下文官选任考课。',
        authority: [
          '决定文官任免',
          '制定考课标准',
          '审核官员资格',
          '签发人事文书'
        ],
        salary: 200,
        appointable: true
      },
      {
        id: 'vice_minister_of_personnel',
        name: '吏部侍郎',
        category: '副职',
        rankLevel: 3,
        description: '吏部副长官，协助尚书处理部务。',
        authority: [
          '协助处理部务',
          '分管具体司务',
          '代行尚书职权'
        ],
        salary: 150,
        appointable: true
      },
      {
        id: 'director_of_personnel',
        name: '文选司郎中',
        category: '属官',
        rankLevel: 4,
        description: '文选司长官，负责文官选任具体事务。',
        authority: [
          '执行选任程序',
          '审核候选人资格',
          '拟定选任名单'
        ],
        salary: 100,
        appointable: true
      }
    ],
    staffing: {
      长官: 1,
      副职: 2,
      属官: 6,
      吏员: 20
    },
    privileges: [
      '可任免四品以下官员',
      '可直接向皇帝奏事',
      '可参与朝政决策'
    ]
  },
  {
    id: 'ministry_of_revenue',
    name: '户部',
    type: '中央',
    level: 5,
    description: '掌管天下户籍、田亩、赋税、钱粮等财政事务。',
    functions: [
      '掌管户籍田亩',
      '征收赋税钱粮',
      '管理国家财政',
      '调度钱粮物资',
      '审核财政账目'
    ],
    positions: [
      {
        id: 'minister_of_revenue',
        name: '户部尚书',
        category: '长官',
        rankLevel: 2,
        description: '户部最高长官，统领天下财政事务。',
        authority: [
          '决定赋税政策',
          '调配钱粮物资',
          '审核财政收支',
          '签发财政文书'
        ],
        salary: 200,
        appointable: true
      },
      {
        id: 'vice_minister_of_revenue',
        name: '户部侍郎',
        category: '副职',
        rankLevel: 3,
        description: '户部副长官，协助尚书处理财政事务。',
        authority: [
          '协助处理部务',
          '分管具体司务',
          '代行尚书职权'
        ],
        salary: 150,
        appointable: true
      }
    ],
    staffing: {
      长官: 1,
      副职: 2,
      属官: 8,
      吏员: 25
    },
    privileges: [
      '可制定赋税政策',
      '可直接向皇帝奏事',
      '可调动国库资金'
    ]
  },
  {
    id: 'ministry_of_rites',
    name: '礼部',
    type: '中央',
    level: 5,
    description: '掌管国家礼制、祭祀、宴飨、科举、学校等事务。',
    functions: [
      '掌管国家礼制',
      '主持祭祀大典',
      '管理科举考试',
      '兴办官学教育',
      '接待外国使节'
    ],
    positions: [
      {
        id: 'minister_of_rites',
        name: '礼部尚书',
        category: '长官',
        rankLevel: 2,
        description: '礼部最高长官，统领国家礼仪教化事务。',
        authority: [
          '制定礼乐制度',
          '主持重要礼仪',
          '管理科举考试',
          '签发礼部文书'
        ],
        salary: 200,
        appointable: true
      },
      {
        id: 'vice_minister_of_rites',
        name: '礼部侍郎',
        category: '副职',
        rankLevel: 3,
        description: '礼部副长官，协助尚书处理礼教事务。',
        authority: [
          '协助处理部务',
          '分管具体司务',
          '代行尚书职权'
        ],
        salary: 150,
        appointable: true
      }
    ],
    staffing: {
      长官: 1,
      副职: 2,
      属官: 6,
      吏员: 20
    },
    privileges: [
      '可制定礼乐政策',
      '可直接向皇帝奏事',
      '可主持科举考试'
    ]
  },
  {
    id: 'ministry_of_war',
    name: '兵部',
    type: '军事',
    level: 5,
    description: '掌管军队编制、武官选任、军械制造、边防事务等。',
    functions: [
      '掌管军队编制',
      '任免武官将领',
      '制造军械兵器',
      '管理边防事务',
      '统筹军事行动'
    ],
    positions: [
      {
        id: 'minister_of_war',
        name: '兵部尚书',
        category: '长官',
        rankLevel: 2,
        description: '兵部最高长官，统领天下军务。',
        authority: [
          '决定军事政策',
          '任免武官将领',
          '调动军队',
          '签发军事文书'
        ],
        salary: 200,
        appointable: true
      },
      {
        id: 'vice_minister_of_war',
        name: '兵部侍郎',
        category: '副职',
        rankLevel: 3,
        description: '兵部副长官，协助尚书处理军务。',
        authority: [
          '协助处理部务',
          '分管具体司务',
          '代行尚书职权'
        ],
        salary: 150,
        appointable: true
      }
    ],
    staffing: {
      长官: 1,
      副职: 2,
      属官: 8,
      吏员: 25
    },
    privileges: [
      '可调动地方军队',
      '可直接向皇帝奏事',
      '可制定军事战略'
    ]
  },
  {
    id: 'ministry_of_justice',
    name: '刑部',
    type: '司法',
    level: 5,
    description: '掌管国家法律、审判、刑罚等司法事务。',
    functions: [
      '掌管国家法律',
      '审理重大案件',
      '复核地方判决',
      '管理监狱',
      '执行刑罚'
    ],
    positions: [
      {
        id: 'minister_of_justice',
        name: '刑部尚书',
        category: '长官',
        rankLevel: 2,
        description: '刑部最高长官，统领天下司法事务。',
        authority: [
          '解释法律条文',
          '审理重大案件',
          '复核死刑判决',
          '签发司法文书'
        ],
        salary: 200,
        appointable: true
      },
      {
        id: 'vice_minister_of_justice',
        name: '刑部侍郎',
        category: '副职',
        rankLevel: 3,
        description: '刑部副长官，协助尚书处理司法事务。',
        authority: [
          '协助处理部务',
          '分管具体司务',
          '代行尚书职权'
        ],
        salary: 150,
        appointable: true
      }
    ],
    staffing: {
      长官: 1,
      副职: 2,
      属官: 6,
      吏员: 20
    },
    privileges: [
      '可解释法律条文',
      '可直接向皇帝奏事',
      '可复核死刑判决'
    ]
  },
  {
    id: 'ministry_of_works',
    name: '工部',
    type: '中央',
    level: 5,
    description: '掌管土木建筑、水利交通、屯田、工匠等事务。',
    functions: [
      '兴修土木建筑',
      '治理水利交通',
      '管理屯田事务',
      '监督工匠制作',
      '征收工匠物资'
    ],
    positions: [
      {
        id: 'minister_of_works',
        name: '工部尚书',
        category: '长官',
        rankLevel: 2,
        description: '工部最高长官，统领天下工程建设事务。',
        authority: [
          '决定工程建设',
          '调配工匠物资',
          '管理屯田水利',
          '签发工部文书'
        ],
        salary: 200,
        appointable: true
      },
      {
        id: 'vice_minister_of_works',
        name: '工部侍郎',
        category: '副职',
        rankLevel: 3,
        description: '工部副长官，协助尚书处理工程建设事务。',
        authority: [
          '协助处理部务',
          '分管具体司务',
          '代行尚书职权'
        ],
        salary: 150,
        appointable: true
      }
    ],
    staffing: {
      长官: 1,
      副职: 2,
      属官: 6,
      吏员: 22
    },
    privileges: [
      '可调动工匠',
      '可直接向皇帝奏事',
      '可决定重大工程'
    ]
  }
];

// ============================================================================
// 监察机构
// ============================================================================

export const CENSORATE_BUREAUS: BureaucracyBureau[] = [
  {
    id: 'censorate',
    name: '御史台',
    type: '监察',
    level: 5,
    description: '国家最高监察机构，负责监察百官、弹劾不法、纠正失职。',
    functions: [
      '监察百官言行',
      '弹劾不法官员',
      '纠正失职行为',
      '审理官员贪腐',
      '巡视地方吏治'
    ],
    positions: [
      {
        id: 'chief_censor',
        name: '御史大夫',
        category: '长官',
        rankLevel: 3,
        description: '御史台最高长官，统领天下监察事务。',
        authority: [
          '弹劾任何官员',
          '巡视地方吏治',
          '审理官员案件',
          '签发监察文书'
        ],
        salary: 150,
        appointable: true
      },
      {
        id: 'vice_censor',
        name: '御史中丞',
        category: '副职',
        rankLevel: 4,
        description: '御史台副长官，协助处理监察事务。',
        authority: [
          '协助处理监察事务',
          '分管具体监察工作',
          '代行大夫职权'
        ],
        salary: 100,
        appointable: true
      },
      {
        id: 'censor',
        name: '监察御史',
        category: '属官',
        rankLevel: 5,
        description: '负责具体监察工作的官员。',
        authority: [
          '巡视地方',
          '调查官员',
          '弹劾不法',
          '提交监察报告'
        ],
        salary: 70,
        appointable: true
      }
    ],
    staffing: {
      长官: 1,
      副职: 2,
      属官: 10,
      吏员: 15
    },
    privileges: [
      '可弹劾任何官员',
      '可直接向皇帝奏事',
      '可调查任何案件',
      '享有监察豁免权'
    ]
  }
];

// ============================================================================
// 地方机构
// ============================================================================

export const LOCAL_BUREAUS: BureaucracyBureau[] = [
  {
    id: 'county_yamen',
    name: '县衙',
    type: '地方',
    level: 1,
    description: '县级最高行政机构，负责一县治理事务。',
    functions: [
      '维持地方治安',
      '征收赋税钱粮',
      '审理刑事案件',
      '教化百姓',
      '兴修公共设施'
    ],
    positions: [
      {
        id: 'county_magistrate',
        name: '县令',
        category: '长官',
        rankLevel: 7,
        description: '一县最高长官，掌管全县行政、司法、财政等事务。',
        authority: [
          '治理全县事务',
          '审判刑事案件',
          '征收赋税',
          '任免县衙吏员',
          '签发县衙文书'
        ],
        salary: 30,
        appointable: true
      },
      {
        id: 'county_vice_magistrate',
        name: '县丞',
        category: '副职',
        rankLevel: 8,
        description: '县衙副长官，协助县令处理政务。',
        authority: [
          '协助处理政务',
          '代行县令职权',
          '分管具体事务'
        ],
        salary: 25,
        appointable: true
      },
      {
        id: 'county_judicial',
        name: '主簿',
        category: '属官',
        rankLevel: 8,
        description: '负责县衙文书、户籍、田亩等事务。',
        authority: [
          '管理文书档案',
          '掌管户籍田亩',
          '协助审理案件'
        ],
        salary: 20,
        appointable: true
      },
      {
        id: 'county_police',
        name: '县尉',
        category: '属官',
        rankLevel: 8,
        description: '负责县衙治安、捕盗等事务。',
        authority: [
          '维持地方治安',
          '追捕盗贼',
          '管理监狱'
        ],
        salary: 20,
        appointable: true
      }
    ],
    staffing: {
      长官: 1,
      副职: 1,
      属官: 3,
      吏员: 10
    },
    privileges: [
      '可治理县域',
      '可审判案件',
      '可征收赋税',
      '可任免下属'
    ]
  },
  {
    id: 'prefecture_yamen',
    name: '州衙',
    type: '地方',
    level: 2,
    description: '州级最高行政机构，管辖数个县。',
    functions: [
      '监督属县政务',
      '审理重大案件',
      '协调地方事务',
      '巡视属县',
      '上报地方情况'
    ],
    positions: [
      {
        id: 'prefect_magistrate',
        name: '知州',
        category: '长官',
        rankLevel: 5,
        description: '一州最高长官，管辖数县。',
        authority: [
          '治理全州事务',
          '监督属县',
          '审理重大案件',
          '任免州衙官员',
          '签发州衙文书'
        ],
        salary: 70,
        appointable: true
      },
      {
        id: 'prefect_vice',
        name: '同知',
        category: '副职',
        rankLevel: 6,
        description: '州衙副长官，协助知州处理州务。',
        authority: [
          '协助处理州务',
          '代行知州职权',
          '分管具体事务'
        ],
        salary: 50,
        appointable: true
      }
    ],
    staffing: {
      长官: 1,
      副职: 2,
      属官: 6,
      吏员: 20
    },
    privileges: [
      '可管辖数县',
      '可审理重大案件',
      '可监督属县',
      '可直接上报朝廷'
    ]
  }
];

// ============================================================================
// 特殊机构
// ============================================================================

export const SPECIAL_BUREAUS: BureaucracyBureau[] = [
  {
    id: 'hanlin_academy',
    name: '翰林院',
    type: '中央',
    level: 4,
    description: '朝廷最高学府和顾问机构，汇聚天下英才。',
    functions: [
      '侍奉皇帝读书',
      '起草朝廷诏令',
      '修撰国史',
      '为皇帝顾问',
      '培养高级官员'
    ],
    positions: [
      {
        id: 'hanlin_scholar',
        name: '翰林学士',
        category: '属官',
        rankLevel: 3,
        description: '翰林院学士，负责起草诏令、侍讲皇帝。',
        authority: [
          '起草朝廷诏令',
          '为皇帝讲学',
          '参与朝政决策',
          '修撰国史'
        ],
        salary: 130,
        appointable: true
      }
    ],
    staffing: {
      长官: 0,
      副职: 0,
      属官: 10,
      吏员: 15
    },
    privileges: [
      '可接近皇帝',
      '可参与朝政',
      '是升任高官的捷径'
    ]
  },
  {
    id: 'grand_secretariat',
    name: '内阁',
    type: '中央',
    level: 5,
    description: '朝廷最高决策机构，辅佐皇帝处理国政。',
    functions: [
      '辅佐皇帝处理政务',
      '起草重要诏令',
      '参与国家决策',
      '协调六部事务',
      '代表皇帝发布命令'
    ],
    positions: [
      {
        id: 'senior_grand_secretary',
        name: '首辅',
        category: '长官',
        rankLevel: 1,
        description: '内阁首辅，百官之首，辅佐皇帝。',
        authority: [
          '票拟拟旨',
          '参与朝政决策',
          '协调六部',
          '代表皇帝'
        ],
        salary: 300,
        appointable: true
      }
    ],
    staffing: {
      长官: 1,
      副职: 2,
      属官: 5,
      吏员: 10
    },
    privileges: [
      '票拟权',
      '参与决策',
      '协调六部',
      '接近皇帝'
    ]
  }
];

// ============================================================================
// 导出汇总
// ============================================================================

/** 所有官僚机构 */
export const ALL_BUREAUS: BureaucracyBureau[] = [
  ...SIX_MINISTRIES,
  ...CENSORATE_BUREAUS,
  ...LOCAL_BUREAUS,
  ...SPECIAL_BUREAUS
];

/** 机构分类 */
export const BUREAU_CATEGORIES = {
  中央: SIX_MINISTRIES,
  监察: CENSORATE_BUREAUS,
  地方: LOCAL_BUREAUS,
  军事: SIX_MINISTRIES.filter(b => b.type === '军事'),
  司法: SIX_MINISTRIES.filter(b => b.type === '司法'),
  特殊: SPECIAL_BUREAUS
} as const;

/**
 * 根据ID获取机构
 */
export function getBureauById(id: string): BureaucracyBureau | undefined {
  return ALL_BUREAUS.find(b => b.id === id);
}

/**
 * 根据类型获取机构列表
 */
export function getBureausByType(type: BureaucracyType): BureaucracyBureau[] {
  return ALL_BUREAUS.filter(b => b.type === type);
}

/**
 * 根据官品获取可担任职务
 */
export function getPositionsByRank(rankLevel: number): BureauPosition[] {
  const positions: BureauPosition[] = [];
  for (const bureau of ALL_BUREAUS) {
    for (const pos of bureau.positions) {
      if (pos.rankLevel === rankLevel && pos.appointable) {
        positions.push(pos);
      }
    }
  }
  return positions;
}

/**
 * 获取机构的所有职位
 */
export function getBureauPositions(bureauId: string): BureauPosition[] {
  const bureau = getBureauById(bureauId);
  return bureau?.positions || [];
}

/**
 * 创建新的人事任命
 */
export function createAppointment(
  appointeeName: string,
  positionId: string,
  bureauId: string,
  appointmentType: Appointment['appointmentType'] = '新任'
): Appointment {
  return {
    id: `appointment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    appointeeName,
    positionId,
    bureauId,
    appointmentTime: new Date().toISOString(),
    appointmentType,
    status: '在任'
  };
}

/**
 * 计算机构编制总额
 */
export function calculateBureauStaffing(bureauId: string): number {
  const bureau = getBureauById(bureauId);
  if (!bureau) return 0;
  return bureau.staffing.长官 + bureau.staffing.副职 + bureau.staffing.属官 + bureau.staffing.吏员;
}

/**
 * 获取职位描述
 */
export function getPositionDescription(positionId: string): string {
  for (const bureau of ALL_BUREAUS) {
    const pos = bureau.positions.find(p => p.id === positionId);
    if (pos) {
      return `${bureau.name} - ${pos.name}`;
    }
  }
  return '未知职位';
}
