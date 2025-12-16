import express from 'express';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const app = express();

// homepage 
app.get('/', (req, res) => {
  res.sendFile(Path.join(__dirname, 'index.html'));
});

// cart page
app.get('/cart', (req, res) => {
  res.sendFile(Path.join(__dirname, 'cart.html'));
});

// signUp page
app.get('/signUp', (req, res) => {
  res.sendFile(Path.join(__dirname, 'signUp.html'));
});
// Login page
app.get('/login', (req, res) => {
  res.sendFile(Path.join(__dirname, 'login.html'));
});


app.use('/assets', express.static(path.join(__dirname, 'assets')));

const PORT = process.env.PORT || 3000;