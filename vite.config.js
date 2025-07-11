import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './', // 关键：让资源路径相对于 HTML 文件
  plugins: [react()],
    build: {
    outDir: 'docs', // 输出目录改为 docs
  }
  // server: {
  //   port: 3000,
  //   open: true, // 自动打开浏览器
  //   proxy: {
  //     '/api': {
  //       target: 'http://localhost:5000', // 替换为你的后端服务地址
  //       changeOrigin: true,
  //       rewrite: (path) => path.replace(/^\/api/, '')
  //     }
  //   }
  // },
  // build: {
  //   outDir: 'dist',
  //   rollupOptions: {
  //     input: {
  //       main: 'src/main.jsx',
  //       pdfReader: 'src/PdfReader.jsx',
  //       pdfAnnotator: 'src/PdfAnnotator.jsx'
  //     },
  //     output: {
  //       entryFileNames: '[name].js',
  //       chunkFileNames: '[name].js',
  //       assetFileNames: '[name].[ext]'
  //     }
  //   }
  // }
})
