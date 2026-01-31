import type { SectContentStatus, SectMemberInfo, SectSystemV2, SectType, WorldFaction } from '@/types/game';
import { SECT_SYSTEM_VERSION } from '@/utils/sectMigration';

/**
 * @fileoverview 衙门系统工厂模块（县令主题）
 *
 * 【职责】
 * - 创建和管理衙门系统
 * - 初始化衙门内容和状态
 * - 处理衙门成员信息
 *
 * 【术语对照】
 * - 宗门 -> 衙门/官府
 * - 掌门 -> 县令/长官
 * - 弟子 -> 下属/官员
 * - 藏经阁 -> 档案库/书房
 * - 贡献商店 -> 供销库
 */

// ============================================================================
// 类型定义
// ============================================================================

type ShopItem = {
  id: string;
  name: string;
  icon: string;
  type: string;
  quality: string;
  description: string;
  cost: number;
  stock?: number;
};

type LibraryTechnique = {
  id: string;
  name: string;
  quality: string;
  qualityTier: string;
  cost: number;
  description: string;
};

/** 衙门内容生成选项 */
export interface SectContentGenerationOptions {
  /** 是否使用AI生成（true=等待AI生成，false=使用本地随机生成） */
  useAIGeneration?: boolean;
  /** 当前时间ISO字符串 */
  nowIso?: string;
}

/** 衙门框架创建结果 */
export interface SectFrameworkResult {
  sectSystem: SectSystemV2;
  memberInfo: SectMemberInfo;
  contentStatus: SectContentStatus;
}

/** 县别主题：衙门内容生成选项（别名） */
export interface GovernmentOfficeContentGenerationOptions {
  /** 是否使用AI生成（true=等待AI生成，false=使用本地随机生成） */
  useAIGeneration?: boolean;
  /** 当前时间ISO字符串 */
  nowIso?: string;
}

/** 县别主题：衙门框架创建结果（别名） */
export interface GovernmentOfficeFrameworkResult {
  sectSystem: SectSystemV2;
  memberInfo: SectMemberInfo;
  contentStatus: SectContentStatus;
}

const normalizeSectType = (typeText: string): SectType => {
  if (/贪腐|奸/i.test(typeText)) return '贪腐衙门';
  if (/清流|清正/i.test(typeText)) return '清流衙门';
  if (/中立/i.test(typeText)) return '中立衙门';
  if (/世家|门阀|家族/i.test(typeText)) return '世家';
  if (/商会|商盟|商号/i.test(typeText)) return '商会';
  return '正统衙门';
};

/**
 * 规范化势力类型为衙门类型（县令主题）
 * @param typeText 势力类型文本
 * @returns 衙门类型
 */
export const normalizeGovernmentOfficeType = (typeText: string): SectType => {
  return normalizeSectType(typeText);
};

const hashString = (input: string) => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const createSeededRandom = (seed: number) => {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 48271) % 2147483647;
    return value / 2147483647;
  };
};

const buildThemeKey = (sect: WorldFaction) => {
  const raw = `${sect.类型 || ''}${Array.isArray(sect.特色) ? sect.特色.join('') : sect.特色 || ''}${Array.isArray(sect.特色列表) ? sect.特色列表.join('') : ''}`;
  if (/刑|律/i.test(raw)) return 'justice';
  if (/赋|税/i.test(raw)) return 'finance';
  if (/工|建/i.test(raw)) return 'construction';
  if (/商/i.test(raw)) return 'merchant';
  if (/农|田/i.test(raw)) return 'agriculture';
  if (/兵|武/i.test(raw)) return 'military';
  return 'justice';
};

/**
 * 创建加入衙门后的状态（延迟初始化模式）
 * 藏经阁和贡献商店由 AI 动态生成，此处只创建框架
 */
export const createJoinedSectState = (
  sect: WorldFaction,
  options?: { nowIso?: string }
): { sectSystem: SectSystemV2; memberInfo: SectMemberInfo } => {
  const nowIso = options?.nowIso || new Date().toISOString();
  const sectName = sect.名称;

  const memberInfo: SectMemberInfo = {
    宗门名称: sectName,
    宗门类型: normalizeSectType(String(sect.类型 || '正统衙门')),
    职位: '外门吏员',
    贡献: 0,
    关系: '友好',
    声望: 0,
    加入日期: nowIso,
    描述: sect.描述 || '',
  };

  return {
    sectSystem: {
      版本: SECT_SYSTEM_VERSION,
      当前宗门: sectName,
      宗门档案: {
        [sectName]: sect,
      },
      宗门成员: {},
      宗门藏经阁: {},  // 由 AI 动态生成
      宗门贡献商店: {},  // 由 AI 动态生成
      宗门任务: {},
      宗门任务状态: {},
    },
    memberInfo,
  };
};

/**
 * 创建加入衙门后的状态（县令主题别名，延迟初始化模式）
 * 档案库和供销库由 AI 动态生成，此处只创建框架
 */
export const createJoinedGovernmentOfficeState = (
  office: WorldFaction,
  options?: { nowIso?: string }
): { sectSystem: SectSystemV2; memberInfo: SectMemberInfo } => {
  return createJoinedSectState(office, options);
};

// ============================================================================
// 框架+延迟初始化模式
// ============================================================================

/**
 * 创建默认的衙门内容状态
 */
export function createDefaultContentStatus(): SectContentStatus {
  return {
    藏经阁已初始化: false,
    贡献商店已初始化: false,
    演变次数: 0,
  };
}

/**
 * 创建默认的衙门内容状态（县令主题别名）
 */
export function createDefaultGovernmentOfficeContentStatus(): SectContentStatus {
  return createDefaultContentStatus();
}

/**
 * 创建衙门框架（不生成具体内容）
 *
 * 使用延迟初始化模式：
 * 1. 玩家加入衙门时只创建框架和成员信息
 * 2. 藏经阁、贡献商店等内容由 AI 动态生成
 *
 * @param sect 衙门信息
 * @param options 选项
 * @returns 衙门框架结果
 */
export function createSectFramework(
  sect: WorldFaction,
  options?: SectContentGenerationOptions
): SectFrameworkResult {
  const nowIso = options?.nowIso || new Date().toISOString();
  const sectName = sect.名称;

  const memberInfo: SectMemberInfo = {
    宗门名称: sectName,
    宗门类型: normalizeSectType(String(sect.类型 || '正统衙门')),
    职位: '外门吏员',
    贡献: 0,
    关系: '友好',
    声望: 0,
    加入日期: nowIso,
    描述: sect.描述 || '',
  };

  const contentStatus = createDefaultContentStatus();

  return {
    sectSystem: {
      版本: SECT_SYSTEM_VERSION,
      当前宗门: sectName,
      宗门档案: {
        [sectName]: sect,
      },
      宗门成员: {},
      宗门藏经阁: {},  // 空，由 AI 动态生成
      宗门贡献商店: {},  // 空，由 AI 动态生成
      宗门任务: {},
      宗门任务状态: {},
      内容状态: {
        [sectName]: contentStatus,
      },
    },
    memberInfo,
    contentStatus,
  };
}

/**
 * 创建衙门框架（县令主题别名，不生成具体内容）
 *
 * 使用延迟初始化模式：
 * 1. 玩家加入衙门时只创建框架和成员信息
 * 2. 档案库、供销库等内容由 AI 动态生成
 *
 * @param office 衙门信息
 * @param options 选项
 * @returns 衙门框架结果
 */
export function createGovernmentOfficeFramework(
  office: WorldFaction,
  options?: GovernmentOfficeContentGenerationOptions
): GovernmentOfficeFrameworkResult {
  return createSectFramework(office, options);
}

/**
 * 检查衙门内容是否需要初始化
 */
export function checkSectContentNeedsInit(
  sectSystem: SectSystemV2,
  sectName: string
): { library: boolean; shop: boolean } {
  const status = sectSystem.内容状态?.[sectName];

  if (!status) {
    // 没有状态记录，检查实际内容
    const hasLibrary = (sectSystem.宗门藏经阁?.[sectName]?.length ?? 0) > 0;
    const hasShop = (sectSystem.宗门贡献商店?.[sectName]?.length ?? 0) > 0;

    return {
      library: !hasLibrary,
      shop: !hasShop,
    };
  }

  return {
    library: !status.藏经阁已初始化,
    shop: !status.贡献商店已初始化,
  };
}

/**
 * 检查衙门内容是否需要初始化（县令主题别名）
 */
export function checkGovernmentOfficeContentNeedsInit(
  sectSystem: SectSystemV2,
  sectName: string
): { library: boolean; shop: boolean } {
  return checkSectContentNeedsInit(sectSystem, sectName);
}

/**
 * 获取衙门主题关键字（用于AI生成提示）
 */
export function getSectThemeKeywords(sect: WorldFaction): string[] {
  const themeKey = buildThemeKey(sect);
  const keywords: string[] = [];

  switch (themeKey) {
    case 'justice':
      keywords.push('刑律', '断案', '法典', '审讯');
      break;
    case 'finance':
      keywords.push('赋税', '钱粮', '财政', '库房');
      break;
    case 'construction':
      keywords.push('工程', '建设', '水利', '营造');
      break;
    case 'military':
      keywords.push('兵备', '武备', '防务', '操练');
      break;
    case 'merchant':
      keywords.push('商道', '交易', '征税', '市场');
      break;
    case 'agriculture':
      keywords.push('农桑', '耕种', '水利', '赈济');
      break;
  }

  // 添加衙门特色
  if (Array.isArray(sect.特色)) {
    keywords.push(...sect.特色);
  } else if (sect.特色) {
    keywords.push(sect.特色);
  }

  return [...new Set(keywords)];
}

// ============================================================================
// 导出
// ============================================================================

export type { ShopItem, LibraryTechnique };

// 导出内部工具函数供高级用途
export {
  hashString,
  createSeededRandom,
  buildThemeKey,
};
