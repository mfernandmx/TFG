
const http = require('http');
const fs = require("fs");

const configuration = require('./configuration');
const querys = require('./querys');


//TODO: Ver si se puede mejorar con express
http.createServer(function(request, response) {

    // var headers = request.headers;
    // var method = request.method;
    var url = request.url;
    var body = [];

    //TODO: Control de errores
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

    console.log("URL recibida:", url);

    var resource = configuration.getProperty("webResourcePrefix");

    // Replace each " for empty char
    resource = resource[0].replace(new RegExp("\"", 'g'), "");
    resource = "/" + resource;

    var pathname = url.split("/");
    pathname = pathname[pathname.length-1];
    console.log("Pathname:", pathname);

    var script, css;

    if (pathname == "client.js") {
        response.writeHead(200, {'Content-Type': 'application/javascript; charset=utf-8'});
        script = fs.readFileSync("./client/client.js", "utf8");
        response.write(script);
    }
    else if (pathname == "changeView.js") {
        response.writeHead(200, {'Content-Type': 'application/javascript; charset=utf-8'});
        script = fs.readFileSync("./client/changeView.js", "utf8");
        response.write(script);
    }
    else if (pathname == "style.css"){
        response.writeHead(200, {'Content-Type': 'text/css; charset=utf-8'});
        css = fs.readFileSync("./stylesheets/style.css", "utf8");
        response.write(css);
    }
    else if (url.startsWith(resource)){ // Starts with ../recurso/

        var datasetBase = configuration.getProperty("datasetBase");
        var result;

        var backUri = "";

        if (url.includes("?")){
            var split = url.split("?");
            url = split[0];
            var parameters = split[1];
            parameters = parameters.split("&");

            for (var parameter in parameters){
                if (parameters.hasOwnProperty(parameter)){

                    if (parameters[parameter].startsWith("backUri=")) {
                        backUri = parameters[parameter].replace("backUri=", "");
                        console.log("BackURI:", backUri);
                    }
                }
            }
        }

        if (url.startsWith(resource + "page/")) {
            url = url.replace(resource + "page/", datasetBase);
            console.log("URL de consulta:",url);

            result = querys.getData(url, backUri, "page");

            response.writeHead(result.status, {'Content-Type': 'text/html; charset=utf-8'});
            response.write(result.html);
        }
        else if (url.startsWith(resource + "data/")){
            url = url.replace(resource + "data/", datasetBase);
            console.log("URL de consulta:",url);

            result = querys.getData(url, backUri, "data");

            response.writeHead(result.status, {'Content-Type': 'text/plain; charset=utf-8'});
            response.write(result.data);
        }
        else{
            //TODO: Cambiar
            url = url.replace(resource, datasetBase[0].replace("opendata.caceres.es","localhost:8080") + "page/");
            //url = url.replace(resource, datasetBase + "page/");

            if (backUri != ""){
                url += "?backUri=" + backUri;
            }

            response.writeHead(301,
                {Location: url}
            );
        }

    }
    else{
        //TODO:
    }

    response.end();

}).listen(8080); // Activates this server, listening on port 8080.
