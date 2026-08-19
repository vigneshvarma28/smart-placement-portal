# 🌐 Smart Placement Portal — Deployment Guide

This guide walks you through deploying the **Smart Placement Portal** to the cloud or via Docker.

---

## 🎯 Recommended Method: 1-Click Deployment on Render

This repository includes a pre-configured [`render.yaml`](./render.yaml) Blueprint that automatically provisions:
1. **`smart-placement-api`** (Node.js Express + Built React Frontend)
2. **`smart-placement-ml`** (Python Flask AI Recommendation Service)

### Step 1: Set up MongoDB Atlas (Free Cloud Database)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a free **M0 Shared Cluster**.
3. Under **Security > Database Access**, create a user (e.g., `admin`) and set a password.
4. Under **Security > Network Access**, click **Add IP Address** and select **Allow Access from Anywhere (`0.0.0.0/0`)**.
5. Go to **Databases > Connect > Drivers**, copy your connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/placement?retryWrites=true&w=majority
   ```

---

### Step 2: Deploy to Render via Blueprint
1. Go to [render.com](https://render.com) and log in with your GitHub account.
2. Click **New +** (top right) and select **Blueprint**.
3. Connect your repository: `vigneshvarma28/smart-placement-portal` (or your fork).
4. Render will detect [`render.yaml`](./render.yaml) and configure both services automatically.
5. In the environment setup prompt, set:
   - `MONGO_URI`: Your MongoDB Atlas connection string from Step 1.
   - `EMAIL_USER` *(Optional)*: Your Gmail address for OTP emails.
   - `EMAIL_PASS` *(Optional)*: Your Gmail 16-character App Password.
6. Click **Apply**. Render will build and deploy both services!

---

## 🐳 Alternative Method: Deploy with Docker

You can run the entire production stack (Web + ML Service + MongoDB) anywhere with a single command:

```bash
docker-compose up --build -d
```

Access the portal at `http://localhost:5000`.

---

## ⚙️ Environment Variables Summary

| Variable | Service | Required | Description |
| :--- | :--- | :---: | :--- |
| `NODE_ENV` | Web / API | Yes | Set to `production` |
| `PORT` | Web / API | Yes | Port to bind (default `10000` on Render, `5000` locally) |
| `MONGO_URI` | Web / API | Yes | MongoDB Atlas connection URI |
| `JWT_SECRET` | Web / API | Yes | Secret key for signing JWT tokens |
| `ML_SERVICE_URL` | Web / API | Yes | Internal or public URL to the Flask ML Service |
| `EMAIL_USER` | Web / API | Optional | Sender email for OTP and status updates |
| `EMAIL_PASS` | Web / API | Optional | Gmail 16-character App Password |

---

## 🔑 Default Initial Credentials (Created Automatically)

| Role | Email | Password |
| :--- | :--- | :--- |
| 🎓 **Student** | `alice@example.com` | `password123` |
| 🏢 **Company** | `hr@techcorp.com` | `password123` |
| 👑 **Admin** | `admin@example.com` | `admin123` |
