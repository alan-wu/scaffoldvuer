<template>
  <div ref="dropEl" class="dropzone">
    <slot />
    <input ref="fileInput" type="file" />
  </div>
</template>

<script>
import { markRaw } from 'vue';
import { SimpleDropzone } from 'simple-dropzone';
import { createURLFromFiles } from '../scripts/LocalFilesHelper.js';

const getJSON = async (URL) => {
  return fetch(URL)
    .then((response) => response.json())
    .then((responseJson) => {
      return responseJson;
    });
};

export default {
  name: 'DropZone',
  data: function () {
    return {
      objectURLs: markRaw([]),
      filesMapping: markRaw({}),
    };
  },
  mounted: function () {
    const dropCtrl = new SimpleDropzone(this.$refs.dropEl, this.$refs.fileInput);
    dropCtrl.on('drop', ({ files }) => {
      this.localDrop(files);
    });
  },
  methods: {
    findRealFilename: function (objectURL) {
      return this.filesMapping[objectURL];
    },
    revokeURLs: function () {
      this.objectURLs.forEach((objectURL) => URL.revokeObjectURL(objectURL));
      this.objectURLs.length = 0;
      this.filesMapping = markRaw({});
    },
    localDrop: async function (fileMap) {
      this.revokeURLs();
      const flatarray = Array.from(fileMap);
      const data = await createURLFromFiles(flatarray);
      if (data) {
        if (data.objectURLs?.length > 0) {
          this.objectURLs.push(...data.objectURLs);
        }
        if (data.filesMapping) {
          Object.assign(this.filesMapping, data.filesMapping);
        }
        if (data.format && data.url) {
          this.$emit('files-drop', { url: data.url, format: data.format });
        }
      }
    },
  },
};
</script>

<style scoped lang="scss">
.dropzone {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
