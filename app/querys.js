// app/query.js

module.exports.checkData = checkData;

const data = require('./data');
const configuration = require('./configuration');
const template = require('./template');

const request = require('request');

var queryGraph = ""; // TODO: Obtener query graph del archivo de config
var endpoint; //TODO: Revisar si se puede obtener una sola vez

function checkData (uri) {
    var sparqlQuery = "ASK {<"+uri+"> ?a ?b.}";

    endpoint = configuration.getProperty("sparqlEndpoint");

    request(endpoint+"?default-graph-uri="+queryGraph+"&query="+sparqlQuery, function (error, response, body) {
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received

        if (body == "true") {
            console.log("ES TRUE!");
            getData(uri);
        }

        else{
            console.log("ES FALSE!");
            template.setError404(uri);
        }

    });
}

function getData (uri) {
    //var sparqlQuery = "CONSTRUCT {<"+uri+"> ?p ?o.} WHERE {<"+uri+"> ?p ?o .}";

    var querySelect = "SELECT ?p ?o min(?m) as ?m ";
    var queryWhere = "WHERE{ " +
                    "<"+uri+"> ?p ?o . " +
                    "OPTIONAL{?o ?n ?m.} ";
    var queryEnd = "}";

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
            queryWhere += "OPTIONAL{?o " + prefixProcessed.prefix + ":" + prefixProcessed.value + " ?" + prefixProcessed.value + ". }. ";

            queryEnd += " ?" + prefixProcessed.value;
        }
    }

    var sparqlQuery = querySelect + queryWhere + queryEnd;
    console.log(sparqlQuery);

    endpoint = configuration.getProperty("sparqlEndpoint");

    request(endpoint+"?default-graph-uri="+queryGraph+"&query="+sparqlQuery+"&format=json", function (error, response, body) {
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received

        querySelect = "SELECT ?p ?o ";
        queryWhere = "WHERE {?p ?o <"+uri+">. ";
        queryEnd = "}";

        for (prefix in prefixes){
            if (prefixes.hasOwnProperty(prefix)) {
                prefixProcessed = data.processPrefix(prefixes[prefix]);

                querySelect += "?" + prefixProcessed.value + " ";
                queryWhere += "OPTIONAL{?p " + prefixProcessed.prefix + ":" + prefixProcessed.value + " ?" + prefixProcessed.value + ". }. ";
            }
        }

        sparqlQuery = querySelect + queryWhere + queryEnd;
        console.log(sparqlQuery);

        //sparqlQuery = "CONSTRUCT {?p ?o <"+uri+">.} WHERE {?p ?o <"+uri+">.}";

        request(endpoint+"?default-graph-uri="+queryGraph+"&query="+sparqlQuery+"&format=json", function (error, response, bodyReverse) {
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received

            console.log(body);
            data.processData(body, bodyReverse, uri);
        });
    });
}