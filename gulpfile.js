var gulp = require('gulp'),
	autoprefixer = require('gulp-autoprefixer'),
	compass = require('gulp-compass'),
	exec = require('child_process').exec,
	jshint = require('gulp-jshint'),
	processhtml = require('gulp-processhtml'),
	uglify = require('gulp-uglify'),
	minifyCss = require('gulp-minify-css'),
	copy = require('gulp-copy'),
	concat = require('gulp-concat'),
	rename = require('gulp-rename'),
	del = require('del'),
	runSequence = require('run-sequence'),
	order = require('gulp-order'),
	merge = require('merge-stream'),
	modernizr = require('gulp-modernizr'),
	cache = require('gulp-cache');

var flags = {
	initBuild : false,
	production: false
}

gulp.task('clean', function () {
	return del(['src/_site/**', '!src/_site', '!src/_site/.git', '!src/_site/CNAME', '!src/_site/LICENSE', '!src/_site/README.md']);
});

gulp.task('style-bootstrap', function () {
	del.sync(['src/_site/css/styles.css', 'src/_site/css/bootstrap.min.css']);
	return gulp.src('src/sass/bootstrap/*.scss')
		.pipe(compass({
			config_file: 'config.rb',
			sass: 'src/sass/bootstrap',
			css: 'src/_site/css'
		}))
		.pipe(autoprefixer('last 14 version', 'ie', 'iOS', 'Safari', 'Firefox', 'Opera', 'bb', 'Android', 'Chrome', 'ChromeAndroid'))
		.pipe(rename('bootstrap.min.css'))
		.pipe(gulp.dest('src/_site/css'));
});

gulp.task('style-main', function () {
	del.sync('src/_site/css/styles.css');
	return gulp.src('src/sass/main/*.scss')
		.pipe(compass({
			http_path: '/',
			style: 'compressed',
			sass: 'src/sass/main',
			css: 'src/_site/css',
			javascript: 'src/javascripts',
			font: 'src/fonts',
			image: 'src/images'
		}))
		.pipe(autoprefixer('last 14 version', 'ie', 'iOS', 'Safari', 'Firefox', 'Opera', 'bb', 'Android', 'Chrome', 'ChromeAndroid'))
		.pipe(gulp.dest('src/_site/css'));
});

gulp.task('style-lib', function () {
	var paths = ['src/components/simple-line-icons/css/simple-line-icons.css',
			'src/components/transformicons/transformicons.css'];
	return gulp.src(paths)
		.pipe(concat('lib.min.css'))
		.pipe(minifyCss())
		.pipe(gulp.dest('src/_site/css'));
});

gulp.task('script-main', function () {
	return gulp.src('src/javascripts/main.js')
		.pipe(jshint({
			lookup: false
		}))
		.pipe(jshint.reporter('default'))
		.pipe(gulp.dest('src/_site/js'));
});

gulp.task('script-lib', function () {
	var	paths = ['src/components/jquery/dist/jquery.min.js',
				'src/components/jquery-ui/jquery-ui.min.js',
				'src/javascripts/bootstrap.min.js',
				'src/components/transformicons/transformicons.js',
				'src/components/jquery-validation/dist/jquery.validate.min.js'];

	return gulp.src(paths)
		.pipe(order(paths, {base: '.'}))
		.pipe(concat('lib.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('src/_site/js'));
});

gulp.task('script-libhead', function () {
	var	paths = ['src/javascripts/modernizr.js',
				'src/javascripts/logoanimation.js'];

	return gulp.src(paths)
		.pipe(order(paths, {base: '.'}))
		.pipe(concat('libhead.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('src/_site/js'));
});

gulp.task('modernizr', function (cb) {
	exec( 'modernizr -c modernizr-config.json -d src/javascripts', function(err, stdout, stderr) {
		console.log(stdout);
		cb(err);
	});
});

gulp.task('jekyll', function (cb) {
	exec( flags.initBuild ? 'jekyll build' : 'jekyll serve --skip-initial-build', function(err, stdout, stderr) {
		console.log(stdout);
		cb(err);
	});
});

gulp.task('images', function () {
	return gulp.src('src/images/**')
		.pipe(gulp.dest('src/_site/images'));
});

gulp.task('copy-vendors', function() {
	var fontAwesome = gulp.src('src/components/simple-line-icons/fonts/**')
		.pipe(gulp.dest('src/_site/fonts'));
	return merge(fontAwesome);
});

gulp.task('watch', function () {
	flags.initBuild = false;
	gulp.watch('src/sass/bootstrap/*.scss', ['style-bootstrap']);
	gulp.watch('src/sass/main/*.scss', ['style-main']);
	gulp.watch('src/javascripts/main.js', ['script-main']);
	gulp.watch('src/javascripts/modernizr.js', ['script-lib']);
	gulp.watch(['src/javascripts/modernizr.js', 'src/javascripts/logoanimation.js'], ['script-libhead']);
	gulp.watch('src/images/**', ['images']);
	gulp.watch('modernizr-config.json', ['modernizr']);
});

gulp.task('default', function () {
	flags.initBuild = true;
	flags.production = false;
	runSequence('clean', 'jekyll', 'style-bootstrap', 'modernizr', ['style-lib', 'style-main', 'script-lib', 'script-libhead', 'script-main', 'copy-vendors', 'watch'], 'jekyll');
});

gulp.task('production', function () {
	flags.initBuild = true;
	flags.production = true;
	runSequence('clean', 'jekyll', 'style-bootstrap', 'modernizr', ['style-lib', 'style-main', 'script-lib', 'script-libhead', 'script-main', 'copy-vendors', 'watch'], 'jekyll');
});