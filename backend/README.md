# 个人网站后端

本服务基于 Java 21、Spring Boot、MyBatis、Flyway 与 MySQL。服务统一使用 /api 前缀，并为个人网站预留 JWT 管理员认证能力。

## 本地启动

1. 准备 MySQL 8 数据库，并创建拥有 personal_website 权限的账号。
2. 复制 .env.example 为 .env，填写数据库密码、JWT 密钥和一次性管理员密码。
3. 将 .env 的变量导入当前终端后执行：

~~~powershell
mvn test
mvn spring-boot:run
~~~

## 已提供接口

| 方法 | 地址 | 说明 |
| --- | --- | --- |
| GET | /api/actuator/health | 服务健康检查 |
| POST | /api/auth/login | 管理员登录 |
| GET | /api/auth/me | 获取当前登录管理员 |
| GET | /api/articles | 已发布文章分页列表，可按 `category`、`tag` 筛选 |
| GET | /api/articles/{slug} | 已发布文章详情 |
| GET | /api/article-taxonomy | 公开分类与标签 |
| GET | /api/sitemap.xml | 已发布文章 sitemap |
| /api/admin/** | 文章、分类、标签与图片管理接口，需要管理员 JWT |

登录请求示例：

~~~json
{
  "username": "admin",
  "password": "你的密码"
}
~~~

认证接口除健康检查与登录外都需要 Authorization: Bearer token 请求头。

## 部署

服务器部署采用 compose.yaml 运行应用容器，使用宿主机的原生 MySQL。部署前请将 .env 放入部署目录，执行 docker compose up -d --build，并通过 Nginx 将 /api 反向代理到 127.0.0.1:8080。

## 本地通过 SSH 隧道连接服务器数据库

在第一个 PowerShell 窗口运行：

~~~powershell
.\scripts\open-db-tunnel.ps1
~~~

保持该窗口打开；然后在第二个 PowerShell 窗口运行：

~~~powershell
.\scripts\start-local-remote-db.ps1
~~~

启动脚本会读取被 Git 忽略的 .env.local，并将服务启动在 http://127.0.0.1:8081。此模式会访问服务器的 personal_website 数据库，请谨慎执行写操作和数据库迁移。

IDEA 直接运行时，Spring Boot 也会自动读取 .env.local；此时只需保持 SSH 隧道脚本运行。

## 文章媒体与 sitemap 部署

文章图片通过管理员接口上传，只接受 JPEG、PNG、WebP，单文件最大 5 MB。容器内路径固定为 `/app/uploads`，请在部署 `.env` 中设置 `APP_MEDIA_HOST_PATH` 为 Nginx 也能读取的绝对宿主机目录，并把该目录纳入备份。例如：

~~~properties
APP_MEDIA_HOST_PATH=/var/lib/personal-website/uploads
APP_SITE_URL=https://example.com
~~~

`deploy/nginx/personal-website-api.conf` 中 `/media/` 的 `alias` 必须指向同一目录；根路径 `/sitemap.xml` 会代理到应用生成的文章 sitemap。
