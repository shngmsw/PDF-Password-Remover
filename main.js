const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

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
    const outputPath = path.join(
      path.dirname(filePath),
      `decrypted_${path.basename(filePath)}`
    );

    // qpdfコマンドを使用してパスワード解除を実行
    const command = `qpdf --password=${password} --decrypt "${filePath}" "${outputPath}"`;
    
    await execPromise(command);
    return { success: true, outputPath };
  } catch (error) {
    console.error('PDF処理エラー:', error);
    
    // qpdfのエラーメッセージからパスワードエラーを判定
    const isPasswordError = error.message.includes('invalid password');
    
    return { 
      success: false, 
      error: isPasswordError ? 'パスワードが正しくありません' : 'PDFの処理中にエラーが発生しました'
    };
  }
});
