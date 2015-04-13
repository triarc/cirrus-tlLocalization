declare var mod: ng.IModule;
declare module Triarc.Localization {
    interface ILocalizationResource {
        getLocaleEntriesMultiple(params: IGetEntryParameters): ng.IPromise<Triarc.Data.DataResponse<ILocaleEntry[]>>;
        getResourceKeysMultiple(params: {}): ng.IPromise<Triarc.Data.DataResponse<string[]>>;
        updateEntries(data: IUpdateParams): ng.IPromise<Triarc.Data.DataResponse<any>>;
        getLanguagesMultiple: (params: {}) => ng.IPromise<Triarc.Data.DataResponse<ILanguage[]>>;
    }
    interface IUpdateParams {
        UpdatedEntries: ILocaleEntry[];
        DeletedKeys: string[];
    }
    interface IGetEntryParameters {
        languageKey: string;
    }
    interface ILanguage {
        Name: string;
        LanguageIdentifier: string;
        Selected?: boolean;
    }
    interface ILocaleEntry {
        Id: number;
        LanguageKey: string;
        ResourceKey: string;
        Value: string;
        Delete?: boolean;
    }
    class Row {
        rowKey: string;
        rowColumns: ILocaleEntry[];
        constructor(key: string);
    }
    class LocalizationService {
        private $q;
        private resource;
        static serviceId: string;
        hasLoaded: boolean;
        languages: ILanguage[];
        rows: Row[];
        selectedLanguages: ILanguage[];
        newResource: string;
        entriesToUpdate: ILocaleEntry[];
        keysToDelete: string[];
        constructor($q: ng.IQService, resource: ILocalizationResource);
        refresh: () => void;
        selectLanguage: (language: ILanguage) => void;
        deselectLanguage: (language: ILanguage) => void;
        addKey: (key: string) => void;
        removeRow: (rowKey: string) => void;
        updateEntry: (entry: ILocaleEntry, del: boolean) => void;
        save: () => void;
        private loadLanguage;
        private unloadLanguage;
    }
    class LocalizationServiceProvider implements ng.IServiceProvider {
        setLocalizationResource(resourceName: string): void;
        resource: string;
        $get: (string | (($q: ng.IQService, $proxy: any) => LocalizationService))[];
        static providerId: string;
    }
}
declare module Triarc.Localization {
    class LocalizationController {
        private $scope;
        private $localization;
        static controllerId: string;
        static $inject: string[];
        filter: string;
        private maxLanguagesToSelect;
        constructor($scope: ng.IScope, $localization: LocalizationService);
        getFilteredEntries: () => Row[];
        toggleLanguage: (language: ILanguage) => void;
        addRow: () => void;
        valueChange: (entry: ILocaleEntry, del: boolean) => void;
        removeResource: (rowKey: string) => void;
        save: () => void;
    }
}
declare module Triarc.Localization {
    class LocalizationTable implements ng.IDirective {
        static directiveId: string;
        constructor();
        restrict: string;
        templateUrl: string;
    }
}
