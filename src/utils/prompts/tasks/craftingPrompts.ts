import { generateQualitySystemPrompt } from '@/data/itemQuality';
import type { CraftingType } from '@/utils/craftingSystem';
import type { ItemQuality } from '@/types/game';

export type CraftingFireInput = { percent: number; label: string };

export type CraftingFormationInput = {
  id: string;
  name: string;
  desc: string;
  extraManaPercent: number;
  extraSpiritPercent: number;
};

export type CraftingResourcePlan = {
  灵气: {
    当前: number;
    投入百分比: number;
    阵法额外百分比: number;
    基础消耗: number;
    额外消耗: number;
    总消耗: number;
  };
  神识: {
    当前: number;
    投入百分比: number;
    阵法额外百分比: number;
    基础消耗: number;
    额外消耗: number;
    总消耗: number;
  };
};

export interface CraftingMaterialSnapshot {
  名称: string;
  类型: string;
  品质: { quality: string; grade: number | string };
  描述?: string;
}

export interface CraftingNarrativeInput {
  type: CraftingType;
  fire: CraftingFireInput;
  formation: CraftingFormationInput;
  resources?: CraftingResourcePlan;
  successRate: number;
  success: boolean;
  resultQuality: ItemQuality;
  materials: CraftingMaterialSnapshot[];
}

export interface CraftingSimulationInput {
  type: CraftingType;
  fire: CraftingFireInput;
  formation: CraftingFormationInput;
  resources?: CraftingResourcePlan;
  materials: CraftingMaterialSnapshot[];
  characterSnapshot?: {
    先天六司?: Record<string, number>;
    后天六司?: Record<string, number>;
    大道摘要?: string[];
    境界?: string;
  };
}

export interface CraftingFinalizeInput {
  type: CraftingType;
  fire: CraftingFireInput;
  formation: CraftingFormationInput;
  resources?: CraftingResourcePlan;
  materials: CraftingMaterialSnapshot[];
  simulation?: {
    successRate?: number;
    predictedQuality?: ItemQuality;
  };
  characterSnapshot?: CraftingSimulationInput['characterSnapshot'];
}

export function buildCraftingNarrativePrompts(input: CraftingNarrativeInput): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `
你是"官场游戏制造文案生成器"。你的任务是：根据给定的材料/火候/阵法/成功率/结果品质，生成制造过程描写与成品描述。

硬性规则：
1) 只输出一个 JSON 对象，禁止输出 Markdown、代码块、解释文字、前后缀。
2) 禁止虚构未提供的材料与关键信息；可合理补全细节（火候变化、气机、药香、金铁之声等）。
3) 必须严格遵守结果：success=false 表示失败（成品为废品/残次品等），success=true 表示成功。
4) 必须严格遵守物品品质体系：仅使用给定 resultQuality（quality 与 grade），不要自行更改。
5) 若提供 resources（灵气/神识消耗计划），文案与事件描述必须与其一致，不要写出超过当前值的消耗。

## 【城市等级】-品质上限（文案必须体现）
生产成品品质受角色城市等级严格限制，文案描写必须与此一致：
- 荒村/集镇：最高只能生产【黄品】，通常只能生产【凡品】
- 县城：最高只能生产【玄品】
- 府城：最高只能生产【地品】
- 州城：最高可生产【天品】
- 都城及以上：最高可生产【仙品】
- 皇城及以上：可生产【神品】，需要特殊机缘或高官身份

## 【大道熟练度】限制
无对应生产大道（生产之道/制造之道等）或大道等级过低时：
- 无大道/入门：文案应体现手法生疏、险象环生
- 略有所得/小有成就：文案应体现尚在摸索、偶有失误
- 登堂入室及以上：文案可体现从容不迫、技艺娴熟

输出 JSON 结构：
{
  "processText": "string（生产过程描写，分段可用\\n）",
  "itemName": "string（成品名称，失败时也要给出名称）",
  "itemDesc": "string（成品描述，含品质与大致功效/缺陷，失败时突出副作用/无效）",
  "eventDesc": "string（用于写入事件记录的描述，需包含材料清单与结果概要）"
}

${generateQualitySystemPrompt()}
`.trim();

  const userPrompt = `
请生成一次生产文案（JSON 输出）。

生产类型：${input.type}
火候强度：${input.fire.percent}%（${input.fire.label}）
阵法：${input.formation.name}（额外：灵气+${input.formation.extraManaPercent}% / 神识+${input.formation.extraSpiritPercent}%）
成功率：${input.successRate}%
结果是否成功：${input.success ? '成功' : '失败'}
结果品质：${input.resultQuality.quality}·${String(input.resultQuality.grade)}

灵力/神识消耗（如提供则必须遵守，不得超过当前值）：
${JSON.stringify(input.resources ?? {}, null, 2)}

材料清单（仅可使用这些材料）：
${JSON.stringify(input.materials, null, 2)}
  `.trim();

  return { systemPrompt, userPrompt };
}

export function buildCraftingSimulationPrompts(input: CraftingSimulationInput): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `
你是"官场游戏制造推演器"。你需要根据材料、火候、阵法、角色信息与大道加成，推演制造的成功率与预期品质。

硬性规则：
1) 只输出一个 JSON 对象，禁止输出 Markdown、代码块、解释文字、前后缀。
2) successRate 必须是 5-95 的整数。
3) predictedQuality 必须符合物品品质体系：quality 只能是 神/仙/天/地/玄/黄/凡，grade 只能是 0-10 的整数。
4) 这是"推演"，不是最终结果：不要输出成品物品，不要输出战斗/剧情延伸。
5) 若提供 resources：视作"投入强度约束"，推演应考虑投入与阵法额外消耗，但不得写出超过当前值的消耗。

## 【城市等级】-品质上限（绝对不可突破）
生产成品品质受角色城市等级严格限制，这是硬性天花板：
- 荒村/集镇：最高只能生产【黄品】，通常只能生产【凡品】
- 县城：最高只能生产【玄品】
- 府城：最高只能生产【地品】
- 州城：最高可生产【天品】
- 都城及以上：最高可生产【仙品】
- 皇城及以上：可生产【神品】，需要特殊机缘或高官身份

## 【大道熟练度】限制
无对应生产大道（生产之道/制造之道等）或大道等级过低时：
- 无大道/入门：成功率极低(5-15%)，最高凡品下品
- 略有所得：成功率低(15-30%)，最高凡品中品
- 小有成就：成功率一般(30-50%)，可尝试黄品
- 登堂入室：成功率中等(40-60%)，黄品稳定
- 融会贯通及以上：可尝试更高品质，但仍受城市等级限制

## 【材料品质】限制
成品品质不可能超过主材料品质，且通常会略低于主材料。

输出 JSON 结构：
{
  "successRate": number,
  "predictedQuality": { "quality": "凡|黄|玄|地|天|仙|神", "grade": 0-10 },
  "analysis": "string（简短推演依据，1-3句）",
  "warnings": ["string"...]
}

${generateQualitySystemPrompt()}
`.trim();

  const userPrompt = `
请推演一次生产（JSON 输出）。

生产类型：${input.type}
火候强度：${input.fire.percent}%（${input.fire.label}）
阵法：${input.formation.name}（额外：灵气+${input.formation.extraManaPercent}% / 神识+${input.formation.extraSpiritPercent}%）

材料清单：
${JSON.stringify(input.materials, null, 2)}

投入与资源上限（如提供则必须遵守，不得超过当前值）：
${JSON.stringify(input.resources ?? {}, null, 2)}

角色信息（可能为空）：
${JSON.stringify(input.characterSnapshot ?? {}, null, 2)}
  `.trim();

  return { systemPrompt, userPrompt };
}

export function buildCraftingFinalizePrompts(input: CraftingFinalizeInput): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `
你是"官场游戏制造裁定器"。你需要输出最终制造结果：是否成功、产出物品（严格 JSON）、制造过程描写与事件描述。

硬性规则：
1) 只输出一个 JSON 对象，禁止输出 Markdown、代码块、解释文字、前后缀。
2) 必须输出 success(boolean)、successRate(number)、item(object)、processText(string)、eventDesc(string)。
3) item 必须符合游戏 Item 结构（字段名用中文）：物品ID(可留空字符串)、名称、类型(装备/产品/材料/其他/策略)、品质{quality,grade}、数量、描述、可叠加(可选)。
4) 若生产类型为"生产"，成功产物类型必须是"产品"；若为"制造"，成功产物类型必须是"装备"。
5) 失败时允许产物为"废品/炉渣"等：类型可为"产品"或"材料/其他"，但必须与描述一致。
6) successRate 必须与推演一致（如果给了推演），否则按你推导给出 5-95 的整数。
7) predictedQuality（如果给了）仅作参考，但【必须受城市等级限制约束】，不可突破城市等级上限。
8) 若提供 resources（灵气/神识消耗计划）：你在 processText / eventDesc 里必须体现该投入与消耗，且不得写出超过当前值的消耗。

## 【最高优先级】城市等级-品质硬性上限
这是绝对不可突破的天花板，无论材料多好、推演结果如何，都必须遵守：
| 城市等级 | 生产品质上限 | 说明 |
|---------|-------------|------|
| 荒村/集镇 | 黄品 | 通常只能炼出凡品，黄品已是极限 |
| 县城 | 玄品 | 玄品已是天花板 |
| 府城 | 地品 | 地品需要府城资源支撑 |
| 州城 | 天品 | 天品需要州城级别的底蕴 |
| 都城 | 仙品 | 仙品需要都城级别的地位 |
| 皇城+ | 神品 | 神品唯有皇城级别大员可触及 |

违反此规则的输出将被系统拒绝！

## 【大道熟练度】限制
无对应生产大道或等级过低时，成功率和品质都会大幅下降：
- 无大道/入门：成功率5-15%，最高凡品下品，大概率失败
- 略有所得：成功率15-30%，最高凡品中品
- 小有成就：成功率30-50%，可尝试黄品下品
- 登堂入室：成功率40-60%，黄品稳定
- 融会贯通+：可尝试更高，但仍受城市等级限制

## 【材料品质】限制
成品品质绝不可能超过主材料品质。用凡品材料不可能炼出黄品以上。

输出 JSON 结构：
{
  "success": boolean,
  "successRate": number,
  "item": {
    "物品ID": "",
    "名称": "string",
    "类型": "装备|产品|材料|其他|策略",
    "品质": { "quality": "凡|黄|玄|地|天|仙|神", "grade": 0-10 },
    "数量": number,
    "描述": "string",
    "可叠加": boolean
  },
  "processText": "string",
  "eventDesc": "string"
}

${generateQualitySystemPrompt()}
`.trim();

  const userPrompt = `
请裁定一次最终生产结果（JSON 输出）。

生产类型：${input.type}
火候强度：${input.fire.percent}%（${input.fire.label}）
阵法：${input.formation.name}（额外：灵气+${input.formation.extraManaPercent}% / 神识+${input.formation.extraSpiritPercent}%）

材料清单：
${JSON.stringify(input.materials, null, 2)}

投入与资源上限（如提供则必须遵守，不得超过当前值）：
${JSON.stringify(input.resources ?? {}, null, 2)}

推演结果（如果存在）：
${JSON.stringify(input.simulation ?? {}, null, 2)}

角色信息（可能为空）：
${JSON.stringify(input.characterSnapshot ?? {}, null, 2)}
  `.trim();

  return { systemPrompt, userPrompt };
}
