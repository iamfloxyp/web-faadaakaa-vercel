/* ============================================================
   PRODUCT LIST PAGE (DYNAMIC – ALL CATEGORIES)
   ============================================================ */

// ---- READ URL SAFELY ----
// Expected: /category/:slug/:page
const pathParts = window.location.pathname.split("/").filter(Boolean);

const category_slug = pathParts[1];
const page = pathParts[2] || 1;

if (!category_slug) {
  console.error("Category slug missing in URL");
}

// ---- API ENDPOINT ----
const PRODUCT_API =
  `https://api.faadaakaa.com/api/loadproductbycat/${category_slug}/${page}`;

// ---- LOAD CATEGORY TITLE ----
function loadCategoryTitle() {
  fetch("https://api.faadaakaa.com/api/loadcategory")
    .then(res => res.json())
    .then(result => {
      if (!result.data) return;

      const category = result.data.find(
        cat => cat.slug === category_slug
      );

      if (category) {
        $("#categoryTitle").text(category.name);
        document.title = `${category.name} - Faadaakaa`;
      }
    })
    .catch(err => {
      console.log("Category title error:", err);
    });
}

// ---- LOAD PRODUCTS ----
function loadProducts() {
  fetch(PRODUCT_API)
    .then(res => res.json())
    .then(result => {
      if (result.status === true && Array.isArray(result.data)) {
        renderProducts(result.data);
        initializePagination(result.data, renderProducts);
      } else {
        console.log("No products returned", result);
      }
    })
    .catch(err => {
      console.error("Product load error", err);
    });
}

// ---- RENDER PRODUCTS ----
function renderProducts(products) {
  const $grid = $("#productListGrid");
  $grid.empty();

  products.forEach(item => {
   let imageURL = "./assets/images/placeholder.png";

if (
  item.images &&
  Array.isArray(item.images) &&
  item.images.length > 0 &&
  item.images[0].path
) {
  imageURL = `https://fdk1.nyc3.digitaloceanspaces.com/fdk_bucket/${item.images[0].path}`;
}

    const card = `
      <a href="/productdetails.html?id=${item.id}"
         class="bg-[#F9FAFB] border border-[#EAECF0] rounded-[12px]
                flex flex-col w-full hover:shadow-md transition">

        <div class="flex justify-center items-center border-b border-[#EAECF0]
                    py-[10px] bg-[#fff] rounded-t-[12px]">
          <img 
            src="${imageURL}"
            alt="${item.name}"
            class="w-[80px] h-[80px] object-contain"
            loading="lazy"
          >
        </div>

        <div class="flex flex-col justify-between p-[10px] bg-white
                    rounded-b-[12px] text-center min-h-[160px]">

          <h3 class="text-[13px] font-semibold text-[#101828] leading-[18px]">
            ${item.name}
          </h3>

          <div class="mt-[8px]">
            <p class="text-[12px] font-medium text-[#004EEB]">
              ₦${Number(item.selling_price).toLocaleString()}
            </p>
          </div>

        </div>
      </a>
    `;

    $grid.append(card);
  });
}

// ---- INIT ----
$(document).ready(function () {
  loadCategoryTitle();
  loadProducts();
});