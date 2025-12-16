const express = require('express');
const app = express();
const PORT = 3000;

const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

// Define a simple GET route for the homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
//'/users/:userId/books/:bookId'
app.get('/category', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'products_list.html'));
});

app.get('/category/{:category_slug}/{:page}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'products_list.html'));
});

// Define another GET route for an 'about' page
app.get('/about', (req, res) => {
  res.send('Welcome to the about us page.'); // Sends a different response
});

app.get('/coming', (req, res) => {
  res.send('Welcome to the coming page.'); // Sends a different response
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});