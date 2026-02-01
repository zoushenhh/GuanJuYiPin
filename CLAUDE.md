# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**县令 (Xian Ling)** is an AI-driven ancient Chinese magistrate simulator (evolved from the original "仙途" cultivation game). The game uses AI (Gemini/Claude/OpenAI/DeepSeek) to generate personalized narratives, featuring a complete official rank system, governance mechanics, equipment crafting, NPC interactions, and world exploration.

- **Frontend**: Vue 3 + TypeScript + Pinia + Vue Router (memory history for SillyTavern)
- **Build**: Webpack 5 (single-file bundle, no code splitting for SillyTavern compatibility)
- **Storage**: IndexedDB for save data (large SaveData objects stored separately from metadata)
- **AI Integration**: Dual-mode - supports SillyTavern embedded mode and standalone web mode with custom APIs
- **Multi-API System**: Different game features can use different AI APIs (main/cot/embedding/etc)

## Common Development Commands

```bash
# Development
npm install              # Install dependencies
npm run serve           # Start dev server (port 8080)
npm run watch           # Watch mode with inlined JS
npm run build           # Production build
npm run build:single    # Single-file build (for SillyTavern)

# Code Quality
npm run lint            # Lint and auto-fix
npm run lint:check      # Lint check only
npm run type-check      # TypeScript type checking
```

## Build Architecture

**Critical**: This project uses a specialized Webpack configuration for SillyTavern compatibility:

- **No code splitting**: All code must be in a single bundle (`inline.js` or `XianLing.js`)
- **No runtime chunks**: `splitChunks` and `runtimeChunk` are disabled
- **Memory router**: Uses `createMemoryHistory()` instead of browser history
- **External dependencies**: jQuery, Lodash, YAML, etc. are loaded from SillyTavern environment

See `webpack.config.js` for the full configuration.

## Core Architecture

### Data Flow

```
User Action -> Pinia Store -> IndexedDB -> AI Response -> Pinia Store -> UI
```

### Store Architecture (`src/stores/`)

1. **`gameStateStore`** - Main game state (reactive, in-memory):
   - Character data: `character`, `attributes`, `location`
   - Inventory: `inventory`, `equipment`, `governingStrategy`
   - World: `worldInfo`, `relationships`, `relationshipMatrix`
   - Systems: `sectSystem`, `eventSystem`, `memory`, `narrativeHistory`
   - Time: `gameTime` (年/月/日/时/分)
   - Provides `updateState(path, value)` for reactive updates

2. **`characterStore`** - Character profiles and save slot management:
   - Manages `角色列表` (character profiles) and存档槽位
   - Save slots: `存档1`, `上次对话`, `时间点存档`
   - Methods: `createCharacter()`, `saveCurrentGame()`, `loadGame()`, `rollbackToLastConversation()`
   - **Critical invariant**: `saveCurrentGame()` must call `gameStateStore.toSaveData()` to get complete state

3. **`uiStore`** - UI state (loading, modals, panels)
4. **`actionQueueStore`** - Action queuing system for sequential command execution
5. **`apiManagementStore`** - Multi-API configuration for different game features

### Storage Strategy (`src/utils/indexedDBManager.ts`)

**Dual-layer storage**:

1. **Metadata** (lightweight):
   - Character profiles, save slot metadata
   - Stored in Pinia + persisted to IndexedDB
   - Always kept in memory for fast access

2. **SaveData** (heavyweight):
   - Full game state (元数据/角色/社交/世界/系统)
   - Stored directly in IndexedDB with key: `savedata_{characterId}_{slotId}`
   - **Lazy loading**: Only loaded into `gameStateStore` when slot is activated
   - **Memory cleanup**: After saving, SaveData is removed from slot memory to avoid bloat

**Key pattern**:
```typescript
// Save: gather state -> save to IndexedDB
const saveData = gameStateStore.toSaveData();
await storage.saveSaveData(characterId, slotId, saveData);

// Load: fetch from IndexedDB -> load into gameStateStore
const saveData = await storage.loadSaveData(characterId, slotId);
gameStateStore.loadFromSaveData(saveData);
```

### Save Data Structure (V3)

See `docs/save-schema-v3.md` for complete specification.

```
SaveData:
  元数据: { 版本号, 存档ID, 时间, ... }
  角色: { 身份, 属性, 背包, 装备, 方略, 政务, 大道, 技能, 效果, 身体 }
  社交: { 关系, 关系矩阵, 衙门, 事件, 记忆 }
  世界: { 信息, 状态 }
  系统: { 配置, 设置, 缓存, 历史, 扩展 }
```

**Critical V3 invariants**:
- **Equipment references only**: `角色.装备` contains only item IDs, actual items in `角色.背包.物品`
- **Attribute/Effect/Cultivation separation**:
  - `角色.属性`: Numerical attributes (血/气/神识/寿命/声望/境界)
  - `角色.效果`: buff/debuff list
  - `角色.修炼`: Cultivation process state
  - `角色.功法`: Skill mastery and progress
- **Multi-currency support**: `角色.背包.货币` uses `CurrencyAsset` system (see `src/utils/currencySystem.ts`)

### AI Service Architecture (`src/services/aiService.ts`)

**Dual-mode operation**:

1. **Tavern mode** (`isTavernEnv()` from `src/utils/tavern.ts`):
   - Main API (`main`): Always uses `window.TavernHelper`
   - Auxiliary features (cot/embedding/etc): Use custom APIs if configured
   - Helper methods: `generate()`, `generateRaw()`, `abortGeneration()`

2. **Custom mode** (standalone web):
   - All features use configured custom APIs
   - Direct OpenAI-compatible API calls

**Multi-API system** (`apiManagementStore`):
Different game features can use different APIs:
- `main`: Primary gameplay narrative
- `cot`: Chain of thought reasoning
- `text_optimization`: Text processing
- `embedding`: Vector memory for semantic search
- `world_generation`: World/sector/event generation
- `instruction_generation`: Command parsing

**Force JSON mode**:
- OpenAI/DeepSeek APIs support `response_format: { type: 'json_object' }`
- See `docs/json-output-guide.md` for integration details
- Use `parseJsonSmart()` from `src/utils/jsonExtract.ts` for parsing

**Stream handling**:
- Configurable per API with `streaming` option
- Chunk callback via `onStreamChunk` in `GenerateOptions`

## Game Systems

### Core Systems

- **Official Ranks** (`src/data/legal-ranks.ts`): 9-rank government system with progression
- **Governance Strategies** (`src/utils/governanceEfficiencyCalculator.ts`): Policy management system
- **Administration** (`src/utils/administrationEfficiencyCalculator.ts`): Government affairs handling
- **Inventory** (`src/utils/currencySystem.ts`): Multi-currency support (银两/铜币/etc)
- **Equipment**: Crafting and stat bonuses (refers to items in inventory)
- **NPCs**: Relationship network with NPC-NPC relationship matrix (`社交.关系矩阵`)
- **Time System** (`src/utils/time.ts`): Game time advances with actions (年/月/日/时/分)
- **Memory** (`src/services/vectorMemoryService.ts`): Short/mid/long-term memory with vector indexing
- **Skills** (`src/utils/masteredSkillsCalculator.ts`): Mastery-based skill unlocking
- **Sect System** (`src/utils/sectMigration.ts`): Government/sect management with members/contributions/war
- **Status Effects** (`src/utils/statusEffectManager.ts`): buff/debuff management
- **Attributes** (`src/utils/attributeCalculation.ts`): Final attribute calculation with equipment/skills
- **Government Leadership** (`src/utils/governmentLeadershipUtils.ts`): Official position and tenure tracking

### Prompt System (`src/utils/prompts/`)

**Modular prompt architecture**:
- `promptAssembler.ts`: Main prompt construction
- `definitions/`: Core rules, data definitions, business rules
- `tasks/`: Feature-specific prompts (character init, game elements, data repair)
- `cot/`: Chain of thought prompts

**Key modules**:
- `coreRules.ts`: Fundamental game rules and constraints
- `dataDefinitions.ts`: Data structure definitions for AI
- `worldStandards.ts`: World generation and lore standards
- `actionOptions.ts`: Action option generation rules

### Important Utilities

- `src/utils/saveMigration.ts`: Handles save data format migrations (V1 → V3)
- `src/utils/saveValidationV3.ts`: Validates V3 save structure
- `src/utils/tavern.ts`: SillyTavern environment detection and helpers
- `src/utils/indexedDBManager.ts`: IndexedDB operations for save data
- `src/utils/commandValidator.ts`: AI command validation and execution
- `src/utils/stateChangeFormatter.ts`: Format state changes for UI display

## Development Guidelines

### Component Structure

- **Views** (`src/views/`): Top-level pages
  - `ModeSelection.vue`: SillyTavern vs Standalone mode selection
  - `CharacterCreation.vue`: Character creation flow
  - `GameView.vue`: Main game interface
- **Dashboard Components** (`src/components/dashboard/`):
  - `MainGamePanel.vue`: Primary gameplay area
  - `CharacterDetailsPanel.vue`: Character stats and info
  - `InventoryPanel.vue`: Items and equipment management
  - `RelationshipNetworkPanel.vue`: NPC relationship visualization
  - `SectPanel.vue` / `SectSystemPanel.vue`: Government management
  - `EventPanel.vue`: World event system
  - `APIManagementPanel.vue`: Multi-API configuration UI
  - `PromptManagementPanel.vue`: Prompt editing interface
  - `SavePanel.vue`: Save/load/rollback interface

### State Management Patterns

1. **Reading game state**:
   ```typescript
   const gameStateStore = useGameStateStore();
   const character = gameStateStore.character;
   const attributes = gameStateStore.attributes;
   ```

2. **Updating game state**:
   ```typescript
   // Single field update (reactive)
   gameStateStore.updateState('character.attributes.气血.当前', newValue);

   // Complex update (load full SaveData)
   const saveData = gameStateStore.toSaveData();
   // Modify saveData...
   gameStateStore.loadFromSaveData(saveData);
   await characterStore.saveCurrentGame();
   ```

3. **For metadata**: Use `characterStore` methods (creates/deletes/updates)
4. **For persistence**: Always call `saveCurrentGame()` after modifying game state

### Critical Invariants

1. **SaveData completeness**: Before saving, ensure all required V3 fields exist
2. **Lazy loading**: SaveData is only loaded when slot is activated (reduces memory footprint)
3. **Memory cleanup**: After saving, remove SaveData from slot memory
4. **Equipment references**: `角色.装备` contains only IDs, actual items in `角色.背包.物品`
5. **Tavern compatibility**:
   - Never use `window.history` or browser URL routing
   - Use `createMemoryHistory()` for Vue Router
   - No code splitting (disabled in webpack config)
   - All external dependencies (jQuery, Lodash, etc.) from Tavern environment

### TypeScript Configuration

- Path alias: `@/*` maps to `src/*`
- Strict mode enabled
- Vue 3 strict templates enabled
- Build: `webpack --mode production` for single bundle

## SillyTavern Integration

### Environment Detection (`src/utils/tavern.ts`)

```typescript
import { isTavernEnv, getTavernHelper } from '@/utils/tavern';

if (isTavernEnv()) {
  const helper = getTavernHelper();
  // Use TavernHelper for AI calls
}
```

### Tavern Helper API

Available methods (check actual availability at runtime):
- `generate({ user_input, ... })`: Generate with character card
- `generateRaw({ ordered_prompts, ... })`: Generate without character card
- `abortGeneration()`: Cancel ongoing generation
- `stopGeneration()`: Alternative cancel method
- `cancelGeneration()`: Alternative cancel method

**Note**: Helper API varies by SillyTavern version. Always check method existence before calling.

### Dual-Mode Constraints

1. **External dependencies**: jQuery, Lodash, YAML loaded from Tavern environment
2. **No browser history**: Never use `window.history` or browser URL routing
3. **Single bundle**: All code must be in `XianLing.js` or `inline.js` (no code splitting)
4. **Memory router**: Uses `createMemoryHistory()` instead of browser history
5. **Test both modes**: Always test in standalone and embedded modes

### Webpack Build Configuration (`webpack.config.js`)

Key settings for SillyTavern compatibility:
```javascript
optimization: {
  splitChunks: false,        // Disable code splitting
  runtimeChunk: false,       // Disable runtime chunk
}
externals: [
  // jQuery, Lodash, etc. from Tavern environment
]
output: {
  filename: 'inline.js'      // Watch mode
  filename: 'XianLing.js'    // Production
}
```

## Common Patterns

### Save/Load Pattern

```typescript
// Save current game state
await characterStore.saveCurrentGame();

// Load a specific save slot
await characterStore.loadGame(characterId, saveSlot);

// Rollback to last conversation (用于AI回复不满意时回退)
await characterStore.rollbackToLastConversation();

// Create a new character
await characterStore.createCharacter(baseInfo, world, mode, age);
```

### AI Command Execution

```typescript
// AI returns commands in JSON format
const commands = [
  { action: 'update', key: '角色.属性.气血.当前', value: 50 },
  { action: 'add_item', key: '物品ID', value: {...} }
];

// Use commandValidator to execute
import { validateAndExecuteCommands } from '@/utils/commandValidator';
const result = await validateAndExecuteCommands(commands, gameStateStore);
```

### Time Management

```typescript
// Game time is stored as: { 年, 月, 日, 小时, 分钟 }
// Advance time (自动推进时间)
import { advanceTime } from '@/utils/time';
const newTime = advanceTime(currentTime, minutesToAdd);

// Update term calculations for government positions
import { updateTermFromGameTime } from '@/utils/termCalculator';
const termInfo = updateTermFromGameTime(gameTime, appointmentDate);
```

### State Change Formatting

```typescript
// Format state changes for UI display
import { formatStateChanges } from '@/utils/stateChangeFormatter';
const formatted = formatStateChanges(stateChanges);
// Returns: "气血: 100 → 90, 银两: +50"
```

## Testing

The project uses GitHub Actions for CI:

```bash
# CI workflow runs on push/PR:
npm run type-check    # TypeScript checking
npm run lint:check   # ESLint checking
npm run build        # Production build
```

See `.github/workflows/ci.yml` for details.

## Important Documentation Files

- `docs/save-schema-v3.md`: Complete V3 save data structure specification
- `docs/json-output-guide.md`: Force JSON mode integration guide
- `docs/force-json-quickstart.md`: Quick reference for JSON output
- `src/utils/prompts/definitions/coreRules.ts`: Core game rules for AI
- `src/types/game.ts`: TypeScript type definitions

## Key Concepts

1. **V3 Modular Architecture**: 5 domains (元数据/角色/社交/世界/系统)
2. **Dual Storage**: Metadata in Pinia, SaveData in IndexedDB
3. **Lazy Loading**: SaveData loaded only when needed
4. **Multi-API**: Different features use different AI APIs
5. **Force JSON**: OpenAI/DeepSeek can use native JSON mode
6. **Memory Router**: Required for SillyTavern compatibility
7. **Single Bundle**: No code splitting allowed
