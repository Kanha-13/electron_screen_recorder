const { app, BrowserWindow, ipcMain, desktopCapturer, Menu, dialog } = require('electron');
const { writeFile } = require('fs');
const path = require('path');
ipcMain.handle('OPEN_WINDOW_LIST', (event, opts) => getVideoSources())

ipcMain.on("show:dialog", async (e, buffer) => {
  const { filePath } = await dialog.showSaveDialog({
    buttonLabel: "save video",
    defaultPath: `video-${Date.now()}.webm`
  })
  writeFile(filePath, buffer, () => console.log('video saved successfully!'))
})

let mainWindow;

async function selectSource(source) {
  mainWindow.webContents.send('menuOpened', source);
}


async function getVideoSources() {
  const inputSources = await desktopCapturer.getSources({ types: ['window', 'screen'] })
  const videoOptionMenu = Menu.buildFromTemplate(inputSources.map(source => {
    return {
      label: source.name,
      click: () => selectSource(source)
    }
  }));
  videoOptionMenu.popup()
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
