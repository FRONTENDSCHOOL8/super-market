import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'docs',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        products: resolve(__dirname, 'src/pages/products/index.html'),
        benefit: resolve(__dirname, 'src/pages/benefit/index.html'),
        login: resolve(__dirname, 'src/pages/login/index.html'),
        register: resolve(__dirname, 'src/pages/register/index.html'),
        detail: resolve(__dirname, 'src/pages/detail/index.html'),
        cart: resolve(__dirname, 'src/pages/cart/index.html'),
        address: resolve(__dirname, 'src/pages/address/index.html'),
        mypage: resolve(__dirname, 'src/pages/mypage/index.html'),
      },
    },
  },
});
