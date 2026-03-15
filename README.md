# Monorepo 项目说明

本仓库是一个多项目（Monorepo）结构，包含：

- 一个 Next.js 前端应用：[`Course-Agent/creative`](Course-Agent/creative/)
- 一个 Django 后端应用：[`mywebsite`](mywebsite/)

---

## 目录结构概览

- [`apps/`](apps/)
  - `api/`：后端 API（待根据实际补充说明）
  - `web/`：Web 前端（待根据实际补充说明）
- [`Course-Agent/creative/`](Course-Agent/creative/)
  - Next.js + TypeScript + Tailwind CSS 前端工程
  - 使用 `pnpm` 管理依赖
- [`mywebsite/`](mywebsite/)
  - Django Web 项目，使用 MariaDB 作为默认数据库（可通过环境变量切回 SQLite）
- [`infra/`](infra/)
  - `docker/`：容器相关配置
  - `github/`：GitHub Actions 等 CI/CD 配置
  - `k8s/`：Kubernetes 部署配置
  - `openapi/`：OpenAPI 规范文件
  - `scripts/`：自动化脚本
- 根目录文件
  - [`package.json`](package.json)、[`pnpm-lock.yaml`](pnpm-lock.yaml)：用于管理前端相关依赖或脚本
  - [`README.md`](README.md)：项目说明（当前文件）

---

## 环境要求

启动整个仓库中各项目，建议安装以下环境：

- Node.js（推荐 LTS 版本，例如 18+）
- `pnpm`（用于管理 `Course-Agent/creative` 依赖）
- Python 3.9+（具体版本以 [`mywebsite/requirements.txt`](mywebsite/requirements.txt) 为准）
- `pip` 或 `pipenv` / `poetry` 等 Python 包管理工具
- （可选）Docker 与 Docker Compose，用于容器化部署

---

## 1. `Course-Agent/creative` 前端应用

### 1.1 项目说明

[`Course-Agent/creative`](Course-Agent/creative/) 是一个使用 **Next.js 13+ App Router** 的前端应用，主要特征：

- 使用 `app/` 目录进行路由和页面组织：[`Course-Agent/creative/app/`](Course-Agent/creative/app/)
- 使用 Tailwind CSS 进行样式开发：
  - [`Course-Agent/creative/tailwind.config.ts`](Course-Agent/creative/tailwind.config.ts)
  - [`Course-Agent/creative/postcss.config.mjs`](Course-Agent/creative/postcss.config.mjs)
- 使用 TypeScript：
  - [`Course-Agent/creative/tsconfig.json`](Course-Agent/creative/tsconfig.json)
- 组件与业务逻辑组织：
  - [`Course-Agent/creative/components/`](Course-Agent/creative/components/)：通用 UI 组件
  - [`Course-Agent/creative/hooks/`](Course-Agent/creative/hooks/)：自定义 React Hooks
  - [`Course-Agent/creative/lib/`](Course-Agent/creative/lib/)：工具函数、服务封装
  - [`Course-Agent/creative/data/`](Course-Agent/creative/data/)：静态数据或配置

### 1.2 安装依赖

```bash
cd Course-Agent/creative
pnpm install（如果不行可以使用npm）
```

### 1.3 环境变量

本地开发使用 [`Course-Agent/creative/.env.local`](Course-Agent/creative/.env.local) 存放环境变量，例如 API 地址、第三方服务密钥等。示例（请根据实际项目补充）：

```bash
# Course-Agent/creative/.env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

### 1.4 启动开发服务器

```bash
cd Course-Agent/creative
pnpm dev
```

默认情况下，Next.js 开发服务器会在 $http://localhost:3000$ 启动。

### 1.5 生产构建与运行

```bash
cd Course-Agent/creative
pnpm build
pnpm start
```

---

## 2. `mywebsite` 后端应用（Django）

### 2.1 项目说明

[`mywebsite`](mywebsite/) 是一个 Django Web 应用，包含：

- 管理脚本：[`mywebsite/manage.py`](mywebsite/manage.py)
- 主项目配置包：[`mywebsite/mywebsite/`](mywebsite/mywebsite/)
- 核心业务 app：[`mywebsite/core/`](mywebsite/core/)
- 模板目录：[`mywebsite/templates/`](mywebsite/templates/)
- 文件上传目录：[`mywebsite/upload/`](mywebsite/upload/)
- 数据备份目录：[`mywebsite/backups/`](mywebsite/backups/)
- 额外资源：[`mywebsite/resources/`](mywebsite/resources/)
- 默认数据库：[`mywebsite/db.sqlite3`](mywebsite/db.sqlite3)
  - `db.sqlite3` 可作为历史数据来源，用于迁移到 MariaDB

### 2.2 创建虚拟环境并安装依赖

在根目录或 `mywebsite` 目录下执行：

```bash
cd mywebsite

# 创建虚拟环境（示例使用 venv）
python -m venv .venv
source .venv/bin/activate  # Windows 使用: .venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
```

### 2.3 配置 MariaDB（默认）

后端默认连接 MariaDB，请先在数据库中创建库（推荐 UTF8MB4）：

```sql
CREATE DATABASE course_agent_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

然后在环境变量中配置连接信息（Windows PowerShell 示例）：

```powershell
cd mywebsite
$env:DB_NAME="course_agent_db"
$env:DB_USER="course_agent"
$env:DB_PASSWORD="course_agent_123"
$env:DB_HOST="127.0.0.1"
$env:DB_PORT="3306"
```

如果出现错误 `Authentication plugin 'auth_gssapi_client' not configured`，请不要使用 root 直连，改为创建专用账号（MariaDB 控制台执行）：

```sql
CREATE USER IF NOT EXISTS 'course_agent'@'127.0.0.1' IDENTIFIED BY 'course_agent_123';
GRANT ALL PRIVILEGES ON course_agent_db.* TO 'course_agent'@'127.0.0.1';
FLUSH PRIVILEGES;
```

若你必须继续使用 root，则可改 root 认证插件后再连接（执行前请确认数据库版本与安全策略）：

```sql
ALTER USER 'root'@'localhost' IDENTIFIED VIA mysql_native_password USING PASSWORD('123456');
FLUSH PRIVILEGES;
```

安装依赖并执行迁移：

```bash
cd mywebsite
pip install -r requirements.txt
python manage.py migrate
```

如果你要临时切回 SQLite（例如本地快速调试）：

```powershell
$env:USE_SQLITE="1"
python manage.py migrate
```

### 2.4 旧 SQLite 数据迁移到 MariaDB（推荐）

如果历史数据在 [`mywebsite/db.sqlite3`](mywebsite/db.sqlite3)，可用 Django 原生 `dumpdata/loaddata` 迁移：

1. 使用 SQLite 导出数据

```powershell
cd mywebsite
$env:USE_SQLITE="1"
python manage.py dumpdata --exclude contenttypes --exclude auth.permission --indent 2 > data_migration.json
```

2. 切换回 MariaDB 并完成表迁移

```powershell
Remove-Item Env:USE_SQLITE
python manage.py migrate
```

3. 导入数据到 MariaDB

```powershell
python manage.py loaddata data_migration.json
```

说明：排除 `contenttypes` 与 `auth.permission` 可避免多数跨数据库导入冲突。

### 2.5 创建管理员账号（可选）

```bash
cd mywebsite
python manage.py createsuperuser
```

### 2.6 启动开发服务器

```bash
cd mywebsite
python manage.py runserver
```

默认情况下，Django 开发服务器会在 $http://localhost:8000$ 启动。

### 2.7 运行测试脚本

项目提供了一个测试脚本 [`mywebsite/test_coze_script.py`](mywebsite/test_coze_script.py)，可用于验证部分功能（具体用途请参考脚本实现）：

```bash
cd mywebsite
python test_coze_script.py
```

---

## 3. 常见开发流程

### 3.1 同时启动前后端

1. 启动 Django 后端（端口 8000）：

   ```bash
   cd mywebsite
   python manage.py runserver
   ```

2. 启动 Next.js 前端（端口 3000）：

   ```bash
   cd Course-Agent/creative
   pnpm dev（如果不行可使用npm）
   ```

3. 在前端 `.env.local` 中配置后端 API 地址，例如：

   ```bash
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
   ```


---

## 4. 局域网部署指南（本地服务器）

目标：将网站部署到一台局域网服务器，并让同一局域网内的主机都可以访问。

### 4.1 服务器准备

1. 给服务器设置固定内网 IP（示例：`192.168.81.100`）。
2. 确认其他主机可 ping 通该 IP。
3. 放行 Windows 防火墙端口（管理员 PowerShell）：

```powershell
New-NetFirewallRule -DisplayName "Django-8000" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow
New-NetFirewallRule -DisplayName "Next-3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

### 4.2 Django 后端生产方式运行（推荐 Waitress）

1. 在服务器上设置数据库连接环境变量：

```powershell
cd mywebsite
$env:DB_NAME="course_agent_db"
$env:DB_USER="course_agent"
$env:DB_PASSWORD="course_agent_123"
$env:DB_HOST="127.0.0.1"
$env:DB_PORT="3306"
```

2. 确认 `mywebsite/mywebsite/settings.py` 中 `ALLOWED_HOSTS` 包含：
  - 服务器内网 IP（如 `192.168.81.100`）
  - `localhost`
  - `127.0.0.1`

3. 安装依赖并执行迁移与静态文件收集：

```powershell
cd mywebsite
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
```

4. 使用 Waitress 启动（不要用开发服务器 runserver）：

```powershell
cd mywebsite
waitress-serve --listen=0.0.0.0:8000 mywebsite.wsgi:application
```

5. 局域网访问地址：
  - `http://192.168.81.100:8000`（将 IP 换成你的服务器内网地址）

### 4.3 Next.js 前端局域网访问（可选）

如果你需要把新版前端也暴露在局域网：

```powershell
cd Course-Agent/creative
pnpm install
pnpm build
pnpm start -H 0.0.0.0 -p 3000
```

然后确保前端环境变量使用服务器 IP，而不是 localhost：

```bash
NEXT_PUBLIC_BACKEND_URL=http://192.168.81.100:8000
```

局域网访问地址：
- `http://192.168.81.100:3000`

### 4.4 跨域与登录态注意事项

1. `CORS_ALLOWED_ORIGINS` 需要包含前端实际访问地址，例如：
  - `http://192.168.81.100:3000`
2. 前后端不要混用 `localhost`、`127.0.0.1` 和局域网 IP。
3. 同一环境中尽量固定使用一个主机名/IP，避免 session cookie 不一致。

### 4.5 开机自启（推荐）

可以使用 Windows 任务计划程序或 NSSM，将以下进程设为开机启动：

1. Waitress（Django，端口 8000）
2. Next.js（如果启用，端口 3000）

---

## 5. 代码规范与贡献

- 前端（`Course-Agent/creative`）：
  - 使用 TypeScript
  - 推荐使用 ESLint + Prettier（请根据 [`Course-Agent/creative/package.json`](Course-Agent/creative/package.json) 中的脚本执行）
- 后端（`mywebsite`）：
  - 遵循 PEP8 规范
  - 推荐使用 `pytest` 或 Django 自带测试框架

欢迎通过 PR、Issue 的方式参与贡献。
