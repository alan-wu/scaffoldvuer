const getRelativePath = (from, to) => {
  const fromParts = from.split('/').filter(Boolean);
  const toParts = to.split('/').filter(Boolean);
  while (fromParts.length && toParts.length && fromParts[0] === toParts[0]) {
    fromParts.shift();
    toParts.shift();
  }
  const upSteps = new Array(fromParts.length).fill('..');
  return [...upSteps, ...toParts].join('/') || '.';
};

const processTextureFile = (textureData, flatarray, objectURLs, filesMapping) => {
  if (textureData && textureData.images && textureData.images.source) {
    const images = textureData.images.source;
    for (let i = 0; i < images.length; i++) {
      const index = flatarray.findIndex((element) => {
        return element[0].includes(images[i]);
      });
      if (index > -1) {
        const objectURL = URL.createObjectURL(flatarray[index][1]);
        objectURLs.push(objectURL);
        textureData.images.source[i] = objectURL;
        filesMapping[objectURL] = images[i];
      }
    }
    const content = JSON.stringify(textureData);
    let blob = new Blob([content], { type: 'application/json' });
    return URL.createObjectURL(blob);
  }
};

const getJSON = async (URL) => {
  return fetch(URL)
    .then((response) => response.json())
    .then((responseJson) => {
      return responseJson;
    });
};

const createMetadataObjectURLs = async (text, list, flatarray) => {
  let content = text;
  const objectURLs = [];
  const filesMapping = [];
  for (const [key, file] of Object.entries(list)) {
    if (content.includes(key)) {
      const objectURL = URL.createObjectURL(file);
      const re = new RegExp(key, 'g');
      content = content.replace(re, objectURL);
      objectURLs.push(objectURL);
      filesMapping[objectURL] = key;
    }
  }
  const data = JSON.parse(content);
  for (let i = 0; i < data.length; i++) {
    if (data[i] && data[i].Type) {
      if (data[i].Type === 'Texture') {
        const textureData = await getJSON(data[i].URL);
        URL.revokeObjectURL(data[i].URL);
        const newURL = processTextureFile(textureData, flatarray, objectURLs, filesMapping);
        data[i].URL = newURL;
      }
    }
  }
  let newContent = JSON.stringify(data);
  let blob = new Blob([newContent], { type: 'application/json' });
  const metaURL = URL.createObjectURL(blob);
  objectURLs.push(metaURL);
  return {
    objectURLs,
    filesMapping,
    url: metaURL,
    format: 'metadata',
  };
};

const createNiftiURL = (content, zipped) => {
  let type = zipped ? 'application/x-gzip' : 'image/nii';
  let blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  return url;
};

const createGLTFURL = (content, binary) => {
  let type = binary ? 'model/gltf+binary' : 'model/gltf+json';
  let blob = new Blob([content], { type });
  const gltfURL = URL.createObjectURL(blob);
  const objectURLs = [gltfURL];
  return {
    objectURLs,
    url: gltfURL,
    format: 'gltf',
  };
};

const createURLFromFiles = async (flatarray) => {
  let list = {};
  let rootPath = '';
  let metadata = undefined;
  let gltf = undefined;
  let binary = false;
  for (let i = 0; i < flatarray.length; i++) {
    if (flatarray[i][1].name.includes('metadata.json')) {
      rootPath = flatarray[i][0].replace(flatarray[i][1].name, '');
      metadata = { rootPath, file: flatarray[i][1] };
      break;
    }
    if (flatarray[i][1].name.includes('.glb')) {
      gltf = { rootPath, file: flatarray[i][1] };
      binary = true;
      break;
    }
    if (flatarray[i][1].name.includes('.gltf')) {
      gltf = { rootPath, file: flatarray[i][1] };
      binary = false;
      break;
    }
  }
  if (metadata) {
    flatarray.forEach(([filePath, file]) => {
      if (file.name.match(/\.(json)$/)) {
        const relativePath = getRelativePath(rootPath, filePath);
        list[relativePath] = file;
      }
    });
    const metaFileURL = URL.createObjectURL(metadata.file);
    try {
      const response = await fetch(metaFileURL);
      if (!response.ok) {
        throw new Error('Cant process local file');
      }
      const text = await response.text();
      URL.revokeObjectURL(metaFileURL);
      return await createMetadataObjectURLs(text, list, flatarray);
    } catch (error) {
      console.error('Fetch failed:', error);
    }
  }
  if (gltf) {
    return createGLTFURL(gltf.file, binary);
  }
};

export { createNiftiURL, createURLFromFiles };
