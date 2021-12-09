const THREE = require('zincjs').THREE;
// Current model's associate data, data fields, external link, nerve map
// informations,
// these are proived in the organsFileMap array.
const OrgansSceneData = function() {
  this.currentName = "";
  this.currentSystem = "";
  this.currentPart = "";
  this.currentSpecies  = "";
  this.metaURL = "";
  this.viewURL = "";
  this.geometries = [];
  this.lines = [];
  this.glyphsets = [];
  this.pointsets = [];
  this.currentTime = 0.0;
  this.timeVarying = false;
}

/**
 * Viewer of 3D-organs models. Users can toggle on/off different views. Data is
 * displayed instead if models are not available.
 * 
 * @class
 * @param {PJP.ModelsLoader}
 *            ModelsLoaderIn - defined in modelsLoade.js, providing locations of
 *            files.
 * @param {String}
 *            PanelName - Id of the target element to create the
 *            {@link PJP.OrgansViewer} on.
 * @author Alan Wu
 * @returns {PJP.OrgansViewer}
 */
 const OrgansViewer = function(ModelsLoaderIn)  {
  (require('./RendererModule').RendererModule).call(this);
  const _this = this;
	let pickerScene = undefined;
	this.sceneData = new OrgansSceneData();
	const timeChangedCallbacks = new Array();
	const sceneChangedCallbacks = new Array();
  const organPartAddedCallbacks = new Array();
  let finishDownloadCallback = undefined;
	const modelsLoader = ModelsLoaderIn;
	_this.typeName = "Organ Viewer";
	
	this.getSceneData = function() {
	  return _this.sceneData;
	}

	/**
	 * Used to update internal timer in scene when time slider has changed.
	 */
	this.updateTime = function(value) {
    let duration = 6000;
    if (_this.scene)
      duration = _this.scene.getDuration();
    const actualTime = value / 100.0 * duration;
		if (!_this.sceneData.nerveMapIsActive) {
			if (pickerScene)
				pickerScene.setMorphsTime(actualTime);
			if (_this.scene)
				_this.scene.setMorphsTime(actualTime);
		}
		_this.sceneData.currentTime = value;
	}
	
	/**
	 * Update the time slider and other renderers/scenes when time has changed.
	 */
   const preRenderTimeUpdate = function() {
    let duration = 3000;
    if (_this.scene)
      duration = _this.scene.getDuration();
    const currentTime = _this.zincRenderer.getCurrentTime();
		for (let i = 0; i < timeChangedCallbacks.length;i++) {
			timeChangedCallbacks[i](currentTime);
		}
		if (!_this.sceneData.nerveMapIsActive && pickerScene)
			pickerScene.setMorphsTime(currentTime);
		if (_this.sceneData.nerveMap && _this.sceneData.nerveMap.additionalReader)
      _this.sceneData.nerveMap.additionalReader.setTime(currentTime / 
        duration);
		_this.sceneData.currentTime = currentTime / duration * 100.0;
  }
  
  const postRenderSelectedCoordinatesUpdate = function() {
    if (_this.selectedCenter) {
      const vector = new THREE.Vector3();
      vector.copy(_this.selectedCenter);
      const coord = _this.scene.vectorToScreenXY(vector);
      _this.selectedScreenCoordinates.x = coord.x;
      _this.selectedScreenCoordinates.y = coord.y;
    }
  }
	
	const preRenderUpdateCallback = function() {
		return function() {
      preRenderTimeUpdate();
		}
  }
  
  const postRenderUpdateCallback = function() {
		return function() {
      postRenderSelectedCoordinatesUpdate();
		}
	}
	
	 /**
		 * Add a callback which will be called when time has changed
		 */
	this.addTimeChangedCallback = function(callback) {
	  if (typeof(callback === "function"))
	    timeChangedCallbacks.push(callback);
	}
	
	this.setTexturePos = function(value) {
		if (_this.sceneData.nerveMap && _this.sceneData.nerveMap.additionalReader)
			_this.sceneData.nerveMap.additionalReader.setSliderPos(value);
	}

	this.addSceneChangedCallback = function(callback) {
	  if (typeof(callback === "function")) {
	    sceneChangedCallbacks.push(callback);
	  }
	}
	
	this.addOrganPartAddedCallback = function(callback) {
    if (typeof(callback === "function"))
      organPartAddedCallbacks.push(callback);
  }

  this.setFinishDownloadCallback = function(callback) {
    if (typeof(callback === "function"))
      finishDownloadCallback = callback;
  }

  this.unsetFinishDownloadCallback = function() {
    finishDownloadCallback = undefined;
  }

  this.getNamedObjectsToScreenCoordinates = function(name, camera) {
    const vector = new THREE.Vector3();
    vector.setFromMatrixPosition( obj.matrixWorld );
    const widthHalf = (width/2);
    const heightHalf = (height/2);
    vector.project(camera);
    vector.x = ( vector.x * widthHalf ) + widthHalf;
    vector.y = - ( vector.y * heightHalf ) + heightHalf;
    return vector;
  }

  const getIdObjectFromIntersect = function(intersected) {
    let id = undefined;
    let intersectedObject = undefined;
    if (intersected !== undefined) {
      if (intersected.object.userData && 
        intersected.object.userData.isMarker) {
        intersectedObject = intersected.object.userData.parent.morph;
      } else {
        intersectedObject = intersected.object;
      }
      if (intersectedObject) {
        if (intersectedObject.name) {
          id = intersectedObject.name;
        } else {
          const annotations = _this.getAnnotationsFromObjects(
            [intersectedObject]);
          if (annotations && annotations[0]) {
            id = annotations[0].data.group;
          }
        }
      }
    }
    return {"id":id, "object":intersectedObject};
  }
	 
	/**
	 * Callback function when a pickable object has been picked. It will then
	 * call functions in tissueViewer and cellPanel to show corresponding
	 * informations.
	 * 
	 * @callback
	 */
   const _pickingCallback = function() {
		return function(intersects, window_x, window_y) {
      const intersected = _this.getIntersectedObject(intersects);
      const idObject = getIdObjectFromIntersect(intersected);
      if (idObject.id) {
        if (idObject.object.userData.isGlyph) {
          if (idObject.object.name)
            _this.setSelectedByObjects([idObject.object], true);
          else
            _this.setSelectedByZincObject(idObject.object.userData.getGlyphset(), true);
        } else {
          _this.setSelectedByObjects([idObject.object], true);
        }
        return;
      } else {
				_this.setSelectedByObjects([], true);
			}
		}
	};
	
	/**
	 * Callback function when a pickable object has been hovered over.
	 * 
	 * @callback
	 */
   const _hoverCallback = function() {
		return function(intersects, window_x, window_y) {
      const intersected = _this.getIntersectedObject(intersects);
      const idObject = getIdObjectFromIntersect(intersected);
      if (idObject.id) {
        _this.displayArea.style.cursor = "pointer";
        _this.setHighlightedByObjects([idObject.object], true);
        return;
      }
      else {
				_this.displayArea.style.cursor = "auto";
				_this.setHighlightedByObjects([], true);
      }
		}
	};

	const changeOrganPartsVisibilityForScene = function(scene, name, value, type) {
		if (type == "all" || type == "geometries") {
			const geometries = scene.findGeometriesWithGroupName(name);
			for (let i = 0; i < geometries.length; i ++ ) {
				geometries[i].setVisibility(value);
			}
		}
		if (type == "all" || type == "glyphsets") {
			const glyphsets = scene.findGlyphsetsWithGroupName(name);
			for (let i = 0; i < glyphsets.length; i ++ ) {
				glyphsets[i].setVisibility(value);
			}
		}
		if (type == "all" || type == "pointsets") {
			const pointsets = scene.findPointsetsWithGroupName(name);
			for (let i = 0; i < pointsets.length; i ++ ) {
				pointsets[i].setVisibility(value);
			}
		}
		if (type == "all" || type == "lines") {
			const lines = scene.findLinesWithGroupName(name);
			for (let i = 0; i < lines.length; i ++ ) {
				lines[i].setVisibility(value);
			}
		}
	}

	/**
	 * Change visibility for parts of the current scene.
	 */
	this.changeGeometriesVisibility = function(name, value) {
		changeOrganPartsVisibilityForScene(_this.scene, name, value, 'geometries');
		if (pickerScene)
			changeOrganPartsVisibilityForScene(pickerScene, name, value, 'geometries');
	}

	/**
	 * Change visibility for parts of the current scene.
	 */
	this.changeGlyphsetsVisibility = function(name, value) {
		changeOrganPartsVisibilityForScene(_this.scene, name, value, 'glyphsets');
		if (pickerScene)
			changeOrganPartsVisibilityForScene(pickerScene, name, value, 'glyphsets');
	}

	/**
	 * Change visibility for parts of the current scene.
	 */
	this.changeLinesVisibility = function(name, value) {
		changeOrganPartsVisibilityForScene(_this.scene, name, value, 'lines');
		if (pickerScene)
			changeOrganPartsVisibilityForScene(pickerScene, name, value, 'lines');
	}

	/**
	 * Change visibility for parts of the current scene.
	 */
	this.changePointsetsVisibility = function(name, value) {
		changeOrganPartsVisibilityForScene(_this.scene, name, value, 'pointsets');
		if (pickerScene)
			changeOrganPartsVisibilityForScene(pickerScene, name, value, 'pointsets');
  }
  			
	/**
	 * Change visibility for parts of the current scene.
	 */
	this.changeOrganPartsVisibility = function(name, value, typeIn) {
		let type = "all";
		if (typeIn !== undefined)
			type = typeIn;
		changeOrganPartsVisibilityForScene(_this.scene, name, value, type);
		if (pickerScene)
			changeOrganPartsVisibilityForScene(pickerScene, name, value, type);
	}
	
	this.changeOrganPartsVisibilityCallback = function(name) {
		return function(value) {
			_this.changeOrganPartsVisibility(name, value);
		}
	}
			
	this.changeBackgroundColour = function(backgroundColourString) {
		const colour = new THREE.Color(backgroundColourString);
		if (_this.zincRenderer) {
			const internalRenderer = _this.zincRenderer.getThreeJSRenderer();
			internalRenderer.setClearColor( colour, 1 );
		}
	}

	const addOrganPartToSceneData = function(zincObject) {
		if (zincObject.groupName) {
			if (zincObject.isGeometry) {
				if (!_this.sceneData.geometries.includes(zincObject.groupName)) {
					_this.sceneData.geometries.push(zincObject.groupName);
				}
			} else if (zincObject.isGlyphset) {
				if (!_this.sceneData.glyphsets.includes(zincObject.groupName)) {
					_this.sceneData.glyphsets.push(zincObject.groupName);
				}
			} else if (zincObject.isLines) {
				if (!_this.sceneData.lines.includes(zincObject.groupName)) {
					_this.sceneData.lines.push(zincObject.groupName);
				}
			} else if (zincObject.isPointset) {
				if (!_this.sceneData.pointsets.includes(zincObject.groupName)) {
					_this.sceneData.pointsets.push(zincObject.groupName);
				}
			}
		}
	}

	const addOrganPart = function(systemName, partName, useDefautColour, zincObject) {
    for (let i = 0; i < organPartAddedCallbacks.length;i++) {
      organPartAddedCallbacks[i](zincObject.groupName, _this.scene.isTimeVarying(), zincObject);
    }
    if (useDefautColour)
      modelsLoader.setGeometryColour(zincObject, systemName, partName);
    addOrganPartToSceneData(zincObject);
		const annotation = new (require('./annotation').annotation)();
		annotation.data = {species:_this.sceneData.currentSpecies, system:systemName, part:partName, group:zincObject.groupName};
		zincObject.userData = [annotation];
	}

	  /**
		 * New organs geometry has been added to the scene, add UIs and make
		 * sure the viewport is correct.
		 */
	  const _addOrganPartCallback = function(systemName, partName, useDefautColour) {
	    return function(zincObject) {
	    	addOrganPart(systemName, partName, useDefautColour, zincObject);
	    }
	  }
	  
	  const downloadCompletedCallback = function() {
		  return function() {
			  _this.settingsChanged();
			  _this.sceneData.timeVarying = _this.scene.isTimeVarying();
        if (finishDownloadCallback)
          finishDownloadCallback();
		  }
	  }
	  
	  const singleItemDownloadCompletedCallback = function(systemName, partName, useDefautColour) {
      return function(geometry) {
        addOrganPart(systemName, partName, useDefautColour, geometry);
        _this.settingsChanged();
      }
	  }
	  
	  /**
		 * Toggle data field displays. Data fields displays flow/pressure and      <button @click="play">Play</button>
		 * other activities of the organs.
		 */
	  this.updateFieldvisibility = function(dataFields, value) {
      for ( let i = 0; i < dataFields.length; i ++ ) {
        if (value != i) {
          const geometryName = dataFields[i].PartName;
          _this.changeOrganPartsVisibility(geometryName, false);
        }
      }
      if (value > -1) {
        const partName = dataFields[value].PartName;
        if ((_this.scene.findGeometriesWithGroupName(partName).length > 0) ||
          (_this.scene.findGlyphsetsWithGroupName(partName).length > 0)) {
          _this.changeOrganPartsVisibility(partName, true);
        } else {
          const partDetails = getOrganDetails(dataFields[value].SystemName, partName);
          if (partDetails != undefined) {
            _this.scene.loadMetadataURL(modelsLoader.getOrgansDirectoryPrefix() + "/" + partDetails.meta);
          }
        }
	    }
	  }
	  
	  /**
		 * Return an array containing name(s) of species that also contains the
		 * currently displayed organs.
		 * 
		 * @returns {Array} containing species name
		 */
	  this.getAvailableSpecies = function(currentSpecies, currentSystem, currentPart) {
	    const availableSpecies = new Array();
	    availableSpecies.push("none");
	    const keysArray = Object.keys(organsFileMap);
	    for (index in keysArray) {
	      const species = keysArray[index];
	      if (species != currentSpecies) {
	        if (organsFileMap[species].hasOwnProperty(currentSystem) &&
	            organsFileMap[species][currentSystem].hasOwnProperty(currentPart)) {
	          availableSpecies.push(species);
	        }
	      }
	    }
	    return availableSpecies;
	  }
	  
	  const setSceneData = function(speciesName, systemName, partName, organsDetails) {
      _this.sceneData.nerveMapIsActive = false;
      _this.sceneData.nerveMap = undefined;
      _this.sceneData.metaURL = "";
      _this.sceneData.viewURL = "";
      _this.sceneData.currentSpecies = speciesName;
      _this.sceneData.currentSystem = systemName;
			_this.sceneData.currentPart = partName;
			_this.sceneData.currentTime = 0.0;
			_this.sceneData.geometries.splice(0);
			_this.sceneData.lines.splice(0);
			_this.sceneData.glyphsets.splice(0);
			_this.sceneData.pointsets.splice(0);
			_this.sceneData.timeVarying = false;
      // This is used as title
      let name = "";
      if (speciesName)
        name = speciesName + "/";
      if (systemName)
        name = systemName + "/";
      if (partName)
        name = partName;
      _this.sceneData.currentName = name;
	  }

	  this.loadOrgansFromURL = function(url, speciesName, systemName, partName, viewURL) {
		  if (_this.zincRenderer) {
			  if (partName && (_this.sceneData.metaURL !== url)) {
			      setSceneData(speciesName, systemName, partName, undefined);
			      const name = _this.sceneData.currentName;
			      let organScene = _this.zincRenderer.getSceneByName(name);
			      if (organScene) {
			    	  organScene.clearAll();
			      } else {
			    	  organScene = _this.zincRenderer.createScene(name);
			      }
			      for (let i = 0; i < sceneChangedCallbacks.length;i++) {
			    	  sceneChangedCallbacks[i](_this.sceneData);
			      }
			      if (viewURL && viewURL != "") {
			    	  _this.sceneData.viewURL = viewURL;
				      organScene.loadViewURL(_this.sceneData.viewURL);
			      } else {
			    	  _this.sceneData.viewURL = undefined;
            }
			      _this.sceneData.metaURL = url;
			      organScene.loadMetadataURL(url, _addOrganPartCallback(systemName, partName, false),
			    	  downloadCompletedCallback());	      
			      _this.scene = organScene;
			      _this.zincRenderer.setCurrentScene(organScene);
			      _this.graphicsHighlight.reset();
			      const zincCameraControl = organScene.getZincCameraControls();
			      zincCameraControl.enableRaycaster(organScene, _pickingCallback(), _hoverCallback());
			      zincCameraControl.setMouseButtonAction("AUXILIARY", "ZOOM");
			      zincCameraControl.setMouseButtonAction("SECONDARY", "PAN");
			  }
		  }
	  }
	  	  
	  this.alignCameraWithSelectedObject = function(transitionTime) {
	    const objects = _this.graphicsHighlight.getSelected();
	    if (objects && objects[0] && objects[0].userData) {
	      _this.scene.alignObjectToCameraView(objects[0].userData, transitionTime);
	    }
	  }
	  
	  this.exportSettings = function() {
		  const settings = {};
		  settings.name = _this.instanceName;
		  if (_this.sceneData.currentSystem)
			  settings.system = _this.sceneData.currentSystem;
		  if (_this.sceneData.currentSpecies)
			  settings.species  = _this.sceneData.currentSpecies;
		  if (_this.sceneData.currentPart)
			  settings.part = _this.sceneData.currentPart;
		  settings.metaURL = _this.sceneData.metaURL;
		  if (_this.sceneData.viewURL)
			  settings.viewURL = _this.sceneData.viewURL;
		  settings.dialog = "Organ Viewer";
		  return settings;
	  }
	  
	  this.importSettings = function(settings) {
		  if (settings && (settings.dialog == this.typeName)) {
			  _this.setName(settings.name);
			  if (settings.metaURL !== undefined && settings.metaURL != "") {
				  _this.loadOrgansFromURL(settings.metaURL, settings.species,
					settings.system, settings.part, settings.viewURL);
			  } else {
				  _this.loadOrgans(settings.species, settings.system, settings.part);
			  }
			  return true;
		  }
		  return false;
	  }
		
	/**
	 * initialise loading of the html layout for the organs panel, this is
	 * called when the {@link PJP.OrgansViewer} is created.
	 * 
	 * @async
	 */
	 const initialise = function() {
	   _this.initialiseRenderer(undefined);
	   if (_this.zincRenderer) {
       _this.zincRenderer.addPreRenderCallbackFunction(preRenderUpdateCallback());
       _this.zincRenderer.addPostRenderCallbackFunction(postRenderUpdateCallback());
     }
  }
	 
	initialise();

}

OrgansViewer.prototype = Object.create((require('./RendererModule').RendererModule).prototype);
exports.OrgansViewer = OrgansViewer;
