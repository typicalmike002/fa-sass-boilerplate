var gulp = require('gulp'),
    ip   = require('ip');




// Loads all gulp modules prefexed as 'gulp-' inside the package.json file as variables.
require('matchdep').filterDev('gulp*').forEach(function( module ) {
    var module_name     = module.replace(/^gulp-/, '').replace(/-/, '');
    global[module_name] = require( module );
});




// Launches a livereload socket and binds the reload:chrome task
// to html and sass files inside the project:
gulp.task('watch', function(){

    // Adds livereload support:
    connect.server({
        host: ip.address(),
        port: 8080,
        livereload: true,
        debug: true
    });

    gulp.watch('html/index.html', ['reload:chrome']);
    gulp.watch('css/sass/**/*.scss', ['reload:chrome']);
});




// Reloads a chrome browser using the livereload extension:
gulp.task('reload:chrome', ['clean:css'], function(){
    return gulp.src('./')
        .pipe(connect.reload())
});




// Removes unused css from all .css files:
gulp.task('clean:css', ['compile:html'], function(){
    return gulp.src('css/*.css')
        .pipe(uncss({
            html: ['index.html']
        }))
        .pipe(gulp.dest('./css'))
});




// Compiles critical css inside the html/index.html 
// file and saves the results to the root directory:
gulp.task('compile:html', ['compile:css'], function(){
    return gulp.src('./html/index.html')
        .pipe(inlinesource({
            compress: false
        }))
        .pipe(gulp.dest('./'))
});




// Compiles .scss files to .css and .min.css:
gulp.task('compile:css', function(){
    return gulp.src([
            '!css/sass/font-awesome-4.6.3/**/*.scss',
            'css/sass/**/*.scss'
        ])

        // Compiles scss code to pure css:
        .pipe(compass({
            config_file: './config.rb',
            css: 'css',
            sass: 'css/sass',
            environment: 'development'
        }))

        // Processes errors thrown by compass:
        .on('error', function(err){
            console.log(err);
        })

        // Runs postcss plugins:
        .pipe(postcss([

            // Autoprefixer will inject all browser prefixes 
            // to the style tags that require them:
            require('autoprefixer')({ browsers: ['last 2 versions'] }),

            // Combines media queries with the same width:
            require('css-mqpacker')
        ]))

        // Saves an unminified copy of the results:
        .pipe(gulp.dest('./css'))

        // Minifys the results:
        .pipe(postcss([
            require('cssnano')
        ]))

        // Adds .min.css to the extension:
        .pipe(rename({
            extname: '.min.css'
        }))

        // Saves the minified results:
        .pipe(gulp.dest('./css'))
});




gulp.task('compile:libraries', function(){
    return gulp.src('./libraries/**/*.js')

        // Compiles js:
        .pipe(uglify())

        // Adds .min.js to the extension:
        .pipe(rename({
            extname: '.min.js'
        }))

        // Saves minified version if one does not already exist:
        .pipe(gulp.dest('./libraries/'), {overwrite: false})
});