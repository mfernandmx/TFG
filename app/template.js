
module.exports.setContentPug = setContentPug;

const configuration = require('./configuration');
const data = require('./data');
const pug = require('pug');

function setContentPug(title, uri, types, literals, relations, typedLiterals, reverseRelations){

    //TODO Atributos o relaciones multivaluadas
    //TODO Language

    var element;
    var literalsValues = [];
    var typedLiteralsValues = [];
    var relationsValues = [];
    var reverseRelationsValues = [];

    var ele;

    var literalsAux = [];
    var typedLiteralsAux = [];
    var relationsAux = [];
    var reverseRelationsAux = [];

    var found, i;


    // Procesamos los valores que sean literales
    for (element in literals) {
        //var ele  = {type: literals[element]["p"].value, value: literals[element]["o"].value};

        ele  = {relation: literals[element].relation, value: literals[element].value};
        literalsValues.push(ele);

        found = false;
        for(i = 0; i < literalsAux.length; i++) {
            if (literalsAux[i].url == literals[element].relation.url) {
                found = true;
                break;
            }
        }

        if (!found){
            literalsAux.push(literals[element].relation);
        }
    }

    // Procesamos los valores que sean literales tipados
    for (element in typedLiterals) {
        //var ele  = {type: typedLiterals[element]["p"].value, value: typedLiterals[element]["o"].value, dataType: typedLiterals[element]["o"].datatype};
        replaceType(typedLiterals[element].value);
        ele  = {relation: typedLiterals[element].relation, value: typedLiterals[element].value};
        typedLiteralsValues.push(ele);

        found = false;
        for(i = 0; i < typedLiteralsAux.length; i++) {
            if (typedLiteralsAux[i].url == typedLiterals[element].relation.url) {
                found = true;
                break;
            }
        }

        if (!found){
            typedLiteralsAux.push(typedLiterals[element].relation);
        }
    }

    // Procesamos los valores que sean relaciones
    for (element in relations) {
        //var ele  = {type: relations[element]["p"].value, value: relations[element]["o"].value};

        relations[element].value.url = relations[element].value.value;

        if (relations[element].title != ""){
            relations[element].value.value = relations[element].title;
        }

        ele  = {relation: relations[element].relation, value: relations[element].value};
        relationsValues.push(ele);

        found = false;
        for(i = 0; i < relationsAux.length; i++) {
            if (relationsAux[i].url == relations[element].relation.url) {
                found = true;
                break;
            }
        }

        if (!found){
            relationsAux.push(relations[element].relation);
        }
    }

    console.log("Relaciones: ", relationsAux);

    for (element in reverseRelations){

        reverseRelations[element].value.url = reverseRelations[element].value.value;

        if (reverseRelations[element].title != ""){
            reverseRelations[element].value.value = reverseRelations[element].title;
        }

        ele  = {relation: reverseRelations[element].relation, value: reverseRelations[element].value};
        reverseRelationsValues.push(ele);

        found = false;
        for(i = 0; i < reverseRelationsAux.length; i++) {
            if (reverseRelationsAux[i].url == reverseRelations[element].relation.url) {
                found = true;
                break;
            }
        }

        if (!found){
            reverseRelationsAux.push(reverseRelations[element].relation);
        }
    }

    const compiledFunction = pug.compileFile('./pug/content.pug');

    var html = compiledFunction({
        rTitle: title,
        rUri: uri,
        rTypes: types,

        literals: literalsValues,
        typedLiterals: typedLiteralsValues,
        relations: relationsValues,
        reverseRelations: reverseRelationsValues,

        literalsAux: literalsAux,
        typedLiteralsAux: typedLiteralsAux,
        relationsAux: relationsAux,
        reverseRelationsAux: reverseRelationsAux

    });

    // Render a set of data
    console.log(html);
}

function replaceType(literal) {

    //TODO: Revisar
    switch (literal.datatype){
        case "http://www.w3.org/2001/XMLSchema#int":
            literal.datatype = "xsd:integer";
            break;
        case "http://www.w3.org/2001/XMLSchema#decimal":
            literal.datatype = "xsd:decimal";
            break;
        case "http://www.w3.org/2001/XMLSchema#double":
            literal.datatype = "xsd:double";
            break;
        case "http://www.w3.org/2001/XMLSchema#boolean":
            literal.datatype = "xsd:boolean";
            break;
    }
}