/* jshint node:true */

"use strict";

var gulp = require("gulp");
var concat = require("gulp-concat");
var browserify = require('gulp-browserify');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
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

  mainJs: {
    src: "src/js/kept.jsx",
    dest: "js/kept.js"
  }
};

/**
 * Assets tasks
 */
gulp.task("assets", [
  "assets:html",
  "assets:fonts",
  "assets:css",
  "assets:js"
]);

gulp.task("assets:html", function() {
  return gulp.src(opt.htmlAssets)
    .pipe(gulp.dest(opt.outputFolder));
});

gulp.task("assets:js", function() {
  return gulp.src(opt.mainJs.src, {read: false})
    .pipe(browserify({
      transform:  ["reactify"],
      extensions: [".jsx"]
    }))
    .pipe(rename("kept.js"))
    .pipe(gulp.dest(opt.outputFolder + "/js"));
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
gulp.task("watch", ["assets"], function() {
  gulp.watch(opt.cssAssets,  ["assets:css"]);
  gulp.watch(opt.fontAssets, ["assets:fonts"]);
  gulp.watch(opt.jsAssets,   ["assets:js"]);
  gulp.watch(opt.htmlAssets, ["assets:html"]);

  gulp.watch([opt.outputFolder + "/**/*.*"])
    .on("change", function() {
      gulp.src("").pipe(connect.reload());
    });
});

gulp.task("dist", ["assets"], function() {
  return gulp.src("build/" + opt.mainJs.dest)
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
