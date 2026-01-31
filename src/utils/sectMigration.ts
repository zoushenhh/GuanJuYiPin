/**
 * Sect Migration (县令主题: 衙门迁移)
 * 临时实现 - 原 sect (宗门) 相关功能已被衙门系统替代
 */

import type { SaveData } from '@/types/game';

export const SECT_SYSTEM_VERSION = 2;

export interface SectMigrationCheck {
  needed: boolean;
  fromVersion: number;
  toVersion: number;
  reasons: string[];
}

/**
 * 检测衙门迁移需求（临时实现）
 * TODO: 实现完整的衙门迁移检测逻辑
 */
export function detectSectMigration(saveData: SaveData | null): SectMigrationCheck {
  return {
    needed: false,
    fromVersion: 0,
    toVersion: SECT_SYSTEM_VERSION,
    reasons: []
  };
}

/**
 * 迁移衙门存档数据（临时实现）
 * TODO: 实现完整的衙门迁移逻辑
 */
export function migrateSectSaveData(saveData: SaveData): SaveData {
  // 临时直接返回原数据
  return saveData;
}
