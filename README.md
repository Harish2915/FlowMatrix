# Flow Matrix

> A full-stack workflow automation platform to design processes, define routing rules, execute workflows, and track every step with complete audit logs.

---

## 🎬 Demo Video

> Watch the full walkthrough — registration, workflow creation, steps & rules configuration, execution with dynamic input form, and execution detail logs.

[![Flow Matrix Demo Video](./Demo/Flow-Matrix.mp4)]

---

## 📸 Screenshots

---

### 1. Login Page
> Secure sign-in screen for the WorkFlow Engine. Users authenticate with email and password. A JWT access token is issued on successful login and stored for all subsequent API requests.

![Login Page](./Demo/Login.png)

---

### 2. Register Page
> New user registration screen. Collects full name, email address, and a minimum 6-character password. On success, redirects to the login page.

![Register Page](./Demo/Register.png)

---

### 3. Dashboard — Overview
> Main dashboard showing real-time stats cards: **Total Workflows**, **Total Executions**, **Completed**, and **Failed**. The Recent Executions table lists Execution ID, Workflow ID, Version, Status badge, Triggered By, Start time, and End time. Each row has a view (👁) icon linking to full execution details.

![Dashboard Overview](./Demo/Dashboard.png)

---

### 4. Workflows List
> Lists all created automation workflows. Each row shows the workflow **Name** (with truncated UUID below), **Version**, **Status** badge (Active), **Created** date, and three action icons — Edit (✏️), Execute (▶), Delete (🗑). A `+ New Workflow` button is pinned to the top-right.

![Workflows List](./Demo/WorkFlow.png)

---

### 5. New Workflow Modal — Workflow Info Tab
> Modal dialog for creating a new workflow. The **Workflow Info** tab accepts the Workflow Name (e.g. "Expense Approval"), a Start Step selector (enabled after first save), and an **Input Schema JSON editor** where field names, types (`number`, `string`), required flags, and `allowed_values` enums are defined.

![New Workflow - Workflow Info Tab](./Demo/New_WorkFlow.png)

---

### 6. Edit Workflow Modal — Steps & Rules Tab
> The **Steps & Rules** tab of the workflow editor. Displays the execution start step banner, total step count, and an ordered list of steps with their type badges (`approval`, `notification`, `task`). Each step expands to show its **Routing Rules** with condition expressions (`amount > 100 && priority == 'High'`), target next step, and priority number. Rules can be added (`+ Rule`), edited, reordered, or deleted.

![Edit Workflow - Steps and Rules Tab](./Demo/Edit_WorkFlow.png)

---

### 7. Execute Workflow — Dynamic Input Form
> The Execute Workflow page dynamically renders an input form from the workflow's `input_schema`. Number fields and dropdowns (for `allowed_values` enum fields like `High / Medium / Low`) are auto-generated. A live **Preview** panel shows the exact JSON payload before submission. Clicking **▶ Start Execution** triggers the workflow run via the API.

![Execute Workflow - Input Form](./Demo/Expense.png)

---

### 8. Execution Details — Step Execution Logs
> Full execution detail view. The top banner shows execution status (`completed` / `failed`) and duration. A two-panel layout shows **Execution Info** (Execution ID, Workflow ID, Version, Triggered By, Started At, Ended At, Duration) on the left and **Input Data** (field values + raw JSON) on the right. Below is the **Step Execution Logs** table — each row shows step name, type badge, status, next step routed to, duration, and the rules that were evaluated. A **Refresh** button supports live polling for in-progress executions.

![Execution Details - Step Logs](./Demo/Execution_Details.png)

---

### 9. Account Settings — Theme Selector
> Account Settings modal accessible from the top-right avatar. Contains four tabs: **Profile**, **Theme**, **Settings**, and **Security**. The **Theme** tab displays 18 color themes — Rose, Ocean, Forest, Sunset, Violet, Slate, Crimson, Teal, Amber, Emerald, Sakura, Midnight, Copper, Indigo, Mint, Graphite, Coral, Aurora — each with a color swatch preview bar. The selected theme applies instantly across the entire dashboard and is persisted to the browser's localStorage.

![Account Settings - Theme Selector](./Demo/Account_Settings.png)

---

## 🛠 Tech Stack

### Frontend

| Technology | Purpose |
|-----------|---------|
| **React** (Vite) | UI component framework and SPA routing |
| **JavaScript (ES2022+)** | Application logic, hooks, state management |
| **HTML5** | Semantic page structure and markup |
| **CSS3** | Styling, layout, CSS variables for theme system |
| **Axios** | HTTP client with JWT Authorization interceptor |
| **React Router v6** | Client-side routing and navigation |

### Backend

| Technology | Purpose |
|-----------|---------|
| **Python 3.11+** | Core backend language |
| **FastAPI** | REST API framework with automatic OpenAPI/Swagger docs |
| **JWT** (`python-jose`) | Access token creation, signing, and verification |
| **Pydantic v2** | Request/response schema validation and serialization |
| **SQLAlchemy 2.x ORM** | Database models, relationships, async query building |
| **MySQL 8.0+** | Primary relational database |
| **aiomysql** | Async MySQL driver for SQLAlchemy |
| **Alembic** | Database schema versioning and migrations |
| **passlib[bcrypt]** | Secure password hashing and verification |
| **uvicorn** | ASGI server for running FastAPI |

---

## 🧠 Core Concepts

### Workflow
A workflow is a named, versioned process composed of multiple steps executed sequentially or conditionally via routing rules.

| Field | Type | Description |
|-------|------|-------------|
| `id` | CHAR(36) UUID | Unique identifier |
| `name` | VARCHAR | e.g. `"Expense Approval"` |
| `version` | INT | Auto-increments on every update |
| `is_active` | BOOLEAN | Whether this version is currently live |
| `input_schema` | JSON | Field definitions — names, types, required, allowed_values |
| `start_step_id` | CHAR(36) UUID | The first step to execute |
| `created_at` / `updated_at` | DATETIME | Timestamps |

**Example `input_schema`:**
```json
{
  "fields": [
    { "name": "amount", "type": "number", "required": true },
    { "name": "priority", "type": "string", "required": true, "allowed_values": ["High", "Medium", "Low"] }
  ]
}
```

---

### Step
A step is a single action unit within a workflow.

| Step Type | Description |
|-----------|-------------|
| `task` | Automated or manual action — e.g. update DB, generate report |
| `approval` | Requires user approval — e.g. manager approves expense |
| `notification` | Sends an alert/message — e.g. email, Slack, UI notification |

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `workflow_id` | UUID | Parent workflow reference |
| `name` | VARCHAR | Step name |
| `step_type` | ENUM | `task`, `approval`, `notification` |
| `order` | INT | Default execution sequence (overridable by rules) |
| `metadata` | JSON | `assignee_email`, `notification_channel`, `template`, `instructions` |
| `created_at` / `updated_at` | DATETIME | Timestamps |

---

### Rule
Rules define conditional routing — which step executes next based on runtime input. Evaluated in **priority order** (lowest = highest priority). A `DEFAULT` rule is required as a catch-all.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `step_id` | UUID | The step this rule belongs to |
| `condition` | TEXT | Expression e.g. `amount > 100 && priority == 'High'` |
| `next_step_id` | UUID / NULL | Target next step; `NULL` ends the workflow |
| `priority` | INT | Lower = evaluated first |
| `created_at` / `updated_at` | DATETIME | Timestamps |

**Supported operators:**

| Category | Operators / Functions |
|----------|-----------------------|
| Comparison | `==`, `!=`, `<`, `>`, `<=`, `>=` |
| Logical | `&&` (AND), `\|\|` (OR) |
| String | `contains(field, "val")`, `startsWith(field, "pre")`, `endsWith(field, "suf")` |

**Example rules for "Manager Approval" step:**

| Priority | Condition | Next Step |
|----------|-----------|-----------|
| 1 | `amount > 100 && priority == 'High'` | Finance Notify |
| 2 | `amount <= 100` | CEO Approval |
| 99 | `DEFAULT` | Reject |

---

### Execution
Each workflow run generates an execution record with full step-level logs.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Execution ID |
| `workflow_id` | UUID | Associated workflow |
| `workflow_version` | INT | Snapshot version at time of execution |
| `status` | ENUM | `pending`, `in_progress`, `completed`, `failed`, `canceled` |
| `data` | JSON | Input values provided at runtime |
| `logs` | JSON | Array of per-step execution log objects |
| `current_step_id` | UUID | Step currently executing |
| `retries` | INT | Retry count for failed steps |
| `triggered_by` | UUID | User who initiated the execution |
| `started_at` / `ended_at` | DATETIME | Timestamps |

---

## 📁 Project Structure

```
flow-matrix/
│
├── frontend/                              # React (Vite) application
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx                       # App entry point
│       ├── App.jsx                        # Route definitions
│       ├── index.css                      # Global styles & CSS variables (themes)
│       │
│       ├── api/
│       │   └── client.js                  # Axios instance — base URL + JWT interceptor
│       │
│       ├── context/
│       │   ├── AuthContext.jsx            # JWT storage, login/logout, user state
│       │   └── ThemeContext.jsx           # Color theme state + localStorage persistence
│       │
│       ├── pages/
│       │   ├── Login.jsx                  # /login
│       │   ├── Register.jsx               # /register
│       │   ├── Dashboard.jsx              # / — stats cards + recent executions
│       │   ├── Workflows.jsx              # /workflows — list, create, edit, delete
│       │   ├── ExecuteWorkflow.jsx        # /workflows/:id/execute — dynamic input form
│       │   └── ExecutionDetails.jsx       # /executions/:id — step logs + trace
│       │
│       └── components/
│           ├── Sidebar.jsx                # Navigation sidebar
│           ├── WorkflowModal.jsx          # New/Edit workflow modal (2 tabs)
│           ├── StepEditor.jsx             # Add / Edit / Delete steps
│           ├── RuleEditor.jsx             # Add / Edit / Delete rules with validator
│           └── AccountSettings.jsx        # Profile, Theme, Settings, Security modal
│
│
└── backend/                               # Python FastAPI application
    ├── .env                               # Environment variables
    ├── alembic.ini                        # Alembic config
    ├── requirements.txt                   # Python dependencies
    │
    ├── alembic/                           # DB migrations
    │   ├── env.py
    │   └── versions/
    │       └── 0001_initial_schema.py
    │
    └── app/
        ├── main.py                        # FastAPI app, CORS, router registration
        ├── config.py                      # pydantic-settings — loads .env
        ├── database.py                    # SQLAlchemy async engine + session factory
        ├── dependencies.py                # get_current_user JWT Bearer dependency
        │
        ├── models/                        # SQLAlchemy ORM models (MySQL tables)
        │   ├── user.py
        │   ├── workflow.py
        │   ├── step.py
        │   ├── rule.py
        │   └── execution.py
        │
        ├── schemas/                       # Pydantic v2 schemas (request + response)
        │   ├── user.py                    # UserCreate, UserLogin, UserOut, Token
        │   ├── workflow.py                # WorkflowCreate, WorkflowUpdate, WorkflowOut
        │   ├── step.py                    # StepCreate, StepUpdate, StepOut
        │   ├── rule.py                    # RuleCreate, RuleUpdate, RuleOut
        │   └── execution.py              # ExecutionOut, StepLog, ExecutionStatus
        │
        ├── routers/                       # FastAPI route handlers
        │   ├── auth.py                    # POST /auth/register, POST /auth/login
        │   ├── workflows.py               # CRUD /workflows
        │   ├── steps.py                   # CRUD /workflows/:id/steps, /steps/:id
        │   ├── rules.py                   # CRUD /steps/:id/rules, /rules/:id
        │   └── executions.py             # execute, status, cancel, retry
        │
        └── services/                      # Business logic
            ├── auth_service.py            # JWT creation, bcrypt hash/verify
            ├── workflow_service.py        # Versioning logic on update
            ├── execution_service.py       # Execution runner — step traversal loop
            └── rule_engine.py             # Condition parser & runtime evaluator
```

---

## 🌐 API Reference

All endpoints except `/auth/*` require:
```
Authorization: Bearer <access_token>
```

Interactive docs auto-generated by FastAPI:
- **Swagger UI** → `http://localhost:8000/docs`
- **ReDoc** → `http://localhost:8000/redoc`

---

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register a new user account |
| `POST` | `/auth/login` | Login — returns JWT access token |

**Login request:**
```json
{ "email": "admin@gmail.com", "password": "yourpassword" }
```
**Login response:**
```json
{ "access_token": "eyJhbGci...", "token_type": "bearer" }
```

---

### Workflows

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/workflows` | Create a new workflow |
| `GET` | `/workflows` | List all workflows (`?page=1&search=`) |
| `GET` | `/workflows/{id}` | Get workflow with all steps and rules |
| `PUT` | `/workflows/{id}` | Update workflow — auto-increments version |
| `DELETE` | `/workflows/{id}` | Delete workflow |

---

### Steps

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/workflows/{workflow_id}/steps` | Add a step to a workflow |
| `GET` | `/workflows/{workflow_id}/steps` | List all steps for a workflow |
| `PUT` | `/steps/{id}` | Update a step |
| `DELETE` | `/steps/{id}` | Delete a step |

---

### Rules

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/steps/{step_id}/rules` | Add a routing rule to a step |
| `GET` | `/steps/{step_id}/rules` | List all rules for a step |
| `PUT` | `/rules/{id}` | Update a rule |
| `DELETE` | `/rules/{id}` | Delete a rule |

---

### Executions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/workflows/{workflow_id}/execute` | Start a workflow execution with input data |
| `GET` | `/executions` | List all executions (paginated) |
| `GET` | `/executions/{id}` | Get execution status and full step logs |
| `POST` | `/executions/{id}/cancel` | Cancel an in-progress execution |
| `POST` | `/executions/{id}/retry` | Retry only the failed step (not full workflow) |

---

## ⚙️ Rule Engine Behavior

- Rules are evaluated **at runtime** using the execution's input `data` object.
- Sorted by `priority` ascending — **lowest number is evaluated first**.
- The **first matching rule** is selected and its `next_step_id` is followed.
- If a condition expression is invalid or throws an error, the step is marked `failed`.
- If no rule matches and no `DEFAULT` exists, the step is marked `failed` and execution halts.
- `DEFAULT` (condition = `"DEFAULT"`) acts as a required catch-all fallback for every step.
- All evaluations, match outcomes, errors, and routing decisions are written to execution `logs`.
- **Bonus:** Non-linear branching and loop detection are supported with a configurable `MAX_ITERATIONS` guard to prevent infinite loops.

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- MySQL 8.0+
- Node.js 18+
- npm or yarn

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/flow-matrix.git
cd flow-matrix
```

---

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Install all Python dependencies
pip install -r requirements.txt
```

**`requirements.txt`:**
```
fastapi==0.111.0
uvicorn[standard]==0.29.0
sqlalchemy==2.0.30
aiomysql==0.2.0
alembic==1.13.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
pydantic[email]==2.7.1
pydantic-settings==2.2.1
python-dotenv==1.0.1
python-multipart==0.0.9
```

**Create `.env` inside `/backend`:**
```env
DATABASE_URL=mysql+aiomysql://root:yourpassword@localhost:3306/flow_matrix
JWT_SECRET=your_super_secret_key_change_this
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
```

**Create the MySQL database:**
```sql
CREATE DATABASE flow_matrix
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

**Run Alembic migrations:**
```bash
alembic upgrade head
```

**Start the backend server:**
```bash
uvicorn app.main:app --reload --port 8000
```

✅ Backend → `http://localhost:8000`
✅ Swagger UI → `http://localhost:8000/docs`

---

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:8000" > .env

# Start development server
npm run dev
```

✅ Frontend → `http://localhost:5173`

---

### 4. Build for Production

```bash
# Frontend build
cd frontend && npm run build       # Output: /frontend/dist

# Backend production start
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## 💡 Example Workflow: Expense Approval

```
Input: { "amount": 150, "priority": "High" }

Step 1 — Manager Approval  [approval]
  ├─ Rule 1 (priority 1):  amount > 100 && priority == 'High'  →  Finance Notify  ✅ MATCHED
  ├─ Rule 2 (priority 2):  amount <= 100                        →  CEO Approval
  └─ Rule 99 (DEFAULT):                                         →  Reject

Step 2 — Finance Notify  [notification]
  └─ Rule 99 (DEFAULT):                                         →  CEO Approval  ✅ MATCHED

Step 3 — CEO Approval  [approval]
  └─ Rule 99 (DEFAULT):                                         →  Reject  ✅ MATCHED

Step 4 — Reject  [task]
  └─ next_step_id = NULL  →  Workflow ends

Final Status: ✅ completed
```

---

## 🎨 Available Themes

18 color themes switchable instantly from Account Settings → Theme tab:

`Rose` · `Ocean` · `Forest` · `Sunset` · `Violet` · `Slate` · `Crimson` · `Teal` · `Amber` · `Emerald` · `Sakura` · `Midnight` · `Copper` · `Indigo` · `Mint` · `Graphite` · `Coral` · `Aurora`

---

## 📄 License

MIT — free to use, modify, and distribute.