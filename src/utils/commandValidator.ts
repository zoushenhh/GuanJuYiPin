/**
 * 指令对象格式验证器
 *
 * 功能:
 * - 验证AI返回的tavern_commands指令格式
 * - 清理多余字段,确保指令符合规范
 * - 检查必需字段和值类型
 *
 * 被以下文件引用:
 * - src/utils/AIBidirectionalSystem.ts (动态导入)
 */

import type { TavernCommand } from '@/types/AIGameMaster';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  invalidCommands?: Array<{ command: any; errors: string[] }>; // 记录无效指令
}

/**
 * 🔒 完全禁止AI操作的路径（系统管理，AI不得触碰）
 */
const FORBIDDEN_PATHS: string[] = [
  '社交.记忆',           // 玩家记忆由系统自动管理
  '角色.身份',           // 角色身份信息只读
  '角色.装备',           // 装备系统只读
  '角色.技能.掌握技能',  // 已掌握技能只读
];

/**
 * 🔒 禁止被置空/删除/整体替换的核心路径（只允许子字段操作）
 */
const PROTECTED_ROOT_PATHS: string[] = [
  // 顶级根路径
  '角色',
  '社交',
  '元数据',
  '世界',
  '系统',

  // 角色子结构
  '角色.属性',
  '角色.属性.官品',
  '角色.属性.气血',
  '角色.属性.灵气',
  '角色.属性.神识',
  '角色.属性.寿命',
  '角色.背包',
  '角色.背包.物品',
  '角色.背包.货币',
  '角色.方略',
  '角色.方略.方略进度',
  '角色.理念',
  '角色.理念.理念列表',
  '角色.效果',
  '角色.位置',
  '角色.技能',

  // 社交子结构
  '社交.关系',
  '社交.关系矩阵',
  '社交.关系矩阵.edges',
  '社交.事件',
  '社交.事件.事件记录',

  // 元数据子结构
  '元数据.时间',
  '元数据.游戏设置',

  // 世界子结构
  '世界.地图',
  '世界.势力',
];

/**
 * 检查路径是否被禁止操作
 */
function checkForbiddenPath(key: string, action: string): string | null {
  // 检查完全禁止的路径
  for (const forbidden of FORBIDDEN_PATHS) {
    if (key === forbidden || key.startsWith(`${forbidden}.`)) {
      return `路径 "${key}" 禁止AI操作（系统保护字段）`;
    }
  }

  // 检查核心路径的危险操作（set整体/delete）
  if (action === 'set' || action === 'delete') {
    for (const protected_path of PROTECTED_ROOT_PATHS) {
      if (key === protected_path) {
        return `禁止对核心路径 "${key}" 执行 ${action} 操作（会导致数据丢失）`;
      }
    }
  }

  return null;
}

/**
 * 验证单个指令对象
 */
export function validateCommand(command: unknown, index: number): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // 1. 检查必需字段
    if (!command || typeof command !== 'object') {
      errors.push(`指令${index}: 不是有效的对象`);
      return { valid: false, errors, warnings };
    }

    // Type assertion after validation
    const cmd = command as Record<string, any>;

    if (!cmd.action) {
      errors.push(`指令${index}: 缺少action字段`);
    }

    if (!cmd.key) {
      errors.push(`指令${index}: 缺少key字段`);
    }

    // 2. 检查action类型
    const validActions = ['set', 'add', 'push', 'delete', 'pull'];
    if (cmd.action && !validActions.includes(cmd.action)) {
      errors.push(`指令${index}: action值"${cmd.action}"无效，必须是: ${validActions.join(', ')}`);
    }

    // 3. 检查key格式
    if (cmd.key && typeof cmd.key !== 'string') {
      errors.push(`指令${index}: key必须是字符串类型`);
    }

    // 🔒 4. 核心路径保护检查
    if (cmd.key && cmd.action) {
      const forbiddenError = checkForbiddenPath(cmd.key, cmd.action);
      if (forbiddenError) {
        errors.push(`指令${index}: ${forbiddenError}`);
      }
    }

    // 5. 检查value（delete操作除外）
    if (cmd.action !== 'delete' && cmd.value === undefined) {
      errors.push(`指令${index}: ${cmd.action}操作必须提供value字段`);
    }

    // 6. 检查多余字段（scope虽然在类型中但不应使用）
    const allowedFields = ['action', 'key', 'value'];
    const extraFields = Object.keys(cmd).filter(k => !allowedFields.includes(k));
    if (extraFields.length > 0) {
      warnings.push(`指令${index}: 包含多余字段: ${extraFields.join(', ')}（这些字段会被自动移除）`);
    }

    // 7. 特定路径的值类型检查
    if (cmd.key && cmd.value !== undefined) {
      try {
        const typeErrors = validateValueType(cmd.key, cmd.value, cmd.action);
        errors.push(...typeErrors.map(e => `指令${index}: ${e}`));
      } catch (e) {
        console.error('[指令验证] 值类型检查异常:', e);
        warnings.push(`指令${index}: 值类型检查时发生异常，已跳过`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  } catch (error) {
    console.error('[指令验证] validateCommand发生严重异常:', error);
    errors.push(`指令${index}: 验证过程发生严重异常`);
    return { valid: false, errors, warnings };
  }
}

/**
 * 验证值类型是否符合路径要求
 */
function validateValueType(key: string, value: unknown, action: string): string[] {
  const errors: string[] = [];

  try {
    const allowedRoots = ['元数据', '角色', '社交', '世界', '系统'] as const;
    const isV3Key = allowedRoots.some((root) => key === root || key.startsWith(`${root}.`));
    if (!isV3Key) {
      errors.push(`key必须以 ${allowedRoots.join(' / ')} 开头（V3短路径），当前: ${key}`);
      return errors;
    }

    // 数值字段（只做最常见的严格校验，其它复杂结构由运行期校验器兜底）
    const numberFields = [
      '元数据.时间.年',
      '元数据.时间.月',
      '元数据.时间.日',
      '元数据.时间.小时',
      '元数据.时间.分钟',
      '角色.属性.声望',
      '角色.属性.气血.当前',
      '角色.属性.气血.上限',
      '角色.属性.灵气.当前',
      '角色.属性.灵气.上限',
      '角色.属性.神识.当前',
      '角色.属性.神识.上限',
      '角色.属性.寿命.当前',
      '角色.属性.寿命.上限',
    ];

    const houTianFields = ['精力', '灵性', '悟性', '气运', '魅力', '心性'];

    if (action === 'add') {
      if (numberFields.includes(key) && typeof value !== 'number') {
        errors.push(`${key} 使用 add 时 value 必须是数字，当前类型: ${typeof value}`);
      }

      // 新货币系统：角色.背包.货币.<币种ID>.数量
      if (key.startsWith('角色.背包.货币.') && key.endsWith('.数量') && typeof value !== 'number') {
        errors.push(`${key} 使用 add 时 value 必须是数字，当前类型: ${typeof value}`);
      }

      if (key.startsWith('角色.身份.后天六司.') && houTianFields.some((f) => key.endsWith(`.${f}`))) {
        if (typeof value !== 'number') {
          errors.push(`${key} 使用 add 时 value 必须是数字，当前类型: ${typeof value}`);
        }
      }
    }

    // 玩家官品对象
    if (key === '角色.属性.官品' && action === 'set') {
      if (typeof value !== 'object' || value === null) {
        errors.push('角色.属性.官品 必须是对象类型');
      } else {
        const val = value as Record<string, any>;
        if (val.名称 !== undefined && typeof val.名称 !== 'string') errors.push('官品.名称必须是字符串类型');
        if (val.阶段 !== undefined && typeof val.阶段 !== 'string') errors.push('官品.阶段必须是字符串类型');
        if (val.当前进度 !== undefined && typeof val.当前进度 !== 'number') errors.push('官品.当前进度必须是数字类型');
        if (val.下一级所需 !== undefined && typeof val.下一级所需 !== 'number') errors.push('官品.下一级所需必须是数字类型');
        if (val.晋升描述 !== undefined && typeof val.晋升描述 !== 'string') errors.push('官品.晋升描述必须是字符串类型');
      }
    }

    // 玩家位置对象（x/y 可选）
    if (key === '角色.位置' && action === 'set') {
      if (typeof value !== 'object' || value === null) {
        errors.push('角色.位置 必须是对象类型');
      } else {
        const val = value as Record<string, any>;
        if (val.描述 !== undefined && typeof val.描述 !== 'string') errors.push('位置.描述必须是字符串类型');
        if (val.x !== undefined && typeof val.x !== 'number') errors.push('位置.x必须是数字类型');
        if (val.y !== undefined && typeof val.y !== 'number') errors.push('位置.y必须是数字类型');
        if (val.地图ID !== undefined && typeof val.地图ID !== 'string') errors.push('位置.地图ID必须是字符串类型');
      }
    }

    // 状态效果数组
    if (key === '角色.效果' && action === 'push') {
      if (typeof value !== 'object' || value === null) {
        errors.push('角色.效果 push 的 value 必须是对象类型');
      } else {
        const val = value as Record<string, any>;
        if (val.类型 !== undefined && !['buff', 'debuff'].includes(val.类型)) {
          errors.push(`状态效果类型必须是"buff"或"debuff"，当前值: ${val.类型}`);
        }
        if (val.持续时间分钟 !== undefined && typeof val.持续时间分钟 !== 'number') {
          errors.push('状态效果.持续时间分钟必须是数字类型');
        }
      }
    }

    // 物品对象（push 到背包）
    if (key === '角色.背包.物品' && action === 'push') {
      if (typeof value !== 'object' || value === null) {
        errors.push('推送到 角色.背包.物品 的物品必须是对象类型');
      }
    }

    // 物品对象（set 完整物品）
    if (key.startsWith('角色.背包.物品.') && action === 'set') {
      const dotCount = (key.match(/\./g) || []).length;
      const isWholeItem = dotCount === 3;
      if (isWholeItem && (typeof value !== 'object' || value === null)) {
        errors.push('物品必须是对象类型');
      }
    }

    // NPC 创建/覆盖（仅在 set 社交.关系.<npc> 时做轻量检查）
    if (key.startsWith('社交.关系.') && (key.match(/\./g) || []).length === 2 && action === 'set') {
      if (typeof value === 'object' && value !== null) {
        const val = value as Record<string, any>;
        if (val.官品 && (typeof val.官品 !== 'object' || val.官品 === null)) errors.push('NPC官品必须是对象类型');
        if (val.天赋 !== undefined && !Array.isArray(val.天赋)) errors.push('NPC天赋必须是数组类型');
      }
    }

    // NPC 官品更新（社交.关系.<npc>.官品）
    if (key.startsWith('社交.关系.') && key.endsWith('.官品') && action === 'set') {
      if (typeof value !== 'object' || value === null) {
        errors.push('NPC官品必须是对象类型');
      } else {
        const val = value as Record<string, any>;
        if (val.名称 !== undefined && typeof val.名称 !== 'string') errors.push('NPC官品.名称必须是字符串类型');
        if (val.阶段 !== undefined && typeof val.阶段 !== 'string') errors.push('NPC官品.阶段必须是字符串类型');
      }
    }

    // 理念对象（角色.理念.理念列表.<理念名>）
    if (key.startsWith('角色.理念.理念列表.') && action === 'set' && (key.match(/\./g) || []).length === 3) {
      if (typeof value !== 'object' || value === null) errors.push('理念对象必须是对象类型');
    }

    return errors;
  } catch (error) {
    console.error('[指令验证] validateValueType发生异常:', error);
    errors.push(`验证过程发生异常: ${error instanceof Error ? error.message : String(error)}`);
    return errors;
  }
}

/**
 * 验证整个指令数组
 */
export function validateCommands(commands: unknown[]): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  const invalidCommands: Array<{ command: any; errors: string[] }> = [];

  try {
    if (!Array.isArray(commands)) {
      return {
        valid: false,
        errors: ['tavern_commands必须是数组类型'],
        warnings: [],
        invalidCommands: []
      };
    }

    commands.forEach((cmd, index) => {
      try {
        const result = validateCommand(cmd, index);
        allErrors.push(...result.errors);
        allWarnings.push(...result.warnings);

        // 记录无效指令
        if (result.errors.length > 0) {
          invalidCommands.push({
            command: cmd,
            errors: result.errors
          });
        }
      } catch (error) {
        console.error(`[指令验证] 验证指令${index}时发生异常:`, error);
        allErrors.push(`指令${index}: 验证时发生异常`);
        allWarnings.push(`指令${index}: 已跳过异常指令`);
      }
    });

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      invalidCommands
    };
  } catch (error) {
    console.error('[指令验证] validateCommands发生严重异常:', error);
    return {
      valid: false,
      errors: ['指令数组验证过程发生严重异常'],
      warnings: [],
      invalidCommands: []
    };
  }
}

/**
 * 清理指令对象，移除多余字段
 */
export function cleanCommand(command: TavernCommand): TavernCommand {
  const { action, key, value } = command;
  const cleaned: TavernCommand = { action, key, value };

  // 只保留必需字段
  if (action === 'delete') {
    delete cleaned.value;
  }

  return cleaned;
}

/**
 * 清理指令数组
 */
export function cleanCommands(commands: TavernCommand[]): TavernCommand[] {
  return commands.map(cleanCommand);
}

// ============================================================
// 以下功能从 commandValueValidator.ts 合并而来
// ============================================================

function coerceNumeric(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function coerceStringArray(value: unknown): string[] | null {
  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === 'string' ? v.trim() : ''))
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    return trimmed
      .split(/[、,，;；\n]/)
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return null;
}

/**
 * 验证指令值的格式（只验证，不修复）
 * 从 commandValueValidator.ts 合并
 */
export function validateAndRepairCommandValue(command: TavernCommand): ValidationResult {
  const { action, key, value } = command;
  const errors: string[] = [];

  if (typeof key !== 'string' || !key) {
    return { valid: false, errors: ['指令缺少key字段'], warnings: [] };
  }
  if (typeof action !== 'string' || !action) {
    return { valid: false, errors: ['指令缺少action字段'], warnings: [] };
  }

  try {
    // 1. 玩家官品对象
    if (key === '角色.属性.官品' && action === 'set') {
      const result = validateRankObject(value, '玩家');
      errors.push(...result.errors);
    }

    // 2. 玩家位置对象
    if (key === '角色.位置' && action === 'set') {
      const result = validateLocationObject(value);
      errors.push(...result.errors);
    }

    // 3. 状态效果对象（push操作）
    if (key === '角色.效果' && action === 'push') {
      const result = validateStatusEffectObject(value);
      errors.push(...result.errors);
    }

    // 4. 物品对象（push到背包）
    if (key === '角色.背包.物品' && action === 'push') {
      const result = validateItemObject(value);
      errors.push(...result.errors);
    }

    // 5. 物品对象（set操作）
    if (key.startsWith('角色.背包.物品.') && action === 'set') {
      const dotCount = (key.match(/\./g) || []).length;
      if (dotCount === 3) {
        const result = validateItemObject(value);
        errors.push(...result.errors);
      }
    }

    // 6. NPC对象（创建或更新）
    if (key.startsWith('社交.关系.') && (key.match(/\./g) || []).length === 2 && action === 'set') {
      const isLikelyFullNpcObject =
        value &&
        typeof value === 'object' &&
        (value as any).名字 &&
        (value as any).性别 &&
        (value as any).出生日期 &&
        ((value as any).外貌描述 || (value as any).性格特征 || (value as any).官品);

      if (isLikelyFullNpcObject) {
        const result = validateNPCObject(value);
        errors.push(...result.errors);
      }
    }

    // 7. NPC官品对象
    if (key.includes('社交.关系.') && key.endsWith('.官品') && action === 'set') {
      const result = validateRankObject(value, 'NPC');
      errors.push(...result.errors);
    }

    // 8. 理念对象
    if (key.startsWith('角色.理念.理念列表.') && action === 'set' && (key.match(/\./g) || []).length === 3) {
      const daoName = key.split('.')[3];
      const result = validateDaoObject(value, daoName);
      errors.push(...result.errors);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    };
  } catch (error) {
    console.error('[指令值验证] 验证过程发生异常:', error);
    return {
      valid: false,
      errors: [`验证过程异常: ${error instanceof Error ? error.message : String(error)}`],
      warnings: []
    };
  }
}

interface ValueValidationResult {
  valid: boolean;
  errors: string[];
}

function validateRankObject(value: any, type: '玩家' | 'NPC'): ValueValidationResult {
  const errors: string[] = [];

  if (typeof value !== 'object' || value === null) {
    errors.push('官品必须是对象类型');
    return { valid: false, errors };
  }

  if (!value.名称) errors.push('官品缺少"名称"字段');
  if (!value.阶段) errors.push('官品缺少"阶段"字段');

  if (value.当前进度 !== undefined) {
    const numeric = coerceNumeric(value.当前进度);
    if (numeric === null) errors.push('官品"当前进度"字段类型错误，应为数字');
    else value.当前进度 = numeric;
  }
  if (value.下一级所需 !== undefined) {
    const numeric = coerceNumeric(value.下一级所需);
    if (numeric === null) errors.push('官品"下一级所需"字段类型错误，应为数字');
    else value.下一级所需 = numeric;
  }
  if (value.晋升描述 !== undefined && typeof value.晋升描述 !== 'string') {
    errors.push('官品"晋升描述"字段类型错误，应为字符串');
  }

  return { valid: errors.length === 0, errors };
}

function validateLocationObject(value: any): ValueValidationResult {
  const errors: string[] = [];

  if (typeof value !== 'object' || value === null) {
    errors.push('位置必须是对象类型');
    return { valid: false, errors };
  }

  if (!value.描述) errors.push('位置缺少"描述"字段');
  if (value.x !== undefined && typeof value.x !== 'number') errors.push('位置.x类型错误，应为数字');
  if (value.y !== undefined && typeof value.y !== 'number') errors.push('位置.y类型错误，应为数字');
  if (value.地图ID !== undefined && typeof value.地图ID !== 'string') errors.push('位置.地图ID类型错误，应为字符串');

  return { valid: errors.length === 0, errors };
}

function validateStatusEffectObject(value: any): ValueValidationResult {
  const errors: string[] = [];

  if (typeof value !== 'object' || value === null) {
    errors.push('状态效果必须是对象类型');
    return { valid: false, errors };
  }

  if (!value.状态名称) errors.push('状态效果缺少"状态名称"字段');
  if (!value.类型 || !['buff', 'debuff'].includes(value.类型)) errors.push('状态效果缺少"类型"字段或值无效');
  if (value.状态描述 === undefined) errors.push('状态效果缺少"状态描述"字段');
  if (typeof value.持续时间分钟 !== 'number') errors.push('状态效果缺少"持续时间分钟"字段或类型错误');
  if (!value.生成时间 || typeof value.生成时间 !== 'object') errors.push('状态效果缺少"生成时间"对象字段');

  return { valid: errors.length === 0, errors };
}

function validateItemObject(value: any): ValueValidationResult {
  const errors: string[] = [];

  if (typeof value !== 'object' || value === null) {
    errors.push('物品必须是对象类型');
    return { valid: false, errors };
  }

  if (!value.物品ID) errors.push('物品缺少"物品ID"字段');
  if (!value.名称) errors.push('物品缺少"名称"字段');
  if (!value.类型) errors.push('物品缺少"类型"字段');

  if (!value.品质) {
    errors.push('物品缺少"品质"字段');
  } else if (typeof value.品质 === 'object') {
    if (!value.品质.quality) errors.push('物品品质缺少"quality"字段');
    if (typeof value.品质.grade !== 'number') errors.push('物品品质缺少"grade"字段或类型错误');
  } else {
    errors.push('物品品质必须是对象类型');
  }

  if (typeof value.数量 !== 'number') errors.push('物品缺少"数量"字段或类型错误');
  if (value.描述 === undefined) errors.push('物品缺少"描述"字段');

  if (value.类型 === '治理方略') {
    if (!Array.isArray(value.政务技能)) {
      errors.push('治理方略物品缺少"政务技能"数组');
    } else if (value.政务技能.length === 0) {
      errors.push('治理方略物品的"政务技能"数组不能为空，至少需要1个技能');
    } else {
      value.政务技能.forEach((skill: any, index: number) => {
        if (typeof skill !== 'object' || skill === null) {
          errors.push(`政务技能[${index}]不是对象类型`);
        } else {
          if (!skill.技能名称) errors.push(`政务技能[${index}]缺少"技能名称"字段`);
          if (skill.技能描述 === undefined) errors.push(`政务技能[${index}]缺少"技能描述"字段`);
          if (typeof skill.熟练度要求 !== 'number') errors.push(`政务技能[${index}]缺少"熟练度要求"字段或类型错误`);
        }
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

function validateNPCObject(value: any): ValueValidationResult {
  const errors: string[] = [];

  if (typeof value !== 'object' || value === null) {
    errors.push('NPC必须是对象类型');
    return { valid: false, errors };
  }

  if (!value.名字) errors.push('NPC缺少"名字"字段');
  if (!value.性别) errors.push('NPC缺少"性别"字段');
  if (!value.出生日期) errors.push('NPC缺少"出生日期"字段');

  if (!value.官品) {
    errors.push('NPC缺少"官品"字段');
  } else {
    const rankResult = validateRankObject(value.官品, 'NPC');
    errors.push(...rankResult.errors);
  }

  if (!value.出生) errors.push('NPC缺少"出生"字段');
  if (value.性格特征 !== undefined) {
    const coerced = coerceStringArray(value.性格特征);
    if (coerced) value.性格特征 = coerced;
  }
  if (!value.性格特征) errors.push('NPC缺少"性格特征"字段');
  if (!value.外貌描述) errors.push('NPC缺少"外貌描述"字段');
  if (!value.与玩家关系) errors.push('NPC缺少"与玩家关系"字段');
  if (value.好感度 !== undefined) {
    const numeric = coerceNumeric(value.好感度);
    if (numeric !== null) value.好感度 = numeric;
  }
  if (typeof value.好感度 !== 'number') errors.push('NPC缺少"好感度"字段或类型错误');

  if (value.天赋 !== undefined && !Array.isArray(value.天赋)) {
    errors.push('NPC天赋必须是数组类型');
  }

  if (value.私密信息 && typeof value.私密信息 === 'object') {
    const privacy = value.私密信息 as any;
    const listFields = ['性癖好', '性伴侣名单', '特殊体质', '亲密偏好', '禁忌清单'];
    for (const field of listFields) {
      if (privacy[field] !== undefined) {
        const coerced = coerceStringArray(privacy[field]);
        if (coerced) privacy[field] = coerced;
      }
    }
    if (privacy.生育状态 !== undefined) {
      const fertility = privacy.生育状态;
      if (typeof fertility === 'string') {
        privacy.生育状态 = { 当前状态: fertility };
      } else if (typeof fertility !== 'object' || fertility === null) {
        errors.push('NPC私密信息.生育状态必须是对象或字符串');
      }
    }
    if (value.私密信息.身体部位 !== undefined) {
      const bp = value.私密信息.身体部位;
      const ok = Array.isArray(bp) || (bp && typeof bp === 'object');
      if (!ok) errors.push('NPC私密信息.身体部位必须是数组或对象类型');
    }
  }

  if (value.记忆 !== undefined && !Array.isArray(value.记忆)) {
    const coerced = coerceStringArray(value.记忆);
    if (coerced) value.记忆 = coerced;
  }

  return { valid: errors.length === 0, errors };
}

function validateDaoObject(value: any, daoNameFromKey?: string): ValueValidationResult {
  const errors: string[] = [];

  if (typeof value !== 'object' || value === null) {
    errors.push('理念对象必须是对象类型');
    return { valid: false, errors };
  }

  if (!value.道名) {
    const possibleName = daoNameFromKey || value.name || value.名称;
    if (possibleName) {
      value.道名 = possibleName;
    } else {
      errors.push('理念对象缺少"道名"字段');
    }
  }

  if (value.描述 === undefined) {
    value.描述 = value.description || '治理理念';
  }

  if (!Array.isArray(value.阶段列表)) {
    value.阶段列表 = [
      { 阶段名: '入门', 需求经验: 100 },
      { 阶段名: '小成', 需求经验: 500 },
      { 阶段名: '大成', 需求经验: 2000 },
      { 阶段名: '圆满', 需求经验: 10000 }
    ];
  }

  if (typeof value.是否解锁 !== 'boolean') {
    value.是否解锁 = true;
  }

  if (typeof value.当前阶段 !== 'number') {
    value.当前阶段 = 0;
  }

  if (typeof value.当前经验 !== 'number') {
    value.当前经验 = 0;
  }

  if (typeof value.总经验 !== 'number') {
    value.总经验 = 0;
  }

  return { valid: errors.length === 0, errors };
}
