<template>
  <div
    ref="scaffoldContainer"
    v-loading="loading"
    class="scaffold-container"
    element-loading-text="Loading..."
    element-loading-background="rgba(0, 0, 0, 0.3)"
  >
    <map-svg-sprite-color />
    <scaffold-tooltip
      :createData="createData"
      :label="tData.label"
      :region="tData.region"
      :visible="tData.visible"
      :x="tData.x"
      :y="tData.y"
      :annotationDisplay="viewingMode === 'Annotation' && tData.active === true"
      @confirm-create="confirmCreate($event)"
      @cancel-create="cancelCreate()"
    />
    <div
      id="organsDisplayArea"
      ref="display"
      tabindex="-1"
      style="height: 100%; width: 100%"
      @keydown.66="backgroundChangeCallback"
    />
    <div v-show="displayUI && !isTransitioning">
      <div
        class="bottom-draw-control"
        v-if="viewingMode === 'Annotation'"
      >
        <el-popover
          content="Comment"
          placement="top"
          :teleported="false"
          trigger="manual"
          width="80"
          popper-class="flatmap-popper"
          :visible="hoverVisibilities[9].value"
        >
          <template #reference>
            <map-svg-icon
              icon="comment"
              class="icon-button shape"
              :class="[createData.shape === '' ? 'active' : '']"
              @click="toggleDrawing('')"
              @mouseover="showHelpText(9)"
              @mouseout="hideHelpText(9)"
            />
          </template>
        </el-popover>
        <el-popover
          content="Draw Point"
          placement="top"
          :teleported="false"
          trigger="manual"
          width="80"
          popper-class="flatmap-popper"
          :visible="hoverVisibilities[10].value"
        >
          <template #reference>
            <map-svg-icon
              icon="drawPoint"
              class="icon-button shape"
              :class="[createData.shape === 'Point' ? 'active' : '']"
              @click="toggleDrawing('Point')"
              @mouseover="showHelpText(10)"
              @mouseout="hideHelpText(10)"
            />
          </template>
        </el-popover>
        <el-popover
          content="Draw Line"
          placement="top"
          :teleported="false"
          trigger="manual"
          width="80"
          popper-class="flatmap-popper"
          :visible="hoverVisibilities[11].value"
        >
          <template #reference>
            <map-svg-icon
              icon="drawLine"
              class="icon-button shape"
              :class="[createData.shape === 'Line' ? 'active' : '']"
              @click="toggleDrawing('Line')"
              @mouseover="showHelpText(11)"
              @mouseout="hideHelpText(11)"
            />
          </template>
        </el-popover>
      </div>
      <el-popover
        v-if="displayWarning"
        ref="warningPopover"
        :visible="hoverVisibilities[6].value"
        :content="warningMessage"
        placement="right"
        :teleported="false"
        popper-class="scaffold-popper message-popper right-popper non-selectable"
      >
        <template #reference>
          <div
            v-if="displayWarning"
            class="message-icon warning-icon"
            @mouseover="showHelpText(6)"
            @mouseout="hideHelpText(6)"
          >
            <el-icon><el-icon-warning-filled /></el-icon>
            <span class="message-text">Beta</span>
          </div>
        </template>
      </el-popover>
      <el-popover
        v-if="displayLatestChanges"
        :visible="hoverVisibilities[7].value"
        :content="latestChangesMessage"
        placement="right"
        :teleported="false"
        trigger="manual"
        popper-class="scaffold-popper message-popper right-popper non-selectable"
      >
        <template #reference>
          <div
            v-if="displayLatestChanges && latestChangesMessage"
            class="el-icon-warning message-icon latest-changesicon"
            @mouseover="showHelpText(7)"
            @mouseout="hideHelpText(7)"
          >
            <el-icon><el-icon-warning-filled /></el-icon>
            <span class="message-text">What's new?</span>
          </div>
        </template>
      </el-popover>
      <el-popover
        :visible="hoverVisibilities[5].value"
        content="Change region visibility"
        placement="right"
        :teleported="false"
        trigger="manual"
        popper-class="scaffold-popper right-popper non-selectable"
      >
        <template #reference>
          <tree-controls
            ref="treeControls"
            :help-mode="helpMode"
            :isReady="isReady"
            :show-colour-picker="showColourPicker"
            @object-selected="objectSelected"
            @object-hovered="objectHovered"
            @drawer-toggled="drawerToggled"
          />
        </template>
      </el-popover>
      <div class="primitive-controls-box">
        <primitive-controls ref="primitiveControls" />
      </div>
      <el-popover
        v-if="timeVarying"
        ref="sliderPopover"
        :visible="hoverVisibilities[4].value"
        content="Move the slider to animate the region"
        placement="top"
        :teleported="false"
        trigger="manual"
        popper-class="scaffold-popper top-popper non-selectable"
      >
        <template #reference>
          <div
            v-if="timeVarying"
            class="time-slider-container"
            :class="[minimisedSlider ? 'minimised' : '', sliderPosition]"
          >
            <el-tabs type="card">
              <el-tab-pane label="Animate scaffold">
                <el-row class="tab-content">
                  <map-svg-icon
                    v-if="isPlaying"
                    icon="pause"
                    class="icon-button video-button"
                    @click="play(false)"
                  />
                  <map-svg-icon
                    v-else
                    icon="play"
                    class="video-button icon-button"
                    @click="play(true)"
                  />
                  <el-slider
                    :min="0"
                    :max="timeMax"
                    :model-value="currentTime / 100 * timeMax"
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
                      :teleported="true"
                      :model-value="currentSpeed"
                      placeholder="Select"
                      class="scaffold-select-box speed"
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
        </template>
      </el-popover>
      <div class="bottom-right-control">
        <el-popover
          :visible="hoverVisibilities[0].value"
          content="Zoom in"
          placement="left"
          :teleported="false"
          trigger="manual"
          popper-class="scaffold-popper left-popper non-selectable"
        >
          <template #reference>
            <map-svg-icon
              icon="zoomIn"
              class="icon-button zoomIn"
              @click="zoomIn()"
              @mouseover="showHelpText(0)"
              @mouseout="hideHelpText(0)"
            />
          </template>
        </el-popover>
        <el-popover
          :visible="hoverVisibilities[1].value"
          content="Zoom out"
          placement="top-end"
          :teleported="false"
          trigger="manual"
          popper-class="scaffold-popper popper-zoomout non-selectable"
        >
          <template #reference>
            <map-svg-icon
              icon="zoomOut"
              class="icon-button zoomOut"
              @click="zoomOut()"
              @mouseover="showHelpText(1)"
              @mouseout="hideHelpText(1)"
            />
          </template>
        </el-popover>
        <el-popover
          :visible="hoverVisibilities[2].value"
          placement="top"
          :teleported="false"
          trigger="manual"
          popper-class="scaffold-popper non-selectable"
        >
          <div>
            Fit to
            <br />
            window
          </div>
          <template #reference>
            <map-svg-icon
              icon="fitWindow"
              class="icon-button fitWindow"
              @click="fitWindow()"
              @mouseover="showHelpText(2)"
              @mouseout="hideHelpText(2)"
            />
          </template>
        </el-popover>
      </div>
      <el-popover
        v-if="openMapRef"
        ref="open-map-popover"
        :virtual-ref="openMapRef"
        placement="top-start"
        width="128"
        :teleported="false"
        trigger="click"
        popper-class="open-map-popper"
        virtual-triggering
      >
        <el-row v-for="item in openMapOptions" :key="item.key">
          <el-button
            type="primary"
            plain
            @click="$emit('open-map', item.key)"
          >
            {{ item.display }}
          </el-button>
        </el-row>
      </el-popover>
      <el-popover
        ref="backgroundPopover"
        :virtual-ref="backgroundIconRef"
        placement="top-start"
        width="128"
        :teleported="false"
        trigger="click"
        popper-class="background-popper non-selectable"
        virtual-triggering
      >
        <div>
          <el-row class="backgroundText">Viewing Mode</el-row>
          <el-row class="backgroundControl">
            <el-select
              :teleported="false"
              v-model="viewingMode"
              placeholder="Select"
              class="scaffold-select-box viewing-mode"
              popper-class="scaffold_viewer_dropdown"
              @mode="viewingModeChange"
            >
              <el-option v-for="item in viewingModes" :key="item" :label="item" :value="item">
                <el-row>
                  <el-col :span="12">{{ item }}</el-col>
                </el-row>
              </el-option>
            </el-select>
          </el-row>
          <el-row class="backgroundSpacer"></el-row>
          <el-row class="backgroundText"> Change background </el-row>
          <el-row class="backgroundChooser">
            <div
              v-for="item in availableBackground"
              :key="item"
              :class="[
                'backgroundChoice',
                item,
                item == currentBackground ? 'active' : '',
              ]"
              @click="backgroundChangeCallback(item)"
            />
          </el-row>
        </div>  
      </el-popover>
      <div
        class="settings-group"
        :class="{ open: drawerOpen, close: !drawerOpen }"
      >
        <el-row>
          <el-popover
            :visible="hoverVisibilities[8].value"
            content="Open new map"
            placement="right"
            :teleported="false"
            trigger="manual"
            popper-class="scaffold-popper right-popper non-selectable"
          >
            <template #reference>
              <map-svg-icon
                v-if="enableOpenMapUI && openMapOptions.length > 0"
                ref="openMapRef"
                icon="openMap"
                class="icon-button open-map-button"
                @mouseover="showHelpText(8)"
                @mouseout="hideHelpText(8)"
              />
            </template>
          </el-popover>
        </el-row>
        <el-row>
          <el-popover
            :visible="hoverVisibilities[3].value"
            content="Change background color"
            placement="right"
            :teleported="false"
            trigger="manual"
            popper-class="scaffold-popper right-popper non-selectable"
          >
            <template #reference>
              <map-svg-icon
                ref="backgroundIconRef"
                icon="changeBckgd"
                class="icon-button"
                @mouseover="showHelpText(3)"
                @mouseout="hideHelpText(3)"
              />
            </template>
          </el-popover>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import { toRef, shallowRef } from 'vue'
import {
  WarningFilled as ElIconWarningFilled,
  ArrowDown as ElIconArrowDown,
  ArrowLeft as ElIconArrowLeft,
} from '@element-plus/icons-vue'
import PrimitiveControls from "./PrimitiveControls.vue";
import ScaffoldTooltip from "./ScaffoldTooltip.vue";
import TreeControls from "./TreeControls.vue";
import { MapSvgIcon, MapSvgSpriteColor } from "@abi-software/svg-sprite";
import { findObjectsWithNames, getObjectsFromAnnotations } from "../scripts/Utilities.js";

import { SearchIndex } from "../scripts/Search.js";
import {
  ElButton as Button,
  ElCol as Col,
  ElLoading as Loading,
  ElOption as Option,
  ElPopover as Popover,
  ElRow as Row,
  ElSelect as Select,
  ElSlider as Slider,
  ElTabPane as TabPane,
  ElTabs as Tabs,
} from "element-plus";
import { OrgansViewer } from "../scripts/OrgansRenderer.js";
import { EventNotifier } from "../scripts/EventNotifier.js";
import { AnnotationService } from '@abi-software/sparc-annotation';

/**
 * A vue component of the scaffold viewer.
 *
 * @requires ./PrimitveControls.vue
 * @requires ./TreeControls.vue
 */
export default {
  name: "ScaffoldVuer",
  components: {
    Button,
    Col,
    Loading,
    Option,
    Popover,
    Row,
    Select,
    Slider,
    TabPane,
    Tabs,
    MapSvgIcon,
    MapSvgSpriteColor,
    PrimitiveControls,
    ScaffoldTooltip,
    TreeControls,
    ElIconWarningFilled,
    ElIconArrowDown,
    ElIconArrowLeft,
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
      default: "",
    },
    /**
     * Show the colour control of set to true.
     */
    showColourPicker: {
      type: Boolean,
      default: false,
    },
    /**
     * Flag to show/hide the UI.
     */
    displayUI: {
      type: Boolean,
      default: true,
    },
    /**
     * Display all graphics at start.
     *
     * This setting only works when traditional is set to false.
     */
    displayAtStartUp: {
      type: Boolean,
      default: true,
    },
    /**
     * Use for toggling the help tooltips.
     */
    helpMode: {
      type: Boolean,
      default: false,
    },
    /**
     * Use for show/display beta warning icon.
     */
    displayWarning: {
      type: Boolean,
      default: true,
    },
    /**
     * Warning message for the hovered over text
     * on the warning icon.
     */
    warningMessage: {
      type: String,
      default: "Beta feature - under active development",
    },
    displayLatestChanges: {
      type: Boolean,
      default: false,
    },
    latestChangesMessage: {
      type: String,
      default: "New feature - Local search is now available",
    },
    /**
     * Show/hide pickable markers for regions.
     */
    displayMarkers: {
      type: Boolean,
      default: false,
    },
    markerLabels : {
      type: Array,
      default: function () {
        return []
      }
    },
    /**
     * Show/hide minimap.
     */
    displayMinimap: {
      type: Boolean,
      default: false,
    },
    /**
     * Format of the input URL
     */
    format: {
      type: String,
      default: "metadata",
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
        };
      },
    },
    /**
     * Flag to determine rather the open map UI icon and popup
     * should be shown or not.
     */
    enableOpenMapUI: {
      type: Boolean,
      default: false,
    },
    /**
     * This array populate the the openMapOptions popup.
     * Each entry contains a pair of display and key.
     */
    openMapOptions: {
      type: Array,
      default: function () {
        return [
          {
            display: "Open AC Map",
            key: "AC"
          },
          {
            display: "Open FC Map",
            key: "FC"
          },
          {
            display: "Open 3D Human Map",
            key: "3D"
          },
        ]
      },
    },
    /**
     * State containing state of the scaffold.
     */
    state: {
      type: Object,
      default: undefined,
    },
    /**
     * Optional prop for the name of the region to focus on,
     * this option is ignored if state or viewURL is also provided.
     */
    region: {
      type: String,
      default: "",
    },
    /**
     * Optional prop for an URL of containing information of a viewport.
     * This option is ignored if state is also provided.
     * It will use the provided URL as base if a relative parth is provided.
     */
    viewURL: {
      type: String,
      default: "",
    },
    /**
     * Settings for turning on/off rendering
     */
    render: {
      type: Boolean,
      default: true,
    },
    /**
     * Specify the endpoint of the flatmap server.
     * This is used by annotation service included in
     * third party flatmapvuer library.
     */
    flatmapAPI: {
      type: String,
      default: "https://mapcore-demo.org/current/flatmap/v3/"
    },
  },
  provide() {
    return {
      flatmapAPI: this.flatmapAPI,
      scaffoldUrl: this.url,
    };
  },
  data: function () {
    return {
      createData: {
        toBeConfirmed: false,
        points: [],
        shape: "",
        x: 0,
        y: 0,
      },
      currentTime: 0.0,
      timeVarying: false,
      isPlaying: false,
      isReady: false,
      /**
       * This is set when scene is transitioning.
       */
      isTransitioning: false,
      tooltipAppendToBody: false,
      hoverVisibilities: [
        { value: false },
        { value: false },
        { value: false },
        { value: false },
        { value: false },
        { value: false },
        { value: false },
        { value: false },
        { value: false },
        { value: false },
        { value: false },
        { value: false },
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
          label: "0.1x",
        },
        {
          value: 0.5,
          label: "0.5x",
        },
        {
          value: 1,
          label: "1x",
        },
        {
          value: 2,
          label: "2x",
        },
        {
          value: 5,
          label: "5x",
        },
        {
          value: 10,
          label: "10x",
        },
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
        active: false,
      },
      fileFormat: "metadata",
      previousMarkerLabels: [],
      viewingMode: "Exploration",
      viewingModes: [
        "Annotation",
        "Exploration",
      ],
      openMapRef: undefined,
      backgroundIconRef: undefined,
    };
  },
  watch: {
    format: {
      handler: function (value) {
        this.fileFormat = value;
      },
      immediate: true,
    },
    url: {
      handler: function (newValue) {
        if (this.state === undefined || this.state.url === undefined)
          this.setURL(newValue);
      },
      immediate: true,
    },
    region: {
      handler: function (region) {
        if (!(this.state || this.viewURL)) this.setFocusedRegion(region);
      },
      immediate: true,
    },
    state: {
      handler: function (state) {
        this.setState(state);
      },
      immediate: true,
      deep: true,
    },
    viewURL: {
      handler: function (viewURL) {
        this.updateViewURL(viewURL);
      },
      immediate: true,
    },
    helpMode: function (val) {
      this.setHelpMode(val);
    },
    displayMarkers: function (val) {
      this.$module.scene.displayMarkers = val;
      //Update pickable objects
      this.$module.scene.forcePickableObjectsUpdate = true;
    },
    displayMinimap: function (val) {
      this.$module.scene.displayMinimap = val;
    },
    currentTime: {
      handler: function () {
        //Emit when time in the current scene has changed
        //@arg Current time in scene
        this.$emit("timeChanged", this.currentTime);
      },
    },
    duration: function () {
      this.$module.scene.setDuration(this.duration);
    },
    minimapSettings: {
      deep: true,
      handler: "updateMinimapScissor",
    },
    render: function (val) {
      this.toggleRendering(val);
    },
    markerLabels: function(labels) {
      this.previousMarkerLabels.forEach((pml)=>{
        this.setMarkerModeForObjectsWithName(pml, "off");
      })
      labels.forEach((l)=>{
        this.setMarkerModeForObjectsWithName(l, "on");
      })
      this.previousMarkerLabels = labels;
    }
  },
  beforeCreate: function () {
    this.$module = new OrgansViewer();
    this.selectedObjects = [];
    this.hoveredObjects = [];
    this.currentBackground = "white";
    this._currentURL = undefined;
    this.availableBackground = ["white", "black", "lightskyblue"];
    this.$_searchIndex = new SearchIndex();
  },
  mounted: function () {
    this.openMapRef = shallowRef(this.$refs.openMapRef);
    this.backgroundIconRef = shallowRef(this.$refs.backgroundIconRef);
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
    this.$module.zincRenderer.addPreRenderCallbackFunction(() => {
      this.currentTime = this.$module.getCurrentTime();
    })
  },
  beforeUnmount: function () {
    if (this.ro) this.ro.disconnect();
    this.$module.destroy();
    this.$module = undefined;
  },
  methods: {
    /**
     * @vuese
     * Call this to manually add a zinc object into the current scene.
     * This will subsequently trigger a zincObjectAdded
     * @arg ZincObject object to be added
     */
    addZincObject: function (zincObject) {
      if (this.$module.scene) {
        // zincObjectAdded will be alled in sequential callback
        this.$module.scene.addZincObject(zincObject);
      }
    },
    /**
     * Internal only.
     * This is called when a new zinc object is read into the scene.
     */
    zincObjectAdded: function (zincObject) {
      this.loading = false;
      this.$_searchIndex.addZincObject(zincObject, zincObject.uuid);
      if (this.timeVarying === false && zincObject.isTimeVarying()) {
        this.timeVarying = true;
      }
      //Emit when a new object is added to the scene
      //@arg The object added to the sceene
      this.$emit("zinc-object-added", zincObject);
    },
    /**
     * Internal only.
     * Add regions to search index.
     */
    addRegionsToSearchIndex: function () {
      const rootRegion = this.$module.scene.getRootRegion();
      const regions = rootRegion.getChildRegions(true);
      regions.forEach(region => {
        this.$_searchIndex.addRegion(region, region.uuid);
      });
    },
    /**
     * Internal only.
     * This is called when Change backgspeedround colour button
     * is pressed an causes the backgrouColornd colour to be changed
     * to one of the three preset colour: white, black and
     * lightskyblue.
     */
    backgroundChangeCallback: function (colour) {
      this.currentBackground = colour;
      this.$module.zincRenderer
        .getThreeJSRenderer()
        .setClearColor(this.currentBackground, 1);
    },
    /**
     * Internal only.
     * This is called by captueeScreenshot and after the last render
     * loop, it download a screenshot of the current scene with no UI.
     */
    captureScreenshotCallback: function () {
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
     * @vuese
     * Function for capturing a screenshot of the current rendering.
     *
     * @arg filename given to the screenshot.
     */
    captureScreenshot: function (filename) {
      this.captureFilename = filename;
      this.captureID = this.$module.zincRenderer.addPostRenderCallbackFunction(
        this.captureScreenshotCallback
      );
    },
    /**
     * @vuese
     * Function to clear current scene, the tree controls and the search index.
     */
    clearScene: function () {
      if (this.$refs.treeControls) this.$refs.treeControls.clear();
      if (this.$_searchIndex) this.$_searchIndex.removeAll();
      if (this.$module.scene) this.$module.scene.clearAll();
    },
    /**
     * @vuese
     * Confirm creation of new primitive. This is only called from callback.
     */
    confirmCreate: function(payload) {
      if (payload) {
        let object = undefined;
        if (payload.shape === "Point") {
          object = this.$module.scene.createPoints(
            payload.region,
            payload.group,
            this.createData.points,
            undefined,
            0x0022ee,
          );
          
        } else if (payload.shape === "Line") {
          object = this.$module.scene.createLines(
            payload.region,
            payload.group,
            [this.createData.points[0], this.createData.points[1]],
            0x00ee22,
          );
        }
        if (object) {
          this.tData.region = payload.region;
          this.tData.label = payload.group;
        }
      }
      this.createData.toBeConfirmed = false;
    },
    cancelCreate: function() {
      this.createData.points.length = 0;
      this.createData.toBeConfirmed = false;
      this.tData.visible = false;
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
     * @vuese
     * Function to reset the view to default.
     * Also called when the associated button is pressed.
     */
    fitWindow: function () {
      if (this.$module.scene) {
        this.$module.scene.viewAll();
      }
    },
    /**
     * @vuese
     * Function to zoom in.
     * Also called when the associated button is pressed.
     */
    zoomIn: function () {
      if (this.$module.scene) {
        this.$module.scene.changeZoomByScrollRateUnit(-1);
      }
    },
    /**
     * Function to zoom out.
     * Also called when the associated button is pressed.
     *
     * @vuese
     */
    zoomOut: function () {
      if (this.$module.scene) {
        this.$module.scene.changeZoomByScrollRateUnit(1);
      }
    },
    /**
     * Function to change the current play speed.
     *
     * @vuese
     */
    speedChanged: function (speed) {
      this.currentSpeed = speed;
      this.$module.setPlayRate(this.defaultRate * this.currentSpeed);
    },
    /**
     * Function used to stop the free spin
     *
     * @vuese
     */
    stopFreeSpin: function () {
      let cameracontrol = this.$module.scene.getZincCameraControls();
      cameracontrol.stopAutoTumble();
      this.isTransitioning = false;
    },
    /**
     * Return a list of obejcts with the provided name.
     * @arg Group name to search.
     *
     * @vuese
     */
    findObjectsWithGroupName: function (name) {
      let objects = [];
      if (name && name != "" && this.$module.scene) {
        objects = this.$module.scene.findObjectsWithGroupName(name);
      }
      return objects;
    },
    /**
     * Switch active drawing type 
     * @arg shapeName shape to toggle
     *
     * @vuese
     */
    toggleDrawing: function (shapeName) {
      if (shapeName === this.createData.shape) {
        this.createData.shape = "";
        this.$module.selectObjectOnPick = true;
      } else {
        this.createData.shape = shapeName;
        this.$module.selectObjectOnPick = false;
      }
    },
    /**
     * Find and and zoom into objects with the provided list of names.
     * @arg List of names
     * 
     * @vuese
     */
    viewRegion: function (names) {
      const rootRegion = this.$module.scene.getRootRegion();
      const groups = Array.isArray(names) ? names : [names];
      const objects = findObjectsWithNames(rootRegion, groups, "", true);
      let box = this.$module.scene.getBoundingBoxOfZincObjects(objects);
      if (box) {
        if (this.$module.isSyncControl()) {
          this.$module.setSyncControlZoomToBox(box);
        } else {
          const dist =
            this.$module.scene.camera.far - this.$module.scene.camera.near;
          this.$module.scene.viewAllWithBoundingBox(box);
          this.$module.scene.camera.far = this.$module.scene.camera.near + dist;
          this.$module.scene.camera.updateProjectionMatrix();
        }
        return true;
      }
      return false;
    },
    setFocusedRegion: function (name) {
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
    updateViewURL: function (viewURL) {
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
    draw: function(data) {
      if (data && data.length > 0 && data[0].data.group) {
        if (data[0].worldCoords) {
          if (this.createData.shape === "Point") {
            this.drawPoint(data[0].worldCoords, data);
          } else if (this.createData.shape === "Line") {
            this.drawLine(data[0].worldCoords, data);
          }
        }
      }
    },
    drawPoint: function(coords, data) {
      this.createData.points.length = 0;
      this.createData.points.push(coords);
      this.showRegionTooltipWithAnnotations(data, true, true);
      this.createData.toBeConfirmed = true;
    },
    drawLine: function(coords, data) {
      if (this.createData.points.length === 1) {
        this.createData.points.push(coords);
        this.showRegionTooltipWithAnnotations(data, true, true);
        this.createData.toBeConfirmed = true;
      } else {
        this.createData.points.push(coords);
      }
    },    
    /**
     * Return renderer information
     * 
     * @vuese
     */
    getRendererInfo: function () {
      if (this.$module.zincRenderer) {
        return this.$module.zincRenderer.getThreeJSRenderer().info;
      }
      return undefined;
    },
    /**
     * Function used to rotate the scene.
     * Also called when the associated button is pressed.
     *
     * @vuese
     */
    freeSpin: function () {
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
    eventNotifierCallback: function (event) {
      const names = [];
      let zincObjects = [];
      const region = undefined;
      if (event.eventType == 1 || event.eventType == 2) {
        event.identifiers.forEach((identifier) => {
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
        if (this.viewingMode === 'Annotation') {
          if (this.createData.shape !== "") {
            // Create new shape bsaed on current settings
            if (names.length > 0) {
              this.createData.x = event.identifiers[0].coords.x;
              this.createData.y = event.identifiers[0].coords.y;
              this.draw(event.identifiers);
            }
          } else {
            //Make sure the tooltip is displayed with annotation mode
            this.showRegionTooltipWithAnnotations(event.identifiers, true, true);
          }
        } else {
          if (this.$refs.treeControls) {
            if (names.length > 0) {
              //this.$refs.treeControls.changeActiveByNames(names, region, false);
              this.$refs.treeControls.updateActiveUI(zincObjects);
            } else {
              this.hideRegionTooltip();
              this.$refs.treeControls.removeActive(true);
            }
          }
          //Emit when an object is selected
          //@arg Identifier of selected objects
          this.$emit("scaffold-selected", event.identifiers);
        }
      } else if (event.eventType == 2) {
        if (this.selectedObjects.length === 0) {
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
          if (event.identifiers.length > 0 && event.identifiers[0]) {
            let id = event.identifiers[0].data.id
              ? event.identifiers[0].data.id
              : event.identifiers[0].data.group;
            if (event.identifiers[0].coords) {
              this.tData.active = false;
              this.tData.visible = true;
              this.tData.label = id;
              if (event.identifiers[0].data.region)
                this.tData.region = event.identifiers[0].data.region;
              else this.tData.region = undefined;
              this.tData.x = event.identifiers[0].coords.x;
              this.tData.y = event.identifiers[0].coords.y;
            }
          }
          //Emit when an object is highlighted
          //@arg Identifier of selected objects
          this.$emit("scaffold-highlighted", event.identifiers);
        }
      } else if (event.eventType == 3) {
        //MOVE
        if (event.identifiers.length > 0 && event.identifiers[0]) {
          if (event.identifiers[0].coords) {
            const offsets =
              this.$refs.scaffoldContainer.getBoundingClientRect();
            this.tData.x = event.identifiers[0].coords.x - offsets.left;
            this.tData.y = event.identifiers[0].coords.y - offsets.top;
          }
        }
      }
    },
    /**
     * Get the coordinates of the current selected region.
     *
     * @vuese
     */
    getCoordinatesOfSelected: function () {
      if (this.selectedObjects && this.selectedObjects.length > 0) {
        return this.$module.scene.getObjectsScreenXY(this.selectedObjects);
      }
      return undefined;
    },
    /**
     * Return an object containing the window coordinates of the
     * current selected region which will be updated after each render
     * loop.
     *
     * @vuese
     */
    getDynamicSelectedCoordinates: function () {
      return this.$module.selectedScreenCoordinates;
    },
    /**
     * Callback when time is changed through the UI.
     */
    timeChange: function (event) {
      let normalizedTime = (event / this.timeMax) * 100;
      if (normalizedTime != this.currentTime) {
        this.$module.updateTime(normalizedTime);
      }
    },
    /**
     * A callback used by children components. Set the selected zinc object
     *
     * @arg Selected zinc objects
     * @arg Flag to determine if callback should be triggered when new selection
     * is made 
     */
    objectSelected: function (objects, propagate) {
      this.selectedObjects = objects;
      if (this.selectedObjects && this.selectedObjects.length > 0) {
        this.$refs.primitiveControls.setObject(this.selectedObjects[0]);
      }
      this.$module.setSelectedByZincObjects(objects, undefined, propagate);
    },
    /**
     * A callback used by children components. Set the highlighted zinc object
     *
     * @arg Hovered zinc objects
     * @arg Flag to determine if callback should be triggered when new selection
     * is made 
     */
    objectHovered: function (objects, propagate) {
      this.hoveredObjects = objects;
      this.$module.setHighlightedByZincObjects(objects, undefined, propagate);
    },
    /**
     * Set the selected by name.
     *
     * @param {} name Name of the group
     */
    changeActiveByName: function (names, region, propagate) {
      const isArray = Array.isArray(names);
      if (names === undefined || (isArray && names.length === 0)) {
        this.$refs.treeControls.removeActive(propagate);
      } else {
        let array = names;
        if (!isArray) array = [array];
        this.$refs.treeControls.changeActiveByNames(array, region, propagate);
      }
    },
    /**
     * Set the highlighted by name.
     *
     * @param {name} name Name of the group
     */
    changeHighlightedByName: function (names, region, propagate) {
      const isArray = Array.isArray(names);
      if (names === undefined || (isArray && names.length === 0)) {
        this.$refs.treeControls.removeHover(propagate);
      } else {
        let array = names;
        if (!isArray) array = [array];
        this.$refs.treeControls.changeHoverByNames(array, region, propagate);
      }
    },
    /**
     * @vuese
     * Start the animation.
     *
     * @arg flag to turn the animation on/off
     */
    play: function (flag) {
      this.$module.playAnimation(flag);
      this.isPlaying = flag;
      //Hide tooltip as location may
      //this.hideRegionTooltip();
    },
    /**
     * @vuese
     * Function to toggle on/off overlay help.
     */
    setHelpMode: function (helpMode) {
      if (helpMode) {
        this.inHelp = true;
        this.hoverVisibilities.forEach((item) => {
          item.value = true;
        });
      } else {
        this.inHelp = false;
        this.hoverVisibilities.forEach((item) => {
          item.value = false;
        });
      }
    },
    /**
     * Callback function used by showRegionTooltip in the case when the tooltip
     * is out of view.
     */
    displayTooltipOfObjectsCallback: function (
      name,
      objects,
      regionPath,
      resetView,
      liveUpdates
    ) {
      const instance = this;
      return function () {
        instance.$module.zincRenderer.removePostRenderCallbackFunction(
          instance.$_regionTooltipCallback
        );
        instance.$_regionTooltipCallback = undefined;
        instance.displayTooltipOfObjects(name, objects, regionPath, resetView, liveUpdates);
      };
    },
    liveUpdateTooltipPosition: function () {
      if (this.$module.selectedCenter) {
        this.tData.x = this.$module.selectedScreenCoordinates.x;
        this.tData.y = this.$module.selectedScreenCoordinates.y;
      }
    },
    displayTooltipOfObjects: function (name, objects, regionPath, resetView, liveUpdates) {
      if (objects.length > 0) {
        let coords = objects[0].getClosestVertexDOMElementCoords(
          this.$module.scene
        );
        if (coords) {
          //The coords is not in view, view all if resetView flag is true
          if (!coords.inView) {
            this.hideRegionTooltip();
            if (resetView) {
              this.$module.scene.viewAll();
              //Use the post render callback to make sure the scene has been updated
              //before getting the position of the tooltip.
              if (this.$_regionTooltipCallback) {
                this.$module.zincRenderer.removePostRenderCallbackFunction(
                  this.$_regionTooltipCallback
                );
              }
              this.$_regionTooltipCallback =
                this.$module.zincRenderer.addPostRenderCallbackFunction(
                  this.displayTooltipOfObjectsCallback(
                    name,
                    objects,
                    regionPath,
                    resetView,
                    liveUpdates
                  )
                );
            }
          } else {
            if (!name.includes("Search Results for")) {
              this.tData.active = true;
            } else {
              this.tData.active = false;
            }
            this.tData.visible = true;
            this.tData.label = name;
            this.tData.x = coords.position.x;
            this.tData.y = coords.position.y;
            this.tData.region = regionPath;
            if (this.$_liveCoordinatesUpdated) {
              this.$module.zincRenderer.removePostRenderCallbackFunction(
                this.$_liveCoordinatesUpdated
              );
            }
            if (liveUpdates) {
              this.$module.setupLiveCoordinates(objects);
              this.$_liveCoordinatesUpdated =
                this.$module.zincRenderer.addPostRenderCallbackFunction(
                  this.liveUpdateTooltipPosition
                );
            }
          }
          return true;
        }
      }
      this.hideRegionTooltip();
      return false;
    },
    /**
     * Display the tooltip used for displaying search result.
     * When resetView is set to true, it will
     * reset view if the tooltip is not in view.
     * Setting liveUpdates to true will update the tooltip location
     * at every rendering loop.
     */
    showRegionTooltipWithObjects: function (label, zincObjects, regionPath, resetView, liveUpdates) {
      if (label && zincObjects && zincObjects.length > 0 && this.$module.scene) {
        return this.displayTooltipOfObjects(
          label,
          zincObjects,
          regionPath,
          resetView,
          liveUpdates
        );
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
    showRegionTooltip: function (name, resetView, liveUpdates) {
      if (name && this.$module.scene) {
        const rootRegion = this.$module.scene.getRootRegion();
        const groups = [name];
        const objects = findObjectsWithNames(rootRegion, groups, "", true);
        let regionPath = undefined;
        if (objects && objects.length > 0) {
          regionPath = objects[0].getRegion().getFullPath();
        }
        return this.showRegionTooltipWithObjects(
          name,
          objects,
          regionPath,
          resetView,
          liveUpdates
        );
      }
      this.hideRegionTooltip();
      return false;
    },
    /**
     * Display the tooltip using the list of annotations.
     * When resetView is set to true, it will
     * reset view if the tooltip is not in view.
     * Setting liveUpdates to true will update the tooltip location
     * at every rendering loop.
     */
    showRegionTooltipWithAnnotations: function (annotations, resetView, liveUpdates) {
      if (this.$module.scene) {
        const result = getObjectsFromAnnotations(this.$module.scene, annotations);
        if (result && result.objects.length > 0) {
          return this.showRegionTooltipWithObjects(
            result.label,
            result.objects,
            result.regionPath,
            resetView,
            liveUpdates
          );
        }
      }
      this.hideRegionTooltip();
      return false;
    },
    /**
     * Callback on viewing mode change
     */
    viewingModeChange: function () {
      if (this.$module) {
        if ((this.viewingMode === "Exploration") ||
          (this.viewingMode === "Annotation") &&
          (this.createData.shape === "")) {
            this.$module.selectObjectOnPick = true;
        } else {
          this.$module.selectObjectOnPick = false;
        }
      }
      this.$module.toBeConfirmed = false;
      this.createData.shape = "";
    },
    /**
     * @vuese
     * Hide the tooltip
     */
    hideRegionTooltip: function () {
      if (this.$_liveCoordinatesUpdated) {
        this.$module.zincRenderer.removePostRenderCallbackFunction(
          this.$_liveCoordinatesUpdated
        );
        //Unset the tracking
        this.$module.setupLiveCoordinates(undefined);
      }
      this.tData.active = false;
      this.tData.visible = false;
      this.tData.region = undefined;
    },
    /**
     * Set the marker modes for objects with the provided name, mode can
     * be "on", "off" or "inherited".
     */
    setMarkerModeForObjectsWithName: function (name, mode) {
      if (name && this.$module.scene) {
        const rootRegion = this.$module.scene.getRootRegion();
        const groups = [name];
        const objects = findObjectsWithNames(rootRegion, groups, "", true);
        objects.forEach(object => object.setMarkerMode(mode));
      }
    },
    /**
     * @vuese
     * Set the marker modes for objects specified by the list of annotations
     */
    setMarkerModeWithAnnotations: function (annotations, mode) {
      if (this.$module.scene) {
        const result = getObjectsFromAnnotations(this.$module.scene, annotations);
        if (result && result.objects.length > 0) {
          result.objects.forEach(object => object.setMarkerMode(mode));
        }
      }
    },
    /**
     * This is called when mouse cursor enters supported elements
     * with help tootltips.
     */
    showHelpText: function (helpTextNumber) {
      if (!this.inHelp) {
        this.helpTextWait = setTimeout(() => {
          this.hoverVisibilities[helpTextNumber].value = true;
        }, 500);
      }
    },
    /**
     * This is called when mouse cursor exits supported element..
     */
    hideHelpText: function (helpTextNumber) {
      if (!this.inHelp) {
        this.hoverVisibilities[helpTextNumber].value = false;
        clearTimeout(this.helpTextWait);
      }
    },
    /**
     * @vuese
     * 
     * Search a object and display the tooltip
     * @arg text to search across
     * @arg toggle the tooltip if this is set
     */
    search: function (text, displayLabel) {
      if (this.$_searchIndex) {
        if (text === undefined || text === "" ||
          ((Array.isArray(text) && text.length === 0))
        ) {
          this.objectSelected([], true); 
          return false;
        } else {
          const result = this.$_searchIndex.searchAndProcessResult(text);
          const zincObjects = result.zincObjects;
          if (zincObjects.length > 0) {
            this.objectSelected(zincObjects, true);
            if (displayLabel) {
              for (let i = 0; i < zincObjects.length; i++) {
                if (zincObjects[i] && zincObjects[i].groupName) {
                  this.showRegionTooltipWithObjects(
                    result.label,
                    zincObjects,
                    result.regionPath,
                    true,
                    true
                  );
                }
              }
            }
            return true;
          } else {
            this.objectSelected([], true);
          }
        }
      }
      return false;
    },
    /**
     * @vuese
     * 
     * Get the list of suggested terms based on the provided term.
     * This can be used for autocomplete.
     */
    fetchSuggestions: function (term) {
      if (this.$_searchIndex === undefined) return [];
      return this.$_searchIndex.auto_suggest(term);
    },
    /**
     * Called when minimap settings has changed. Pass the
     * parameters to ZincJS and marked it for update.
     */
    updateMinimapScissor: function () {
      Object.keys(this.minimapSettings).forEach((key) => {
        this.$module.scene.minimapScissor[key] = this.minimapSettings[key];
      });
      this.$module.scene.minimapScissor.updateRequired = true;
    },
    updateSettingsfromScene: function () {
      this.currentSpeed = 1;
      this.$module.setPlayRate(this.defaultRate);
      this.orginalDuration =
        this.$module.scene.getMetadataTag("OriginalDuration");
      this.animateDuration = this.$module.scene.getMetadataTag("Duration");
      let timeStamps = this.$module.scene.getMetadataTag("TimeStamps");
      this.timeStamps = {};
      for (const key in timeStamps) {
        this.timeStamps[timeStamps[key]] = key;
      }
      this.timeMax = this.$module.scene.getDuration();
    },
    setURLFinishCallback: function (options) {
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
        this.addRegionsToSearchIndex();
        //Emit when all objects have been loaded
        this.$emit("on-ready");
        this.setMarkers();
        this.isReady = true;
      };
    },
    /**
     * Function used for getting the current states of the scene. This exported states
     * can be imported using the importStates method.
     *
     * @vuese
     */
    getState: function () {
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
     * @vuese
     */
    setState: function (state) {
      if (state) {
        if (state.url && state.url !== this._currentURL) {
          this.setURLAndState(state.url, {
            fileFormat: state.fileFormat,
            viewport: state.viewport,
            visibility: state.visibility,
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
                  visibility: state.visibility,
                })
              );
            }
          }
        }
      }
    },
    /**
     * export current scene in GLTF.
     * @arg Return in binary form when set to true
     * 
     * @vuese
     */
    exportGLTF: function (binary) {
      return this.$module.scene.exportGLTF(binary);
    },
    /**
     * Function used for reading in new scaffold metadata and a custom
     * viewport. This function will ignore the state prop and
     * read in the new url.
     *
     * @vuese
     */
    setURLAndState: function (newValue, state) {
      if (newValue != this._currentURL) {
        if (state && state.format) this.fileFormat = state.format;
        let viewport = state && state.viewport ? state.viewport : undefined;
        let visibility =
          state && state.visibility ? state.visibility : undefined;
        this._currentURL = newValue;
        if (this.$refs.treeControls) this.$refs.treeControls.clear();
        this.loading = true;
        this.timeVarying = false;
        this.isReady = false;
        this.$_searchIndex.removeAll();
        this.hideRegionTooltip();
        this.$module.setFinishDownloadCallback(
          this.setURLFinishCallback({
            viewport: viewport,
            region: this.region,
            viewURL: this.viewURL,
            visibility: visibility,
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
        if (this.$module && this.$module.scene) {
          this.$module.scene.displayMarkers = this.displayMarkers;
          this.$module.scene.forcePickableObjectsUpdate = true;
          this.$module.scene.displayMinimap = this.displayMinimap;
          this.updateMinimapScissor();
        }
      }
    },
    /**
     * Function used for reading in new scaffold metadata. This function will ignore
     * the state prop and read in the new url.
     *
     * @vuese
     */
    setURL: function (newValue) {
      this.setURLAndState(newValue, undefined);
    },
    /**
     * Callback when drawer is toggled.
     */
    drawerToggled: function (flag) {
      this.drawerOpen = flag;
      this.adjustLayout();
    },
    /**
     * Callback using ResizeObserver.
     */
    adjustLayout: function () {
      let width = this.$refs.scaffoldContainer.clientWidth;
      this.minimisedSlider = width < 812;
      if (this.minimisedSlider) {
        this.sliderPosition = this.drawerOpen ? "right" : "left";
      } else {
        this.sliderPosition = "";
      }
    },
    toggleRendering: function (flag) {
      if (this.$module.zincRenderer) {
        if (flag) {
          this.$module.zincRenderer.animate();
        } else {
          this.$module.zincRenderer.stopAnimate();
        }
      }
    },
    /**
     * @vuese
     * 
     * Force the renderer to resize
     */
    forceResize: function () {
      if (this.$module.zincRenderer) {
        this.$module.zincRenderer.onWindowResize();
      }
    },
    syncControlCallback: function () {
      const payload = this.$module.NDCCameraControl.getPanZoom();
      if (this.tData.visible) {
        this.showRegionTooltip(this.tData.label, true, true);
      }
      //Emit when the scene has been transformed due to navigation,
      //only triggered during syncControl mode
      //@arg Information on the navigation
      this.$emit("scaffold-navigated", payload);
    },
    /**
     * Rotate mode - "none", "horizontal", "vertical", "free" but
     * it will be ignored if flag is set to false.
     */
    toggleSyncControl: function (flag, rotateMode) {
      this.$module.toggleSyncControl(flag, rotateMode);
      this.$module.setSyncControlCallback(this.syncControlCallback);
    },

    /**
     * Set the markers for the scene.
     */
    setMarkers: function () {
      this.markerLabels.forEach((l)=>{
        this.setMarkerModeForObjectsWithName(l, "on");
      })
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

.message-icon {
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

.backgroundSpacer {
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 10px;
}

.warning-icon {
  color: $warning;
  top: 15px;
}

.latest-changesicon {
  color: $success;
  top: 45px;
}

.message-text {
  font-size: 15px;
  vertical-align: 5px;
}

:deep(.message-popper) {
  padding: 9px 10px;
  min-width: 150px;
  font-size: 12px;
  color: #fff;
}

#organsDisplayArea {
  &:focus {
    outline: none !important;
    border: 0px;
  }
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

.tab-content {
  :deep(.el-slider__marks-text) {
    margin-top: 12px;
    margin-left: 8px;
    font-size: 10px;
  }
}

.tab-content {
  :deep(.el-slider__stop) {
    width: 10px;
    height: 10px;
    top: -1px;
    border: solid 1px $app-primary-color;
  }
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

  :deep(.el-slider__runway) {
    height: 10px;
    margin: 14px 0;
  }

  :deep(.el-slider__button-wrapper) {
    top: -13px;
  }
}

.zoomOut {
  padding-left: 8px;
}

.fitWindow {
  padding-left: 8px;
}

.bottom-draw-control {
  background-color: var(--el-color-primary-light-9);
  padding: 4px 4px 2px 4px;
  border-style: solid;
  border-color: var(--el-color-primary-light-5);
  border-radius: 1rem;
  position: absolute;
  right: calc(50vw - 100px);;
  bottom: 16px;
}

:deep(.non-selectable) {
  user-select: none;
}

:deep(.background-popper.el-popover.el-popper) {
  padding: 5px 12px;
  background-color: #ffffff;
  border: 1px solid $app-primary-color;
  box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.06);
  height: 140px;
  min-width: 200px;
  .el-popper__arrow {
    &:before {
      border-color: $app-primary-color;
    }
  }
}

:deep(.open-map-popper.el-popover.el-popper) {
  padding-top: 5px;
  padding-bottom: 5px;
  background-color: #ffffff;
  border: 1px solid $app-primary-color;
  box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.06);
  min-width: 188px;
  .el-row ~ .el-row {
    margin-top: 8px;
  }

  .el-button {
    padding-top: 5px;
    padding-bottom: 5px;
    background: #f3e6f9;
    border-color: $app-primary-color;
    color: $app-primary-color;
  }

  .el-popper__arrow {
    &:before {
      border-color: $app-primary-color;
    }
  }
}

.settings-group {
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
  &.open-map-button {
    margin-bottom:4px;
  }

  &:hover {
    cursor: pointer;
  }

  &.shape {
    margin-left: 4px;
    margin-right: 4px;
    color: var(--el-color-primary-light-5);
    &.active {
      color: var(--el-color-primary);
    }
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
  :deep(.el-tabs__header) {
    margin: 0px;
    border-bottom: 1px solid rgb(144, 147, 153);
    height: 24px;
  }

  .el-row {
    margin-bottom: 5px;
  }

  :deep(.el-tabs__content) {
    border-left: 1px solid rgb(144, 147, 153);
    border-bottom: 1px solid rgb(144, 147, 153);
    border-right: 1px solid rgb(144, 147, 153);
    border-radius: 0px 0px 4px 4px;
    background-color: white;
  }

  :deep(.el-tabs.el-tabs--top.el-tabs--card) {
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

:deep(.scaffold-popper.el-popper.el-popper) {
  padding: 6px 4px;
  font-size: 12px;
  color: rgb(48, 49, 51);
  background-color: #f3ecf6;
  border: 1px solid $app-primary-color;
  white-space: nowrap;
  min-width: unset;
  width: unset!important;;
  pointer-events: none;

  .el-popper__arrow {
    &:before {
      border-color: $app-primary-color;
      background-color: #f3ecf6;
    }
  }
}

:deep(.el-slider__button) {
  border: 2px solid $app-primary-color;
}

:deep(.el-slider__bar) {
  background-color: $app-primary-color;
  height: 10px;
}

:deep(.el-loading-spinner) {
  .path {
    stroke: $app-primary-color;
  }
  .el-loading-text {
    color: $app-primary-color;
  }
}


:deep(.popper-zoomout) {
  padding-right: 11px;
  left: -21px !important;
  .popper__arrow {
    left: 53px !important;
  }
}

.scaffold-select-box {
  border-radius: 4px;
  border: 1px solid rgb(144, 147, 153);
  background-color: var(--white);
  font-weight: 500;
  color: rgb(48, 49, 51);
  &.viewing-mode {
    width: 150px!important;
  }

  &.speed {
    margin-left: 8px;
    width:50px!important;
    height: 24px;
    :deep(.el-select__wrapper) {
      padding: 0;
      min-height: 24px
    }
  }
}

:deep(.scaffold_viewer_dropdown) {
  min-width: 160px !important;
  .el-select-dropdown__item {
    white-space: nowrap;
    text-align: left;
    &.is-selected {
      color: $app-primary-color;
      font-weight: normal;
    }
  }
}


</style>

<style lang="scss">
.scaffold-container {
  --el-color-primary: #8300BF;
  --el-color-primary-light-5: #cd99e5;
  --el-color-primary-light-7: #dab3ec;
  --el-color-primary-light-8: #e6ccf2
  --el-color-primary-light-9: #f3e6f9;
  height: 100%;
  width: 100%;
  position: relative;
}

.time-slider-tooltip {
  padding: 6px 4px !important;
  font-family: "Asap", sans-serif;
  font-size: 12px !important;
  color: rgb(48, 49, 51) !important;
  background-color: #f3ecf6 !important;
  border: 1px solid $app-primary-color !important;
  white-space: nowrap !important;
  min-width: unset !important;
  .el-popper__arrow {
    &:before {
      border-color: $app-primary-color!important;
      background-color: #f3ecf6!important;
    }
  }
}

.scaffold_viewer_dropdown .el-select-dropdown__item {
  white-space: nowrap;
  text-align: left;
  font-family: "Asap", sans-serif;
  &.is-selected {
    color: $app-primary-color;
    font-weight: normal;
  }
}

</style>
