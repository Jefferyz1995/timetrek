<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item :label="$t('taskManager.taskName')" prop="taskName">
            <el-input v-model="queryParams.taskName" :placeholder="$t('taskManager.taskName')" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item :label="$t('taskManager.taskDescription')" prop="taskDescription">
            <el-input v-model="queryParams.taskDescription" :placeholder="$t('taskManager.taskDescription')" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item :label="$t('taskManager.taskPIC')" prop="taskUserId">
            <el-input v-model="queryParams.taskUserId" :placeholder="$t('taskManager.taskPIC')" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item :label="$t('taskManager.taskPriority')" prop="taskImportant">
            <el-input
              v-model="queryParams.taskImportant"
              :placeholder="$t('taskManager.taskPriority')"
              clearable
              style="width: 240px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item :label="$t('taskManager.startTime')" prop="taskStartTime">
            <el-date-picker clearable v-model="queryParams.taskStartTime" type="date" value-format="YYYY-MM-DD" :placeholder="$t('taskManager.startTime')" />
          </el-form-item>
          <el-form-item :label="$t('taskManager.endTime')" prop="taskEndTime">
            <el-date-picker clearable v-model="queryParams.taskEndTime" type="date" value-format="YYYY-MM-DD" :placeholder="$t('taskManager.endTime')" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:projectTask:add']">{{$t('commonBtn.add')}}</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['system:projectTask:edit']"
              >{{$t('commonBtn.edit')}}</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:projectTask:remove']"
              >{{$t('commonBtn.delete')}}</el-button
            >
          </el-col>
          <!-- <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:projectTask:export']">{{$t('commonBtn.export')}}</el-button>
          </el-col> -->
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="projectTaskList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="80px" align="center" />
        <el-table-column :label="$t('taskManager.projectName')" align="center" prop="projectName" />
        <el-table-column :label="$t('taskManager.taskName')" align="center" prop="taskName" />
        <el-table-column :label="$t('taskManager.taskDescription')" align="center" prop="taskDescription" />
        <el-table-column :label="$t('taskManager.taskPIC')" align="center" prop="taskUserId" />
        <el-table-column :label="$t('taskManager.taskStatus')" align="center" prop="taskStatus">
          <template #default="scope">
            <dict-tag :options="project_task_status" :value="scope.row.taskStatus" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('taskManager.taskPriority')" align="center" prop="taskImportant">
          <template #default="scope">
            <dict-tag :options="project_task_important" :value="scope.row.taskImportant" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('taskManager.startTime')" align="center" prop="taskStartTime" width="180" />
        <el-table-column :label="$t('taskManager.endTime')" align="center" prop="taskEndTime" width="180" />
        <el-table-column :label="$t('commonColumn.remark')" align="center" prop="remark" />
        <el-table-column :label="$t('commonColumn.action')" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip :content="$t('commonBtn.edit')" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:projectTask:edit']"></el-button>
            </el-tooltip>
            <el-tooltip :content="$t('commonBtn.delete')" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:projectTask:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- Add or modify a project's task dialog box -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="projectTaskFormRef" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="Project" prop="projectId">
          <el-select v-model="form.projectId" placeholder="Please seletct project">
            <el-option v-for="item in projectList" :key="item.id" :label="item.projectName" :value="item.id"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('taskManager.taskName')" prop="taskName">
          <el-input v-model="form.taskName" :placeholder="$t('taskManager.taskName')" />
        </el-form-item>
        <el-form-item :label="$t('taskManager.taskDescription')" prop="taskDescription">
          <el-input v-model="form.taskDescription" :placeholder="$t('taskManager.taskDescription')" />
        </el-form-item>
        <el-form-item :label="$t('taskManager.taskPIC')" prop="taskUserId">
          <el-select v-model="form.taskUserId" :placeholder="$t('taskManager.taskPIC')">
            <el-option v-for="item in projectMemberList" :key="item.memberUserId" :label="item.userName" :value="item.memberUserId"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('taskManager.taskPriority')" prop="taskImportant">
          <el-radio v-model="form.taskImportant" v-for="dict in project_task_important" :key="dict.value" :label="dict.value">
            {{ dict.label }}
          </el-radio>
        </el-form-item>
        <el-form-item :label="$t('taskManager.taskStatus')" prop="taskStatus">
          <el-radio v-model="form.taskStatus" v-for="dict in project_task_status" :key="dict.value" :label="dict.value">
            {{ dict.label }}
          </el-radio>
        </el-form-item>
        <el-form-item :label="$t('taskManager.startTime')" prop="taskStartTime">
          <el-date-picker clearable v-model="form.taskStartTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Start Time">
          </el-date-picker>
        </el-form-item>
        <el-form-item :label="$t('taskManager.endTime')" prop="taskEndTime">
          <el-date-picker clearable v-model="form.taskEndTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="End Time">
          </el-date-picker>
        </el-form-item>
        <el-form-item :label="$t('commonColumn.remark')" prop="remark">
          <el-input v-model="form.remark" :placeholder="$t('commonColumn.remark')" />
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

<script setup name="ProjectTask" lang="ts">
import { listProjectTask, getProjectTask, delProjectTask, addProjectTask, updateProjectTask } from '@/api/system/projectTask';
import { ProjectTaskVO, ProjectTaskQuery, ProjectTaskForm } from '@/api/system/projectTask/types';
import {listAllProject} from "@/api/system/project";
import {listAllProjectMember} from "@/api/system/projectMember";
import {ProjectVO} from "@/api/system/project/types";
import {ProjectMemberQuery, ProjectMemberVO} from "@/api/system/projectMember/types";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const { project_task_important } = toRefs<any>(proxy?.useDict("project_task_important"));
const { project_task_status } = toRefs<any>(proxy?.useDict("project_task_status"));

const projectTaskList = ref<ProjectTaskVO[]>([]);
const projectList =ref<ProjectVO[]>([]);
const projectMemberList =ref<ProjectMemberVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const projectTaskFormRef = ref<ElFormInstance>();
const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});
const initFormData: ProjectTaskForm = {
  id: undefined,
  projectId: route.query.projectId as string,
  taskName: undefined,
  taskDescription: undefined,
  taskUserId: undefined,
  taskStatus: undefined,
  taskImportant: undefined,
  taskStartTime: undefined,
  taskEndTime: undefined,
  remark: undefined
}
const data = reactive<PageData<ProjectTaskForm, ProjectTaskQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    projectId: route.query.projectId as string,
    taskName: undefined,
    taskDescription: undefined,
    taskUserId: undefined,
    taskStatus: undefined,
    taskImportant: undefined,
    taskStartTime: undefined,
    taskEndTime: undefined,
    params: {
    }
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query the task list of a project */
const getList = async () => {
  loading.value = true;
  const res = await listProjectTask(queryParams.value);
  projectTaskList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

const getAllProjectList = async () => {
  const res = await listAllProject();
  projectList.value = res.data;
}

const getAllProjectMember =async()=>{
  let qry:ProjectMemberQuery={
    projectId:route.query.projectId as string
  }
  const  res= await listAllProjectMember(qry);
  projectMemberList.value=res.data
}
/** Cancel button */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** form reset */
const reset = () => {
  form.value = {...initFormData};
  projectTaskFormRef.value?.resetFields();
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

/** 多选框选中数据 */
const handleSelectionChange = (selection: ProjectTaskVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** Multiple selection box selected data */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "Add project tasks";
}

/** Modify button actions */
const handleUpdate = async (row?: ProjectTaskVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getProjectTask(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "Modify project tasks";
}

/** submit button */
const submitForm = () => {
  projectTaskFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if(queryParams.value.projectId !=null){
        form.value.projectId=queryParams.value.projectId
      }
      if (form.value.id) {
        await updateProjectTask(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addProjectTask(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("Modified successfully");
      dialog.visible = false;
      await getList();
    }
  });
}

/** Delete button action */
const handleDelete = async (row?: ProjectTaskVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Confirm to delete"' + _ids + '"?').finally(() => loading.value = false);
  await delProjectTask(_ids);
  proxy?.$modal.msgSuccess("Deleted Successfully");
  await getList();
}

/** Export button action */
const handleExport = () => {
  proxy?.download('system/projectTask/export', {
    ...queryParams.value
  }, `projectTask_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  console.log(route.query)
  getList();
  getAllProjectList();
  getAllProjectMember();
});
</script>
