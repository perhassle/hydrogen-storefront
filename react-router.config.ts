import type {Config} from '@react-router/dev/config';

export default {
  appDirectory: 'app',
  buildDirectory: 'dist',
  ssr: true,
  // Enhanced configuration for better virtual module resolution
  serverModuleFormat: 'esm',
  // Optimize server build
  serverBuildFile: 'index.js',
} satisfies Config;
