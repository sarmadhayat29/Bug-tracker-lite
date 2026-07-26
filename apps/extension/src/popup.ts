import { auth, db, storage } from './firebase';
import { signIn, signOut } from './auth';
import { onAuthStateChanged, User } from 'firebase/auth';
import { BugSeverity, createBug } from '@bug-tracker/shared';

// UI Elements
const viewLoading = document.getElementById('view-loading')!;
const viewLogin = document.getElementById('view-login')!;
const viewReport = document.getElementById('view-report')!;
const authStateDiv = document.getElementById('auth-state')!;

const loginForm = document.getElementById('login-form') as HTMLFormElement;
const loginEmail = document.getElementById('login-email') as HTMLInputElement;
const loginPassword = document.getElementById('login-password') as HTMLInputElement;
const loginSubmit = document.getElementById('login-submit') as HTMLButtonElement;
const loginError = document.getElementById('login-error')!;

const reportForm = document.getElementById('report-form') as HTMLFormElement;
const bugTitle = document.getElementById('bug-title') as HTMLInputElement;
const bugSeverity = document.getElementById('bug-severity') as HTMLSelectElement;
const reportSubmit = document.getElementById('report-submit') as HTMLButtonElement;
const reportError = document.getElementById('report-error')!;
const reportSuccess = document.getElementById('report-success')!;

const canvas = document.getElementById('annotation-canvas') as HTMLCanvasElement;
const canvasLoading = document.getElementById('canvas-loading')!;

let currentUser: User | null = null;
let screenshotBlob: Blob | null = null;
let currentUrl: string | null = null;

// --- View Management ---
function showView(view: HTMLElement) {
  viewLoading.classList.add('hidden');
  viewLogin.classList.add('hidden');
  viewReport.classList.add('hidden');
  view.classList.remove('hidden');
}

// --- Auth Logic ---
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    authStateDiv.innerHTML = `<button id="btn-logout" class="logout-btn">Log out</button>`;
    document.getElementById('btn-logout')?.addEventListener('click', () => signOut());
    showView(viewReport);
    initCapture();
  } else {
    authStateDiv.innerHTML = '';
    showView(viewLogin);
  }
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginSubmit.disabled = true;
  loginError.classList.add('hidden');
  try {
    await signIn(loginEmail.value, loginPassword.value);
  } catch (err: any) {
    loginError.textContent = err.message;
    loginError.classList.remove('hidden');
    loginSubmit.disabled = false;
  }
});

// --- Capture & Canvas Logic ---
async function initCapture() {
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    // Get active tab URL
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      currentUrl = tabs[0].url || null;
      if (tabs[0].title) bugTitle.value = `Bug on: ${tabs[0].title}`;
    }

    // Capture screen
    chrome.tabs.captureVisibleTab((dataUrl) => {
      if (chrome.runtime.lastError || !dataUrl) {
        canvasLoading.textContent = 'Capture failed.';
        return;
      }
      canvasLoading.classList.add('hidden');
      canvas.classList.remove('hidden');
      loadCanvas(dataUrl);
    });
  }
}

function loadCanvas(dataUrl: string) {
  const ctx = canvas.getContext('2d')!;
  const img = new Image();
  img.onload = () => {
    // scale to fit container (400px width approx)
    const MAX_W = 366;
    let w = img.width;
    let h = img.height;
    if (w > MAX_W) {
      h = Math.round((h * MAX_W) / w);
      w = MAX_W;
    }
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);

    // Save blob immediately
    saveBlob();
    setupDrawing();
  };
  img.src = dataUrl;
}

function saveBlob() {
  canvas.toBlob((blob) => {
    screenshotBlob = blob;
  }, 'image/png');
}

function setupDrawing() {
  let isDrawing = false;
  const ctx = canvas.getContext('2d')!;

  canvas.addEventListener('pointerdown', (e) => {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#ef4444'; // Red
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    ctx.lineTo(x, y);
    ctx.stroke();
  });

  const stopDrawing = () => {
    if (isDrawing) {
      isDrawing = false;
      saveBlob(); // update blob on stroke end
    }
  };
  canvas.addEventListener('pointerup', stopDrawing);
  canvas.addEventListener('pointerout', stopDrawing);
}

// --- Submit Logic ---
reportForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser) return;

  reportSubmit.disabled = true;
  reportSubmit.textContent = 'Uploading...';
  reportError.classList.add('hidden');

  try {
    await createBug(
      db,
      storage,
      {
        title: bugTitle.value,
        description: 'Captured via Chrome Extension.',
        severity: bugSeverity.value as BugSeverity,
        pageUrl: currentUrl,
        createdBy: currentUser.uid,
      },
      screenshotBlob,
      'extension'
    );

    reportForm.reset();
    reportForm.classList.add('hidden');
    reportSuccess.classList.remove('hidden');

    // Auto close popup
    setTimeout(() => window.close(), 1500);
  } catch (err: any) {
    reportError.textContent = err.message;
    reportError.classList.remove('hidden');
    reportSubmit.disabled = false;
    reportSubmit.textContent = 'Submit Bug';
  }
});
