# Faculty Exam Allotment System (MERN Stack)

This is a MERN stack implementation of the Faculty Exam Allotment System, migrating from the legacy Flask application.

## Prerequisites

1.  **Node.js**: Ensure Node.js is installed.
2.  **MongoDB**: Ensure MongoDB is installed and running on `mongodb://127.0.0.1:27017`.

## Project Structure

-   `server/`: Node.js/Express Backend.
-   `client/`: React/Vite Frontend.
-   `scripts/`: Utility scripts (Data Migration).

## Setup & Running

### 1. Database Setup
Ensure MongoDB is running.
Migrate legacy data:
```bash
cd server
npm install
node scripts/migrate_data.js
```
*Note: If migration fails with connection error, ensure MongoDB service is started.*

### 2. Backend Server
```bash
cd server
npm run dev
```
Runs on `http://localhost:5000`.

### 3. Frontend Client
```bash
cd client
npm install
npm run dev
```
Runs on `http://localhost:5173`.

## Features implemented

-   **Faculty Management**: View, Add, Delete, Toggle Status of faculty members.
-   **Exam Allotment**: 
    -   Configure exam dates and sessions.
    -   Auto-allocate invigilators (fairness logic ported from legacy).
    -   Export allotment report (DOC).
-   **Room Allotment**:
    -   Upload Exam Schedule (HTML/DOC).
    -   Parse session details.
    -   Randomize room assignments.
    -   Export room allotment report (DOC).
