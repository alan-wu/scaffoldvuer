//import * as nifti from 'nifti-reader-js';
import { createPrimitivesFromNIFTI } from "zincjs/src/loaders/niftiReader.js";

const readNIFTIFromSource = async (url, useHeaderInfo, maskURL, settings, options) => {
  const images = await createPrimitivesFromNIFTI(url, useHeaderInfo, maskURL, settings, options);
  return images;
}

export { readNIFTIFromSource }
