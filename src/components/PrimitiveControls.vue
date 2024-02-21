<template>
  <div
    v-show="material || isTextureSlides"
    class="primitive-controls"
    :class="{ open: drawerOpen, close: !drawerOpen }"
  >
    <div class="my-drawer" :class="{ open: drawerOpen, close: !drawerOpen }">
      <opacity-controls
        :material="material"
        :zincObject="zincObject"
        ref="opacityControls" />
      <texture-slides-controls
        v-show="isTextureSlides"
        class="controls"
        ref="tSlidesControls" />
    </div>
    <div
      class="drawer-button"
      :class="{ open: drawerOpen, close: !drawerOpen }"
      @click="toggleDrawer"
    >
      <el-icon><el-icon-arrow-right /></el-icon>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import { ref, shallowRef } from 'vue';
import {
  ArrowRight as ElIconArrowRight,
} from '@element-plus/icons-vue'
import OpacityControls from "./OpacityControls.vue";
import TextureSlidesControls from "./TextureSlidesControls.vue";

/**
 * A component to control the opacity of the target object.
 */
export default {
  name: "PrimitiveControls",
  components: {
    OpacityControls,
    TextureSlidesControls,
  },
  data: function() {
    return {
      material: undefined,
      isTextureSlides: false,
      drawerOpen: true,
      zincObject: undefined,
    };
  },
  methods: {
    formatTooltip: function(val) {
      this.displayString = Math.floor(100 * val + 0.5) + "%";
      return this.displayString;
    },
    toggleDrawer: function() {
      this.drawerOpen = !this.drawerOpen;
    },
    setObject: function(object) {
      this.zincObject = shallowRef(object);
      if (object.isTextureSlides) {
        this.isTextureSlides = true;
        this.$refs.tSlidesControls.setObject(object);
      } else {
        this.isTextureSlides = false;
      }
      if (object && object.morph) this.material = ref(object.morph.material);
      else this.material = undefined;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.primitive-controls {
  position: absolute;
  bottom: 30%;
  pointer-events:none;
  transition: all 1s ease;

  &.open {
    right: 0px;
    .my-drawer {
      opacity: 1;
    }
  }
  &.close {
    right: -250px;
    .my-drawer {
      pointer-events: none;
      opacity: 0;
    }
  }
}
.my-drawer {
  transition: all 1s ease;
  float: right;
  max-height: 150px;
  text-align: left;
  border: 1px solid rgb(220, 223, 230);
  background: #ffffff;
  width:250px;
}

.drawer-button {
  float: right;
  width: 20px;
  height: 40px;
  z-index: 8;
  border: solid 1px $app-primary-color;
  background-color: #f9f2fc;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  pointer-events: auto;
  margin-top: 25px;

  i {
    font-weight: 600;
    margin-top: 12px;
    color: $app-primary-color;
    transition-delay: 0.9s;
  }
  &.open {
    i {
      transform: rotate(0deg) scaleY(2.5);
    }
  }
  &.close {
    i {
      transform: rotate(180deg) scaleY(2.5);
    }
  }
}

</style>
