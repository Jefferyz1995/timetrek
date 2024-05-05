<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item :label="$t('projectManager.projectName')" prop="projectName">
            <el-input v-model="queryParams.projectName" placeholder="Project Name" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item :label="$t('projectManager.projectDescription')" prop="projectDescription">
            <el-input
              v-model="queryParams.projectDescription"
              placeholder="Project Description"
              clearable
              style="width: 240px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item :label="$t('projectManager.projectTarget')" prop="projectTarget">
            <el-input v-model="queryParams.projectTarget" placeholder="Project Target" clearable style="width: 240px" @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:project:add']">{{$t('commonBtn.add')}}</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="success"
              plain
              icon="Edit"
              :disabled="single"
              @click="handleUpdate()"
              v-hasPermi="['system:project:edit']"
              >{{$t('commonBtn.edit')}}</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="danger"
              plain
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete()"
              v-hasPermi="['system:project:remove']"
              >{{$t('commonBtn.delete')}}</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:project:export']">{{$t('commonBtn.export')}}</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="projectList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column :label="$t('projectManager.projectName')" align="center" prop="projectName" />
        <el-table-column :label="$t('projectManager.projectDescription')" align="center" prop="projectDescription" />
        <el-table-column :label="$t('projectManager.projectTarget')" align="center" prop="projectTarget" />
        <el-table-column :label="$t('commonColumn.remark')" align="center" prop="remark" />
        <el-table-column :label="$t('commonColumn.action')" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip :content="$t('commonBtn.edit')" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:project:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="Assign Task" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleAllocateTask(scope.row)" v-hasPermi="['system:project:edit']"></el-button>
            </el-tooltip>
            <el-tooltip :content="$t('commonBtn.delete')"  placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:project:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- Add or modify project dialog -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="projectFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item :label="$t('projectManager.projectName')" prop="projectName">
          <el-input v-model="form.projectName" :placeholder="$t('projectManager.projectName')" />
        </el-form-item>
        <el-form-item :label="$t('projectManager.projectDescription')" prop="projectDescription">
          <el-input v-model="form.projectDescription" :placeholder="$t('projectManager.projectDescription')" />
        </el-form-item>
        <el-form-item :label="$t('projectManager.projectTarget')" prop="projectTarget">
          <el-input v-model="form.projectTarget" :placeholder="$t('projectManager.projectTarget')" />
        </el-form-item>
        <el-form-item :label="$t('commonColumn.remark')" prop="remark">
          <el-input v-model="form.remark" type="textarea" :placeholder="$t('commonColumn.remark')" />
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

<script setup name="Project" lang="ts">
import { listProject, getProject, delProject, addProject, updateProject } from '@/api/system/project';
import { ProjectVO, ProjectQuery, ProjectForm } from '@/api/system/project/types';
import {RoleVO} from "@/api/system/role/types";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const router = useRouter();

const projectList = ref<ProjectVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const projectFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ProjectForm = {
  id: undefined,
  projectName: undefined,
  projectDescription: undefined,
  projectTarget: undefined,
  remark: undefined
}
const data = reactive<PageData<ProjectForm, ProjectQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    projectName: undefined,
    projectDescription: undefined,
    projectTarget: undefined,
    params: {
    }
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query project list */
const getList = async () => {
  loading.value = true;
  const res = await listProject(queryParams.value);
  projectList.value = res.rows;
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
  projectFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: ProjectVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** Add button operation */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "Add Project";
}

/** Modify button actions */
const handleUpdate = async (row?: ProjectVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getProject(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "Modify Project";
}
const handleAllocateTask = (row: ProjectVO) => {
  router.push("/project/projectTask?projectId=" + row.id);
}
/** Submit button */
const submitForm = () => {
  projectFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateProject(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addProject(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("Submitted Successfully");
      dialog.visible = false;
      await getList();
    }
  });
}

/** Delete button action */
const handleDelete = async (row?: ProjectVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Confirm to delete"' + _ids + '"?').finally(() => loading.value = false);
  await delProject(_ids);
  proxy?.$modal.msgSuccess("Deleted Successfully");
  await getList();
}

/** Export */
const handleExport = () => {
  proxy?.download('system/project/export', {
    ...queryParams.value
  }, `project_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
