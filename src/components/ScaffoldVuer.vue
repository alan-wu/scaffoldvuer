<template>
  <div
    ref="scaffoldContainer"
    v-loading="loading"
    class="scaffold-container"
    element-loading-text="Loading..."
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.3)"
  >
    <map-svg-sprite-color />
    <scaffold-tooltip
      :label="tData.label"
      :region="tData.region"
      :visible="tData.visible"
      :x="tData.x"
      :y="tData.y"
    />
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
        @mouseover="showHelpText(6)"
        @mouseout="hideHelpText(6)"
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
      <tree-controls
        ref="treeControls"
        v-popover:checkBoxPopover
        :help-mode="helpMode"
        :show-colour-picker="showColourPicker"
        @object-selected="objectSelected"
        @object-hovered="objectHovered"
        @drawer-toggled="drawerToggled"
      />
      <div class="opacity-box">
        <opacity-controls ref="opacityControl" />
      </div>
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
              <map-svg-icon
                v-if="isPlaying"
                icon="pause"
                class="icon-button video-button"
                @click.native="play(false)"
              />
              <map-svg-icon
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
          <map-svg-icon
            slot="reference"
            icon="zoomIn"
            class="icon-button zoomIn"
            @click.native="zoomIn()"
            @mouseover.native="showHelpText(0)"
            @mouseout.native="hideHelpText(0)"
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
          <map-svg-icon
            slot="reference"
            icon="zoomOut"
            class="icon-button zoomOut"
            @click.native="zoomOut()"
            @mouseover.native="showHelpText(1)"
            @mouseout.native="hideHelpText(1)"
          />
        </el-popover>
        <el-popover
          v-model="hoverVisabilities[2].value"
          placement="top"
          :append-to-body="false"
          trigger="manual"
          popper-class="scaffold-popper non-selectable"
        >
          <div>
            Fit to
            <br>
            window
          </div>
          <map-svg-icon
            slot="reference"
            icon="fitWindow"
            class="icon-button fitWindow"
            @click.native="fitWindow()"
            @mouseover.native="showHelpText(2)"
            @mouseout.native="hideHelpText(2)"
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
        <map-svg-icon
          slot="reference"
          v-popover:backgroundPopover
          icon="changeBckgd"
          class="icon-button background-colour"
          :class="{ open: drawerOpen, close: !drawerOpen }"
          @mouseover.native="showHelpText(3)"
          @mouseout.native="hideHelpText(3)"
        />
      </el-popover>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import OpacityControls from "./OpacityControls";
import ScaffoldTooltip from "./ScaffoldTooltip";
import TreeControls from "./TreeControls";
import { MapSvgIcon, MapSvgSpriteColor } from "@abi-software/svg-sprite";
import { findObjectsWithNames } from "../scripts/utilities.js";
import {
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
Vue.use(Col);
Vue.use(Loading.directive);
Vue.use(Option);
Vue.use(Popover);
Vue.use(Row);
Vue.use(Select);
Vue.use(Slider);
Vue.use(TabPane);
Vue.use(Tabs);

const OrgansViewer = require("../scripts/organsRenderer").OrgansViewer;
const EventNotifier = require("../scripts/eventNotifier").EventNotifier;

/**
 * A vue component of the scaffold viewer.
 *
 * @requires ./OpacityControls.vue
 * @requires ./TreeControls.vue
 */
export default {
  name: "ScaffoldVuer",
  components: {
    MapSvgIcon,
    MapSvgSpriteColor,
    OpacityControls,
    ScaffoldTooltip,
    TreeControls,
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
      default: ""
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
      default: false
    },
    /**
     * Show/hide minimap.
     */
    displayMinimap: {
      type: Boolean,
      default: false
    },
    /**
     * Format of the input URL
     */
    format: {
      type: String,
      default: "metadata"
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
      timeStamps: {},
      defaultCheckedKeys: [],
      tData: {
        label: "",
        region: "",
        visible: false,
        x: 200,
        y: 200,
      },
      fileFormat: "metadata"
    };
  },
  watch: {
    format: {
      handler: function(value) {
        this.fileFormat = value;
      },
      immediate: true
    },
    url: {
      handler: function(newValue) {
        if (this.state === undefined || this.state.url === undefined)
          this.setURL(newValue);
      },
      immediate: true
    },
    region: {
      handler: function(region) {
        if (!(this.state || this.viewURL)) this.setFocusedRegion(region);
      },
      immediate: true
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
      immediate: true
    },
    helpMode: function(val) {
      this.setHelpMode(val);
    },
    displayMarkers: function(val) {
      this.$module.scene.displayMarkers = val;
      //Update pickable objects
      this.$module.scene.forcePickableObjectsUpdate = true;
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
    this.selectedObjects = [];
    this.hoveredObjects = [];
    this.currentBackground = "white";
    this._currentURL = undefined;
    this.availableBackground = ["white", "black", "lightskyblue"];
  },
  mounted: function() {
    this.$refs.treeControls.setModule(this.$module);
    let eventNotifier = new EventNotifier();
    eventNotifier.subscribe(this, this.eventNotifierCallback);
    this.$module.addNotifier(eventNotifier);
    this.$module.addOrganPartAddedCallback(this.zincObjectAdded);
    this.$module.initialiseRenderer(this.$refs.display);
    this.toggleRendering(this.render);
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
     * This is called when a new zinc object is read into the scene.
     */
    zincObjectAdded: function(zincObject) {
      this.loading = false;
      this.$emit("zinc-object-added", zincObject);
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
    findObjectsWithGroupName: function(name) {
      let objects = [];
      if (name && name != "" && this.$module.scene) {
        objects = this.$module.scene.findObjectsWithGroupName(name);
      }
      return objects;
    },
    /**
     * Focus on named region
     */
    viewRegion: function(names) {
      const rootRegion = this.$module.scene.getRootRegion();
      const groups = Array.isArray(names) ? names : [names];
      const objects = findObjectsWithNames(rootRegion, groups, "", true);
      let box = this.$module.scene.getBoundingBoxOfZincObjects(objects);
      if (box) {
        if (this.$module.isSyncControl()) {
          this.$module.setSyncControlZoomToBox(box);
        } else {
          const dist = this.$module.scene.camera.far - this.$module.scene.camera.near;
          this.$module.scene.viewAllWithBoundingBox(box);
          this.$module.scene.camera.far = this.$module.scene.camera.near + dist;
          this.$module.scene.camera.updateProjectionMatrix();
        }
        return true;
      }
      return false;
    },
    setFocusedRegion: function(name) {
      if (name) {
        if (this.isReady) {
          this.viewRegion(name);
        } else {
          this.$module.setFinishDownloadCallback(
            this.setURLFinishCallback({ region: name })
          );
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
            this.setURLFinishCallback({ viewURL: viewURL })
          );
        }
      }
    },
    getRendererInfo: function() {
      if (this.$module.zincRenderer) {
        return this.$module.zincRenderer.getThreeJSRenderer().info;
      }
      return undefined;
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
     * 
     */
    eventNotifierCallback: function(event) {
      const names = [];
      let zincObjects = [];
      const region = undefined;
      if (event.eventType == 1 || event.eventType == 2) {
        event.identifiers.forEach(identifier => {
          if (identifier) {
            let id = identifier.data.id
              ? identifier.data.id
              : identifier.data.group;
            names.push(id);
          }
        });
        zincObjects = event.zincObjects;
      }
      /*
       * Event Type 1: Selected
       * Event Type 2: Highlighted
       * Event Type 1: Move
       */
      if (event.eventType == 1) {
        if (this.$refs.treeControls) {
          if (names.length > 0) {
            //this.$refs.treeControls.changeActiveByNames(names, region, false);
            this.$refs.treeControls.updateActiveUI(zincObjects);
          } else {
            this.$refs.treeControls.removeActive(true)
          }
        }
        // Triggers when an object has been selected
        this.$emit("scaffold-selected", event.identifiers);
      } else if (event.eventType == 2) {
        this.hideRegionTooltip();
       // const offsets = this.$refs.scaffoldContainer.getBoundingClientRect();
        if (this.$refs.treeControls) {
          if (names.length > 0) {
            //this.$refs.treeControls.changeHoverByNames(names, region, false);
            this.$refs.treeControls.updateHoverUI(zincObjects);
          } else {
            this.$refs.treeControls.removeHover(true);
          }
        }
        if ((event.identifiers.length > 0) && event.identifiers[0]) {
          let id = event.identifiers[0].data.id
            ? event.identifiers[0].data.id
            : event.identifiers[0].data.group;
          if (event.identifiers[0].coords) {
            this.tData.visible = true;
            this.tData.label = id;
            if (event.identifiers[0].data.region)
              this.tData.region = event.identifiers[0].data.region;
            else
              this.tData.region = "Root";
            this.tData.x = event.identifiers[0].coords.x;
            this.tData.y  = event.identifiers[0].coords.y;
          }
        }
        // Triggers when an object has been highlighted
        this.$emit("scaffold-highlighted", event.identifiers);
      } else if (event.eventType == 3)  { //MOVE
        if ((event.identifiers.length > 0) && event.identifiers[0]) {
          if (event.identifiers[0].coords) {
            const offsets = this.$refs.scaffoldContainer.getBoundingClientRect();
            this.tData.x = event.identifiers[0].coords.x - offsets.left;
            this.tData.y = event.identifiers[0].coords.y - offsets.top;
          }
        }
      }
    },
    /**
     * Get the coordinates of the current selected region.
     *
     * @public
     */
    getCoordinatesOfSelected: function() {
      if (this.selectedObjects && this.selectedObjects.length > 0) {
        return this.$module.scene.getObjectsScreenXY([this.selectedObjects]);
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
     * A callback used by children components. Set the selected zinc object
     *
     * @param {object} object Zinc object
     */
    objectSelected: function(objects, propagate) {
      this.selectedObjects = objects;
      if (this.selectedObjects)
        this.$refs.opacityControl.setObject(this.selectedObjects[0]);
      if (objects) this.$module.setSelectedByZincObjects(objects, undefined, propagate);
      else this.$module.setSelectedByObjects([], undefined, propagate);
    },
    /**
     * A callback used by children components. Set the highlighted zinc object
     *
     * @param {object} object Zinc object
     */
    objectHovered: function(objects, propagate) {
      this.hoveredObjects = objects;
      if (objects) this.$module.setHighlightedByZincObjects(objects, undefined, propagate);
      else this.$module.setHighlightedByObjects([], undefined, propagate);
    },
    /**
     * Set the selected by name.
     *
     * @param {} name Name of the group
     */
    changeActiveByName: function(names, region, propagate) {
      const isArray = Array.isArray(names);
      if (names === undefined || (isArray && names.length === 0)) {
        this.$refs.treeControls.removeActive(propagate);
      } else {
        let array = names;
        if (!isArray)
          array = [array];
        this.$refs.treeControls.changeActiveByNames(array, region, propagate);
      }
    },
    /**
     * Set the highlighted by name.
     *
     * @param {name} name Name of the group
     */
    changeHighlightedByName: function(names, region, propagate) {
      const isArray = Array.isArray(names);
      if (names === undefined || (isArray && names.length === 0)) {
        this.$refs.treeControls.removeHover(propagate);
      } else {
        let array = names;
        if (!isArray)
          array = [array];
        this.$refs.treeControls.changeHoverByNames(array, region, propagate);
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
      //Hide tooltip as location may
      //this.hideRegionTooltip();
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
     * Callback function used by showRegionTooltip in the case when the tooltip
     * is out of view.
     */
    displayTooltipOfObjectsCallback: function(name, objects, resetView, liveUpdates) {
      const instance = this;
      return function() {
        instance.$module.zincRenderer.removePostRenderCallbackFunction(instance.$_regionTooltipCallback);
        instance.$_regionTooltipCallback = undefined;
        instance.displayTooltipOfObjects(name, objects, resetView, liveUpdates);
      }
    },
    liveUpdateTooltipPosition: function() {
      if (this.$module.selectedCenter) {
        this.tData.x = this.$module.selectedScreenCoordinates.x;
        this.tData.y = this.$module.selectedScreenCoordinates.y;
      }
    },
    displayTooltipOfObjects: function(name, objects, resetView, liveUpdates) {
      if (objects.length > 0) {
        let coords = objects[0].getClosestVertexDOMElementCoords(this.$module.scene);
        if (coords) {
          //The coords is not in view, view all if resetView flag is true
          if (!coords.inView) {
            this.hideRegionTooltip();
            if (resetView) {
              this.$module.scene.viewAll();
              //Use the post render callback to make sure the scene has been updated
              //before getting the position of the tooltip.
              if (this.$_regionTooltipCallback) {
                this.$module.zincRenderer.removePostRenderCallbackFunction(this.$_regionTooltipCallback);
              }
              this.$_regionTooltipCallback = 
                this.$module.zincRenderer.addPostRenderCallbackFunction(
                  this.displayTooltipOfObjectsCallback(name, objects, resetView, liveUpdates)
                );
            }
          } else {
            this.tData.visible = true;
            this.tData.label = name;
            this.tData.x = coords.position.x;
            this.tData.y = coords.position.y;
            const regionPath = objects[0].getRegion().getFullPath();
            if (regionPath)
              this.tData.region = regionPath;
            else
              this.tData.region = "Root";
            if (liveUpdates) {
              this.$module.setupLiveCoordinates(objects);
              if (this.$_liveCoordinatesUpdated) {
                this.$module.zincRenderer.removePostRenderCallbackFunction(this.$_liveCoordinatesUpdated);
              }
              this.$_liveCoordinatesUpdated = 
                this.$module.zincRenderer.addPostRenderCallbackFunction(
                  this.liveUpdateTooltipPosition);
            }
          }
          return true;
        }
      }
      this.hideRegionTooltip();
      return false;
    },
    /**
     * Display the tooltip. When resetView is set to true, it will 
     * reset view if the tooltip is not in view.
     * Setting liveUpdates to true will update the tooltip location 
     * at every rendering loop.
     */
    showRegionTooltip: function(name, resetView, liveUpdates) {
      if (name && this.$module.scene) {
        const rootRegion = this.$module.scene.getRootRegion();
        const groups = [name];
        const objects = findObjectsWithNames(rootRegion, groups, "", true);
        return this.displayTooltipOfObjects(name, objects, resetView, liveUpdates);
      }
      this.hideRegionTooltip();
      return false;
    },
    hideRegionTooltip: function() {
      if (this.$_liveCoordinatesUpdated) {
        this.$module.zincRenderer.removePostRenderCallbackFunction(this.$_liveCoordinatesUpdated);
        //Unset the tracking
        this.$module.setupLiveCoordinates(undefined);
      }
      this.tData.visible = false;
      this.tData.region = "Root";
    },
    /**
     * This is called when mouse cursor enters supported elements
     * with help tootltips.
     */
    showHelpText: function(helpTextNumber) {
      if (!this.inHelp) {
        this.helpTextWait = setTimeout(() => {
          this.hoverVisabilities[helpTextNumber].value = true;
        }, 500);
      }
    },
    /**
     * This is called when mouse cursor exits supported element..
     */
    hideHelpText: function(helpTextNumber) {
      if (!this.inHelp) {
        this.hoverVisabilities[helpTextNumber].value = false;
        clearTimeout(this.helpTextWait);
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
          } else if (options.region && options.region !== "") {
            this.viewRegion(options.region);
          }
          if (options.visibility) {
            // Some UIs may not be ready at this time.
            this.$nextTick(() => {
              this.$refs.treeControls.setState(options.visibility);
            });
          }
        }
        this.updateSettingsfromScene();
        this.$module.updateTime(0.01);
        this.$module.updateTime(0);
        this.$module.unsetFinishDownloadCallback();
        this.$emit("on-ready");
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
        format: this.fileFormat,
        url: this._currentURL,
        viewport: undefined,
        visibility: undefined,
      };
      if (this.$refs.treeControls)
        state.visibility = this.$refs.treeControls.getState();
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
          this.setURLAndState(state.url, {
            fileFormat: state.fileFormat,
            viewport: state.viewport,
            visibility: state.visibility
          });
        } else {
          if (state.viewport || state.visibility) {
            if (this.isReady && this.$module.scene) {
              if (state.viewport)
                this.$module.scene
                  .getZincCameraControls()
                  .setCurrentCameraSettings(state.viewport);
              if (state.visibility)
                this.$refs.treeControls.setState(state.visibility);
            } else {
              this.$module.setFinishDownloadCallback(
                this.setURLFinishCallback({
                  viewport: state.viewport,
                  visibility: state.visibility
                })
              );
            }
          }
        }
      }
    },
    exportGLTF: function(binary) {
      return this.$module.scene.exportGLTF(binary);
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
        if (state && state.format) this.fileFormat = state.format;
        let viewport = state && state.viewport ? state.viewport : undefined;
        let visibility =
          state && state.visibility ? state.visibility : undefined;
        this._currentURL = newValue;
        if (this.$refs.treeControls)
          this.$refs.treeControls.clear();
        this.loading = true;
        this.isReady = false;
        this.$module.setFinishDownloadCallback(
          this.setURLFinishCallback({
            viewport: viewport,
            region: this.region,
            viewURL: this.viewURL,
            visibility: visibility
          })
        );
        if (this.fileFormat === "gltf") {
          this.$module.loadGLTFFromURL(newValue, "scene", true);
        } else {
          this.$module.loadOrgansFromURL(
            newValue,
            undefined,
            undefined,
            "scene",
            undefined,
            true
          );
        }
        this.$module.scene.displayMarkers = this.displayMarkers;
        this.$module.scene.forcePickableObjectsUpdate = true;
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
    },
    syncControlCallback: function() {
      const payload = this.$module.NDCCameraControl.getPanZoom();
      if (this.tData.visible) {
        this.showRegionTooltip(this.tData.label);
      }
      this.$emit("scaffold-navigated", payload);
    },
    /** 
     * Rotate mode - "none", "horizontal", "vertical", "free" but
     * it will be ignored if flag is set to false.
     */
    toggleSyncControl: function(flag, rotateMode) {
      this.$module.toggleSyncControl(flag, rotateMode);
      this.$module.setSyncControlCallback(this.syncControlCallback);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "~element-ui/packages/theme-chalk/src/col";
@import "~element-ui/packages/theme-chalk/src/loading";
@import "~element-ui/packages/theme-chalk/src/option";
@import "~element-ui/packages/theme-chalk/src/popover";
@import "~element-ui/packages/theme-chalk/src/row";
@import "~element-ui/packages/theme-chalk/src/select";
@import "~element-ui/packages/theme-chalk/src/slider";
@import "~element-ui/packages/theme-chalk/src/tabs";
@import "~element-ui/packages/theme-chalk/src/tab-pane";

.warning-icon {
  position: absolute;
  top: 15px;
  left: 37px;
  text-align: left;
  font-size: 25px;
  color: $warning;

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
  background-color: $warning;

  &.right-popper {
    .popper__arrow {
      &::after {
        border-right-color: $warning !important;
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

.tab-content ::v-deep .el-slider__stop {
  width: 10px;
  height: 10px;
  top: -1px;
  border: solid 1px $app-primary-color;
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
    color: $app-primary-color;
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

::v-deep .non-selectable {
  user-select: none;
}

::v-deep .background-popper {
  padding: 5px 12px;
  background-color: #ffffff;
  border: 1px solid $app-primary-color;
  box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.06);
  height: 72px;
  width: 128px;
  min-width: 128px;

  &.el-popper[x-placement^="top"] {
    .popper__arrow {
      border-top-color: $app-primary-color !important;
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
    border: 2px solid $app-primary-color;
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

  .el-row {
    margin-bottom: 5px;
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
          color: $app-primary-color;
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
  border: 1px solid $app-primary-color;
  white-space: nowrap;
  min-width: unset;
  pointer-events: none;

  &.left-popper {
    .popper__arrow {
      border-left-color: $app-primary-color !important;
      &:after {
        border-left-color: #f3ecf6 !important;
      }
    }
  }

  &.right-popper {
    .popper__arrow {
      border-right-color: $app-primary-color !important;
      &:after {
        border-right-color: #f3ecf6 !important;
      }
    }
  }

  &.el-popper[x-placement^="top"] {
    .popper__arrow {
      border-top-color: $app-primary-color !important;
      &:after {
        border-top-color: #f3ecf6 !important;
      }
    }
  }
}

::v-deep .el-slider__button {
  border: 2px solid $app-primary-color;
}

::v-deep .el-slider__bar {
  background-color: $app-primary-color;
  height: 10px;
}

::v-deep .el-loading-spinner {
  i, .el-loading-text {
    color: $app-primary-color;
  }
}

::v-deep .popper-zoomout {
  padding-right: 11px;
  left: -21px !important;
  .popper__arrow {
    left: 53px !important;
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
    color: $app-primary-color;
    height: 22px;
    padding-left: 8px;
    padding-right: 8px;
    border: none;
    font-family: "Asap", sans-serif;
    line-height: 22px;
  }

  ::v-deep .el-input,
  ::v-deep .el-input__icon {
    line-height: 22px;
  }
}
</style>

<style lang="scss">
.time-slider-tooltip {
  padding: 6px 4px !important;
  font-family: "Asap", sans-serif;
  font-size: 12px !important;
  color: rgb(48, 49, 51) !important;
  background-color: #f3ecf6 !important;
  border: 1px solid $app-primary-color !important;
  white-space: nowrap !important;
  min-width: unset !important;
}

.scaffold_viewer_dropdown .el-select-dropdown__item {
  white-space: nowrap;
  text-align: left;
  font-family: "Asap", sans-serif;
}

.opacity-box {
  right: 0px;
  bottom:200px;
  position:absolute;
}
</style>
