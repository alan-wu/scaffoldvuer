<template>
  <div
    ref="scaffoldContainer"
    v-loading="loading"
    class="scaffold-container"
    element-loading-text="Loading..."
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.3)"
  >
    <SvgSpriteColor />
    <div
      id="organsDisplayArea"
      ref="display"
      tabindex="-1"
      style="height:100%;width:100%;"
      @keydown.66="backgroundChangeCallback"
    />
    <div v-show="displayUI && !isTransitioning">
      <el-popover
        v-if="displayWarning"
        ref="warningPopover"
        v-model="hoverVisabilities[6].value"
        :content="warningMessage"
        placement="right"
        :append-to-body="false"
        trigger="manual"
        popper-class="warning-popper right-popper non-selectable"
      />
      <i
        v-if="displayWarning"
        v-popover:warningPopover
        class="el-icon-warning warning-icon"
        @mouseover="showToolitip(6)"
        @mouseout="hideToolitip(6)"
      >
        <span class="warning-text">Beta</span>
      </i>
      <el-popover
        ref="checkBoxPopover"
        v-model="hoverVisabilities[5].value"
        content="Change region visibility"
        placement="right"
        :append-to-body="false"
        trigger="manual"
        popper-class="scaffold-popper right-popper non-selectable"
      />
      <TraditionalControls
        ref="traditionalControl"
        v-popover:checkBoxPopover
        :help-mode="helpMode"
        :module="$module"
        :show-colour-picker="showColourPicker"
        @object-selected="objectSelected"
        @object-hovered="objectHovered"
        @drawer-toggled="drawerToggled"
      />
      <OpacityControls ref="opacityControl" />
      <el-popover
        v-if="sceneData.timeVarying"
        ref="sliderPopover"
        v-model="hoverVisabilities[4].value"
        content="Move the slider to animate the region"
        placement="top"
        :append-to-body="false"
        trigger="manual"
        popper-class="scaffold-popper top-popper non-selectable"
      />
      <div
        v-if="sceneData.timeVarying"
        v-popover:sliderPopover
        class="time-slider-container"
        :class="[ minimisedSlider ? 'minimised' : '', sliderPosition]"
      >
        <el-tabs type="card">
          <el-tab-pane label="Animate scaffold">
            <el-row class="tab-content">
              <SvgIcon
                v-if="isPlaying"
                icon="pause"
                class="icon-button video-button"
                @click.native="play(false)"
              />
              <SvgIcon
                v-else
                icon="play"
                class="video-button icon-button"
                @click.native="play(true)"
              />
              <el-slider
                :min="0"
                :max="timeMax"
                :value="sceneData.currentTime / 100 * timeMax"
                :step="0.1"
                tooltip-class="time-slider-tooltip"
                class="slider"
                :format-tooltip="formatTooltip"
                :marks="timeStamps"
                @input="timeChange($event)"
              />
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="Animation data">
            <el-row class="tab-content">
              <div class="animation-data">
                Original duration:
                <div class="purple">
                  {{ orginalDuration }}
                </div>
              </div>
              <div class="animation-data">
                Animation duration:
                <div class="purple">
                  {{ animateDuration }}
                </div>
              </div>
              <div class="animation-data">
                Playback speed
                <el-select
                  :popper-append-to-body="true"
                  :value="currentSpeed"
                  placeholder="Select"
                  class="select-box"
                  popper-class="scaffold_viewer_dropdown"
                  @change="speedChanged($event)"
                >
                  <el-option
                    v-for="item in playSpeed"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </div>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </div>
      <div class="bottom-right-control">
        <el-popover
          v-model="hoverVisabilities[0].value"
          content="Zoom in"
          placement="left"
          :append-to-body="false"
          trigger="manual"
          popper-class="scaffold-popper left-popper non-selectable"
        >
          <SvgIcon
            slot="reference"
            icon="zoomIn"
            class="icon-button zoomIn"
            @click.native="zoomIn()"
            @mouseover.native="showToolitip(0)"
            @mouseout.native="hideToolitip(0)"
          />
        </el-popover>
        <el-popover
          v-model="hoverVisabilities[1].value"
          content="Zoom out"
          placement="top-end"
          :append-to-body="false"
          trigger="manual"
          popper-class="scaffold-popper popper-zoomout non-selectable"
        >
          <SvgIcon
            slot="reference"
            icon="zoomOut"
            class="icon-button zoomOut"
            @click.native="zoomOut()"
            @mouseover.native="showToolitip(1)"
            @mouseout.native="hideToolitip(1)"
          />
        </el-popover>
        <el-popover
          v-model="hoverVisabilities[2].value"
          placement="top"
          :append-to-body="false"
          trigger="manual"
          popper-class="scaffold-popper non-selectable"
        >
          <div>Fit to<br>window</div>
          <SvgIcon
            slot="reference"
            icon="fitWindow"
            class="icon-button fitWindow"
            @click.native="fitWindow()"
            @mouseover.native="showToolitip(2)"
            @mouseout.native="hideToolitip(2)"
          />
        </el-popover>
      </div>
      <el-popover
        ref="backgroundPopover"
        placement="top-start"
        width="128"
        :append-to-body="false"
        trigger="click"
        popper-class="background-popper non-selectable"
      >
        <el-row class="backgroundText">
          Change background
        </el-row>
        <el-row class="backgroundChooser">
          <div
            v-for="item in availableBackground"
            :key="item"
            :class="['backgroundChoice', item, item == currentBackground ? 'active' :'']"
            @click="backgroundChangeCallback(item)"
          />
        </el-row>
      </el-popover>
      <el-popover
        v-model="hoverVisabilities[3].value"
        content="Change background color"
        placement="right"
        :append-to-body="false"
        trigger="manual"
        popper-class="scaffold-popper right-popper non-selectable"
      >
        <SvgIcon
          slot="reference"
          v-popover:backgroundPopover
          icon="changeBckgd"
          class="icon-button background-colour"
          :class="{ open: drawerOpen, close: !drawerOpen }"
          @mouseover.native="showToolitip(3)"
          @mouseout.native="hideToolitip(3)"
        />
      </el-popover>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import OpacityControls from "./OpacityControls";
import TraditionalControls from "./TraditionalControls";
import { SvgIcon, SvgSpriteColor } from "@abi-software/svg-sprite";

import {
  Button,
  Col,
  Loading,
  Option,
  Popover,
  Row,
  Select,
  Slider,
  TabPane,
  Tabs
} from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";
locale.use(lang);
Vue.use(Button);
Vue.use(Col);
Vue.use(Loading.directive);
Vue.use(Option);
Vue.use(Popover);
Vue.use(Row);
Vue.use(Select);
Vue.use(Slider);
Vue.use(TabPane);
Vue.use(Tabs);

const OrgansViewer = require("physiomeportal/src/modules/organsRenderer")
  .OrgansViewer;
const EventNotifier = require("physiomeportal/src/utilities/eventNotifier")
  .EventNotifier;

/**
 * A vue component of the scaffold viewer.
 *
 * @requires ./OpacityControls.vue
 * @requires ./TraditionalControls.vue
 */
export default {
  name: "ScaffoldVuer",
  components: {
    OpacityControls,
    SvgIcon,
    SvgSpriteColor,
    TraditionalControls
  },
  props: {
    /**
     * URL of the zincjs metadata. This value will be ignored if a valid
     * state prop is also provided.
     * If the url needs to be updated with state present, please use
     * the setURL method.
     */
    url: {
      type: String,
      default: ''
    },
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
      default: function() {
        return {
          x_offset: 16,
          y_offset: 16,
          width: 128,
          height: 128,
          align: "top-right"
        };
      }
    },
    /**
     * State containing state of the scaffold.
     */
    state: {
      type: Object,
      default: undefined
    },
    /**
     * Optional prop for the name of the region to focus on,
     * this option is ignored if state or viewURL is also provided.
     */
    region: {
      type: String,
      default: ""
    },
    /**
     * Optional prop for an URL of containing information of a viewport.
     * This option is ignored if state is also provided.
     * It will use the provided URL as base if a relative parth is provided.
     */
    viewURL: {
      type: String,
      default: ""
    },
    /**
     * Settings for turning on/off rendering
     */
    render: {
      type: Boolean,
      default: true
    }
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
      hoverVisabilities: [
        { value: false },
        { value: false },
        { value: false },
        { value: false },
        { value: false },
        { value: false },
        { value: false }
      ],
      inHelp: false,
      loading: false,
      duration: 3000,
      drawerOpen: true,
      currentBackground: "white",
      availableBackground: ["white", "lightskyblue", "black"],
      minimisedSlider: false,
      sliderPosition: "",
      timeMax: 100,
      orginalDuration: "",
      animateDuration: "6secs",
      playSpeed: [
        {
          value: 0.1,
          label: "0.1x"
        },
        {
          value: 0.5,
          label: "0.5x"
        },
        {
          value: 1,
          label: "1x"
        },
        {
          value: 2,
          label: "2x"
        },
        {
          value: 5,
          label: "5x"
        },
        {
          value: 10,
          label: "10x"
        }
      ],
      currentSpeed: 1,
      timeStamps: {}
    };
  },
  watch: {
    url: {
      handler: function(newValue) {
        if (this.state === undefined || this.state.url === undefined)
          this.setURL(newValue);
      },
      immediate: true
    },
    region: {
      handler: function(region) {
        if (!(this.state || this.viewURL))
          this.setFocusedRegion(region);
      },
      immediate: true,
    },
    state: {
      handler: function(state) {
        this.setState(state);
      },
      immediate: true,
      deep: true
    },
    viewURL: {
      handler: function(viewURL) {
        this.updateViewURL(viewURL);
      },
      immediate: true,
    },
    helpMode: function(val) {
      this.setHelpMode(val);
    },
    displayMarkers: function(val) {
      this.$module.scene.displayMarkers = val;
    },
    displayMinimap: function(val) {
      this.$module.scene.displayMinimap = val;
    },
    "sceneData.currentTime": function() {
      /**
       * Triggers when scene time changes.
       *
       * @property {number} time Current build-in time of scene.
       * of selected object.
       */
      this.$emit("timeChanged", this.sceneData.currentTime);
    },
    duration: function() {
      this.$module.scene.setDuration(this.duration);
    },
    minimapSettings: {
      deep: true,
      handler: "updateMinimapScissor"
    },
    render: function(val) {
      this.toggleRendering(val);
    }
  },
  beforeCreate: function() {
    this.$module = new OrgansViewer();
    this.isReady = false;
    this.selectedObject = undefined;
    this.hoveredObject = undefined;
    this.currentBackground = "white";
    this._currentURL = undefined;
    this.availableBackground = ["white", "black", "lightskyblue"];
  },
  mounted: function() {
    let eventNotifier = new EventNotifier();
    eventNotifier.subscribe(this, this.eventNotifierCallback);
    this.$module.addNotifier(eventNotifier);
    this.$module.addOrganPartAddedCallback(this.organsAdded);
    this.$module.initialiseRenderer(this.$refs.display);
    this.toggleRendering(this.render);
    this.$module.toolTip = undefined;
    this.ro = new ResizeObserver(this.adjustLayout).observe(
      this.$refs.scaffoldContainer
    );
    this.defaultRate = this.$module.getPlayRate();
  },
  beforeDestroy: function() {
    if (this.ro) this.ro.disconnect();
    this.$module.destroy();
    this.$module = undefined;
  },
  methods: {
    /**
     * This is called when a new organ is read into the scene.
     */
    organsAdded: function() {
      this.loading = false;
    },
    /**
     * This is called when Change backgspeedround colour button
     * is pressed an causes the backgrouColornd colour to be changed
     * to one of the three preset colour: white, black and
     * lightskyblue.
     */
    backgroundChangeCallback: function(colour) {
      this.currentBackground = colour;
      this.$module.zincRenderer
        .getThreeJSRenderer()
        .setClearColor(this.currentBackground, 1);
    },
    /**
     * This is called by captueeScreenshot and after the last render
     * loop, it download a screenshot of the current scene with no UI.
     */
    captureScreenshotCallback: function() {
      //Remove the callback, only needs to happen once
      this.$module.zincRenderer.removePostRenderCallbackFunction(
        this.captureID
      );
      let screenshot = this.$module.zincRenderer
        .getThreeJSRenderer()
        .domElement.toDataURL("image/png");
      let hrefElement = document.createElement("a");
      document.body.append(hrefElement);
      if (!this.captureFilename) hrefElement.download = `screenshot.png`;
      else hrefElement.download = this.captureFilename;
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
        this.captureScreenshotCallback
      );
    },
    formatTooltip(val) {
      if (this.timeMax >= 1000) {
        if (val) {
          let sec = ((val % 60000) / 1000).toFixed(2) + "s";
          let min = val > 60000 ? (val / 60000).toFixed(0) + "m " : "";
          return min + sec;
        }
      }
      return val ? val.toFixed(2) + " ms" : "0 ms";
    },
    /**
     * Function to reset the view to default.
     * Also called when the associated button is pressed.
     *
     * @public
     */
    fitWindow: function() {
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
     * Function to change the current play speed.
     *
     * @public
     */
    speedChanged: function(speed) {
      this.currentSpeed = speed;
      this.$module.setPlayRate(this.defaultRate * this.currentSpeed);
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
     * Focus on named region
     */
    viewRegion: function(name) {
      if ((name && name != "") && this.$module.scene) {
        let objects = this.$module.scene.findObjectsWithGroupName(name);
        let box = this.$module.scene.getBoundingBoxOfZincObjects(objects);
        if (box) {
          this.$module.scene.viewAllWithBoundingBox(box);
        }
      }
    },
    setFocusedRegion: function(name) {
      if (name) {
        if (this.isReady) {
          this.viewRegion(name);
        } else {
          this.$module.setFinishDownloadCallback(
            this.setURLFinishCallback({region: name}));
        }
      }
    },
    updateViewURL: function(viewURL) {
      if (viewURL) {
        if (this.isReady) {
            const url = new URL(viewURL, this.url);
            this.$module.scene.loadViewURL(url);
        } else {
          this.$module.setFinishDownloadCallback(
            this.setURLFinishCallback({viewURL: viewURL}));
        }
      }
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
            let id = event.identifiers[0].data.id
              ? event.identifiers[0].data.id
              : event.identifiers[0].data.group;
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
      } else if (event.eventType == 2) {
        if (this.controls) {
          if (event.identifiers[0]) {
            let id = event.identifiers[0].data.id
              ? event.identifiers[0].data.id
              : event.identifiers[0].data.group;
            this.controls.changeHoverByName(id);
          } else this.controls.removeHover();
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
      let normalizedTime = (event / this.timeMax) * 100;
      if (normalizedTime != this.sceneData.currentTime)
        this.$module.updateTime(normalizedTime);
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
        if (object) this.$module.setSelectedByZincObject(object, true);
        else this.$module.setSelectedByObjects([], true);
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
        if (object) this.$module.setHighlightedByZincObject(object, true);
        else this.$module.setHighlightedByObjects([], true);
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
    setHelpMode: function(helpMode) {
      if (helpMode) {
        this.inHelp = true;
        this.hoverVisabilities.forEach(item => {
          item.value = true;
        });
      } else {
        this.inHelp = false;
        this.hoverVisabilities.forEach(item => {
          item.value = false;
        });
      }
    },
    /**
     * This is called when mouse cursor enters supported elements
     * with help tootltips.
     */
    showToolitip: function(tooltipNumber) {
      if (!this.inHelp) {
        this.tooltipWait = setTimeout(() => {
          this.hoverVisabilities[tooltipNumber].value = true;
        }, 500);
      }
    },
    /**
     * This is called when mouse cursor exits supported element..
     */
    hideToolitip: function(tooltipNumber) {
      if (!this.inHelp) {
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
    updateSettingsfromScene: function() {
      this.currentSpeed = 1;
      this.$module.setPlayRate(this.defaultRate);
      this.orginalDuration = this.$module.scene.getMetadataTag(
        "OriginalDuration"
      );
      this.animateDuration = this.$module.scene.getMetadataTag("Duration");
      let timeStamps = this.$module.scene.getMetadataTag("TimeStamps");
      this.timeStamps = {};
      for (const key in timeStamps) {
        this.timeStamps[timeStamps[key]] = key;
      }
      this.timeMax = this.$module.scene.getDuration();
    },
    setURLFinishCallback: function(options) {
      return () => {
        if (options) {
          if (options.viewport) {
            this.$module.scene
              .getZincCameraControls()
              .setCurrentCameraSettings(options.viewport);
          } else if (options.viewURL && options.viewURL !== "") {
            const url = new URL(options.viewURL, this.url);
            this.$module.scene.loadViewURL(url);
          } else if (options.region  && options.region !== "") {
            this.viewRegion(options.region);
          }
          if (options.visibility) {
            // Some UIs may not be ready at this time.
            this.$nextTick(() => {
              this.$refs.traditionalControl.setState(
                options.visibility);
            })
          }
        }
        this.updateSettingsfromScene();
        this.$module.updateTime(0.01);
        this.$module.updateTime(0);
        this.$module.unsetFinishDownloadCallback();
        this.isReady = true;
      };
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
        viewport: undefined,
        visibility: undefined
      };
      if (this.$refs.traditionalControl)
        state.visibility = this.$refs.traditionalControl.getState();
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
        if (state.url && (state.url !== this._currentURL)) {
          this.setURLAndState(state.url, {viewport: state.viewport,
            visibility: state.visibility});
        } else {
          if (state.viewport || state.visibility) {
            if (this.isReady && this.$module.scene) {
              if (state.viewport)
                this.$module.scene
                  .getZincCameraControls()
                  .setCurrentCameraSettings(state.viewport);
              if (state.visibility)
                this.$refs.traditionalControl.setState(state.visibility);
            } else {
              this.$module.setFinishDownloadCallback(
                this.setURLFinishCallback({viewport: state.viewport, 
                visibility: state.visibility}));
            }
          }
        }
      }
    },
    /**
     * Function used for reading in new scaffold metadata and a custom
     * viewport. This function will ignore the state prop and 
     * read in the new url.
     *
     * @public
     */
    setURLAndState: function(newValue, state) {
      if (newValue != this._currentURL) {
        let viewport = (state && state.viewport) ? state.viewport : undefined;
        let visibility = (state && state.visibility) ? state.visibility : undefined;
        this._currentURL = newValue;
        if (this.$refs.traditionalControl)
          this.$refs.traditionalControl.clear();
        this.loading = true;
        this.isReady = false;
        this.$module.setFinishDownloadCallback(
          this.setURLFinishCallback({viewport: viewport, region: this.region,
           viewURL: this.viewURL, visibility: visibility}));
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
     * Function used for reading in new scaffold metadata. This function will ignore
     * the state prop and read in the new url.
     *
     * @public
     */
    setURL: function(newValue) {
      this.setURLAndState(newValue, undefined);
    },
    /**
     * Callback when drawer is toggled.
     *
     */
    drawerToggled: function(flag) {
      this.drawerOpen = flag;
      this.adjustLayout();
    },
    /**
     * Callback using ResizeObserver.
    
     */
    adjustLayout: function() {
      let width = this.$refs.scaffoldContainer.clientWidth;
      this.minimisedSlider = width < 812;
      if (this.minimisedSlider) {
        this.sliderPosition = this.drawerOpen ? "right" : "left";
      } else {
        this.sliderPosition = "";
      }
    },
    toggleRendering: function(flag) {
      if (this.$module.zincRenderer) {
        if (flag) {
          this.$module.zincRenderer.animate();
        } else {
          this.$module.zincRenderer.stopAnimate();
        }
      }
    },
    forceResize: function() {
      if (this.$module.zincRenderer) {
        this.$module.zincRenderer.onWindowResize();
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.warning-icon {
  position: absolute;
  top: 15px;
  left: 37px;
  text-align: left;
  font-size: 25px;
  color: #ff8400;

  &:hover {
    cursor: pointer;
  }
}

.warning-text {
  font-size: 15px;
  vertical-align: 5px;
}

::v-deep .warning-popper {
  padding: 9px 10px;
  min-width: 150px;
  font-size: 12px;
  color: #fff;
  background-color: #ff8400;

  &.right-popper {
    .popper__arrow {
      &::after {
        border-right-color: #ff8400 !important;
      }
    }
  }
}


#organsDisplayArea {
  &:focus {
    outline: none !important;
    border: 0px;
  }
}

.scaffold-container {
  height: 100%;
  width: 100%;
  position: relative;
}

.time-slider-container {
  text-align: left;
  position: absolute;
  right: 155px;
  width: calc(100% - 530px);
  bottom: 16px;
  transition: all 1s ease;
  outline: none;

  &.minimised {
    width: calc(40%);
  }
  
  &.left {
    right: 155px;
    width: calc(100% - 250px);
  }

  &.right {
    right: 8px;
    bottom: 54px;
  }
}

.slider-display-text {
  height: 20px;
  color: rgb(48, 49, 51);
  font-size: 14px;
  font-weight: normal;
  line-height: 20px;
  padding-left: 8px;
  text-shadow: -1px -1px #fff, 1px -1px #fff, -1px 1px #fff, 1px -1px #fff;
}

.tab-content {
  display: flex;
  height: 34px;
  padding-top: 8px;
  font-size: 14px;
}

.tab-content ::v-deep .el-slider__marks-text {
    margin-top: 12px;
    margin-left: 8px;
    font-size: 10px;
  }

.tab-content  ::v-deep .el-slider__stop {
    width: 10px;
    height: 10px;
    top: -1px;
    border: solid 1px #8300bf;
  }

.animation-data {
  margin-left: 8px;
  line-height: 26px;
  display: flex;

  :not(:first-child) {
    margin-left: 8px;
  }
  .purple {
    padding-left: 2px;
    color: #8300bf;
  }
}
.slider {
  margin-left: 30px;
  width: calc(100% - 88px);
  margin-top: -7px;

  ::v-deep .el-slider__runway {
    height: 10px;
    margin: 14px 0;
  }

  ::v-deep .el-slider__button-wrapper {
    top: -13px;
  }

}

.zoomOut {
  padding-left: 8px;
}

.fitWindow {
  padding-left: 8px;
}

::v-deep .non-selectable{
  user-select: none;
}

::v-deep .background-popper {
  padding: 5px 12px;
  background-color: #ffffff;
  border: 1px solid rgb(131, 0, 191);
  box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.06);
  height: 72px;
  width: 128px;
  min-width: 128px;

  &.el-popper[x-placement^="top"] {
    .popper__arrow {
      border-top-color: #8300bf !important;
      &:after {
        border-top-color: #fff !important;
      }
    }
  }
}

.background-colour {
  bottom: 16px;
  position: absolute;
  transition: all 1s ease;

  &.open {
    left: 322px;
  }

  &.close {
  left: 24px;
  }
}

.backgroundText {
  color: rgb(48, 49, 51);
  font-size: 14px;
  font-weight: normal;
  line-height: 20px;
}

.backgroundChooser {
  display: flex;
  margin-top: 16px;
}

.backgroundChoice {
  width: 20px;
  height: 20px;
  border: 1px solid rgb(144, 147, 153);
  margin-left: 20px;

  &.active {
    border: 2px solid #8300bf;
  }

  &:hover {
  cursor: pointer;
  }

  &.white {
    background-color: white;
    margin-left: 10px;
  }

  &.black {
    background-color: black;
  }

  &.lightskyblue {
    background-color: lightskyblue;
  }
}


.icon-button {
  height: 24px !important;
  width: 24px !important;

  &:hover {
    cursor: pointer;
  }
}

.bottom-right-control {
  position: absolute;
  right: 16px;
  bottom: 16px;
}

.video-button {
  margin-left: 8px;
}

.time-slider-container {
  ::v-deep .el-tabs__header {
    margin: 0px;
    border-bottom: 1px solid rgb(144, 147, 153);
  }

  ::v-deep .el-tabs__content {
    border-left: 1px solid rgb(144, 147, 153);
    border-bottom: 1px solid rgb(144, 147, 153);
    border-right: 1px solid rgb(144, 147, 153);
    border-radius: 0px 0px 4px 4px;
    background-color: white;
  }

  ::v-deep .el-tabs--card {
    > .el-tabs__header {
      .el-tabs__nav {
        border: 1px solid rgb(144, 147, 153);
        border-bottom: none;
        border-radius: 4px 4px 0px 0px;
        background-color: white;
      }

      .el-tabs__item {
        height: 24px;
        line-height: 24px;
        padding: 0 8px !important;
        border-bottom: 1px solid;
        border-left: 1px solid rgb(144, 147, 153);
        &:first-child {
          border-left: none;
        }
        &.is-active {
          border-bottom: 1px solid white;
          color: rgb(48, 49, 51);
        }
        &:hover {
          color: #8300bf;
        }
      }
    }
  }
}

::v-deep .scaffold-popper {
  padding: 6px 4px;
  font-size: 12px;
  color: rgb(48, 49, 51);
  background-color: #f3ecf6;
  border: 1px solid rgb(131, 0, 191);
  white-space: nowrap;
  min-width: unset;
  pointer-events: none;

  &.left-popper {
    .popper__arrow {
      border-left-color: #8300bf !important;
      &:after {
        border-left-color: #f3ecf6 !important;
      }
    }
  }

  &.right-popper {
    .popper__arrow {
      border-right-color: #8300bf !important;
      &:after {
        border-right-color: #f3ecf6 !important;
      }
    }
  }

  &.el-popper[x-placement^="top"] {
    .popper__arrow {
      border-top-color: #8300bf !important;
      &:after {
        border-top-color: #f3ecf6 !important;
      }
    }
  }
}

::v-deep .el-slider__button {
  border: 2px solid #8300bf;
}

::v-deep .el-slider__bar {
  background-color: #8300bf;
  height: 10px;
}

::v-deep .popper-zoomout {
  padding-right: 11px;
  left: -21px !important;
  .popper__arrow {
    left: 53px !important;
  }
}

::v-deep .el-loading-spinner {
  i, .el-loading-text {
    color: #8300bf;
  }
}

.select-box {
  width: 57px;
  border-radius: 4px;
  border: 1px solid rgb(144, 147, 153);
  background-color: var(--white);
  font-weight: 500;
  color: rgb(48, 49, 51);
  margin-left: 8px;

  ::v-deep .el-input__inner {
    color: rgb(131, 0, 191);
    height: 22px;
    padding-left: 8px;
    padding-right: 8px;
    border: none;
    font-family: "Asap", sans-serif;
    line-height:22px;
  }

  ::v-deep .el-input,
  ::v-deep .el-input__icon {
    line-height: 22px;
  }
}

</style>

<style scoped src="../styles/purple/button.css">
</style>
<style scoped src="../styles/purple/select.css">
</style>
<style scoped src="../styles/purple/slider.css">
</style>
<style scoped src="../styles/purple/loading.css">
</style>
<style scoped src="../styles/purple/tabs.css">
</style>
<style scoped src="../styles/purple/tab-pane.css">
</style>
<style>
.time-slider-tooltip {
  padding: 6px 4px !important;
  font-family: "Asap", sans-serif;
  font-size: 12px !important;
  color: rgb(48, 49, 51) !important;
  background-color: #f3ecf6 !important;
  border: 1px solid #8300bf !important;
  white-space: nowrap !important;
  min-width: unset !important;
}

.scaffold_viewer_dropdown .el-select-dropdown__item {
  white-space: nowrap;
  text-align: left;
  font-family: "Asap", sans-serif;
}
</style>
