from flask import Flask, render_template, request, redirect, url_for, flash
import sqlite3

app = Flask(__name__)
app.secret_key = '8787668968758'  # Replace with a random secret key for session security

# Initialize the SQLite database
def init_db():
    conn = sqlite3.connect('feedback.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            description TEXT NOT NULL,
            rating INTEGER NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

# Route to render the feedback form page
@app.route('/')
def home():
    return render_template('feedback.html')

# Route to handle form submission
@app.route('/submit-feedback', methods=['POST'])
def submit_feedback():
    try:
        name = request.form['name']
        email = request.form['email']
        phone = request.form['phone']
        description = request.form['description']
        rating = request.form['rating']

        conn = sqlite3.connect('feedback.db')
        c = conn.cursor()
        c.execute('INSERT INTO feedback (name, email, phone, description, rating) VALUES (?, ?, ?, ?, ?)',
                  (name, email, phone, description, rating))
        conn.commit()
        conn.close()
        return "Feedback submitted successfully!"
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return "Error submitting feedback"


if __name__ == '__main__':
    init_db()
    app.run(debug=True)