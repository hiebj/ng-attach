module.exports = function(config) {
  config.set({
    files: [
      'node_modules/angular/angular.min.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'attach*.js'
    ],
    frameworks: [
      'jasmine'
    ],
    browsers: [
      'PhantomJS2'
    ],
    reporters: [
      'spec'
    ]
  });
};
