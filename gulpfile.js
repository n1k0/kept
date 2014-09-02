/* jshint node:true */

"use strict";

var gulp = require("gulp");
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var connect = require("gulp-connect");
var deploy = require("gulp-gh-pages");

var opt = {
  outputFolder: "build",

  server: {
    port: 4000,
    livereload: 31357
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
    src: "src/js/kept.js",
    dest: "kept.js"
  },
  vendors: "vendors.js"
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
  return browserify("./" + opt.app.src)
    .transform("reactify")
    .external("react")
    .external("react-bootstrap")
    .external("marked")
    .bundle()
    .pipe(source(opt.app.dest))
    .pipe(gulp.dest(opt.outputFolder + "/js"));
});

gulp.task("js:vendors", function() {
  return browserify()
    .require("react")
    .require("react-bootstrap")
    .require("marked")
    .require("daybed.js")
    .bundle()
    .pipe(source(opt.vendors))
    .pipe(gulp.dest(opt.outputFolder + "/js"));
});


/**
 * Server task
 */
gulp.task("server", function() {
  return connect.server({
    root: opt.outputFolder,
    port: opt.server.port,
    livereload: {
      port: opt.livereload
    }
  });
});

/**
 * Watch task
 * Launch a server with livereload
 */
gulp.task("watch", ["assets", "js"], function() {
  gulp.watch(opt.cssAssets,  ["assets:css"]);
  gulp.watch(opt.fontAssets, ["assets:fonts"]);
  gulp.watch(opt.jsAssets,   ["js:app"]);
  gulp.watch(opt.htmlAssets, ["assets:html"]);

  gulp.watch([opt.outputFolder + "/**/*.*"])
    .on("change", function() {
      gulp.src("").pipe(connect.reload());
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

gulp.task("default", ["server", "watch"]);
