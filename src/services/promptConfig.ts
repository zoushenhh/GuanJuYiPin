/**
 * 提示词配置服务
 * 单机模式 - 仅使用本地配置
 * 优先级：用户自定义 > 本地默认
 */

// 远程提示词配置接口（保留接口定义以兼容类型，但功能已禁用）
export interface RemotePromptConfig {
  prompts: Record<string, {
    content: string;
    enabled: boolean;
    description?: string;
  }>;
  version: string;
  lastUpdated?: string;
}

/**
 * 从后端获取远程提示词配置（单机模式禁用）
 * @returns 远程配置或 null（单机模式始终返回 null）
 */
export async function fetchRemotePromptConfig(): Promise<RemotePromptConfig | null> {
  console.log('[提示词配置] 单机模式，不支持远程配置');
  return null;
}

/**
 * 获取指定 key 的提示词内容（单机模式不使用远程配置）
 * @param key 提示词 key
 * @param defaultValue 默认值
 * @returns 提示词内容
 */
export function getPromptWithRemoteOverride(key: string, defaultValue: string): string {
  // 单机模式：直接返回默认值，不使用远程配置
  return defaultValue;
}

/**
 * 检查指定 key 的提示词是否启用
 * @param key 提示词 key
 * @returns 是否启用
 */
export function isPromptEnabled(_key: string): boolean {
  // 单机模式：所有提示词默认启用
  return true;
}

/**
 * 获取所有远程提示词配置
 * @returns 远程配置或空对象（单机模式始终返回空对象）
 */
export function getAllRemotePrompts(): Record<string, { content: string; enabled: boolean }> {
  // 单机模式不支持远程配置
  return {};
}

/**
 * 清除缓存的远程配置（单机模式无操作）
 */
export function clearRemotePromptCache(): void {
  console.log('[提示词配置] 单机模式，无缓存需要清除');
}

/**
 * 获取远程配置版本
 * @returns 版本号或 null（单机模式始终返回 null）
 */
export function getRemoteConfigVersion(): string | null {
  return null;
}
