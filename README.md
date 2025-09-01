# Timesheet Management System (MERN Stack)

A full-stack **Timesheet Management System** built with the **MERN stack (MongoDB, Express, React, Node.js)**.  
It allows employees to log weekly working hours on different projects, and admins/managers to view, filter, and analyze timesheets.

---

## Features

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

## Tech Stack

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

## Project Structure

timesheet-app/<br/>
│
├── backend/<br/>
│ ├── controllers/ # Business logic (auth, projects, timesheets, etc.)<br/>
│ ├── models/ # Mongoose schemas<br/>
│ ├── routes/ # Express routes<br/>
│ ├── server.js # Entry point<br/>
│ └── config/ # DB connection, env setup<br/>
│
├── frontend/<br/>
│ ├── src/<br/>
│ │ ├── components/ # Reusable UI components<br/>
│ │ ├── pages/ # Main pages (Login, Home, ViewTimeSheet, etc.)<br/>
│ │ └── App.jsx<br/>
│ └── vite.config.js<br/>
│
├── .env # Environment variables<br/>
├── package.json<br/>
└── README.md<br/>


---

##  Installation & Setup

### 1 Clone the repo
```bash
git clone https://github.com/yourusername/timesheet-app.git
cd timesheet-app
```

### 2 Backend Setup
```bash 
cd backend
npm install
```

### 3 Configure Environment Variables
Create a `.env` file in the `backend` directory and add your MongoDB connection string and other environment variables:
``` bash
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=9000
```
### 4 Start the Backend Server
```bash
nodemon server.js
```
### 5 Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
### Environment Variables
Create a `.env` file in the `frontend` directory and add:
```bash
VITE_API_URL=http://localhost:9000/api
```
