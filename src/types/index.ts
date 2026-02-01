// src/types/index.ts
// 仙途 by 千夜 | github.com/qianye60 | CC BY-NC-SA 4.0

// ============================================================================
// Phase 1: 新类型系统导出（县令主题）
// ============================================================================

// 县令核心类型
export type {
  Magistrate,
  MagistrateBackground,
  MagistrateStatus,
  StatusEffect,
  StatusEffectType,
  MeritRecord,
  MeritGrade,
  MeritEntry,
  MeritSource,
  GovernanceAbility,
  OfficialRecord,
  OfficialRank,
  Relationship,
  RelationshipType,
} from './magistrate.d';

// 县治状态类型
export type {
  CountyState,
  LocationInfo,
  TerrainType,
  ClimateType,
  TrafficLevel,
  PopulationStats,
  PopulationComposition,
  PopulationDensity,
  Treasury,
  TreasuryRecord,
  TaxRate,
  Infrastructure,
  InfrastructureLevel,
  SpecialFacility,
  FacilityType,
  Specialty,
  SpecialtyType,
  SpecialtyQuality,
  CountyEvent,
  CountyEventType,
  EventSeverity,
  EventImpact,
  DevelopmentTrend,
  TrendData,
  TrendDirection,
  GovernanceRating,
  RatingLevel,
  RatingDetails,
} from './county.d';

// 官阶品级系统类型
export type {
  OfficialRank as RankOfficialRank,
  RankTier,
  RankInfo,
  RankPermissions,
  PromotionRequirement,
  AssessmentItem,
  PromotionResult,
  HonorTitle,
  HonorTitleType,
  TitleEffect,
  DemotionReason,
  DismissalReason,
  DemotionRecord,
  DismissalRecord,
} from './official-ranks';

// 导出官阶配置
export { RANK_CONFIG, getRankOrder, compareRanks, getNextRank, isMagistrateRank } from './official-ranks';

// ============================================================================
// 旧类型系统导出（已废弃，标记 @deprecated）
// ============================================================================

// 向后兼容别名：TechniqueItem -> StrategyItem（修仙主题 -> 县令主题）
// StrategyItem 在 game.d.ts 中定义，这里不重复导出
export type { StrategyItem as TechniqueItem } from './game.d';

// 旧版物品类型（用于存档迁移和数据修复，向后兼容）
export type LegacyItemType =
  | '装备'      // 装备类物品
  | '功法'      // 修仙主题：功法（已废弃，映射到'方略'）
  | '方略'      // 县令主题：治国方略
  | '丹药'      // 修仙主题：丹药（已废弃，映射到'药品'）
  | '药品'      // 县令主题：药品
  | '材料'      // 材料类物品
  | '其他';     // 其他物品
import type { SaveDataV3 } from './saveSchemaV3';
import type { APIUsageType } from '@/stores/apiManagementStore';

// --- 核心AI交互结构 (保留) ---
export interface GM_Request {
  action: 'new_game' | 'player_action';
  character_data: any; // 角色卡数据
  player_input?: string; // 玩家输入
  mid_term_memory?: string; // 中期记忆
}

export interface GM_Response {
  narrative: string; // AI生成的旁白
  map_data: any; // AI生成的地图数据
  mid_term_memory: string; // AI总结的中期记忆
  cachedWorldData?: any; // AI缓存的世界数据
  action_options: string[]; // 行动选项（必填）
}

// --- 创角核心类型定义 ---

export interface World {
  id: number;
  name: string;
  era?: string | null;
  description?: string | null;
  source?: 'local' | 'custom' | 'cloud';
}

// 新术语类型别名（县令模拟器）
export type Region = World;           // 地界 = 世界
export type Background = TalentTier;  // 出身 = 天资等级
export type Aptitude = Origin;        // 天资 = 出身背景
export type PostHeaven = SpiritRoot;  // 后天 = 灵根/才能
export type Ability = Talent;         // 能力 = 天赋

export interface TalentTier {
  id: number;
  name: string;
  description?: string | null;
  total_points: number;
  rarity: number;
  color: string;
  source?: 'local' | 'custom' | 'cloud';
}

/**
 * @deprecated 使用 MagistrateBackground 替代
 * 旧术语：出身
 * 新术语：县令天资
 */
export interface Origin {
  id: number;
  name: string;
  description?: string | null;
  talent_cost: number;
  attribute_modifiers?: Record<string, number> | null;
  rarity: number;
  source?: 'local' | 'custom' | 'cloud';
  background_effects?: { type: string; description: string }[];
}

/**
 * 后天才能（原灵根）
 *
 * @deprecated 接口名保留为SpiritRoot是为了向后兼容旧存档
 * 旧术语：灵根（修仙游戏中的先天才能）
 * 新术语：后天才能（县令游戏中的后天能力）
 *
 * 术语映射：
 * - SpiritRoot (灵根) -> PostHeavenAbility (后天才能)
 * - cultivation_speed (修炼速度) -> governing_speed (施政速度)
 * - tier (品阶) -> talent_level (才能等级)
 * - special_effects (特殊效果) -> special_abilities (特殊能力)
 * - base_multiplier (基础倍率) -> efficiency_multiplier (效率倍率)
 * - talent_cost (天资消耗) -> ability_cost (才能消耗)
 *
 * 注意：
 * - 字段名cultivation_speed保留是为了兼容性，新代码应理解为"施政速度"
 * - 字段名tier保留是为了兼容性，新代码应理解为"才能等级"
 * - 字段名special_effects保留是为了兼容性，新代码应理解为"特殊能力"
 * - 字段名base_multiplier保留是为了兼容性，新代码应理解为"效率倍率"
 * - 字段名talent_cost保留是为了兼容性，新代码应理解为"才能消耗"
 *
 * 实际用途：
 * - 县令主题：后天才能（如理财、刑名、礼制等专业技能）
 * - 修仙主题：灵根（如金木水火土五行灵根）
 */
export interface SpiritRoot {
  id: number;
  name: string;
  /** @deprecated 县令主题：才能等级；修仙主题：品阶 */
  tier?: string | null;
  description?: string | null;
  /** @deprecated 字段名保留是为了兼容性，实际含义为"施政速度"（原修炼速度） */
  cultivation_speed?: string;
  /** @deprecated 县令主题：特殊能力；修仙主题：特殊效果 */
  special_effects?: string[];
  /** @deprecated 县令主题：效率倍率；修仙主题：基础倍率 */
  base_multiplier: number;
  /** @deprecated 县令主题：才能消耗；修仙主题：天资消耗 */
  talent_cost: number;
  rarity?: number;
  source?: 'local' | 'custom' | 'cloud';
}

// --- 全新存档与游戏状态结构 ---

export interface Talent {
  id: number; // 统一为数字ID以匹配后端
  name: string;
  description?: string | null;
  talent_cost: number;
  rarity: number;
  tier_id?: number | null;
  tier?: TalentTier | null;
  source?: 'local' | 'custom' | 'cloud';
  effects?: Array<{
    类型: string;
    目标?: string;
    数值: number;
    技能?: string;
    名称?: string;
  }>;
}

/**
 * @deprecated 使用 Magistrate 替代
 * 旧术语：角色游戏状态
 * 新术语：县令状态
 *
 * 术语映射：
 * - hp/health -> 健康
 * - mana/法力 -> 威望
 * - spirit/神识 -> 心境
 * - lifespan/寿元 -> 任期/寿命
 * - root_bone/根骨 -> 精力
 */
export interface CharacterGameState {
  mapData: any;
  talents: Talent[];
  reputation: number;
  titles: string[];
  hp?: number; hp_max?: number;         // @deprecated -> 健康
  mana?: number; mana_max?: number;     // @deprecated -> 威望
  spirit?: number; spirit_max?: number; // @deprecated -> 心境
  lifespan?: number; lifespan_max?: number; // @deprecated -> 任期/寿命
  root_bone?: number;                   // @deprecated -> 精力
  spirituality?: number;
  comprehension?: number;
  fortune?: number;
  charm?: number;
  temperament?: number;
}

export type CharacterSaveData = {
  [saveSlotId: string]: CharacterGameState;
};

export type GameSaves = {
  [characterId: string]: CharacterSaveData;
};

// --- 补完核心角色定义 ---

export interface Currency {
  low: number; high: number;
  mid: number; supreme: number;
}

export interface StorageExpansion {
  id: string;
  name: string;
  addedCapacity: number;
}

export interface Item {
  id: string;
  name: string;
  quantity: number;
  description: string;
}

export interface Inventory {
  items: Item[];
  capacity: number;
  expansions: StorageExpansion[];
  currency: Currency;
}

/**
 * @deprecated 使用 Magistrate 替代
 * 旧术语：角色/修仙者
 * 新术语：县令
 * 术语映射：Cultivator/Player -> Magistrate (县令)
 */
export interface Character {
  id: number;
  character_name: string;
  world_id: number;
  created_at: string;
  inventory: Inventory;
  talents: Talent[];
  reputation: number;

  // --- 先天六司 (永不改变) ---
  // @deprecated 使用 Magistrate.先天六司
  root_bone: number;      // 精力（原根骨）- 影响健康、处理政务耐力
  spirituality: number;   // 灵性 - 影响威望、施政效果
  comprehension: number;  // 悟性 - 影响政务理解、晋升概率
  fortune: number;        // 气运 - 影响机缘、政绩、晋升
  charm: number;          // 魅力 - 影响社交、NPC好感
  temperament: number;    // 心性 - 影响处理政务稳定、抗压能力

  // --- 创角选择 (永不改变) ---
  world?: World | null;
  talent_tier?: TalentTier | null;
  origin?: Origin | null;          // @deprecated 使用 Magistrate.出身
  spirit_root?: SpiritRoot | null;  // @deprecated 使用 Magistrate.出身

  // --- 动态可变属性 (用于游戏状态) ---
  realm?: string;         // @deprecated 使用 Magistrate.官品
  hp?: number; hp_max?: number;  // @deprecated 使用 Magistrate.健康
  mana?: number; mana_max?: number;  // @deprecated 使用 Magistrate.威望
  spirit?: number; spirit_max?: number;  // @deprecated 使用 Magistrate.心境
  lifespan?: number; lifespan_max?: number;  // @deprecated 使用 Magistrate.寿命/任期
}

/**
 * @deprecated 使用 Magistrate 替代
 * 【旧】统一的角色数据类型，用于各处流转
 * 包含了来源信息和可选的游戏状态预览
 */
export type CharacterData = Character & {
  source: 'local' | 'custom' | 'cloud';
  gameState?: CharacterGameState;
};

/**
 * @deprecated 使用 Magistrate 替代
 * 角色创建时的载荷类型
 *
 * 术语映射：
 * - origin -> 出身（天资选择）
 * - spiritRoot -> 后天（才能补全）
 * - root_bone -> 精力（县令主题六司）
 * - spirituality -> 灵性
 * - comprehension -> 悟性
 * - fortune -> 气运
 * - charm -> 魅力
 * - temperament -> 心性
 */
export interface CharacterCreationPayload {
  charId: string;
  characterName: string;
  world: World;
  talentTier: TalentTier;
  origin: Origin | null;  // @deprecated 使用 MagistrateBackground（出身/天资）
  spiritRoot: SpiritRoot | null;  // @deprecated 使用 MagistrateBackground（后天/才能）
  talents: Talent[];      // 能力列表
  baseAttributes: {
    root_bone: number;       // 精力 - 影响健康、处理政务耐力
    spirituality: number;    // 灵性 - 影响威望、施政效果
    comprehension: number;   // 悟性 - 影响政务理解、晋升概率
    fortune: number;         // 气运 - 影响机缘、政绩、晋升
    charm: number;           // 魅力 - 影响社交、NPC好感
    temperament: number;     // 心性 - 影响处理政务稳定、抗压能力
  };
  age: number;
  gender: string;
  race?: string;  // 种族字段（可选，默认为'人族'）
}

// --- 创角自定义数据结构 ---

/**
 * @deprecated 使用新的县令类型系统
 * 创角自定义数据结构
 */
export type DADCustomData = {
  worlds: World[];
  backgrounds: TalentTier[];
  aptitudes: Origin[];        // @deprecated 使用 MagistrateBackground
  postHeavens: SpiritRoot[]; // @deprecated 使用 MagistrateBackground
  abilities: Talent[];
};
// src/types/index.ts

/**
 * 代表所有游戏存档的集合
 * key是存档名称, value是聊天记录数组
 */
export type AllSaves = Record<string, any[]>;

// --- 新增的类型定义 ---

export interface InitialGameData {
  baseInfo: {
    名字: string;
    先天六司?: {
      精力?: number;  // 原根骨 - 影响健康、处理政务耐力
      灵性?: number;
      悟性?: number;
      气运?: number;
      魅力?: number;
      心性?: number;
    };
    性别?: string;
    世界?: string;
    天资?: any; // 允许包含描述的复杂类型
    天赋?: any[]; // 允许包含描述的复杂类型
    出生?: any; // 允许包含描述的复杂类型
    灵根?: any; // 允许包含描述的复杂类型
  };
  creationDetails: {
    age: number;
    originName: string;
    spiritRootName: string;
    talentNames?: string[];
    talentTierName?: string;
  };
  // 🔥 新增字段：直接传递世界信息
  worldInfo?: WorldInfo;
  availableContinents?: Array<{
    名称: string;
    描述: string;
    大洲边界?: any;
  }>;
  availableLocations?: Array<{
    名称: string;
    类型: string;
    描述?: string;
    所属势力?: string;
    coordinates?: any;
  }>;
  mapConfig?: any;
  saveData?: any;
  world?: any;
}

export interface WorldInfo {
  世界名称: string;
  大陆信息?: any[];
  势力信息?: any[];
  地点信息?: any[];
  世界背景?: string;
  世界纪元?: string;
  生成时间?: string;
  特殊设定?: string[];
  版本?: string;
}

// 存档结构以 V3 为准（见 docs/save-schema-v3.md）
export type SaveData = SaveDataV3;

// --- TavernHelper API 类型定义 ---

// 为酒馆世界书条目定义一个最小化的接口以确保类型安全
export interface LorebookEntry {
  uid: number;
  comment: string;
  keys: string[];
  content: string;
}

// 提示词注入类型定义(根据@types文档)
export interface InjectionPrompt {
  id: string;
  /**
   * 要注入的位置
   * - 'in_chat': 插入到聊天中
   * - 'none': 不会发给 AI, 但能用来激活世界书条目.
   */
  position: 'in_chat' | 'none';
  depth: number;
  role: 'system' | 'assistant' | 'user';
  content: string;
  /** 提示词在什么情况下启用; 默认为始终 */
  filter?: (() => boolean) | (() => Promise<boolean>);
  /** 是否作为欲扫描文本, 加入世界书绿灯条目扫描文本中; 默认为任意 */
  should_scan?: boolean;
}

export interface InjectPromptsOptions {
  once?: boolean; // 是否只在下一次请求生成中有效
}

export interface Overrides {
  char_description?: string;
  char_personality?: string;
  scenario?: string;
  example_dialogue?: string;
  [key: string]: unknown;
}

export interface TavernHelper {
  // 核心生成与命令
  generate: (config: {
    user_input?: string;
    should_stream?: boolean;
    image?: File | string | (File | string)[];
    overrides?: Overrides;
    injects?: Omit<InjectionPrompt, 'id'>[];
    max_chat_history?: 'all' | number;
    custom_api?: Record<string, unknown>;
    generation_id?: string;
    usageType?: APIUsageType;
    onStreamChunk?: (chunk: string) => void;
  }) => Promise<string>; // 更新generate方法签名
  generateRaw: (config: Record<string, unknown>) => Promise<unknown>; // 更改为接受配置对象
  triggerSlash: (command: string) => Promise<unknown>;

  // 斜杠命令注册（扩展功能，可选）
  registerSlashCommand?: (command: string, callback: (args?: any) => Promise<void> | void) => void;

  // 提示词注入
  injectPrompts: (prompts: InjectionPrompt[], options?: InjectPromptsOptions) => void;
  uninjectPrompts: (ids: string[]) => void;

  // 变量操作
  getVariables(options: { type: 'global' | 'chat' | 'local' }): Promise<Record<string, unknown>>;
  getVariable(key: string, options: { type: 'global' | 'chat' | 'local' }): Promise<unknown>;
  setVariable(key: string, value: unknown, options: { type: 'global' | 'chat' | 'local' }): Promise<void>;
  insertOrAssignVariables(data: Record<string, unknown>, options: { type: 'global' | 'chat' | 'local' }): Promise<void>;
  deleteVariable(variable_path: string, options?: { type?: string; message_id?: number | 'latest' }): Promise<{ variables: Record<string, unknown>; delete_occurred: boolean }>;

  // 角色与宏
  getCharData(): Promise<{ name: string } | null>;
  substitudeMacros(macro: string): Promise<string>;

  // 世界书操作
  getLorebooks(): Promise<string[]>;
  createLorebook(name: string): Promise<void>;
  getLorebookEntries(name: string): Promise<LorebookEntry[]>;
  setLorebookEntries(name: string, entries: Partial<LorebookEntry>[]): Promise<void>;
  createLorebookEntries(name: string, entries: unknown[]): Promise<void>;

  // 聊天记录操作
  getLastMessageId(): Promise<number>;
  deleteChatMessages(message_ids: number[], options?: { refresh?: 'none' | 'all' }): Promise<void>;
  updateChatHistory?(history: unknown[]): Promise<void>; // 为了向后兼容，设为可选
  clearChat?(): Promise<void>; // 清空聊天记录

  // 设置与其他
  settings?: {
    token?: string;
  };
}
