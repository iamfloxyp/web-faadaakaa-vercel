const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, "public")));


function escapeMetaContent(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function stripHtmlTags(value = "") {
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
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
// ==============================
// PRODUCT DETAILS WITH DYNAMIC SHARE METADATA
// ==============================
app.get("/item/:slug", async (req, res) => {
  const slug = req.params.slug;

  const htmlPath = path.join(
    __dirname,
    "public",
    "productdetails.html"
  );

  try {
    // Load the product from the API
    const apiResponse = await fetch(
      `https://api.faadaakaa.com/api/loadproductbyslug/${encodeURIComponent(slug)}`
    );

    if (!apiResponse.ok) {
      throw new Error(
        `Product API returned ${apiResponse.status}`
      );
    }

    const result = await apiResponse.json();

    if (
      result.status !== true ||
      !Array.isArray(result.data) ||
      result.data.length === 0
    ) {
      throw new Error("Product not found");
    }

    const product = result.data[0];

    // Product title
    const productName =
      product.name || "Product on Faadaakaa";

    // Product description
    const rawDescription =
      product.description ||
      `Shop ${productName} on Faadaakaa.`;

    const productDescription =
      stripHtmlTags(rawDescription).slice(0, 300) ||
      `Shop ${productName} on Faadaakaa.`;

    // Find the main product image
    const images = Array.isArray(product.images)
      ? product.images
      : [];

    const baseImage =
      images.find(image => image.zone === "base_image") ||
      images.find(image => image.path) ||
      null;

    const productImage = baseImage?.path
      ? `https://fdk1.nyc3.digitaloceanspaces.com/fdk_bucket/${baseImage.path}`
      : "https://faadaakaa.com/assets/images/logo.png";

    // The public product URL
    const productUrl =
      `https://faadaakaa.com/item/${encodeURIComponent(slug)}`;

    const safeTitle = escapeMetaContent(productName);
    const safeDescription =
      escapeMetaContent(productDescription);
    const safeImage = escapeMetaContent(productImage);
    const safeUrl = escapeMetaContent(productUrl);

    // Metadata that WhatsApp, Facebook and X can read
    const dynamicMetadata = `
      <title>${safeTitle} - Faadaakaa</title>

      <meta
        name="description"
        content="${safeDescription}"
      />

      <link
        rel="canonical"
        href="${safeUrl}"
      />

      <!-- Open Graph metadata -->
      <meta property="og:site_name" content="Faadaakaa" />
      <meta property="og:type" content="product" />
      <meta property="og:url" content="${safeUrl}" />
      <meta property="og:title" content="${safeTitle}" />
      <meta property="og:description" content="${safeDescription}" />
      <meta property="og:image" content="${safeImage}" />
      <meta property="og:image:secure_url" content="${safeImage}" />

      <!-- X / Twitter metadata -->
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:domain" content="faadaakaa.com" />
      <meta name="twitter:url" content="${safeUrl}" />
      <meta name="twitter:title" content="${safeTitle}" />
      <meta name="twitter:description" content="${safeDescription}" />
      <meta name="twitter:image" content="${safeImage}" />
    `;

    fs.readFile(htmlPath, "utf8", function (error, html) {
      if (error) {
        console.error(
          "Product HTML read error:",
          error
        );

        res.status(500).send(
          "Unable to load product page"
        );
        return;
      }

      // Remove the static product title first
      let finalHtml = html.replace(
        /<title>[\s\S]*?<\/title>/i,
        ""
      );

      // Insert the current product metadata inside head
      finalHtml = finalHtml.replace(
        "</head>",
        `${dynamicMetadata}\n</head>`
      );

      res
        .status(200)
        .type("html")
        .send(finalHtml);
    });
  } catch (error) {
    console.error(
      "Dynamic product metadata error:",
      error
    );

    // Show the page normally if the API fails
    res.sendFile(htmlPath);
  }
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

// ==============================
// DASHBOARD / ACCOUNT 
// ==============================

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "account.html"));
});

app.get("/mywallet", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "account.html"));
});

app.get("/mywallet/fund", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "account.html"));
});

app.get("/loan-credit", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "account.html"));
});

app.get("/addresses", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "account.html"));
});

app.get("/myorders", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "account.html"));
});

app.get("/myorders/:orderId", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "account.html"));
});

// Loan settlement routes (still orders-related)
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
module.exports = app;
