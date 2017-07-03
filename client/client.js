
var map;

var myPoint = "";
var myFigure = "";

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