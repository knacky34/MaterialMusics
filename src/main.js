const {app, BrowserWindow, ipcMain, globalShortcut, dialog} = require('electron');
const fs = require('fs');

let mainWindow;
let settingsWindow;

function createWindow() {
  mainWindow = new BrowserWindow({width: 970, height: 620, frame: false});
  mainWindow.loadFile('src/index.html');
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  settingsWindow = new BrowserWindow({width: 700, height: 500, frame: false, show: false, parent: mainWindow, resizable: false});
  settingsWindow.loadFile('src/settings.html');
  settingsWindow.on('close', (event) => {
    event.preventDefault();
    settingsWindow.hide();
  });
  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

function toggleSettings(toggle) {
  if (!toggle && settingsWindow.isVisible()) {
    settingsWindow.hide();
  } else if (toggle && !settingsWindow.isVisible()) {
    settingsWindow.show();
  }
}

app.on('ready', () => {
  createWindow();
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    var win = BrowserWindow.getFocusedWindow();
    if (win !== null) {
      win.webContents.openDevTools();
    }
  })
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('main_settings', () => {
  fs.readFile('src/settings.json', (err, data) => {
    if (err) throw err;
    settingsWindow.webContents.send('load_settings', JSON.parse(data));
  });
  toggleSettings(true);
});

ipcMain.on('settings_close', () => {
  toggleSettings(false);
});

ipcMain.on('settings_saveToFile', (event, json) => {
  fs.writeFile('src/settings.json', JSON.stringify(json), function (err) {
    if (err) throw err;
  });
});

ipcMain.on('openDirDialog', (event) => {
  var path = dialog.showOpenDialog({properties: ['openDirectory']});
  event.returnValue = path === undefined ? "" : path[0];
});

ipcMain.on('isValidPath', (event, path) => {
  console.log(path);
  event.returnValue = fs.existsSync(path);
});
