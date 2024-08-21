const getFilesInfo = async (api, key, idsList, types) => {
  let params = new URLSearchParams();
  types.forEach((type) => {
    params.append("filetypes", type);
  });
  let response = await fetch(`${api}/get-organ-curies/?${params}`);
  let data = await response.json();
  const identifiers = [];
  data.uberon.array.forEach((pair) => {
    const identifier = {
      id: pair.id.toUpperCase(),
      name: pair.name,
    };
    if (idsList.includes(identifier[key])) {
      identifiers.push(identifier);
    }
  });
  const keys = identifiers.map((item) => item.id);
  response = await fetch(`${api}/get-files-info-for-curies`, {
    method: "POST",
    body: JSON.stringify({
      filetypes: types,
      curies: keys,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  data = await response.json();
  return { data: data, identifiers: identifiers };
};

const getFileName = (filePath) => {
  return filePath.substring(filePath.lastIndexOf("/") + 1);
};

export default {
  methods: {
    getBiolucidaThumbnails: async function (key, idsList) {
      try {
        const { data, identifiers } = await getFilesInfo(
          this.sparcAPI,
          key,
          idsList,
          ["biolucida-2d", "biolucida-3d"]
        );
        if (data["files_info"]) {
          const images = {};
          for (const [key, value] of Object.entries(data["files_info"])) {
            const nameLabel = identifiers.find((item) => item.id === key).name;
            if (value.length > 0) {
              const list = [];
              value.forEach((entry) => {
                if (entry.biolucida_id) {
                  let image = {
                    thumbnail: this.getBiolucidaThumbnailURL(
                      entry.biolucida_id
                    ),
                    id: entry.id,
                    title: getFileName(entry.file_path),
                    type: "Image",
                    link: `https://sparc.biolucida.net/api/v1/thumbnail/${entry.biolucida_id}`,
                    mimetype: "image/png",
                  };
                  list.push(image);
                }
              });
              images[nameLabel] = list;
            }
          }
          return images;
        }
      } catch (error) {
        console.error("Error:", error);
      }
      return {};
    },
    getBiolucidaThumbnailURL: function (biolucidaId) {
      return `${this.sparcAPI}/thumbnail/${biolucidaId}`;
    },
    getSegmentationThumbnails: async function (key, idsList) {
      try {
        const data = await getFilesInfo(this.sparcAPI, key, idsList, [
          "mbf-segmentation",
        ]);
        if (data["files_info"]) {
          const images = {};
          for (const [key, value] of Object.entries(data["files_info"])) {
            if (value.length > 0) {
              const list = [];
              value.forEach((entry) => {
                let image = {
                  thumbnail: this.getSegmentationThumbnailURL(
                    entry.id,
                    entry.version,
                    entry.file_path
                  ),
                  id: entry.id,
                  title: getFileName(entry.file_path),
                  type: "Segmentation",
                  link: this.getBiolucidaThumbnailURL(entry.biolucida_id),
                  mimetype: "image/png",
                };
                list.push(image);
              });
              images[key] = list;
            }
          }
          return images;
        }
      } catch (error) {
        console.error("Error:", error);
      }
      return {};
    },
    getSegmentationThumbnailURL: function (
      datasetId,
      datasetVersion,
      filePath
    ) {
      return `${this.sparcAPI}/thumbnail/neurolucida?datasetId=${datasetId}&version=${datasetVersion}&path=files/${filePath}`;
    },
  },
};
