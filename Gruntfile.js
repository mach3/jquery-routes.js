module.exports = function(grunt){

    var fs = require("fs"),
        path = require("path"),
        banner = grunt.template.process(
            grunt.file.read("src/banner.js"),
            {data: grunt.file.readJSON("package.json")}
        );

    grunt.initConfig({

        concat: {
            dist: {
                options: {
                    banner: banner
                },
                files: {
                    "dist/jquery-routes.js": "src/jquery-routes.js"
                }
            }
        },

        uglify: {
            dist: {
                options: {
                    banner: banner
                },
                files: {
                    "dist/jquery-routes.min.js": "src/jquery-routes.js"
                }
            }
        },

        connect: {
            dev: {
                options: {
                    base: "./",
                    port: 8080,
                    hostname: "localhost",
                    keepalive: true,
                    middleware: function(connect, options, middlewares){
                        middlewares.push(function(req, res, next){
                            var file = path.join(options.base[0], req.url);
                            if(! fs.existsSync(file)){
                                switch(true){
                                    case /^\/demo\/path/.test(req.url):
                                        res.end(grunt.file.read("./demo/path/index.html"));
                                        break;
                                    case /^\/demo\/pushstate/.test(req.url):
                                        res.end(grunt.file.read("./demo/pushstate/index.html"));
                                        break;
                                    default:
                                        res.end("Page Not Found.");
                                        break;
                                }
                                return;
                            }
                            next();
                        });
                        return middlewares;
                    }
                }
            }
        }

    });

    grunt.registerTask("default", []);
    grunt.registerTask("build", ["uglify:dist", "concat:dist"]);
    grunt.registerTask("dev", ["connect:dev"]);

    grunt.loadNpmTasks("grunt-contrib-connect");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
};