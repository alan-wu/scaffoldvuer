<template>
  <el-container v-if="material" class="opacity-container">
    <el-header
      height="37px"
      class="header"
    >
      <div>Opacity</div>
    </el-header>
    <el-main class="main">
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
    </el-main>
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
@use "element-plus/theme-chalk/src/container";
@use "element-plus/theme-chalk/src/slider";

.header {
  color: #606266;
  line-height: 1;
  padding: 9px 17px 0 15px;
  border-bottom: 1px solid #ebeef5;
  font-size: 14px;
}

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
  width: 109px;
  top: -12px;
  left: 50px;
  pointer-events: auto;
}

.opacity-container {
  width: 224px;
  height: 93px;
  border-radius: 4px;
  border: solid 1px #d8dce6;
  background-color: #fff;
}

:deep(.el-slider__bar) {
  background-color: $app-primary-color;
}

</style>
