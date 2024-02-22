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

const addCylinder = (scaffoldVuer) => {
  const THREE = scaffoldVuer.$module.Zinc.THREE;
  const cylinderGeometry = new THREE.CylinderGeometry(50, 50, 200,80);
  const material = new THREE.MeshPhongMaterial( {color: 0xffff00, side : THREE.DoubleSide} ); 
  const cylinderMesh = new THREE.Mesh( cylinderGeometry, material );
  const zincGeometry = new scaffoldVuer.$module.Zinc.Geometry();
  zincGeometry.setMesh(cylinderMesh, false, false);
  zincGeometry.setName("Cylinder");
  scaffoldVuer.addZincObject(zincGeometry);
}

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
  scaffoldVuer.fitWindow();
  //window.texture = textureSlides;
  //addCylinder(scaffoldVuer);
};

const getArmTexture = async (scaffoldModule) => {
  const imgArray = [];
  const texture = new scaffoldModule.Zinc.TextureArray();
  imgArray.push('https://mapcore-bucket1.s3.us-west-2.amazonaws.com/texture/arm1/1564.png');
  await texture.loadFromImages(imgArray);
  return texture;
};


/*
{
    "id": "mesh-location-orientation",
    "locations": [
        {
            "identifier": 1,
            "label": "dave",
            "orientation": "[10.0, 0.0, 0.0, 0.0, 10.0, 0.0, 0.0, 0.0, 10.0]",
            "position": "[62.97939922758831, 48.5944672602095, 1.2382504590408302e-14]",
            "scale": "[1, 2, 3]"
            "reference_point": "corner"
        }
    ],
    "version": "0.1.0"
}
*/

//https://threejs.org/docs/#manual/en/introduction/Matrix-transformations
const applyTransformation = (scaffoldVuer, mesh, rotation, position, scale, reference) => {
  //if (reference === "centre") {
  //  mesh.geometry.translate(-0.5, -0.5, -0.5);
  //}
  const THREE = scaffoldVuer.$module.Zinc.THREE;
  const matrix = new THREE.Matrix4();
  matrix.set(
    rotation[0],
    rotation[1],
    rotation[2],
    0,
    rotation[3],
    rotation[4],
    rotation[5],
    0,
    rotation[6],
    rotation[7],
    rotation[8],
    0,
    0,
    0,
    0,
    0
  );
  console.log(matrix)
  const quaternion = new THREE.Quaternion().setFromRotationMatrix(matrix);
  console.log(quaternion);
  mesh.position.set(...position);
  mesh.quaternion.copy( quaternion );
  mesh.scale.set(...scale);
  mesh.updateMatrix();
  console.log(rotation)
}



export const testArmSlides = async (scaffoldVuer) => {
  const scaffoldModule = scaffoldVuer.$module;
  const texture = await getArmTexture(scaffoldModule);
  const textureSlides = new scaffoldModule.Zinc.TextureSlides(texture);
  textureSlides.setName("Arm texture");
  textureSlides.createSlides([
    {
      direction: "z",
      value: 0.5,
    },
  ]);

  const rotation = [
     Math.cos(Math.PI / 2.0), 0, Math.sin(Math.PI / 2.0),
    0, 1, 0,
    -Math.sin(Math.PI / 2.0), 0, Math.cos(Math.PI / 2.0)
  ];
  const position = [0, -1.0, 0.95];
  const scale = [1.6, 1.6, 1.2];
  const reference = "centre";
  applyTransformation(scaffoldVuer, textureSlides.morph, rotation, position, scale, reference);
  scaffoldVuer.addZincObject(textureSlides);
  scaffoldVuer.fitWindow();
};


