# PDF Password Remover

PDFファイルのパスワードを解除するElectronアプリケーションです。

## 機能

- PDFファイルの選択（ファイル選択ダイアログ）
- パスワード保護されたPDFファイルのロック解除
- 解除したPDFファイルの自動保存

## 必要な環境

- Node.js14.0.0以上
- npm6.0.0以上
- qpdf（PDFパスワード解除ツール）

### qpdfのインストール

各OSでのqpdfのインストール方法：

#### Windows

```bash
# chocolateyを使用する場合
choco install qpdf

# または、公式サイトからインストーラーをダウンロード：
# https://qpdf.sourceforge.net/
```

#### macOS

```bash
# Homebrewを使用
brew install qpdf
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install qpdf
```

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
- qpdf（PDFファイル処理）

## トラブルシューティング

### qpdfが見つからない場合

エラーメッセージ: "qpdf command not found"などが表示される場合

1. qpdfが正しくインストールされているか確認してください
2. コマンドラインで`qpdf --version`を実行して、qpdfが利用可能か確認してください
3. OSのPATH環境変数にqpdfのインストールディレクトリが含まれているか確認してください

## ライセンス

MIT License
