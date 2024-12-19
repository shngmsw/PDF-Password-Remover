import os
import tkinter as tk
from tkinter import filedialog, messagebox

import pikepdf


def unlock_pdf(input_path, password):
    try:
        input_filename = os.path.basename(input_path)
        output_filename = f"decrypted_{input_filename}"
        output_path = os.path.join(
            os.path.dirname(input_path), output_filename)

        with pikepdf.open(input_path, password=password) as pdf:
            pdf.save(output_path)
            return output_path
    except pikepdf._qpdf.PasswordError:
        return "Incorrect password"
    except Exception as e:
        return f"Error: {e}"


def open_file_dialog(password_entry, file_label, input_path):
    if not input_path:
        messagebox.showinfo("Cancelled", "File selection cancelled.")
        return
    
    file_label.config(text=f"Selected file: {os.path.basename(input_path)}")

    password = password_entry.get()
    if not password:
        return

    result = unlock_pdf(input_path, password)
    if os.path.exists(result):
        messagebox.showinfo(
            "Success", f"PDF unlocked successfully!\nSaved as: {result}")
    else:
        messagebox.showerror("Error", result)


def main():
    root = tk.Tk()
    root.title("PDF Unlocker")
    
    # ウィンドウサイズとパディングを設定
    root.geometry("400x300")
    root.configure(padx=20, pady=20)

    # スタイル設定
    default_font = ("Arial", 12)
    
    # ファイル選択部分
    file_frame = tk.Frame(root)
    file_frame.pack(fill=tk.X, pady=(0, 10))
    
    file_label = tk.Label(file_frame, text="Selected file: None", font=default_font)
    file_label.pack(side=tk.LEFT)

    input_path = ""
    def select_pdf():
        nonlocal input_path
        input_path = filedialog.askopenfilename(
            title="Select a PDF file", 
            filetypes=(("PDF files", "*.pdf"),)
        )
        if input_path:
            file_label.config(text=f"Selected file: {os.path.basename(input_path)}")
            root.update_idletasks()  # 描画を強制的に更新

    select_button = tk.Button(
        root, 
        text="Select PDF", 
        command=select_pdf,
        font=default_font,
        relief=tk.RAISED,  # ボタンの立体感を追加
        padx=10
    )
    select_button.pack(pady=10)

    # パスワード入力部分
    password_frame = tk.Frame(root)
    password_frame.pack(fill=tk.X, pady=10)
    
    password_label = tk.Label(
        password_frame, 
        text="Password:",
        font=default_font
    )
    password_label.pack(side=tk.LEFT)
    
    password_entry = tk.Entry(
        password_frame,
        font=default_font,
        relief=tk.SUNKEN  # 入力フィールドの凹み効果
    )
    password_entry.pack(side=tk.LEFT, padx=(10, 0))

    # アンロックボタン
    unlock_button = tk.Button(
        root, 
        text="Unlock PDF", 
        command=lambda: open_file_dialog(password_entry, file_label, input_path),
        font=default_font,
        relief=tk.RAISED,
        padx=10
    )
    unlock_button.pack(pady=20)

    root.mainloop()


if __name__ == "__main__":
    main()
