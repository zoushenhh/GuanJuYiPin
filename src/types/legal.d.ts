/**
 * @fileoverview 案件推理系统类型定义（县令特色功能）
 *
 * 【术语说明】
 * - 断案：县令审理案件、查明真相的过程
 * - 案件：需要审理的各类案件
 * - 线索：用于推断真相的证据和证言
 * - 判决：对案件做出的最终判决
 */

import type { AIMetadata } from './game';

// ============================================================================
// 案件类型定义
// ============================================================================

/**
 * 案件类型（县令主题）
 */
export type CaseType =
  | '偷窃'      // 盗窃案件
  | '抢劫'      // 抢劫案件
  | '杀人'      // 命案
  | '伤害'      // 伤害案件
  | '争产'      // 财产纠纷
  | '欠债'      // 债务纠纷
  | '通奸'      // 通奸案件
  | '贪污'      // 贪污案件
  | '冤案'      // 冤假错案
  | '民事'      // 民事纠纷
  | '其他';     // 其他案件

/**
 * 案件难度等级
 */
export type CaseDifficulty = '简单' | '普通' | '困难' | '极难';

/**
 * 案件状态
 */
export type CaseStatus = '待审' | '审理中' | '已判决' | '已归档';

/**
 * 线索类型
 */
export type ClueType =
  | '物证'      // 实物证据
  | '人证'      // 证人证言
  | '书证'      // 文书证据
  | '勘验'      // 现场勘验
  | '供述'      // 当事人供述
  | '传闻';     // 传闻证据

/**
 * 线索可信度
 */
export type ClueReliability = '可靠' | '较可靠' | '存疑' | '不可靠' | '虚假';

// ============================================================================
// 核心类型定义
// ============================================================================

/**
 * 线索数据结构
 */
export interface CaseClue {
  id: string;                    // 线索唯一标识
  案件ID: string;               // 所属案件ID
  类型: ClueType;               // 线索类型
  名称: string;                  // 线索名称（简短描述）
  描述: string;                  // 详细描述
  可信度: ClueReliability;       // 可信度
  真伪: boolean;                // 是否为真（系统内部记录，玩家不可见）
  发现难度: number;              // 发现难度 [1-10]
  是否已发现: boolean;           // 玩家是否已发现
  发现时间?: string;             // 发现时间（游戏时间）
  相关人物?: string[];           // 相关人物姓名列表
  相关地点?: string;             // 相关地点
  关联线索?: string[];           // 关联的其他线索ID

  // 线索详情（根据类型不同，包含不同字段）
  物品描述?: string;             // 物证：物品描述
  证人姓名?: string;             // 人证：证人姓名
  证言内容?: string;             // 人证：证言内容
  文书内容?: string;             // 书证：文书内容
  供述内容?: string;             // 供述：供述内容
}

/**
 * 当事人信息（案件中的各方）
 */
export interface CaseParticipant {
  姓名: string;                  // 当事人姓名
  类型: '原告' | '被告' | '证人' | '受害人' | '嫌疑人';
  角色: string;                  // 社会角色（如：商人、农夫、书生等）
  供述: string;                  // 供述内容
  可信度: ClueReliability;       // 供述可信度
  供述真伪?: boolean;            // 供述是否为真（系统内部）
  关键证词?: string[];           // 关键证词/供词
  矛盾点?: string[];             // 与其他供述的矛盾点

  // 状态字段
  是否已传唤: boolean;           // 是否已传唤
  是否已审问: boolean;           // 是否已审问
  审问次数: number;             // 审问次数

  // 可选扩展字段
  年龄?: number;
  性别?: '男' | '女';
  职业?: string;
  与案件关系?: string;          // 与案件的关系描述
}

/**
 * 案件主体数据结构
 */
export interface LegalCase extends AIMetadata {
  id: string;                    // 案件唯一标识
  案件名称: string;              // 案件名称
  类型: CaseType;                // 案件类型
  难度: CaseDifficulty;          // 案件难度
  状态: CaseStatus;              // 案件状态

  // 案件描述
  案情摘要: string;              // 案件简要描述（公开信息）
  详细案情: string;              // 详细案情描述（玩家可看）
  案发时间: string;              // 案发时间（游戏时间）
  案发地点: string;              // 案发地点
  报案人: string;                // 报案人姓名

  // 当事人
  原告?: CaseParticipant[];       // 原告列表（民事案件）
  被告: CaseParticipant[];       // 被告/嫌疑人列表
  证人?: CaseParticipant[];       // 证人列表
  受害人?: CaseParticipant;      // 受害人（刑事案件中）

  // 线索系统
  线索池: CaseClue[];             // 所有可用线索（包括未发现的）
  已发现线索: string[];          // 已发现线索的ID列表
  关键线索?: string[];           // 破案所需的关键线索ID

  // 审理进度
  当前审理阶段: string;          // 当前审理阶段描述
  已传唤人员: string[];          // 已传唤的人员姓名
  审理记录: CaseRecord[];       // 审理记录

  // 判决信息（审理完成后填写）
  判决结果?: {
    结论: string;                // 判决结论（如：被告有罪/无罪）
    罪名?: string;               // 罪名（如有罪）
    刑罚?: string;               // 判决刑罚
    赔偿?: string;               // 赔偿金额/方式
    依据: string;                // 判决依据
    判决时间?: string;           // 判决时间
  };

  // 系统字段
  创建时间: string;              // 案件创建时间（真实时间）
  更新时间: string;              // 最后更新时间
  限时?: number;                 // 案件限时（回合数，可选）
  已用回合?: number;             // 已使用的回合数

  // 扩展字段
  扩展?: {
    [key: string]: any;
  };
}

/**
 * 审理记录
 */
export interface CaseRecord {
  id: string;                    // 记录ID
  时间: string;                  // 记录时间（游戏时间）
  类型: '传唤' | '审问' | '调查' | '发现线索' | '判决' | '其他';
  描述: string;                  // 记录描述
  相关人员?: string[];           // 相关人员姓名
  相关线索?: string[];           // 相关线索ID
  详情?: string;                 // 详细信息
}

// ============================================================================
// 案件生成配置
// ============================================================================

/**
 * 案件生成配置
 */
export interface CaseGenerationConfig {
  案件类型: CaseType[];          // 允许生成的案件类型
  难度范围: [CaseDifficulty, CaseDifficulty];  // 难度范围
  最小线索数: number;             // 最少线索数量
  最大线索数: number;             // 最多线索数量
  真相线索比例: number;          // 真实线索比例 [0-1]
  假线索比例: number;            // 虚假线索比例 [0-1]
}

/**
 * 案件模板（用于生成案件）
 */
export interface CaseTemplate {
  id: string;                    // 模板ID
  类型: CaseType;                // 案件类型
  难度: CaseDifficulty;          // 默认难度
  名称模板: string;              // 案件名称模板（如："{地点}偷窃案"）
  情节模板: string;              // 案情情节模板

  // NPC配置
  原告配置?: Partial<CaseParticipant>;
  被告配置: Partial<CaseParticipant>;
  证人配置?: Partial<CaseParticipant>[];

  // 线索配置
  线索配置: Omit<CaseClue, 'id' | '案件ID' | '是否已发现'>[];
}

// ============================================================================
// 判决相关类型
// ============================================================================

/**
 * 判决选项
 */
export interface VerdictOption {
  文本: string;                  // 判决文本（如："被告有罪，杖责八十"）
  是否正确: boolean;             // 是否为正确判决（系统内部）
  要求: {
    所需线索?: string[];         // 判决所需的关键线索
    最少证据数?: number;         // 最少需要发现的线索数
    特殊条件?: string;           // 特殊条件描述
  };
  后果?: {
    声望变化?: number;           // 判决后的声望变化
    民心变化?: number;           // 判决后的民心变化
    政绩变化?: number;           // 判决后的政绩变化
    其他后果?: string;           // 其他后果描述
  };
}

/**
 * 判决结果
 */
export interface VerdictResult {
  判决选项: VerdictOption;       // 玩家选择的判决
  是否正确: boolean;             // 判决是否正确
  实际真相: string;              // 案件实际真相（揭示）
  得分: number;                  // 判决得分 [0-100]
  评价: string;                  // 判决评价
}

// ============================================================================
// 断案能力系统
// ============================================================================

/**
 * 断案技能等级
 */
export type JudgementSkillLevel = '生疏' | '熟练' | '精通' | '专家';

/**
 * 断案能力数据
 */
export interface JudgementAbility {
  观察力: number;                // 观察力 [0-100]，影响发现线索的概率
  推理力: number;                // 推理力 [0-100]，影响判断线索真伪的能力
  审讯技巧: number;              // 审讯技巧 [0-100]，影响审问获取信息的效率
  威望加成: number;              // 威望加成 [0-100]，影响被告配合度

  // 技能等级（自动计算）
  观察力等级: JudgementSkillLevel;
  推理力等级: JudgementSkillLevel;
  审讯技巧等级: JudgementSkillLevel;
}

/**
 * 根据属性计算断案能力
 */
export interface JudgementAbilityInput {
  根骨: number;                  // 影响审讯时的体力消耗
  悟性: number;                  // 影响推理力
  心性: number;                  // 影响观察力和判断力
  气运: number;                  // 影响发现关键线索的概率
  魅力: number;                  // 影响NPC配合度
  当前官品: string;              // 当前官品
  声望: number;                  // 声望值
}

// ============================================================================
// 导出类型集合
// ============================================================================

export type {
  // 案件相关
  CaseType,
  CaseDifficulty,
  CaseStatus,
  ClueType,
  ClueReliability,

  // 断案技能
  JudgementSkillLevel,

  // 类型完整导出
  LegalCase,
  CaseClue,
  CaseParticipant,
  CaseRecord,
  CaseTemplate,
  VerdictOption,
  VerdictResult,
  JudgementAbility,
  JudgementAbilityInput,
};
