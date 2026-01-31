/**
 * @fileoverview 县治状态类型定义
 *
 * 【术语映射说明】
 * 旧术语（修仙主题）      ->  新术语（县令主题）
 * ------------------------------------------------
 * SpiritStone            ->  Silver/Treasury (库银)
 * Population (灵气浓度)  ->  Population (人口)
 * Sect Resources         ->  County Resources (县治资源)
 * Territory              ->  Jurisdiction (辖区)
 *
 * 【设计理念】
 * - 县治是县令治理的行政区域
 * - 多维度指标反映治理状况
 * - 各指标相互关联，动态平衡
 * - 通过事件和决策影响县治发展
 */

import type { ValuePair, AIMetadata } from './game';

// ============================================================================
// 核心类型定义
// ============================================================================

/**
 * 县治状态数据结构
 *
 * 县治是县令治理的基本行政单位，相当于县
 */
export interface CountyState extends AIMetadata {
  // === 基础信息 ===
  id: string;                    // 县治唯一标识
  名称: string;                  // 县治名称（如："清河县"）
  别名?: string;                 // 别称（如："鱼米之乡"）
  所属府州: string;              // 所属府州（如："苏州府"）
  地理位置: LocationInfo;        // 地理位置信息

  // === 人口统计 ===
  人口: PopulationStats;         // 人口统计

  // === 核心治理指标 [0-100] ===
  民心: ValuePair<number>;       // 民心支持度
  治安: ValuePair<number>;       // 治安状况
  繁荣度: ValuePair<number>;     // 经济繁荣度
  教化: ValuePair<number>;       // 教化程度

  // === 财政资源 ===
  库银: Treasury;                // 库银财政
  税率: TaxRate;                 // 税率配置

  // === 基础设施 ===
  基础设施: Infrastructure;      // 基础设施状况

  // === 特产资源 ===
  特产: Specialty[];             // 特产资源

  // === 事件系统 ===
  待处理事件: CountyEvent[];     // 待处理事件
  事件历史: CountyEvent[];       // 历史事件记录

  // === 发展趋势 ===
  发展趋势: DevelopmentTrend;    // 发展趋势数据

  // === 治理评价 ===
  治理评级: GovernanceRating;    // 治理评级

  // === 时间戳 ===
  创建时间: string;               // 创建时间（现实时间）
  更新时间: string;               // 最后更新时间

  // === 扩展字段 ===
  扩展?: {
    [key: string]: any;
  };
}

/**
 * 地理位置信息
 */
export interface LocationInfo {
  区域: string;                  // 所在区域（如："江南"）
  地形: TerrainType;             // 地形类型
  气候: ClimateType;             // 气候类型
  交通: TrafficLevel;            // 交通便利度
  描述?: string;                 // 地理描述
}

/**
 * 地形类型
 */
export type TerrainType =
  | '平原'        // 平原地形
  | '丘陵'        // 丘陵地形
  | '山地'        // 山地地形
  | '盆地'        // 盆地地形
  | '河谷'        // 河谷地形
  | '沿海'        // 沿海地形
  | '岛屿';       // 岛屿地形

/**
 * 气候类型
 */
export type ClimateType =
  | '温带'        // 温带气候
  | '亚热带'      // 亚热带气候
  | '热带'        // 热带气候
  | '寒温带'      // 寒温带气候
  | '高原'        // 高原气候
  | '季风'        // 季风气候;

/**
 * 交通便利度
 */
export type TrafficLevel =
  | '闭塞'        // 交通闭塞
  | '不便'        // 交通不便
  | '一般'        // 交通一般
  | '便利'        // 交通便利
  | '枢纽';       // 交通枢纽

// ============================================================================
// 人口统计
// ============================================================================

/**
 * 人口统计
 */
export interface PopulationStats {
  总人口: number;                // 总人口数
  户数: number;                  // 总户数
  构成: PopulationComposition;   // 人口构成
  密度: PopulationDensity;       // 人口密度
  增长率: number;                // 人口增长率 [%]
}

/**
 * 人口构成
 */
export interface PopulationComposition {
  男丁: number;                  // 成年男性
  妇女: number;                  // 成年女性
  老人: number;                  // 老人（60岁以上）
  儿童: number;                  // 儿童（14岁以下）
  士子: number;                  // 读书人
  商贾: number;                  // 商人
  农夫: number;                  // 农民
  工匠: number;                  // 手工业者
}

/**
 * 人口密度
 */
export type PopulationDensity =
  | '稀疏'        // 人口稀疏
  | '适中'        // 人口适中
  | '稠密'        // 人口稠密
  | '拥挤';       // 人口拥挤

// ============================================================================
// 财政系统
// ============================================================================

/**
 * 库银财政
 */
export interface Treasury {
  现有库银: number;              // 现有库银（两）
  月收入: number;                // 月收入（两）
  月支出: number;                // 月支出（两）
  历史收支: TreasuryRecord[];    // 历史收支记录

  // 储备物资
  粮食储备: number;              // 粮食储备（石）
  铁器储备: number;              // 铁器储备（件）
  药材储备: number;              // 药材储备（斤）
}

/**
 * 财政记录
 */
export interface TreasuryRecord {
  月份: string;                  // 月份标识
  收入: number;                  // 收入
  支出: number;                  // 支出
  结余: number;                  // 结余
  备注?: string;                 // 备注信息
}

/**
 * 税率配置
 */
export interface TaxRate {
  田赋税率: number;              // 田赋税率 [0.05-0.50]
  商税税率: number;              // 商税税率 [0.05-0.30]
  关税税率: number;              // 关税税率 [0.05-0.20]

  // 减免政策
  灾害减免: number;              // 灾害减免比例 [0-1]
  贫困减免: number;              // 贫困减免比例 [0-1]

  // 上次调整时间
  上次调整?: string;             // 上次调整时间
}

// ============================================================================
// 基础设施
// ============================================================================

/**
 * 基础设施状况
 */
export interface Infrastructure {
  城墙: InfrastructureLevel;     // 城墙状况
  县衙: InfrastructureLevel;     // 县衙状况
  道路: InfrastructureLevel;     // 道路状况
  水利: InfrastructureLevel;     // 水利设施
  学堂: InfrastructureLevel;     // 学堂数量
  医馆: InfrastructureLevel;     // 医馆数量
  市场: InfrastructureLevel;     // 市场规模

  // 特殊设施
  特殊设施?: SpecialFacility[];  // 特殊设施列表
}

/**
 * 基础设施等级
 */
export type InfrastructureLevel =
  | '破败'        // 破败不堪
  | '简陋'        // 设施简陋
  | '普通'        // 设施普通
  | '完善'        // 设施完善
  | '精良'        // 设施精良
  | '宏伟';       // 宏伟壮观

/**
 * 特殊设施
 */
export interface SpecialFacility {
  名称: string;                  // 设施名称
  类型: FacilityType;            // 设施类型
  等级: InfrastructureLevel;     // 设施等级
  描述: string;                  // 设施描述
  效果: string[];                // 设施效果
}

/**
 * 设施类型
 */
export type FacilityType =
  | '书院'        // 书院
  | '寺庙'        // 寺庙
  | '道观'        // 道观
  | '驿站'        // 驿站
  | '仓库'        // 仓库
  | '码头'        // 码头
  | '桥梁'        // 桥梁
  | '其他';       // 其他设施

// ============================================================================
// 特产资源
// ============================================================================

/**
 * 特产资源
 */
export interface Specialty {
  名称: string;                  // 特产名称
  类型: SpecialtyType;           // 特产类型
  品质: SpecialtyQuality;        // 特产品质
  产量: number;                  // 年产量
  价值: number;                  // 市场价值
  描述: string;                  // 特产描述
}

/**
 * 特产类型
 */
export type SpecialtyType =
  | '粮食'        // 粮食作物
  | '果蔬'        // 果蔬产品
  | '丝绸'        // 丝绸制品
  | '茶叶'        // 茶叶
  | '瓷器'        // 瓷器
  | '药材'        // 药材
  | '矿产'        // 矿产
  | '水产'        // 水产品
  | '工艺品'      // 工艺品
  | '其他';       // 其他特产

/**
 * 特产品质
 */
export type SpecialtyQuality =
  | '普通'        // 普通品质
  | '优良'        // 优良品质
  | '精品'        // 精品品质
  | '珍品'        // 珍贵品质
  | '绝品';       // 绝世品质

// ============================================================================
// 事件系统
// ============================================================================

/**
 * 县治事件
 */
export interface CountyEvent {
  id: string;                    // 事件唯一标识
  时间: string;                  // 发生时间（游戏时间）
  类型: CountyEventType;        // 事件类型
  名称: string;                  // 事件名称
  描述: string;                  // 事件描述
  严重程度: EventSeverity;       // 事件严重程度
  影响: EventImpact;             // 事件影响
  是否已处理: boolean;           // 是否已处理
  处理结果?: string;             // 处理结果描述
  处理时间?: string;             // 处理时间
}

/**
 * 县治事件类型
 */
export type CountyEventType =
  | '天灾'        // 自然灾害（旱灾、水灾等）
  | '盗匪'        // 盗匪侵扰
  | '疫病'        // 疾病爆发
  | '民变'        // 民众暴动
  | '商贾'        // 商贾活动
  | '庆典'        // 节日庆典
  | '建设'        // 基础设施建设
  | '赋税'        // 赋税相关
  | '其他';       // 其他事件

/**
 * 事件严重程度
 */
export type EventSeverity =
  | '轻微'        // 轻微影响
  | '一般'        // 一般影响
  | '严重'        // 严重影响
  | '危急';       // 危急情况

/**
 * 事件影响
 */
export interface EventImpact {
  民心变化?: number;             // 民心变化
  治安变化?: number;             // 治安变化
  繁荣变化?: number;             // 繁荣变化
  教化变化?: number;             // 教化变化
  库银变化?: number;             // 库银变化
  人口变化?: number;             // 人口变化
}

// ============================================================================
// 发展趋势
// ============================================================================

/**
 * 发展趋势
 */
export interface DevelopmentTrend {
  民心趋势: TrendData;           // 民心趋势
  治安趋势: TrendData;           // 治安趋势
  繁荣趋势: TrendData;           // 繁荣趋势
  教化趋势: TrendData;           // 教化趋势
  库银趋势: TrendData;           // 库银趋势
}

/**
 * 趋势数据
 */
export interface TrendData {
  当前值: number;                // 当前值
  历史值: number[];              // 历史10个时间点的值
  趋势: TrendDirection;          // 趋势方向
  变化率: number;                // 变化率 [%]
}

/**
 * 趋势方向
 */
export type TrendDirection =
  | '上升'        // 持续上升
  | '稳定'        // 保持稳定
  | '下降'        // 持续下降
  | '波动';       // 波动不定

// ============================================================================
// 治理评级
// ============================================================================

/**
 * 治理评级
 */
export interface GovernanceRating {
  综合等级: RatingLevel;         // 综合等级
  总分: number;                  // 总分 [0-100]
  分项评分: RatingDetails;       // 分项评分
  评价时间: string;              // 评价时间
}

/**
 * 评级等级
 */
export type RatingLevel =
  | '暴政'        // 治理极差
  | '苛政'        // 治理较差
  | '平庸'        // 治理一般
  | '良政'        // 治理良好
  | '仁政'        // 治理优秀
  | '圣贤';       // 治理典范

/**
 * 分项评分
 */
export interface RatingDetails {
  民心评分: number;              // 民心评分
  治安评分: number;              // 治安评分
  繁荣评分: number;              // 繁荣评分
  教化评分: number;              // 教化评分
  财政评分: number;              // 财政评分
}
