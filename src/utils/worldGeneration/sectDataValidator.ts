/**
 * Sect Data Validator (县令主题: 衙门数据验证器)
 * 临时实现 - 原 sect (宗门) 相关功能已被衙门系统替代
 */

import type { WorldFaction } from '@/types/game';

/**
 * 验证并修正衙门数据列表（临时实现）
 * TODO: 实现完整的衙门数据验证逻辑
 */
export function validateAndFixSectDataList(factions: WorldFaction[]): WorldFaction[] {
  if (!Array.isArray(factions)) {
    return [];
  }
  // 基本过滤: 移除无效数据
  return factions.filter(faction => faction && typeof faction === 'object');
}
