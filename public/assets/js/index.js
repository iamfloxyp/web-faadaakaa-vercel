$(document).ready(function () {

    // dropdon menu category
    
  $("#categorySection").on("click", function (e) {
    e.stopPropagation();

    $("#categoryDropdown").toggle();

    // Responsive position
    let topValue = window.innerWidth < 640 ? 50 : 60;     // small screens vs large
    let leftValue = window.innerWidth < 640 ? 0 : 300;    // mobile vs desktop

    $("#categoryDropdown").css({
      position: "absolute",
      top: topValue + "px",
      left: leftValue + "px"
    });
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
const $slides = $(".heroSlide");
const $track = $("#heroTrack");
const $dots = $("#carouselControls .dot");
const totalSlides = $slides.length;
let currentSlide = 0;
const slideDuration = 5000;

// Move track to slide
function goToSlide(index) {
  $track.css("transform", `translateX(-${index * 100}%)`);

  // Update dots
  $dots
    .removeClass("active-dot bg-[#155EEF] w-[24px] h-[8px] rounded-[7px]")
    .addClass("bg-[#EAECF0] w-[8px] h-[8px] rounded-full");

  $dots
    .eq(index)
    .removeClass("bg-[#EAECF0] w-[8px] h-[8px] rounded-full")
    .addClass("active-dot bg-[#155EEF] w-[24px] h-[8px] rounded-[7px]");
}

// Init
goToSlide(currentSlide);

// Auto slide
let autoSlide = setInterval(() => {
  currentSlide = (currentSlide + 1) % totalSlides;
  goToSlide(currentSlide);
}, slideDuration);

// Next button
$("#nextButton").click(() => {
  currentSlide = (currentSlide + 1) % totalSlides;
  goToSlide(currentSlide);
  clearInterval(autoSlide);
});

// Prev button
$("#prevButton").click(() => {
  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  goToSlide(currentSlide);
  clearInterval(autoSlide);
});

// Dots
$dots.click(function () {
  currentSlide = $(this).index();
  goToSlide(currentSlide);
  clearInterval(autoSlide);
});
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
function renderCategory(gridSelector, buttonSelector, itemsArray) {
  const $grid = $(gridSelector);
  const $button = $(buttonSelector);
  let showingAll = false;

  function renderItems(limit = 4) {
    $grid.empty();
    const visibleItems = itemsArray.slice(0, limit);

    $.each(visibleItems, function (_, item) {
      const card = `
        <a href="${item.link}"
           class="bg-[#F9FAFB] border border-[#EAECF0] rounded-[12px]
                  flex flex-col w-[150px] sm:w-[180px] md:w-[200px]
                  h-[260px] hover:shadow-md transition">

          <!-- IMAGE AREA -->
          <div class="flex justify-center items-center border-b border-[#EAECF0]
                      py-[10px] bg-[#EAECF0] rounded-t-[12px] h-[120px]">
            <img src="${item.image}"
                 alt="${item.name}"
                 class="w-[80px] h-[80px] object-contain">
          </div>

          <!-- TEXT AREA -->
          <div class="flex flex-col justify-between p-[10px] bg-white rounded-b-[12px] text-center h-[140px]">

            <h3 class="text-[13px] font-semibold text-[#101828] leading-[18px]">
              ${item.name}
            </h3>

            <div class="flex flex-col gap-[2px] mt-[6px]">
              <p class="text-[12px] font-medium text-[#004EEB]">
                ${item.monthly}
              </p>
              <p class="text-[12px] font-medium text-[#101828]">
                ${item.total}
              </p>
            </div>

          </div>

        </a>
      `;

      $grid.append(card);
    });
  }

  // Initial render
  renderItems(6);
}

  // ---------- PHONES & TABLETS ----------
  const phones = [
    {
      name: "Apple iPhone 15 Plus 6.7",
      image: "./assets/images/iphone15plus.png",
      monthly: "₦116,666.67/month",
      total: "₦1,400,000.00",
      link: "./product-pages/iphone15plus.html",
    },
    {
      name: "Apple iPhone 15 – 128GB Facetime",
      image: "./assets/images/iphone15.png",
      monthly: "₦110,416.67/month",
      total: "₦1,325,000.00",
      link: "./product-pages/iphone15.html",
    },
    {
      name: "Apple iPhone 16 – 8GB 256GB",
      image: "./assets/images/iphone16.jpg",
      monthly: "₦140,625.00/month",
      total: "₦1,687,500.00",
      link: "./product-pages/iphone16.html",
    },
    {
      name: "Apple iPhone 16 Pro – 8GB 256GB",
      image: "./assets/images/iphone16plus.jpg",
      monthly: "₦196,354.17/month",
      total: "₦2,356,250.00",
      link: "./product-pages/iphone16pro.html",
    },
    {
      name: "Samsung Galaxy S23 Ultra – 12GB 256GB",
      image: "./assets/images/samsungS23.png",
      monthly: "₦220,000.00/month",
      total: "₦2,640,000.00",
      link: "./product-pages/samsungS23.html",
    },
     {
      name: "Apple iPhone 16 – 8GB 256GB",
      image: "./assets/images/iphone16.jpg",
      monthly: "₦140,625.00/month",
      total: "₦1,687,500.00",
      link: "./product-pages/iphone16.html",
    },
    {
      name: "Apple iPhone 16 Pro – 8GB 256GB",
      image: "./assets/images/iphone16plus.jpg",
      monthly: "₦196,354.17/month",
      total: "₦2,356,250.00",
      link: "./product-pages/iphone16pro.html",
    },
  ];

  renderCategory("#phonesGrid", "#viewAllPhones", phones);

  // ---------- HOME ELECTRONICS ----------
  const electronics = [
    {
      name: "KENSTAR 50 Inches VIDAA 4K UHD",
      image: "./assets/images/kenstar.png",
      monthly: "₦38,291.67/month",
      total: "₦459,500.00",
      link: "./product-pages/kenstar50.html",
    },
    {
      name: "MAXI Stand FAN 16-inch White",
      image: "./assets/images/fan.jpg",
      monthly: "₦2,875.00/month",
      total: "₦34,500.00",
      link: "./product-pages/maxifan.html",
    },
    {
      name: "Mora 43-inch LED Smart HD TV",
      image: "./assets/images/smarttv.jpg",
      monthly: "₦26,791.67/month",
      total: "₦321,500.00",
      link: "./product-pages/mora43.html",
    },
    {
      name: "Hisense 55-inch Smart UHD TV",
      image: "./assets/images/Hisense.png",
      monthly: "₦38,083.33/month",
      total: "₦1,177,000.00",
      link: "./product-pages/hisense55.html",
    },
    {
      name: "BRUHM Single Door Refrigerator",
      image: "./assets/images/refrigerator.png",
      monthly: "₦33,000.00/month",
      total: "₦396,000.00",
      link: "./product-pages/bruhm-fridge.html",
    },
     {
      name: "Hisense 55-inch Smart UHD TV",
      image: "./assets/images/Hisense.png",
      monthly: "₦38,083.33/month",
      total: "₦1,177,000.00",
      link: "./product-pages/hisense55.html",
    },
    {
      name: "BRUHM Single Door Refrigerator",
      image: "./assets/images/refrigerator.png",
      monthly: "₦33,000.00/month",
      total: "₦396,000.00",
      link: "./product-pages/bruhm-fridge.html",
    },
  ];

  renderCategory("#electronicsGrid", "#viewAllElectronics", electronics);

  // ---------- ACs, Refrigerators & Coolers ----------
const cooling = [
  {
    name: "HT Freezer Chest LRG HTF-519IS",
    image: "./assets/images/chestfreezer.jpg",
    monthly: "₦38,291.67/month",
    total: "₦459,500.00",
    link: "./product-pages/ht-freezer.html",
  },
  {
    name: "Kenstar Double Door Fridge, 350L",
    image: "./assets/images/kenstar fridge.png",
    monthly: "₦14,708.33/month",
    total: "₦176,500.00",
    link: "./product-pages/kenstar-fridge.html",
  },
  {
    name: "Kenstar Freezer 142L Adjustable",
    image: "./assets/images/kenstar freezer.jpg",
    monthly: "₦2,875.00/month",
    total: "₦34,500.00",
    link: "./product-pages/kenstar-freezer.html",
  },
  {
    name: "BRUHM 205L, 2 Glass Shelve",
    image: "./assets/images/bruhum.jpg",
    monthly: "₦26,791.67/month",
    total: "₦321,500.00",
    link: "./product-pages/bruhm-freezer.html",
  },
    {
    name: "Kenstar Freezer 142L Adjustable",
    image: "./assets/images/kenstar freezer.jpg",
    monthly: "₦2,875.00/month",
    total: "₦34,500.00",
    link: "./product-pages/kenstar-freezer.html",
  },
  {
    name: "BRUHM 205L, 2 Glass Shelve",
    image: "./assets/images/bruhum.jpg",
    monthly: "₦26,791.67/month",
    total: "₦321,500.00",
    link: "./product-pages/bruhm-freezer.html",
  },
];

renderCategory("#coolingGrid", "#viewAllCooling", cooling);

// ---------- Power Solutions & Inverters ----------
  const power = [
    {
      name: "Itel Energy 500W Inverter Power",
      image: "./assets/images/itelenergy.jpg",
      monthly: "₦38,291.67/month",
      total: "₦459,500.00",
      link: "./product-pages/itel-inverter.html",
    },
    {
      name: "15KVA Servo Voltage Stabilizer",
      image: "./assets/images/voltagestabilizer.png",
      monthly: "₦14,708.33/month",
      total: "₦176,500.00",
      link: "./product-pages/servo-stabilizer.html",
    },
    {
      name: "Solar Panel ZN SHINE 605W",
      image: "./assets/images/shinesolar.png",
      monthly: "₦2,875.00/month",
      total: "₦34,500.00",
      link: "./product-pages/shine-solar.html",
    },
    {
      name: "Growatt 10KW Inverter Hybrid",
      image: "./assets/images/growatt.jpg",
      monthly: "₦38,083.33/month",
      total: "₦1,177,000.00",
      link: "./product-pages/growatt-inverter.html",
    },
        {
      name: "Solar Panel ZN SHINE 605W",
      image: "./assets/images/shinesolar.png",
      monthly: "₦2,875.00/month",
      total: "₦34,500.00",
      link: "./product-pages/shine-solar.html",
    },
    {
      name: "Growatt 10KW Inverter Hybrid",
      image: "./assets/images/growatt.jpg",
      monthly: "₦38,083.33/month",
      total: "₦1,177,000.00",
      link: "./product-pages/growatt-inverter.html",
    },
  ];

  // Initialize category
  renderCategory("#powerGrid", "#viewAllPower", power);

  // ---------- Food & Consumables ----------
  const food = [
    {
      name: "50kg Aga Premium Quality Rice",
      image: "./assets/images/agarice.png",
      monthly: "₦38,291.67/month",
      total: "₦459,500.00",
      link: "./product-pages/aga-rice.html",
    },
    {
      name: "10kg Mama’s Pride Parboiled Rice",
      image: "./assets/images/10kgmama.jpg",
      monthly: "₦14,708.33/month",
      total: "₦176,500.00",
      link: "./product-pages/mama-pride.html",
    },
    {
      name: "25kg MAMA GOLD Rice",
      image: "./assets/images/mamagold.jpg",
      monthly: "₦2,875.00/month",
      total: "₦34,500.00",
      link: "./product-pages/mama-gold.html",
    },
    {
      name: "25kg Mama’s Pride Parboiled Rice",
      image: "./assets/images/25kgmama.png",
      monthly: "₦38,083.33/month",
      total: "₦1,177,000.00",
      link: "./product-pages/mama-pride-25kg.html",
    },
     {
      name: "25kg MAMA GOLD Rice",
      image: "./assets/images/mamagold.jpg",
      monthly: "₦2,875.00/month",
      total: "₦34,500.00",
      link: "./product-pages/mama-gold.html",
    },
    {
      name: "25kg Mama’s Pride Parboiled Rice",
      image: "./assets/images/25kgmama.png",
      monthly: "₦38,083.33/month",
      total: "₦1,177,000.00",
      link: "./product-pages/mama-pride-25kg.html",
    },
  ];

  // Initialize category
   renderCategory("#foodGrid", "#viewAllFood", food);


  // 1. Categories + keywords
const categories = [
  {
    name: "Phones & Tablets",
    keyword: [
      "phone", "phones", "tablet", "tablets", "iphone", "android", "smartphone",
      "itel", "samsung", "tecno", "infinix", "ipad"
    ],
    page: "phones.html"
  },

  {
    name: "Home Electronics",
    keyword: [
      "electronics", "tv", "television", "smart tv", "led tv", "uhd", "4k",
      "speaker", "fan", "sound", "mora", "hisense", "bruhm"
    ],
    page: "electronics.html"
  },

  {
    name: "Home, Kitchen & Laundry",
    keyword: [
      "kitchen", "laundry", "home", "cooker", "gas", "microwave",
      "washing", "blender", "toaster", "oven"
    ],
    page: "kitchen.html"
  },

  {
    name: "ACs, Refrigerators & Coolers",
    keyword: [
      "ac", "air conditioner", "refrigerator", "fridge", "freezer",
      "cooler", "kenstar", "bruhm", "ht", "deep freezer"
    ],
    page: "acs.html"
  },

  {
    name: "Power Solutions & Inverters",
    keyword: [
      "inverter", "solar", "battery", "generator", "power", "stabilizer",
      "growatt", "itel energy", "solar panel"
    ],
    page: "power.html"
  },

  {
    name: "Food & Consumables",
    keyword: [
      "food", "rice", "bag rice", "mama's pride", "mama gold",
      "aga rice", "parboiled", "grain"
    ],
    page: "food.html"
  },

  {
    name: "Office & Stationery",
    keyword: [
      "stationery", "office", "pen", "book", "notebook", "paper", "printer"
    ],
    page: "stationery.html"
  }
];

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