const TERMS_API = "https://api.faadaakaa.com/api/load_communication/terms-conditions";

$(document).ready(function () {
  loadTerms();
});

function loadTerms() {
  $("#termsLoader").removeClass("hidden").show();
  $("#termsContent").addClass("hidden").html("");

  $.ajax({
    url: TERMS_API,
    method: "GET",

    success: function (response) {
      console.log("TERMS RESPONSE:", response);

      const data = Array.isArray(response?.data)
        ? response.data[0]
        : response?.data || response;

      $("#termsTitle").text(data?.title || "Terms & Conditions");

      $("#termsContent").html(
        data?.content || "Terms & Conditions content is not available."
      );

      $("#termsLoader").hide();
      $("#termsContent").removeClass("hidden");
    },

    error: function (xhr) {
      console.log("TERMS ERROR:", xhr.responseText || xhr);

      $("#termsLoader").hide();

      $("#termsContent")
        .removeClass("hidden")
        .html(`
          <p class="text-[#D92D20]">
            Unable to load Terms & Conditions. Please try again later.
          </p>
        `);
    }
  });
}