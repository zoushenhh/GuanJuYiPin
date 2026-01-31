/**
 * @fileoverview 官学体系系统数据（替代原修仙"千道系统"）
 * 定义县令模拟器中的官学、书院、学派等教育体系
 */

// ============================================================================
// 类型定义
// ============================================================================

/** 官学类型 */
export type SchoolType = '县学' | '州学' | '府学' | '太学';

/** 学派类型 */
export type SchoolOfThought = '儒家' | '法家' | '道家' | '墨家' | '兵家' | '纵横家';

/** 官学等级 */
export type SchoolLevel = 1 | 2 | 3 | 4 | 5;

/** 官学定义 */
export interface GovernanceSchool {
  /** 官学唯一标识 */
  id: string;
  /** 官学名称 */
  name: string;
  /** 官学类型 */
  type: SchoolType;
  /** 学派倾向 */
  thoughtType: SchoolOfThought;
  /** 官学等级 */
  level: SchoolLevel;
  /** 官学描述 */
  description: string;
  /** 建设所需银两 */
  buildCost: number;
  /** 每月维护费用 */
  maintenanceCost: number;
  /** 可容纳学生数量 */
  capacity: number;
  /** 教学效果 */
  teachingEffect: TeachingEffect;
  /** 解锁条件 */
  unlockCondition?: {
    minRank?: number;
    requiredBuilding?: string;
    requiredPolicy?: string;
  };
}

/** 教学效果 */
export interface TeachingEffect {
  /** 教化提升 */
  教化?: number;
  /** 民心提升 */
  民心?: number;
  /** 威望提升 */
  威望?: number;
  /** 科举通过率加成 */
  科举加成?: number;
  /** 特殊效果 */
  特殊效果?: string[];
  /** 培养的人才类型 */
  人才类型?: string[];
  /** 治安提升 */
  治安?: number;
  /** 商业提升 */
  商业?: number;
}

/** 学派定义 */
export interface SchoolOfThoughtDefinition {
  /** 学派标识 */
  id: string;
  /** 学派名称 */
  name: SchoolOfThought;
  /** 学派核心理念 */
  corePhilosophy: string;
  /** 学派描述 */
  description: string;
  /** 学派特色 */
  characteristics: string[];
  /** 对应政绩属性加成 */
  attributeBonus: {
    教化?: number;
    治安?: number;
    赋税?: number;
    民心?: number;
    商业?: number;
    威望?: number;
  };
}

/** 学生数据 */
export interface Student {
  /** 学生ID */
  id: string;
  /** 学生姓名 */
  name: string;
  /** 入学时间 */
  enrollTime: string;
  /** 学业进度（0-100） */
  progress: number;
  /** 天赋等级 */
  talent: '下等' | '中等' | '上等' | '优异';
  /** 是否毕业 */
  graduated: boolean;
  /** 毕业去向 */
  graduationDest?: string;
}

// ============================================================================
// 学派数据
// ============================================================================

export const SCHOOLS_OF_THOUGHT: SchoolOfThoughtDefinition[] = [
  {
    id: 'confucianism',
    name: '儒家',
    corePhilosophy: '仁义礼智信，修身齐家治国平天下',
    description: '儒家学说强调仁爱、礼仪、智慧、诚信，主张以德治国，教化百姓。是官学的主流学派。',
    characteristics: [
      '重视道德修养',
      '强调礼法秩序',
      '倡导仁政爱民',
      '注重人才培养',
      '推崇科举取士'
    ],
    attributeBonus: {
      教化: 30,
      民心: 20,
      威望: 15
    }
  },
  {
    id: 'legalism',
    name: '法家',
    corePhilosophy: '以法治国，明赏罚，重刑名',
    description: '法家主张以法治国，强调法律的权威和严明。重视赏罚分明，认为法律是治理国家的根本。',
    characteristics: [
      '强调法律权威',
      '严明赏罚制度',
      '重视行政管理',
      '注重实际功效',
      '推行法治教育'
    ],
    attributeBonus: {
      治安: 35,
      赋税: 20,
      教化: 10
    }
  },
  {
    id: 'taoism',
    name: '道家',
    corePhilosophy: '道法自然，无为而治',
    description: '道家主张顺应自然，减少人为干预，强调清静无为。认为最好的治理是让百姓自然而然地生活。',
    characteristics: [
      '主张自然无为',
      '减少政府干预',
      '强调和谐共处',
      '注重精神修养',
      '倡导简朴生活'
    ],
    attributeBonus: {
      民心: 35,
      威望: 15,
      商业: 10
    }
  },
  {
    id: 'mohism',
    name: '墨家',
    corePhilosophy: '兼爱非攻，尚贤节用',
    description: '墨家主张兼爱天下，反对侵略战争。推崇贤能，提倡节俭，重视实用技术和工匠精神。',
    characteristics: [
      '主张兼爱平等',
      '反对侵略战争',
      '推崇贤能政治',
      '提倡节俭生活',
      '重视技术发展'
    ],
    attributeBonus: {
      民心: 30,
      商业: 20,
      教化: 10
    }
  },
  {
    id: 'militarism',
    name: '兵家',
    corePhilosophy: '兵者，国之大事，知己知彼百战不殆',
    description: '兵家专门研究军事战略战术，强调战争的重要性。主张精心备战，懂得战争是国家的重大事务。',
    characteristics: [
      '重视军事战略',
      '强调备战训练',
      '研究战术运用',
      '注重情报收集',
      '培养将领人才'
    ],
    attributeBonus: {
      治安: 40,
      威望: 15,
      民心: -5
    }
  },
  {
    id: 'diplomacy',
    name: '纵横家',
    corePhilosophy: '纵横捭阖，审时度势，合纵连横',
    description: '纵横家擅长外交游说，主张根据形势变化灵活应对。强调审时度势，通过外交手段达到目的。',
    characteristics: [
      '擅长外交游说',
      '灵活应对变局',
      '重视情报分析',
      '善于谋略策划',
      '培养外交人才'
    ],
    attributeBonus: {
      商业: 35,
      威望: 25,
      赋税: 10
    }
  }
];

// ============================================================================
// 县学数据（基础官学）
// ============================================================================

export const COUNTY_SCHOOLS: GovernanceSchool[] = [
  {
    id: 'confucian_county_school',
    name: '县学',
    type: '县学',
    thoughtType: '儒家',
    level: 1,
    description: '县级官办学校，教授儒家经典，培养地方人才。是科举人才的摇篮。',
    buildCost: 2000,
    maintenanceCost: 100,
    capacity: 50,
    teachingEffect: {
      教化: 15,
      民心: 10,
      科举加成: 10,
      特殊效果: ['培养科举人才', '提升地方文化'],
      人才类型: ['书吏', '教谕', '县丞']
    },
    unlockCondition: { minRank: 7 }
  },
  {
    id: 'legalist_county_school',
    name: '法学县学',
    type: '县学',
    thoughtType: '法家',
    level: 1,
    description: '以法家思想为主的县学，教授法律知识和行政技能，培养执法人才。',
    buildCost: 1800,
    maintenanceCost: 90,
    capacity: 40,
    teachingEffect: {
      教化: 10,
      治安: 20,
      科举加成: 5,
      特殊效果: ['培养执法人才', '提升治安水平'],
      人才类型: ['典史', '刑名师爷', '推官']
    },
    unlockCondition: { minRank: 7 }
  }
];

// ============================================================================
// 州学数据（中级官学）
// ============================================================================

export const PREFECTURAL_SCHOOLS: GovernanceSchool[] = [
  {
    id: 'confucian_prefectural_school',
    name: '州学',
    type: '州学',
    thoughtType: '儒家',
    level: 2,
    description: '州级官办学校，教学规模更大，师资更强。是培养更高层次人才的机构。',
    buildCost: 5000,
    maintenanceCost: 200,
    capacity: 100,
    teachingEffect: {
      教化: 25,
      民心: 15,
      威望: 10,
      科举加成: 20,
      特殊效果: ['培养高级人才', '提升区域文化影响力'],
      人才类型: ['知县', '州同知', '教谕']
    },
    unlockCondition: { minRank: 5 }
  },
  {
    id: 'military_prefectural_school',
    name: '武备州学',
    type: '州学',
    thoughtType: '兵家',
    level: 2,
    description: '以军事教学为主的州学，教授兵法战术，培养军事人才。',
    buildCost: 4500,
    maintenanceCost: 180,
    capacity: 80,
    teachingEffect: {
      教化: 10,
      治安: 35,
      威望: 15,
      科举加成: 5,
      特殊效果: ['培养军事人才', '提升地方防卫能力'],
      人才类型: ['县尉', '千总', '把总']
    },
    unlockCondition: { minRank: 5 }
  },
  {
    id: 'commerce_prefectural_school',
    name: '实学州学',
    type: '州学',
    thoughtType: '墨家',
    level: 2,
    description: '教授实用技艺和商业知识的州学，培养技术和管理人才。',
    buildCost: 4000,
    maintenanceCost: 150,
    capacity: 70,
    teachingEffect: {
      教化: 15,
      商业: 30,
      民心: 10,
      特殊效果: ['培养技术人才', '促进工商业发展'],
      人才类型: ['工坊主', '商贾', '技师']
    },
    unlockCondition: { minRank: 5 }
  }
];

// ============================================================================
// 府学数据（高级官学）
// ============================================================================

export const DEPARTMENT_SCHOOLS: GovernanceSchool[] = [
  {
    id: 'confucian_department_school',
    name: '府学',
    type: '府学',
    thoughtType: '儒家',
    level: 3,
    description: '府级最高学府，汇聚名师大儒，教学水平极高。是科举人才培养的顶级机构。',
    buildCost: 12000,
    maintenanceCost: 400,
    capacity: 200,
    teachingEffect: {
      教化: 40,
      民心: 25,
      威望: 20,
      科举加成: 35,
      特殊效果: ['培养顶尖人才', '提升区域文化中心地位', '吸引名儒'],
      人才类型: ['知州', '通判', '教授']
    },
    unlockCondition: { minRank: 4 }
  },
  {
    id: 'diplomacy_department_school',
    name: '纵横府学',
    type: '府学',
    thoughtType: '纵横家',
    level: 3,
    description: '培养外交和谋略人才的府学，教授纵横捭阖之术。',
    buildCost: 10000,
    maintenanceCost: 350,
    capacity: 150,
    teachingEffect: {
      教化: 20,
      商业: 35,
      威望: 30,
      科举加成: 15,
      特殊效果: ['培养外交人才', '提升商业影响力'],
      人才类型: ['通判', '知州', '外交使节']
    },
    unlockCondition: { minRank: 4 }
  }
];

// ============================================================================
// 太学数据（最高学府）
// ============================================================================

export const IMPERIAL_SCHOOL: GovernanceSchool = {
  id: 'imperial_school',
  name: '太学',
  type: '太学',
  thoughtType: '儒家',
  level: 5,
  description: '朝廷最高学府，由国子监管辖。汇聚天下英才，教授治国平天下之道。',
  buildCost: 50000,
  maintenanceCost: 1000,
  capacity: 500,
  teachingEffect: {
    教化: 60,
    民心: 40,
    威望: 40,
    科举加成: 50,
    特殊效果: [
      '培养国家栋梁',
      '提升国家文化中心地位',
      '吸引天下名师',
      '直接推荐入仕'
    ],
    人才类型: ['六部官员', '翰林学士', '地方大员']
  },
  unlockCondition: { minRank: 3 }
};

// ============================================================================
// 导出汇总
// ============================================================================

/** 所有官学 */
export const ALL_GOVERNANCE_SCHOOLS: GovernanceSchool[] = [
  ...COUNTY_SCHOOLS,
  ...PREFECTURAL_SCHOOLS,
  ...DEPARTMENT_SCHOOLS,
  IMPERIAL_SCHOOL
];

/** 官学分类 */
export const SCHOOL_CATEGORIES = {
  县学: COUNTY_SCHOOLS,
  州学: PREFECTURAL_SCHOOLS,
  府学: DEPARTMENT_SCHOOLS,
  太学: [IMPERIAL_SCHOOL]
} as const;

/**
 * 根据ID获取官学
 */
export function getSchoolById(id: string): GovernanceSchool | undefined {
  return ALL_GOVERNANCE_SCHOOLS.find(s => s.id === id);
}

/**
 * 根据官品获取可建官学
 */
export function getSchoolsByRank(rank: number): GovernanceSchool[] {
  return ALL_GOVERNANCE_SCHOOLS.filter(s => !s.unlockCondition?.minRank || s.unlockCondition.minRank >= rank);
}

/**
 * 根据学派获取官学列表
 */
export function getSchoolsByThought(thought: SchoolOfThought): GovernanceSchool[] {
  return ALL_GOVERNANCE_SCHOOLS.filter(s => s.thoughtType === thought);
}

/**
 * 创建新学生
 */
export function createNewStudent(name: string, talent: Student['talent'] = '中等'): Student {
  return {
    id: `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    enrollTime: new Date().toISOString(),
    progress: 0,
    talent,
    graduated: false
  };
}

/**
 * 计算学生毕业时间（月）
 */
export function calculateGraduationTime(student: Student): number {
  const baseTime = 36; // 基础36个月
  const talentMultiplier: Record<Student['talent'], number> = {
    下等: 1.5,
    中等: 1.0,
    上等: 0.7,
    优异: 0.5
  };
  return Math.floor(baseTime * talentMultiplier[student.talent]);
}

/**
 * 计算官学总维护费用
 */
export function calculateSchoolMaintenanceCost(schoolIds: string[]): number {
  return schoolIds.reduce((total, id) => {
    const school = getSchoolById(id);
    return total + (school?.maintenanceCost || 0);
  }, 0);
}

/**
 * 获取学派定义
 */
export function getSchoolOfThought(thoughtType: SchoolOfThought): SchoolOfThoughtDefinition | undefined {
  return SCHOOLS_OF_THOUGHT.find(s => s.name === thoughtType);
}
