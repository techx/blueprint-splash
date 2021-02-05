var gulp = require('gulp'),
  sass = require('gulp-sass'),
  browserSync = require('browser-sync').create(),
  cleanCSS = require('gulp-clean-css'),
  autoprefixer = require('gulp-autoprefixer'),
  rename = require("gulp-rename");

function reload(done) {
  browserSync.reload();
  done();
}

// Compiles SCSS files from /scss into /css
function style() {
  return gulp.src(['scss/styles.scss'])
    .pipe(sass())
    .pipe(gulp.dest('css'))
    .pipe(browserSync.reload({
      stream: true
    }))
};

// Minify compiled CSS
function minify() {
  return gulp.src(['css/styles.css'])
    .pipe(autoprefixer({
      browsers: ['last 5 versions'],
      cascade: false
    }))
    .pipe(cleanCSS({
      compatibility: 'ie8'
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('css'))
    .pipe(browserSync.reload({
      stream: true
    }))
};

// Configure the browserSync task
function serve(done) {
  browserSync.init({
    server: {
      baseDir: '.'
    },
  })
  done();
};

// Watch files for changes
function watch() {
  // Watch for changes in scss, then compile and minify
  gulp.watch('scss/*.scss', gulp.series(style, minify));
  // Reloads the browser whenever HTML files change
  gulp.watch('*.html', reload);
  gulp.watch('js/*.js', reload);
};

// Default task (compiles css)
gulp.task('default', gulp.series(style, minify));

// Dev task with browserSync
gulp.task('dev', gulp.parallel(serve, gulp.series(style, minify, watch)))

