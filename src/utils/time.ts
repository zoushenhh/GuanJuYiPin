import type { GameTime } from '@/types/game';

const DAYS_IN_MONTH = 30;
const MONTHS_IN_YEAR = 12;
const HOURS_IN_DAY = 24;
const MINUTES_IN_HOUR = 60;
const DAYS_IN_XUN = 10; // 一旬10日
const XUNS_IN_MONTH = 3; // 一月三旬

/**
 * 旬类型
 */
export type XunType = '上旬' | '中旬' | '下旬';

/**
 * 标准化游戏时间，处理分钟、小时、天和月的进位。
 * @param time 要标准化的GameTime对象。
 * @returns 一个新的、已标准化的GameTime对象。
 */
export function normalizeGameTime(time: GameTime): GameTime {
  let { 年, 月, 日, 小时, 分钟 } = time;

  if (分钟 >= MINUTES_IN_HOUR) {
    小时 += Math.floor(分钟 / MINUTES_IN_HOUR);
    分钟 %= MINUTES_IN_HOUR;
  }

  if (小时 >= HOURS_IN_DAY) {
    日 += Math.floor(小时 / HOURS_IN_DAY);
    小时 %= HOURS_IN_DAY;
  }

  while (日 > DAYS_IN_MONTH) {
    月 += 1;
    日 -= DAYS_IN_MONTH;
  }

  if (月 > MONTHS_IN_YEAR) {
    年 += Math.floor((月 - 1) / MONTHS_IN_YEAR);
    月 = ((月 - 1) % MONTHS_IN_YEAR) + 1;
  }

  return { 年, 月, 日, 小时, 分钟 };
}

// ============================================================================
// 旬相关函数（县令主题：政务周期）
// ============================================================================

/**
 * 获取当前是第几旬（1-3）
 * @param time 游戏时间对象
 * @returns 1=上旬, 2=中旬, 3=下旬
 */
export function getCurrentXun(time: GameTime): number {
  const day = time.日;
  if (day <= 10) return 1;
  if (day <= 20) return 2;
  return 3;
}

/**
 * 获取当前旬的名称
 * @param time 游戏时间对象
 * @returns 旬名称
 */
export function getCurrentXunName(time: GameTime): XunType {
  const xun = getCurrentXun(time);
  if (xun === 1) return '上旬';
  if (xun === 2) return '中旬';
  return '下旬';
}

/**
 * 获取旬的日期范围
 * @param xun 旬序号（1-3）
 * @returns [开始日期, 结束日期]
 */
export function getXunDayRange(xun: number): [number, number] {
  if (xun === 1) return [1, 10];
  if (xun === 2) return [11, 20];
  return [21, 30];
}

/**
 * 按旬推进时间
 * @param time 当前游戏时间
 * @param xuns 要推进的旬数
 * @returns 推进后的游戏时间
 */
export function advanceByXun(time: GameTime, xuns: number): GameTime {
  const newTime = { ...time };
  const totalDaysToAdd = xuns * DAYS_IN_XUN;
  newTime.日 += totalDaysToAdd;
  return normalizeGameTime(newTime);
}

/**
 * 计算从开始时间到结束时间跨越了多少旬
 * @param startTime 开始时间
 * @param endTime 结束时间
 * @returns 旬数
 */
export function calculateXunsBetween(startTime: GameTime, endTime: GameTime): number {
  const startTotalDays = startTime.年 * 360 + startTime.月 * 30 + startTime.日;
  const endTotalDays = endTime.年 * 360 + endTime.月 * 30 + endTime.日;
  const daysDiff = endTotalDays - startTotalDays;
  return Math.floor(daysDiff / DAYS_IN_XUN);
}

/**
 * 格式化时间为县令主题的字符串（年月旬）
 * @param time 游戏时间
 * @returns 格式化字符串，如 "为官1年2月上旬"
 */
export function formatGameTimeAsXun(time: GameTime): string {
  const xunName = getCurrentXunName(time);
  return `为官${time.年}年${time.月}月${xunName}`;
}

/**
 * 格式化时间为详细字符串（包含日时分）
 * @param time 游戏时间
 * @returns 格式化字符串
 */
export function formatGameTimeDetailed(time: GameTime): string {
  const xunName = getCurrentXunName(time);
  return `为官${time.年}年${time.月}月${xunName}${time.日}日 ${String(time.小时).padStart(2, '0')}:${String(time.分钟).padStart(2, '0')}`;
}