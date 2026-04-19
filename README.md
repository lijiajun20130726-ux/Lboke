# Lboke - 全栈博客系统

简洁优雅的个人博客系统，基于 Vue 3 + Express + MySQL 构建。

## 功能特点

- :art: **前后台分离** - Vue 3 前端 + Express 后端 API
- 📝 **文章管理** - 支持 Markdown 编写、分类、标签管理
- 💬 **评论系统** - 支持游客评论和回复
- 📧 **邮件订阅** - 用户订阅博客更新
- 🔗 **友链管理** - 开放的友链申请系统
- 📊 **数据统计** - 管理员后台查看网站数据
- 📱 **响应式设计** - 适配各种设备屏幕

## 技术栈

### 前端
- Vue 3 + Composition API
- TypeScript
- Vite
- Vue Router
- Pinia
- Axios
- md-editor-v3 (Markdown 编辑器)

### 后端
- Node.js + Express
- MySQL
- JWT 认证
- Nodemailer (邮件服务)

## 项目结构

```
e:\博客
├── frontend/          # 前端项目
│   ├── src/
│   │   ├── api/      # API 接口
│   │   ├── components/  # 公共组件
│   │   ├── router/   # 路由配置
│   │   ├── stores/    # 状态管理
│   │   └── views/     # 页面视图
│   └── public/        # 静态资源
├── houduan/           # 后端项目
│   ├── config/        # 配置文件
│   ├── database/      # 数据库脚本
│   ├── middleware/     # 中间件
│   ├── routes/        # 路由模块
│   └── utils/         # 工具函数
└── database/         # 数据库初始化
```

## 快速开始

### 环境要求

- Node.js >= 16
- MySQL >= 8.0

### 1. 克隆项目

```bash
git clone https://github.com/lijiajun20130726-ux/Lboke.git
cd Lboke
```

### 2. 配置数据库

创建 MySQL 数据库并导入初始化脚本：

```bash
mysql -u root -p < database/init.sql
```

修改 `houduan/.env` 配置文件：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=boke1
```

### 3. 安装依赖

```bash
# 安装后端依赖
cd houduan
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 4. 启动服务

```bash
# 启动后端 (端口 3000)
cd houduan
npm run dev

# 启动前端 (端口 5173)
cd frontend
npm run dev
```

访问 http://localhost:5173

## 管理后台

访问 http://localhost:5173/admin

默认管理员账号：`admin` / `password` (请及时修改密码)

## API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/front/articles` | GET | 获取文章列表 |
| `/api/front/articles/:id` | GET | 获取文章详情 |
| `/api/user/login` | POST | 用户登录 |
| `/api/user/register` | POST | 用户注册 |
| `/api/admin/articles` | GET | 管理文章列表 |
| `/api/admin/articles` | POST | 创建文章 |

## 许可证

MIT License

## 作者

[lijiajun20130726-ux](https://github.com/lijiajun20130726-ux)
