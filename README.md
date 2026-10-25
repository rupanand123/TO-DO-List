# TaskFlow — Modern To-Do & Productivity Dashboard

A modern, responsive, and feature-rich To-Do List web application built strictly with **HTML5**, **CSS3**, and **Vanilla JavaScript**. No frameworks, no external runtime dependencies, and no build tools required.

---

## ✨ Features

### 🎨 Design & Interface
* **Modern Dark Theme**: Designed with deep navy/black hues (`#080c15`), cyan accents (`#06b6d4`), and glassmorphism cards.
* **Dark / Light Theme Toggle**: Seamless switching between dark and light modes, preserved across sessions.
* **Smooth Animations & Micro-interactions**: Hover effects, button animations, pulse badges for urgent tasks, and celebratory transitions.
* **Fully Responsive**: Optimized for desktops, laptops, tablets, and smartphones with a collapsible drawer on mobile.

### 📊 Real-Time Dashboard Analytics
* **Dynamic Time-of-Day Greeting**: Automatically greets users (*Good morning*, *Good afternoon*, *Good evening*).
* **Live Date Display**: Formatted with current day and date.
* **Task Counters**: Total, Pending, Completed, and dynamically computed Overdue tasks.
* **Completion Progress**: Circular SVG progress ring and linear progress bar with completion percentage.
* **Productivity Summaries**: Dynamic motivational feedback that updates as you check off tasks.

### ⚡ Task Management (Full CRUD)
* **Create Tasks**: Full task creation modal with title validation, optional descriptions, categories, priorities, due dates, and due times.
* **Quick-Add Bar**: Quickly create tasks for today by typing in the input bar and pressing `Enter`.
* **Edit Tasks**: Edit any task inline through the pre-populated modal.
* **Delete Tasks**: Safe deletion with a custom confirmation dialog.
* **Completion Toggling**: Checkbox click strikes through completed items and recalculates metrics instantly.
* **Real-Time Search**: Search through task titles and descriptions.
* **Smart Filters**: Filter by *All*, *Today*, *Upcoming*, *Pending*, and *Completed*.
* **Categories**: Visual color badges for *Personal*, *College*, *Work*, *Projects*, *Shopping*, and *Other*.
* **Sorting**: Sort by Due Date (Earliest / Latest), Priority (Urgent &rarr; Low), Recently Added, or Alphabetical.

### ⏱️ Pomodoro Focus Timer
* Built-in 25-minute Pomodoro, 5-minute Short Break, and 15-minute Long Break focus timer.
* Start, pause, and reset controls with a gentle audio chime upon completion.

### 🔔 Notifications & Shortcuts
* **Toast Notification System**: Instant color-coded alerts for adding, updating, completing, or removing tasks.
* **Keyboard Shortcuts**:
  * `Enter` to submit task forms.
  * `/` to focus search from anywhere on the page.
  * `Esc` to close any open modal or drawer.

### 💾 LocalStorage Persistence
* Automatically preserves all tasks and theme settings across page reloads and browser sessions.
* Handles errors gracefully.

---

## 📁 File Structure

```text
TO-DO LIST/
├── index.html       # Semantic HTML5 markup, dashboard cards, SVG icons, and modals
├── style.css        # CSS3 variables, glassmorphism, responsive grid, and themes
├── script.js        # Vanilla JS logic, LocalStorage sync, task operations, and timer
└── README.md        # Documentation
```

---

## 🚀 Getting Started

No build tools or installation needed!

1. Clone this repository:
   ```bash
   git clone https://github.com/rupanand123/TO-DO-List.git
   ```
2. Navigate to the project directory:
   ```bash
   cd TO-DO-List
   ```
3. Open `index.html` in your web browser (Google Chrome, Firefox, Safari, Edge, etc.):
   * On Windows: double-click `index.html` or run `start index.html`
   * On macOS: `open index.html`
   * On Linux: `xdg-open index.html`

---

## 🛠️ Built With

* **HTML5**
* **CSS3** (Custom Properties, Flexbox, Grid, Glassmorphism)
* **Vanilla JavaScript** (ES6+, Web Storage API, Web Audio API)