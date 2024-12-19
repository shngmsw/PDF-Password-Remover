const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// qpdfのバージョン
const QPDF_VERSION = '11.6.3';

// プラットフォーム別のダウンロードURL
const DOWNLOAD_URLS = {
  win32: `https://github.com/qpdf/qpdf/releases/download/v${QPDF_VERSION}/qpdf-${QPDF_VERSION}-windows-x64.zip`,
  darwin: `https://github.com/qpdf/qpdf/releases/download/v${QPDF_VERSION}/qpdf-${QPDF_VERSION}-x86_64.pkg`,
  linux: `https://github.com/qpdf/qpdf/releases/download/v${QPDF_VERSION}/qpdf-${QPDF_VERSION}-x86_64.tar.gz`
};

// バイナリの保存先ディレクトリ
const binDir = path.join(__dirname, '..', 'bin');

// プラットフォームに応じたダウンロードとインストール
async function downloadAndInstallQpdf() {
  const platform = os.platform();
  const downloadUrl = DOWNLOAD_URLS[platform];

  if (!downloadUrl) {
    console.error('未対応のプラットフォームです');
    process.exit(1);
  }

  // binディレクトリの作成
  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }

  const downloadPath = path.join(binDir, path.basename(downloadUrl));

  // ダウンロード
  await new Promise((resolve, reject) => {
    console.log(`qpdfのダウンロード中... ${downloadUrl}`);
    const file = fs.createWriteStream(downloadPath);
    https.get(downloadUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(downloadPath, () => reject(err));
    });
  });

  console.log('ダウンロード完了');

  // プラットフォーム別の展開処理
  try {
    switch (platform) {
      case 'win32':
        // Windowsの場合は.zipを展開
        execSync(`powershell Expand-Archive -Path "${downloadPath}" -DestinationPath "${binDir}" -Force`);
        break;
      case 'darwin':
        // macOSの場合は.pkgから必要なファイルを抽出
        const tempDir = path.join(binDir, 'temp');
        fs.mkdirSync(tempDir, { recursive: true });
        execSync(`pkgutil --expand "${downloadPath}" "${tempDir}"`);
        execSync(`tar -xf "${tempDir}/qpdf.pkg/Payload" -C "${binDir}"`);
        fs.rmSync(tempDir, { recursive: true });
        break;
      case 'linux':
        // Linuxの場合は.tar.gzを展開
        execSync(`tar -xzf "${downloadPath}" -C "${binDir}"`);
        break;
    }
    console.log('展開完了');
  } catch (error) {
    console.error('展開中にエラーが発生しました:', error);
    process.exit(1);
  }

  // ダウンロードしたアーカイブを削除
  fs.unlinkSync(downloadPath);
}

downloadAndInstallQpdf().catch(console.error);
