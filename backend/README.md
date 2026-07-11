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
