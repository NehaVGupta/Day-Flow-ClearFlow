# 🌊 Day-Flow-ClearFlow

**Day-Flow-ClearFlow** is a web application prototype built for the **OodoXNMIT Hackathon**. It features smart scheduling, data analytics, and built-in AI assistant features.

> ⚠️ **PROTOTYPE NOTE**: This repository is a proof-of-concept created during a hackathon. Some advanced features are simulated or rely on mock data to demonstrate the design and workflow.

## 🚀 Key Features

*   **AI Copilot**: Smart helper to automate and guide your daily workflow.
*   **Data Analytics**: Real-time tracking and visual insights for your daily routines.
*   **Clean UI**: Simple, single-page dashboard built for speed and ease of use.

## 🔑 Login Credentials

Access is role-based. Passwords are auto-generated from the registered email address using the pattern below (this is prototype logic for demo purposes only — not intended for production use).

| Role | Username Rule | Password Rule | Example Email | Example Password |
|---|---|---|---|---|
| **HR / Admin** | Registered email | First **3** characters of email + `@123` | `nehavgupta@gmail.com` | `neh@123` |
| **Employee** | Registered email | First **4** characters of email + `@123` | `nehavgupta@gmail.com` | `neha@123` |

> ℹ️ Character count is taken from the part of the email before `@`, in lowercase.

## 🔄 App Flow

1.  **Landing / Login** — User opens `index.html` and lands on the login screen, choosing to sign in as **HR/Admin** or **Employee** using the credential pattern above.
2.  **Role-Based Dashboard** — `app.js` routes the user to the relevant dashboard view based on role, rendering the layout defined in `index.html` and styled via `style.css`.
3.  **Data Analytics** — `analytics.js` loads mock/sample data and generates real-time charts and productivity scores shown on the dashboard.
4.  **AI Copilot Interaction** — `ai-copilot.js` handles user prompts entered in the assistant panel, simulating AI-guided suggestions for daily workflow planning.
5.  **Live UI Updates** — Button clicks and state changes (e.g. marking tasks complete, adjusting schedule) are managed by `app.js`, updating the dashboard instantly without a page reload.

## 📂 Project Structure

```text
├── Day-Flow-ClearFlow/    # Core project assets
├── node_modules/          # Project dependencies (Run npm install to generate)
├── ai-copilot.js          # AI logic (Handles user prompts and chat simulations)
├── analytics.js           # Data processing (Calculates scores and structures charts)
├── app.js                 # Main application controller (Handles UI button clicks and state)
├── index.html             # Main entry web page (Contains the layout structure)
├── package.json           # Project metadata, setup scripts, and dependencies
├── package-lock.json      # Locked versions of dependencies for consistent builds
└── style.css              # Custom application styling (Layout and visual themes)
```
*(Based on the repository layout.)*

## 🛠️ Tech Stack

*   **Frontend**: HTML5, CSS3, JavaScript (ES6)
*   **Backend/Environment**: Node.js

## 💡 Understanding the Prototype

To test the application properly, look out for these core components:
1.  **The Interactive Dashboard (`index.html` + `app.js`)**: The visual hub where users see tasks and stats. Click buttons to see immediate frontend updates.
2.  **Mock Analytics (`analytics.js`)**: Uses local sample data to show how real graphs will behave when live databases are linked.
3.  **AI Integration (`ai-copilot.js`)**: Processes layout inputs to show how an active AI assistant can guide a user's workflow.

## ⚙️ Installation & Setup

Follow these steps to run the project locally:

1.  **Clone the repository**
    ```bash
    git clone https://github.com/NehaVGupta/Day-Flow-ClearFlow.git
    ```

2.  **Navigate into the directory**
    ```bash
    cd Day-Flow-ClearFlow
    ```

3.  **Install dependencies**
    ```bash
    npm install
    ```

4.  **Launch the application**
    ```bash
    npm start
    ```

5.  **Log in**
    Use the [Login Credentials](#-login-credentials) pattern above to sign in as HR/Admin or Employee.
