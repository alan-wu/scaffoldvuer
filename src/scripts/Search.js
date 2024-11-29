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

import { createUnqiuesFromObjects } from './Utilities';

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
            fields: ['path', 'name'],
            storeFields: ['path'],
            tokenize: (string, _fieldName) => string.split(/[\s/]+/), // indexing tokenizer
        });
        this.idMaps = {};
    }

    addZincObject(zincObject, id)
    //=======================
    {
        const path = zincObject.getRegion().getFullPath();
        let groupName = zincObject.groupName;
        let fullPath = path ? `${path}/${zincObject.groupName}` : zincObject.groupName;
        groupName = groupName.replaceAll('"', '');
        fullPath = fullPath.replaceAll('"', '');
        const item = { path: fullPath, name: groupName, id };
        this._searchEngine.add(item);
        this.idMaps[id] = { path: fullPath, zincObject };
    }

    removeZincObject(zincObject, id)
    //=======================
    {
        const path = zincObject.getRegion().getFullPath();
        let groupName = zincObject.groupName;
        let fullPath = path ? `${path}/${zincObject.groupName}` : zincObject.groupName;
        groupName = groupName.replaceAll('"', '');
        fullPath = fullPath.replaceAll('"', '');
        const item = { path: fullPath, name: groupName, id };
        this._searchEngine.remove(item);
        delete this.idMaps[id];
    }

    addRegion(region, id)
    //=======================
    {
        let path = region.getFullPath();
        let regionName = region.getName();
        path = path.replaceAll('"', '');
        regionName = regionName.replaceAll('"', '');
        const item = { path, name: regionName, id };
        this._searchEngine.add(item);
        this.idMaps[id] = { path, zincObject: region };
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
        //this.zincObjects.length = 0;
        //this.regions.length = 0;
        this.idMaps = {};
    }

    auto_suggest(text) {
      let results = [];
      if (text.length > 2 && ["'", '"'].includes(text.slice(0, 1))) {
        text = text.replaceAll(text.slice(0, 1), '')
        results = this._searchEngine.search(text, {prefix: true, combineWith: 'AND'})
      } else if (text.length > 1) {
          results = this._searchEngine.search(text, {prefix: true})
      }
      const items = [];
      results.forEach(r => {
        if (r.id in this.idMaps) {
          items.push(this.idMaps[r.id].path);
        }
      });
      const unique = [...new Set(items)];
      const returned = [];
      unique.forEach(u => returned.push({suggestion: '"' + u + '"'}));
      return returned;
    }


    processResults(zincObjects, searchText) {
      const result = {
        regionPath: undefined,
        label: `Search Results for \"`,
      };
      if (Array.isArray(searchText)) {
        result.label += ','.join(searchText);
      } else {
        result.label += searchText;
      }
      result.label += `\"`;
      if (zincObjects.length === 1) {
        if (zincObjects[0].isRegion) {
          result.regionPath = zincObjects[0].getFullPath();
        } else if (zincObjects[0].isZincObject) {
          result.regionPath = zincObjects[0].getRegion().getFullPath();
          result.label = zincObjects[0].groupName;
        }
      }
      result["zincObjects"] = createUnqiuesFromObjects(zincObjects);
      return result;
    }

    search(text) {
      let results = undefined;
      if (text.length > 2 && ["'", '"'].includes(text.slice(0, 1))) {
          text = text.replaceAll(text.slice(0, 1), '')
          results = this._searchEngine.search(text, {prefix: true, combineWith: 'AND'})
      } else if (text.length > 1) {
          results = this._searchEngine.search(text, {prefix: true})
      }
      const zincResults = [];
      results.forEach(r => {
        if (r.id in this.idMaps) {
          zincResults.push(this.idMaps[r.id].zincObject);
        }
      });
      return zincResults;
    }

    searchTerms(terms) {
      let results = [];
      terms.forEach(term => {
        const result = this.search(term);
        results.push(...result);
      });
    
      return results;
    }

    searchAndProcessResult(terms) {
      let zincObjectResults = [];
      if (Array.isArray(terms)) {
        zincObjectResults = this.searchTerms(terms);
      } else {
        zincObjectResults = this.search(terms);
      }
      return this.processResults(zincObjectResults, terms);
    }

}

