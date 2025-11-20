<template>
  <div class="icon" :style="{ color: iconColor }">
    <component :is="iconComponent" v-if="iconComponent" :title="title" />
  </div>
</template>

<script setup>
import { computed, h } from 'vue';
import * as SimpleIcons from 'simple-icons';

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  }
});

// 图标映射表，只包含 Mastodon 和饭否
const iconMap = {
  'mastodon': 'siMastodon',
  'fanfou': 'siFanfou', // 用于饭否
};

// 图标默认色值
const defaultColors = {
  'mastodon': '#6364FF',
  'fanfou': '#00CCFF',
};

// 计算最终使用的颜色
const iconColor = computed(() => {
  // 如果用户提供了颜色，使用用户的颜色
  if (props.color) {
    return props.color;
  }

  // 否则使用默认颜色，如果有的话
  if (defaultColors[props.name]) {
    return defaultColors[props.name];
  }

  // 最后的默认值
  return 'currentColor';
});

const iconComponent = computed(() => {
  // 获取对应的 Simple Icons 名称
  const iconName = iconMap[props.name];

  if (!iconName) {
    console.warn(`Icon not supported: ${props.name}`);
    return null;
  }

  // 检查是否存在该图标
  if (SimpleIcons[iconName]) {
    // 创建 SVG 组件
    return {
      render() {
        return h('svg', {
          xmlns: 'http://www.w3.org/2000/svg',
          width: '1em',
          height: '1em',
          viewBox: '0 0 24 24',
          fill: 'currentColor',
          innerHTML: SimpleIcons[iconName].svg
        });
      }
    };
  }

  console.warn(`Icon not found: ${props.name} (${iconName})`);
  return null;
});
</script>

<style scoped>
.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.icon svg {
  width: 1em;
  height: 1em;
}
</style>