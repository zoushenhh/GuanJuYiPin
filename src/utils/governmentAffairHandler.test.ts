/**
 * @fileoverview 政务处理核心逻辑 - 单元测试
 *
 * 运行测试：
 * ```bash
 * npm test -- governmentAffairHandler.test.ts
 * ```
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  handleAffair,
  generateDailyAffairs,
  checkOverdueAffairs,
  calculateTimeAdvance,
} from './governmentAffairHandler';
import { useGameStateStore } from '@/stores/gameStateStore';
import { getAffairById } from '@/data/governmentAffairs';

// Mock gameStateStore
vi.mock('@/stores/gameStateStore', () => ({
  useGameStateStore: vi.fn(),
}));

describe('governmentAffairHandler', () => {
  const mockGameStateStore = {
    gameTime: {
      年: 1,
      月: 1,
      日: 1,
      小时: 8,
      分钟: 0,
    },
    inventory: {
      货币: {
        库银: { 数量: 1000 },
        粮食: { 数量: 500 },
      },
    },
    attributes: {
      智力: { 当前: 60 },
      魅力: { 当前: 55 },
      政务: { 当前: 70 },
      政绩: { 当前: 50 },
      威望: { 当前: 40 },
    },
    worldInfo: {
      辖区统计: {
        民心: { 当前: 60 },
        治安: { 当前: 70 },
        繁荣度: { 当前: 50 },
        教化: { 当前: 40 },
      },
    },
    getAffairs: vi.fn(() => []),
    removeAffair: vi.fn(),
    addAffair: vi.fn(),
    updateState: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(useGameStateStore).mockReturnValue(mockGameStateStore as any);
  });

  describe('calculateTimeAdvance', () => {
    it('should correctly calculate time advance for minutes', () => {
      const choice = {
        cost: {
          时间: 30,
          时间单位: '分钟' as const,
        },
      };

      const minutes = calculateTimeAdvance(choice as any);
      expect(minutes).toBe(30);
    });

    it('should correctly calculate time advance for hours', () => {
      const choice = {
        cost: {
          时间: 8,
          时间单位: '小时' as const,
        },
      };

      const minutes = calculateTimeAdvance(choice as any);
      expect(minutes).toBe(8 * 60);
    });

    it('should correctly calculate time advance for days', () => {
      const choice = {
        cost: {
          时间: 5,
          时间单位: '天' as const,
        },
      };

      const minutes = calculateTimeAdvance(choice as any);
      expect(minutes).toBe(5 * 24 * 60);
    });

    it('should return 0 if no time cost', () => {
      const choice = {};
      const minutes = calculateTimeAdvance(choice as any);
      expect(minutes).toBe(0);
    });
  });

  describe('handleAffair', () => {
    it('should process affair successfully', async () => {
      const affairId = 'disaster_drought';
      const choiceIndex = 0;

      const result = await handleAffair(affairId, choiceIndex);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('新时间');
      expect(result).toHaveProperty('消耗');
      expect(result).toHaveProperty('变化');
      expect(result).toHaveProperty('时间推进分钟');
      expect(result).toHaveProperty('描述');
    });

    it('should throw error if affair not found', async () => {
      await expect(handleAffair('invalid_affair_id', 0)).rejects.toThrow(
        '未找到政务定义'
      );
    });

    it('should throw error if choice index out of range', async () => {
      const affairId = 'disaster_drought';

      await expect(handleAffair(affairId, 999)).rejects.toThrow(
        '选项索引超出范围'
      );
    });

    it('should deduct resources if cost specified', async () => {
      const affairId = 'disaster_drought';
      const choiceIndex = 0;

      const result = await handleAffair(affairId, choiceIndex);

      expect(result.消耗.银两).toBeGreaterThan(0);
      expect(result.消耗.粮食).toBeGreaterThan(0);
    });

    it('should advance game time', async () => {
      const affairId = 'disaster_drought';
      const choiceIndex = 0;

      const result = await handleAffair(affairId, choiceIndex);

      expect(result.时间推进分钟).toBeGreaterThan(0);
      expect(result.新时间.分钟).toBeGreaterThan(0);
    });
  });

  describe('generateDailyAffairs', () => {
    it('should generate daily affairs', async () => {
      const count = await generateDailyAffairs(mockGameStateStore.gameTime, {
        最小数量: 2,
        最大数量: 4,
      });

      expect(count).toBeGreaterThanOrEqual(2);
      expect(count).toBeLessThanOrEqual(4);
      expect(mockGameStateStore.addAffair).toHaveBeenCalledTimes(count);
    });

    it('should respect force type option', async () => {
      const count = await generateDailyAffairs(mockGameStateStore.gameTime, {
        最小数量: 1,
        最大数量: 1,
        强制类型: '救灾',
      });

      expect(count).toBe(1);
    });

    it('should generate only daily affairs when onlyDaily is true', async () => {
      const count = await generateDailyAffairs(mockGameStateStore.gameTime, {
        最小数量: 2,
        最大数量: 4,
        仅日常: true,
      });

      expect(count).toBeGreaterThanOrEqual(2);
      expect(count).toBeLessThanOrEqual(4);
    });
  });

  describe('checkOverdueAffairs', () => {
    it('should return empty array if no overdue affairs', () => {
      const penalties = checkOverdueAffairs(mockGameStateStore.gameTime);

      expect(penalties).toEqual([]);
      expect(penalties.length).toBe(0);
    });

    it('should detect and penalize overdue affairs', () => {
      // Mock an overdue affair
      vi.mocked(mockGameStateStore.getAffairs).mockReturnValue([
        {
          id: 'test_affair_1',
          名称: '测试政务',
          类型: '民生',
          描述: '测试描述',
          紧急度: '高',
          难度: '普通',
          发布时间: '为官1年1月1日 08:00',
          期限: '为官1年1月1日 12:00', // 已过期
          是否已处理: false,
        },
      ]);

      const penalties = checkOverdueAffairs({
        ...mockGameStateStore.gameTime,
        日: 2, // 第2天，已逾期
      });

      expect(penalties.length).toBeGreaterThan(0);
      expect(penalties[0]).toHaveProperty('affairId');
      expect(penalties[0]).toHaveProperty('逾期天数');
      expect(penalties[0]).toHaveProperty('惩罚');
    });

    it('should apply penalty based on urgency', () => {
      // Mock high urgency affair
      vi.mocked(mockGameStateStore.getAffairs).mockReturnValue([
        {
          id: 'test_affair_1',
          名称: '紧急政务',
          类型: '民生',
          描述: '测试描述',
          紧急度: '极高',
          难度: '困难',
          发布时间: '为官1年1月1日 08:00',
          期限: '为官1年1月1日 10:00',
          是否已处理: false,
        },
      ]);

      const penalties = checkOverdueAffairs({
        ...mockGameStateStore.gameTime,
        日: 2,
      });

      expect(penalties.length).toBe(1);
      expect(penalties[0].惩罚.民心变化).toBeLessThan(0); // 应该扣除民心
    });
  });

  describe('integration tests', () => {
    it('should handle affair workflow end-to-end', async () => {
      // 1. 生成日常政务
      const count = await generateDailyAffairs(mockGameStateStore.gameTime);
      expect(count).toBeGreaterThan(0);

      // 2. 获取生成的政务
      const affairs = vi.mocked(mockGameStateStore.getAffairs).mock.results[0]?.value || [];
      expect(affairs.length).toBeGreaterThan(0);

      // 3. 处理第一个政务的第一个选项
      if (affairs.length > 0) {
        const affairId = affairs[0].id;
        const result = await handleAffair(affairId, 0);

        expect(result.success).toBeDefined();
        expect(mockGameStateStore.removeAffair).toHaveBeenCalledWith(affairId, true);
      }
    });

    it('should check overdue after time advance', async () => {
      // 1. 生成政务
      await generateDailyAffairs(mockGameStateStore.gameTime);

      // 2. 推进时间超过7天（所有低紧急度政务都会逾期）
      const futureTime = {
        ...mockGameStateStore.gameTime,
        日: 10,
      };

      // 3. 检查逾期
      const penalties = checkOverdueAffairs(futureTime);

      // 如果有待办政务，应该有逾期惩罚
      const affairs = vi.mocked(mockGameStateStore.getAffairs).mock.results[0]?.value || [];
      if (affairs.length > 0) {
        expect(penalties.length).toBeGreaterThan(0);
      }
    });
  });
});
