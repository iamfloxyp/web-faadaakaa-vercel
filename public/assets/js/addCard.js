const PAYSTACK_API_KEY = "pk_live_39b9ddfbc20e0e3e426df75fa620e6196752bd10";

function getToken() {
  return sessionStorage.getItem("AUTH_TOKEN");
}

// --------------------
// GLOBAL USER STATE (API ONLY)
// --------------------
let API_USER = null;

// ====================== CARD CHARGE MODAL ======================
$(document).off("click", "#addCardBtn").on("click", "#addCardBtn", function () {
  $("#cardChargeModal").removeClass("hidden");
});

$(document).on("click", "#cardChargeCancelBtn", function () {
  $("#cardChargeModal").addClass("hidden");
});

// ====================== PAYSTACK BUTTON ======================
$(document).on("click", "#cardChargeYesBtn", function () {
  $("#cardChargeModal").addClass("hidden");
  paystackAddCardCharge();
});

// ====================== GET EMAIL SAFELY ======================
function getUserEmail(callback) {
  if (API_USER && API_USER.email) {
    callback(API_USER.email);
    return;
  }

  const token = getToken();
  if (!token) {
    callback(null);
    return;
  }

  const fd = new FormData();
  fd.append("token", token);

  $.ajax({
    url: "https://api.faadaakaa.com/api/loadprofile",
    type: "POST",
    data: fd,
    processData: false,
    contentType: false,
    success: function (res) {
      const email =
        res?.data?.email ||
        res?.data?.user?.email ||
        null;

      callback(email);
    },
    error: function () {
      callback(null);
    }
  });
}

// ====================== PAYSTACK HANDLER ======================
function paystackAddCardCharge() {
  const token = getToken();

  if (!token) {
    showErrorToast("Session expired. Please log in again.");
    return;
  }

  getUserEmail(function (email) {
    if (!email) {
      showErrorToast("Session expired. Please log in again.");
      return;
    }

    let handler = PaystackPop.setup({
      key: PAYSTACK_API_KEY,
      email: email,
      amount: 500, // ₦5 in kobo
      currency: "NGN",
      channels: ["card"],

      callback: function (response) {
        confirmAddCard(response.reference);
      }
    });

    handler.openIframe();
  });
}

// ====================== CONFIRM ADD CARD ======================
function confirmAddCard(payref) {
  const token = getToken();

  if (!token) {
    showErrorToast("Session expired. Please log in again.");
    return;
  }

  const formData = new FormData();
  formData.append("token", token);
  formData.append("payref", payref);

  $.ajax({
    url: "https://api.faadaakaa.com/api/addcard_trans_ref",
    type: "POST",
    headers: {
      Authorization: "Bearer " + token
    },
    data: formData,
    processData: false,
    contentType: false,

    success: function (res) {
      if (!res || res.status !== true) {
        showErrorToast(res?.message || "Unable to add card.");
        return;
      }

      $("#cardChargeModal").addClass("hidden");

      showWalletSuccess(
        "Card Added",
        "Your payment card has been added successfully."
      );

      loadWalletCards();
      loadProfileAndRefreshCards();

      if (typeof window.loadCartPaymentCards === "function") {
        window.loadCartPaymentCards();
      }
    },

    error: function (xhr) {
      showErrorToast(
        xhr.responseJSON?.message ||
        "Payment verification failed. Please try again."
      );
    }
  });
}

window.refreshWalletState = function () {
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
      if (!res?.status || !res?.data) return;

      const wallet =
        Number(res?.data?.wallet?.data?.wallet_balance) || 0;

      const formatted = `₦${wallet.toLocaleString()}`;

      // ✅ HEADER
      $("#walletBalance").text(formatted);
      $("#mobileWalletBalance").text(formatted);

      // ✅ WALLET PAGE (if visible)
      $("#walletAvailableBalance").text(formatted);
      $("#walletBalanceText").text(formatted);
    })
    .catch(() => {});
};