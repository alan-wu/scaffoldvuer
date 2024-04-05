<template>
  <el-container v-if="material" class="opacity-container">
    <div class="block">
      <span class="display">{{ displayString }}</span>
      <el-slider
        v-model="material.opacity"
        class="my-slider"
        :step="0.01"
        :min="0"
        :max="1"
        :format-tooltip="formatTooltip"
        :show-tooltip="false"
      />
    </div>
  </el-container>
</template>

<script>
/* eslint-disable no-alert, no-console */
import {
  ElContainer as Container,
  ElHeader as Header,
  ElMain as Main,
  ElSlider as Slider
} from "element-plus";

/**
 * A component to control the opacity of the target object.
 */
export default {
  name: "OpacityControls",
  components: {
    Container,
    Header,
    Main,
    Slider,
  },
  props: {
    material: undefined,
    zincObject: undefined,
  },
  data: function() {
    return {
      displayString: "100%",
    };
  },
  watch: {
    "material.opacity": function() {
      if (this.material && this.zincObject) {
        this.zincObject.setAlpha(this.material.opacity);
      }
    }
  },
  methods: {
    formatTooltip(val) {
      this.displayString = Math.floor(100 * val + 0.5) + "%";
      return this.displayString;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

.display {
  width: 44px;
}

.main {
  font-size: 13px;
  padding: 20px 17px 0 15px;
}

.block {
  left: 40px;
  position: absolute;
  top: 57px;
  width: 200px;
}

.my-slider {
  position: absolute;
  width: 135px;
  left: 50px;
  top: -8px;
  pointer-events: auto;
}

.opacity-container {
  width: 250px;
  height: 30px;
}

:deep(.el-slider__bar) {
  background-color: $app-primary-color;
}

</style>
