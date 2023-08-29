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
      objects.splice(i, 1);
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
