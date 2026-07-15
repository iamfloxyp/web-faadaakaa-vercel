const PRIVACY_API = "https://api.faadaakaa.com/api/load_communication/privacy-policy";

$(document).ready(function () {
  loadPrivacyPolicy();
});

function loadPrivacyPolicy() {
  $("#policyLoader").removeClass("hidden").show();
  $("#policyContent").addClass("hidden").html("");

  $.ajax({
    url: PRIVACY_API,
    method: "GET",

    success: function (response) {
      console.log("PRIVACY POLICY RESPONSE:", response);

      const data = Array.isArray(response?.data)
        ? response.data[0]
        : response?.data || response;

      $("#policyTitle").text(data?.title || "Privacy Policy");

      $("#policyContent").html(
        data?.content || "Privacy policy content is not available."
      );

      $("#policyLoader").hide();
      $("#policyContent").removeClass("hidden");
    },

    error: function (xhr) {
      console.log("PRIVACY ERROR:", xhr.responseText || xhr);

      $("#policyLoader").hide();

      $("#policyContent")
        .removeClass("hidden")
        .html(`
          <p class="text-[#D92D20]">
            Unable to load Privacy Policy. Please try again later.
          </p>
        `);
    }
  });
}