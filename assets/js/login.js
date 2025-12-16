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
// LOGIN FUNCTION
// ===========================
$("#loginBtn").on("click", function () {
    const phone = $("#mobileInput").val().trim();
    const password = $("#passwordInput").val().trim();

    // -------------------------
    // VALIDATE PHONE
    // -------------------------
    if (phone.length !== 11 || !$.isNumeric(phone)) {
        $("#mobileError").removeClass("hidden");
        return;
    } else {
        $("#mobileError").addClass("hidden");
    }

    // -------------------------
    // FETCH VERIFIED USER
    // -------------------------
    const savedUser = JSON.parse(localStorage.getItem("faadaakaaUser"));

    if (!savedUser) {
        alert("No account found. Please sign up.");
        return;
    }

    if (savedUser.phone !== phone) {
        alert("Phone number does not exist. Please sign up.");
        return;
    }

    if (savedUser.password !== password) {
        alert("Incorrect password. Try again.");
        return;
    }

    // -------------------------
    // SUCCESS — SAVE LOGIN SESSION
    // -------------------------
    localStorage.setItem("faadaakaaActiveUser", JSON.stringify(savedUser));

    // Some pages use this for wallet, address, etc
    if (typeof saveUserEverywhere === "function") {
        saveUserEverywhere(savedUser);
    }

    // Redirect
    window.location.href = "account.html";
});