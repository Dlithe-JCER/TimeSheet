# ⏱ Timesheet Management System (MERN Stack)

A full-stack **Timesheet Management System** built with the **MERN stack (MongoDB, Express, React, Node.js)**.  
It allows employees to log weekly working hours on different projects, and admins/managers to view, filter, and analyze timesheets.

---

## 🚀 Features

- **Authentication & Authorization**
  - User login (Admin, Manager, Employee roles).
  - Role-based access control.

- **Timesheet Management**
  - Employees can log weekly hours project-wise & task-type-wise.
  - Track daily hours (Mon–Sun).
  - View weekly, monthly, and project-based reports.

- **Project & Task Management**
  - Admin/Manager can create and manage projects.
  - Task types associated with projects.

- **Timesheet Viewer**
  - Filter timesheets by **Employee**, **Project**, **Month**, and **Week**.
  - View summary of total hours worked.

---

## 🛠 Tech Stack

### Frontend
- React (Vite)
- TailwindCSS + ShadCN/UI components
- Framer Motion (animations)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose ODM

### Tools
- Axios (API calls)
- JSON Web Token (JWT) for auth
- bcrypt.js for password hashing

---

## 📂 Project Structure

timesheet-app/
│
├── backend/
│ ├── controllers/ # Business logic (auth, projects, timesheets, etc.)
│ ├── models/ # Mongoose schemas
│ ├── routes/ # Express routes
│ ├── server.js # Entry point
│ └── config/ # DB connection, env setup
│
├── frontend/
│ ├── src/
│ │ ├── components/ # Reusable UI components
│ │ ├── pages/ # Main pages (Login, Home, ViewTimeSheet, etc.)
│ │ └── App.jsx
│ └── vite.config.js
│
├── .env # Environment variables
├── package.json
└── README.md


---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repo
```bash
git clone https://github.com/yourusername/timesheet-app.git
cd timesheet-app
```

### 2️⃣ Backend Setup
```bash 
cd backend
npm install
```

### 3️⃣ Configure Environment Variables
Create a `.env` file in the `backend` directory and add your MongoDB connection string and other environment variables:
``` bash
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```
### 4️⃣ Start the Backend Server
```bash
nodemon server.js
```
### 5️⃣ Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
### Environment Variables
Create a `.env` file in the `frontend` directory and add:
```bash
VITE_API_URL=http://localhost:5000/api
```