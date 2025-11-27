<script setup lang="ts">
import type { LoginFormModel } from '@/model/login'

const title = import.meta.env.VITE_APP_TITLE
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const loginRef = useTemplateRef('loginFormRef')
const loginForm = ref<LoginFormModel>({
  name: 'admin',
  password: '123456',
})

const loginRules = {
  name: [{ required: true, trigger: 'blur', message: '请输入您的账号' }],
  password: [{ required: true, trigger: 'blur', message: '请输入您的密码' }],
}
const loading = ref(false)

/** 注册开关 */
const redirect = ref<string | undefined>(undefined)

/**
 * 登录方法
 */
function handleLogin() {
  loginRef.value?.validate((valid) => {
    if (valid) {
      loading.value = true

      userStore
        .login({
          name: loginForm.value.name,
          password: loginForm.value.password,
        })
        .then(() => {
          const query = route.query
          const otherQueryParams = Object.keys(query).reduce(
            (acc: { [key: string]: any }, cur) => {
              if (cur !== 'redirect') {
                acc[cur] = query[cur]
              }
              return acc
            },
            {},
          )
          router.push({ path: redirect.value || '/', query: otherQueryParams })
        })
        .catch(() => {
          loading.value = false
        })
    }
  })
}

watch(
  route,
  (newRoute) => {
    redirect.value = newRoute.query && (newRoute.query.redirect as string)
  },
  { immediate: true },
)
function resize() {
  const scale = window.innerHeight / 1080
  const el = document.querySelector('.scale-content') as HTMLElement
  if (el)
    el.style.transform = `scale(${scale})`
}
onMounted(() => {
  resize()
  window.addEventListener('resize', resize)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
})
</script>

<template>
  <div class="login-container h-[100vh] flex flex-col justify-center items-center  bg-cover">
    <div class="  App-logo w-[220px] h-[100px]" />
    <div class="mt-[20px] h-[126px] text-white text-[70px]">
      {{ title }}
    </div>

    <div class="mt-[20px] w-[551px] flex-center flex-col">
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form-container flex flex-col items-start justify-center z-[1] w-[551px] h-[260px] rounded-[66px] bg-white px-[50px] pt-[25px] pb-[5px]"
      >
        <!-- 用户名 -->
        <el-form-item prop="name" class="w-full">
          <div class="flex items-center w-full">
            <icon-font name="round-user" size="40" color="#7C4ACE" />

            <div class="text-primary ml-[20px] text-[26px] w-[120px]">
              用户名
            </div>

            <el-input
              v-model="loginForm.name"
              class="ml-[20px] "
              type="text"
              size="large"
              auto-complete="off"
              placeholder="账号"
            />
          </div>
        </el-form-item>

        <!-- 密码 -->
        <el-form-item prop="password" class="mt-[20px] w-full">
          <div class="flex items-center w-full">
            <icon-font name="round-password" size="40" color="#7C4ACE" />

            <div class="text-primary ml-[20px] text-[26px] w-[120px]">
              密码
            </div>

            <!-- 固定 356px -->
            <el-input
              v-model="loginForm.password"
              type="password"
              class="ml-[20px]"
              size="large"
              auto-complete="off"
              placeholder="密码"
              show-password
              @keyup.enter="handleLogin"
            />
          </div>
        </el-form-item>
      </el-form>

      <ShukeButton
        :loading="loading"
        class="mt-[30px] w-[240px]! "
        size="large"
        type="primary"
        style="width: 100%"
        @click.prevent="handleLogin"
      >
        <span v-if="!loading" class="text-[30px]">登 录</span>
        <span v-else class="text-[30px]">登 录 中...</span>
      </ShukeButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.scale-content {
  transform-origin: top center;
}
.App-logo {
  background-image: url('/src/assets/theme/App-logo.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.el-input {
  height: 40px;
  input {
    height: 40px;
  }
}

.card {
  border-radius: 18px;
}

.login {
  padding: 20px 0;
  border: 1rpx solid red;
}

.login-container {
  background-image: url('/src/assets/theme/login-page-bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.login-form-container {
  background-image: url('/src/assets/theme/login-form-bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
