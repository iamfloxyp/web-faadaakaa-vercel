

  function forceLogout() {
    sessionStorage.removeItem("AUTH_TOKEN");
    window.location.href = "/";
  }

  document.addEventListener("click", function (e) {
    const target = e.target.closest("#headerLogout, #mobileHeaderLogout");
    if (!target) return;

    e.preventDefault();
    forceLogout();
  });