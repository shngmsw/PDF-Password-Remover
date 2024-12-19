const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');
const https = require('https');
const { createWriteStream } = require('fs');
const { pipeline } = require('stream/promises');
const { Extract } = require('unzipper');

// バイナリの保存先ディレクトリ
const binDir = path.join(__dirname, '..', 'bin');
const libDir = path.join(__dirname, '..', 'lib');

// QPDFのバージョンとダウンロードURL
const QPDF_VERSION = '11.4.0';
const WINDOWS_DOWNLOAD_URL = `https://sourceforge.net/projects/qpdf/files/qpdf/${QPDF_VERSION}/qpdf-${QPDF_VERSION}-mingw64.zip/download`;
const MACOS_DOWNLOAD_URL = `https://sourceforge.net/projects/qpdf/files/qpdf/${QPDF_VERSION}/qpdf-${QPDF_VERSION}-darwin-x86_64.zip/download`;

// ファイルをダウンロードする関数（リダイレクトに対応）
async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    console.log(`ダウンロードURL: ${url}`);
    const request = https.get(url, response => {
      // リダイレクトの処理
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        console.log(`リダイレクト先: ${redirectUrl}`);
        downloadFile(redirectUrl, destPath)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Download failed with status code: ${response.statusCode}`));
        return;
      }

      const fileStream = createWriteStream(destPath);
      pipeline(response, fileStream)
        .then(() => resolve())
        .catch(reject);
    });

    request.on('error', reject);
    
    // タイムアウトの設定
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Download timeout'));
    });
  });
}

// プラットフォームに応じたインストール
async function installQpdf() {
  const platform = os.platform();

  // 必要なディレクトリの作成
  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }

  try {
    switch (platform) {
      case 'darwin':
        // macOSの場合、SourceForgeからダウンロード
        console.log('macOSのqpdfバイナリをダウンロードします...');
        
        const macosTempDir = path.join(os.tmpdir(), 'qpdf-temp-macos');
        const macosZipPath = path.join(macosTempDir, 'qpdf.zip');

        // 一時ディレクトリの作成
        if (!fs.existsSync(macosTempDir)) {
          fs.mkdirSync(macosTempDir, { recursive: true });
        }

        try {
          // QPDFのダウンロードと展開
          console.log(`QPDFバージョン${QPDF_VERSION}をダウンロード中...`);
          await downloadFile(MACOS_DOWNLOAD_URL, macosZipPath);

          console.log('ダウンロードしたファイルを展開中...');
          await fs.createReadStream(macosZipPath)
            .pipe(Extract({ path: macosTempDir }))
            .promise();

          // 必要なファイルをコピー
          const qpdfBinDir = path.join(macosTempDir, `qpdf-${QPDF_VERSION}-darwin-x86_64`, 'bin');
          const files = fs.readdirSync(qpdfBinDir);

          console.log('必要なファイルをコピー中...');
          for (const file of files) {
            if (file.startsWith('qpdf')) {
              const srcPath = path.join(qpdfBinDir, file);
              const destPath = path.join(binDir, file);
              fs.copyFileSync(srcPath, destPath);
              execSync(`chmod +x "${destPath}"`);
              console.log(`コピー完了: ${file}`);
            }
             if (file.endsWith('.dylib')) {
              const srcPath = path.join(qpdfBinDir, file);
              const destPath = path.join(libDir, file);
              fs.copyFileSync(srcPath, destPath);
              console.log(`コピー完了: ${file}`);
            }
          }

          console.log('一時ファイルを削除中...');
          fs.rmSync(macosTempDir, { recursive: true, force: true });

          console.log('macOS用QPDFのインストールが完了しました');
        } catch (error) {
          console.error('QPDFのインストール中にエラーが発生しました:', error);
          throw error;
        }
        break;

      case 'win32':
        console.log('Windowsのqpdfバイナリをダウンロードします...');
        
        const tempDir = path.join(os.tmpdir(), 'qpdf-temp');
        const zipPath = path.join(tempDir, 'qpdf.zip');

        // 一時ディレクトリの作成
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }

        try {
          // QPDFのダウンロードと展開
          console.log(`QPDFバージョン${QPDF_VERSION}をダウンロード中...`);
          await downloadFile(WINDOWS_DOWNLOAD_URL, zipPath);

          console.log('ダウンロードしたファイルを展開中...');
          await fs.createReadStream(zipPath)
            .pipe(Extract({ path: tempDir }))
            .promise();

          // 必要なファイルをコピー
          const qpdfBinDir = path.join(tempDir, `qpdf-${QPDF_VERSION}-mingw64`, 'bin');
          const files = fs.readdirSync(qpdfBinDir);

          console.log('必要なファイルをコピー中...');
          for (const file of files) {
            if (file.endsWith('.exe') || file.endsWith('.dll')) {
              const srcPath = path.join(qpdfBinDir, file);
              const destPath = path.join(binDir, file);
              fs.copyFileSync(srcPath, destPath);
              console.log(`コピー完了: ${file}`);
            }
          }

          console.log('一時ファイルを削除中...');
          fs.rmSync(tempDir, { recursive: true, force: true });

          console.log('Windows用QPDFのインストールが完了しました');
        } catch (error) {
          console.error('QPDFのインストール中にエラーが発生しました:', error);
          throw error;
        }
        break;

      case 'linux':
        console.log('Linuxのqpdfバイナリをダウンロードします...');
        // Linuxの実装は後で追加
        throw new Error('Linux版は未実装です');

      default:
        throw new Error('未対応のプラットフォームです');
    }
  } catch (error) {
    console.error('インストール中にエラーが発生しました:', error);
    process.exit(1);
  }
}

installQpdf().catch(console.error);
