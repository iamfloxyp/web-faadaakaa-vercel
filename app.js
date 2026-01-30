const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// ==============================
// HOME PAGE
// ==============================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ==============================
// CATEGORY PRODUCT LIST
// ==============================
app.get("/category/:category_slug/:page", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "products_list.html"));
});

// ==============================
// PRODUCT DETAILS
// ==============================
app.get("/product/:slug", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "productdetails.html"));
});

// ==============================
// AUTH PAGES
// ==============================
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});



app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

// ==============================
// VERIFY PAGE (EMAIL STRING)
// ==============================
app.get("/verify/:email_string", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "verify.html"));
});



// ==============================
// ACCOUNT PAGE
// ==============================

app.get("/account", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "account.html"));
});

app.get("/account/wallet", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "account.html"));
});

app.get("/account/wallet/fund", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "account.html"));
});

app.get("/account/loans", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "account.html"));
});

app.get("/account/delivery", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "account.html"));
});

app.get("/account/orders", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "account.html"));
});

app.get("/account/orders/:orderId", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "account.html"));
});

app.get("/loan-settlement/order/:orderId", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "account.html"));
});

app.get("/loan-settlement/repayment/:repaymentId", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "account.html"));
});

// START SERVER
// ==============================
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});