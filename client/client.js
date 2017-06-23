
var map;

//var myPoint = {"type":"Feature","geometry":{"type":"Point","coordinates":[-6.381675,39.464646]},"properties":{}};
var myPoint = "";
var myFigure = "";

function initializePoint(point) {
    if (point != "") {
        myPoint = JSON.parse(point.replace(/&quot;/g, '"'));
    }
    //console.log(JSON.parse(point.replace(/&quot;/g,'"')));
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

        // NOTE: This uses cross-domain XHR, and may not work on older browsers.
        //map.data.loadGeoJson('{"type": "FeatureCollection","features": [{ "type": "Feature","geometry": { "type": "Point","coordinates": [ -6.37167, 39.462323 ]},"properties": {"uri": "http://opendata.caceres.es/recurso/sociedad-bienestar/residencias/HogarMayores/0-hogar-y-residencia-de-la-3a-edad-cervantes","om_tieneEnlaceSIG": "http://sig2.caceres.es/SerWeb/fichatoponimo.asp?mslink=1759","geo_long": "-6.37167","geo_lat": "39.462323","rdfs_label": "Hogar y Residencia de la 3ª Edad Cervantes" 	}}]}');
        //map.data.loadGeoJson('https://storage.googleapis.com/mapsdevsite/json/google.json');

        if (myPoint != "") {
            map.data.addGeoJson(myPoint);
        }

        if (myFigure != ""){
            map.data.addGeoJson(myFigure);
        }

        // myPoint = JSON.stringify(myPoint);
        // myFigure = JSON.stringify(myFigure);
        //
        // console.log("Point value:", myPoint);
        // console.log("Figure value:", myFigure);
    }
}