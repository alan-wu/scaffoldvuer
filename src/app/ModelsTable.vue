<template>
  <div>
    <el-input
      v-model="search"
      size="small"
      placeholder="Type to search"
    />
    <el-table
      :data="tableData.filter(
        data => !search || 
          data.Organ.toLowerCase().includes(search.toLowerCase()) ||
          data.Species.toLowerCase().includes(search.toLowerCase()) ||
          data.Note.toLowerCase().includes(search.toLowerCase()))"
      style="width: 100%;"
      height="600"
    >
      <el-table-column
        prop="Organ"
        label="Organ"
        width="100"
      />
      <el-table-column
        prop="Species"
        label="Species"
        width="100"
      />
      <el-table-column
        prop="Note"
        label="Note"
        width="200"
      />
      <el-table-column
        prop="Last modified"
        label="Last modified"
        width="250"
      /> 
      <el-table-column
        fixed="right"
        label="Action"
        width="300"
      >
        <template #default="scope">
          <el-button
            size="small"
            @click="handleView(scope.row)"
          >
            View
          </el-button>
          <el-button
            v-if="scope.row.Discover !== 'Not even'"
            size="small"
            @click="handleDiscover(scope.row)"
          >
            Discover
          </el-button>
          <el-button
            v-if="scope.row['Blackfynn dataset'] !== '/'"
            size="small"
            @click="handleBlackfynn(scope.row)"
          >
            Blackfynn
          </el-button>
        </template>
      </el-table-column>   
    </el-table>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import getTableData from "./ModelsInformation.js";

import { 
  ElButton as Button,
  ElInput as Input,
  ElTable as Table,
  ElTableColumn as TableColumn
} from "element-plus";

export default {
  name: "ModelsTable",
  components: [
    Button,
    Input,
    Table,
    TableColumn
  ],
  async setup() {
    const keywords = ["Organ", "Species", "Note", "Location",
      "Last modified","Blackfynn dataset", "Published", "Discover"];
    const spreadsheet_id = import.meta.env.VITE_GOOGLE_SPREADSHEET_ID;
    const service_email = import.meta.env.VITE_GOOGLE_SERVICE_SCAFFOLDVUER_EMAIL;
    const service_key = import.meta.env.VITE_GOOGLE_PRIVATE_SCAFFOLDVUER_KEY;
    const tableData = await getTableData(keywords, spreadsheet_id, service_email, service_key);
    return { tableData };
  },
  data() {
    return {
      search: '',
    }
  },
  methods: {
    handleView: function(row) {
      this.$emit("viewModelClicked", row.Location);
    },
    handleDiscover: function(row) {
      window.open(row.Discover, "_blank");
    },
    handleBlackfynn: function(row) {
      window.open(row['Blackfynn dataset'], "_blank");
    },
  }
};
</script>
