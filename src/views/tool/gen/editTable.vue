<template>
  <el-card>
    <el-tabs v-model="activeName">
      <el-tab-pane label="Basic info" name="basic">
        <basic-info-form ref="basicInfo" :info="info" />
      </el-tab-pane>
      <el-tab-pane label="Field info" name="columnInfo">
        <el-table ref="dragTable" :data="columns" row-key="columnId" :max-height="tableHeight">
          <el-table-column label="No." type="index" min-width="5%" />
          <el-table-column label="Field column name" prop="columnName" min-width="10%" :show-overflow-tooltip="true" />
          <el-table-column label="Field Descrption" min-width="10%">
            <template #default="scope">
              <el-input v-model="scope.row.columnComment"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="Physical type" prop="columnType" min-width="10%" :show-overflow-tooltip="true" />
          <el-table-column label="Java Type" min-width="11%">
            <template #default="scope">
              <el-select v-model="scope.row.javaType">
                <el-option label="Long" value="Long" />
                <el-option label="String" value="String" />
                <el-option label="Integer" value="Integer" />
                <el-option label="Double" value="Double" />
                <el-option label="BigDecimal" value="BigDecimal" />
                <el-option label="Date" value="Date" />
                <el-option label="Boolean" value="Boolean" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="java property" min-width="10%">
            <template #default="scope">
              <el-input v-model="scope.row.javaField"></el-input>
            </template>
          </el-table-column>

          <el-table-column label="Insert" min-width="5%">
            <template #default="scope">
              <el-checkbox true-label="1" false-label="0" v-model="scope.row.isInsert"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="Edit" min-width="5%">
            <template #default="scope">
              <el-checkbox true-label="1" false-label="0" v-model="scope.row.isEdit"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="Table" min-width="5%">
            <template #default="scope">
              <el-checkbox true-label="1" false-label="0" v-model="scope.row.isList"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="Search" min-width="5%">
            <template #default="scope">
              <el-checkbox true-label="1" false-label="0" v-model="scope.row.isQuery"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="Search Method" min-width="10%">
            <template #default="scope">
              <el-select v-model="scope.row.queryType">
                <el-option label="=" value="EQ" />
                <el-option label="!=" value="NE" />
                <el-option label=">" value="GT" />
                <el-option label=">=" value="GE" />
                <el-option label="<" value="LT" />
                <el-option label="<=" value="LE" />
                <el-option label="LIKE" value="LIKE" />
                <el-option label="BETWEEN" value="BETWEEN" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="必填" min-width="5%">
            <template #default="scope">
              <el-checkbox true-label="1" false-label="0" v-model="scope.row.isRequired"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="显示类型" min-width="12%">
            <template #default="scope">
              <el-select v-model="scope.row.htmlType">
                <el-option label="文本框" value="input" />
                <el-option label="文本域" value="textarea" />
                <el-option label="下拉框" value="select" />
                <el-option label="单选框" value="radio" />
                <el-option label="复选框" value="checkbox" />
                <el-option label="日期控件" value="datetime" />
                <el-option label="图片上传" value="imageUpload" />
                <el-option label="文件上传" value="fileUpload" />
                <el-option label="富文本控件" value="editor" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="字典类型" min-width="12%">
            <template #default="scope">
              <el-select v-model="scope.row.dictType" clearable filterable placeholder="请选择">
                <el-option v-for="dict in dictOptions" :key="dict.dictType" :label="dict.dictName" :value="dict.dictType">
                  <span style="float: left">{{ dict.dictName }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ dict.dictType }}</span>
                </el-option>
              </el-select>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="生成信息" name="genInfo">
        <gen-info-form ref="genInfo" :info="info" :tables="tables" />
      </el-tab-pane>
    </el-tabs>
    <el-form label-width="100px">
      <div style="text-align: center;margin-left:-100px;margin-top:10px;">
        <el-button type="primary" @click="submitForm()">提交</el-button>
        <el-button @click="close()">返回</el-button>
      </div>
    </el-form>
  </el-card>
</template>

<script setup name="GenEdit" lang="ts">
import { getGenTable, updateGenTable } from '@/api/tool/gen';
import { DbColumnVO, DbTableVO } from '@/api/tool/gen/types';
import { optionselect as getDictOptionselect } from '@/api/system/dict/type';
import { DictTypeVO } from '@/api/system/dict/type/types';
import BasicInfoForm from './basicInfoForm.vue';
import GenInfoForm from "./genInfoForm.vue";

const route = useRoute();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const activeName = ref('columnInfo');
const tableHeight = ref(document.documentElement.scrollHeight - 245 + 'px');
const tables = ref<DbTableVO[]>([]);
const columns = ref<DbColumnVO[]>([]);
const dictOptions = ref<DictTypeVO[]>([]);
const info = ref<Partial<DbTableVO>>({});

const basicInfo = ref<InstanceType<typeof BasicInfoForm>>();
const genInfo = ref<InstanceType<typeof GenInfoForm>>();

/** 提交按钮 */
const submitForm = () => {
  const basicForm = basicInfo.value?.$refs.basicInfoForm;
  const genForm = genInfo.value?.$refs.genInfoForm;

  Promise.all([basicForm, genForm].map(getFormPromise)).then(async res => {
    const validateResult = res.every(item => !!item);
    if (validateResult) {
      const genTable: any = Object.assign({}, info.value);
      genTable.columns = columns.value;
      genTable.params = {
        treeCode: info.value?.treeCode,
        treeName: info.value.treeName,
        treeParentCode: info.value.treeParentCode,
        parentMenuId: info.value.parentMenuId
      };
      const response = await updateGenTable(genTable);
      proxy?.$modal.msgSuccess(response.msg);
      if (response.code === 200) {
        close();
      }
    } else {
      proxy?.$modal.msgError("表单校验未通过，请重新检查提交内容");
    }
  });
}
const getFormPromise = (form: any) => {
  return new Promise(resolve => {
    form.validate((res: any) => {
      resolve(res);
    });
  });
}
const close = () => {
  const obj = { path: "/tool/gen", query: { t: Date.now(), pageNum: route.query.pageNum } };
  proxy?.$tab.closeOpenPage(obj);
}

(async () => {
  const tableId = route.params && route.params.tableId as string;
  if (tableId) {
    // 获取表详细信息
    const res = await getGenTable(tableId);
    columns.value = res.data.rows;
    info.value = res.data.info;
    tables.value = res.data.tables;
    /** 查询字典下拉列表 */
    const response = await getDictOptionselect();
    dictOptions.value = response.data;
  }
})();
</script>
