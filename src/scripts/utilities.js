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
    if (!isArray)
      array = [array];
      array.forEach(name => {
      const temp = targetRegion.findObjectsWithGroupName(name, transverse);
      targetObjects.push(...temp);
    });
  }
  return targetObjects;
}

export const getAllGroupNames = (scene) => {
  let groupNames = [];
  scene.forEachGeometry((geometry) => {
    if (geometry.groupName && !groupNames.includes(geometry.groupName))
      groupNames.push(geometry.groupName);
  })
  scene.forEachGlyphset((glyphset) => {
    if (glyphset.groupName && !groupNames.includes(glyphset.groupName))
      groupNames.push(glyphset.groupName);
  })
  scene.forEachLine((line) => {
    if (line.groupName && !groupNames.includes(line.groupName))
      groupNames.push(line.groupName);
  })
  return groupNames;
}

export const getAllObjects = (scene) => {
  let objects = [];
  scene.forEachGeometry((geometry) => {
    if (geometry.groupName && !objects.includes(geometry))
      objects.push(geometry);
  })
  scene.forEachGlyphset((glyphset) => { 
    if (glyphset.groupName && !objects.includes(glyphset))
      objects.push(glyphset);
  })
  scene.forEachLine((line) => {
    if (line.groupName && !objects.includes(line))
      objects.push(line);
  })
  let id = 1;
  return objects.map(object => Object.assign(object, { id: id++ })); // Add id to each object
}