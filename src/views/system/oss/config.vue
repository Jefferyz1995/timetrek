<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="mb-[10px]" v-show="showSearch">
        <el-card shadow="hover">
          <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
            <el-form-item label="Configure key" prop="configKey">
              <el-input v-model="queryParams.configKey" placeholder="Configure key" clearable style="width: 200px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Bucket name" prop="bucketName">
              <el-input v-model="queryParams.bucketName" placeholder="Bucket name" clearable style="width: 200px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Default?" prop="status">
              <el-select v-model="queryParams.status" placeholder="Status" clearable style="width: 200px">
                <el-option key="0" label="Yes" value="0" />
                <el-option key="1" label="No" value="1" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="search" @click="handleQuery">{{$t('commonBtn.search')}}</el-button>
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:ossConfig:add']">{{$t('commonBtn.add')}}</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['system:ossConfig:edit']">{{$t('commonBtn.edit')}}</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:ossConfig:remove']">
              {{$t('commonBtn.delete')}}</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="ossConfigList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="Main ID" align="center" prop="ossConfigId" v-if="columns[0].visible" />
        <el-table-column label="Configure key" align="center" prop="configKey" v-if="columns[1].visible" />
        <el-table-column label="Endpoint" align="center" prop="endpoint" v-if="columns[2].visible" width="200" />
        <el-table-column label="Domain" align="center" prop="domain" v-if="columns[3].visible" width="200" />
        <el-table-column label="Bucket Name" align="center" prop="bucketName" v-if="columns[4].visible" />
        <el-table-column label="Prefix" align="center" prop="prefix" v-if="columns[5].visible" />
        <el-table-column label="Region" align="center" prop="region" v-if="columns[6].visible" />
        <el-table-column label="Bucket permission type" align="center" prop="accessPolicy" v-if="columns[7].visible">
          <template #default="scope">
            <el-tag type="warning" v-if="scope.row.accessPolicy === '0'">private</el-tag>
            <el-tag type="success" v-if="scope.row.accessPolicy === '1'">public</el-tag>
            <el-tag type="info" v-if="scope.row.accessPolicy === '2'">custom</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Default?" align="center" prop="status" v-if="columns[8].visible">
          <template #default="scope">
            <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @change="handleStatusChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column :label="$t('commonColumn.action')" fixed="right" align="center" width="150" class-name="small-padding">
          <template #default="scope">
            <el-tooltip :content="$t('commonBtn.edit')" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:ossConfig:edit']"></el-button>
            </el-tooltip>
            <el-tooltip :content="$t('commonBtn.delete')" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:ossConfig:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改对象存储配置对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="800px" append-to-body>
      <el-form ref="ossConfigFormRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="Configure key" prop="configKey">
          <el-input v-model="form.configKey" placeholder="Configure key" />
        </el-form-item>
        <el-form-item label="Endpoint" prop="endpoint">
          <el-input v-model="form.endpoint" placeholder="Endpoint" />
        </el-form-item>
        <el-form-item label="Domain" prop="domain">
          <el-input v-model="form.domain" placeholder="Domain" />
        </el-form-item>
        <el-form-item label="Access Key" prop="accessKey">
          <el-input v-model="form.accessKey" placeholder="Access Key" />
        </el-form-item>
        <el-form-item label="secretKey" prop="secretKey">
          <el-input v-model="form.secretKey" placeholder="请输入秘钥" show-password />
        </el-form-item>
        <el-form-item label="Bucket Name" prop="bucketName">
          <el-input v-model="form.bucketName" placeholder="Bucket Name" />
        </el-form-item>
        <el-form-item label="Prefix" prop="prefix">
          <el-input v-model="form.prefix" placeholder="Prefix" />
        </el-form-item>
        <el-form-item label="HTTPS?">
          <el-radio-group v-model="form.isHttps">
            <el-radio v-for="dict in sys_yes_no" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Bucket permission type">
          <el-radio-group v-model="form.accessPolicy">
            <el-radio label="0">private</el-radio>
            <el-radio label="1">public</el-radio>
            <el-radio label="2">custom</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Region" prop="region">
          <el-input v-model="form.region" placeholder="Region" />
        </el-form-item>
        <el-form-item :label="$t('commonColumn.remark')" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="Remark" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">{{$t('commonBtn.submit')}}</el-button>
          <el-button @click="cancel">{{$t('commonBtn.cancel')}}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="OssConfig" lang="ts">
import {
  listOssConfig,
  getOssConfig,
  delOssConfig,
  addOssConfig,
  updateOssConfig,
  changeOssConfigStatus
} from "@/api/system/ossConfig";
import { OssConfigForm, OssConfigQuery, OssConfigVO } from "@/api/system/ossConfig/types";


const { proxy } = getCurrentInstance() as ComponentInternalInstance
const { sys_yes_no } = toRefs<any>(proxy?.useDict("sys_yes_no"));

const ossConfigList = ref<OssConfigVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<number | string>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const ossConfigFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

// 列显隐信息
const columns = ref<FieldOption[]>([
  { key: 0, label: `Main ID`, visible: true },
  { key: 1, label: `Configure key`, visible: false },
  { key: 2, label: `Endpoint`, visible: true },
  { key: 3, label: `Domain`, visible: true },
  { key: 4, label: `Bucket Name`, visible: true },
  { key: 5, label: `Prefix`, visible: true },
  { key: 6, label: `Region`, visible: true },
  { key: 7, label: `Bucket permission type`, visible: true },
  { key: 8, label: `Status`, visible: true }
]);


const initFormData: OssConfigForm = {
  ossConfigId: undefined,
  configKey: '',
  accessKey: '',
  secretKey: '',
  bucketName: '',
  prefix: '',
  endpoint: '',
  domain: '',
  isHttps: "N",
  accessPolicy: "1",
  region: '',
  status: "1",
  remark: '',
}
const data = reactive<PageData<OssConfigForm, OssConfigQuery>>({
  form: { ...initFormData },
  // query parameters
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    configKey: '',
    bucketName: '',
    status: '',
  },
  rules: {
    configKey: [{ required: true, message: "Config Key cannot be empty", trigger: "blur" },],
    accessKey: [
      { required: true, message: "Access Key cannot be empty", trigger: "blur" },
      {
        min: 2,
        max: 200,
        message: "Access Key length must be between 2 and 100",
        trigger: "blur",
      },
    ],
    secretKey: [
      { required: true, message: "Secret Key cannot be empty", trigger: "blur" },
      {
        min: 2,
        max: 100,
        message: "Secret Key length must be between 2 and 100",
        trigger: "blur",
      },
    ],
    bucketName: [
      { required: true, message: "Bucket Name cannot be empty", trigger: "blur" },
      {
        min: 2,
        max: 100,
        message: "Bucket Name length must be between 2 and 100",
        trigger: "blur",
      },
    ],
    endpoint: [
      { required: true, message: "Endpoint cannot be empty", trigger: "blur" },
      {
        min: 2,
        max: 100,
        message: "Endpoint length must be between 2 and 100",
        trigger: "blur",
      },
    ],
    accessPolicy: [{ required: true, message: "Access Policy cannot be empty", trigger: "blur" }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query object storage configuration list */
const getList = async () => {
  loading.value = true;
  const res = await listOssConfig(queryParams.value);
  ossConfigList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}
/** Cancel button */
const cancel = () => {
  dialog.visible = false;
  reset();
}
/** form reset */
const reset = () => {
  form.value = { ...initFormData };
  ossConfigFormRef.value?.resetFields();
}
/** Search button action */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}
/** reset button action */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
}
/** Select the number of items  */
const handleSelectionChange = (selection: OssConfigVO[]) => {
  ids.value = selection.map(item => item.ossConfigId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
/** Add button operation */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "Add object storage configuration";
}
/** Modify button actions */
const handleUpdate = async (row?: OssConfigVO) => {
  reset();
  const ossConfigId = row?.ossConfigId || ids.value[0];
  const res = await getOssConfig(ossConfigId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "Modify object storage configuration";
}
/** submit button */
const submitForm = () => {
  ossConfigFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.ossConfigId) {
        await updateOssConfig(form.value).finally(() => buttonLoading.value = false);
      } else {
        await addOssConfig(form.value).finally(() => buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("Added Successfully");
      dialog.visible = false;
      await getList();
    }
  });
}
/** Modify status  */
const handleStatusChange = async (row: OssConfigVO) => {
  let text = row.status === "0" ? "Enable" : "Disable";
  try {
    await proxy?.$modal.confirm('Confirm to"' + text + '""' + row.configKey + '"?');
    await changeOssConfigStatus(row.ossConfigId, row.status, row.configKey);
    await getList()
    proxy?.$modal.msgSuccess(text + "Successfully");
  } catch { return } finally {
    row.status = row.status === "0" ? "1" : "0";
  }

}
/** delete */
const handleDelete = async (row?: OssConfigVO) => {
  const ossConfigIds = row?.ossConfigId || ids.value;
  await proxy?.$modal.confirm('Confirm to delete"' + ossConfigIds + '"?');
  loading.value = true;
  await delOssConfig(ossConfigIds).finally(() => loading.value = false);
  await getList();
  proxy?.$modal.msgSuccess("Successfully deleted");

}

onMounted(() => {
  getList();
})
</script>
