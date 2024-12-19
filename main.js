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

// qpdfバイナリのパスを取得する関数
function getQpdfPath() {
  // 開発環境とプロダクション環境でのパスの違いを考慮
  const isDev = !app.isPackaged;
  const platform = process.platform;
  
  let qpdfPath;
  if (isDev) {
    // 開発環境では直接binディレクトリを参照
    qpdfPath = path.join(__dirname, 'bin');
  } else {
    // プロダクション環境ではextraResourcesを参照
    qpdfPath = path.join(process.resourcesPath, 'bin');
  }

  // プラットフォーム別のバイナリパス
  switch (platform) {
    case 'win32':
      return path.join(qpdfPath, 'qpdf-11.6.3-windows-x64', 'bin', 'qpdf.exe');
    case 'darwin':
      return path.join(qpdfPath, 'usr', 'local', 'bin', 'qpdf');
    case 'linux':
      return path.join(qpdfPath, 'qpdf-11.6.3', 'bin', 'qpdf');
    default:
      throw new Error('未対応のプラットフォームです');
  }
}

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

    // バンドルされたqpdfバイナリを使用してパスワード解除を実行
    const qpdfPath = getQpdfPath();
    const command = `"${qpdfPath}" --password=${password} --decrypt "${filePath}" "${outputPath}"`;
    
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
