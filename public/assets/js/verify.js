$(document).ready(function () {

  // =========================================
  // PAGE LOADER START
  // =========================================
  $("#pageLoader").removeClass("hidden").show();

  // =========================================
  // GET email_string FROM URL
  // /verify/:emailString
  // =========================================
  const pathParts = window.location.pathname.split("/");
  const emailString = pathParts[pathParts.length - 1];

  if (!emailString) {
    $("#pageLoader").fadeOut(200);
    return;
  }

  // =========================================
  // SHOW OTP MODAL
  // =========================================
  $("#otpOverlay").removeClass("hidden").show();
  $("body").css("overflow", "hidden");

  // =========================================
  // READ PHONE FROM COOKIE (NO URL, NO API)
  // =========================================
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(";").shift();
    }
    return null;
  }

  const savedPhone =
  sessionStorage.getItem("VERIFY_PHONE") ||
  getCookie("verify_phone");

$("#verifyPhoneDisplay").text(
  savedPhone || "your registered number"
);

  // PAGE LOADER END
  $("#pageLoader").fadeOut(200);

  // =========================================
  // OTP INPUT HANDLING
  // =========================================
  const otpInputs = $(".otp-box");

  otpInputs.each(function (index) {

    $(this).on("input", function () {
      this.value = this.value.replace(/[^0-9]/g, "");

      if (this.value.length === 1 && index < otpInputs.length - 1) {
        otpInputs.eq(index + 1).focus();
      }
    });

    $(this).on("keydown", function (e) {
      if (e.key === "Backspace" && this.value === "" && index > 0) {
        otpInputs.eq(index - 1).focus();
      }
    });
  });

  // =========================================
  // VERIFY OTP
  // =========================================
  $("#otpContinue").on("click", function () {

    let phoneCode = "";
    let hasEmpty = false;

    otpInputs.each(function () {
      const val = $(this).val().trim();
      if (!val) hasEmpty = true;
      phoneCode += val;
    });

    if (hasEmpty || phoneCode.length !== 6) {
      showError("Please enter all 6 digits.");
      return;
    }

    // =====================================
    // BUTTON LOADER START
    // =====================================
    $("#otpContinue").prop("disabled", true);
    $("#otpContinueText").text("Verifying");
    $("#otpContinueLoader").removeClass("hidden");

   $.ajax({
  url: "https://api.faadaakaa.com/api/verifyphonev2",
  method: "POST",
  data: {
    phone_code: phoneCode,
    email_string: emailString
  },
  success: function (res) {

    console.log("Verify api response:", res);

    // SAFETY CHECK
    if (!res.status || !res.data || !res.data.token) {
      stopOtpButtonLoader();
      showError("Verification succeeded but token is missing.");
      return;
    }

    // SAVE TOKEN (THIS WAS THE MISSING PIECE)
    sessionStorage.setItem("AUTH_TOKEN", res.data.token);

    // CLEAN UP STORED PHONE
    document.cookie = "verify_phone=; max-age=0; path=/";
    sessionStorage.removeItem("VERIFY_PHONE");

    // SHOW SUCCESS UI
    $("#successPopup").removeClass("hidden");

    // REDIRECT AFTER DELAY (FOR DEBUGGING VISIBILITY)
    setTimeout(function () {
      window.location.href = "/account.html";
    }, 1500);
  },
  error: function (err) {
    stopOtpButtonLoader();
    showError(
      err.responseJSON?.message ||
      "Verification failed. Try again."
    );
  }
});
  });

  /// =========================================
// RESEND CODE TIMER (60 SECONDS)
// =========================================
let resendSeconds = 60;
const resendBtn = $("#resendOtp");
const timerText = $("#otpTimer");
let resendInterval;

function startResendTimer() {
  resendBtn.addClass("pointer-events-none opacity-60");

  resendInterval = setInterval(function () {
    resendSeconds--;

    const min = Math.floor(resendSeconds / 60);
    const sec = resendSeconds % 60;

    timerText.text(`${min}:${sec.toString().padStart(2, "0")}`);

    if (resendSeconds <= 0) {
      clearInterval(resendInterval);
      resendBtn.removeClass("pointer-events-none opacity-60");
      timerText.text("0:00");
    }
  }, 1000);
}

startResendTimer();

resendBtn.on("click", function () {
  if (resendSeconds > 0) return;

  $.ajax({
    url: "https://api.faadaakaa.com/api/resendverifycode",
    method: "POST",
    data: { email_string: emailString },
    success: function () {
      showSuccess("A new verification code has been sent to your number.");
      resendSeconds = 60;
      startResendTimer();
    },
    error: function () {
      showError("Unable to resend code. Try again.");
    }
  });
});

  // =========================================
  // CLOSE + CANCEL
  // =========================================
  $("#closeOtpModal, #otpCancel").on("click", function () {
    window.location.href = "/signup.html";
  });

});

// =========================================
// STOP OTP BUTTON LOADER
// =========================================
function stopOtpButtonLoader() {
  $("#otpContinue").prop("disabled", false);
  $("#otpContinueText").text("Continue");
  $("#otpContinueLoader").addClass("hidden");
}

// =========================================
// ERROR POPUP (STAYS UNTIL CLOSED)
// =========================================
function showError(message) {
  $("#errorMessage").text(message);
  $("#errorPopup").removeClass("hidden");
}

$("#closeErrorBtn").on("click", function () {
  $("#errorPopup").addClass("hidden");
});
function showSuccess(message) {
  const toast = $("#toast");

  toast
    .text(message)
    .removeClass("hidden bg-red-500")
    .addClass("bg-green-600");

  setTimeout(() => {
    toast.addClass("hidden");
  }, 3000);
}