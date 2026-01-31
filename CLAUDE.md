# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**县令 (Xian Ling)** is an AI-driven ancient Chinese magistrate simulator. The game uses AI (Gemini/Claude/OpenAI/DeepSeek) to generate personalized narratives, featuring a complete official rank system, cultivation mechanics, equipment crafting, NPC interactions, and world exploration.

- **Frontend**: Vue 3 + TypeScript + Pinia + Vue Router (memory history)
- **Build**: Webpack 5 (single-file bundle, no code splitting for SillyTavern compatibility)
- **Storage**: IndexedDB for save data (large SaveData objects stored separately from metadata)
- **AI Integration**: Supports SillyTavern embedded mode and standalone web mode with custom APIs

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

1. **Stores** (`src/stores/`):
   - `gameStateStore`: Main game state (character, inventory, relationships, world)
   - `characterStore`: Character profiles and save slot management
   - `uiStore`: UI state (loading, modals, panels)
   - `actionQueueStore`: Action queuing system
   - `apiManagementStore`: Multi-API configuration for different game features

2. **Storage Strategy**:
   - **Metadata** (character profiles, save slots) stored in Pinia + persisted to IndexedDB
   - **SaveData** (large game state) stored directly in IndexedDB, NOT in memory
   - Save slots are lazy-loaded from IndexedDB when needed

### Save Data Structure (V3)

```
SaveData:
  元数据: { 版本号, 存档ID, 时间, ... }
  角色: { 身份, 属性, 背包, 装备, 方略, 政务, 大道, 技能, 效果, 身体 }
  社交: { 关系, 关系矩阵, 衙门, 事件, 记忆 }
  世界: { 信息, 状态 }
  系统: { 配置, 设置, 缓存, 历史, 扩展 }
```

**Key invariant**: `characterStore.saveCurrentGame()` must call `gameStateStore.toSaveData()` to get the complete state, then save it to IndexedDB via `storage.saveSaveData()`.

### AI Service Architecture

**Dual mode operation**:
- **Tavern mode**: Uses `window.TavernHelper` from SillyTavern environment
- **Custom mode**: Direct API calls to OpenAI-compatible endpoints

**Multi-API support**: Different game features can use different APIs:
- `main`: Primary gameplay
- `cot`: Chain of thought reasoning
- `text_optimization`: Text processing
- `embedding`: Vector memory

See `src/services/aiService.ts` for implementation details.

## Game Systems

### Core Systems

- **Official Ranks** (`src/data/official-ranks.ts`): 9-rank system with progression
- **Inventory** (`src/utils/currencySystem.ts`): Multi-currency support (银两, etc.)
- **Equipment**: Crafting and stat bonuses
- **NPCs**: Relationship network with NPC-NPC relationship matrix
- **Time System**: Game time advances with actions (年/月/日/时/分)
- **Memory**: Short-term, mid-term, long-term memory with vector indexing
- **Skills**: Mastery-based skill unlocking through technique progression
- **Sect System**: Government/sect management with members and contributions

### Important Utilities

- `src/utils/saveMigration.ts`: Handles save data format migrations
- `src/utils/saveValidationV3.ts`: Validates V3 save structure
- `src/utils/tavern.ts`: SillyTavern environment detection and helpers
- `src/utils/indexedDBManager.ts`: IndexedDB operations for save data

## Development Guidelines

### Component Structure

- **Views** (`src/views/`): Top-level pages (ModeSelection, CharacterCreation, GameView)
- **Components** (`src/components/`):
  - `character-creation/`: Character creation flow
  - `dashboard/`: Main game panels (character, inventory, relationships, etc.)
  - `common/`: Reusable UI components

### State Management Patterns

1. **For game state**: Use `gameStateStore.updateState(path, value)` for reactive updates
2. **For metadata**: Use `characterStore` methods (creates/deletes/updates)
3. **For persistence**: Always call `saveCurrentGame()` after modifying game state

### Critical Invariants

1. **SaveData must be complete**: Before saving, ensure all required fields exist
2. **Lazy loading**: SaveData is only loaded into memory when the slot is activated
3. **Memory cleanup**: After saving, remove SaveData from slot memory to avoid bloat
4. **Tavern compatibility**: Never use browser history or code-splitting features

### TypeScript Configuration

- Path alias: `@/*` maps to `src/*`
- Strict mode enabled
- Vue 3 strict templates enabled

## SillyTavern Integration

### Environment Detection

```typescript
import { isTavernEnv, getTavernHelper } from '@/utils/tavern';

if (isTavernEnv()) {
  const helper = getTavernHelper();
  // Use TavernHelper for AI calls
}
```

### Tavern Helper API

- `generate({ user_input, ... })`: Generate with character card
- `generateRaw({ ordered_prompts, ... })`: Generate without character card
- `abortGeneration()`: Cancel ongoing generation

### Important Constraints

1. All external dependencies (jQuery, Lodash, etc.) are loaded from Tavern environment
2. Never use `window.history` or browser URL routing
3. Keep bundle size reasonable (avoid heavy dependencies)
4. Test both in standalone mode and embedded in SillyTavern

## Common Patterns

### Reading from Store

```typescript
import { useGameStateStore } from '@/stores/gameStateStore';
import { useCharacterStore } from '@/stores/characterStore';

const gameStateStore = useGameStateStore();
const characterStore = useCharacterStore();

// Access game state
const character = gameStateStore.character;
const inventory = gameStateStore.inventory;

// Access character metadata
const activeProfile = characterStore.activeCharacterProfile;
```

### Updating Game State

```typescript
// Single field update
gameStateStore.updateState('角色.属性.银两', newValue);

// Complex update (load full SaveData)
const saveData = gameStateStore.toSaveData();
// Modify saveData...
gameStateStore.loadFromSaveData(saveData);
await characterStore.saveCurrentGame();
```

### Save/Load Pattern

```typescript
// Save
await characterStore.saveCurrentGame();

// Load
await characterStore.loadGame(characterId, saveSlot);

// Rollback
await characterStore.rollbackToLastConversation();
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
