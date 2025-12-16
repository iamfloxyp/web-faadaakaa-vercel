/* ============================================================
   ELECTRONICS PAGE PRODUCT LOADER (Dynamic API Version)
   Loads real products from Faadaakaa backend
   ============================================================ */

// 🔹 API endpoint for Electronics Category

const fullURL = window.location.href;
urls = fullURL.split("/");
console.log(urls)
category_slug = urls[4]
page = urls[5]
//alert(fullURL)

const ELECTRONICS_API =
  "https://api.faadaakaa.com/api/loadproductbycat/"+category_slug+"/"+page;///electronics/8

// 🔹 Fetch electronics from backend
function loadElectronics() {
  fetch(ELECTRONICS_API)
    .then(response => response.json())
    .then(result => {
      if (result.status === true && Array.isArray(result.data)) {
        renderElectronics(result.data);

        // Inside loadElectronics() after successful fetch:
initializePagination(result.data, renderElectronics);
      } else {
        console.log("No electronics data returned from API");
      }
    })
    .catch(error => {
      console.log("Error loading electronics category", error);
    });
}

// 🔹 Render electronics using same card style you already designed
function renderElectronics(products) {
  const $grid = $("#electronicsListGrid");
  $grid.empty();

  products.forEach(item => {

    // Handle image
    const imageURL =
      item.images && item.images.length > 0
        ? "https://api.faadaakaa.com/public_storage/" + item.images[0].path
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

          <div class="min-h-[200px] max-h-[150px] flex flex-col justify-between p-[10px] bg-white 
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

// 🔹 Load electronics immediately when the page is ready
$(document).ready(function () {
  loadElectronics();
});