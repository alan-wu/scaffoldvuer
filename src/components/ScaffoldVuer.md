ScaffoldVuer example:
  ```vue
  <template>
    <div class="wrapper">
      <ScaffoldVuer class="vuer"
        :url="url" />
   </template>

    <script>

      export default {
        data() {
          return { url: "https://mapcore-bucket1.s3-us-west-2.amazonaws.com/others/29_Jan_2020/heartICN_metadata.json" };
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

