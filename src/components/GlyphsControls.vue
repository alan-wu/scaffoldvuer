<template>
  <el-container class="glyph-container">
    <el-checkbox v-model="displayLabels" class="block">Display labels</el-checkbox>
  </el-container>
</template>

<script>
/* eslint-disable no-alert, no-console */
import { markRaw } from 'vue';
import { ElCheckbox as Checkbox, ElContainer as Container, ElMain as Main } from 'element-plus';

/**
 * A component to control the opacity of the target object.
 */
export default {
  name: 'GlyphsControls',
  components: {
    Checkbox,
    Container,
    Main,
  },
  data: function () {
    return {
      displayLabels: true,
    };
  },
  watch: {
    displayLabels: {
      handler: function (value) {
        if (value) {
          this.zincObject.showLabel();
        } else {
          this.zincObject.hideLabel();
        }
      },
    },
  },
  methods: {
    reset: function () {
      this.displayLabels = true;
    },
    setObject: function (object) {
      if (object.isGlyphset) {
        this.zincObject = markRaw(object);
        this.displayLabels = this.zincObject.isLabelDisplayed();
      } else {
        this.zincObject = undefined;
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.block {
  left: 40px;
  :deep(.el-checkbox__label) {
    font-size: 13px;
  }
}

.glyph-container {
  width: 250px;
  height: auto;
  overflow-y: none;
}
</style>
