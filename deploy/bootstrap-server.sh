#!/usr/bin/env bash
# 在 Ubuntu 服务器准备 Next.js standalone、Nginx 与持久化上传目录。
set -Eeuo pipefail

if (( EUID != 0 )); then
  echo "请通过 sudo 运行此脚本。" >&2
  exit 1
fi

if [[ "$#" -ne 1 ]]; then
  echo "用法: $0 <包含 deploy 与 frontend 的项目目录>" >&2
  exit 1
fi

SOURCE_DIR="$(realpath "$1")"
APP_DIR="/opt/personal-website"
UPLOAD_DIR="/var/lib/personal-website/uploads"

if [[ ! -f "$SOURCE_DIR/deploy/compose.yaml" || ! -f "$SOURCE_DIR/frontend/Dockerfile" ]]; then
  echo "项目目录不完整: $SOURCE_DIR" >&2
  exit 1
fi

apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y docker.io docker-compose-v2 nginx curl
systemctl enable --now docker nginx

# runner 使用官方 Node 镜像内 UID 1000；上传目录只授权给该容器用户。
install -d -o 1000 -g 1000 -m 750 "$UPLOAD_DIR"
install -d -m 750 "$APP_DIR"
cp -a "$SOURCE_DIR/." "$APP_DIR/"

if [[ ! -f "$APP_DIR/deploy/.env" ]]; then
  cp "$APP_DIR/deploy/.env.example" "$APP_DIR/deploy/.env"
  chmod 600 "$APP_DIR/deploy/.env"
  echo "已生成 $APP_DIR/deploy/.env，请填写真实配置后再执行迁移和启动。"
fi

install -m 644 "$APP_DIR/deploy/nginx/personal-website.conf" \
  /etc/nginx/sites-available/personal-website
ln -sfn /etc/nginx/sites-available/personal-website \
  /etc/nginx/sites-enabled/personal-website
rm -f /etc/nginx/sites-enabled/default
nginx -t

echo "服务器基础环境已准备。请按 $APP_DIR/deploy/README.md 完成迁移、管理员创建和切换。"

