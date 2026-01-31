# Phase 2 数据层替换完成报告

## 任务概述

将"修仙数据"替换为"宋代官制数据"，完成县令模拟器的核心数据层重构。

## 完成的新建文件

### 1. 政府建筑系统 (`src/data/gov-building.ts`)

**功能**：定义县令模拟器中可建造的各类政府建筑

**核心数据**：
- `BASIC_BUILDINGS` - 基础建筑（县衙、学堂、医馆、集市、粮仓、牢狱、驿站、城隍庙）
- `ADVANCED_BUILDINGS` - 进阶建筑（孔庙、兵营、工坊、水利、档案库）
- `ELITE_BUILDINGS` - 高级建筑（书院、武库、铸币局、观象台、藏书阁）

**主要接口**：
```typescript
interface GovBuilding {
  id: string;
  name: string;
  description: string;
  cost: number;
  buildTime: number;
  level: 1 | 2 | 3;
  effect: BuildingEffect;
  unlockRank?: number;
  maintenanceCost?: number;
}
```

### 2. 官阶品级系统 (`src/data/official-ranks.ts`)

**功能**：定义宋代官制中的品级、职位、俸禄等信息

**核心数据**：
- 一品至九品文官（正从品）
- 一品至九品武官
- 每个品级包含职位、月俸、晋升政绩要求、特权等

**主要接口**：
```typescript
interface OfficialRank {
  level: number;           // 1-9
  rankName: string;        // 正一品、从七品等
  type: '正' | '从';
  category: '文官' | '武官';
  titles: string[];
  salary: number;
  meritRequired: number;
  description: string;
  privileges: string[];
  stages?: RankStageDefinition[];
}
```

### 3. 政令方略系统 (`src/data/policies.ts`)

**功能**：定义县令模拟器中可颁布的各类政令及其效果

**核心数据**：
- `TAX_POLICIES` - 赋税政令（减税、加税、灾年免税、税制改革等）
- `LIVELIHOOD_POLICIES` - 民生政令（开仓放粮、兴修水利等）
- `SECURITY_POLICIES` - 治安政令（加强巡逻、悬赏缉捕、组建民团等）
- `EDUCATION_POLICIES` - 教化政令（兴办学堂、延请名儒等）
- `COMMERCE_POLICIES` - 商业政令（开放集市、扶持商帮等）
- `AGRICULTURE_POLICIES` - 农业政令（推广良种、改进农具等）
- `MILITARY_POLICIES` - 军事政令（征召士兵、加固城防等）
- `SPECIAL_POLICIES` - 特殊政令（大赦天下、招贤纳士等）

**主要接口**：
```typescript
interface Policy {
  id: string;
  name: string;
  type: PolicyType;
  description: string;
  duration: PolicyDuration;
  meritCost: number;
  requiredRank?: number;
  effect: PolicyEffect;
}
```

### 4. 突发事件系统 (`src/data/incidents.ts`)

**功能**：定义县令模拟器中可能发生的各类突发事件

**核心数据**：
- `NATURAL_DISASTERS` - 天灾事件（旱灾、水灾、蝗灾、地震）
- `HUMAN_DISASTERS` - 人祸事件（盗匪来袭、民变、贪腐暴露）
- `LIVELIHOOD_INCIDENTS` - 民生事件（瘟疫、流民涌入）
- `COMMERCE_INCIDENTS` - 商业事件（商会崛起、商路开通）
- `SECURITY_INCIDENTS` - 治安事件（命案、盗窃团伙）
- `EDUCATION_INCIDENTS` - 教化事件（名儒来访、科举高中）
- `SPECIAL_INCIDENTS` - 特殊事件（圣旨到、微服私访）
- `OPPORTUNITY_INCIDENTS` - 机遇事件（富商投资、发现人才）

**主要接口**：
```typescript
interface Incident {
  id: string;
  name: string;
  type: IncidentType;
  description: string;
  difficulty: IncidentDifficulty;
  urgency: IncidentUrgency;
  choices: IncidentChoice[];
  oneTime?: boolean;
  triggerCondition?: {...};
  followUpEvents?: string[];
}
```

### 5. 官学体系系统 (`src/data/governance-schools.ts`)

**功能**：替代原"千道系统"，定义官学、书院、学派等教育体系

**核心数据**：
- `SCHOOLS_OF_THOUGHT` - 六大学派（儒家、法家、道家、墨家、兵家、纵横家）
- `COUNTY_SCHOOLS` - 县学（基础官学）
- `PREFECTURAL_SCHOOLS` - 州学（中级官学）
- `DEPARTMENT_SCHOOLS` - 府学（高级官学）
- `IMPERIAL_SCHOOL` - 太学（最高学府）

**主要接口**：
```typescript
interface GovernanceSchool {
  id: string;
  name: string;
  type: SchoolType;
  thoughtType: SchoolOfThought;
  level: SchoolLevel;
  description: string;
  buildCost: number;
  maintenanceCost: number;
  capacity: number;
  teachingEffect: TeachingEffect;
}
```

### 6. 官僚制度系统 (`src/data/bureaucracy.ts`)

**功能**：替代原"宗门系统"，定义官僚机构、官制体系、人事任免等

**核心数据**：
- `SIX_MINISTRIES` - 六部（吏部、户部、礼部、兵部、刑部、工部）
- `CENSORATE_BUREAUS` - 监察机构（御史台）
- `LOCAL_BUREAUS` - 地方机构（县衙、州衙）
- `SPECIAL_BUREAUS` - 特殊机构（翰林院、内阁）

**主要接口**：
```typescript
interface BureaucracyBureau {
  id: string;
  name: string;
  type: BureaucracyType;
  level: BureauLevel;
  description: string;
  functions: string[];
  positions: BureauPosition[];
  staffing: {...};
  privileges: string[];
}
```

## 已更新的文件

### 1. 城市等级系统 (`src/data/realms.ts`)

**更新内容**：
- 将"境界系统"重构为"城市等级系统"
- 保留城市等级（荒村、集镇、县城、府城、州城、都城、皇城、京畿、天下）
- 添加官品与城市等级对应关系
- 更新相关函数名称和描述

### 2. 治国方略系统 (`src/data/thousandDaoData.ts`)

**更新内容**：
- 将"大道系统"重构为"治国方略系统"
- 保留AI动态生成框架
- 添加8种预设治国方略模板（仁政、法治、无为、功利、教化、权谋、严刑、富国）
- 更新为县令主题的描述和效果

### 3. 数据模块索引 (`src/data/index.ts`)

**新建内容**：
- 统一导出所有新建和更新的数据模块
- 提供便捷的数据汇总类型
- 导出常用数据集合

## 保留的文件（已适配县令主题）

1. **`itemQuality.ts`** - 物品品质系统（皇、宫、府、州、县、乡、民）
2. **`creationData.ts`** - 角色创建数据（世界、天资、出身、才能、天赋）
3. **`specialNpcs.ts`** - 特殊NPC数据（如幕僚"彩莲"）

## 数据层替换对照表

| 原修仙概念 | 新县令概念 | 数据文件 |
|-----------|-----------|---------|
| 宗门系统 | 官僚制度 | bureaucracy.ts |
| 千道系统 | 官学体系 | governance-schools.ts |
| 境界系统 | 城市等级系统 | realms.ts (已更新) |
| 大道/方略 | 治国方略 | thousandDaoData.ts (已更新) |
| 宗门建筑 | 政府建筑 | gov-building.ts |
| 功法/技能 | 官品品级 | official-ranks.ts |
| 宗门任务 | 政令方略 | policies.ts |
| 突发事件 | 突发事件 | incidents.ts |

## 文件映射关系

| 原文件（修仙） | 新文件（县令） | 状态 |
|---------------|---------------|------|
| thousandDaoData.ts | governance-schools.ts | 新建 |
| realms.ts | realms.ts | 已更新 |
| sectSystemFactory.ts | bureaucracy.ts | 新建 |
| - | gov-building.ts | 新建 |
| - | official-ranks.ts | 新建 |
| - | policies.ts | 新建 |
| - | incidents.ts | 新建 |

## 数据结构一致性

所有新建数据文件遵循以下设计原则：

1. **接口命名**：使用英文接口名，中文描述
2. **类型定义**：完整的TypeScript类型支持
3. **导出函数**：提供便捷的查询和过滤函数
4. **分类导出**：数据按类别分组导出
5. **县令主题**：所有数据围绕县令模拟器主题设计

## 兼容性说明

- 新数据文件与现有类型定义（`src/types/game.d.ts`）兼容
- 保留了必要的向后兼容接口
- 更新的文件（realms.ts、thousandDaoData.ts）保持原有的导出结构
