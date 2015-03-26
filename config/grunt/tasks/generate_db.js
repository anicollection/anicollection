//-----------------------------------------------------------
// Tareas para generar json a partir de los sources
//
//------------------------------------------------------------
/* jshint node:true */


'use strict';
var annotation = require('css-annotation'),
    CleanCSS = require('clean-css'),
    beautify_css = require('js-beautify').css;
module.exports = function (grunt) {
  var config = {
    dest: 'config/data/',
    src: 'prefixed_source/animations/',
    unprefixedSrc: 'animations/'
  };

  /**
   * Generate the static data for AniCollection
   * @author Dariel Noel <darielnoel@gmail.com>
   * @since  2015-03-10
   * @return {[type]}   [description]
   */
  var generateDB = function () {

    var categories = grunt.file.readJSON('config/grunt/available-animations.json'),
      category, files, file,
      target = [ 'source/_base.css' ],
      count = 0,
      categoryCount = 0,
      dbCategoryList = [];

    for ( category in categories ) {
      // examp: category = 'attention_seekers'
      if ( categories.hasOwnProperty(category) ) {
        files = categories[category];
        dbCategoryList[categoryCount] = makeCategoryObject(category);
        // specif animation
        for (file in files) {
          if ( files.hasOwnProperty(file) && files[file] ) {
            dbCategoryList[categoryCount].animationList.push({name:file});
            createAnimationObject(category, file);
            count += 1;
          }
        }
      }
      categoryCount++;
    }

    if (!count) {
      grunt.log.writeln('No animations activated.');
    } else {
      grunt.log.writeln(count + (count > 1 ? ' animations' : ' animation') + ' activated.');
      saveCategoryList(dbCategoryList);
    }

  };

  /**
   * Return a category object
   * @author Dariel Noel <darielnoel@gmail.com>
   * @since  2015-03-10
   * @param  {[type]}   name [description]
   * @return {[type]}        [description]
   */
  function makeCategoryObject(name){
    return {
      name: name,
      animationList: []
    };
  }

  /**
   * Save the category List as json file
   * @author Dariel Noel <darielnoel@gmail.com>
   * @since  2015-03-10
   * @param  {[type]}   categoryObject [description]
   * @return {[type]}                  [description]
   */
  function saveCategoryList(categoryObject){
    var destinationPath = config.dest + 'db_category_list.json';
    grunt.file.write(destinationPath, JSON.stringify(categoryObject, null, 4));
    grunt.log.writeln('Prefixed file "' + destinationPath + '" created.');
  }

  /**
   * Create and save the animation object as json
   * @author Dariel Noel <darielnoel@gmail.com>
   * @since  2015-03-10
   * @param  {[type]}   categoryName [description]
   * @param  {[type]}   fileName     [description]
   * @return {[type]}                [description]
   */
  function createAnimationObject(categoryName, fileName){
    var animation,
        inputFilepath = config.src + categoryName + '/' + fileName + '.css',
        inputPlainFilepath = config.unprefixedSrc + categoryName + '/' + fileName + '.css',
        outpuFilepath = config.dest + categoryName + '/' + 'db_'+ fileName + '.json',
        currentFileSource,
        currentFilePlainSource,
        metadataObject;

    // read the file
    currentFileSource = grunt.file.read(inputFilepath);
    currentFilePlainSource = grunt.file.read(inputPlainFilepath);

    // extract relevant data
    animation = parseString(currentFileSource);

    // TODO: quitar los comentarios antes de guardarlo
    if(animation.length > 0){
      animation = animation[0];
      animation.cssCode = new CleanCSS({
        noAdvanced:false,
        aggressiveMerging:false,
        keepBreaks:true
      }).minify(currentFileSource);

      animation.plainCssCode = new CleanCSS({
        noAdvanced:false,
        aggressiveMerging:false,
        keepBreaks:true
      }).minify(currentFilePlainSource);
      animation.cssCode = beautify_css(animation.cssCode, { indent_size: 2 });
      animation.plainCssCode = beautify_css(animation.plainCssCode, { indent_size: 2 });
    }

    // write destiny
    grunt.file.write(outpuFilepath, JSON.stringify(animation, null, 4));
  }

  /**
   * Parse annotations from a css file
   * TODO: We should be able to read more than
   * a comment block
   * @author Dariel Noel <darielnoel@gmail.com>
   * @since  2015-03-10
   * @param  {[type]}   currentFileSource [description]
   * @return {[type]}                     [description]
   */
  function parseString(currentFileSource){
      var result = annotation.parse(currentFileSource);
      return result;
  }

  // register task
  grunt.registerTask('generate-db', 'Generate static files for AniCollection', generateDB); // custom task

  // configuramos la tarea jasmine
  grunt.config.set('generate-db', config);
};
