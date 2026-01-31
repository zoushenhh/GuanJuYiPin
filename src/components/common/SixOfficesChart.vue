<template>
  <div class="six-offices-chart-container">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
      <!-- 定义水墨风格渐变 -->
      <defs>
        <linearGradient id="inkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="rgba(70, 70, 80, 0.25)" />
          <stop offset="50%" stop-color="rgba(50, 50, 60, 0.2)" />
          <stop offset="100%" stop-color="rgba(40, 40, 50, 0.15)" />
        </linearGradient>
        <linearGradient id="inkGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="rgba(180, 180, 190, 0.3)" />
          <stop offset="100%" stop-color="rgba(150, 150, 160, 0.15)" />
        </linearGradient>
        <!-- 墨迹滤镜 -->
        <filter id="inkBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
        </filter>
      </defs>

      <g :transform="`translate(${center}, ${center})`">
        <!-- 六边形网格线 -->
        <polygon v-for="level in gridLevels" :key="`grid-${level}`" :points="getHexagonPoints(level / gridLevels)" class="grid-line" />

        <!-- 放射线 -->
        <line v-for="(point, index) in axisPoints" :key="`axis-${index}`" x1="0" y1="0" :x2="point.x" :y2="point.y" class="grid-line" />

        <!-- 数据区域 -->
        <polygon :points="dataPoints" class="data-polygon" />

        <!-- 数据点和数值 -->
        <g v-for="(point, index) in dataPathPoints" :key="`data-point-${index}`">
          <circle :cx="point.x" :cy="point.y" r="3" class="data-point" />
          <text
            :x="point.x"
            :y="point.y"
            class="data-value-text"
            :text-anchor="getLabelAnchor(index, true)"
            :dominant-baseline="getLabelBaseline(index, true)"
          >
            {{ point.value }}
          </text>
        </g>

        <!-- 六房标签 -->
        <text
          v-for="(label, index) in labels"
          :key="label.key"
          :x="label.x"
          :y="label.y"
          class="label-text"
          :text-anchor="getLabelAnchor(index)"
          :dominant-baseline="getLabelBaseline(index)"
        >
          {{ label.name }}
        </text>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AttributeKey, InnateAttributesEnglish } from '@/types/game';
import { useI18n } from '@/i18n';

const { t } = useI18n();

const props = withDefaults(defineProps<{
  stats: Partial<InnateAttributesEnglish>;
  size?: number;
  maxValue?: number;
}>(), {
  size: 160,
  maxValue: 10, // 六房能力最大值为10
});

const center = computed(() => props.size / 2);
const radius = computed(() => props.size / 2 * 0.7); // 70% 留出标签空间
const gridLevels = 5;

// 属性顺序对应六房：吏、户、礼、兵、刑、工
const statOrder: AttributeKey[] = ['root_bone', 'spirituality', 'comprehension', 'fortune', 'charm', 'temperament'];

// 六房能力图标签映射
const statNames: Record<AttributeKey, string> = {
  root_bone: t('吏房'),      // 吏房 - 人事管理
  spirituality: t('户房'),   // 房房 - 户籍赋税
  comprehension: t('礼房'), // 礼房 - 典礼教化
  fortune: t('兵房'),       // 兵房 - 军事防务
  charm: t('刑房'),         // 刑房 - 司法刑狱
  temperament: t('工房'),   // 工房 - 工程建设
};

const getHexagonPoints = (scale = 1) => {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 2 + (Math.PI / 3) * i;
    const x = Math.cos(angle) * radius.value * scale;
    const y = -Math.sin(angle) * radius.value * scale;
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return points.join(' ');
};

const dataPathPoints = computed(() => {
  return statOrder.map((key, i) => {
    const value = props.stats[key] ?? 0;
    const scale = Math.max(0, Math.min(1, value / props.maxValue));
    const angle = Math.PI / 2 + (Math.PI / 3) * i;
    const pointRadius = radius.value * scale + (scale === 0 ? 4 : 0);
    return {
      value: value,
      x: Math.cos(angle) * pointRadius,
      y: -Math.sin(angle) * pointRadius,
    };
  });
});

const dataPoints = computed(() => {
  const points: string[] = [];
  statOrder.forEach((key, i) => {
    const value = props.stats[key] ?? 0;
    const scale = Math.max(0, Math.min(1, value / props.maxValue));
    const angle = Math.PI / 2 + (Math.PI / 3) * i;
    const x = Math.cos(angle) * radius.value * scale;
    const y = -Math.sin(angle) * radius.value * scale;
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  });
  return points.join(' ');
});

const axisPoints = computed(() => {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 2 + (Math.PI / 3) * i;
    points.push({
      x: Math.cos(angle) * radius.value,
      y: -Math.sin(angle) * radius.value
    });
  }
  return points;
});

const labels = computed(() => {
  const labelRadius = radius.value * 1.25;
  return statOrder.map((key, i) => {
    const angle = Math.PI / 2 + (Math.PI / 3) * i;
    return {
      key: key,
      name: statNames[key],
      x: Math.cos(angle) * labelRadius,
      y: -Math.sin(angle) * labelRadius,
    };
  });
});

const getLabelAnchor = (index: number, forValue = false) => {
  if (index === 0 || index === 3) return 'middle';
  if (index === 1 || index === 2) return forValue ? 'end' : 'start';
  return forValue ? 'start' : 'end';
}

const getLabelBaseline = (index: number, forValue = false) => {
  if (index === 0) return forValue ? 'hanging' : 'alphabetic';
  if (index === 3) return forValue ? 'alphabetic' : 'hanging';
  return 'middle';
}

</script>

<style scoped>
.six-offices-chart-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 水墨风格 - 浅色主题 */
.grid-line {
  fill: none;
  stroke: var(--color-primary);
  stroke-width: 1;
  opacity: 0.15;
}

.data-polygon {
  fill: url(#inkGradient);
  stroke: var(--color-primary);
  stroke-width: 2;
  filter: drop-shadow(0 0 6px rgba(70, 70, 80, 0.25));
  transition: all 0.3s ease;
}

.data-polygon:hover {
  filter: drop-shadow(0 0 10px rgba(100, 100, 110, 0.4));
}

.data-point {
  fill: var(--color-accent);
  stroke: rgba(200, 200, 210, 0.9);
  stroke-width: 2;
  filter: drop-shadow(0 0 3px rgba(80, 80, 90, 0.35));
}

.data-value-text {
  fill: var(--color-text);
  font-size: 12px;
  font-weight: bold;
  font-family: var(--font-family-serif);
  text-shadow: 1px 1px 2px rgba(200, 200, 200, 0.7);
}

.label-text {
  fill: var(--color-primary);
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-family-serif);
  text-shadow: 1px 1px 2px rgba(200, 200, 200, 0.8);
}

/* 深色主题 - 水墨夜色 */
[data-theme="dark"] .grid-line {
  stroke: #9e9e9e;
  opacity: 0.3;
}

[data-theme="dark"] .data-polygon {
  fill: url(#inkGradientDark);
  stroke: #b0b0b0;
}

[data-theme="dark"] .data-point {
  fill: #d0d0d0;
  stroke: rgba(60, 60, 70, 0.8);
}

[data-theme="dark"] .data-value-text {
  fill: #e8e8e8;
}

[data-theme="dark"] .label-text {
  fill: #c0c0c0;
}
</style>
