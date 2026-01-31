import type { CurrencyAsset, CurrencySettings, Inventory } from '@/types/game';

export const DEFAULT_BASE_CURRENCY_ID = '铜钱';

export type DefaultCurrencyId =
  | '铜钱'
  | '银两'
  | '金锭';

export const DEFAULT_CURRENCIES: Record<DefaultCurrencyId, Omit<CurrencyAsset, '数量'>> = {
  铜钱: { 币种: '铜钱', 名称: '铜钱', 价值度: 1, 描述: '民间常用小额货币', 图标: 'Coins' },
  银两: { 币种: '银两', 名称: '银两', 价值度: 100, 描述: '主要流通货币（约等于 100 铜钱）', 图标: 'HandCoins' },
  金锭: { 币种: '金锭', 名称: '金锭', 价值度: 10000, 描述: '大额财富储存（约等于 100 银两）', 图标: 'BadgeDollarSign' },
};

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.max(min, Math.min(max, value));
  if (typeof value === 'string') {
    const n = Number(value.trim());
    if (Number.isFinite(n)) return Math.max(min, Math.min(max, n));
  }
  return fallback;
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function ensureCurrencySettings(backpack: any): CurrencySettings {
  const raw = backpack?.货币设置;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    backpack.货币设置 = { 禁用币种: [], 基准币种: DEFAULT_BASE_CURRENCY_ID };
    return backpack.货币设置 as CurrencySettings;
  }
  if (!Array.isArray(raw.禁用币种)) raw.禁用币种 = [];
  raw.禁用币种 = raw.禁用币种.filter((v: any) => typeof v === 'string' && v.trim());
  if (typeof raw.基准币种 !== 'string' || !raw.基准币种.trim()) raw.基准币种 = DEFAULT_BASE_CURRENCY_ID;
  return raw as CurrencySettings;
}

export function ensureCurrencyWallet(backpack: any): Record<string, CurrencyAsset> {
  const raw = backpack?.货币;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    backpack.货币 = {};
    return backpack.货币 as Record<string, CurrencyAsset>;
  }
  return raw as Record<string, CurrencyAsset>;
}

export function normalizeCurrencyAsset(id: string, value: any): CurrencyAsset | null {
  const keyId = normalizeString(id);
  if (!keyId) return null;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const 币种 = normalizeString(value.币种) || keyId;
  const 名称 = normalizeString(value.名称) || keyId;
  const 数量 = clampNumber(value.数量, 0, 9e15, 0);
  const 价值度 = clampNumber(value.价值度, 0, 9e15, 0);
  const 描述 = normalizeString(value.描述) || undefined;
  const 图标 = normalizeString(value.图标) || undefined;

  return { 币种, 名称, 数量, 价值度, 描述, 图标 };
}

export function ensureDefaultCurrencies(backpack: any) {
  const settings = ensureCurrencySettings(backpack);
  const wallet = ensureCurrencyWallet(backpack);
  const disabled = new Set(settings.禁用币种);

  for (const [id, def] of Object.entries(DEFAULT_CURRENCIES)) {
    const existing = wallet[id];
    if (existing == null || typeof existing !== 'object') {
      if (disabled.has(id)) continue;
      wallet[id] = { ...def, 数量: 0 };
    } else {
      const normalized = normalizeCurrencyAsset(id, existing);
      wallet[id] = normalized ? { ...def, ...normalized, 数量: normalized.数量 } : { ...def, 数量: 0 };
      if (wallet[id].价值度 <= 0) wallet[id].价值度 = def.价值度;
      if (!wallet[id].名称) wallet[id].名称 = def.名称;
      if (!wallet[id].图标) wallet[id].图标 = def.图标;
    }
  }
}

export function migrateLegacySpiritStonesToWallet(backpack: any) {
  if (!backpack || typeof backpack !== 'object') return;
  ensureCurrencySettings(backpack);
  const wallet = ensureCurrencyWallet(backpack);

  const legacy = backpack.灵石;
  const hasLegacy = legacy && typeof legacy === 'object' && !Array.isArray(legacy);

  const legacyLow = hasLegacy ? clampNumber(legacy.下品, 0, 9e15, 0) : 0;
  const legacyMid = hasLegacy ? clampNumber(legacy.中品, 0, 9e15, 0) : 0;
  const legacyHigh = hasLegacy ? clampNumber(legacy.上品, 0, 9e15, 0) : 0;
  const legacySupreme = hasLegacy ? clampNumber(legacy.极品, 0, 9e15, 0) : 0;

  // 计算旧灵石总价值（以"下品灵石"为基准单位）
  const legacyTotalValue = legacyLow + (legacyMid * 100) + (legacyHigh * 10000) + (legacySupreme * 1000000);

  // 迁移策略：将灵石按价值转换为新的货币系统
  // 1000000 下品灵石 = 1 金锭
  // 10000 下品灵石 = 1 银两
  // 100 下品灵石 = 1 铜钱（基准）
  // 这里我们采用简化的兑换策略：1旧灵石 = 1新铜钱（保持玩家财富值相对稳定）

  const walletHasStoneKey =
    '灵石_下品' in wallet ||
    '灵石_中品' in wallet ||
    '灵石_上品' in wallet ||
    '灵石_极品' in wallet;

  const walletHasNewCurrency =
    '铜钱' in wallet ||
    '银两' in wallet ||
    '金锭' in wallet;

  // 如果有旧灵石数据且新货币未初始化，进行迁移
  if (hasLegacy && legacyTotalValue > 0 && !walletHasNewCurrency) {
    // 将旧灵石价值转换为铜钱（1:1比例保持玩家财富）
    wallet['铜钱'] = { ...(DEFAULT_CURRENCIES.铜钱 as any), ...wallet['铜钱'], 数量: legacyTotalValue };

    // 自动兑换大额货币
    let totalCopper = legacyTotalValue;
    const gold = Math.floor(totalCopper / 10000);
    totalCopper %= 10000;
    const silver = Math.floor(totalCopper / 100);
    totalCopper %= 100;

    wallet['金锭'] = { ...(DEFAULT_CURRENCIES.金锭 as any), ...wallet['金锭'], 数量: gold };
    wallet['银两'] = { ...(DEFAULT_CURRENCIES.银两 as any), ...wallet['银两'], 数量: silver };
    wallet['铜钱'] = { ...(DEFAULT_CURRENCIES.铜钱 as any), ...wallet['铜钱'], 数量: totalCopper };
  }

  // 如果还有旧的灵石字段，删除它们
  if (walletHasStoneKey) {
    delete wallet['灵石_下品'];
    delete wallet['灵石_中品'];
    delete wallet['灵石_上品'];
    delete wallet['灵石_极品'];
  }
}

export function syncWalletToLegacySpiritStones(backpack: any) {
  if (!backpack || typeof backpack !== 'object') return;
  const wallet = backpack.货币;
  if (!wallet || typeof wallet !== 'object' || Array.isArray(wallet)) return;

  // 将新货币系统同步回旧格式（兼容旧UI）
  // 计算总价值并转换为旧灵石格式
  const copper = clampNumber(wallet['铜钱']?.数量, 0, 9e15, 0);
  const silver = clampNumber(wallet['银两']?.数量, 0, 9e15, 0);
  const gold = clampNumber(wallet['金锭']?.数量, 0, 9e15, 0);

  // 总价值（以铜钱为基准）
  const totalValue = copper + (silver * 100) + (gold * 10000);

  if (!backpack.灵石 || typeof backpack.灵石 !== 'object' || Array.isArray(backpack.灵石)) {
    backpack.灵石 = { 下品: 0, 中品: 0, 上品: 0, 极品: 0 };
  }

  // 将总价值转换回旧灵石格式
  backpack.灵石.下品 = totalValue % 100;
  backpack.灵石.中品 = Math.floor((totalValue / 100) % 100);
  backpack.灵石.上品 = Math.floor((totalValue / 10000) % 100);
  backpack.灵石.极品 = Math.floor(totalValue / 1000000);
}

export function normalizeBackpackCurrencies(backpack: any) {
  if (!backpack || typeof backpack !== 'object') return;

  ensureCurrencySettings(backpack);
  ensureCurrencyWallet(backpack);

  // 1) 兼容旧存档：先把灵石四档迁移到货币里（仅在货币未初始化时）
  migrateLegacySpiritStonesToWallet(backpack);

  // 2) 规范化 wallet（剔除无效项）
  const wallet = backpack.货币 as Record<string, any>;
  const normalizedWallet: Record<string, CurrencyAsset> = {};
  for (const [id, raw] of Object.entries(wallet)) {
    const normalized = normalizeCurrencyAsset(id, raw);
    if (!normalized) continue;
    normalizedWallet[id] = normalized;
  }
  backpack.货币 = normalizedWallet;

  // 3) 补默认币种（尊重禁用列表）
  ensureDefaultCurrencies(backpack);

  // 4) 同步回旧字段，保证旧 UI/逻辑仍可用
  syncWalletToLegacySpiritStones(backpack);
}

export function normalizeInventoryCurrencies(inventory: Inventory | null | undefined) {
  if (!inventory || typeof inventory !== 'object') return;
  normalizeBackpackCurrencies(inventory as any);
}
