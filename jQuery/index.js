// coding using jQuery library / framework

// if jquery is added in head section
$(document).ready(function(){
  $("h1").css("color","red");
});

//Changing Text attributes
$("h1").text("Bye");
$("button").text("Don't Click Me");
$("button").html("<em>HEY</em>");

// Adding events such as Clicks
$("button").click(function(){
    $("h1").css("color","purple");
});

// displaying the key which is pressed
$(document).keydown(function(event){
  // console.log(event.key);
  $("h1").text(event.key);
});
