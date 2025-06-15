# Book Delivery Backend Express项目文档

## 一、项目概述

本项目是一个基于 `Node.js` 和 `Express` 框架构建的文件管理系统，支持用户上传、浏览、审核和管理文件。系统提供了用户认证、文件分类、标签管理、审核记录等功能，同时具备权限控制，确保不同角色的用户（普通用户、志愿者、管理员）拥有不同的操作权限。

***

## 二、项目结构

```
book_delivery_backend_express
├─app.js
├─package-lock.json
├─package.json
├─README.md
├─server.js
├─utils
|   ├─jwtHandlers.js
|   ├─routeLoader.js
|   ├─swagger
|   |    └index.js
├─routes
|   ├─auditRoutes.js
|   ├─authRoutes.js
|   ├─categoryRoutes.js
|   ├─fileRoutes.js
|   ├─statsRoutes.js
|   ├─tagRoutes.js
|   └userRoutes.js
├─public
|   ├─uploads
|   |    ├─files
|   |    ├─covers
|   ├─static
├─models
|   ├─auditRecord.js
|   ├─category.js
|   ├─file.js
|   ├─tag.js
|   └user.js
├─middleware
|     ├─auth.js
|     ├─errorHandler.js
|     └setupMiddlewares.js
├─databases
|     ├─auditDB.js
|     ├─authDB.js
|     ├─categoryDB.js
|     ├─db.js
|     ├─fileDB.js
|     ├─tagDB.js
|     └userDB.js
├─controllers
|      ├─auditController.js
|      ├─authController.js
|      ├─categoryController.js
|      ├─fileController.js
|      ├─statsController.js
|      ├─tagController.js
|      └userController.js
├─config
|   └constants.js
```

***

## 三、环境要求

### 必要开发工具

* **Node.js (v14.x 及以上)**：Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行环境，使 JavaScript 可以在服务器端运行。

* **npm (通常随 Node.js 一起安装)**：npm 是 Node.js 的包管理工具，用于安装和管理项目依赖。

* **MySQL (v8.x 及以上)**：MySQL 是一个开源的关系型数据库管理系统，用于存储项目的数据。

### 安装必要开发工具的方法与教程

#### 安装 Node.js 和 npm

* **Windows 系统**

  1. 访问 [Node.js 官方下载页面](https://nodejs.org/en/download/)。

  2. 下载适合你系统的安装包（Windows Installer (.msi)）。

  3. 运行下载的安装包，按照安装向导的提示完成安装。安装过程中可以选择默认选项。

  4. 安装完成后，打开命令提示符（CMD）或 PowerShell，输入以下命令验证安装是否成功：

     ```bash
     node -v
     npm -v
     ```

     如果成功显示版本号，则说明安装成功。

* **macOS 系统**

  * **使用 Homebrew 安装**

    1. 确保你已经安装了 Homebrew。如果没有安装，可以在终端中运行以下命令进行安装：

       ```bash
       /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
       ```

    2. 安装 Node.js：

       ```bash
       brew install node
       ```

    3. 安装完成后，在终端中输入以下命令验证安装是否成功：

       ```bash
       node -v
       npm -v
       ```

- **使用官方安装包**

  1. 访问 [Node.js 官方下载页面](https://nodejs.org/en/download/)。

  2. 下载适合你系统的安装包（macOS Installer (.pkg)）。

  3. 运行下载的安装包，按照安装向导的提示完成安装。

  4. 安装完成后，在终端中输入以下命令验证安装是否成功：

     ```bash
     node -v
     npm -v
     ```

* **Linux 系统（以 Ubuntu 为例）**

  1. 打开终端，运行以下命令更新包列表：

     ```bash
     sudo apt update
     ```

  2. 安装 Node.js 和 npm：

     ```bash
     sudo apt install nodejs npm
     ```

  3. 安装完成后，输入以下命令验证安装是否成功：

     ```bash
     node -v
     npm -v
     ```

#### 安装 MySQL

* **Windows 系统**

  1. 访问 [MySQL 官方下载页面](https://dev.mysql.com/downloads/installer/)。

  2. 下载适合你系统的 MySQL Installer。

  3. 运行下载的安装程序，按照安装向导的提示完成安装。在安装过程中，你可以选择安装 MySQL Server、MySQL Workbench 等组件，并设置 root 用户的密码。

  4. 安装完成后，将 MySQL 的 bin 目录添加到系统环境变量中，以便在命令提示符中可以直接使用 MySQL 命令。

* **macOS 系统**

  * **使用 Homebrew 安装**

    1. 确保你已经安装了 Homebrew。

    2. 安装 MySQL：

       ```bash
       brew install mysql
       ```

    3. 启动 MySQL 服务：

       ```bash
       brew services start mysql
       ```

    4. 设置 root 用户的密码：

       ```bash
       mysql_secure_installation
       ```

* **使用官方安装包**

  1. 访问 [MySQL 官方下载页面](https://dev.mysql.com/downloads/mysql/)。

  2. 下载适合你系统的 MySQL 安装包。

  3. 运行下载的安装包，按照安装向导的提示完成安装。在安装过程中，设置 root 用户的密码。

  4. 安装完成后，启动 MySQL 服务。

* **Linux 系统（以 Ubuntu 为例）**

  1. 打开终端，运行以下命令更新包列表：

     ```bash
     sudo apt update
     ```

  2. 安装 MySQL Server：

     ```bash
     sudo apt install mysql-server
     ```

  3. 安装完成后，运行以下命令进行安全设置：

     ```bash
     sudo mysql_secure_installation
     ```

  4. 启动 MySQL 服务：

     ```bash
     sudo systemctl start mysql
     ```

  5. 可以使用以下命令验证 MySQL 服务是否正在运行：

     ```bash
     sudo systemctl status mysql
     ```

***

## 四、安装与启动

1. **克隆项目**

```bash
git clone <项目仓库地址>
cd <项目目录>
```

2. **安装依赖**

```bash
npm i
```

3. **创建数据库表**
   执行以下 SQL 脚本创建数据库表：

```sql
-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    real_name VARCHAR(255),
    phone VARCHAR(20),
    user_type ENUM('NORMAL', 'VOLUNTEER', 'ADMIN') NOT NULL DEFAULT 'NORMAL',
    avatar VARCHAR(255) DEFAULT 'default_avatar.png',
    upload_count INT DEFAULT 0,
    banned_files INT DEFAULT 0,
    status ENUM('NORMAL', 'BANNED') NOT NULL DEFAULT 'NORMAL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_time TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建文件表
CREATE TABLE IF NOT EXISTS files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_uuid VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    file_ext VARCHAR(10) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image VARCHAR(255),
    category_id INT NOT NULL,
    user_id INT NOT NULL,
    audit_status INT NOT NULL DEFAULT 0,
    audit_user_id INT,
    audit_time TIMESTAMP,
    audit_remark TEXT,
    view_count INT DEFAULT 0,
    download_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    status INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 创建分类表
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    parent_id INT,
    sort_order INT NOT NULL,
    status INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id)
);

-- 创建固定标签表
CREATE TABLE IF NOT EXISTS fixed_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_fixed TINYINT(1) NOT NULL DEFAULT 1,
    status INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    sort_order INT NOT NULL
);

-- 创建标签表
CREATE TABLE IF NOT EXISTS tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    status INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建文件标签关联表
CREATE TABLE IF NOT EXISTS file_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_id INT NOT NULL,
    tag_id INT NOT NULL,
    FOREIGN KEY (file_id) REFERENCES files(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);

-- 创建审核记录表
CREATE TABLE IF NOT EXISTS audit_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_id INT NOT NULL,
    user_id INT NOT NULL,
    old_status INT NOT NULL,
    new_status INT NOT NULL,
    operation_type INT NOT NULL,
    remark TEXT,
    operation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (file_id) REFERENCES files(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 创建用户操作日志表
CREATE TABLE IF NOT EXISTS user_operation_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    target_user_id INT NOT NULL,
    operation_type INT NOT NULL,
    old_status INT NOT NULL,
    new_status INT NOT NULL,
    remark TEXT,
    operation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (target_user_id) REFERENCES users(id)
);
```

5. **启动项目**

```bash
npm run dev
```

***

## 五、API 文档

项目使用 Swagger 生成 API 文档，启动项目后，访问 `http://localhost:3000/api-docs` 即可查看详细的 API 接口信息。

### 1. 用户认证

* **注册**：`POST /api/v1/auth/register`

* **登录**：`POST /api/v1/auth/login`

* **登出**：`POST /api/v1/auth/logout`

* **获取当前用户信息**：`GET /api/v1/auth/me`

### 2. 用户管理

* **获取当前用户资料**：`GET /api/v1/users/me`

* **更新当前用户资料**：`PUT /api/v1/users/me`

* **获取所有用户**：`GET /api/v1/users`

* **获取单个用户详情**：`GET /api/v1/users/:id`

* **更新用户状态**：`PUT /api/v1/users/:id/status`

* **获取用户上传状态**：`GET /api/v1/users/:id/upload-status`

* **封禁用户上传权限**：`PUT /api/v1/users/:id/ban-upload`

* **解封用户上传权限**：`PUT /api/v1/users/:id/unban-upload`

### 3. 文件管理

* **上传文件**：`POST /api/v1/files/upload`

* **获取文件详情**：`GET /api/v1/files/:id`

* **获取我的上传文件**：`GET /api/v1/files/my`

* **浏览文件**：`GET /api/v1/files`

* **更新文件状态**：`PUT /api/v1/files/:id/status`

* **删除文件**：`DELETE /api/v1/files/:id`

* **上传封面图片**：`POST /api/v1/files/cover/upload`

### 4. 审核管理

* **获取审核大厅文件列表**：`GET /api/v1/audits/hall`

* **审核通过文件**：`PUT /api/v1/audits/approve/:fileId`

* **审核拒绝文件**：`PUT /api/v1/audits/reject/:fileId`

* **封禁文件**：`PUT /api/v1/audits/ban/:fileId`

* **解封文件**：`PUT /api/v1/audits/unban/:fileId`

* **获取所有审核记录**：`GET /api/v1/audits/records`

* **获取文件审核记录**：`GET /api/v1/audits/records/file/:fileId`

***

## 六、注意事项

* 请确保数据库服务正常运行。

* 项目使用 `bcrypt` 对用户密码进行加密，确保用户信息安全。

* 上传的文件会存储在 `public/uploads/files` 目录下，封面图片会存储在 `public/uploads/covers` 目录下。

***

## 七、贡献

如果你想为项目做出贡献，可遵循以下步骤：

1. Fork 项目仓库。

2. 创建新的分支：`git checkout -b feature/your-feature-name`。

3. 提交代码并推送至你的仓库：`git push origin feature/your-feature-name`。

4. 发起 Pull Request。

