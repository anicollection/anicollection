//-----------------------------------------------------------
// Tareas para generar json a partir de los sources
//
//------------------------------------------------------------
/* jshint node:true */


'use strict';
var annotation = require('css-annotation'),
    CleanCSS = require('clean-css'),
    beautify_css = require('js-beautify').css,
    Mustache = require('mustache'),
    animationTemplate;
module.exports = function (grunt) {
  var config = {
    dest: 'config/data/',
    updateDestSrc: 'animations/',
    updateOriginSrc: '../animate.css/source/',
    animationTemplateSrc: 'config/templates/animation.html'
  };

  /**
   * Generate the static data for AniCollection
   * @author Dariel Noel <darielnoel@gmail.com>
   * @since  2015-03-10
   * @return {[type]}   [description]
   */
  var updateLibs = function () {

    var categories = grunt.file.readJSON('config/grunt/available-animations.json'),
      category, files, file,
      dbCategoryList = [];

    // load template for comments
    animationTemplate = grunt.file.read(config.animationTemplateSrc);

    for ( category in categories ) {
      // examp: category = 'attention_seekers'
      if ( categories.hasOwnProperty(category) ) {
        files = categories[category];
        // specif animation
        for (file in files) {
          if ( files.hasOwnProperty(file) && files[file] ) {
            updateAnimation(category, file);
          }
        }
      }
    }
  };

  function updateAnimation(categoryName, fileName){
    var animation,
        updateDestFilepath = config.updateDestSrc + categoryName + '/' + fileName + '.css',
        updateOriginFilepath = config.updateOriginSrc + categoryName + '/' + fileName + '.css',
        outpuFilepath = updateDestFilepath,
        currentFileOrigin,
        currentFileDest,
        resultString,
        renderedComments;

    // test if the animation exist in the current library
    if(grunt.file.exists(updateOriginFilepath)){
      // read the file
      currentFileDest = grunt.file.read(updateDestFilepath);
      currentFileOrigin = grunt.file.read(updateOriginFilepath);

      currentFileOrigin = clearCssComments(currentFileOrigin);

      // extract relevant data
      animation = parseString(currentFileDest);

      if(animation.length > 0){
        animation = animation[0];

        animation.fileOriginCode = currentFileOrigin;

        // make comments from animation
        resultString = renderAnimationTemplate(animation);
      }

      // write destiny
      grunt.file.write(outpuFilepath, resultString);
    }

  }

  function renderAnimationTemplate(animation){
    var output = Mustache.render(animationTemplate, animation);
    return output;
  }

  function clearCssComments(cssCode){
    var result;

    result = new CleanCSS({
        noAdvanced:false,
        aggressiveMerging:false,
        keepBreaks:true
      }).minify(cssCode);

    result = beautify_css(result, { indent_size: 2 });

    return result;
  }



  /**
   * Parse annotations from a css file
   * TODO: We should be able to read more than
   * a comment block
   * @author Dariel Noel <darielnoel@gmail.com>
   * @since  2015-03-10
   * @param  {[type]}   currentFileOrigin [description]
   * @return {[type]}                     [description]
   */
  function parseString(currentFileOrigin){
      var result = annotation.parse(currentFileOrigin);
      return result;
  }

  // register task
  grunt.registerTask('update-libs', 'Update current source from original libs', updateLibs); // custom task

  // configuramos la tarea jasmine
  grunt.config.set('update-libs', config);
};
