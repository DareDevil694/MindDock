const canvas = document.getElementById('sandCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth > 600 ? 400 : window.innerWidth - 40;
canvas.height = canvas.width;
const cols = canvas.width;
const rows = canvas.height;
let grid = Array.from({ length: rows }, () => Array(cols).fill(null));

// UI elements
const colorPicker = document.getElementById('colorPicker');
const brushSizeSlider = document.getElementById('brushSize');
const resetBtn = document.getElementById('resetBtn');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const saveBtn = document.getElementById('saveBtn');
const galleryBtn = document.getElementById('galleryBtn');
const symmetryToggle = document.getElementById('symmetryToggle');
const zenAudio = document.getElementById('zenAudio');
const muteBtn = document.getElementById('muteBtn');
const dailyQuote = document.getElementById('dailyQuote');
const galleryModal = document.getElementById('galleryModal');
const galleryGrid = document.getElementById('galleryGrid');
const closeGallery = document.getElementById('closeGallery');

// Preferences and state
let brushColor = localStorage.getItem('brushColor') || colorPicker.value;
let brushSize = parseInt(localStorage.getItem('brushSize')) || parseInt(brushSizeSlider.value);
let symmetryMode = localStorage.getItem('symmetryMode') === 'true';
let isMuted = false;
let gallery = JSON.parse(localStorage.getItem('gallery') || '[]');
let undoStack = [];
let redoStack = [];

colorPicker.value = brushColor;
brushSizeSlider.value = brushSize;
symmetryToggle.checked = symmetryMode;

// Daily quote
const quotes = [
  "“Let your thoughts fall like grains of sand.”",
  "“Stillness is where creativity begins.”",
  "“Draw what you feel, not what you see.”",
  "“Each grain is a breath, each stroke a moment.”",
  "“Flow with intention, not perfection.”",
  "“The canvas is your calm.”",
  "“Let go. Let flow.”",
  "“Balance is found in motion.”"
];
dailyQuote.textContent = quotes[Math.floor(Math.random() * quotes.length)];

// Utility functions
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  const bigint = parseInt(hex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function cloneGrid() {
  return grid.map(row => [...row]);
}

function restoreGrid(snapshot) {
  grid = snapshot.map(row => [...row]);
}

function drawSand(x, y) {
  undoStack.push(cloneGrid());
  redoStack = [];
  for (let dy = -brushSize; dy <= brushSize; dy++) {
    for (let dx = -brushSize; dx <= brushSize; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
        grid[ny][nx] = brushColor;
      }
    }
  }
}

function handleDraw(x, y) {
  drawSand(x, y);
  if (symmetryMode) {
    const mirrorX = cols - x;
    drawSand(mirrorX, y);
  }
}

function draw() {
  ctx.clearRect(0, 0, cols, rows);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const baseColor = grid[y][x];
      if (baseColor) {
        const grain = Math.floor(Math.random() * 30) - 15;
        const rgb = hexToRgb(baseColor);
        const r = clamp(rgb.r + grain, 0, 255);
        const g = clamp(rgb.g + grain, 0, 255);
        const b = clamp(rgb.b + grain, 0, 255);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
}

function update() {
  for (let y = rows - 2; y >= 0; y--) {
    for (let x = 1; x < cols - 1; x++) {
      if (grid[y][x] && !grid[y + 1][x]) {
        grid[y + 1][x] = grid[y][x];
        grid[y][x] = null;
      }
    }
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// Event listeners
canvas.addEventListener('pointermove', (e) => {
  if (e.buttons !== 1) return;
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor(e.clientX - rect.left);
  const y = Math.floor(e.clientY - rect.top);
  handleDraw(x, y);
});

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  for (let i = 0; i < e.touches.length; i++) {
    const touch = e.touches[i];
    const x = Math.floor(touch.clientX - rect.left);
    const y = Math.floor(touch.clientY - rect.top);
    handleDraw(x, y);
  }
}, { passive: false });

resetBtn.addEventListener('click', () => {
  undoStack.push(cloneGrid());
  grid = Array.from({ length: rows }, () => Array(cols).fill(null));
});

undoBtn.addEventListener('click', () => {
  if (undoStack.length > 0) {
    redoStack.push(cloneGrid());
    restoreGrid(undoStack.pop());
  }
});

redoBtn.addEventListener('click', () => {
  if (redoStack.length > 0) {
    undoStack.push(cloneGrid());
    restoreGrid(redoStack.pop());
  }
});

saveBtn.addEventListener('click', () => {
  const dataURL = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = 'zenflow-artwork.png';
  link.href = dataURL;
  link.click();
  gallery.push(dataURL);
  localStorage.setItem('gallery', JSON.stringify(gallery));
});

galleryBtn.addEventListener('click', () => {
  galleryGrid.innerHTML = '';
  if (gallery.length === 0) {
    galleryGrid.innerHTML = "<p style='color:#ccc;'>No saved artworks yet.</p>";
  } else {
    gallery.forEach((imgSrc, index) => {
      const item = document.createElement('div');
      item.className = 'item';

      const img = document.createElement('img');
      img.src = imgSrc;
      img.alt = `Artwork ${index + 1}`;
      img.title = `Artwork ${index + 1}`;

      const delBtn = document.createElement('button');
      delBtn.textContent = '✕';
      delBtn.onclick = () => {
        gallery.splice(index, 1);
        localStorage.setItem('gallery', JSON.stringify(gallery));
        galleryBtn.click(); // Refresh gallery
      };

      item.appendChild(img);
      item.appendChild(delBtn);
      galleryGrid.appendChild(item);
    });
  }
  galleryModal.classList.remove('hidden');
});

closeGallery.addEventListener('click', () => {
  galleryModal.classList.add('hidden');
});

muteBtn.addEventListener('click', () => {
  isMuted = !isMuted;
  zenAudio.muted = isMuted;
  muteBtn.textContent = isMuted ? '🔇' : '🔈';
});

zenAudio.volume = 0.4;
document.body.addEventListener('click', () => {
  zenAudio.play().catch(() => {});
}, { once: true });

colorPicker.addEventListener('input', () => {
  brushColor = colorPicker.value;
  localStorage.setItem('brushColor', brushColor);
});

brushSizeSlider.addEventListener('input', () => {
  brushSize = parseInt(brushSizeSlider.value);
  localStorage.setItem('brushSize', brushSize);
});

symmetryToggle.addEventListener('change', () => {
  symmetryMode = symmetryToggle.checked;
  localStorage.setItem('symmetryMode', symmetryMode);
});

loop();
