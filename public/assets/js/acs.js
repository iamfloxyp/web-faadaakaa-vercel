

  /* ============================================================
   COOLING PAGE PRODUCT LOADER (ACs, Refrigerators, Coolers)
   Loads real products from Faadaakaa backend
   ============================================================ */

// API endpoint
const COOLING_API =
  "https://api.faadaakaa.com/api/loadproductbycat/air-conditioners-refrigerators/1";

// Fetch cooling products from backend
function loadCooling() {
  fetch(COOLING_API)
    .then(response => response.json())
    .then(result => {
      if (result.status === true && Array.isArray(result.data)) {

        // START PAGINATION with real API data
        initializePagination(result.data, renderCooling);

      } else {
        console.log("No cooling data returned from API");
      }
    })
    .catch(error => {
      console.log("Error loading cooling category", error);
    });
}

// Render products
function renderCooling(products) {
  const $grid = $("#coolingListGrid");
  $grid.empty();

  products.forEach(item => {
    const imageURL =
      item.images && item.images.length > 0
        ? "https://api.faadaakaa.com/storage/" + item.images[0].path
        : "./assets/images/placeholder.png";

    const card = `
       <a href="./productdetails.html?id=${item.id}"
          class="bg-[#F9FAFB] border border-[#EAECF0] rounded-[12px]
                 flex flex-col w-full h-auto hover:shadow-md transition">

          <div class="flex justify-center items-center border-b border-[#EAECF0] 
                      py-[10px] bg-[#EAECF0] rounded-t-[12px]">
             <img src="${imageURL}" 
                  alt="${item.name}" 
                  class="w-[80px] h-[80px] object-contain mx-auto">
          </div>

          <div class="flex flex-col justify-between p-[10px] bg-white rounded-b-[12px] text-center">

              <h3 class="text-[13px] font-semibold text-[#101828] leading-[18px]">
                  ${item.name}
              </h3>

              <div class="flex flex-col gap-[4px] mt-[8px]">
                  <p class="text-[12px] font-medium text-[#004EEB]">
                      ₦${Number(item.price).toLocaleString()}
                  </p>
                  <p class="text-[12px] font-medium text-[#101828]">
                      ₦${Number(item.selling_price).toLocaleString()}
                  </p>
              </div>
          </div>
       </a>
    `;

    $grid.append(card);
  });
}

// Run when page loads
$(document).ready(function () {
  loadCooling();
});