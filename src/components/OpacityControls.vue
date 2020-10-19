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
            :step=0.01
            :min=0
            :max=1
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
    },
    setObject(object) {
      if (object)
        this.material = object.morph.material;
      else
        this.material = undefined;
      this._zincobject = object;
    },
  },
  data: function() {
    return {
      displayString: "100%",
      material: undefined,
    };
  },
  watch: {
    "material.opacity": function() {
      if (this.material) {
        this._zincobject.setAlpha(this.material.opacity);
      }
    }
  },
  mounted: function() {
    this._zincobject = undefined;
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
