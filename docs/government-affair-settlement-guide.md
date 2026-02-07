# 时间推进与政务结算系统使用指南

## 概述

时间推进与政务结算系统是县令游戏的核心机制，负责在时间推进后自动处理政务相关逻辑。

### 核心功能

1. **逾期惩罚**：检查逾期未处理的政务，应用民心、治安惩罚
2. **自然趋势**：应用民心、治安、繁荣度、教化的自然增长率
3. **项目进度**：更新建设项目的进度（按小时推进）
4. **阈值效果**：检查警戒值惩罚和优秀值奖励
5. **随机事件**：（可选）低概率触发新政务

## 快速开始

### 1. 基本用法：推进时间并触发结算

```typescript
import { useGameStateStore } from '@/stores/gameStateStore';

const gameStateStore = useGameStateStore();

// 推进60分钟（1小时），并触发政务结算
const settlementReport = await gameStateStore.advanceGameTime(60, {
  settleAffairs: true,  // 触发政务结算
  triggerEvents: false, // 是否触发随机事件
  eventProbability: 0.1, // 随机事件概率
  onTimeAdvance: (oldTime, newTime, minutesAdvanced) => {
    console.log(`时间从 ${formatTime(oldTime)} 推进到 ${formatTime(newTime)}`);
  }
});

// 查看结算报告
if (settlementReport) {
  console.log('逾期惩罚:', settlementReport.逾期惩罚);
  console.log('自然趋势:', settlementReport.自然趋势);
  console.log('项目更新:', settlementReport.项目更新);
}
```

### 2. 在 MainGamePanel 中集成

在 AI 回复后自动推进时间：

```typescript
// src/components/dashboard/MainGamePanel.vue

const handleTimeAdvanceAndSettlement = async () => {
  try {
    const defaultMinutes = 60; // 每次对话推进1小时

    const settlementReport = await gameStateStore.advanceGameTime(defaultMinutes, {
      settleAffairs: true,
      triggerEvents: false,
      onTimeAdvance: (oldTime, newTime, minutesAdvanced) => {
        console.log('[时间推进] 时间已推进:', {
          从: formatTimeForDisplay(oldTime),
          到: formatTimeForDisplay(newTime),
        });
      },
    });

    if (settlementReport) {
      displaySettlementReport(settlementReport);
    }
  } catch (error) {
    console.error('[时间推进] 处理失败:', error);
  }
};

// 在 AI 回复成功后调用
if (!hasError && aiResponse) {
  await handleTimeAdvanceAndSettlement();
  toast.success('推演完成');
}
```

### 3. 显示结算报告

```typescript
const displaySettlementReport = (report: SettlementReport) => {
  const messages: string[] = [];

  // 时间推进提示
  messages.push(`⏰ 时间已推进 ${report.推进时长.toFixed(1)} 小时`);

  // 逾期惩罚
  if (report.逾期惩罚.length > 0) {
    messages.push('\n【逾期政务】');
    report.逾期惩罚.forEach(p => {
      messages.push(`⚠️ ${p.政务名称}: 逾期${p.逾期天数}天`);
      messages.push(`   ${p.惩罚描述}`);
    });
  }

  // 自然趋势
  const trends = report.自然趋势;
  const significantChanges = [];
  if (Math.abs(trends.民心变化) >= 0.1) {
    significantChanges.push(`民心${trends.民心变化 > 0 ? '+' : ''}${trends.民心变化.toFixed(2)}`);
  }
  if (significantChanges.length > 0) {
    messages.push('\n【自然趋势】');
    messages.push(significantChanges.join('，'));
  }

  // 显示提示
  toast.info(messages.join('\n'), {
    timeout: 5000,
    multiline: true,
  });
};
```

## 高级用法

### 1. 使用时间工具函数

```typescript
import {
  advanceTime,
  advanceTimeByHours,
  advanceTimeByDays,
  calculateHoursBetween,
  formatTimeDifference,
} from '@/utils/time';

// 按分钟推进
const newTime1 = advanceTime(currentTime, 120); // 推进2小时

// 按小时推进
const newTime2 = advanceTimeByHours(currentTime, 5); // 推进5小时

// 按天推进
const newTime3 = advanceTimeByDays(currentTime, 3); // 推进3天

// 计算时间差
const hoursBetween = calculateHoursBetween(startTime, endTime);

// 格式化时间差
const diffText = formatTimeDifference(27.5); // "1天3小时30分钟"
```

### 2. 自定义政务结算逻辑

```typescript
import {
  settleGovernmentAffairs,
  formatSettlementReport,
} from '@/utils/governmentAffairSettlement';

const report = settleGovernmentAffairs(
  {
    governmentDesk: gameStateStore.governmentDesk,
    location: gameStateStore.location,
    gameTime: gameStateStore.gameTime,
  },
  hoursPassed, // 经过的时长（小时）
  {
    triggerEvents: true,
    eventProbability: 0.2, // 20%概率触发新事件
  }
);

// 格式化报告为可读文本
const reportText = formatSettlementReport(report);
console.log(reportText);
```

### 3. 监听时间推进回调

```typescript
const gameStateStore = useGameStateStore();

await gameStateStore.advanceGameTime(120, {
  settleAffairs: true,
  onTimeAdvance: (oldTime, newTime, minutesAdvanced) => {
    // 自定义时间推进后的处理
    console.log(`时间推进了 ${minutesAdvanced} 分钟`);
    console.log(`从 ${oldTime.年}年${oldTime.月}月${oldTime.日}日`);
    console.log(`到 ${newTime.年}年${newTime.月}月${newTime.日}日`);

    // 触发自定义逻辑（如通知、UI更新等）
    showTimeAdvanceNotification(oldTime, newTime);
  },
});
```

## 数值配置

### 自然增长率

定义在 `src/data/jurisdictionConfig.ts`：

```typescript
export const NATURAL_GROWTH_RATES = {
  民心: {
    每日变化: 0.05,   // 每天自然增长0.05
    每周变化: 0.3,
    每月变化: 1.0,
    约束: {
      最小值: 20, // 民心最低降到20
      最大值: 90, // 民心最高升到90
    },
  },
  治安: {
    每日变化: 0.03,
    约束: {
      最小值: 30,
      最大值: 95,
    },
  },
  // ...
};
```

### 逾期惩罚规则

```typescript
// 每逾期1天：
// - 民心 -2 × 紧急度倍率
// - 治安 -3 × 紧急度倍率
//
// 紧急度倍率：
// - 低、中：1.0
// - 高：1.5
// - 极高：2.0
```

### 建设项目进度

```typescript
// 每小时进度 = 100 / 预计工时
// 例如：预计工时100小时的项目，每推进1小时，进度+1%
```

### 财政自然消耗

```typescript
export const TREASURY_GROWTH_RATES = {
  库银每日消耗: 5,  // 每天消耗5银两
  粮食每日消耗: 2,  // 每天消耗2粮食
};
```

## 阈值效果

### 警戒值惩罚

当指标低于警戒值时触发惩罚：

```typescript
export const THRESHOLD_PENALTIES = {
  民心: [
    {
      触发阈值: 30,
      惩罚效果: {
        治安变化: -0.5,
        繁荣度变化: -0.3,
      },
      描述: '民心低落，治安恶化，商贸萧条。',
    },
    {
      触发阈值: 20,
      惩罚效果: {
        治安变化: -1.0,
        繁荣度变化: -0.5,
        库银变化: -5,
      },
      描述: '民怨沸腾，可能爆发民变。',
    },
    // ...
  ],
};
```

### 优秀值奖励

当指标高于优秀值时触发奖励：

```typescript
export const EXCELLENCE_BONUSES = {
  民心: [
    {
      触发阈值: 80,
      奖励效果: {
        治安变化: 0.3,
        繁荣度变化: 0.2,
      },
      描述: '民心拥戴，治安良好，商贸兴旺。',
    },
    // ...
  ],
};
```

## 测试

运行测试用例：

```bash
# 运行所有测试
npm test

# 运行政务结算测试
npm test governmentAffairSettlement

# 查看覆盖率
npm run test:coverage
```

测试文件：`tests/utils/governmentAffairSettlement.test.ts`

### 测试用例覆盖

- ✅ 逾期政务检查
- ✅ 自然趋势应用
- ✅ 建设项目进度更新
- ✅ 结算报告格式化
- ✅ 边界情况处理（空政务台、已完成政务、无期限政务）

## API 参考

### gameStateStore.advanceGameTime()

推进游戏时间并可选触发政务结算。

**签名：**

```typescript
async advanceGameTime(
  minutes: number,
  options?: {
    settleAffairs?: boolean;
    triggerEvents?: boolean;
    eventProbability?: number;
    onTimeAdvance?: (oldTime: GameTime, newTime: GameTime, minutesAdvanced: number) => void;
  }
): Promise<SettlementReport | null>
```

**参数：**

- `minutes`: 要推进的分钟数
- `options.settleAffairs`: 是否触发政务结算（默认：false）
- `options.triggerEvents`: 是否触发随机事件（默认：false）
- `options.eventProbability`: 随机事件概率（0-1，默认：0.1）
- `options.onTimeAdvance`: 时间推进回调函数

**返回值：**

`SettlementReport | null` - 结算报告对象（如果触发了政务结算）

### SettlementReport 接口

```typescript
interface SettlementReport {
  结算时间: string;           // 结算时间（游戏时间）
  推进时长: number;           // 推进时长（小时）
  逾期惩罚: Array<{
    政务ID: string;
    政务名称: string;
    逾期天数: number;
    惩罚描述: string;
  }>;
  自然趋势: {
    民心变化: number;
    治安变化: number;
    繁荣度变化: number;
    教化变化: number;
    库银变化: number;
    粮食变化: number;
  };
  阈值效果: {
    惩罚: Array<{ 类型: string; 描述: string }>;
    奖励: Array<{ 类型: string; 描述: string }>;
  };
  项目更新: Array<{
    项目ID: string;
    项目名称: string;
    进度变化: number;
    是否完成: boolean;
  }>;
  新增事件?: string[];
}
```

## 最佳实践

### 1. 合理设置推进时长

```typescript
// ✅ 推荐：每次对话推进1-2小时
await gameStateStore.advanceGameTime(60, { settleAffairs: true });

// ❌ 不推荐：一次推进太多时间（会错过逾期政务）
await gameStateStore.advanceGameTime(7 * 24 * 60, { settleAffairs: true });
```

### 2. 错误处理

```typescript
try {
  const report = await gameStateStore.advanceGameTime(60, {
    settleAffairs: true,
  });

  if (report) {
    displaySettlementReport(report);
  }
} catch (error) {
  console.error('[时间推进] 处理失败:', error);
  // 不影响主流程，仅记录错误
}
```

### 3. UI 提示优化

```typescript
// 仅显示显著变化（避免刷屏）
const significantChanges = [];
if (Math.abs(trends.民心变化) >= 0.1) {
  significantChanges.push(`民心${trends.民心变化 > 0 ? '+' : ''}${trends.民心变化.toFixed(2)}`);
}
if (Math.abs(trends.治安变化) >= 0.1) {
  significantChanges.push(`治安${trends.治安变化 > 0 ? '+' : ''}${trends.治安变化.toFixed(2)}`);
}

if (significantChanges.length > 0) {
  toast.info(significantChanges.join('，'));
}
```

### 4. 保存前结算

```typescript
// 在 AI 回复后、保存前进行时间推进
if (!hasError && aiResponse) {
  await handleTimeAdvanceAndSettlement(); // 推进时间
  toast.success('推演完成');
  clearImages();
}

// 保存存档
await characterStore.saveCurrentGame();
```

## 故障排查

### 问题：政务没有触发结算

**检查：**

```typescript
// 1. 确认启用了 settleAffairs 选项
await gameStateStore.advanceGameTime(60, {
  settleAffairs: true, // ✅ 必须为 true
});

// 2. 确认政务台已初始化
console.log('政务台:', gameStateStore.governmentDesk);
console.log('待办事项:', gameStateStore.governmentDesk?.待办事项);

// 3. 检查政务期限格式
affair.期限 = '0001-01-05T08:00'; // ✅ 正确格式
affair.期限 = '第3天'; // ❌ 错误格式
```

### 问题：自然增长不符合预期

**检查：**

```typescript
// 1. 检查数值是否被约束
const newValue = applyNaturalGrowth(50, '民心', 24);
console.log('新值:', newValue); // 应该在 [20, 90] 范围内

// 2. 检查配置
import { NATURAL_GROWTH_RATES } from '@/data/jurisdictionConfig';
console.log('民心每日变化:', NATURAL_GROWTH_RATES.民心.每日变化); // 0.05
```

### 问题：项目进度没有更新

**检查：**

```typescript
// 1. 检查项目状态
project.状态 === '进行中'; // ✅ 必须是'进行中'

// 2. 检查预计工时
project.预计工时 = 100; // 100小时完成，每小时进度+1%

// 3. 检查推进时长
const hoursPassed = 5; // 推进5小时
const expectedProgress = 5 / 100 * 100; // 应该增加5%
```

## 相关文件

- `src/utils/time.ts` - 时间工具函数
- `src/utils/governmentAffairSettlement.ts` - 政务结算逻辑
- `src/stores/gameStateStore.ts` - 游戏状态管理
- `src/data/jurisdictionConfig.ts` - 数值配置
- `src/components/dashboard/MainGamePanel.vue` - 主面板集成
- `tests/utils/governmentAffairSettlement.test.ts` - 测试用例

## 更新日志

### v1.0.0 (2026-02-07)

- ✨ 初始版本
- ✅ 实现逾期惩罚
- ✅ 实现自然趋势
- ✅ 实现项目进度更新
- ✅ 实现阈值效果检查
- ✅ 集成到 gameStateStore
- ✅ 集成到 MainGamePanel
- ✅ 添加完整测试用例
