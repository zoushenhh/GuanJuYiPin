# 政务处理核心逻辑 - 使用指南

> 本文档说明如何使用 `governmentAffairHandler.ts` 模块处理政务事务。

## 目录

1. [快速开始](#快速开始)
2. [核心函数](#核心函数)
3. [使用示例](#使用示例)
4. [与 commandValidator 集成](#与-commandvalidator-集成)
5. [常见问题](#常见问题)

---

## 快速开始

### 基本用法

```typescript
import { handleAffair } from '@/utils/governmentAffairHandler';

// 处理政务（选择第一个选项）
const result = await handleAffair('disaster_drought', 0);

console.log(result.描述);        // "开仓放粮，民心大悦，旱情得到缓解。"
console.log(result.变化);         // { 民心: 15, 治安: 5, 政绩: 10, 威望: 5 }
console.log(result.时间推进分钟); // 480 (8小时)
```

---

## 核心函数

### 1. handleAffair(affairId, choiceIndex)

处理政务事务的核心函数。

**参数：**
- `affairId: string` - 政务事务ID（如 `'disaster_drought'`）
- `choiceIndex: number` - 选项索引（从0开始）

**返回：** `Promise<AffairProcessResult>`

**功能：**
1. 验证政务和选项有效性
2. 检查资源是否充足（库银、粮食、政绩）
3. 计算成功率（受县令属性、难度影响）
4. 判定成功/失败
5. 计算并应用数值变化
6. 推进游戏时间
7. 从政务台移除待办事项
8. 返回处理报告

**错误处理：**
- 抛出异常如果政务不存在
- 抛出异常如果选项索引超出范围
- 抛出异常如果资源不足

### 2. generateDailyAffairs(gameTime, options?)

生成日常公文。

**参数：**
- `gameTime: GameTime` - 当前游戏时间
- `options?: DailyAffairOptions` - 生成选项
  - `最小数量?: number` - 最小生成数量（默认2）
  - `最大数量?: number` - 最大生成数量（默认4）
  - `强制类型?: GovernmentAffairType` - 强制指定类型
  - `仅日常?: boolean` - 只生成低紧急度事务

**返回：** `Promise<number>` - 生成的政务数量

**功能：**
1. 根据当前状态筛选可用政务
2. 应用权重（民心低时增加救灾类、治安差时增加剿匪类等）
3. 随机选择政务并添加到政务台
4. 自动计算截止时间

### 3. checkOverdueAffairs(currentTime)

检查逾期政务并应用惩罚。

**参数：**
- `currentTime: GameTime` - 当前游戏时间

**返回：** `OverduePenalty[]` - 逾期惩罚列表

**功能：**
1. 遍历政务台待办事项
2. 比较截止时间和当前时间
3. 计算逾期天数
4. 根据紧急度和逾期天数计算惩罚
5. 自动应用惩罚到游戏状态

---

## 使用示例

### 示例 1：处理政务并显示结果

```typescript
import { handleAffair } from '@/utils/governmentAffairHandler';
import { useGameStateStore } from '@/stores/gameStateStore';

async function processGovernmentAffair() {
  const gameStateStore = useGameStateStore();

  try {
    // 处理"旱灾救助"政务，选择"开仓放粮"方案
    const result = await handleAffair('disaster_drought', 0);

    // 显示结果
    alert(`
      处理结果：${result.success ? '成功' : '失败'}
      ${result.描述}

      消耗：
      - 库银：${result.消耗.银两 || 0}
      - 粮食：${result.消耗.粮食 || 0}

      变化：
      - 民心：${result.变化.民心 > 0 ? '+' : ''}${result.变化.民心}
      - 治安：${result.变化.治安 > 0 ? '+' : ''}${result.变化.治安}
      - 政绩：${result.变化.政绩 > 0 ? '+' : ''}${result.变化.政绩}

      时间推进：${Math.floor(result.时间推进分钟 / 60)}小时
    `);

    // 如果触发剧情，可以调用AI生成剧情文本
    if (result.触发剧情 && result.剧情提示词) {
      await generateNarrative(result.剧情提示词);
    }

  } catch (error) {
    // 处理错误（如资源不足）
    alert(`处理失败：${error.message}`);
  }
}
```

### 示例 2：生成日常公文

```typescript
import { generateDailyAffairs } from '@/utils/governmentAffairHandler';
import { useGameStateStore } from '@/stores/gameStateStore';

async function startNewDay() {
  const gameStateStore = useGameStateStore();

  // 生成2-4个日常政务
  const count = await generateDailyAffairs(gameStateStore.gameTime, {
    最小数量: 2,
    最大数量: 4,
    仅日常: true, // 只生成低紧急度的日常事务
  });

  console.log(`新的一天开始了，生成了 ${count} 个待办政务`);

  // 检查是否有高紧急度的政务
  const highUrgencyAffairs = gameStateStore.getAffairsByUrgency('高');
  if (highUrgencyAffairs.length > 0) {
    console.warn(`⚠️ 有 ${highUrgencyAffairs.length} 个高紧急度政务需要处理！`);
  }
}
```

### 示例 3：检查逾期政务

```typescript
import { checkOverdueAffairs } from '@/utils/governmentAffairHandler';
import { useGameStateStore } from '@/stores/gameStateStore';

function checkOverdue() {
  const gameStateStore = useGameStateStore();

  // 检查逾期政务
  const penalties = checkOverdueAffairs(gameStateStore.gameTime);

  if (penalties.length > 0) {
    // 显示逾期警告
    const message = penalties.map(p =>
      `${p.affairName} 逾期${p.逾期天数}天：${p.描述}`
    ).join('\n');

    alert(`⚠️ 逾期政务警告：\n${message}`);
  } else {
    console.log('✅ 没有逾期政务');
  }
}
```

### 示例 4：与游戏时间系统集成

```typescript
import { handleAffair, checkOverdueAffairs, generateDailyAffairs } from '@/utils/governmentAffairHandler';
import { useGameStateStore } from '@/stores/gameStateStore';

async function advanceTimeAndCheck(hours: number) {
  const gameStateStore = useGameStateStore();

  // 1. 推进时间
  gameStateStore.advanceGameTime(hours * 60);

  // 2. 检查逾期政务
  const penalties = checkOverdueAffairs(gameStateStore.gameTime);
  if (penalties.length > 0) {
    console.warn(`⚠️ 检测到 ${penalties.length} 个逾期政务`);
  }

  // 3. 如果是新的一天（跨日），生成新的日常政务
  if (gameStateStore.gameTime.小时 === 6) { // 假设每天早上6点生成
    await generateDailyAffairs(gameStateStore.gameTime);
  }
}
```

---

## 与 commandValidator 集成

### 原理

`commandValidator.ts` 负责验证和执行 AI 返回的命令。政务处理可以通过扩展 commandValidator 来支持 AI 直接调用。

### 集成步骤

#### 步骤 1：扩展命令类型

在 `src/types/AIGameMaster.ts` 中添加政务相关命令类型：

```typescript
export interface TavernCommand {
  action: string;
  key?: string;
  value?: any;

  // 新增政务相关命令
  处理政务?: {
    affairId: string;
    choiceIndex: number;
  };

  生成公文?: {
    count?: number;
    onlyDaily?: boolean;
  };
}
```

#### 步骤 2：在 commandValidator 中添加处理逻辑

在 `src/utils/commandValidator.ts` 中添加：

```typescript
import { handleAffair, generateDailyAffairs } from './governmentAffairHandler';

// 在 validateAndExecuteCommands 函数中添加
export async function validateAndExecuteCommands(
  commands: TavernCommand[],
  gameStateStore: ReturnType<typeof useGameStateStore>
): Promise<ValidationResult> {
  // ... 现有验证逻辑 ...

  for (const cmd of commands) {
    // ... 现有命令处理 ...

    // 新增：处理政务命令
    if (cmd.action === '处理政务') {
      try {
        const result = await handleAffair(
          cmd.处理政务?.affairId,
          cmd.处理政务?.choiceIndex || 0
        );

        // 记录结果到叙事历史
        gameStateStore.narrativeHistory?.push({
          role: 'system',
          content: `处理政务：${result.描述}`,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        return {
          valid: false,
          errors: [`处理政务失败：${error.message}`],
          warnings: [],
        };
      }
    }

    // 新增：生成公文命令
    if (cmd.action === '生成公文') {
      const count = await generateDailyAffairs(
        gameStateStore.gameTime,
        {
          最小数量: cmd.生成公文?.count || 2,
          最大数量: cmd.生成公文?.count || 4,
          仅日常: cmd.生成公文?.onlyDaily,
        }
      );

      console.log(`✅ AI生成了 ${count} 个公文`);
    }
  }

  // ... 返回验证结果 ...
}
```

#### 步骤 3：在提示词中说明

在 AI 提示词中添加政务命令说明：

```markdown
## 政务处理命令

你可以通过以下命令处理政务事务：

### 处理政务
\`\`\`json
{
  "action": "处理政务",
  "处理政务": {
    "affairId": "disaster_drought",
    "choiceIndex": 0
  }
}
\`\`\`

- `affairId`: 政务ID（参考政务数据配置）
- `choiceIndex`: 选项索引（0=第一个选项，1=第二个选项，...）

### 生成公文
\`\`\`json
{
  "action": "生成公文",
  "生成公文": {
    "count": 3,
    "onlyDaily": true
  }
}
\`\`\`

- `count`: 生成数量（默认2-4）
- `onlyDaily`: 是否只生成日常事务（默认true）
```

### AI 使用示例

AI 可以在对话中自动处理政务：

```json
{
  "tavern_commands": [
    {
      "action": "处理政务",
      "处理政务": {
        "affairId": "disaster_drought",
        "choiceIndex": 0
      }
    },
    {
      "action": "set",
      "key": "元数据.时间",
      "value": { "年": 1, "月": 3, "日": 16, "小时": 14, "分钟": 0 }
    }
  ]
}
```

---

## 常见问题

### Q1: 如何处理政务失败的情况？

A: `handleAffair` 函数会根据成功率自动判定成功/失败，返回的 `success` 字段表示结果。失败时会应用 `failureEffect`，但仍然会消耗资源。

```typescript
const result = await handleAffair('disaster_drought', 0);

if (!result.success) {
  console.log('处理失败，但资源已消耗');
  console.log('失败效果：', result.描述);
}
```

### Q2: 如何自定义政务生成规则？

A: 通过 `generateDailyAffairs` 的 `options` 参数：

```typescript
// 只生成救灾类政务
await generateDailyAffairs(gameTime, {
  强制类型: '救灾',
  最小数量: 1,
  最大数量: 2,
});

// 生成高紧急度的突发事务
await generateDailyAffairs(gameTime, {
  强制类型: '剿匪',
  最小数量: 1,
  最大数量: 1,
});
```

### Q3: 如何修改逾期惩罚规则？

A: 修改 `calculateOverduePenalty` 函数中的惩罚计算逻辑：

```typescript
// 增加惩罚倍率
const urgencyMultiplier = {
  '低': 1,    // 从0.5改为1
  '中': 1.5,  // 从1改为1.5
  '高': 2,    // 从1.5改为2
  '极高': 3,  // 从2改为3
}[affair.紧急度] || 1;
```

### Q4: 政务处理会自动保存游戏吗？

A: 不会。`handleAffair` 只更新 Pinia Store，不会自动保存。你需要手动调用：

```typescript
const result = await handleAffair('disaster_drought', 0);

// 保存游戏
await gameStateStore.saveGame();
```

或者配置自动保存：

```typescript
// 在 gameStateStore 中启用对话后自动保存
gameStateStore.setConversationAutoSaveEnabled(true);
```

### Q5: 如何查看可用的政务ID？

A: 查看 `src/data/governmentAffairs.ts` 文件中的 `GOVERNMENT_AFFAIRS` 数组：

```typescript
import { GOVERNMENT_AFFAIRS } from '@/data/governmentAffairs';

// 打印所有政务ID
GOVERNMENT_AFFAIRS.forEach(affair => {
  console.log(`${affair.id}: ${affair.name}`);
});
```

---

## 技术细节

### 资源检查逻辑

在 `handleAffair` 中，会检查以下资源：

1. **库银**：从 `inventory.货币.库银.数量` 读取
2. **粮食**：从 `inventory.货币.粮食.数量` 读取
3. **政绩**：从 `attributes.政绩.当前` 读取

如果资源不足，会抛出异常，不会扣减资源。

### 成功率计算

成功率受以下因素影响：

1. **基础成功率**：选项的 `successRate` 字段
2. **难度修正**：`DIFFICULTY_MULTIPLIERS` 配置
3. **属性加成**：县令的智力、魅力、政务属性

```typescript
实际成功率 = 基础成功率 × 难度修正 + 属性加成
```

### 数值变化逻辑

1. **应用倍率**：政务类型倍率（如救灾类民心×1.2）
2. **难度修正**：困难类效果×1.3
3. **属性加成**：每1点属性增加0.5%-1.5%效果
4. **范围限制**：最终数值限制在 `[最小值, 最大值]` 范围内

---

## 扩展阅读

- [政务数据配置](../src/data/governmentAffairs.ts)
- [辖区数值配置](../src/data/jurisdictionConfig.ts)
- [政务台Store](../src/stores/gameStateStore.ts#governmentDesk)
- [命令验证器](../src/utils/commandValidator.ts)

---

## 更新日志

- **2025-02-07**: 初始版本，包含核心政务处理逻辑
