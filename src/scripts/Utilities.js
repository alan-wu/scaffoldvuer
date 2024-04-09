export const createListFromPrimitives = (primitives, list) => {
  if (primitives) {
    let id = "";
    primitives.forEach(primitive => {
      id = primitive.uuid;
      if (primitive.region) {
        id = primitive.region.uuid + "/" + id;
      }
      if (primitive && primitive.getVisibility()) {
        list.push(id);
      }
    });
  }
  return list;
}

const getDistance = (point1, point2) => {
  const dist0 = point1[0] - point2[0];
  const dist1 = point1[1] - point2[1];
  const dist2 = point1[2] - point2[2];
  return Math.sqrt(dist0 * dist0 + dist1 * dist1 + dist2 * dist2);
}

export const getEditableLines = (event) => {
  const zincObjects = event.zincObjects;
  if (zincObjects.length > 0 && zincObjects[0]) {
    const zincObject = zincObjects[0];
    if (zincObject.isEditable && zincObject.isLines2) {
      const info = event.identifiers[0].extraData.intersected;
      if (info && info.faceIndex > -1) {
        const v = zincObject.getVerticesByFaceIndex(info.faceIndex);
        const pointOnLine = event.identifiers[0].extraData.intersected.pointOnLine
        if (v.length > 1) {
          const dist0 = getDistance(v[0], pointOnLine);
          const dist1 = getDistance(v[1], pointOnLine);
          if (dist0 > dist1) {
            return { zincObject, vertexIndex: info.faceIndex * 2, point: v[1]};
          } else {
            return { zincObject, vertexIndex: info.faceIndex * 2 + 1, point: v[0]};
          }
        }
      }
    }
  }
  return undefined;
}

export const extractAllFullPaths = (item, list) => {
  let nodeName = "";
  if (item.isRegion) {
    nodeName = `__r${item.regionPath}`;
  }
  if (item.isPrimitives) {
    nodeName = `${item.regionPath}/${item.label}`;
  }
  list.push(nodeName);
  if (item.children)
    item.children.forEach(child => extractAllFullPaths(child, list));
}

export const findObjectsWithNames = (rootRegion, names, regionPath, transverse) => {
  let targetRegion = rootRegion;
  const targetObjects = [];
  if (regionPath)
    targetRegion = rootRegion.findChildFromPath(regionPath);
  if (targetRegion) {
    const isArray = Array.isArray(names);
    let array = names;
    if (!isArray) {
      array = [array];
    }
    array.forEach(name => {
      const temp = targetRegion.findObjectsWithGroupName(name, transverse);
      targetObjects.push(...temp);
    });
  }
  return targetObjects;
}

export const getAllObjects = (scene) => {
  let objects = scene.getRootRegion().getAllObjects(true);
  let id = 1;
  return objects.map(object => Object.assign(object, { id: id++ })); // Add id to each object
}

const findObjectWithUUID = (objects, uuid, remove) => {
  const index = objects.findIndex(obj => obj.uuid === uuid);
  let object = undefined;
  if (index > -1) {
    object = objects[index];
    if (remove) {
      objects.splice(index, 1);
    }
  }
  return object;
}

export const convertUUIDsToFullPaths = (rootRegion, IDs) => {
  const results = [];
  if (rootRegion && IDs && IDs.length > 0) {
    //a region to primitivs map list
    const rpLists = {};
    const reIDToPath = {};
    const allRegions = [rootRegion, ...rootRegion.getChildRegions(true)];
    let region = undefined;
    let primitive = undefined;
    let regionID = undefined;
    
    IDs.forEach(id => {
      const uuids = id.split("/");
      regionID = uuids[0];
      region = findObjectWithUUID(allRegions, regionID, false);
      if (region) {
        if (!reIDToPath[regionID]) {
          reIDToPath[regionID] = region.getFullPath();
        }
        if (uuids[1]) {
          if (!rpLists[regionID]) {
            rpLists[regionID] = region.getAllObjects(false);
          }
          primitive = findObjectWithUUID(rpLists[regionID], uuids[1], true);
          if (primitive) {
            results.push(`${reIDToPath[regionID]}/${primitive.groupName}`);
          }
        } else {
          results.push(`__r/${reIDToPath[regionID]}`);
        }
      }
    });
  }
  return results;
}

export const createUnqiuesFromObjects = (zincObjects) => {
  if (zincObjects) {
    const expanded = [];
    zincObjects.forEach(obj => {
      if (obj.isZincObject) {
        expanded.push(obj);
      } else if (obj.isRegion) {
        expanded.push(...obj.getAllObjects(true));
      }
    });
    const uniq = Object.values(
      expanded.reduce((acc, obj) => ({ ...acc, [obj.uuid]: obj }), {})
    );
    return uniq;
  }
  return [];
}

export const getObjectsFromAnnotations = (scene, annotations) => {
  const returned = {label: "Multiple selections", regionPath: "", objects: []};
  if (annotations && scene) {
    const rpList = {};
    const rootRegion = scene.getRootRegion();
    if (annotations.length > 0) {
      returned.regionPath = annotations[0].data.region;
      returned.label = annotations[0].data.group;
    }
    annotations.forEach(annotation => {
      if (!annotation.data.region.includes(returned.regionPath)) {
        returned.regionPath = "";
      }
      if (returned.label !== annotation.data.group) {
        returned.label = "Multiple selections";
      }
      const region = rootRegion.findChildFromPath(annotation.data.region);
      if (!rpList[region.uuid]) {
        rpList[region.uuid] = region.getAllObjects(false);
      }
      const obj = findObjectWithUUID(rpList[region.uuid], annotation.data.uuid);
      if (obj) returned.objects.push(obj);
    });
  }
  return returned;
}
