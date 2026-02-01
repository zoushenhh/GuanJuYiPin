/**
 * @fileoverview 案件推理系统状态管理（县令特色功能）
 *
 * 【功能说明】
 * - 管理当前案件的审理状态
 * - 处理线索发现和验证
 * - 管理案件生成和判决
 */

import { defineStore } from 'pinia';
import type {
  LegalCase,
  CaseClue,
  CaseParticipant,
  CaseRecord,
  VerdictResult,
  JudgementAbility,
  JudgementAbilityInput,
  JudgementSkillLevel,
} from '@/types/legal';

export const useLegalStore = defineStore('legal', {
  // ============================================================================
  // 状态定义
  // ============================================================================
  state: () => ({
    // 当前案件
    currentCase: null as LegalCase | null,

    // 案件列表（历史案件）
    caseHistory: [] as LegalCase[],

    // 断案能力
    judgementAbility: null as JudgementAbility | null,

    // 系统配置
    config: {
      启用断案系统: true,
      自动生成案件: true,
      案件限时: 30, // 默认30个回合
      难度缩放: true, // 根据官品调整难度
    },

    // 缓存
    lastUpdateTime: '',
  }),

  // ============================================================================
  // 计算属性
  // ============================================================================
  getters: {
    /**
     * 获取当前案件的所有线索（包括未发现的）
     */
    allClues(): CaseClue[] {
      return this.currentCase?.线索池 || [];
    },

    /**
     * 获取已发现的线索
     */
    discoveredClues(): CaseClue[] {
      if (!this.currentCase) return [];
      return this.currentCase.线索池.filter(clue =>
        this.currentCase!.已发现线索.includes(clue.id)
      );
    },

    /**
     * 获取未发现的线索
     */
    undiscoveredClues(): CaseClue[] {
      if (!this.currentCase) return [];
      return this.currentCase.线索池.filter(clue =>
        !this.currentCase!.已发现线索.includes(clue.id)
      );
    },

    /**
     * 检查是否可以判决
     */
    canVerdict(): boolean {
      if (!this.currentCase) return false;
      if (this.currentCase.状态 !== '审理中') return false;

      // 检查是否已发现足够线索
      const discoveredCount = this.discoveredClues.length;
      const totalClues = this.allClues.length;
      const discoveryRate = totalClues > 0 ? discoveredCount / totalClues : 0;

      // 至少发现50%的线索才能判决
      return discoveryRate >= 0.5;
    },

    /**
     * 获取当前案件的原告
     */
    plaintiffs(): CaseParticipant[] {
      return this.currentCase?.原告 || [];
    },

    /**
     * 获取当前案件的被告
     */
    defendants(): CaseParticipant[] {
      return this.currentCase?.被告 || [];
    },

    /**
     * 获取当前案件的证人
     */
    witnesses(): CaseParticipant[] {
      return this.currentCase?.证人 || [];
    },

    /**
     * 检查案件是否超时
     */
    isCaseOverdue(): boolean {
      if (!this.currentCase || !this.currentCase.限时) return false;
      return (this.currentCase.已用回合 || 0) >= this.currentCase.限时;
    },
  },

  // ============================================================================
  // 操作方法
  // ============================================================================
  actions: {
    /**
     * 计算断案能力
     */
    calculateJudgementAbility(input: JudgementAbilityInput): JudgementAbility {
      // 根据六司属性计算断案能力
      const 观察力 = Math.min(100, (
        input.心性 * 0.5 +
        input.魅力 * 0.2 +
        input.精力 * 0.1 +
        input.气运 * 0.2
      ));

      const 推理力 = Math.min(100, (
        input.悟性 * 0.6 +
        input.心性 * 0.3 +
        input.气运 * 0.1
      ));

      const 审讯技巧 = Math.min(100, (
        input.魅力 * 0.4 +
        input.心性 * 0.3 +
        input.精力 * 0.2 +
        input.气运 * 0.1
      ));

      // 威望加成
      const 威望加成 = Math.min(100, input.声望 / 10);

      // 计算技能等级
      const getSkillLevel = (value: number): JudgementSkillLevel => {
        if (value >= 80) return '专家';
        if (value >= 60) return '精通';
        if (value >= 40) return '熟练';
        return '生疏';
      };

      const ability: JudgementAbility = {
        观察力,
        推理力,
        审讯技巧,
        威望加成,
        观察力等级: getSkillLevel(观察力),
        推理力等级: getSkillLevel(推理力),
        审讯技巧等级: getSkillLevel(审讯技巧),
      };

      this.judgementAbility = ability;
      return ability;
    },

    /**
     * 开始新案件
     */
    startNewCase(newCase: LegalCase): void {
      // 设置案件状态为审理中
      newCase.状态 = '审理中';
      newCase.创建时间 = new Date().toISOString();
      newCase.更新时间 = new Date().toISOString();
      newCase.已用回合 = 0;

      this.currentCase = newCase;
      this.lastUpdateTime = new Date().toISOString();
    },

    /**
     * 发现线索
     */
    discoverClue(clueId: string): boolean {
      if (!this.currentCase) return false;

      const clue = this.currentCase.线索池.find(c => c.id === clueId);
      if (!clue || clue.是否已发现) return false;

      // 检查发现难度
      const ability = this.judgementAbility;
      if (!ability) return false;

      // 计算发现概率
      const baseChance = 0.5; // 基础概率50%
      const observationBonus = ability.观察力 / 200; // 观察力加成
      const difficultyPenalty = clue.发现难度 / 20; // 难度惩罚

      const successChance = baseChance + observationBonus - difficultyPenalty;

      if (Math.random() > successChance) {
        return false; // 发现失败
      }

      // 发现成功
      clue.是否已发现 = true;
      clue.发现时间 = new Date().toISOString();
      this.currentCase.已发现线索.push(clueId);

      // 添加审理记录
      this.addRecord({
        id: `record_${Date.now()}`,
        时间: this.formatGameTime(),
        类型: '发现线索',
        描述: `发现了线索：${clue.名称}`,
        相关线索: [clueId],
      });

      this.currentCase.更新时间 = new Date().toISOString();
      return true;
    },

    /**
     * 传唤人员
     */
    summonParticipant(name: string): void {
      if (!this.currentCase) return;

      if (!this.currentCase.已传唤人员.includes(name)) {
        this.currentCase.已传唤人员.push(name);

        // 添加审理记录
        this.addRecord({
          id: `record_${Date.now()}`,
          时间: this.formatGameTime(),
          类型: '传唤',
          描述: `传唤了 ${name}`,
          相关人员: [name],
        });

        this.currentCase.更新时间 = new Date().toISOString();
      }
    },

    /**
     * 审问人员
     */
    interrogateParticipant(name: string, result: {
      新线索?: string[];
      新供述?: string;
      记录?: string;
    }): void {
      if (!this.currentCase) return;

      // 更新审问次数
      const updateParticipant = (participants: CaseParticipant[] | undefined) => {
        if (!participants) return;
        const participant = participants.find(p => p.姓名 === name);
        if (participant) {
          participant.是否已审问 = true;
          participant.审问次数 += 1;
        }
      };

      updateParticipant(this.currentCase.被告);
      updateParticipant(this.currentCase.证人);

      // 处理审问结果
      if (result.新线索 && result.新线索.length > 0) {
        for (const clueId of result.新线索) {
          this.discoverClue(clueId);
        }
      }

      // 添加审理记录
      this.addRecord({
        id: `record_${Date.now()}`,
        时间: this.formatGameTime(),
        类型: '审问',
        描述: result.记录 || `审问了 ${name}`,
        相关人员: [name],
        相关线索: result.新线索,
      });

      this.currentCase.更新时间 = new Date().toISOString();
    },

    /**
     * 添加审理记录
     */
    addRecord(record: CaseRecord): void {
      if (!this.currentCase) return;
      this.currentCase.审理记录.push(record);
    },

    /**
     * 判决案件
     */
    verdictCase(verdict: VerdictResult): void {
      if (!this.currentCase) return;

      // 更新案件状态
      this.currentCase.状态 = '已判决';
      this.currentCase.判决结果 = {
        结论: verdict.判决选项.文本,
        依据: verdict.评价,
        判决时间: this.formatGameTime(),
      };

      // 应用判决后果
      if (verdict.判决选项.后果) {
        const { 声望变化, 民心变化, 政绩变化 } = verdict.判决选项.后果;
        // 这里可以触发其他store的更新
      }

      // 添加到历史记录
      this.caseHistory.push({ ...this.currentCase });

      // 添加审理记录
      this.addRecord({
        id: `record_${Date.now()}`,
        时间: this.formatGameTime(),
        类型: '判决',
        描述: `作出判决：${verdict.判决选项.文本}`,
      });

      this.currentCase.更新时间 = new Date().toISOString();
    },

    /**
     * 归档当前案件
     */
    archiveCurrentCase(): void {
      if (!this.currentCase) return;

      this.currentCase.状态 = '已归档';
      this.caseHistory.push({ ...this.currentCase });
      this.currentCase = null;
    },

    /**
     * 推进回合
     */
    advanceTurn(): void {
      if (!this.currentCase) return;

      if (this.currentCase.已用回合 !== undefined) {
        this.currentCase.已用回合 += 1;
      }
    },

    /**
     * 格式化游戏时间
     */
    formatGameTime(): string {
      // 这里应该从主store获取当前游戏时间
      // 暂时返回ISO格式字符串
      return new Date().toISOString();
    },

    /**
     * 重置store
     */
    resetStore(): void {
      this.currentCase = null;
      this.caseHistory = [];
      this.judgementAbility = null;
      this.lastUpdateTime = '';
    },
  },
});
