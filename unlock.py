import os
import tkinter as tk
from tkinter import messagebox, simpledialog

import pikepdf
from tkinterdnd2 import DND_FILES, TkinterDnD


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


def handle_drop(event):
    input_path = event.data.strip("{}")  # ドラッグされたファイルパスを取得
    if not input_path.lower().endswith(".pdf"):
        messagebox.showerror("Error", "Please drop a valid PDF file.")
        return

    password = simpledialog.askstring(
        "Password", "Enter the PDF password:", show="*")
    if not password:
        messagebox.showinfo("Cancelled", "Password entry cancelled.")
        return

    result = unlock_pdf(input_path, password)
    if os.path.exists(result):
        messagebox.showinfo(
            "Success", f"PDF unlocked successfully!\nSaved as: {result}")
    else:
        messagebox.showerror("Error", result)


def main():
    root = TkinterDnD.Tk()
    root.title("PDF Unlocker")
    root.geometry("400x200")

    label = tk.Label(
        root, text="Drag and drop a PDF file here", font=("Roboto", 14))
    label.pack(pady=20)

    root.drop_target_register(DND_FILES)
    root.dnd_bind("<<Drop>>", handle_drop)

    root.mainloop()


if __name__ == "__main__":
    main()
