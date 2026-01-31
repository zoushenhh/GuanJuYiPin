/**
 * 数据修复和清洗工具
 *
 * 功能:
 * - 修复AI返回的不完整或错误的存档数据
 * - 填充缺失的必需字段
 * - 验证并修正数据类型和范围
 *
 * 被以下文件引用:
 * - src/stores/characterStore.ts
 */

import type { SaveData, Item, NpcProfile, GameTime, Realm, PlayerAttributes, PlayerLocation, ItemType, LegacyItemType, RankLevel } from '@/types/game';
import type { GradeType } from '@/data/itemQuality';
import { cloneDeep } from 'lodash';
import { isSaveDataV3, migrateSaveDataToLatest } from '@/utils/saveMigration';
import { validateSaveDataV3 } from '@/utils/saveValidationV3';
import { normalizeBackpackCurrencies } from '@/utils/currencySystem';

// ============================================================================
// 类型规范化常量（县令主题）
// ============================================================================

/**
 * 有效的物品类型（县令主题：主要类型）
 * 注意：'丹药' 保留用于向后兼容旧存档，新代码应使用 '药品'
 */
const validTypes: (ItemType | LegacyItemType)[] = ['装备', '方略', '丹药', '药品', '材料', '其他'];

/**
 * 扩展物品类型（包含旧值，用于向后兼容旧存档数据）
 */
const validLegacyTypes: LegacyItemType[] = ['装备', '功法', '方略', '丹药', '药品', '材料', '其他'];

// ============================================================================
// 类型映射函数（修仙主题 → 县令主题）
// ============================================================================

/**
 * 将旧物品类型规范化为新物品类型
 * 功法 → 方略，丹药 → 药品
 */
function normalizeItemType(rawType: string): ItemType {
  const typeMap: Record<string, ItemType> = {
    '功法': '方略',
    '丹药': '药品',
  };

  // 如果是已知旧类型，映射到新类型
  if (rawType in typeMap) {
    console.log(`[数据修复] 物品类型迁移: ${rawType} → ${typeMap[rawType]}`);
    return typeMap[rawType];
  }

  // 验证是否为新类型
  const newValidTypes: ItemType[] = ['装备', '方略', '药品', '材料', '其他'];
  if (newValidTypes.includes(rawType as ItemType)) {
    return rawType as ItemType;
  }

  // 兼容：如果是旧的丹药类型
  if (rawType === '丹药') {
    console.log(`[数据修复] 物品类型迁移: 丹药 → 药品`);
    return '药品';
  }

  // 默认返回'其他'
  console.warn(`[数据修复] 未知物品类型: ${rawType}，默认为'其他'`);
  return '其他';
}

/**
 * 将修真境界映射到官品等级
 * 练气→九品、筑基→八品、金丹→七品...
 */
function mapRealmToRank(realmName: string): RankLevel {
  const rankMap: Record<string, RankLevel> = {
    '练气': '九品',
    '筑基': '八品',
    '金丹': '七品',
    '元婴': '六品',
    '化神': '五品',
    '炼虚': '四品',
    '合体': '三品',
    '渡劫': '二品',
    '大乘': '一品',
    // 如果已经是官品，直接返回
    '九品': '九品', '八品': '八品', '七品': '七品',
    '六品': '六品', '五品': '五品', '四品': '四品',
    '三品': '三品', '二品': '二品', '一品': '一品',
    '平民': '九品', '凡人': '九品',
  };

  const mapped = rankMap[realmName];
  if (mapped) {
    if (mapped !== realmName && !['平民', '凡人'].includes(realmName)) {
      console.log(`[数据修复] 境界迁移: ${realmName} → ${mapped}`);
    }
    return mapped;
  }

  console.warn(`[数据修复] 未知境界: ${realmName}，默认为'九品'`);
  return '九品';
}

/**
 * 修复并清洗存档数据，确保所有必需字段存在且格式正确
 */
export function repairSaveData(saveData: SaveData | null | undefined): SaveData {
  console.log('[数据修复] 开始修复存档数据');

  try {
    if (!saveData || typeof saveData !== 'object') {
      console.error('[数据修复] ❌ 存档数据为空或无效，创建默认存档');
      return createMinimalSaveDataV3();
    }

    // 统一入口：非V3一律先迁移到V3（迁移后只保留V3结构）
    const migrated = isSaveDataV3(saveData) ? (saveData as any) : migrateSaveDataToLatest(saveData as any).migrated;
    const repaired = cloneDeep(migrated) as any;

    // 运行期校验（允许轻微修复，但结构必须是 V3 五领域）
    const validation = validateSaveDataV3(repaired);
    if (!validation.isValid) {
      console.warn('[数据修复] ⚠️ 存档结构不合格，使用最小V3模板兜底:', validation.errors);
      return createMinimalSaveDataV3();
    }

    // --- 元数据 ---
    repaired.元数据 = repaired.元数据 && typeof repaired.元数据 === 'object' ? repaired.元数据 : createMinimalSaveDataV3().元数据;
    repaired.元数据.版本号 = 3;
    repaired.元数据.存档ID = repaired.元数据.存档ID || `save_${Date.now()}`;
    repaired.元数据.存档名 = repaired.元数据.存档名 || '自动存档';
    repaired.元数据.创建时间 = repaired.元数据.创建时间 || new Date().toISOString();
    repaired.元数据.更新时间 = new Date().toISOString();
    repaired.元数据.游戏时长秒 = validateNumber(repaired.元数据.游戏时长秒, 0, 999999999, 0);
    repaired.元数据.时间 = repairGameTime(repaired.元数据.时间);

    // --- 角色 ---
    repaired.角色 = repaired.角色 && typeof repaired.角色 === 'object' ? repaired.角色 : createMinimalSaveDataV3().角色;
    repaired.角色.身份 = repaired.角色.身份 && typeof repaired.角色.身份 === 'object' ? repaired.角色.身份 : createMinimalSaveDataV3().角色.身份;

    repaired.角色.身份.名字 = repaired.角色.身份.名字 || '无名官员';
    repaired.角色.身份.性别 = repaired.角色.身份.性别 || '男';
    if (!repaired.角色.身份.出生日期) repaired.角色.身份.出生日期 = { 年: 982, 月: 1, 日: 1 };
    if (!repaired.角色.身份.先天六司 || typeof repaired.角色.身份.先天六司 !== 'object') {
      repaired.角色.身份.先天六司 = { 根骨: 5, 灵性: 5, 悟性: 5, 气运: 5, 魅力: 5, 心性: 5 };
    } else {
      const attrs = repaired.角色.身份.先天六司;
      attrs.根骨 = validateNumber(attrs.根骨, 0, 10, 5);
      attrs.灵性 = validateNumber(attrs.灵性, 0, 10, 5);
      attrs.悟性 = validateNumber(attrs.悟性, 0, 10, 5);
      attrs.气运 = validateNumber(attrs.气运, 0, 10, 5);
      attrs.魅力 = validateNumber(attrs.魅力, 0, 10, 5);
      attrs.心性 = validateNumber(attrs.心性, 0, 10, 5);
    }
    if (!repaired.角色.身份.后天六司 || typeof repaired.角色.身份.后天六司 !== 'object') {
      repaired.角色.身份.后天六司 = { 根骨: 0, 灵性: 0, 悟性: 0, 气运: 0, 魅力: 0, 心性: 0 };
    }

    // --- 属性 ---
    if (!repaired.角色.属性 || typeof repaired.角色.属性 !== 'object') {
      console.warn('[数据修复] 属性缺失，创建默认值');
      repaired.角色.属性 = createDefaultAttributes();
    } else {
      repaired.角色.属性.境界 = repairRealm(repaired.角色.属性.境界);
      repaired.角色.属性.健康 = repairValuePair(repaired.角色.属性.健康, 100, 100);
      repaired.角色.属性.威望 = repairValuePair(repaired.角色.属性.威望, 50, 50);
      repaired.角色.属性.智慧 = repairValuePair(repaired.角色.属性.智慧, 30, 30);
      repaired.角色.属性.寿命 = repairValuePair(repaired.角色.属性.寿命, 18, 80);
      repaired.角色.属性.声望 = validateNumber(repaired.角色.属性.声望, 0, 999999, 0);
    }

    // --- 位置 ---
    if (!repaired.角色.位置 || typeof repaired.角色.位置 !== 'object') {
      repaired.角色.位置 = createDefaultLocation();
    } else if (!repaired.角色.位置.描述) {
      repaired.角色.位置.描述 = '朝天大陆·无名之地';
    }

    // --- 效果 ---
    if (!Array.isArray(repaired.角色.效果)) repaired.角色.效果 = [];

    // --- 装备（槽位只存物品ID）---
    const defaultEquipment = { 装备1: null, 装备2: null, 装备3: null, 装备4: null, 装备5: null, 装备6: null };
    if (!repaired.角色.装备 || typeof repaired.角色.装备 !== 'object') repaired.角色.装备 = { ...defaultEquipment };
    for (let i = 1; i <= 6; i++) {
      const key = `装备${i}`;
      const slotValue = repaired.角色.装备[key];
      if (slotValue == null) repaired.角色.装备[key] = null;
      else if (typeof slotValue === 'string') repaired.角色.装备[key] = slotValue;
      else if (typeof slotValue === 'object' && slotValue !== null && '物品ID' in slotValue) {
        repaired.角色.装备[key] = String((slotValue as any).物品ID || '');
      } else repaired.角色.装备[key] = null;
    }

    // --- 背包 ---
    if (!repaired.角色.背包 || typeof repaired.角色.背包 !== 'object') {
      // 县令主题：默认使用银两，保留灵石向后兼容
      repaired.角色.背包 = {
        银两: { 下品: 0, 中品: 0, 上品: 0, 极品: 0 },
        灵石: { 下品: 0, 中品: 0, 上品: 0, 极品: 0 },  // 向后兼容
        物品: {}
      };
    } else {
      // 县令主题：确保银两字段存在（主要货币）
      if (!repaired.角色.背包.银两 || typeof repaired.角色.背包.银两 !== 'object') {
        // 如果没有银两但有灵石，从灵石复制数据
        if (repaired.角色.背包.灵石 && typeof repaired.角色.背包.灵石 === 'object') {
          console.log('[数据修复] 从灵石复制数据到银两字段');
          repaired.角色.背包.银两 = { ...repaired.角色.背包.灵石 };
        } else {
          console.log('[数据修复] 创建默认银两数据');
          repaired.角色.背包.银两 = { 下品: 0, 中品: 0, 上品: 0, 极品: 0 };
        }
      } else {
        // 规范化银两数值
        repaired.角色.背包.银两.下品 = validateNumber(repaired.角色.背包.银两.下品, 0, 999999999, 0);
        repaired.角色.背包.银两.中品 = validateNumber(repaired.角色.背包.银两.中品, 0, 999999999, 0);
        repaired.角色.背包.银两.上品 = validateNumber(repaired.角色.背包.银两.上品, 0, 999999999, 0);
        repaired.角色.背包.银两.极品 = validateNumber(repaired.角色.背包.银两.极品, 0, 999999999, 0);
      }

      // 修仙主题：保留灵石字段向后兼容
      if (!repaired.角色.背包.灵石 || typeof repaired.角色.背包.灵石 !== 'object') {
        // 如果没有灵石但有银两，从银两复制数据
        if (repaired.角色.背包.银两 && typeof repaired.角色.背包.银两 === 'object') {
          repaired.角色.背包.灵石 = { ...repaired.角色.背包.银两 };
        } else {
          repaired.角色.背包.灵石 = { 下品: 0, 中品: 0, 上品: 0, 极品: 0 };
        }
      } else {
        repaired.角色.背包.灵石.下品 = validateNumber(repaired.角色.背包.灵石.下品, 0, 999999999, 0);
        repaired.角色.背包.灵石.中品 = validateNumber(repaired.角色.背包.灵石.中品, 0, 999999999, 0);
        repaired.角色.背包.灵石.上品 = validateNumber(repaired.角色.背包.灵石.上品, 0, 999999999, 0);
        repaired.角色.背包.灵石.极品 = validateNumber(repaired.角色.背包.灵石.极品, 0, 999999999, 0);
      }

      if (!repaired.角色.背包.物品 || typeof repaired.角色.背包.物品 !== 'object') {
        repaired.角色.背包.物品 = {};
      } else {
        const validItems: Record<string, Item> = {};
        for (const [id, item] of Object.entries(repaired.角色.背包.物品 as Record<string, unknown>)) {
          const rawItem = item as any;
          if (rawItem && typeof rawItem === 'object' && typeof rawItem.名称 === 'string' && rawItem.名称.trim()) {
            validItems[id] = repairItem(rawItem as Item);
          }
        }
        repaired.角色.背包.物品 = validItems;
      }
    }

    // --- 背包.货币（新货币系统，兼容旧存档） ---
    normalizeBackpackCurrencies(repaired.角色.背包 as any);

    // --- 社交.关系 ---
    const playerName = typeof repaired.角色?.身份?.名字 === 'string' ? repaired.角色.身份.名字.trim() : '';
    if (!repaired.社交 || typeof repaired.社交 !== 'object') repaired.社交 = createMinimalSaveDataV3().社交;
    if (!repaired.社交.关系 || typeof repaired.社交.关系 !== 'object') {
      repaired.社交.关系 = {};
    } else {
      const raw = repaired.社交.关系 as Record<string, unknown>;
      const validNpcs: Record<string, NpcProfile> = {};

      for (const [key, value] of Object.entries(raw)) {
        if (key.startsWith('_')) continue;
        if (!value || typeof value !== 'object') continue;

        const npc = value as any;
        const nameFromValue = typeof npc.名字 === 'string' ? npc.名字.trim() : '';
        const nameFromKey = typeof key === 'string' ? key.trim() : '';
        const finalName = nameFromValue || nameFromKey;
        if (!finalName) continue;
        if (playerName && finalName === playerName) continue;

        npc.名字 = finalName;
        validNpcs[finalName] = repairNpc(npc as NpcProfile);
      }

      repaired.社交.关系 = validNpcs;
    }

    // --- 社交.关系矩阵（可选；用于 NPC-NPC 关系网） ---
    const normalizeString = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
    const normalizeStringArray = (v: unknown): string[] => {
      if (!Array.isArray(v)) return [];
      const seen = new Set<string>();
      const out: string[] = [];
      for (const item of v) {
        const s = normalizeString(item);
        if (!s || seen.has(s)) continue;
        seen.add(s);
        out.push(s);
      }
      return out;
    };

    const rawMatrix = (repaired.社交 as any).关系矩阵;
    const npcNames = Object.keys((repaired.社交.关系 as any) || {}).filter((n) => typeof n === 'string' && n.trim());

    if (rawMatrix == null) {
      // 不强制要求该字段，但如果已有 NPC，则给一个轻量默认值，方便后续增量维护
      if (npcNames.length > 0) {
        (repaired.社交 as any).关系矩阵 = { version: 1, nodes: npcNames.slice(0, 300), edges: [] };
      }
    } else if (typeof rawMatrix !== 'object' || Array.isArray(rawMatrix)) {
      delete (repaired.社交 as any).关系矩阵;
    } else {
      const matrix = rawMatrix as any;
      const nodes = normalizeStringArray(matrix.nodes);
      const mergedNodes: string[] = [];
      {
        const seen = new Set<string>();
        for (const n of [...nodes, ...npcNames]) {
          const name = normalizeString(n);
          if (!name || seen.has(name)) continue;
          seen.add(name);
          mergedNodes.push(name);
          if (mergedNodes.length >= 300) break;
        }
      }

      const edgesRaw = Array.isArray(matrix.edges) ? matrix.edges : [];
      const edges: Array<{
        from: string;
        to: string;
        relation?: string;
        score?: number;
        tags?: string[];
        updatedAt?: string;
      }> = [];

      const seenEdge = new Set<string>();
      for (const item of edgesRaw) {
        if (!item || typeof item !== 'object') continue;
        const from = normalizeString((item as any).from);
        const to = normalizeString((item as any).to);
        if (!from || !to || from === to) continue;

        const key = `${from}::${to}`;
        if (seenEdge.has(key)) continue;
        seenEdge.add(key);

        const relation = normalizeString((item as any).relation) || undefined;
        const score = typeof (item as any).score === 'number' && Number.isFinite((item as any).score) ? (item as any).score : undefined;
        const tags = normalizeStringArray((item as any).tags);
        const updatedAt = normalizeString((item as any).updatedAt) || undefined;

        edges.push({
          from,
          to,
          relation,
          score,
          tags: tags.length ? tags : undefined,
          updatedAt,
        });
        if (edges.length >= 2000) break;
      }

      (repaired.社交 as any).关系矩阵 = {
        version: typeof matrix.version === 'number' && Number.isFinite(matrix.version) ? matrix.version : 1,
        nodes: mergedNodes.length ? mergedNodes : npcNames.slice(0, 300),
        edges,
      };
    }

    // --- 社交.记忆 ---
    if (!repaired.社交.记忆 || typeof repaired.社交.记忆 !== 'object') {
      repaired.社交.记忆 = { 短期记忆: [], 中期记忆: [], 长期记忆: [], 隐式中期记忆: [] };
    } else {
      repaired.社交.记忆.短期记忆 = Array.isArray(repaired.社交.记忆.短期记忆) ? repaired.社交.记忆.短期记忆 : [];
      repaired.社交.记忆.中期记忆 = Array.isArray(repaired.社交.记忆.中期记忆) ? repaired.社交.记忆.中期记忆 : [];
      repaired.社交.记忆.长期记忆 = Array.isArray(repaired.社交.记忆.长期记忆) ? repaired.社交.记忆.长期记忆 : [];
      repaired.社交.记忆.隐式中期记忆 = Array.isArray(repaired.社交.记忆.隐式中期记忆) ? repaired.社交.记忆.隐式中期记忆 : [];
    }

    // --- 系统.历史 ---
    if (!repaired.系统 || typeof repaired.系统 !== 'object') repaired.系统 = createMinimalSaveDataV3().系统;
    if (!repaired.系统.历史 || typeof repaired.系统.历史 !== 'object') repaired.系统.历史 = { 叙事: [] };
    if (!Array.isArray(repaired.系统.历史.叙事)) repaired.系统.历史.叙事 = [];

    // --- 角色子模块最小化补全 ---
    if (!repaired.角色.大道 || typeof repaired.角色.大道 !== 'object') repaired.角色.大道 = { 大道列表: {} };
    if (!repaired.角色.方略 || typeof repaired.角色.方略 !== 'object') repaired.角色.方略 = { 当前方略ID: null, 方略进度: {}, 方略套装: { 主修: null, 辅修: [] } };
    if (!repaired.角色.施政 || typeof repaired.角色.施政 !== 'object') repaired.角色.施政 = { 施政方略: null, 施政状态: { 模式: '未施政' } };
    if (!repaired.角色.技能 || typeof repaired.角色.技能 !== 'object') repaired.角色.技能 = { 掌握技能: [], 装备栏: [], 冷却: {} };

    // --- 社交.事件 ---
    if (!repaired.社交.事件 || typeof repaired.社交.事件 !== 'object') {
      repaired.社交.事件 = {
        配置: { 启用随机事件: true, 最小间隔年: 1, 最大间隔年: 10, 事件提示词: '' },
        下次事件时间: null,
        事件记录: [],
      };
    } else {
      if (!repaired.社交.事件.配置 || typeof repaired.社交.事件.配置 !== 'object') {
        repaired.社交.事件.配置 = { 启用随机事件: true, 最小间隔年: 1, 最大间隔年: 10, 事件提示词: '' };
      }
      if (!Array.isArray(repaired.社交.事件.事件记录)) repaired.社交.事件.事件记录 = [];
      if (repaired.社交.事件.下次事件时间 && typeof repaired.社交.事件.下次事件时间 !== 'object') {
        repaired.社交.事件.下次事件时间 = null;
      }
    }

    // --- 施政.施政方略引用校验 ---
    if (repaired.角色.施政?.施政方略 && typeof repaired.角色.施政.施政方略 === 'object') {
      const technique = repaired.角色.施政.施政方略 as any;
      if (!technique.物品ID) {
        repaired.角色.施政.施政方略 = null;
      } else {
        const referencedItem = repaired.角色?.背包?.物品?.[technique.物品ID];
        if (!referencedItem || referencedItem.类型 !== '方略') {
          repaired.角色.施政.施政方略 = null;
        } else if (!technique.名称 || technique.名称 !== referencedItem.名称) {
          technique.名称 = referencedItem.名称;
        }
      }
    }


    console.log('[数据修复] ✅ 存档数据修复完成');
    return repaired;
  } catch (error) {
    console.error('[数据修复] ❌ 修复过程发生严重错误，返回默认存档:', error);
    return createMinimalSaveDataV3();
  }
}

/**
 * 根据官品和阶段生成县令小说风格的晋升描述
 */
function getDefaultBreakthroughDescription(realmName?: string, stage?: string): string {
  const name = realmName || '凡人';
  const currentStage = stage || '';

  // 凡人官品
  if (name === '凡人') {
    return '初入仕途，感悟政理之道，踏上县令第一步';
  }

  // 定义各官品的晋升描述
  const realmDescriptions: Record<string, Record<string, string>> = {
    '九品': {
      '初期': '凝聚民心，打通政务经脉，冲击九品中期',
      '中期': '拓宽政务，提升威望容量，冲击九品后期',
      '后期': '凝实根基，感悟政理法则，冲击九品圆满',
      '圆满': '威望贯通周天，凝练根本源，准备八品',
      '': '搬运周天，凝聚威望，夯实九品根基'
    },
    '八品': {
      '初期': '凝聚政台，将威望压缩凝实，冲击八品中期',
      '中期': '稳固政基，扩充容量，冲击八品后期',
      '后期': '感悟政理法则，凝练七品雏形，冲击八品圆满',
      '圆满': '政基圆满，破而后立，将威望凝聚成七品',
      '': '夯实政基，压缩威望，提升八品境界'
    },
    '七品': {
      '初期': '凝实七品，刻画符文，冲击七品中期',
      '中期': '淬炼七品，领悟政韵，冲击七品后期',
      '后期': '七品大成，蕴养智慧，冲击七品圆满',
      '圆满': '破品升六，智慧出窍，踏入六品境界',
      '': '淬炼七品本源，刻画政理符文，提升七品品质'
    },
    '六品': {
      '初期': '稳固六品，凝练智慧，冲击六品中期',
      '中期': '六品壮大，感悟大道，冲击六品后期',
      '后期': '六品大成，凝练智慧，冲击六品圆满',
      '圆满': '智慧蜕变，体魄成圣，准备五品',
      '': '壮大六品，淬炼智慧，提升六品境界'
    },
    '五品': {
      '初期': '智慧合一，领悟法则，冲击五品中期',
      '中期': '凝聚政格，参悟天道，冲击五品后期',
      '后期': '政格大成，融合法则，冲击五品圆满',
      '圆满': '炼虚合道，体魄不灭，准备四品',
      '': '感悟政理法则，凝练政格，提升五品境界'
    },
    '四品': {
      '初期': '炼虚化实，虚空凝形，冲击四品中期',
      '中期': '虚实合一，参悟空间法则，冲击四品后期',
      '后期': '撕裂虚空，掌控空间，冲击四品圆满',
      '圆满': '虚空大成，与天地合一，准备三品',
      '': '炼化虚空之力，感悟空间奥义，提升四品境界'
    },
    '三品': {
      '初期': '天人合一，与天地共鸣，冲击三品中期',
      '中期': '领悟天道，掌控天地之力，冲击三品后期',
      '后期': '天地认可，法则加身，冲击三品圆满',
      '圆满': '与道合真，天劫将至，准备二品',
      '': '感悟天地大道，与天地共鸣，提升三品境界'
    },
    '二品': {
      '初期': '大道圆满，法则入体，冲击二品中期',
      '中期': '天道认可，参悟仙道，冲击二品后期',
      '后期': '仙韵初现，准备一品，冲击二品圆满',
      '圆满': '渡九九天劫，飞升仙界，超脱凡尘',
      '': '感悟仙道奥义，凝练仙体，准备一品'
    }
  };

  // 获取对应官品的描述
  const stageDescriptions = realmDescriptions[name];
  if (stageDescriptions) {
    return stageDescriptions[currentStage] || stageDescriptions[''] || `感悟${name}官品奥义，提升政绩官品`;
  }

  // 未知官品的通用描述
  const genericDescriptions: Record<string, string> = {
    '初期': `凝练${name}初期根基，冲击${name}中期`,
    '中期': `稳固${name}中期政绩，冲击${name}后期`,
    '后期': `圆满${name}后期官品，冲击${name}圆满`,
    '圆满': `${name}圆满大成，准备晋升下一官品`,
    '': `感悟${name}官品奥义，提升政绩`
  };

  return genericDescriptions[currentStage] || `感悟${name}官品，提升政绩`;
}

/**
 * 修复官品数据（县令主题：境界->官品）
 * - 将旧境界映射到新官品
 * - 修复缺失字段
 */
function repairRealm(realm: any): Realm {
  // 处理字符串格式
  if (typeof realm === 'string') {
    const mappedName = mapRealmToRank(realm);
    return {
      名称: mappedName,
      阶段: '初期',
      当前进度: 0,
      下一级所需: 100,
      突破描述: getDefaultBreakthroughDescription(mappedName, '初期')
    };
  }

  // 处理对象格式
  if (!realm || typeof realm !== 'object') {
    return {
      名称: "九品",
      阶段: "初期",
      当前进度: 0,
      下一级所需: 100,
      突破描述: '初入仕途，感悟政理之道，踏上县令第一步'
    };
  }

  // 修复境界名称（映射旧境界到新官品）
  let name = realm.名称 || "九品";
  if (typeof name === 'string') {
    name = mapRealmToRank(name);
  }

  const stage = realm.阶段 !== undefined ? realm.阶段 : "初期";
  const progress = validateNumber(realm.当前进度, 0, 999999999, 0);
  const required = validateNumber(realm.下一级所需, 1, 999999999, 100);

  return {
    名称: name,
    阶段: stage,
    当前进度: progress,
    下一级所需: required,
    突破描述: realm.突破描述 || getDefaultBreakthroughDescription(name, stage)
  };
}

/**
 * 修复ValuePair数据
 */
function repairValuePair(pair: any, defaultCurrent: number, defaultMax: number): { 当前: number; 上限: number } {
  if (!pair || typeof pair !== 'object') {
    return { 当前: defaultCurrent, 上限: defaultMax };
  }

  const current = validateNumber(pair.当前, 0, 999999999, defaultCurrent);
  const max = validateNumber(pair.上限, 1, 999999999, defaultMax);

  return {
    当前: Math.min(current, max), // 确保当前值不超过上限
    上限: max
  };
}

/**
 * 修复游戏时间
 */
function repairGameTime(time: any): GameTime {
  if (!time || typeof time !== 'object') {
    return { 年: 1000, 月: 1, 日: 1, 小时: 8, 分钟: 0 };
  }

  return {
    年: validateNumber(time.年, 1, 999999, 1000),
    月: validateNumber(time.月, 1, 12, 1),
    日: validateNumber(time.日, 1, 30, 1),
    小时: validateNumber(time.小时, 0, 23, 8),
    分钟: validateNumber(time.分钟, 0, 59, 0)
  };
}

/**
 * 修复物品数据
 * - 规范化物品类型（功法→方略，丹药→药品）
 * - 验证并修复品质、数量等字段
 */
function repairItem(item: Item): Item {
  const repaired = { ...item };

  // 确保基础字段
  repaired.物品ID = repaired.物品ID || `item_${Date.now()}`;
  repaired.名称 = repaired.名称 || '未命名物品';
  repaired.数量 = validateNumber(repaired.数量, 1, 999999, 1);

  // 修复品质
  if (!repaired.品质 || typeof repaired.品质 !== 'object') {
    repaired.品质 = { quality: '民', grade: 1 };
  } else {
    const validQualities = ['皇', '宫', '府', '州', '县', '乡', '民'];
    if (!validQualities.includes(repaired.品质.quality)) {
      repaired.品质.quality = '民';
    }
    repaired.品质.grade = validateNumber(repaired.品质.grade, 0, 10, 1) as GradeType;
  }

  // 规范化物品类型（功法→方略，丹药→药品）
  const itemType = (repaired as any).类型;
  if (typeof itemType === 'string') {
    (repaired as any).类型 = normalizeItemType(itemType);
  } else {
    // @ts-ignore - 类型推断问题，使用默认值
    (repaired as any).类型 = '其他';
  }

  return repaired;
}

/**
 * 修复NPC数据
 */
function repairNpc(npc: NpcProfile): NpcProfile {
  const repaired = { ...npc };

  // 确保基础字段
  repaired.名字 = repaired.名字 || '无名';
  repaired.性别 = repaired.性别 || '男';

  // 年龄已自动从出生日期计算,删除年龄字段

  // 修复官品
  repaired.境界 = repairRealm(repaired.境界);

  // 修复先天六司
  if (!repaired.先天六司 || typeof repaired.先天六司 !== 'object') {
    repaired.先天六司 = { 根骨: 5, 灵性: 5, 悟性: 5, 气运: 5, 魅力: 5, 心性: 5 };
  }

  // 修复核心数值（整合为属性对象，旧存档自动补上默认值）
  if (!repaired.属性 || typeof repaired.属性 !== 'object') {
    repaired.属性 = {
      气血: { 当前: 100, 上限: 100 },
      灵气: { 当前: 50, 上限: 50 },  // 县令主题: 民心/威望
      神识: { 当前: 30, 上限: 30 },  // 县令主题: 智慧/洞察
      寿元上限: 100
    };
  } else {
    repaired.属性.气血 = repairValuePair(repaired.属性.气血, 100, 100);
    repaired.属性.灵气 = repairValuePair((repaired.属性 as any).灵气, 50, 50);
    repaired.属性.神识 = repairValuePair((repaired.属性 as any).神识, 30, 30);
    repaired.属性.寿元上限 = typeof repaired.属性.寿元上限 === 'number' ? repaired.属性.寿元上限 : 100;
  }
  // 兼容旧格式：如果有旧的独立字段，迁移到属性对象
  if ((repaired as any).气血 || (repaired as any).灵气 || (repaired as any).神识 || (repaired as any).寿元) {
    repaired.属性 = {
      气血: repairValuePair((repaired as any).气血, 100, 100),
      灵气: repairValuePair((repaired as any).灵气, 50, 50),
      神识: repairValuePair((repaired as any).神识, 30, 30),
      寿元上限: (repaired as any).寿元?.上限 ?? 100
    };
    delete (repaired as any).气血;
    delete (repaired as any).灵气;
    delete (repaired as any).神识;
    delete (repaired as any).寿元;
  }

  // 修复位置
  if (!repaired.当前位置 || typeof repaired.当前位置 !== 'object') {
    repaired.当前位置 = { 描述: '朝天大陆·无名之地' };
  } else if (!repaired.当前位置.描述) {
    repaired.当前位置.描述 = '朝天大陆·无名之地';
  }

  // 修复好感度
  repaired.好感度 = validateNumber(repaired.好感度, -100, 100, 0);

  // 修复记忆
  if (!Array.isArray(repaired.记忆)) {
    repaired.记忆 = [];
  }

  // 修复背包
  if (!repaired.背包 || typeof repaired.背包 !== 'object') {
    repaired.背包 = {
      灵石: { 下品: 0, 中品: 0, 上品: 0, 极品: 0 },
      物品: {}
    };
  }

  return repaired;
}

/**
 * 验证数字，确保在范围内
 */
function validateNumber(value: any, min: number, max: number, defaultValue: number): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return Math.max(min, Math.min(max, value));
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      return Math.max(min, Math.min(max, parsed));
    }
  }
  return defaultValue;
}

/**
 * 创建默认玩家状态（县令主题）
 */
function createDefaultAttributes(): PlayerAttributes {
  return {
    境界: {
      名称: '九品',  // 县令主题：默认官品为九品
      阶段: '初期',
      当前进度: 0,
      下一级所需: 100,
      突破描述: '初入仕途，感悟政理之道，踏上县令第一步'
    },
    声望: 0,
    气血: { 当前: 100, 上限: 100 },
    灵气: { 当前: 50, 上限: 50 },
    神识: { 当前: 30, 上限: 30 },
    寿命: { 当前: 18, 上限: 80 },
  } as PlayerAttributes;
}

function createDefaultLocation(): PlayerLocation {
  return { 描述: '朝天大陆·无名之地', x: 5000, y: 5000 } as PlayerLocation;
}

/**
 * 创建最小可用存档
 */
function createMinimalSaveData(): SaveData {
  return createMinimalSaveDataV3();
}

function createMinimalSaveDataV3(): SaveData {
  const nowIso = new Date().toISOString();
  const time = { 年: 1000, 月: 1, 日: 1, 小时: 8, 分钟: 0 } as GameTime;
  return {
    元数据: {
      版本号: 3,
      存档ID: `save_${Date.now()}`,
      存档名: '自动存档',
      游戏版本: '0.0.0',
      创建时间: nowIso,
      更新时间: nowIso,
      游戏时长秒: 0,
      时间: time,
    },
    角色: {
      身份: {
        名字: '无名官员',
        性别: '男',
        出生日期: { 年: 982, 月: 1, 日: 1 },
        种族: '人族',
        世界: '朝天大陆' as any,
        天资: '凡人' as any,
        出生: '平民',
        灵根: '五行杂才干',
        天赋: [],
        先天六司: { 根骨: 5, 灵性: 5, 悟性: 5, 气运: 5, 魅力: 5, 心性: 5 },
        后天六司: { 根骨: 0, 灵性: 0, 悟性: 0, 气运: 0, 魅力: 0, 心性: 0 },
      },
      属性: createDefaultAttributes(),
      位置: createDefaultLocation(),
      效果: [],
      身体: { 总体状况: '', 部位: {} },
      背包: {
        银两: { 下品: 0, 中品: 0, 上品: 0, 极品: 0 },  // 县令主题：主要货币
        灵石: { 下品: 0, 中品: 0, 上品: 0, 极品: 0 },  // 修仙主题：向后兼容
        物品: {}
      },
      装备: { 装备1: null, 装备2: null, 装备3: null, 装备4: null, 装备5: null, 装备6: null },
      方略: { 当前方略ID: null, 方略进度: {}, 方略套装: { 主修: null, 辅修: [] } },
      施政: { 施政方略: null, 施政状态: { 模式: '未施政' } },
      大道: { 大道列表: {} },
      技能: { 掌握技能: [], 装备栏: [], 冷却: {} },
    },
    社交: {
      关系: {},
      衙门: null,
      事件: {
        配置: { 启用随机事件: true, 最小间隔年: 1, 最大间隔年: 10, 事件提示词: '' },
        下次事件时间: null,
        事件记录: [],
      },
      记忆: { 短期记忆: [], 中期记忆: [], 长期记忆: [], 隐式中期记忆: [] },
    },
    世界: {
      信息: {
        世界名称: '朝天大陆',
        大陆信息: [],
        势力信息: [],
        地点信息: [],
        生成时间: nowIso,
        世界背景: '',
        世界纪元: '',
        特殊设定: [],
        版本: 'v1',
      },
      状态: { 环境: {}, 事件: [], 历史: [], NPC状态: {} },
    },
    系统: {
      配置: {},
      设置: {},
      缓存: { 掌握技能: [], 临时统计: {} },
      行动队列: { actions: [] },
      历史: { 叙事: [] },
      扩展: {},
    },
  } as any;
}
