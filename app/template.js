
module.exports.setContentPug = setContentPug;
module.exports.setError404 = setError404;

const configuration = require('./configuration');
const geojson = require('./geojson');
const data = require('./data');
const pug = require('pug');

function setContentPug(title, uri, backUri, types, literals, relations, typedLiterals, blankNodes, reverseRelations, geometries, points, images){

    //TODO Language

    var element;
    var literalsValues = [];
    var typedLiteralsValues = [];
    var relationsValues = [];
    var blankNodesValues = [];
    var reverseRelationsValues = [];
    var geometriesValues = [];
    var pointsValues = [];
    var imagesValues = [];

    var ele;

    var literalsAux = [];
    var typedLiteralsAux = [];
    var relationsAux = [];
    var blankNodesAux = [];
    var reverseRelationsAux = [];
    var geometriesAux = [];
    var pointsAux = [];
    var imagesAux = [];

    var found, i;

    var geodata;
    var geoFigure = "";
    var geoPoint = "";


    // Procesamos los valores que sean literales
    for (element in literals) {
        if (literals.hasOwnProperty(element)) {

            ele = {relation: literals[element].relation, value: literals[element].value};
            literalsValues.push(ele);

            found = false;
            for (i = 0; i < literalsAux.length; i++) {
                if (literalsAux[i].url == literals[element].relation.url) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                literalsAux.push(literals[element].relation);
            }
        }
    }

    // Procesamos los valores que sean literales tipados
    for (element in typedLiterals) {
        if (typedLiterals.hasOwnProperty(element)) {

            replaceType(typedLiterals[element].value);

            if (typedLiterals[element].value.datatype == "xsd:boolean"){
                //TODO: Revisar las comillas
                if (typedLiterals[element].value.value){
                    typedLiterals[element].value.value = "\"True\"";
                }
                else{
                    typedLiterals[element].value.value = "\"False\"";
                }
            }

            ele = {relation: typedLiterals[element].relation, value: typedLiterals[element].value};
            typedLiteralsValues.push(ele);

            found = false;
            for (i = 0; i < typedLiteralsAux.length; i++) {
                if (typedLiteralsAux[i].url == typedLiterals[element].relation.url) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                typedLiteralsAux.push(typedLiterals[element].relation);
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
            for (i = 0; i < relationsAux.length; i++) {
                if (relationsAux[i].url == relations[element].relation.url) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                relationsAux.push(relations[element].relation);
            }
        }
    }

    for (element in blankNodes){
        if (blankNodes.hasOwnProperty(element)) {

            //console.log(blankNodes[element]);

            ele = {relation: blankNodes[element].relation, nodeID: JSON.stringify(blankNodes[element].nodeID).replace(new RegExp("\"", 'g'), "")};
            blankNodesValues.push(ele);

            for (i = 0; i < blankNodesAux.length; i++) {
                if (blankNodesAux[i].url == blankNodes[element].relation.url) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                blankNodesAux.push(blankNodes[element].relation);
            }
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
            for (i = 0; i < reverseRelationsAux.length; i++) {
                if (reverseRelationsAux[i].url == reverseRelations[element].relation.url) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                reverseRelationsAux.push(reverseRelations[element].relation);
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
                for (i = 0; i < geometriesAux.length; i++) {
                    if (geometriesAux[i].url == geometries[element].relation.url) {
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    geometriesAux.push(geometries[element].relation);
                }
            }
            catch (err) {
                //TODO: Guardar error en un log (Documentar)
                console.log(err);

                ele = {relation: geometries[element].relation, value: geometries[element].value};
                literalsValues.push(ele);

                //TODO Probar
                found = false;
                for (i = 0; i < literalsAux.length; i++) {
                    if (literalsAux[i].url == geometries[element].relation.url) {
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    literalsAux.push(geometries[element].relation);
                }
            }
        }
    }

    for (element in points){
        if (points.hasOwnProperty(element)) {

            try {
                geodata = geojson.processPoint(points[element].lat.value.value, points[element].long.value.value);

                ele = {value: geodata};
                pointsValues.push(ele);

                pointsAux.push({lat: points[element].lat.relation, long: points[element].long.relation});

                geoPoint = JSON.stringify(pointsValues[0].value)
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
                for (i = 0; i < literalsAux.length; i++) {
                    if (literalsAux[i].url == points[element].lat.relation.url) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    literalsAux.push(points[element].lat.relation);
                }

                found = false;
                for (i = 0; i < literalsAux.length; i++) {
                    if (literalsAux[i].url == points[element].long.relation.url) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    literalsAux.push(points[element].long.relation);
                }

            }

        }
    }

    // Procesamos los valores que sean imagenes
    for (element in images) {
        if (images.hasOwnProperty(element)) {

            ele = {relation: images[element].relation, value: images[element].value};
            imagesValues.push(ele);

            found = false;
            for (i = 0; i < imagesAux.length; i++) {
                if (imagesAux[i].url == images[element].relation.url) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                imagesAux.push(images[element].relation);
            }
        }
    }

    //TODO: Cambiar
    backUri = backUri.replace("opendata.caceres.es","localhost:8080");

    const compiledFunction = pug.compileFile('./pug/content.pug');

    var projectName = configuration.getProperty("projectName")[0].replace(new RegExp("\"", 'g'), "");
    var projectHomePage = configuration.getProperty("projectHomepage")[0];

    //var datasetBase = configuration.getProperty("datasetBase")[0];
    var datasetBase = configuration.getProperty("webBase") + configuration.getProperty("webResourcePrefix")[0].replace(new RegExp("\"", 'g'), "");

    return compiledFunction({
        rTitle: title,
        rUri: uri,
        rBackUri: backUri,
        rTypes: types,

        projectName: projectName,
        projectHomePage: projectHomePage,
        datasetBase: datasetBase,

        literals: literalsValues,
        typedLiterals: typedLiteralsValues,
        relations: relationsValues,
        blankNodes: blankNodesValues,
        reverseRelations: reverseRelationsValues,
        geometries: geometriesValues,
        points: pointsValues,
        images: imagesValues,

        geoFigure: geoFigure,
        geoPoint: geoPoint,

        literalsAux: literalsAux,
        typedLiteralsAux: typedLiteralsAux,
        relationsAux: relationsAux,
        blankNodesAux: blankNodesAux,
        reverseRelationsAux: reverseRelationsAux,
        geometriesAux: geometriesAux,
        pointsAux: pointsAux,
        imagesAux: imagesAux

    });
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

    return compiledFunction({
        rTitle: "404 Not Found",
        rUri: uri,
        rTypes: types,

        projectName: projectName
    });
}