
module.exports.start = start;
module.exports.getProperty = getProperty;
module.exports.getPrefixFromConf = getPrefixFromConf;

const N3 = require('n3');
const fs = require('fs');

var prefixList;
var properties = {};

const querys = require('./querys');
const confPrefix = "http://richard.cyganiak.de/2007/pubby/config.rdf#";

function start(url){

    var parser = N3.Parser(),
        rdfStream = fs.createReadStream('./config/config.ttl');
    parser.parse(rdfStream, function (error, triple, prefixes) {
        if (triple) {
            //console.log(triple.subject, triple.predicate, triple.object, '.');

            var key = "";

            if (triple.predicate.includes(confPrefix)){
                key = triple.predicate.substring(confPrefix.length,triple.predicate.length);
                if (properties[key] == null) {
                    properties[key] = [triple.object];
                }
                else{
                    properties[key].push(triple.object);
                }
            }
        }
        else{
            prefixList = prefixes;
            querys.checkData(url);
        }
    });
}

function getProperty(propertyName){
    var value = "";

    if (properties[propertyName] != null){
        value = properties[propertyName];
    }

    return value;
}

function getPrefixFromConf(prefix) {

    var values = Object.keys(prefixList).map(function(key) {
        return prefixList[key];
    });

    var position = valuePosition(prefix,values);
    var newPrefix = "";
    var keys = Object.keys(prefixList);

    if (position >= 0 && position < keys.length) {
        newPrefix = keys[position];
    }

    return newPrefix;
}

function valuePosition(value, myArray){

    var position = -1;

    for (var i=0; i < myArray.length; i++) {
        if (myArray[i] === value) {
            position = i;
        }
    }

    return position;
}