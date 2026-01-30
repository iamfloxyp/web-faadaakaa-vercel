// ===============================
// CART PAGE 
// ===============================
let CURRENT_CART_ITEMS = [];
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
      initPaymentMethods()
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
  
  const section = document.getElementById("deliveryAddressSection");
  const wrapper = document.getElementById("deliveryAddressOptions");

  if (!wrapper || !section) return;

  section.classList.remove("hidden");
  wrapper.innerHTML = "";

  if (!addresses.length) {
    wrapper.innerHTML = `
      <div class="text-[#667085] text-[14px]">
        No delivery address found
      </div>
    `;
    console.warn("No addresses to render");
    return;
  }

  addresses.forEach(addr => {
    const isActive = Number(addr.active) === 1;

    wrapper.insertAdjacentHTML(
      "beforeend",
      `
      <label class="delivery-option w-full sm:w-[343px] flex items-start gap-[16px]
             border rounded-[12px] p-[16px] cursor-pointer
             ${isActive ? "border-[#155EEF]" : "border-[#EAECF0]"}">

        <input
          type="radio"
          name="deliveryOption"
          class="w-[20px] h-[20px]"
          ${isActive ? "checked" : ""}
          data-address-id="${addr.id}"
        />

        <div class="flex flex-col gap-[8px]">
          <p class="text-[#101828] text-[16px] font-medium">${addr.name}</p>
          <p class="text-[#353C49] text-[14px]">${addr.mobile}</p>
          <p class="text-[#535862] text-[14px]">
            ${addr.address}, ${addr.state}
          </p>
        </div>
      </label>
      `
    );
  });
}

// ============== RENDER ADDRESS SELECTION ============
$(document).on("change", 'input[name="deliveryOption"]', function () {
  const addressId = this.dataset.addressId;
  if (!addressId) return;

  const token = sessionStorage.getItem("AUTH_TOKEN");
  if (!token) return;

  const formData = new FormData();
  formData.append("address_id", addressId);
  formData.append("token", token);

  fetch("https://api.faadaakaa.com/api/setdefaultaddress", {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(result => {
      if (!result.status) {
        toast("Failed to update delivery address", "error");
        return;
      }

      toast("Delivery address updated", "success");

      if (typeof window.refreshCartUI === "function") {
        window.refreshCartUI();
      }
    })
    .catch(() => {
      toast("Network error updating address", "error");
    });
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
  const methods = document.querySelectorAll(".payment-method");

  methods.forEach(method => {
    method.addEventListener("click", () => {
      methods.forEach(m => {
        m.classList.remove("bg-[#F2F4F7]");
        m.querySelector(".method-indicator")
          .classList.remove("bg-[#155EEF]", "border-[#155EEF]");
        m.querySelector(".method-indicator")
          .classList.add("border-[#D0D5DD]");
      });

      const indicator = method.querySelector(".method-indicator");
      indicator.classList.remove("border-[#D0D5DD]");
      indicator.classList.add("bg-[#155EEF]", "border-[#155EEF]");

      method.classList.add("bg-[#F2F4F7]");

      SELECTED_PAYMENT_METHOD = method.dataset.method;
    });
  });
}

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
    const name = getCardDisplayName(card); // ✅ Mastercard/Visa/Verve if available
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
          <input type="radio" name="paymentMethod" class="hidden" />
          <span class="method-indicator w-[20px] h-[20px]
                       rounded-full border border-[#D0D5DD]"></span>

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

  // ✅ rebind clicks so the dynamically added cards can be selected
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