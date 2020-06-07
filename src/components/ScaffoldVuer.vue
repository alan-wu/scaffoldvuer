<template>
  <div class="scaffold-container">
    <div id="organsDisplayArea" tabindex="-1" style="height:100%;width:100%;" ref="display" @keydown.66="backgroundChangeCallback"></div>
    <div v-show="displayUI && !isTransitioning">
      <TraditionalControls v-if="traditional" :module="$module" @object-selected="objectSelected" 
        @object-hovered="objectHovered" :showColourPicker="showColourPicker" ref="traditionalControl"/>
      <SelectControls v-else :module="$module" @object-selected="objectSelected" 
        @object-hovered="objectHovered" :displayAtStartUp="displayAtStartUp" ref="selectControl"/>
      <OpacityControls :target="selectedObject"/>
      <div class="timeSlider" v-if="sceneData.timeVarying">
        <el-row>
          <el-col :span="2" :offset="4">
            <el-button
              v-if="isPlaying"
              @click="play(false)"
              icon="el-icon-video-pause"
              size="mini"
              circle
              class="video-button icon-button"
            ></el-button>
            <el-button v-else @click="play(true)" size="mini" icon="el-icon-video-play" circle class="video-button icon-button"></el-button>
          </el-col>
          <el-col :span="14">
            <el-slider
              :min="0"
              :max="100"
              :value="sceneData.currentTime"
              :step="0.1"
              @input="timeChange($event)"
            ></el-slider>
          </el-col>
        </el-row>
      </div>
      <el-button icon="el-icon-plus" circle class="zoomIn icon-button" 
        @click="zoomIn()" size="mini"></el-button>
      <el-button icon="el-icon-minus" circle class="zoomOut icon-button"
        @click="zoomOut()" size="mini"></el-button>
      <el-button icon="el-icon-refresh-right" circle class="resetView icon-button"
        @click="resetView()" size="mini"></el-button>
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
  Col,
  Row,
  Slider
} from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";
locale.use(lang);
Vue.use(Button);
Vue.use(Col);
Vue.use(Row);
Vue.use(Slider);

const OrgansViewer = require("physiomeportal/src/modules/organsRenderer")
  .OrgansViewer;
const EventNotifier = require("physiomeportal/src/utilities/eventNotifier")
  .EventNotifier;


/**
 * A vue component of the scaffold viewer.
 */
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
    backgroundChangeCallback: function() {
      //When b is pressed
      if (this.backgroundToggle) {
        ++this.currentBackground;
        if (this.currentBackground >= this.availableBackground.length )
          this.currentBackground = 0;
        this.$module.zincRenderer.getThreeJSRenderer().
          setClearColor(this.availableBackground[this.currentBackground], 1 );
      }
    },
    captureScreenshotCallback: function() {
      //Remove the callback, only needs to happen once
      this.$module.zincRenderer.removePostRenderCallbackFunction(this.captureID);
      let screenshot = this.$module.zincRenderer.getThreeJSRenderer().domElement.toDataURL("image/png");
      let hrefElement = document.createElement('a');
      document.body.append(hrefElement);
      if (!this.captureFilename)
        hrefElement.download = `screenshot.png`;
      else
        hrefElement.download = this.captureFilename;
      hrefElement.href = screenshot;
      hrefElement.click();
      hrefElement.remove();
    },
    captureScreenshot: function(filename) {
      // Capture a screenshot, it should be done immediately after a render
      this.captureFilename = filename;
      this.captureID = this.$module.zincRenderer.addPostRenderCallbackFunction(
        this.captureScreenshotCallback);
    },
    /**
     * Function to reset the view to default.
     * Also called when the associated button is pressed.
     */
    resetView: function() {
      if (this.$module.scene) {
        this.$module.scene.resetView();
      }
    },
    /**
     * Function to zoom in.
     * Also called when the associated button is pressed.
     */
    zoomIn: function() {
      if (this.$module.scene) {
        this.$module.scene.changeZoomByScrollRateUnit(-1);
      }
    },
    /**
      * Function to zoom out.
      * Also called when the associated button is pressed.
      */
    zoomOut: function() {
      if (this.$module.scene) {
        this.$module.scene.changeZoomByScrollRateUnit(1);
      }
    },
    /**
     * Function used to stop the free spin 
     */
    stopFreeSpin: function() {
      let cameracontrol = this.$module.scene.getZincCameraControls();
      cameracontrol.stopAutoTumble();
      this.isTransitioning = false;
    },
    /**
     * Function used to rotate the scene.
     * Also called when the associated button is pressed.
     */
    freeSpin: function() {
      if (this.$module.scene) {
        let cameracontrol = this.$module.scene.getZincCameraControls();
        this.isTransitioning = true;
        cameracontrol.enableAutoTumble();
        cameracontrol.autoTumble([1.0, 0.0], Math.PI, true);
        setTimeout(this.stopFreeSpin, 4000);
      }
    },
    /**
     * Callback when a region is selected/highlighted.
     * It will also update other controls.
     */
    eventNotifierCallback: function(event) {
      if (event.eventType == 1) {
        if (this.controls) {
          if (event.identifiers[0]) {
            let id = event.identifiers[0].data.id ? event.identifiers[0].data.id :
              event.identifiers[0].data.group;
            this.controls.changeActiveByName(id);
          } else {
            this.controls.removeActive();
          }
        }
        this.$emit("scaffold-selected", event.identifiers);
      }
      else if (event.eventType == 2) {
        if (this.controls) {
          if (event.identifiers[0]) {
            let id = event.identifiers[0].data.id ? event.identifiers[0].data.id :
              event.identifiers[0].data.group;
            this.controls.changeHoverByName(id);
          } else
            this.controls.removeHover();
        }
        this.$emit("scaffold-highlighted", event.identifiers);
      }
    },
    /**
     * Get the coordinates of the current selected region.
     */
    getCoordinatesOfSelected: function() {
      if (this.selectedObject) {
        return this.$module.scene.getObjectsScreenXY([this.selectedObject]);
      }
      return undefined;
    },
    /**
     * Return an object containing the window coordinates of the 
     * current selected region which will be updated after each render
     * loop.
     */
    getDynamicSelectedCoordinates: function() {
      return this.$module.selectedScreenCoordinates;
    },
    /**
     * Callback when time is changed through the UI.
     */
    timeChange: function(event) {
      if (event != this.sceneData.currentTime) this.$module.updateTime(event);
    },
    /**
     * Set the selected zinc object
     * @param {object} object Zinc object 
     */
    objectSelected: function(object) {
      if (object !== this.selectedObject) {
        this.selectedObject = object;
        if (object)
          this.$module.setSelectedByZincObject(object, true);
        else
          this.$module.setSelectedByObjects([], true);
      }
    },
    /**
     * Set the highlighted zinc object
     * @param {object} object Zinc object 
     */
    objectHovered: function(object) {
      if (object !== this.hoveredObject) {
        this.hoveredObject = object;
        if (object)
          this.$module.setHighlightedByZincObject(object, true);
        else
          this.$module.setHighlightedByObjects([], true);
      }
    },
    /**
     * Start the animation.
     * @param {object} object Zinc object 
     */
    play: function(flag) {
      this.$module.playAnimation(flag);
      this.isPlaying = flag;
    }
  },
  props: { 
    /**
     * Enable traditional control
     */
    traditional: {
      type: Boolean,
      default: false
    },
    /**
     * URL of the zincjs metadata.
     */
    url: String,
    /**
     * Show the colour control of set to true.
     */
    showColourPicker: {
      type: Boolean,
      default: false
    },
    /**
     * Flag to show/hide the UI.
     */
    displayUI: {
      type: Boolean,
      default: true
    },
    /**
     * Display all graphics at start
     */
    displayAtStartUp: {
      type: Boolean,
      default: true
    },
    backgroundToggle: {
      type: Boolean,
      default: false
    },
  },
  data: function() {
    return {
      sceneData: this.$module.sceneData,
      isPlaying: false,
      step: 0.1,
      selectedObject: undefined,
      hoveredObject: undefined,
      /**
       * This is set when scene is transitioning.
       */
      isTransitioning: false,
      currentBackground: 0,
      availableBackground: ['white', 'black', 'lightskyblue'],
      controls: undefined
    };
  },
  watch: {
    url: function(newValue) {
      if (newValue) {
        if (this.controls)
          this.controls.clear();
        this.$module.loadOrgansFromURL(
          newValue,
          undefined,
          undefined,
          "scene",
          undefined
        );
      }
    },
    traditional: function (value) {
      if (value)
        this.controls = this.refs.traditionalControl;
      else
        this.controls = this.refs.selectControl;
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
    this.$module.toolTip = undefined;
    if (this.traditional)
      this.controls = this.$refs.traditionalControl;
    else
      this.controls = this.$refs.selectControl;
  },
  destroyed: function() {
    this.$module.destroy();
    this.$module = undefined;
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

#organsDisplayArea:focus {
    outline: none !important;
    border:0px;
}

.scaffold-container {
  height: 100%;
  width: 100%;
  position:relative;
}

.timeSlider {
  text-align: center;
  position: absolute;
  left: 2.5%;
  height: 48px;
  width: 95%;
  bottom: 20px;
}

.zoomIn{
  top:51px;
  right:20px;
  position: absolute;

}

.zoomOut{
  top:101px;
  right:20px;
  position: absolute;
}

.resetView {
  top:151px;
  right:20px;
  position: absolute;
}

.icon-button {
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
  border: solid 1px #ffffff;
  background-color: #ffffff;
}

.video-button {
  padding-top:5px;
}

>>> .el-slider__bar {
  background-color: #8300bf;
}

</style>

<style scoped src="../styles/purple/button.css">
</style>
<style scoped src="../styles/purple/slider.css">
</style>
