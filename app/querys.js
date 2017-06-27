
module.exports.getData = getData;

const data = require('./data');
const configuration = require('./configuration');
const template = require('./template');

//const request = require('request');
const request = require('sync-request');

// blankNode - true or false
function getData (uri) {

    var html;

    var object = {uri: uri};

    var blankNode = isBlankNode(object);

    if (blankNode){
        uri = object.uri;
    }

    var querySelect = "SELECT ?p ?o min(?m) as ?m ?x ?y ";
    var queryWhere = "WHERE{ ";
    var queryDirect = "{<"+uri+"> ?p ?o . " +
                        "OPTIONAL{?o ?n ?m.}";
    var queryUnion = "} UNION ";
    var queryReverse = "{?x ?y <"+uri+">. ";
    var queryEnd = "}}";

    var prefixes = configuration.getProperty("labelProperty");
    var prefix;
    var prefixProcessed;

    if (prefixes.length > 0){
        queryEnd += " ORDER BY ";
    }

    for (prefix in prefixes){
        if (prefixes.hasOwnProperty(prefix)) {
            prefixProcessed = data.processPrefix(prefixes[prefix]);

            querySelect += "?" + prefixProcessed.value + " ";
            queryDirect += "OPTIONAL{?o " + prefixProcessed.prefix + ":" + prefixProcessed.value + " ?" + prefixProcessed.value + ". }. ";
            queryReverse += "OPTIONAL{?x " + prefixProcessed.prefix + ":" + prefixProcessed.value + " ?" + prefixProcessed.value + ". }. ";

            queryEnd += " ?" + prefixProcessed.value;
        }
    }

    var sparqlQuery = querySelect + queryWhere + queryDirect + queryUnion + queryReverse + queryEnd;
    console.log(sparqlQuery);

    var endpoint = configuration.getProperty("sparqlEndpoint");

    var res = request('GET', endpoint+"?default-graph-uri=&query="+sparqlQuery+"&format=json");

    var status = res.statusCode;

    console.log('statusCode:', res && status); // Print the response status code if a response was received

    var dataJSON = JSON.parse(res.getBody());
    var results = dataJSON['results']['bindings'];
    if (results.length > 0) {

        console.log("ES TRUE!", status);
        html = data.processData(res.getBody(), uri, blankNode);
    }

    else{
        //TODO: Revisar qué código pasar
        console.log("ES FALSE!", status);
        html = template.setError404(uri);
    }

    return {status: status, html: html};
}

function isBlankNode(object) {

    var blankNode = false;

    var datasetBase = configuration.getProperty("datasetBase");
    console.log(datasetBase);
    console.log("length:", datasetBase.length);

    var uriAux = object.uri.substr(datasetBase[0].length);

    console.log(uriAux);

    if (uriAux.startsWith("nodeID")){
        object.uri = uriAux;
        blankNode = true;
        console.log("Es un nodo en blanco");
    }

    return blankNode;
}