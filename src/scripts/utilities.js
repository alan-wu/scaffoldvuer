export const createListFromPrimitives = (primitives, list) => {
  if (primitives) {
    primitives.forEach(primitive => {
      if (primitive && primitive.getVisibility()) {
        list.push({
          group: primitive.groupName,
          regionPath: primitive.region.getFullPath()
        });
      }
    });
  }
  return list;
}

export const extractAllIds = (item, list) => {
  list.push(item.id);
  if (item.children)
    item.children.forEach(child => extractAllIds(child, list));
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