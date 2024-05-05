<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item label="groupName" prop="groupName">
            <el-input v-model="queryParams.groupName" placeholder="groupName" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">{{$t('commonBtn.search')}}</el-button>
            <el-button icon="Refresh" @click="resetQuery">{{$t('commonBtn.reset')}}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:projectGroup:add']">{{$t('commonBtn.add')}}</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['system:projectGroup:edit']">{{$t('commonBtn.edit')}}</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:projectGroup:remove']">{{$t('commonBtn.delete')}}</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:projectGroup:export']">{{$t('commonBtn.export')}}</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="projectGroupList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="groupName" align="center" prop="groupName" />
        <el-table-column :label="$t('commonColumn.remark')" align="center" prop="remark" />
        <el-table-column :label="$t('commonColumn.action')" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip :content="$t('commonBtn.edit')" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:projectGroup:edit']"></el-button>
            </el-tooltip>
            <el-tooltip :content="$t('commonBtn.delete')" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:projectGroup:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination
          v-show="total>0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
      />
    </el-card>
    <!-- Add or modify project group dialog box -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="projectGroupFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="groupName" prop="groupName">
          <el-input v-model="form.groupName" placeholder="groupName" />
        </el-form-item>
        <el-form-item :label="$t('commonColumn.remark')" prop="remark">
            <el-input v-model="form.remark" type="textarea" placeholder="remark" />
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

<script setup name="ProjectGroup" lang="ts">
import { listProjectGroup, getProjectGroup, delProjectGroup, addProjectGroup, updateProjectGroup } from '@/api/system/projectGroup';
import { ProjectGroupVO, ProjectGroupQuery, ProjectGroupForm } from '@/api/system/projectGroup/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const projectGroupList = ref<ProjectGroupVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const projectGroupFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ProjectGroupForm = {
  id: undefined,
  groupName: undefined,
  remark: undefined
}
const data = reactive<PageData<ProjectGroupForm, ProjectGroupQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    groupName: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "Primary key id cannot be empty", trigger: "blur" }
    ],
    groupName: [
      { required: true, message: "Project group name cannot be empty", trigger: "blur" }
    ],
    remark: [
      { required: true, message: "Remarks cannot be empty", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query project group list */
const getList = async () => {
  loading.value = true;
  const res = await listProjectGroup(queryParams.value);
  projectGroupList.value = res.rows;
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
  projectGroupFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: ProjectGroupVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** Add button operation */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "Add project group";
}

/** Modify button actions */
const handleUpdate = async (row?: ProjectGroupVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getProjectGroup(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "Modify project group";
}

/** submit button */
const submitForm = () => {
  projectGroupFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateProjectGroup(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addProjectGroup(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("Modified successfully");
      dialog.visible = false;
      await getList();
    }
  });
}

/** Delete button action */
const handleDelete = async (row?: ProjectGroupVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Confirm to delete"' + _ids + '"?').finally(() => loading.value = false);
  await delProjectGroup(_ids);
  proxy?.$modal.msgSuccess("Deleted Successfully");
  await getList();
}

/** Export button action */
const handleExport = () => {
  proxy?.download('system/projectGroup/export', {
    ...queryParams.value
  }, `projectGroup_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
