
var map;

var myPoint = "";
var myFigure = "";


function initView(view) {

    var form = document.getElementById('changeViewType');
    var views = form.selector;
    var prev = null;
    for(var i = 0; i < views.length; i++) {

        if (views[i].value == view){
            views[i].checked = true;
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

    $("li").each(function(){
        span = $(this).children("span");
        if (span.length > 0){
            span[0].style.display = display;
        }
    });

    $("a").each(function(){
        span = $(this).children("span");
        if (span.length > 0){
            span[0].style.display = display;
        }
    });

    var typeTitles = document.getElementsByClassName("attributeTypeTitle");

    for (var type in typeTitles){
        if (typeTitles.hasOwnProperty(type)) {
            typeTitles[type].style.display = display;
        }
    }
}

function showItems(divId) {
    var button = document.getElementById(divId + "Button");

    if (button.innerHTML == "Show more"){
        button.innerHTML = "Show less";
    } else{
        button.innerHTML = "Show more";
    }

    var div = document.getElementById(divId);
    var ul = div.childNodes[0];
    var list = ul.childNodes;

    for (var li in list){
        if (list.hasOwnProperty(li)) {
            if (list[li].className == "hidden") {
                list[li].className = "displayed";
            }
            else if (list[li].className == "displayed") {
                list[li].className = "hidden";
            }
        }
    }
}

function initializePoint(point) {
    if (point != "") {
        myPoint = JSON.parse(point.replace(/&quot;/g, '"'));
    }
}

function initializeFigure(figure) {
    if (figure != "") {
        figure = figure.replace(/&quot;/g, '"').slice(1, -1);
        myFigure = JSON.parse(figure);
    }
}

function initMap() {

    if (myFigure != "" || myPoint != "") {

        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 14,
            center: {lat: 39.475088, lng: -6.371472}
        });

        if (myPoint != "") {
            map.data.addGeoJson(myPoint);
        }

        if (myFigure != ""){
            map.data.addGeoJson(myFigure);
        }
        changeStyle(map);

        zoom(map);
        google.maps.event.addListenerOnce(map, 'bounds_changed', function() {
            map.setZoom(Math.min(16, map.getZoom()));
        });

    }

    else{
        var contentMap = document.getElementById("contentMap");

        if (contentMap != null){
            contentMap.style.display = "none";
        }
    }
}

function changeStyle(map) {
    map.data.setStyle({
        clickable: false,

        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',

        strokeColor: 'MidnightBlue',
        fillColor: 'DodgerBlue',
        strokeOpacity: '1.0',
        strokeWeight: 2
    });
}

function zoom(map) {
    var bounds = new google.maps.LatLngBounds();
    map.data.forEach(function(feature) {
        processPoints(feature.getGeometry(), bounds.extend, bounds);
    });
    map.fitBounds(bounds);
}

function processPoints(geometry, callback, thisArg) {
    if (geometry instanceof google.maps.LatLng) {
        callback.call(thisArg, geometry);
    } else if (geometry instanceof google.maps.Data.Point) {
        callback.call(thisArg, geometry.get());
    } else {
        geometry.getArray().forEach(function(g) {
            processPoints(g, callback, thisArg);
        });
    }
}