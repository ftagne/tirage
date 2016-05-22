'use strict';

/* Controllers */

var tirageControllers = angular.module('tirageControllers', []);

tirageControllers.controller('homeCtrl', ['$scope', '$rootScope', '$routeParams', '$location', '$log', 'Tirages', 'fAlert', 'Compagny',
    function($scope, $rootScope, $routeParams, $location, $log, Tirages, fAlert, Compagny) {

        var numLigne = 2;

        var MIN_NB_LIGNE = 2;
        var MAX_NB_LIGNE = 15;

        $rootScope.isValide = false;

        $rootScope.company = '';

        $rootScope.verifierCompagny = function(text) {
            if (text && text.length > 0) {
                $rootScope.loaderEnabled = false;
                Compagny.get({
                    company: text
                }, function success(data) {
                    if (data === false) {
                        fAlert.error("Le nom \'" + text + "\' du tirage existe déja.", {
                            timeout: 3000
                        });
                    }
                    $rootScope.loaderEnabled = true;
                }, function error(e) {
                    fAlert.error("une erreur s'est produite : " + e.statusText, {
                        timeout: 3000
                    });
                    $rootScope.loaderEnabled = true;
                });
            }
        };

        $scope.ajouterLigne = function() {
            $rootScope.candidats.push({
                id: numLigne++,
                email: "",
                secureCode: ""
            });
        };

        $scope.init = function() {

            $rootScope.candidats = [{
                id: "0",
                email: "",
                secureCode: ""
            }, {
                id: "1",
                email: "",
                secureCode: ""
            }];
        };

        $scope.enableSupprimerLigne = function() {
            return $rootScope.candidats.length > MIN_NB_LIGNE;
        };
        $scope.enableAjouterLigne = function() {
            return $rootScope.candidats.length < MAX_NB_LIGNE;
        };

        $scope.supprimerLigne = function(p_candidat) {
            $rootScope.candidats = _.reject($rootScope.candidats, function(c) {
                return c.id == p_candidat.id;
            });
        };

        $scope.create = function() {
            var userList = {
                    company : $scope.company,
                    notificationEnabled : true,
                    userListRequest: $rootScope.candidats
                  };
            Tirages.save({
                    'createtirage': JSON.stringify(userList)
                }, function success(data) {
                    fAlert.success("enregistrer avec succes !", {
                        timeout: 3000
                    });
                    //backup for next page
                    $log.info(data.company);
                    $location.path('/tirage-dashboard/' + data.company );
                },
                function error(e) {
                    $log.info(e);
                    fAlert.error("une erreur s'est produite : contactez l'administrateur.\n details :" + e.statusText, {
                        timeout: 3000
                    });
                });
        };

        $scope.valider = function() {
            $rootScope.isValide = true;
        };



    }
]);

tirageControllers.controller('tirageCtrl', ['$scope', '$rootScope', '$routeParams', '$location', '$log', 'fAlert', 'Tirage',
    function($scope, $rootScope, $routeParams, $location, $log, fAlert, Tirage) {

        $rootScope.candidat = {};
        // Retrieve routeParams
        $scope.email = $routeParams.email;
        $scope.company = $routeParams.company;

        $scope.tirer = function() {
            var email = $scope.email === undefined ? $rootScope.candidat.email : $scope.email;
            var company = $scope.company === undefined ? $rootScope.candidat.company : $scope.company;

            var user = {
                email: email,
                secureCode: $rootScope.candidat.secureCode,
                company: company
            };
            var routePath = '/result/' + company + '/' + email;
            Tirage.save(user, function success(data) {
                    $location.path(routePath);
                },
                function error(e) {
                    $log.info("erreur lors du tirage : " + e);
                    fAlert.error("une erreur s'est produite : " + e.statusText, {
                        timeout: 3000
                    });
                });
        };
    }
]);

tirageControllers.controller('resultCtrl', ['$scope', '$rootScope', '$routeParams', '$location', '$log', 'fAlert', 'Resultat',
    function($scope, $rootScope, $routeParams, $location, $log, fAlert, Resultat) {

        // Retrieve routeParams
        $scope.email = $routeParams.email;
        $scope.company = $routeParams.company;

        $scope.resultats = [];
        $scope.init = function() {
            if (!$rootScope.candidat.secureCode) {
                $log("can't recovered secureCode");
                return;
            }
            $log.info('resultCtrl - charger les results');
            Resultat.query({
                email: $scope.email,
                secureCode: $rootScope.candidat.secureCode,
                company: $scope.company
            }, function success(data) {
                $scope.resultats.push(data);
            }, function error(e) {
                fAlert.error("une erreur s'est produite : " + e.statusText, {
                    timeout: 3000
                });
            });
        };
    }
]);

tirageControllers.controller('tirage-dashboardCtrl', ['$scope', '$rootScope', '$routeParams', '$location', '$log', 'fAlert','Resultats',
    function($scope, $rootScope, $routeParams, $location, $log, fAlert, Resultats) {

        $scope.company = $routeParams.company;
        $scope.candidats = [];
        $scope.buildLink = function(candidats) {
          $log.info('length ' +   candidats);
            for (var i = 0; i < candidats.length; i++) {
                candidats[i].link = '#/tirage/' + $scope.company + '/' + candidats[i].email;
                //candidats[i].numero = '';
            }
        };

        $scope.init = function() {
            $log.info('resultCtrl - charger les results');
            Resultats.query({
                company: $scope.company
            }, function success(data) {

                $scope.candidats = data;
                $log.info('candidats ' +   $scope.candidats);
                $scope.buildLink($scope.candidats);
            }, function error(e) {
                fAlert.error("une erreur s'est produite : " + e.statusText, {
                    timeout: 3000
                });
            });
        };


    }
]);

tirageControllers.controller('consulterCtrl', ['$scope', '$rootScope', '$routeParams', '$location', '$log', 'fAlert', 'Resultats',
    function($scope, $rootScope, $routeParams, $location, $log, fAlert, Resultats) {
        $scope.resultats = [];
        $scope.consulter = function() {
          var routePath = '/tirage-dashboard/' + $scope.candidat.company;
          $location.path(routePath);
            $log.info('resultCtrl - charger les results');

        };

    }
]);
