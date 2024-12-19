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
      return path.join(qpdfPath, 'qpdf.exe');
    case 'darwin':
    case 'linux':
      return path.join(qpdfPath, 'qpdf');
    default:
      throw new Error('未対応のプラットフォームです');
  }
}

// パスをエスケープする関数
function escapePath(pathStr) {
  if (process.platform === 'win32') {
    // Windowsの場合、パスに空白が含まれていれば引用符で囲む
    return pathStr.includes(' ') ? `"${pathStr}"` : pathStr;
  }
  // Unix系の場合、空白文字をエスケープ
  return pathStr.replace(/ /g, '\\ ');
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
    
    // Windows環境での文字化け対策
    const options = process.platform === 'win32' ? { encoding: 'utf8', shell: true } : {};
    
    // コマンドの構築
    const escapedQpdfPath = escapePath(qpdfPath);
    const escapedFilePath = escapePath(filePath);
    const escapedOutputPath = escapePath(outputPath);
    const escapedPassword = password.replace(/[&<>'"]/g, '\\$&'); // 特殊文字のエスケープ
    
    const command = `${escapedQpdfPath} --password=${escapedPassword} --decrypt ${escapedFilePath} ${escapedOutputPath}`;
    
    await execPromise(command, options);
    return { success: true, outputPath };
  } catch (error) {
    console.error('PDF処理エラー:', error);
    
    // エラーメッセージの解析を改善
    const errorMessage = error.message.toLowerCase();
    const isPasswordError = errorMessage.includes('invalid password') || 
                          errorMessage.includes('password incorrect') ||
                          errorMessage.includes('パスワードが正しくありません');
    
    return { 
      success: false, 
      error: isPasswordError ? 'パスワードが正しくありません' : 'PDFの処理中にエラーが発生しました'
    };
  }
});
