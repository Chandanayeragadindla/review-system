const express = require('express');
const router = express.Router();
const db = require('../db');


router.post('/submit', (req, res) => {
  const { productName, username, rating, review } = req.body;

  if (!productName || !username) {
    return res.status(400).send("Product name and username are required");
  }

  const checkSql = 'SELECT * FROM reviews WHERE product_name = ? AND username = ?';
  db.query(checkSql, [productName, username], (err, results) => {
    if (err) return res.status(500).send("DB error");
    if (results.length > 0) {
      return res.status(409).send("You already reviewed this product");
    }

    const insertSql = 'INSERT INTO reviews (product_name, username, rating, review_text) VALUES (?, ?, ?, ?)';
    db.query(insertSql, [productName, username, rating || null, review || null], (err) => {
      if (err) return res.status(500).send(err);
      res.send("Review saved ");
    });
  });
});


router.get('/:productName', (req, res) => {
  const product = req.params.productName;
  const sql = 'SELECT * FROM reviews WHERE product_name = ?';
  db.query(sql, [product], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});


router.get('/summary/all', (req, res) => {
  const sql = `
    SELECT 
      product_name,
      COUNT(*) AS total_reviews,
      ROUND(AVG(rating), 2) AS avg_rating,
      GROUP_CONCAT(review_text SEPARATOR ' ') AS all_reviews
    FROM reviews
    GROUP BY product_name;
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);

    const stopwords = ['the', 'is', 'and', 'to', 'it', 'this', 'for', 'a', 'of', 'with', 'on'];
    const summary = results.map(row => {
      const wordFreq = {};
      if (row.all_reviews) {
        row.all_reviews
          .toLowerCase()
          .replace(/[^a-zA-Z ]/g, '')
          .split(/\s+/)
          .forEach(word => {
            if (word && !stopwords.includes(word)) {
              wordFreq[word] = (wordFreq[word] || 0) + 1;
            }
          });
      }

      const topWords = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word, count]) => `${word} (${count})`);

      return {
        product: row.product_name,
        total_reviews: row.total_reviews,
        avg_rating: row.avg_rating,
        top_words: topWords
      };
    });

    res.json(summary);
  });
});

module.exports = router;
