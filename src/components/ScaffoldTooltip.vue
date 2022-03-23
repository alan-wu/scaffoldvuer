<template>
  <div
    :style="position"
    class="tooltipContainer"
  >
    <el-popover
      ref="tooltip"
      v-model="display"
      placement="top"
      :append-to-body="false"
      trigger="manual"
      popper-class="tooltip-popper non-selectable"
    >
      <div> {{ label }} </div>
      <i v-popover:tooltip />
    </el-popover>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import { Popover } from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";

locale.use(lang);
Vue.use(Popover);

/**
 * A component to control the opacity of the target object.
 */
export default {
  name: "ScaffoldTooltip",
  props: {
    label: {
      type: String,
      default: ""
    },
    visible: {
      type: Boolean,
      default: false
    },
    x: {
      type: Number,
      default: 200
    },
    y: {
      type: Number,
      default: 200
    },
  },
  data: function() {
    return {
      display: false
    }
  },
  computed: {
    position: function() {
      const styleString = "translate(" + this.x + 
        "px, " + (this.y - 30) + "px)";
      return {transform: styleString};
    }
  },
  watch: {
    label: {
      handler: function() {
        if (this.visible && this.label && this.label !== "")
          this.display = true;
        else
          this.display = false;
      },
      immediate: true
    },
    visible: {
      handler: function() {
        if (this.visible && this.label && this.label !== "")
          this.display = true;
        else
          this.display = false;
      },
      immediate: true
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "~element-ui/packages/theme-chalk/src/popover";

::v-deep .tooltip-popper {
  padding: 6px 4px;
  font-size: 12px;
  color: rgb(48, 49, 51);
  background-color: #f3ecf6;
  border: 1px solid $app-primary-color;
  white-space: nowrap;
  min-width: unset;
  pointer-events: none;
  

  &.el-popper[x-placement^="bottom"] {
    .popper__arrow {
      border-bottom-color: $app-primary-color !important;
      &:after {
        border-bottom-color: #f3ecf6 !important;
      }
    }
  }
}

.tooltipContainer {
  position:absolute;
  height:50px;
  z-index: 2;
}

::v-deep .non-selectable {
  user-select: none;
  pointer-events: none;
}

</style>
