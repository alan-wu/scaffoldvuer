import volumeTexture from "zincjs/src/shaders/volumeTexture.js";

const getVolumeTexture = (texture) => {
  const myUniforms = volumeTexture.getUniforms();
  myUniforms.volume_scale.value.set(
    texture.size.width / texture.size.depth,
    texture.size.height / texture.size.depth,
    1
  );
  myUniforms.diffuse.value = texture.impl;
  myUniforms.depth.value = texture.size.depth;
  myUniforms.volume_dims.value = [200, 200, 200];
  const options = {
    fs: volumeTexture.fs,
    vs: volumeTexture.vs,
    uniforms: myUniforms,
    glslVersion: volumeTexture.glslVersion,
  };
  return options;
};

const getTexture = async (scaffoldModule, texture_prefix) => {
  const imgArray = [];
  const texture = new scaffoldModule.Zinc.TextureArray();
  for (let i = 1733; i < 1860; i++) {
    imgArray.push(`${texture_prefix}/foot${i}.jpg`);
    //imgArray.push(`${process.env.VUE_APP_TEXTURE_FOOT_PREFIX}/foot${i}.jpg`);
  }
  await texture.loadFromImages(imgArray);
  return texture;
};

export const testVolume = async (scaffoldVuer, texture_prefix) => {
  const cube = new scaffoldVuer.$module.Zinc.THREE.BoxGeometry(1, 1, 1);
  const zincObject = new scaffoldVuer.$module.Zinc.Geometry();
  zincObject.setName("Texture volume");
  cube.translate(0.5, 0.5, 0.5);
  let meshOptions = {};
  meshOptions.opacity = 1.0;
  meshOptions.localTimeEnabled = false;
  meshOptions.localMorphColour = false;
  const texture = await getTexture(scaffoldVuer.$module, texture_prefix);
  const options = getVolumeTexture(texture);
  const material = texture.getMaterial(options);
  zincObject.createMesh(cube, material, meshOptions);
  scaffoldVuer.addZincObject(zincObject);
  zincObject.morph.matrix.set(
    -100,
    0,
    0,
    -60,
    0,
    -100,
    0,
    -100,
    0,
    0,
    -100,
    30,
    0,
    0,
    0,
    1
  );
  //console.log(zincObject.morph.matrix)
  window.texture = zincObject;
};

export const testSlides = async (scaffoldVuer, texture_prefix) => {
  const scaffoldModule = scaffoldVuer.$module;
  const texture = await getTexture(scaffoldModule, texture_prefix);
  const textureSlides = new scaffoldModule.Zinc.TextureSlides(texture);
  textureSlides.setName("Texture slides");
  textureSlides.createSlides([
    {
      direction: "y",
      value: 0.1,
    },
    {
      direction: "y",
      value: 0.3,
    },
    {
      direction: "y",
      value: 0.5,
    },
    {
      direction: "y",
      value: 0.7,
    },
    {
      direction: "y",
      value: 0.9,
    },
    {
      direction: "x",
      value: 0.5,
    },
    {
      direction: "z",
      value: 0.5,
    },
  ]);
  //textureSlides.morph.matrix.set(-100, 0, 0, 0, 0, -100, 0, 0, 0, 0, -100, 0, -60, -100, 30, 1);
  //textureSlides.morph.matrix.set( -100, 0, 0, -60, 0, -100, 0, -100, 0, 0, -100, 30, 0, 0, 0, 1 );

  const n = textureSlides.morph.matrix.clone();
  n.set(-100, 0, 0, -10, 0, -200, 0, 0, 0, 0, -100, 0, 0, 0, 10, 1);
  textureSlides.morph.applyMatrix4(n);
  scaffoldVuer.addZincObject(textureSlides);
  //scaffoldVuer.fitWindow();
  window.texture = textureSlides;
};

