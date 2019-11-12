function openNav() {
    document.getElementById("mySidenav").style.height = "88%";
    document.getElementById("mySidenav").style.opacity = "1";
    document.getElementById("main").style.marginTop = "20%";
    $(".openTopBar").attr("onclick", "closeNav()");
    $(".openTopBar").html('<i class="material-icons">keyboard_arrow_up</i>')
  }
  
  function closeNav() {
      document.getElementById("mySidenav").style.height = "0";
      document.getElementById("mySidenav").style.opacity = "0";
      document.getElementById("main").style.marginTop = "0";
      $(".openTopBar").attr("onclick", "openNav()");
      $(".openTopBar").html('<i class="material-icons">search</i>')
  }