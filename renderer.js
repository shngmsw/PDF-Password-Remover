const { ipcRenderer } = require('electron');

// DOM要素の取得
const fileDisplay = document.getElementById('file-display');
const selectFileBtn = document.getElementById('select-file');
const passwordInput = document.getElementById('password');
const unlockBtn = document.getElementById('unlock-pdf');
const messageDiv = document.getElementById('message');

let selectedFilePath = null;

// メッセージ表示関数
function showMessage(message, isError = false) {
    messageDiv.textContent = message;
    messageDiv.className = 'message ' + (isError ? 'error' : 'success');
}

// ファイル選択ボタンのイベントハンドラー
selectFileBtn.addEventListener('click', async () => {
    const filePath = await ipcRenderer.invoke('select-pdf');
    if (filePath) {
        selectedFilePath = filePath;
        const fileName = filePath.split('\\').pop().split('/').pop();
        fileDisplay.textContent = `選択されたファイル: ${fileName}`;
        messageDiv.className = 'message';
    }
});

// パスワード解除ボタンのイベントハンドラー
unlockBtn.addEventListener('click', async () => {
    if (!selectedFilePath) {
        showMessage('PDFファイルを選択してください', true);
        return;
    }

    const password = passwordInput.value;
    if (!password) {
        showMessage('パスワードを入力してください', true);
        return;
    }

    try {
        unlockBtn.disabled = true;
        unlockBtn.textContent = '処理中...';

        const result = await ipcRenderer.invoke('unlock-pdf', {
            filePath: selectedFilePath,
            password: password
        });

        if (result.success) {
            const outputFileName = result.outputPath.split('\\').pop().split('/').pop();
            showMessage(`パスワードを解除しました！\n保存先: ${outputFileName}`);
            passwordInput.value = '';
        } else {
            showMessage(result.error, true);
        }
    } catch (error) {
        showMessage('エラーが発生しました: ' + error.message, true);
    } finally {
        unlockBtn.disabled = false;
        unlockBtn.textContent = 'パスワードを解除';
    }
});

// Enterキーでパスワード解除を実行
passwordInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        unlockBtn.click();
    }
});
