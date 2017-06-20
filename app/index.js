// app/index.js
const configuration = require('./configuration');
//const querys = require('./querys');

var url = "http://opendata.caceres.es/recurso/salud/farmacias/Farmacia/33-maria-luisa-picado-dominguez";

//configuration.loadConfiguration();
configuration.start(url);
//querys.checkData(url);