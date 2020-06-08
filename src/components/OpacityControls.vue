<template>
  <div class="opacity-control" ref="control" v-if="material!=undefined">
    <el-container class="opacity-container">
      <el-header height="37px" class="header">
        <div>Opacity</div>
        <i class="el-icon-arrow-right icon"></i>
      </el-header>
      <el-main class="main">
        <div>Opacity</div>
        <div class="block">
          <span class="display">{{displayString}}</span>
          <el-slider
            class="my-slider"
            :step="step"
            :min="min"
            :max="max"
            v-model="material.opacity"
            :format-tooltip="formatTooltip"
            :show-tooltip=false
          ></el-slider>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import { Container, Header, Icon, Main, Slider } from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";
locale.use(lang);
Vue.use(Container);
Vue.use(Header);
Vue.use(Icon);
Vue.use(Main);
Vue.use(Slider);

/**
 * A component to control the opacity of the target object.
 */
export default {
  name: "OpacityControls",
  methods: {
    formatTooltip(val) {
      this.displayString = Math.floor(100 * val + 0.5) + "%";
      return this.displayString;
    }
  },
  props: { 
    /**
     * The opacity of this object will be controlled here.
     */
    target: Object
  },
  data: function() {
    return {
      displayString: "100%",
      material: undefined,
      step: 0.01,
      min: 0,
      max: 1
    };
  },
  watch: {
    target: function() {
      if (this.target && (!this.target.isGlyphset))
        this.material = this.target.morph.material;
      else 
        this.material = undefined;
    },
    "material.opacity": function() {
      if (this.material) {
        if (this.material.opacity != 1) this.material.transparent = true;
        else this.material.transparent = false;
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.opacity-control {
  position: absolute;
  top: 255px;
  right: 20px;
  text-align: left;
}

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

.icon {
  right: 17px;
  position: absolute;
  top: 10px;
}

.main {
  font-size: 13px;
  padding: 20px 17px 0 15px;
}

.block {
  right: 17px;
  position: absolute;
  top: 57px;
  width: 110px;
}

.my-slider {
  position: absolute;
  width: 65px;
  top: -12px;
  right: 0px;
}

.opacity-container {
  width: 224px;
  height: 93px;
  border-radius: 4px;
  border: solid 1px #d8dce6;
  background-color: #fff;
}

>>> .el-slider__bar {
  background-color: #8300bf;
}
</style>

<style scoped src="../styles/purple/container.css">
</style>
<style scoped src="../styles/purple/slider.css">
</style>
