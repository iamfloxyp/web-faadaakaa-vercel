/* ============================================================
   PRODUCT LIST PAGE (DYNAMIC – ALL CATEGORIES)
   ============================================================ */
console.log("Products List JS loaded");
/* ===============================
   READ URL SAFELY
   Expected: /category/:slug/:page
   =============================== */
const pathParts = window.location.pathname.split("/").filter(Boolean);
const category_slug = pathParts[1];
const page = pathParts[2] || 1;

if (!category_slug) {
  console.error("Category slug missing in URL");
}

/* ===============================
   API ENDPOINT
   =============================== */
const PRODUCT_API =
  `https://api.faadaakaa.com/api/loadproductbycat/${category_slug}/${page}`;

/* ===============================
   LOAD CATEGORY TITLE
   =============================== */
function loadCategoryTitle() {
  fetch("https://api.faadaakaa.com/api/loadcategory")
    .then(res => res.json())
    .then(result => {
      if (!Array.isArray(result.data)) return;

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

/* ===============================
   EMPTY CATEGORY STATE
   =============================== */
function showCategoryEmptyState() {
  $("#productListGrid").html(`
    <div class="col-span-full flex flex-col items-center justify-center
                py-20 text-center">
      <p class="text-[16px] font-medium text-[#101828]">
        No products are available in this category yet.
      </p>
      <p class="text-[14px] text-[#667085] mt-2">
        Please explore other categories.
      </p>

      <a href="/index.html"
         class="mt-6 inline-flex items-center justify-center
                px-6 py-3 rounded-[8px]
                bg-[#004EEB] text-white text-[14px] font-medium
                hover:bg-[#0039C7] transition">
        Go to Home
      </a>
    </div>
  `);

  // 🔥 Remove pagination completely
  $("#paginationWrapper").remove();

 
}

/* ===============================
   LOAD PRODUCTS
   =============================== */
function loadProducts() {
  fetch(PRODUCT_API)
    .then(res => res.json())
    .then(result => {

      //  Invalid response or wrong data shape
      if (!result.status || !Array.isArray(result.data)) {
        showCategoryEmptyState();
        return;
      }

      //  Category exists but has no products
      if (result.data.length === 0) {
        showCategoryEmptyState();
        
        return;
      }

      // ✅ Products exist
      $("#paginationWrapper").show(); // ensure pagination is visible

      renderProducts(result.data);
      initializePagination(result.data, renderProducts);

      
    })
    .catch(err => {
      console.error("Product load error", err);
      showCategoryEmptyState();
     
    })
    .finally(() => {
      hideProductListLoader();
    });
}

/* ===============================
   RENDER PRODUCTS
   =============================== */
function renderProducts(products) {
  const $grid = $("#productListGrid");
  $grid.empty();

  products.forEach(item => {
    let imageURL = "/assets/images/placeholder.png";

    if (
      Array.isArray(item.images) &&
      item.images.length > 0 &&
      item.images[0].path
    ) {
      imageURL =
        `https://fdk1.nyc3.digitaloceanspaces.com/fdk_bucket/${item.images[0].path}`;
    }

    const price = Number(item.selling_price || item.price || 0);
    const monthly = Math.round(price / 12);

    const card = `
      <a href="/item/${item.slug}"
         class="w-full bg-white border border-[#EAECF0] rounded-[14px]
                flex flex-col h-[340px]
                hover:shadow-md transition">

        <div class="flex items-center justify-center bg-[#fff] h-[170px]
                    rounded-t-[14px]">
          <img
            src="${imageURL}"
            alt="${item.name}"
            class="w-[120px] h-[120px] object-contain"
            loading="lazy"
          >
        </div>

        <div class="w-full h-[1px] bg-[#EAECF0]"></div>

        <div class="flex flex-col justify-between p-[12px] flex-1">
          <h3 class="text-[13px] font-semibold text-[#101828]
                     leading-[18px]">
            ${item.name}
          </h3>

          <div class="mt-[8px] flex flex-col gap-[4px]">
            <span class="text-[13px] font-semibold text-[#101828]">
              ₦${price.toLocaleString()}
            </span>
            <span class="text-[12px] font-medium text-[#004EEB]">
              ₦${monthly.toLocaleString()} / month
            </span>
          </div>
        </div>
      </a>
    `;

    $grid.append(card);
  });
}
// ========PRODUCT LOADER===========
let productListLoaderStart = 0;

function showProductListLoader() {
  productListLoaderStart = Date.now();
  $("#productListLoader").removeClass("hidden");
}

function hideProductListLoader() {
  const MIN_TIME = 700;
  const elapsed = Date.now() - productListLoaderStart;
  const remaining = MIN_TIME - elapsed;

  if (remaining > 0) {
    setTimeout(() => {
      $("#productListLoader").addClass("hidden");
    }, remaining);
  } else {
    $("#productListLoader").addClass("hidden");
  }
}
/* ===============================
   INIT
   =============================== */
$(document).ready(function () {
  showProductListLoader();

  Promise.all([
    loadCategoryTitle(),
    loadProducts()
  ]).finally(() => {
    hideProductListLoader();
  });
});