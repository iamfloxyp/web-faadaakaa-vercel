$("#resetSubmitBtn").on("click", function () {

  let phone = $("#resetPhoneInput").val().trim();

  $("#resetPhoneError").addClass("hidden").text("");

  // Validate
  if (phone.length !== 11) {
    $("#resetPhoneError")
      .removeClass("hidden")
      .text("Phone number must be exactly 11 digits.");
    return;
  }

  // Show loading spinner (button text stays visible)
  $("#resetBtnLoader").removeClass("hidden");

  setTimeout(() => {
    
    let user = JSON.parse(localStorage.getItem("faadaakaaUser")) || {};

    if (user.phone && user.phone !== phone) {
      $("#resetPhoneError")
        .removeClass("hidden")
        .text("This phone number is not registered on Faadaakaa.");
      
      $("#resetBtnLoader").addClass("hidden");
      return;
    }

    // Generate temp password
    let newPassword = "FDK-" + Math.floor(100000 + Math.random() * 900000);
    console.log("Generated New Password:", newPassword);

    // Update popup text
    $("#resetSuccessMessage").html(`
  Success! Your new password has been sent to your registered phone number 
  <span class="font-semibold">${phone}</span> via SMS and WhatsApp.<br>
  Please update the password on successful login.
`);

    $("#resetSuccessModal").removeClass("hidden");

    // Redirect after 3 secs
    setTimeout(() => {
      window.location.href = "login.html";
    }, 3000);

    $("#resetBtnLoader").addClass("hidden");

  }, 2000);
});

// OK button
$("#resetOkBtn").on("click", function () {
  window.location.href = "login.html";
});