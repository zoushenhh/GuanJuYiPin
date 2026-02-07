/**
 * @fileoverview 辖区数据系统类型定义（县令特色功能）
 *
 * 【术语说明】
 * - 辖区：县令管辖的行政区域
 * - 民心：民众对县令的信任和支持程度
 * - 治安：辖区内的安全状况
 * - 繁荣度：经济繁荣程度
 * - 库银：地方财政收入
 * - 粮食：灾害储备粮
 *
 * 【设计理念】
 * - 替代修仙主题的"灵气浓度"单一指标
 * - 使用多维度指标反映辖区治理状况
 * - 各指标相互关联，形成动态平衡
 */

import type { AIMetadata, ValuePair } from './game';

// ============================================================================
// 核心类型定义
// ============================================================================

/**
 * 辖区统计维度等级
 */
export type JurisdictionLevel =
  | '萧条'      // 人口稀少，经济落后
  | '贫困'      // 勉强维持生计
  | '普通'      // 正常水平
  | '富裕'      // 经济较好
  | '繁荣'      // 经济发达
  | '昌盛';     // 极度繁荣

/**
 * 治安等级
 */
export type SecurityLevel =
  | '混乱'      // 盗匪横行，民不聊生
  | '较差'      // 治安问题严重
  | '一般'      // 有治安问题但可控
  | '良好'      // 治安状况较好
  | '优秀'      // 治安很好
  | '太平';     // 夜不闭户

/**
 * 民心等级
 */
export type PublicTrustLevel =
  | '怨声载道'  // 民众极度不满
  | '不满'      // 民众有怨言
  | '一般'      // 民众态度中立
  | '信任'      // 民众信任县令
  | '拥戴'      // 民众拥戴县令
  | '爱戴';     // 民众深切爱戴

/**
 * 辖区统计数据（核心）
 */
export interface JurisdictionStats extends AIMetadata {
  // 基础信息
  名称: string;                  // 辖区名称（如："清河县"）
  等级: JurisdictionLevel;      // 辖区等级
  人口: number;                 // 人口数量 [100-100000]

  // 核心指标 [0-100]
  民心: ValuePair<number>;       // 民心支持度
  治安: ValuePair<number>;       // 治安状况
  繁荣度: ValuePair<number>;     // 经济繁荣度

  // 财政资源
  库银: number;                  // 地方财政银两
  粮食: number;                  // 灾荒储备粮（石）

  // 动态指标
  税收: {
    上月税收: number;           // 上月实际税收
    本月预估: number;           // 本月预估税收
    年度总计: number;           // 本年度累计税收
  };

  // 事件记录
  最近事件: JurisdictionEvent[]; // 最近发生的辖区事件
  待处理事件: string[];         // 待处理的事件ID列表

  // 发展趋势（用于显示趋势图）
  趋势: {
    民心趋势: number[];         // 最近10个时间点的民心值
    治安趋势: number[];         // 最近10个时间点的治安值
    繁荣趋势: number[];         // 最近10个时间点的繁荣度值
  };

  // 发展趋势（自然增长/衰减率）
  发展趋势: {
    民心增长率: number;         // 民心自然增长/衰减率（-5 到 +5）
    治安增长率: number;         // 治安自然增长/衰减率（-5 到 +5）
    繁荣增长率: number;         // 繁荣度自然增长/衰减率（-5 到 +5）
    人口增长率: number;         // 人口自然增长率（-2% 到 +3%）
    最后更新时间: string;       // 最后更新时间（游戏时间）
  };

  // 扩展字段
  扩展?: {
    [key: string]: any;
  };
}

/**
 * 辖区事件
 */
export interface JurisdictionEvent {
  id: string;                    // 事件ID
  时间: string;                  // 发生时间（游戏时间）
  类型: JurisdictionEventType;  // 事件类型
  名称: string;                  // 事件名称
  描述: string;                  // 事件描述
  影响: {
    民心变化?: number;           // 民心变化
    治安变化?: number;           // 治安变化
    繁荣变化?: number;           // 繁荣变化
    库银变化?: number;           // 库银变化
    粮食变化?: number;           // 粮食变化
  };
  是否已处理: boolean;           // 是否已处理
  处理结果?: string;             // 处理结果描述
}

/**
 * 辖区事件类型
 */
export type JurisdictionEventType =
  | '天灾'      // 自然灾害（旱灾、水灾等）
  | '盗匪'      // 盗匪侵扰
  | '疫病'      // 疾病爆发
  | '冤案'      // 冤假错案
  | '纠纷'      // 民事纠纷
  | '建设'      // 基础设施建设
  | '庆典'      // 节日庆典
  | '商贾'      // 商贾活动
  | '其他';     // 其他事件

// ============================================================================
// 治理效果评估
// ============================================================================

/**
 * 治理评估等级
 */
export type GovernanceGrade =
  | '暴政'      // 治理极差
  | '苛政'      // 治理较差
  | '平庸'      // 治理一般
  | '良政'      // 治理良好
  | '仁政'      // 治理优秀
  | '圣贤';     // 治理典范

/**
 * 治理评估结果
 */
export interface GovernanceEvaluation {
  等级: GovernanceGrade;        // 综合评估等级
  总分: number;                 // 综合评分 [0-100]
  各项评分: {
    民心评分: number;           // 民心评分
    治安评分: number;           // 治安评分
    繁荣评分: number;           // 繁荣评分
    财政评分: number;           // 财政评分
  };

  优势: string[];               // 治理优势
  劣势: string[];               // 治理劣势
  建议: string[];               // 改进建议

  评估时间: string;             // 评估时间（游戏时间）
}

// ============================================================================
// 税收系统
// ============================================================================

/**
 * 税收配置
 */
export interface TaxConfig {
  基础税率: number;             // 基础税率 [0.05-0.30]
  繁荣度加成: number;           // 繁荣度对税收的加成
  民心减免: number;             // 民心高低对税收的影响
  灾害减免: number;             // 灾害时期的税收减免

  // 税收计算公式：
  // 实际税收 = 人口 × 基础税率 × (1 + 繁荣度加成) × (1 - 民心减免) × (1 - 灾害减免)
}

/**
 * 税收记录
 */
export interface TaxRecord {
  月份: string;                 // 月份标识（如："开元1050年3月"）
  应收: number;                 // 应收税额
  实收: number;                 // 实际收到的税额
  免收: number;                 // 免税额
  欠收: number;                 // 欠收额（负数表示多收）
  收缴率: number;               // 收缴率 [0-1]
  备注?: string;                 // 备注信息
}

// ============================================================================
// 建设项目
// ============================================================================

/**
 * 建设项目类型
 */
export type ProjectType =
  | '道路'      // 道路建设
  | '水利'      // 水利设施
  | '学堂'      // 学堂建设
  | '医馆'      // 医馆建设
  | '城墙'      // 城墙修缮
  | '桥梁'      // 桥梁建设
  | '市场'      // 市场建设
  | '其他';     // 其他项目

/**
 * 建设项目状态
 */
export type ProjectStatus =
  | '规划'      // 规划中
  | '筹建'      // 筹备建设
  | '施工'      // 施工中
  | '完工'      // 已完工
  | '废弃';     // 已废弃

/**
 * 建设项目
 */
export interface ConstructionProject {
  id: string;                    // 项目ID
  名称: string;                  // 项目名称
  类型: ProjectType;            // 项目类型
  状态: ProjectStatus;          // 项目状态

  // 资源需求
  成本: {
    银两: number;               // 所需银两
    粮食: number;               // 所需粮食（可选）
    人力: number;               // 所需人力（可选）
  };

  // 建设进度
  进度: number;                 // 建设进度 [0-100]
  预计工期: number;             // 预计所需回合数
  已用工期: number;             // 已用工期数

  // 效果
  效果: {
    繁荣度加成?: number;         // 完成后繁荣度加成
    民心加成?: number;           // 完成后民心加成
    治安加成?: number;           // 完成后治安加成
    税收加成?: number;           // 完成后税收加成
  };

  描述: string;                  // 项目描述
  开工时间?: string;             // 开工时间
  完工时间?: string;             // 完工时间
}

// ============================================================================
// 导出类型集合
// ============================================================================

// ============================================================================
// 政务事务系统
// ============================================================================

/**
 * 政务事务类型
 */
export type GovernmentAffairType =
  | '突发'      // 突发事件，需要立即处理
  | '建设'      // 建设项目
  | '断案'      // 审理案件
  | '巡查';     // 巡察辖区

/**
 * 政务事务状态
 */
export type GovernmentAffairStatus =
  | '待处理'    // 待处理
  | '处理中'    // 正在处理
  | '已完成'    // 已完成
  | '已逾期';   // 已逾期

/**
 * 政务选项结果
 */
export interface GovernmentAffairOption {
  描述: string;                  // 选项描述
  消耗: {
    库银?: number;              // 消耗库银
    粮食?: number;              // 消耗粮食
    精力?: number;              // 消耗精力
  };
  结果: {
    民心?: number;              // 民心变化
    治安?: number;              // 治安变化
    繁荣?: number;              // 繁荣度变化
    库银?: number;              // 库银变化
  };
  剧情提示: string;              // 剧情提示文本
}

/**
 * 政务事务对象
 */
export interface GovernmentAffair {
  id: string;                    // 事务ID
  标题: string;                  // 事务标题
  类型: GovernmentAffairType;    // 事务类型
  耗时: number;                  // 耗时（单位：分钟）
  紧迫度: number;                // 紧迫度（0-10），逾期惩罚系数
  状态?: GovernmentAffairStatus; // 事务状态
  选项: GovernmentAffairOption[]; // 可选选项
  生成时间?: string;             // 生成时间（游戏时间）
  截止时间?: string;             // 截止时间（游戏时间）
  描述?: string;                 // 详细描述
}

/**
 * 政务队列（正在进行的事务列表）
 */
export interface GovernmentAffairQueue {
  当前事务: GovernmentAffair[];   // 当前处理中的事务
  待处理事务: GovernmentAffair[]; // 待处理的事务
  已完成事务: GovernmentAffair[]; // 已完成的事务
  历史记录: GovernmentAffair[];   // 历史事务记录
}

// ============================================================================
// 长期建设项目
// ============================================================================

/**
 * 建设项目（长期项目）
 * 用于"正在进行"的政务队列
 */
export interface OngoingConstructionProject extends ConstructionProject {
  开始时间: string;              // 开始时间（游戏时间）
  预计完成时间: string;          // 预计完成时间（游戏时间）
  当前阶段: {
    阶段名称: string;            // 当前阶段名称
    进度: number;                // 当前阶段进度（0-100）
  };
  资源消耗: {
    已消耗银两: number;          // 已消耗银两
    已消耗粮食: number;          // 已消耗粮食
    已消耗人力: number;          // 已消耗人力
  };
  派遣人员?: string[];           // 派遣的人员名单
}

/**
 * 建设项目队列
 */
export interface ConstructionProjectQueue {
  进行中: OngoingConstructionProject[];  // 进行中的项目
  规划中: ConstructionProject[];         // 规划中的项目
  已完成: ConstructionProject[];         // 已完成的项目
}

export type {
  // 核心类型
  JurisdictionStats,
  JurisdictionEvent,
  GovernanceEvaluation,
  TaxConfig,
  TaxRecord,
  ConstructionProject,
  OngoingConstructionProject,

  // 政务系统
  GovernmentAffair,
  GovernmentAffairQueue,
  ConstructionProjectQueue,

  // 类型枚举
  JurisdictionLevel,
  SecurityLevel,
  PublicTrustLevel,
  GovernanceGrade,
  JurisdictionEventType,
  ProjectType,
  ProjectStatus,
  GovernmentAffairType,
  GovernmentAffairStatus,
};
