# Next.js 全栈部署

该目录是新版唯一部署入口。`backend/deploy` 在 7 天观察期结束前仅作为 Spring Boot 回滚资料保留。

## 首次切换

1. 备份 MySQL 和 `/var/lib/personal-website/uploads`。
2. 将 `.env.example` 复制为 `.env`，填写真实域名、数据库账号和随机密钥。
3. 在开发机上针对数据库副本执行一次业务表反向基线，并人工对照现有表结构：

   ```bash
   cd frontend
   DATABASE_URL='mysql://.../personal_website_copy' npm run db:baseline
   ```

   `db:baseline` 的结果会写入 `frontend/drizzle/baseline`，只用于审计既有业务表，不作为生产迁移执行。生产环境禁止使用 `drizzle-kit push`。

4. 执行已审查的 Auth 表迁移：

   ```bash
   docker compose --profile tools run --rm tools npm run db:migrate
   ```

5. 交互式创建新管理员；密码不会写入环境变量：

   ```bash
   docker compose --profile tools run --rm tools npm run auth:create-admin -- --email admin@example.com --name Admin --role admin --data '{"username":"admin"}'
   ```

6. 启动并检查：

   ```bash
   docker compose up -d --build frontend
   curl --fail http://127.0.0.1:3000/api/health
   ```

7. 将 `nginx/personal-website.conf` 启用并重载 Nginx。确认登录、CRUD、上传与 sitemap 后，再停止 Spring 容器；其 8080 端口在观察期内不对公网开放。

## MySQL 集成测试

开发机安装 Docker 后可启动一次性 MySQL 8.4 测试库：

```bash
docker compose -f deploy/compose.test.yaml up -d --wait
cd frontend
TEST_DATABASE_URL='mysql://website_test:website_test_password@127.0.0.1:3308/personal_website_test' npm run test:integration
docker compose -f ../deploy/compose.test.yaml down
```

测试代码拒绝连接数据库名不以 `_test` 结尾的地址。

## 回滚

恢复旧 Nginx 站点配置并启动 Spring 容器即可。新增的 `auth_*` 表不会修改 `sys_user` 或现有文章数据。稳定观察至少 7 天后，才删除 `backend/`、Java Dockerfile、Maven/Flyway 和旧部署文档。
