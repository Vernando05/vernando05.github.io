var gulp = require('gulp'),
	plugins = require('gulp-load-plugins')({ pattern: ['gulp-*', 'del', 'merge-stream', 'run-sequence'] }),
	exec = require('child_process').exec;

var flags = {
	initBuild : false,
	production: false
}

gulp.task('clean', function () {
	return plugins.del(['src/_site/**', '!src/_site', '!src/_site/.git', '!src/_site/CNAME', '!src/_site/LICENSE', '!src/_site/README.md']);
});

gulp.task('style-bootstrap', function () {
	plugins.del.sync(['src/_site/css/styles.css', 'src/_site/css/bootstrap.min.css']);
	return gulp.src('src/sass/bootstrap/*.scss')
		.pipe(plugins.compass({
			config_file: 'config.rb',
			sass: 'src/sass/bootstrap',
			css: 'src/_site/css'
		}))
		.pipe(plugins.autoprefixer('last 14 version', 'ie', 'iOS', 'Safari', 'Firefox', 'Opera', 'bb', 'Android', 'Chrome', 'ChromeAndroid'))
		.pipe(plugins.rename('bootstrap.min.css'))
		.pipe(gulp.dest('src/_site/css'));
});

gulp.task('style-main', function () {
	plugins.del.sync('src/_site/css/styles.css');
	return gulp.src('src/sass/main/*.scss')
		.pipe(plugins.compass({
			http_path: '/',
			style: 'compressed',
			sass: 'src/sass/main',
			css: 'src/_site/css',
			javascript: 'src/javascripts',
			font: 'src/fonts',
			image: 'src/images'
		}))
		.pipe(plugins.autoprefixer('last 14 version', 'ie', 'iOS', 'Safari', 'Firefox', 'Opera', 'bb', 'Android', 'Chrome', 'ChromeAndroid'))
		.pipe(gulp.dest('src/_site/css'));
});

gulp.task('style-lib', function () {
	var paths = ['src/components/simple-line-icons/css/simple-line-icons.css',
			'src/components/transformicons/transformicons.css',
			'src/components/animate.css/animate.min.css'];
	return gulp.src(paths)
		.pipe(plugins.concat('lib.min.css'))
		.pipe(plugins.minifyCss())
		.pipe(gulp.dest('src/_site/css'));
});

gulp.task('script-main', function () {
	return gulp.src('src/javascripts/main.js')
		.pipe(plugins.jshint({
			lookup: false
		}))
		.pipe(plugins.jshint.reporter('default'))
		.pipe(gulp.dest('src/_site/js'));
});

gulp.task('script-lib', function () {
	var	paths = ['src/components/jquery/dist/jquery.min.js',
				'src/components/jquery-ui/jquery-ui.min.js',
				'src/javascripts/bootstrap.min.js',
				'src/components/transformicons/transformicons.js',
				'src/components/jquery-validation/dist/jquery.validate.min.js',
				'src/components/waypoints/lib/jquery.waypoints.min.js',
				'src/components/three.js/three.min.js'];

	return gulp.src(paths)
		.pipe(plugins.order(paths, {base: '.'}))
		.pipe(plugins.concat('lib.min.js'))
		.pipe(plugins.uglify())
		.pipe(gulp.dest('src/_site/js'));
});

gulp.task('script-libhead', function () {
	var	paths = ['src/javascripts/modernizr.js',
				'src/javascripts/logoanimation.js'];

	return gulp.src(paths)
		.pipe(plugins.order(paths, {base: '.'}))
		.pipe(plugins.concat('libhead.min.js'))
		.pipe(plugins.uglify())
		.pipe(gulp.dest('src/_site/js'));
});

gulp.task('modernizr', function (cb) {
	exec( 'modernizr -c modernizr-config.json -d src/javascripts', function (err, stdout, stderr) {
		console.log(stdout);
		cb(err);
	});
});

gulp.task('jekyll', function (cb) {
	exec( flags.initBuild ? 'jekyll build' : 'jekyll serve --skip-initial-build', function (err, stdout, stderr) {
		console.log(stdout);
		cb(err);
	});
});

gulp.task('images', function () {
	return gulp.src('src/images/**')
		.pipe(gulp.dest('src/_site/images'));
});

gulp.task('deploy', function () {
	exec('git config --global user.email "usedgrey05@gmail.com" && git config --global user.name "vernando05"', function (err, stdout, stderr) {
		if (err) console.log(err);
		console.log(stdout);
	});
	return gulp.src('src/_site/**')
		.pipe(plugins.ghPages({
			remoteUrl: "https://$github_token@github.com/Vernando05/vernando05.github.io.git",
			branch: "master"
		}));
});

gulp.task('html-proofer', function (cb) {
	exec('htmlproofer ' + 'src/_site ' + '--disable-external', function (err, stdout, stderr) {
		console.log(stdout)
		cb(err);
	});
});

gulp.task('watch', function () {
	flags.initBuild = false;
	gulp.watch('src/sass/bootstrap/*.scss', ['style-bootstrap']);
	gulp.watch('src/sass/main/*.scss', ['style-main']);
	gulp.watch('src/javascripts/main.js', ['script-main']);
	gulp.watch(['src/javascripts/modernizr.js', 'src/javascripts/logoanimation.js'], ['script-libhead']);
	gulp.watch('src/images/**', ['images']);
	gulp.watch('modernizr-config.json', ['modernizr']);
});

gulp.task('default', function () {
	flags.initBuild = true;
	flags.production = false;
	plugins.runSequence('clean', 'jekyll', 'style-bootstrap', 'modernizr', ['style-lib', 'style-main', 'script-lib', 'script-libhead', 'script-main', 'watch'], 'jekyll');
});

gulp.task('production', function () {
	flags.initBuild = true;
	flags.production = true;
	plugins.runSequence('clean', 'jekyll', 'style-bootstrap', 'modernizr', ['style-lib', 'style-main', 'script-lib', 'script-libhead', 'script-main', 'watch']);
});

gulp.task('test', function () {
	plugins.runSequence('html-proofer', 'deploy');
});