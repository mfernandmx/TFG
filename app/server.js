
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

    if (url.startsWith("")){
        //TODO: Si empieza por /recurso/, procesar petición
    }

    var result = querys.checkData(urlOD);
    console.log("RESULT:", result);

    response.writeHead(result.status, {'Content-Type': 'text/html'});

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
    response.end(result.html);

    // END OF NEW STUFF

}).listen(8080); // Activates this server, listening on port 8080.
