import gulp from "gulp";
import browserSync from "browser-sync";
import nodemon from "gulp-nodemon";
import sass from "gulp-sass";
import plumber from "gulp-plumber";
import moduleImporter from "sass-module-importer";
import browserify from "browserify";
import source from "vinyl-source-stream";
import buffer from "vinyl-buffer";
import babelify from "babelify";
import rename from "gulp-rename";
import exorcist from "exorcist";
import size from "gulp-size";
import terser from "gulp-terser";
import ifElse from "gulp-if-else";
import sourcemaps from "gulp-sourcemaps";
import googleWebFonts from "gulp-google-webfonts";
import autoprefixer from "gulp-autoprefixer";
import env from "gulp-env";
import cleanCSS from "gulp-clean-css";

const packageInfo = require("./package.json");
const nodemonConfig = packageInfo.nodemonConfig;

const bundler = browserify([
    "src/jsx/Index.jsx"
], {
    extensions: [".js", ".jsx"],
    debug: true
}); // close bundler

bundler.transform(babelify.configure());
bundler.on("update", () => bundle());
const bundle = () => {
    return bundler.bundle()
        .on("error", function (err) {
            console.info("=====");
            console.error(err.toString());
            console.info("=====");
            this.emit("end");
        })
        .pipe(ifElse(process.env.NODE_ENV !== "production", () => exorcist("public/js/" + packageInfo.name + ".js.map")))
        .pipe(source(packageInfo.name + ".js"))
        .pipe(buffer())
        .pipe(rename(`${packageInfo.name}.js`))
        .pipe(ifElse(process.env.NODE_ENV === "production", terser))
        .pipe(size({ showFiles: true }))
        .pipe(gulp.dest("public/js"))
        ;
}; // close bundle
const transpile = () => bundle();

const sync = browserSync.create();
const reloadBrowser = (next) => {
    sync.reload();
    if (next) {
        return next();
    }
}; // close reloadBrowser
const syncBrowser = (next) => {
    sync.stream();
    if (next) {
        return next();
    }
}; // close syncBrowser

const compileSass = () => {
    return gulp.src([
        "src/sass/master.scss",
        "src/jsx/**/*.scss"
    ]).pipe(plumber())
        .pipe(ifElse(process.env.NODE_ENV !== "production", () => sourcemaps.init()))
        .pipe(sass({
            importer: moduleImporter()
        }).on("error", sass.logError))
        .pipe(rename(`${packageInfo.name}.css`))
        .pipe(ifElse(process.env.NODE_ENV !== "production", () => sourcemaps.write()))
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(ifElse(process.env.NODE_ENV === "production", () => cleanCSS()))
        .pipe(size({ showFiles: true }))
        .pipe(gulp.dest("public/css"))
        ;
}; // close sass

const compileFonts = () => {
    return gulp.src("src/fonts.list")
        .pipe(googleWebFonts())
        .pipe(gulp.dest("public/fonts"))
        ;
};

const serve = gulp.series(gulp.parallel(compileSass, compileFonts, transpile), () => {
    let started = false;

    return new Promise((resolve) => {
        nodemon({
            script: "index.js",
            ignore: nodemonConfig.ignore,
            env: nodemonConfig.env
        }).on("start", () => {
            // to avoid nodemon being started multiple times
            // thanks @matthisk
            if (!started) {
                started = true;
                setTimeout(() => {
                    sync.init({
                        proxy: `http://localhost:${nodemonConfig.env.PORT}/`,
                        files: [
                            "public/**/*.*",
                            "!public/**/*.png",
                            "views/**/*.*"
                        ],
                        snippetOptions: {
                            rule: {
                                match: /<\/body>/i,
                                fn: function (snippet, match) {
                                    return snippet + match;
                                }
                            }
                        },
                        browser: "google chrome",
                        port: 8855
                    });
                    setTimeout(() => {
                        resolve();
                    }, 1000);
                }, 500);
            } else {
                setTimeout(() => {
                    reloadBrowser();
                    resolve();
                }, 1000);
            }
        });
    });
}); // close serve

const setProduction = () => {
    return Promise.resolve(env.set({
        NODE_ENV: "production"
    }));
};

const watch = gulp.series(serve, () => {
    gulp.watch([
        "src/**/*.js",
        "src/**/*.jsx",
        "!gulpfile.babel.js",
        "!src/vendor/**/*.js",
        "!src/vendor/**/*.jsx"
    ], gulp.series(
        transpile,
        reloadBrowser
    ));
    gulp.watch("views/**/*.pug", reloadBrowser);
    gulp.watch("src/**/*.scss", gulp.series(compileSass, syncBrowser));
}); // close watch
const build = gulp.series(setProduction, gulp.parallel(compileSass, transpile, compileFonts)); // close build

export {
    serve,
    build,
    watch
}; // close export

export default watch;
