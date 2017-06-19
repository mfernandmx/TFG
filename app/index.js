// app/index.js
const configuration = require('./configuration');
//const querys = require('./querys');

var url = "http://opendata.caceres.es/recurso/urbanismo-infraestructuras/vias/Via/calle_1040";

//configuration.loadConfiguration();
configuration.start(url);
//querys.checkData(url);