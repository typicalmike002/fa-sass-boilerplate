var gulp = require('gulp'),
    os   = require('os');



/**
 * Matchdep
 * 
 * - Automatically loads all package.json developer dependencies prefixed with 'gulp-'.
 */

require('matchdep').filterDev('gulp*').forEach(function( module ) {
    var module_name     = module.replace(/^gulp-/, '').replace(/-/, '');
    global[module_name] = require( module );
});



/**
 * ipAddress
 *
 * - Gets the current ip address of the computer for running livereload.
 *
 * - Only works on wifi networks.
 */

var ipAddress = (function(){
    var thisNetwork = os.networkInterfaces(),
        myIp        = null;
    thisNetwork['Wi-Fi'].forEach(function(details){
        if (details.family === 'IPv4') {
            myIp = details.address;
        }
    });
    return myIp;
}());



gulp.task('watch', function(){

    // Adds livereload support:
    connect.server({
        host: ipAddress,
        port: 8888,
        livereload: true
    });

    gulp.watch('html/index.html', ['compile:html']);
    gulp.watch('css/sass/**/*.scss', ['compile:html']);
});



gulp.task('compile:html', ['compile:css'], function(){
    return gulp.src('./html/index.html')
        .pipe(inlinesource({
            compress: false
        }))
        .pipe(gulp.dest('./'))

        // Reload Window:
        .pipe(connect.reload());
});



gulp.task('compile:css', function(){
    return gulp.src([
            '!css/sass/font-awesome-4.6.3/**/*.scss',
            'css/sass/**/*.scss'
        ])

        // Stylelint scss files:
        .pipe(postcss([
                require('stylelint'),
                require('postcss-reporter')({ clearMessage: true }),
            ], 
            { syntax: require('postcss-scss') }
        ))

        // Compiles scss code to pure css:
        .pipe(compass({
            config_file: './config.rb',
            css: 'css',
            sass: 'css/sass',
            environment: 'development'
        }))

        // While still compiling, add cross browser prefixes 
        // and combine all media queries:
        .pipe(postcss([
            require('autoprefixer')({ browsers: ['last 2 versions'] }),
            require('css-mqpacker')
        ]))

        // Removes unused css selectors:
        .pipe(uncss({
            html: ['html/index.html']
        }))

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
