<script lang="ts" setup>
const item = {
  date: '2016-05-02',
  name: 'Tom',
  address: 'No. 189, Grove St, Los Angeles',
}
const activeKbUuid = defineModel<string | null>()
const knowledgeList = ref([
  { title: '唱', content: '内容1' },
  { title: '跳', content: '内容2' },
  { title: 'rap', content: '内容3' },
  { title: '篮球', content: '内容3' },
])
function handleSelect(item: { title: string, content: string }) {
  activeKbUuid.value = item.title
}
</script>

<template>
  <el-aside width="200px" class="border-r border-[#efeff5]">
    <el-scrollbar>
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
    </el-scrollbar>
  </el-aside>
</template>

<style scoped>

</style>
