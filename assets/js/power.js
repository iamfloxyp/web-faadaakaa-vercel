

 /* ============================================================
   POWER SOLUTIONS PAGE PRODUCT LOADER (Inverters, Solar, etc)
   Loads real products from Faadaakaa backend
   ============================================================ */

// 🔹 API endpoint for Power Solutions Category
const POWER_API =
  "https://api.faadaakaa.com/api/loadproductbycat/power-solutions/1";

// 🔹 Fetch power products from backend
function loadPower() {
  fetch(POWER_API)
    .then(response => response.json())
    .then(result => {
      if (result.status === true && Array.isArray(result.data)) {
        renderPower(result.data);

        // Inside loadPower() after successful fetch:
initializePagination(result.data, renderPower);
      } else {
        console.log("No power products returned from API");
      }
    })
    .catch(error => {
      console.log("Error loading power category", error);
    });
}

// 🔹 Render Power items using same card style
function renderPower(products) {
  const $grid = $("#powerListGrid");
  $grid.empty();

  products.forEach(item => {

    // Handle image
    const imageURL =
      item.images && item.images.length > 0
        ? "https://api.faadaakaa.com/storage/" + item.images[0].path
        : "./assets/images/placeholder.png";

    // Build product card
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

          <div class=" min-h-[200px] max-h-[150px]flex flex-col justify-between p-[10px] bg-white 
                      rounded-b-[12px] text-center">

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

// 🔹 Load power items immediately when page is ready
$(document).ready(function () {
  loadPower();
});
