// src/types/game.d.ts

/**
 * @fileoverview
 * 县令模拟器 - 游戏核心数据结构天规
 * 此文件定义了整个游戏存档、角色、NPC等核心数据的TypeScript类型。
 * 所有数据结构均基于县令模拟器主题设定。
 *
 * 术语对照说明:
 * - 修炼/修炼功法 -> 施政/治国方略
 * - 境界 -> 官品/职位
 * - 灵石 -> 银两/资金
 * - 宗门 -> 衙门/官府
 * - 掌门 -> 县令/长官
 * - 弟子 -> 下属/官员
 * - 灵气 -> 民心/威望
 * - 气血 -> 健康/体力
 * - 神识 -> 智慧/洞察
 * - 寿元 -> 任期/寿命
 * - 功德 -> 政绩/功绩
 */

import type { QualityType, GradeType } from '@/data/itemQuality';
import type { World, TalentTier, Origin, SpiritRoot, Talent } from './index';
export type { WorldMapConfig } from './worldMap';

// --- AI 元数据通用接口 ---
// 注意：存档落盘结构不允许出现 `_AI说明/_AI修改规则/_AI重要提醒` 等字段；
// 这些提示仅允许存在于提示词/代码内部，不进入 SaveData。
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AIMetadata {}

// --- 系统与规则（可嵌入提示与限制） ---
export interface AttributeLimitConfig {
  先天六司?: {
    每项上限: number; // 六项单项最大值（默认10）
  };
}

export interface SystemConfig extends AIMetadata {
  初始年龄?: number; // 开局年龄，用于自动计算寿命
  开局时间?: GameTime; // 开局游戏时间，用于自动计算寿命
  规则?: {
    属性上限?: AttributeLimitConfig;
    装备系统?: string;
    品质控制?: string;
  };
  提示?: string | string[]; // 可放置给AI的约束提示，随存档一并注入
  nsfwMode?: boolean; // 是否开启NSFW模式
  nsfwGenderFilter?: 'all' | 'male' | 'female'; // NSFW性别过滤
  isTavernEnv?: boolean; // 是否为酒馆环境（用于判断是否需要生成法身数据）
}

// --- 状态变更日志接口 ---
export type StateChange = {
  key: string;
  action: string;
  oldValue: unknown;
  newValue: unknown;
};

export interface StateChangeLog {
  before?: any;
  after?: any;
  changes: StateChange[];
  timestamp?: string;
}

// --- 记忆条目接口 ---
export interface MemoryEntry {
  id: string;
  content: string;
  timestamp: Date;
  importance: number; // 1-10
  tags: string[];
  type: 'user_action' | 'ai_response' | 'system_event' | 'summary' | 'short' | 'mid' | 'long';
  hidden?: boolean; // 是否为隐藏记忆
  convertedFrom?: 'short' | 'mid' | 'long'; // 转换来源
  category: 'combat' | 'social' | 'cultivation' | 'exploration' | 'other';
  metadata?: {
    location?: string;
    npcs?: string[];
    items?: string[];
    skills?: string[];
  };
}

// --- 处理响应接口 ---
export interface ProcessedResponse {
  content: string;
  metadata: {
    confidence: number;
    reasoning: string[];
    memoryUpdates: MemoryEntry[];
    suggestedActions: string[];
    memoryStats?: {
      shortTermCount: number;
      midTermCount: number;
      longTermCount: number;
      hiddenMidTermCount: number;
      lastConversion?: Date;
    };
  };
}

// --- 天道系统相关类型 ---
export interface HeavenlyCalculation {
  天道值: number;
  修正因子: number;
  基础计算: any;
  [key: string]: any;
}

// 简化的核心属性类型（仅用于天道系统内部计算）
export interface CoreAttributes {
  攻击力: number;
  防御力: number;
  灵识: number;
  敏捷: number;
  气运: number;
  境界加成: number;
}

// 简化的死亡状态类型（仅用于天道系统内部判定）
export interface DeathState {
  已死亡: boolean;
  死亡时间?: string;
  死亡原因?: string;
}

// 简化的天道系统类型（仅用于内部计算，不存储到 PlayerStatus）
export interface HeavenlySystem {
  版本: string;
  角色名称: string;
  境界等级: number;
  核心属性: CoreAttributes;
  死亡状态: DeathState;
  更新时间: string;
}

// --- 基础与通用类型 ---

export interface Vector2 {
  X: number;
  Y: number;
}

export interface ValuePair<T> {
  当前: T;
  上限: T;
}

/** 英文字段名的ValuePair（用于vitals字段） */
export interface EnglishValuePair<T> {
  current: T;
  max: T;
}

/** 物品品质信息 - 新版本 */

export interface ItemQuality {
  quality: QualityType; // 品质等级：皇、宫、府、州、县、乡、民
  grade: GradeType; // 品级：0-10
}


// --- 先天六司 ---

export interface InnateAttributes {
  根骨: number;
  灵性: number;
  悟性: number;
  气运: number;
  魅力: number;
  心性: number;
}

/** 英文键名的先天六司，用于组件传参 */

export interface InnateAttributesEnglish {
  root_bone: number;
  spirituality: number;
  comprehension: number;
  fortune: number;
  charm: number;
  temperament: number;
}

export type AttributeKey = keyof InnateAttributesEnglish;

// --- 物品与背包 ---

/** 装备增幅或功法属性加成 */
export interface AttributeBonus {
  气血上限?: number;
  灵气上限?: number;
  神识上限?: number;
  后天六司?: Partial<InnateAttributes>;
  [key: string]: any; // 允许其他动态属性
}

/** 功法技能（背包中功法物品的技能数组） */
export interface TechniqueSkill {
  技能名称: string;
  技能描述: string;
  消耗?: string;
  熟练度要求?: number; // 达到此修炼进度后解锁（0-100百分比）
  [key: string]: any; // 允许其他动态属性
}

/** 功法效果 */
export interface TechniqueEffects {
  修炼速度加成?: number;
  属性加成?: Partial<InnateAttributes & { [key: string]: number }>;
  特殊能力?: string[];
}

// ============================================================================
// 物品类型系统（县令主题：主要类型）
// ============================================================================

/**
 * 物品类型（县令主题：主要类型）
 * 定义游戏中所有物品的分类
 *
 * - 装备：武器、防具、饰品等可装备物品
 * - 方略：治国方略、政策措施（县令主题，替代"功法"）
 * - 药品：丹药、草药等医疗用品（县令主题）
 * - 材料：炼制材料、资源
 * - 其他：杂物
 *
 * @example
 * const itemType: ItemType = '方略';
 */
export type ItemType =
  | '装备'    // 装备类物品
  | '方略'    // 治国方略（县令主题：主要）
  | '药品'    // 药品（县令主题：主要）
  | '材料'    // 材料
  | '其他';   // 其他物品

/**
 * 修仙物品类型常量（向后兼容）
 *
 * @deprecated 使用 '方略' 替代
 */
export declare const ITEM_TYPE_GONGFA: '功法';

/**
 * 修仙丹药类型常量（向后兼容）
 *
 * @deprecated 使用 '药品' 替代
 */
export declare const ITEM_TYPE_DANYAO: '丹药';

/**
 * 扩展物品类型（包含旧值，仅用于数据修复层）
 *
 * @deprecated 使用 ItemType 替代。此类型仅用于兼容旧存档数据。
 */
export type LegacyItemType = ItemType | '功法' | '丹药';

/** 基础物品接口（县令主题：主要类型） */
export interface BaseItem {
  物品ID: string;
  名称: string;
  类型: ItemType;
  品质: ItemQuality;
  数量: number;
  已装备?: boolean; // true表示装备中/修炼中，false表示未装备
  描述: string;
  可叠加?: boolean;
}

/**
 * 旧版基础物品接口（向后兼容，支持旧物品类型）
 *
 * @deprecated 使用 BaseItem 替代。此接口仅用于兼容旧存档数据。
 */
export interface LegacyBaseItem {
  物品ID: string;
  名称: string;
  类型: LegacyItemType; // 支持旧的 '功法' 和 '丹药' 类型
  品质: ItemQuality;
  数量: number;
  已装备?: boolean;
  描述: string;
  可叠加?: boolean;
}

/** 装备类型物品 */
export interface EquipmentItem extends BaseItem {
  类型: '装备';
  装备增幅?: AttributeBonus;
  特殊效果?: string | AttributeBonus;
}

/** 功法类型物品（修仙主题：向后兼容） */
export interface TechniqueItem extends LegacyBaseItem {
  类型: '功法';
  功法效果?: TechniqueEffects;
  功法技能?: TechniqueSkill[]; // ✅ 改为数组格式
  修炼进度?: number; // 0-100 百分比
  修炼中?: boolean; // 是否正在修炼（兼容旧代码）
  施政进度?: number; // 0-100 百分比（县令主题，与修炼进度同义）
  施政中?: boolean; // 是否正在施政（县令主题，与修炼中同义）
  已解锁技能?: string[]; // ✅ 已解锁的技能名称列表
  // 注意：新代码应使用 已装备 字段，修炼中/施政中 仅为向后兼容
}

/** 治国方略类型物品（县令主题：主要类型） */
export interface StrategyItem extends BaseItem {
  类型: '方略';
  方略效果?: TechniqueEffects;
  方略技能?: TechniqueSkill[];
  施政进度?: number; // 0-100 百分比
  施政中?: boolean;
  已解锁技能?: string[];
}

/** 消耗品/材料类型物品（修仙主题：向后兼容） */
export interface ConsumableItem extends LegacyBaseItem {
  类型: '丹药' | '材料' | '其他';
  使用效果?: string;
}

/** 消耗品/材料类型物品（县令主题：主要类型） */
export interface MedicineItem extends BaseItem {
  类型: '药品' | '材料' | '其他';
  使用效果?: string;
}

/**
 * 物品的联合类型（包含向后兼容的旧物品类型）
 *
 * @deprecated 如果不需要支持旧存档，使用 NewItem 替代
 */
export type Item = EquipmentItem | TechniqueItem | StrategyItem | ConsumableItem | MedicineItem;

/**
 * 物品的新联合类型（县令主题：不含旧功法/丹药类型）
 *
 * 新代码应使用此类型，不包含 TechniqueItem 和 ConsumableItem
 */
export type NewItem = EquipmentItem | StrategyItem | MedicineItem;


/** 修炼功法引用（只存储引用，不存储完整数据） */
export interface CultivationTechniqueReference {
  物品ID: string;    // 引用背包中的功法ID
  名称: string;      // 功法名称（用于快速显示）
}

/** 施政方略引用（只存储引用，不存储完整数据） - 县令主题 */
export interface AdministrationStrategyReference {
  物品ID: string;    // 引用背包中的方略ID
  名称: string;      // 方略名称（用于快速显示）
}

/** 掌握的技能（技能数据+进度合并） */
export interface MasteredSkill {
  技能名称: string;
  技能描述: string;
  来源: string; // 来源功法名称
  消耗?: string; // 消耗说明

  // 进度数据（与技能数据合并）
  熟练度: number; // 技能熟练度
  使用次数: number; // 使用次数统计
}

// ============================================================================
// 货币系统（县令主题：主要类型）
// ============================================================================

/**
 * 银两品级（县令主题）
 */
export type SilverGrade = '下品' | '中品' | '上品' | '极品';

/**
 * 银两存储（县令主题：主要字段）
 */
export interface SilverStorage {
  下品: number;
  中品: number;
  上品: number;
  极品: number;
}

/**
 * 灵石存储（修仙主题：向后兼容字段）
 *
 * @deprecated 使用 SilverStorage 替代
 */
export type SpiritStoneStorage = SilverStorage;

export interface Inventory extends AIMetadata {
  // 县令主题：主要货币字段
  银两: SilverStorage;

  // 修仙主题：向后兼容字段
  /** @deprecated 使用 银两 替代 */
  灵石?: SpiritStoneStorage;

  /**
   * 新货币系统（可选，兼容旧存档）
   * - key = 币种ID（建议：无点号`.`，例如：铜钱 / 银两 / 金锭）
   * - value = 币种结构体（包含价值度/数量/描述等）
   */
  货币?: Record<string, CurrencyAsset>;
  货币设置?: CurrencySettings;
  物品: Record<string, Item>; // 物品现在是对象结构，key为物品ID，value为Item对象
}

export interface CurrencyAsset extends AIMetadata {
  币种: string; // 币种ID（建议与 key 一致）
  名称: string; // 展示名称
  数量: number; // 余额（整数为主，允许小数但建议避免）
  价值度: number; // 相对"基准币种"的价值（默认以 1 下品银两为 1）
  描述?: string;
  图标?: string; // lucide 图标名，如：Gem / Coins / HandCoins / BadgeDollarSign
}

export interface CurrencySettings extends AIMetadata {
  禁用币种: string[]; // 用户删除过的币种ID（避免数据修复再次自动补回）
  基准币种?: string; // 默认：铜钱
}

/** 功法中的技能信息 */
export interface SkillInfo {
  name: string;
  description: string;
  type: string; // 简化：统一为字符串类型
  unlockCondition: string;
  unlocked: boolean;
}

// ============================================================================
// 衙门/宗门类型系统（县令主题：主要类型）
// ============================================================================

/**
 * 衙门类型（县令主题：主要类型）
 * 表示县令模拟器中的各类衙门和势力组织
 *
 * @example
 * const officeType: GovernmentOfficeType = '清流衙门';
 */
export type GovernmentOfficeType =
  | '正统衙门'   // 正统官方衙门，严格遵守朝廷法度
  | '清流衙门'   // 清流衙门，注重名声和操守
  | '贪腐衙门'   // 贪腐衙门，以利益为重
  | '中立衙门'   // 中立衙门，不偏不倚
  | '商会'       // 商会组织
  | '世家'       // 地方世家势力
  | '散修联盟';  // 散修联盟

/**
 * 宗门类型（修仙主题：向后兼容别名）
 *
 * @deprecated 使用 GovernmentOfficeType 替代。此别名仅用于向后兼容旧代码和旧存档。
 */
export type SectType = GovernmentOfficeType;

/**
 * 修仙宗门类型（仅用于数据迁移时的类型检查）
 *
 * @deprecated 使用 GovernmentOfficeType 替代
 */
export type CultivationSectType = '正道宗门' | '魔道宗门' | '中立宗门';

// ============================================================================
// 职位系统（县令主题：主要类型）
// ============================================================================

/**
 * 衙门职位（县令主题：主要类型）
 * 表示县令模拟器中的各类官职
 *
 * @example
 * const position: GovernmentPosition = '县令';
 */
export type GovernmentPosition =
  | '散修'        // 无官职在身
  | '外门吏员'    // 基层吏员
  | '内门吏员'    // 中层吏员
  | '核心吏员'    // 核心吏员
  | '县令'        // 一县之长
  | '副县令'      // 副县令
  | '师爷'        // 幕僚师爷
  | '书吏'        // 书吏
  | '衙役';       // 衙役

/**
 * 宗门职位（修仙主题：向后兼容别名）
 *
 * @deprecated 使用 GovernmentPosition 替代。此别名仅用于向后兼容旧代码和旧存档。
 */
export type SectPosition = GovernmentPosition |
  '外门弟子' | '内门弟子' | '核心弟子' | '传承弟子' |
  '执事' | '长老' | '太上长老' | '副掌门' | '掌门' |
  '副宗主' | '宗主';

/**
 * 修仙宗门职位（仅用于数据迁移时的类型检查）
 *
 * @deprecated 使用 GovernmentPosition 替代
 */
export type CultivationSectPosition =
  | '外门弟子' | '内门弟子' | '核心弟子' | '传承弟子'
  | '执事' | '长老' | '太上长老' | '副掌门' | '掌门'
  | '副宗主' | '宗主';

// ============================================================================
// 官品/境界系统（县令主题：主要类型）
// ============================================================================

/**
 * 官品等级（县令主题：主要类型）
 * 官品从九品到一品，共九个等级。九品最低，一品最高。
 *
 * @example
 * const rank: RankLevel = '七品';
 */
export type RankLevel =
  | '九品' | '八品' | '七品' | '六品'
  | '五品' | '四品' | '三品' | '二品' | '一品';

/**
 * 境界等级（修仙主题：向后兼容别名）
 *
 * @deprecated 使用 RankLevel 替代。此别名仅用于向后兼容旧代码和旧存档。
 */
export type RealmLevel = RankLevel;

/**
 * 修仙境界等级（仅用于数据迁移时的类型检查）
 *
 * @deprecated 使用 RankLevel 替代
 */
export type CultivationRealmLevel = '练气' | '筑基' | '金丹' | '元婴' | '化神' | '炼虚' | '合体' | '渡劫';

// ============================================================================
// 关系类型（县令/修仙通用）
// ============================================================================

/** 衙门关系/宗门关系（县令主题：衙门关系；修仙主题：宗门关系） */
export type SectRelationship = '仇敌' | '敌对' | '冷淡' | '中立' | '友好' | '盟友' | '附庸';

/** 衙门成员信息/宗门成员信息（县令主题：衙门成员信息；修仙主题：宗门成员信息） */
export interface SectMemberInfo {
  宗门名称: string;
  宗门类型: SectType;
  职位: SectPosition;
  贡献: number;
  关系: SectRelationship;
  声望: number;
  加入日期: string;
  描述?: string;
}

/** 衙门基础信息/宗门基础信息（县令主题：衙门基础信息；修仙主题：宗门基础信息） */
export interface SectInfo {
  名称: string; // 宗门名称
  类型: SectType; // 宗门类型
  等级: '一流' | '二流' | '三流' | '末流'; // 宗门等级
  位置?: string; // 总部位置
  描述: string; // 宗门描述
  特色: string[]; // 宗门特色
  成员数量: SectMemberCount; // 成员数量统计
  与玩家关系: SectRelationship; // 与玩家的关系
  声望: number; // 玩家在该宗门的声望
  可否加入: boolean; // 是否可以加入
  加入条件?: string[]; // 加入条件
  加入好处?: string[]; // 加入后的好处
  // 新增：宗门领导和实力展示
  领导层?: {
    宗主: string; // 宗主姓名
    宗主修为: string; // 如"元婴后期"
    副宗主?: string; // 副宗主姓名（如有）
    长老数量: number; // 长老总数
    最强修为: string; // 宗门内最强修为
  };
  // 新增：简化的势力范围信息
  势力范围?: {
    控制区域: string[]; // 控制的区域，如：["主城", "附属镇", "资源点"]
    影响范围: string; // 影响范围的简单描述，如："方圆百里"
    战略价值: number; // 战略价值 (1-10)
  };
}

/** 衙门成员数量统计/宗门成员数量统计 */
export interface SectMemberCount {
  总数?: number; // 总成员数
  total?: number; // 英文字段名兼容
  按境界?: Record<RealmLevel, number>; // 按境界统计
  byRealm?: Record<string, number>; // 英文字段名兼容
  按职位?: Record<SectPosition, number>; // 按职位统计
  byPosition?: Record<string, number>; // 英文字段名兼容
}

/** 衙门系统数据/宗门系统数据（县令主题：衙门系统数据；修仙主题：宗门系统数据） */
export interface SectSystemData extends AIMetadata {
  availableSects: SectInfo[]; // 可用的宗门列表
  sectRelationships: Record<string, number>; // 与各宗门的关系值
  sectHistory: string[]; // 宗门历史记录 (修复拼写错误)
}

/** 衙门系统迁移记录/宗门系统迁移记录 */
export interface SectMigrationRecord {
  来源版本: number;
  目标版本: number;
  时间: string;
  说明?: string;
}

/** 衙门系统数据 - V2 / 宗门系统数据 - V2 */
export interface SectSystemV2 extends AIMetadata {
  版本: number;
  当前宗门?: string | null;
  宗门档案: Record<string, WorldFaction>;
  宗门成员?: Record<string, string[]>;
  宗门藏经阁?: Record<string, any[]>;
  宗门贡献商店?: Record<string, any[]>;
  宗门任务?: Record<string, SectTaskItem[]>;
  宗门任务状态?: Record<string, SectTaskStatus>;
  迁移记录?: SectMigrationRecord;
  内容状态?: Record<string, SectContentStatus>; // 衙门/宗门内容初始化状态
  /** 衙门轻度经营/宗门轻度经营（县令主题：县令面板；修仙主题：宗主面板） */
  宗门经营?: Record<string, SectManagementState>;
  /** 衙门大战/宗门大战（分阶段推进） */
  宗门战争?: SectWarSystem;
}

/** 衙门内容初始化状态/宗门内容初始化状态 */
export interface SectContentStatus {
  藏经阁已初始化: boolean; // 衙门主题：藏书阁；修仙主题：藏经阁
  贡献商店已初始化: boolean;
  最后更新时间?: string;
  演变次数: number; // AI随机增加内容的次数
}

// --- 衙门经营/宗门经营 --- 衙门大战/宗门大战（扩展） ---

export interface SectManagementState extends AIMetadata {
  宗门名称: string; // 衙门名称/宗门名称
  战力?: number; // 0-100（默认与 档案.领导层.综合战力 同口径）
  安定?: number; // 0-100
  外门训练度?: number; // 0-100（用于战力与战损修正）
  府库?: {
    灵石?: number; // 县令主题：银两；修仙主题：灵石
    灵材?: number;
    丹药?: number;
    阵材?: number;
  };
  设施?: Record<string, number>; // 县令主题：衙门设施；修仙主题：练功房/藏经阁/炼丹房/护山大阵 -> level
  最近结算?: string; // ISO时间或游戏时间字符串
  月报?: Array<{
    时间: string;
    摘要: string;
    变化?: Record<string, number>;
  }>;
}

export type SectWarStatus = '备战' | '进行中' | '停战' | '胜利' | '失败';
export type SectWarStageName = '侦察' | '交锋' | '破阵' | '攻山' | '善后';

export interface SectWarSideState {
  宗门名称: string; // 衙门名称/宗门名称
  战力: number; // 0-100
  外门: number; // 外门吏员/外门弟子
  内门: number; // 内门吏员/内门弟子
  核心: number; // 核心吏员/核心弟子
  士气?: number; // 0-100
}

export interface SectWarReport {
  时间: string;
  阶段: SectWarStageName | string;
  摘要: string;
  我方变化?: Record<string, any>;
  敌方变化?: Record<string, any>;
}

export interface SectWarState extends AIMetadata {
  战争ID: string;
  状态: SectWarStatus;
  发起方: string;
  守方: string;
  目标?: string;
  阶段列表: string[];
  阶段索引: number; // 0-based
  当前阶段: SectWarStageName | string;
  我方: SectWarSideState;
  敌方: SectWarSideState;
  累计伤亡?: {
    我方?: Partial<Pick<SectWarSideState, '外门' | '内门' | '核心'>>;
    敌方?: Partial<Pick<SectWarSideState, '外门' | '内门' | '核心'>>;
  };
  战报?: SectWarReport[];
  上一次?: Record<string, any>; // 上一步结算的结构化结果（便于下次发给AI）
}

export interface SectWarSystem extends AIMetadata {
  当前?: SectWarState | null;
  历史?: SectWarState[];
}

/** 衙门藏书阁方略/宗门藏经阁功法 - 扩展版本 */
export interface SectLibraryTechniqueExtended {
  id: string;
  name: string;
  quality: string;
  qualityTier: string;
  cost: number;
  description: string;
  功法效果?: string;
  境界要求?: string;
  职位要求?: string; // 外门弟子/内门弟子/核心弟子等
  已被兑换?: boolean;
  剩余数量?: number;
}

/** 衙门贡献商店物品/宗门贡献商店物品 - 扩展版本 */
export interface SectShopItemExtended {
  id: string;
  name: string;
  icon: string;
  type: string;
  quality: string;
  description: string;
  cost: number;
  stock?: number;
  使用效果?: string;
  限购数量?: number;
  职位要求?: string;
  稀有度?: '普通' | '稀有' | '珍贵' | '极品';
}

export interface SectTaskItem {
  任务ID: string;
  任务名称: string;
  任务描述: string;
  任务类型: string;
  难度: string;
  贡献奖励: number;
  额外奖励?: string;
  状态: string;
  期限?: string;
  发布人?: string;
  要求?: string;
}

export interface SectTaskStatus {
  已初始化: boolean;
  最后更新时间?: string;
  演变次数: number;
}

// ============================================================================
// 衙门/宗门接口别名（县令主题别名）
// ============================================================================

/**
 * 衙门成员信息（县令主题别名）
 *
 * @deprecated 直接使用 SectMemberInfo 即可，Sect 本身是中性词
 */
export type GovernmentMemberInfo = SectMemberInfo;

/**
 * 衙门信息（县令主题别名）
 *
 * @deprecated 直接使用 SectInfo 即可，Sect 本身是中性词
 */
export type GovernmentInfo = SectInfo;

/**
 * 衙门系统数据（县令主题别名）
 *
 * @deprecated 直接使用 SectSystemData 即可，Sect 本身是中性词
 */
export type GovernmentSystemData = SectSystemData;

/**
 * 衙门系统V2（县令主题别名）
 *
 * @deprecated 直接使用 SectSystemV2 即可，Sect 本身是中性词
 */
export type GovernmentSystemV2 = SectSystemV2;

/**
 * 衙门内容状态（县令主题别名）
 *
 * @deprecated 直接使用 SectContentStatus 即可，Sect 本身是中性词
 */
export type GovernmentContentStatus = SectContentStatus;

/**
 * 衙门经营状态（县令主题别名）
 *
 * @deprecated 直接使用 SectManagementState 即可，Sect 本身是中性词
 */
export type GovernmentManagementState = SectManagementState;

// --- 三千大道系统 ---

/** 大道阶段定义 */
export interface DaoStage {
  名称: string;
  描述: string;
  突破经验: number;
}

/** 大道数据（大道定义+进度合并） */
export interface DaoData {
  道名: string;
  描述: string;
  阶段列表: DaoStage[]; // 大道的所有阶段定义

  // 进度数据（与大道数据合并）
  是否解锁: boolean;
  当前阶段: number; // 从1开始计数，1=入门，2=初窥...（数组索引=当前阶段-1）
  当前经验: number;
  总经验: number;
}

/** 三千大道系统数据 */
export interface ThousandDaoSystem extends AIMetadata {
  大道列表: Record<string, DaoData>; // 以大道名称为key，数据+进度合并
}

// --- 装备 ---

/** 装备槽类型 */
export interface EquipmentSlot {
  名称: string;
  物品ID: string;
  装备特效?: string[];
  装备增幅?: {
    气血上限?: number;
    灵气上限?: number;
    神识上限?: number;
    后天六司?: Partial<InnateAttributes>;
  };
  耐久度?: ValuePair<number>;
  品质?: ItemQuality;
}

export interface Equipment extends AIMetadata {
  装备1: string | null;
  装备2: string | null;
  装备3: string | null;
  装备4: string | null;
  装备5: string | null;
  装备6: string | null;
}

// --- 状态效果 ---

export type StatusEffectType = 'buff' | 'debuff'; // 统一小写

export interface StatusEffect {
  状态名称: string;
  类型: 'buff' | 'debuff';
  生成时间: {
    年: number;
    月: number;
    日: number;
    小时: number;
    分钟: number;
  };
  持续时间分钟: number;
  状态描述: string;
  强度?: number;
  来源?: string;
  时间?: string; // 可选：时间描述（如"3天"、"1个月"）
  剩余时间?: string; // 可选：剩余时间描述
}

// --- 角色实时状态 ---

/** 官品/境界（县令主题：官品；修仙主题：境界） */
export interface Realm {
  名称: string;        // 官品名称/境界名称，如"九品"、"练气"
  阶段: string;        // 官品阶段/境界阶段，如"初期"、"中期"、"后期"、"圆满"
  当前进度: number;    // 当前施政进度/当前修炼进度
  下一级所需: number;  // 晋升到下一阶段所需进度/突破到下一阶段所需进度
  突破描述: string;    // 晋升到下一阶段的描述/突破到下一阶段的描述
}
/** 官品子阶段类型/境界子阶段类型 */
export type RealmStage = '初期' | '中期' | '后期' | '圆满' | '极境';

/** 官品子阶段定义/境界子阶段定义 */
export interface RealmStageDefinition {
  stage: RealmStage;
  title: string;
  breakthrough_difficulty: '简单' | '普通' | '困难' | '极难' | '逆天';
  resource_multiplier: number; // 资源倍数（健康、民心、智慧）
  lifespan_bonus: number; // 寿命加成
  special_abilities: string[]; // 特殊能力
  can_cross_realm_battle?: boolean; // 是否可越阶战斗
}

/** 官品定义/境界定义 */
export interface RealmDefinition {
  level: number;
  name: string;
  title: string;
  coreFeature: string;
  lifespan: string;
  activityScope: string;
  gapDescription: string;
  stages?: RealmStageDefinition[]; // 官品子阶段/境界子阶段，凡人境界没有子阶段
}



export interface PlayerStatus extends AIMetadata {
  境界: Realm; // 县令主题：官品；修仙主题：境界。包含施政/修为进度（当前进度 = 施政当前/修为当前，下一级所需 = 施政最大/修为最大）
  // 县令主题：官品与境界同义（为兼容性保留字段）
  官品?: Realm; // 官品（县令主题，与境界同义）
  声望: number;
  政绩?: number; // 政绩/功绩（县令主题）
  位置: {
    描述: string;
    x?: number; // 经度坐标 (Longitude, 通常 100-115)
    y?: number; // 纬度坐标 (Latitude, 通常 25-35)
    灵气浓度?: number; // 县令主题：民心支持度；修仙主题：灵气浓度。1-100，影响施政/修炼速度
    民心支持度?: number; // 当前位置的民心支持度，1-100（县令主题）
  };
  气血: ValuePair<number>; // 健康/体力
  灵气: ValuePair<number>; // 县令主题：民心/威望；修仙主题：灵气
  神识: ValuePair<number>; // 县令主题：智慧/洞察；修仙主题：神识
  寿命: ValuePair<number>; // 任期/寿命
  状态效果?: StatusEffect[];
  宗门信息?: SectMemberInfo; // 县令主题：衙门信息；修仙主题：宗门信息
  事件系统?: EventSystem;
  // 注意: 玩家的NSFW数据存储在 SaveData.身体部位开发 中，不使用 PrivacyProfile
}

/**
 * 官品状态（县令主题别名）
 *
 * @deprecated 直接使用 Realm 即可
 */
export type Rank = Realm;

/**
 * 衙门信息（县令主题别名）
 *
 * @deprecated 直接使用 SectMemberInfo 即可，Sect 本身是中性词
 */
export type GovernmentOfficeMemberInfo = SectMemberInfo;

// --- MECE短路径：拆分"属性/位置/效果" ---
// 属性：动态数值（官品/境界、健康、民心/威望、智慧/洞察、任期/寿命、声望等）
// 县令主题：使用官品字段（可选）；修仙主题：使用境界字段
export type PlayerAttributes = Pick<PlayerStatus, '境界' | '官品' | '声望' | '气血' | '灵气' | '神识' | '寿命'>;
// 位置：空间信息（从 PlayerStatus.位置 提取）
export type PlayerLocation = PlayerStatus['位置'];

/** 用于UI组件显示的角色状态信息 */
export interface CharacterStatusForDisplay {
  name: string;
  realm: Realm;
  age: number; // 来自寿命的当前值
  hp: string;
  mana: string;
  spirit: string;
  lifespan: ValuePair<number>;
  声望: number;
  cultivation_exp: number;
  cultivation_exp_max: number;
  root_bone: number;
  spirituality: number;
  comprehension: number;
  fortune: number;
  charm: number;
  temperament: number;
}

// --- 世界数据类型定义 ---

/** 世界大陆信息 */
export interface WorldContinent {
  名称: string;
  name?: string; // 兼容英文名
  描述: string;
  地理特征?: string[];
  修真环境?: string;
  气候?: string;
  天然屏障?: string[];
  大洲边界?: { x: number; y: number }[];
  主要势力?: (string | number)[]; // 兼容id和名称
  factions?: (string | number)[]; // 兼容英文名
}

/** 世界势力信息 - 统一的宗门/势力数据结构 */
export interface WorldFaction {
  id?: string | number; // 增加可选的id字段
  名称: string;
  类型: '修仙宗门' | '魔道宗门' | '中立宗门' | '修仙世家' | '魔道势力' | '商会组织' | '散修联盟' | string;
  等级: '超级' | '一流' | '二流' | '三流' | string;
  所在大洲?: string; // 增加可选的所在大洲字段
  位置?: string | { x: number; y: number }; // 支持字符串描述或坐标
  势力范围?: string[] | { x: number; y: number }[]; // 支持字符串数组或坐标数组
  描述: string;
  特色: string | string[]; // 支持字符串或字符串数组
  与玩家关系?: '敌对' | '中立' | '友好' | '盟友' | string;
  声望值?: number;

  // 宗门系统扩展字段 - 只对宗门类型势力有效
  特色列表?: string[]; // 宗门特色列表，替代 特色 字符串

  // 宗门成员统计
  成员数量?: SectMemberCount;

  // 宗门领导层 - 新增必需字段
  领导层?: {
    宗主: string;
    宗主修为: string; // 如"化神中期"、"元婴后期"等
    副宗主?: string;
    圣女?: string;
    圣子?: string;
    太上长老?: string;
    太上长老修为?: string;
    长老数量?: number; // 宗门长老数量
    最强修为: string; // 宗门内最高修为境界
    综合战力?: number; // 1-100的综合战力评估
    核心弟子数?: number;
    内门弟子数?: number;
    外门弟子数?: number;
  };

  // 势力范围详情
  势力范围详情?: {
    控制区域?: string[]; // 替代 势力范围 字符串数组
    影响范围?: string;
    战略价值?: number; // 1-10
  };

  // 加入相关
  可否加入?: boolean;
  加入条件?: string[];
  加入好处?: string[];
}

/** 世界地点信息 */
export interface WorldLocation {
  名称: string;
  类型: '城池' | '宗门' | '秘境' | '险地' | '商会' | '坊市' | '洞府' | string;
  位置: string;
  coordinates?: { x: number; y: number }; // 原始坐标数据
  描述: string;
  特色: string;
  安全等级: '安全' | '较安全' | '危险' | '极危险' | string;
  开放状态: '开放' | '限制' | '封闭' | '未发现' | string;
  相关势力?: string[];
  特殊功能?: string[];
}

/** 世界生成信息 */
export interface WorldGenerationInfo {
  生成时间: string;
  世界背景: string;
  世界纪元: string;
  特殊设定: string[];
  版本: string;
}

/** 完整的世界信息数据结构 */
export interface WorldInfo {
  世界名称: string;
  大陆信息: WorldContinent[];
  continents?: WorldContinent[]; // 兼容旧数据
  势力信息: WorldFaction[];
  地点信息: WorldLocation[];
  地图配置?: WorldMapConfig; // 新增地图配置
  经济?: EconomyState; // 可选：经济/货币波动（用于动态汇率、地区差异）
  // 从 WorldGenerationInfo 扁平化
  生成时间: string;
  世界背景: string;
  世界纪元: string;
  特殊设定: string[];
  版本: string;
}

export interface EconomyState extends AIMetadata {
  /**
   * 全局货币波动系数（1=基准，建议范围 0.6~1.6）
   * key = 币种ID（如：灵石_下品 / 铜币）
   */
  货币波动?: Record<string, number>;
  /**
   * 地区货币波动（按 角色.位置.描述 作为 key，简单但直观）
   */
  地区波动?: Record<string, { 货币波动?: Record<string, number> }>;
  最后更新时间?: string;
}

// --- 事件系统 ---

/** 事件类型（可扩展） */
export type EventType =
  | '宗门大战'
  | '世界变革'
  | '异宝降世'
  | '秘境现世'
  | '人物风波'
  | '势力变动'
  | '天灾人祸'
  | string;

/** 事件记录 */
export interface GameEvent {
  事件ID: string;
  事件名称: string;
  事件类型: EventType;
  事件描述: string;
  影响等级?: '轻微' | '中等' | '重大' | '灾难' | string;
  影响范围?: string;
  相关人物?: string[];
  相关势力?: string[];
  事件来源: '随机' | '玩家影响' | '系统' | string;
  发生时间: GameTime;
}

/** 自定义事件模板 */
export interface CustomEventTemplate {
  id: string;
  名称: string;
  类型: EventType;
  描述模板: string; // 支持占位符如 {玩家名}、{位置}
  影响等级: '轻微' | '中等' | '重大' | '灾难';
  启用: boolean;
}

/** 事件系统配置 */
export interface EventSystemConfig {
  启用随机事件: boolean;
  最小间隔年: number;
  最大间隔年: number;
  事件提示词: string;
  // 事件类型开关
  启用事件类型?: {
    宗门大战?: boolean;
    世界变革?: boolean;
    异宝降世?: boolean;
    秘境现世?: boolean;
    人物风波?: boolean;
    势力变动?: boolean;
    天灾人祸?: boolean;
    特殊NPC?: boolean;
  };
  // 特殊NPC事件触发概率 (0-100)
  特殊NPC概率?: number;
  // 自定义事件模板
  自定义事件?: CustomEventTemplate[];
}

/** 事件系统（统一管理世界事件） */
export interface EventSystem {
  配置: EventSystemConfig;
  下次事件时间: GameTime | null;
  事件记录: GameEvent[];
}

// --- 世界地图 ---

// --- NPC 模块 ---

// TavernCommand is now imported from AIGameMaster.d.ts to avoid conflicts

/** 身体部位开发数据 */
export interface BodyPartDevelopment {
  部位名称: string; // 如：胸部、小穴、菊穴、嘴唇、耳朵等
  敏感度: number; // 0-100
  开发度: number; // 0-100（统一使用"开发度"，与AI提示词保持一致）
  特殊印记?: string; // 如：「已调教」「极度敏感」「可喷奶」、「合欢莲印」等
  特征描述: string; // 部位的详细描述，如："娇小粉嫩，轻触即颤"、"紧致温润，吸附感强"
  反应描述?: string; // 触发时的反应描述
  偏好刺激?: string; // 偏好的刺激方式
  禁忌?: string; // 不接受的刺激或触碰
}

/** 玩家身体部位开发数据 - 简化结构 */
export interface PlayerBodyPart {
  特征描述: string;
}

/** 玩家身体详细数据 (NSFW/Tavern Only) */
export interface BodyStats {
  // 基础体格
  身高: number; // cm
  体重: number; // kg
  体脂率?: number; // %

  // 三围数据
  三围: {
    胸围: number; // cm
    腰围: number; // cm
    臀围: number; // cm
  };
  
  // 性征描述
  胸部描述?: string; // 罩杯、形状等
  私处描述?: string; // 女性私处/特殊部位
  生殖器描述?: string; // 尺寸、形状、特征
  
  // 外观细节
  肤色?: string;
  发色?: string;
  瞳色?: string;
  纹身与印记?: string[];
  穿刺?: string[];
  
  // 敏感与开发
  敏感点?: string[];
  开发度?: Record<string, number>; // 部位 -> 0-100
  
  // 其他
  其它?: Record<string, any>;
}

/** 统一的私密信息模块 (NSFW) */
export interface FertilityStatus {
  是否可孕: boolean;
  当前状态: string; // 如：未怀孕/备孕/已怀孕/不具备
  妊娠月数?: number;
  预计分娩时间?: string;
  妊娠状态?: {
    是否怀孕: boolean;
    怀孕月数?: number;
    预计分娩时间?: string;
  };
}

export interface PrivacyProfile {
  是否为处女: boolean;
  身体部位: BodyPartDevelopment[];
  性格倾向: string;
  性取向: string;
  性癖好: string[];
  性渴望程度: number;
  当前性状态: string;
  体液分泌状态: string;
  性交总次数: number;
  性伴侣名单: string[];
  最近一次性行为时间: string;
  特殊体质: string[];
  性经验等级: string;
  亲密偏好: string[];
  亲密节奏: string;
  亲密需求: string;
  禁忌清单: string[];
  安全偏好: string;
  避孕措施: string;
  生育状态: FertilityStatus;
}

/** NPC核心档案 - 精简高效的数据结构 */
export interface NpcProfile {
  // === 核心身份 ===
  名字: string;
  性别: '男' | '女' | '其他';
  出生日期: { 年: number; 月: number; 日: number; 小时?: number; 分钟?: number }; // 出生日期（用于自动计算年龄）
  种族?: string; // 如：人族、妖族、魔族
  出生: string | { 名称?: string; 描述?: string }; // 出生背景，如："焚天林氏遗孤"（必填）
  外貌描述: string; // AI生成的外貌描述，必填
  性格特征: string[]; // 如：['冷静', '谨慎', '好色']

  // === 修炼属性 ===
  境界: Realm;
  官品?: Realm; // 县令主题字段（与境界保持同步）
  灵根: CharacterBaseInfo['灵根'];
  才能?: CharacterBaseInfo['灵根']; // 县令主题字段（与灵根保持同步）
  天赋: CharacterBaseInfo['天赋']; // 天赋列表
  先天六司: InnateAttributes; // NPC只有一个六司字段，不分先天/最终

  // === 核心数值（整合为属性对象）===
  属性: {
    气血: ValuePair<number>; // HP，生命值
    灵气: ValuePair<number>; // MP/真元，法力值
    神识: ValuePair<number>; // 精神力
    寿元上限: number; // 最大寿命（当前年龄由出生日期自动计算）
  };

  // === 社交关系 ===
  与玩家关系: string; // 如：道侣、师徒、朋友、敌人、陌生人
  好感度: number; // -100 到 100
  当前位置: {
    描述: string;
    x?: number; // 经度坐标 (Longitude, 通常 100-115)
    y?: number; // 纬度坐标 (Latitude, 通常 25-35)
    灵气浓度?: number; // 当前位置的灵气浓度，1-100
  };
  势力归属?: string;

  // === 人格系统 ===
  人格底线: string[] | string; // 如：['背叛信任', '伤害亲友', '公开侮辱', '强迫违背意愿']，触犯后好感度断崖式下跌

  // === 记忆系统 ===
  记忆: Array<{ 时间: string; 事件: string } | string>; // 兼容新旧格式：对象或纯字符串
  记忆总结?: string[];

  // === 实时状态（用 set 直接替换）===
  当前外貌状态: string; // 如："脸颊微红，眼神迷离" / "衣衫整洁，神态自然"
  当前内心想法: string; // 如："在思考什么..." / "对xxx感到好奇"

  // === 资产物品 ===
  背包: {
    灵石: { 下品: number; 中品: number; 上品: number; 极品: number };
    货币?: Record<string, CurrencyAsset>;
    货币设置?: CurrencySettings;
    物品: Record<string, Item>;
  };

  // === 可选模块 ===
  私密信息?: PrivacyProfile; // 仅NSFW模式下存在
  实时关注: boolean; // 标记为关注的NPC会在AI回合中主动更新

  // === 扩展字段（用于“特殊NPC/定制人物”等业务标记，不影响核心生成）===
  扩展?: {
    specialNpc?: boolean;
    specialNpcId?: string;
    specialNpcTags?: string[];
  };

  // === 旧数据兼容字段 ===
  外貌?: string;
  性格?: string;
}


// --- 记忆模块 ---

export interface Memory extends AIMetadata {
  短期记忆?: string[]; // 最近的对话、事件的完整记录
  中期记忆: string[]; // 对短期记忆的总结，关键信息点
  长期记忆: string[]; // 核心人设、世界观、重大事件的固化记忆
  隐式中期记忆?: string[]; // 隐式中期记忆数组，与短期记忆同步增长，溢出时转入真正的中期记忆
}

// --- 游戏时间 ---

export interface GameTime extends AIMetadata {
  年: number;
  月: number;
  日: number;
  小时: number;
  分钟: number;
}

// --- 存档数据核心 ---

export interface GameMessage {
  type: 'user' | 'ai' | 'system' | 'player' | 'gm';
  content: string;
  time: string;
  stateChanges?: StateChangeLog; // 状态变更记录
  actionOptions: string[]; // 行动选项（必填）
  metadata?: {
    commands?: any[];
  };
}

// 保持人物关系为严格的字典，键为NPC名称/ID，值为NpcProfile

export interface SaveData {
  [key: string]: any;
}


// --- 单个存档槽位 ---

export interface SaveSlot {
  id?: string;
  存档名: string;
  保存时间: string | null;
  最后保存时间?: string | null; // 新增：最后保存时间
  游戏内时间?: string;
  游戏时长?: number; // 游戏时长（秒）
  角色名字?: string; // 角色名字
  境界?: string; // 当前境界
  官品?: string; // 县令主题：官品
  政绩进度?: number; // 县令主题：政绩进度百分比
  位置?: string; // 当前位置
  修为进度?: number; // 修为进度
  世界地图?: WorldMap;
  存档数据?: SaveData | null;
}

// --- 角色基础信息 (静态) ---

export interface CharacterBaseInfo extends AIMetadata {
  名字: string;
  性别: '男' | '女' | '其他' | string;
  出生日期: { 年: number; 月: number; 日: number; 小时?: number; 分钟?: number }; // 出生日期（用于自动计算年龄）
  种族?: string; // 添加种族字段
  境界?: string; // NPC当前境界
  世界: World;
  天资: TalentTier;
  出生: Origin | string;
  灵根: SpiritRoot | string;
  天赋: Talent[];
  先天六司: InnateAttributes;
  后天六司: InnateAttributes; // 后天获得的六司加成（装备、大道等），开局默认全为0
  创建时间?: string; // 添加创建时间字段
  描述?: string; // 添加描述字段
}


// --- 角色档案 (动静合一) ---

export interface CharacterProfile {
  // 角色身份（静态信息，用于列表展示/导出）
  角色: CharacterBaseInfo;
  // 存档列表：纯单机模式，支持多个存档（"存档1", "存档2", ...）
  存档列表: Record<string, SaveSlot>;

  // 🔥 废弃字段：为了兼容旧数据，保留但标记为废弃
  /**
   * @deprecated 请使用存档列表，此字段仅用于兼容旧版本数据
   */
  存档?: SaveSlot;
}

// --- 动作队列系统 ---

/** 动作类型 */
export type QueueActionType =
  | 'item_use'      // 使用物品
  | 'item_equip'    // 装备物品
  | 'item_discard'  // 丢弃物品
  | 'item_practice' // 修炼功法
  | 'npc_interact'  // NPC互动
  | 'custom';       // 自定义动作

/** 动作撤回数据 */
export interface ActionUndoData {
  type: QueueActionType;
  itemId?: string;
  itemName?: string;
  quantity?: number;
  originalQuantity?: number;
  [key: string]: any; // 其他撤回需要的数据
}

/** 单个动作项 */
export interface QueueActionItem {
  id: string;
  text: string; // 显示给用户的文本
  type: QueueActionType;
  canUndo: boolean; // 是否可以撤回
  undoData?: ActionUndoData; // 撤回时需要的数据
  timestamp: number;
}

/** 动作队列 - 用于收集用户操作的文本描述 */
export interface ActionQueue {
  actions: QueueActionItem[]; // 动作列表
}

// --- 顶层本地存储结构 ---

export interface LocalStorageRoot {
  当前激活存档: {
    角色ID: string;
    存档槽位: string; // e.g., "存档1" for single player, or a default key for online
  } | null;
  角色列表: Record<string, CharacterProfile>; // 以角色唯一ID (char_1001) 为key
}

export type Continent = WorldContinent;
export type Location = WorldLocation;

// --- 修炼速度系统（修仙主题）/施政速度系统（县令主题）---

/** 修炼速度影响因子（修仙主题） */
export interface CultivationSpeedFactors {
  灵气浓度系数: number;    // 0.1 - 2.0，基于位置灵气浓度(1-100)
  先天六司系数: number;    // 0.5 - 2.0，基于先天六司综合值
  后天六司系数: number;    // 0.0 - 0.6，基于后天六司综合值（额外加成）
  状态效果系数: number;    // 0.5 - 2.0，基于buff/debuff
  功法加成系数: number;    // 0.0 - 1.0，基于当前修炼功法
  环境加成系数: number;    // 0.0 - 0.5，洞府、宗门福地等
}

/** 修炼速度计算结果（修仙主题） */
export interface CultivationSpeedResult {
  基础速度: number;        // 每回合基础修为增加
  综合系数: number;        // 所有因子的综合乘数
  最终速度: number;        // 基础速度 * 综合系数
  预计突破时间: string;    // 预计到达下一阶段的游戏时间
  因子详情: CultivationSpeedFactors;
}

/** 境界突破时间标准（修仙主题，游戏时间） */
export interface RealmBreakthroughTime {
  境界名称: string;
  阶段: string;
  最短月数: number;        // 最短突破时间（月）
  标准月数: number;        // 标准突破时间（月）
  最长月数: number;        // 最长突破时间（月）
  // 兼容旧格式
  最短时间?: string;       // 如 "1年"
  标准时间?: string;       // 如 "5年"
  最长时间?: string;       // 如 "20年"
  突破难度?: '简单' | '普通' | '困难' | '极难' | '逆天';
}

/** 施政速度影响因子（县令主题） */
export interface AdministrationSpeedFactors {
  民心支持度系数: number;  // 0.1 - 2.0，基于位置民心支持度(1-100)
  先天六司系数: number;    // 0.5 - 2.0，基于先天六司综合值
  后天六司系数: number;    // 0.0 - 0.6，基于后天六司综合值（额外加成）
  状态效果系数: number;    // 0.5 - 2.0，基于buff/debuff
  方略加成系数: number;    // 0.0 - 1.0，基于当前施政方略
  环境加成系数: number;    // 0.0 - 0.5，县衙、官府等
}

/** 施政速度计算结果（县令主题） */
export interface AdministrationSpeedResult {
  基础速度: number;        // 每回合基础政绩增加
  综合系数: number;        // 所有因子的综合乘数
  最终速度: number;        // 基础速度 * 综合系数
  预计升职时间: string;    // 预计到达下一官品的游戏时间
  因子详情: AdministrationSpeedFactors;
}

/** 官品晋升时间标准（县令主题，游戏时间） */
export interface RankPromotionTime {
  官品名称: string;
  阶段: string;
  最短月数: number;        // 最短晋升时间（月）
  标准月数: number;        // 标准晋升时间（月）
  最长月数: number;        // 最长晋升时间（月）
  晋升难度?: '简单' | '普通' | '困难' | '极难' | '逆天';
}

// --- 六司系统约束 ---

/** 六司约束配置 */
export interface SixSiConstraints {
  先天六司: {
    每项上限: 10;          // 固定值，不可修改
    总分上限: 60;          // 6项 × 10
    对加成权重: 0.7;       // 占总加成的70%
  };
  后天六司: {
    每项上限: 20;          // 单项最大值
    单次增加上限: 3;       // 每次最多增加1-3点（极稀有机缘可达5点）
    单次减少上限: 5;       // 每次最多减少1-5点（惩罚）
    对加成权重: 0.3;       // 占总加成的30%
    获取方式: string[];    // 县令主题：['装备', '天赋', '丹药', '机缘', '政策领悟']；修仙主题：['装备', '天赋', '丹药', '机缘', '大道感悟']
  };
}

/** 六司加成结果 */
export interface SixSiBonus {
  修炼速度加成: number;    // 百分比 0-100（修仙主题）
  施政速度加成?: number;   // 百分比 0-100（县令主题）
  战斗力加成: number;      // 百分比 0-100
  感知范围加成: number;    // 百分比 0-100
  交际能力加成: number;    // 百分比 0-100
  机缘概率加成: number;    // 百分比 0-100
}

/** 六司权重配置 */
export interface SixSiWeights {
  根骨: number;
  灵性: number;
  悟性: number;
  心性: number;
  气运: number;
  魅力: number;
}

// --- 炼器/炼丹系统 ---

/** 炼制类型 */
export type CraftingType = '炼器' | '炼丹';

/** 炼制结果品质 */
export type CraftingResultQuality = '废品' | '残次品' | '成品' | '精品' | '极品' | '神品';

/** 炼制材料槽位 */
export interface CraftingSlot {
  slotId: number; // 槽位ID (1-5)
  item: Item | null; // 放入的物品
}

/** 炼制配方 */
export interface CraftingRecipe {
  materials: CraftingSlot[]; // 5个材料槽位
  craftingType: CraftingType; // 炼制类型
}

/** 炼制结果 */
export interface CraftingResult {
  success: boolean; // 是否成功
  resultQuality: CraftingResultQuality; // 结果品质
  resultItem: Item | null; // 生成的物品
  processDescription: string; // AI生成的炼制过程描述
  itemDescription: string; // AI生成的成品描述
  successRate: number; // 实际成功率
}

/** 炼制事件记录 */
export interface CraftingEvent {
  eventId: string;
  eventType: '炼器' | '炼丹';
  timestamp: string;
  materials: string[]; // 材料名称列表
  result: CraftingResultQuality;
  itemName: string;
  canDelete: boolean; // 是否可删除
}
