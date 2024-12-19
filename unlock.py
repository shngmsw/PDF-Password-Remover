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


def open_file_dialog(password_entry, file_label):
    input_path = filedialog.askopenfilename(
        title="Select a PDF file", filetypes=(("PDF files", "*.pdf"),))
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
    root.geometry("400x200")

    label = tk.Label(
        root, text="Click the button to select a PDF file")
    label.pack(pady=10)

    file_label = tk.Label(root, text="")
    file_label.pack(pady=5)

    password_label = tk.Label(root, text="Password:")
    password_label.pack()
    password_entry = tk.Entry(root, show="*")
    password_entry.pack()

    open_button = tk.Button(root, text="Select PDF", command=lambda: open_file_dialog(password_entry, file_label))
    open_button.pack(pady=10)

    root.mainloop()


if __name__ == "__main__":
    main()
