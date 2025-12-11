const { app, BrowserWindow } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");

// 🔁 Replace this with your real live URL:
const PROD_URL = `file://${path.join(__dirname, '../out/index.html')}`;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    },
    show: false // Don't show until ready-to-show
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : 'http://localhost:3001'; // Production will run Next.js server on port 3001

  console.log('Loading URL:', startUrl);
  mainWindow.loadURL(startUrl);

  // Show window when content is loaded
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle loading errors
  mainWindow.webContents.on('did-fail-load', () => {
    console.log('Failed to load, retrying...');
    setTimeout(() => {
      mainWindow.loadURL(startUrl);
    }, 1000);
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  // On Windows, quit when all windows are closed
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // macOS: recreate a window if the app is re-activated and no window exists
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
