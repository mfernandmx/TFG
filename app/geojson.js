
module.exports.processGeometry = processGeometry;

const compile = require("string-template/compile");

const geojsonStructure = "{\n"+
                "\t \"type\": \"{0}\",\n"+
                "\t \"coordinates\": {1}\n"+
                "}";

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
        //TODO:
    }

    //TODO: Validar GeoJSON - Excepción

    var geojsonTemplate = compile(geojsonStructure);

    return geojsonTemplate(type, value);
}