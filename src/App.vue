<template>
  <div id="app">
    <button v-on:click="onClick('rat')">Rat</button>
    <button v-on:click="onClick('mouse')">Mouse</button>
    <input v-model="input" style="width:80%;padding-left: 15px;">
    <ScaffoldVuer :traditional="traditional" :url="url" ref="scaffold" showColourPicker/>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import ScaffoldVuer from './components/ScaffoldVuer.vue'
const axios = require('axios').default;

export default {
  name: 'app',
  components: {
    ScaffoldVuer
  },
  methods: {
    onClick: function(species) {
      if (species == "rat") {
        this.input = "https://mapcore-bucket1.s3-us-west-2.amazonaws.com/others/29_Jan_2020/heartICN_metadata.json";
      } else if (species == "mouse") {
        this.input = "https://mapcore-bucket1.s3-us-west-2.amazonaws.com/others/27_Feb_2020/mouse_heart/mouse_heart_1.json";
      }
    },
    parseInput: function() {
      console.log(this.input)
      if (this.input.includes("N:package:")) {
        let requestURL = "/services/bts/getInfo";
        axios.get(requestURL, {
          params: {
            id: this.input
          }
        })
        .then(response => {
          this.url = "/services/bts/scaffold/" + response.data.collectionId + "/" + response.data.fileName;
        })
        .catch(error => {
          console.log(error);
        })
        .then(() => {
          // always executed
        });
      } else {
        console.log(this.input)
        this.url = this.input;
      }
    }
  },
  data: function() {
    return {
      url: undefined,
      input: undefined,
      traditional: true
    };
  },
  beforeMount: function() {
    const queryString = require('query-string');
    const parsed = queryString.parse(location.search);
    console.log(parsed)
    if (parsed.url) {
      this.input= parsed.url;
    } else {
      this.input = "https://mapcore-bucket1.s3-us-west-2.amazonaws.com/others/29_Jan_2020/heartICN_metadata.json";
    }
  },
  watch: {
    input: function() {
      this.parseInput();
    }
  }

}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height:100%;
  width: 100%;
  position:absolute;
}

body {
  margin: 0px;
}
</style>
