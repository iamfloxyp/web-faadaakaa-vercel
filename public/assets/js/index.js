$(document).ready(function () {

  // LOAD CATEGORIES FROM API
    loadCategoriesFromAPI();
    // slider category
    initCategorySlider();
    
  $("#categorySection").on("click", function (e) {
    e.stopPropagation();

    $("#categoryDropdown").toggle();

  
   const isMobile = window.innerWidth < 640;

// if (isMobile) {
//   // Mobile only: manual positioning if you want
//   $("#categoryDropdown").css({
//     position: "absolute",
//     top: "50px",
//     right: "100px"
//   });
// } else {
//   // Desktop: RESET to CSS-controlled positioning
//   $("#categoryDropdown").css({
//     top: "",
//     left: "",
//     position: ""
//   });
// }
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

// ⭐ HOVER LOGIC (USE #cartContainer — NOT #cartWrapper)
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
 * DESKTOP CART TOGGLE
 *******************************************/
$("#cartContainer").on("click", function (e) {
    e.stopPropagation();
    $("#cartDropdown").toggleClass("hidden");
    $("#mobileCartDropdown").addClass("hidden");
});


/*******************************************
 * MOBILE CART TOGGLE
 *******************************************/
$("#mobileCartBtn").on("click", function (e) {
    e.stopPropagation();
    $("#mobileCartDropdown").toggleClass("hidden");
    $("#cartDropdown").addClass("hidden");
});


/*******************************************
 * CLICK OUTSIDE — CLOSE ALL CART DROPDOWNS
 *******************************************/
$(document).on("click", function () {
    $("#cartDropdown").addClass("hidden");
    $("#mobileCartDropdown").addClass("hidden");
});


/*******************************************
 * PREVENT CLOSING WHEN CLICKING INSIDE DROPDOWN
 *******************************************/
$("#cartDropdown, #mobileCartDropdown").on("click", function (e) {
    e.stopPropagation();
});

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
             class="w-full h-full object-cover rounded-[12px]"
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
// ---------- HORIZONTAL SCROLLING FOR CATEGORIES ----------
let currentX = 0;

// Dynamically calculate real item width including margin
const itemWidth = $(".catItem").outerWidth(true);

// Count number of visible items based on container width
const containerWidth = $("#categorySlider").width();
const visibleItems = Math.floor(containerWidth / itemWidth);

// Total items
const totalItems = $("#categoryTrack .catItem").length;

// Maximum slide distance
const maxX = -(itemWidth * (totalItems - visibleItems));

$("#catNext").click(function () {
    if (currentX > maxX) {
        currentX -= itemWidth;
        $("#categoryTrack").css("transform", `translateX(${currentX}px)`);
    }
});

$("#catPrev").click(function () {
    if (currentX < 0) {
        currentX += itemWidth;
        $("#categoryTrack").css("transform", `translateX(${currentX}px)`);
    }
});

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
      if (!result.status || !Array.isArray(result.data)) return;

      const categories = result.data.filter(cat => cat.is_active === 1);
      const $container = $("#landingCategories");
      $container.empty();

      categories.forEach(cat => {
        const sectionId = `grid-${cat.slug}`;

        // ---------- CATEGORY SECTION ----------
        const sectionHTML = `
          <section class="bg-[#F7F7F7] py-10 px-4 sm:px-6 md:px-8">
            <div class="max-w-[1216px] mx-auto flex flex-col gap-[24px]">

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

              <div id="${sectionId}"
                   class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6
                          gap-[14px] place-items-center">
              </div>

            </div>
          </section>
        `;

        $container.append(sectionHTML);

        // ---------- LOAD PRODUCTS FOR CATEGORY ----------
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

      // ✅ FORCE GRID + GAP HERE (this is where the gap comes from)
      $grid
        .empty()
        .removeClass()
        .addClass(`
          grid
          grid-cols-2
          sm:grid-cols-3
          lg:grid-cols-6
          gap-[16px]
          sm:gap-[20px]
          md:gap-[24px]
          place-items-start
        `);

      products.forEach(item => {
        let imagePath = null;

        if (Array.isArray(item.images) && item.images.length > 0) {
          imagePath =
            item.images.find(img => img.zone === "base_image")?.path ||
            item.images[0].path;
        }

        const image = imagePath
          ? IMAGE_BASE + imagePath
          : "https://via.placeholder.com/300";

        // Optional debug
        console.log("PRODUCT:", item.name);
        console.log("IMAGE PATH:", imagePath);
        console.log("FINAL IMAGE URL:", image);

        const card = `
          <a href="/product/${item.slug}"
             class="bg-white border border-[#EAECF0] rounded-[14px]
                    flex flex-col
                    w-full
                    h-[340px]
                    hover:shadow-lg transition-all">

            <!-- IMAGE SECTION -->
            <div class="flex items-center justify-center
                        bg-[#fff] h-[170px]
                        rounded-t-[14px]">
              <img src="${image}"
                   alt="${item.name}"
                   class="w-[120px] h-[120px] object-contain">
            </div>

            <!-- DIVIDER -->
            <div class="w-full h-[1px] bg-[#EAECF0]"></div>

            <!-- CONTENT SECTION -->
            <div class="flex flex-col justify-between
                        p-[14px] flex-1 text-center">

              <h3 class="text-[13px] font-semibold
                         text-[#101828] leading-[18px]
                         line-clamp-2">
                ${item.name}
              </h3>

              <p class="text-[14px] font-bold text-[#004EEB] mt-3">
                ₦${Number(item.selling_price || item.price || 0).toLocaleString()}
              </p>
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
});

 


// ---------- GLOBAL SEARCH FUNCTION ----------
$("#searchInput").on("keyup", function () {
    let query = $(this).val().toLowerCase().trim();

    if (query === "") return; // empty → do nothing

    // Check each category list
    for (let cat of categories) {
        // If any keyword contains the query → redirect
        if (cat.keyword.some(k => k.toLowerCase().includes(query))) {
            window.location.href = cat.page;
            return;
        }
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
      initCategorySlider(); // initialize arrows AFTER render
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
        min-w-[160px] sm:min-w-[180px] lg:min-w-[180px]
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
  const visibleItems = Math.floor(containerWidth / itemWidth);
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


});



// ---------- PAYMENT DROPDOWN FOR PRODUCT PAGE----------
const $clickArea = $("#paymentClickArea");
const $dropdown  = $("#paymentDropdown");
const $input     = $("#paymentInput");

// Open dropdown and position correctly
$clickArea.on("click", function (e) {
  e.stopPropagation();

  const isMobile = window.innerWidth < 1024; // below lg

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

function loadHomeHeaderUserUI() {
    const savedUser = JSON.parse(localStorage.getItem("faadaakaaActiveUser"));

    const authButtons = document.getElementById("authButtons"); 
    const rightHeader = document.getElementById("rightHeader"); 

    if (!authButtons || !rightHeader) return;

    if (!savedUser) {
        // Not logged in → show Login + Signup
        authButtons.classList.remove("hidden");
        return;
    }

    // Logged in → hide login/signup
    authButtons.classList.add("hidden");

    // Extract user info
    const first = savedUser.firstName || "";
    const last = savedUser.lastName || "";
    const wallet = Number(savedUser.walletBalance || 0);

    // initials
    const initials = 
        (first.charAt(0) + last.charAt(0)).toUpperCase();

    // Build UI exactly like your account header
    const userUI = `
        <div id="headerUserSection" class="hidden lg:flex items-center gap-[16px] relative">

            <!-- Wallet -->
            <div class="flex items-center gap-[6px]">
                <span class="text-[#475467] text-[12px]">Wallet:</span>
                <span class="text-[#004EEB] text-[14px] font-[600]">
                    ₦${wallet.toLocaleString()}
                </span>
            </div>

            <!-- User Initials -->
            <div id="headerInitials"
                 class="w-[24px] h-[24px] bg-[#EAECF0] rounded-full 
                        flex items-center justify-center text-[#344054]
                        text-[10px] font-[600] uppercase cursor-pointer">
                ${initials}
            </div>

            <!-- Hi Name -->
            <div id="headerUserDropdownBtn"
                 class="flex items-center gap-[4px] cursor-pointer">
                <span class="text-[#344054] text-[14px]">
                    Hi ${first}
                </span>
                <i class="fa-solid fa-chevron-down text-[#475467] text-[10px]"></i>
            </div>

            <!-- Dropdown -->
            <div id="headerUserDropdown"
                 class="hidden absolute right-0 top-[36px] w-[180px] 
                        bg-white border border-[#EAECF0] rounded-[10px] 
                        shadow-lg z-[999]">
                
                <a href="account.html" 
                   class="block px-4 py-2 text-[14px] hover:bg-[#F5F7FA]">
                    My Account
                </a>

                <a href="account.html#wallet" 
                   class="block px-4 py-2 text-[14px] hover:bg-[#F5F7FA]">
                    Wallet: ₦${wallet.toLocaleString()}
                </a>

                <button id="headerLogout"
                        class="w-full text-left px-4 py-2 text-[#D92D20] hover:bg-[#FEE4E2]">
                    Logout
                </button>

            </div>

        </div>
    `;

    // Insert user UI next to the cart wrapper
    rightHeader.insertAdjacentHTML("afterend", userUI);

    // Reveal it
    document.getElementById("headerUserSection").classList.remove("hidden");
}

loadHomeHeaderUserUI();


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

// ============================================
// LOGOUT
// ============================================

document.addEventListener("click", function (e) {
    if (e.target.id === "headerLogout") {
        localStorage.removeItem("faadaakaaActiveUser");
        window.location.href = "index.html";
    }
});

// Completely Remove Login and Signup When User Is Logged In
(function removeAuthButtonsIfLoggedIn() {
    const savedUser = JSON.parse(localStorage.getItem("faadaakaaActiveUser"));
    const authButtons = document.getElementById("authButtons");

    // If the user is logged in, remove login/signup entirely
    if (savedUser && authButtons) {
        authButtons.remove();   // remove from the DOM permanently
    }
})();

