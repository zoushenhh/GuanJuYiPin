/**
 * 默认提示词集合 - 完整版
 *
 * 分类说明：
 * 1. 核心请求提示词 - 正常游戏请求时按顺序发送
 * 2. 总结请求提示词 - 记忆总结时使用
 * 3. 生成类提示词 - 世界/NPC/任务等生成
 * 4. 角色初始化提示词 - 创建角色时使用
 *
 * 县令 - AI驱动的古代县令模拟器
 */
import { getSaveDataStructureForEnv } from '@/utils/prompts/definitions/dataDefinitions';
import { getCharacterInitializationPromptForEnv } from '@/utils/prompts/tasks/characterInitializationPrompts';
import { EnhancedWorldPromptBuilder } from '@/utils/worldGeneration/enhancedWorldPrompts';
import { promptStorage } from './promptStorage';
import { isTavernEnv } from '@/utils/tavern';
// 核心规则
import { JSON_OUTPUT_RULES, RESPONSE_FORMAT_RULES, DATA_STRUCTURE_STRICTNESS, NARRATIVE_PURITY_RULES } from '@/utils/prompts/definitions/coreRules';
// 业务规则
import {
  REALM_SYSTEM_RULES,
  THREE_THOUSAND_DAOS_RULES,
  LOCATION_UPDATE_RULES,
  COMMAND_PATH_CONSTRUCTION_RULES,
  TECHNIQUE_SYSTEM_RULES,
  PLAYER_AUTONOMY_RULES,
  RATIONALITY_AUDIT_RULES,
  PROFESSION_MASTERY_RULES,
  ANTI_SYCOPHANCY_RULES,
  JUDGMENT_TRACEABILITY_RULES,
  DUAL_REALM_NARRATIVE_RULES,
  DIFFICULTY_ENHANCEMENT_RULES,
  SECT_SYSTEM_RULES,
  COMBAT_ALCHEMY_RISK_RULES,
  CULTIVATION_PRACTICE_RULES,
  DAO_COMPREHENSION_RULES,
  CULTIVATION_SPEED_RULES,
  SIX_SI_ACQUISITION_RULES,
  SECT_DYNAMIC_GENERATION_RULES,
  COMBAT_TURN_BASED_RULES,
  NPC_RULES,
  GRAND_CONCEPT_CONSTRAINTS,
  SKILL_AND_SPELL_USAGE_RULES,
  ECONOMY_AND_PRICING_RULES,
  CULTIVATION_DETAIL_RULES,
  STATUS_EFFECT_RULES
} from '@/utils/prompts/definitions/businessRules';
// 文本格式
import { TEXT_FORMAT_MARKERS, DICE_ROLLING_RULES, COMBAT_DAMAGE_RULES, NAMING_CONVENTIONS } from '@/utils/prompts/definitions/textFormats';
// 世界标准
import { REALM_ATTRIBUTE_STANDARDS, QUALITY_SYSTEM, REPUTATION_GUIDE } from '@/utils/prompts/definitions/worldStandards';
import { ACTION_OPTIONS_RULES } from '@/utils/prompts/definitions/actionOptions';
import { EVENT_SYSTEM_RULES } from '@/utils/prompts/definitions/eventSystemRules';
import { PLAYER_PERSONALITY_RULES } from '@/utils/prompts/definitions/playerPersonality';

export interface PromptDefinition {
  name: string;
  content: string;
  category: string;
  description?: string;
  order?: number;
  weight?: number; // 权重 1-10，越高越重要
  condition?: 'splitGeneration' | 'eventSystem' | 'always'; // 显示条件
}

/**
 * 提示词分类定义
 */
export const PROMPT_CATEGORIES = {
  coreRequest: {
    name: '核心请求提示词',
    description: '正常游戏请求时按顺序发送的提示词',
    icon: '📨'
  },
  summary: {
    name: '总结请求提示词',
    description: '记忆总结时使用的提示词',
    icon: '📝'
  },
  initialization: {
    name: '开局初始化提示词',
    description: '开局时世界生成和角色初始化的提示词',
    icon: '🚀'
  },
  generation: {
    name: '动态生成提示词',
    description: '游戏中动态生成NPC/事件/物品的提示词',
    icon: '🎨'
  },
};

// 合并核心输出规则
const CORE_OUTPUT_RULES = [JSON_OUTPUT_RULES, RESPONSE_FORMAT_RULES, DATA_STRUCTURE_STRICTNESS, NARRATIVE_PURITY_RULES].join('\n\n');

// 合并业务规则（精简版，核心规则优先）
const BUSINESS_RULES = [
  RATIONALITY_AUDIT_RULES,
  ANTI_SYCOPHANCY_RULES,
  JUDGMENT_TRACEABILITY_RULES,
  PROFESSION_MASTERY_RULES,
  DUAL_REALM_NARRATIVE_RULES,
  DIFFICULTY_ENHANCEMENT_RULES,
  REALM_SYSTEM_RULES,
  COMMAND_PATH_CONSTRUCTION_RULES,
  TECHNIQUE_SYSTEM_RULES,
  COMBAT_ALCHEMY_RISK_RULES,
  COMBAT_TURN_BASED_RULES,
  PLAYER_AUTONOMY_RULES
].join('\n\n');

// 扩展业务规则（可选，用户可自定义开启）
const EXTENDED_BUSINESS_RULES = [
  THREE_THOUSAND_DAOS_RULES,
  LOCATION_UPDATE_RULES,
  SECT_SYSTEM_RULES,
  CULTIVATION_PRACTICE_RULES,
  DAO_COMPREHENSION_RULES,
  CULTIVATION_SPEED_RULES,
  SIX_SI_ACQUISITION_RULES,
  SECT_DYNAMIC_GENERATION_RULES,
  NPC_RULES,
  GRAND_CONCEPT_CONSTRAINTS,
  SKILL_AND_SPELL_USAGE_RULES,
  ECONOMY_AND_PRICING_RULES,
  CULTIVATION_DETAIL_RULES,
  STATUS_EFFECT_RULES
].join('\n\n');

// 合并文本格式规范
const TEXT_FORMAT_RULES = [TEXT_FORMAT_MARKERS, DICE_ROLLING_RULES, COMBAT_DAMAGE_RULES, NAMING_CONVENTIONS].join('\n\n');

// 合并世界观标准
const WORLD_STANDARDS = [REALM_ATTRIBUTE_STANDARDS, QUALITY_SYSTEM, REPUTATION_GUIDE].join('\n\n');

export function getSystemPrompts(): Record<string, PromptDefinition> {
  const tavernEnv = isTavernEnv();
  return {
    // ==================== 核心请求提示词（合并版） ====================
    coreOutputRules: {
      name: '1. 输出格式',
      content: CORE_OUTPUT_RULES,
      category: 'coreRequest',
      description: 'JSON格式、数据同步',
      order: 1,
      weight: 10
    },
    businessRules: {
      name: '2. 核心规则',
      content: BUSINESS_RULES,
      category: 'coreRequest',
      description: '官品、NPC、战斗规则',
      order: 2,
      weight: 9
    },
    playerPersonality: {
      name: '2.1 主角性格',
      content: PLAYER_PERSONALITY_RULES,
      category: 'coreRequest',
      description: '默认“正常人”人设，可自定义',
      order: 2.1,
      weight: 6
    },
    extendedBusinessRules: {
      name: '2.5 扩展规则',
      content: EXTENDED_BUSINESS_RULES,
      category: 'coreRequest',
      description: '大道、衙门等扩展',
      order: 2.5,
      weight: 5
    },
    dataDefinitions: {
      name: '3. 数据结构',
      content: getSaveDataStructureForEnv(tavernEnv),
      category: 'coreRequest',
      description: '存档结构定义',
      order: 3,
      weight: 10
    },
    textFormatRules: {
      name: '4. 文本格式',
      content: TEXT_FORMAT_RULES,
      category: 'coreRequest',
      description: '判定、伤害、命名',
      order: 4,
      weight: 10
    },
    worldStandards: {
      name: '5. 世界标准',
      content: WORLD_STANDARDS,
      category: 'coreRequest',
      description: '官品属性、品质',
      order: 5,
      weight: 7
    },
    actionOptions: {
      name: '7. 行动选项',
      content: ACTION_OPTIONS_RULES,
      category: 'coreRequest',
      description: '生成玩家选项',
      order: 7,
      weight: 6
    },
    eventSystemRules: {
      name: '8. 世界事件',
      content: EVENT_SYSTEM_RULES,
      category: 'coreRequest',
      description: '世界事件演变与影响',
      order: 8,
      weight: 5,
      condition: 'eventSystem'
    },
    splitGenerationStep1: {
      name: '9. 分步正文',
      content: `# 分步生成 1/2：仅正文

## 🔴 输出格式
{"text":"400-800字叙事正文（重要场景可到1000字）"}

## ✅ JSON字符串规则（CRITICAL）
- 只输出一个JSON对象，禁止任何前后缀文字、禁止 \`\`\` 代码块
- \`text\` 如需分段换行，用 \`\\n\` 表示（不要在引号内直接换行，否则JSON会解析失败）

## 📖 文本格式标记 / Text Format Markers
使用以下标记增强叙事表现力：
- 环境描写: 【...】 (场景、天气、氛围)
- 内心思考: \`...\` (NPC心理活动，非主角)
- 角色对话: "..." (人物对话)
- 系统判定/系统提示: 〔...〕（必须使用下面的严格格式）

## 🔒 标记铁律（CRITICAL）
- 【】只允许写环境/场景，严禁用于系统/面板：禁止【系统提示】、【系统判定】、【当前状态】、【气血/灵气】等
- 系统判定/状态变化必须写在 〔〕 内；禁止在正文中单独输出"系统提示/系统判定/当前状态"等标题行
  - ✅ 〔处理政务:成功,判定值:12,难度:10,基础:0,幸运:+2,环境:+5,状态:+5〕
  - ❌ 【当前状态】气血：95/100
  - ❌ 系统提示：……

## 📝 正文要求（必须遵守）
1. **长度**：建议400-800字，重要场景可到1000字，不要太长！
2. **判定系统**：战斗/处理政务/升迁/探索/社交等场景**必须使用判定**
3. **判定格式（必须严格遵守）**：〔类型:结果,判定值:数字,难度:数字,基础:数字,幸运:+/-数字,环境:+/-数字,状态:+/-数字〕
   - 类型 ∈ 战斗/处理政务/升迁/探索/社交/逃跑/感知
   - 结果 ∈ 大失败/失败/成功/大成功/完美
4. **叙事风格**：多描写少总结，结尾留钩子，承接上文情节
5. **格式标记**：合理使用【】环境、\`心理\`、""对话、〔〕判定
6. **画面感配方（最低标准）**：至少1个可见动作细节+1轮"对话"或NPC内心\`...\`；【环境】仅在场景变化/信息必要时写1-2句（动作细节必须融入叙事，禁止写成“动作细节一/二”等编号）

## ⚔️ 战斗场景特别要求
- 每次攻防都要进行判定
- 判定结果决定伤害和后果
- 大失败=重伤，大成功=重创敌人

## ⚠️ 严禁
- ❌ mid_term_memory / tavern_commands / action_options 字段
- ❌ <thinking> 标签
- ❌ 任何指令/命令相关内容

## 🔴 输出格式
只输出：\`{"text":"叙事正文内容"}\``.trim(),
      category: 'coreRequest',
      description: '分步模式第1步',
      order: 9,
      weight: 7,
      condition: 'splitGeneration'
    },
    splitGenerationStep2: {
      name: '10. 分步指令',
      content: `# 分步生成 2/2：仅指令

## 🧭 内部自检清单（不要输出，仅用于生成指令）

### 基础同步（V3短路径）- 必须全面更新！
□ 位置变化 → set \`角色.位置\`
□ 时间流逝 → add \`元数据.时间.分钟\`（处理政务/办公按实际时长）
□ 货币变化 → add \`角色.背包.货币.<币种ID>.数量\`
□ 物品增删 → set/delete \`角色.背包.物品.[物品ID]\`

### 处理政务与升迁
□ 日常处理政务 → add \`角色.属性.官品.当前进度\`
□ 治国方略熟练 → add \`角色.治国方略.治国方略进度.[治国方略ID].熟练度\`
□ 悟道进展 → add \`角色.大道.大道列表.[学派名].当前经验\`
□ 大道解锁 → set \`角色.大道.大道列表.[学派名]\`（完整DaoData对象）
□ 治国方略解锁技能 → push \`角色.治国方略.治国方略进度.[治国方略ID].已解锁技能\`
□ 小阶段晋升 → set \`角色.属性.官品.阶段\`（初期→中期→后期→圆满→极境）
□ 大官品升迁 → set \`角色.属性.官品.名称\` + 更新属性上限

### 考核系统
□ 考核开始 → push \`角色.效果\` 添加"考核中"状态
□ 每道难关 → add \`角色.属性.健康.当前\`（负）+ add \`角色.属性.精力.当前\`（负）
□ 考核成功 → set 新官品 + 更新属性上限 + push \`社交.事件.事件记录\`
□ 考核失败 → 重伤/罢官处理 + push \`社交.事件.事件记录\`

### 战斗与消耗 - 必须更新所有参与者！
□ 施法/出招 → add \`角色.属性.精力.当前\`（负，按技能消耗%）
□ 玩家受伤 → add \`角色.属性.健康.当前\`（负）
□ NPC受伤 → add \`社交.关系.[NPC名].属性.健康.当前\`（负）
□ 心力消耗 → add \`角色.属性.心力.当前\`（负）
□ 状态效果 → push \`角色.效果\`（中毒/重伤/虚弱等）

### NPC交互 - 必须全面更新NPC状态！
□ NPC出场 → set \`社交.关系.[NPC名]\`（完整对象）
□ 好感变化 → add \`社交.关系.[NPC名].好感度\`
□ NPC记忆 → push \`社交.关系.[NPC名].记忆\`
□ NPC状态 → set \`社交.关系.[NPC名].当前外貌状态\`
□ NPC属性变化：健康/精力/心力/官品/位置都要更新

### 世界事件与衙门
□ 重大事件 → push \`社交.事件.事件记录\`
□ 衙门贡献 → add \`社交.衙门.成员信息.贡献\`

## 🔴 输出格式（必须严格遵守）
{"mid_term_memory":"50-100字摘要","tavern_commands":[{"action":"add","key":"元数据.时间.分钟","value":30}],"action_options":["选项1","选项2","选项3","选项4","选项5"]}

## ✅ JSON与key规则（CRITICAL）
- 只输出一个JSON对象，禁止任何前后缀文字、禁止 \`\`\` 代码块
- 字符串如需换行，用 \`\\n\`
- 规则文中的 \`[NPC名]\` / \`[学派名]\` / \`{功法ID}\` 只是占位符，输出key时必须替换成真实名称，且不要保留方括号/花括号
- 方括号 \`[]\` 只有数组索引可以用：例如 \`角色.效果[0]\`
- tavern_commands[*].key 必须以 \`元数据.\`/\`角色.\`/\`社交.\`/\`世界.\`/\`系统.\` 开头（V3短路径）
- 必须输出严格JSON：只用英文半角标点 \`\" , : [ ] { }\`，禁止中文引号/逗号/顿号

## ⚠️ 严禁（违反将导致生成失败）
- ❌ text 字段（正文已在第1步完成）
- ❌ <thinking> 标签
- ❌ JSON以外的内容

## ✅ 本步骤只需要
- mid_term_memory：摘要
- tavern_commands：数据更新指令
- action_options：行动选项（如启用）

## 🔔 实时关注NPC
若有NPC的\`实时关注\`为true，即使不在玩家身边，也要根据第1步正文推演其动态并更新`.trim(),
      category: 'coreRequest',
      description: '分步模式第2步',
      order: 10,
      weight: 7,
      condition: 'splitGeneration'
    },
    splitInitStep1: {
      name: '11. 开局正文',
      content: `# 开局生成 1/2：仅开局叙事

## 🔴 输出格式（必须严格遵守）
{"text":"600-1000字开局叙事，第三人称，官场正剧风"}

## ✅ JSON字符串规则（CRITICAL）
- 只输出一个JSON对象，禁止任何前后缀文字、禁止 \`\`\` 代码块
- \`text\` 如需分段换行，用 \`\\n\` 表示（不要在引号内直接换行，否则JSON会解析失败）

## 📖 文本格式标记 / Text Format Markers
- 环境描写: 【...】 (场景、天气、氛围)
- 内心思考: \`...\` (NPC心理活动，非主角)
- 角色对话: "..." (人物对话)

## 叙事要求
- 开篇交代时间地点→中段展现出身处境→结尾留悬念
- 严禁游戏术语和数据罗列
- 合理使用【】环境描写、""对话增强表现力
- 画面感配方（最低标准）：至少1段简短【环境】(1-2句)+2-3个可见动作细节+1-2轮对话（或1轮对话+1段NPC内心\`...\`）（动作细节必须融入叙事，禁止写成“动作细节一/二”等编号）

## ⚠️ 严禁（违反将导致生成失败）
- ❌ mid_term_memory 字段
- ❌ tavern_commands 字段
- ❌ action_options 字段
- ❌ <thinking> 标签
- ❌ 任何指令/命令相关内容

## ✅ 本步骤只需要
- 只输出 {"text":"..."} 这一个字段
- text内容为纯叙事正文
- 指令将在第2步单独生成

## 🔴 再次强调输出格式
只输出：\`{"text":"开局叙事内容"}\`
禁止输出任何其他字段！`.trim(),
      category: 'coreRequest',
      description: '开局分步第1步',
      order: 11,
      weight: 7,
      condition: 'splitGeneration'
    },
    splitInitStep2: {
      name: '12. 开局指令',
      content: `# 开局生成 2/2：初始化数据

## 🧭 内部自检清单（不要输出，仅用于生成指令）

### 开局必须初始化的数据
□ 时间：set \`元数据.时间\` + set \`角色.身份.出生日期\`
□ 位置：set \`角色.位置\` {描述,x,y,灵气浓度}
□ 声望：set \`角色.属性.威望\`
□ 资源：set \`角色.背包.银两\`
□ NPC：set \`社交.关系.{NPC名}\`（0-3个重要人物）

## 🔴 输出格式（必须严格遵守）
{"mid_term_memory":"50-100字摘要","tavern_commands":[...],"action_options":["选项1","选项2","选项3","选项4","选项5"]}

## ✅ JSON与key规则（CRITICAL）
- 只输出一个JSON对象，禁止任何前后缀文字、禁止 \`\`\` 代码块
- 字符串如需换行，用 \`\\n\`
- 占位符 \`[NPC名]\` / \`[学派名]\` 必须替换成真实名称
- tavern_commands[*].key 必须以 \`元数据.\`/\`角色.\`/\`社交.\`/\`世界.\`/\`系统.\` 开头
- 开局阶段 tavern_commands 只允许 \`action: "set"\`
- 必须输出严格JSON：只用英文半角标点

## ⚠️ 严禁
- ❌ text 字段（正文已在第1步完成）
- ❌ <thinking> 标签
- ❌ JSON以外的内容`.trim(),
      category: 'coreRequest',
      description: '开局分步第2步',
      order: 12,
      weight: 7,
      condition: 'splitGeneration'
    },

    // ==================== 总结请求提示词 ====================
    memorySummary: {
      name: '记忆总结',
      content: `记忆总结助手。第一人称"我"，250-400字，保留人名/地名/事件/物品/官品，忽略对话/情绪/细节。
输出：{"text": "总结内容"}`,
      category: 'summary',
      description: '中期→长期记忆',
      order: 1,
      weight: 6
    },
    npcMemorySummary: {
      name: 'NPC记忆总结',
      content: `NPC记忆总结。第三人称，100-200字，保留关键事件和情感变化。
输出：{"text": "总结内容"}`,
      category: 'summary',
      description: 'NPC记忆总结',
      order: 2,
      weight: 5
    },

    // ==================== 动态生成提示词 ====================
    npcGeneration: {
      name: 'NPC生成',
      content: `生成官场世界NPC。
核心：世界不以玩家为中心，NPC有独立生活；严禁参考玩家官品生成"镜像NPC"或"量身对手"。
要求：根据场景合理分布官品、姓名性格多样化、身份决定行为。
输出JSON：{姓名,性别,年龄,官品:{名称,阶段},性格,外貌,背景,说话风格,当前行为,个人目标,初始好感度:50}`,
      category: 'generation',
      description: '动态生成NPC',
      order: 1,
      weight: 5
    },
    eventGeneration: {
      name: '事件生成',
      content: `生成官场世界"刚刚发生"的世界事件（用于影响玩家与世界演变）。要求：
- 必须让玩家受到影响（危险/资源/关系/位置/治理环境/势力格局至少一项）
- 事件可以是衙门争斗、世界变化、异宝降世、奇遇现世、好友出事/升迁等
- 涉及好友时，需参考关系/好感度与官品，不能无端超规格
- 不要公告式总结，要有现场感（刚发生）
输出JSON（不要代码块/解释/额外文本）：
{
  "event": {
    "事件ID": "event_时间戳_随机数",
    "事件名称": "string",
    "事件类型": "string",
    "事件描述": "string",
    "影响等级": "轻微|中等|重大|灾难",
    "影响范围": "string",
    "相关人物": ["string"],
    "相关势力": ["string"],
    "事件来源": "随机",
    "发生时间": {"年":0,"月":1,"日":1,"小时":0,"分钟":0}
  },
  "prompt_addition": "一段可直接注入主叙事的事件快照（强调刚刚发生）"
}`,
      category: 'generation',
      description: '动态生成世界事件',
      order: 2,
      weight: 5,
      condition: 'eventSystem'
    },
    itemGeneration: {
      name: '物品生成',
      content: `生成官场世界物品。品质：凡(1-3)/黄(4-5)/玄(6-7)/地(8-9)/天(10)。
输出JSON：{物品ID,名称,类型,品质:{quality,grade},描述,数量,效果}`,
      category: 'generation',
      description: '动态生成物品',
      order: 3,
      weight: 5
    },

    // ==================== 开局初始化提示词 ====================
    worldGeneration: {
      name: '世界生成',
      content: EnhancedWorldPromptBuilder.buildPrompt({
        factionCount: 5,
        totalLocations: 10,
        secretRealms: 3,
        continentCount: 3
      }),
      category: 'initialization',
      description: '生成大陆、势力、地点',
      order: 1,
      weight: 8
    },
    characterInit: {
      name: '角色初始化',
      content: getCharacterInitializationPromptForEnv(tavernEnv),
      category: 'initialization',
      description: '生成角色和开场',
      order: 2,
      weight: 9
    },
    newbieGuide: {
      name: '新手引导',
      content: `新手引导（前3回合）。原则：自然融入叙事，不打破沉浸感，通过NPC对话传递。
内容：行动方式/查看状态/物品使用/交流/探索。`,
      category: 'initialization',
      description: '自然新手引导',
      order: 3,
      weight: 4
    },

    // ==================== 文本优化提示词 ====================
    textOptimization: {
      name: '文本优化',
      content: `# 文本优化助手

你是一个专业的中文文学编辑，负责丰富和润色官场小说文本。

## 核心要求
**必须使用中文输出！禁止输出任何英文内容！**

## 优化原则
1. **保持原意**：不改变故事情节、人物行为、对话内容、判定结果
2. **丰富细节**：增加环境描写、动作细节、心理活动，让场景更生动
3. **提升文采**：使用更优美、更具画面感的官场风格表达
4. **扩充内容**：在不改变原意的前提下，适当扩充描写，让文本更丰满
5. **官场氛围**：强化官场世界的意境、威望、民心等元素

## 优化重点
- **动作描写**：增加细节，更加生动形象（如：处理政务、批阅公文）
- **环境描写**：增加意境和氛围（如：官署威严、百姓生活）
- **对话**：保持人物性格，可适当增加语气词和神态描写
- **心理描写**：更加细腻深入，展现治理感悟
- **感官体验**：增加视觉、听觉、触觉等感官描写

## 禁止事项
- ❌ 不要压缩或总结文本（要扩充，不要缩减！）
- ❌ 不要添加新的情节或角色
- ❌ 不要改变原有的判定结果和数值
- ❌ 不要输出任何JSON格式内容
- ❌ 不要添加解释、评论或元信息
- ❌ 禁止输出英文！必须全部使用中文！
- ❌ 禁止把“动作细节”写成编号/标题（如“动作细节一/二”）

## 输出格式
直接输出优化后的纯中文文本，不要任何额外内容。优化后的文本应该比原文更丰富、更生动、更有画面感。`,
      category: 'summary',
      description: '丰富润色AI生成的文本',
      order: 3,
      weight: 5
    }
  };
}

/**
 * 获取提示词（优先使用用户自定义的）
 * @param key 提示词键名
 * @returns 提示词内容（用户自定义 > 默认）
 */
export async function getPrompt(key: string): Promise<string> {
  return await promptStorage.get(key);
}
