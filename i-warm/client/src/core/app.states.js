(function() {
    var deps = [
      'app.states._root',
        'app.states.main',
      'app.states.dashboard',
      'app.states.addressbook'
    ];
    angular.module('app.states', deps);
})();