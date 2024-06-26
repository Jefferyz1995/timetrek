<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="mb-[10px]" v-show="showSearch">
        <el-card shadow="hover">
          <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
            <el-form-item :label="$t('paramSetting.configName')" prop="configName">
              <el-input v-model="queryParams.configName" :placeholder="$t('paramSetting.configName')" clearable style="width: 240px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item :label="$t('paramSetting.configKey')" prop="configKey">
              <el-input v-model="queryParams.configKey" :placeholder="$t('paramSetting.configKey')" clearable style="width: 240px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item :label="$t('paramSetting.configType')" prop="configType">
              <el-select v-model="queryParams.configType" :placeholder="$t('paramSetting.configType')" clearable>
                <el-option v-for="dict in sys_yes_no" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('commonColumn.createTime')" style="width: 308px;">
              <el-date-picker
                v-model="dateRange"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="daterange"
                range-separator="-"
                :start-placeholder="$t('commonColumn.startTime')"
                :end-placeholder="$t('commonColumn.endTime')"
                :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
              ></el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">{{$t('commonBtn.search')}}</el-button>
              <el-button icon="Refresh" @click="resetQuery">{{$t('commonBtn.reset')}}</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>
    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:config:add']">{{$t('commonBtn.add')}}</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['system:config:edit']">
              Modify
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:config:remove']">
              {{$t('commonBtn.delete')}}</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="warning"
              plain
              icon="Download"
              @click="handleExport"
              v-hasPermi="['system:config:export']"
              >{{$t('commonBtn.export')}}</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Refresh" @click="handleRefreshCache" v-hasPermi="['system:config:remove']">刷新缓存</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="configList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="Param Primary Key" align="center" prop="configId" v-if="false" />
        <el-table-column :label="$t('paramSetting.configName')" align="center" prop="configName" :show-overflow-tooltip="true" />
        <el-table-column :label="$t('paramSetting.configKey')" align="center" prop="configKey" :show-overflow-tooltip="true" />
        <el-table-column :label="$t('paramSetting.configValue')" align="center" prop="configValue" :show-overflow-tooltip="true" />
        <el-table-column :label="$t('paramSetting.configType')" align="center" prop="configType">
          <template #default="scope">
            <dict-tag :options="sys_yes_no" :value="scope.row.configType" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('commonColumn.remark')" align="center" prop="remark" :show-overflow-tooltip="true" />
        <el-table-column :label="$t('commonColumn.createTime')" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('commonColumn.action')" align="center" width="150" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip :content="$t('commonBtn.edit')" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:config:edit']"></el-button>
            </el-tooltip>
            <el-tooltip :content="$t('commonBtn.delete')" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:config:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- Add or modify parameter configuration dialog box -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="configFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item :label="$t('paramSetting.configName')" prop="configName">
          <el-input v-model="form.configName" placeholder="Please enter parameter name" />
        </el-form-item>
        <el-form-item :label="$t('paramSetting.configKey')" prop="configKey">
          <el-input v-model="form.configKey" placeholder="Please enter parameter key name" />
        </el-form-item>
        <el-form-item :label="$t('paramSetting.configValue')" prop="configValue">
          <el-input v-model="form.configValue" placeholder="Please enter parameter key value" />
        </el-form-item>
        <el-form-item :label="$t('paramSetting.configType')" prop="configType">
          <el-radio-group v-model="form.configType">
            <el-radio v-for="dict in sys_yes_no" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('commonColumn.remark')" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="Please enter content" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">{{$t('commonBtn.submit')}}</el-button>
          <el-button @click="cancel">{{$t('commonBtn.cancel')}}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Config" lang="ts">
import { listConfig, getConfig, delConfig, addConfig, updateConfig, refreshCache } from "@/api/system/config";
import { ConfigForm, ConfigQuery, ConfigVO } from "@/api/system/config/types";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_yes_no } = toRefs<any>(proxy?.useDict("sys_yes_no"));

const configList = ref<ConfigVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<number | string>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRange = ref<[DateModelType, DateModelType]>(['', '']);

const queryFormRef = ref<ElFormInstance>();
const configFormRef = ref<ElFormInstance>();
const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});
const initFormData: ConfigForm = {
  configId: undefined,
  configName: '',
  configKey: '',
  configValue: '',
  configType: "Y",
  remark: ''
}
const data = reactive<PageData<ConfigForm, ConfigQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    configName: '',
    configKey: '',
    configType: '',
  },
  rules: {
    configName: [{ required: true, message: "Parameter name cannot be empty", trigger: "blur" }],
    configKey: [{ required: true, message: "Parameter key name cannot be empty", trigger: "blur" }],
    configValue: [{ required: true, message: "Parameter key value cannot be empty", trigger: "blur" }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query parameter list */
const getList = async () => {
  loading.value = true;
  const res = await listConfig(proxy?.addDateRange(queryParams.value, dateRange.value));
  configList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}
/** Cancel button */
const cancel = () => {
  reset();
  dialog.visible = false;
}
/** form reset */
const reset = () => {
  form.value = { ...initFormData };
  configFormRef.value?.resetFields();
}
/** Search button action */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}
/** reset button action */
const resetQuery = () => {
  dateRange.value = ['', ''];
  queryFormRef.value?.resetFields();
  handleQuery();
}
/** Multiple selection box selected data */
const handleSelectionChange = (selection: ConfigVO[]) => {
  ids.value = selection.map(item => item.configId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
/** Add button operation */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "Add parameters";
}
/** Modify button actions */
const handleUpdate = async (row?: ConfigVO) => {
  reset();
  const configId = row?.configId || ids.value[0];
  const res = await getConfig(configId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "Modify parameters";
}
/** submit button */
const submitForm = () => {
  configFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      form.value.configId ? await updateConfig(form.value) : await addConfig(form.value);
      proxy?.$modal.msgSuccess("Successful operation");
      dialog.visible = false;
      await getList();
    }
  });
}
/** Delete button action */
const handleDelete = async (row?: ConfigVO) => {
  const configIds = row?.configId || ids.value;
  await proxy?.$modal.confirm('Confirm to delete the data with parameter number"' + configIds + '"？');
  await delConfig(configIds);
  await getList();
  proxy?.$modal.msgSuccess("Successfully deleted");
}
/** Export button action */
const handleExport = () => {
  proxy?.download("system/config/export", {
    ...queryParams.value
  }, `config_${new Date().getTime()}.xlsx`);
}
/** Refresh cache button action */
const handleRefreshCache = async () => {
  await refreshCache();
  proxy?.$modal.msgSuccess("Refresh cache successfully");
}

onMounted(() => {
  getList();
})
</script>
