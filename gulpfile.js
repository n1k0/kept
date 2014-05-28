/* jshint node:true */
'use strict';

var gulp = require('gulp');
var react = require('gulp-react');
var plumber = require('gulp-plumber');
var uglify = require('gulp-uglify');
var connect = require('gulp-connect');

var opt = {
  outputFolder:'build',
  server: {
    port:4000,
    livereload: 31357
  },
  fontAssets: [
    'bower_components/bootstrap/fonts/*'
  ],
  cssAssets: [
    'bower_components/bootstrap/dist/css/bootstrap.min.css',
    'bower_components/bootstrap/dist/css/bootstrap.min.css',
    'css/kept.css'
  ],
  jsAssets: [
    'bower_components/react/react.min.js',
    'bower_components/marked/lib/marked.js',
    'bower_components/react-bootstrap/react-bootstrap.min.js'
  ],
  htmlAssets: [
    'index.html'
  ],
  mainJs: {
    src:'src/kept.jsx',
    dist: 'build/js/kept.js'
  }
};


/**
 * Assets tasks
 */
gulp.task('assets',['assets:html', 'assets:js', 'assets:fonts', 'assets:css']);

gulp.task('assets:html', function(){
  return gulp.src(opt.htmlAssets)
    .pipe(gulp.dest(opt.outputFolder));
});

gulp.task('assets:fonts', function(){
  return gulp.src(opt.fontAssets)
    .pipe(gulp.dest(opt.outputFolder+'/fonts'));
});

gulp.task('assets:js', function(){
  return gulp.src(opt.jsAssets)
    .pipe(gulp.dest(opt.outputFolder+'/js/lib'));
});

gulp.task('assets:css', function(){
  return gulp.src(opt.cssAssets)
    .pipe(gulp.dest(opt.outputFolder+'/css'));
});

/**
 * transpiling jsx
 */
gulp.task('transpile' ,['assets'], function(){
  return gulp.src(opt.mainJs.src)
    .pipe(plumber())
    .pipe(react())
    .pipe(gulp.dest(opt.outputFolder+'/js'));
});

/**
 * uglify app
 */
gulp.task('uglify' ,['transpile'], function(){
  return gulp.src(opt.mainJs.dist)
    .pipe(plumber())
    .pipe(uglify())
    .pipe(gulp.dest(opt.outputFolder+'/js'));
});

/**
 * Server task
 */
gulp.task('server', function() {
  connect.server({
    root: opt.outputFolder,
    port: opt.server.port,
    livereload: {
      port:opt.livereload
    }
  });
});

/**
 * Watch task
 * Launch a server with livereload
 */
gulp.task('watch', ['assets', 'transpile'], function(){
  gulp.watch(opt.cssAssets,['assets:css']);
  gulp.watch(opt.jsAssets,['assets:js']);
  gulp.watch(opt.htmlAssets,['assets:html']);
  gulp.watch(opt.mainJs.src,['transpile']);

  gulp.watch([opt.outputFolder + '/**/*.*'])
    .on('change', function(){
      // trigger the live reload server
      gulp.src('').pipe(connect.reload());
    });
});

gulp.task('dist', ['assets', 'transpile', 'uglify']);
gulp.task('default', ['server', 'watch']);

