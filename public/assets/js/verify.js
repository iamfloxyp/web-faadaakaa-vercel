// =======================================================
// SAFE START
// =======================================================
$(document).ready(function () {
    $("#otpOverlay").hide();
    document.body.style.overflow = "auto";

    let tempUser = JSON.parse(localStorage.getItem("faadaakaa_tempUser"));
    if (tempUser && tempUser.phone) {
        $("#verifyPhoneDisplay").text(tempUser.phone);
    }
});


// =======================================================
// OPEN OTP MODAL
// =======================================================
window.showOtpModal = function () {
    $("#otpOverlay").show();
    document.body.style.overflow = "hidden";
    startOtpFlow();
};


// =======================================================
// OTP FLOW
// =======================================================
function startOtpFlow() {
    console.clear();

    localStorage.removeItem("faadaakaa_tempOTP");
    let currentOTP = generateOTP();
    console.log("Generated OTP:", currentOTP);

    $(".otp-box").val("");
    timerSeconds = 300;
    startOtpTimer();
}


// =======================================================
// GENERATE OTP
// =======================================================
function generateOTP() {
    let code = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem("faadaakaa_tempOTP", code);
    return code;
}


// =======================================================
// OTP INPUT AUTO MOVE
// =======================================================
const otpInputs = document.querySelectorAll(".otp-box");

otpInputs.forEach((input, index) => {
    input.addEventListener("input", () => {
        if (input.value.length === 1 && index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
        }
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !input.value && index > 0) {
            otpInputs[index - 1].focus();
        }
    });
});


// =======================================================
// TIMER
// =======================================================
let timerSeconds = 300;
let countdownInterval;

function startOtpTimer() {
    clearInterval(countdownInterval);

    countdownInterval = setInterval(() => {
        let m = Math.floor(timerSeconds / 60);
        let s = timerSeconds % 60;

        $("#otpTimer").text(`${m}:${s < 10 ? "0" + s : s}`);

        if (timerSeconds <= 0) {
            clearInterval(countdownInterval);
            $("#resendOtp")
                .text("Resend Code")
                .removeClass("text-[#155EEF]")
                .addClass("text-red-500");
        }

        timerSeconds--;
    }, 1000);
}


// =======================================================
// RESEND OTP
// =======================================================
$("#resendOtp").on("click", function () {
    if (timerSeconds > 0) return;

    let newOtp = generateOTP();
    console.log("Resent OTP:", newOtp);

    timerSeconds = 300;
    $(this)
        .removeClass("text-red-500")
        .addClass("text-[#155EEF]");

    startOtpTimer();
});


// =======================================================
// VERIFY OTP
// =======================================================
$("#otpContinue").on("click", function () {
    let entered = "";
    otpInputs.forEach(input => entered += input.value.trim());

    let savedOtp = localStorage.getItem("faadaakaa_tempOTP");
    let tempUser = JSON.parse(localStorage.getItem("faadaakaa_tempUser"));

    if (entered.length !== 6)
        return showError("Please enter all 6 digits.");

    if (entered !== savedOtp)
        return showError("Incorrect verification code.");

    if (!tempUser)
        return showError("Signup session expired. Please signup again.");

    // Verified — now save FINAL USER
    localStorage.setItem("faadaakaaUser", JSON.stringify(tempUser));
    localStorage.setItem("faadaakaaActiveUser", JSON.stringify(tempUser));

    // Cleanup temp data
    localStorage.removeItem("faadaakaa_tempUser");
    localStorage.removeItem("faadaakaa_tempOTP");

    // Success popup
    $("#successPopup").removeClass("hidden");

    setTimeout(() => {
        window.location.href = "account.html";
    }, 3000);
});


// =======================================================
// CANCEL (Go back to signup)
// =======================================================
$("#closeOtpModal, #otpCancel").on("click", function () {

    localStorage.removeItem("faadaakaa_tempUser");
    localStorage.removeItem("faadaakaa_tempOTP");

    $("#otpOverlay").hide();
    document.body.style.overflow = "auto";

    window.location.href = "signup.html";
});


// =======================================================
// ERROR POPUP
// =======================================================
function showError(msg) {
    $("#errorMessage").text(msg);
    $("#errorPopup").removeClass("hidden");
}

$("#closeErrorBtn").on("click", function () {
    $("#errorPopup").addClass("hidden");
});