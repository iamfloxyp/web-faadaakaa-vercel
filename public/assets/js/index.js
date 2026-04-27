$(document).ready(function () {
showIndexLoader();
  // LOAD CATEGORIES FROM API
    loadCategoriesFromAPI();
    // slider category
    initCategorySlider();

    loadCartFromProfile();


// =======================
// AUTH HELPERS
// =======================
function getAuthToken() {
  return sessionStorage.getItem("AUTH_TOKEN");
}

function isLoggedIn() {
  return !!getAuthToken();
}

// =======================
// HEADER STATE CONTROL
// =======================
function destroyUserHeaderUI() {
  // Remove desktop user UI
  $("#userSection").remove();
  $("#userMenu").remove();

  // Remove mobile user UI
  $("#mobileUserSection").remove();
  $("#mobileUserMenu").remove();

  // Remove any leftover dropdown icons
  $("#userDropdownIcon").remove();
  $("#mobileUserDropdownIcon").remove();
}

function resetHeaderToLoggedOut() {
  // 💥 HARD REMOVE user UI
  destroyUserHeaderUI();

  // Clear any stored text just in case
  $("#walletBalance").text("");
  $("#userGreeting").text("");
  $("#userInitials").text("");
  $("#mobileWalletBalance").text("");
  $("#MobileUserGreeting").text("");
  $("#MobileUserInitials").text("");

  // Show ONLY auth buttons
  $("#authButtons").removeClass("hidden");
  $("#mobileAuthButtons").removeClass("hidden");
}

function updateHeaderByAuthState() {
  if (!isLoggedIn()) {
    resetHeaderToLoggedOut();
    return;
  }

  // Logged in state
  $("#authButtons").addClass("hidden");
  $("#mobileAuthButtons").addClass("hidden");

  if (window.innerWidth >= 1024) {
    $("#userSection").removeClass("hidden");
  }

  $("#mobileUserSection").removeClass("hidden");
}

// =======================
// FETCH USER FOR HEADER + MOBILE
// =======================
async function fetchHeaderUser() {
  const token = getAuthToken();
  if (!token) {
    resetHeaderToLoggedOut();
    return;
  }

  const fd = new FormData();
  fd.append("token", token);

  try {
    const res = await fetch("https://api.faadaakaa.com/api/loadprofile", {
      method: "POST",
      body: fd
    });

    const json = await res.json();
    if (!json.status || !json.data) {
      resetHeaderToLoggedOut();
      return;
    }

    const user = json.data;

    // Wallet
    const wallet = parseFloat(user?.wallet?.data?.wallet_balance) || 0;
    const walletText = `₦${wallet.toLocaleString()}`;
    $("#walletBalance").text(walletText);
    $("#mobileWalletBalance").text(walletText);

    // Greeting
    const greeting = `Hi ${user.first_name || ""}`;
    $("#userGreeting").text(greeting);
    $("#MobileUserGreeting").text(greeting);

    // Initials
    const initials =
      (user.first_name?.[0] || "") + (user.last_name?.[0] || "");
    $("#userInitials").text(initials.toUpperCase());
    $("#MobileUserInitials").text(initials.toUpperCase());

    // 🔥 REPLACE AUTH BUTTONS WITH USER SECTION
    $("#authButtons").addClass("hidden");
    $("#mobileAuthButtons").addClass("hidden");
    $("#userSection").removeClass("hidden");
    $("#mobileUserSection").removeClass("hidden");

  } catch (err) {
    resetHeaderToLoggedOut();
  }
}


// =======================
// DESKTOP USER DROPDOWN
// =======================
$(document).on(
  "click",
  "#userInitials, #userGreeting, #userDropdownIcon",
  function (e) {
    e.stopPropagation();
    $("#userMenu").toggleClass("hidden");
  }
);


// =======================
// MOBILE USER DROPDOWN
// =======================
$(document).on(
  "click",
  "#MobileUserInitials, #MobileUserGreeting, #mobileUserDropdownIcon",
  function (e) {
    e.stopPropagation();
    $("#mobileUserMenu").toggleClass("hidden");
  }
);


// =======================
// CLOSE ALL DROPDOWNS ON OUTSIDE CLICK
// =======================
$(document).on("click", function () {
  $("#userMenu").addClass("hidden");
  $("#MobileUserMenu").addClass("hidden");
});

// Desktop navigation
$(document).on("click", "#menuAccount", function (e) {
  e.preventDefault();
  e.stopPropagation();
  window.location.href = "/dashboard";
});

$(document).on("click", "#menuWallet", function (e) {
  e.preventDefault();
  e.stopPropagation();
  window.location.href = "/mywallet";
});

$(document).on("click", "#menuOrders", function (e) {
  e.preventDefault();
  e.stopPropagation();
  window.location.href = "/myorders";
});

// Mobile navigation
$(document).on("click", "#mobileMenuAccount", function (e) {
  e.preventDefault();
  e.stopPropagation();
  window.location.href = "/dashboard";
});

$(document).on("click", "#mobileMenuWallet", function (e) {
  e.preventDefault();
  e.stopPropagation();
  window.location.href = "/mywallet";
});

$(document).on("click", "#mobileMenuOrders", function (e) {
  e.preventDefault();
  e.stopPropagation();
  window.location.href = "/myorders";
});

// =======================
// INIT
// =======================
$(document).ready(function () {
  updateHeaderByAuthState();

  if (isLoggedIn()) {
    fetchHeaderUser();
  }else{
    resetHeaderToLoggedOut();
  }
});
    
  $("#categorySection").on("click", function (e) {
    e.stopPropagation();

    $("#categoryDropdown").toggle();

  
   const isMobile = window.innerWidth < 640;


  });

  // Close when clicking outside
  $(document).on("click", function (e) {
    if (!$(e.target).closest("#categoryWrapper").length) {
      $("#categoryDropdown").hide();
    }
  });
  
/*******************************************
 * CART TOOLTIP — SHOW ITEM COUNT ON HOVER
 *******************************************/
function updateCartTooltip() {
    let cartCount = parseInt($("#cartBadge").text().trim());

    let message = "";

    if (cartCount === 0) {
        message = "Your cart is empty";
    } else if (cartCount === 1) {
        message = "1 item in cart";
    } else {
        message = `${cartCount} items in cart`;
    }

    $("#cartTooltip").text(message);
}

// Run immediately on page load
updateCartTooltip();

//  HOVER LOGIC (USE #cartContainer — NOT #cartWrapper)
$("#cartContainer").hover(
    function () {
        updateCartTooltip();
        $("#cartTooltip").removeClass("hidden");
    },
    function () {
        $("#cartTooltip").addClass("hidden");
    }
);


/*******************************************
 * DESKTOP CART TOGGLE (delegated)
 *******************************************/
$(document).on("click", "#cartContainer", function (e) {
  e.stopPropagation();
  $("#cartDropdown").toggleClass("hidden");
  $("#mobileCartDropdown").addClass("hidden");
});

/*******************************************
 * MOBILE CART TOGGLE
 *******************************************/
$("#mobileCartBtn").on("click", function (e) {
  e.preventDefault();
  e.stopPropagation();

  const count = Number($("#mobileCartCount").text().match(/\d+/)?.[0] || 0);

  if (count === 0) {
    toast("Your cart is empty", "info");
    return;
  }

  // 🔑 IMPORTANT: open the mobile menu first
  $("#mobileMenu").removeClass("hidden");

  // then toggle the cart dropdown
  $("#mobileCartDropdown").toggleClass("hidden");

  // close desktop cart if open
  $("#cartDropdown").addClass("hidden");
});

/*******************************************
 * PREVENT CLOSING WHEN CLICKING INSIDE DROPDOWN
 *******************************************/
$("#cartDropdown, #mobileCartDropdown").on("click", function (e) {
  e.stopPropagation();
});

/*******************************************
 * CLICK OUTSIDE, CLOSE ALL DROPDOWNS
 *******************************************/
$("#mobileCartBtn").on("click", function (e) {
  e.preventDefault();
  e.stopPropagation();

  const count = Number($("#mobileCartCount").text().match(/\d+/)?.[0] || 0);

  if (count === 0) {
    toast("Your cart is empty", "info");
    return;
  }

  $("#mobileCartDropdown").toggleClass("hidden");
});

// prevent close when clicking inside dropdown
$("#mobileCartDropdown").on("click", function (e) {
  e.stopPropagation();
});

// click outside closes it
$(document).on("click", function () {
  $("#mobileCartDropdown").addClass("hidden");
});


// LOAD CART ITEMS
function loadCartFromProfile() {
  const token = sessionStorage.getItem("AUTH_TOKEN");
  if (!token) return;

  const formData = new FormData();
  formData.append("token", token);

  fetch("https://api.faadaakaa.com/api/loadprofile", {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(result => {
  // Always render, even if empty
  const cartItems = result?.data?.cart?.data || [];
  renderCartUI(cartItems);
 
})
    .catch(err => console.error("Load cart error:", err));
}
 
$("#cartItemsWrapper").on("click", ".cart-go", function () {
  window.location.href = $(this).data("url") || "cart.html";
});

// REMOVE ITEM FROM CART
$("#cartItemsWrapper").on("click", ".remove-cart-item", function (e) {
  e.preventDefault();
  e.stopPropagation();

  console.log("clicked remove"); // you should see this now

  const cartItemId = $(this).data("id");
  const token = sessionStorage.getItem("AUTH_TOKEN");

  if (!cartItemId) return toast("Cart item id missing", "error");
  if (!token) return toast("You are not logged in", "error");

  const formData = new FormData();
  formData.append("id", cartItemId);
  formData.append("token", token);
  formData.append("access_token", token);

  fetch("https://api.faadaakaa.com/api/deletecartitem", {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
   .then(result => {
  if (!result.status) {
    toast(result.message || "Failed to remove item", "error");
    return;
  }

  toast("Item removed from cart", "success");

  // Remove item visually
  $(this).closest(".cart-item").remove();

  // Refresh cart header and totals
  if (typeof window.refreshCartUI === "function") {
    window.refreshCartUI();
  }

  // Refresh product page UI immediately
  if (typeof window.checkIfCurrentProductInCart === "function") {
    window.checkIfCurrentProductInCart();
  }
})
    .catch(err => {
      console.error(err);
      toast("Network error removing item", "error");
    });
});


// EMPTY CART STATE
function renderEmptyCartState() {
  const emptyHtml = `
    <div class="text-center py-[16px]
                text-[#667085] text-[14px]">
      Your cart is empty
    </div>
  `;

  // Desktop
  $("#cartItemsWrapper").html(emptyHtml);

  // Mobile
  $("#mobileCartItemsWrapper").html(emptyHtml);

  // Reset totals
  $("#cartSubtotal").text("₦0.00");
  $("#headerCartTotal").text("₦0.00");
  $("#mobileCartSubtotal").text("₦0.00");
  $("#mobileCartTotal").text("₦0.00");

  // Hide subtotal and view cart button
  $("#cartSubtotalSection").addClass("hidden");
  $("#cartViewBtnSection").addClass("hidden");
}
 

//////// DISABLE CART UI REFRESH IF NOT NEEDED
$("#cartBtn").on("click", function () {
  const count = Number($("#cartBadge").text());
  if (count === 0) {
    toast("Your cart is empty", "info");
    return;
  }
  $("#cartTooltip").toggleClass("hidden");
});

$("#mobileCartBtn").on("click", function () {
  const count = Number($("#mobileCartCount").text().match(/\d+/)?.[0] || 0);

  if (count === 0) {
    toast("Your cart is empty", "info");
    return;
  }

  $("#mobileCartDropdown").toggleClass("hidden");
});

function renderCartUI(cartItems) {
  // ========= DESKTOP =========
  const $badge = $("#cartBadge");
  const $tooltip = $("#cartTooltip");
  const $itemsWrapper = $("#cartItemsWrapper");
  const $subtotal = $("#cartSubtotal");
  const $countText = $("#cartItemCountText");
  const $headerTotal = $("#headerCartTotal");

  // ========= MOBILE =========
  const $mobileCount = $("#mobileCartCount");
  const $mobileTotal = $("#mobileCartTotal");
  const $mobileItems = $("#mobileCartItemsWrapper");
  const $mobileSubtotal = $("#mobileCartSubtotal");

  const totalQty = cartItems.length;

  // ===== COUNTS =====
  $badge.text(totalQty);
  $countText.text(`(${String(totalQty).padStart(2, "0")})`);
  $mobileCount.text(`Cart (${totalQty})`);

  // ===== EMPTY CART =====
  if (totalQty === 0) {
    $badge.text("0");
    $countText.text("(00)");
    $mobileCount.text("Cart (0)");
    $tooltip.text("Your cart is empty");

    renderEmptyCartState();

    $("#cartDropdown").addClass("hidden");
    $("#mobileCartDropdown").addClass("hidden");
    return;
  }
  // Show subtotal and view cart when items exist
$("#cartSubtotalSection").removeClass("hidden");
$("#cartViewBtnSection").removeClass("hidden");

  // ===== TOOLTIP TEXT =====
  if (totalQty === 1) {
    $tooltip.text("1 item in cart");
  } else {
    $tooltip.text(`${totalQty} items in cart`);
  }

  // ===== CLEAR UI =====
  $itemsWrapper.empty();
  $mobileItems.empty();

  let subtotal = 0;

  cartItems.forEach(item => {
    const itemTotal = Number(item.total_item_cost || 0);
    subtotal += itemTotal;

    // ========= DESKTOP ITEM =========
    $itemsWrapper.append(`
      <div class="cart-item border-b border-[#EAECF0] last:border-b-0">
        <div class="flex items-center w-full min-h-[80px] gap-[12px] px-[8px] py-[12px]">

          <div
            class="cart-go flex items-center gap-[16px] flex-1 cursor-pointer
                   hover:bg-[#F2F6FF] transition rounded-[8px] p-[4px]"
            data-url="cart.html"
          >
            <img
              src="https://fdk1.nyc3.digitaloceanspaces.com/fdk_bucket/${item.item_image}"
              class="w-[80px] h-[80px] object-cover rounded-[8px]"
            />

            <div class="flex flex-col gap-[6px]">
              <span class="text-[#101828] text-[14px] leading-[22px] line-clamp-2">
                ${item.item_name}
              </span>

              <div class="flex items-center gap-[6px]">
                <span class="text-[#475467] text-[13px]">
                  ${item.quantity} ×
                </span>
                <span class="text-[#004EEB] text-[13px] font-[500]">
                  ₦${itemTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            class="remove-cart-item p-[6px]"
            data-id="${item.id}"
          >
            <i class="fa-solid fa-xmark text-[#98A2B3] text-[16px]
                      hover:text-[#D92D20] transition"></i>
          </button>

        </div>
      </div>
    `);

    // ========= MOBILE ITEM =========
    $mobileItems.append(`
      <div class="cart-item border-b border-[#EAECF0] last:border-b-0">
        <div class="flex items-center w-full gap-[12px] py-[12px]">

          <div
            class="cart-go flex items-center gap-[12px] flex-1 cursor-pointer
                   rounded-[8px] p-[6px]"
            data-url="/cart.html"
          >
            <img
              src="https://fdk1.nyc3.digitaloceanspaces.com/fdk_bucket/${item.item_image}"
              class="w-[60px] h-[60px] object-cover rounded-[8px]"
            />

            <div class="flex flex-col gap-[4px]">
              <span class="text-[#101828] text-[13px] leading-[18px] line-clamp-2">
                ${item.item_name}
              </span>

              <div class="flex items-center gap-[6px]">
                <span class="text-[#475467] text-[12px]">
                  ${item.quantity} ×
                </span>
                <span class="text-[#004EEB] text-[13px] font-[500]">
                  ₦${itemTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            class="remove-cart-item p-[6px]"
            data-id="${item.id}"
          >
            <i class="fa-solid fa-xmark text-[#98A2B3] text-[16px]"></i>
          </button>

        </div>
      </div>
    `);
  });

  // ===== TOTALS =====
  const formattedTotal = `₦${subtotal.toLocaleString()}`;

  $subtotal.text(formattedTotal);
  $headerTotal.text(formattedTotal);
  $mobileSubtotal.text(formattedTotal);
  $mobileTotal.text(formattedTotal);
}
// 🔔 GLOBAL CART REFRESH TRIGGER
window.refreshCartUI = function () {
  loadCartFromProfile();
};

// ===============RENDER CART HEADER EMPTY AFTER ALL CART ITEMS REMOVED=============
function resetCartHeaderState() {
  // Cart badges
  document.querySelectorAll("#cartCount, .cart-badge").forEach(badge => {
    badge.textContent = "0";
    badge.classList.add("hidden");
  });

  // Cart total amounts
  document.querySelectorAll("#cartTotalAmount, .cart-total").forEach(amountEl => {
    amountEl.textContent = "₦0.00";
  });
}

//   ============================hero slides
// ============================
// HERO SLIDER (FULLY FIXED)
// ============================
const CATEGORY_API = "https://api.faadaakaa.com/api/loadcategory";
const SLIDER_BASE =
  "https://fdk1.nyc3.digitaloceanspaces.com/fdk_bucket/";

let currentSlide = 0;
let autoSlideInterval;

// ---------------- LOAD HERO SLIDER ----------------
function loadHeroSlider() {
  fetch(CATEGORY_API)
    .then(res => res.json())
    .then(result => {
      if (!result.status || !Array.isArray(result.data)) return;

      const sliderCategories = result.data.filter(cat =>
        cat.in_spotlight === 1 &&
        cat.is_active === 1 &&
        cat.slider_image
      );

      renderHeroSlides(sliderCategories);
      renderHeroDots(sliderCategories.length);
      initHeroSlider(sliderCategories.length);
    })
    .catch(err => console.error("Hero slider error:", err));
}

// ---------------- RENDER SLIDES ----------------
function renderHeroSlides(categories) {
  const $track = $("#heroTrack");
  $track.empty();

  categories.forEach(cat => {
    const imageURL = SLIDER_BASE + cat.slider_image;

    const slide = `
      <div class="heroSlide min-w-full h-[220px] sm:h-[320px] lg:h-[520px] cursor-pointer"
           onclick="window.location='/category/${cat.slug}/1'">

        <img src="${imageURL}"
             class="w-full h-full object-contain rounded-[12px]"
             alt="${cat.name}">
      </div>
    `;

    $track.append(slide);
  });

  renderHeroDots(categories.length);
}

// --------------- GO TO SLIDE ----------------
function goToSlide(index) {
  currentSlide = index;
  $("#heroTrack").css("transform", `translateX(-${index * 100}%)`);
  updateActiveDot();
}

// -------------- HERO DOT --------------
function renderHeroDots(count) {
  const $dotsContainer = $("#carouselControls");
  $dotsContainer.empty();

  for (let i = 0; i < count; i++) {
    const dot = `
      <div
        class="dot ${i === 0 ? "active-dot w-[24px]" : "w-[8px]"}
               h-[8px] rounded-full bg-[#EAECF0] cursor-pointer transition-all"
        data-index="${i}">
      </div>
    `;
    $dotsContainer.append(dot);
  }

  $(".dot").on("click", function () {
    const index = Number($(this).data("index"));
    goToSlide(index);
    resetAutoSlide();
  });

  updateActiveDot();
}
// ---------------- SLIDER LOGIC ----------------
function initHeroSlider(totalSlides) {

  $("#nextButton").off().click(() => {
    currentSlide = (currentSlide + 1) % totalSlides;
    goToSlide(currentSlide);
    resetAutoSlide();
  });

  $("#prevButton").off().click(() => {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    goToSlide(currentSlide);
    resetAutoSlide();
  });

  autoSlideInterval = setInterval(() => {
    currentSlide = (currentSlide + 1) % totalSlides;
    goToSlide(currentSlide);
  }, 5000);
}

function resetAutoSlide() {
  clearInterval(autoSlideInterval);
  autoSlideInterval = setInterval(() => {
    currentSlide = (currentSlide + 1) % $(".heroSlide").length;
    $("#heroTrack").css("transform", `translateX(-${currentSlide * 100}%)`);
  }, 5000);
}

// ---------------- INIT ----------------
$(document).ready(function () {
  loadHeroSlider();
});


// =========LOAD TOP PRODUCTS===================
const TOP_PRODUCTS_API =
  "https://api.faadaakaa.com/api/loadproductbycat/electronics/1";

function imgUrl(item) {
  if (item.images && item.images[0]?.path) {
    return `https://fdk1.nyc3.digitaloceanspaces.com/fdk_bucket/${item.images[0].path}`;
  }
  return "./assets/images/placeholder.png";
}

function price(v) {
  return `₦${Number(v).toLocaleString()}`;
}

function monthly(v) {
  return `₦${Math.round(Number(v) / 12).toLocaleString()}/month`;
}

function populateTopProducts(products) {
  products.slice(0, 4).forEach((item, index) => {
    const $card = $(`[data-top="${index}"]`);
    if (!$card.length) return;

    const selling = item.selling_price || item.price || 0;

    $card.attr("href", `/item/${item.slug}`);
    $card.find("[data-img]").attr("src", imgUrl(item));
    $card.find("[data-name]").text(item.name);
    $card.find("[data-price]").text(price(selling));
    $card.find("[data-monthly]").text(monthly(selling));
  });
}

$(function () {
  $.get(TOP_PRODUCTS_API)
    .done(function (res) {
      if (res.status && Array.isArray(res.data)) {
        populateTopProducts(res.data);
      }
    })
    .fail(function (err) {
      console.error("Top products load failed", err);
    });
});


function updateActiveDot() {
  $(".dot").each(function (i) {
    if (i === currentSlide) {
      $(this)
        .addClass("active-dot w-[24px] bg-[#155EEF]")
        .removeClass("w-[8px] bg-[#EAECF0]");
    } else {
      $(this)
        .removeClass("active-dot w-[24px] bg-[#155EEF]")
        .addClass("w-[8px] bg-[#EAECF0]");
    }
  });
}
    // ---------- MOBILE MENU TOGGLE ----------

    $("#hamburgerBtn").click(function () {
      $(this).toggleClass("open");
      $("#mobileMenu").slideToggle(300);
     

      const spans = $(this).find("span");
      if ($(this).hasClass("open")) {
        spans.eq(0).css({ transform: "rotate(45deg) translateY(6px)" });
        spans.eq(1).css({ opacity: 0 });
        spans.eq(2).css({ transform: "rotate(-45deg) translateY(-6px)" });
      } else {
        spans.eq(0).css({ transform: "rotate(0)" });
        spans.eq(1).css({ opacity: 1 });
        spans.eq(2).css({ transform: "rotate(0)" });
      }
  
    });


    
// ---------- RENDER PRODUCT PRICE/MONTH COMPONENT ----------
function renderProductPrice(price) {
  const numericPrice = Number(price || 0);
  const monthly = Math.round(numericPrice / 12);

  return `
    <div class="flex flex-col mt-3">
      <span class="text-[14px] font-bold text-[#101828]">
        ₦${numericPrice.toLocaleString()}
      </span>

      <span class="text-[13px] font-medium text-[#004EEB]">
        ₦${monthly.toLocaleString()} / month
      </span>
    </div>
  `;
}
  // ---------- REUSABLE CATEGORY FUNCTION ----------

const PRODUCT_API_BASE = "https://api.faadaakaa.com/api/loadspotlightproductbycat";
const IMAGE_BASE = "https://fdk1.nyc3.digitaloceanspaces.com/fdk_bucket/";

// ==========================
// LOAD LANDING PAGE PRODUCTS
// ==========================
function loadLandingCategoriesWithProducts() {
  fetch(CATEGORY_API)
    .then(res => res.json())
    .then(result => {
      if (!result.status || !Array.isArray(result.data)) 
        
        return;

      const categories = result.data.filter(cat => cat.is_active === 1);
      const $container = $("#landingCategories");
      $container.empty();

      categories.forEach(cat => {
        const sectionId = `grid-${cat.slug}`;

        const sectionHTML = `
          <section class="bg-[#F7F7F7] py-8 px-4 sm:px-6 md:px-8">
            <div class="max-w-[1440px] mx-auto flex flex-col gap-[20px]">

              <div class="flex justify-between items-center">
                <div class="flex items-center">
                  <span class="inline-block w-[4px] h-[24px] rounded-sm mr-[12px]"
                        style="background: linear-gradient(180deg, #F97316, #EF4444);"></span>
                  <h2 class="text-xl sm:text-2xl font-semibold text-[#101828]">
                    ${cat.name}
                  </h2>
                </div>

                <a href="/category/${cat.slug}/1"
                   class="text-[14px] font-medium text-[#004EEB] hover:underline">
                  View All
                </a>
              </div>

              <!-- GAP REDUCED HERE -->
              <div id="${sectionId}"
                   class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6
                          gap-[8px] sm:gap-[10px] lg:gap-[12px]">
              </div>

            </div>
          </section>
        `;

        $container.append(sectionHTML);
        loadProductsForCategory(cat.slug, sectionId);
      });
    })
    .catch(err => console.error("Landing category error:", err));
}

// ==========================
// LOAD PRODUCTS BY CATEGORY
// ==========================
function loadProductsForCategory(slug, gridId) {
  fetch(`${PRODUCT_API_BASE}/${slug}/1`)
    .then(res => res.json())
    .then(result => {
      if (!result.status || !Array.isArray(result.data)) return;

      const products = shuffleArray(result.data).slice(0, 6);
      const $grid = $("#" + gridId);
      $grid.empty();

      products.forEach(item => {
        let imagePath = null;

        if (Array.isArray(item.images) && item.images.length > 0) {
          imagePath =
            item.images.find(img => img.zone === "base_image")?.path ||
            item.images[0].path;
        }

        const price = Number(item.selling_price || item.price || 0);
        const monthly = Math.round(price / 12);

        const image = imagePath
          ? IMAGE_BASE + imagePath
          : "https://via.placeholder.com/300";

        const card = `
          <a href="/item/${item.slug}"
             class="bg-white border border-[#EAECF0] rounded-[14px]
                    flex flex-col h-[340px]
                    hover:shadow-md transition">

            <!-- IMAGE -->
            <div class="flex items-center justify-center
                        bg-[#fff] h-[170px]
                        rounded-t-[14px]">
              <img src="${image}"
                   alt="${item.name}"
                   class="w-[120px] h-[120px] object-contain">
            </div>

            <!-- DIVIDER -->
            <div class="w-full h-[1px] bg-[#EAECF0]"></div>

            <!-- CONTENT -->
            <div class="flex flex-col justify-between p-[12px] flex-1">

              <h3 class="text-[13px] font-semibold text-[#101828]
                         leading-[18px]">
                ${item.name}
              </h3>

            <!-- PRICE -->
            ${renderProductPrice(price)}

            </div>
          </a>
        `;

        $grid.append(card);
      });
    })
    .catch(err => console.error(`Product error (${slug}):`, err));
}

// ==========================
// UTILITY: SHUFFLE PRODUCTS
// ==========================
function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// ==========================
// INIT
// ==========================
$(document).ready(function () {
  loadLandingCategoriesWithProducts();
  hideIndexLoader();
});

 


// ---------- GLOBAL SEARCH FUNCTION ----------
$("#searchInput").on("keydown", function (e) {
  if (e.key === "Enter") {
    const query = $(this).val().trim();
    if (!query) return;

    window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
  }
});

// ---------- MOBILE SEARCH ----------
$(document).on("keydown", ".mobileSearchInput", function (e) {
  if (e.key === "Enter") {
    const query = $(this).val().trim();
    if (!query) return;

    window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
  }
});
// =================== LOAD SPOTLIGHT CATEGORIES ==========================
// const CATEGORY_API = "https://api.faadaakaa.com/api/loadcategory";

function loadSpotlightCategories() {
  fetch(CATEGORY_API)
    .then(res => res.json())
    .then(result => {
      if (!result.status || !Array.isArray(result.data)) return;

      const spotlightCategories = result.data.filter(
        cat => cat.in_spotlight === 1 && cat.is_active === 1
      );

      renderSpotlightCategories(spotlightCategories);
      initCategorySlider(); 
    })
    .catch(err => console.error("Spotlight error:", err));
}

function renderSpotlightCategories(categories) {
  const $track = $("#categoryTrack");
  $track.empty();

  categories.forEach(cat => {
    const image =
      cat.mobile_category_image ||
      "https://via.placeholder.com/56";

    const card = `
      <div class="catItem flex flex-col items-center justify-center
        w-[160px] sm:min-w-[180px] lg:min-w-[180px]
        h-[140px] sm:h-[150px] lg:h-[160px]
        rounded-[12px] p-[16px] cursor-pointer
        hover:bg-[#E8F1FF] transition"
        style="background-color:#F8F9FC"
        onclick="window.location='/category/${cat.slug}/1'">

        <img src="${image}" class="w-[56px] h-[56px] object-contain" />

        <p class="text-[14px] font-[500] text-[#101828] mt-[8px] text-center">
          ${cat.name}
        </p>
      </div>
    `;

    $track.append(card);
  });
}
// LOAD SPOTLIGHT CATEGORIES
    loadSpotlightCategories();

function initCategorySlider() {
  let currentX = 0;

  const itemWidth = $(".catItem").outerWidth(true);
  const containerWidth = $("#categorySlider").width();
  const visibleItems = Math.min(containerWidth / itemWidth);
  const totalItems = $(".catItem").length;
  const maxX = -(itemWidth * (totalItems - visibleItems));

  $("#catNext").off().click(function () {
    if (currentX > maxX) {
      currentX -= itemWidth;
      $("#categoryTrack").css("transform", `translateX(${currentX}px)`);
    }
  });

  $("#catPrev").off().click(function () {
    if (currentX < 0) {
      currentX += itemWidth;
      $("#categoryTrack").css("transform", `translateX(${currentX}px)`);
    }
  });
}
// =================== LOAD API DROPDOWN CATEGORIES=========================

function loadCategoriesFromAPI() {
  fetch("https://api.faadaakaa.com/api/loadcategory")
    .then(res => res.json())
    .then(result => {

      if (!result.data || !Array.isArray(result.data)) {
        console.log("No category data found", result);
        return;
      }

      // DESKTOP DROPDOWN
      const $desktopDropdown = $("#categoryDropdown .flex");
      $desktopDropdown.empty();

      // MOBILE CATEGORY LIST
      const $mobileList = $("#mobileCategoryList");
      $mobileList.empty();

      result.data.forEach(cat => {

        // Desktop item
        const desktopItem = `
          <a href="/category/${cat.slug}/1"
             class="px-4 h-[36px] flex items-center text-[14px] hover:bg-[#F9FAFB]">
            ${cat.name}
          </a>
        `;

        // Mobile item
        const mobileItem = `
          <li>
            <a href="/category/${cat.slug}/1"
               class="block py-[6px] hover:text-[#155EEF]">
              ${cat.name}
            </a>
          </li>
        `;

        $desktopDropdown.append(desktopItem);
        $mobileList.append(mobileItem);
      });

    })
    .catch(err => console.log("Category load error:", err));
}
//===================== CATEGORIES SLIDER==========================
let categoryScrollAmount = 0;

$(document).on("click", "#catNext", function () {
  const slider = document.getElementById("categorySlider");
  const track = document.getElementById("categoryTrack");

  if (!slider || !track) return;

  const maxScroll = track.scrollWidth - slider.clientWidth;

  categoryScrollAmount += 220;

  if (categoryScrollAmount > maxScroll) {
    categoryScrollAmount = maxScroll;
  }

  track.style.transform = `translateX(-${categoryScrollAmount}px)`;
});

$(document).on("click", "#catPrev", function () {
  const track = document.getElementById("categoryTrack");

  if (!track) return;

  categoryScrollAmount -= 220;

  if (categoryScrollAmount < 0) {
    categoryScrollAmount = 0;
  }

  track.style.transform = `translateX(-${categoryScrollAmount}px)`;
});

});
window.toast = window.toast || function (msg, type) {
  console.log(`[${type || "info"}] ${msg}`);
};
// =======================
// GLOBAL LOGOUT
// =======================
function forceLogout() {
  sessionStorage.removeItem("AUTH_TOKEN");
  window.location.href = "/";
}
let indexLoaderStartTime = 0;

// ====SHOWLOADER==================
function showIndexLoader() {
  indexLoaderStartTime = Date.now();
  $("#indexLoader").removeClass("hidden");
}

function hideIndexLoader() {
  const MIN_DURATION = 700; // milliseconds
  const elapsed = Date.now() - indexLoaderStartTime;

  const remaining = MIN_DURATION - elapsed;

  if (remaining > 0) {
    setTimeout(() => {
      $("#indexLoader").addClass("hidden");
    }, remaining);
  } else {
    $("#indexLoader").addClass("hidden");
  }
}
// ---------- PAYMENT DROPDOWN FOR PRODUCT PAGE----------
const $clickArea = $("#paymentClickArea");
const $dropdown  = $("#paymentDropdown");
const $input     = $("#paymentInput");

// Open dropdown and position correctly
$clickArea.on("click", function (e) {
  e.stopPropagation();

  const isMobile = window.innerWidth < 1024; //

  if (!isMobile) {
    // DESKTOP / LARGE SCREENS → position with JS
    const rect = this.getBoundingClientRect();

    $dropdown.css({
      position: "absolute",
      top: rect.bottom + window.scrollY + "px",
      left: rect.left + 20 + "px"                    
    });
  } else {
    // MOBILE → let your Tailwind/HTML control the position
    $dropdown.css({
      position: "",   
      top: "320px",
      left: "50px",
      width: ""       
    });
  }

  $dropdown.toggleClass("hidden");
});

// CLICK ITEM → PUT INTO INPUT
$(".dropdown-item").on("click", function () {
  $input.val($(this).text());
  $dropdown.addClass("hidden");
});

// CLICK OUTSIDE → CLOSE
$(document).on("click", function (event) {
  if (
    !$dropdown.is(event.target) &&
    $dropdown.has(event.target).length === 0 &&
    !$clickArea.is(event.target) &&
    $clickArea.has(event.target).length === 0
  ) {
    $dropdown.addClass("hidden");
  }
});

// ============================================
// HOME HEADER: SHOW USER DATA WHEN LOGGED IN
// ============================================



// ============================================
// TOGGLE DROPDOWN
// ============================================

document.addEventListener("click", function (e) {
    const btn = document.getElementById("headerUserDropdownBtn");
    const drop = document.getElementById("headerUserDropdown");

    if (!btn || !drop) return;

    if (btn.contains(e.target)) {
        drop.classList.toggle("hidden");
    } else {
        drop.classList.add("hidden");
    }
});

// =============LOGOUT============
$(document).on("click", ".logoutBtn", function (e) {
  e.preventDefault();
  e.stopPropagation();

  // Clear auth/session
  sessionStorage.clear();
  localStorage.clear();

  // Optional: clear cookies if you use them
  // document.cookie = "token=; Max-Age=0; path=/";

  // Force redirect to homepage
  window.location.href = "/";
});
// Footer year auto-update
$("#currentYear").text(new Date().getFullYear());
