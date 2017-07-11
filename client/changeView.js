
var view = "developer";

function changeView() {

    var button = document.getElementById("changeViewButton").firstChild;
    var display = "";

    if (view == "user"){
        view = "developer";
        button.data = "Change to user view";
        display = "";
    }

    else if (view == "developer"){
        view = "user";
        button.data = "Change to developer view";
        display = "none";
    }

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