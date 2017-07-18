
module.exports.setContentPug = setContentPug;
module.exports.setError404 = setError404;

const configuration = require('./configuration');
const geojson = require('./geojson');
const data = require('./data');
const pug = require('pug');

function setContentPug(title, uri, backUri, types, literals, relations, typedLiterals, reverseRelations, blankNodes, geometries, points){

    //TODO Language

    var element;
    var literalsValues = [];
    var typedLiteralsValues = [];
    var relationsValues = [];
    var blankNodesValues = [];
    var reverseRelationsValues = [];

    //TODO: Revisar siguientes
    var geometriesValues = [];
    var pointsValues = [];

    var ele;

    var literalsPredicates = [];
    var typedLiteralsPredicates = [];
    var relationsPredicates = [];
    var blankNodesPredicates = [];
    var reverseRelationsPredicates = [];
    var geometriesPredicates = [];
    var pointsPredicates = [];

    var found, i;

    var geodata;
    var geoFigure = "";
    var geoPoint = "";


    // Procesamos los valores que sean literales
    for (element in literals) {
        if (literals.hasOwnProperty(element)) {

            var image = isImage(literals[element].value);

            ele = {relation: literals[element].relation, value: literals[element].value, image: image};

            literalsValues.push(ele);

            found = false;
            for (i = 0; i < literalsPredicates.length; i++) {
                if (literalsPredicates[i].url == literals[element].relation.url) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                literalsPredicates.push(literals[element].relation);
            }
        }
    }

    // Procesamos los valores que sean literales tipados
    for (element in typedLiterals) {
        if (typedLiterals.hasOwnProperty(element)) {

            replaceType(typedLiterals[element].value);

            if (typedLiterals[element].value.datatype == "xsd:boolean"){
                if (typedLiterals[element].value.value){
                    typedLiterals[element].value.value = "True";
                }
                else{
                    typedLiterals[element].value.value = "False";
                }
            }

            ele = {relation: typedLiterals[element].relation, value: typedLiterals[element].value};
            typedLiteralsValues.push(ele);

            found = false;
            for (i = 0; i < typedLiteralsPredicates.length; i++) {
                if (typedLiteralsPredicates[i].url == typedLiterals[element].relation.url) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                typedLiteralsPredicates.push(typedLiterals[element].relation);
            }
        }
    }

    // Procesamos los valores que sean relaciones
    for (element in relations) {
        if (relations.hasOwnProperty(element)) {

            //TODO: Cambiar
            //relations[element].value.url = relations[element].value.value;
            relations[element].value.url = relations[element].value.value.replace("opendata.caceres.es","localhost:8080");

            if (relations[element].title != "") {
                relations[element].value.value = relations[element].title;
            }

            ele = {relation: relations[element].relation, value: relations[element].value};

            relationsValues.push(ele);

            found = false;
            for (i = 0; i < relationsPredicates.length; i++) {
                if (relationsPredicates[i].url == relations[element].relation.url) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                relationsPredicates.push(relations[element].relation);
            }
        }
    }

    console.log(blankNodes);
    var keys = Object.keys(blankNodes);

    for (var key in keys){

        console.log("Nodo en blanco:", blankNodes[keys[key]]);

        var blankTypes = [];
        var attributes = blankNodes[keys[key]].attributes;

        //TODO: Imágenes en nodos en blanco
        //TODO: Eliminar tipo de atributos
        for (element in attributes){
            if (attributes.hasOwnProperty(element)) {
                if (attributes[element].type == "type") {
                    blankTypes.push(attributes[element].value);
                }
            }
        }

        ele = {relation: blankNodes[keys[key]].relation, nodeID: keys[key], types: blankTypes, attributes: attributes};
        blankNodesValues.push(ele);

        for (i = 0; i < blankNodesPredicates.length; i++) {
            if (blankNodesPredicates[i].url == blankNodes[keys[key]].relation.url) {
                found = true;
                break;
            }
        }

        if (!found) {
            blankNodesPredicates.push(blankNodes[keys[key]].relation);
        }
    }


    for (element in reverseRelations){
        if (reverseRelations.hasOwnProperty(element)) {

            // TODO: Cambiar
            //reverseRelations[element].value.url = reverseRelations[element].value.value;
            reverseRelations[element].value.url = reverseRelations[element].value.value.replace("opendata.caceres.es","localhost:8080");

            if (reverseRelations[element].title != "") {
                reverseRelations[element].value.value = reverseRelations[element].title;
            }

            ele = {relation: reverseRelations[element].relation, value: reverseRelations[element].value};

            reverseRelationsValues.push(ele);

            found = false;
            for (i = 0; i < reverseRelationsPredicates.length; i++) {
                if (reverseRelationsPredicates[i].url == reverseRelations[element].relation.url) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                reverseRelationsPredicates.push(reverseRelations[element].relation);
            }
        }
    }

    for (element in geometries){
        if (geometries.hasOwnProperty(element)) {

            try {
                geodata = geojson.processGeometry(geometries[element].value.value);

                geometries[element].value.value = geodata;

                ele = {relation: geometries[element].relation, value: JSON.stringify(geodata.geometry.coordinates)};
                //ele = {relation: geometries[element].relation};

                geometriesValues.push(ele);

                geometries[element].value.value = JSON.stringify(geometries[element].value.value);
                //geoFigure = JSON.stringify(geometriesValues[0].value.value);
                geoFigure = JSON.stringify(geometries[0].value.value);

                found = false;
                for (i = 0; i < geometriesPredicates.length; i++) {
                    if (geometriesPredicates[i].url == geometries[element].relation.url) {
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    geometriesPredicates.push(geometries[element].relation);
                }
            }
            catch (err) {
                //TODO: Guardar error en un log (Documentar)
                console.log(err);

                ele = {relation: geometries[element].relation, value: geometries[element].value};
                literalsValues.push(ele);

                //TODO Probar
                found = false;
                for (i = 0; i < literalsPredicates.length; i++) {
                    if (literalsPredicates[i].url == geometries[element].relation.url) {
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    literalsPredicates.push(geometries[element].relation);
                }
            }
        }
    }

    for (element in points){
        if (points.hasOwnProperty(element)) {

            try {
                geodata = geojson.processPoint(points[element].lat.value.value, points[element].long.value.value);

                pointsValues.push({lat: points[element].lat.value.value, long: points[element].long.value.value});

                pointsPredicates.push({lat: points[element].lat.relation, long: points[element].long.relation});

                geoPoint = JSON.stringify(geodata)
            }
            catch (err) {
                //TODO: Guardar error en un log (Documentar)
                console.log(err);

                //TODO Probar
                ele = {relation: points[element].lat.relation, value: points[element].lat.value};
                literalsValues.push(ele);

                ele = {relation: points[element].long.relation, value: points[element].long.value};
                literalsValues.push(ele);

                found = false;
                for (i = 0; i < literalsPredicates.length; i++) {
                    if (literalsPredicates[i].url == points[element].lat.relation.url) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    literalsPredicates.push(points[element].lat.relation);
                }

                found = false;
                for (i = 0; i < literalsPredicates.length; i++) {
                    if (literalsPredicates[i].url == points[element].long.relation.url) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    literalsPredicates.push(points[element].long.relation);
                }

            }

        }
    }

    //TODO: Cambiar
    backUri = backUri.replace("opendata.caceres.es","localhost:8080");

    const compiledFunction = pug.compileFile('./pug/content.pug');

    var projectName = configuration.getProperty("projectName")[0].replace(new RegExp("\"", 'g'), "");
    var projectHomePage = configuration.getProperty("projectHomepage")[0];
    var projectLogo = configuration.getProperty("projectLogo")[0];
    var defaultView = configuration.getProperty("defaultView")[0].replace(new RegExp("\"", 'g'), "");

    //var datasetBase = configuration.getProperty("datasetBase")[0];
    var datasetBase = configuration.getProperty("webBase") + configuration.getProperty("webResourcePrefix")[0].replace(new RegExp("\"", 'g'), "");

    return compiledFunction({

        defaultView: defaultView,

        rTitle: title,
        rUri: uri,
        rBackUri: backUri,
        rTypes: types,

        projectName: projectName,
        projectHomePage: projectHomePage,
        projectLogo: projectLogo,
        datasetBase: datasetBase,

        literals: literalsValues,
        typedLiterals: typedLiteralsValues,
        relations: relationsValues,
        blankNodes: blankNodesValues,
        reverseRelations: reverseRelationsValues,
        geometries: geometriesValues,
        points: pointsValues,

        geoFigure: geoFigure,
        geoPoint: geoPoint,

        literalsPredicates: literalsPredicates,
        typedLiteralsPredicates: typedLiteralsPredicates,
        relationsPredicates: relationsPredicates,
        blankNodesPredicates: blankNodesPredicates,
        reverseRelationsPredicates: reverseRelationsPredicates,
        geometriesPredicates: geometriesPredicates,
        pointsPredicates: pointsPredicates
    });
}

//TODO Revisar formatos. ¿Archivo configuración?
function isImage(attribute) {
    var image = false;

    if (attribute.type == "uri"){
        if (attribute.value.toLowerCase().endsWith(".jpg") ||
            attribute.value.toLowerCase().endsWith(".jpeg") ||
            attribute.value.toLowerCase().endsWith(".png")) {

            image = true;
        }
    }

    return image;
}

function replaceType(literal) {

    switch (literal.datatype){
        case "http://www.w3.org/2001/XMLSchema#int":
        case "http://www.w3.org/2001/XMLSchema#integer":
            literal.datatype = "xsd:integer";
            break;
        case "http://www.w3.org/2001/XMLSchema#decimal":
            literal.datatype = "xsd:decimal";
            break;
        case "http://www.w3.org/2001/XMLSchema#double":
            literal.datatype = "xsd:double";
            break;
        case "http://www.w3.org/2001/XMLSchema#boolean":
            literal.datatype = "xsd:boolean";
            break;
        case "http://www.w3.org/2001/XMLSchema#dateTime":
            literal.datatype = "xsd:dateTime";
            break;
    }
}

function setError404(uri){
    const compiledFunction = pug.compileFile('./pug/404.pug');

    var types = [];

    var projectName = configuration.getProperty("projectName")[0].replace(new RegExp("\"", 'g'), "");
    var projectHomePage = configuration.getProperty("projectHomepage")[0];
    var projectLogo = configuration.getProperty("projectLogo")[0];

    return compiledFunction({
        rTitle: "404 Not Found",
        rUri: uri,
        rBackUri: "",
        rTypes: types,

        projectName: projectName,
        projectHomePage: projectHomePage,
        projectLogo: projectLogo
    });
}