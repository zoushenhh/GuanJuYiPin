/**
 * @fileoverview 数据层模块统一导出
 * 县令模拟器 - Phase 2 数据层替换
 *
 * 新数据文件：
 * - gov-building.ts     政府建筑数据
 * - official-ranks.ts    官阶品级数据
 * - policies.ts          政令方略数据
 * - incidents.ts         突发事件数据
 * - governance-schools.ts 官学体系数据（原 thousandDaoData）
 * - bureaucracy.ts       官僚制度数据（原 sectSystemFactory）
 * - realms.ts            城市等级数据（已更新）
 * - thousandDaoData.ts   治国方略系统（已更新）
 *
 * 保留文件：
 * - itemQuality.ts       物品品质系统
 * - creationData.ts      角色创建数据
 * - specialNpcs.ts       特殊NPC数据
 */

// ============================================================================
// 新建数据文件导出（宋代官制数据）
// ============================================================================

// 政府建筑
export * from './gov-building';

// 官阶品级
export * from './official-ranks';

// 政令方略
export * from './policies';

// 突发事件
export * from './incidents';

// 官学体系
export * from './governance-schools';

// 官僚制度
export * from './bureaucracy';

// ============================================================================
// 已更新文件导出
// ============================================================================

// 城市等级与官品系统
export * from './realms';

// 治国方略系统（AI动态生成）
export * from './thousandDaoData';

// ============================================================================
// 保留文件导出（原有数据，部分已适配县令主题）
// ============================================================================

// 物品品质系统
export * from './itemQuality';

// 角色创建数据（世界、天资、出身、才能、天赋）
export * from './creationData';

// 特殊NPC数据
export * from './specialNpcs';

// ============================================================================
// 数据汇总类型
// ============================================================================

/** 数据模块类型汇总 */
export interface DataModules {
  // 政府建筑
  govBuildings: typeof import('./gov-building');
  // 官阶品级
  officialRanks: typeof import('./official-ranks');
  // 政令方略
  policies: typeof import('./policies');
  // 突发事件
  incidents: typeof import('./incidents');
  // 官学体系
  governanceSchools: typeof import('./governance-schools');
  // 官僚制度
  bureaucracy: typeof import('./bureaucracy');
  // 城市等级
  realms: typeof import('./realms');
  // 治国方略
  thousandDao: typeof import('./thousandDaoData');
  // 物品品质
  itemQuality: typeof import('./itemQuality');
  // 角色创建
  creationData: typeof import('./creationData');
  // 特殊NPC
  specialNpcs: typeof import('./specialNpcs');
}

// ============================================================================
// 便捷导出（常用集合）
// ============================================================================

/** 所有政府建筑 */
export const ALL_GOV_BUILDINGS = [
  ...require('./gov-building').BASIC_BUILDINGS,
  ...require('./gov-building').ADVANCED_BUILDINGS,
  ...require('./gov-building').ELITE_BUILDINGS
];

/** 所有政令 */
export const ALL_POLICIES_LIST = require('./policies').ALL_POLICIES;

/** 所有突发事件 */
export const ALL_INCIDENTS_LIST = require('./incidents').ALL_INCIDENTS;

/** 所有官品（文武） */
export const ALL_RANKS_LIST = [
  ...require('./official-ranks').ALL_CIVIL_RANKS,
  ...require('./official-ranks').MILITARY_RANKS
];
