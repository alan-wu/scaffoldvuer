export default {
  methods: {
    populateMapWithImages: function (images, type, mapImp = undefined) {
      for (const [key, list] of Object.entries(images)) {
        this.downloadImageThumbnail(key, list, type, mapImp);
      }
    },
    downloadImageThumbnail: async function (key, list, type, mapImp) {
      const count = list.length;
      if (count > 0) {
        //Pick a random image
        const index = Math.floor(Math.random() * count);
        const thumbnail = list[index].thumbnail;
        this.getThumbnail(thumbnail, type)
          .then((response) => {
            let result = { type: "generic", data: response };
            if (type === "Segmentation" || type === "Image") {
              result["type"] = "binary";
            }
            this.attachThumbnailToMap(key, result, mapImp);
          })
          .catch((error) => {
            console.log("🚀 ~ error:", error);
            //Failed to download, pick another one
            list.splice(index);
            this.downloadImageThumbnail(key, list, type, mapImp);
          });
      }
    },
    getThumbnail: async function (url, type) {
      return new Promise((resolve, reject) => {
        if (type === "Segmentation" || type === "Image") {
          return this.getBinaryThumbnail(url)
            .then((response) => resolve(response))
            .catch((response) => reject(response));
        } else {
          this.getGenericThumbnail(url)
            .then((response) => resolve(response))
            .catch((response) => reject(response));
        }
      });
    },
    getBinaryThumbnail: async function (url) {
      return new Promise((resolve, reject) => {
        fetch(url).then((response) => {
          if (response.status >= 200 && response.status < 300) {
            resolve(response.text());
          } else {
            reject();
          }
        });
      });
    },
    getGenericThumbnail: async function (url) {
      return new Promise((resolve, reject) => {
        fetch(url).then((response) => {
          if (response.status === 200) {
            resolve(url);
          } else {
            reject();
          }
        });
      });
    },
    attachThumbnailToMap: function (id, source, mapImp) {
      // add it to the maps
      if (mapImp) {
        this.attachThumbnailToFlatmap(id, source, mapImp);
      } else {
        this.attachThumbnailToScaffold(id, source);
      }
    },
    attachThumbnailToFlatmap: function (id, source, mapImp) {
      return new Promise((resolve, reject) => {
        let img = new Image();
        let wrapperElement = document.createElement("div");
        img.style = "height: auto;width: 50px;margin-right: 80px;";
        img.onload = function () {
          wrapperElement.appendChild(img);
        };
        img.onerror = function () {
          reject(new Error("Failed to load image at " + url));
        };
        img.src =
          source.type === "binary"
            ? `data:'image/png';base64,${source.data}`
            : source.data;

        // add it to the flatmap
        const markerIdentifier = mapImp.addMarker(id, {
          element: wrapperElement,
          className: "highlight-marker",
          cluster: false,
          type: "image",
        });

        const marker = mapImp.addMarker(id);
        resolve(marker);
      });
    },
    attachThumbnailToScaffold: async function (id, source) {
      if (source) {
        const blob = await (
          await fetch(`data:'image/png';base64,${source.data}`)
        ).blob();
        const blobUrl = URL.createObjectURL(blob);
        this.setMarkerModeForObjectsWithName(id, { number: this.markerLabels[id], imgURL: blobUrl }, "on");
      }
    }
  },
};
