/**
 * @fileoverview Location related type definitions
 */

/**
 * Represents a location in the world
 * 使用游戏坐标系统 (0-10000)，不再使用经纬度
 */
export interface WorldLocation {
  id: string;
  name: string;
  type: LocationType | string; // Allow string for wider compatibility
  coordinates: { x: number; y: number }; // 游戏坐标 (0-10000)
  size?: number;
  color?: string;
  iconColor?: string;
  iconSize?: 'small' | 'medium' | 'large';
  faction?: string;
  description: string;
  描述?: string; // 中文字段兼容
  population?: string;
  governance?: string; // Added for birthplace info
  features?: string[]; // Added for birthplace info
  landmarks?: string[]; // Added for birthplace info
  specialFeatures?: string[];
  danger_level?: string;
  suitable_for?: string;
  controlled_by?: string; // 控制势力

  // For territories
  isTerritory?: boolean;
  territoryBounds?: { x: number; y: number }[];
  headquarters?: { x: number; y: number };

  // 势力相关字段（中文）
  名称?: string;
  类型?: string;
  等级?: string;
  特色?: string[];
  与玩家关系?: string;
  leadership?: {
    宗主?: string;
    宗主修为?: string;
    [key: string]: any;
  };
  领导层?: {
    宗主?: string;
    宗主修为?: string;
    [key: string]: any;
  };
  memberCount?: {
    total?: number;
    [key: string]: any;
  };
  成员数量?: {
    总数?: number;
    total?: number;
    [key: string]: any;
  };

  // 兼容旧数据（已废弃，仅用于数据迁移）
  x?: number;
  y?: number;
}

/**
 * Represents the type of a location
 *
 * @deprecated 'sect' 使用 'government' 替代
 * @deprecated 'secret_realm' 使用 'special_area' 替代
 * @deprecated 'sect_headquarters' 使用 'government_headquarters' 替代
 * @deprecated 'sect_power' 使用 'government_power' 替代
 *
 * 术语映射：
 * - sect (宗门) -> government (衙门/政府)
 * - secret_realm (秘境) -> special_area (特殊区域)
 * - sect_headquarters (宗门总部) -> government_headquarters (衙门总部)
 * - sect_power (宗门势力) -> government_power (政府势力)
 */
export type LocationType =
  | 'city'
  | 'sect'                // @deprecated 使用 'government' 替代
  | 'government'          // 县令主题：衙门/政府
  | 'secret_realm'        // @deprecated 使用 'special_area' 替代
  | 'special_area'        // 县令主题：特殊区域
  | 'village'
  | 'market'
  | 'major_city'
  | 'sect_headquarters'   // @deprecated 使用 'government_headquarters' 替代
  | 'government_headquarters'  // 县令主题：衙门总部
  | 'trade_center'
  // Added from WorldMapPanel
  | 'natural_landmark'
  | 'sect_power'          // @deprecated 使用 'government_power' 替代
  | 'government_power'    // 县令主题：政府势力
  | 'city_town'
  | 'blessed_land'
  | 'treasure_land'
  | 'dangerous_area'
  | 'special_other';
