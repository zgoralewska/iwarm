/**
 * Created by DELL on 2016-04-10.
 */
var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('styles', function() {
    gulp.src('res/scss/app.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('res/css/'))
});

//Watch task
gulp.task('default',function() {
    gulp.watch('res/scss/**/*.scss',['styles']);
});
