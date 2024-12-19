const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');
  
  // 開発ツールを無効化（プロダクション環境用）
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// PDFファイル選択のハンドラー
ipcMain.handle('select-pdf', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
  });
  
  if (!result.canceled) {
    return result.filePaths[0];
  }
  return null;
});

// PDFパスワード解除のハンドラー
ipcMain.handle('unlock-pdf', async (event, { filePath, password }) => {
  try {
    const pdfBytes = await fs.promises.readFile(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes, { 
      password,
      ignoreEncryption: true 
    });
    
    const outputPath = path.join(
      path.dirname(filePath),
      `decrypted_${path.basename(filePath)}`
    );
    
    const savedBytes = await pdfDoc.save();
    await fs.promises.writeFile(outputPath, savedBytes);
    
    return { success: true, outputPath };
  } catch (error) {
    return { 
      success: false, 
      error: error.message.includes('password') ? 'パスワードが正しくありません' : error.message 
    };
  }
});
