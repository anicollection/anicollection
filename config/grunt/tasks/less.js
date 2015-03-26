//-----------------------------------------------------------
// Tareas para compilar los ficheros less
//
// https://www.npmjs.org/package/grunt-less
//------------------------------------------------------------
/* jshint node:true */


'use strict';

module.exports = function (grunt) {
  var config = {
    anicollection: {
      options: {
        compress: false
      },
      files: {
        "libraries/anicollection/source/_base.css": "libraries/anicollection/source/_base.less"
      }
    }
  };



  // cargamos las tasks de connect
  grunt.loadNpmTasks('grunt-contrib-less');

  // configuramos la tarea jasmine
  grunt.config.set('less', config);

};
