# 🌊 Day-Flow-ClearFlow

**Day-Flow-ClearFlow** is a web application prototype built for the **OodoXNMIT Hackathon**. It provides a centralized HR and employee management system with smart scheduling, attendance tracking, leave management, payroll information, analytics, and an AI-assisted workflow.

> ⚠️ **PROTOTYPE NOTE:** This repository is a proof-of-concept created during a hackathon. Some advanced features are simulated or rely on mock data to demonstrate the intended design and workflow. The authentication and password logic are for demonstration purposes only and are **not intended for production use**.

## 🚀 Key Features

* **HR / Admin Portal** — Manage employees, attendance, leave requests, payroll, salary information, and analytics.
* **Employee Portal** — Employees can access their profile, attendance, leave information, salary details, and other personal information.
* **Employee Management** — HR can add new employees and manage existing employee records.
* **Leave Management** — HR can review employee leave requests and approve or reject them.
* **Attendance Management** — Attendance information for both HR and employees can be viewed.
* **Payroll & Salary Management** — View and edit salary/payroll information and payment details.
* **Analytics & Reports** — Visualize weekly attendance trends and salary expenditure by department.
* **AI Copilot** — Smart assistant designed to guide users and automate parts of their daily workflow.
* **Data Analytics** — Tracks and visualizes productivity and organizational data.
* **Clean UI** — Simple, modern, single-page dashboard designed for easy navigation.

---

## 🔑 Login Credentials

The application provides separate portals for **HR / Admin** and **Employees**.

Passwords are automatically generated from the registered email address using the pattern below. This is **prototype authentication logic for demonstration purposes only**.

| Role           | Username Rule    | Password Rule                            | Example Email          | Example Password |
| -------------- | ---------------- | ---------------------------------------- | ---------------------- | ---------------- |
| **HR / Admin** | Registered email | First **3** characters of email + `@123` | `nehavgupta@gmail.com` | `neh@123`        |
| **Employee**   | Registered email | First **4** characters of email + `@123` | `nehavgupta@gmail.com` | `neha@123`       |

> ℹ️ Character count is taken from the part of the email before `@`, in lowercase.

The application contains multiple HR/Admin and employee accounts. Users can select any registered account and log in using its respective credentials.

---

# 🔄 Complete Application Flow

## 1. 🌊 Landing / Login Page

When the application is opened, the user is presented with the **Day-Flow-ClearFlow landing/login page** featuring the application's logo and a clean interface.

The user can choose between two portals:

* **HR / Admin Portal**
* **Employee Portal**

Each portal contains multiple registered users.

The user selects the required account and enters the corresponding password to access the application.

---

## 2. 👩‍💼 HR / Admin Portal

After successfully logging in as an HR/Admin, the user is taken to the **HR Dashboard**.

The HR portal provides the following major sections:

* Dashboard
* My Profile
* Attendance
* Leave Management
* Payroll & Salary
* Analytics & Reports

---

## 3. 📊 HR Dashboard

The dashboard acts as the central control panel for the HR.

It provides an overview of the company's employees and important HR activities.

### Company Employee List

The HR can view the list of employees registered under the organization.

Each employee can be selected to view their individual information.

The employee dashboard can display information such as:

* Employee details
* Number of days present in a month
* Paid leave information
* Leave balance
* Net payable salary
* Other relevant employee statistics

### Leave Request Actions

The HR can also see employee leave requests directly from the dashboard.

For every request, the HR can:

* **Approve** the leave request
* **Reject** the leave request

The status of the request is reflected in the leave management section.

### Add Employee

The HR has an option to **Add Employee**.

When a new employee is added through the HR portal, the employee is registered in the system and becomes available in the employee list.

The newly added employee can subsequently access the **Employee Portal** using their registered credentials.

---

## 4. 👤 Employee Management

The HR can select individual employees from the employee list.

The employee-specific dashboard provides an overview of the employee's work and payroll information.

Important information includes:

* Employee profile
* Monthly attendance
* Number of days present
* Paid leave
* Leave balance
* Salary information
* Net payable salary
* Payment details

This allows HR to quickly understand an employee's attendance and salary status from a single interface.

---

## 5. 🪪 My Profile

The **My Profile** section allows the logged-in HR/Admin to view their personal and professional information.

The HR can view details such as:

* Name
* Email
* Role
* Contact information
* Other registered profile details

An **Edit Profile** option is also provided so that the HR can update the available information.

---

## 6. 🕒 Attendance Management

The **Attendance** section provides attendance information for users in the organization.

The HR can view:

* Employee attendance
* HR attendance
* Monthly attendance information
* Attendance trends

This section helps HR monitor employee presence and maintain an overview of attendance records.

---

## 7. 📝 Leave Management

The **Leave Management** section contains a list of employee leave applications.

Each application provides information about the request and its current status.

The HR can track whether an employee's leave has been:

* **Approved**
* **Rejected**
* **Pending**

Any action taken by HR is reflected in the corresponding leave record.

This creates a clear workflow between employee leave requests and HR decisions.

---

## 8. 💰 Payroll & Salary

The **Payroll & Salary** section allows HR to access employee salary and payment information.

HR can view relevant payroll details and has an option to **edit payroll information** when required.

The section can include:

* Employee salary
* Pay information
* Net payable salary
* Payment details
* Payroll-related information

This provides HR with a centralized location for managing employee compensation information.

---

## 9. 📈 Analytics & Reports

At the bottom of the HR portal, the application provides an **Analytics & Reports** section.

This section presents organizational data in a visual format to help HR understand workforce trends.

The prototype includes analytics such as:

### Weekly Attendance Trends

A graphical representation of employee attendance over different days/weeks.

This helps HR identify attendance patterns and monitor workforce presence.

### Salary Expenditure by Department

A visual representation of salary expenditure across different departments.

This allows HR to understand how payroll expenses are distributed within the organization.

---

# 👨‍💻 10. Employee Portal

The application also provides a dedicated **Employee Portal**.

The login page contains multiple registered employees, allowing the user to select an employee account and log in using the respective credentials.

Once logged in, the employee can access their personal HR-related information.

The employee experience is designed to provide access to information relevant to the individual employee while keeping HR management functions within the HR/Admin portal.

---

# 🔗 11. HR → Employee Integration

One of the important workflows demonstrated by the prototype is the connection between the HR and Employee portals.

### Example Flow

**HR logs in**

↓

**HR opens Dashboard**

↓

**HR selects Add Employee**

↓

**New employee details are entered**

↓

**Employee is added to the organization**

↓

**Employee appears in the HR Employee List**

↓

**Employee account becomes available in the Employee Portal**

↓

**Employee can log in using their registered credentials**

This demonstrates how employee information added by HR can be reflected throughout the application.

---

# 🤖 12. AI Copilot

The **AI Copilot** is an integrated assistant designed to help users with their daily workflow.

Users can enter prompts into the assistant panel.

The `ai-copilot.js` module processes these prompts and provides simulated AI-guided suggestions.

The prototype demonstrates how an AI assistant can eventually be integrated into an HR/workflow management system to assist with:

* Daily planning
* Workflow guidance
* Task suggestions
* Productivity assistance
* Schedule-related recommendations

> ⚠️ The current hackathon implementation may use simulated responses or prototype logic rather than a production AI backend.

---

# 📊 13. Data Analytics

The application uses analytics functionality to transform sample data into meaningful dashboard information.

The `analytics.js` module handles sample/mock data and structures information used by the application's charts and productivity indicators.

The current prototype demonstrates how the same architecture can later be connected to a live database.

---

# ⚡ 14. Live UI Updates

The application is designed as an interactive dashboard.

Actions such as:

* Adding an employee
* Approving/rejecting leave
* Updating information
* Marking tasks complete
* Adjusting schedules
* Editing payroll information

can update the interface without requiring a full page reload.

The main interaction and state-management logic is handled through `app.js`.

---

# 📂 Project Structure

```text
├── Day-Flow-ClearFlow/     # Core project assets
├── node_modules/           # Project dependencies
├── ai-copilot.js           # AI assistant and prompt handling
├── analytics.js            # Analytics and chart data processing
├── app.js                  # Main application controller and UI state
├── index.html              # Main application interface
├── package.json            # Project metadata and dependencies
├── package-lock.json       # Locked dependency versions
└── style.css               # Application styling and visual themes
```

> `node_modules` is generated automatically after running `npm install` and normally should not be committed to GitHub.

---

# 🛠️ Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript (ES6)

### Backend / Environment

* Node.js

### Prototype Components

* Mock data
* Interactive dashboards
* Client-side application logic
* Simulated AI assistant
* Data visualization

---

# 💡 Understanding the Prototype

To explore the application, focus on these major components:

### 1. Interactive Dashboard

**`index.html` + `app.js`**

Provides the main interface for HR and employees and handles interactive actions and dashboard updates.

### 2. Employee & HR Management

Demonstrates the workflow of:

**HR → Add Employee → Employee List → Employee Portal**

### 3. Attendance & Leave Management

Demonstrates how HR can monitor attendance and process employee leave requests.

### 4. Payroll & Salary

Provides salary, payroll, and payment information with editing functionality.

### 5. Mock Analytics

**`analytics.js`**

Uses sample data to demonstrate attendance trends, salary expenditure, and other dashboard insights.

### 6. AI Integration

**`ai-copilot.js`**

Demonstrates how an AI assistant can be integrated into the workflow to provide intelligent guidance and suggestions.

---

# ⚙️ Installation & Setup

## 1. Clone the Repository

```bash
git clone https://github.com/NehaVGupta/Day-Flow-ClearFlow.git
```

## 2. Navigate into the Project

```bash
cd Day-Flow-ClearFlow
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Launch the Application

```bash
npm start
```

## 5. Log In

Open the application and choose either:

* **HR / Admin Portal**
* **Employee Portal**

Select a registered user and use the corresponding password pattern described in the **Login Credentials** section.

---

# ⚠️ Prototype Limitations

This project was developed as a hackathon prototype and is intended to demonstrate the application's concept, interface, and workflow.

Some features may currently use:

* Mock/sample data
* Simulated AI responses
* Client-side authentication logic
* Prototype payroll calculations
* Demonstration-only analytics

The password-generation mechanism is **not secure authentication** and should not be used in a production application.

For a production implementation, the system could be extended with:

* Secure authentication
* Role-based authorization
* Database integration
* Secure password hashing
* Real-time attendance data
* Production payroll processing
* Cloud deployment
* Real AI/LLM integration
* Persistent employee and HR records
* Advanced reporting and analytics

---

# 🌊 Overall Application Flow

```text
                    ┌─────────────────────┐
                    │   Day-Flow-ClearFlow │
                    │     Landing Page     │
                    └──────────┬──────────┘
                               │
                  ┌────────────┴────────────┐
                  │                         │
                  ▼                         ▼
          ┌───────────────┐         ┌───────────────┐
          │ HR / Admin    │         │   Employee    │
          │    Portal     │         │    Portal     │
          └───────┬───────┘         └───────┬───────┘
                  │                         │
                  ▼                         ▼
          ┌───────────────┐         ┌───────────────┐
          │   Dashboard   │         │ Employee Info │
          └───────┬───────┘         └───────────────┘
                  │
       ┌──────────┼───────────┬────────────┐
       │          │           │            │
       ▼          ▼           ▼            ▼
   Employee   Attendance   Leave       Payroll &
   Management              Management   Salary
       │          │           │            │
       ▼          ▼           ▼            ▼
   Add/View     HR &       Approve/      Salary &
   Employees   Employee     Reject       Payment
               Attendance    Leave        Details
       │
       ▼
 Employee appears
 in Employee Portal
       
                  ┌─────────────────────┐
                  │ Analytics & Reports │
                  ├─────────────────────┤
                  │ Weekly Attendance   │
                  │ Salary Expenditure  │
                  │ by Department       │
                  └─────────────────────┘

                  ┌─────────────────────┐
                  │     AI Copilot      │
                  │ Workflow Assistance  │
                  └─────────────────────┘
```

---

## 🏆 Hackathon Project

**Day-Flow-ClearFlow** was developed as a prototype for the **OodoXNMIT Hackathon**, focusing on simplifying HR operations and employee workflow management through an interactive dashboard, analytics, and AI-assisted features.

    Use the [Login Credentials](#-login-credentials) pattern above to sign in as HR/Admin or Employee.
