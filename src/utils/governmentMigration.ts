import { cloneDeep } from 'lodash';
import type { SaveData, SectSystemV2, WorldFaction } from '@/types/game';
import { validateAndFixSectDataList } from '@/utils/worldGeneration/sectDataValidator';

export const GOVERNMENT_SYSTEM_VERSION = 2;

export interface GovernmentMigrationCheck {
  needed: boolean;
  fromVersion: number;
  toVersion: number;
  reasons: string[];
}

const collectMembersByOffice = (saveData: SaveData): Record<string, string[]> => {
  const membersByOffice: Record<string, string[]> = {};
  const relationships = (saveData as any).社交?.关系 ?? {};

  Object.entries(relationships).forEach(([key, npc]) => {
    if (!npc || typeof npc !== 'object') return;
    const officeName = (npc as any).势力归属 || (npc as any).衙门 || (npc as any).势力;
    if (!officeName) return;
    const memberName = (npc as any).名字 || key;
    if (!membersByOffice[officeName]) {
      membersByOffice[officeName] = [];
    }
    if (!membersByOffice[officeName].includes(memberName)) {
      membersByOffice[officeName].push(memberName);
    }
  });

  return membersByOffice;
};

export const detectGovernmentMigration = (saveData: SaveData | null): GovernmentMigrationCheck => {
  const check: GovernmentMigrationCheck = {
    needed: false,
    fromVersion: 0,
    toVersion: GOVERNMENT_SYSTEM_VERSION,
    reasons: []
  };

  if (!saveData) {
    return check;
  }

  const governmentSystem = ((saveData as any).社交?.宗门 ?? null) as (SectSystemV2 & { 成员信息?: any }) | null;

  // V3 存档中 宗门: null 是合法状态（玩家未加入任何政府），不需要迁移
  // 空对象 {} 也视为"未加入政府"状态，不需要迁移
  const isEmptyObject = governmentSystem !== null && typeof governmentSystem === 'object' && Object.keys(governmentSystem).length === 0;

  // 只有当存在旧版字段或版本不匹配时才需要迁移
  const hasLegacyOfficeFields = !!(governmentSystem as any)?.成员信息?.衙门名称;
  // 空对象不算版本不匹配
  const hasVersionMismatch = governmentSystem !== null && !isEmptyObject && governmentSystem.版本 !== GOVERNMENT_SYSTEM_VERSION;

  // 如果政府系统为空（null或空对象）且没有旧版字段，说明是新建的 V3 存档，不需要迁移
  if ((!governmentSystem || isEmptyObject) && !hasLegacyOfficeFields) {
    return check;
  }

  const fromVersion = typeof governmentSystem?.版本 === 'number' ? governmentSystem.版本 : 0;
  check.fromVersion = fromVersion;

  // 只检测真正需要迁移的情况
  if (hasLegacyOfficeFields && !governmentSystem?.当前衙门) {
    check.reasons.push('玩家政府信息未同步到政府系统');
  }

  if (hasVersionMismatch) {
    check.reasons.push('政府系统版本不匹配');
  }

  check.needed = check.reasons.length > 0;
  return check;
};

const buildGovernmentSystem = (
  saveData: SaveData,
  factions: WorldFaction[],
  fromVersion: number
): SectSystemV2 => {
  const existing = (((saveData as any).社交?.宗门 ?? {}) as Partial<SectSystemV2>) as any;
  const officeMap: Record<string, WorldFaction> = {};

  factions.forEach((office) => {
    if (office?.名称) {
      officeMap[office.名称] = office;
    }
  });

  const playerOfficeName = (existing as any)?.成员信息?.衙门名称 ?? null;
  const membersByOffice = collectMembersByOffice(saveData);

  return {
    ...existing,
    版本: GOVERNMENT_SYSTEM_VERSION,
    当前宗门: existing.当前宗门 ?? playerOfficeName ?? null,
    宗门档案: {
      ...officeMap,
      ...(existing.宗门档案 || {})
    },
    宗门成员: existing.宗门成员 ?? membersByOffice,
    宗门藏经阁: existing.宗门藏经阁 ?? {},
    宗门贡献商店: existing.宗门贡献商店 ?? {},
    宗门任务: existing.宗门任务 ?? {},
    宗门任务状态: existing.宗门任务状态 ?? {},
    迁移记录: {
      来源版本: fromVersion,
      目标版本: GOVERNMENT_SYSTEM_VERSION,
      时间: new Date().toISOString(),
      说明: '由旧版政府字段迁移生成'
    }
  };
};

export const migrateGovernmentSaveData = (saveData: SaveData): SaveData => {
  const next = cloneDeep(saveData);
  const worldInfo = (next as any).世界?.信息 ?? null;
  const rawFactions = Array.isArray(worldInfo?.势力信息) ? worldInfo.势力信息 : [];
  const fixedFactions = validateAndFixSectDataList(cloneDeep(rawFactions));

  if (worldInfo?.势力信息) {
    worldInfo.势力信息 = fixedFactions;
  }

  const currentGovernmentSystem = ((next as any).社交?.宗门 ?? null) as SectSystemV2 | null;
  const fromVersion = typeof currentGovernmentSystem?.版本 === 'number' ? currentGovernmentSystem.版本 : 0;

  if (!(next as any).社交 || typeof (next as any).社交 !== 'object') {
    (next as any).社交 = {};
  }
  (next as any).社交.宗门 = buildGovernmentSystem(next, fixedFactions, fromVersion);

  return next;
};
