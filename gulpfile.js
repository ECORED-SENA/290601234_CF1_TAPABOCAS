const gulp = require('gulp');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const minifyCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const gulpCopy = require("gulp-copy");
const gulpZip = require("gulp-zip");
const gulpPrompt = require("gulp-prompt");
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const changed = require('gulp-changed');
const prettify = require('gulp-prettify');
const pug = require('gulp-pug');
const browserSync = require('browser-sync').create();
const babel = require('gulp-babel');
const javascriptObfuscator = require('gulp-javascript-obfuscator');
const clear = require("clear");
const exit = require("exit");
const notify = require("gulp-notify");
const del = require('del');

const src = './source';
const pub = './public';
const fontAwesome = 'node_modules/font-awesome'

let nameFileZIP = "material.zip";

// VARIABLES
const paths = {
  json: {
    src: `${src}/config/*.json`,
    dest: `${pub}/config`,
  },
  cssVendor: {
    src: [`${src}/assets/css/**/*.css`],
    dest: `${pub}/assets/css`,
  },
  sass: {
    src: [`${src}/assets/scss/main.scss`],
    inc: `${src}/assets/scss/**/*.{scss,sass}`,
    dest: `${pub}/assets/css`,
  },
  pugRoot: {
    src: `${src}/pug/*.pug`,
    inc: `${src}/pug/includes/**/*.{pug,html}`,
    mixins: `${src}/pug/mixins/**/*.{pug,html}`,
    dest: `${pub}/`,
  },
  pugPages: {
    src: `${src}/pug/pages/*.pug`,
    dest: `${pub}/pages`,
  },
  jsGlobal: {
    src: [`${src}/js/global/router.js`, `${src}/js/global/jarviscode.js`],
    fileName: "global.js",
    dest: `${pub}/assets/js`,
  },
  jsVendor: {
    src: [
      `${src}/assets/vendor/libs/jquery-3.4.1.min.js`,
      `${src}/assets/vendor/libs/bootstrap.bundle.min.js`,
      `${src}/assets/vendor/libs/jquery.loader.min.js`,
      `${src}/assets/vendor/libs/jquery.router.min.js`,
      `${src}/assets/vendor/libs/jquery.fancybox.min.js`,
      `${src}/assets/vendor/libs/wow.min.js`,
      `${src}/assets/vendor/plugins/*.js`,
    ],
    fileName: "vendor.js",
    dest: `${pub}/assets/js`,
  },
  jsContent: {
    src: `${src}/js/pages/*.js`,
    fileName: "pages.js",
    dest: `${pub}/assets/js`,
  },
  media: {
    src: [
      `${src}/assets/fonts/**/*.*`,
      `${src}/assets/images/**/*.*`,
      `${src}/download/**/*.*`,
      `${src}/media/**/*.*`,
      `${src}/js/local.js`
    ],
  },
  vendor: {
    jquery: "./node_modules/jquery/dist/jquery.min.js",
    bootstrap: "./node_modules/bootstrap/dist/js/bootstrap.bundle.min.js",
    popper: "./node_modules/popper.js/dist/popper.min.js",
    fontawesome: {
      src: [
        `node_modules/font-awesome/css/**/*.*`,
        `node_modules/font-awesome/fonts/**/*.*`,
      ],
      dest: `${pub}/assets/fonts/fontawesome/`,
    },
  },
};

// COMPILAR PUG
gulp.task('pugRoot', done => {
  gulp
    .src([
      paths.pugRoot.src,
      `!${src}/pug/ruta.pug`,
      `!${src}/pug/material.pug`,
      `!${src}/pug/info.pug`,
    ])
    // PREVIENE QUE LOS PROCESOS GULP.WATCH SE DETENGA AL ENCONTRAR UN ERROR
    .pipe(plumber())
    // COMPLIA PUG
    .pipe(
      pug({
        cres: {},
      })
    )
    // ENBELLECE EL HTML
    .pipe(prettify({ indent_size: 4 }))
    // GUARDA EL ARCHIVO HTML
    .pipe(gulp.dest(paths.pugRoot.dest))
    // REFRESCADO DEL NAVEGADOR
    .pipe(browserSync.stream());
  done();
});

gulp.task('pugPages', done => {
  gulp
    .src(paths.pugPages.src)
    // PREVIENE QUE LOS PROCESOS GULP.WATCH SE DETENGA AL ENCONTRAR UN ERROR
    .pipe(plumber())

    // COMPLIA PUG
    .pipe(
      pug({
        cres: {}
      })
    )

    // ENBELLECE EL HTML
    .pipe(prettify({ indent_size: 4 }))

    // GUARDA EL ARCHIVO HTML
    .pipe(gulp.dest(paths.pugPages.dest))

    // REFRESCADO DEL NAVEGADOR
    .pipe(browserSync.stream());

  done();
});

gulp.task('sass', done => {
  gulp
    .src(paths.sass.src)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(autoprefixer())
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.sass.dest))
    //.pipe(rename({ suffix: '.min' }))
    //.pipe(minifyCSS())
    //.pipe(gulp.dest(paths.sass.dest))
    .pipe(browserSync.stream());
  done();
});

gulp.task('font-awesome', done => {
  gulp
    .src(paths.vendor.fontawesome.src, { base: fontAwesome })
    .pipe(gulp.dest(paths.vendor.fontawesome.dest));
  done();
})

gulp.task("cssVendor", (done) => {
  gulp.src(paths.cssVendor.src).pipe(gulp.dest(paths.cssVendor.dest));
  done();
});

gulp.task('json', done => {
  gulp
    .src(paths.json.src)
    .pipe(gulp.dest(paths.json.dest))
    .pipe(browserSync.stream());
  done();
})

/* Archivos Imágenes y documentos usados en cada tema. */
gulp.task('media', done => {
  paths.media.src.forEach(route => {
    gulp
      .src(route, { base: src })
      .pipe(gulp.dest(pub))
  })
  done();
});

/* Librerias Javascript que se utilizan en todo el sitio */
gulp.task('jsVendor', done => {
  gulp
    .src(paths.jsVendor.src)
    .pipe(concat(paths.jsVendor.fileName))
    .pipe(gulp.dest(paths.jsVendor.dest))
    .pipe(browserSync.stream());
  done();
});

gulp.task('jsGlobal', done => {
  gulp
    .src(paths.jsGlobal.src)
    .pipe(concat(paths.jsGlobal.fileName))
    .pipe(gulp.dest(paths.jsGlobal.dest))
    .pipe(browserSync.stream())
  done();
})

/* Scripts task */
gulp.task('jsContent', done => {
  gulp
    .src(paths.jsContent.src)
    .pipe(concat(paths.jsContent.fileName))
    .pipe(gulp.dest(paths.jsContent.dest))
    .pipe(browserSync.stream());
  done();
});

gulp.task('servidor', done => {
  browserSync.init({
    server: pub,
    open: true,
    notify: true
  });
  done();
});

gulp.task('borrarRuta', done => {
  return del(`${pub}/ruta.html`);
});

gulp.task('borrarInfo', done => {
  return del(`${pub}/info.html`);
});
/**
 * @description
 * Crea la carpeta ZIP con el contenido de la multimedia y lo almacena en la carpeta de descargas.
 */
gulp.task('pugMaterial', () => {
  return gulp
    .src(`${src}/pug/material.pug`)
    // PREVIENE QUE LOS PROCESOS GULP.WATCH SE DETENGA AL ENCONTRAR UN ERROR
    .pipe(plumber())
    // COMPLIA PUG
    .pipe(
      pug({
        cres: {}
      })
    )
    // ENBELLECE EL HTML
    .pipe(prettify({ indent_size: 4 }))
    // GUARDA EL ARCHIVO HTML
    .pipe(gulp.dest(`${pub}/`))
});

gulp.task('crearZip', () => {
  return gulp
    .src([
      `./${pub}/**/*.*`,
      `!${pub}/config/**/*.*`,
      `!${pub}/pages/**/*.*`,
      `!${pub}/index.html`,
      `!${pub}/main.html`,
      `!${pub}/ruta.html`,
      `!${pub}/info.html`
    ])
    .pipe(gulpZip(nameFileZIP))
    .pipe(gulp.dest(`./${pub}/download`))

    .pipe(notify("Descargable creado: <%= file.relative %>"));
});
gulp.task('borrarMaterial', done => {
  return del(`${pub}/material.html`);
});
gulp.task('material',
  gulp.series(
    'pugMaterial',
    'crearZip',
    'borrarMaterial'
  )
);

/**
 * @description
 * Crea la carpeta ZIP con el contenido de la multimedia y lo almacena en la carpeta de descargas.
 */
gulp.task('pugRuta', () => {
  return gulp
    .src(`${src}/pug/ruta.pug`)
    // PREVIENE QUE LOS PROCESOS GULP.WATCH SE DETENGA AL ENCONTRAR UN ERROR
    .pipe(plumber())
    // COMPLIA PUG
    .pipe(
      pug({
        cres: {}
      })
    )
    // ENBELLECE EL HTML
    .pipe(prettify({ indent_size: 4 }))
    // GUARDA EL ARCHIVO HTML
    .pipe(gulp.dest(`${pub}/`))
});

gulp.task('crearZipRuta', () => {
  return gulp
    .src([
      `./${pub}/**/*.*`,
      `!${pub}/index.html`,
      `!${pub}/main.html`,
      `!${pub}/download/**/*.*`,
      `!${pub}/js/**/*.*`,
      `!${pub}/pages/**/*.*`,
      `!${pub}/media/**/*.*`,
      `!${pub}/config/**/*.*`,
      `!${pub}/assets/images/pages/*.*`,
      `!${pub}/assets/images/icons/*.*`,
      `!${pub}/assets/images/info/*.*`,
      `!${pub}/material.html`,
      `!${pub}/info.html`,
    ])
    .pipe(gulpZip("ruta_aprendizaje.zip"))
    .pipe(gulp.dest(`./${pub}/download`))

    .pipe(notify("Descargable creado: <%= file.relative %>"));
});

gulp.task("pugInfo", () => {
  return (
    gulp
      .src(`${src}/pug/info.pug`)
      // PREVIENE QUE LOS PROCESOS GULP.WATCH SE DETENGA AL ENCONTRAR UN ERROR
      .pipe(plumber())
      // COMPLIA PUG
      .pipe(
        pug({
          cres: {},
        })
      )
      // ENBELLECE EL HTML
      .pipe(prettify({ indent_size: 4 }))
      // GUARDA EL ARCHIVO HTML
      .pipe(gulp.dest(`${pub}/`))
  );
});

gulp.task("crearZipInfo", () => {
  return gulp
    .src([
      `./${pub}/**/*.*`,
      `!${pub}/index.html`,
      `!${pub}/main.html`,
      `!${pub}/download/**/*.*`,
      `!${pub}/js/**/*.*`,
      `!${pub}/pages/**/*.*`,
      `!${pub}/media/**/*.*`,
      `!${pub}/config/**/*.*`,
      `!${pub}/assets/images/pages/*.*`,
      `!${pub}/assets/images/icons/*.*`,
      `!${pub}/assets/images/ruta/*.*`,
      `!${pub}/material.html`,
      `!${pub}/ruta.html`,
    ])
    .pipe(gulpZip("informacion_programa.zip"))
    .pipe(gulp.dest(`./${pub}/download`))

    .pipe(notify("Descargable creado: <%= file.relative %>"));
});

gulp.task("salir", () => {
  exit(5);
});

gulp.task('watch', done => {  
  gulp.watch([paths.pugRoot.src, paths.pugRoot.inc, paths.pugPages.src, paths.pugRoot.mixins], gulp.series('pugRoot','pugPages'));
  gulp.watch(paths.sass.inc, gulp.series('sass'));
  gulp.watch(paths.cssVendor.src, gulp.series("cssVendor"));
  gulp.watch(paths.json.src, gulp.series('json'))
  gulp.watch(paths.media.src, gulp.series('media'))
  gulp.watch(paths.jsVendor.src, gulp.series('jsVendor'))
  gulp.watch(paths.jsContent.src, gulp.series('jsContent'))
  gulp.watch(paths.jsGlobal.src, gulp.series('jsGlobal'))
  done();
});

gulp.task('ruta',
  gulp.series(
    'pugRuta',
    'crearZipRuta',
    'servidor',
    'watch'
  )
);

gulp.task("info", gulp.series("pugInfo", "crearZipInfo", 'servidor', 'watch'));

gulp.task('desarrollo',
  gulp.series(
    'json',
    'media',
    'font-awesome',
    'jsVendor',
    'jsGlobal',
    'jsContent',
    'pugRoot',
    'pugPages',
    'sass',
    'cssVendor',
    'servidor',
    "borrarRuta",
    "borrarInfo",    
    'watch'
  )
);

gulp.task(
  "produccion",
  gulp.series(
    "json",
    "media",
    "font-awesome",
    "jsVendor",
    "jsGlobal",
    "jsContent",
    "pugRoot",
    "pugPages",
    "sass",
    "cssVendor",
    "borrarRuta",
    "borrarInfo",
    "crearZip"
  )
);
/**
 * @description
 * Inicia la carga del menú definido por defecto con las funciones permitidas.
 */
gulp.task('default', () => {
  clear();
  console.log('Versión: 1.0');
  return gulp
    .src('package.json')
    .pipe(gulpPrompt.prompt({
      type: 'list',
      name: 'menu',
      message: 'Seleccione una acción:',
      choices: [
        'desarrollo',
        'produccion',
        'salir'
      ],
      pageSize: '5'
    }, (res) => {
      gulp.series(res.menu)();
    }));
});