import tkinter as tk


def main():
    root = tk.Tk()
    root.title("Test Tkinter")
    label = tk.Label(root, text="Hello, Tkinter!")
    label.pack()
    root.mainloop()

if __name__ == "__main__":
    main()
