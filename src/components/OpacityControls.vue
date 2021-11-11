<template>
  <div
    v-if="material!=undefined"
    ref="control"
    class="opacity-control"
  >
    <div
      v-if="!drawerOpen"
      class="tab-button open"
      @click="toggleDrawer"
    >
      <i class="el-icon-arrow-left" />
    </div>
    <el-drawer
      custom-class="my-drawer"
      class="drawer-content"
      :visible.sync="drawerOpen"
      :append-to-body="false"
      :modal-append-to-body="false"
      size="300"
      :with-header="false"
      :wrapper-closable="false"
      :modal="false"
    >
      <div
        v-if="drawerOpen"
        class="tab-button close"
        @click="toggleDrawer"
      >
        <i class="el-icon-arrow-right" />
      </div>
      <el-container class="opacity-container">
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
    </el-drawer>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import { Container, Drawer, Header, Icon, Main, Slider } from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";

locale.use(lang);
Vue.use(Container);
Vue.use(Drawer);
Vue.use(Header);
Vue.use(Icon);
Vue.use(Main);
Vue.use(Slider);

/**
 * A component to control the opacity of the target object.
 */
export default {
  name: "OpacityControls",
  data: function() {
    return {
      displayString: "100%",
      material: undefined,
      drawerOpen: true
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
  },
  methods: {
    formatTooltip(val) {
      this.displayString = Math.floor(100 * val + 0.5) + "%";
      return this.displayString;
    },
    toggleDrawer: function() {
      this.drawerOpen = !this.drawerOpen;
    },
    setObject(object) {
      if (object) this.material = object.morph.material;
      else this.material = undefined;
      this._zincobject = object;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "~element-ui/packages/theme-chalk/src/container";
@import "~element-ui/packages/theme-chalk/src/drawer";
@import "~element-ui/packages/theme-chalk/src/slider";

.opacity-control {
  position: absolute;
  top: 255px;
  right: 0px;
  text-align: left;
  width:300px;
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

::v-deep .el-slider__bar {
  background-color: $app-primary-color;
}

.drawer-content {
  position: relative;
  height: 93px;
  pointer-events: none;
}

::v-deep .my-drawer {
  background: rgba(0, 0, 0, 0);
  box-shadow: none;
}

::v-deep .my-drawer .el-drawer__body {
  height: 93px;
}

.tab-button {
  width: 20px;
  height: 40px;
  z-index: 8;
  right: 0px;
  
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
  border: solid 1px #e4e7ed;
  background-color: #FFFFFF;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  pointer-events: auto;

  &.close {
    float: left;
    flex: 1;
    border-right: 0;
    margin-top: 26px;
  }

  &.open {
    position: absolute;
    top:26px;
  }

  i {
    margin-top: 12px;
    color: $app-primary-color;
    transform: scaleY(2.5);
  }
}

.open-tab{

  i {
    margin-top: 12px;
    color: $app-primary-color;
    transform: scaleY(2.5);
  }
}

</style>
