$(document).ready(function(){

    $( ".burger-button" ).on( "click", function() {
        $(this).toggleClass("menu-open-button");
        $('.menu-links').toggleClass("menu-open");
        $('body').toggleClass("scroll-lock");
      });

});