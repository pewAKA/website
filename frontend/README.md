# website frontend

个人网站全栈应用，基于 Next.js App Router、React、TypeScript、Drizzle ORM、Better Auth、Fumadocs、Sass、Ant Design、TanStack Query 和 React Three Fiber。

## 开发命令

```bash
npm install
npm run dev
npm test
npm run test:integration
npm run typecheck
npm run lint
npm run build
npm start
```

开发地址为 `http://localhost:3000`。页面、后台 API、鉴权、健康检查和 sitemap 全部由 Next.js 提供；MySQL 与上传目录仍是外部持久化资源。

Windows 开发环境下，`npm run dev` 会读取 `.env.local` 的 `DB_TUNNEL_*` 配置，自动复用或后台创建 SSH 数据库隧道，再启动 Next.js；退出时仅关闭本次命令创建的隧道。无需数据库隧道时，可设置 `DB_TUNNEL_ENABLED=false`，或直接运行 `npm run dev:next`。

## 环境变量

复制 `.env.example` 为 `.env.local`：

```properties
SITE_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=请替换为至少32位的随机密钥
DATABASE_URL=mysql://website:password@127.0.0.1:3306/personal_website
MEDIA_ROOT=./uploads
MEDIA_PUBLIC_PATH=/media
TZ=Asia/Shanghai
```

- `SITE_URL` / `BETTER_AUTH_URL`：站点和鉴权回调的绝对地址。
- `BETTER_AUTH_SECRET`：至少 32 位随机密钥，禁止提交到仓库。
- `DATABASE_URL`：现有 MySQL 连接；业务表只做映射，首次切换不会重建。
- `MEDIA_ROOT` / `MEDIA_PUBLIC_PATH`：上传文件磁盘目录和公开 URL 前缀。
- `TZ`：统一使用 `Asia/Shanghai`。

## 数据库与管理员

- `npm run db:baseline`：只在数据库副本上反向生成既有业务表基线，用于人工审计。
- `npm run db:migrate`：执行仓库内经过审查的迁移 SQL；生产环境禁止 `drizzle-kit push`。
- `npm run docs:import-mock`：把仓库中的 6 篇示例文档幂等导入 MySQL；重复执行只更新带 `mock:*` 来源标记的记录，不覆盖同 slug 的人工文章。
- `npm run auth:create-admin -- --email ... --name ... --role admin --data '{"username":"admin"}'`：交互式创建新管理员。

公开首页文章预览、Fumadocs 门户、分类、标签、全文搜索和 sitemap 都读取 MySQL 中状态为 `PUBLISHED` 的文章。文档导入前先执行迁移；本地数据库位于远端时，请保持 `npm run dev` 创建的 SSH 隧道处于运行状态。

## 生产部署

项目使用 Next.js standalone 输出。除 `/media/` 由 Nginx 直接读取持久化目录外，所有请求均转发到 3000 端口。完整切换与回滚步骤见仓库根目录 `deploy/README.md`。
