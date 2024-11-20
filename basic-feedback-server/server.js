const http = require('http');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const PORT = 5001;

// Set up SQLite database
const db = new sqlite3.Database('feedback.db'); // File-based SQLite database
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        phone TEXT,
        description TEXT,
        rating INTEGER
    )`);
});

// Function to handle CORS
function enableCORS(res) {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Allow specific HTTP methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow specific headers
}

// Create HTTP server
const server = http.createServer((req, res) => {
    // Handle OPTIONS preflight request
    if (req.method === 'OPTIONS') {
        enableCORS(res); // Add CORS headers
        res.writeHead(204); // No Content
        res.end();
        return;
    }

    if (req.method === 'GET' && (req.url === '/' || req.url === '/feedback.html')) {
        // Serve the feedback form
        const filePath = path.join(__dirname, 'feedback.html');
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            } else {
                enableCORS(res); // Add CORS headers
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content);
            }
        });
    } else if (req.method === 'POST' && req.url === '/submit-feedback') {
        let body = '';

        req.on('data', (chunk) => {
            body += chunk.toString(); // Convert buffer to string
        });

        req.on('end', () => {
            const feedback = JSON.parse(body);

            // Save feedback to SQLite database
            const query = `INSERT INTO feedback (name, email, phone, description, rating) VALUES (?, ?, ?, ?, ?)`;
            const params = [
                feedback.name,
                feedback.email,
                feedback.phone,
                feedback.description,
                feedback.rating,
            ];

            db.run(query, params, function (err) {
                enableCORS(res); // Add CORS headers
                if (err) {
                    console.error("Database error:", err.message);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Failed to save feedback' }));
                } else {
                    console.log("Feedback saved successfully");
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Feedback received successfully!' }));
                }
            });
        });
    } else {
        // Handle 404 Not Found
        enableCORS(res); // Add CORS headers
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Page not found');
    }
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
