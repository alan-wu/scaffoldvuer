ScaffoldVuer demo:
  ```vue
  <template>
    <div class="wrapper">
      <ScaffoldVuer class="vuer"
        :url="url"
        :helpMode="helpMode"
        :displayMarkers="displayMarkers"
        :displayMinimap="displayMinimap"
        :minimapSettings="minimapSettings" />
    </div>
  </template>

    <script>
      export default {
        data: function() {
          return {
            url: "https://mapcore-bucket1.s3-us-west-2.amazonaws.com/others/29_Jan_2020/heartICN_metadata.json",
            helpMode: false,
            displayMarkers: true,
            displayMinimap: false,
            minimapSettings: {
              x_offset: 16,
              y_offset: 16,
              width: 128,
              height: 128,
              align: "bottom-right"
            },
          };
        }
      }
    </script>

    <style scoped>
      .wrapper {
        height:600px;
      }
      .vuer {
        width:100%;
        height:600px;
      }
    </style>
  ```

