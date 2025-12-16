// ======================================================
// CART.JS FINAL VERSION WITH SUCCESS POPUP + REDIRECT
// ======================================================

// Example product
const cartItem = {
  name: "Apple iPhone 16 - 8GB/128GB - 5G",
  qty: 1,
  unitPrice: 1557700,
  total: 1557700
};

// Wallet helpers
function getWallet() {
  return Number(localStorage.getItem("walletBalance")) || 3000000;
}
function updateWallet(newAmount) {
  localStorage.setItem("walletBalance", newAmount);
}

// Orders helpers
function getOrders() {
  return JSON.parse(localStorage.getItem("orders")) || [];
}
function saveOrder(orderObj) {
  const orders = getOrders();
  orders.push(orderObj);
  localStorage.setItem("orders", JSON.stringify(orders));
}

// Delivery text
function getDefaultDeliveryText() {
  try {
    const user = JSON.parse(localStorage.getItem("faadaakaaUser"));
    const addresses = user?.addresses || [];
    const active = addresses.find(a => a.isDefault) || addresses[0];
    if (!active) return "Default Delivery Address";
    return `${active.fullName}, ${active.phone}, ${active.address}, ${active.state}`;
  } catch (err) {
    return "Default Delivery Address";
  }
}

// ======================================================
// POPUP 1: CONFIRMATION POPUP
// ======================================================
function showConfirmPopup() {
  return new Promise((resolve) => {
    const confirmBox = document.createElement("div");
    confirmBox.id = "confirmPopup";

    confirmBox.innerHTML = `
      <div style="
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.5);
        display:flex; align-items:center; justify-content:center;
        z-index:9999;
      ">
        <div style="
          background:white; padding:24px; width:340px;
          border-radius:10px; text-align:center;
        ">
          <h2 style="font-size:18px; margin-bottom:10px;">Re-Confirm Order</h2>
          <p style="font-size:14px; margin-bottom:20px; line-height:20px;">
            You are about to make this order.<br>
            Your wallet balance may be used.<br>
            Do you wish to continue
          </p>
          <button id="yesBtn" style="
            background:#1570EF; color:white;
            padding:8px 20px; border-radius:6px; margin-right:10px;
          ">Yes</button>

          <button id="noBtn" style="
            background:#B42318; color:white;
            padding:8px 20px; border-radius:6px;
          ">No</button>
        </div>
      </div>
    `;

    document.body.appendChild(confirmBox);

    document.getElementById("yesBtn").onclick = () => {
      confirmBox.remove();
      resolve(true);
    };
    document.getElementById("noBtn").onclick = () => {
      confirmBox.remove();
      resolve(false);
    };
  });
}

// ======================================================
// POPUP 2: LOADING SPINNER
// ======================================================
function showLoadingPopup() {
  const wrap = document.createElement("div");
  wrap.id = "loadingPopup";
  wrap.innerHTML = `
    <div style="
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.5);
      display:flex; align-items:center; justify-content:center;
      z-index:9999;
    ">
      <div style="
        background:white; padding:30px 40px;
        border-radius:10px; text-align:center;
      ">
        <div class="spinner" style="
          width:40px; height:40px;
          border:4px solid #ddd;
          border-top-color:#1570EF;
          border-radius:50%;
          margin:auto;
          animation:spin 1s linear infinite;
        "></div>
        <p style="margin-top:12px; font-size:14px;">Processing order...</p>
      </div>
    </div>
  `;
  document.body.appendChild(wrap);
}

// Spinner animation
const style = document.createElement("style");
style.innerHTML = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// ======================================================
// POPUP 3: ORDER SUCCESS POPUP
// ======================================================
function showSuccessPopup() {
  return new Promise((resolve) => {
    const wrap = document.createElement("div");
    wrap.id = "successPopup";

    wrap.innerHTML = `
      <div style="
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.5);
        display:flex; align-items:center; justify-content:center;
        z-index:9999;
      ">
        <div style="
          background:white; width:320px; padding:24px;
          border-radius:10px; text-align:center;
        ">
          <div style="
            width:48px; height:48px;
            background:#12B76A20;
            border-radius:50%;
            display:flex; align-items:center; justify-content:center;
            margin:auto;
          ">
            <i class="fa-solid fa-check" style="color:#12B76A; font-size:24px;"></i>
          </div>

          <h3 style="margin-top:14px; font-size:18px;">Order successfully placed</h3>

          <button id="successOkBtn" style="
            margin-top:16px;
            background:#1570EF; color:white;
            padding:8px 24px; border-radius:6px;
          ">OK</button>
        </div>
      </div>
    `;

    document.body.appendChild(wrap);

    document.getElementById("successOkBtn").onclick = () => {
      wrap.remove();
      resolve(true);
    };
  });
}

// ======================================================
// MAIN CHECKOUT HANDLER
// ======================================================
document.getElementById("confirmCheckoutBtn")?.addEventListener("click", async () => {
  const agreed = document.getElementById("agreeCheckbox").checked;
  if (!agreed) {
    alert("You must agree to the Credits & Loans Agreement.");
    return;
  }

  const proceed = await showConfirmPopup();
  if (!proceed) return;

  showLoadingPopup();

  setTimeout(() => {
    document.getElementById("loadingPopup")?.remove();
  }, 2000);

  const orders = getOrders();
  const isFirstOrder = orders.length === 0;

  let paymentMethod;
  let paymentType;
  let walletUsed = 0;
  let outstandingAmount = 0;
  let repayments = [];

  let wallet = getWallet();

  // FIRST ORDER = OUTRIGHT
  if (isFirstOrder) {
    paymentMethod = "Wallet";
    paymentType = "Outright";
    walletUsed = cartItem.total;
    outstandingAmount = 0;
    updateWallet(wallet - cartItem.total);
  }

  // SECOND ORDER AND ABOVE = INSTALLMENT
  else {
    paymentMethod = "Installment";
    paymentType = "Installment";

    const total = cartItem.total;
    const firstDeposit = 200000;
    walletUsed = firstDeposit;
    outstandingAmount = total - firstDeposit;

    const perMonth = Number((outstandingAmount / 3).toFixed(2));

    repayments = [
      { sn: 1, amount: firstDeposit, dueDate: new Date().toDateString(), paidOn: new Date().toDateString(), status: "Paid" },
      { sn: 2, amount: perMonth, dueDate: "20 Dec 2025", paidOn: null, status: "Unpaid" },
      { sn: 3, amount: perMonth, dueDate: "20 Jan 2026", paidOn: null, status: "Unpaid" },
      { sn: 4, amount: perMonth, dueDate: "20 Feb 2026", paidOn: null, status: "Unpaid" },
    ];
  }

  // BUILD ORDER OBJECT
  const orderObj = {
    orderNumber: Math.floor(1000 + Math.random() * 9000),
    date: new Date().toLocaleString(),
    item: cartItem,
    paymentMethod,
    paymentType,
    walletUsed,
    outstandingAmount,
    repayments,
    delivery: getDefaultDeliveryText()
  };

  saveOrder(orderObj);

  showSuccessPopup(); // we show popup
setTimeout(() => {
  window.location.href = `account.html?fromCart=1&order=${orderObj.orderNumber}`;
}, 1500);
});