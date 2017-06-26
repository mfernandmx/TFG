
const http = require('http');
const fs = require("fs");

const configuration = require('./configuration');

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
    });

    response.on('error', function(err) {
        console.error(err);
    });

    var resource = configuration.getProperty("webResourcePrefix");
    resource = resource[0].replace(new RegExp("\"", 'g'), "");
    console.log(url);
    resource = "/" + resource;

    var pathname = url.split("/");
    pathname = pathname[pathname.length-1];
    console.log("Pathname", pathname);

    //TODO:
    if (pathname == "client.js") {
        console.log("Entro en script");
        var script = fs.readFileSync("./client/client.js", "utf8");
        response.write(script);
    }
    else if (url.startsWith(resource)){
        //TODO: Si empieza por /recurso/, procesar petición

        var datasetBase = configuration.getProperty("datasetBase");

        url = url.replace(resource, datasetBase);
        console.log(url);

        var result = querys.getData(url);

        response.writeHead(result.status, {'Content-Type': 'text/html; charset=utf-8'});
        response.write(result.html);

    }
    else{
        //TODO:
    }

    response.end();

}).listen(8080); // Activates this server, listening on port 8080.
