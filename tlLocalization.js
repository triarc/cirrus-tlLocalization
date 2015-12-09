var mod = angular.module('tlLocalization', []);
/// <reference path="tllocalization.ts" />
var Triarc;
(function (Triarc) {
    var Localization;
    (function (Localization) {
        var Row = (function () {
            function Row(key) {
                this.rowKey = key;
                this.rowColumns = [];
            }
            return Row;
        })();
        Localization.Row = Row;
        var LocalizationService = (function () {
            function LocalizationService($q, resource) {
                var _this = this;
                this.$q = $q;
                this.resource = resource;
                this.newResource = "";
                this.refresh = function () {
                    _this.resource.getLanguagesMultiple({}).then(function (response) {
                        response.data.forEach(function (l) {
                            _this.languages.push(l);
                        });
                    }, function () { });
                    _this.resource.getResourceKeysMultiple({}).then(function (response) {
                        response.data.forEach(function (k) {
                            _this.rows.push(new Row(k));
                        });
                    }, function () { });
                    _this.hasLoaded = true;
                };
                this.selectLanguage = function (language) {
                    language.Selected = true;
                    var add = false;
                    for (var i = 0; i < _this.languages.length; i++) {
                        if (_this.languages[i].LanguageIdentifier == language.LanguageIdentifier) {
                            add = true;
                            break;
                        }
                    }
                    if (add) {
                        _this.loadLanguage(language.LanguageIdentifier);
                        _this.selectedLanguages.push(language);
                    }
                };
                this.deselectLanguage = function (language) {
                    language.Selected = false;
                    for (var i = 0; i < _this.selectedLanguages.length; i++) {
                        if (_this.selectedLanguages[i].LanguageIdentifier === language.LanguageIdentifier) {
                            _this.selectedLanguages.splice(i, 1);
                            break;
                        }
                    }
                    _this.unloadLanguage(language.LanguageIdentifier);
                };
                this.addKey = function (key) {
                    var row = new Row(key);
                    for (var i = 0; i < _this.languages.length; i++) {
                        if (_this.languages[i].Selected) {
                            row.rowColumns.push({ LanguageKey: _this.languages[i].LanguageIdentifier, Value: "", ResourceKey: key, Id: 0 });
                        }
                    }
                    _this.rows.push(row);
                };
                this.removeRow = function (rowKey) {
                    for (var i = 0; i < _this.rows.length; i++) {
                        if (_this.rows[i].rowKey == rowKey) {
                            _this.rows.splice(i, 1);
                            _this.keysToDelete.push(rowKey);
                            break;
                        }
                    }
                };
                this.updateEntry = function (entry, del) {
                    var index = -1;
                    if (del) {
                        entry.Value = "";
                        entry.Delete = true;
                    }
                    else {
                        entry.Delete = false;
                    }
                    for (var i = 0; i < _this.entriesToUpdate.length; i++) {
                        var e = _this.entriesToUpdate[i];
                        if (entry.ResourceKey === e.ResourceKey && entry.LanguageKey === e.LanguageKey) {
                            index = i;
                            break;
                        }
                    }
                    if (index === -1) {
                        _this.entriesToUpdate.push(entry);
                    }
                    console.log(_this.entriesToUpdate);
                };
                this.save = function () {
                    console.log(_this.entriesToUpdate);
                    _this.resource.updateEntries({ UpdatedEntries: _this.entriesToUpdate, DeletedKeys: _this.keysToDelete }).then(function (response) {
                        _this.entriesToUpdate = [];
                        _this.keysToDelete = [];
                    }, function () { });
                };
                this.loadLanguage = function (key) {
                    _this.resource.getLocaleEntriesMultiple({ languageKey: key }).then(function (response) {
                        for (var i = 0; i < _this.rows.length; i++) {
                            var entry;
                            for (var j = 0; j < response.data.length; j++) {
                                if (response.data[j].ResourceKey == _this.rows[i].rowKey) {
                                    entry = response.data[j];
                                    break;
                                }
                            }
                            if (!entry) {
                                entry = { ResourceKey: _this.rows[i].rowKey, LanguageKey: key, Value: "" };
                            }
                            _this.rows[i].rowColumns.push(entry);
                            entry = null;
                        }
                    }, function () { });
                };
                this.unloadLanguage = function (key) {
                    for (var i = 0; i < _this.rows.length; i++) {
                        var row = _this.rows[i];
                        for (var j = 0; j < row.rowColumns.length; j++) {
                            if (row.rowColumns[j].LanguageKey == key) {
                                row.rowColumns.splice(j, 1);
                                break;
                            }
                        }
                    }
                    _this.entriesToUpdate = _this.entriesToUpdate.filter(function (entry) {
                        return entry.LanguageKey != key;
                    });
                };
                this.hasLoaded = false;
                this.languages = [];
                this.rows = [];
                this.selectedLanguages = [];
                this.entriesToUpdate = [];
                this.keysToDelete = [];
            }
            LocalizationService.serviceId = "localizationService";
            return LocalizationService;
        })();
        Localization.LocalizationService = LocalizationService;
        var LocalizationServiceProvider = (function () {
            function LocalizationServiceProvider() {
                var _this = this;
                this.resource = "Localization";
                this.$get = ["$q", "$proxy", function ($q, $proxy) {
                        return new LocalizationService($q, $proxy[_this.resource]);
                    }];
            }
            LocalizationServiceProvider.prototype.setLocalizationResource = function (resourceName) {
                this.resource = resourceName;
            };
            LocalizationServiceProvider.providerId = "localizationServiceProvider";
            return LocalizationServiceProvider;
        })();
        Localization.LocalizationServiceProvider = LocalizationServiceProvider;
        mod.provider(LocalizationService.serviceId, LocalizationServiceProvider);
    })(Localization = Triarc.Localization || (Triarc.Localization = {}));
})(Triarc || (Triarc = {}));
/// <reference path="tllocalization.ts" />
/// <reference path="localizationservice.ts" />
var Triarc;
(function (Triarc) {
    var Localization;
    (function (Localization) {
        var LocalizationController = (function () {
            function LocalizationController($scope, $localization) {
                var _this = this;
                this.$scope = $scope;
                this.$localization = $localization;
                this.filter = "";
                this.maxLanguagesToSelect = 2;
                this.getFilteredEntries = function () {
                    if (_this.filter === "") {
                        return _this.$localization.rows;
                    }
                    return _this.$localization.rows.filter(function (row) {
                        return (row.rowKey.toLowerCase().indexOf(_this.filter.toLowerCase()) > -1);
                    });
                };
                this.toggleLanguage = function (language) {
                    if (language.Selected) {
                        _this.$localization.selectLanguage(language);
                    }
                    else {
                        _this.$localization.deselectLanguage(language);
                    }
                };
                this.addRow = function () {
                    if (_this.$localization.newResource) {
                        _this.$localization.addKey(_this.$localization.newResource);
                        _this.$localization.newResource = "";
                    }
                };
                this.valueChange = function (entry, del) {
                    _this.$localization.updateEntry(entry, del);
                };
                this.removeResource = function (rowKey) {
                    _this.$localization.removeRow(rowKey);
                };
                this.save = function () {
                    _this.$localization.save();
                };
                if (!this.$localization.hasLoaded) {
                    this.$localization.refresh();
                }
            }
            LocalizationController.controllerId = "localizationController";
            LocalizationController.$inject = ["$scope", Localization.LocalizationService.serviceId];
            return LocalizationController;
        })();
        Localization.LocalizationController = LocalizationController;
        mod.controller(LocalizationController.controllerId, LocalizationController);
    })(Localization = Triarc.Localization || (Triarc.Localization = {}));
})(Triarc || (Triarc = {}));
/// <reference path="tllocalization.ts" />
var Triarc;
(function (Triarc) {
    var Localization;
    (function (Localization) {
        var LocalizationTable = (function () {
            function LocalizationTable() {
                this.restrict = 'E';
                this.templateUrl = "LocalizationTableTemplate.html";
            }
            LocalizationTable.directiveId = "tlLocalizationTable";
            return LocalizationTable;
        })();
        Localization.LocalizationTable = LocalizationTable;
        mod.directive(LocalizationTable.directiveId, function () { return new LocalizationTable(); });
    })(Localization = Triarc.Localization || (Triarc.Localization = {}));
})(Triarc || (Triarc = {}));

angular.module('tlLocalization').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('tlLocalization/LocalizationTableTemplate.html',
    "<style>.input-lang {\r" +
    "\n" +
    "\t\tborder: 0;\r" +
    "\n" +
    "\t\theight: 30px;\r" +
    "\n" +
    "\t\tborder-right: 1px solid lightgrey;\r" +
    "\n" +
    "\t\tborder-left: 1px solid lightgrey;\r" +
    "\n" +
    "\t\tpadding: 0 0 0 3px;\r" +
    "\n" +
    "\t\twidth: 90%;\r" +
    "\n" +
    "\t\tpadding-right: 35px;\r" +
    "\n" +
    "\t}\r" +
    "\n" +
    "\r" +
    "\n" +
    "\t.splash {\r" +
    "\n" +
    "\t\tdisplay: none;\r" +
    "\n" +
    "\t}\r" +
    "\n" +
    "\r" +
    "\n" +
    "\t.ellipsis {\r" +
    "\n" +
    "\t\ttext-overflow: ellipsis;\r" +
    "\n" +
    "\t}</style><div ng-controller=\"localizationController as ctrl\"><div class=\"well\"><h1>Localization</h1></div><div class=\"well\" style=\"height: 60px\"><div class=\"row-fluid\"><div class=\"col-xs-4\" ng-repeat=\"lang in ctrl.$localization.languages\"><label><input ng-model=\"lang.Selected\" ng-disabled=\"ctrl.$localization.selectedLanguages.length >= ctrl.maxLanguagesToSelect && !lang.Selected\" type=\"checkbox\" ng-change=\"ctrl.toggleLanguage(lang)\"><text>{{lang.Name}}</text></label></div></div></div><div class=\"well\" style=\"height: 81px\"><input type=\"text\" style=\"height: 43px;padding-left: 3px;float: left\" ng-model=\"ctrl.filter\" placeholder=\"Filter by Key\"><div style=\"height: 10px;float:left;width: 60px\"></div><input type=\"text\" style=\"height: 43px;padding-left: 3px\" ng-model=\"ctrl.$localization.newResource\" placeholder=\"New Key\"><div class=\"btn btn-primary\" ng-click=\"ctrl.addRow();\" ng-class=\"{disabled : !ctrl.$localization.newResource} \">Add Key</div><div style=\"float: right\" class=\"btn btn-primary\" ng-click=\"ctrl.save()\" ng-class=\"{disabled: ctrl.$localization.entriesToUpdate.length == 0 && ctrl.$localization.keysToDelete.length == 0}\">Save</div></div><div class=\"row-fluid\" style=\"border-bottom: 1px solid lightgrey\"><div class=\"col-xs-4\"><h4>Keys</h4></div><div class=\"col-xs-4\" ng-repeat=\"lang in ctrl.$localization.selectedLanguages\"><h4>{{lang.Name}}</h4></div><div style=\"clear: both\"></div></div><div class=\"row-fluid\" style=\"border-bottom: 1px solid lightgrey\" ng-repeat=\"row in ctrl.$localization.rows |filter:ctrl.filter |orderBy: row.rowKey\"><div class=\"col-xs-4 ellipsis\" style=\"height: 30px\"><span ng-click=\"ctrl.removeResource(row.rowKey)\" class=\"glyphicon glyphicon-remove\" style=\"margin-top: 7px;cursor: pointer\"></span>&nbsp;&nbsp; {{row.rowKey}}</div><div class=\"col-xs-4\" style=\"height: 30px\" ng-repeat=\"col in row.rowColumns\"><input class=\"input-lang\" placeholder=\"No Entry\" type=\"text\" ng-change=\"ctrl.valueChange(col, false)\" ng-model=\"col.Value\"><div ng-show=\"col.Value\" ng-click=\"ctrl.valueChange(col,true)\" class=\"glyphicon glyphicon-remove\" style=\"cursor: pointer;margin-left:-25px;top:3px\"></div></div><div style=\"clear:both\"></div></div><div style=\"margin-bottom: 50px\"></div></div>"
  );

}]);
