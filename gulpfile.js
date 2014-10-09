var gulp       = require('gulp');
var jshint     = require('gulp-jshint');
var uglify     = require('gulp-uglify');
var concat     = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('lint', function () {
  gulp
    .src('src/cover.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'))
  ;
});

gulp.task('compress', ['lint'], function () {
  gulp
    .src('src/cover.js')
    .pipe(sourcemaps.init())
      .pipe(concat('cover.min.js'))
      .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'))
  ;
});

gulp.task('watch', function (cb) {
  gulp.watch('src/cover.js', ['compress']);
});

gulp.task('default', ['compress']);
