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

export const findObjectsWithNames = (rootRegion, names, regionPath) => {
  let targetRegion = rootRegion;
  const targetObjects = [];
  if (regionPath)
    targetRegion = rootRegion.findChildFromPath(regionPath);
  if (targetRegion) {
    names.forEach(name => {
      const temp = targetRegion.findObjectsWithGroupName(name, true);
      targetObjects.push(...temp);
    });
  }
  return targetObjects;
}
