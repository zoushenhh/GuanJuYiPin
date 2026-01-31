# 县令模拟器架构改造进度报告

## 改造概述
将原修仙主题游戏完全改造为宋代县令模拟器主题。

## 改造原则
1. **术语统一**：修仙术语 → 县令术语（详见术语对照表）
2. **数据兼容**：保留旧类型作为别名，确保旧存档可迁移
3. **双轨制**：核心函数同时支持两种主题的别名调用

## 核心术语对照表

| 概念类别 | 旧命名（修仙） | 新命名（县令） |
|---------|---------------|--------------|
| 玩家实体 | Cultivator/Player | Magistrate（县令） |
| 核心组织 | Sect（宗门） | Bureau（县衙/衙门） |
| 等级/阶段 | Realm/Stage（境界） | Rank（官品） |
| 下属单位 | Disciple（弟子） | Subordinate/Staff（下属/官员） |
| 核心资源 | SpiritStone（灵石） | Silver/Budget（库银） |
| 经验值 | Cultivation（修为） | Merit（政绩） |
| 技能/功法 | Technique/Method（功法） | Policy（政令/方略） |
| 行动 | Meditate（打坐） | HandleAffairs（处理政务） |

## 已完成的改造模块

### 1. 类型系统 (src/types/)
- [x] `game.d.ts` - 县令术语对照说明，双轨制类型定义
- [x] `magistrate.d.ts` - 新增县令专用类型
- [x] `county.d.ts` - 新增县治状态类型
- [x] `subordinate.d.ts` - 新增下属官员类型
- [x] `jurisdiction.d.ts` - 司法类型

### 2. 数据层 (src/data/)
- [x] `realms.ts` - 城市等级系统（荒村→天下）
- [x] `thousandDaoData.ts` - 治国方略系统
- [x] `itemQuality.ts` - 物品品质（县品/州品等）

### 3. 核心逻辑 (src/utils/)
- [x] `cultivationSpeedCalculator.ts` - 施政速度计算（双轨制）
- [x] `sectWarSimulation.ts` - 衙门竞争模拟
- [x] `sixSiManager.ts` - 六司系统（通用，无需修改）

### 4. AI Prompt (src/services/)
- [x] `defaultPrompts.ts` - 县令风格提示词

### 5. 国际化 (src/i18n/)
- [x] `index.ts` - 县令术语翻译

### 6. 存储系统 (src/stores/)
- [x] `characterStore.ts` - 已改造

### 7. UI组件 (src/components/)
- [x] `SectSystemPanel.vue` - 衙门系统面板
- [x] `OfficerProfile.vue` - 县令档案组件

## 待改造的文件清单

### 高优先级（用户可见界面）
1. `src/components/character-creation/Step4_TalentSelection.vue` - 灵根选择
2. `src/components/character-creation/Step6_AttributeAllocation.vue` - 属性分配
3. `src/components/character-creation/Step7_Preview.vue` - 预览确认
4. `src/components/dashboard/SkillsPanel.vue` - 技能面板
5. `src/components/dashboard/CharacterDetailsPanel.vue` - 角色详情
6. `src/components/dashboard/GovernanceStrategiesPanel.vue` - 治国方略面板

### 中优先级（工具函数）
1. `src/utils/realmUtils.ts` - 境界工具函数
2. `src/utils/equipmentBonusApplier.ts` - 装备增幅
3. `src/utils/masteredSkillsCalculator.ts` - 技能计算
4. `src/utils/sixSiManager.ts` - 六司管理（已检查，通用）

### 低优先级（后台服务）
1. `src/services/characterInitialization.ts` - 角色初始化
2. `src/services/offlineInitialization.ts` - 离线初始化

## 改造策略

### 阶段1：术语替换（文本层面）
- 使用 Grep 工具定位所有修仙术语
- 批量替换为县令对应术语
- 重点：UI组件、提示词、国际化文件

### 阶段2：逻辑适配（代码层面）
- 调整函数命名和变量命名
- 更新数据结构引用
- 确保类型安全

### 阶段3：测试验证
- 运行应用检查编译错误
- 测试核心功能是否正常
- 验证存档迁移功能

## 子代理任务分配

1. **探索代理**：已完成代码库深度探索，输出改造清单
2. **类型系统代理**：创建县令领域类型定义
3. **数据层代理**：修仙数据转为县治数据
4. **核心逻辑代理**：游戏主循环改造
5. **UI组件代理**：去修仙化界面改造
6. **AI Prompt代理**：县令向导配置

## 注意事项

1. **保持数据兼容性**：旧存档需要能正确迁移
2. **渐进式改造**：分阶段进行，避免一次性改动过大
3. **测试验证**：每个阶段完成后进行全面测试
4. **版本控制**：做好分支管理，便于回滚

## 下一步行动

1. 等待子代理完成各自任务
2. 汇总代理输出，整合改造结果
3. 进行全面测试验证
4. 提交改造后的代码
