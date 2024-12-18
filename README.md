# PDF Password Remover

PDFファイルのパスワードを解除するツールです。

## ビルド方法

### Windows
```bash
pyinstaller --onefile --windowed --hidden-import=pikepdf --add-data "C:\Python311\Lib\site-packages\tkinterdnd2\tkdnd:tkinterdnd2/tkdnd" .\unlock.py
```

### macOS
```bash
pyinstaller --onefile --windowed --hidden-import=pikepdf --add-data "/usr/local/lib/python3.11/site-packages/tkinterdnd2/tkdnd:tkinterdnd2/tkdnd" ./unlock.py
```

### Linux
```bash
pyinstaller --onefile --windowed --hidden-import=pikepdf --add-data "/usr/lib/python3.11/site-packages/tkinterdnd2/tkdnd:tkinterdnd2/tkdnd" ./unlock.py
```

## 注意事項
- Python 3.11以上が必要です
- 必要なパッケージ：
  - pikepdf
  - tkinterdnd2
  - pyinstaller
