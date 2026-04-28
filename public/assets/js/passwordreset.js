$(document).ready(function () {

  // =========================================
  // PAGE LOADER
  // =========================================
  $("#pageLoader").fadeOut(300);

  // =========================================
  // RESET PASSWORD
  // =========================================
  $("#resetSubmitBtn").on("click", function () {

    const phone = $("#resetPhoneInput").val().trim();

    hideResetError();

    // VALIDATION
    if (!/^\d{11}$/.test(phone)) {
      showResetError("Phone number must be exactly 11 digits.");
      return;
    }

    // BUTTON LOADER START
    $("#resetSubmitBtn").prop("disabled", true);
    $("#resetBtnText").text("Sending");
    $("#resetBtnLoader").removeClass("hidden");

    // =========================================
    // REAL API CALL
    // =========================================
    $.ajax({
      url: "https://api.faadaakaa.com/api/resetpassv2",
      method: "POST",
      data: { phone },

      success: function (res) {
        if (!res.status) {
          showResetError(res.message || "Password reset failed.");
          return;
        }

        // SHOW SUCCESS MODAL USING BACKEND MESSAGE
        $("#resetSuccessMessage").text(res.message);
        $("#resetSuccessModal").removeClass("hidden");
      },

      error: function (err) {
        showResetError(
          err.responseJSON?.message ||
          "Unable to reset password. Please try again."
        );
      },

      complete: function () {
        stopResetLoader();
      }
    });
  });

  // =========================================
  // OK BUTTON
  // =========================================
  $("#resetOkBtn").on("click", function () {
    window.location.href = "login.html";
  });

  // =========================================
  // CLOSE ERROR
  // =========================================
  $("#closeResetError").on("click", function () {
    hideResetError();
  });

});

// =========================================
// STOP BUTTON LOADER
// =========================================
function stopResetLoader() {
  $("#resetSubmitBtn").prop("disabled", false);
  $("#resetBtnText").text("Submit");
  $("#resetBtnLoader").addClass("hidden");
}

// =========================================
// ERROR HANDLERS
// =========================================
function showResetError(message) {
  $("#resetErrorText").text(message);
  $("#resetErrorPopup").removeClass("hidden");
}

function hideResetError() {
  $("#resetErrorPopup").addClass("hidden");
}