/**
 * 默认提示词集合 - 完整版
 *
 * 分类说明：
 * 1. 核心请求提示词 - 正常游戏请求时按顺序发送
 * 2. 总结请求提示词 - 记忆总结时使用
 * 3. 生成类提示词 - 世界/NPC/任务等生成
 * 4. 角色初始化提示词 - 创建角色时使用
 *
 * 县令模拟器 - AI驱动的宋代县令模拟游戏
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
  // 县令模拟器核心规则
  COUNTY_DEVELOPMENT_RULES,
  GOVERNMENT_JUDGMENT_RULES,
  JUDGMENT_TRACEABILITY_RULES,
  SEASONAL_SYSTEM_RULES,
  FAILURE_CONSEQUENCE_RULES,
  // 保留的通用规则
  COMMAND_PATH_CONSTRUCTION_RULES,
  STRATEGY_SYSTEM_RULES,
  TECHNIQUE_SYSTEM_RULES,
  PLAYER_AUTONOMY_RULES,
  RATIONALITY_AUDIT_RULES,
  PROFESSION_MASTERY_RULES,
  ANTI_SYCOPHANCY_RULES,
  NPC_RULES,
  MAGISTRATE_STATUS_RULES,
  COUNTY_RESOURCE_RULES,
  ECONOMY_AND_PRICING_RULES,
  STATUS_EFFECT_RULES,
  DAO_COMPREHENSION_RULES,
  SKILL_AND_ACTION_USAGE_RULES
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

// 合并业务规则（县令模拟器核心规则）
const BUSINESS_RULES = [
  // 核心系统规则
  COUNTY_DEVELOPMENT_RULES,
  GOVERNMENT_JUDGMENT_RULES,
  JUDGMENT_TRACEABILITY_RULES,
  SEASONAL_SYSTEM_RULES,
  FAILURE_CONSEQUENCE_RULES,
  // 通用规则
  COMMAND_PATH_CONSTRUCTION_RULES,
  PLAYER_AUTONOMY_RULES,
  RATIONALITY_AUDIT_RULES,
  ANTI_SYCOPHANCY_RULES,
  PROFESSION_MASTERY_RULES,
  STRATEGY_SYSTEM_RULES,
  TECHNIQUE_SYSTEM_RULES
].join('\n\n');

// 扩展业务规则（可选，用户可自定义开启）
const EXTENDED_BUSINESS_RULES = [
  NPC_RULES,
  MAGISTRATE_STATUS_RULES,
  COUNTY_RESOURCE_RULES,
  ECONOMY_AND_PRICING_RULES,
  DAO_COMPREHENSION_RULES,
  STATUS_EFFECT_RULES,
  SKILL_AND_ACTION_USAGE_RULES
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
      description: '县治发展、政务判定、NPC规则',
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
      description: '县令状态、资源管理、经济定价',
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
      description: '判定标记、伤害计算、命名规范',
      order: 4,
      weight: 10
    },
    worldStandards: {
      name: '5. 世界标准',
      content: WORLD_STANDARDS,
      category: 'coreRequest',
      description: '品质系统、声望等级',
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
- 【】只允许写环境/场景，严禁用于系统/面板：禁止【系统提示】、【系统判定】、【当前状态】、【健康/精力】等
- 系统判定/状态变化必须写在 〔〕 内；禁止在正文中单独输出"系统提示/系统判定/当前状态"等标题行
  - ✅ 〔断案:成功,判定值:65,难度:60,精力:80/100,民心:65,状态乘区:1.05〕
  - ✅ 〔征税:失败,判定值:42,难度:55,民心:30,状态乘区:0.70〕
  - ❌ 【当前状态】健康：95/100
  - ❌ 系统提示：……

## 📝 正文要求（必须遵守）
1. **长度**：建议400-800字，重要场景可到1000字，不要太长！
2. **判定系统**：断案/征税/建设/教化/赈灾/治安/外交/考核等政务场景**必须使用判定**
3. **判定格式（必须严格遵守）**：〔类型:结果,判定值:数字,难度:数字,关键因素,状态乘区:X.XX〕
   - 类型 ∈ 断案/征税/建设/教化/赈灾/治安/外交/考核
   - 结果 ∈ 大失败/失败/成功/大成功/完美
   - 结果 ∈ 大失败/失败/成功/大成功/完美
4. **叙事风格**：多描写少总结，结尾留钩子，承接上文情节
5. **格式标记**：合理使用【】环境、\`心理\`、""对话、〔〕判定
6. **叙事法度（基本要求）**：至少1个可见动作细节+1轮"对话"或NPC内心\`...\`；【环境】仅在场景变化/信息必要时写1-2句（动作细节需自然融入叙事，禁止写成"动作细节一/二"等编号）

## 政务场景特别要求
- 每次处理政务都要进行判定（使用政务判定系统）
- 判定结果决定政绩和后果
- 失败可能导致民心下降/资源浪费/威望受损
- 成功可能提升政绩/民心/威望

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

### 政务处理与县治发展
□ 日常处理政务 → add \`角色.政务.政绩.当前\`
□ 方略熟练 → add \`角色.方略.方略进度.[方略ID].熟练度\`
□ 方略解锁 → set \`角色.方略.方略列表.[方略名]\`（完整DaoData对象）
□ 方略解锁技能 → push \`角色.方略.方略进度.[方略ID].已解锁技能\`
□ 县治阶段晋升 → 自动检查条件晋升（残破村庄→聚落乡→县治集镇→繁华州府→天下名都）
□ 县治资源更新 → 更新人口/库银/民心/治安/繁荣度/教化

### NPC交互 - 必须全面更新NPC状态！
□ NPC出场 → set \`社交.关系.[NPC名]\`（完整对象）
□ 好感变化 → add \`社交.关系.[NPC名].好感度\`
□ NPC记忆 → push \`社交.关系.[NPC名].记忆\`
□ NPC状态 → set \`社交.关系.[NPC名].当前外貌状态\`
□ NPC属性变化：健康/精力/威望/官品/位置都要更新

### 精力与消耗 - 必须更新所有参与者！
□ 处理政务消耗 → add \`角色.精力.当前\`（负，按政务消耗3-20%）
□ 玩家受伤 → add \`角色.健康.当前\`（负）
□ NPC受伤 → add \`社交.关系.[NPC名].健康.当前\`（负）
□ 威望消耗 → add \`角色.威望.当前\`（负）
□ 状态效果 → push \`角色.效果\`（中毒/疲劳/焦虑等）

## 🔴 输出格式（必须严格遵守）
{"mid_term_memory":"50-100字摘要","tavern_commands":[{"action":"add","key":"元数据.时间.分钟","value":30}],"action_options":["选项1","选项2","选项3","选项4","选项5"]}

## ✅ JSON与key规则（CRITICAL）
- 只输出一个JSON对象，禁止任何前后缀文字、禁止 \`\`\` 代码块
- 字符串如需换行，用 \`\\n\`
- 规则文中的 \`[NPC名]\` / \`[方略名]\` / \`{方略ID}\` 只是占位符，输出key时必须替换成真实名称，且不要保留方括号/花括号
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
□ 位置：set \`角色.位置\` {描述,x,y}
□ 声望：set \`角色.属性.威望\`
□ 资源：set \`角色.背包.银两\`
□ 官品：set \`角色.身份.官品\` {品级:7,称号:"知县"}
□ NPC：set \`社交.关系.{NPC名}\`（0-3个重要人物，如师爷/县丞）

## 🔴 输出格式（必须严格遵守）
{"mid_term_memory":"50-100字摘要","tavern_commands":[...],"action_options":["选项1","选项2","选项3","选项4","选项5"]}

## ✅ JSON与key规则（CRITICAL）
- 只输出一个JSON对象，禁止任何前后缀文字、禁止 \`\`\` 代码块
- 字符串如需换行，用 \`\\n\`
- 占位符 \`[NPC名]\` / \`[方略名]\` 必须替换成真实名称
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
      content: `# 记忆总结助手（县令模拟器专用）

你是县令模拟器的记忆总结助手，负责将中期记忆转化为长期记忆。

## 总结原则
- 第一人称"我"（玩家身份：县令）
- 250-400字，保留关键信息
- 突出政务决策、政绩变化、官场关系
- 保留人名/地名/事件/物品/官品
- 忽略对话细节、情绪描写、环境描写

## 重点内容
- 重要政务决策及其后果
- 官品晋升/考核结果
- 与上级/同僚/下属的关系变化
- 县治核心资源变化（人口、库银、民心、治安）
- 重大事件（民生危机、朝廷诏令、特殊机遇）

## 输出格式
输出：{"text": "总结内容"}

## 示例
"我担任县令以来，处理了流民安置问题，民心提升，但库银有所减少。上级刺史巡访时对我政绩表示认可。本县乡绅王员外捐赠了粮草，帮助渡过难关。与邻县县令李某关系融洽，约定共同治理匪患。"`,
      category: 'summary',
      description: '中期→长期记忆',
      order: 1,
      weight: 6
    },
    npcMemorySummary: {
      name: 'NPC记忆总结',
      content: `# NPC记忆总结（县令模拟器专用）

你是县令模拟器的NPC记忆总结助手。

## 总结原则
- 第三人称，100-200字
- 保留关键事件和情感变化
- 突出NPC与玩家的关系演变
- 记录NPC的政务能力和性格特点

## 重点内容
- NPC与玩家的互动事件
- NPC的好感度变化
- NPC的政务贡献或问题
- NPC的个人目标和诉求

## 输出格式
输出：{"text": "总结内容"}

## 示例
"师爷李明辅佐玩家处理多起政务，展现出色的文书能力。对玩家忠诚度提升，多次在关键时刻提供建议。近期因家中老母患病，请求玩家允许告假省亲。性格谨慎，办事稳妥，是值得信赖的助手。"`,
      category: 'summary',
      description: 'NPC记忆总结',
      order: 2,
      weight: 5
    },

    // ==================== 动态生成提示词 ====================
    npcGeneration: {
      name: 'NPC生成',
      content: `生成县令模拟器世界NPC（宋代官场背景）。
核心：世界不以玩家为中心，NPC有独立生活；严禁参考玩家官品生成"镜像NPC"或"量身对手"。

## 角色类型（根据场景选择）
- 官场类：上级官员（刺史/州府）、同僚（同县/邻县县令）、下属（县丞/主簿/衙役）
- 民间类：乡绅富户、商人贾贩、文人学士、普通百姓
- 特殊类：江湖人士、游方郎中、僧道术士

## 生成要求
- 姓名符合宋代命名习惯（避免现代感）
- 身份决定行为和说话方式
- 官员有官品（从九品至正四品）
- 性格多样化（正直/圆滑/贪婪/清廉/谨慎/豪放等）

输出JSON：{姓名,性别,年龄,身份,官品?(如有),性格,外貌,背景,说话风格,当前行为,个人目标,与玩家关系,初始好感度:50}`,
      category: 'generation',
      description: '动态生成NPC',
      order: 1,
      weight: 5
    },
    eventGeneration: {
      name: '事件生成',
      content: `生成县令模拟器世界"刚刚发生"的世界事件（宋代官场背景，用于影响玩家与世界演变）。

## 事件类型
- 治理类：民生问题（灾荒/瘟疫/盗贼/流民）、财政危机、治安动荡
- 官场类：上级考核、同僚争斗、朝廷异动、州府命令
- 人情类：乡绅关系、百姓请愿、同窗故旧
- 特殊类：异象天兆、文物出土、商贸往来

## 生成要求
- 必须让玩家受到影响（政务/财政/民心/治安/仕途至少一项）
- 事件要有现场感（刚发生），不要公告式总结
- 涉及好友时，需参考关系/好感度与官品，不能无端超规格
- 事件后果需影响核心资源：人口、库银、民心、治安

输出JSON（不要代码块/解释/额外文本）：
{
  "event": {
    "事件ID": "event_时间戳_随机数",
    "事件名称": "string",
    "事件类型": "治理类|官场类|人情类|特殊类",
    "事件描述": "string",
    "影响等级": "轻微|中等|重大|灾难",
    "影响范围": "本县|邻县|州府|朝廷",
    "相关人物": ["string"],
    "影响资源": ["人口|库银|民心|治安"],
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
      content: `生成县令模拟器物品（宋代官场背景）。

## 物品类型
- 文房用品：笔墨纸砚、书籍典籍、印章印泥
- 官场用品：官服官帽、公文信件、令牌印信
- 民生用品：粮食布匹、农具工具、药品药材
- 贵重物品：金银珠宝、古董字画、玉石玛瑙

## 品质分级
- 凡品(1-3)：日常用品，普通质量
- 良品(4-5)：优质用品，有增值效果
- 精品(6-7)：工匠精品，稀有难得
- 珍品(8-9)：名家制作，价值连城
- 绝品(10)：传世孤品，无价之宝

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
      content: `# 新手引导（县令模拟器专用）

## 引导原则
- 自然融入叙事，不打破沉浸感，通过师爷对话传递
- 避免直接暴露游戏机制，用符合时代背景的语言引导
- 前3-5个政务周期逐步介绍核心施政要点

## 引导内容
### 第一阶段：初到任上
- 通过师爷介绍县治基本情况（人口、库银、民心、治安）
- 引导玩家查看县治状态和公文
- 介绍核心资源：人口、库银、民心、治安

### 第二阶段：熟悉政务
- 通过具体事务（如百姓请愿、批阅公文）引导玩家决策
- 介绍决策后果会影响民心和治安
- 引导玩家了解自己的官品和政绩

### 第三阶段：治理之道
- 介绍升迁机制（政绩、考核、上级评价）
- 引导玩家处理更复杂的政务（如审理案件、应对上级检查）
- 鼓励玩家探索不同治理风格（清流/务实/圆滑等）

## 对话示例
- 师爷："大人，这是本县的人口、库银、民心、治安四项数据，还请过目。"
- 师爷："大人，今日有几件公文需您批阅，关乎本县民生。"
- 师爷："大人，治理一县，既要安抚民心，又要应对上级考核，实非易事。"`,
      category: 'initialization',
      description: '县令模拟器新手引导',
      order: 3,
      weight: 4
    },

    // ==================== 文本优化提示词 ====================
    textOptimization: {
      name: '文本优化',
      content: `# 文本优化助手（县令模拟器专用）

你是一个专业的中文文学编辑，负责丰富和润色宋代官场小说文本。

## 核心要求
**必须使用中文输出！禁止输出任何英文内容！**

## 时代背景
- 朝代：北宋时期
- 场景：县衙、官府、民间
- 人物：县令、师爷、衙役、乡绅、百姓
- 主题：施政、判案、民生、官场

## 优化原则
1. **保持原意**：不改变故事情节、人物行为、对话内容、判定结果
2. **丰富细节**：增加环境描写、动作细节、心理活动，让场景更生动
3. **提升文采**：使用更优美、更具画面感的宋代官场风格表达
4. **扩充内容**：在不改变原意的前提下，适当扩充描写，让文本更丰满
5. **官场氛围**：强化县令治理、衙门威仪、百姓民生的元素

## 优化重点
- **动作描写**：增加细节，更加生动形象（如：批阅公文、升堂断案、巡视县治）
- **环境描写**：增加意境和氛围（如：县衙威严、街市繁华、乡村田园）
- **对话**：保持人物性格，使用符合身份的语言风格（官员/师爷/百姓）
- **心理描写**：更加细腻深入，展现治理者的思虑和决断
- **感官体验**：增加视觉、听觉、触觉等感官描写

## 术语规范
- 使用"施政/治国"代替"修炼"
- 使用"方略/政策"代替"功法"
- 使用"官品/晋升"代替"境界/突破"
- 使用"银两/库银"代替"灵石"
- 使用"衙门/县衙"代替"宗门"
- 使用"民心/威望"代替"灵气"
- 使用"政绩/功绩"代替"功德"
- 使用"县令/大人"代替"掌门"
- 使用"下属/官员"代替"弟子"

## 禁止事项
- ❌ 不要压缩或总结文本（要扩充，不要缩减！）
- ❌ 不要添加新的情节或角色
- ❌ 不要改变原有的判定结果和数值
- ❌ 不要输出任何JSON格式内容
- ❌ 不要添加解释、评论或元信息
- ❌ 禁止输出英文！必须全部使用中文！
- ❌ 禁止把"动作细节"写成编号/标题（如"动作细节一/二"）
- ❌ 禁止使用修仙/武道术语（如"灵气""境界""功法""宗门"等）

## 输出格式
直接输出优化后的纯中文文本，不要任何额外内容。优化后的文本应该比原文更丰富、更生动、更有画面感，符合宋代官场的历史氛围。`,
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
