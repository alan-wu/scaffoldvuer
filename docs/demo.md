# Live demo

<div style="height:720px;width:680px;">
  <ClientOnly>
    <ScaffoldVuer style="height:100%;width:100%;"
      :url="url"
      :helpMode="helpMode"
      :displayMarkers="displayMarkers"
      :displayMinimap="displayMinimap"
      :minimapSettings="minimapSettings" />
  </ClientOnly>
</div>

<script setup>
import { defineClientComponent } from 'vitepress'

const ScaffoldVuer = defineClientComponent(() => {
  return import('../src/components/ScaffoldVuer.vue')
})
</script>

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

## Code Preview

```js-vue
<div style="height:720px;width:680px;">
  <ScaffoldVuer style="height:100%;width:100%;"
    :url="url"
    :helpMode="helpMode"
    :displayMarkers="displayMarkers"
    :displayMinimap="displayMinimap"
    :minimapSettings="minimapSettings" />
</div>


<script>
import {ScaffoldVuer} from "abi-software/scaffolduver";
import "@abi-software/scaffoldvuer/dist/style.css";

export default {
  components: { ScaffoldVuer },
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
```

