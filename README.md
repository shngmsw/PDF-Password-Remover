# PDF Password Remover

PDFファイルのパスワードを解除するElectronアプリケーションです。

## 機能

- PDFファイルの選択（ファイル選択ダイアログ）
- パスワード保護されたPDFファイルのロック解除
- 解除したPDFファイルの自動保存

## 必要な環境

- Node.js 14.0.0以上
- npm 6.0.0以上

## インストール方法

### 開発環境のセットアップ

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/PDF-Password-Remover.git
cd PDF-Password-Remover

# 依存パッケージのインストール
npm install
```

### アプリケーションの実行

開発モードで実行：

```bash
npm start
```

### ビルド方法

Windows用実行ファイルの作成：

```bash
npm run build:win
```

macOS用実行ファイルの作成：

```bash
npm run build:mac
```

Linux用実行ファイルの作成：

```bash
npm run build:linux
```

## 使用方法

1. アプリケーションを起動します
2. 「PDFファイルを選択」ボタンをクリックしてファイルを選択します
3. パスワードを入力します
4. 「パスワードを解除」ボタンをクリックします
5. 解除されたPDFファイルは元のファイルと同じフォルダーに`decrypted_`というプレフィックス付きで保存されます

## 技術スタック

- Electron
- Node.js
- pdf-lib（PDFファイル処理）

## ライセンス

MIT License
