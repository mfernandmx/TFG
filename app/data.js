
module.exports.processDataForPage = processDataForPage;
module.exports.processData = processData;
module.exports.processPrefix = processPrefix;

const configuration = require('./configuration');
const template = require('./template');
const N3 = require('n3');
const N3Util = N3.Util;

const geoProperty = "geoProperty";
const latProperty = "latProperty";
const typeProperty = "typeProperty";
const nonSpecial = "nonSpecial";


function processDataForPage (data, uri, backUri, blankNode){

    var dataJSON = JSON.parse(data);
    var vars = dataJSON['head']['vars'];
    var results = dataJSON['results']['bindings'];

    var element, relation;

    var literals = [];
    var typedLiterals = [];
    var relations = [];
    var reverseRelations = [];

    var blankNodes = [];

    var geometries = [];
    var points = [];

    var types = [];

    var relationProcessed, relationTitle;

    var finded;

    console.log("-------------------------");

    // Process each element received by the query
    for (element in results){
        if (results.hasOwnProperty(element)) {
            if (results[element].hasOwnProperty(vars[0])) {

                // Relation value between the element and the resource
                relation = results[element][vars[0]].value;

                // Process the relation to separate its name and its prefix
                relationProcessed = processPrefix(relation);

                /*
                 Check if the relation matches with one of the special types contemplated
                 in the configuration. Those types relate to geometric values to be
                 displayed in a map
                 */
                var specialRelation = isSpecialRelation(relation);

                switch (specialRelation) {
                    case geoProperty:
                        geometries.push({relation: relationProcessed, value: results[element][vars[1]]});
                        break;

                    case latProperty:
                        var elementAux, relationAux, valueAux;
                        finded = false;

                        // Find if there is a longitude value to display a point
                        for (elementAux in results) {
                            if (results.hasOwnProperty(elementAux)) {
                                relationAux = results[elementAux][vars[0]].value;

                                if (isSpecificAttribute(relationAux, "longProperty")) {
                                    valueAux = results[elementAux][vars[1]];
                                    relationAux = processPrefix(relationAux);
                                    finded = true;
                                    break;
                                }
                            }
                        }

                        if (finded) {
                            points.push({
                                lat: {relation: relationProcessed, value: results[element][vars[1]]},
                                long: {relation: relationAux, value: valueAux}
                            });
                        } else {
                            //TODO: Guardar fallo en log, y no mostrar (documentar)
                            console.log("Error: Se ha encontrado una propiedad que corresponde" +
                                "a la latitud de un punto pero no se ha encontrado ninguna propiedad " +
                                "que coincida con la longitud");
                        }
                        break;

                    case typeProperty:
                        types.push(processPrefix(results[element][vars[1]].value));
                        break;

                    case nonSpecial:
                        // TODO: Guardar fallo en log, y no mostrar (documentar) - long property sin lat

                        var type = results[element][vars[1]].type;

                        switch (type) {
                            case "literal": // Literal
                                literals.push({relation: relationProcessed, value: results[element][vars[1]]});

                                break;

                            case "typed-literal": // Typed Literal
                                typedLiterals.push({relation: relationProcessed, value: results[element][vars[1]]});

                                break;

                            case "bnode": // Blanck node
                                blankNodes.push({relation: relationProcessed, nodeID: results[element][vars[1]].value});
                                break;

                            case "uri": // Uri - Need to choose between relation or literal url
                                var jsonSize = Object.keys(results[element]).length;

                                if (jsonSize == 2) { // Literal url
                                    literals.push({relation: relationProcessed, value: results[element][vars[1]]});
                                }
                                else if (jsonSize > 3) { // Relation

                                    relationTitle = "";

                                    for (var i = 3; i < vars.length; i++) {

                                        if (results[element][vars[i]] != undefined) {
                                            relationTitle = results[element][vars[i]].value;
                                            break;
                                        }
                                    }

                                    relations.push({
                                        relation: relationProcessed,
                                        value: results[element][vars[1]],
                                        title: relationTitle
                                    });
                                }
                                break;
                        }

                        break;
                }
            }

            /*
             Process each element which is a reverse relation. In this case, all
             elements will be relations between other resources and the resource we
             are processing
             */
            else if (results[element].hasOwnProperty(vars[3])){

                relation = results[element][vars[4]].value;
                relationProcessed = processPrefix(relation);

                relationTitle = "";

                for (i = 5; i < vars.length; i++) {

                    if (results[element][vars[i]] != undefined) {
                        relationTitle = results[element][vars[i]].value;
                        break;
                    }
                }

                reverseRelations.push({
                    relation: relationProcessed,
                    value: results[element][vars[3]],
                    title: relationTitle
                });
            }
        }
    }

    console.log("URI:", uri);
    console.log("BackURI:", backUri);
    console.log("Type(s):", types);

    console.log("-------------------------");

    //TODO: Agrupar arrays y añadir parámetro tipo
    //TODO: Comprobar por qué no se ordenan bien las relaciones
    // Send the data processed to be rendered by the template
    return template.setContentPug(uri, backUri, types,
        literals.sort(function (a, b) {return a.relation.value > b.relation.value;}),
        relations.sort(function (a, b) {return a.relation.value > b.relation.value;}),
        typedLiterals.sort(function (a, b) {return a.relation.value > b.relation.value;}),
        blankNodes.sort(function (a, b) {return a.relation.value > b.relation.value;}),
        reverseRelations.sort(function (a, b) {return a.relation.value > b.relation.value;}),
        geometries, points);

}

function processData(data, uri, blankNode) {

    //TODO: blankNode

    var dataJSON = JSON.parse(data);
    var vars = dataJSON['head']['vars'];
    var results = dataJSON['results']['bindings'];

    var prefixList = configuration.getPrefixList();

    var writer = N3.Writer({ prefixes: prefixList });

    var element;

    for (element in results) {
        if (results.hasOwnProperty(element)) {
            if (results[element].hasOwnProperty(vars[0])) {

                var object = "";

                var type = results[element][vars[1]].type;

                switch (type) {
                    case "literal": // Literal
                        object = N3Util.createLiteral(results[element][vars[1]].value);
                        break;

                    case "typed-literal": // Typed Literal
                        object = N3Util.createLiteral(results[element][vars[1]].value, results[element][vars[1]].datatype);
                        break;

                    case "bnode": // Blanck node
                        //TODO: Nodos en blanco
                        console.log(results[element][vars[1]].value);
                        break;

                    case "uri": // Uri
                        object = results[element][vars[1]].value;
                        break;
                }

                writer.addTriple({
                    subject:   uri,
                    predicate: results[element][vars[0]].value,
                    object:    object
                });
            }

            // TODO: Comprobar si es aconsejable
            else if (results[element].hasOwnProperty(vars[3])){
                writer.addTriple({
                    subject:   results[element][vars[3]].value,
                    predicate: results[element][vars[4]].value,
                    object:    uri
                });
            }
        }
    }

    var triples;

    //TODO: Excepción en el error
    writer.end(function (error, result) {
        triples = result;
    });

    return triples;

}

function isSpecialRelation(relation){

    var specialRelation = "";

    if (isSpecificAttribute(relation, "geoProperty")) { // Geometric attribute
        specialRelation = geoProperty;
    }
    else if (isSpecificAttribute(relation, "latProperty")){ // Latitude attribute
        specialRelation = latProperty;
    }
    else if (isType(relation)) { // Resource's type
        specialRelation = typeProperty;
    }
    else if (!isSpecificAttribute(relation, "longProperty")) { // If the relation doesn't match with any special type
        specialRelation = nonSpecial;
    }

    return specialRelation;
}

/*
Given a relation and a property, it checks if the relation matches with any of the
values given in the property set in the configuration file
 */
function isSpecificAttribute(relation, property) {
    var isSpecific = false;
    var propertyValues = configuration.getProperty(property);

    for (var i = 0; i < propertyValues.length; i++){
        if (relation == propertyValues[i]){
            isSpecific = true;
            break;
        }
    }

    return isSpecific;
}

/*
Given a relation, it determines if is type relation or not
 */
function isType(relation) {
    var type = false;

    if (relation == "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"){
        type = true;
    }

    return type;
}

/*
Given a relation, it will be split in order to get the prefix and the ontology separate
 */
function processPrefix(relation) {

    var prefix, value;

    var contains = relation.includes("#");
    var split;

    if (contains){
        split = relation.split("#");
        prefix = split[0] + "#";
        value = split[1];
    }
    else {
        split = relation.split("/");
        prefix = relation.substring(0,relation.lastIndexOf("/")+1);
        value = split[split.length - 1];
    }

    prefix = configuration.getPrefixFromConf(prefix);

    if (prefix == ""){
        prefix="?";
    }

    return {prefix: prefix, value: value, url: relation};
}