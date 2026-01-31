/**
 * @fileoverview 事件系统术语映射配置（修仙主题 → 县令主题）
 *
 * 【映射说明】
 * 本文件定义了修仙主题事件到县令主题事件的映射规则
 * 用于保持存档兼容性的同时，为玩家提供县令主题的游戏体验
 *
 * 【使用方式】
 * - 在生成事件时，使用 getMagistrateEventType() 转换事件类型
 * - 在显示事件时，使用 getEventDisplayName() 获取县令主题的显示名称
 * - 在事件描述中，使用 transformEventDescription() 转换事件描述
 */

// ============================================================================
// 事件类型映射
// ============================================================================

/**
 * 修仙主题事件类型（旧版）
 */
export type CultivationEventType =
  | '渡劫'      // 天劫考验
  | '心魔'      // 内心魔障
  | '秘境'      // 秘境开启
  | '宗门大比'   // 宗门比武
  | '炼丹'      // 炼制丹药
  | '炼器'      // 炼制法器
  | '异宝'      // 异宝出世
  | '妖兽'      // 妖兽侵扰
  | '其他';     // 其他事件

/**
 * 县令主题事件类型（新版）
 */
export type MagistrateEventType =
  | '京察'      // 上级考核
  | '巡视'      // 巡视辖区
  | '微服'      // 微服私访
  | '剿匪'      // 剿除盗匪
  | '科举'      // 科举考试
  | '诗会'      // 文人雅集
  | '著书'      // 著书立说
  | '收藏'      // 收藏古玩
  | '冤案'      // 冤假错案
  | '天灾'      // 自然灾害
  | '人祸'      // 人为祸患
  | '污点'      // 政治污点
  | '祥瑞'      // 祥瑞之兆
  | '盗匪'      // 盗匪作乱
  | '其他';     // 其他事件

/**
 * 事件类型映射表
 */
export const EVENT_TYPE_MAPPING: Record<CultivationEventType, MagistrateEventType> = {
  '渡劫': '京察',           // 天劫考验 → 上级考核
  '心魔': '污点',           // 内心魔障 → 政治污点
  '秘境': '微服',           // 秘境开启 → 微服私访
  '宗门大比': '科举',        // 宗门比武 → 科举考试
  '炼丹': '著书',           // 炼制丹药 → 著书立说
  '炼器': '收藏',           // 炼制法器 → 收藏古玩
  '异宝': '祥瑞',           // 异宝出世 → 祥瑞之兆
  '妖兽': '盗匪',           // 妖兽侵扰 → 盗匪作乱
  '其他': '其他',
} as const;

/**
 * 事件类型反查表（县令 → 修仙）
 */
export const REVERSE_EVENT_TYPE_MAPPING: Record<MagistrateEventType, CultivationEventType> = {
  '京察': '渡劫',
  '巡视': '其他',
  '微服': '秘境',
  '剿匪': '妖兽',
  '科举': '宗门大比',
  '诗会': '宗门大比',
  '著书': '炼丹',
  '收藏': '炼器',
  '冤案': '其他',
  '天灾': '其他',
  '人祸': '其他',
  '污点': '心魔',
  '祥瑞': '异宝',
  '盗匪': '妖兽',
  '其他': '其他',
} as const;

// ============================================================================
// 事件描述术语映射
// ============================================================================

/**
 * 术语替换规则
 */
export interface TermReplacementRule {
  修仙术语: string;
  县令术语: string;
  使用场景?: string;            // 可选的使用场景限制
}

/**
 * 通用术语替换表
 */
export const TERM_REPLACEMENTS: TermReplacementRule[] = [
  // === 核心概念 ===
  { 修仙术语: '修炼', 县令术语: '施政' },
  { 修仙术语: '修为', 县令术语: '政绩' },
  { 修仙术语: '功法', 县令术语: '方略' },
  { 修仙术语: '境界', 县令术语: '官品' },
  { 修仙术语: '突破', 县令术语: '晋升' },
  { 修仙术语: '渡劫', 县令术语: '京察' },
  { 修仙术语: '天劫', 县令术语: '考核' },
  { 修仙术语: '心魔', 县令术语: '污点' },

  // === 势力组织 ===
  { 修仙术语: '宗门', 县令术语: '衙门' },
  { 修仙术语: '掌门', 县令术语: '县令' },
  { 修仙术语: '弟子', 县令术语: '下属' },
  { 修仙术语: '长老', 县令术语: '师爷' },
  { 修仙术语: '宗主', 县令术语: '县令' },

  // === 资源货币 ===
  { 修仙术语: '灵石', 县令术语: '银两' },
  { 修仙术语: '灵气', 县令术语: '民心' },
  { 修仙术语: '神识', 县令术语: '智慧' },
  { 修仙术语: '气血', 县令术语: '健康' },
  { 修仙术语: '寿元', 县令术语: '任期' },

  // === 地点场景 ===
  { 修仙术语: '洞府', 县令术语: '县衙' },
  { 修仙术语: '福地', 县令术语: '治所' },
  { 修仙术语: '秘境', 县令术语: '辖区' },
  { 修仙术语: '修仙界', 县令术语: '官场' },

  // === 人物角色 ===
  { 修仙术语: '修仙者', 县令术语: '为官者' },
  { 修仙术语: '道友', 县令术语: '同僚' },
  { 修仙术语: '前辈', 县令术语: '上司' },
  { 修仙术语: '晚辈', 县令术语: '下属' },

  // === 活动行为 ===
  { 修仙术语: '闭关', 县令术语: '办公' },
  { 修仙术语: '出关', 县令术语: '升堂' },
  { 修仙术语: '讲道', 县令术语: '议事' },
  { 修仙术语: '论道', 县令术语: '研讨' },

  // === 物品道具 ===
  { 修仙术语: '丹药', 县令术语: '药品' },
  { 修仙术语: '法器', 县令术语: '印信' },
  { 修仙术语: '符箓', 县令术语: '文书' },
];

// ============================================================================
// 转换函数
// ============================================================================

/**
 * 将修仙事件类型转换为县令事件类型
 */
export function transformEventType(cultivationType: CultivationEventType): MagistrateEventType {
  return EVENT_TYPE_MAPPING[cultivationType] || '其他';
}

/**
 * 将县令事件类型转换为修仙事件类型（用于存档兼容）
 */
export function reverseTransformEventType(magistrateType: MagistrateEventType): CultivationEventType {
  return REVERSE_EVENT_TYPE_MAPPING[magistrateType] || '其他';
}

/**
 * 转换事件描述中的术语
 */
export function transformEventDescription(description: string): string {
  let transformed = description;

  // 按优先级顺序应用替换规则（先匹配长词，避免短词误替换）
  const sortedRules = [...TERM_REPLACEMENTS].sort((a, b) =>
    b.修仙术语.length - a.修仙术语.length
  );

  for (const rule of sortedRules) {
    // 使用正则表达式进行全局替换
    const regex = new RegExp(rule.修仙术语, 'g');
    transformed = transformed.replace(regex, rule.县令术语);
  }

  return transformed;
}

/**
 * 获取事件类型的县令主题显示名称
 */
export function getEventDisplayName(eventType: CultivationEventType | MagistrateEventType): string {
  // 如果是修仙类型，先转换
  const magistrateType = isCultivationEventType(eventType)
    ? transformEventType(eventType)
    : eventType;

  // 返回县令主题的显示名称
  const displayNames: Record<string, string> = {
    '京察': '上级考核',
    '巡视': '辖区巡视',
    '微服': '微服私访',
    '剿匪': '剿除盗匪',
    '科举': '科举开考',
    '诗会': '文人雅集',
    '著书': '著书立说',
    '收藏': '收藏古玩',
    '污点': '政治污点',
    '祥瑞': '祥瑞之兆',
    '冤案': '冤假错案',
    '天灾': '自然灾害',
    '人祸': '人为祸患',
    '其他': '其他事件',
  };

  return displayNames[magistrateType] || '未知事件';
}

/**
 * 判断是否为修仙事件类型
 */
function isCultivationEventType(type: string): type is CultivationEventType {
  return [
    '渡劫', '心魔', '秘境', '宗门大比', '炼丹', '炼器',
    '异宝', '妖兽', '其他'
  ].includes(type);
}

// ============================================================================
// 事件场景转换配置
// ============================================================================

/**
 * 事件场景转换配置
 */
export interface EventSceneTransform {
  原场景: string;
  目标场景: string;
  触发条件?: string;            // 可选的触发条件
}

/**
 * 事件场景转换表
 */
export const EVENT_SCENE_TRANSFORMS: EventSceneTransform[] = [
  // 渡劫场景
  {
    原场景: '遭遇天劫，雷劫降临',
    目标场景: '遭遇上级考核，朝廷派员视察',
  },
  {
    原场景: '天劫威压，法力震荡',
    目标场景: '考核压力，政绩审查',
  },

  // 心魔场景
  {
    原场景: '心魔入侵，道心动摇',
    目标场景: '政治污点暴露，声誉受损',
  },
  {
    原场景: '心魔作祟，幻觉丛生',
    目标场景: '政敌攻击，流言四起',
  },

  // 秘境场景
  {
    原场景: '秘境开启，异宝出世',
    目标场景: '发现辖区异常，需要调查',
  },
  {
    原场景: '进入秘境探险',
    目标场景: '微服私访，体察民情',
  },

  // 宗门大比场景
  {
    原场景: '宗门大比开始',
    目标场景: '科举考试开考',
  },
  {
    原场景: '比武切磋，一决高下',
    目标场景: '考场竞艺，一较高下',
  },
];

/**
 * 转换事件场景描述
 */
export function transformEventScene(sceneDescription: string): string {
  let transformed = sceneDescription;

  for (const transform of EVENT_SCENE_TRANSFORMS) {
    if (transformed.includes(transform.原场景)) {
      transformed = transformed.replace(
        transform.原场景,
        transform.目标场景
      );
    }
  }

  return transformed;
}
