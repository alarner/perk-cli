const gulp = require('gulp');
const babel = require('gulp-babel');

// Building scripts
gulp.task('scripts', function() {
	gulp.src(['src/*.js'])
    .pipe(babel({
			presets: ['es2015']}))
    .pipe(gulp.dest('dist'));
});

// Watching JS files inside `src` directory
gulp.task('watch', function() {
  gulp.watch(['src/*.js'], ['scripts']);
});

// dev mode watches for file changes
gulp.task('dev', [
	'scripts',
	'watch'
]);

// prod mode
gulp.task('prod', [
	'scripts'
]);
