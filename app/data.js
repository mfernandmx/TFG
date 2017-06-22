
module.exports.processData = processData;
module.exports.processPrefix = processPrefix;

const configuration = require('./configuration');
const template = require('./template');


function processData (data, dataReverse, uri){

    var dataJSON = JSON.parse(data);
    var dataReverseJSON = JSON.parse(dataReverse);

    var vars = dataJSON['head']['vars'];

    var results = dataJSON['results']['bindings'];

    var element, relation;

    var literals = [];
    var typedLiterals = [];
    var relations = [];
    var reverseRelations = [];
    //TODO: Array u objeto? (Futuros trabajos)
    var geometries = [];
    var points = [];

    var types = [];

    var relationProcessed, relationTitle;

    var finded;

    console.log("-------------------------");

    // Process each element received by the query
    for (element in results){
        if (results.hasOwnProperty(element)) {

            // Relation value between the element and the resource
            relation = results[element][vars[0]].value;

            // Process the relation to separate its name and its prefix
            relationProcessed = processPrefix(relation);

            /*
             Check if the relation matches with one of the special types contemplated
             in the configuration. Those types relate to geometric values to be
             displayed in a map
            */
            if (isSpecificAttribute(relation, "geoProperty")) { // Geometric attribute
                geometries.push({relation: relationProcessed, value: results[element][vars[1]]});
            }
            else if (isSpecificAttribute(relation, "latProperty")){ // Latitude attribute

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

                if (finded){
                    points.push({lat: {relation: relationProcessed, value: results[element][vars[1]]},long: {relation: relationAux, value: valueAux}});
                } else{
                    //TODO: Guardar fallo en log, y no mostrar (documentar)
                    console.log("Error: Se ha encontrado una propiedad que corresponde a la latitud de un punto pero " +
                        "no se ha encontrado ninguna propiedad que coincida con la longitud");
                }
            }
            else if (isType(relation)) { // Resource's type
                types.push(processPrefix(results[element][vars[1]].value));
            }
            else if (!isSpecificAttribute(relation, "longProperty")){ // If the relation doesn't match with any special type
                // TODO: Ver si se puede comprobar que no exista un lat
                // TODO: Guardar fallo en log, y no mostrar (documentar)

                var type = results[element][vars[1]].type;

                if (type == 'literal') { // Literal
                    literals.push({relation: relationProcessed, value: results[element][vars[1]]});

                } else if (type == 'typed-literal') { // Typed Literal
                    typedLiterals.push({relation: relationProcessed, value: results[element][vars[1]]});

                } else if (type == 'bnode') { // Blanck node
                    //TODO:
                    //TODO: Diferenciar entre 1 o varios
                    //TODO: ¿Varios recursos anónimos anidados?

                } else if (type == 'uri') { // Uri - Need to choose between relation or literal url

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
                }
            }
        }
    }

    vars = dataReverseJSON['head']['vars'];
    results = dataReverseJSON['results']['bindings'];

    /*
     Process each element received by the reverse query. In this case, all
     elements will be relations between other resources and the resource we
     are processing
    */
    for (element in results){
        if (results.hasOwnProperty(element)) {

            relation = results[element][vars[1]].value;
            relationProcessed = processPrefix(relation);

            relationTitle = "";

            for (i = 2; i < vars.length; i++) {

                if (results[element][vars[i]] != undefined) {
                    relationTitle = results[element][vars[i]].value;
                    break;
                }
            }

            reverseRelations.push({
                relation: relationProcessed,
                value: results[element][vars[0]],
                title: relationTitle
            });
        }
    }

    // Search for resource's title
    var title = getResourceTitle(literals);

    /*
     If there is no attribute that matches with the titles properties,
     it is generated by the uri
      */
    if (title == ""){
        title = getTitleFromURI(uri);
    }

    console.log("Title:", title);
    console.log("URI:", uri);
    console.log("Type(s):", types);

    console.log("-------------------------");

    //TODO: Revisar paso de parámetros
    //TODO: Uri en bnodes

    // Send the data processed to be rendered by the template
    return template.setContentPug(title, uri, types, literals.sort(function (a, b) {return a.relation.value > b.relation.value;}), relations.sort(function (a, b) {return a.relation.value > b.relation.value;}), typedLiterals.sort(function (a, b) {return a.relation.value > b.relation.value;}), reverseRelations.sort(function (a, b) {return a.relation.value > b.relation.value;}), geometries, points);

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

/*
Given a set of literals, it searches for the label/title properties in the configuration file
If there is any match, the title will be set for the resource
If not, and empty string will be returned
 */
function getResourceTitle(literals){

    var title = "";
    var prefixes = configuration.getProperty("labelProperty");
    var finded = false;
    var prefix, literal;

    for (prefix in prefixes) {
        if (prefixes.hasOwnProperty(prefix)) {
            for (literal in literals) {
                if (literals.hasOwnProperty(literal)) {
                    if (literals[literal].relation.url == prefixes[prefix]) {
                        finded = true;
                        title = literals[literal].value.value;
                    }
                    if (finded)
                        break;
                }
            }
            if (finded)
                break;
        }
    }

    return title;
}

/*
Given an uri, it splits it to get the last part of the uri
in order to create a title for the resource
 */
function getTitleFromURI(uri){

    var split = uri.split("/");
    var title = split[split.length - 1];
    title = title.replace(new RegExp("-", 'g'), " ");

    return title;
}