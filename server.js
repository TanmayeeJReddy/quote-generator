const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const db = new sqlite3.Database("./database/quotes.db");

db.run(`
    CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quote TEXT NOT NULL,
        author TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);
console.log("Database connected successfully!");
app.get("/api/quote", async (req, res) => {
    try {
        const response = await fetch("https://zenquotes.io/api/random");
        const data = await response.json();

        res.json({
            quote: data[0].q,
            author: data[0].a
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch quote"
        });
    }
});
app.post("/api/favorites", (req, res) => {
    const { quote, author } = req.body;

    if (!quote || !author) {
        return res.status(400).json({
            error: "Quote and author are required"
        });
    }

    const sql = `
        INSERT INTO favorites (quote, author)
        VALUES (?, ?)
    `;
     db.run(sql, [quote, author], function (error) {
        if (error) {
            return res.status(500).json({
                error: "Failed to save favorite"
            });
        }

        res.json({
            message: "Quote saved to favorites",
            id: this.lastID
        });
    });
});
app.get("/api/favorites", (req, res) => {
    const sql = `
        SELECT * FROM favorites
        ORDER BY created_at DESC
    `;
    db.all(sql, [], (error, rows) => {
        if (error) {
            return res.status(500).json({
                error: "Failed to fetch favorites"
            });
        }
        
        res.json(rows);
    });
});
app.delete("/api/favorites/:id", (req, res) => {
    const { id } = req.params;

    db.run(
        "DELETE FROM favorites WHERE id = ?",
        [id],
        function (error) {
            if (error) {
                return res.status(500).json({
                    error: "Failed to delete favorite"
                });
            }

            res.json({
                message: "Favorite deleted successfully"
            });
        }
    );
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
