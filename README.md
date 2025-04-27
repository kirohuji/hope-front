# Hope-Front

Hope-Front 是一个现代化的前端项目，基于 React 技术栈开发。

## 项目结构

```
src/
├── api/          # API 接口定义
├── assets/       # 静态资源文件
├── auth/         # 认证相关逻辑
├── components/   # 可复用组件
├── composables/  # 组合式函数
├── hooks/        # 自定义 Hooks
├── layouts/      # 页面布局组件
├── locales/      # 国际化文件
├── modules/      # 业务模块
├── pages/        # 页面组件
├── redux/        # Redux 状态管理
├── routes/       # 路由配置
├── sections/     # 页面区块组件
├── theme/        # 主题配置
├── utils/        # 工具函数
└── App.js        # 应用入口
```

## 技术栈

- React
- Redux (状态管理)
- React Router (路由管理)
- Capacitor (跨平台支持)
- ESLint & Prettier (代码规范)
- Docker (容器化部署)

## 开发环境要求

- Node.js >= 14.x
- Yarn 或 npm
- Git

## 安装和运行

1. 克隆项目
```bash
git clone [repository-url]
cd hope-front
```

2. 安装依赖
```bash
yarn install
# 或
npm install
```

3. 启动开发服务器
```bash
yarn start
# 或
npm start
```

## 构建和部署

1. 构建生产版本
```bash
yarn build
# 或
npm run build
```

2. Docker 部署
```bash
docker-compose up -d
```

## 项目配置

- `config-global.js`: 全局配置文件
- `capacitor.config.ts`: Capacitor 跨平台配置
- `.eslintrc`: ESLint 配置
- `.prettierrc`: Prettier 配置

## 开发规范

1. 代码风格
   - 使用 ESLint 和 Prettier 进行代码格式化
   - 遵循 React 最佳实践

2. 提交规范
   - 使用语义化提交信息
   - 遵循 Git Flow 工作流

3. 组件开发
   - 组件文件使用 PascalCase 命名
   - 组件目录结构清晰，包含必要的文档

## 多平台支持

项目支持以下平台：
- Web
- iOS
- Android

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

[许可证类型]

## 联系方式

- 项目维护者：[维护者名称]
- 邮箱：[邮箱地址]