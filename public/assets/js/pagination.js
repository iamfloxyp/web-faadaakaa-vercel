var itemsPerPage = 18;
var currentPage = 1;
var allProducts = [];

/* ===============================
   READ PAGE FROM URL
   =============================== */
function getPageFromURL() {
  var parts = window.location.pathname.split("/").filter(Boolean);
  var page = parseInt(parts[2], 10);
  return isNaN(page) ? 1 : page;
}

/* ===============================
   UPDATE URL PATH
   =============================== */
function updateURL(page) {
  var parts = window.location.pathname.split("/").filter(Boolean);
  var slug = parts[1];

  var newUrl = `/category/${slug}/${page}`;
  window.history.pushState({ page }, "", newUrl);
}

/* ===============================
   INIT PAGINATION
   =============================== */
function initializePagination(products, renderFunction) {
  allProducts = products;
  currentPage = getPageFromURL();

  renderPage(renderFunction);

  $("#nextBtn").off().on("click", function () {
    var maxPage = Math.ceil(allProducts.length / itemsPerPage);
    if (currentPage < maxPage) {
      currentPage++;
      updateURL(currentPage);
      renderPage(renderFunction);
    }
  });

  $("#prevBtn").off().on("click", function () {
    if (currentPage > 1) {
      currentPage--;
      updateURL(currentPage);
      renderPage(renderFunction);
    }
  });
}

/* ===============================
   RENDER PAGE
   =============================== */
function renderPage(renderFunction) {
  var start = (currentPage - 1) * itemsPerPage;
  var end = start + itemsPerPage;
  var pageItems = allProducts.slice(start, end);

  renderFunction(pageItems);
  togglePaginationButtons();
}

/* ===============================
   ENABLE / DISABLE BUTTONS
   =============================== */
function togglePaginationButtons() {
  var maxPage = Math.ceil(allProducts.length / itemsPerPage);

  $("#prevBtn").prop("disabled", currentPage === 1);
  $("#nextBtn").prop("disabled", currentPage === maxPage);
}

/* ===============================
   HANDLE BROWSER BACK / FORWARD
   =============================== */
window.addEventListener("popstate", function () {
  currentPage = getPageFromURL();
  renderPage(renderProducts);
});