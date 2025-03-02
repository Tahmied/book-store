require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const multer = require("multer");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads")); // Serve PDF files

app.use(express.static("public")); // Serve frontend files


// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "bookstore", // Default XAMPP username
    password: "bookstore", // Default is empty
    database: "bookstore",
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to MySQL database");
    }
});

// File upload setup
const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});
// Add a new book
app.post("/add-book", upload.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
    { name: 'authorImage', maxCount: 1 }
]), async (req, res) => {
    const {
        title,
        author,
        description,
        category,
        pages,
        publicationDate
    } = req.body;

    // Handle file paths
    const files = req.files;
    const pdf_url = files['pdf'] ? `/uploads/${files['pdf'][0].filename}` : null;
    const cover_url = files['cover'] ? `/uploads/${files['cover'][0].filename}` : null;
    const author_image_url = files['authorImage'] ? `/uploads/${files['authorImage'][0].filename}` : null;

    try {
        // Check if the author already exists
        const [authorResult] = await db.promise().query(
            "SELECT id FROM authors WHERE name = ?",
            [author]
        );

        let authorId;
        if (authorResult.length > 0) {
            // Author exists, use the existing author ID
            authorId = authorResult[0].id;
        } else {
            // Author doesn't exist, insert into authors table
            const [insertAuthorResult] = await db.promise().query(
                "INSERT INTO authors (name, image_url) VALUES (?, ?)",
                [author, author_image_url]
            );
            authorId = insertAuthorResult.insertId;
        }

        // Insert the book into the books table
        const [insertBookResult] = await db.promise().query(
            `INSERT INTO books 
            (title, author_id, description, category, pages, publication_date, pdf_url, cover_url) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                authorId,
                description,
                category,
                parseInt(pages),
                publicationDate,
                pdf_url,
                cover_url
            ]
        );

        res.json({
            message: "Book added successfully",
            bookId: insertBookResult.insertId
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: err.message });
    }
});


// Fetch all books for homepage
app.get("/books", (req, res) => {
    const sql = `
        SELECT books.*, authors.name AS author, authors.image_url AS author_image_url 
        FROM books 
        LEFT JOIN authors ON books.author_id = authors.id 
        ORDER BY books.created_at DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// Fetch single book details
app.get("/book/:id", (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT books.*, authors.name AS author, authors.image_url AS author_image_url 
        FROM books 
        LEFT JOIN authors ON books.author_id = authors.id 
        WHERE books.id = ?
    `;
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        if (result.length === 0) return res.status(404).json({ message: "Book not found" });
        res.json(result[0]);
    });
});

// Search books
app.get("/search", (req, res) => {
    const { query, category, minRating, maxYear, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let sql = `
        SELECT books.*, authors.name AS author, authors.image_url AS author_image_url 
        FROM books 
        LEFT JOIN authors ON books.author_id = authors.id 
        WHERE 1=1
    `;
    const params = [];

    if (query) {
        sql += ` AND (books.title LIKE ? OR authors.name LIKE ?)`;
        params.push(`%${query}%`, `%${query}%`);
    }
    if (category) {
        sql += ` AND books.category = ?`;
        params.push(category);
    }
    if (minRating) {
        sql += ` AND books.rating >= ?`;
        params.push(minRating);
    }
    if (maxYear) {
        sql += ` AND YEAR(books.publication_date) <= ?`;
        params.push(maxYear);
    }

    // Add pagination
    sql += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err });

        // Get total count
        const countSql = sql.replace(/LIMIT.*/, '');
        db.query(countSql, params.slice(0, -2), (countErr, countResults) => {
            if (countErr) return res.status(500).json({ error: countErr });

            res.json({
                results,
                total: countResults.length,
                page: parseInt(page),
                totalPages: Math.ceil(countResults.length / limit)
            });
        });
    });
});

// Get all categories for filter dropdown
app.get("/categories", (req, res) => {
    const sql = "SELECT DISTINCT category FROM books";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results.map(r => r.category));
    });
});

app.get("/authors", (req, res) => {
    const sql = "SELECT * FROM authors";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// Get books by category
app.get("/books/category/:category", (req, res) => {
    const { category } = req.params;
    const sql = "SELECT * FROM books WHERE category = ? ORDER BY created_at DESC";
    db.query(sql, [category], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

