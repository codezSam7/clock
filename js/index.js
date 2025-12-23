// index.js (Staff Page)

const loginSection = document.getElementById("login");
const dashboardSection = document.getElementById("dashboard");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const userNameSpan = document.getElementById("userName");

const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileRole = document.getElementById("profileRole");
const profileDepartment = document.getElementById("profileDepartment");
const profileEmployeeId = document.getElementById("profileEmployeeId");

const clockInBtn = document.getElementById("clockInBtn");
const clockOutBtn = document.getElementById("clockOutBtn");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const switchToAdmin = document.getElementById("switchToAdmin");

const NINE_HOURS_MS = 9 * 60 * 60 * 1000;

function todayDate() {
  return new Date().toISOString().split("T")[0];
}

function getAttendance() {
  return JSON.parse(localStorage.getItem("attendance") || "[]");
}

function saveAttendance(data) {
  localStorage.setItem("attendance", JSON.stringify(data));
}

// Per-user clock state
function getUserClockState(email) {
  const state = localStorage.getItem(`clockState_${email}`);
  return state ? JSON.parse(state) : null;
}

function saveUserClockState(email, state) {
  localStorage.setItem(`clockState_${email}`, JSON.stringify(state));
}

function removeUserClockState(email) {
  localStorage.removeItem(`clockState_${email}`);
}

// New: Save and load full staff profile
function saveStaffProfile(profile) {
  localStorage.setItem("staffProfile", JSON.stringify(profile));
}

function getStaffProfile() {
  const saved = localStorage.getItem("staffProfile");
  return saved ? JSON.parse(saved) : null;
}

function showDashboard() {
  loginSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");

  const currentEmail = localStorage.getItem("email");
  const currentName = localStorage.getItem("username");

  userNameSpan.textContent = currentName || "User";

  // Load profile from saved data (persistent across logins)
  const savedProfile = getStaffProfile();

  if (savedProfile && savedProfile.email === currentEmail) {
    // Use saved profile
    profileName.value = savedProfile.name;
    profileEmail.value = savedProfile.email;
    profileRole.value = savedProfile.role;
    profileDepartment.value = savedProfile.department;
    profileEmployeeId.value = savedProfile.employeeId;
  } else {
    // First time or new user — use login data
    let attendance = getAttendance();
    const existingRecord = attendance.find((r) => r.email === currentEmail);

    const employeeId =
      existingRecord?.employeeId ||
      "EMP" + String(attendance.length + 1).padStart(3, "0");

    profileName.value = currentName || "";
    profileEmail.value = currentEmail || "";
    profileRole.value = "Senior Developer";
    profileDepartment.value = "IT";
    profileEmployeeId.value = employeeId;
  }

  updateButtons();
}

function showLogin() {
  dashboardSection.classList.add("hidden");
  loginSection.classList.remove("hidden");
  usernameInput.value = "";
  emailInput.value = "";
}

function updateButtons() {
  const email = localStorage.getItem("email");
  if (!email) {
    clockInBtn.style.display = "block";
    clockOutBtn.style.display = "none";
    return;
  }

  const state = getUserClockState(email);
  const today = todayDate();

  if (state && state.date === today) {
    clockInBtn.style.display = "none";
    clockOutBtn.style.display = "block";
    const timePassed = Date.now() - state.timestamp;
    clockOutBtn.disabled = timePassed < NINE_HOURS_MS;
  } else {
    clockInBtn.style.display = "block";
    clockOutBtn.style.display = "none";
    clockOutBtn.disabled = true;
  }
}

// Login
loginBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();

  if (!username || !email) {
    alert("All fields are required.");
    return;
  }
  if (!email.includes("@") || !email.includes(".")) {
    alert("Please enter a valid email address.");
    return;
  }

  localStorage.setItem("username", username);
  localStorage.setItem("email", email);
  showDashboard();
});

// Clock In
clockInBtn.addEventListener("click", () => {
  const username = profileName.value.trim() || localStorage.getItem("username");
  const email = profileEmail.value.trim() || localStorage.getItem("email");
  const role = profileRole.value.trim() || "Senior Developer";
  const department = profileDepartment.value.trim() || "IT";
  const employeeId = profileEmployeeId.value.trim();

  const today = todayDate();
  let attendance = getAttendance();

  if (
    attendance.some((r) => r.date === today && r.email === email && !r.clockOut)
  ) {
    alert("You have already clocked in today!");
    return;
  }

  const newRecord = {
    date: today,
    name: username,
    email: email,
    role: role,
    department: department,
    employeeId:
      employeeId || "EMP" + String(attendance.length + 1).padStart(3, "0"),
    clockIn: new Date().toLocaleTimeString(),
    clockOut: null,
  };

  attendance.push(newRecord);
  saveAttendance(attendance);

  saveUserClockState(email, { date: today, timestamp: Date.now() });

  // Update session name in case it changed
  localStorage.setItem("username", username);

  alert("Clock-in successful!");
  updateButtons();
});

// Clock Out
clockOutBtn.addEventListener("click", () => {
  if (clockOutBtn.disabled) {
    alert("You must work at least 9 hours before clocking out.");
    return;
  }

  const email = localStorage.getItem("email");
  const today = todayDate();
  let attendance = getAttendance();

  const record = attendance.find((r) => r.date === today && r.email === email);
  if (record) {
    record.clockOut = new Date().toLocaleTimeString();
    saveAttendance(attendance);
  }

  removeUserClockState(email);
  alert("Clock-out successful!");
  updateButtons();
});

// NEW: Save Profile Button
saveProfileBtn.addEventListener("click", () => {
  const name = profileName.value.trim();
  const email = profileEmail.value.trim().toLowerCase();
  const role = profileRole.value.trim();
  const department = profileDepartment.value.trim();
  const employeeId = profileEmployeeId.value.trim();

  if (!name || !email || !role || !department || !employeeId) {
    alert("Please fill in all profile fields.");
    return;
  }

  if (!email.includes("@") || !email.includes(".")) {
    alert("Please enter a valid email.");
    return;
  }

  // Update current session
  localStorage.setItem("username", name);
  localStorage.setItem("email", email);
  userNameSpan.textContent = name;

  // Save full profile persistently
  const profile = { name, email, role, department, employeeId };
  saveStaffProfile(profile);

  // Update ALL past and future attendance records for this email
  let attendance = getAttendance();
  attendance = attendance.map((record) => {
    if (
      record.email === localStorage.getItem("email") ||
      record.email === email
    ) {
      return { ...record, name, email, role, department, employeeId };
    }
    return record;
  });
  saveAttendance(attendance);

  alert("Profile updated successfully!");
});

// Logout
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("username");
  localStorage.removeItem("email");
  showLogin();
});

// Switch to Admin
switchToAdmin?.addEventListener("click", () => {
  window.location.href = "admin.html";
});

// Auto-login if already logged in
if (localStorage.getItem("username") && localStorage.getItem("email")) {
  showDashboard();
}

// Update clock buttons every second
setInterval(updateButtons, 1000);
