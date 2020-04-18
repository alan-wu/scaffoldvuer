<template>
  <div class="scaffold-container">
    <div style="height:100%;width:100%;position:relative">
      <div id="organsDisplayArea" style="height:100%;width:100%;" ref="display"></div>
      <div v-if="displayUI">
        <TraditionalControls v-if="traditional" :module="$module" :showColourPicker="showColourPicker" />
        <SelectControls v-else :module="$module" @object-selected="objectSelected" ref="selectControl"/>
        <OpacityControls v-if="traditional == false" :target="selectedObject"/>
        <div class="timeSlider" v-if="sceneData.timeVarying">
          <el-button
            type="success"
            v-if="isPlaying"
            @click="play(false)"
            icon="el-icon-video-pause"
            round
          >Pause</el-button>
          <el-button type="success" v-else @click="play(true)" icon="el-icon-video-play" round>Play</el-button>
          <el-slider
            :min="0"
            :max="100"
            :value="sceneData.currentTime"
            :step="0.1"
            @input="timeChange($event)"
          ></el-slider>
        </div>
        <el-button icon="el-icon-plus" circle class="zoomIn icon-button" 
          @click="zoomIn()" size="mini"></el-button>
        <el-button icon="el-icon-minus" circle class="zoomOut icon-button"
          @click="zoomOut()" size="mini"></el-button>
        <el-button icon="el-icon-refresh-right" circle class="resetView icon-button"
          @click="resetView()" size="mini"></el-button>

        
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import OpacityControls from './OpacityControls';
import SelectControls from './SelectControls';
import TraditionalControls from './TraditionalControls';
import {
  Button,
  Slider
} from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";
locale.use(lang);
Vue.use(Button);
Vue.use(Slider);

const OrgansViewer = require("physiomeportal/src/modules/organsRenderer")
  .OrgansViewer;
const EventNotifier = require("physiomeportal/src/utilities/eventNotifier")
  .EventNotifier;

export default {
  name: "ScaffoldVuer",
  components: {
    OpacityControls,
    SelectControls,
    TraditionalControls
  },
  beforeCreate: function() {
    this.$module = new OrgansViewer();
  },
  methods: {
    resetView: function() {
      if (this.$module.scene) {
        this.$module.scene.resetView();
      }
    },
    zoomIn: function() {
      if (this.$module.scene) {
        this.$module.scene.changeZoomByScrollRateUnit(-1);
      }
    },
    zoomOut: function() {
      if (this.$module.scene) {
        this.$module.scene.changeZoomByScrollRateUnit(1);
      }
    },
    eventNotifierCallback: function(event) {
      if (event.eventType == 1) {
        if (this.$refs.selectControl) {
          if (event.identifiers[0]) {
            let id = event.identifiers[0].data.id ? event.identifiers[0].data.id :
              event.identifiers[0].data.group;
            this.$refs.selectControl.changeActiveByName(id);
          } else
            this.$refs.selectControl.removeActive();
        }
        this.$emit("scaffold-selected", event.identifiers);
      }
      else if (event.eventType == 2)
        this.$emit("scaffold-highlighted", event.identifiers);
    },
    getCoordinatesOfSelected: function() {
      if (this.selectedObject) {
        return this.$module.scene.getObjectsScreenXY([this.selectedObject]);
      }
      return undefined;
    },
    getDynamicSelectedCoordinates: function() {
      return this.$module.selectedScreenCoordinates;
    },
    timeChange: function(event) {
      if (event != this.sceneData.currentTime) this.$module.updateTime(event);
    },
    objectSelected: function(object) {
      if (object !== this.selectedObject) {
        this.selectedObject = object;
        if (object)
          this.$module.setSelectedByZincObject(object, true);
        else
          this.$module.setSelectedByObjects([], true);
      }
    },
    play: function(flag) {
      this.$module.playAnimation(flag);
      this.isPlaying = flag;
    }
  },
  props: { 
    traditional: {
      type: Boolean,
      default: false
    },
    url: String,
    showColourPicker: Boolean,
    displayUI: {
      type: Boolean,
      default: true
    },
  },
  data: function() {
    return {
      sceneData: this.$module.sceneData,
      isPlaying: false,
      step: 0.1,
      selectedObject: undefined
    };
  },
  watch: {
    url: function(newValue) {
      if (newValue) {
        if (this.$refs.selectControl)
          this.$refs.selectControl.clear();
        this.$module.loadOrgansFromURL(
          newValue,
          undefined,
          undefined,
          "scene",
          undefined
        );
      }
    }
  },
  mounted: function() {
    let eventNotifier = new EventNotifier();
    eventNotifier.subscribe(this, this.eventNotifierCallback);
    this.$module.addNotifier(eventNotifier);
    if (this.url) {
      this.$module.loadOrgansFromURL(
        this.url,
        undefined,
        undefined,
        "Overlay",
        undefined
      );
    }
    this.$module.initialiseRenderer(this.$refs.display);
    
  },
  destroyed: function() {
    this.$module.destroy();
    this.$module = undefined;
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.scaffold-container {
  height: 100%;
  width: 100%;
}

.timeSlider {
  text-align: center;
  position: absolute;
  left: 2.5%;
  height: 48px;
  width: 95%;
  bottom: 40px;
}

.zoomIn{
  top:95px;
  right:20px;
  position: absolute;

}

.zoomOut{
  top:134px;
  right:20px;
  position: absolute;
}

.icon-button {
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
  border: solid 1px #ffffff;
  background-color: #ffffff;
}

.resetView {
  bottom:79px;
  right:45%;
  position: absolute;
}
</style>

<style scoped src="../styles/purple/button.css">
</style>
<style scoped src="../styles/purple/slider.css">
</style>
