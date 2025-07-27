# Task Board Application

## Overview

This is a full-stack Task Board application built with FastAPI (backend) and React/Vite (frontend). Tasks and Projects are stored in a MySQL database via SQLAlchemy.

## Prerequisites

* **Python** 3.9 or higher
* **Node.js** 16.x or higher (includes `npm`)
* **MySQL** 

## Setup Steps

### 1. Clone the repository

```bash
git clone <url>
cd GensparkTask
```

### 2. Backend Setup

1. Create and activate a Python virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate   # on macOS/Linux
   venv\Scripts\activate    # on Windows
   ```

2. Install backend dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Configure database connection in `database.py`:

   ```python
   DATABASE_URL = "mysql+pymysql://<db_user>:<db_password>@localhost:3306/<db_name>"
   It is connected to my local database, thus you can't really access it
   ```

4. Initialize the database (tables are auto-created on startup):

   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   The API will be available at `http://localhost:8000`.

### 3. Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend/vite-project
   ```

2. Install frontend dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

   The React app will open at `http://localhost:5173` by default and will communicate with the FastAPI backend.

## Running Locally

1. Ensure MySQL is running and credentials match `database.py`.
2. In one terminal, start the backend:

   ```bash
   cd GensparkTask
   source venv/bin/activate
   uvicorn main:app --reload
   ```
3. In another terminal, start the frontend:

   ```bash
   cd GensparkTask/frontend/vite-project
   npm run dev
   ```
4. Open your browser at `http://localhost:5173` to use the Task Board.

## Common Commands

* **Install backend deps**: `pip install -r requirements.txt`
* **Run backend**: `uvicorn main:app --reload`
* **Install frontend deps**: `npm install`
* **Run frontend**: `npm run dev`



