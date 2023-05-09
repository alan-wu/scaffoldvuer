/******************************************************************************

Flatmap viewer and annotation tool

Copyright (c) 2019  David Brooks

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

******************************************************************************/


//==============================================================================

import MiniSearch from 'minisearch';

//==============================================================================

// The properties of a feature we index and show

export const indexedProperties = [
    'label',
    'models',
    'source'
];

//==============================================================================

export class SearchIndex
{
    constructor()
    {
        this._searchEngine =  new MiniSearch({
            fields: ['groupName'],
            storeFields: ['groupName'],
            tokenize: (string, _fieldName) => string.split('"'), // indexing tokenizer
        });
        this._featureIds = [];
        this.zincObjects = [];
    }

    indexMetadata(featureId, metadata)
    //================================
    {
        const textSeen = [];
        for (const prop of indexedProperties) {
            if (prop in metadata) {
                const text = metadata[prop];
                if (!textSeen.includes(text)) {
                    this.addTerm_(featureId, text);
                    textSeen.push(text);
                }
            }
        }
    }

    addZincObject(zincObject, id)
    //=======================
    {
        const item = { groupName: zincObject.groupName, id };
        this._searchEngine.add(item, {fields: ['groupName']});
        this.zincObjects.push(zincObject);
    }

    clearResults()
    //============
    {
        this._;
    }

    removeAll()
    //=======================
    {
        this._searchEngine.removeAll();
        this.zincObjects.length = 0;
    }

    auto_suggest(text)
    //================
    {
        return this._searchEngine.autoSuggest(text, {prefix: true});
    }

    search(text){
        let results = this._searchEngine.search(text, {prefix: true});
        let zincResults = this.zincObjects.filter(zincObject => results.map(r => r.id).includes(zincObject.searchIndexId));
        return zincResults;
    }

    // search(text)
    // //==========
    // {
    //     const options = {};
    //     let results = [];
    //     text = text.trim()
    //     if (text.length > 2 && ["'", '"'].indexOf(text.slice(0, 1)) >= 0) {
    //         text = text.replaceAll(text.slice(0, 1), '');
    //         results = this._searchEngine.search(text, {prefix: true, combineWith: 'AND'});
    //     } else if (text.length > 1) {
    //         results = this._searchEngine.search(text, {prefix: true});
    //     }
    //     const featureResults = results.map(r => {
    //         return {
    //             featureId: this._featureIds[r.id],
    //             score: r.score,
    //             terms: r.terms,
    //             text: r.text
    //         }});
    //     return new SearchResults(featureResults);
    // }
}

//==============================================================================

class SearchResults
{
    constructor(results)
    {
        this.__results = results.sort((a, b) => (b.score - a.score));
        this.__featureIds = results.map(r => r.featureId);
    }

    get featureIds()
    {
        return this.__featureIds;
    }

    get results()
    {
        return this.__results;
    }
}

//==============================================================================
