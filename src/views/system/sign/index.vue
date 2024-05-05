<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item label="User No." prop="userId">
            <el-input v-model="queryParams.userId" placeholder="" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">Search</el-button>
            <el-button icon="Refresh" @click="resetQuery">Reset</el-button>
          </el-form-item>
        </el-form>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:sign:add']">Add</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['system:sign:edit']">Modify</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:sign:remove']"
              >Delete</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:sign:export']">Export</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="signList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="User No." align="center" prop="userName" />
        <el-table-column label="Type" align="center" prop="signType">
          <template #default="scope">
            <dict-tag :options="sign_type" :value="scope.row.signType" />
          </template>
        </el-table-column>
        <el-table-column label="Sign Time" align="center" prop="createTime" />
        <el-table-column label="remark" align="center" prop="remark" />
        <el-table-column label="Action" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="Modify" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:sign:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="Delete" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:sign:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- Add or modify user sign-in dialog box -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="signFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="User ID" prop="userId">
          <el-input v-model="form.userId" placeholder="User ID" />
        </el-form-item>
        <el-form-item label="Remark" prop="remark">
          <el-input v-model="form.remark" placeholder="Please enter remarks" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">Confirm</el-button>
          <el-button @click="cancel">Cancel</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Sign" lang="ts">
import { listSign, getSign, delSign, addSign, updateSign } from '@/api/system/sign';
import { SignVO, SignQuery, SignForm } from '@/api/system/sign/types';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sign_type } = toRefs<any>(proxy?.useDict('sign_type'));


const signList = ref<SignVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const signFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: SignForm = {
  id: undefined,
  userId: undefined,
  signType: undefined,
  remark: undefined
}
const data = reactive<PageData<SignForm, SignQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userId: undefined,
    signType: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "Primary key id cannot be empty", trigger: "blur" }
    ],
    userId: [
      { required: true, message: "User id cannot be empty", trigger: "blur" }
    ],
    signType: [
      { required: true, message: "Clock-in type cannot be empty", trigger: "change" }
    ],
    remark: [
      { required: true, message: "Remark cannot be empty", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query user check-in list */
const getList = async () => {
  loading.value = true;
  const res = await listSign(queryParams.value);
  signList.value = res.rows;
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
  form.value = {...initFormData};
  signFormRef.value?.resetFields();
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

/** Multiple selection box selected data */
const handleSelectionChange = (selection: SignVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** Add button operation */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "Add user Clock-in/out";
}

/** Modify button actions */
const handleUpdate = async (row?: SignVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getSign(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "Modify user clock-in/out";
}

/** submit button */
const submitForm = () => {
  signFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateSign(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addSign(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("Modified successfully");
      dialog.visible = false;
      await getList();
    }
  });
}

/** Delete button action */
const handleDelete = async (row?: SignVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Confirm to delete"' + _ids + '"?').finally(() => loading.value = false);
  await delSign(_ids);
  proxy?.$modal.msgSuccess("Successfully deleted");
  await getList();
}

/** Export button action */
const handleExport = () => {
  proxy?.download('system/sign/export', {
    ...queryParams.value
  }, `sign_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
