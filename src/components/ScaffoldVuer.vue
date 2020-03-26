<template>
  <div class="scaffold-container">
    <div style="height:100%;width:100%;position:relative">
      <div id="organsDisplayArea" style="height:100%;width:100%;" ref="display"></div>
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
    eventNotifierCallback: function(event) {
        if (event.eventType == 1) {
          if (event.identifiers[0])
            this.$refs.selectControl.changeActiveByName(event.identifiers[0].data.id);
          else
            this.$refs.selectControl.removeActive();
          this.$emit("scaffold-selected", event.identifiers);
        }
        else if (event.eventType == 2)
          this.$emit("scaffold-highlighted", event.identifiers);
    },
    timeChange: function(event) {
      if (event != this.sceneData.currentTime) this.$module.updateTime(event);
    },
    objectSelected: function(object) {
      if (object !== this.selectedObject) {
        if (object)
          this.$module.setSelectedByObjects([object.morph], true);
        else
          this.$module.setSelectedByObjects([], true);
        this.selectedObject = object;
      }
    },
    play: function(flag) {
      this.$module.playAnimation(flag);
      this.isPlaying = flag;
    }
  },
  props: { url: String, showColourPicker: Boolean },
  data: function() {
    return {
      traditional: false,
      sceneData: this.$module.sceneData,
      isPlaying: false,
      step: 0.1,
      selectedObject: undefined
    };
  },
  watch: {
    url: function(newValue) {
      if (newValue) {
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

</style>

<style scoped src="../styles/purple/button.css">
</style>
<style scoped src="../styles/purple/slider.css">
</style>
