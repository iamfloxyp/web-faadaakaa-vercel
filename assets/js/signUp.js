// =========================================================
// PASSWORD TOGGLE
// =========================================================
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const passwordIcon = document.getElementById("passwordIcon");

togglePassword?.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";

    if (isHidden) {
        passwordIcon.classList.remove("fa-eye");
        passwordIcon.classList.add("fa-eye-slash");
    } else {
        passwordIcon.classList.remove("fa-eye-slash");
        passwordIcon.classList.add("fa-eye");
    }
});


// =========================================================
// SIGNUP FORM — TEMP USER ONLY
// =========================================================
const signupForm = document.getElementById("signupForm");
const signupError = document.getElementById("signupError");

if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const password = document.getElementById("password").value.trim();

        // Check if a FULL VERIFIED user exists
        const existingUser = JSON.parse(localStorage.getItem("faadaakaaUser"));

        if (existingUser && existingUser.phone === phone) {
            signupError.classList.remove("hidden");
            signupError.innerText = "User already exists. Please login instead.";

            signupError.classList.add("animate-shake");
            setTimeout(() => signupError.classList.remove("animate-shake"), 500);

            document.getElementById("firstName").value = "";
            document.getElementById("lastName").value = "";
            document.getElementById("phone").value = "";
            document.getElementById("password").value = "";

            setTimeout(() => signupError.classList.add("hidden"), 3000);
            return;
        }

        // Create TEMP USER (Not final)
        const tempUser = {
            firstName,
            lastName,
            phone,
            password
        };

        localStorage.setItem("faadaakaa_tempUser", JSON.stringify(tempUser));

        // Redirect to OTP page
        window.location.href = "verify.html";
    });
}