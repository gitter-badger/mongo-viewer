'use strict';

angular.module('app.controllers')
  .controller('CollectionCtrl', ['$rootScope', '$scope', 'Model', '$stateParams', '$mdDialog', '$mdSidenav', function($rootScope, $scope, Model, $stateParams, $mdDialog, $mdSidenav){
    
    $rootScope.collection = $stateParams.collection;
    $scope.data = [];

    // Make sure the sidebar is closed (for small screens)
    $mdSidenav('left').close();

    Model.query({database: $rootScope.database, collection: $rootScope.collection}).$promise.then(function(data){
      $scope.data = data;
    });

    $scope.showConfirm = function(ev, id) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to delete this entry?')
        .content('You will not be able to cancel it.')
        .ok('Delete')
        .cancel('Cancel')
        .targetEvent(ev);

      $mdDialog.show(confirm).then(function() {
        console.log('Delete the object ' + id);
        Model.delete({database: $rootScope.database, collection: $rootScope.collection, id: id})
          .$promise.then(function(response){
            console.log('ok', response);
          });
      });
    };

    $scope.newEntry = function(ev) {
      $mdDialog.show({
        controller: DialogController,
        templateUrl: 'dialogNewEntry.html',
        targetEvent: ev,
      })
      .then(function(response) {
        $scope.data.push(response.data);
      }, function() {
        // You cancelled the dialog
      });
    };

    var DialogController = ['$scope', '$mdDialog', 'Model', function($scope, $mdDialog, Model) {
      $scope.newObject = {name: 'ron', occupation: 'coder'};

      $scope.cancel = function() {
        $mdDialog.cancel();
      };

      $scope.save = function() {
        Model.save({database: $rootScope.database, collection: $rootScope.collection}, $scope.newObject)
          .$promise.then(function(response){
            $mdDialog.hide(response);
          });
      };
    }];
      
  }])
  .directive('jsonTextarea', function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attrs, ctrl) {
        ctrl.$formatters.push(function formatter(value) {
          return JSON.stringify(value, undefined, 2);
        });
        ctrl.$parsers.push(function(value) {
          try {
            var result = JSON.parse(value);
            ctrl.$setValidity('json', true);
            return result;
          } catch (e) {
            ctrl.$setValidity('json', false);
            return undefined;
          }
        });
      }
    };
  });