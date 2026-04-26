// ===========================
// PASSWORD TOGGLE
// ===========================
$("#togglePassword").on("click", function () {
  const input = $("#passwordInput");
  const type = input.attr("type") === "password" ? "text" : "password";
  input.attr("type", type);
  $(this).toggleClass("fa-eye fa-eye-slash");
});

// ===========================
// BUTTON LOADER HELPERS
// ===========================
function startBtnLoading($btn) {
  $btn.prop("disabled", true);
  $btn.find(".btn-text").text("Logging in");
  $btn.find(".btn-spinner").removeClass("hidden");
}

function stopBtnLoading($btn) {
  $btn.prop("disabled", false);
  $btn.find(".btn-text").text("Login");
  $btn.find(".btn-spinner").addClass("hidden");
}

// ===========================
// LOGIN FUNCTION
// ===========================
$("#loginBtn").on("click", function () {
  const $btn = $("#loginBtn");
  const phone = $("#mobileInput").val().trim();
  const password = $("#passwordInput").val().trim();

  if (phone.length !== 11 || !$.isNumeric(phone)) {
    showError("Mobile number must be exactly 11 digits");
    return;
  }

  if (!password) {
    showError("Password is required");
    return;
  }

  startBtnLoading($btn);

  $.ajax({
    url: "https://api.faadaakaa.com/api/loginv3",
    method: "POST",
    data: { phone, password },

    success: function (res) {
      if (!res.status || !res.data || !res.data.token) {
        stopBtnLoading($btn);
        showError("Invalid login response");
        return;
      }

      sessionStorage.setItem("AUTH_TOKEN", res.data.token);
      showSuccess("Login successful");

      const redirectUrl = sessionStorage.getItem("REDIRECT_AFTER_LOGIN");

      setTimeout(function () {
        if (redirectUrl) {
          sessionStorage.removeItem("REDIRECT_AFTER_LOGIN");
          window.location.href = redirectUrl;
        } else {
          window.location.href = "/dashboard";
        }
      }, 800);
    },

    error: function (xhr) {
      stopBtnLoading($btn);

      if (xhr.responseJSON) {
        handleLoginError(xhr.responseJSON);
      } else {
        showError("Unable to login. Please check your connection.");
      }
    }
  });
});

// ===========================
// ERROR HANDLER
// ===========================
function handleLoginError(res) {

  // PHONE NOT VERIFIED
  if (
    res.key === "phone_not_verified" ||
    res.message?.toLowerCase().includes("not yet verified")
  ) {

    const emailString =
      res.data?.email_string || res.email_string || null;

    if (!emailString) {
      showError("Verification required, but reference is missing.");
      return;
    }

    // IMPORTANT: do NOT show toast here
    showPhoneNotVerifiedModal(emailString);
    return;
  }

  if (res.key === "phone_not_exist") {
    showError("Account not found. Please create an account.");
    return;
  }

  if (res.key === "invalid_pass") {
    showError("Invalid credentials provided. Please try resetting your password.");
    return;
  }

  showError(res.message || "Invalid login credentials");
}

// ===========================
// TOAST HELPERS
// ===========================
function showError(message) {
  toast(message, "error");
}

function showSuccess(message) {
  toast(message, "success");
}

function toast(message, type) {
  const bg = type === "success" ? "bg-green-600" : "bg-red-600";

  const el = $(`
    <div class="fixed top-[20px] right-[20px] z-[9999]
                ${bg} text-white px-4 py-2 rounded-md text-sm shadow-lg">
      ${message}
    </div>
  `);

  $("body").append(el);

  setTimeout(function () {
    el.fadeOut(300, function () {
      el.remove();
    });
  }, 3500);
}

// ===========================
// PHONE NOT VERIFIED MODAL
// ===========================
let pendingEmailString = null;

function showPhoneNotVerifiedModal(emailString) {
  pendingEmailString = emailString;

  // SAVE PHONE FOR VERIFY PAGE
  const phone = $("#mobileInput").val().trim();
  if (phone) {
    sessionStorage.setItem("VERIFY_PHONE", phone);
  }

  $("body").addClass("overflow-hidden");

  $("#phoneNotVerifiedModal")
    .removeClass("hidden")
    .css("display", "flex");
}

$(document).on("click", "#cancelVerify", function (e) {
  e.preventDefault();
  window.location.href = "/dashboard";
});

$("#proceedVerify").on("click", function () {
  if (!pendingEmailString) return;
  window.location.href = `/verify/${pendingEmailString}`;
});