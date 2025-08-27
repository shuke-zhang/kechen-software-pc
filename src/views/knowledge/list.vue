<script setup lang="ts">
const activeKbUuid = defineModel<string | null>()

function handleSelect(item: { title: string, content: string }) {
  activeKbUuid.value = item.title
}
const knowledgeList = ref([
  { title: '知识库1', content: '内容1' },
  { title: '知识库2', content: '内容2' },
  { title: '知识库3', content: '内容3' },
  { title: '知识库4', content: '内容4' },
  { title: '知识库5', content: '内容5' },
  { title: '知识库6', content: '内容6' },
  { title: '知识库7', content: '内容7' },
  { title: '知识库8', content: '内容8' },
  { title: '知识库9', content: '内容9' },
  { title: '知识库10', content: '内容10' },
  { title: '知识库11', content: '内容11' },
  { title: '知识库12', content: '内容12' },
  { title: '知识库13', content: '内容13' },
  { title: '知识库14', content: '内容14' },
])
</script>

<template>
  <n-scrollbar class="flex-1 min-h-0 px-[16px] py-[16px]" trigger="hover">
    <div class="flex flex-col gap-2 text-sm">
      <a
        v-for="item of knowledgeList" :key="item.title"
        class="relative flex items-center gap-3 px-3 py-3 break-all border rounded-md cursor-pointer hover:bg-primary-100 group dark:border-primary-800 dark:hover:bg-[#24272e]"
        :class="item.title === activeKbUuid && ['border-[#8989fa]', 'bg-primary-100', 'text-[#6c6cea]', 'dark:bg-[#24272e]', 'dark:border-[#8989fa]', 'pr-14']"
        @click="handleSelect(item)"
      >
        <div class="relative flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
          <span>{{ item.title }}</span>
        </div>
      </a>
    </div>
  </n-scrollbar>
</template>

<style scoped lang="scss">
</style>
