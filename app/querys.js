// app/query.js

module.exports.checkData = checkData;
module.exports.getRelationData = getRelationData;

const data = require('./data');
const configuration = require('./configuration');

var queryGraph = "";

var endpoint; //TODO:
var request = require('request');

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
            //TODO: Pagina 404
            console.log("ES FALSE!");
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

    for (prefix in prefixes){
        prefixProcessed =  data.processPrefix(prefixes[prefix]);

        querySelect += "?" + prefixProcessed.value + " ";
        queryWhere += "OPTIONAL{?o "+prefixProcessed.prefix+":"+prefixProcessed.value+" ?"+prefixProcessed.value+". }. "
    }

    var sparqlQuery = querySelect + queryWhere + queryEnd;
    console.log(sparqlQuery);

    //var sparqlQuery = "SELECT ?p ?o min(?m) as ?m WHERE{ " +
    //                "<"+uri+"> ?p ?o ." +
    //                "OPTIONAL{?o ?n ?m.}" +
    //                "}";

    endpoint = configuration.getProperty("sparqlEndpoint");

    request(endpoint+"?default-graph-uri="+queryGraph+"&query="+sparqlQuery+"&format=json", function (error, response, body) {
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        //console.log('body:', body); // Print the HTML for the Google homepage.

        querySelect = "SELECT ?p ?o ";
        queryWhere = "WHERE {?p ?o <"+uri+">. ";
        queryEnd = "}";

        for (prefix in prefixes){
            prefixProcessed =  data.processPrefix(prefixes[prefix]);

            querySelect += "?" + prefixProcessed.value + " ";
            queryWhere += "OPTIONAL{?p "+prefixProcessed.prefix+":"+prefixProcessed.value+" ?"+prefixProcessed.value+". }. "
        }

        sparqlQuery = querySelect + queryWhere + queryEnd;
        console.log(sparqlQuery);

        //sparqlQuery = "CONSTRUCT {?p ?o <"+uri+">.} WHERE {?p ?o <"+uri+">.}";

        request(endpoint+"?default-graph-uri="+queryGraph+"&query="+sparqlQuery+"&format=json", function (error, response, bodyReverse) {
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            //console.log('body:', bodyReverse); // Print the HTML for the Google homepage.

            console.log(body);
            data.processData(body, bodyReverse, uri);
        });
    });
}

//TODO Borrar
function getRelationData(uri){

    var sparqlQuery = "SELECT ?p ?o WHERE{"+
        "<"+uri+"> ?p ?o .}";

    endpoint = configuration.getProperty("sparqlEndpoint");

    request(endpoint+"?default-graph-uri="+queryGraph+"&query="+sparqlQuery+"&format=json", function (error, response, body) {
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received

        console.log(body);

        return body;
    });
}