/**
 * @fileoverview 治国方略系统 - AI动态生成框架
 * 所有治国方略都由AI根据游戏情况动态生成和管理
 */

import type { DaoData, ThousandDaoSystem } from '../types/game';

/** 创建空的治国方略系统 */
export function createEmptyThousandDaoSystem(): ThousandDaoSystem {
  return {
    方略列表: {}, // 开局无任何方略，完全由AI根据机缘解锁
  };
}

/**
 * 为新解锁的方略创建初始数据（数据+进度合并）
 * 所有方略都从第0阶段开始
 */
export function createNewDaoData(daoName: string, description: string = '神秘的治国方略'): DaoData {
  return {
    道名: daoName,
    描述: description,
    阶段列表: [], // 由AI动态生成阶段
    是否解锁: true,
    当前阶段: 0,
    当前经验: 0,
    总经验: 0,
  };
}

/**
 * 预设治国方略模板（供AI参考）
 * 这些是常见的治国方略类型，AI可根据实际情况创造新的
 */

/** 治国方略分类 */
export type GovernanceStrategyType =
  | '仁政'      // 以民为本，轻徭薄赋
  | '法治'      // 以法治国，严明赏罚
  | '无为'      // 清静无为，顺其自然
  | '功利'      // 注重实效，发展经济
  | '教化'      // 以教化民，注重文治
  | '权谋'      // 权谋平衡，灵活应对
  | '严刑'      // 严刑峻法，威慑犯罪
  | '富国';     // 富国强兵，增强实力

/** 治国方略模板 */
export interface GovernanceStrategyTemplate {
  /** 方略ID */
  id: string;
  /** 方略名称 */
  name: string;
  /** 方略类型 */
  type: GovernanceStrategyType;
  /** 方略描述 */
  description: string;
  /** 解锁条件 */
  unlockCondition?: {
    minRank?: number;        // 最低官品
    minPrestige?: number;    // 最低威望
    requiredPolicy?: string; // 需要实施特定政令
  };
  /** 方略效果 */
  effects: {
   民心?: number;
    赋税?: number;
    治安?: number;
    教化?: number;
    商业?: number;
    农业?: number;
    威望?: number;
    政绩?: number;
    银两?: number;
  };
  /** 可能的副作用 */
  sideEffects?: string[];
  /** 特殊能力 */
  specialAbilities?: string[];
}

/** 预设治国方略模板列表 */
export const GOVERNANCE_STRATEGY_TEMPLATES: GovernanceStrategyTemplate[] = [
  {
    id: 'benevolent_government',
    name: '仁政方略',
    type: '仁政',
    description: '以民为本，轻徭薄赋，关心百姓疾苦。这是儒家倡导的治国之道，可大幅提升民心，但财政收入会减少。',
    unlockCondition: { minRank: 7 },
    effects: {
      民心: 30,
      赋税: -20,
      威望: 15,
      教化: 10
    },
    sideEffects: ['财政收入减少', '国库可能紧张'],
    specialAbilities: ['百姓爱戴', '民变风险降低']
  },
  {
    id: 'rule_of_law',
    name: '法治方略',
    type: '法治',
    description: '以法治国，严明赏罚，有法必依。可大幅提升治安和行政效率，但过于严苛可能引起民怨。',
    unlockCondition: { minRank: 6 },
    effects: {
      治安: 35,
      赋税: 15,
      民心: -10,
      威望: 10
    },
    sideEffects: ['百姓压力增大', '可能引起民怨'],
    specialAbilities: ['执法如山', '贪官敛迹']
  },
  {
    id: 'wu_wei_governance',
    name: '无为之治',
    type: '无为',
    description: '清静无为，顺其自然，减少政府干预。让百姓自由发展，可提升民心和商业，但治安可能下降。',
    unlockCondition: { minRank: 5 },
    effects: {
      民心: 25,
      商业: 20,
      治安: -15,
      威望: 10
    },
    sideEffects: ['治安可能恶化', '盗匪可能增加'],
    specialAbilities: ['百姓安乐', '商业繁荣']
  },
  {
    id: 'utilitarian_governance',
    name: '功利方略',
    type: '功利',
    description: '注重实效，发展经济，追求最大利益。可大幅提升赋税和商业，但可能牺牲民心。',
    unlockCondition: { minRank: 6 },
    effects: {
      商业: 35,
      赋税: 25,
      民心: -15,
      威望: 5
    },
    sideEffects: ['百姓负担加重', '民怨可能积累'],
    specialAbilities: ['经济繁荣', '国库充盈']
  },
  {
    id: 'moral_education',
    name: '教化方略',
    type: '教化',
    description: '以教化民，注重文治，兴办学堂。可大幅提升教化和民心，但需要大量投入。',
    unlockCondition: { minRank: 5 },
    effects: {
      教化: 40,
      民心: 20,
      威望: 15,
      银两: -500
    },
    sideEffects: ['需要大量投入', '短期效果不明显'],
    specialAbilities: ['文风鼎盛', '人才涌现', '科举通过率提升']
  },
  {
    id: 'political_balance',
    name: '权谋方略',
    type: '权谋',
    description: '权谋平衡，灵活应对，周旋各方。可在官场中游刃有余，但可能失去民心。',
    unlockCondition: { minRank: 4 },
    effects: {
      威望: 30,
      政绩: 20,
      民心: -10
    },
    sideEffects: ['百姓可能不满', '被视为权谋之臣'],
    specialAbilities: ['官场圆滑', '各方平衡', '升迁加速']
  },
  {
    id: 'strict_punishment',
    name: '严刑方略',
    type: '严刑',
    description: '严刑峻法，威慑犯罪，以暴制暴。可大幅提升治安，但百姓畏惧，民心下降。',
    unlockCondition: { minRank: 5 },
    effects: {
      治安: 40,
      民心: -25,
      威望: -5
    },
    sideEffects: ['百姓畏惧', '民怨积累'],
    specialAbilities: ['盗匪绝迹', '犯罪率下降']
  },
  {
    id: 'enrich_state',
    name: '富国方略',
    type: '富国',
    description: '富国强兵，增强实力，发展军事。可提升军事和威望，但需要大量投入。',
    unlockCondition: { minRank: 3 },
    effects: {
      威望: 25,
      治安: 20,
      赋税: 15,
      银两: -1000
    },
    sideEffects: ['需要大量投入', '百姓负担加重'],
    specialAbilities: ['国力强盛', '军威大振', '周边敬畏']
  }
];

/**
 * 根据方略类型获取模板
 */
export function getStrategyTemplate(type: GovernanceStrategyType): GovernanceStrategyTemplate | undefined {
  return GOVERNANCE_STRATEGY_TEMPLATES.find(s => s.type === type);
}

/**
 * 根据官品获取可解锁方略
 */
export function getUnlockableStrategies(rank: number): GovernanceStrategyTemplate[] {
  return GOVERNANCE_STRATEGY_TEMPLATES.filter(s => !s.unlockCondition?.minRank || s.unlockCondition.minRank >= rank);
}

/**
 * 获取所有方略类型
 */
export function getAllStrategyTypes(): GovernanceStrategyType[] {
  return ['仁政', '法治', '无为', '功利', '教化', '权谋', '严刑', '富国'];
}

/**
 * 生成方略系统提示词（供AI使用）
 */
export function generateStrategySystemPrompt(): string {
  return `
## 治国方略系统

方略是县令治理地方的核心理念和方法。每个方略都有独特的优缺点，需要根据实际情况选择。

### 预设方略类型：

1. **仁政方略** - 以民为本，轻徭薄赋
   - 优势：大幅提升民心
   - 劣势：财政收入减少

2. **法治方略** - 以法治国，严明赏罚
   - 优势：大幅提升治安
   - 劣势：可能引起民怨

3. **无为之治** - 清静无为，顺其自然
   - 优势：提升民心和商业
   - 劣势：治安可能下降

4. **功利方略** - 注重实效，发展经济
   - 优势：大幅提升赋税和商业
   - 劣势：可能牺牲民心

5. **教化方略** - 以教化民，注重文治
   - 优势：大幅提升教化和民心
   - 劣势：需要大量投入

6. **权谋方略** - 权谋平衡，灵活应对
   - 优势：官场游刃有余
   - 劣势：可能失去民心

7. **严刑方略** - 严刑峻法，威慑犯罪
   - 优势：大幅提升治安
   - 劣势：百姓畏惧

8. **富国方略** - 富国强兵，增强实力
   - 优势：提升军事和威望
   - 劣势：需要大量投入

### AI创作方略指南：

当游戏需要新的治国方略时，AI可以：
1. 参考预设方略模板
2. 结合当前游戏情况（民心、治安、财政等）
3. 创造性地设计新的方略
4. 为方略命名、描述效果、标注副作用

### 方略获取方式：

1. **政绩积累** - 施政获得政绩，自动领悟新方略
2. **特殊事件** - 处理特殊事件可能获得方略
3. **名儒指点** - 邀请名儒讲学可能获得方略
4. **读书领悟** - 阅读典籍可能领悟方略
5. **朝廷赐予** - 政绩显著可能获得朝廷赐予的方略
`;
}
