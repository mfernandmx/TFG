
function initView() {

    var form = document.getElementById('changeViewType');
    var views = form.selector;
    var prev = null;
    for(var i = 0; i < views.length; i++) {
        console.log(views[i]);

        if (views[i].checked){
            changeView(views[i].value);
        }

        views[i].onclick = function() {
            if(this !== prev) {
                prev = this;
            }

            changeView(this.value);
        };
    }
}

function changeView(view) {

    var display = "";

    if (view == "user"){
        display = "none";
    } else if (view == "developer"){
        display = "";
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