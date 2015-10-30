module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  var concatAnim;

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    concat: {
      dist: {
        src: [ 'libraries/animate.css/source/_base.css', 'animations/**/*.css' ], // _base.css required for .animated helper class
        dest: 'dist/anicollection.css'
      }
    },

    autoprefixer: { // https://github.com/nDmitry/grunt-autoprefixer
      options: {
        browsers: ['last 3 versions', 'bb 10', 'android 3']
      },
      no_dest: {
        src: 'dist/anicollection.css' // output file
      },
      // prefix all specified files and save them separately
      multiple_files: {
        expand: true,
        flatten: false,
        src: 'animations/**/*.css',
        dest: 'prefixed_source/'
      }
    },

    cssmin: {
      options: {
        keepSpecialComments: 0
      },
      minify: {
        src: ['dist/anicollection.css'],
        dest: 'dist/anicollection.min.css'
      }
    },

    watch: {
      css: {
        files: [ 'animations/**/*', 'config/grunt/available-animations.json' ],
        tasks: ['default','generate']
      }
    },

    clean: ["prefixed_source"],
    copy: {
      copyToAnicollection: {
          files: [
            // includes files within path
            {
              expand: true,
              cwd: 'config/data/',
              src: [
                '**/*',
              ],
              dest: '../dev.anicollection.io/build/config/data/'
            },
            // includes files within path
            {
              expand: true,
              cwd: 'dist/',
              src: [
                '**/*',
              ],
              dest: '../dev.anicollection.io/build/public/lib/anicollection/'
            }
          ]
      }
    }

  });

  // fuction to perform custom task
  concatAnim = function () {

    var categories = grunt.file.readJSON('config/grunt/available-animations.json'),
      category, files, file,
      target = [
                'libraries/anicollection/source/_base.css'
               ],
      count = 0;

    for ( category in categories ) {
      if ( categories.hasOwnProperty(category) ) {
        files = categories[category];
        for (file in files) {
          if ( files.hasOwnProperty(file) && files[file] ) {
            target.push('animations/' + category + '/' + file + '.css');
            count += 1;
          }
        }
      }
    }

    if (!count) {
      grunt.log.writeln('No animations activated.');
    } else {
      grunt.log.writeln(count + (count > 1 ? ' animations' : ' animation') + ' activated.');
    }

    grunt.config('concat', { 'dist/anicollection.css': target });
    grunt.task.run('concat');
  };

  // Load grunt tasks from another location
  grunt.loadTasks('./config/grunt/tasks');

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // register task
  grunt.registerTask('concat-anim', 'Concatenates activated animations', concatAnim); // custom task
  grunt.registerTask('default', ['less', 'concat-anim', 'autoprefixer', 'cssmin']);
  grunt.registerTask('dev', ['watch']);

  // allow you to generate the animation db for anicollection
  grunt.registerTask('generate', ['default','autoprefixer', 'generate-db', 'clean', 'copy']);
};
