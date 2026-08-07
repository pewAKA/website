# website frontend

个人网站前端，基于 Next.js App Router、React、TypeScript、Sass、Ant Design、TanStack Query 和 React Three Fiber。

## 开发命令

```bash
pnpm install
pnpm dev
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm start
```

开发地址为 `http://localhost:3000`。Next.js 会把 `/api` 和 `/sitemap.xml` 转发到 Spring Boot。

## 环境变量

复制 `.env.example` 为 `.env.local`：

```properties
SITE_URL=http://localhost:3000
API_ORIGIN=http://127.0.0.1:8081
NEXT_PUBLIC_API_BASE_URL=/api
```

- `SITE_URL`：canonical、robots 等站点绝对地址。
- `API_ORIGIN`：Next.js 服务端和本地代理访问 Spring Boot 的地址。
- `NEXT_PUBLIC_API_BASE_URL`：后台浏览器请求前缀，保持同源 `/api`。

## 生产部署

项目使用 Next.js standalone 输出。生产环境通过 Nginx 把普通页面转发到 3000 端口，`/api`、`/media` 与 `/sitemap.xml` 继续由 Spring Boot 提供。
