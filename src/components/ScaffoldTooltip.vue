<template>
  <el-popover
    v-model="display"
    :content="label"
    placement="top"
    :append-to-body="false"
    trigger="manual"
    popper-class="popper non-selectable"
  >
    <div />
  </el-popover>
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
  },
  computed: {
    display: function() {
      if (this.visible) {
        if (this.label && this.label !== "") {
          return true;
        }
      }
      return false;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "~element-ui/packages/theme-chalk/src/popover";

::v-deep .scaffold-popper {
  padding: 6px 4px;
  font-size: 12px;
  color: rgb(48, 49, 51);
  background-color: #f3ecf6;
  border: 1px solid $app-primary-color;
  white-space: nowrap;
  min-width: unset;
  pointer-events: none;

  &.el-popper[x-placement^="top"] {
    .popper__arrow {
      border-top-color: $app-primary-color !important;
      &:after {
        border-top-color: #f3ecf6 !important;
      }
    }
  }
}

</style>
