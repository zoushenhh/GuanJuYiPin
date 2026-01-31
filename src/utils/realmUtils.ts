/**
 * 官品工具函数（县令主题）
 * 用于格式化官品显示
 */

/**
 * 格式化官品和阶段显示（县令主题）
 * @param rank 官品对象或字符串
 * @returns 格式化后的官品字符串（县令主题）
 */
export function formatRealmWithStage(rank: any): string {
  if (!rank) {
    return '平民';
  }

  // 如果是字符串，直接返回
  if (typeof rank === 'string') {
    return rank;
  }

  // 如果是对象，提取名称和阶段
  const name = rank.名称 || rank.name || '平民';
  const stage = rank.阶段 || rank.stage || '';

  // 平民不加阶段
  if (name === '平民' || name === 'Commoner') {
    return '平民';
  }

  // 如果有阶段，返回"官品+阶段"
  if (stage) {
    return `${name}·${stage}`;
  }

  // 否则只返回官品名称
  return name;
}

/**
 * 格式化官品和阶段显示（县令主题）
 * @param rank 官品对象或字符串
 * @returns 格式化后的官品字符串
 */
export function formatRankWithStage(rank: any): string {
  if (!rank) {
    return '平民';
  }

  // 如果是字符串，直接返回
  if (typeof rank === 'string') {
    return rank;
  }

  // 如果是对象，提取名称和阶段
  const name = rank.名称 || rank.name || '平民';
  const stage = rank.阶段 || rank.stage || '';

  // 平民不加阶段
  if (name === '平民' || name === 'Commoner') {
    return '平民';
  }

  // 如果有阶段，返回"官品+阶段"
  if (stage) {
    return `${name}·${stage}`;
  }

  // 否则只返回官品名称
  return name;
}
