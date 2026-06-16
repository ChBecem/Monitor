const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    },
    title: "Baby Monitor",
    icon: path.join(__dirname, 'dist', 'favicon.ico')
  });

  // Load the built React application index.html
  mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));

  // Standard clean French interface menu
  const menuTemplate = [
    {
      label: 'Fichier',
      submenu: [
        { label: 'Recharger', role: 'reload' },
        { label: 'Outils de développement', role: 'toggleDevTools' },
        { label: 'Plein Écran', role: 'togglefullscreen' },
        { type: 'separator' },
        { label: 'Quitter', click: () => { app.quit(); } }
      ]
    },
    {
      label: 'Édition',
      submenu: [
        { label: 'Annuler', role: 'undo' },
        { label: 'Rétablir', role: 'redo' },
        { type: 'separator' },
        { label: 'Couper', role: 'cut' },
        { label: 'Copier', role: 'copy' },
        { label: 'Coller', role: 'paste' },
        { label: 'Tout Sélectionner', role: 'selectAll' }
      ]
    },
    {
      label: 'Affichage',
      submenu: [
        { label: 'Zoom Avant', role: 'zoomIn' },
        { label: 'Zoom Arrière', role: 'zoomOut' },
        { label: 'Réinitialiser Zoom', role: 'resetZoom' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
