<script setup lang="ts">
// ⭐ 关键：声明递归组件
import { computed } from 'vue'
import { useRouter } from 'vue-router'

defineOptions({
  name: 'TopItem',
})

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  basePath: {
    type: String,
    default: '',
  },
  subItem: {
    type: Boolean,
    default: false,
  },
})

const currentIndex = defineModel('currentIndex')

const router = useRouter()

/** 是否有 children */
const hasChildren = computed(() => {
  return Array.isArray(props.item.children) && props.item.children.length > 0
})

/** 拼接 path（最简路径规范化） */
const fullPath = computed(() => {
  const base = props.basePath || ''
  const route = props.item.path || ''

  const path = `${base}/${route}`.replace(/\/+/g, '/')
  return path.startsWith('/') ? path : `/${path}`
})

function getSidebarIcon(icon: string) {
  return {
    width: '56px',
    height: '56px',
    backgroundImage: `url('/src/assets/theme/sidebar/${icon}.png')`,

    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  }
}

/** 点击跳转 */
function handleClick(path: string) {
  console.log('handleClick触发', path)

  router.push(path)
}
</script>

<template>
  <div>
    <!-- 有 children → 渲染 el-sub-menu -->
    <el-sub-menu
      v-if="hasChildren"
      :index="fullPath"
    >
      <template #title>
        <div class="flex items-center w-full h-full">
          <div :style="getSidebarIcon(item.meta.icon!)" />
          <div
            class="
                    ml-[10px]
                    h-[50px]
                    flex-1
                    text-[20px]
                    rounded-[20px]
                    flex items-center justify-center
                    tracking-[1.5px]
                    px-[6px]
                    bg-[url('/src/assets/theme/sidebar/sidebar-item-bg.png')]
                    bg-cover bg-center bg-no-repeat
                    shadow-[0_0_8px_rgba(0,0,0,0.4)]
                    "
            :class="[item.name === currentIndex ? 'text-primary' : '']"
          >
            {{ item.meta.title }}
          </div>
        </div>
      </template>

      <!-- 递归调用自身 -->
      <sidebarItem
        v-for="child in item.children"
        :key="child.path"
        :item="child"
        :base-path="fullPath"
        :sub-item="true"
      />
    </el-sub-menu>

    <!-- 无 children → 渲染 el-menu-item -->
    <el-menu-item
      v-else
      :index="fullPath"
      @click="handleClick(fullPath)"
    >
      <template #title>
        <div class="flex items-center w-full h-full" :class="[subItem ? 'pl-[30px]' : '']">
          <div :style="getSidebarIcon(item.meta.icon!)" />
          <div
            class="
                    ml-[10px]
                    flex-1
                    h-[50px]
                    text-[20px]
                    rounded-[20px]
                    flex items-center justify-center
                    tracking-[1.5px]
                    px-[6px]
                    bg-[url('/src/assets/theme/sidebar/sidebar-item-bg.png')]
                    bg-cover bg-center bg-no-repeat
                    shadow-[0_0_8px_rgba(0,0,0,0.4)]
                    "
            :class="[item.name === currentIndex ? 'text-primary' : '', subItem ? 'w-[100px]!  text-[16px]! h-[36px]! ' : '']"
          >
            {{ item.meta.title }}
          </div>
        </div>
      </template>
    </el-menu-item>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-menu--inline) {
  background-color: unset;
}
:deep(.sidebar-container .el-sub-menu__title):hover {
  background-color: #d7bdfd !important;
}
</style>
