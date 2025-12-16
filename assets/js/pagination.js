var itemsPerPage = 18;
var currentPage = 1;
var allProducts = [];

function initializePagination(products, renderFunction) {
  allProducts = products;
  currentPage = 1;
  renderPage(renderFunction);

  $("#nextBtn").off().click(function () {
    var maxPage = Math.ceil(allProducts.length / itemsPerPage);
    if (currentPage < maxPage) {
      currentPage++;
      renderPage(renderFunction);
    }
  });

  $("#prevBtn").off().click(function () {
    if (currentPage > 1) {
      currentPage--;
      renderPage(renderFunction);
    }
  });
}

function renderPage(renderFunction) {
  var start = (currentPage - 1) * itemsPerPage;
  var end = start + itemsPerPage;
  var pageItems = allProducts.slice(start, end);
  renderFunction(pageItems);
}