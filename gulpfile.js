const gulp = require('gulp');
const minify = require('gulp-minify');
var merge = require('merge-stream');
const JavaScriptObfuscator = require('gulp-javascript-obfuscator');

function defaultTask(cb) {
    const js = gulp
        .src('srv/utils/*.js')
        .pipe(JavaScriptObfuscator())
        .pipe(gulp.dest('dist/lib'));

    const cds = gulp.src('srv/*.cds')
        .pipe(gulp.dest('dist/srv'))
    merge(js, cds);
    cb();
}

exports.default = defaultTask