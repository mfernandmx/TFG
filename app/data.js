
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

    var types = [];

    console.log("-------------------------");

    for (element in results){
        // Relacion
        relation = results[element][vars[0]].value;

        var relationProcessed = processPrefix(relation);

        //TODO: Comparar relacion con valores para decidir qué hacer
        if (isGeometryAttribute(relation)){

        }
        else if(isType(relation)){
            types.push(processPrefix(results[element][vars[1]].value));
        }
        else{

            // Valor
            //console.log(results[element][vars[1]].value);

            var type = results[element][vars[1]].type;

            if (type == 'literal') {
                //literals.push(results[element]);
                literals.push({relation: relationProcessed, value: results[element][vars[1]]});

            } else if (type == 'typed-literal'){
                typedLiterals.push({relation: relationProcessed, value: results[element][vars[1]]});

            } else if (type == 'bnode'){
                //TODO:
                //TODO: Diferenciar entre 1 o varios
                //TODO: ¿Varios recursos anónimos anidados?

            } else if (type == 'uri'){

                //Diferenciamos entre relacion y propiedad
                var jsonSize = Object.keys(results[element]).length;
                if (jsonSize == 2){ // Literal de tipo url
                    //literals.push(results[element]);
                    literals.push({relation: relationProcessed, value: results[element][vars[1]]});
                }
                else if (jsonSize > 3){ // Relacion

                    var relationTitle = "";

                    for (var i = 3; i < vars.length; i++){

                        if (results[element][vars[i]] != undefined){
                            relationTitle = results[element][vars[i]].value;
                            break;
                        }
                    }

                    relations.push({relation: relationProcessed, value: results[element][vars[1]], title: relationTitle});
                }
            }
        }
    }

    vars = dataReverseJSON['head']['vars'];
    results = dataReverseJSON['results']['bindings'];

    for (element in results){
        // Relacion
        relation = results[element][vars[1]].value;
        var relationProcessed = processPrefix(relation);

        var relationTitle = "";

        for (var i = 2; i < vars.length; i++){

            if (results[element][vars[i]] != undefined){
                relationTitle = results[element][vars[i]].value;
                break;
            }
        }

        reverseRelations.push({relation: relationProcessed, value: results[element][vars[0]], title: relationTitle});
    }

    var title = getResourceTitle(literals);

    if (title == ""){
        title = getTitleFromURI(uri);
    }

    console.log("Title:", title);
    console.log("URI:", uri);
    console.log("Type(s):", types);

    console.log(relations);

    console.log("-------------------------");
    //TODO: Revisar paso de parámetros
    //TODO: Uri en bnodes
    template.setContentPug(title, uri, types, literals, relations, typedLiterals, reverseRelations);

}

function isGeometryAttribute(relation) {
    var geometry = false;

    //TODO: Recorrer config y comparar con propiedades geometricos

    return geometry;
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

    var relationProcessed = {prefix: prefix, value: value, url: relation};

    return relationProcessed;
}

function getResourceTitle(literals){

    var title = "";
    var prefixes = configuration.getProperty("labelProperty");
    var finded = false;
    var prefix, literal;

    for (prefix in prefixes){
        for (literal in literals){
            if (literals[literal].relation.url == prefixes[prefix]){
                finded = true;
                title = literals[literal].value.value;
            }
            if (finded)
                break
        }
        if (finded)
            break
    }

    return title;
}

function getTitleFromURI(uri){

    var split = uri.split("/");
    var title = split[split.length - 1];
    title = title.replace(new RegExp("-", 'g'), " ");

    return title;
}