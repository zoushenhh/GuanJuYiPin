import type {
  ActionQueue,
  CharacterBaseInfo,
  CultivationTechniqueReference,
  AdministrationStrategyReference,
  Equipment,
  GameMessage,
  GameTime,
  Inventory,
  MasteredSkill,
  Memory,
  NpcProfile,
  SectMemberInfo,
  SectSystemV2,
  StatusEffect,
  SystemConfig,
  PlayerAttributes,
  PlayerLocation,
  WorldInfo,
  EventSystem,
  BodyStats
} from '@/types/game';

/**
 * 存档格式 V3（唯一真相）：以 `docs/save-schema-v3.md` 为准。
 * 顶层只允许：元数据 / 角色 / 社交 / 世界 / 系统
 */

export interface SaveMetaV3 {
  版本号: 3;
  存档ID: string;
  存档名: string;
  游戏版本?: string;
  创建时间: string;
  更新时间: string;
  游戏时长秒: number;
  时间: GameTime;
}


export interface RelationshipEdgeV3 {
  from: string;
  to: string;
  relation?: string;
  score?: number;
  tags?: string[];
  updatedAt?: string;
}

/**
 * 关系矩阵/关系网（可选）
 * - 不作为硬依赖字段：缺失时 UI 可由社交.关系即时推导
 * - 未来用于 NPC-NPC 关系与实时演变记录
 */
export interface RelationshipMatrixV3 {
  version?: number;
  nodes?: string[];
  edges?: RelationshipEdgeV3[];
}

export interface StrategyProgressEntryV3 {
  熟练度: number;
  已解锁技能: string[];
}

export interface StrategySystemV3 {
  当前方略ID: string | null;
  方略进度: Record<string, StrategyProgressEntryV3>;
  方略套装: {
    主修: string | null;
    辅修: string[];
  };
}

export interface AdministrationStateV3 {
  施政方略: CultivationTechniqueReference | null;
  施政状态?: {
    模式: string;
    开始时间?: string;
    消耗?: Record<string, unknown>;
    [key: string]: unknown;
  };
  政绩?: unknown;
  民心?: unknown;
  突破?: unknown;
  [key: string]: unknown;
}

export interface PhilosophySystemV3 {
  理念列表: Record<string, unknown>;
  [key: string]: unknown;
}

export interface SkillStateV3 {
  掌握技能: MasteredSkill[];
  装备栏: string[];
  冷却: Record<string, unknown>;
}

// 向后兼容的类型别名
export type TechniqueProgressEntryV3 = StrategyProgressEntryV3;
export type TechniqueSystemV3 = StrategySystemV3;
export type CultivationStateV3 = AdministrationStateV3;
export type DaoSystemV3 = PhilosophySystemV3;

export interface SaveDataV3 {
  元数据: SaveMetaV3;
  角色: {
    身份: CharacterBaseInfo;
    属性: PlayerAttributes;
    位置: PlayerLocation;
    效果: StatusEffect[];
    身体?: BodyStats;
    背包: Inventory;
    装备: Equipment;
    方略: StrategySystemV3;
    施政: AdministrationStateV3;
    理念: PhilosophySystemV3;
    技能: SkillStateV3;
    // 向后兼容字段
    功法?: StrategySystemV3;
    修炼?: AdministrationStateV3;
    大道?: PhilosophySystemV3;
  };
  社交: {
    关系: Record<string, NpcProfile>;
    关系矩阵?: RelationshipMatrixV3;
    宗门?: (SectSystemV2 & { 成员信息?: SectMemberInfo }) | null;
    事件: EventSystem;
    记忆: Memory;
  };
  世界: {
    信息: WorldInfo;
    状态?: unknown;
  };
  系统: {
    配置?: SystemConfig;
    设置?: Record<string, unknown>;
    缓存?: Record<string, unknown>;
    行动队列?: ActionQueue;
    历史?: { 叙事?: GameMessage[] };
    扩展?: Record<string, unknown>;
  };
}
