// =====================================================
// FaaDaaKaa ACCOUNT PAGE MASTER SCRIPT
// (Profile, Wallet, Loans/Credit, Delivery, OTP, BVN, Bank, Avatar)
// =====================================================

// -----------------------------------------------------
// GLOBAL STATE FOR EMAIL & PHONE OTP
// -----------------------------------------------------
let pendingEmail = null;
let pendingPhone = null;
let currentEmailOtp = null;
let currentPhoneOtp = null;

// Control default tab when coming from Cart
let stopDefaultLoad = false;

// -----------------------------------------------------
// SIMPLE OTP GENERATOR (6 DIGITS)
// -----------------------------------------------------
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// -----------------------------------------------------
// SIMPLE HASH (DEMO ONLY)
// -----------------------------------------------------
function simpleHash(str) {
  if (!str) return "";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return "h" + Math.abs(hash).toString(16);
}

// -----------------------------------------------------
// FORMAT NAIRA
// -----------------------------------------------------
function formatNaira(amount) {
  if (isNaN(amount)) amount = 0;
  return "₦" + Number(amount).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// -----------------------------------------------------
// USER HELPERS
// -----------------------------------------------------
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("faadaakaaUser"));
}

function saveCurrentUser(user) {
  localStorage.setItem("faadaakaaUser", JSON.stringify(user));
}

// -----------------------------------------------------
// SUCCESS TOAST
// -----------------------------------------------------
function showSuccessToast(message) {
  $("#toastSuccessMsg").text(message);
  $("#toastSuccess").removeClass("hidden").hide().fadeIn(200);
  setTimeout(() => $("#toastSuccess").fadeOut(300), 3500);
}
function showGreenToast(message) {
  const toast = document.createElement("div");
  toast.className =
    "fixed top-4 right-4 bg-[#12B76A] text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium z-[9999]";
  toast.innerText = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("opacity-0", "transition-all", "duration-500");
    setTimeout(() => toast.remove(), 500);
  }, 2000);
}
$("#toastSuccessClose").on("click", function () {
  $("#toastSuccess").fadeOut(200);
});

// -----------------------------------------------------
// ERROR POPUP
// -----------------------------------------------------
function showError(message) {
  const popup = $(`
    <div class="fixed top-4 right-4 bg-[#D92D20] text-white px-4 py-2 rounded-md shadow-md z-[9999]">
      ${message}
    </div>
  `);

  $("body").append(popup);
  setTimeout(() => popup.fadeOut(500, () => popup.remove()), 2000);
}

// -----------------------------------------------------
// UPDATE HEADER USER INFO
// -----------------------------------------------------
function updateHeaderUser(user) {
  const firstName = user?.firstName || "User";
  const lastName = user?.lastName || "";
  const initials =
    (firstName.charAt(0) || "U").toUpperCase() +
    (lastName.charAt(0) || "").toUpperCase();

  // Desktop header
  $("#userInitials").text(initials);
  $("#userGreeting").text(`Hi ${firstName}`);

  // Mobile header
  $("#mobileUserBadge").text(initials);
  $("#mobileUserName").text(`Hello, ${firstName}`);
}
document.addEventListener("DOMContentLoaded", function () {
  const $userInitials = $("#userInitials");
  const $userGreeting = $("#userGreeting");
  const $userIcon = $("#userDropdownIcon");
  const $userMenu = $("#userMenu");

  if (!$userMenu.length) {
    return;
  }

  // Hide menu initially if not already hidden
  if (!$userMenu.hasClass("hidden")) {
    $userMenu.addClass("hidden");
  }

  function toggleUserMenu(event) {
    event.stopPropagation();
    $userMenu.toggleClass("hidden");
  }

  // Open or close when user clicks any of these
  $userInitials.on("click", toggleUserMenu);
  $userGreeting.on("click", toggleUserMenu);
  $userIcon.on("click", toggleUserMenu);

  // Prevent click inside menu from closing it
  $userMenu.on("click", function (event) {
    event.stopPropagation();
  });

  // Click anywhere outside closes the menu
  $(document).on("click", function () {
    $userMenu.addClass("hidden");
  });
});
// -----------------------------------------------------
// POPULATE HEADER ON LOAD
// -----------------------------------------------------
function populateHeader() {
  let user = getCurrentUser();
  if (!user) return;
  updateHeaderUser(user);
}

// -----------------------------------------------------
// PROFILE SUMMARY + PROFILE FORM POPULATION
// -----------------------------------------------------
function populateAccountSummary(user) {
  if (!user) return;

  const { firstName, lastName, phone, email, avatar } = user;

  // FULL NAME
  const fullName =
    ((firstName || "") + " " + (lastName || "")).trim() || "User";

  $("#profileFullName").text(fullName);

  // AVATAR OR INITIALS
  if (avatar) {
    $("#avatarInner").css({
      "background-image": `url(${avatar})`,
      "background-size": "cover",
      "background-position": "center",
      "background-color": "transparent",
    });
    $("#avatarText").hide();
  } else {
    const initials =
      (firstName?.[0] || "U").toUpperCase() + (lastName?.[0] || "");
    $("#avatarInner").css({
      "background-image": "none",
      "background-color": "#E4E7EC",
    });
    $("#avatarText").text(initials).show();
  }

  // EMAIL + PHONE
  $("#profileEmailText").text(email || "No email added yet");
  $("#profilePhoneText").text(phone || "No phone number yet");
  $("#currentEmailDisplay").text(email || "No email added yet");
  $("#currentPhoneDisplay").text(phone || "No phone number yet");

  // MERGED ADDRESS + STATE
  let mergedAddress;
  if (!user.address && !user.state) {
    mergedAddress = "No address added yet";
  } else if (user.address && !user.state) {
    mergedAddress = user.address;
  } else if (!user.address && user.state) {
    mergedAddress = user.state;
  } else {
    mergedAddress = `${user.address}, ${user.state}`;
  }

  $("#profileAddressStateText").text(mergedAddress);

  // FORM FIELDS
  $("#profileAddressInput").val(user.address || "");
  $("#profileStateInput").val(user.state || "");
}

// -----------------------------------------------------
// MAIN ACCOUNT PAGE LOAD
// -----------------------------------------------------
function populateAccountPage() {
  let user = getCurrentUser();
  if (!user) return;

  user.walletBalance = Number(user.walletBalance || 0);
  saveCurrentUser(user);

  const formatted = formatNaira(user.walletBalance);
  $("#walletBalance").text(formatted);
  $("#mobileWalletBalance").text(formatted);

  updateHeaderUser(user);
  populateAccountSummary(user);

  if (user.password) {
    $("#currentPasswordInput").val(user.password);
  }
}

// -----------------------------------------------------
// PROFILE FORM SUBMIT (UPDATE PROFILE DETAILS)
// -----------------------------------------------------
$("#profileForm").on("submit", function (e) {
  e.preventDefault();

  let user = getCurrentUser();
  if (!user) return;

  user.address = $("#profileAddressInput").val().trim();
  user.state = $("#profileStateInput").val().trim();

  saveCurrentUser(user);

  populateAccountSummary(user);

  showSuccessToast("Profile updated successfully.");
});
// =====================================================
// =====================================================
// PASSWORD UPDATE LOGIC AND TOGGLES (FINAL COMBINED)
// =====================================================

// Handle password update
$("#passwordForm").on("submit", function (e) {
  e.preventDefault();

  let user = getCurrentUser();
  if (!user) return;

  const current = $("#currentPasswordInput").val().trim();
  const newPass = $("#newPasswordInput").val().trim();
  const confirmPass = $("#confirmPasswordInput").val().trim();

  if (!current || !newPass || !confirmPass) {
    showError("Please fill all password fields.");
    return;
  }

  if (current !== user.password) {
    showError("Current password is incorrect.");
    return;
  }

  if (newPass.length < 6) {
    showError("New password should be at least 6 characters.");
    return;
  }

  if (newPass !== confirmPass) {
    showError("New password and confirmation do not match.");
    return;
  }

  // Save new password
  user.password = newPass;
  saveCurrentUser(user);

  // Show new password inside the current password field
  $("#currentPasswordInput").val(newPass);

  // Update masked display if available
  if ($("#currentPasswordDisplay").length) {
    $("#currentPasswordDisplay").text("********");
  }

  // Clear these two only
  $("#newPasswordInput").val("");
  $("#confirmPasswordInput").val("");

  // Show toast
  showSuccessToast("Your password has been updated successfully!");
});

// =====================================================
// PASSWORD VISIBILITY TOGGLE FUNCTIONS
// =====================================================
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

// Toggle buttons
$("#currentPasswordIcon").on("click", function () {
  togglePassword("currentPasswordInput", "currentPasswordIcon");
});

$("#newPasswordIcon").on("click", function () {
  togglePassword("newPasswordInput", "newPasswordIcon");
});

$("#confirmPasswordIcon").on("click", function () {
  togglePassword("confirmPasswordInput", "confirmPasswordIcon");
});
// =====================================================
// UPDATE EMAIL WITH OTP
// =====================================================

$("#requestEmailOtpBtn").on("click", function () {
  const newEmail = $("#newEmailInput").val().trim();
  if (!newEmail || !newEmail.includes("@")) {
    showError("Enter a valid email address.");
    return;
  }

  pendingEmail = newEmail;
  currentEmailOtp = generateOtp();

  console.log("EMAIL OTP (demo):", currentEmailOtp);

  $("#emailOtpInput").val("");
  $("#emailOtpModal").removeClass("hidden").addClass("flex");
});

$("#cancelEmailOtp").on("click", function () {
  $("#emailOtpModal").addClass("hidden").removeClass("flex");
  $("#emailOtpInput").val("");
  pendingEmail = null;
  currentEmailOtp = null;
});

$("#verifyEmailOtp").on("click", function () {
  const entered = $("#emailOtpInput").val().trim();
  if (!entered) {
    showError("Enter the OTP.");
    return;
  }

  if (entered !== currentEmailOtp || !pendingEmail) {
    showError("Invalid OTP.");
    return;
  }

  let user = getCurrentUser();
  if (!user) user = {};

  user.email = pendingEmail;
  user.emailVerified = true;
  saveCurrentUser(user);

  pendingEmail = null;
  currentEmailOtp = null;

  $("#emailOtpModal").addClass("hidden").removeClass("flex");
  $("#emailOtpInput").val("");
  $("#newEmailInput").val("");

  populateAccountSummary(user);

  showSuccessToast("Your email has been verified successfully!");
});

// =====================================================
// UPDATE PHONE WITH OTP
// =====================================================

$("#requestPhoneOtpBtn").on("click", function () {
  const newPhone = $("#newPhoneInput").val().trim();
  if (!newPhone || newPhone.length < 11) {
    showError("Enter a valid 11-digit phone number.");
    return;
  }

  pendingPhone = newPhone;
  currentPhoneOtp = generateOtp();

  console.log("PHONE OTP (demo):", currentPhoneOtp);

  $("#phoneOtpInput").val("");
  $("#phoneOtpModal").removeClass("hidden").addClass("flex");
});

$("#cancelPhoneOtp").on("click", function () {
  $("#phoneOtpModal").addClass("hidden").removeClass("flex");
  $("#phoneOtpInput").val("");
  pendingPhone = null;
  currentPhoneOtp = null;
});

$("#verifyPhoneOtp").on("click", function () {
  const entered = $("#phoneOtpInput").val().trim();
  if (!entered) {
    showError("Enter the OTP.");
    return;
  }

  if (entered !== currentPhoneOtp || !pendingPhone) {
    showError("Invalid OTP.");
    return;
  }

  let user = getCurrentUser();
  if (!user) user = {};

  user.phone = pendingPhone;
  user.phoneVerified = true;
  saveCurrentUser(user);

  pendingPhone = null;
  currentPhoneOtp = null;

  $("#phoneOtpModal").addClass("hidden").removeClass("flex");
  $("#phoneOtpInput").val("");
  $("#newPhoneInput").val("");

  populateAccountSummary(user);

  showSuccessToast("Your phone number has been verified successfully!");
});

// =====================================================
// SIDEBAR TABS (LEFT) → SWITCH MAIN CONTENT
// =====================================================

// ===============================
// MAIN TAB SWITCH FUNCTION
// ===============================
function switchMainTab(tab) {
  // 1. Hide all main sections
  $("#accountContent, #walletContent, #loanCreditContent, #deliveryContent, #ordersContent, #orderDetailsContent, #loanPaymentPage")
    .addClass("hidden");

  // 2. Remove active background from all sidebar buttons
  $("#tab-account, #tab-wallet, #tab-loans, #tab-delivery, #tab-orders")
    .removeClass("bg-[#EAECF0]");

  // 3. Show the selected section
  if (tab === "account") {
    $("#accountContent").removeClass("hidden");
  } else if (tab === "wallet") {
    $("#walletContent").removeClass("hidden");
  } else if (tab === "loans") {
    $("#loanCreditContent").removeClass("hidden");
  } else if (tab === "delivery") {
    $("#deliveryContent").removeClass("hidden");
  } else if (tab === "orders") {
    $("#ordersContent").removeClass("hidden");
  }

  // 4. Add active background to the correct button
  $("#tab-" + tab).addClass("bg-[#EAECF0]");
}

// ===============================
// SIDEBAR CLICK HANDLERS
// ===============================
$("#tab-account").on("click", function () {
  switchMainTab("account");
});

$("#tab-wallet").on("click", function () {
  switchMainTab("wallet");
});

$("#tab-loans").on("click", function () {
  switchMainTab("loans");
});

$("#tab-delivery").on("click", function () {
  switchMainTab("delivery");
});

$("#tab-orders").on("click", function () {
  switchMainTab("orders");
});

// LOGOUT
$("#tab-logout").on("click", function () {
  localStorage.removeItem("faadaakaaLoggedIn");
  // localStorage.removeItem("faadaakaaUser"); // if you want
  window.location.href = "login.html";
});

// ===============================
// INITIAL TAB ON PAGE LOAD
// This runs after everything
// It checks URL: ?fromCart=1, ?tab=orders or ?show=orders
// ===============================
setTimeout(function () {
  const params = new URLSearchParams(window.location.search);

  const fromCart = params.get("fromCart");
  const orderId = params.get("order");
  const tabParam =
    params.get("tab") ||
    params.get("show") ||
    params.get("section");

  // If coming from Cart, force Orders and open details
  if (fromCart === "1") {
    stopDefaultLoad = true;

    // Hide all account sections except orders
    document.querySelectorAll(
      "#accountContent, #walletContent, #loanCreditContent, #deliveryContent"
    ).forEach(sec => sec.classList.add("hidden"));

    switchMainTab("orders");

    if (orderId) {
      setTimeout(() => {
        openOrderDetails(orderId);
      }, 300);
    }
    return;
  }

  // Normal deep links
  if (tabParam === "orders") {
    switchMainTab("orders");
    if (orderId) {
      setTimeout(() => {
        openOrderDetails(orderId);
      }, 300);
    }
  } else if (tabParam === "wallet") {
    switchMainTab("wallet");
  } else if (tabParam === "loans") {
    switchMainTab("loans");
  } else if (tabParam === "delivery") {
    switchMainTab("delivery");
  } else {
    // Default when there is no param and not blocked
    if (!stopDefaultLoad) {
      switchMainTab("account");
    }
  }
}, 0);

$("#tab-logout").on("click", () => {
  localStorage.removeItem("faadaakaaLoggedIn");
  // Keep user object if you want, or clear both:
  // localStorage.removeItem("faadaakaaUser");
  window.location.href = "login.html"; // change to "index.html" if you prefer
});

// =====================================================
// HEADER DROPDOWN MENU → TRIGGER SAME TABS
// =====================================================
if ($("#menuAccount").length) {
  $("#menuAccount").on("click", function () {
    switchMainTab("account");
    $("#userMenu").addClass("hidden");
  });
}

if ($("#menuWallet").length) {
  $("#menuWallet").on("click", function () {
    switchMainTab("wallet");
    $("#userMenu").addClass("hidden");
  });
}

if ($("#menuOrders").length) {
  $("#menuOrders").on("click", function () {
    switchMainTab("orders");
    $("#userMenu").addClass("hidden");
  });
}

// =====================================================
// INNER ACCOUNT TABS (PROFILE / PASSWORD / EMAIL / PHONE)
// =====================================================

function switchAccountInnerTab(key) {
  $(".account-inner-tab")
    .removeClass("border-b-2 border-[#1570EF] text-[#1570EF]")
    .addClass("text-[#667085]");
  $("[data-account-tab='" + key + "']")
    .addClass("border-b-2 border-[#1570EF] text-[#1570EF]")
    .removeClass("text-[#667085]");

  $(".account-inner-section").addClass("hidden");
  $("[data-account-section='" + key + "']").removeClass("hidden");
}

$("[data-account-tab]").on("click", function () {
  const key = $(this).data("account-tab");
  switchAccountInnerTab(key);
});

// =====================================================
// WALLET HELPERS + RENDER
// =====================================================

const PAYSTACK_PUBLIC_KEY = "pk_test_e8433bd39a6e59a8dc725c5b22325f078da31dd2"; // your test key

function updateWalletDisplays(user) {
  if (!user) return;
  const balance = Number(user.walletBalance || 0);
  const formatted = formatNaira(balance);
  $("#walletBalance").text(formatted);
  $("#mobileWalletBalance").text(formatted);
  $("#walletBalanceBox").text(formatted);
}

function renderWalletFromStorage() {
  const user = getCurrentUser();
  if (!user) return;

  user.walletBalance = Number(user.walletBalance || 0);
  user.cards = user.cards || [];
  saveCurrentUser(user);

  updateWalletDisplays(user);

  const $body = $("#walletCardsBody");
  if (!$body.length) return;

  if (!user.cards.length) {
    $body.html(`
      <div class="flex flex-col items-center justify-center text-center text-[14px] text-[#667085] min-h-[80px]">
        <i class="fa-regular fa-credit-card mb-[6px] text-[18px] text-[#98A2B3]"></i>
        <p>No payment cards added yet</p>
      </div>
    `);
    return;
  }

  let html = "";
  user.cards.forEach((card) => {
    const display = `**** **** **** ${card.last4} | ${card.type || "Debit Card"}`;
    html += `
      <div class="flex items-center justify-between border border-[#EAECF0] rounded-[8px] px-[12px] py-[8px] mb-[8px]">
        <div class="flex items-center gap-[8px]">
          <i class="fa-regular fa-credit-card text-[#667085]"></i>
          <span class="text-[13px] text-[#344054]">${display}</span>
        </div>
        <button class="wallet-delete-btn text-[12px] text-[#D92D20] hover:underline"
                data-id="${card.cardId}">
          Delete
        </button>
      </div>
    `;
  });
  $body.html(html);
}

// Delete card
$("#walletCardsBody").on("click", ".wallet-delete-btn", function () {
  const id = $(this).data("id");
  let user = getCurrentUser();
  if (!user || !user.cards) return;

  user.cards = user.cards.filter((c) => c.cardId !== id);
  saveCurrentUser(user);
  renderWalletFromStorage();
});

// =====================================================
// ADD NEW CARD FLOW (MODAL + PAYSTACK)
// =====================================================

$("#addCardBtn").on("click", function () {
  const user = getCurrentUser();
  if (!user) return;

  user.cards = user.cards || [];
  if (user.cards.length >= 3) {
    showSuccessToast("You can only save up to 3 payment cards.");
    return;
  }

  $("#cardChargeModal").removeClass("hidden");
});

$("#cardChargeCancelBtn").on("click", function () {
  $("#cardChargeModal").addClass("hidden");
});

$("#cardChargeYesBtn").on("click", function () {
  $("#cardChargeModal").addClass("hidden");
  openPaystackForNewCard();
});

function openPaystackForNewCard() {
  let user = getCurrentUser();
  if (!user) return;

  const email = user.email || "test@example.com";

  const handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: email,
    amount: 500, // ₦5 in kobo
    currency: "NGN",

    callback: function (response) {
      const last4 = String(Math.floor(1000 + Math.random() * 9000));

      const newCard = {
        last4: last4,
        type: "DEBIT CARD",
        cardId: "card_" + Date.now(),
      };

      let u = getCurrentUser();
      if (!u) return;

      u.cards = u.cards || [];
      u.cards.push(newCard);
      saveCurrentUser(u);

      renderWalletFromStorage();

      showSuccessToast("Payment card added successfully.");
    },

    onClose: function () {
      console.log("Payment popup closed");
    },
  });

  handler.openIframe();
}

// =====================================================
// FUND WALLET - SHOW FUNDING PAGE
// =====================================================

$("#fundWalletBtn").on("click", function () {
  showFundingPage();
});

function showFundingPage() {
  $("#walletMainPage").addClass("hidden");
  $("#walletFundingPage").removeClass("hidden");
  populateFundingCards();
}

// Go back
$("#walletFundingBackBtn").on("click", function () {
  showMainWallet();
});

function showMainWallet() {
  $("#walletFundingPage").addClass("hidden");
  $("#walletMainPage").removeClass("hidden");
}

// Show/hide cards based on method
$("input[name='fundMethod']").on("change", function () {
  if ($(this).val() === "card") {
    $("#fundingCardsWrapper").removeClass("hidden");
    populateFundingCards();
  } else {
    $("#fundingCardsWrapper").addClass("hidden");
  }
});

// Populate cards
function populateFundingCards() {
  const user = getCurrentUser();
  if (!user) return;

  const cards = user.cards || [];
  const container = $("#fundingCardsListPage");

  if (!cards.length) {
    container.html(`
      <p class="text-[13px] text-[#667085]">
        No payment card found. Please add a card first.
      </p>
    `);
    return;
  }

  let html = "";
  cards.forEach((card, index) => {
    html += `
      <label class="flex items-center gap-[8px] cursor-pointer text-[13px] text-[#344054]">
        <input type="radio" name="fundCardPage" value="${card.cardId}" ${
      index === 0 ? "checked" : ""
    }>
        **** **** **** ${card.last4} | ${card.type}
      </label>
    `;
  });

  container.html(html);
}

// Confirm & fund wallet
$("#fundWalletPagePayBtn").on("click", function () {
  const amount = Number($("#fundAmountInputPage").val());
  const method = $("input[name='fundMethod']:checked").val();

  if (amount < 100) {
    $("#fundAmountErrorPage").removeClass("hidden");
    return;
  }

  $("#fundAmountErrorPage").addClass("hidden");

  openPaystackForFunding(amount, method);
});

// Paystack for funding
function openPaystackForFunding(amount, method) {
  const user = getCurrentUser();
  if (!user) return;

  const email = user.email || "test@example.com";

  const channels = method === "bank" ? ["bank"] : ["card"];

  const handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: email,
    amount: amount * 100,
    currency: "NGN",
    channels: channels,

    callback: function (response) {
      let u = getCurrentUser();
      if (!u) return;

      const current = Number(u.walletBalance || 0);
      u.walletBalance = current + Number(amount);

      saveCurrentUser(u);

      updateWalletDisplays(u);
      renderWalletFromStorage();

      showSuccessToast("Your wallet has been funded successfully.");
      showMainWallet();
    },

    onClose: function () {
      console.log("Payment popup closed.");
    },
  });

  handler.openIframe();
}

// =====================================================
// LOANS & CREDITS: BVN VERIFICATION + BANK LINK (PER USER)
// =====================================================
// =====================================================
// FAKE BVN API FUNCTION, RETURNS REAL BVN DATA
// =====================================================
function fakeBvnApiLookup(bvn) {
  // This simulates a real server response
  // You can replace with your real API later
  return {
    fullName: "FISH PARKER JUICE",  // BVN full legal name
    phone: "09045562882"                 // BVN registered phone number
  };
}

// =====================================================
// BANK LIST
// =====================================================
const BANKS = [
  { name: "GTBank", account: "0149951600" },
  { name: "Zenith Bank", account: "2005689943" },
  { name: "First Bank", account: "3078895421" },
  { name: "UBA", account: "2088845573" },
  { name: "Access Bank", account: "0774550021" },
  { name: "Fidelity Bank", account: "5037781220" },
  { name: "FCMB", account: "3009911833" }
];

let generatedBvnOtp = null;

// =====================================================
// VERIFY BVN BUTTON CLICK
// =====================================================
$("#verifyBvnBtn").on("click", function () {
  const currentLabel = $("#verifyBvnBtn").text().trim();

  if (currentLabel === "Submit OTP") {
    submitBvnOtp();
    return;
  }

  const bvn = $("#bvnInput").val().trim();
  if (bvn.length !== 11) {
    $("#bvnError").removeClass("hidden");
    return;
  }

  $("#bvnError").addClass("hidden");

  $("#bvnFeeModal").removeClass("hidden").addClass("flex");
});

// =====================================================
// USER CONFIRMS ₦500 FEE
// =====================================================
$("#bvnConfirmYes").on("click", function () {
  $("#bvnFeeModal").addClass("hidden").removeClass("flex");

  let user = getCurrentUser();
  if (!user) {
    showError("Session expired. Please login again.");
    return;
  }

  let balance = Number(user.walletBalance || 0);
  if (balance < 500) {
    showGreenToast("Insufficient wallet balance. Please fund your wallet.");
    return;
  }

  balance -= 500;
  user.walletBalance = balance;
  saveCurrentUser(user);
  updateWalletDisplays(user);

  generatedBvnOtp = generateOtp();
  console.log("BVN OTP (demo):", generatedBvnOtp);

  $("#bvnOtpInput").removeClass("hidden").addClass("block");
  $("#verifyBvnBtn").text("Submit OTP");

  showGreenToast("₦500 deducted. OTP sent to your number.");
});

$("#bvnConfirmNo").on("click", function () {
  $("#bvnFeeModal").addClass("hidden").removeClass("flex");
});

// =====================================================
// SUBMIT BVN OTP
// =====================================================
function submitBvnOtp() {
  const otpEntered = $("#bvnOtpInput").val().trim();
  if (!otpEntered) {
    alert("Enter the OTP.");
    return;
  }

  if (otpEntered !== generatedBvnOtp) {
    alert("Invalid OTP.");
    return;
  }

  let user = getCurrentUser() || {};
  const bvn = $("#bvnInput").val().trim();
  const masked = "xxxxxxx" + bvn.slice(-4);

  // =====================================================
  // FETCH DATA FROM FAKE BVN API
  // =====================================================
  const bvnData = fakeBvnApiLookup(bvn);
  const apiFullName = bvnData.fullName;
  const apiPhone = bvnData.phone;

  // Save into user profile
  user.bvnVerified = true;
  user.maskedBvn = `BVN | ${masked}`;
  user.fullNameForBvn = apiFullName;
  user.phoneFromBvn = apiPhone;

  // Save both keys
  localStorage.setItem("faadaakaaUser", JSON.stringify(user));
  localStorage.setItem("faadaakaaActiveUser", JSON.stringify(user));

  // Update UI
  $("#verifiedFullName").text(apiFullName.toUpperCase());
  $("#verifiedBvnMasked").text(`BVN | ${masked}`);

  $("#bvnFormSection").addClass("hidden");
  $("#bvnVerifiedSection").removeClass("hidden");

  $("#accountVerifiedBadge").removeClass("hidden");

  showGreenToast("BVN verified successfully.");

  generatedBvnOtp = null;
  $("#bvnOtpInput").val("");
  $("#verifyBvnBtn").text("Verify BVN");

  loadIdentityStatus();

  // UPDATE PROFILE PAGE NAME + PHONE
  $("#profileFullName").text(apiFullName.toUpperCase());
  $("#profilePhoneText").text(apiPhone);
  // Replace profile name with BVN name
  user.firstName = fullName.split(" ")[0] || fullName;
  user.lastName = fullName.split(" ").slice(1).join(" ") || "";

  saveCurrentUser(user);

  renderLoanCreditPage();
}

function loadIdentityStatus() {
  const user = JSON.parse(localStorage.getItem("faadaakaaUser"));
  const badge = document.getElementById("accountVerifiedBadge");
  if (!badge || !user) return;

  if (user.bvnVerified === true) badge.classList.remove("hidden");
  else badge.classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", loadIdentityStatus);

// =====================================================
// BANK LINKING SYSTEM
// =====================================================
$("#linkBankBtn").on("click", function () {
  $("#bankLinkModal").removeClass("hidden").addClass("flex");
  renderBankOptions();
});

$("#closeBankModal").on("click", function () {
  $("#bankLinkModal").addClass("hidden");
});

function renderBankOptions() {
  const container = $("#bankList");
  container.empty();

  BANKS.forEach((b, index) => {
    container.append(`
      <button 
        class="w-full flex items-center justify-between border border-[#EAECF0] 
               rounded-[8px] px-[14px] py-[10px] hover:bg-[#F9FAFB]"
        data-id="${index}">
        <span class="text-[14px] font-medium text-[#344054]">${b.name}</span>
        <i class="fa-solid fa-chevron-right text-[#98A2B3]"></i>
      </button>
    `);
  });
}

$("#bankList").on("click", "button", function () {
  const index = $(this).data("id");
  const selected = BANKS[index];

  localStorage.setItem("faadaakaaTempBank", JSON.stringify(selected));

  $("#bankStepSelect").addClass("hidden");
  $("#bankStepLogin").removeClass("hidden");
});

$("#bankContinueToToken").on("click", function () {
  $("#bankStepLogin").addClass("hidden");
  $("#bankStepToken").removeClass("hidden");
});

// =====================================================
// TOKEN → FINISH LINKING BANK
// =====================================================
$("#bankFinishLink").on("click", function () {
  const temp = JSON.parse(localStorage.getItem("faadaakaaTempBank"));
  if (!temp) return;

  const finalData = {
    bankName: temp.name,
    accountNumber: temp.account,
    creditValue: 120000 + Math.floor(Math.random() * 8000),
    creditStatus: "ACTIVE"
  };

  let user = getCurrentUser() || {};
  user.bank = finalData;
  user.loans = {
    creditEligible: true,
    creditLimit: finalData.creditValue,
    creditStatus: "Active",
    activeLoan: false,
    loanHistory: []
  };

  saveCurrentUser(user);

  $("#bankLinkModal").addClass("hidden");

  // =====================================================
  // SHOW GREEN CHECKMARK BESIDE BANK ACCOUNT
  // =====================================================
  $("#bankCheckIcon").removeClass("hidden");

  updateCreditUI();
  renderLoanCreditPage();
});

// =====================================================
// UPDATE UI IN BVN VERIFIED SECTION
// =====================================================
function updateCreditUI() {
  const user = getCurrentUser();
  const data = user?.bank;
  if (!data) return;

  $("#linkBankBtn").hide();

  const html = `
    <p class="text-[14px]"><strong>Bank:</strong> ${data.bankName} (${data.accountNumber})</p>
    <p class="text-[14px] mt-[4px]"><strong>Credit Value:</strong> ₦${data.creditValue.toLocaleString()}</p>
    <p class="text-[14px] mt-[4px]"><strong>Credit Status:</strong> <span class="text-green-600">${data.creditStatus}</span></p>

    <button id="relinkBankBtn"
            class="mt-[12px] w-[160px] h-[40px] bg-[#1570EF] text-white rounded-[8px]">
      Re-link Bank Account
    </button>
  `;

  $("#bvnVerifiedSection .grid div:nth-child(2)").html(html);
}

// =====================================================
// MAIN LOAN PAGE LOGIC
// =====================================================
function renderLoanCreditPage() {
  const user = getCurrentUser() || {};

  const verified = !!user.bvnVerified;
  const bank = user.bank || null;
  const loans = user.loans || null;

  const maskedBvn = user.maskedBvn || "";
  const fullName =
    user.fullNameForBvn ||
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    "User";

  // FULL DASHBOARD
  if (verified && bank) {
    $("#bvnFormSection").addClass("hidden");
    $("#bvnVerifiedSection").addClass("hidden");
    $("#loanDashboardSection").removeClass("hidden");

    $("#dashBankName").text(bank.bankName);
    $("#dashBankAccount").text(bank.accountNumber);
    $("#dashCreditValue").text("₦" + bank.creditValue.toLocaleString());
    $("#dashAvailableCredit").text("₦" + bank.creditValue.toLocaleString());
    $("#dashCreditStatus").text(loans?.creditStatus || "ACTIVE");
    $("#dashBvnMasked").text(maskedBvn);
    $("#dashFullName").text(fullName.toUpperCase());

    // restore checkmark
    $("#bankCheckIcon").removeClass("hidden");

    return;
  }

  // STAGE 2: BVN VERIFIED BUT NO BANK
  if (verified && !bank) {
    $("#bvnFormSection").addClass("hidden");
    $("#bvnVerifiedSection").removeClass("hidden");
    $("#loanDashboardSection").addClass("hidden");

    $("#verifiedFullName").text(fullName.toUpperCase());
    $("#verifiedBvnMasked").text(maskedBvn);

    return;
  }

  // STAGE 1: NEW USER
  $("#bvnFormSection").removeClass("hidden");
  $("#bvnVerifiedSection").addClass("hidden");
  $("#loanDashboardSection").addClass("hidden");
}

// =====================================================
// DELIVERY ADDRESSES (PER USER, SEPARATE FROM PROFILE ADDRESS)
// =====================================================

let addresses = [];
let editingIndex = null;

// Load addresses from current user
function loadAddresses() {
  const user = getCurrentUser();
  addresses = user?.addresses || [];
}

// Save addresses back into current user
function saveAddresses() {
  const user = getCurrentUser();
  if (!user) return;
  user.addresses = addresses;
  saveCurrentUser(user);
}

// =========================
// RENDER SAVED ADDRESSES
// =========================
function renderAddresses() {
  const container = $("#savedAddressesContainer");
  container.empty();

  if (!addresses.length) {
    container.addClass("hidden");
    return;
  }

  container.removeClass("hidden");

  addresses.forEach((addr, index) => {
    const isDefault = addr.isDefault;

    const borderColor = isDefault ? "#1570EF" : "#D0D5DD";
    const borderBottom = isDefault ? "4px" : "1px";
    const borderRight = isDefault ? "4px" : "1px";

    const card = $(`
      <div 
        class="relative w-full rounded-[8px] p-[16px] bg-[#F9FAFB]
               flex justify-between items-start cursor-pointer"
        data-id="${index}"
        style="
          border: 1px solid ${borderColor};
          border-bottom-width: ${borderBottom};
          border-right-width: ${borderRight};
        "
      >

        <!-- LEFT SIDE CONTENT -->
        <div class="flex flex-col text-[14px] leading-[20px] 
                    ${isDefault ? 'text-[#1570EF]' : 'text-[#344054]'}">

          <span class="font-semibold flex gap-1 items-center">
            ${addr.fullName} | ${addr.phone}
            ${isDefault ? "<span class='text-green-600 text-[12px]'>(Default)</span>" : ""}
          </span>

          <span>${addr.address}</span>
          <span>${addr.state}</span>
        </div>

        <!-- RIGHT SIDE ACTION BUTTONS -->
        <div class="flex flex-col items-end gap-[8px] text-[14px]">

          <!-- EDIT -->
          <button class="edit-btn" data-id="${index}" title="Edit">
            <i class="fa-regular fa-pen-to-square text-blue-600 text-[16px]"></i>
          </button>

          <!-- DELETE -->
          <button class="delete-btn" data-id="${index}" title="Delete">
            <i class="fa-regular fa-trash-can text-red-500 text-[16px]"></i>
          </button>

          <!-- SET AS DEFAULT (TEXT) ONLY FOR NON-DEFAULT -->
          ${
            !isDefault
              ? `<button 
                   class="default-btn text-[#1570EF] text-[13px] underline mt-[8px]"
                   data-id="${index}">
                   Set as Active Address
                 </button>`
              : ""
          }
        </div>

        <!-- SMALL CHECKMARK ONLY FOR DEFAULT -->
        ${
          isDefault
            ? `<div class="absolute bottom-[6px] right-[6px]">
                 <i class="fa-solid fa-check text-green-600 text-[14px]"></i>
               </div>`
            : ""
        }

      </div>
    `);

    container.append(card);
  });
}

// =========================
// ADD NEW ADDRESS
// =========================
$("#deliveryForm").on("submit", function(e) {
  e.preventDefault();

  if (addresses.length >= 3) {
    showToast("Maximum of 3 saved addresses allowed.");
    return;
  }

  const fullName = $("#deliveryFullName").val().trim();
  const phone = $("#deliveryPhone").val().trim();
  const address = $("#deliveryAddress").val().trim();
  const state = $("#deliveryState").val().trim();

  if (!fullName || !phone || phone.length !== 11 || !address || !state) {
    showToast("Fill all fields correctly.");
    return;
  }

  const newAddress = {
    fullName,
    phone,
    address,
    state,
    isDefault: addresses.length === 0 // FIRST address becomes default
  };

  addresses.push(newAddress);
  saveAddresses();
  renderAddresses();
  this.reset();

  showToast("Address added successfully.");
});

// =========================
// DELETE ADDRESS
// =========================
$(document).on("click", ".delete-btn", function() {
  const index = $(this).data("id");

  addresses.splice(index, 1);

  // Reset default if removed
  if (!addresses.some(a => a.isDefault) && addresses.length > 0) {
    addresses[0].isDefault = true;
  }

  saveAddresses();
  renderAddresses();

  showToast("Address deleted.");
});

// =========================SET DEFAULT ADDRESS
// =========================
$(document).on("click", ".default-btn", function() {
  const index = $(this).data("id");

  addresses.forEach(a => a.isDefault = false);
  addresses[index].isDefault = true;

  saveAddresses();
  renderAddresses();

  showToast("Default address updated.");
});

// =========================
// OPEN EDIT MODAL
// =========================
$(document).on("click", ".edit-btn", function() {
  editingIndex = $(this).data("id");
  const a = addresses[editingIndex];

  $("#editFullName").val(a.fullName);
  $("#editPhone").val(a.phone);
  $("#editAddress").val(a.address);
  $("#editState").val(a.state);

  $("#editModal").removeClass("hidden");
});

// CLOSE MODAL
$("#closeEditModal").on("click", function() {
  $("#editModal").addClass("hidden");
});

// SAVE EDIT
$("#saveEditModal").on("click", function() {
  const fullName = $("#editFullName").val().trim();
  const phone = $("#editPhone").val().trim();
  const address = $("#editAddress").val().trim();
  const state = $("#editState").val();

  if (!fullName || !phone || phone.length !== 11 || !address || !state) {
    showToast("Fill all fields correctly.");
    return;
  }

  addresses[editingIndex] = { 
    ...addresses[editingIndex],
    fullName,
    phone,
    address,
    state
  };

  saveAddresses();
  $("#editModal").addClass("hidden");

  renderAddresses();
  showToast("Address updated.");
});

// =========================
// EXPORT DEFAULT ADDRESS (if needed elsewhere)
// =========================
function getDefaultAddress() {
  return addresses.find(a => a.isDefault) || null;
}

$(document).ready(function () {
  populateHeader();
  populateAccountPage();

  // Default tab: Account → Profile inner tab
  if (!stopDefaultLoad) {
    switchMainTab("account");
  }
  switchAccountInnerTab("profile");

  // Wallet / Loans / Delivery initialisation
  renderWalletFromStorage();
  updateCreditUI();        // uses user.bank
  renderLoanCreditPage();  // applies 3-stage logic

  loadAddresses();         // load from user
  renderAddresses();
});

// Small helper to format naira the same way everywhere
function formatNaira(amount) {
  return "₦" + Number(amount || 0).toLocaleString();
}

// Keep a global context for the loan payment modal
let currentLoanContext = null;

// ======================================================
// LOAD ORDERS FOR USER (OUTRIGHT = PAID, INSTALLMENT = OUTSTANDING AMOUNT)
// ======================================================
function loadOrdersForUser() {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];

  const totalOrdersEl = document.getElementById("totalOrders");
  const totalValueEl = document.getElementById("totalOrderValue");
  const outstandingLoanEl = document.getElementById("outstandingLoan");
  const tableBody = document.getElementById("ordersTableBody");
  const emptyMsg = document.getElementById("ordersEmpty");

  if (!totalOrdersEl || !tableBody) return;

  if (orders.length === 0) {
    emptyMsg.classList.remove("hidden");
    tableBody.innerHTML = "";
    totalOrdersEl.textContent = "0";
    totalValueEl.textContent = "₦0.00";
    outstandingLoanEl.textContent = "₦0.00";
    return;
  }

  emptyMsg.classList.add("hidden");

  // Summary
  const totalOrders = orders.length;
  const totalValue = orders.reduce((sum, o) => sum + o.item.total, 0);

  const outstanding = orders.reduce((sum, o) => {
    return sum + (o.paymentMethod === "Wallet" ? 0 : Number(o.outstandingAmount || 0));
  }, 0);

  totalOrdersEl.textContent = totalOrders;
  totalValueEl.textContent = formatNaira(totalValue);
  outstandingLoanEl.textContent = formatNaira(outstanding);

  // Build table rows
  let rows = "";

  orders.forEach(order => {
    const purchaseType = order.paymentMethod === "Wallet" ? "Outright" : "Installment";

    // Outstanding color logic
    let outstandingDisplay;
    let outstandingColorClass;

    if (order.paymentMethod === "Wallet" || Number(order.outstandingAmount) <= 0) {
      outstandingDisplay = "Paid";
      outstandingColorClass = "text-green-600 font-semibold";
    } else {
      outstandingDisplay = formatNaira(order.outstandingAmount || 0);
      outstandingColorClass = "text-[#D92D20] font-semibold"; // red
    }

    rows += `
      <tr class="border-b border-[#EAECF0]">
        <td class="py-[10px]">${order.date}</td>
        <td class="py-[10px]">#${order.orderNumber}</td>
        <td class="py-[10px]">${formatNaira(order.item.total)}</td>
        <td class="py-[10px]">${formatNaira(order.walletUsed)}</td>
        <td class="py-[10px]">${purchaseType}</td>

        <td class="py-[10px] ${outstandingColorClass}">
          ${outstandingDisplay}
        </td>

        <td class="py-[10px] text-[#1570EF] cursor-pointer"
            onclick="openOrderDetails(${order.orderNumber})">
          Order Details
        </td>
      </tr>
    `;
  });

  tableBody.innerHTML = rows;
}

// ======================================================
// OPEN ORDER DETAILS PAGE
// ======================================================
function openOrderDetails(orderId) {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const order = orders.find(o => o.orderNumber == orderId);
  if (!order) return;

  // Show / hide main sections
  document.getElementById("ordersContent").classList.add("hidden");
  document.getElementById("orderDetailsContent").classList.remove("hidden");

  // Back button
  document.getElementById("backToOrdersBtn").onclick = () => {
    document.getElementById("orderDetailsContent").classList.add("hidden");
    document.getElementById("ordersContent").classList.remove("hidden");
    currentLoanContext = null;
  };

  // Main order details
  document.getElementById("detailOrderId").textContent = "#" + order.orderNumber;
  document.getElementById("detailOrderDate").textContent = order.date;
  document.getElementById("detailOrderValue").textContent =
    formatNaira(order.item.total);

  // Outstanding logic for detail view
  const outstandingEl = document.getElementById("detailOutstanding");
  const clearLoanBtn = document.getElementById("clearLoanBtn");
  const repaymentSection = document.getElementById("repaymentSection");

  const isOutright = order.paymentMethod === "Wallet";
  const outAmount = Number(order.outstandingAmount || 0);

  if (isOutright || outAmount <= 0) {
    outstandingEl.textContent = "Paid";
    outstandingEl.classList.remove("text-[#D92D20]");
    outstandingEl.classList.add("text-green-600", "font-semibold");
    clearLoanBtn.classList.add("hidden");
    repaymentSection.classList.add("hidden");
  } else {
    outstandingEl.textContent = formatNaira(outAmount);
    outstandingEl.classList.remove("text-green-600");
    outstandingEl.classList.add("text-[#D92D20]", "font-semibold");
    clearLoanBtn.classList.remove("hidden");
    repaymentSection.classList.remove("hidden");

    clearLoanBtn.onclick = function () {
      if (!order.outstandingAmount || order.outstandingAmount <= 0) return;
      currentLoanContext = {
        orderNumber: order.orderNumber,
        mode: "clearAll",
        repaymentIndex: null,
        amount: Number(order.outstandingAmount || 0)
      };
      openLoanPaymentPage(currentLoanContext);
    };

    // Repayment schedule must also load
    renderRepaymentSchedule(order);
  }

  // Item details
  document.getElementById("detailItemName").textContent = order.item.name;
  document.getElementById("detailItemQty").textContent = "Qty: " + order.item.qty;
  document.getElementById("detailItemQtyRight").textContent = order.item.qty;
  document.getElementById("detailItemPrice").textContent =
    formatNaira(order.item.total);

  if (document.getElementById("detailItemImage")) {
    document.getElementById("detailItemImage").src =
      order.item.image || "/assets/images/iphone16plus.jpg";
  }

  // Payment details
  document.getElementById("detailPayAmount").textContent =
    formatNaira(order.item.total);
  document.getElementById("detailPaid").textContent =
    formatNaira(order.walletUsed);
  document.getElementById("detailMethod").textContent = order.paymentMethod;
  document.getElementById("detailType").textContent =
    isOutright ? "Outright" : "Installment";

  // Delivery from default address
  const defaultAddress =
    JSON.parse(localStorage.getItem("faadaakaaUser"))?.addresses?.find(
      a => a.isDefault
    );

  if (defaultAddress) {
    document.getElementById("deliveryName").textContent = defaultAddress.fullName;
    document.getElementById("deliveryPhone").textContent = defaultAddress.phone;
    document.getElementById("deliveryAddress").textContent = defaultAddress.address;
    document.getElementById("deliveryState").textContent = defaultAddress.state;
  } else {
    document.getElementById("deliveryName").textContent = "No default address";
    document.getElementById("deliveryPhone").textContent = "-";
    document.getElementById("deliveryAddress").textContent = "-";
    document.getElementById("deliveryState").textContent = "-";
  }

  // PAY ALL REPAYMENTS BUTTON
  const payAllBtn = document.getElementById("payAllRepaymentsBtn");
  if (payAllBtn) {
    payAllBtn.onclick = function () {
      const outstanding = Number(order.outstandingAmount || 0);
      if (!outstanding) return;

      currentLoanContext = {
        orderNumber: order.orderNumber,
        mode: "clearAll",
        repaymentIndex: null,
        amount: outstanding
      };

      openLoanPaymentPage(currentLoanContext);
    };
  }
}

// ======================================================
// RENDER REPAYMENT SCHEDULE TABLE
// ======================================================
function renderRepaymentSchedule(order) {
  const tbody = document.getElementById("repaymentTableBody");
  if (!tbody) return;

  const repayments = order.repayments || [];

  if (!repayments.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="px-[12px] py-[10px] text-[13px] text-[#667085]">
          No repayment schedule found for this order.
        </td>
      </tr>
    `;
    return;
  }

  let rows = "";
  let firstUnpaidFound = false;

  repayments.forEach((rep, index) => {
    const isPaid = rep.status === "Paid";

    const statusHtml = isPaid
      ? `<span class="text-[#12B76A] font-medium">Paid</span>`
      : `<span class="text-[#B42318] font-medium">Unpaid</span>`;

    // Only the FIRST unpaid repayment is active
    let actionHtml = "";

    if (isPaid) {
      actionHtml = `<span class="text-[12px] text-[#98A2B3]">Completed</span>`;
    } else {
      if (!firstUnpaidFound) {
        // First unpaid one is active
        actionHtml = `
          <button 
            class="text-[13px] text-[#1570EF] underline"
            onclick="handlePaySingleRepayment(${order.orderNumber}, ${index})">
            Pay now
          </button>`;
        firstUnpaidFound = true;
      } else {
        // Other unpaid ones are disabled
        actionHtml = `
          <button 
            class="text-[13px] text-[#98A2B3] underline cursor-not-allowed"
            disabled>
            Pay now
          </button>`;
      }
    }

    rows += `
      <tr class="border-t border-[#EAECF0]">
        <td class="px-[12px] py-[8px]">${rep.sn}</td>
        <td class="px-[12px] py-[8px]">${formatNaira(rep.amount)}</td>
        <td class="px-[12px] py-[8px]">${rep.dueDate}</td>
        <td class="px-[12px] py-[8px]">${rep.paidOn || "Not set"}</td>
        <td class="px-[12px] py-[8px]">${statusHtml}</td>
        <td class="px-[12px] py-[8px] text-right">${actionHtml}</td>
      </tr>
    `;
  });

  tbody.innerHTML = rows;
}
window.renderRepaymentSchedule = renderRepaymentSchedule;

// ======================================================
// HANDLE PAY NOW FOR A SINGLE REPAYMENT
// ======================================================
function handlePaySingleRepayment(orderNumber, index) {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const order = orders.find(o => o.orderNumber == orderNumber);
  if (!order || !order.repayments || !order.repayments[index]) return;

  const rep = order.repayments[index];
  if (rep.status === "Paid") return;

  currentLoanContext = {
    orderNumber,
    mode: "single",
    repaymentIndex: index,
    amount: Number(rep.amount || 0)
  };

  openLoanPaymentPage(currentLoanContext);
}
window.handlePaySingleRepayment = handlePaySingleRepayment;

// ======================================================
// CLEAR THIS LOAN NOW BUTTON
// ======================================================
window.attachClearLoanAction = function(order) {
  const clearLoanBtn = document.getElementById("clearLoanBtn");
  if (!clearLoanBtn) return;

  if (order.paymentMethod === "Installment") {
    clearLoanBtn.classList.remove("hidden");

    clearLoanBtn.onclick = function () {
      currentLoanContext = {
        orderNumber: order.orderNumber,
        mode: "clearAll",
        repaymentIndex: null,
        amount: Number(order.outstandingAmount || 0)
      };

      openLoanPaymentPage(currentLoanContext);
    };
  } else {
    clearLoanBtn.classList.add("hidden");
  }
};

// ======================================================
// FULL PAGE LOAN PAYMENT PAGE
// ======================================================
function openLoanPaymentPage(context) {
  currentLoanContext = context;
  if (!context) return;

  // Hide order details
  document.getElementById("orderDetailsContent")?.classList.add("hidden");

  // Show full payment page
  const page = document.getElementById("loanPaymentPage");
  if (page) page.classList.remove("hidden");

  // Fill values
  document.getElementById("loanPaymentOrderId").textContent =
    "#" + context.orderNumber;

  document.getElementById("loanPaymentAmount").textContent =
    formatNaira(context.amount);

  // Wallet
  const user = JSON.parse(localStorage.getItem("faadaakaaUser")) || {};
  document.getElementById("loanWalletBalance").textContent =
    formatNaira(Number(user.walletBalance || 0));
}
window.openLoanPaymentPage = openLoanPaymentPage;

// ======================================================
// BACK BUTTON
// ======================================================
document.getElementById("loanPaymentBackBtn")?.addEventListener("click", () => {
  document.getElementById("loanPaymentPage")?.classList.add("hidden");
  document.getElementById("orderDetailsContent")?.classList.remove("hidden");
  currentLoanContext = null;
});

// ======================================================
// CONFIRM PAYMENT
// ======================================================
document.getElementById("loanPaymentConfirmBtn")?.addEventListener("click", () => {
  if (!currentLoanContext) return;

  const methodInput = document.querySelector("input[name='loanPayMethod']:checked");
  const method = methodInput ? methodInput.value : null;

  if (!method) {
    alert("Please select a payment method.");
    return;
  }

  let orders = JSON.parse(localStorage.getItem("orders")) || [];
  let order = orders.find(o => o.orderNumber == currentLoanContext.orderNumber);

  let user = JSON.parse(localStorage.getItem("faadaakaaUser")) || {};
  let walletBalance = Number(user.walletBalance || 0);
  let email = user.email || "test@example.com";
  let amount = Number(currentLoanContext.amount);

  // WALLET PAYMENT
  if (method === "wallet") {
    if (walletBalance < amount) {
      alert("Insufficient wallet balance.");
      return;
    }

    user.walletBalance = walletBalance - amount;
    localStorage.setItem("faadaakaaUser", JSON.stringify(user));

    if (typeof updateWalletDisplays === "function") {
      updateWalletDisplays(user);
    }

    markLoanPaid(order, orders);
    return;
  }

  // PAYSTACK (CARD OR BANK)
  const channels = method === "bank" ? ["bank"] : ["card"];

  const handler = PaystackPop.setup({
    key: "pk_test_e8433bd39a6e59a8dc725c5b22325f078da31dd2",
    email: email,
    amount: amount * 100,
    currency: "NGN",
    channels: channels,

    callback: function(response) {
      // PAYMENT SUCCESSFUL
      markLoanPaid(order, orders);
      alert("Payment successful");
    },

    onClose: function() {
      alert("Payment window closed.");
    }
  });

  handler.openIframe();
});

// ========================================================
// UPDATE LOAN STATUS AFTER PAYMENT
// ========================================================
function markLoanPaid(order, orders) {
  const today = new Date().toDateString();

  if (currentLoanContext.mode === "clearAll") {
    order.repayments = order.repayments.map(rep => ({
      ...rep,
      status: "Paid",
      paidOn: today
    }));
    order.outstandingAmount = 0;
  }

  if (currentLoanContext.mode === "single") {
    const idx = currentLoanContext.repaymentIndex;
    const rep = order.repayments[idx];

    rep.status = "Paid";
    rep.paidOn = today;

    let newBalance = Number(order.outstandingAmount) - Number(rep.amount);
    order.outstandingAmount = newBalance < 0 ? 0 : newBalance;
  }

  localStorage.setItem("orders", JSON.stringify(orders));

  document.getElementById("loanPaymentPage").classList.add("hidden");
  openOrderDetails(order.orderNumber);
  loadOrdersForUser();

  currentLoanContext = null;
}

// Load orders on script load
loadOrdersForUser();

// Trigger load when Orders tab is opened
document.getElementById("tab-orders")?.addEventListener("click", loadOrdersForUser);

// logout functionality
$("#tab-logout").on("click", () => {
  // Remove all user session data
  localStorage.removeItem("faadaakaaLoggedIn");
  localStorage.removeItem("faadaakaaUser");
  localStorage.removeItem("faadaakaaActiveUser");

  // Redirect to homepage
  window.location.href = "index.html";
});