# Fework
> 🚀 Production-ready service marketplace platform built with Next.js, Node.js, MongoDB, AWS EC2, Docker, Nginx, and GitHub Actions CI/CD.
Fework is a full-stack service marketplace platform that connects customers with skilled workers and service professionals. Users can discover services, hire workers, manage bookings, communicate through messaging, and make secure payments through an intuitive web platform.

🌐 Live Demo: https://fework.vercel.app

---

## Features

### Customer Features
- User Registration & Authentication
- Browse and Search Service Providers
- View Worker Profiles & Reviews
- Book Services
- Secure Online Payments
- Real-Time Notifications
- Chat with Workers
- Manage Bookings

### Worker Features
- Worker Registration & Profile Management
- Skill Management
- Booking Management
- Earnings Tracking
- Customer Communication
- Service Status Updates

### Admin Features
- User Management
- Worker Verification
- Booking Monitoring
- Ticket Management
- Platform Analytics
- Content Moderation

---

## Tech Stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- Zustand
- TanStack Query
- Axios

### Backend
- Node.js
- Express.js
- TypeScript
- JWT Authentication
- REST APIs
- Socket.IO

### Database
- MongoDB Atlas
- Mongoose

### Cloud & DevOps
- AWS EC2
- Docker
- Nginx
- GitHub Actions (CI/CD)
- Vercel

### Third-Party Services
- Cloudinary
- Razorpay
- Nodemailer

---

## Project Architecture

```text
Frontend (Next.js)
        │
        ▼
Backend API (Node.js + Express)
        │
 ┌──────┼────────┐
 ▼      ▼        ▼
MongoDB Cloudinary Razorpay
 Atlas
```

---

## Authentication

- JWT Based Authentication
- Role-Based Access Control (RBAC)
- Protected Routes
- Secure Password Hashing
- Cookie-Based Session Management

---

## CI/CD Pipeline

Automated deployment using GitHub Actions.

Workflow:

1. Push code to GitHub
2. GitHub Actions triggers deployment
3. SSH into AWS EC2
4. Pull latest code
5. Build Docker image
6. Restart Docker container
7. Application goes live automatically

---

## Deployment

### Frontend
- Hosted on Vercel

### Backend
- Hosted on AWS EC2
- Dockerized Deployment
- Nginx Reverse Proxy
- HTTPS with SSL Certificate

---

## Environment Variables

Backend `.env`

```env
PORT=
MONGO_URI=
JWT_SECRET=
JWT_EXPIRES_IN=

CLIENT_URL=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_RAZORPAY_KEY_ID=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

NEXTAUTH_URL=
NEXTAUTH_SECRET=
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/riihennn/Fework.git
```

### Install Frontend

```bash
cd frontend
npm install
npm run dev
```

### Install Backend

```bash
cd backend
npm install
npm run dev
```

---

## Future Enhancements

- Mobile Application
- Video Consultation
- Service Subscription Plans
- AI-Based Worker Recommendations
- Location-Based Matching
- Advanced Analytics Dashboard

---

## Author

**Rihen Krishna**

MERN Stack Developer

LinkedIn:
https://www.linkedin.com/in/rihenkrishn

Personal Portfolio:
https://rihen.vercel.app

Live Project:
https://fework.vercel.app

---

## License

This project is developed for educational and portfolio purposes.
