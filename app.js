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

async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeoutId);
  }
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
// ==============================
// CATEGORY PRODUCT LIST
// DYNAMIC SHARE METADATA
// ==============================
app.get("/category/:category_slug/:page", async (req, res) => {
  const categorySlug = req.params.category_slug;
  const pageNumber = req.params.page;

  const htmlPath = path.join(
    __dirname,
    "public",
    "products_list.html"
  );

  try {
    const apiResponse = await fetch(
      "https://api.faadaakaa.com/api/loadcategory"
    );

    if (!apiResponse.ok) {
      throw new Error(
        `Category API returned ${apiResponse.status}`
      );
    }

    const result = await apiResponse.json();

    const categories = Array.isArray(result.data)
      ? result.data
      : [];

    const currentCategory = categories.find(
      category => category.slug === categorySlug
    );

    // Use the real category name from the API
    const categoryName =
      currentCategory?.name ||
      categorySlug
        .split("-")
        .map(word =>
          word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");

    const pageTitle =
      `${categoryName} | Faadaakaa`;

    const pageDescription =
      `Browse ${categoryName} products on Faadaakaa and enjoy flexible payment options.`;

    const pageUrl =
      `https://faadaakaa.com/category/${encodeURIComponent(
        categorySlug
      )}/${encodeURIComponent(pageNumber)}`;
const protocol =
  req.headers["x-forwarded-proto"] || req.protocol;

const siteOrigin =
  `${protocol}://${req.get("host")}`;

const logoUrl =
  `${siteOrigin}/assets/images/sharelogo.png`;
    const safeTitle = escapeMetaContent(pageTitle);
    const safeDescription =
      escapeMetaContent(pageDescription);
    const safeUrl = escapeMetaContent(pageUrl);
    const safeLogo = escapeMetaContent(logoUrl);

    const dynamicMetadata = `
      <title>${safeTitle}</title>

      <meta
        name="description"
        content="${safeDescription}"
      />

      <link
        rel="canonical"
        href="${safeUrl}"
      />

      <meta property="og:site_name" content="Faadaakaa" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="${safeUrl}" />
      <meta property="og:title" content="${safeTitle}" />
      <meta
        property="og:description"
        content="${safeDescription}"
      />
      <meta property="og:image" content="${safeLogo}" />
      <meta
        property="og:image:secure_url"
        content="${safeLogo}"
      />
      <meta property="og:image:type" content="image/png" />

      <meta name="twitter:card" content="summary" />
      <meta
        name="twitter:domain"
        content="faadaakaa.com"
      />
      <meta name="twitter:url" content="${safeUrl}" />
      <meta name="twitter:title" content="${safeTitle}" />
      <meta
        name="twitter:description"
        content="${safeDescription}"
      />
      <meta name="twitter:image" content="${safeLogo}" />
    `;

    fs.readFile(htmlPath, "utf8", function (error, html) {
      if (error) {
        console.error(
          "Category HTML read error:",
          error
        );

        res
          .status(500)
          .send("Unable to load category page");

        return;
      }

      // Remove the existing static title
      let finalHtml = html.replace(
        /<title>[\s\S]*?<\/title>/i,
        ""
      );

      // Add dynamic metadata inside the head
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
      "Dynamic category metadata error:",
      error
    );

    res.sendFile(htmlPath);
  }
});

// ==============================
// PRODUCT DETAILS
// ==============================
// ==============================
// PRODUCT DETAILS WITH DYNAMIC SHARE METADATA
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

  if (
  !slug ||
  slug === "undefined" ||
  slug === "null"
) {
  console.warn("Blocked invalid product URL:", req.originalUrl);
  return res.redirect(302, "/");
}

  try {
    const apiUrl =
      `https://api.faadaakaa.com/api/loadproductbyslug/${encodeURIComponent(slug)}`;

    const apiResponse = await fetch(apiUrl);

    if (!apiResponse.ok) {
      const apiErrorText = await apiResponse.text();

      console.error("PRODUCT METADATA API FAILED:", {
        slug: slug,
        status: apiResponse.status,
        response: apiErrorText
      });

      return res.sendFile(htmlPath);
    }

    let result;

    try {
      result = await apiResponse.json();
    } catch (jsonError) {
      console.error("PRODUCT METADATA INVALID JSON:", {
        slug: slug,
        error: jsonError
      });

      return res.sendFile(htmlPath);
    }

    if (
      result?.status !== true ||
      !Array.isArray(result?.data) ||
      result.data.length === 0
    ) {
      console.error("PRODUCT METADATA NOT FOUND:", {
        slug: slug,
        result: result
      });

      return res.sendFile(htmlPath);
    }

    const product = result.data[0];

    const productName =
      product?.name ||
      "Product on Faadaakaa";

    const rawDescription =
      product?.description ||
      `Shop ${productName} on Faadaakaa.`;

    const productDescription =
      stripHtmlTags(rawDescription).slice(0, 300) ||
      `Shop ${productName} on Faadaakaa.`;

    const images = Array.isArray(product?.images)
      ? product.images
      : [];

    const baseImage =
      images.find(image => image?.zone === "base_image") ||
      images.find(image => image?.path) ||
      null;

    const productImage = baseImage?.path
      ? `https://fdk1.nyc3.digitaloceanspaces.com/fdk_bucket/${baseImage.path}`
      : "https://faadaakaa.com/assets/images/logo.png";

    const productUrl =
      `https://faadaakaa.com/item/${encodeURIComponent(slug)}`;

    const safeTitle =
      escapeMetaContent(productName);

    const safeDescription =
      escapeMetaContent(productDescription);

    const safeImage =
      escapeMetaContent(productImage);

    const safeUrl =
      escapeMetaContent(productUrl);

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
      <meta
        property="og:site_name"
        content="Faadaakaa"
      />

      <meta
        property="og:type"
        content="product"
      />

      <meta
        property="og:url"
        content="${safeUrl}"
      />

      <meta
        property="og:title"
        content="${safeTitle}"
      />

      <meta
        property="og:description"
        content="${safeDescription}"
      />

      <meta
        property="og:image"
        content="${safeImage}"
      />

      <meta
        property="og:image:secure_url"
        content="${safeImage}"
      />

      <!-- X / Twitter metadata -->
      <meta
        name="twitter:card"
        content="summary_large_image"
      />

      <meta
        name="twitter:domain"
        content="faadaakaa.com"
      />

      <meta
        name="twitter:url"
        content="${safeUrl}"
      />

      <meta
        name="twitter:title"
        content="${safeTitle}"
      />

      <meta
        name="twitter:description"
        content="${safeDescription}"
      />

      <meta
        name="twitter:image"
        content="${safeImage}"
      />
    `;

    fs.readFile(
      htmlPath,
      "utf8",
      function (error, html) {
        if (error) {
          console.error(
            "Product HTML read error:",
            error
          );

          res
            .status(500)
            .send("Unable to load product page");

          return;
        }

        let finalHtml = html.replace(
          /<title>[\s\S]*?<\/title>/i,
          ""
        );

        finalHtml = finalHtml.replace(
          "</head>",
          `${dynamicMetadata}\n</head>`
        );

        res
          .status(200)
          .type("html")
          .send(finalHtml);
      }
    );
  } catch (error) {
    console.error("PRODUCT METADATA REQUEST ERROR:", {
      slug: slug,
      error: error
    });

    return res.sendFile(htmlPath);
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
