import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/testProject",
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        // 1) 不顯示 node_modules 內的 deprecation（例如 bootstrap）
        quietDeps: true,
        // 2) 針對常見類型直接靜音（bootstrap 官方範例）
        silenceDeprecations: [
          "import",
          "mixed-decls",
          "color-functions",
          "global-builtin",
          // 你 log 有出現 if-function，也可加（若你的 sass 支援此 ID）
          "if-function",
        ],
      },
    },
  },
});
