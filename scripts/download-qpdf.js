const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// バイナリの保存先ディレクトリ
const binDir = path.join(__dirname, '..', 'bin');
const libDir = path.join(__dirname, '..', 'lib');

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
        // macOSの場合、Homebrewを使用してインストール
        console.log('Homebrewを使用してqpdfをインストールします...');
        execSync('brew install qpdf');
        
        // Homebrewでインストールされたqpdfのパスを取得
        const brewPrefix = execSync('brew --prefix qpdf').toString().trim();
        const qpdfPath = path.join(brewPrefix, 'bin', 'qpdf');
        const brewLibPath = path.join(brewPrefix, 'lib');
        
        // バイナリとライブラリをコピー
        console.log('バイナリとライブラリをコピーします...');
        
        // バイナリのコピー
        const destPath = path.join(binDir, 'qpdf');
        execSync(`cp -f "${qpdfPath}" "${destPath}"`);
        execSync(`chmod +x "${destPath}"`);
        
        // 必要なライブラリをコピー
        const libFiles = fs.readdirSync(brewLibPath)
          .filter(file => file.startsWith('libqpdf'));
        
        for (const libFile of libFiles) {
          const srcLib = path.join(brewLibPath, libFile);
          const destLib = path.join(libDir, libFile);
          execSync(`cp -f "${srcLib}" "${destLib}"`);
        }
        
        // バイナリのrpathを更新
        execSync(`install_name_tool -add_rpath "@executable_path/../lib" "${destPath}"`);
        
        console.log('インストールが完了しました');
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
