const express = require("express");
const app = express();
const path = require("path");
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/**
 * Dynamic category route
 * Example:
 * /category/electronics/1
 * /category/phones-tablets/2
 */
app.get("/category/:category_slug/:page", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "products_list.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});