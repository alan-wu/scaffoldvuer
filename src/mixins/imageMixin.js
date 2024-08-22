export default {
  methods: {
    populateMapWithImages: function (images, type) {
      for (const [key, list] of Object.entries(images)) {
        this.downloadImageThumbnail(key, list, type);
      }
    },
    downloadImageThumbnail: async function (key, list, type) {
      const count = list.length;
      if (count > 0) {
        //Pick a random image
        const index = Math.floor(Math.random() * count);
        const thumbnail = list[index].thumbnail;
        this.getThumbnail(thumbnail, type)
          .then((source) => {
            this.addImageThumbnailMarker(key, source);
          })
          .catch(() => {
            //Failed to download, pick another one
            list.splice(index);
            this.downloadImageThumbnail(key, list, type);
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
        fetch(url)
          .then((response) => {
            if (response.status >= 200 && response.status < 300) {
              return response.text();
            } else {
              reject();
            }
          })
          .then((data) => {
            if (data) {
              let img = new Image();
              let wrapperElement = document.createElement("div");
              img.style = "height: auto;width: 50px;margin-right: 80px;";
              img.onload = function () {
                wrapperElement.appendChild(img);
                resolve(`data:'image/png';base64,${data}`);
              };
              img.onerror = function () {
                reject(new Error("Failed to load image at " + url));
              };
              img.src = `data:'image/png';base64,${data}`;
            } else {
              reject(new Error("Failed to load image at " + url));
            }
          });
      });
    },
    getGenericThumbnail: async function (url) {
      return new Promise((resolve, reject) => {
        let img = new Image();
        let wrapperElement = document.createElement("div");
        img.style = "height: auto;width: 50px;margin-right: 80px;";
        img.onload = function () {
          wrapperElement.appendChild(img);
          resolve(url);
        };
        img.onerror = function () {
          reject(new Error("Failed to load image at " + url));
        };
        img.src = url;
      });
    },
    addImageThumbnailMarker: async function (id, source) {
      const blob = await (await fetch(source)).blob();
      const blobUrl = URL.createObjectURL(blob);
      let imageMarker = {};
      imageMarker[id] = { number: this.markerLabels[id], imgURL: blobUrl };
      this.setMarkerModeForObjectsWithName(id, { number: this.markerLabels[id], imgURL: blobUrl }, "on");
      // this.markerLabelEntry = imageMarker;
    },
  },
};
