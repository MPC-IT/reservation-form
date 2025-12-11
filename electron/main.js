const { app, BrowserWindow } = require("electron");
const path = require("path");

/**
 * Determine if we're in development mode.
 * In dev: we load http://localhost:3000
 * In prod: we would load a built app (later).
 */
const isDev = process.env.NODE_ENV === "development";

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (isDev) {
    // In dev, load Next.js dev server
    mainWindow.loadURL("http://localhost:3000");
  } else {
    // In prod, you'd point to a built version; we can wire this up later
    mainWindow.loadURL("http://localhost:3000");
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
