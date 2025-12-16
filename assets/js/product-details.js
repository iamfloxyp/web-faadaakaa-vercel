// === TAB NAVIGATION ======================================
$(".tab-btn").on("click", function () {
    const tab = $(this).data("tab");

    // Reset all tab text colors
    $(".tab-btn").removeClass("text-[#101828]").addClass("text-[#475467]");

    // Hide all underlines
    $(".active-underline").addClass("hidden");

    // Activate clicked tab
    $(this)
        .removeClass("text-[#475467]")
        .addClass("text-[#101828]")
        .find(".active-underline")
        .removeClass("hidden");

    // Toggle content
    if (tab === "description") {
        $("#descriptionContent").removeClass("hidden");
        $("#specificationContent").addClass("hidden");
    } else {
        $("#descriptionContent").addClass("hidden");
        $("#specificationContent").removeClass("hidden");
    }
});

// ======== NEW THUMBNAIL SLIDER LOGIC (for mobile + desktop) ========

// how many thumbnails to show at once (3 on mobile)
let visibleCount = 3;
let thumbIndex = 0;

// width of one thumbnail
const thumbWidth = $(".thumbContainer").first().outerWidth(true);

// MOVE RIGHT
$("#thumbNext").on("click", function () {
    const totalThumbs = $(".thumbContainer").length;

    if (thumbIndex < totalThumbs - visibleCount) {
        thumbIndex++;
        $("#thumbnailTrack").css("transform", `translateX(-${thumbIndex * thumbWidth}px)`);
    }
});

// MOVE LEFT
$("#thumbPrev").on("click", function () {
    if (thumbIndex > 0) {
        thumbIndex--;
        $("#thumbnailTrack").css("transform", `translateX(-${thumbIndex * thumbWidth}px)`);
    }
});




$(document).on("click", "#paymentDropdown .dropdown-item", function (e) {
    e.stopPropagation();

    const selected = $(this).text().trim();
    $("#paymentInput").val(selected);
    $("#paymentDropdown").addClass("hidden");

    $("#paymentTermsBody").empty();  

    // === TOTAL COST ===
    $("#paymentTermsBody").append(`
        <div class="flex justify-between py-[4px]">
            <span class="text-[#535862] text-[13px]">Total Cost:</span>
            <span class="text-[#101828] text-[13px] font-[500]">₦2,822,800.00</span>
        </div>
    `);

    // === FIRST PAYMENT ===
    $("#paymentTermsBody").append(`
        <div class="flex justify-between py-[4px]">
            <span class="text-[#535862] text-[13px]">First Payment:</span>
            <span class="text-[#101828] text-[13px] font-[500]">₦1,129,120.00</span>
        </div>
    `);

    // === SUBSEQUENT PAYMENT — 2 lines LEFT, 1 amount RIGHT ===
    $("#paymentTermsBody").append(`
        <div class="flex justify-between py-[4px] items-start">

            <!-- LEFT SIDE (two lines stacked) -->
            <div class="flex flex-col">
                <span class="text-[#535862] text-[13px]">Subsequent Payment(s):</span>
                <span class="text-[#344054] text-[12px]">5 months payment cycle</span>
            </div>

            <!-- RIGHT SIDE (shifted downward slightly) -->
            <span class="text-[#101828] text-[12px] font-[500] mt-[6px]">
                ₦625,532.33/month
            </span>

        </div>
    `);

});