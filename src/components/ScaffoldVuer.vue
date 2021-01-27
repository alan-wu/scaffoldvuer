<template>
  <div class="scaffold-container"
      v-loading="loading"
      element-loading-text="Loading..."
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.3)">
    <SvgSpriteColor/>
    <div id="organsDisplayArea" tabindex="-1" style="height:100%;width:100%;" ref="display" @keydown.66="backgroundChangeCallback"></div>
    <div v-show="displayUI && !isTransitioning">
      <el-popover v-if="displayWarning" :content="warningMessage" placement="right"
        :appendToBody=false trigger="manual" popper-class="warning-popper right-popper" v-model="hoverVisabilities[6].value"
        ref="warningPopover">
      </el-popover>
      <i class="el-icon-warning warning-icon" v-if="displayWarning" 
        @mouseover="showToolitip(6)" @mouseout="hideToolitip(6)"
        v-popover:warningPopover>
        <span class="warning-text">Beta</span>
      </i>
      <el-popover content="Change region visibility" placement="right"
        :appendToBody=false trigger="manual" popper-class="scaffold-popper right-popper" v-model="hoverVisabilities[5].value" ref="checkBoxPopover">
      </el-popover>
      <TraditionalControls v-if="traditional" v-popover:checkBoxPopover :helpMode="helpMode" :module="$module" @object-selected="objectSelected" 
        @object-hovered="objectHovered" @drawer-toggled="drawerToggled" :showColourPicker="showColourPicker" ref="traditionalControl"/>
      <SelectControls v-else :module="$module" @object-selected="objectSelected" 
        @object-hovered="objectHovered" :displayAtStartUp="displayAtStartUp" ref="selectControl"/>
      <OpacityControls ref="opacityControl"/>
      <el-popover content="Change background color" placement="right"
        :appendToBody=false trigger="manual" popper-class="scaffold-popper right-popper" v-model="hoverVisabilities[3].value">
        <SvgIcon icon="changeBckgd" class="icon-button background-colour" slot="reference" @click.native="backgroundChangeCallback()"
          :class="{ open: drawerOpen, close: !drawerOpen }"
          @mouseover.native="showToolitip(3)" @mouseout.native="hideToolitip(3)"/>
      </el-popover>
      <el-popover v-if="sceneData.timeVarying" content="Move the slider to animate the region" placement="top"
        :appendToBody=false trigger="manual" popper-class="scaffold-popper top-popper" v-model="hoverVisabilities[4].value" ref="sliderPopover">
     </el-popover>
      <div class="time-slider-container" v-popover:sliderPopover v-if="sceneData.timeVarying">
        <el-row>
          <div class="slider-display-text">
            Animate scaffold
          </div>
        </el-row>
        <el-row class="slider-control">
          <el-col :span="2" offset="1">
            <SvgIcon v-if="isPlaying" icon="pause" class="icon-button video-button" @click.native="play(false)"/>
            <SvgIcon v-else @click.native="play(true)" icon="play" class="video-button icon-button"/>
          </el-col>
          <el-col :offset="1" :span="19">
            <el-slider
              :min="0"
              :max="100"
              :value="sceneData.currentTime"
              :step="0.1"
              tooltip-class="time-slider"
              @input="timeChange($event)"
            ></el-slider>
          </el-col>
        </el-row>
      </div>
      <div class="bottom-right-control">
        <el-popover content="Zoom in" placement="left"
          :appendToBody=false trigger="manual" popper-class="scaffold-popper left-popper" v-model="hoverVisabilities[0].value">
          <SvgIcon icon="zoomIn" class="icon-button zoomIn" slot="reference" @click.native="zoomIn()"
            @mouseover.native="showToolitip(0)" @mouseout.native="hideToolitip(0)"/>
        </el-popover>
        <el-popover content="Zoom out" placement="top-end"
          :appendToBody=false trigger="manual" :offset="50" popper-class="scaffold-popper popper-zoomout" v-model="hoverVisabilities[1].value">
          <SvgIcon icon="zoomOut" class="icon-button zoomOut" slot="reference" @click.native="zoomOut()"
            @mouseover.native="showToolitip(1)" @mouseout.native="hideToolitip(1)"/>
        </el-popover>
        <el-popover content="Reset view" placement="top"
          :appendToBody=false trigger="manual" popper-class="scaffold-popper" v-model="hoverVisabilities[2].value">
          <SvgIcon icon="resetZoom" class="icon-button resetView" slot="reference" @click.native="resetView()"
            @mouseover.native="showToolitip(2)" @mouseout.native="hideToolitip(2)"/>
        </el-popover>
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
import { SvgIcon, SvgSpriteColor} from '@abi-software/svg-sprite'

import {
  Button,
  Col,
  Loading,
  Row,
  Slider,
  Popover
} from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";
locale.use(lang);
Vue.use(Button);
Vue.use(Col);
Vue.use(Loading.directive);
Vue.use(Row);
Vue.use(Slider);
Vue.use(Popover);

const OrgansViewer = require("physiomeportal/src/modules/organsRenderer")
  .OrgansViewer;
const EventNotifier = require("physiomeportal/src/utilities/eventNotifier")
  .EventNotifier;

/**
 * A vue component of the scaffold viewer.
 * 
 * @requires ./OpacityControls.vue
 * @requires ./SelectControls.vue
 * @requires ./TraditionalControls.vue
 */
export default {
  name: "ScaffoldVuer",
  components: {
    OpacityControls,
    SelectControls,
    SvgIcon,
    SvgSpriteColor,
    TraditionalControls
  },
  beforeCreate: function() {
    this.$module = new OrgansViewer();
    this.selectedObject = undefined;
    this.hoveredObject = undefined;
    this.controls = undefined;
    this.currentBackground = 0;
    this._currentURL = undefined;
    this.availableBackground = ['white', 'black', 'lightskyblue'];
  },
  methods: {
    /**
     * This is called when a new organ is read into the scene.
     */
    organsAdded: function() {
      this.loading = false;
    },
    /**
     * This is called when Change background colour button 
     * is pressed an causes the backgrouColornd colour to be changed
     * to one of the three preset colour: white, black and
     * lightskyblue. 
     */
    backgroundChangeCallback: function() {
      ++this.currentBackground;
      if (this.currentBackground >= this.availableBackground.length )
        this.currentBackground = 0;
      this.$module.zincRenderer.getThreeJSRenderer().
        setClearColor(this.availableBackground[this.currentBackground], 1 );
    },
    /**
     * This is called by captueeScreenshot and after the last render
     * loop, it download a screenshot of the current scene with no UI. 
     */
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
    /**
     * Function for capturing a screenshot of the current rendering.
     * 
     * @param {String} filename filename given to the screenshot.
     * 
     * @public
     */
    captureScreenshot: function(filename) {
      this.captureFilename = filename;
      this.captureID = this.$module.zincRenderer.addPostRenderCallbackFunction(
        this.captureScreenshotCallback);
    },
    /**
     * Function to reset the view to default.
     * Also called when the associated button is pressed.
     * 
     * @public
     */
    resetView: function() {
      if (this.$module.scene) {
        this.$module.scene.viewAll();
      }
    },
    /**
     * Function to zoom in.
     * Also called when the associated button is pressed.
     * 
     * @public
     */
    zoomIn: function() {
      if (this.$module.scene) {
        this.$module.scene.changeZoomByScrollRateUnit(-1);
      }
    },
    /**
      * Function to zoom out.
      * Also called when the associated button is pressed.
      * 
      * @public
      */
    zoomOut: function() {
      if (this.$module.scene) {
        this.$module.scene.changeZoomByScrollRateUnit(1);
      }
    },
    /**
     * Function used to stop the free spin 
     * 
     * @public
     */
    stopFreeSpin: function() {
      let cameracontrol = this.$module.scene.getZincCameraControls();
      cameracontrol.stopAutoTumble();
      this.isTransitioning = false;
    },
    /**
     * Function used to rotate the scene.
     * Also called when the associated button is pressed.
     * 
     * @public
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
        /**
         * Triggers when an object has been selected
         *
         * @property {array} identifiers array of identifiers 
         * of selected object.
         */
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
        /**
         * Triggers when an object has been highlighted
         *
         * @property {array} identifiers array of identifiers 
         * of highlighted object.
         */
        this.$emit("scaffold-highlighted", event.identifiers);
      }
    },
    /**
     * Get the coordinates of the current selected region.
     * 
     * @public
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
     * 
     * @public
     */
    getDynamicSelectedCoordinates: function() {
      return this.$module.selectedScreenCoordinates;
    },
    /**
     * Callback when time is changed through the UI.
     */
    timeChange: function(event) {
      if (event != this.sceneData.currentTime)
        this.$module.updateTime(event);
    },
    /**
     * Set the selected zinc object
     * 
     * @param {object} object Zinc object 
     */
    objectSelected: function(object) {
      if (object !== this.selectedObject) {
        this.selectedObject = object;
        this.$refs.opacityControl.setObject(this.selectedObject);
        if (object)
          this.$module.setSelectedByZincObject(object, true);
        else
          this.$module.setSelectedByObjects([], true);
      }
    },
    /**
     * Set the highlighted zinc object
     * 
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
     * 
     * @param {object} object Zinc object 
     */
    play: function(flag) {
      this.$module.playAnimation(flag);
      this.isPlaying = flag;
    },
    /**
     * Function to toggle on/off overlay help.
     */
    setHelpMode: function(helpMode){
      if (helpMode){
        this.inHelp = true;
        this.hoverVisabilities.forEach( (item) =>{
          item.value = true;
        });
      } else {
        this.inHelp = false;
        this.hoverVisabilities.forEach( (item) =>{
          item.value = false;
        });
      }
    },
    /**
     * This is called when mouse cursor enters supported elements
     * with help tootltips.
     */
    showToolitip: function(tooltipNumber){
      if (!this.inHelp){
        this.tooltipWait = setTimeout( ()=>{
          this.hoverVisabilities[tooltipNumber].value = true}, 500);
      }
    },
    /**
     * This is called when mouse cursor exits supported element..
     */
    hideToolitip: function(tooltipNumber){
      if (!this.inHelp){
        this.hoverVisabilities[tooltipNumber].value = false;
        clearTimeout(this.tooltipWait);
      }
    },
    /**
     * Called when minimap settings has changed. Pass the
     * parameters to ZincJS and marked it for update.
     */
    updateMinimapScissor: function() {
      Object.keys(this.minimapSettings).forEach(key => {
        this.$module.scene.minimapScissor[key] = this.minimapSettings[key];
      });
      this.$module.scene.minimapScissor.updateRequired = true;
    },
    setViewportCallback: function(viewport) {
      return () => {
        this.$module.scene.getZincCameraControls().setCurrentCameraSettings(
          viewport);
        this.$module.unsetFinishDownloadCallback();
      }
    },
    /**
     * Function used for getting the current states of the scene. This exported states 
     * can be imported using the importStates method.
     * 
     * @public
     */
    getState: function() {
      let state = {
        url: this._currentURL,
        viewport: undefined
      };
      if (this.$module.scene) {
        let zincCameraControls = this.$module.scene.getZincCameraControls();
        state.viewport = zincCameraControls.getCurrentViewport();
      }
      return state;
    },
    /**
     * Function used for importing the states of the scene. This exported states 
     * can be imported using the read states method.
     * 
     * @public
     */
    setState: function(state) {
      if (state) {
        if (state.url && state.url !== this._currentURL) {
          if (state.viewport) {
            this.$module.setFinishDownloadCallback(
              this.setViewportCallback(state.viewport));
          }
          this.setURL(state.url);
        } else if (state.viewport) {
          this.$module.scene.getZincCameraControls().setCurrentCameraSettings(
            state.viewport);
        }
      }
    },
    /**
     * Function used for reading in new scaffold metadata. This function will ignore
     * the state prop and read in the new url.
     * 
     * @public
     */
    setURL: function(newValue) {
      if (newValue != this._currentURL) {
        this._currentURL = newValue;
        if (this.controls)
          this.controls.clear();
        this.loading = true;
        this.$module.loadOrgansFromURL(
          newValue,
          undefined,
          undefined,
          "scene",
          undefined
        );
        this.$module.scene.displayMarkers = this.displayMarkers;
        this.$module.scene.displayMinimap = this.displayMinimap;
        this.updateMinimapScissor();
      }
    },
    /**
     * Callback when drawer is toggled.
     * 
     */
    drawerToggled: function (flag) {
      console.log(flag)
      this.drawerOpen = flag;
    },
  },
  props: { 
    /**
     * Enable traditional control. Select control will be
     * used instead if set to false.
     */
    traditional: {
      type: Boolean,
      default: true
    },
    /**
     * URL of the zincjs metadata. This value will be ignored if a valid
     * state prop is also provided.
     * If the url needs to be updated with state present, please use
     * the setURL method.
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
     * Display all graphics at start.
     * 
     * This setting only works when traditional is set to false.
     */
    displayAtStartUp: {
      type: Boolean,
      default: true
    },
    /**
     * Use for toggling the help tooltips.
     */
    helpMode: {
      type: Boolean,
      default: false
    },
    /**
     * Use for show/display beta warning icon.
     */
    displayWarning: {
      type: Boolean,
      default: true
    },
    /**
     * Warning message for the hovered over text
     * on the warning icon.
     */
    warningMessage: {
      type: String,
      default: "Beta feature - under active development"
    },
    /**
     * Show/hide pickable markers for regions.
     */
    displayMarkers: {
      type: Boolean,
      default: true
    },
    /**
     * Show/hide minimap.
     */
    displayMinimap: {
      type: Boolean,
      default: false
    },
    /**
     * Settings for minimap position, size and alignment.
     */
    minimapSettings: {
      type: Object,
      default: function () {
        return {
          x_offset: 16,
          y_offset: 16,
          width: 128,
          height: 128,
          align: "top-right",
        }
      }
    },
    /**
     * State containing state of the scaffold.
     */
    state: {
      type: Object,
      default: undefined,
    },
  },
  data: function() {
    return {
      sceneData: this.$module.sceneData,
      isPlaying: false,
      /**
       * This is set when scene is transitioning.
       */
      isTransitioning: false,
      tooltipAppendToBody: false,
      hoverVisabilities: [{value: false}, {value: false}, {value: false},
        {value: false}, {value: false},{value: false}, {value: false}],
      inHelp: false,
      loading: false,
      duration: 3000,
      drawerOpen: true,
    };
  },
  watch: {
    url: {
      handler: function(newValue) {
        if (this.state === undefined)
          this.setURL(newValue);
      },
      immediate: true
    },
    state: {
      handler: function(state) {
        this.setState(state);
      },
      immediate: true,
      deep: true,
    },
    traditional: function (value) {
      if (value)
        this.controls = this.refs.traditionalControl;
      else
        this.controls = this.refs.selectControl;
    },
    helpMode: function(val){
      this.setHelpMode(val);
    },
    displayMarkers: function(val) {
      this.$module.scene.displayMarkers = val;
    },
    displayMinimap: function(val) {
      this.$module.scene.displayMinimap = val;
    },
    "sceneData.currentTime": function(){
      /**
       * Triggers when scene time changes.
       *
       * @property {number} time Current build-in time of scene.
       * of selected object.
       */
      this.$emit('timeChanged', this.sceneData.currentTime);
    },
    duration: function() {
      this.$module.scene.setDuration(this.duration);
    },
    minimapSettings: {
      deep: true,
      handler: "updateMinimapScissor"
    }
  },
  mounted: function() {
    let eventNotifier = new EventNotifier();
    eventNotifier.subscribe(this, this.eventNotifierCallback);
    this.$module.addNotifier(eventNotifier);
    this.$module.addOrganPartAddedCallback(this.organsAdded);
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

.warning-icon {
  position: absolute;
  top: 15px;
  left: 37px;
  text-align: left;
  font-size: 25px;
  color: #ff8400;
}
.warning-icon:hover {
  cursor: pointer;
}
.warning-text{
  font-size: 15px;
  vertical-align:5px;
}
>>> .warning-popper {
  padding:9px 10px;
  min-width:150px;
  font-size:12px;
  color: #fff;
  background-color: #ff8400;
}
>>> .warning-popper.right-popper .popper__arrow::after{
  border-right-color: #ff8400 !important;
}

#organsDisplayArea:focus {
    outline: none !important;
    border:0px;
}

.scaffold-container {
  height: 100%;
  width: 100%;
  position:relative;
}

.time-slider-container {
  text-align: left;
  position: absolute;
  left: 33%;
  height: 64px;
  width: 50%;
  bottom: 16px;
}

.slider-display-text {
  height: 20px;
  color: rgb(48, 49, 51);
  font-size: 14px;
  font-weight: normal;
  line-height: 20px;
  padding-left:8px;
}

.slider-control {
  border: 1px solid rgb(144, 147, 153);
  border-radius: 4px;
}

.time-slider {
  padding: 6px 4px;
  font-size:12px;
  color: rgb(48, 49, 51);
  background-color: #f3ecf6;
  border: 1px solid rgb(131, 0, 191);
  white-space: nowrap;
  min-width: unset; 
}

.zoomOut{
  padding-left: 8px;
}

.resetView {
  padding-left: 8px;
}

.background-colour {
  bottom: 16px;
  position: absolute;
  transition: all 1s ease;
}
.background-colour.open {
  left: 310px;
}
.background-colour.close {
  left: 12px;
}

.icon-button {
  height:24px!important;
  width:24px!important;
}

.icon-button:hover {
  cursor:pointer;
}

.bottom-right-control {
  position:absolute;
  right:16px;
  bottom:16px;
}

.video-button {
  margin-top:7px!important;
}

>>> .scaffold-popper {
  padding: 6px 4px;
  font-size:12px;
  color: rgb(48, 49, 51);
  background-color: #f3ecf6;
  border: 1px solid rgb(131, 0, 191);
  white-space: nowrap;
  min-width: unset; 
}

>>> .el-slider__button {
  border: 2px solid #8300bf;
}

>>> .el-slider__bar {
  background-color: #8300bf;
}

>>> .scaffold-popper.left-popper .popper__arrow::after{
  border-left-color: #8300bf !important;
}

>>> .scaffold-popper.right-popper .popper__arrow::after{
  border-right-color: #8300bf !important;
}

>>> .scaffold-popper.top-popper .popper__arrow::after{
  border-top-color: #8300bf !important;
}

>>>.el-popper[x-placement^="top"] .popper__arrow::after {
  border-top-color:#8300bf !important;
  border-left-color:transparent !important;
  border-right-color:transparent !important;
}

>>>.popper-zoomout {
  left:-31px!important;
}

>>>.popper-zoomout .popper__arrow{
  left:48px!important;
}

>>>.el-loading-spinner i{
  color: #8300bf;  
}
>>>.el-loading-spinner .el-loading-text {
  color: #8300bf; 
}

</style>

<style scoped src="../styles/purple/button.css">
</style>
<style scoped src="../styles/purple/slider.css">
</style>
<style scoped src="../styles/purple/loading.css">
</style>
