
module.exports.processGeometry = processGeometry;
module.exports.processPoint = processPoint;

const GJV = require("geojson-validation");
const GeoJSON = require('geojson');

const point = "Point";
const line = "LineString";
const polygon = "Polygon";

function processGeometry(value) {

    var type;

    value = value.replace(" ", "");

    if (value[0] == "[" && value[value.length - 1] == "]"){
        if (value[1] == "[" && value[value.length - 2] == "]"){
            if (value[2] == "[" && value[value.length - 3] == "]"){
                type = polygon;
            } else{
                type = line;
            }
        } else{
            type = point;
        }
    } else{
        throw "Invalid geometric configuration for generating GeoJSON";
    }

    value = JSON.parse(value);

    var data = {coordinates: value};
    var geojson;

    switch (type){
        case point:
            //geojson = GeoJSON.parse(data, {Point: ['lat', 'lng']});
            geojson = GeoJSON.parse(data, {Point: 'coordinates'});

            break;

        case line:
            geojson = GeoJSON.parse(data, {LineString: 'coordinates'});

            break;

        case polygon:
            geojson = GeoJSON.parse(data, {Polygon: "coordinates"});

            break;
    }

    if(!GJV.valid(geojson)){
        throw "Invalid GeoJSON generated";
    }

    return geojson;
}

function processPoint(lat, long) {

    var data = {lat: lat, long: long};
    var geojson = GeoJSON.parse(data, {Point: ['lat', 'long']});

    if(!GJV.valid(geojson)){
        throw "Invalid GeoJSON Point generated";
    }

    return geojson;
    
}