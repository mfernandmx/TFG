
const http = require('http');
const configuration = require('./configuration');

var urlOD = "http://opendata.caceres.es/recurso/urbanismo-infraestructuras/vias/RecorridoVia/recorrido-calle_1040";

const querys = require('./querys');

http.createServer(function(request, response) {

    // var headers = request.headers;
    // var method = request.method;
    var url = request.url;
    var body = [];

    request.on('error', function(err) {
        console.error(err);
    }).on('data', function(chunk) {
        body.push(chunk);
    }).on('end', function() {
        body = Buffer.concat(body).toString();
        // At this point, we have the headers, method, url and body, and can now
        // do whatever we need to in order to respond to this request.
    });

    response.on('error', function(err) {
        console.error(err);
    });

    var resource = configuration.getProperty("webResourcePrefix");
    resource = resource[0].replace(new RegExp("\"", 'g'), "");
    console.log(url);
    console.log(resource);
    resource = "/" + resource;
    console.log(resource);

    if (url.startsWith(resource)){
        //TODO: Si empieza por /recurso/, procesar petición

        var datasetBase = configuration.getProperty("datasetBase");

        url = url.replace(resource, datasetBase);
        console.log(url);

        // var result = querys.checkData(urlOD);
        var result = querys.checkData(url);

        //console.log("RESULT:", result);

        response.writeHead(result.status, {'Content-Type': 'text/html; charset=utf-8'});

        response.end(result.html);

    }
    else{
        //TODO:
    }

    // var responseBody = {
    //     headers: headers,
    //     method: method,
    //     url: url,
    //     body: body
    // };
    //
    // response.write(JSON.stringify(responseBody));
    // response.end();
    // // Note: the 2 lines above could be replaced with this next one:

}).listen(8080); // Activates this server, listening on port 8080.
