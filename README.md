<br />
<div align="center">

  <img src="database/e7492461651df697fb9ed118b7bf72c9.png" alt="Lboke Logo" width="128" height="128">

  <h1 align="center" style="margin-top: 0.2em;">Lboke</h1>

  [![Vue][vue-badge]][vue-url]
  [![TypeScript][typescript-badge]][typescript-url]
  [![Node.js][nodejs-badge]][nodejs-url]
  [![MySQL][mysql-badge]][mysql-url]
  [![Express][express-badge]][express-url]

  <p align="center">
    <h3>简洁优雅的个人博客系统，让每个人都能轻松拥有自己的博客</h3>
    <br />
    <a href="https://github.com/lijiajun20130726-ux/Lboke"><strong>访问 GitHub &raquo;</strong></a>
    <br />
    <br />
    <a href="https://github.com/lijiajun20130726-ux/Lboke/issues">报告 Bug</a>
    &middot;
    <a href="https://github.com/lijiajun20130726-ux/Lboke/issues">功能建议</a>
  </p>
</div>

<br />

<details>
<summary>目录</summary>

- [功能特性](#功能特性)
- [为什么会有这个项目](#为什么会有这个项目)
- [快速上手](#快速上手)
- [项目结构](#项目结构)
- [技术栈](#技术栈)
- [架构设计](#架构设计)
- [常见问题](#常见问题)
- [贡献指南](#贡献指南)
- [开源许可](#开源许可)

</details>

## 功能特性

- **前后台分离** - Vue 3 前端 + Express 后端 API，分层架构清晰
- **Markdown 编辑** - 支持 Markdown 编写文章，配合实时预览
- **评论系统** - 支持游客评论和回复，管理员可审核管理
- **邮件订阅** - 用户可订阅博客更新，新文章发布时自动通知
- **友链管理** - 开放的友链申请系统，自助提交审核
- **数据统计** - 管理员后台实时查看网站数据
- **响应式设计** - 适配各种设备屏幕
- **JWT 认证** - 安全可靠的用户认证系统

## 为什么会有这个项目

开发 Lboke 的初心很简单：做一个简洁优雅的个人博客系统，让每个人都能轻松拥有自己的博客。

- **降低门槛** - 将复杂的配置转化为简单的桌面交互
- **开箱即用** - 数据库、API、前端一站式部署
- **持续更新** - 功能不断完善，体验持续优化

## 快速上手

### 环境要求

- Node.js >= 16
- MySQL >= 8.0
- npm 或 yarn

### Step 1：克隆项目

```bash
git clone https://github.com/lijiajun20130726-ux/Lboke.git
cd Lboke
```

### Step 2：创建数据库

```bash
mysql -u root -p
CREATE DATABASE boke1 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT
mysql -u root -p boke1 < database/init.sql
```

### Step 3：安装依赖

```bash
# 安装后端依赖
cd houduan
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### Step 4：配置环境

创建 `houduan/.env` 文件：

```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=boke1
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

### Step 5：启动服务

```bash
# 终端1 - 启动后端 (端口 3000)
cd houduan
npm run dev

# 终端2 - 启动前端 (端口 5173)
cd frontend
npm run dev
```

> 打开浏览器访问 http://localhost:5173 即可看到博客首页，管理后台：http://localhost:5173/admin

## 项目结构

```
Lboke/
├── frontend/                    # 前端项目 (Vue 3)
│   ├── src/
│   │   ├── api/               # API 接口
│   │   ├── components/        # 公共组件
│   │   ├── router/            # 路由配置
│   │   ├── stores/            # 状态管理 (Pinia)
│   │   └── views/             # 页面视图
│   │       ├── admin/         # 管理后台
│   │       └── front/         # 博客前台
│   └── public/                # 静态资源
├── houduan/                    # 后端项目 (Express)
│   ├── config/                # 配置文件
│   ├── database/              # 数据库脚本
│   ├── middleware/            # 中间件
│   ├── routes/                # 路由模块
│   └── utils/                 # 工具函数
└── database/                  # 数据库初始化
    └── init.sql
```

## 技术栈

| 层 | 技术 |
|---|---|
| 前端框架 | Vue 3 + Composition API |
| 前端语言 | TypeScript |
| 前端构建 | Vite |
| 状态管理 | Pinia |
| 后端框架 | Express |
| 后端语言 | Node.js |
| 数据库 | MySQL |
| 认证 | JWT |

## 架构设计

```
+-------------------------------------------------------------+
|                          Lboke                               |
|                                                              |
|   +--------------------+         +----------------------+    |
|   |   Browser          |         |   Server             |    |
|   |   (Vue 3)          |  HTTP   |   (Express)          |    |
|   |                    |<------->|                      |    |
|   |  +-------------+  |  JSON   |  +----------------+  |    |
|   |  | Vue Router  |  |         |  | RESTful API     |  |    |
|   |  | Pinia       |  |         |  | JWT Auth        |  |    |
|   |  | Components  |  |         |  | Routes          |  |    |
|   |  +-------------+  |         |  +----+--------+---+  |    |
|   |                   |         |          |              |    |
|   +--------------------+         |  +------v----------+  |    |
|                                  |  |   MySQL DB       |  |    |
|                                  |  +------------------+  |    |
|                                  +----------------------+    |
+-------------------------------------------------------------+
```

## 常见问题

**Q: 如何修改网站名称和描述？**
A: 登录管理后台 > 网站设置，即可修改。

**Q: 如何备份数据库？**
A: 使用 mysqldump 命令：
```bash
mysqldump -u root -p boke1 > backup.sql
```

**Q: 如何部署到服务器？**
A: 生产环境部署建议：
- 使用 PM2 管理后端进程
- 前端执行 `npm run build` 构建静态文件
- 使用 Nginx 反向代理
- 配置 HTTPS（推荐 Let's Encrypt）

## 贡献指南

欢迎提交 Pull Request 或创建 Issue！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 开源许可

本项目采用 MIT License 开源。

---

**Lboke © 2024-2026 由 [Justin的科幻宇宙](https://github.com/lijiajun20130726-ux) 构建**

<!-- Badge Links -->
[vue-badge]: https://img.shields.io/badge/Vue_3-4FC08D?style=flat-square&logo=vue.js&logoColor=white
[vue-url]: https://vuejs.org/
[typescript-badge]: https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white
[typescript-url]: https://www.typescriptlang.org/
[nodejs-badge]: https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white
[nodejs-url]: https://nodejs.org/
[mysql-badge]: https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white
[mysql-url]: https://www.mysql.com/
[express-badge]: https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white
[express-url]: https://expressjs.com/
