<!-- DemoKnowledgeGrid.vue -->
<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

interface Item { id: number | string, title: string, desc?: string, icon?: string }
const router = useRouter()

// 生成知识库风格的图标（shapes）
function kbIcon(seed: string) {
  return `https://api.dicebear.com/7.x/shapes/png?seed=${encodeURIComponent(seed)}&size=128&radius=16&backgroundType=gradientLinear`
}

const rawItems: Omit<Item, 'icon'>[] = [
  { id: 1, title: '产品手册', desc: '详细介绍产品功能和使用方法' },
  { id: 2, title: '开发文档', desc: '接口、SDK 以及集成指南' },
  { id: 3, title: '用户指南', desc: '面向终端用户的快速上手说明' },
  { id: 4, title: '常见问题', desc: 'FAQ 汇总与解决方案' },
  { id: 5, title: '安装部署', desc: '环境配置与安装步骤' },
  { id: 6, title: '运维手册', desc: '监控、日志、故障排查' },
  { id: 7, title: '安全策略', desc: '数据保护与权限说明' },
  { id: 8, title: '团队规范', desc: '代码规范、提交规范、分支管理' },
  { id: 9, title: '知识分享', desc: '内部培训与学习资料' },
  { id: 10, title: '术语词典', desc: '专业术语解释与缩写' },
  { id: 11, title: '版本记录', desc: '产品迭代与更新日志' },
  { id: 12, title: '设计文档', desc: 'UI 设计、交互原型、视觉稿' },
  { id: 13, title: '代码审查', desc: '代码质量检查与改进建议' },
  { id: 14, title: '项目计划', desc: '时间表、里程碑与任务分配' },
  { id: 15, title: '测试用例', desc: '功能测试与性能测试方案' },
  { id: 16, title: '用户反馈', desc: '用户意见与改进建议' },
  { id: 17, title: '市场分析', desc: '竞争对手与行业趋势研究' },
  { id: 18, title: '销售策略', desc: '客户开发与销售技巧' },
  { id: 19, title: '运营数据', desc: '用户增长与活跃度分析' },
  { id: 20, title: '财务报告', desc: '收入、支出与预算管理' },
  { id: 21, title: '法律合规', desc: '合同模板与法律风险控制' },
  { id: 22, title: '招聘指南', desc: '岗位描述与面试流程' },
  { id: 23, title: '培训计划', desc: '员工技能提升与职业发展' },
  { id: 24, title: '客户案例', desc: '成功案例与客户评价' },
  { id: 25, title: '品牌手册', desc: '品牌定位与传播策略' },
  { id: 26, title: '社交媒体', desc: '内容创作与发布计划' },
  { id: 27, title: '广告投放', desc: '渠道选择与效果评估' },
  { id: 28, title: '危机管理', desc: '应急预案与公关策略' },
  { id: 29, title: '技术架构', desc: '系统设计与技术选型' },
  { id: 30, title: '数据模型', desc: '数据库设计与优化方案' },
  { id: 31, title: '算法研究', desc: '核心算法与性能优化' },
  { id: 32, title: '人工智能', desc: '机器学习与深度学习应用' },
  { id: 33, title: '区块链', desc: '分布式账本与智能合约' },
  { id: 34, title: '物联网', desc: '设备连接与数据采集' },
  { id: 35, title: '云计算', desc: '云服务与资源管理' },
  { id: 36, title: '大数据', desc: '数据分析与可视化' },
  { id: 37, title: '网络安全', desc: '漏洞检测与防护措施' },
  { id: 38, title: '移动开发', desc: 'iOS 与 Android 应用开发' },
  { id: 39, title: '前端开发', desc: 'HTML、CSS 与 JavaScript 框架' },
  { id: 40, title: '后端开发', desc: '服务器端语言与框架' },
  { id: 41, title: '测试驱动', desc: '单元测试与集成测试' },
  { id: 42, title: '持续集成', desc: '自动化构建与部署' },
  { id: 43, title: '版本控制', desc: 'Git 使用与分支管理' },
  { id: 44, title: '容器化', desc: 'Docker 与 Kubernetes' },
  { id: 45, title: '微服务', desc: '服务拆分与通信机制' },
  { id: 46, title: '事件驱动', desc: '消息队列与事件总线' },
  { id: 47, title: '分布式系统', desc: '一致性与高可用性设计' },
  { id: 48, title: '性能优化', desc: '系统调优与瓶颈分析' },
  { id: 49, title: '日志管理', desc: '日志收集与分析工具' },
  { id: 50, title: '监控报警', desc: '系统监控与故障告警' },
  { id: 51, title: '自动化运维', desc: '脚本与工具开发' },
  { id: 52, title: '数据备份', desc: '备份策略与恢复方案' },
  { id: 53, title: '权限管理', desc: '用户认证与授权机制' },
  { id: 54, title: 'API 设计', desc: '接口规范与文档生成' },
  { id: 55, title: 'SDK 开发', desc: '开发工具包与示例代码' },
  { id: 56, title: '插件开发', desc: '扩展功能与集成方案' },
  { id: 57, title: '跨平台', desc: '多端适配与兼容性处理' },
  { id: 58, title: '国际化', desc: '多语言支持与本地化' },
  { id: 59, title: '无障碍设计', desc: '辅助功能与用户体验优化' },
  { id: 60, title: '用户画像', desc: '用户行为与偏好分析' },
  { id: 61, title: '推荐系统', desc: '个性化推荐算法' },
  { id: 62, title: '搜索引擎', desc: '全文检索与排序算法' },
  { id: 63, title: '内容管理', desc: '内容创建与审核流程' },
  { id: 64, title: '社区运营', desc: '用户互动与活动策划' },
  { id: 65, title: '游戏开发', desc: '游戏引擎与关卡设计' },
  { id: 66, title: '虚拟现实', desc: 'VR 技术与应用场景' },
  { id: 67, title: '增强现实', desc: 'AR 技术与交互设计' },
  { id: 68, title: '机器人', desc: '机械设计与控制算法' },
  { id: 69, title: '自动驾驶', desc: '传感器与路径规划' },
  { id: 70, title: '生物信息', desc: '基因组学与数据分析' },
  { id: 71, title: '量子计算', desc: '量子算法与编程语言' },
  { id: 72, title: '教育科技', desc: '在线学习与教学工具' },
  { id: 73, title: '医疗科技', desc: '健康监测与诊断系统' },
  { id: 74, title: '金融科技', desc: '支付系统与风险控制' },
  { id: 75, title: '电子商务', desc: '购物车与订单管理' },
  { id: 76, title: '物流管理', desc: '仓储与配送优化' },
  { id: 77, title: '供应链', desc: '采购与库存管理' },
  { id: 78, title: '能源管理', desc: '电力与资源调度' },
  { id: 79, title: '环境保护', desc: '碳排放与可持续发展' },
  { id: 80, title: '社会公益', desc: '慈善项目与志愿服务' },
  { id: 81, title: '文化创意', desc: '艺术与设计作品' },
  { id: 82, title: '影视制作', desc: '剧本创作与后期剪辑' },
  { id: 83, title: '音乐创作', desc: '作曲与音频处理' },
  { id: 84, title: '摄影技巧', desc: '拍摄与后期修图' },
  { id: 85, title: '写作技巧', desc: '文案与故事创作' },
  { id: 86, title: '演讲技巧', desc: '公众表达与沟通技巧' },
  { id: 87, title: '时间管理', desc: '效率提升与目标设定' },
  { id: 88, title: '心理健康', desc: '情绪管理与压力缓解' },
  { id: 89, title: '人际关系', desc: '沟通与冲突解决' },
  { id: 90, title: '职业规划', desc: '职业目标与发展路径' },
  { id: 91, title: '创业指南', desc: '商业模式与融资策略' },
  { id: 92, title: '投资理财', desc: '资产配置与风险管理' },
  { id: 93, title: '生活技巧', desc: '家居整理与健康饮食' },
  { id: 94, title: '旅游攻略', desc: '目的地推荐与行程规划' },
  { id: 95, title: '运动健身', desc: '锻炼计划与营养搭配' },
  { id: 96, title: '宠物护理', desc: '饲养与健康管理' },
  { id: 97, title: '园艺种植', desc: '植物养护与景观设计' },
  { id: 98, title: '手工艺', desc: 'DIY 制作与创意设计' },
  { id: 99, title: '收藏鉴赏', desc: '艺术品与古董收藏' },
  { id: 100, title: '天文观测', desc: '星空与天体研究' },
  { id: 101, title: '语言学习', desc: '外语学习与文化交流' },
]

// 自动给每个条目加上图标（保持原数据不动）
const items = ref<Item[]>(rawItems.map(it => ({ ...it, icon: kbIcon(it.title) })))

function handleClick(item: Item) {
  console.log('Clicked item:', item)
  router.push({ name: 'KnowledgeDetail', params: { id: item.id } })
}

/* ---------- 顶部：搜索 & 新建 ---------- */
const q = ref('')
const filtered = computed(() =>
  items.value.filter(it =>
    !q.value.trim()
    || it.title.toLowerCase().includes(q.value.trim().toLowerCase())
    || (it.desc ?? '').toLowerCase().includes(q.value.trim().toLowerCase()),
  ),
)

/* ---------- 新建知识库：弹窗 ---------- */
const showCreate = ref(false)
const creating = ref(false)
const form = ref({ name: '', desc: '' })

function openCreate() {
  form.value = { name: '', desc: '' }
  showCreate.value = true
}

async function submitCreate() {
  if (!form.value.name.trim())
    return
  try {
    creating.value = true
    // TODO: 接入你的创建接口
    const newItem: Item = {
      id: Date.now(),
      title: form.value.name.trim(),
      desc: form.value.desc.trim(),
      icon: kbIcon(form.value.name.trim()),
    }
    // 插到首位，不影响已有 100+ 条数据和滚动条
    items.value = [newItem, ...items.value]
    showCreate.value = false
    router.push({ name: 'KnowledgeDetail', params: { id: newItem.id } })
  }
  finally {
    creating.value = false
  }
}
</script>

<template>
  <!-- 顶部工具栏 -->
  <div class="mb-3 flex items-center justify-between">
    <div class="text-lg font-semibold text-slate-900">
      知识库
    </div>
    <div class="flex items-center gap-2">
      <el-input
        v-model="q"
        placeholder="搜索知识库…"
        clearable
        class="w-[280px]"
        :prefix-icon="Search"
      />
      <el-button type="primary" @click="openCreate">
        + 新建知识库
      </el-button>
    </div>
  </div>

  <!-- 列表：保持滚动条 & 卡片固定尺寸 -->
  <el-scrollbar height="100%">
    <div class="grid gap-[10px] [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
      <!-- 新建知识库卡片（置于首位） -->
      <div
        class="border border-dashed border-sky-300/70 rounded-lg bg-white/60
               hover:bg-sky-50 hover:border-sky-400 hover:shadow-sm transition
               flex items-center justify-center cursor-pointer"
        style="width:200px; height:100px"
        @click="openCreate"
      >
        <div class="flex items-center gap-2 text-sky-600">
          <div class="w-8 h-8 rounded-md bg-sky-100 grid place-items-center">
            <svg viewBox="0 0 24 24" class="w-5 h-5" fill="currentColor" aria-hidden="true">
              <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" />
            </svg>
          </div>
          <span class="text-sm font-medium">新建知识库</span>
        </div>
      </div>

      <!-- 现有知识库卡片（保持你的样式与尺寸） -->
      <div
        v-for="it in filtered"
        :key="it.id"
        class="border border-slate-200 rounded-lg bg-white shadow-sm
               hover:shadow-md transition
               flex items-center justify-between px-3"
        style="width:200px; height:100px"
        @click="handleClick(it)"
      >
        <div class="min-w-0 mr-2">
          <h3 class="text-sm font-semibold text-slate-900 truncate">
            {{ it.title }}
          </h3>
          <p v-if="it.desc" class="text-xs text-slate-500 truncate">
            {{ it.desc }}
          </p>
        </div>

        <div class="w-8 h-8 rounded-md bg-slate-100 grid place-items-center flex-none">
          <img :src="it.icon" :alt="it.title" class="w-5 h-5 object-contain" loading="lazy">
        </div>
      </div>
    </div>
  </el-scrollbar>

  <!-- 新建知识库弹窗 -->
  <el-dialog v-model="showCreate" title="新建知识库" width="500px">
    <el-form label-width="70px">
      <el-form-item label="名称">
        <el-input v-model="form.name" placeholder="请输入知识库名称" maxlength="40" show-word-limit />
      </el-form-item>
      <el-form-item label="描述">
        <el-input
          v-model="form.desc"
          type="textarea"
          :rows="3"
          placeholder="可选：简单介绍该知识库用途"
          maxlength="120"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="flex justify-end gap-2">
        <el-button @click="showCreate = false">
          取消
        </el-button>
        <el-button type="primary" :loading="creating" :disabled="!form.name.trim()" @click="submitCreate">
          创建
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
