console.log(" index.js started"); 

const express = require('express');
const cors = require('cors');
const app = express();
const reviewRoutes = require('./routes/reviews');

app.use(cors());
app.use(express.json());

app.use('/api/reviews', reviewRoutes);

app.listen(5000, () => {
  console.log(' Server running at http://localhost:5000');
});
