/* jshint node:true */

"use strict";

var gulp = require("gulp");
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var deploy = require("gulp-gh-pages");

var extend = require('util')._extend;

var opt = {
  outputFolder: "build",

  server: {
    host: "localhost",
    port: 4000,
    livereload: 35729,
    open:true
  },

  cssAssets: [
    "src/css/bootstrap.min.css",
    "src/css/kept.css"
  ],

  fontAssets: [
    "src/fonts/*"
  ],

  jsAssets: [
    "src/js/**/*.*"
  ],

  htmlAssets: [
    "src/index.html"
  ],

  app: {
    src: "src/js/kept.jsx",
    dest: "kept.js"
  },
  vendors: "vendors.js"
};

var jsxOpt = {
  extensions: ['.jsx']
};

/**
 * Assets tasks
 */
gulp.task("assets", [
  "assets:html",
  "assets:fonts",
  "assets:css"
]);

gulp.task("assets:html", function() {
  return gulp.src(opt.htmlAssets)
    .pipe(gulp.dest(opt.outputFolder));
});

gulp.task("assets:css", function() {
  return gulp.src(opt.cssAssets)
    .pipe(gulp.dest(opt.outputFolder + "/css"));
});

gulp.task("assets:fonts", function() {
  return gulp.src(opt.fontAssets)
    .pipe(gulp.dest(opt.outputFolder + "/fonts"));
});

/**
 * JS tasks
 */

gulp.task("js", [
  "js:vendors",
  "js:app"
  ]);

gulp.task("js:app", ["js:vendors"], function() {
  return browserify(jsxOpt)
    .add("./"+opt.app.src)
    .transform("reactify", {global: true})
    .external("react")
    .external("react-dom")
    .external("react-bootstrap")
    .external("marked")
    .bundle()
    .pipe(source(opt.app.dest))
    .pipe(gulp.dest(opt.outputFolder + "/js"));
});

gulp.task("js:vendors", function() {
  return browserify()
    .require("react")
    .require("react-dom")
    .require("react-bootstrap")
    .require("marked")
    .bundle()
    .pipe(source(opt.vendors))
    .pipe(gulp.dest(opt.outputFolder + "/js"));
});


/**
 * Server task
 */
// gulp.task("server", function() {
//    return gulp.src(opt.outputFolder)
//     .pipe(webserver(opt.server));
// });
//
var connect = require('connect');
var livereload = require('connect-livereload');
var staticFile = require('serve-static');
var lrServer = require('tiny-lr')();

gulp.task("server", function() {

  lrServer
    .listen(opt.server.livereload);

  connect()
    .use(livereload({ port: opt.server.livereload }))
    .use(staticFile(opt.outputFolder))
    .listen(4000);
});

/**
 * Watchify
 */

gulp.task("watchify", function(){
  var args = extend(watchify.args,  jsxOpt);

  var b = browserify("./"+opt.app.src, args)
    .transform("reactify", {global: true})
    .external("react")
    .external("react-dom")
    .external("react-bootstrap")
    .external("marked");

  return watchify(b).on("update", function(){
    b.bundle()
      .pipe(source(opt.app.dest))
      .pipe(gulp.dest(opt.outputFolder + "/js"));
  })
    .bundle()
    .pipe(source(opt.app.dest))
    .pipe(gulp.dest(opt.outputFolder + "/js"));
});




/**
 * Watch task
 * Launch a server with livereload
 */
gulp.task("watch", ["assets","js:vendors", "watchify"], function() {
  gulp.watch(opt.cssAssets,  ["assets:css"]);
  gulp.watch(opt.fontAssets, ["assets:fonts"]);
  gulp.watch(opt.htmlAssets, ["assets:html"]);
  gulp.watch(opt.outputFolder+"/**/*", function(file){
    lrServer.changed({body : {files : [file.path]}});
  });
});

gulp.task("dist", ["assets", "js"], function() {
  return gulp.src(opt.outputFolder + "/js/*.js")
    .pipe(uglify())
    .pipe(gulp.dest(opt.outputFolder + "/js"));
});

/**
 * Deploy to gh-pages
 */
gulp.task("deploy", ["dist"], function() {
  gulp.src("./build/**/*")
    .pipe(deploy("git@github.com:n1k0/kept.git"));
});

gulp.task("default", ["server", "watch"], function(done){
  console.log("app running at http://"+opt.server.host+":"+opt.server.port);
  require('opn')("http://"+opt.server.host+":"+opt.server.port);
  done();
});
