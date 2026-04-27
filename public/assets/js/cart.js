// ===============================
// CART PAGE 
// ===============================
let CURRENT_CART_ITEMS = [];
// ================= PAYMENT STATE (GLOBAL) =================
const cartPaymentState = {
  addressId: null,
  selectedMethod: "wallet",   // wallet | bank | card
  selectedCardId: null,
  paymentType: "outright", // outright | installment
  loanAgreementAccepted: false
};

// ================ HELPER: FORMAT MONEY ==================
function formatMoney(amount = 0) {
  return `₦${Number(amount).toLocaleString()}`;
}
// ===============SHOW / HIDE CART LOADER================
function showCartLoader() {
  const loader = document.getElementById("cartLoader");
  if (loader) loader.classList.remove("hidden");
}

function hideCartLoader() {
  const loader = document.getElementById("cartLoader");
  if (loader) loader.classList.add("hidden");
}
// ================ INIT ==================
$(document).ready(function () {
  showCartLoader();
  loadCartPage();
});
function forceClearCartHeaderUI() {
  // Common badge/count elements (desktop)
  const badgeEls = [
    "#cartCount",
    "#cartBadge",
    ".cart-badge",
    "#cartItemCountText"
  ];

  // Common totals (desktop)
  const totalEls = [
    "#cartTotalAmount",
    "#headerCartTotal",
    ".cart-total",
    "#cartSubtotal"
  ];

  // Common mobile header fields
  const mobileCountEls = ["#mobileCartCount"];
  const mobileTotalEls = ["#mobileCartTotal", "#mobileCartSubtotal"];

  badgeEls.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      if (sel === "#cartItemCountText") {
        el.textContent = "(00)";
      } else {
        el.textContent = "0";
      }
      el.classList.add("hidden");
    });
  });

  totalEls.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.textContent = "₦0.00";
    });
  });

  mobileCountEls.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.textContent = "Cart (0)";
    });
  });

  mobileTotalEls.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.textContent = "₦0.00";
    });
  });
}
let CART_PROFILE = null;



function loadCartPage() {
  const token = sessionStorage.getItem("AUTH_TOKEN");

  if (!token) {
    hideCartLoader();
    window.location.href = "/index.html";
    return;
  }

  const formData = new FormData();
  formData.append("token", token);

  fetch("https://api.faadaakaa.com/api/loadprofile", {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(result => {
      if (!result.status) {
        showEmptyCartState();
        return;
      }

      CART_PROFILE = result.data;

      const cartItems = Array.isArray(CART_PROFILE.cart?.data)
        ? CART_PROFILE.cart.data.map(item => {
            const normalizedPeriod =
              Number(item.period) === 1 ? 0 : Number(item.period || 0);

            return {
              ...item,
              period: normalizedPeriod,
              payment_type:
                normalizedPeriod === 0 ? "outright" : "installment"
            };
          })
        : [];
        //  DETERMINE CART PAYMENT TYPE 
const hasInstallment = cartItems.some(
  item => Number(item.period || 0) > 0
);

cartPaymentState.paymentType = hasInstallment
  ? "installment"
  : "outright";

      renderHeaderCartFromProfile({
        ...CART_PROFILE,
        cart: { data: cartItems }
      });

      if (cartItems.length === 0) {
        showEmptyCartState();
        return;
      }

      const addresses = Array.isArray(CART_PROFILE.addresses?.data)
        ? CART_PROFILE.addresses.data
        : [];

      renderCartItems(cartItems);
      renderPaymentSchedule(cartItems);
      renderWalletAndCredit(CART_PROFILE.wallet?.data);
      renderPaymentTerms(cartItems);
      renderPaymentMethodWallet(CART_PROFILE.wallet?.data);
      renderPaymentMethodCards(CART_PROFILE.payment_cards?.data);
      initPaymentMethods();
      setDefaultPaymentMethod();
      renderDeliveryAddresses(addresses);
      loadCartPaymentCards();

      renderOrderAndDueNow(
        cartItems,
        CART_PROFILE.wallet?.data,
        CART_PROFILE.financials?.data?.[0]
      );
    })
    .catch(err => {
      console.error(err);
      toast("Failed to load cart", "error");
    })
    .finally(() => {
      hideCartLoader();   // ✅ ALWAYS HIDE HERE
    });
}
// ===============RENDER CART ITEMS================
function renderCartItems(cartItems) {
  const rowsWrapper = document.getElementById("cartRowsWrapper");

  if (!rowsWrapper) {
    console.error("cartRowsWrapper not found");
    return;
  }

  rowsWrapper.innerHTML = "";

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    rowsWrapper.innerHTML = ``;
    return;
  }

  cartItems.forEach(item => {
    const row = document.createElement("div");

    row.className = `
      cart-row
      w-full border-b border-[#E9EAEB]
      px-[12px] sm:px-[16px]
      py-[14px]
    `;

    row.dataset.cartId = item.id;

    row.innerHTML = `
  <!-- ================= MOBILE LAYOUT ================= -->
  <div class="sm:hidden grid grid-cols-[1fr_70px_90px_90px_40px]
              gap-[8px] items-start">

    <!-- PRODUCT -->
    <div class="flex gap-[8px]">
      <img
        src="https://fdk1.nyc3.digitaloceanspaces.com/fdk_bucket/${item.item_image}"
        class="w-[44px] h-[44px] rounded-md object-cover flex-shrink-0"
      />
      <p class="min-w-0 text-[#535862] text-[13px] leading-[18px] break-words">
        ${item.item_name}
      </p>
    </div>

    <!-- QTY -->
    <div class="flex items-center justify-center gap-[6px]
                bg-[#F9FAFB] border border-[#E9EAEB]
                rounded-lg px-[8px] py-[6px]">

      <button
        class="qty-btn decrement
               w-[28px] h-[28px]
               flex items-center justify-center
               bg-white border border-[#D0D5DD]
               rounded-full
               text-[18px] font-semibold
               text-[#344054]
               shadow-sm
               hover:bg-[#F2F4F7]
               active:scale-95
               transition"
        data-product-id="${item.product_id}">
        −
      </button>

      <span
        class="cart-qty
               min-w-[24px] text-center
               text-[14px] font-semibold
               text-[#101828]"
        data-product-id="${item.product_id}">
        ${item.quantity}
      </span>

      <button
        class="qty-btn increment
               w-[28px] h-[28px]
               flex items-center justify-center
               bg-white border border-[#D0D5DD]
               rounded-full
               text-[18px] font-semibold
               text-[#344054]
               shadow-sm
               hover:bg-[#F2F4F7]
               active:scale-95
               transition"
        data-product-id="${item.product_id}">
        +
      </button>
    </div>

    <!-- UNIT PRICE -->
    <div
      class="text-center text-[13px] text-[#101828] unit-price"
      data-product-id="${item.product_id}"
      data-unit-price="${item.item_price_original}">
      ₦${Number(item.item_price_original).toLocaleString()}
    </div>

    <!-- TOTAL -->
    <div
      class="text-center text-[13px] text-[#101828] line-total"
      data-product-id="${item.product_id}">
      ₦${Number(item.total_item_cost).toLocaleString()}
    </div>

    <!-- DELETE -->
    <button
      class="flex justify-center text-[#667085] remove-cart-item"
      data-id="${item.id}">
      <i class="fa-solid fa-trash"></i>
    </button>
  </div>

  <!-- ================= DESKTOP LAYOUT ================= -->
  <div class="hidden sm:flex items-center gap-[14px]">

    <!-- PRODUCT -->
    <div class="w-[244px] flex items-start gap-[10px]">
      <img
        src="https://fdk1.nyc3.digitaloceanspaces.com/fdk_bucket/${item.item_image}"
        class="w-[44px] h-[44px] rounded-md object-cover flex-shrink-0"
      />
      <p class="text-[#535862] text-[14px] leading-[20px] break-words">
        ${item.item_name}
      </p>
    </div>

    <!-- QTY -->
    <div class="w-[148px]
                flex items-center justify-center gap-[10px]
                bg-[#F9FAFB]
                border border-[#E9EAEB]
                rounded-lg py-[8px]">

      <button
        class="qty-btn decrement
               w-[32px] h-[32px]
               flex items-center justify-center
               bg-white border border-[#D0D5DD]
               rounded-md
               text-[18px] font-semibold
               text-[#344054]
               shadow-sm
               hover:bg-[#F2F4F7]
               active:scale-95
               transition"
        data-product-id="${item.product_id}">
        −
      </button>

      <span
        class="cart-qty
               min-w-[28px] text-center
               text-[14px] font-semibold
               text-[#101828]"
        data-product-id="${item.product_id}">
        ${item.quantity}
      </span>

      <button
        class="qty-btn increment
               w-[32px] h-[32px]
               flex items-center justify-center
               bg-white border border-[#D0D5DD]
               rounded-md
               text-[18px] font-semibold
               text-[#344054]
               shadow-sm
               hover:bg-[#F2F4F7]
               active:scale-95
               transition"
        data-product-id="${item.product_id}">
        +
      </button>
    </div>

    <!-- UNIT PRICE -->
    <div
      class="w-[148px] text-center text-[#535862] unit-price"
      data-product-id="${item.product_id}"
      data-unit-price="${item.item_price_original}">
      ₦${Number(item.item_price_original).toLocaleString()}
    </div>

    <!-- TOTAL -->
    <div
      class="w-[148px] text-center text-[#535862] line-total"
      data-product-id="${item.product_id}">
      ₦${Number(item.total_item_cost).toLocaleString()}
    </div>

    <!-- DELETE -->
    <button
      class="w-[44px] flex justify-center remove-cart-item"
      data-id="${item.id}">
      <i class="fa-solid fa-trash text-[#535862]"></i>
    </button>
  </div>
`;

    rowsWrapper.appendChild(row);
  });
}

// ===============UPDATE CART ITEMS================
function updateCartQuantityFromCart(productId, newQty) {
  const token = sessionStorage.getItem("AUTH_TOKEN");
  if (!token) return Promise.reject();

  const formData = new FormData();
  formData.append("product_id", productId);
  formData.append("quantity", newQty);
  formData.append("token", token);

  return fetch("https://api.faadaakaa.com/api/updatecart", {
    method: "POST",
    body: formData
  }).then(res => res.json());
}

$(document).on("click", ".qty-btn", function (e) {
  const btn = this;

  const productId = btn.dataset.productId;
  if (!productId) return;

  const rowEl = btn.closest(".cart-row");
  if (!rowEl) return;

  const qtyEl = rowEl.querySelector(
    `.cart-qty[data-product-id="${productId}"]`
  );
  if (!qtyEl) return;

  let currentQty = Number(qtyEl.textContent);
  if (isNaN(currentQty)) return;

  const token = sessionStorage.getItem("AUTH_TOKEN");
  if (!token) return;

  let newQty = currentQty;

  // INCREMENT
  if ($(btn).hasClass("increment")) {
    newQty = currentQty + 1;
  }

  // DECREMENT
  if ($(btn).hasClass("decrement")) {
    if (currentQty === 1) {
      const cartItemId = rowEl.dataset.cartId;
      if (!cartItemId) return;

      showCartLoader();

      const fd = new FormData();
      fd.append("id", cartItemId);
      fd.append("token", token);
      fd.append("access_token", token);

      fetch("https://api.faadaakaa.com/api/deletecartitem", {
        method: "POST",
        body: fd
      })
        .then(res => res.json())
        .then(result => {
          if (!result.status) {
            toast(result.message || "Failed to remove item", "error");
            return;
          }

          setTimeout(() => {
            loadCartPage();
            hideCartLoader();
          }, 3000);
        })
        .catch(() => {
          toast("Network error", "error");
          hideCartLoader();
        });

      return;
    }

    newQty = currentQty - 1;
  }

  // UPDATE FLOW
  showCartLoader();

  const fd = new FormData();
  fd.append("product_id", productId);
  fd.append("quantity", newQty);
  fd.append("token", token);

  fetch("https://api.faadaakaa.com/api/updatecart", {
    method: "POST",
    body: fd
  })
    .then(res => res.json())
    .then(result => {
      if (!result.status) {
        toast(result.message || "Failed to update cart", "error");
        return;
      }

      setTimeout(() => {
        loadCartPage();
        hideCartLoader();
      }, 3000);
    })
    .catch(() => {
      toast("Network error", "error");
      hideCartLoader();
    });
});

// =============== REMOVE CART ITEM =================
function removeCartItem(cartItemId) {
  const token = sessionStorage.getItem("AUTH_TOKEN");
  if (!token || !cartItemId) return;

  showCartLoader();

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

      // SINGLE SOURCE OF TRUTH
      return loadCartPage();
    })
    .finally(() => {
      hideCartLoader();
    })
    .catch(() => {
      toast("Network error removing item", "error");
      hideCartLoader();
    });
}

// ==============DELETE ICON HANDLER================
$(document).on("click", ".remove-cart-item", function (e) {
  e.preventDefault();

  const cartItemId = this.dataset.id;
  if (!cartItemId) {
    toast("Cart item id missing", "error");
    return;
  }

  removeCartItem(cartItemId);
});

// ===============SHOW EMPTY CART STATE================
function showEmptyCartState() {
  const cartMain = document.getElementById("cartMain");
  const emptyCartState = document.getElementById("emptyCartState");

  if (cartMain) cartMain.style.display = "none";
  if (emptyCartState) emptyCartState.classList.remove("hidden");

  // Force header to zero immediately
  forceClearCartHeaderUI();
}

// ===============RESET HEADER CART UI================
function renderHeaderCartFromProfile(profile) {
  const cartItems = Array.isArray(profile.cart?.data)
    ? profile.cart.data
    : [];

  if (cartItems.length === 0) {
    forceClearCartHeaderUI();
    return;
  }

  const cartCount = cartItems.length;

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + Number(item.total_item_cost || 0),
    0
  );

  const badgeEls = [
    "#cartCount",
    "#cartBadge",
    ".cart-badge",
    "#cartItemCountText"
  ];

  const totalEls = [
    "#cartTotalAmount",
    "#headerCartTotal",
    ".cart-total",
    "#cartSubtotal"
  ];

  badgeEls.forEach(sel => {
    const el = document.querySelector(sel);
    if (el) {
      el.textContent = cartCount;
      el.classList.toggle("hidden", cartCount === 0);
    }
  });

  totalEls.forEach(sel => {
    const el = document.querySelector(sel);
    if (el) {
      el.textContent = `₦${cartTotal.toLocaleString()}`;
    }
  });
  function renderHeaderCartItems(cartItems) {
  const wrapper =
    document.getElementById("headerCartItemsWrapper") ||
    document.querySelector("#headerCartItemsWrapper");

  if (!wrapper) return;

  wrapper.innerHTML = "";

  cartItems.forEach(item => {
    wrapper.insertAdjacentHTML(
      "beforeend",
      `
      <div class="flex items-center justify-between py-[8px]">
        <div class="flex flex-col">
          <span class="text-[13px] text-[#101828]">${item.item_name}</span>
          <span class="text-[12px] text-[#667085]">Qty: ${item.quantity}</span>
        </div>
        <span class="text-[13px] font-medium">
          ₦${Number(item.total_item_cost).toLocaleString()}
        </span>
      </div>
      `
    );
  });
}
renderHeaderCartItems(cartItems);
}
// ===============HELPER: GET CART ROW COUNT================
function getCartRowCount() {
  return document.querySelectorAll(".cart-row").length;
}



// ==============PAYMENT SCHEDULE TABLE=================================

// ================ HIGHEST INSTALLMENT PERIOD ==================
function getHighestInstallment(cartItems) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) return 0;

  return Math.max(
    ...cartItems.map(item => Number(item.period || 0))
  );
}

// ================ TOTAL CART ITEMS INSTALLMENT ==================

function calculateLoanTotals(cartItems) {
  let totalCartValue = 0;

  cartItems.forEach(item => {
    totalCartValue += Number(item.total_item_cost || 0);
  });

  const firstPayment = totalCartValue * 0.4;
  const remaining = totalCartValue * 0.6;

  return {
    totalCartValue,
    firstPayment,
    remaining
  };
}

// ================ PAYMENT DATE ==================
function addMonthsToDate(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function formatScheduleDate(date, index) {
  if (index === 0) return "Today";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    weekday: "short",
    month: "short",
    year: "numeric"
  });
}

// ================ RENDER PAYMENT SCHEDULE ==================
function renderPaymentSchedule(cartItems) {
  const wrapper = document.getElementById("paymentScheduleSection");
  const table = wrapper?.querySelector(".paymentScheduleTable");

  if (!wrapper || !table) return;

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    wrapper.classList.add("hidden");
    table.innerHTML = "";
    return;
  }

  const installmentItems = cartItems.filter(
    item => Number(item.period || 0) > 0
  );

  // All outright
  if (installmentItems.length === 0) {
    wrapper.classList.add("hidden");
    table.innerHTML = "";
    return;
  }

  const highestPeriod = Math.max(
    ...installmentItems.map(item => Number(item.period))
  );

  // Treat 1 month as outright
  if (highestPeriod <= 1) {
    wrapper.classList.add("hidden");
    table.innerHTML = "";
    return;
  }

  // ✅ USE FULL CART VALUE (same as order page)
  const fullOrderValue = cartItems.reduce(
    (sum, item) => sum + Number(item.total_item_cost || 0),
    0
  );

  const firstPayment = fullOrderValue * 0.4;
  const remaining = fullOrderValue * 0.6;
  const monthlyPayment = remaining / highestPeriod;

  wrapper.classList.remove("hidden");
  table.innerHTML = "";

  table.insertAdjacentHTML(
    "beforeend",
    buildScheduleRow(1, firstPayment, "Today")
  );

  const today = new Date();

  for (let i = 1; i <= highestPeriod; i++) {
    const date = new Date(today);
    date.setMonth(date.getMonth() + i);

    table.insertAdjacentHTML(
      "beforeend",
      buildScheduleRow(
        i + 1,
        monthlyPayment,
        formatScheduleDate(date, i)
      )
    );
  }
}
// ================ BUILD SCHEDULE ROW ==================
function buildScheduleRow(sn, amount, dateLabel) { 
  return `
    <div class="paymentRow w-full border-b border-[#E9EAEB]
                flex items-center
                px-[16px] py-[15px]
                text-[13px]">

      <!-- S/N -->
      <div class="w-1/3 md:w-[171px] text-[#667085]">
        ${sn}
      </div>

      <!-- AMOUNT -->
      <div class="w-1/3 md:w-[269px] font-medium text-[#101828]">
        ₦${Number(amount).toLocaleString()}
      </div>

      <!-- DATE -->
      <div class="w-1/3 md:w-[269px] text-[#667085]">
        ${dateLabel}
      </div>

    </div>
  `;
}


// ==============CART DELIVERY ADDRESS =================================

// ==============RENDER ADDRESS=======================
function renderDeliveryAddresses(addresses = []) {
  const $section = $("#deliveryAddressSection");
  const $wrapper = $("#deliveryAddressOptions");

  if (!$wrapper.length || !$section.length) return;

  $section.removeClass("hidden");
  $wrapper.empty();

  if (!addresses.length) {
    $wrapper.html(`
      <div class="text-[#667085] text-[14px]">
        No delivery address found
      </div>
    `);
    return;
  }

  $.each(addresses, function (_, addr) {
    $wrapper.append(`
      <label
        class="min-w-[320px] sm:w-full
         grid grid-cols-[20px_1fr_1fr_2fr_1fr]
         items-center gap-[12px]
         border border-[#EAECF0] rounded-[12px]
         px-[14px] py-[12px]
         cursor-pointer flex-shrink-0">
        <input
          type="radio"
          name="deliveryOption"
          class="w-[16px] h-[16px]"
          data-address-id="${addr.id}"
        />
        <span class="text-[#101828] font-medium truncate">${addr.name}</span>
        <span class="text-[#353C49] truncate">${addr.mobile}</span>
        <span class="text-[#535862] truncate">${addr.address}</span>
        <span class="text-[#101828] font-medium text-right truncate">${addr.state}</span>
      </label>
    `);
  });

  // ✅ SELECT FIRST ADDRESS ONCE
  const firstRadio = document.querySelector(
    'input[name="deliveryOption"]'
  );

  if (firstRadio) {
    firstRadio.checked = true;
    cartPaymentState.addressId = firstRadio.dataset.addressId;
  }
}

// ============== RENDER ADDRESS SELECTION ============
$(document).on("change", 'input[name="deliveryOption"]', function () {
  const addressId = this.dataset.addressId;
  if (!addressId) return;

  //  THIS IS ALL CHECKOUT NEEDS
  cartPaymentState.addressId = addressId;

  
});


// ============== RENDER ORDER SUMMARY ==================
function renderOrderAndDueNow(cartItems, walletData, financialData) {
  const totalDueEl = document.getElementById("totalDueSummary");
  const orderValueEl = document.getElementById("orderValueAmount");
  const shippingEl = document.getElementById("shippingAmount");

  if (!totalDueEl || !orderValueEl || !shippingEl) return;

  const fullOrderValue = cartItems.reduce(
    (sum, item) => sum + Number(item.total_item_cost || 0),
    0
  );

  const shippingCost = Number.isFinite(Number(financialData?.shipping_cost))
  ? Number(financialData.shipping_cost)
  : 0;

  // 🔑 Check if all items are outright
  const hasInstallment = cartItems.some(
    item => Number(item.period || 0) > 0
  );

  let totalDueNow;
  let orderValueText;

  if (!hasInstallment) {
    // ✅ FULL OUTRIGHT
    totalDueNow = fullOrderValue + shippingCost;
    orderValueText = `100% of ${formatMoney(fullOrderValue)}`;

    totalDueEl.textContent = `${formatMoney(totalDueNow)} (Full payment + shipping)`;
    orderValueEl.textContent = `${formatMoney(fullOrderValue)} (${orderValueText})`;
  } else {
    // ✅ INSTALLMENT LOGIC (unchanged)
    const downPaymentRatio =
      Number(walletData?.downpayment_ratio || 40) / 100;

    const downPaymentAmount = fullOrderValue * downPaymentRatio;
    totalDueNow = downPaymentAmount + shippingCost;

    totalDueEl.textContent = `${formatMoney(totalDueNow)} (${Math.round(
      downPaymentRatio * 100
    )}% of ${formatMoney(fullOrderValue)} + shipping)`;

    orderValueEl.textContent = `${formatMoney(downPaymentAmount)} (${Math.round(
      downPaymentRatio * 100
    )}% of ${formatMoney(fullOrderValue)})`;
  }

  shippingEl.textContent = formatMoney(shippingCost);
}

// ============== RENDER WALLET & CREDIT STATUS ==================
function renderWalletAndCredit(walletData) {
  if (!walletData) return;

  const walletEl = document.getElementById("walletRowAmount");
  const creditBalanceEl = document.getElementById("creditBalanceAmount");
  const creditStatusBadge = document.getElementById("creditStatusBadge");

  // WALLET BALANCE
  if (walletEl) {
    walletEl.textContent = formatMoney(walletData.wallet_balance || 0);
  }

  // CREDIT BALANCE
  if (creditBalanceEl) {
    creditBalanceEl.textContent = formatMoney(
      walletData.credit_balance || 0
    );
  }

  // CREDIT STATUS
  if (creditStatusBadge) {
    const status = String(walletData.credit_status || "").toLowerCase();

    if (status === "active") {
      creditStatusBadge.textContent = "Active";
      creditStatusBadge.classList.remove("bg-[#B42318]");
      creditStatusBadge.classList.add("bg-[#027A48]");
    } else {
      creditStatusBadge.textContent = "Inactive";
      creditStatusBadge.classList.remove("bg-[#027A48]");
      creditStatusBadge.classList.add("bg-[#B42318]");
    }
  }
}

// ================ RENDER PAYMENT TERMS =============
function renderPaymentTerms(cartItems = []) {
  const totalLoanEl = document.getElementById("totalLoanAmount");
  const paymentCycleEl = document.getElementById("paymentCycleText");
  const monthlyPaymentEl = document.getElementById("monthlyPaymentText");

  if (!totalLoanEl || !paymentCycleEl || !monthlyPaymentEl) return;

  if (!cartItems.length) {
    totalLoanEl.textContent = "₦0.00";
    paymentCycleEl.textContent = "No active payment plan";
    monthlyPaymentEl.textContent = "₦0.00";
    return;
  }

  const hasInstallment = cartItems.some(
    item => Number(item.period || 0) > 0
  );

  const totalCartValue = cartItems.reduce(
    (sum, item) => sum + Number(item.total_item_cost || 0),
    0
  );

  // ✅ FULL OUTRIGHT
  if (!hasInstallment) {
    totalLoanEl.textContent = "₦0.00";

    paymentCycleEl.innerHTML = `
      First and only payment
    `;

    monthlyPaymentEl.textContent = formatMoney(totalCartValue);
    return;
  }

  // ✅ INSTALLMENT LOGIC
  const highestPeriod = Math.max(
    ...cartItems.map(item => Number(item.period || 0))
  );

  const loanAmount = totalCartValue * 0.6;
  const monthlyPayment = loanAmount / highestPeriod;

  totalLoanEl.textContent = formatMoney(loanAmount);

  paymentCycleEl.innerHTML = `
    Subsequent payments<br>${highestPeriod} months payment cycle
  `;

  monthlyPaymentEl.textContent = `
    ${formatMoney(monthlyPayment)}/month for ${highestPeriod} months
  `;
}


// ============RENDER PAYMENT METHOD===================
let SELECTED_PAYMENT_METHOD = null;

function initPaymentMethods() {
  document.querySelectorAll(".payment-method").forEach(method => {
    method.addEventListener("click", () => {

      document.querySelectorAll(".payment-method").forEach(m => {
        m.classList.remove("bg-[#F2F4F7]");
        const ind = m.querySelector(".method-indicator");
        if (ind) {
          ind.classList.remove("bg-[#155EEF]", "border-[#155EEF]");
          ind.classList.add("border-[#D0D5DD]");
        }
      });

      method.classList.add("bg-[#F2F4F7]");
      const indicator = method.querySelector(".method-indicator");
      if (indicator) {
        indicator.classList.add("bg-[#155EEF]", "border-[#155EEF]");
      }

      cartPaymentState.selectedMethod = method.dataset.method || null;
      cartPaymentState.selectedCardId =
        method.dataset.payment_card_id || null;
    });
  });
}

function setDefaultPaymentMethod() {
  const walletMethod = document.querySelector(
    '.payment-method[data-method="wallet"]'
  );

  if (!walletMethod) return;

  // 1. Check the radio input
  const radio = walletMethod.querySelector('input[type="radio"]');
  if (radio) {
    radio.checked = true;
  }

  // 2. Set JS state
  cartPaymentState.selectedMethod = "wallet";
  cartPaymentState.selectedCardId = null;
}

// ================= DELIVERY ADDRESS SELECTION (MUST HAVE) =================

// ============== ADDRESS SELECTION (CORRECT & FINAL) ============
function refreshShippingForAddress(addressId) {
  const token = sessionStorage.getItem("AUTH_TOKEN");
  if (!token || !addressId) return;

  showCartLoader();

  const fd = new FormData();
  fd.append("token", token);
  fd.append("address_id", addressId);

  fetch("https://api.faadaakaa.com/api/update-primary-address", {
    method: "POST",
    body: fd
  })
    .then(res => res.json())
    .then(res => {
      if (!res.status) {
        toast("Unable to update shipping cost", "error");
        return;
      }

      const shippingCost = Number(res.data.shipping_cost || 0);

      // update only what matters
      CART_PROFILE.financials = CART_PROFILE.financials || {};
      CART_PROFILE.financials.data = [{
        shipping_cost: shippingCost
      }];

      renderOrderAndDueNow(
        CURRENT_CART_ITEMS,
        CART_PROFILE.wallet?.data,
        { shipping_cost: shippingCost }
      );
    })
    .finally(() => {
      hideCartLoader();
    });
}
$(document).on("change", 'input[name="deliveryOption"]', function () {
  const addressId = this.dataset.addressId;
  if (!addressId) return;

  cartPaymentState.addressId = addressId;

  refreshShippingForAddress(addressId);
});
$(document).on("click", ".address-row", function () {
  const addressId = $(this).data("address_id");

  if (!addressId) return;

  // visually mark selected
  $(".address-row").removeClass("bg-[#F2F4F7]");
  $(this).addClass("bg-[#F2F4F7]");

  // radio UI
  $(".address-row input[type='radio']").prop("checked", false);
  $(this).find("input[type='radio']").prop("checked", true);

  // 🔑 THIS IS THE IMPORTANT PART
  cartPaymentState.addressId = addressId;

  console.log("Selected address:", addressId);
});

function setDefaultAddressUIAndState() {
  const $first = $('input[name="deliveryAddress"]').first();
  if (!$first.length) return;

  // only set default if none is selected already
  const $checked = $('input[name="deliveryAddress"]:checked');
  if ($checked.length) {
    cartPaymentState.addressId = String($checked.data("address-id") || $checked.val());
    return;
  }

  $first.prop("checked", true).trigger("change");
}

setDefaultAddressUIAndState()
function renderPaymentMethodWallet(walletData) {
  const el = document.getElementById("walletMethodAmount");
  if (!el || !walletData) return;

  el.textContent = formatMoney(walletData.wallet_balance || 0);
}
// ================================================================
// PAYMENT METHOD: RENDER SAVED CARDS
// ============================================================
window.loadCartPaymentCards = function () {
  const token = sessionStorage.getItem("AUTH_TOKEN");
  if (!token) return;

  const fd = new FormData();
  fd.append("token", token);

  fetch("https://api.faadaakaa.com/api/loadprofile", {
    method: "POST",
    body: fd
  })
    .then(res => res.json())
    .then(res => {
      const cards = res?.data?.payment_cards?.data || [];
      renderPaymentMethodCards(cards);
    })
    .catch(err => console.error("Load cart cards error:", err));
};

function getCardDisplayName(card = {}) {
  // Try the most common API keys first
  return (
    card.card_type ||
    card.brand ||
    card.scheme ||
    card.card_brand ||
    card.card_network ||
    card.type ||
    card.bank ||
    "Card"
  );
}

function renderPaymentMethodCards(cards = []) {
  const container = document.getElementById("cardPaymentMethods");
  if (!container) return;

  container.innerHTML = "";

  if (!Array.isArray(cards) || cards.length === 0) {
    container.innerHTML = `
      <div class="w-full h-[48px] flex items-center px-[24px]
                  text-[#667085] text-[13px]">
        No saved cards
      </div>
    `;
    return;
  }

  cards.forEach(card => {
    const name = getCardDisplayName(card); 
    const first6 = card.bin || "";
    const last4 = card.last4 || card.last_4 || "0000";
    const paymentCardId = card.id || card.payment_card_id || card.card_id || "";

    const cardHtml = `
  <div
    class="payment-method w-full h-[48px] flex items-center justify-between
           px-[24px] border-b border-[#D0D5DD] cursor-pointer"
    data-method="card"
    data-payment_card_id="${paymentCardId}">

    <div class="flex items-center gap-[12px]">
      <input
        type="radio"
        name="paymentMethod"
        class="w-[16px] h-[16px] accent-[#155EEF] cursor-pointer"
      />

      <p class="text-[#535862] text-[14px] leading-[22px]">
        ${name}
      </p>
    </div>

    <span class="text-[#344054] text-[14px] font-medium">
      ${first6}••••${last4}
    </span>
  </div>
`;

    container.insertAdjacentHTML("beforeend", cardHtml);
  });

  //  rebind clicks so the dynamically added cards can be selected
  initPaymentMethods();
}
// =======ADD NEW CARD IN CART PAGE=====
$(document).on("click", "#addNewCardBtn", function () {
  if (typeof window.openAddNewCardFlow === "function") {
    window.openAddNewCardFlow();
    return;
  }
  // Open the same Add Card modal used everywhere
if ($("#cardChargeModal").length) {
  $("#cardChargeModal").removeClass("hidden");
} else {
  console.error("Card charge modal not found");
}
});
// Fallback if account toast is not loaded
if (typeof window.showErrorToast !== "function") {
  window.showErrorToast = function (msg) {
    alert(msg);
  };
}

// ===LINK=======
$(document).on("click", "#termsLink", function (e) {
  e.stopPropagation(); 
});


// ================= CHECKOUT VALIDATION + FLOW =================

// ================= INLINE ERROR HELPERS =================
function showCheckoutInlineError(message) {
  const wrapper = document.getElementById("checkoutInlineError");
  if (!wrapper) return;

  const textEl = wrapper.querySelector("p");
  if (!textEl) return;

  textEl.textContent = message;
  wrapper.classList.remove("hidden");

  setTimeout(() => {
    wrapper.classList.add("hidden");
    textEl.textContent = "";
  }, 15000);
}

function clearCheckoutInlineError() {
  const el = document.getElementById("checkoutInlineError");
  if (!el) return;

  el.classList.add("hidden");
  el.textContent = "";
}

function showProcessingOverlay(message) {
  const loader = document.getElementById("cartLoader");
  if (!loader) return;

  const textEl = loader.querySelector("p");
  if (textEl) textEl.textContent = message || "Processing, please wait...";

  loader.classList.remove("hidden");
}

function hideProcessingOverlay() {
  const loader = document.getElementById("cartLoader");
  if (!loader) return;

  const textEl = loader.querySelector("p");
  if (textEl) textEl.textContent = "";

  loader.classList.add("hidden");
}

function setReconfirmButtonsDisabled(disabled) {
  $("#reconfirmOrderYesBtn").prop("disabled", disabled);
  $("#reconfirmOrderNoBtn").prop("disabled", disabled);

  if (disabled) {
    $("#reconfirmOrderYesBtn").addClass("opacity-60 cursor-not-allowed");
    $("#reconfirmOrderNoBtn").addClass("opacity-60 cursor-not-allowed");
  } else {
    $("#reconfirmOrderYesBtn").removeClass("opacity-60 cursor-not-allowed");
    $("#reconfirmOrderNoBtn").removeClass("opacity-60 cursor-not-allowed");
  }
}

// ================= MODAL HELPERS =================
function openModal($modal) {
  $modal.removeClass("hidden").addClass("flex");
}

function closeModal($modal) {
  $modal.addClass("hidden").removeClass("flex");
}

// ================= EMAIL VERIFICATION CHECK =================
function handleCheckout(profileData) {
  const emailVerified = Number(profileData.email_verified);

  // Email NOT verified
  if (emailVerified !== 1) {
    showEmailNotVerifiedModal();
    return false;
  }

  return true
}

// ================= MODAL HANDLERS =================
function isEmailVerified(profileData) {
  if (!profileData) return false;

  if (profileData.email_verified !== undefined) {
    return Number(profileData.email_verified) === 1;
  }

  return false;
}

function showEmailNotVerifiedModal() {
  const modal = $("#emailNotVerifiedModal");
  if (!modal.length) {
    showErrorModal(
      "Your email is not verified. Please add an email in your account settings.",
      "Email Not Verified",
      false
    );
    return;
  }
  modal.removeClass("hidden").addClass("flex");
}


function openAddressModal() {
  $("#addressRequiredModal").removeClass("hidden").addClass("flex");
}

function closeAddressModal() {
  $("#addressRequiredModal").addClass("hidden").removeClass("flex");
}

function openEmailModal() {
  $("#emailNotVerifiedModal").removeClass("hidden").addClass("flex");
}

function closeEmailModal() {
  $("#emailNotVerifiedModal").addClass("hidden").removeClass("flex");
}


 // Address modal buttons
$(document).on("click", "#addAddressBtn", function () {
  window.location.href = "/addresses";
});

$(document).on("click", "#cancelAddressModalBtn", function () {
  closeAddressModal();
});

// Email modal buttons
$(document).on("click", "#addEmailBtn", function () {
  window.location.href = "/dashboard?tab=email";
});

$(document).on("click", "#cancelEmailModalBtn", function () {
  closeEmailModal();
});

const $acceptLoanAgreementModal = $("#acceptLoanAgreementModal");
const $reconfirmOrderModal = $("#reconfirmOrderModal");


// ================= CONFIRM & CHECKOUT BUTTON =================
$(document).on("click", "#confirmCheckoutBtn", function (e) {
  e.preventDefault();

  clearCheckoutInlineError();

  //  DELIVERY ADDRESS CHECK FIRST
  if (!cartPaymentState.addressId) {
    openAddressModal();
    return;
  }

  //  EMAIL VERIFICATION CHECK
  if (!isEmailVerified(CART_PROFILE)) {
    openEmailModal();
    return;
  }

  //  PAYMENT METHOD CHECK
  if (!cartPaymentState.selectedMethod) {
    showCheckoutInlineError(
      "Payment method not selected. Please choose how you want to pay."
    );
    return;
  }

  //  INSTALLMENT AGREEMENT CHECK
  if (
    cartPaymentState.paymentType === "installment" &&
    cartPaymentState.loanAgreementAccepted !== true
  ) {
    openModal($("#acceptLoanAgreementModal"));
    return;
  }

  //  ALL GOOD
  openModal($("#reconfirmOrderModal"));
})

// ================= ACCEPT LOAN AGREEMENT MODAL =================
$(document).on("change", "#agreeCheckbox", function () {
  cartPaymentState.loanAgreementAccepted = this.checked;
});


$(document).on("click", "#acceptLoanAgreementOkBtn", function () {
  closeModal($("#acceptLoanAgreementModal"));
});


function resetLoanAgreement() {
  cartPaymentState.loanAgreementAccepted = false;
  $("#agreeCheckbox").prop("checked", false);
}

function showErrorModal(message, title = "Error", redirectToCart = true) {
  $("#cartErrorTitle").text(title);
  $("#cartErrorMessage").text(message);

  $("#cartErrorModal").removeClass("hidden").addClass("flex");

  $("#cartErrorOkBtn").off("click").on("click", function () {
    $("#cartErrorModal").addClass("hidden").removeClass("flex");

    if (redirectToCart) {
      window.location.href = "/cart.html";
    }
  });
}
// ================= RECONFIRM MODAL NO =================
$(document).on("click", "#reconfirmOrderNoBtn", function () {
  closeModal($reconfirmOrderModal);
});

function toReadableMessage(maybeMsg) {
  if (!maybeMsg) return "Something went wrong.";
  if (typeof maybeMsg === "string") return maybeMsg;

  if (typeof maybeMsg === "object") {
    return (
      maybeMsg.message ||
      maybeMsg.error ||
      maybeMsg.msg ||
      JSON.stringify(maybeMsg)
    );
  }
  return String(maybeMsg);
}

const BASE_URL = "https://api.faadaakaa.com/api";

function createOrderAjax(payload, onSuccess, onError) {
  const token = sessionStorage.getItem("AUTH_TOKEN");
  if (!token) {
    onError?.("Session expired.");
    return;
  }

  const fd = new FormData();
  fd.append("token", token);

  Object.keys(payload).forEach(key => {
    if (payload[key] !== undefined && payload[key] !== null) {
      fd.append(key, payload[key]);
    }
  });

  $.ajax({
    url: `${BASE_URL}/createorder`,
    type: "POST",
    data: fd,
    processData: false,
    contentType: false,

    success: function (res) {
      if (!res || res.status !== true) {
        onError?.(toReadableMessage(res?.message || "Order failed."));
        return;
      }
      onSuccess?.(res);
    },

    error: function (xhr) {
      const msg =
        xhr.responseJSON?.message ||
        xhr.responseJSON?.error ||
        xhr.responseText ||
        "Bad request. Please check order payload.";

      onError?.(toReadableMessage(msg));
    }
  });
}


function getTotalDueNowFromUI() {
  const el = document.getElementById("totalDueSummary");
  if (!el) return 0;

  const text = (el.textContent || "").trim();

  
  const m = text.match(/₦\s*([\d,]+(?:\.\d{1,2})?)/);

  if (!m || !m[1]) return 0;

  const num = Number(m[1].replace(/,/g, ""));
  return Number.isFinite(num) ? num : 0;
} 

function toPaystackAmount(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return null;

  return Math.round(num * 100);
}

function startPaystackBankTransfer(amount, onSuccessRef, onClose) {
  const email = CART_PROFILE?.email || CART_PROFILE?.user?.email;


  const showErr = (msg) => {
    if (typeof window.showErrorModal === "function") {
      window.showErrorModal(msg, "Payment Unsuccessful");
    } else {
      alert(msg);
    }
  };

  if (!email) {
    showErr("User email not found.");
    if (typeof onClose === "function") onClose();
    return;
  }

  const paystackAmount = toPaystackAmount(amount);

  if (!paystackAmount) {
    showErr("Invalid payment amount.");
    if (typeof onClose === "function") onClose();
    return;
  }

  const handler = PaystackPop.setup({
    key: PAYSTACK_API_KEY,
    email: email,
    amount: paystackAmount,
    currency: "NGN",
    channels: ["bank_transfer"],
    callback: function (response) {
      if (typeof onSuccessRef === "function") onSuccessRef(response.reference);
    },
    onClose: function () {
      if (typeof onClose === "function") onClose();
    }
  });

  handler.openIframe();
}




function fetchWalletBalance(done) {
  const token = sessionStorage.getItem("AUTH_TOKEN");
  if (!token) return done(0);

  const fd = new FormData();
  fd.append("token", token);

  $.ajax({
    url: `${BASE_URL}/loadprofile`,
    type: "POST",
    data: fd,
    processData: false,
    contentType: false,
    success: function (res) {
      const balance = Number(
        res?.data?.wallet?.data?.wallet_balance ??
        res?.data?.wallet_balance ??
        0
      );
      done(Number.isFinite(balance) ? balance : 0);
    },
    error: function () {
      done(0);
    }
  });
}

function confirmWalletFundingByTransferRef(payref, onDone, onFail) {
  const token = sessionStorage.getItem("AUTH_TOKEN");
  if (!token) {
    if (typeof onFail === "function") onFail("Session expired.");
    return;
  }

  fetchWalletBalance(function (oldBalance) {
    const fd = new FormData();
    fd.append("token", token);
    fd.append("payref", payref);

    $.ajax({
      url: `${BASE_URL}/addfundbytransfer_trans_ref`,
      type: "POST",
      data: fd,
      processData: false,
      contentType: false,
      success: function (res) {
        if (!res || res.status !== true) {
          if (typeof onFail === "function") onFail(res?.message || "Wallet funding failed.");
          return;
        }

        pollUntilWalletUpdated(oldBalance, onDone, onFail);
      },
      error: function () {
        if (typeof onFail === "function") onFail("Unable to confirm payment.");
      }
    });
  });
}

function pollUntilWalletUpdated(oldBalance, onDone, onFail) {
  let tries = 0;
  const maxTries = 20;

  const timer = setInterval(() => {
    tries++;

    fetchWalletBalance(function (newBalance) {
      if (Number(newBalance) !== Number(oldBalance)) {
        clearInterval(timer);
        if (typeof onDone === "function") onDone(newBalance);
        return;
      }

      if (tries >= maxTries) {
        clearInterval(timer);
        if (typeof onFail === "function") onFail("Wallet update delayed. Please try again.");
      }
    });
  }, 1000);
}


function showOrderSuccessAndRedirect(orderId) {
  $("#orderSuccessModal").removeClass("hidden").addClass("flex");

  if(typeof window.refreshWalletState === "function"){
    window.refreshWalletState();
  }

  setTimeout(() => {
    $("#orderSuccessModal").addClass("hidden").removeClass("flex");

    if (orderId) {
      window.location.href = `/myorders/${orderId}`;
    } else {
      window.location.href = `/myorders`;
    }
  }, 5000);
}

function extractOrderId(res) {
  return (
    res?.data?.order_id ||
    res?.data?.orderId ||
    res?.order_id ||
    res?.orderId ||
    null
  );
}
function stripHtml(html) {
  return String(html || "").replace(/<[^>]*>?/gm, "");
}

function cleanBackendMessage(msg) {
  return stripHtml(toReadableMessage(msg))
    .replace(/\s+/g, " ")
    .trim();
}
function showFeedbackModal({
  title = "Notice",
  message = "",
  buttonText = "OK",
  onClick = null,
  type = "error" // error | success | info
}) {
  const $modal = $("#feedbackModal");
  const $icon = $("#feedbackIcon");
  const $title = $("#feedbackTitle");
  const $message = $("#feedbackMessage");
  const $btn = $("#feedbackBtn");

  if (!$modal.length) {
    alert(message);
    return;
  }

  // Reset
  $icon.removeClass().addClass("mx-auto mb-[12px] flex h-[48px] w-[48px] items-center justify-center rounded-full");

  if (type === "success") {
    $icon.addClass("bg-green-100 text-green-600").html("✓");
    $btn.css("background", "#16A34A");
  } else {
    $icon.addClass("bg-red-100 text-red-600").html("!");
    $btn.css("background", "#DC2626");
  }

  $title.text(title);
  $message.text(message);
  $btn
  .text(buttonText)
  .css({
    background: type === "success" ? "#16A34A" : "#DC2626",
    padding: "10px 24px",
    borderRadius: "8px",
    minWidth: "120px",
    margin: "0 auto",
    display: "block"
  });

  $btn.off("click").on("click", function () {
    $modal.addClass("hidden").removeClass("flex");
    if (typeof onClick === "function") onClick();
  });

  $modal.removeClass("hidden").addClass("flex");
}

// ======================
// RE-CONFIRM ORDER (YES)
// ======================
$(document).on("click", "#reconfirmOrderYesBtn", function () {
  closeModal($("#reconfirmOrderModal"));
  setReconfirmButtonsDisabled(true);

  const token = sessionStorage.getItem("AUTH_TOKEN");
  if (!token) {
    setReconfirmButtonsDisabled(false);
    showFeedbackModal({
      title: "Session Expired",
      message: "Your session has expired. Please log in again.",
      buttonText: "OK"
    });
    return;
  }

  const addressId = cartPaymentState.addressId;
  const method = cartPaymentState.selectedMethod; // wallet | bank | card
  const cardId = cartPaymentState.selectedCardId;

  if (!addressId) {
    setReconfirmButtonsDisabled(false);
    showFeedbackModal({
      title: "Delivery Address Required",
      message: "Please select a delivery address before checking out.",
      buttonText: "OK"
    });
    return;
  }

  const amountDue = getTotalDueNowFromUI();

  // ======================
  // WALLET PAYMENT
  // ======================
  if (method === "wallet") {
    showProcessingOverlay("Placing order, please wait...");

    createOrderAjax(
      {
        address_id: addressId,
        payment_method: "wallet_balance"
      },
      function (res) {
        hideProcessingOverlay();
        setReconfirmButtonsDisabled(false);
        showOrderSuccessAndRedirect(extractOrderId(res));
      },
      function (msg) {
        hideProcessingOverlay();
        setReconfirmButtonsDisabled(false);

        showFeedbackModal({
          title: "Payment Failed",
          message: cleanBackendMessage(msg),
          buttonText: "OK"
        });
      }
    );

    return;
  }

  // ======================
  // BANK TRANSFER
  // ======================
  if (method === "bank") {
    startPaystackBankTransfer(
      amountDue,
      function (payref) {
        showProcessingOverlay("Confirming payment, please wait...");

        confirmWalletFundingByTransferRef(
          payref,
          function () {
            showProcessingOverlay("Placing order, please wait...");

            createOrderAjax(
              {
                address_id: addressId,
                payment_method: "wallet_balance"
              },
              function (res) {
                hideProcessingOverlay();
                setReconfirmButtonsDisabled(false);
                showOrderSuccessAndRedirect(extractOrderId(res));
              },
              function (msg) {
                hideProcessingOverlay();
                setReconfirmButtonsDisabled(false);

                showFeedbackModal({
                  title: "Order Failed",
                  message:cleanBackendMessage(msg),
                  buttonText: "OK"
                });
              }
            );
          },
          function (msg) {
            hideProcessingOverlay();
            setReconfirmButtonsDisabled(false);

            showFeedbackModal({
              title: "Payment Confirmation Failed",
              message: cleanBackendMessage(msg),
              buttonText: "OK"
            });
          }
        );
      },
      function () {
        setReconfirmButtonsDisabled(false);
      }
    );

    return;
  }

  // ======================
  // CARD PAYMENT
  // ======================
  if (method === "card") {
    if (!cardId) {
      setReconfirmButtonsDisabled(false);
      showCheckoutInlineError("Please select a saved card.");
      return;
    }

    if (!amountDue || amountDue <= 0) {
      setReconfirmButtonsDisabled(false);
      showFeedbackModal({
        title: "Invalid Amount",
        message: "Invalid payment amount.",
        buttonText: "OK"
      });
      return;
    }

    showProcessingOverlay("Charging card, please wait...");

    const fundFd = new FormData();
    fundFd.append("token", token);
    fundFd.append("amount", amountDue);
    fundFd.append("payment_method_id", cardId);

    $.ajax({
      url: `${BASE_URL}/addfundby_exsting_card`,
      type: "POST",
      headers: {
        Authorization: "Bearer " + token
      },
      data: fundFd,
      processData: false,
      contentType: false,

      success: function (fundRes) {
        if (!fundRes || fundRes.status !== true) {
          hideProcessingOverlay();
          setReconfirmButtonsDisabled(false);

          showFeedbackModal({
            title: "Wallet Funding Failed",
            message: cleanBackendMessage(fundRes?.message),
            buttonText: "OK"
          });
          return;
        }

        showProcessingOverlay("Placing order, please wait...");

        createOrderAjax(
          {
            address_id: addressId,
            payment_method: "paymentcard_id"
          },
          function (res) {
            hideProcessingOverlay();
            setReconfirmButtonsDisabled(false);
            showOrderSuccessAndRedirect(extractOrderId(res));
          },
          function (msg) {
            hideProcessingOverlay();
            setReconfirmButtonsDisabled(false);

            showFeedbackModal({
              title: "Order Failed",
              message: cleanBackendMessage(msg),
              buttonText: "OK"
            });
          }
        );
      },

      error: function (xhr) {
        hideProcessingOverlay();
        setReconfirmButtonsDisabled(false);

        const backendMsg =
          xhr.responseJSON?.message ||
          xhr.responseJSON?.error ||
          xhr.responseText ||
          "Payment was not successful.";

        showFeedbackModal({
          title: "Payment Unsuccessful",
          message: cleanBackendMessage(backendMsg),
          buttonText: "OK"
        });
      }
    });

    return;
  }

  setReconfirmButtonsDisabled(false);
  showCheckoutInlineError("Please select a payment method.");
});