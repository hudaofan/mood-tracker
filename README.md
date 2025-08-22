# 🌸 情绪记录疗愈应用

一个温暖、舒缓的情绪记录与疗愈Web应用，帮助用户记录每日心情，追踪情绪变化，获得内心的平静与疗愈。

## ✨ 功能特性

### 🎯 核心功能
- **情绪记录**: 选择当日心情，记录日记，上传照片或录音
- **历史回顾**: 日历视图和列表视图查看历史记录
- **趋势分析**: 情绪折线图、词云分析、情绪占比统计
- **疗愈设计**: 柔和舒缓的果冻感UI，营造放松氛围

### 🎨 设计特色
- **温暖色调**: 奶白、雾紫、淡蓝主色调
- **果冻质感**: 柔和的圆角、渐变和阴影效果
- **流畅动画**: 基于Framer Motion的自然过渡动效
- **响应式设计**: 完美适配桌面端和移动端

## 🛠️ 技术栈

### 前端技术
- **React 18** - 现代化React框架
- **TypeScript** - 类型安全的JavaScript
- **Vite** - 快速的构建工具
- **TailwindCSS** - 实用优先的CSS框架
- **Framer Motion** - 强大的动画库

### 后端服务
- **Supabase** - 开源的Firebase替代方案
  - 实时数据库
  - 用户认证
  - 文件存储

### 数据可视化
- **Chart.js** - 图表库（折线图、饼图）
- **Wordcloud2.js** - 词云生成

## 🚀 快速开始

### 环境要求
- Node.js >= 18
- pnpm >= 8

### 安装依赖
```bash
pnpm install
```

### 环境配置
1. 复制环境变量文件：
```bash
cp .env.example .env.local
```

2. 配置Supabase环境变量：
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 数据库设置
运行Supabase迁移文件：
```bash
# 如果使用Supabase CLI
supabase db push

# 或手动执行SQL文件
# 在Supabase Dashboard中执行 supabase/migrations/ 下的SQL文件
```

### 启动开发服务器
```bash
pnpm dev
```

访问 [http://localhost:5173](http://localhost:5173) 查看应用。

### 构建生产版本
```bash
pnpm build
```

### 部署
```bash
pnpm deploy
```

## 📱 页面结构

- **首页** (`/`) - 快速情绪记录和今日概览
- **记录页** (`/record`) - 详细的情绪记录界面
- **历史页** (`/history`) - 查看历史记录
- **分析页** (`/analytics`) - 情绪趋势分析

## 🗄️ 数据结构

### 用户表 (users)
- `id` - 用户唯一标识
- `email` - 用户邮箱
- `created_at` - 创建时间

### 情绪记录表 (mood_records)
- `id` - 记录唯一标识
- `user_id` - 用户ID
- `mood` - 情绪类型
- `intensity` - 情绪强度 (1-5)
- `note` - 日记内容
- `photo_url` - 照片URL
- `audio_url` - 录音URL
- `created_at` - 记录时间

## 🎯 开发指南

### 代码规范
- 使用TypeScript进行类型检查
- 遵循ESLint配置的代码规范
- 组件采用函数式组件 + Hooks
- 使用TailwindCSS进行样式开发

### 项目结构
```
src/
├── components/     # 通用组件
├── pages/         # 页面组件
├── hooks/         # 自定义Hooks
├── lib/           # 工具库
├── utils/         # 工具函数
└── assets/        # 静态资源
```

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 💖 致谢

感谢所有为心理健康和情绪疗愈做出贡献的开发者和设计师们。
