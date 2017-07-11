
var view = "developer";

function changeView() {

    var button = document.getElementById("changeViewButton");
    var display = "";

    if (view == "user"){
        view = "developer";
        button.firstChild.data = "Change to user view";
        button.style.backgroundColor = "#4CAF50";
        display = "";
    }

    else if (view == "developer"){
        view = "user";
        button.firstChild.data = "Change to developer view";
        button.style.backgroundColor = "#F44336";
        display = "none";
    }

    console.log(button);

    console.log("View:", view);

    document.getElementById("resourceUri").style.display = display;
    document.getElementById("geometricAttributes").style.display = display;

    var span;

    $("a").each(function(){

        span = $(this).children("span");
        if (span.length > 0){
            span[0].style.display = display;
        }

    });
}