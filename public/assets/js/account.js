 // =====================================================
// FAADAAKAA ACCOUNT PAGE MASTER SCRIPT (API SOURCE ONLY)
// No localStorage
// =====================================================
// const PAYSTACK_API_KEY = "pk_live_39b9ddfbc20e0e3e426df75fa620e6196752bd10";
// --------------------
// AUTH
// --------------------
function getToken() {
  return sessionStorage.getItem("AUTH_TOKEN");
}

function forceLogout() {
  sessionStorage.removeItem("AUTH_TOKEN");
}
function showErrorToast(message) {
  const $toast = $("#toast");

  $toast
    .removeClass("hidden toast-success")
    .addClass("toast-error")
    .text(message);

  setTimeout(() => {
    $toast.addClass("hidden");
  }, 3000);
}

function showGreenToast(message) {
  const $toast = $("#toast");

  $toast
    .removeClass("hidden toast-error")
    .addClass("toast-success")
    .text(message);

  setTimeout(() => {
    $toast.addClass("hidden");
  }, 3000);
}

// =========LOGOUT TAB=====
$(document).on("click", "#tab-logout, .logoutBTN, .logoutBtn", function (e) {
  e.preventDefault();
  e.stopPropagation();

  // Clear auth
  sessionStorage.clear();
  localStorage.clear();

  // Hard redirect to homepage
  window.location.href = "/index.html";
});
// --------------------
// GLOBAL USER STATE (API ONLY)
// --------------------
// let API_USER = null;

// --------------------
// FORMAT HELPERS
// --------------------
function toNumber(val) {
  if (val === null || val === undefined) return 0;

  // handles "1,108.37", "118840.42", 118840.42, etc
  const s = String(val).replace(/,/g, "").trim();
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function formatNaira(amount) {
  return "₦" + Number(amount || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// --------------------
// SAFE SETTERS
// --------------------
function setText(selector, text) {
  const el = document.querySelector(selector);
  if (el) el.textContent = text;
}

function setJqText(selector, text) {
  const $el = $(selector);
  if ($el.length) $el.text(text);
}

function show(selector) {
  const $el = $(selector);
  if ($el.length) $el.removeClass("hidden");
}

function hide(selector) {
  const $el = $(selector);
  if ($el.length) $el.addClass("hidden");
}

// ===============================
// PASSWORD POPULATE + TOGGLES (COMBINED)
// ===============================
function populateCurrentPasswordField() {
  
}

function togglePassword(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (!input || !icon) return;

  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}
// ======================BUTTON SPINNER================
function startButtonLoading($btn) {
  $btn.prop("disabled", true);
  $btn.find(".btn-spinner").removeClass("hidden");
}

function stopButtonLoading($btn) {
  $btn.prop("disabled", false);
  $btn.find(".btn-spinner").addClass("hidden");
}

// ======================ACCOUNT PROFILE UPDATE===========
$("#profileForm").on("submit", function (e) {
  e.preventDefault();

  const $btn = $("#updateProfileBtn");
  const token = sessionStorage.getItem("AUTH_TOKEN");

  if (!token) {
    showErrorToast("Session expired. Please log in again.");
    return;
  }

  const address = $("#profileAddressInput").val().trim();
  const state = $("#profileStateInput").val();

  if (!address || !state) {
    showErrorToast("Address and state are required.");
    return;
  }

  const formData = new FormData();
  formData.append("token", token);        
  formData.append("address", address);
  formData.append("state", state);

  //START BUTTON LOADER
  startButtonLoading($btn);

  $.ajax({
    url: "https://api.faadaakaa.com/api/updateprofile",
    type: "POST",
    headers: {
      Authorization: "Bearer " + token   
    },
    data: formData,
    processData: false,
    contentType: false,

    success: function (res) {
      if (!res || res.status !== true) {
        showErrorToast(res?.message || "Profile update failed");
        return;
      }

      showGreenToast("Profile updated successfully");

      // OPTIONAL: update profile summary UI immediately
      if (res.data) {
        $("#profileAddressStateText").text(
          `${res.data.address}, ${res.data.state}`
        );
      }
    },

    error: function (xhr) {
      console.error("Update profile error:", xhr.responseText);
      showErrorToast(
        xhr.responseJSON?.message ||
        "Unable to update profile. Please try again."
      );
    },

    complete: function () {
      //  STOP BUTTON LOADER
      stopButtonLoading($btn);
    }
  });
});
// =============ACCOUNT PASSWORD UPDATE FIELDS===================
// Bind eye icons (make sure these IDs match your HTML)
$(document).on("click", "#currentPasswordIcon", function () {
  togglePassword("currentPasswordInput", "currentPasswordIcon");
});

$(document).on("click", "#newPasswordIcon", function () {
  togglePassword("newPasswordInput", "newPasswordIcon");
});

$(document).on("click", "#confirmPasswordIcon", function () {
  const input = document.getElementById("confirmPasswordInput");
  if (input) input.removeAttribute("data-masked");
  togglePassword("confirmPasswordInput", "confirmPasswordIcon");
});

$("#passwordForm").on("submit", function (e) {
  e.preventDefault();

  const $btn = $("#updatePasswordBtn");
  const token = sessionStorage.getItem("AUTH_TOKEN");

  if (!token) {
    showErrorToast("Session expired. Please log in again.");
    return;
  }

  const currentPassword = $("#currentPasswordInput").val();
  const newPassword = $("#newPasswordInput").val();
  const confirmPassword = $("#confirmPasswordInput").val();

  if (!currentPassword || !newPassword || !confirmPassword) {
    showErrorToast("All fields are required.");
    return;
  }

  if (newPassword.length < 8) {
    showErrorToast("Password must be at least 8 characters.");
    return;
  }

  if (newPassword !== confirmPassword) {
    showErrorToast("Passwords do not match.");
    return;
  }

  const formData = new FormData();
  formData.append("current_password", currentPassword);
  formData.append("new_password", newPassword);
  formData.append("confirm_new_password", confirmPassword);
  formData.append("token", token);

  startButtonLoading($btn);

  $.ajax({
    url: "https://api.faadaakaa.com/api/updatepassword",
    type: "POST",
    headers: {
      Authorization: "Bearer " + token
    },
    data: formData,
    processData: false,
    contentType: false,

    success: function (res) {
      if (!res || res.status !== true) {
        showErrorToast(res?.message || "Password update failed");
        return;
      }

      $("#currentPasswordInput").val("");
      $("#newPasswordInput").val("");
      $("#confirmPasswordInput").val("");

      showGreenToast("Password updated successfully");
    },

    error: function (xhr) {
      showErrorToast(
        xhr.responseJSON?.message ||
        "Unable to update password. Please try again."
      );
    },

    complete: function () {
      stopButtonLoading($btn);
    }
  });
});

/// ======================== ACCOUNT UPDATE EMAIL ========================

// Resend OTP timer
function startEmailResendTimer(seconds) {
  let remaining = seconds;

  $("#resendEmailOtpBtn").prop("disabled", true);
  $("#emailResendTimer").text(remaining);

  const timer = setInterval(function () {
    remaining -= 1;
    $("#emailResendTimer").text(remaining);

    if (remaining <= 0) {
      clearInterval(timer);
      $("#resendEmailOtpBtn").prop("disabled", false);
      $("#resendEmailOtpBtn").text("Resend OTP");
    }
  }, 1000);
}

// STEP 1: Request OTP
$("#requestEmailOtpBtn").on("click", function (e) {
  e.preventDefault();

  const $btn = $("#requestEmailOtpBtn");
  const token = sessionStorage.getItem("AUTH_TOKEN");

  if (!token) {
    showErrorToast("Session expired. Please log in again.");
    return;
  }

  const email = $("#newEmailInput").val().trim();
  if (!email) {
    showErrorToast("Email is required.");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showErrorToast("Enter a valid email address.");
    return;
  }

  const formData = new FormData();
  formData.append("token", token);
  formData.append("email", email);

  startButtonLoading($btn);

  $.ajax({
    url: "https://api.faadaakaa.com/api/initiateemailupdate",
    type: "POST",
    headers: {
      Authorization: "Bearer " + token
    },
    data: formData,
    processData: false,
    contentType: false,

    success: function (res) {
      if (!res || !res.message) {
        showErrorToast("Failed to send OTP. Please try again.");
        return;
      }

      showGreenToast(res.message);

      sessionStorage.setItem("PENDING_EMAIL", email);

      // Hide STEP 1 completely
      $("#emailStepOne").addClass("hidden");

      // Show STEP 2
      $("#pendingEmailInput").val(email);
      $("#emailOtpWrap").removeClass("hidden");

      startEmailResendTimer(60);

      document.getElementById("emailOtpWrap").scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    },

    error: function (xhr) {
      showErrorToast(
        xhr.responseJSON?.message ||
        "Unable to process request. Please try again."
      );
    },

    complete: function () {
      stopButtonLoading($btn);
    }
  });
});

// Toggle password visibility
$(document).on("click", "#emailPasswordIcon", function () {
  togglePassword("emailPasswordInput", "emailPasswordIcon");
});

// STEP 2: Confirm Email Update
$("#confirmEmailUpdateBtn").on("click", function () {
  const $btn = $("#confirmEmailUpdateBtn");
  const token = sessionStorage.getItem("AUTH_TOKEN");

  if (!token) {
    showErrorToast("Session expired. Please log in again.");
    return;
  }

  const email = $("#pendingEmailInput").val();
  const otp = $("#emailOtpInput").val().trim();
  const password = $("#emailPasswordInput").val().trim();

  if (!otp || !password) {
    showErrorToast("OTP and password are required.");
    return;
  }

  const formData = new FormData();
  formData.append("token", token);
  formData.append("email", email);
  formData.append("email_code", otp);
  formData.append("password", password);

  startButtonLoading($btn);

  $.ajax({
    url: "https://api.faadaakaa.com/api/updateemail",
    type: "POST",
    headers: {
      Authorization: "Bearer " + token
    },
    data: formData,
    processData: false,
    contentType: false,

    success: function (res) {
      if (!res || res.status !== true) {
        showErrorToast(res?.message || "Email update failed");
        return;
      }

      showGreenToast("Email updated successfully");

      $("#currentEmailDisplay").text(email);

      // Reset UI back to STEP 1
      $("#emailOtpWrap").addClass("hidden");
      $("#emailStepOne").removeClass("hidden");

      $("#newEmailInput").val("");
      $("#emailOtpInput").val("");
      $("#emailPasswordInput").val("");

      sessionStorage.removeItem("PENDING_EMAIL");
    },

    error: function (xhr) {
      showErrorToast(
        xhr.responseJSON?.message ||
        "Unable to update email. Please try again."
      );
    },

    complete: function () {
      stopButtonLoading($btn);
    }
  });
});

// ========================ACCOUNT UPDATE PHONE===================
function startPhoneResendTimer(seconds) {
  let remaining = seconds;
  $("#resendPhoneOtpBtn").prop("disabled", true);
  $("#phoneResendTimer").text(remaining);

  const timer = setInterval(function () {
    remaining -= 1;
    $("#phoneResendTimer").text(remaining);

    if (remaining <= 0) {
      clearInterval(timer);
      $("#resendPhoneOtpBtn").prop("disabled", false).text("Resend OTP");
    }
  }, 1000);
}

$("#requestPhoneOtpBtn").on("click", function (e) {
  e.preventDefault();

  const $btn = $("#requestPhoneOtpBtn");
  const token = sessionStorage.getItem("AUTH_TOKEN");

  if (!token) {
    showErrorToast("Session expired. Please log in again.");
    return;
  }

  const phone = $("#newPhoneInput").val().trim();
  if (!phone || phone.length !== 11) {
    showErrorToast("Enter a valid 11-digit phone number.");
    return;
  }

  const formData = new FormData();
  formData.append("token", token);
  formData.append("phone", phone);

  // 🔄 START LOADER
  startButtonLoading($btn);

  $.ajax({
    url: "https://api.faadaakaa.com/api/initiatephoneupdate",
    type: "POST",
    headers: {
      Authorization: "Bearer " + token
    },
    data: formData,
    processData: false,
    contentType: false,

    success: function (res) {
      if (!res || !res.message) {
        showErrorToast("Failed to send OTP.");
        return;
      }

      // ✅ SUCCESS
      showGreenToast(res.message);

      sessionStorage.setItem("PENDING_PHONE", phone);

      // 🔥 STEP TRANSITION (SAME PATTERN AS EMAIL)
      $("#phoneStep1").addClass("hidden");
      $("#pendingPhoneInput").val(phone);
      $("#phoneOtpWrap").removeClass("hidden");

      // Resend timer
      $("#resendPhoneOtpBtn").html(
        'Resend OTP in <span id="phoneResendTimer">60</span>s'
      );
      startPhoneResendTimer(60);

      document.getElementById("phoneOtpWrap").scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    },

    error: function (xhr) {
      showErrorToast(
        xhr.responseJSON?.message ||
        "Unable to process request. Please try again."
      );
    },

    complete: function () {
      // 🔄 STOP LOADER
      stopButtonLoading($btn);
    }
  });
});



// ======================== RESEND EMAIL OTP ========================
$("#resendEmailOtpBtn").on("click", function () {
  const token = sessionStorage.getItem("AUTH_TOKEN");
  const email = sessionStorage.getItem("PENDING_EMAIL");

  if (!token) {
    showErrorToast("Session expired. Please log in again.");
    return;
  }

  if (!email) {
    showErrorToast("No email found to resend OTP.");
    return;
  }

  const formData = new FormData();
  formData.append("token", token);
  formData.append("email", email);

  $.ajax({
    url: "https://api.faadaakaa.com/api/initiateemailupdate",
    type: "POST",
    headers: {
      Authorization: "Bearer " + token
    },
    data: formData,
    processData: false,
    contentType: false,

    success: function (res) {
    
      showGreenToast(res?.message || "OTP has been resent to your email.");

      startEmailResendTimer(300);
    },

    error: function (xhr) {
      showErrorToast(
        xhr.responseJSON?.message ||
        "Unable to resend OTP. Please try again."
      );
    }
  });
});
$("#confirmPhoneUpdateBtn").on("click", function () {
  const $btn = $("#confirmPhoneUpdateBtn");
  const token = sessionStorage.getItem("AUTH_TOKEN");

  if (!token) {
    showErrorToast("Session expired. Please log in again.");
    return;
  }

  const phoneCode = $("#phoneOtpInput").val().trim();
  const password = $("#phonePasswordInput").val().trim();
  const phone = sessionStorage.getItem("PENDING_PHONE");

  if (!phoneCode || phoneCode.length !== 6) {
    showErrorToast("Enter a valid 6-digit OTP.");
    return;
  }

  if (!password) {
    showErrorToast("Password is required.");
    return;
  }

  const formData = new FormData();
  formData.append("token", token);        // BODY
  formData.append("phone_code", phoneCode);
  formData.append("password", password);

  // 🔄 START LOADER
  startButtonLoading($btn);

  $.ajax({
    url: "https://api.faadaakaa.com/api/updatephone",
    type: "POST",
    headers: {
      Authorization: "Bearer " + token    // HEADER
    },
    data: formData,
    processData: false,
    contentType: false,

    success: function (res) {
      if (!res || !res.message) {
        showErrorToast("Phone update failed.");
        return;
      }

      // ✅ SUCCESS
      showGreenToast(res.message);

      // Update profile display
      $("#currentPhoneDisplay").text(phone);

      // 🔁 RESET UI BACK TO STEP 1
      $("#phoneOtpWrap").addClass("hidden");
      $("#phoneStep1").removeClass("hidden");

      // Clear inputs
      $("#newPhoneInput").val("");
      $("#phoneOtpInput").val("");
      $("#phonePasswordInput").val("");

      sessionStorage.removeItem("PENDING_PHONE");

      document
        .querySelector('[data-account-section="phone"]')
        .scrollIntoView({ behavior: "smooth", block: "start" });
    },

    error: function (xhr) {
      showErrorToast(
        xhr.responseJSON?.message ||
        "Unable to update phone. Please try again."
      );
    },

    complete: function () {
      // 🔄 STOP LOADER
      stopButtonLoading($btn);
    }
  });
});
$(document).on("click", "#phonePasswordIcon", function () {
  const input = $("#phonePasswordInput");
  const type = input.attr("type") === "password" ? "text" : "password";
  input.attr("type", type);
  $(this).toggleClass("fa-eye fa-eye-slash");
});
// FETCH PROFILE
// --------------------
async function fetchCurrentUser() {
  const token = getToken();
  if (!token) {
    window.location.replace = "index.html";
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

    if (!json || !json.status || !json.data) {
  window.location.href = "login.html";
  return;
}

    API_USER = json.data;
    mapApiUserToUI(API_USER);
  } catch (err) {
  console.error("PROFILE ERROR", err);
  window.location.href = "login.html";
}
hideAccountLoader();
}




// =====================================================
// PROFILE VERIFICATION BADGES (BVN-BASED)
// =====================================================

// EMAIL
function renderEmailVerificationBadge(user) {
  const badge = $("#emailVerifiedBadge");
  if (!badge.length) return;

  const emailIsVerified =
    user.email_verified === 1 ||
    String(user.identity_verification_status || "").toLowerCase() === "verified";

  badge.toggleClass("hidden", !emailIsVerified);
}

// PHONE
function renderPhoneVerificationBadge(user) {
  const badge = $("#phoneVerifiedBadge");
  if (!badge.length) return;

  const phoneIsVerified =
    user.mobile_verified === 1 ||
    !!user.verified_phone ||
    String(user.identity_verification_status || "").toLowerCase() === "verified";

  badge.toggleClass("hidden", !phoneIsVerified);
}

// NAME (BVN full name)
function renderNameVerificationBadge(user) {
  const badge = $("#nameVerifiedBadge");
  if (!badge.length) return;

  const nameIsVerified =
    !!user.verified_fullname ||
    String(user.identity_verification_status || "").toLowerCase() === "verified";

  badge.toggleClass("hidden", !nameIsVerified);
}

function mapApiUserToUI(user) {
  if (!user) return;

  const first = (user.first_name || "").trim();
  const last = (user.last_name || "").trim();

  const safeFirst = first || "User";
  const fullName = `${first} ${last}`.trim() || "User";

  const initials =
    (safeFirst.charAt(0) || "U").toUpperCase() +
    (last.charAt(0) || "").toUpperCase();

  // HEADER
  setJqText("#userInitials", initials);
  setJqText("#mobileUserBadge", initials);
  setJqText("#userGreeting", `Hi ${safeFirst}`);
  setJqText("#mobileUserName", `Hello, ${safeFirst}`);

  // PROFILE
  setJqText("#profileFullName", fullName);
  setJqText("#profileEmailText", user.email || "No email added yet");
  setJqText("#currentEmailDisplay", user.email || "No email added yet");

  const phone = user.verified_phone || user.phone || "No phone number yet";
  setJqText("#profilePhoneText", phone);
  setJqText("#currentPhoneDisplay", phone);

  renderPhoneVerificationBadge(user);

  $("#avatarText").text(initials).removeClass("hidden");
  $("#avatarInner").css({
    backgroundImage: "none",
    backgroundColor: "#E4E7EC"
  });

  const rootAddress = (user.address1 || "").trim();
  const rootState = (user.state || "").trim();

  let mergedAddress = "No address added yet";
  if (rootAddress && rootState) mergedAddress = `${rootAddress}, ${rootState}`;
  else if (rootAddress) mergedAddress = rootAddress;
  else if (rootState) mergedAddress = rootState;

  setJqText("#profileAddressStateText", mergedAddress);
  $("#profileAddressInput").val(rootAddress);
 loadStatesIntoSelect("profileStateInput", user.state || "");

  const isVerified =
    String(user.identity_verification_status || "").toLowerCase() === "verified";

  $("#accountVerifiedBadge").toggleClass("hidden", !isVerified);

  populateCurrentPasswordField();

  const walletBal = Number(user.wallet?.data?.wallet_balance || 0);
  setJqText("#walletBalance", formatNaira(walletBal));
  setJqText("#mobileWalletBalance", formatNaira(walletBal));
  setJqText("#walletBalanceBox", formatNaira(walletBal));

  renderWalletCards(user.payment_cards?.data || []);
  renderAddressesFromApi(user.addresses?.data || []);
  hydrateActiveDeliveryAddress(user.addresses?.data || []);
  renderLoanAndCreditFromApi(user);
  renderNameVerificationBadge(user);
renderEmailVerificationBadge(user);
renderPhoneVerificationBadge(user);
}

// =====================================================
// ACCOUNT HEADER DROPDOWN MENU (FIXED)
// =====================================================
document.addEventListener("DOMContentLoaded", function () {
  const $badge = $("#mobileUserBadge");
  const $name = $("#mobileUserName");
  const $icon = $("#userDropdownIcon");
  const $menu = $("#userMenu");

  if (!$menu.length) return;

  // Always start hidden
  $menu.addClass("hidden");

  function toggleMenu(e) {
    e.stopPropagation();
    $menu.toggleClass("hidden");
  }

  // Click triggers
  $badge.on("click", toggleMenu);
  $name.on("click", toggleMenu);
  $icon.on("click", toggleMenu);

  // Prevent menu self close
  $menu.on("click", function (e) {
    e.stopPropagation();
  });

  // Outside click closes menu
  $(document).on("click", function () {
    $menu.addClass("hidden");
  });
});


$("#menuAccount").on("click", function () {
  switchMainTab("account");
  $("#userMenu").addClass("hidden");
});

$("#menuWallet").on("click", function () {
  switchMainTab("wallet");
  $("#userMenu").addClass("hidden");
});

$("#menuOrders").on("click", function () {
  switchMainTab("orders");
  $("#userMenu").addClass("hidden");
});


// =====================================================
// WALLET SECTION
// =====================================================
// ========================WALLET CARDS =============================

// ====================== RENDER CARD (WITH DELETE BUTTON) ======================
function renderNewCard(card) {
  $("#walletEmptyCards").remove();

  const paymentCardId =
    card.payment_card_id ||
    card.card_id ||
    card.id ||
    "";

  const brand = card.card_type || card.brand || "Card";
  const first6 = card.bin || card.first2 || "";
  const last4 = card.last4 || card.last_4 || "0000";

  const maskedNumber = `${first6}****${last4}`;

  const cardHtml = `
    <div
      class="wallet-card flex items-center justify-between border border-[#EAECF0] rounded-[8px] p-[12px]"
      data-payment_card_id="${paymentCardId}">
      
      <p class="text-[14px] text-[#101828]">
        ${maskedNumber} | ${brand}
      </p>

      <button
        type="button"
        class="deleteCardBtn text-[12px] text-[#D92D20]"
        data-payment_card_id="${paymentCardId}">
        Delete
      </button>
    </div>
  `;

  $("#walletCardsBody").append(cardHtml);
}

// ====================== RENDER ALL WALLET CARDS ======================
function renderWalletCards(cards) {
  const $body = $("#walletCardsBody");
  if (!$body.length) return;

  $body.empty();

  if (!Array.isArray(cards) || cards.length === 0) {
    $body.html(`
      <div id="walletEmptyCards"
           class="flex flex-col items-center justify-center text-center text-[14px] text-[#667085] py-[20px]">
        <i class="fa-regular fa-credit-card mb-[6px] text-[20px] text-[#98A2B3]"></i>
        <p>No payment cards added yet</p>
      </div>
    `);
    return;
  }

  cards.forEach(card => {
    const paymentCardId =
      card.payment_card_id ||
      card.card_id ||
      card.id ||
      "";

    const brand = card.card_type || card.brand || "Card";
    const first6 = card.bin || card.first2 || "";
    const last4 = card.last4 || card.last_4 || "0000";

    const maskedNumber = `${first6}****${last4}`;

    const cardHtml = `
      <div
        class="wallet-card flex items-center justify-between border border-[#EAECF0] rounded-[8px] p-[12px] mb-[8px]"
        data-payment_card_id="${paymentCardId}">
        
        <p class="text-[14px] text-[#101828]">
          ${maskedNumber} | ${brand}
        </p>

        <button
          type="button"
          class="deleteCardBtn text-[12px] text-[#D92D20]"
          data-payment_card_id="${paymentCardId}">
          Delete
        </button>
      </div>
    `;

    $body.append(cardHtml);
  });
}

// ====================== DELETE CARD ( INSTANT UI UPDATE) ======================
$(document)
  .off("click", ".deleteCardBtn")
  .on("click", ".deleteCardBtn", function () {
    const token = getToken();
    const paymentCardId = $(this).data("payment_card_id");

    if (!token) {
      showErrorModal("Session expired. Please log in again.");
      return;
    }

    if (!paymentCardId) {
      showErrorModal("Missing card reference.");
      return;
    }

    const formData = new FormData();
    formData.append("token", token);
    formData.append("payment_card_id", paymentCardId);

    $.ajax({
      url: "https://api.faadaakaa.com/api/delete_payment_card",
      type: "POST",
      headers: {
        Authorization: "Bearer " + token
      },
      data: formData,
      processData: false,
      contentType: false,

      success: function (res) {
        // ❌ BACKEND ERROR → POPUP MODAL
        if (!res || res.status !== true) {
          showErrorModal(res?.message || "Unable to delete card.");
          return;
        }

        // ✅ SUCCESS → GREEN INLINE MESSAGE
        showGreenToast("Payment card deleted successfully.");

        // ✅ REMOVE CARD INSTANTLY FROM UI
        $(`.wallet-card[data-payment_card_id="${paymentCardId}"]`).remove();

        // ✅ SHOW EMPTY STATE IF NO CARDS LEFT
        if ($("#walletCardsBody .wallet-card").length === 0) {
          $("#walletCardsBody").html(`
            <div id="walletEmptyCards"
                 class="flex flex-col items-center justify-center text-center
                        text-[14px] text-[#667085] py-[20px]">
              <i class="fa-regular fa-credit-card mb-[6px]
                        text-[20px] text-[#98A2B3]"></i>
              <p>No payment cards added yet</p>
            </div>
          `);
        }
      },

      // ❌ NETWORK / SERVER ERROR → POPUP MODAL
      error: function (xhr) {
        showErrorModal(
          xhr.responseJSON?.message || "Unable to delete card."
        );
      }
    });
  });

// ================= INITIAL PAYMENT PERCENTAGE =================
$("#updateInitialPaymentBtn").on("click", function () {
  $("#walletSuccessTitle").text("Coming soon");
  $("#walletSuccessMessage").text(
    "We are still cooking this feature. Please stay tuned!"
  );

  $("#walletSuccessModal").removeClass("hidden");
});

// ====================== CLOSE SUCCESS MODAL AND REFRESH WALLET ======================
$("#walletSuccessOkBtn").off("click").on("click", function () {
  $("#walletSuccessModal").addClass("hidden");

  $("#walletFundingPage").addClass("hidden");
  $("#walletMainPage").removeClass("hidden");


});


// ====================== SUCCESS MODAL ======================
function showWalletSuccess(title, message) {
  $("#walletSuccessTitle").text(title);
  $("#walletSuccessMessage").text(message);
  $("#walletSuccessModal").removeClass("hidden");
}

// ====================== LOAD WALLET CARDS ======================
function loadWalletCards() {
  const token = getToken();

  if (!token) {
    showErrorToast("Session expired. Please log in again.");
    return;
  }

  const formData = new FormData();
  formData.append("token", token);

  $.ajax({
    url: "https://api.faadaakaa.com/api/loadprofile",
    type: "POST",
    data: formData,
    processData: false,
    contentType: false,

    success: function (res) {
      const cards = res?.data?.payment_cards?.data || [];
      renderWalletCards(cards);
    },

    error: function (xhr) {
      console.error("Load profile error:", xhr.responseText);
      showErrorToast("Unable to load wallet data.");
    }
  });
}

/// ======================== WALLET FUNDING =============================
// ============ SHOW FUND WALLET PAGE (URL-DRIVEN) =====================
$("#fundWalletBtn").on("click", function () {
  $("#walletMainPage").addClass("hidden");
  $("#walletFundingPage").removeClass("hidden");

  // Update URL
  history.pushState({ page: "wallet-fund" }, "", "/account/wallet/fund");

  loadProfileAndRefreshCards();
});


$("#walletFundingBackBtn").on("click", function () {
  $("#walletFundingPage").addClass("hidden");
  $("#walletMainPage").removeClass("hidden");

  // Update URL back to wallet main
  history.pushState({ page: "wallet" }, "", "/account/wallet");
});

function handleWalletFromURL() {
  const path = window.location.pathname;

  if (path === "/account/wallet/fund") {
    $("#walletMainPage").addClass("hidden");
    $("#walletFundingPage").removeClass("hidden");
    loadProfileAndRefreshCards();
  } else {
    $("#walletFundingPage").addClass("hidden");
    $("#walletMainPage").removeClass("hidden");
  }
}
// ============ LOAD SAVED CARDS INTO FUND WALLET PAGE ============
function renderFundingCards(cards) {
  const $list = $("#fundingCardsListPage");
  $list.empty();

  if (!Array.isArray(cards) || cards.length === 0) return;

  cards.slice(0, 3).forEach(card => {
    const cardId =
      card.payment_card_id ||
      card.card_id ||
      card.id ||
      "";

    if (!cardId) return;

    const masked = `${card.bin}****${card.last4}`;
    const brand = card.card_type || card.brand || "Card";

    $list.append(`
      <label class="flex items-center justify-between cursor-pointer">
        <div class="flex items-center gap-[8px]">
          <input
            type="radio"
            name="fundMethod"
            value="card_${cardId}"
          >
          <span class="text-[13px] text-[#344054]">
            ${brand}
          </span>
        </div>

        <span class="text-[12px] text-[#475467]">
          ${masked}
        </span>
      </label>
    `);
  });
}
function clearFundAmountInput() {
  $("#fundAmountInputPage").val("");
}

// ============ CONFIRM & FUND WALLET============
$("#fundWalletPagePayBtn").on("click", function () {
  const amount = Number($("#fundAmountInputPage").val());
  const method = $("input[name='fundMethod']:checked").val();

  if (!amount || amount < 100) {
    $("#fundAmountErrorPage").removeClass("hidden");
    return;
  }

  $("#fundAmountErrorPage").addClass("hidden");

  // STRICT BANK TRANSFER
  if (method === "bank") {
    startPaystackWalletFunding(amount);
    return;
  }

  // STRICT CARD FUNDING
  if (method && method.startsWith("card_")) {
    const cardId = method.replace("card_", "");

    if (!cardId) {
      showErrorToast("Invalid card selected.");
      return;
    }

    fundWalletWithExistingCard(amount, cardId);
    return;
  }

  // FALLBACK SAFETY
  showErrorToast("Please select a funding method.");
});
// ============ PAYSTACK WALLET FUNDING ============
function startPaystackWalletFunding(amount) {
  const email = API_USER?.email;

  let handler = PaystackPop.setup({
    key: PAYSTACK_API_KEY,
    email: email,
    amount: amount * 100,
    currency: "NGN",
    channels: ["bank_transfer"],

    callback: function (response) {
      confirmWalletFunding(response.reference);
    }
  });

  handler.openIframe();
}
function startPaystackCardFunding(amount, cardId) {
  const email = API_USER?.email;

  let handler = PaystackPop.setup({
    key: PAYSTACK_API_KEY,
    email: email,
    amount: amount * 100,
    currency: "NGN",

    // ✅ CARD ONLY
    channels: ["card"],

    callback: function (response) {
      // backend will charge the selected card
      fundWalletWithExistingCard(amount, cardId);
    }
  });

  handler.openIframe();
}

function refreshWalletBalanceFromBackend(done) {
  const token = getToken();
  if (!token) return;

  const formData = new FormData();
  formData.append("token", token);

  $.ajax({
    url: "https://api.faadaakaa.com/api/loadprofile",
    type: "POST",
    headers: {
      Authorization: "Bearer " + token
    },
    data: formData,
    processData: false,
    contentType: false,

    success: function (res) {
      if (!res || res.status !== true) return;

      const walletBalance =
        res?.data?.wallet?.data?.wallet_balance ??
        res?.data?.wallet_balance ??
        "0.00";

      updateWalletBalanceInstant(walletBalance);

      if (typeof done === "function") done();
    },

    error: function () {
      showErrorToast("Unable to refresh wallet balance.");
    }
  });
}
function showWalletUpdatingOverlay() {
  $("#walletUpdatingOverlay").removeClass("hidden");
}

function hideWalletUpdatingOverlay() {
  $("#walletUpdatingOverlay").addClass("hidden");
}
function getCurrentWalletBalanceFromUI() {
  const text = $("#walletBalanceMain").text().replace(/[₦,]/g, "");
  return Number(text) || 0;
}

function pollUntilBalanceChanges(oldBalance, onUpdated) {
  const token = getToken();
  if (!token) return;

  let tries = 0;
  const maxTries = 15; // about 15 seconds
  const delay = 1000;  // 1 second

  const timer = setInterval(() => {
    tries++;

    fetchWalletBalance(function (newBalance) {
      // balance changed, stop polling
      if (Number(newBalance) !== Number(oldBalance)) {
        clearInterval(timer);
        updateWalletBalanceEverywhere(newBalance);

        if (typeof onUpdated === "function") onUpdated(newBalance);
        return;
      }

      // timeout
      if (tries >= maxTries) {
        clearInterval(timer);
        showErrorToast(
          "Payment confirmed, but wallet update is taking longer than expected. Please wait and refresh later."
        );
      }
    });
  }, delay);
}

// ============  INSTANT WALLET BALANCE UPDATE ============
function updateWalletBalanceInstant(amount) {
  updateWalletBalanceEverywhere(amount);
}
function updateWalletBalanceEverywhere(amount) {
  const formatted = `₦${Number(amount).toLocaleString("en-NG", {
    minimumFractionDigits: 2
  })}`;

  // Existing IDs you already use
  $("#walletBalanceTop").text(formatted);
  $("#walletBalanceMain").text(formatted);

  // Add extra safe selectors (top nav often uses another span)
  $("[data-wallet-balance]").text(formatted);
  $(".js-wallet-balance").text(formatted);
}
function fetchWalletBalance(done) {
  const token = getToken();
  if (!token) return;

  const formData = new FormData();
  formData.append("token", token);

  $.ajax({
    url: "https://api.faadaakaa.com/api/loadprofile",
    type: "POST",
    headers: { Authorization: "Bearer " + token },
    data: formData,
    processData: false,
    contentType: false,
    success: function (res) {
      if (!res || res.status !== true) return;

      const bal =
        Number(
          res?.data?.wallet?.data?.wallet_balance ??
          res?.data?.wallet_balance ??
          0
        );

      if (typeof done === "function") done(bal, res);
    },
    error: function () {
      showErrorToast("Unable to load wallet balance.");
    }
  });
}
// ============ CONFIRM FUNDING TRANSFER / PAYSTACK ============
function confirmWalletFunding(payref) {
  const token = getToken();
  if (!token) {
    showErrorToast("Session expired. Please log in again.");
    return;
  }

  // 1) get old balance from backend first (not UI)
  fetchWalletBalance(function (oldBalance) {

    const formData = new FormData();
    formData.append("token", token);
    formData.append("payref", payref);

    $.ajax({
      url: "https://api.faadaakaa.com/api/addfundbytransfer_trans_ref",
      type: "POST",
      headers: { Authorization: "Bearer " + token },
      data: formData,
      processData: false,
      contentType: false,

      success: function (res) {
        if (!res || res.status !== true) {
          showErrorModal(res?.message || "Funding failed.");
          return;
        }
        showWalletUpdatingOverlay();
        //  poll until wallet balance changes in backend
        pollUntilBalanceChanges(oldBalance, function () {
          clearFundAmountInput();

          //  move to main page first
          $("#walletFundingPage").addClass("hidden");
          $("#walletMainPage").removeClass("hidden");

          //  now show success (wallet already updated)
          showWalletSuccess("Wallet Funded", "Your wallet has been funded successfully.");

          //  auto close success modal after 1.2s
          setTimeout(() => {
            $("#walletSuccessModal").addClass("hidden");
          }, 1200);
        });
      },

      error: function () {
        showErrorModal("Unable to fund wallet.");
      }
    });
  });
}

// ============ FUNDING WITH EXISTING CARD ============
function fundWalletWithExistingCard(amount, cardId) {
  const token = getToken();
  if (!token) {
    showErrorToast("Session expired. Please log in again.");
    return;
  }

  const formData = new FormData();
  formData.append("token", token);               
  formData.append("amount", amount);
  formData.append("payment_method_id", cardId);

  $.ajax({
    url: "https://api.faadaakaa.com/api/addfundby_exsting_card",
    type: "POST",
    headers: {
      Authorization: "Bearer " + token
    },
    data: formData,
    processData: false,
    contentType: false,

    success: function (res) {
      if (!res || res.status !== true) {
        showErrorToast(res?.message || "Unable to fund wallet.");
        return;
      }

      const walletBalance =
        res?.data?.wallet_balance ??
        res?.data?.wallet?.data?.wallet_balance ??
        "0.00";

      updateWalletBalanceInstant(walletBalance);
      clearFundAmountInput();

      $("#walletFundingPage").addClass("hidden");
      $("#walletMainPage").removeClass("hidden");

      showWalletSuccess(
        "Wallet Funded",
        "Your wallet has been funded successfully."
      );
    },

    error: function (xhr) {
      showErrorModal(
        xhr.responseJSON?.message || "Unable to fund wallet."
      );
    }
  });
}

// ============ HELPERS FOR PAYMENT CARD ============
function loadProfileAndRefreshCards() {
  console.log("Loading profile to refresh cards...");
  const token = getToken();

  if (!token) return;

  const formData = new FormData();
  formData.append("token", token);

  $.ajax({
    url: "https://api.faadaakaa.com/api/loadprofile",
    type: "POST",
    data: formData,
    processData: false,
    contentType: false,

    success: function (res) {
      if (!res || res.status !== true) {
        console.error("Load profile failed", res);
        return;
      }

      const cards = res.data?.payment_cards?.data || [];

      // Wallet page
      renderWalletCards(cards);

      // Funding page
      renderFundingCards(cards);

      // Clear Loan page (if present)
if (typeof window.renderClearLoanOptions === "function") {
  clearLoanState.cards = cards;
  renderClearLoanOptions();
}
    },

    error: function (xhr) {
      console.error("Load profile error:", xhr.responseText);
    }
  });
}

// =======ADD NEW CARD IN CART PAGE=====
window.openAddNewCardFlow = function () {
  $("#cardChargeModal").removeClass("hidden");
};



// =====================================================
// LOANS + CREDIT (API)
// This is the correct mapping for your response shape
// =====================================================
function formatNaira(value) {
  return `₦${Number(value).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function toNumber(val) {
  if (!val) return 0;
  return Number(String(val).replace(/,/g, ""));
}

function renderLoanAndCreditFromApi(user) {
  if (!user) return;

  // ---------------------------
  // IDENTITY VERIFICATION
  // ---------------------------
  const bvnMasked = user.identity_number
    ? `BVN | xxxxxxx${String(user.identity_number).slice(-4)}`
    : "BVN | Not Available";

  $("#loanDashBvnMasked").text(bvnMasked);

  const fullName = user.verified_fullname?.trim()
    ? user.verified_fullname
    : `${user.first_name || ""} ${user.last_name || ""}`.trim();

  $("#loanDashFullName").text(fullName.toUpperCase());
  console.log("loanDashFullName:", fullName);
  console.log('loanDashBvnMasked', bvnMasked);

  // ---------------------------
  // CREDIT (wallet)
  // ---------------------------
  const wallet = user.wallet?.data;

  if (wallet) {
    $("#dashCreditValue").text(formatNaira(wallet.credit_value));
    $("#dashAvailableCredit").text(formatNaira(wallet.credit_balance));
    $("#dashCreditStatus").text(wallet.credit_status.toUpperCase());
  }

  // ---------------------------
  // BANK DETAILS
  // ---------------------------
  $("#dashBankName").text(user.bank_name || "-");
  $("#dashBankAccount").text(user.bank_account_number || "-");
  

  if (user.has_linked_bank_account === "yes") {
    $("#bankCheckIcon").removeClass("hidden");
  }

  // ---------------------------
  // LOANS (financials)
  // ---------------------------
  const fin = user.financials?.data?.[0];

  if (fin) {
    $("#dashTotalAccessed").text(
      formatNaira(toNumber(fin.total_accessed_loan))
    );

    $("#dashTotalRepaid").text(
      formatNaira(toNumber(fin.total_repaid_loan))
    );

    $("#dashUnsettled").text(
      formatNaira(toNumber(fin.unsettled_loan))
    );
  }

  // ---------------------------
  // VISIBILITY CONTROL
  // ---------------------------
  const verified =
    String(user.identity_verification_status).toLowerCase() === "verified";

  const hasBank =
    String(user.has_linked_bank_account).toLowerCase() === "yes";

  if (verified && hasBank) {
    $("#loanDashboardSection").removeClass("hidden");
    $("#bvnFormSection, #bvnVerifiedSection").addClass("hidden");
  }
}


// =====================================================
// ADDRESSES (API)
// =====================================================


// ===============RENDER STATE API=======================
// =============== LOAD STATES INTO SELECT =================
async function loadStatesIntoSelect(selectId, selectedValue = "") {
  try {
    const token = sessionStorage.getItem("AUTH_TOKEN");
    if (!token) return;

    const formData = new FormData();
    formData.append("token", token);

    const res = await fetch("https://api.faadaakaa.com/api/loadstates", {
      method: "POST",
      body: formData
    });

    const json = await res.json();
    if (!json.status || !Array.isArray(json.data)) return;

    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = `<option value="">Select state</option>`;

    json.data.forEach(state => {
      const option = document.createElement("option");
      option.value = state.name;
      option.textContent = state.name;

      // 🔥 THIS FIXES YOUR ISSUE
      option.dataset.stateId = state.id;

      if (
        selectedValue &&
        state.name.toLowerCase() === selectedValue.toLowerCase()
      ) {
        option.selected = true;
      }

      select.appendChild(option);
    });

  } catch (err) {
    console.error("Failed to load states", err);
  }
}
function renderAddressesFromApi(addresses) {
  const $container = $("#savedAddressesContainer");
  if (!$container.length) return;

  $container.empty();
  apiAddresses = addresses || [];

  if (!apiAddresses.length) {
    $container.addClass("hidden");
    return;
  }

  $container.removeClass("hidden");

  apiAddresses.forEach(addr => {
    const isActive = String(addr.active) === "1";

    const borderColor = isActive ? "#1570EF" : "#D0D5DD";
    const borderBottom = isActive ? "4px" : "1px";
    const borderRight = isActive ? "4px" : "1px";

   $container.append(`
  <div
    class="address-card relative w-full rounded-[8px] p-[16px] bg-[#F9FAFB]
           flex justify-between items-start"
    data-address-id="${addr.id}"
    style="border:1px solid ${borderColor};
           border-bottom-width:${borderBottom};
           border-right-width:${borderRight};"
  >

    <div class="flex flex-col text-[14px] leading-[20px]
                ${isActive ? "text-[#1570EF]" : "text-[#344054]"}">
      <span class="font-semibold">
        ${addr.name} | ${addr.mobile}
        ${isActive ? "<span class='text-green-600 text-[12px]'>(Active)</span>" : ""}
      </span>
      <span>${addr.address}</span>
      <span>${addr.state}</span>
    </div>

    <div class="flex flex-col items-end gap-[8px]">
      <button class="delete-address-btn" data-id="${addr.id}">
        <i class="fa-regular fa-trash-can text-red-500"></i>
      </button>

      ${
        !isActive
          ? `<button
               class="set-active-btn text-[#1570EF] text-[13px] underline"
               data-id="${addr.id}">
               Set as Active Address
             </button>`
          : ""
      }
    </div>

    ${
      isActive
        ? `<div class="absolute bottom-[6px] right-[6px]">
             <i class="fa-solid fa-check text-green-600"></i>
           </div>`
        : ""
    }
  </div>
`);
  });
}

$(document).on("click", ".set-active-btn", function () {
  const id = $(this).data("id");

  apiAddresses = apiAddresses.map(a => ({
    ...a,
    active: String(a.id) === String(id) ? "1" : "0"
  }));

  renderAddressesFromApi(apiAddresses);
  hydrateActiveDeliveryAddress(apiAddresses);

  showGreenToast("Active address updated.");
});

$(document).on("click", ".delete-address-btn", function () {
  const addressId = $(this).data("id");
  const token = sessionStorage.getItem("AUTH_TOKEN");

  if (!token || !addressId) {
    showGreenToast("Invalid session or address.", "error");
    return;
  }

  // 🔥 IMMEDIATE UI REMOVAL (Optimistic UI)
  const $card = $(`.address-card[data-address-id="${addressId}"]`);
  $card.slideUp(200, function () {
    $(this).remove();
  });

  fetch("https://api.faadaakaa.com/api/delete_address", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      token: token,
      address_id: addressId
    })
  })
    .then(res => res.json())
    .then(json => {
      if (!json.status) {
        showGreenToast(json.message || "Failed to delete address.", "error");

        // 🔄 Rollback UI if backend fails
        fetchDeliveryAddresses();
        return;
      }

      showGreenToast("Address deleted successfully.", "success");

      // Optional background sync
      if (typeof fetchDeliveryAddresses === "function") {
        fetchDeliveryAddresses();
      }
    })
    .catch(err => {
      console.error("Delete address error", err);

      showGreenToast("Something went wrong. Restoring address.", "error");

      // 🔄 Rollback UI on error
      fetchDeliveryAddresses();
    });
});



// ================ADD NEW DELIVERY ADDRESS=========
function hydrateActiveDeliveryAddress(addresses) {
  const active = addresses.find(a => String(a.active) === "1");

  if (!active) {
    setText("#deliveryName", "No active address");
    setText("#deliveryPhone", "-");
    setText("#deliveryAddress", "-");
    setText("#deliveryState", "-");
    return;
  }

  setText("#deliveryName", active.name);
  setText("#deliveryPhone", active.mobile);
  setText("#deliveryAddress", active.address);
  setText("#deliveryState", active.state);
}
$(document).ready(function () {

  const $form = $("#deliveryForm");
  const $deliveryFullName = $("#deliveryFullName");
  const $deliveryPhone = $("#deliveryPhone");
  const $deliveryAddress = $("#deliveryAddress");
  const $deliveryState = $("#deliveryStateInput");

  loadStatesIntoSelect("deliveryStateInput");

  $form.on("submit", function (e) {
    e.preventDefault();

    const token = sessionStorage.getItem("AUTH_TOKEN");
    if (!token) {
      showGreenToast("Session expired. Please login again.", "error");
      return;
    }

    const $selectedOption = $("#deliveryStateInput option:selected");

    const payload = {
      name: $deliveryFullName.val().trim(),
      mobile: $deliveryPhone.val().trim(),
      address: $deliveryAddress.val().trim(),
      state: $selectedOption.val(),
      state_id: $selectedOption.data("stateId")
    };

    if (!payload.name || !payload.mobile || !payload.address) {
      showGreenToast("Please fill all fields", "error");
      return;
    }

    if (!payload.state || !payload.state_id) {
      showGreenToast("Please select a state", "error");
      return;
    }

    if (payload.mobile.length !== 11) {
      showGreenToast("Phone number must be 11 digits", "error");
      return;
    }

    const formData = new FormData();
    formData.append("token", token);
    formData.append("name", payload.name);
    formData.append("mobile", payload.mobile);
    formData.append("address", payload.address);
    formData.append("state", payload.state);
    formData.append("state_id", payload.state_id);

    fetch("https://api.faadaakaa.com/api/addaddress", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(json => {
        if (!json.status) {
          showGreenToast(json.message || "Failed to add address", "error");
          return;
        }

        showGreenToast("Delivery address added successfully", "success");

        const newAddress = {
          id: json.address_id || Date.now(),
          name: payload.name,
          mobile: payload.mobile,
          address: payload.address,
          state: payload.state,
          active: apiAddresses.length ? "0" : "1"
        };

        apiAddresses.push(newAddress);
        renderAddressesFromApi(apiAddresses);
        hydrateActiveDeliveryAddress(apiAddresses);

        $form[0].reset();
        $("#deliveryStateInput").val("");
      })
      .catch(err => {
        console.error("Add address error", err);
        showGreenToast("Something went wrong. Try again.", "error");
      });
  });

});



// =====================================================
//ORDERS AND ORDER DETAILS (API)
// =====================================================
const BASE_URL = "https://api.faadaakaa.com/api";
const IMAGE_BASE = "https://fdk1.nyc3.digitaloceanspaces.com/fdk_bucket/";

let ordersCache = [];
let currentOrdersPage = 1;
let totalOrdersCount = 0;
let totalOrdersPages = 1;
const ORDERS_PER_PAGE = 20;

/* ==============================
   HELPERS
============================== */
function formatPrice(amount) {
  return `₦${Number(amount || 0).toLocaleString()}`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}
function hideAllRightSideSections() {
 
  $("#ordersContent, #orderDetailsContent, #clearLoanContent, #loanPaymentPage")
    .addClass("hidden");
}
/* ==============================
   LOAD ORDERS
============================== */
// =================ORDER ROUTE=================
function renderRoute(pathname) {
  hideAllRightSideSections();

  // /account/orders
  if (pathname === "/account/orders") {
    $("#ordersContent").removeClass("hidden");
    return;
  }

  // /account/orders/:id
  const orderMatch = pathname.match(/^\/account\/orders\/(\d+)$/);
  if (orderMatch) {
    const orderId = orderMatch[1];
    $("#orderDetailsContent").removeClass("hidden");
    loadOrderDetails(orderId);
    return;
  }
// /loan-settlement/order/:id
const loanSettlementMatch = pathname.match(
  /^\/loan-settlement\/order\/(\d+)$/
);

if (loanSettlementMatch) {
  const orderId = loanSettlementMatch[1];
  $("#clearLoanContent").removeClass("hidden");
  loadClearLoan(orderId);
  return;
}

if (pathname.startsWith("/loan-settlement/repayment/")) {
  const repaymentId = pathname.split("/").pop();
  $("#clearLoanContent").removeClass("hidden");
  loadRepaymentPage(repaymentId);
  return;
}
}

window.onpopstate = function () {
  renderRoute(window.location.pathname);
};
function goToClearLoanPage() {
  const orderId = $("#detailOrderId").text().replace("#", "");

  if (!orderId) {
    showErrorToast("Order reference not found.");
    return;
  }

  history.pushState({}, "", `/loan-settlement/order/${orderId}`);
  renderRoute(`/loan-settlement/order/${orderId}`);
}
/* ==============================
   SUMMARY CARDS
============================== */
function renderOrdersSummary(data) {
  const totalOrders =
    data.total_orders_count?.[0]?.total_orders_count || 0;

  $("#totalOrders").text(totalOrders);
  $("#totalOrderValue").text(formatPrice(data.order_sum));
  $("#outstandingLoan").text(formatPrice(data.debt));
}

/* ==============================
   ORDERS TABLE
============================== */
function renderOrdersTable(orders) {
  const $tbody = $("#ordersTableBody");
  $tbody.empty();

  if (!orders || !orders.length) {
    showEmptyOrders();
    return;
  }

  $("#ordersEmpty").addClass("hidden");

  orders.forEach(order => {
    // 🔑 USE DEBT, NOT LOAN
    const debtValue = Number(order.debt || 0);

    const outstandingText =
      debtValue > 0 ? formatPrice(debtValue) : "Paid";

    const outstandingClass =
      debtValue > 0 ? "text-[#D92D20]" : "text-[#039855]";

    const purchaseType =
      order.payment_model === "instalment"
        ? `${order.payment_period} Months`
        : "Outright";

    $tbody.append(`
      <tr class="hover:bg-[#F9FAFB] transition">

        <td class="py-[14px] text-[#475467] whitespace-nowrap">
          ${formatDate(order.created_at)}
        </td>

        <td class="py-[14px] font-medium text-[#101828]">
          #${order.id}
        </td>

        <td class="py-[14px] font-medium text-[#101828]">
          ${formatPrice(order.order_amount)}
        </td>

        <td class="py-[14px] text-[#475467]">
          ${formatPrice(order.amount_paid)}
        </td>

        <td class="py-[14px]">
          ${
            purchaseType === "Outright"
              ? `<span class="text-[#475467] font-medium">Outright</span>`
              : `<span class="px-[8px] py-[4px] rounded-full bg-[#EEF4FF] text-[#004EEB] text-[12px] font-medium">
                  installment ${purchaseType}
                </span>`
          }
        </td>

        <td class="py-[14px] font-medium ${outstandingClass}">
          ${outstandingText}
        </td>

        <td class="py-[14px]">
          <button
            class="text-[#1570EF] font-medium hover:underline viewOrderBtn"
            data-id="${order.id}">
            View
          </button>
        </td>

      </tr>
    `);
  });
}
/* ==============================
   EMPTY STATE
============================== */
function showEmptyOrders() {
  $("#ordersTableBody").empty();
  $("#ordersEmpty").removeClass("hidden");
}


/* ==============================
   ORDER DETAILS VIEW
============================== */
$(document).on("click", ".viewOrderBtn", function () {
  const orderId = $(this).data("id");

  history.pushState({}, "", `/account/orders/${orderId}`);
  renderRoute(window.location.pathname);
});
function loadOrderDetails(orderId) {
  const formData = new FormData();
  formData.append("token", sessionStorage.getItem("AUTH_TOKEN"));
  formData.append("orderId", orderId);

  fetch("https://api.faadaakaa.com/api/loadorderdetails", {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(result => {
      if (result.status && result.data) {
        populateOrderDetails(result.data);

        if (Array.isArray(result.data.repayment_schedule)) {
          $("#repaymentSection").removeClass("hidden");
          renderRepaymentSchedule(result.data.repayment_schedule);
        }
      }
    })
    .catch(console.error);
}
/* ==============================
   POPULATE ORDER DETAILS
============================== */
function populateOrderDetails(apiData) {
  const order = apiData.order_details[0];
  const item = apiData.order_items[0];

  // ================= ORDER META =================
  $("#detailOrderId").text(`#${order.id}`);
  $("#detailOrderDate").text(formatDateTime(order.created_at));
  $("#detailOrderValue").text(formatPrice(order.order_amount));
  // USE DEBT, NOT LOAN
const debtValue = Number(apiData?.debt?.[0]?.debt || 0);

// Outstanding text
$("#detailOutstanding").text(
  debtValue > 0 ? formatPrice(debtValue) : "Paid"
);

// Show or hide Clear Loan button correctly
if (order.payment_model === "instalment" && debtValue > 0) {
  $("#clearLoanBtn").removeClass("hidden");
  $("#repaymentSection").removeClass("hidden");
} else {
  $("#clearLoanBtn").addClass("hidden");
  $("#repaymentSection").removeClass("hidden");
}

  // ================= ORDER PLACED =================
  $("#orderPlacedTime").text(formatDateTime(order.created_at));

  // ================= ITEM DETAILS =================
  $("#detailItemImage").attr("src", IMAGE_BASE + item.item_image);
  $("#detailItemName").text(item.item_name);
  $("#detailItemQtyRight").text(item.quantity);
  $("#detailItemPrice").text(formatPrice(item.item_amount));

  // ================= PAYMENT INFO =================
  $("#detailPayAmount").text(formatPrice(order.order_amount));
  $("#detailPaid").text(formatPrice(order.amount_paid));
  $("#detailMethod").text(order.payment_method);
  $("#detailType").text(order.payment_model);

  // ================= DELIVERY (EXTRACT EVERYTHING FROM ADDRESS) =================
if (order.address) {
  const lines = order.address
    .replace(/<br\s*\/?>/gi, "\n")
    .split("\n")
    .map(l => l.replace(/,/g, "").trim())
    .filter(Boolean);

  $("#deliveryName").text(lines[0] || "");
  $("#deliveryPhone").text(lines[1] || "");
  $("#deliveryAddress").text(lines[2] || "");
  $("#deliveryState").text(lines[3] || "");
}
$("#deliveryCost").text(
  order.delivery_cost
    ? `${formatPrice(order.delivery_cost)} (paid at checkout)`
    : "₦0.00"
);
}


function formatDateTime(dateStr) {
  if (!dateStr) return "N/A";

  const date = new Date(dateStr.replace(" ", "T"));

  return date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

/* ==============================
   BACK TO ORDERS
============================== */
$("#backToOrdersBtn").on("click", function () {
  history.pushState({}, "", "/account/orders");
  renderRoute("/account/orders");
});

/* ==============================
   RENDER REPAYMENT SCHEDULE
============================== */
function renderRepaymentSchedule(schedule) {
  const $tbody = $("#repaymentTableBody");
  $tbody.empty();

  if (!Array.isArray(schedule) || schedule.length === 0) return;

  schedule.forEach((item, index) => {
    const isPaid = item.status === "paid";

    const hasPreviousUnpaid = schedule
      .slice(0, index)
      .some(s => s.status !== "paid");

    const canPayNow = !isPaid && !hasPreviousUnpaid;

    const actionBtn = isPaid
      ? `<span class="text-[#12B76A] font-medium">Paid</span>`
      : `<button
          class="payInstallmentBtn px-[12px] py-[6px] text-[13px] rounded-[6px]
          ${canPayNow ? "bg-[#1570EF] text-white" : "bg-[#E4E7EC] text-[#98A2B3] cursor-not-allowed"}"
          data-id="${item.id}"
          ${canPayNow ? "" : "disabled"}>
          Pay now
        </button>`;

    const row = `
      <tr class="border-b border-[#EAECF0]">
        <td class="px-[12px] py-[10px]">${index + 1}</td>
        <td class="px-[12px] py-[10px]">${formatPrice(item.amount_to_pay)}</td>
        <td class="px-[12px] py-[10px]">${formatDate(item.due_at)}</td>
        <td class="px-[12px] py-[10px]">${item.paid_at ? formatDate(item.paid_at) : "-"}</td>
        <td class="px-[12px] py-[10px] capitalize">${item.status}</td>
        <td class="px-[12px] py-[10px] text-right">${actionBtn}</td>
      </tr>
    `;

    $tbody.append(row);
  });
}

// ==============================
// CLEAR NOW LOAN AND PAY ALL REPAYMENT BUTTON
// ==============================
$(document).on("click", "#clearLoanBtn", function () {
  goToClearLoanPage();
});
$(document).on("click", "#payAllRepaymentsBtn", function () {
  goToClearLoanPage();
});

// ====================== CLEAR LOAN PAGE (LOAD + RENDER) ======================
let clearLoanState = {
  orderId: null,
  repaymentId: null,
  amount: 0,
  debt:0,
  walletBalance: 0,
  cards: [],
  selectedMethod: "wallet", 
  selectedCardId: null,
  mode : "order",
};

function formatMoney(amount) {
  return `₦${Number(amount || 0).toLocaleString()}`;
}

function maskCard(card) {
  // Try common fields from API response
  const brand = (card.card_type || card.brand || "Card").toString();
  const first6 = (card.bin || card.first6 || card.first2 || "").toString();
  const last4 = (card.last4 || card.last_4 || card.last || "").toString();

  // We want: 507872…5759
  const left = first6 ? first6 : "****";
  const right = last4 ? last4 : "****";

  return {
    brand,
    masked: `${left}…${right}`
  };
}

function setConfirmBtn(amount) {
  const text = `Confirm & Pay ${formatMoney(amount)}`;
  $("#confirmClearLoanText").text(text);
}

function setConfirmLoading(isLoading) {
  $("#confirmClearLoanSpinner").toggleClass("hidden", !isLoading);
  $("#confirmClearLoanBtn").prop("disabled", isLoading);

  if (isLoading) {
    $("#confirmClearLoanBtn").addClass("opacity-70 cursor-not-allowed");
  } else {
    $("#confirmClearLoanBtn").removeClass("opacity-70 cursor-not-allowed");
  }
}

function renderClearLoanOptions() {
  // Wallet
  $("#walletBalanceLoan").text(formatMoney(clearLoanState.walletBalance));

  // Cards
  const $cardsWrap = $("#cardsWrapper");
  $cardsWrap.empty();

  const cards = clearLoanState.cards || [];

  if (!cards.length) {
    $cardsWrap.append(`
      <div class="flex items-center justify-between py-[6px]">
        <label class="flex items-center gap-[10px] opacity-50">
          <input type="radio" disabled>
          <span class="text-[#344054]">My Card</span>
        </label>
        <span class="text-[#667085] text-[14px]">No saved card</span>
      </div>
    `);
    return;
  }

  cards.forEach((card, idx) => {
  const { brand, masked } = maskCard(card);
  const cardId = card.id || card._id || `card_${idx}`;

  const checked =
    clearLoanState.selectedMethod === "card" &&
    clearLoanState.selectedCardId === cardId
      ? "checked"
      : "";

  $cardsWrap.append(`
    <div class="flex items-center py-[8px]">
      
      <!-- LEFT: radio + card name -->
      <label class="flex items-center gap-[10px] cursor-pointer flex-1">
        <input
          type="radio"
          name="paymentMethod"
          value="card"
          data-card-id="${cardId}"
          ${checked}
        >
        <span class="text-[#344054]">
          ${brand}
        </span>
      </label>

      <!-- RIGHT: masked value -->
      <span class="text-[#667085] text-[14px] text-right min-w-[140px]">
        ${masked}
      </span>

    </div>
  `);
});
}

// This is what renderRoute() calls for /account/orders/:id/clear-loan
function loadClearLoan(orderId) {
  clearLoanState.orderId = orderId;

  // 1) Load order details to get loan amount
  const orderForm = new FormData();
  orderForm.append("token", sessionStorage.getItem("AUTH_TOKEN"));
  orderForm.append("orderId", orderId);

  // 2) Load profile to get wallet + cards
  const token = getToken();
  const profileForm = new FormData();
  profileForm.append("token", token);

  

  // Show page and reset button text
  setConfirmBtn(0);
  setConfirmLoading(false);

  Promise.all([
    fetch("https://api.faadaakaa.com/api/loadorderdetails", {
      method: "POST",
      body: orderForm
    }).then(r => r.json()),

    new Promise((resolve, reject) => {
      $.ajax({
        url: "https://api.faadaakaa.com/api/loadprofile",
        type: "POST",
        data: profileForm,
        processData: false,
        contentType: false,
        success: function (res) { resolve(res); },
        error: function (xhr) { reject(xhr); }
      });
    })
  ])
    .then(([orderRes, profileRes]) => {
  const order = orderRes?.data?.order_details?.[0];

  // IMPORTANT: debt comes like: data.debt = [{ debt: ... }]
  const debtValue = Number(orderRes?.data?.debt?.[0]?.debt || 0);

  clearLoanState.debt = debtValue;
  clearLoanState.amount = debtValue; // optional, so your existing UI keeps working

  $("#clearLoanOrderId").text(`#${order?.id || orderId}`);
  $("#clearLoanAmount").text(formatMoney(debtValue));
  setConfirmBtn(debtValue);

  const walletBal = Number(
    profileRes?.data?.wallet?.data?.wallet_balance ??
    profileRes?.data?.wallet_balance ??
    0
  );

  const cards = profileRes?.data?.payment_cards?.data || [];

  clearLoanState.walletBalance = walletBal;
  clearLoanState.cards = cards;

  renderClearLoanOptions();

  // HARD BLOCK: If debt is already 0, disable confirm button
  if (debtValue <= 0) {
    $("#confirmClearLoanBtn").prop("disabled", true);
    $("#confirmClearLoanText").text("Debt already cleared");
  }
})
    .catch(err => {
      console.error("Clear loan load error:", err);
      showErrorToast("Unable to load loan payment info.");
    });
}

// ====================== EVENTS ======================

// Back button, go back to order details route
$(document).on("click", "#backToOrderDetailsBtn", function () {
  history.back();
});

// Payment method radio changes
$(document).on("change", "input[name='paymentMethod']", function () {
  const method = $(this).val();
  clearLoanState.selectedMethod = method;

  if (method === "card") {
    clearLoanState.selectedCardId = $(this).data("card-id") || clearLoanState.selectedCardId;
  } else {
    clearLoanState.selectedCardId = null;
  }
});

function initClearLoanDefaultMethod() {
  const checked = $("input[name='paymentMethod']:checked").val();

  clearLoanState.selectedMethod = checked || "wallet";
  clearLoanState.selectedCardId = null;
}


/* ==============================
   INIT
============================== */
$(document).ready(function () {
  loadOrders(1);

  //  restore current route on refresh
  const path = window.location.pathname;
  renderRoute(path);
});

function loadOrders(page = 1) {
  
  const token = sessionStorage.getItem("AUTH_TOKEN");
  if (!token) {
    console.error("No auth token found");
    return;
  }

  const formData = new FormData();
  formData.append("token", token);
  formData.append("page", page);

  fetch("https://api.faadaakaa.com/api/load_orders", {
    method: "POST",
    body: formData
  })
    .then(res => res.text())
    .then(text => {
      try {
        const res = JSON.parse(text);

        if (!res.status) {
          showEmptyOrders();
          totalOrdersCount = 0;
          totalOrdersPages = 1;
          currentOrdersPage = 1;
          renderOrdersPaginationInfo();
          return;
        }

        const data = res.data;

        // Update page FIRST
        currentOrdersPage = page;

        // Orders
        ordersCache = data.orders || [];

        // Total count
        totalOrdersCount =
          Number(data.total_orders_count?.[0]?.total_orders_count || 0);

        totalOrdersPages = Math.max(
          1,
          Math.ceil(totalOrdersCount / ORDERS_PER_PAGE)
        );

        renderOrdersSummary(data);
        renderOrdersTable(ordersCache);

        // Render pagination after all numbers are set
        renderOrdersPaginationInfo();

      } catch (err) {
        console.error("Invalid JSON response:", text);
      }
    })
    .catch(err => {
      console.error("Load orders error:", err);
    });
}

function renderOrdersPaginationInfo() {
  const $btn = $("#ordersPageBtn");
  const $text = $("#ordersRangeText");

  if (!totalOrdersCount) {
    $text.text("");
    $btn.addClass("hidden");
    return;
  }

  const start = (currentOrdersPage - 1) * ORDERS_PER_PAGE + 1;
  const end = Math.min(currentOrdersPage * ORDERS_PER_PAGE, totalOrdersCount);

  $text.text(`${start} – ${end} of ${totalOrdersCount} records`);

  // If only one page, no button at all
  if (totalOrdersPages <= 1) {
    $btn.addClass("hidden");
    return;
  }

  $btn.removeClass("hidden");

  // If we are on last page, show PREV only
  if (currentOrdersPage >= totalOrdersPages) {
    $btn.html("&lt;");
    $btn.data("direction", "prev");
    return;
  }

  // Otherwise show NEXT
  $btn.html("&gt;");
  $btn.data("direction", "next");
}


$(document).on("click", "#ordersPageBtn", function () {
  const direction = $(this).data("direction");

  if (direction === "next") {
    if (currentOrdersPage < totalOrdersPages) {
      loadOrders(currentOrdersPage + 1);
    }
    return;
  }

  if (direction === "prev") {
    if (currentOrdersPage > 1) {
      loadOrders(currentOrdersPage - 1);
    }
  }
});


// ==============================
// CLEAR LOAN – BANK TRANSFER ONLY
// Paystack → Fund wallet silently → Poll backend → Clear loan → Success → Redirect
// ==============================

function getToken() {
  return sessionStorage.getItem("AUTH_TOKEN");
}
function showClearLoanOverlay() {
  
  $("#clearLoanOverlay").removeClass("hidden");
}

function hideClearLoanOverlay() {
  $("#clearLoanOverlay").addClass("hidden");
}
// ---------------- UI STATE ----------------
function showClearLoanWaiting() {
  setConfirmLoading(true);
  
}

function hideClearLoanWaiting() {
  setConfirmLoading(false);

}

function redirectToOrderDetails(orderId) {
  setTimeout(() => {
    hideClearLoanOverlay();
    history.pushState({}, "", `/account/orders/${orderId}`);
    renderRoute(`/account/orders/${orderId}`);
  }, 2000);
}
function toPaystackAmount(value) {
  const num = Number(value);

  if (isNaN(num) || num <= 0) {
    return null;
  }

  return Math.round(num * 100);
}

// ---------------- PAYSTACK ----------------
function startPaystackClearLoanBankTransfer(amount) {
  const email = API_USER?.email;

  if (!email) {
    showErrorToast("User email not found.");
    setConfirmLoading(false);
    return;
  }

  const paystackAmount = toPaystackAmount(amount);

  if (!paystackAmount) {
    showErrorToast("Invalid payment amount.");
    setConfirmLoading(false);
    return;
  }

  const handler = PaystackPop.setup({
    key: PAYSTACK_API_KEY,
    email: email,
    amount: paystackAmount, // ✅ FIX IS HERE
    currency: "NGN",
    channels: ["bank_transfer"],

    callback: function (response) {
      showClearLoanOverlay("Finalizing payment, please wait…");
      confirmClearLoanWalletFunding(response.reference);
    },

    onClose: function () {
      setConfirmLoading(false);
    }
  });

  handler.openIframe();
}

// ---------------- BACKEND WALLET BALANCE ----------------
function fetchWalletBalance(done) {
  const token = getToken();
  if (!token) return done(0);

  const formData = new FormData();
  formData.append("token", token);

  $.ajax({
    url: `${BASE_URL}/loadprofile`,
    type: "POST",
    headers: { Authorization: "Bearer " + token },
    data: formData,
    processData: false,
    contentType: false,
    success: function (res) {
      const balance = Number(
        res?.data?.wallet?.data?.wallet_balance ??
        res?.data?.wallet_balance ??
        0
      );
      done(balance);
    },
    error: function () {
      done(0);
    }
  });
}

// ---------------- FUND WALLET SILENTLY ----------------
function confirmClearLoanWalletFunding(payref) {
  const token = getToken();
  if (!token) {
    showErrorToast("Session expired.");
    return;
  }
   showClearLoanOverlay("Confirming payment, please wait…");
  fetchWalletBalance(function (oldBalance) {
    const formData = new FormData();
    formData.append("token", token);
    formData.append("payref", payref);

    $.ajax({
      url: `${BASE_URL}/addfundbytransfer_trans_ref`,
      type: "POST",
      headers: { Authorization: "Bearer " + token },
      data: formData,
      processData: false,
      contentType: false,

      success: function (res) {
        if (!res || res.status !== true) {
          showErrorToast("Wallet funding failed.");
          hideClearLoanWaiting();
          return;
        }

        pollUntilWalletUpdated(oldBalance);
      },

      error: function () {
        showErrorToast("Unable to confirm payment.");
        hideClearLoanWaiting();
      }
    });
  });
}

// ---------------- POLL UNTIL WALLET UPDATES ----------------
function pollUntilWalletUpdated(oldBalance) {
  let tries = 0;
  const maxTries = 20;

  const timer = setInterval(() => {
    tries++;

    fetchWalletBalance(function (newBalance) {
      if (Number(newBalance) !== Number(oldBalance)) {
        clearInterval(timer);
        showClearLoanOverlay("Finalizing payment. Please wait…");
        clearLoanFromWalletDirect();
        return;
      }

      if (tries >= maxTries) {
        clearInterval(timer);
        showErrorToast("Wallet update delayed. Please wait.");
        hideClearLoanWaiting();
      }
    });
  }, 1000);
}



// ---------------- CONFIRM BUTTON ----------------
$(document).on("click", "#confirmClearLoanBtn", function () {
  if (clearLoanState.debt <= 0) {
    showInlineError("Nothing to pay.");
    return;
  }

  // BANK TRANSFER
  if (clearLoanState.selectedMethod === "bank") {
  if (clearLoanState.mode === "repayment") {
    startPaystackRepaymentBankTransfer(clearLoanState.debt);
  } else {
    startPaystackClearLoanBankTransfer(clearLoanState.debt);
  }
  return;
}

  // WALLET
  if (clearLoanState.selectedMethod === "wallet") {
    if (clearLoanState.mode === "repayment") {
      payRepaymentFromWallet();
    } else {
      clearLoanFromWalletDirect();
    }
    return;
  }

  // CARD
  if (clearLoanState.selectedMethod === "card" && clearLoanState.selectedCardId) {
    if (clearLoanState.mode === "repayment") {
      payRepaymentWithExistingCard(clearLoanState.selectedCardId);
    } else {
      clearLoanWithExistingCard(clearLoanState.selectedCardId);
    }
    return;
  }

  showInlineError("Please select a payment method.");
});

// ==============================
// CLEAR LOAN – EXISTING CARD ONLY
// 
// ==============================

function clearLoanWithExistingCard(cardId) {
  const token = getToken();
  if (!token) {
    showErrorToast("Session expired.");
    return;
  }

  if (!cardId) {
    showErrorToast("Invalid card selected.");
    return;
  }

  showClearLoanWaiting();
  showClearLoanOverlay("Processing payment, please wait…");

  const formData = new FormData();
  formData.append("token", token);
  formData.append("order_id", clearLoanState.orderId);
  formData.append("payment_method_id", cardId);

  $.ajax({
    url: `${BASE_URL}/pay_order_loan`,
    type: "POST",
    headers: {
      Authorization: "Bearer " + token
    },
    data: formData,
    processData: false,
    contentType: false,

    success: function (res) {
      if (!res || res.status !== true) {
        hideClearLoanOverlay();
        hideClearLoanWaiting();
        showErrorModal(res?.message || "Payment failed.");
        return;
      }

      // success overlay
      showClearLoanOverlay("Payment successful. Redirecting…");

      setTimeout(() => {
        hideClearLoanOverlay();
        hideClearLoanWaiting();

        const orderId = clearLoanState.orderId;
        history.pushState({}, "", `/account/orders/${orderId}`);
        renderRoute(`/account/orders/${orderId}`);
      }, 1500);
    },

    error: function (xhr) {
  hideClearLoanOverlay();
  hideClearLoanWaiting();

  const backendMessage =
    xhr.responseJSON?.message?.message ||
    xhr.responseJSON?.message ||
    "Payment was not successful.";

  showErrorModal(backendMessage, "Payment Unsuccessful");
}
  });
}

// ==================================
// ===============CLEAR LOAN FROM WALLET==================
function clearLoanFromWalletDirect() {
  const token = getToken();

  if (!token) {
    showErrorToast("Session expired.");
    return;
  }

  if (!clearLoanState?.orderId) {
    showErrorToast("Invalid order.");
    return;
  }

  // UI
  showClearLoanWaiting();
  showClearLoanOverlay("Processing payment, please wait…");

  const formData = new FormData();
  formData.append("token", token);
  formData.append("order_id", clearLoanState.orderId);

  $.ajax({
    url: `${BASE_URL}/pay_order_loanv2`,
    type: "POST",
    headers: {
      Authorization: "Bearer " + token
    },
    data: formData,
    processData: false,
    contentType: false,

    success: function (res) {
      if (!res || res.status !== true) {
        hideClearLoanOverlay();
        hideClearLoanWaiting();
        showErrorToast(res?.message || "Wallet payment failed.");
        return;
      }

      // Stop loading state
hideClearLoanWaiting();
hideClearLoanOverlay();

// Show success modal
showSuccessModal("Your payment was successful.", function () {
  const orderId = clearLoanState.orderId;
  history.pushState({}, "", `/account/orders/${orderId}`);
  renderRoute(`/account/orders/${orderId}`);
});
    },

   error: function (xhr) {
  hideClearLoanOverlay();
  hideClearLoanWaiting();

  const backendMessage =
    xhr.responseJSON?.message?.message ||
    xhr.responseJSON?.message ||
    "Payment was not successful.";

  showErrorModal(backendMessage, "Payment Unsuccessful");
}
  });
}

function showErrorModal(message, title = "Payment Unsuccessful") {
  $("#feedbackIcon")
    .removeClass()
    .addClass("mx-auto mb-[12px] flex h-[48px] w-[48px] items-center justify-center rounded-full bg-red-100")
    .html(`<span class="text-red-600 text-[22px]">✕</span>`);

  $("#feedbackTitle").text(title);
  $("#feedbackMessage").text(message);

  $("#feedbackBtn")
    .removeClass()
    .addClass("w-full rounded-[8px] py-[10px] text-[14px] font-medium text-white bg-red-600")
    .text("OK");

  $("#feedbackModal").removeClass("hidden");

  $("#feedbackBtn").off("click").on("click", function () {
    $("#feedbackModal").addClass("hidden");
  });
}

function showSuccessModal(message, onClose) {
  $("#feedbackIcon")
    .removeClass()
    .addClass("mx-auto mb-[12px] flex h-[48px] w-[48px] items-center justify-center rounded-full bg-green-100")
    .html(`<span class="text-green-600 text-[22px]">✓</span>`);

  $("#feedbackTitle").text("Payment Successful");
  $("#feedbackMessage").text(message);

  $("#feedbackBtn")
    .removeClass()
    .addClass("w-full rounded-[8px] py-[10px] text-[14px] font-medium text-white bg-green-600")
    .text("OK");

  $("#feedbackModal").removeClass("hidden");

  setTimeout(() => {
    $("#feedbackModal").addClass("hidden");
    if (typeof onClose === "function") onClose();
  }, 1500);
}


// ================== PAY PER REPAYMENT =========================

// ================== REPAYMENT STATE ==================
// function startPaystackRepaymentBankTransfer(amount) {
//   const email = API_USER?.email;

//   if (!email) {
//     showErrorToast("User email not found.");
//     return;
//   }

//   const paystackAmount = toPaystackAmount(amount);
//   if (!paystackAmount) {
//     showErrorToast("Invalid payment amount.");
//     return;
//   }

//   const handler = PaystackPop.setup({
//     key: PAYSTACK_API_KEY,
//     email: email,
//     amount: paystackAmount,
//     currency: "NGN",
//     channels: ["bank_transfer"],

//     callback: function (response) {
//       showClearLoanOverlay("Confirming payment, please wait…");
//       confirmRepaymentWalletFunding(response.reference);
//     },

//     onClose: function () {
//       setConfirmLoading(false);
//     }
//   });

//   handler.openIframe();
// }

function startPaystackRepaymentBankTransfer(amount) {
  const email = API_USER?.email;

  if (!email) {
    showErrorToast("User email not found.");
    return;
  }

  // ✅ TEST ONLY: force ₦100
  const TEST_BANK_TRANSFER_AMOUNT = 100;
  const paystackAmount = TEST_BANK_TRANSFER_AMOUNT * 100; // kobo

  const handler = PaystackPop.setup({
    key: PAYSTACK_API_KEY,
    email: email,
    amount: paystackAmount,
    currency: "NGN",
    channels: ["bank_transfer"],

    callback: function (response) {
      showClearLoanOverlay("Confirming payment, please wait…");
      confirmRepaymentWalletFunding(response.reference);
    },

    onClose: function () {
      setConfirmLoading(false);
    }
  });

  handler.openIframe();
}
let repaymentState = {
  repaymentId: null,
  amount: 0
};
$(document).on("click", ".payInstallmentBtn", function () {
  if ($(this).is(":disabled")) return;

  const repaymentId = $(this).data("id");

  if (!repaymentId) {
    showToast("Invalid repayment selected", "error");
    return;
  }

  const path = `/loan-settlement/repayment/${repaymentId}`;
history.pushState({}, "", path);
renderRoute(path);
});



function loadRepaymentPage(repaymentId) {
  if (!repaymentId) return;

  repaymentState.repaymentId = repaymentId;

  // show SAME settlement UI
  $("#clearLoanContent").removeClass("hidden");

  // optional label change only
  $("#clearLoanTitle").text("Repayment Settlement");

  loadRepaymentIntoClearLoan(repaymentId);
}


function loadRepaymentDetails(repaymentId) {
  const token = getToken();

  const formData = new FormData();
  formData.append("token", token);
  formData.append("repayment_id", repaymentId);

  $.ajax({
    url: `${BASE_URL}/load_repayment_details`,
    type: "POST",
    headers: {
      Authorization: "Bearer " + token
    },
    data: formData,
    processData: false,
    contentType: false,
success: function (res) {
  if (!res || !res.status) {
    showErrorToast("Unable to load repayment");
    return;
  }

  const repayment = res?.data?.repayment?.[0];

  if (!repayment) {
    showErrorToast("Repayment record not found");
    return;
  }

  const amount = Number(repayment.amount_to_pay || 0);

  // store repayment state
  repaymentState.repaymentId = repayment.id;
  repaymentState.amount = amount;

  // update UI
  $("#clearLoanOrderId").text(
    `Installment ${repayment.period_number}`
  );

  $("#clearLoanAmount").text(formatMoney(amount));
  setConfirmBtn(amount);

  // enable confirm button
  $("#confirmClearLoanBtn").prop("disabled", false);
},

    error: function () {
      showToast("Failed to load repayment", "error");
    }
  });
}

function loadRepaymentIntoClearLoan(repaymentId) {
  clearLoanState.mode = "repayment";
  clearLoanState.repaymentId = repaymentId;
  clearLoanState.orderId = null;

  const token = getToken();
  const formData = new FormData();
  formData.append("token", token);
  formData.append("repayment_id", repaymentId);

  // reset UI
  setConfirmBtn(0);
  setConfirmLoading(false);
  

  Promise.all([
    // repayment details
    $.ajax({
      url: `${BASE_URL}/load_repayment_details`,
      type: "POST",
      headers: { Authorization: "Bearer " + token },
      data: formData,
      processData: false,
      contentType: false
    }),

    // profile (wallet + cards)
    $.ajax({
      url: `${BASE_URL}/loadprofile`,
      type: "POST",
      headers: { Authorization: "Bearer " + token },
      data: (() => {
        const f = new FormData();
        f.append("token", token);
        return f;
      })(),
      processData: false,
      contentType: false
    })
  ])
    .then(([repaymentRes, profileRes]) => {
  if (!repaymentRes || repaymentRes.status !== true) {
    showErrorToast("Unable to load repayment payment info.");
    return;
  }

  const repayment = repaymentRes?.data?.repayment?.[0];
  if (!repayment) {
    showErrorToast("Repayment record not found.");
    return;
  }

  const amount = Number(repayment.amount_to_pay || 0);

  clearLoanState.amount = amount;
  clearLoanState.debt = amount;

  // UI
  $("#clearLoanOrderId").text(`Installment ${repayment.period_number}`);
  $("#clearLoanAmount").text(formatMoney(amount));
  setConfirmBtn(amount);

  clearLoanState.walletBalance = Number(
    profileRes?.data?.wallet?.data?.wallet_balance ??
    profileRes?.data?.wallet_balance ??
    0
  );

  clearLoanState.cards = profileRes?.data?.payment_cards?.data || [];

  renderClearLoanOptions();

  if (amount <= 0) {
    $("#confirmClearLoanBtn").prop("disabled", true);
    $("#confirmClearLoanText").text("Already paid");
  } else {
    $("#confirmClearLoanBtn").prop("disabled", false);
  }

  console.log("REPAYMENT DETAILS:", repaymentRes.data);
})
    .catch(err => {
      console.error(err);
      showErrorToast("Unable to load repayment payment info.");
    });
}

function confirmRepaymentWalletFunding(payref) {
  const token = getToken();
  if (!token) {
    showErrorToast("Session expired.");
    return;
  }

  showClearLoanOverlay("Confirming payment, please wait…");

  fetchWalletBalance(function (oldBalance) {
    const formData = new FormData();
    formData.append("token", token);
    formData.append("payref", payref);

    $.ajax({
      url: `${BASE_URL}/addfundbytransfer_trans_ref`,
      type: "POST",
      headers: { Authorization: "Bearer " + token },
      data: formData,
      processData: false,
      contentType: false,

      success: function (res) {
        if (!res || res.status !== true) {
          showErrorToast("Wallet funding failed.");
          hideClearLoanWaiting();
          return;
        }

        pollUntilWalletUpdatedForRepayment(oldBalance);
      },

      error: function () {
        showErrorToast("Unable to confirm payment.");
        hideClearLoanWaiting();
      }
    });
  });
}


function pollUntilWalletUpdatedForRepayment(oldBalance) {
  let tries = 0;
  const maxTries = 20;

  const timer = setInterval(() => {
    tries++;

    fetchWalletBalance(function (newBalance) {
      if (Number(newBalance) !== Number(oldBalance)) {
        clearInterval(timer);
        showClearLoanOverlay("Finalizing payment. Please wait…");
        payRepaymentFromWallet();
        return;
      }

      if (tries >= maxTries) {
        clearInterval(timer);
        showErrorToast("Wallet update delayed. Please wait.");
        hideClearLoanWaiting();
      }
    });
  }, 1000);
}



function payRepaymentFromWallet() {
  const token = getToken();
  if (!token) {
    showErrorToast("Session expired.");
    return;
  }

  if (!clearLoanState.repaymentId) {
    showErrorToast("Invalid repayment.");
    return;
  }

  showClearLoanWaiting();
  showClearLoanOverlay("Processing payment, please wait…");

  const formData = new FormData();
  formData.append("token", token);
  formData.append("repayment_id", clearLoanState.repaymentId);

  $.ajax({
    url: `${BASE_URL}/pay_repaymentv2`,
    type: "POST",
    headers: { Authorization: "Bearer " + token },
    data: formData,
    processData: false,
    contentType: false,

    success: function (res) {
      if (!res || res.status !== true) {
        hideClearLoanOverlay();
        hideClearLoanWaiting();
        showErrorToast(res?.message || "Repayment failed.");
        return;
      }

      hideClearLoanWaiting();
hideClearLoanOverlay();

showSuccessModal("Your repayment was successful.", function () {
  history.back();
});
    },

    error: function (xhr) {
      hideClearLoanOverlay();
      hideClearLoanWaiting();

      const backendMessage =
        xhr.responseJSON?.message?.message ||
        xhr.responseJSON?.message ||
        "Payment was not successful.";

      showErrorModal(backendMessage, "Payment Unsuccessful");
    }
  });
}

function payRepaymentWithExistingCard(cardId) {
  const token = getToken();
  if (!token) {
    showErrorToast("Session expired.");
    return;
  }

  if (!cardId || !clearLoanState.repaymentId) {
    showErrorToast("Invalid repayment or card.");
    return;
  }

  showClearLoanWaiting();
  showClearLoanOverlay("Processing payment, please wait…");

  const formData = new FormData();
  formData.append("token", token);
  formData.append("repayment_id", clearLoanState.repaymentId);
  formData.append("payment_method_id", cardId);

  $.ajax({
    url: `${BASE_URL}/pay_repayment`,
    type: "POST",
    headers: { Authorization: "Bearer " + token },
    data: formData,
    processData: false,
    contentType: false,

    success: function (res) {
      if (!res || res.status !== true) {
        hideClearLoanOverlay();
        hideClearLoanWaiting();
        showErrorModal(res?.message || "Payment failed.");
        return;
      }

      showClearLoanOverlay("Payment successful. Redirecting…");

      setTimeout(() => {
        hideClearLoanOverlay();
        hideClearLoanWaiting();
        history.back();
      }, 1500);
    },

    error: function (xhr) {
      hideClearLoanOverlay();
      hideClearLoanWaiting();

      const backendMessage =
        xhr.responseJSON?.message?.message ||
        xhr.responseJSON?.message ||
        "Payment was not successful.";

      showErrorModal(backendMessage, "Payment Unsuccessful");
    }
  });
}


// =====================================================
// MAIN TAB SWITCHER (URL DRIVEN)
// =====================================================
function switchMainTab(tab) {
  // Hide all sections
  $("#accountContent,#walletContent,#loanCreditContent,#deliveryContent,#ordersContent,#orderDetailsContent,#loanPaymentPage")
    .addClass("hidden");

  // Reset tab styles
  $("#tab-account,#tab-wallet,#tab-loans,#tab-delivery,#tab-orders")
    .removeClass("bg-[#EAECF0]");

  // Show correct content
  if (tab === "account") $("#accountContent").removeClass("hidden");
  if (tab === "wallet") $("#walletContent").removeClass("hidden");
  if (tab === "loans") $("#loanCreditContent").removeClass("hidden");
  if (tab === "delivery") $("#deliveryContent").removeClass("hidden");
  if (tab === "orders") $("#ordersContent").removeClass("hidden");

  // Highlight active tab
  $("#tab-" + tab).addClass("bg-[#EAECF0]");
}
// =============================================
// WALLET PAGE SWITCHER
// ===========================================
function switchWalletPage(page) {
  $("#walletMainPage, #walletFundingPage").addClass("hidden");

  if (page === "main") {
    $("#walletMainPage").removeClass("hidden");
    loadProfileAndRefreshCards();
  }

  if (page === "fund") {
    $("#walletFundingPage").removeClass("hidden");
  }
}
// =====================================================
// GET TAB FROM URL
// =====================================================
function getTabFromURL() {
  const path = window.location.pathname;
// Loan settlement belongs to Orders tab
  if (path.startsWith("/loan-settlement/")) {
    return "orders";
  }
  // ORDERS (covers list, details, clear-loan)
  if (path.startsWith("/account/orders")) return "orders";

  // WALLET
  if (path === "/account/wallet") return "wallet";
  if (path === "/account/wallet/fund") return "wallet-fund";

  // OTHER TABS
  if (path === "/account/loans") return "loans";
  if (path === "/account/delivery") return "delivery";

  return "account";
}

// =====================================================
// INNER PROFILE TABS (UNCHANGED)
// =====================================================
function switchAccountInnerTab(key) {
  $(".account-inner-section").addClass("hidden");
  $(`[data-account-section='${key}']`).removeClass("hidden");

  $(".account-inner-tab")
    .removeClass("border-b-2 border-[#1570EF] text-[#1570EF]")
    .addClass("text-[#667085]");

  $(`[data-account-tab='${key}']`)
    .addClass("border-b-2 border-[#1570EF] text-[#1570EF]")
    .removeClass("text-[#667085]");
}

$("[data-account-tab]").on("click", function () {
  switchAccountInnerTab($(this).data("account-tab"));
});

// =====================================================
// ACCOUNT LOADER
// =====================================================
let accountLoaderStart = 0;

function showAccountLoader() {
  accountLoaderStart = Date.now();
  $("#accountPageLoader").removeClass("hidden");
  $("#accountPageContent").addClass("hidden");
}

function hideAccountLoader() {
  const MIN_TIME = 700;
  const elapsed = Date.now() - accountLoaderStart;
  const remaining = MIN_TIME - elapsed;

  const done = () => {
    $("#accountPageLoader").addClass("hidden");
    $("#accountPageContent").removeClass("hidden");
  };

  if (remaining > 0) {
    setTimeout(done, remaining);
  } else {
    done();
  }
}

window.addEventListener("popstate", function () {
  handleWalletFromURL();
});

document.querySelectorAll(".logoutBtn, #tab-logout").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    e.preventDefault();

    // Clear frontend token if you store any
    sessionStorage.removeItem("AUTH_TOKEN");

    // Go to backend logout route (clears cookie), then redirects to index.html
    window.location.href = "/logout";
  });
});


// =====================================================
// INIT
// =====================================================
$(document).ready(function () {
  showAccountLoader();

  fetchCurrentUser();

  const activeTab = getTabFromURL();

  if (activeTab === "wallet-fund") {
    // Show wallet tab
    switchMainTab("wallet");

    // Show funding page
    $("#walletMainPage").addClass("hidden");
    $("#walletFundingPage").removeClass("hidden");

    //  THIS IS THE FIX
    loadProfileAndRefreshCards();

  } else if (activeTab === "wallet") {
    switchMainTab("wallet");

    $("#walletFundingPage").addClass("hidden");
    $("#walletMainPage").removeClass("hidden");

  } else {
    switchMainTab(activeTab);
  }

  switchAccountInnerTab("profile");

  hideAccountLoader();
  renderRoute(window.location.pathname);
  window.onpopstate = function () {
    renderRoute(window.location.pathname);
  }
});