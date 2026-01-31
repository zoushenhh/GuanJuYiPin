/**
 * 政府领导检测工具函数
 * 用于检测玩家是否是政府领导（通过领导层信息或governmentMemberInfo）
 */

import type { WorldFaction, GovernmentMemberInfo } from '@/types/game';

export interface PlayerGovernmentLeaderInfo {
  isLeader: boolean;
  isMaster: boolean; // 是否是最高领导（县令/长官）
  position: string;
  officeName: string;
  office: WorldFaction | null;
}

/**
 * 检测玩家在政府中的领导地位
 * @param playerName 玩家名字
 * @param offices 所有政府列表
 * @param governmentMemberInfo 玩家政府成员信息
 */
export function detectPlayerGovernmentLeadership(
  playerName: string,
  offices: WorldFaction[],
  governmentMemberInfo?: GovernmentMemberInfo | null
): PlayerGovernmentLeaderInfo {
  const result: PlayerGovernmentLeaderInfo = {
    isLeader: false,
    isMaster: false,
    position: governmentMemberInfo?.职位 || '',
    officeName: governmentMemberInfo?.宗门名称 || '',
    office: null
  };

  if (!playerName) return result;

  // 1. 先检查政府领导层中是否有玩家名字
  for (const office of offices) {
    const leadership = (office as any)?.领导层 || (office as any)?.leadership;
    if (!leadership) continue;

    // 检查县令/长官
    if (leadership.县令 === playerName || leadership.长官 === playerName) {
      result.isLeader = true;
      result.isMaster = true;
      result.position = '县令';
      result.officeName = office.名称;
      result.office = office;
      return result;
    }

    // 检查副县令/副长官
    if (leadership.副县令 === playerName || leadership.副长官 === playerName) {
      result.isLeader = true;
      result.isMaster = false;
      result.position = '副县令';
      result.officeName = office.名称;
      result.office = office;
      return result;
    }
  }

  // 2. 再检查 governmentMemberInfo 的职位
  if (governmentMemberInfo?.职位) {
    const pos = governmentMemberInfo.职位;
    if (['县令', '长官', '副县令', '副长官'].includes(pos)) {
      result.isLeader = true;
      result.isMaster = ['县令', '长官'].includes(pos);
      result.position = pos;
      result.officeName = governmentMemberInfo.宗门名称;
      // 找到对应政府
      result.office = offices.find(s => s.名称 === governmentMemberInfo.宗门名称) || null;
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
