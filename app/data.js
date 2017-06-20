
module.exports.processData = processData;
module.exports.processPrefix = processPrefix;
module.exports.getTitleFromURI = getTitleFromURI;

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
    var geometries = [];

    var types = [];

    var relationProcessed, relationTitle;

    console.log("-------------------------");

    for (element in results){
        // Relacion
        if (results.hasOwnProperty(element)) {
            relation = results[element][vars[0]].value;

            relationProcessed = processPrefix(relation);

            //TODO: Comparar relacion con valores para decidir qué hacer
            if (isGeometryAttribute(relation)) {
                //TODO:
                geometries.push({relation: relationProcessed, value: results[element][vars[1]]});
            }
            else if (isType(relation)) {
                types.push(processPrefix(results[element][vars[1]].value));
            }
            else {

                var type = results[element][vars[1]].type;

                if (type == 'literal') {
                    literals.push({relation: relationProcessed, value: results[element][vars[1]]});

                } else if (type == 'typed-literal') {
                    typedLiterals.push({relation: relationProcessed, value: results[element][vars[1]]});

                } else if (type == 'bnode') {
                    //TODO:
                    //TODO: Diferenciar entre 1 o varios
                    //TODO: ¿Varios recursos anónimos anidados?

                } else if (type == 'uri') {

                    //Diferenciamos entre relacion y propiedad
                    var jsonSize = Object.keys(results[element]).length;
                    if (jsonSize == 2) { // Literal de tipo url
                        literals.push({relation: relationProcessed, value: results[element][vars[1]]});
                    }
                    else if (jsonSize > 3) { // Relacion

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

    for (element in results){
        if (results.hasOwnProperty(element)) {
            // Relacion
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

    var title = getResourceTitle(literals);

    if (title == ""){
        title = getTitleFromURI(uri);
    }

    console.log("Title:", title);
    console.log("URI:", uri);
    console.log("Type(s):", types);

    console.log("-------------------------");
    //TODO: Revisar paso de parámetros
    //TODO: Uri en bnodes

    // Arrays ordenados
    template.setContentPug(title, uri, types, literals.sort(function (a, b) {return a.relation.value > b.relation.value;}), relations.sort(function (a, b) {return a.relation.value > b.relation.value;}), typedLiterals.sort(function (a, b) {return a.relation.value > b.relation.value;}), reverseRelations.sort(function (a, b) {return a.relation.value > b.relation.value;}), geometries);

}

function isGeometryAttribute(relation) {
    var isGeometry = false;
    var geometryValues = configuration.getProperty("geoProperty");

    for (var i = 0; i < geometryValues.length; i++){
        if (relation == geometryValues[i]){
            isGeometry = true;
            break;
        }
    }

    return isGeometry;
}

function isType(relation) {
    var type = false;

    if (relation == "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"){
        type = true;
    }

    return type;
}

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

function getTitleFromURI(uri){

    var split = uri.split("/");
    var title = split[split.length - 1];
    title = title.replace(new RegExp("-", 'g'), " ");

    return title;
}