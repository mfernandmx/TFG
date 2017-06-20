// app/index.js
const configuration = require('./configuration');
//const querys = require('./querys');

var url = "http://opendata.caceres.es/recurso/urbanismo-infraestructuras/barrios/AreaBarrio/area-0";

//configuration.loadConfiguration();
configuration.start(url);
//querys.checkData(url);