const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// バイナリの保存先ディレクトリ
const binDir = path.join(__dirname, '..', 'bin');

// プラットフォームに応じたインストール
async function installQpdf() {
  const platform = os.platform();

  // binディレクトリの作成
  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }

  try {
    switch (platform) {
      case 'darwin':
        // macOSの場合、Homebrewを使用してインストール
        console.log('Homebrewを使用してqpdfをインストールします...');
        execSync('brew install qpdf');
        
        // Homebrewでインストールされたqpdfのパスを取得
        const brewPrefix = execSync('brew --prefix qpdf').toString().trim();
        const qpdfPath = path.join(brewPrefix, 'bin', 'qpdf');
        
        // binディレクトリにコピー
        const destPath = path.join(binDir, 'qpdf');
        fs.copyFileSync(qpdfPath, destPath);
        execSync(`chmod +x "${destPath}"`);
        console.log('qpdfのコピーが完了しました');
        break;

      case 'win32':
        console.log('Windowsのqpdfバイナリをダウンロードします...');
        // Windowsの実装は後で追加
        throw new Error('Windows版は未実装です');

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
