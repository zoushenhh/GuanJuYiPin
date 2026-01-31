/**
 * 衙门领导检测工具函数
 * 用于检测玩家是否是衙门领导（通过领导层信息或sectMemberInfo）
 */

import type { WorldFaction, SectMemberInfo } from '@/types/game';

export interface PlayerSectLeaderInfo {
  isLeader: boolean;
  isMaster: boolean; // 是否是最高领导（县令/长官）
  position: string;
  sectName: string;
  sect: WorldFaction | null;
}

/**
 * 检测玩家在衙门中的领导地位
 * @param playerName 玩家名字
 * @param sects 所有衙门列表
 * @param sectMemberInfo 玩家衙门成员信息
 */
export function detectPlayerSectLeadership(
  playerName: string,
  sects: WorldFaction[],
  sectMemberInfo?: SectMemberInfo | null
): PlayerSectLeaderInfo {
  const result: PlayerSectLeaderInfo = {
    isLeader: false,
    isMaster: false,
    position: sectMemberInfo?.职位 || '',
    sectName: sectMemberInfo?.宗门名称 || '',
    sect: null
  };

  if (!playerName) return result;

  // 1. 先检查衙门领导层中是否有玩家名字
  for (const sect of sects) {
    const leadership = (sect as any)?.领导层 || (sect as any)?.leadership;
    if (!leadership) continue;

    // 检查县令/长官
    if (leadership.县令 === playerName || leadership.长官 === playerName) {
      result.isLeader = true;
      result.isMaster = true;
      result.position = '县令';
      result.sectName = sect.名称;
      result.sect = sect;
      return result;
    }

    // 检查副县令/副长官
    if (leadership.副县令 === playerName || leadership.副长官 === playerName) {
      result.isLeader = true;
      result.isMaster = false;
      result.position = '副县令';
      result.sectName = sect.名称;
      result.sect = sect;
      return result;
    }
  }

  // 2. 再检查 sectMemberInfo 的职位
  if (sectMemberInfo?.职位) {
    const pos = sectMemberInfo.职位;
    if (['县令', '长官', '副县令', '副长官'].includes(pos)) {
      result.isLeader = true;
      result.isMaster = ['县令', '长官'].includes(pos);
      result.position = pos;
      result.sectName = sectMemberInfo.宗门名称;
      // 找到对应衙门
      result.sect = sects.find(s => s.名称 === sectMemberInfo.宗门名称) || null;
    }
  }

  return result;
}

/**
 * 简单判断是否是领导职位
 */
export function isLeaderPosition(position: string): boolean {
  return /长官|县令|副长官|副县令/.test(position);
}
