<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { NConfigProvider } from 'naive-ui'

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    console.log('Tab 切换到前台')
  }
  else {
    console.log('Tab 切到后台/隐藏')
  }
})
window.addEventListener('beforeunload', () => {
  console.log('Tab 即将关闭或刷新')
})

window.addEventListener('pagehide', () => {
  console.log('Tab 被卸载（关闭/刷新/跳转）')
})
// 类型提示（可选）
type GlobalThemeOverrides = import('naive-ui').GlobalThemeOverrides

const themeOverrides: GlobalThemeOverrides = {
  // —— 通用颜色（影响 primary 类型的全部组件，包括 ghost/dashed 等）——
  common: {
    primaryColor: '#8989fa',
    primaryColorHover: '#a1a1fb',
    primaryColorPressed: '#6c6cea',
    primaryColorSuppl: '#8989fa',
    // 可选：其他语义色
    // errorColor: '#f56c6c'
  },

  // —— 组件级微调（按需）——
  Button: {
    // 普通按钮文字色（type="default" 等）
    textColor: '#1f2329',
    // 如果希望 ghost 时文字更深/统一，可单独定制：
    textColorGhost: '#6c6cea', // ghost 文字
    borderGhost: '1px solid #8989fa', // ghost 边框
    colorGhost: 'transparent', // ghost 背景
    // 也可以按 primary 场景定制（可选）
    // colorPrimary: '#8989fa',
    // colorHoverPrimary: '#a1a1fb',
    // colorPressedPrimary: '#6c6cea',
  },

  Select: {
    peers: {
      InternalSelection: {
        textColor: '#1f2329',
        // 选中/聚焦的边框、hover等（按需）
        borderHover: '1px solid #a1a1fb',
        borderFocus: '1px solid #8989fa',
      },
    },
  },

  // 你用到的其它组件也能在这里加，比如 Tabs / Tag / Badge 等……
}
</script>

<template>
  <el-config-provider :locale="zhCn">
    <NConfigProvider :theme-overrides="themeOverrides">
      <router-view />
    </NConfigProvider>
  </el-config-provider>
</template>

<style scoped>

</style>
