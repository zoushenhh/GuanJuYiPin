# 县令模拟器架构改造指南

本文档为所有子代理提供统一的改造规范，确保术语一致性。

## 核心术语对照表（必须严格遵守）

| 修仙术语 | 县令术语 | 英文变量命名 |
|---------|---------|------------|
| 功法/修炼功法 | 治国方略 | governingStrategy / administrationStrategy |
| 功法效果 | 方略效果 | strategyEffect |
| 功法熟练度 | 方略进度 | strategyProgress / administrationProgress |
| 修炼速度 | 施政效率 | administrationEfficiency |
| 突破 | 晋升/升迁 | promotion / rankUp |
| 境界/修为境界 | 官品/职级 | officialRank / rank |
| 灵根/天资 | 才干/天赋 | talent / aptitude |
| 灵气/灵气浓度 | 民心/民心支持度 | publicTrust / peopleSupport |
| 气血 | 健康 | health / vitality |
| 神识 | 智慧 | wisdom |
| 寿元/寿命 | 任期 | termOfOffice / term |
| 功德 | 政绩/功绩 | achievement / merit |
| 装备/法宝 | 建筑/设施 | building / facility |
| 炼丹 | 制造/生产 | craft / manufacture |
| 炼器 | 建造 | construct / build |
| 宗门/宗门 | 衙门/官府 | government / office |
| 掌门 | 县令/长官 | magistrate / leader |
| 弟子/弟子 | 下属/官员 | subordinate / official |
| 灵石 | 库银/银两 | treasury / silver |
| 灵宠 | 门客 | retainer / advisor |
| 道侣 | 配偶 | spouse |
| 渡劫/天劫 | 考核/危机 | assessment / crisis |
| 秘境 | 机遇 | opportunity |
| 散修 | 布衣 | commoner |
| 洞府 | 县衙 | countyOffice |

## 特殊术语处理

### 保留但含义变化
- **六司**：从修仙属性改为官场六部（吏户礼兵刑工）
- **大道**：从修仙大道改为治国理念/哲学思想
- **NPC**：保持不变，但属性中的境界改为官品

### 完全移除
- **灵根品质**：改为天赋等级
- **修炼丹药**：改为政策道具
- **法宝装备**：改为建筑器械

## 文件改造原则

1. **类型定义**：完全移除 @deprecated 别名，统一使用新类型名
2. **数据文件**：替换数据内容，更新字段名
3. **Store**：统一变量命名，移除混用字段
4. **工具类**：重命名文件和类，更新内部逻辑
5. **AI提示词**：彻底清除修仙相关模板
6. **UI组件**：替换所有可见文本

## 变量命名规范

### 保持驼峰命名
```typescript
// 好的
governingStrategy
administrationProgress
officialRank

// 避免
cultivation_technique
CultivationProgress
OFFICIAL_RANK
```

### 中英文对照
```typescript
// 类型命名
interface GoverningStrategy { }
interface OfficialRank { }

// 变量命名
const strategyProgress = 0;
const currentRank = '九品';

// 函数命名
function calculateAdministrationEfficiency() { }
function promoteToNextRank() { }
```

## 注释规范

所有注释必须使用新术语：

```typescript
// ❌ 错误
// 计算修炼速度
function calculateSpeed() { }

// ✅ 正确
// 计算施政效率
function calculateAdministrationEfficiency() { }
```

## AI提示词改造要点

1. **世界观设定**：从修仙世界观改为古代官场世界观
2. **角色设定**：从修仙者改为县令/官员
3. **事件生成**：从修仙事件改为政务/民生事件
4. **奖励机制**：从修炼资源改为政绩/民心提升

## 测试验证清单

完成改造后，需要验证：
1. TypeScript 编译无错误
2. ESLint 检查通过
3. npm run build 成功
4. 无硬编码的修仙术语残留
