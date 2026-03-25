<template>
  <div :style="position" class="region-tooltip">
    <el-popover
      ref="tooltip"
      :visible="visible"
      placement="top"
      :show-arrow="false"
      :teleported="false"
      trigger="manual"
      popper-class="tooltip-popper non-selectable"
      virtual-triggering
      @hide="hideTriggered"
    >
      <template #default>
        <div class="tooltip-text">{{ label }}</div>
        <div class="tooltip-text" v-if="region && region != '/'">
          Region: {{ region }}
        </div>
        <CreateTooltipContent
          v-show="createData.toBeConfirmed"
          :createData="createData"
          @confirm-create="$emit('confirm-create', $event)"
          @cancel-create="$emit('cancel-create')"
          @create-region-suggestions="$emit('create-region-suggestions', $event)"
          @create-group-suggestions="$emit('create-group-suggestions', $event)"
        />
        <Tooltip
          class="p-tooltip"
          v-show="annotationDisplay && !createData.toBeConfirmed"
          ref="annotationTooltip"
          :annotationDisplay="true"
          :annotationEntry="annotationEntry"
          @annotation="$emit('confirm-comment', $event)"
        />
      </template>
    </el-popover>
  </div>
</template>

<script>
import { shallowRef } from 'vue';
/* eslint-disable no-alert, no-console */
import {
  ElCol as Col,
  ElIcon as Icon,
  ElPopover as Popover,
  ElRow as Row,
} from "element-plus";
import { mapState } from 'pinia';
import { useMainStore } from "@/store/index";
import { CreateTooltipContent, Tooltip } from '@abi-software/map-utilities'
import '@abi-software/map-utilities/dist/style.css'

/**
 * A component to control the opacity of the target object.
 */
export default {
  name: "ScaffoldTooltip",
  components: {
    Col,
    CreateTooltipContent,
    Icon,
    Popover,
    Row,
    Tooltip,
  },
  props: {
    createData: {
      type: Object,
      default:{
        drawingBox: false,
        renaming: false,
        toBeConfirmed: false,
        points: [],
        tempGroupName: undefined,
        shape: "",
        x: 0,
        y: 0,
        editingIndex: -1,
        faceIndex: -1,
        toBeDeleted: false,
        regionPrefix: "__annotation"
      },
    },
    label: {
      type: String,
      default: "",
    },
    annotationDisplay: {
      type: Boolean,
      default: false,
    },
    annotationFeature: {
      type: Object,
      default: {},
    },
    offlineAnnotationEnabled: {
      type: Boolean,
      default: false,
    },
    region: {
      type: String,
      default: "",
    },
    visible: {
      type: Boolean,
      default: false,
    },
    x: {
      type: Number,
      default: 200,
    },
    y: {
      type: Number,
      default: 200,
    },
  },
  inject: ['scaffoldUrl'],
  provide() {
    return {
      userApiKey: this.userToken,
    };
  },
  data: function () {
    return {
      display: false,
      annotationEntry: []
    };
  },
  computed: {
    ...mapState(useMainStore,  ['userToken']),
    position: function () {
      let yOffset = 40;
      if (this.region) {
        yOffset = 55;
      }
      const x = this.x - 40;
      return { left: x + "px", top: this.y - yOffset + "px" };
    },
  },
  methods: {
    checkForDisplay: function () {
      if (this.visible && this.label && this.label !== "") {
        this.display = true;
        if (this.annotationDisplay) {
          const region = this.region ? this.region +"/" : "";
          this.annotationEntry = [{
            "featureId": region + this.label,
            "resourceId": this.scaffoldUrl,
            "resource": this.scaffoldUrl,
            "feature": this.annotationFeature,
            "offline": this.offlineAnnotationEnabled,
          }];
        }
      }
      else {
        this.display = false;
        this.annotationEntry = [];
      }
    },
    hideTriggered: function() {
      this.$emit('tooltip-hide');
    },
  },
  watch: {
    label: {
      handler: function () {
        this.checkForDisplay();
      },
      immediate: true,
    },
    visible: {
      handler: function () {
        this.checkForDisplay();
      },
      immediate: true,
    },
    annotationDisplay: {
      handler: function () {
        this.checkForDisplay();
      },
      immediate: true,
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

.region-tooltip {
  position: absolute;
  height: 50px;
  z-index: 3;
  :deep(.tooltip-popper.el-popover.el-popper) {
    padding: 2px 6px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    font-size: 16px;
    color: $app-primary-color;
    background-color: #fff;
    border: 1px solid $app-primary-color;
    border-radius: 4px;
    white-space: nowrap;
    min-width: unset!important;
    max-width:fit-content;
    width:unset!important;
    pointer-events: none;
    top: -15px !important;
    .el-popper__arrow {
      &:before {
        border-color: $app-primary-color;
      }
    }
  }

  .tooltip-text {
    text-align: center;
    color: $app-primary-color;
  }

  :deep(.non-selectable) {
    user-select: none;
    pointer-events: none;
  }

  .p-tooltip {
    display: flex;
    width: 300px;
    white-space:normal;
    .attribute-content {
      color: rgb(44, 62, 80);
    }
    &::before, &::after {
      display:none;
    }
  }
}
</style>
