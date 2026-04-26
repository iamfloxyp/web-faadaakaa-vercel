
const IMAGE_BASE =
  "https://fdk1.nyc3.digitaloceanspaces.com/fdk_bucket/";

// ==============================
// GET PRODUCT FROM URL
// ==============================
const slug = window.location.pathname.split("/").pop();

if (!slug) {
  console.error("Product slug missing from URL");
}

// ==============================
// PRICE HELPERS
// ==============================
function formatPrice(amount) {
  return Number(amount || 0).toLocaleString();
}

function monthlyPrice(amount) {
  return Math.round(Number(amount || 0) / 12).toLocaleString();
}

// ==============================
// SPLIT DESCRIPTION VS SPECIFICATION
// ==============================
function splitContent(text = "") {
  const lines = text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  const specKeywords = [
    "brand",
    "model",
    "ram",
    "rom",
    "storage",
    "screen",
    "display",
    "size",
    "inch",
    "resolution",
    "android",
    "capacity",
    "battery",
    "processor",
    "cpu",
    "camera"
  ];

  const description = [];
  const specification = [];

  lines.forEach(line => {
    const lower = line.toLowerCase();
    const isSpec = specKeywords.some(k => lower.includes(k));

    if (isSpec) {
      specification.push(line);
    } else {
      description.push(line);
    }
  });

  return {
    description,
    specification
  };
}

// ==============================
// LOAD PRODUCT
// ==============================
function loadProductDetails() {
  showProductLoader();

  fetch(`https://api.faadaakaa.com/api/loadproductbyslug/${slug}`)
    .then(res => res.json())
    .then(result => {
      if (!result.status || !result.data?.length) {
        console.error("Product not found");
        return;
      }

      renderProduct(result.data[0]);
    })
    .catch(err => {
      console.error("Product load error", err);
    })
    .finally(() => {
      hideProductLoader();
    });
}

// ==============================
// RENDER PRODUCT
// ==============================
function renderProduct(product) {
CURRENT_PRODUCT = product;
  document.title = `${product.name} - Faadaakaa`;
$("#productName").text(product.name);

$("#addToCartBtn").attr("data-product-id", product.id);
  // ---------- MAIN IMAGE ----------
  let mainImage = "/assets/images/placeholder.png";
  const baseImage = product.images?.find(i => i.zone === "base_image");

  if (baseImage?.path) {
    mainImage = IMAGE_BASE + baseImage.path;
  }

  $("#mainProductImage").attr("src", mainImage);

  // ---------- THUMBNAILS ----------
const $track = $("#thumbnailTrack");
$track.empty();

// Reset alignment first
$track.removeClass("justify-center");

const validImages = Array.isArray(product.images)
  ? product.images.filter(img => img.path)
  : [];

// Center ONLY when 1, 2, or 3 images
if (validImages.length > 0 && validImages.length <= 3) {
  $track.addClass("justify-center");
}

validImages.forEach(img => {
  const src = IMAGE_BASE + img.path;

  $track.append(`
    <div class="thumbContainer flex-none w-[112px] h-[111px]
         border border-[#EAECF0] rounded-[12px] p-[16px]
         flex items-center justify-center">
      <img
        src="${src}"
        data-full="${src}"
        class="thumbImage w-[92px] h-[91px]
               object-contain cursor-pointer"
      />
    </div>
  `);
});

  // ---------- THUMBNAIL CLICK (SWAP) ----------
  $(document).off("click", ".thumbImage");
  $(document).on("click", ".thumbImage", function () {
    const clickedSrc = $(this).data("full");
    const currentMain = $("#mainProductImage").attr("src");

    $("#mainProductImage").attr("src", clickedSrc);
    $(this).attr("src", currentMain).data("full", currentMain);
  });

  // ---------- DESCRIPTION (SMART COLLAPSE) ----------
const { description, specification } = splitContent(product.description || "");

const MAX_LINES = 3; // number of paragraphs to show initially

if (!description.length) {
  $("#descriptionContent").html("<p>No description available</p>");
} else if (description.length <= MAX_LINES) {
  // Short description, show everything
  $("#descriptionContent").html(
    `<p>${description.join("</p><p>")}</p>`
  );
} else {
  // Long description, show preview + expand
  const preview = description.slice(0, MAX_LINES);
  const remaining = description.slice(MAX_LINES);

  $("#descriptionContent").html(`
    <div id="descPreview">
      <p>${preview.join("</p><p>")}</p>
    </div>

    <div id="descFull" class="hidden mt-[8px]">
      <p>${remaining.join("</p><p>")}</p>
    </div>

    <span
      id="toggleDescription"
      class="inline-block mt-[8px] text-[13px] text-[#004EEB] cursor-pointer font-medium">
      View full description
    </span>
  `);

  // Toggle logic
  $("#toggleDescription").on("click", function () {
    const isHidden = $("#descFull").hasClass("hidden");

    $("#descFull").toggleClass("hidden");
    $(this).text(isHidden ? "Show less" : "View full description");
  });
}

 $("#specificationContent").html(`
  <p class="text-[#667085] text-[14px] leading-[20px]">
    This product does not require separate technical specifications.
    All relevant details are included in the product description.
  </p>
`);
  // ---------- RIGHT SIDE PRICING ----------

// Get product price safely
const price = product.selling_price || product.price || 0;

// Format helper (you already have this)
const formattedPrice = `₦${formatPrice(price)}`;

// MAIN PRICE
$("#rightProductPrice").text(formattedPrice);

// OUTRIGHT PAYMENT OPTION
$("#payOutright").text(`Pay ${formattedPrice} for outright purchase`);

// PAYMENT INPUT RESET
$("#paymentInput").val("");

// AVAILABILITY
if (product.in_stock === 1) {
  $("#productAvailability")
    .text("In Stock")
    .removeClass("text-[#D92D20]")
    .addClass("text-[#0000FF]");
} else {
  $("#productAvailability")
    .text("Out of Stock")
    .removeClass("text-[#0000FF]")
    .addClass("text-[#D92D20]");
}

// DISCOUNT (for now, static or hidden)
$("#rightDiscount").text("@ 0.00% discount");


function setupPaymentOptions(product) {

  const price = Number(product.selling_price || product.price || 0);
  const interestRate = 0.027;

  const firstPayment = price * 0.4;
  const remaining = price * 0.6;

  // Reset UI
  $("#paymentInput").val("");
  $("#installmentOptions").empty();
  $("#paymentTermsBody").html(`
    <p class="text-[#535862] text-[14px]">
      Please select payment plan to see payment terms
    </p>
  `);

  /// OUTRIGHT
$("#payOutright").html(`
  <span class="font-[600] text-[14px] whitespace-nowrap">
    Outright,
  </span>
  <span class="text-[14px]">
    pay ₦${formatPrice(price)} for full purchase
  </span>
`)
.off("click")
.on("click", function () {

  // ✅ Use the exact clicked text, not a hardcoded value
  const clickedText = $(this).text().replace(/\s+/g, " ").trim();
  $("#paymentInput").val(clickedText);

  $("#paymentDropdown").addClass("hidden");

  $("#paymentTermsBody").html(`
    <div class="flex justify-between py-[4px]">
      <span>Total Cost</span>
      <span class="font-[500]">₦${formatPrice(price)}</span>
    </div>
  `);
});

  // INSTALLMENTS 2 → 8 MONTHS
  for (let months = 2; months <= 8; months++) {

    const interestAmount = remaining * interestRate * months;
    const totalWithInterest = remaining + interestAmount;
    const monthlyPayment = totalWithInterest / months;

  $("#installmentOptions").append(`
  <p class="dropdown-item installment-item
            w-full flex items-start gap-[6px]
            px-4 py-3
            text-[#344054] text-[14px]
            hover:bg-[#004EEB] hover:text-white
            cursor-pointer select-none
            border-b border-[#EAECF0]
            last:border-b-0
            transition"
     data-months="${months}"
     data-first="${firstPayment}"
     data-monthly="${monthlyPayment}">

    <span class="font-[600] text-[14px] whitespace-nowrap">
      ${months} months,
    </span>

    <span class="text-[13px]">
      pay ₦${formatPrice(firstPayment)}, then ₦${formatPrice(monthlyPayment)}/month
    </span>

  </p>
`);
  }
  window.CURRENT_UNIT_PRICE = Number(
  product.selling_price || product.price || 0
);
}

// OPEN DROPDOWN
$(document).on("click", "#paymentClickArea", function (e) {
  e.stopPropagation();
  $("#paymentDropdown").toggleClass("hidden");
});

// CLOSE WHEN CLICKING OUTSIDE
$(document).on("click", function () {
  $("#paymentDropdown").addClass("hidden");
});

// PREVENT CLOSE WHEN CLICKING INSIDE
$(document).on("click", "#paymentDropdown", function (e) {
  e.stopPropagation();
});


$(document).on("click", "#installmentOptions .dropdown-item", function () {
  const months = $(this).data("months");
  const first = Number($(this).data("first"));
  const monthly = Number($(this).data("monthly"));

  // Show EXACT text user clicked (but clean spaces)
  const clickedText = $(this).text().replace(/\s+/g, " ").trim();
  $("#paymentInput").val(clickedText);

  $("#paymentDropdown").addClass("hidden");

  $("#paymentTermsBody").html(`
    <div class="flex justify-between py-[6px]">
      <span>First Payment</span>
      <span class="font-[500] text-[#1D4ED8]">₦${formatPrice(first)}</span>
    </div>

    <div class="flex justify-between py-[6px] items-start">
      <div class="flex flex-col">
        <span>Subsequent Payments</span>
        <span class="text-[12px] text-[#412B76A]">${months} months cycle</span>
      </div>

      <span class="font-[500] mt-[6px] text-[#F04438]">
        ₦${formatPrice(monthly)}/month
      </span>
    </div>
  `);
});
setupPaymentOptions(product);
checkIfCurrentProductInCart();


}
let CURRENT_PRODUCT = null;
let CURRENT_CART_QTY = 0;

// ------------------------------
// UI TOGGLER
// ------------------------------
function setCartStateUI({ inCart, qty = 1 }) {
  // Ensure action buttons are shown only after cart state is known
  $("#actionButtons").removeClass("hidden");

  if (inCart) {
    $("#addToCartState").addClass("hidden");
    $("#alreadyInCartState").removeClass("hidden");

    // Hide sections that should disappear
    $("#availabilityRow").addClass("hidden");
    $("#howToPaySection").addClass("hidden");
    $("#paymentTermsBox").addClass("hidden");

    // Quantity
    CURRENT_CART_QTY = Number(qty) > 0 ? Number(qty) : 1;
    $("#cartQty").text(CURRENT_CART_QTY);

    // Price calculation
    const unitPrice = Number(window.CURRENT_UNIT_PRICE || 0);
    const total = unitPrice * CURRENT_CART_QTY;

    $("#inCartPrice").text(`₦${formatPrice(total)}`);
  } else {
    $("#addToCartState").removeClass("hidden");
    $("#alreadyInCartState").addClass("hidden");

    // Show sections again
    $("#availabilityRow").removeClass("hidden");
    $("#howToPaySection").removeClass("hidden");
    $("#paymentTermsBox").removeClass("hidden");
  }
}

// ------------------------------
// LOAD PROFILE CART + CHECK PRODUCT
// ------------------------------
function checkIfCurrentProductInCart() {
  const token = sessionStorage.getItem("AUTH_TOKEN");
  if (!token) {
    // Not logged in, so we can’t confirm cart status
    setCartStateUI({ inCart: false });
    return;
  }

  // If product not ready yet, stop
  if (!CURRENT_PRODUCT || !CURRENT_PRODUCT.id) return;

  const formData = new FormData();
  formData.append("token", token);

  fetch("https://api.faadaakaa.com/api/loadprofile", {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(result => {
      if (!result.status || !result.data?.cart?.status) {
        setCartStateUI({ inCart: false });
        return;
      }

      const cartItems = result.data.cart.data || [];

      // IMPORTANT:
      // Different APIs name it differently, so we check multiple keys safely.
      const match = cartItems.find(i => {
        const pid = Number(i.product_id || i.item_id || i.id || 0);
        return pid === Number(CURRENT_PRODUCT.id);
      });

      if (match) {
        setCartStateUI({
          inCart: true,
          qty: Number(match.quantity || 1)
        });
      } else {
        setCartStateUI({ inCart: false });
      }
    })
    .catch(err => {
      console.error("Cart check error:", err);
      setCartStateUI({ inCart: false });
    });
}
window.checkIfCurrentProductInCart = checkIfCurrentProductInCart;

// ====BUTTON LOADER=====
function startBtnLoading(btn) {
  btn.prop("disabled", true);
  btn.find(".btn-loader").removeClass("hidden");
}

function stopBtnLoading(btn) {
  btn.prop("disabled", false);
  btn.find(".btn-loader").addClass("hidden");
}

// ------------------------------
// ADD TO CART HANDLER
// ------------------------------
$(document).on("click", "#addToCartBtn", function () {
  const btn = this;
  const token = sessionStorage.getItem("AUTH_TOKEN");

  if (!token) {
    sessionStorage.setItem("Redirect_AFTER_LOGIN", window.location.href);
    window.location.href = "/login.html";
    return;
  }

  const productId = $(this).data("product-id");
  if (!productId) {
    toast("Product ID missing", "error");
    return;
  }

  const paymentText = $("#paymentInput").val();

  // ✅ VALIDATE FIRST
  if (
  !paymentText ||
  (!paymentText.includes("months") &&
    !paymentText.toLowerCase().includes("outright"))
)
 {
  showPaymentPlanModal();
  return;
}

  // ✅ START LOADER ONLY AFTER VALIDATION
  startBtnLoading($(btn));

 let period;
let paymentType;

const isOutright = paymentText.toLowerCase().includes("outright");

if (isOutright) {
  period = 0;
  paymentType = "outright";
} else {
  period = parseInt(paymentText, 10);
  paymentType = "installment";
}

//  HARD SAFETY CHECK
if (Number.isNaN(period)) {
  toast("Invalid payment plan selected. Please reselect.", "error");
  stopBtnLoading($(btn));
  return;
}
  const itemImage = $("#mainProductImage")
    .attr("src")
    .split("/")
    .pop();

  const formData = new FormData();
  formData.append("product_id", productId);
  formData.append("item_image", itemImage);
  formData.append("period", period);
  formData.append("payment_type", paymentType);
  formData.append("token", token);
  formData.append("access_token", token);

  console.log("ADD TO CART PAYLOAD", {
  product_id: productId,
  period,
  payment_type: paymentType,
  token_present: !!token
});

  fetch("https://api.faadaakaa.com/api/addtocart", {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(result => {
      if (result.status === true) {
        toast("Item added to cart", "success");

        if (typeof window.refreshCartUI === "function") {
          window.refreshCartUI();
        }

        checkIfCurrentProductInCart();
      } else {
        toast(result.message || "Add to cart failed", "error");
      }
    })
    .catch(() => {
      toast("Something went wrong", "error");
    })
    .finally(() => {
      stopBtnLoading($(btn));
    });
});

// ------------------------------
// BUY NOW HANDLER
// ------------------------------
$(document).on("click", "#buyNowBtn", function () {
  const btn = this;
  const token = sessionStorage.getItem("AUTH_TOKEN");

  if (!token) {
    sessionStorage.setItem("Redirect_AFTER_LOGIN", window.location.href);
    window.location.href = "/login.html";
    return;
  }

  if (!CURRENT_PRODUCT?.id) {
    toast("Product not ready", "error");
    return;
  }

  //  PAYMENT PLAN VALIDATION FIRST
  const paymentText = $("#paymentInput").val();
  if (
  !paymentText ||
  (!paymentText.includes("months") &&
    !paymentText.toLowerCase().includes("outright"))
) {
  showPaymentPlanModal();
  return;
}

  // prevent double click
  if ($(this).data("loading")) return;
  $(this).data("loading", true);

  // ✅ START LOADER ONLY AFTER VALIDATION
  startBtnLoading($(btn));

 let period;
let paymentType;

const isOutright = paymentText.toLowerCase().includes("outright");

if (isOutright) {
  period = 0;
  paymentType = "outright";
} else {
  period = parseInt(paymentText, 10);
  paymentType = "installment";
}

//  HARD SAFETY CHECK
if (Number.isNaN(period)) {
  toast("Invalid payment plan selected. Please reselect.", "error");
  stopBtnLoading($(btn));
  return;
}

  const itemImage = $("#mainProductImage")
    .attr("src")
    ?.split("/")
    .pop();

  const formData = new FormData();
  formData.append("product_id", CURRENT_PRODUCT.id);
  formData.append("item_image", itemImage || "");
  formData.append("period", period);
  formData.append("payment_type", paymentType);
  formData.append("token", token);
  formData.append("access_token", token);

  fetch("https://api.faadaakaa.com/api/addtocart", {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(result => {
      if (!result.status) {
        toast(result.message || "Failed to add item", "error");
        $(btn).data("loading", false);
        stopBtnLoading($(btn));
        return;
      }

      toast("Item added to cart", "success");

      if (typeof window.refreshCartUI === "function") {
        window.refreshCartUI();
      }

      setTimeout(() => {
        window.location.href = "/cart.html";
      }, 1500);
    })
    .catch(() => {
      toast("Network error", "error");
    })
    .finally(() => {
      $(btn).data("loading", false);
      stopBtnLoading($(btn));
    });
});


// ===============INCART BUTTON LOADER===============
// ====BUTTON/LINK LOADER (works for <button> and <a>)=====
function startBtnLoading($el) {
  $el.addClass("pointer-events-none opacity-80");
  $el.attr("aria-disabled", "true");
  $el.find(".btn-loader").removeClass("hidden");
}

function stopBtnLoading($el) {
  $el.removeClass("pointer-events-none opacity-80");
  $el.removeAttr("aria-disabled");
  $el.find(".btn-loader").addClass("hidden");
}

$(document).on("click", "#loginBtn", function () {
  const $btn = $(this);

  // prevent double click
  if ($btn.prop("disabled")) return;

  // save current page for redirect after login
  sessionStorage.setItem(
    "REDIRECT_AFTER_LOGIN",
    window.location.href
  );

  //  START SPINNER (reuse existing helper)
  startButtonLoading($btn);

  // redirect shortly after spinner starts
  setTimeout(() => {
    window.location.href = "/login.html";
  }, 600);
});
// ===============================
// ALREADY IN CART: BUY NOW LOADER
// ===============================
$(document).on("click", "#inCartBuyNowBtn", function (e) {
  e.preventDefault();

  const $btn = $(this);

  // prevent double click
  if ($btn.data("loading")) return;
  $btn.data("loading", true);

  startBtnLoading($btn);

  // allow the loader to show before navigating
  setTimeout(() => {
    window.location.href = $btn.attr("href") || "/cart.html";
  }, 150);
});
//  ========SHOW PAYMENT INVALID MODAL POPUP======================
function showPaymentPlanModal() {
  $("#paymentPlanModal").removeClass("hidden").addClass("flex");
}

$("#closePaymentPlanModal").on("click", function () {
  $("#paymentPlanModal").addClass("hidden").removeClass("flex");
});
// ------------------------------
// ALREADY IN CART UI BUTTONS (VISUAL ONLY)
// ------------------------------
function updateCartQuantity(newQty) {
  const token = sessionStorage.getItem("AUTH_TOKEN");
  if (!token || !CURRENT_PRODUCT?.id) return Promise.reject();

  const formData = new FormData();
  formData.append("product_id", CURRENT_PRODUCT.id);
  formData.append("quantity", newQty);
  formData.append("token", token);

  return fetch("https://api.faadaakaa.com/api/updatecart", {
    method: "POST",
    body: formData
  }).then(res => res.json());
}


$(document).on("click", "#increaseQty", function () {
  const nextQty = CURRENT_CART_QTY + 1;

  updateCartQuantity(nextQty)
    .then(result => {
      if (!result.status) {
        toast(result.message || "Failed to update cart", "error");
        return;
      }

      CURRENT_CART_QTY = nextQty;
      $("#cartQty").text(CURRENT_CART_QTY);

      const total = CURRENT_UNIT_PRICE * CURRENT_CART_QTY;
      $("#inCartPrice").text(`₦${formatPrice(total)}`);

      toast("Item quantity increased", "success");

      if (typeof window.refreshCartUI === "function") {
        window.refreshCartUI();
      }
    })
    .catch(() => {
      toast("Network error updating cart", "error");
    });
});


$(document).on("click", "#decreaseQty", function () {
  if (CURRENT_CART_QTY <= 1) return;

  const nextQty = CURRENT_CART_QTY - 1;

  updateCartQuantity(nextQty)
    .then(result => {
      if (!result.status) {
        toast(result.message || "Failed to update cart", "error");
        return;
      }

      CURRENT_CART_QTY = nextQty;
      $("#cartQty").text(CURRENT_CART_QTY);

      const total = CURRENT_UNIT_PRICE * CURRENT_CART_QTY;
      $("#inCartPrice").text(`₦${formatPrice(total)}`);

      toast("Item quantity reduced", "success");

      if (typeof window.refreshCartUI === "function") {
        window.refreshCartUI();
      }

      if (CURRENT_CART_QTY === 0) {
        setCartStateUI({ inCart: false });
      }
    })
    .catch(() => {
      toast("Network error updating cart", "error");
    });
});
// ==============================
// TOAST HELPER
// ==============================
function toast(message, type = "success") {
  const bg = type === "success" ? "#16a34a" : "#dc2626";

  const toastEl = document.createElement("div");
  toastEl.style.position = "fixed";
  toastEl.style.top = "20px";
  toastEl.style.right = "20px";
  toastEl.style.zIndex = "9999";
  toastEl.style.background = bg;
  toastEl.style.color = "#fff";
  toastEl.style.padding = "10px 14px";
  toastEl.style.borderRadius = "6px";
  toastEl.style.fontSize = "13px";
  toastEl.style.boxShadow = "0 4px 10px rgba(0,0,0,.15)";
  toastEl.textContent = message;

  document.body.appendChild(toastEl);

  setTimeout(() => {
    toastEl.remove();
  }, 3000);
}

// ==============CARTBADGE===============

function updateCartBadge(count) {
  $("#cartBadge")
    .text(count)
    .removeClass("hidden");

  updateCartTooltip();
}
// /////////LOGIN OR ADD TO CART PRODUCT DETAILS ///////////
function updateActionButtons() {
  const token = sessionStorage.getItem("AUTH_TOKEN");

  if (token) {
    // USER IS LOGGED IN
    $("#buyNowBtn, #addToCartBtn").removeClass("hidden");
    $("#loginBtn").addClass("hidden");
  } else {
    // USER NOT LOGGED IN
    $("#buyNowBtn, #addToCartBtn").addClass("hidden");
    $("#loginBtn").removeClass("hidden");
  }
}

$("#loginBtn").on("click", function () {
  // Save current page
  sessionStorage.setItem("Redirect_AFTER_LOGIN", window.location.href);

  // Go to login page
  window.location.href = "/login.html";
});
// ==============================
// TAB NAVIGATION
// ==============================
$(document).on("click", ".tab-btn", function () {
  const tab = $(this).data("tab");

  $(".tab-btn")
    .removeClass("text-[#101828]")
    .addClass("text-[#475467]");

  $(".active-underline").addClass("hidden");

  $(this)
    .removeClass("text-[#475467]")
    .addClass("text-[#101828]")
    .find(".active-underline")
    .removeClass("hidden");

  if (tab === "description") {
    $("#descriptionContent").removeClass("hidden");
    $("#specificationContent").addClass("hidden");
  } else {
    $("#descriptionContent").addClass("hidden");
    $("#specificationContent").removeClass("hidden");
  }
});
// ===========LOADER===================
let productLoaderStart = 0;

function showProductLoader() {
  productLoaderStart = Date.now();
  $("#productLoader").removeClass("hidden");
}

function hideProductLoader() {
  const MIN_TIME = 700; // prevents flashing
  const elapsed = Date.now() - productLoaderStart;
  const remaining = MIN_TIME - elapsed;

  if (remaining > 0) {
    setTimeout(() => {
      $("#productLoader").addClass("hidden");
    }, remaining);
  } else {
    $("#productLoader").addClass("hidden");
  }
}
// ==============================
// INIT
// ==============================
$(document).ready(function () {
    

  loadProductDetails();
  updateActionButtons();
  
});