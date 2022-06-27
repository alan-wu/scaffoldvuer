const THREE = require('zincjs').THREE;

/**
 * Create a {@link Zinc.Renderer} on the dom element with corresponding elementID.
 * @param {String} elementID - id of the target dom element.
 * @returns {Zinc.Renderer}
 */
const createRenderer = function () {
  const WEBGL = require('./WebGL').WEBGL;
  const localContainer = document.createElement( 'div' );
  let localRenderer = undefined;;
  localContainer.style.height = "100%";
  if (WEBGL.isWebGLAvailable()) {
    const Zinc = require('zincjs');
    localRenderer = new Zinc.Renderer(localContainer, window);
    Zinc.defaultMaterialColor = 0xFFFF9C;
    localRenderer.initialiseVisualisation();
    localRenderer.playAnimation = false;
  } else {
    const warning = WEBGL.getWebGLErrorMessage();
    localContainer.appendChild(warning);
  }
  return {"renderer":localRenderer, "container":localContainer};
}

const RendererModule = function()  {
  (require('./BaseModule').BaseModule).call(this);
  this.scene = undefined;
  this.rendererContainer = undefined;
  this.displayArea = undefined;
  this.graphicsHighlight = new (require("./graphicsHighlight").GraphicsHighlight)();
  this.zincRenderer = null;
  this.selectedScreenCoordinates = new THREE.Vector3();
  this.selectedCenter = undefined;
}

RendererModule.prototype = Object.create((require('./BaseModule').BaseModule).prototype);

/**
 * This function will get the the first intersected object with name or
 * the first glyph object with name.
 */
RendererModule.prototype.getIntersectedObject = function(intersects) {
	if (intersects) {
		for (let i = 0; i < intersects.length; i++) {
			if (intersects[i] !== undefined) {
				if (intersects[i].object &&
            intersects[i].object.userData && 
            intersects[i].object.userData.isZincObject && 
            ((intersects[i].object.name && 
              intersects[i].object.name !== "_Unnamed") ||
            intersects[i].object.userData.isMarker))
					return intersects[i];
			}
		}
	}
	return undefined;
}

RendererModule.prototype.getAnnotationsFromObjects = function(objects) {
  const annotations = [];
  for (var i = 0; i < objects.length; i++) {
    const zincObject = objects[i].userData;
    let annotation = undefined;
    if (zincObject) {
      if (zincObject.isGlyph || zincObject.isGlyphset) {
        const glyphset = zincObject;
        if (zincObject.isGlyph)
          glyphset = zincObject.getGlyphset();
        annotation = glyphset.userData ? glyphset.userData.annotation : undefined;
        if (annotation && annotation.data) {
          if (objects[i].name && objects[i].name != "")
            annotation.data.id = objects[i].name;
          else
            annotation.data.id = glyphset.groupName;
        }
      } else {
        annotation = zincObject.userData ? zincObject.userData.annotation : undefined;
        if (annotation && annotation.data){
          annotation.data.id = objects[i].name;
        }
      }
    }
    if (annotation)
      annotations.push(annotation);
  }
	return annotations;
}

RendererModule.prototype.setHighlightedByObjects = function(
  objects, coords, propagateChanges) {
  const changed = this.graphicsHighlight.setHighlighted(objects);
  if (propagateChanges) {
    eventType = require("./eventNotifier").EVENT_TYPE.MOVE;
    if (changed)
      eventType = require("./eventNotifier").EVENT_TYPE.HIGHLIGHTED;
    const annotations = this.getAnnotationsFromObjects(objects);
    if (annotations.length > 0)
      annotations[0].coords = coords;
    this.publishChanges(annotations, eventType);
  }
  return changed;
}


RendererModule.prototype.setHighlightedByZincObjects = function(
  zincObjects, coords, propagateChanges) {
    let morphs = [];
    if (zincObjects) {
      zincObjects.forEach(zincObject => {
        if (zincObject && zincObject.morph)
          morphs.push(zincObject.morph);
      });
    }

    return this.setHighlightedByObjects(morphs, coords,propagateChanges);
}

RendererModule.prototype.setupLiveCoordinates = function(zincObjects) {
  if (zincObjects && (zincObjects.length > 0)) {
    const boundingBox = this.scene.getBoundingBoxOfZincObjects(zincObjects);
    let newSelectedCenter = new THREE.Vector3();
    boundingBox.getCenter(newSelectedCenter);
    if (this.selectedCenter == undefined)
      this.selectedCenter = newSelectedCenter;
    else {
      this.selectedCenter.x = newSelectedCenter.x;
      this.selectedCenter.y = newSelectedCenter.y;
    }
  } else {
    this.selectedCenter = undefined;
  }
}

RendererModule.prototype.objectsToZincObjects = function(objects) {
  const zincObjects = [];
  for (let i = 0; i < objects.length; i++) {
    let zincObject = objects[i].userData;
    if (zincObject) {
      if (zincObject.isGlyph || zincObject.isGlyphset) {
        let glyphset = zincObject;
        if (zincObject.isGlyph)
          glyphset = zincObject.getGlyphset();
        zincObjects. push(glyphset);
      } else {
        zincObjects. push(zincObject);
      }
    }
  }
  return zincObjects;
}


RendererModule.prototype.setSelectedByObjects = function(
  objects, coords, propagateChanges) {
  const changed = this.graphicsHighlight.setSelected(objects);
  if (changed) {
    const zincObjects = this.objectsToZincObjects(objects);
    this.setupLiveCoordinates(zincObjects);
    if (propagateChanges) {
      const eventType = require("./eventNotifier").EVENT_TYPE.SELECTED;
      const annotations = this.getAnnotationsFromObjects(objects);
      if (annotations.length > 0)
        annotations[0].coords = coords;
      this.publishChanges(annotations, eventType);
    }
  }
  return changed;
}

RendererModule.prototype.setSelectedByZincObjects = function(
  zincObjects, coords, propagateChanges) {
  let morphs = [];
  if (zincObjects) {
    zincObjects.forEach(zincObject => {
      if (zincObject && zincObject.morph)
        morphs.push(zincObject.morph);
    });
  }

  return this.setSelectedByObjects(morphs, coords, propagateChanges);
}

const addGlyphToArray = function(objects) {
  return function(glyph) {
    objects.push(glyph.getMesh());
  }
}

RendererModule.prototype.findObjectsByGroupName = function(groupName) {
  const geometries = this.scene.findGeometriesWithGroupName(groupName);
  const objects = [];
  for (let i = 0; i < geometries.length; i ++ ) {
    objects.push(geometries[i].morph);
  }
  const glyphsets = this.scene.findGlyphsetsWithGroupName(groupName);
  for (let i = 0; i < glyphsets.length; i ++ ) {
    glyphsets[i].forEachGlyph(addGlyphToArray(objects));
  }
  
  return objects;
}

RendererModule.prototype.setHighlightedByGroupName = function(groupName, propagateChanges) {
  const objects = this.findObjectsByGroupName(groupName);
  return this.setHighlightedByObjects(objects, undefined, propagateChanges);
}

RendererModule.prototype.setSelectedByGroupName = function(groupName, propagateChanges) {
  const objects = this.findObjectsByGroupName(groupName);
  return this.setSelectedByObjects(objects, undefined, propagateChanges);
}

RendererModule.prototype.changeBackgroundColour = function(backgroundColourString) {
  const colour = new THREE.Color(backgroundColourString);
  if (this.zincRenderer) {
    let internalRenderer = this.zincRenderer.getThreeJSRenderer();
    internalRenderer.setClearColor( colour, 1 );
  }
}

RendererModule.prototype.resetView = function() {
  if (this.zincRenderer)
    this.zincRenderer.resetView();
}
  
RendererModule.prototype.viewAll = function() {
  if (this.zincRenderer)
    this.zincRenderer.viewAll();
}

/**
 * Start the animation and let the renderer to processs with
 * time progression
 */
RendererModule.prototype.playAnimation = function(flag) {
  if (this.zincRenderer)
    this.zincRenderer.playAnimation = flag;
}

/**
* Set the speed of playback
*/
RendererModule.prototype.setPlayRate = function(value) {
  if (this.zincRenderer)
    this.zincRenderer.setPlayRate(value);
}

/**
* Get the speed of playback
*/
RendererModule.prototype.getPlayRate = function(value) {
  if (this.zincRenderer)
    return this.zincRenderer.getPlayRate();
  else
    return 0.0;
}
  
  /** Initialise everything in the renderer, including the 3D renderer,
 *  and picker for the 3D renderer.
 * 
 */
RendererModule.prototype.initialiseRenderer = function(displayAreaIn) {
  if (this.zincRenderer === undefined || this.rendererContainer === undefined) {
    let returnedValue = createRenderer();
    this.zincRenderer = returnedValue["renderer"];
    this.rendererContainer = returnedValue["container"];
  }
  if (displayAreaIn) {
    this.displayArea = displayAreaIn;
    this.displayArea.appendChild( this.rendererContainer );
    if (this.zincRenderer)
      this.zincRenderer.animate();
  }
}

RendererModule.prototype.destroy = function() {
  if (this.zincRenderer) {
    this.zincRenderer.dispose();
    this.zincRenderer.getThreeJSRenderer().dispose();
    this.zincRenderer = undefined;
  }
  (require('./BaseModule').BaseModule).prototype.destroy.call( this );
}

exports.RendererModule = RendererModule;