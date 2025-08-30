// Load HTML module into main content area
function loadModule(moduleName) {
  fetch(`modules/${moduleName}.html`)
    .then(res => res.text())
    .then(data => {
      document.getElementById('mainContent').innerHTML = data;
    });
}

// Toggle visibility of a game container
function toggleGame(id) {
  const game = document.getElementById(id);
  game.classList.toggle('hidden');
}

// Pomodoro Timer Logic
let timer;
let timeLeft = 1500; // 25 minutes in seconds
let isRunning = false;

function startTimer() {
  clearInterval(timer);
  timeLeft = 1500;
  isRunning = true;
  updateTimerDisplay();

  timer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      clearInterval(timer);
      isRunning = false;
      document.getElementById('timerDisplay').innerText = "✅ Session Complete!";
    }
  }, 1000);
}

function pauseTimer() {
  if (!isRunning) return;
  clearInterval(timer);
  isRunning = false;
  document.getElementById('timerDisplay').innerText += " ⏸️ Paused";
}

function stopTimer() {
  clearInterval(timer);
  timeLeft = 1500;
  isRunning = false;
  updateTimerDisplay();
  document.getElementById('timerDisplay').innerText += " ⏹️ Stopped";
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.getElementById('timerDisplay').innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Open game modal and load iframe dynamically
function openGame(gameId) {
  const gameLinks = {
    zenGarden: "https://example.com/zen-garden",
    breathSync: "modules/breath-sync/index.html",
    moodMatch: "https://example.com/mood-match",
    cloudDrift: "https://example.com/cloud-drift",
    gameLauncher: "modules/games/launcher.html" // ✅ Added CalmPlay launcher
  };

  const iframe = document.getElementById("gameFrame");
  iframe.src = gameLinks[gameId];
  document.getElementById("gameModal").classList.remove("hidden");
}

// Close game modal and reset iframe
function closeGame() {
  document.getElementById("gameModal").classList.add("hidden");
  document.getElementById("gameFrame").src = "";
}

// Show CalmPlay launcher inline (for table-based layout)
function openGameLauncher() {
  const row = document.getElementById("game-launcher-row");
  if (row) row.style.display = "table-row";
}

// Wait for DOM to load before wiring up Breath Sync trigger
document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBreathingBtn");
  const iframe = document.getElementById("breathSyncFrame");

  if (startBtn && iframe) {
    startBtn.addEventListener("click", () => {
      iframe.contentWindow.postMessage("startBreathSync", "*");
    });
  }
});

// Splash screen logic
window.addEventListener('load', () => {
  const splash = document.getElementById('splash-screen');
  setTimeout(() => {
    splash.style.opacity = '0';
    splash.style.pointerEvents = 'none'; // Prevent blocking
    splash.style.zIndex = '-1'; // Push behind everything
    setTimeout(() => {
      splash.style.display = 'none'; // Optional: remove completely
    }, 1000);
  }, 2000);
});

// Modal logic
const avatarBtn = document.getElementById('avatar-btn');
const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');

avatarBtn.addEventListener('click', () => {
  loginModal.classList.remove('hidden');
});

loginModal.addEventListener('click', (e) => {
  if (e.target === loginModal) loginModal.classList.add('hidden');
});

signupModal.addEventListener('click', (e) => {
  if (e.target === signupModal) signupModal.classList.add('hidden');
});

function showSignup() {
  loginModal.classList.add('hidden');
  signupModal.classList.remove('hidden');
}

function showLogin() {
  signupModal.classList.add('hidden');
  loginModal.classList.remove('hidden');
}

// Login logic
document.getElementById('login-btn').addEventListener('click', () => {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  if (username && password) {
    alert(`Welcome back, ${username}!`);
    loginModal.classList.add('hidden');
  } else {
    alert('Please enter both username and password.');
  }
});

// Signup logic
document.getElementById('signup-btn').addEventListener('click', () => {
  const username = document.getElementById('signup-username').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  if (username && email && password) {
    alert(`Account created for ${username}!`);
    signupModal.classList.add('hidden');
  } else {
    alert('Please fill in all fields.');
  }
});