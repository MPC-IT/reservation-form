const { app, BrowserWindow } = require("electron");
const path = require("path");

/**
 * Determine if we're in development mode.
 * In dev: we load http://localhost:3000 (your Next.js dev server)
 * In prod: we load the hosted live app URL.
 */
const isDev = process.env.NODE_ENV === "development";

// 🔁 Replace this with your real live URL:
const PROD_URL = "https://your-production-url.example.com";

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
    },
  });

  if (isDev) {
    // Dev: use local Next.js dev server
    mainWindow.loadURL("http://localhost:3000");
  } else {
    // Prod: use your hosted web app
    mainWindow.loadURL(PROD_URL);
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
