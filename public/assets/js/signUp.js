// =========================================================
// PAGE LOADER
// =========================================================
window.addEventListener("load", function () {
  const pageLoader = document.getElementById("pageLoader");
  if (pageLoader) {
    pageLoader.style.display = "none";
  }
});
// Clear any old verification phone when starting a fresh signup
sessionStorage.removeItem("VERIFY_PHONE");
document.cookie = "verify_phone=; max-age=0; path=/";

// =========================================================
// PASSWORD TOGGLE
// =========================================================
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const passwordIcon = document.getElementById("passwordIcon");

togglePassword?.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";

  passwordIcon.classList.toggle("fa-eye");
  passwordIcon.classList.toggle("fa-eye-slash");
});

// =========================================================
// SIGNUP FORM
// =========================================================
const signupForm = document.getElementById("signupForm");
const registerBtn = document.getElementById("registerBtn");
const registerText = document.getElementById("registerText");
const registerLoader = document.getElementById("registerLoader");

if (signupForm) {
  signupForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value.trim();
    const termsAccepted = document.getElementById("terms").checked;

    // =====================================================
    // VALIDATION
    // =====================================================
    if (!firstName || !lastName || !phone || !password) {
      showToast("All fields are required.", "error");
      return;
    }

    if (phone.length !== 11) {
      showToast("Mobile number must be 11 digits.", "error");
      return;
    }

    if (!termsAccepted) {
      showToast("You must accept the terms and conditions.", "error");
      return;
    }

    // =====================================================
    // BUTTON LOADER START
    // =====================================================
    registerBtn.disabled = true;
    registerText.textContent = "Registering";
    registerLoader.classList.remove("hidden");

    const formData = new FormData();
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("phone", phone);
    formData.append("password", password);

    fetch("https://api.faadaakaa.com/api/signupv2", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(result => {
        if (!result.status) {
          stopRegisterLoader();
          showToast(result.message || "Signup failed.", "error");
          return;
        }

        const emailString = result.data?.email_string;

        if (!emailString) {
          stopRegisterLoader();
          showToast("Verification reference missing. Please try again.", "error");
          return;
        }

        // =====================================================
        // SUCCESS TOAST
        // =====================================================
        showToast(
          result.message ||
            "We've sent your verification code. Kindly check your SMS or WhatsApp.",
          "success"
        );

        document.cookie = `verify_phone=${phone}; path=/; max-age=600`; // 15 minutes

        // =====================================================
        // REDIRECT AFTER SHORT DELAY
        // =====================================================
        setTimeout(() => {
          window.location.href = `/verify/${emailString}`;
        }, 1200);
      })
      .catch(() => {
        stopRegisterLoader();
        showToast("Network error. Please try again.", "error");
      });
  });
}

// =========================================================
// STOP BUTTON LOADER
// =========================================================
function stopRegisterLoader() {
  registerBtn.disabled = false;
  registerText.textContent = "Register";
  registerLoader.classList.add("hidden");
}

// =========================================================
// GLOBAL TOAST
// =========================================================
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");

  toast.textContent = message;
  toast.classList.remove("hidden");

  toast.className =
    "fixed top-6 right-6 z-[9999] max-w-[360px] px-5 py-4 rounded-[10px] text-white text-[14px] font-medium shadow-lg toast-animate";

  if (type === "error") {
    toast.classList.add("bg-red-500");
    //  DO NOT AUTO-HIDE ERRORS
    return;
  }

  //  SUCCESS AUTO-HIDE
  toast.classList.add("bg-green-600");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3500);
}