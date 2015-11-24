var gulp = require('gulp');
var concat = require('gulp-concat');
var ngAnnotate = require('gulp-ng-annotate');
var closureCompiler = require('gulp-closure-compiler');
var docco = require("gulp-docco");
var del = require('del');

var paths = {
  scripts: ['src/**/*.js','src/javascripts/**/*.js'],
  html: ['src/**/*.html','src/views/**/*.html'],
  css: ['src/**/*.css'],
  dist: 'dist/',
  distContents: ['dist/*'],
};

// Not all tasks need to use streams
// A gulpfile is just another node program and you can use any package available on npm
gulp.task('clean', function() {
  // You can use multiple globbing patterns as you would with `gulp.src`
  return del(paths.distContents);
});

gulp.task('extras', [], function() {
  return gulp.src("src/javascripts/PolymerDOMPatch.js")
    .pipe(gulp.dest(paths.dist));
});

gulp.task('scripts', ['clean','extras'], function() {
  return gulp.src(paths.scripts)
    .pipe(ngAnnotate())
  	.pipe(closureCompiler({
      compilerPath: 'bower_components/closure-compiler/compiler.jar',
      fileName: 'build.js',
      compilerFlags: {
      	language_in: "ECMASCRIPT6_STRICT",
		    language_out: "ES5_STRICT"
      }
    }))
    .pipe(concat('all.min.js', {newLine: ';'}))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('scripts-dev', ['clean','extras'], function() {
  return gulp.src(paths.scripts)
    .pipe(concat('all.min.js', {newLine: ';'}))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('html', [], function() {
  return gulp.src(paths.html)
    .pipe(gulp.dest(paths.dist));
});

gulp.task('css', [], function() {
  return gulp.src(paths.css)
  	// .pipe(concat('all.min.css', {newLine: ';'}))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('docs', [], function() {
  return gulp.src(paths.js)
    .pipe(docco())
    .pipe(gulp.dest('docs'));
});

// Rerun the task when a file changes
/*gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.images, ['images']);
});*/

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['scripts','html','css']);
gulp.task('dev', ['scripts-dev','html','css']);
gulp.task('docs', ['docs']);