import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: true, // 监听所有地址，包括局域网和公网
    // 或者也可以明确指定IP
    // host: '0.0.0.0',
    port: 5173, // 默认端口，可自定义
    // 如果你的后端API也需要代理，代理配置也在这里
    // proxy: { ... }
  }
})
