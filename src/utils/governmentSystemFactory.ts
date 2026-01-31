import type { SectContentStatus, SectMemberInfo, SectSystemV2, SectType, WorldFaction } from '@/types/game';
import { GOVERNMENT_SYSTEM_VERSION } from '@/utils/governmentMigration';

/**
 * @fileoverview 政府系统工厂模块（县令主题）
 *
 * 【职责】
 * - 创建和管理政府系统
 * - 初始化政府内容和状态
 * - 处理政府成员信息
 *
 * 【术语说明】
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

type GovernmentPolicy = {
  id: string;
  name: string;
  quality: string;
  qualityTier: string;
  cost: number;
  description: string;
};

/** 政府内容生成选项 */
export interface GovernmentContentGenerationOptions {
  /** 是否使用AI生成（true=等待AI生成，false=使用本地随机生成） */
  useAIGeneration?: boolean;
  /** 当前时间ISO字符串 */
  nowIso?: string;
}

/** 政府框架创建结果 */
export interface GovernmentFrameworkResult {
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
 * 创建加入政府后的状态（延迟初始化模式）
 * 档案库和供销库由 AI 动态生成，此处只创建框架
 */
export const createJoinedGovernmentState = (
  office: WorldFaction,
  options?: { nowIso?: string }
): { sectSystem: SectSystemV2; memberInfo: SectMemberInfo } => {
  const nowIso = options?.nowIso || new Date().toISOString();
  const officeName = office.名称;

  const memberInfo: SectMemberInfo = {
    宗门名称: officeName,
    宗门类型: normalizeSectType(String(office.类型 || '正统衙门')),
    职位: '外门吏员',
    贡献: 0,
    关系: '友好',
    声望: 0,
    加入日期: nowIso,
    描述: office.描述 || '',
  };

  return {
    sectSystem: {
      版本: GOVERNMENT_SYSTEM_VERSION,
      当前宗门: officeName,
      宗门档案: {
        [officeName]: office,
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

// ============================================================================
// 框架+延迟初始化模式
// ============================================================================

/**
 * 创建默认的政府内容状态
 */
export function createDefaultGovernmentContentStatus(): SectContentStatus {
  return {
    藏经阁已初始化: false,
    贡献商店已初始化: false,
    演变次数: 0,
  };
}

/**
 * 创建政府框架（不生成具体内容）
 *
 * 使用延迟初始化模式：
 * 1. 玩家加入政府时只创建框架和成员信息
 * 2. 档案库、供销库等内容由 AI 动态生成
 *
 * @param office 政府信息
 * @param options 选项
 * @returns 政府框架结果
 */
export function createGovernmentFramework(
  office: WorldFaction,
  options?: GovernmentContentGenerationOptions
): GovernmentFrameworkResult {
  const nowIso = options?.nowIso || new Date().toISOString();
  const officeName = office.名称;

  const memberInfo: SectMemberInfo = {
    宗门名称: officeName,
    宗门类型: normalizeSectType(String(office.类型 || '正统衙门')),
    职位: '外门吏员',
    贡献: 0,
    关系: '友好',
    声望: 0,
    加入日期: nowIso,
    描述: office.描述 || '',
  };

  const contentStatus = createDefaultGovernmentContentStatus();

  return {
    sectSystem: {
      版本: GOVERNMENT_SYSTEM_VERSION,
      当前宗门: officeName,
      宗门档案: {
        [officeName]: office,
      },
      宗门成员: {},
      宗门藏经阁: {},  // 空，由 AI 动态生成
      宗门贡献商店: {},  // 空，由 AI 动态生成
      宗门任务: {},
      宗门任务状态: {},
      内容状态: {
        [officeName]: contentStatus,
      },
    },
    memberInfo,
    contentStatus,
  };
}

/**
 * 检查政府内容是否需要初始化
 */
export function checkGovernmentContentNeedsInit(
  sectSystem: SectSystemV2,
  officeName: string
): { library: boolean; shop: boolean } {
  const status = sectSystem.内容状态?.[officeName];

  if (!status) {
    // 没有状态记录，检查实际内容
    const hasLibrary = (sectSystem.宗门藏经阁?.[officeName]?.length ?? 0) > 0;
    const hasShop = (sectSystem.宗门贡献商店?.[officeName]?.length ?? 0) > 0;

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
 * 获取政府主题关键字（用于AI生成提示）
 */
export function getGovernmentThemeKeywords(office: WorldFaction): string[] {
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

export type { ShopItem, GovernmentPolicy };

// 导出内部工具函数供高级用途
export {
  hashString,
  createSeededRandom,
  buildThemeKey,
};
