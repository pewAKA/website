#!/usr/bin/env bash
#
# 在 Ubuntu 24.04 服务器上初始化本项目。该脚本必须以 root 运行，
# 并从环境变量接收数据库密码、JWT 密钥和一次性管理员密码。
#
set -Eeuo pipefail

if (( EUID != 0 )); then
  echo "请通过 sudo 运行此脚本。" >&2
  exit 1
fi

# 未设置任一敏感变量时立即退出，避免写入不完整的运行配置。
: "$DB_APP_PASSWORD"
: "$APP_JWT_SECRET"
: "$APP_BOOTSTRAP_ADMIN_PASSWORD"

if [[ "$#" -ne 1 ]]; then
  echo "用法: $0 <已上传的后端目录>" >&2
  exit 1
fi

SOURCE_DIR="$1"
APP_DIR="/opt/personal-website-api"
TIMESTAMP="$(date +%Y%m%d%H%M%S)"

wait_for_health() {
  for attempt in $(seq 1 30); do
    if curl --fail --silent http://127.0.0.1/api/actuator/health >/dev/null; then
      return 0
    fi
    sleep 2
  done
  curl --fail --silent --show-error http://127.0.0.1/api/actuator/health >/dev/null
}

if [[ ! -f "$SOURCE_DIR/compose.yaml" || ! -f "$SOURCE_DIR/.env.example" ]]; then
  echo "后端目录不完整: $SOURCE_DIR" >&2
  exit 1
fi

if ss -lnt | awk '{print $4}' | grep -Eq '(^|:|\])80$' \
  && ! systemctl is-active --quiet nginx; then
  echo "端口 80 已被非 Nginx 服务占用，停止部署以避免覆盖现有站点。" >&2
  exit 1
fi

# 仅在不存在远程 MySQL 账号时收紧监听地址，避免无意中中断其他服务。
REMOTE_MYSQL_ACCOUNTS="$(
  mysql -NBe "SELECT CONCAT(user, CHAR(64), host) FROM mysql.user
  WHERE host NOT IN (
    CHAR(37),
    CHAR(108,111,99,97,108,104,111,115,116),
    CHAR(49,50,55,46,48,46,48,46,49),
    CONCAT(CHAR(58),CHAR(58),CHAR(49))
  );"
)"
if [[ -n "$REMOTE_MYSQL_ACCOUNTS" ]]; then
  echo "检测到非本机 MySQL 账号，未修改数据库监听配置：" >&2
  echo "$REMOTE_MYSQL_ACCOUNTS" >&2
  exit 1
fi

for config in /etc/mysql/mysql.conf.d/mysqld.cnf /etc/mysql/mysql.conf.d/mysql.cnf; do
  if [[ -f "$config" ]]; then
    cp -a "$config" "$config.backup.$TIMESTAMP"
    sed -i -E 's/^[[:space:]]*bind-address[[:space:]]*=.*/bind-address = 127.0.0.1/' "$config"
  fi
done
systemctl restart mysql

if ss -lnt | awk '{print $4}' | grep -Eq '(^|:)0\.0\.0\.0:3306$|^\[::\]:3306$'; then
  echo "MySQL 仍在公网地址监听 3306，停止部署。" >&2
  exit 1
fi

# 安装容器运行时与反向代理；应用容器仍使用宿主机已有的 MySQL。
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y docker.io docker-compose-v2 nginx curl
systemctl enable --now docker nginx

# 腾讯云网络通过本地镜像加速器拉取 Docker Hub 镜像，避免构建时连接超时。
install -d -m 755 /etc/docker
cat > /etc/docker/daemon.json <<'JSON'
{
  "registry-mirrors": ["https://mirror.ccs.tencentyun.com"]
}
JSON
systemctl daemon-reload
systemctl restart docker

if command -v ufw >/dev/null 2>&1 && ufw status | grep -q "Status: active"; then
  ufw allow 80/tcp
fi

# 密码会被 SQL 单引号转义，且不会出现在命令行参数或日志中。
DB_PASSWORD_SQL="$(printf '%s' "$DB_APP_PASSWORD" | sed "s/'/''/g")"
mysql <<SQL
CREATE DATABASE IF NOT EXISTS personal_website
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER IF NOT EXISTS 'website_app'@'localhost' IDENTIFIED BY '$DB_PASSWORD_SQL';
CREATE USER IF NOT EXISTS 'website_app'@'127.0.0.1' IDENTIFIED BY '$DB_PASSWORD_SQL';
ALTER USER 'website_app'@'localhost' IDENTIFIED BY '$DB_PASSWORD_SQL';
ALTER USER 'website_app'@'127.0.0.1' IDENTIFIED BY '$DB_PASSWORD_SQL';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP
  ON personal_website.* TO 'website_app'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP
  ON personal_website.* TO 'website_app'@'127.0.0.1';
FLUSH PRIVILEGES;
SQL

# 仅将运行目录保留给 root，防止数据库密码和 JWT 密钥被普通用户读取。
install -d -m 750 "$APP_DIR"
cp -a "$SOURCE_DIR/." "$APP_DIR/"
cat > "$APP_DIR/.env" <<ENV
DB_URL=jdbc:mysql://127.0.0.1:3306/personal_website?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
DB_USERNAME=website_app
DB_PASSWORD=$DB_APP_PASSWORD
APP_JWT_SECRET=$APP_JWT_SECRET
APP_BOOTSTRAP_ADMIN_USERNAME=admin
APP_BOOTSTRAP_ADMIN_PASSWORD=$APP_BOOTSTRAP_ADMIN_PASSWORD
APP_CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
SERVER_ADDRESS=127.0.0.1
SERVER_PORT=8080
ENV
chmod 600 "$APP_DIR/.env"

install -m 644 "$APP_DIR/deploy/nginx/personal-website-api.conf" \
  /etc/nginx/sites-available/personal-website-api
rm -f /etc/nginx/sites-enabled/default
ln -sfn /etc/nginx/sites-available/personal-website-api \
  /etc/nginx/sites-enabled/personal-website-api
nginx -t
systemctl reload nginx

docker compose -f "$APP_DIR/compose.yaml" up -d --build

# 等待应用完成 Flyway 迁移与管理员引导，再执行认证回归检查。
wait_for_health

LOGIN_RESPONSE="$(
  curl --fail --silent --show-error \
    --header "Content-Type: application/json" \
    --data "{\"username\":\"admin\",\"password\":\"$APP_BOOTSTRAP_ADMIN_PASSWORD\"}" \
    http://127.0.0.1/api/auth/login
)"
TOKEN="$(printf '%s' "$LOGIN_RESPONSE" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')"
if [[ -z "$TOKEN" ]]; then
  echo "管理员登录验证失败。" >&2
  exit 1
fi
curl --fail --silent --show-error \
  --header "Authorization: Bearer $TOKEN" \
  http://127.0.0.1/api/auth/me >/dev/null

# 管理员已创建后移除一次性明文密码，再重建容器使其不再保留在环境中。
sed -i '/^APP_BOOTSTRAP_ADMIN_PASSWORD=/d' "$APP_DIR/.env"
docker compose -f "$APP_DIR/compose.yaml" up -d
wait_for_health

echo "部署完成：健康检查、管理员登录和受保护接口均已验证。"
