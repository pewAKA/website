# website frontend

个人网站全栈应用，基于 Next.js App Router、React、TypeScript、Drizzle ORM、Better Auth、Fumadocs、Sass、Ant Design、TanStack Query 和 React Three Fiber。

## 开发命令

```bash
pnpm install
pnpm dev
pnpm test
pnpm test:integration
pnpm typecheck
pnpm lint
pnpm build
pnpm start
```

开发地址为 `http://localhost:3000`。页面、后台 API、鉴权、健康检查和 sitemap 全部由 Next.js 提供；MySQL 与上传目录仍是外部持久化资源。

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

- `pnpm db:baseline`：只在数据库副本上反向生成既有业务表基线，用于人工审计。
- `pnpm db:migrate`：执行仓库内经过审查的迁移 SQL；生产环境禁止 `drizzle-kit push`。
- `pnpm auth:create-admin --email ... --name ... --role admin --data '{"username":"admin"}'`：交互式创建新管理员。

## 生产部署

项目使用 Next.js standalone 输出。除 `/media/` 由 Nginx 直接读取持久化目录外，所有请求均转发到 3000 端口。完整切换与回滚步骤见仓库根目录 `deploy/README.md`。
