
---

# 📄 `README.md`

```md
# 🔐 Enterprise Authentication & Authorization System

A production-grade backend system implementing **JWT authentication, session management, RBAC → ABAC authorization, OTP login, Google OAuth, and advanced security protections**.

---

## 🚀 Overview

This project is a **secure, scalable authentication platform** designed for modern applications.

It supports:
- Multi-device sessions
- Role & attribute-based access control
- Audit logging & security monitoring
- Multiple login methods (Password, OTP, OAuth)

---

## 🧠 Architecture

```

Frontend (Next.js)
↓
Backend (Node.js + Express)
↓
Database (PostgreSQL + Prisma)

Security Layers:

* JWT + Refresh Tokens
* Session Store (DB)
* ABAC Policy Engine
* Audit Logs

````

---

## ✨ Features

### 🔐 Authentication
- JWT Access + Refresh Tokens
- Secure cookie-based session handling
- Refresh token rotation (anti-replay)
- Multi-device login support

### 🔑 Authorization
- RBAC (Admin / Handler / User)
- ABAC (attribute-based access control)
- Ownership & hierarchy enforcement

### 📱 Login Methods
- Email + Password
- OTP (phone-based)
- Google OAuth (restricted access)

### 🛡️ Security
- HTTP-only cookies (XSS protection)
- CSRF protection
- Rate limiting (anti-brute force)
- Account lock after failed attempts
- Device & IP binding
- Token reuse detection

### 📊 Monitoring
- Audit logs (login, logout, actions)
- Suspicious activity detection
- Admin security dashboard APIs

---

## 📁 Project Structure

```

backend/
├── prisma/
├── src/
│   ├── config/
│   ├── middleware/
│   ├── modules/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── admin/
│   │   ├── otp/
│   │   ├── session/
│   │   ├── audit/
│   │   └── location/
│   ├── utils/
│   ├── types/
│   └── constants/
├── .env
├── prisma.config.ts
└── package.json

````

---

## ⚙️ Setup & Installation

### 1️⃣ Clone repo

```bash
git clone <your-repo-url>
cd backend
```

---

### 2️⃣ Install dependencies

```bash
npm install
```

---

### 3️⃣ Setup environment variables

Create `.env`:

```env
PORT=5000

DATABASE_URL=postgresql://user:password@localhost:5432/db

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=1d

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret
FRONTEND_URL=http://localhost:3000
```

---

### 4️⃣ Run Prisma

```bash
npx prisma generate
npx prisma migrate dev
```

---

### 5️⃣ Start server

```bash
npm run dev
```

---

## 🔄 Authentication Flow

```
1. User logs in (Password / OTP / OAuth)
2. Access Token issued (short-lived)
3. Refresh Token stored in HTTP-only cookie
4. Session stored in database
5. Token rotation on refresh
```

---

## 🧩 RBAC → ABAC

### RBAC (Basic)

```
Admin → full access
Handler → limited access
User → minimal access
```

---

### ABAC (Advanced)

Access based on:

* User attributes (role, location)
* Resource attributes (owner, district)
* Context (IP, device)

Example:

```
Handler can access users only in same district
User can access only own profile
```

---

## 🔐 Security Design

| Feature               | Protection                |
| --------------------- | ------------------------- |
| JWT + Rotation        | Prevent replay attacks    |
| HTTP-only cookies     | Prevent XSS               |
attacks      |
| Rate limiting         | Prevent brute force       |
| Account lock          | Stop repeated failures    |
| Device/IP binding     | Prevent session hijacking |
| Token reuse detection | Detect stolen tokens      |

---

## 📊 Admin APIs

| Endpoint                     | Description       |
| ---------------------------- | ----------------- |
| `/admin/dashboard`           | System stats      |
| `/admin/security`            | Security insights |
| `/admin/audit`               | Audit logs        |
| `/admin/sessions/:userId`    | User devices      |
| `/admin/security/suspicious` | Suspicious users  |

---

## 📱 OTP APIs

| Endpoint      | Description |
| ------------- | ----------- |
| `/otp/send`   | Send OTP    |
| `/otp/verify` | Verify OTP  |

---

## 🔐 Auth APIs

| Endpoint         | Description   |
| ---------------- | ------------- |
| `/auth/register` | Create user   |
| `/auth/login`    | Login         |
| `/auth/refresh`  | Refresh token |
| `/auth/logout`   | Logout        |
| `/auth/google`   | Google OAuth  |

---

## 👤 User APIs

| Endpoint                | Description     |
| ----------------------- | --------------- |
| `/user/me`              | Get profile     |
| `/user/update`          | Update profile  |
| `/user/change-password` | Change password |
| `/user/set-pin`         | Set PIN         |
| `/user/change-pin`      | Change PIN      |

---

## 🧪 Testing

You can test APIs using:

* Postman
* Thunder Client
* curl

---

## 🚀 Deployment (Recommended)

* Docker
* AWS EC2 / ECS
* Nginx (reverse proxy)
* HTTPS (SSL)

---

## 🧠 Future Improvements

* Multi-factor authentication (MFA)
* WebAuthn / Passkeys
* Multi-OAuth providers (GitHub, Apple)
* Real-time security alerts (WebSockets)
* Policy DSL (AWS IAM style)

---

## ❤️ Built With

* Node.js + Express
* Prisma + PostgreSQL
* TypeScript
* Zod
* JWT + OAuth

---

## 👨‍💻 Author

Built as a **production-grade authentication system** for learning and real-world use.

---

## ⭐ If you like this project

Give it a star ⭐ and use it in your projects!
