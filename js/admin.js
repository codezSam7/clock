// admin.js

const loginSection = document.getElementById("login");
const dashboardSection = document.getElementById("dashboard");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const staffTableBody = document.getElementById("staffTableBody");
const totalStaffEl = document.getElementById("totalStaff");
const workingNowEl = document.getElementById("workingNow");

function todayDate() {
  return new Date().toISOString().split("T")[0];
}

function getAllAttendance() {
  return JSON.parse(localStorage.getItem("attendance") || "[]");
}

function renderAttendanceTable() {
  const attendance = getAllAttendance();
  const today = todayDate();

  // Filter only today's attendance records
  const todayRecords = attendance.filter((record) => record.date === today);

  // Clear table
  if (staffTableBody) {
    staffTableBody.innerHTML = "";
  }

  let workingCount = 0;

  todayRecords.forEach((record) => {
    const statusClass = record.clockOut ? "absent" : "present";
    const statusText = record.clockOut ? "Clocked Out" : "Working";

    if (!record.clockOut) {
      workingCount++;
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${record.name || "Unknown"}</td>
      <td>${record.email || "--"}</td>
      <td>${record.role || "N/A"}</td>
      <td>${record.department || "N/A"}</td>
      <td>${record.employeeId || "N/A"}</td>
      <td>${record.clockIn || "--"}</td>
      <td>${record.clockOut || "--"}</td>
      <td><span class="status ${statusClass}">${statusText}</span></td>
    `;

    staffTableBody.appendChild(row);
  });

  // Update the summary counts
  if (totalStaffEl) {
    totalStaffEl.textContent = todayRecords.length;
  }
  if (workingNowEl) {
    workingNowEl.textContent = workingCount;
  }
}

function showDashboard() {
  loginSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");

  const user = localStorage.getItem("username");
  const email = localStorage.getItem("email");

  // Optional: Fill admin profile fields if they exist
  const adminNameInput = document.getElementById("adminName");
  const adminEmailInput = document.getElementById("adminEmail");
  if (adminNameInput) adminNameInput.value = user || "Admin";
  if (adminEmailInput) adminEmailInput.value = email || "admin@company.com";

  renderAttendanceTable(); // Initial load
}

function showLogin() {
  dashboardSection.classList.add("hidden");
  loginSection.classList.remove("hidden");
  usernameInput.value = "";
  emailInput.value = "";
}

// Admin Login (hardcoded credentials)
if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();

    if (username === "admin" && email === "admin123@gmail.com") {
      localStorage.setItem("username", username);
      localStorage.setItem("email", email);
      showDashboard();
    } else {
      alert("Invalid admin credentials");
    }
  });
}

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    showLogin();
  });
}

// Auto-login if already authenticated as admin
if (localStorage.getItem("username") === "admin") {
  showDashboard();
}

// Live refresh: Update table every 10 seconds (catches clock-ins from other tabs/windows)
setInterval(() => {
  if (!dashboardSection.classList.contains("hidden")) {
    renderAttendanceTable();
  }
}, 10000);

// Switch to Staff Login Page
document.getElementById("switchToStaff")?.addEventListener("click", () => {
  window.location.href = "index.html"; // or your staff page filename
});
