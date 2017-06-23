// app/query.js

module.exports.getData = getData;


const data = require('./data');
const configuration = require('./configuration');
const template = require('./template');

//const request = require('request');
const request = require('sync-request');

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

    var endpoint = configuration.getProperty("sparqlEndpoint");

    //TODO Intentar agrupar las dos consultas en una
    var res = request('GET', endpoint+"?default-graph-uri=&query="+sparqlQuery+"&format=json");

    var status = res.statusCode;

    console.log('statusCode:', res && status); // Print the response status code if a response was received

    var dataJSON = JSON.parse(res.getBody());
    var results = dataJSON['results']['bindings'];
    if (results.length > 0) {

        console.log("ES TRUE!", status);

        querySelect = "SELECT ?p ?o ";
        queryWhere = "WHERE {?p ?o <" + uri + ">. ";
        queryEnd = "}";

        for (prefix in prefixes) {
            if (prefixes.hasOwnProperty(prefix)) {
                prefixProcessed = data.processPrefix(prefixes[prefix]);

                querySelect += "?" + prefixProcessed.value + " ";
                queryWhere += "OPTIONAL{?p " + prefixProcessed.prefix + ":" + prefixProcessed.value + " ?" + prefixProcessed.value + ". }. ";
            }
        }

        sparqlQuery = querySelect + queryWhere + queryEnd;
        console.log(sparqlQuery);

        var reverseRes = request('GET', endpoint + "?default-graph-uri=&query=" + sparqlQuery + "&format=json");

        console.log('statusCode:', reverseRes && reverseRes.statusCode); // Print the response status code if a response was received

        html = data.processData(res.getBody(), reverseRes.getBody(), uri);
    }

    else{
        //TODO: Revisar qué código pasar
        console.log("ES FALSE!", status);
        html = template.setError404(uri);
    }

    return {status: status, html: html};
}