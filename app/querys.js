// app/query.js

module.exports.checkData = checkData;

const data = require('./data');
const configuration = require('./configuration');
const template = require('./template');

//const request = require('request');
const request = require('sync-request');

var endpoint; //TODO: Revisar si se puede obtener una sola vez

function checkData (uri) {
    var sparqlQuery = "ASK {<"+uri+"> ?a ?b.}";

    endpoint = configuration.getProperty("sparqlEndpoint");

    var html;

    // request(endpoint+"?default-graph-uri="+queryGraph+"&query="+sparqlQuery, function (error, response, body) {
    //     console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    //
    //     if (body == "true") {
    //         console.log("ES TRUE!");
    //         getData(uri);
    //     }
    //
    //     else{
    //         console.log("ES FALSE!");
    //         template.setError404(uri);
    //     }
    //
    //     prueba = "ADIOS";
    //
    // });

    var res = request('GET', endpoint+"?default-graph-uri=&query="+sparqlQuery);
    var body = res.getBody();
    var status = res.statusCode;

    console.log('statusCode:', res && res.statusCode); // Print the response status code if a response was received

    if (body == "true") {
        console.log("ES TRUE!", status);
        html = getData(uri);
    }

    else{
        console.log("ES FALSE!", status);
        html = template.setError404(uri);
    }

    return {status: status, html: html};

}

function getData (uri) {

    var html;

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

    // request(endpoint+"?default-graph-uri="+queryGraph+"&query="+sparqlQuery+"&format=json", function (error, response, body) {
    //     console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    //
    //     querySelect = "SELECT ?p ?o ";
    //     queryWhere = "WHERE {?p ?o <"+uri+">. ";
    //     queryEnd = "}";
    //
    //     for (prefix in prefixes){
    //         if (prefixes.hasOwnProperty(prefix)) {
    //             prefixProcessed = data.processPrefix(prefixes[prefix]);
    //
    //             querySelect += "?" + prefixProcessed.value + " ";
    //             queryWhere += "OPTIONAL{?p " + prefixProcessed.prefix + ":" + prefixProcessed.value + " ?" + prefixProcessed.value + ". }. ";
    //         }
    //     }
    //
    //     sparqlQuery = querySelect + queryWhere + queryEnd;
    //     console.log(sparqlQuery);
    //
    //     //sparqlQuery = "CONSTRUCT {?p ?o <"+uri+">.} WHERE {?p ?o <"+uri+">.}";
    //
    //     request(endpoint+"?default-graph-uri="+queryGraph+"&query="+sparqlQuery+"&format=json", function (error, response, bodyReverse) {
    //         console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    //
    //         html = data.processData(body, bodyReverse, uri);
    //     });
    // });

    var res = request('GET', endpoint+"?default-graph-uri=&query="+sparqlQuery+"&format=json");

    console.log('statusCode:', res && res.statusCode); // Print the response status code if a response was received

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

    var reverseRes = request('GET', endpoint+"?default-graph-uri=&query="+sparqlQuery+"&format=json");

    console.log('statusCode:', reverseRes && reverseRes.statusCode); // Print the response status code if a response was received

    html = data.processData(res.getBody(), reverseRes.getBody(), uri);

    return html;
}