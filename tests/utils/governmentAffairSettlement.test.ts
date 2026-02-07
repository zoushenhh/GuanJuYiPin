/**
 * @fileoverview 政务结算系统测试用例
 * 测试时间推进与政务结算的各种场景
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  settleGovernmentAffairs,
  formatSettlementReport,
  type SettlementReport,
} from '@/utils/governmentAffairSettlement';
import type { GovernmentDesk, GovernmentAffair, ConstructionProject } from '@/stores/gameStateStore';
import type { GameTime } from '@/types/game';

// ============================================================================
// 测试数据构建器
// ============================================================================

function createMockGameTime(overrides?: Partial<GameTime>): GameTime {
  return {
    年: 1,
    月: 1,
    日: 1,
    小时: 8,
    分钟: 0,
    ...overrides,
  };
}

function createMockGovernmentDesk(overrides?: Partial<GovernmentDesk>): GovernmentDesk {
  return {
    待办事项: [],
    正在进行: [],
    已完成事项: [],
    ...overrides,
  };
}

function createMockAffair(overrides?: Partial<GovernmentAffair>): GovernmentAffair {
  return {
    id: `affair_${Date.now()}`,
    名称: '测试政务',
    类型: '民生',
    描述: '这是一个测试政务',
    紧急度: '中',
    难度: '普通',
    发布时间: '0001-01-01T08:00',
    是否已处理: false,
    ...overrides,
  };
}

function createMockProject(overrides?: Partial<ConstructionProject>): ConstructionProject {
  return {
    id: `project_${Date.now()}`,
    名称: '测试项目',
    类型: '基础设施',
    描述: '这是一个测试项目',
    当前进度: 0,
    预计工时: 100, // 100小时
    状态: '进行中',
    开始时间: new Date().toISOString(),
    ...overrides,
  };
}

// ============================================================================
// 测试套件
// ============================================================================

describe('政务结算系统', () => {
  describe('逾期政务检查', () => {
    it('应该正确识别逾期政务并应用惩罚', () => {
      // 准备测试数据
      const currentTime = createMockGameTime({
        年: 1,
        月: 1,
        日: 5, // 5天后
        小时: 8,
      });

      const overdueAffair = createMockAffair({
        名称: '逾期测试政务',
        期限: '0001-01-03T08:00', // 期限是第3天，现在是第5天，逾期2天
      });

      const governmentDesk = createMockGovernmentDesk({
        待办事项: [overdueAffair],
      });

      const gameState = {
        governmentDesk,
        location: {
          民心支持度: 60,
          治安: 70,
          发展活力: 50,
        },
        gameTime: currentTime,
      };

      // 执行结算（推进24小时）
      const report = settleGovernmentAffairs(gameState, 24);

      // 验证结果
      expect(report.逾期惩罚).toHaveLength(1);
      expect(report.逾期惩罚[0].政务名称).toBe('逾期测试政务');
      expect(report.逾期惩罚[0].逾期天数).toBe(2);

      // 验证政务被标记为已处理
      expect(overdueAffair.是否已处理).toBe(true);
      expect(overdueAffair.处理结果).toContain('逾期');

      // 验证惩罚影响（民心-4，治安-6，逾期2天）
      expect(overdueAffair.影响?.民心变化).toBeLessThan(0);
      expect(overdueAffair.影响?.治安变化).toBeLessThan(0);
    });

    it('应该不惩罚未到期的政务', () => {
      const currentTime = createMockGameTime({
        年: 1,
        月: 1,
        日: 2,
        小时: 8,
      });

      const futureAffair = createMockAffair({
        名称: '未来政务',
        期限: '0001-01-05T08:00', // 期限是第5天，现在是第2天
      });

      const governmentDesk = createMockGovernmentDesk({
        待办事项: [futureAffair],
      });

      const gameState = {
        governmentDesk,
        location: {
          民心支持度: 60,
          治安: 70,
          发展活力: 50,
        },
        gameTime: currentTime,
      };

      const report = settleGovernmentAffairs(gameState, 24);

      // 验证无逾期惩罚
      expect(report.逾期惩罚).toHaveLength(0);

      // 验证政务未被标记为已处理
      expect(futureAffair.是否已处理).toBe(false);
    });
  });

  describe('自然趋势应用', () => {
    it('应该正确应用民心自然增长', () => {
      const gameState = {
        governmentDesk: createMockGovernmentDesk(),
        location: {
          民心支持度: 60,
          治安: 70,
          发展活力: 50,
        },
        gameTime: createMockGameTime(),
      };

      const initial民心 = gameState.location.民心支持度;

      // 推进24小时（1天）
      const report = settleGovernmentAffairs(gameState, 24);

      // 验证民心增长（每日增长约0.05）
      expect(report.自然趋势.民心变化).toBeGreaterThan(0);
      expect(gameState.location.民心支持度).toBeGreaterThan(initial民心);
    });

    it('应该正确应用财政自然消耗', () => {
      const gameState = {
        governmentDesk: createMockGovernmentDesk(),
        location: {
          民心支持度: 60,
          治安: 70,
          发展活力: 50,
          库银: 1000, // 添加库银字段
          粮食: 500, // 添加粮食字段
        },
        gameTime: createMockGameTime(),
      };

      const initial库银 = gameState.location.库银;
      const initial粮食 = gameState.location.粮食;

      // 推进24小时
      const report = settleGovernmentAffairs(gameState, 24);

      // 验证库银和粮食消耗
      expect(report.自然趋势.库银变化).toBeLessThan(0);
      expect(report.自然趋势.粮食变化).toBeLessThan(0);
      expect(gameState.location.库银).toBeLessThan(initial库银);
      expect(gameState.location.粮食).toBeLessThan(initial粮食);
    });
  });

  describe('建设项目进度更新', () => {
    it('应该正确更新建设项目进度', () => {
      const project = createMockProject({
        名称: '测试建设',
        预计工时: 10, // 10小时完成
        当前进度: 0,
      });

      const governmentDesk = createMockGovernmentDesk({
        正在进行: [project],
      });

      const gameState = {
        governmentDesk,
        location: {
          民心支持度: 60,
          治安: 70,
          发展活力: 50,
        },
        gameTime: createMockGameTime(),
      };

      // 推进5小时
      const report = settleGovernmentAffairs(gameState, 5);

      // 验证进度更新（5小时 / 10小时 * 100 = 50%）
      expect(report.项目更新).toHaveLength(1);
      expect(report.项目更新[0].项目名称).toBe('测试建设');
      expect(report.项目更新[0].进度变化).toBeCloseTo(50, 1);
      expect(project.当前进度).toBeCloseTo(50, 1);
      expect(project.状态).toBe('进行中');
    });

    it('应该正确完成建设项目', () => {
      const project = createMockProject({
        名称: '即将完成的项目',
        预计工时: 10,
        当前进度: 90, // 已经90%了
      });

      const governmentDesk = createMockGovernmentDesk({
        正在进行: [project],
      });

      const gameState = {
        governmentDesk,
        location: {
          民心支持度: 60,
          治安: 70,
          发展活力: 50,
        },
        gameTime: createMockGameTime(),
      };

      // 推进2小时（应该让项目从90%到110%，但上限是100%）
      const report = settleGovernmentAffairs(gameState, 2);

      // 验证项目已完成
      expect(report.项目更新[0].是否完成).toBe(true);
      expect(project.状态).toBe('已完成');
      expect(project.当前进度).toBe(100);
      expect(project.完成时间).toBeDefined();
    });
  });

  describe('结算报告格式化', () => {
    it('应该正确格式化空报告', () => {
      const emptyReport: SettlementReport = {
        结算时间: '为官1年1月上旬1日 08:00',
        推进时长: 1,
        逾期惩罚: [],
        自然趋势: {
          民心变化: 0.05,
          治安变化: 0.03,
          繁荣度变化: 0.02,
          教化变化: 0.04,
          库银变化: -5,
          粮食变化: -2,
        },
        阈值效果: {
          惩罚: [],
          奖励: [],
        },
        项目更新: [],
      };

      const formatted = formatSettlementReport(emptyReport);

      expect(formatted).toContain('为官1年1月上旬1日 08:00');
      expect(formatted).toContain('推进时长: 1.0 小时');
      expect(formatted).toContain('自然趋势');
    });

    it('应该正确格式化包含逾期惩罚的报告', () => {
      const reportWithPenalty: SettlementReport = {
        结算时间: '为官1年1月上旬5日 08:00',
        推进时长: 24,
        逾期惩罚: [
          {
            政务ID: 'affair_1',
            政务名称: '逾期政务',
            逾期天数: 2,
            惩罚描述: '民心-4，治安-6',
          },
        ],
        自然趋势: {
          民心变化: -3.95, // -4（逾期）+ 0.05（自然增长）
          治安变化: -5.97, // -6（逾期）+ 0.03（自然增长）
          繁荣度变化: 0.02,
          教化变化: 0.04,
          库银变化: -5,
          粮食变化: -2,
        },
        阈值效果: {
          惩罚: [],
          奖励: [],
        },
        项目更新: [],
      };

      const formatted = formatSettlementReport(reportWithPenalty);

      expect(formatted).toContain('【逾期惩罚】');
      expect(formatted).toContain('逾期政务: 逾期2天');
      expect(formatted).toContain('民心-4，治安-6');
    });
  });

  describe('边界情况处理', () => {
    it('应该处理空的政务台', () => {
      const gameState = {
        governmentDesk: null,
        location: {
          民心支持度: 60,
          治安: 70,
          发展活力: 50,
        },
        gameTime: createMockGameTime(),
      };

      // 不应该抛出错误
      expect(() => {
        settleGovernmentAffairs(gameState, 24);
      }).not.toThrow();
    });

    it('应该处理已完成的政务', () => {
      const completedAffair = createMockAffair({
        名称: '已完成政务',
        是否已处理: true,
        处理结果: '处理完成',
      });

      const governmentDesk = createMockGovernmentDesk({
        待办事项: [completedAffair],
      });

      const gameState = {
        governmentDesk,
        location: {
          民心支持度: 60,
          治安: 70,
          发展活力: 50,
        },
        gameTime: createMockGameTime(),
      };

      const report = settleGovernmentAffairs(gameState, 24);

      // 已完成的政务不应触发逾期惩罚
      expect(report.逾期惩罚).toHaveLength(0);
    });

    it('应该处理没有期限的政务', () => {
      const noDeadlineAffair = createMockAffair({
        名称: '无期限政务',
        期限: undefined,
      });

      const governmentDesk = createMockGovernmentDesk({
        待办事项: [noDeadlineAffair],
      });

      const gameState = {
        governmentDesk,
        location: {
          民心支持度: 60,
          治安: 70,
          发展活力: 50,
        },
        gameTime: createMockGameTime(),
      };

      const report = settleGovernmentAffairs(gameState, 24);

      // 没有期限的政务不应触发逾期惩罚
      expect(report.逾期惩罚).toHaveLength(0);
    });
  });
});
