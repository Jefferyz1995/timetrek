<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item :label="$t('memberManager.projectName')" prop="projectId">
            <el-input
              v-model="queryParams.projectId"
              :placeholder="$t('memberManager.projectName')"
              clearable
              style="width: 240px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item :label="$t('memberManager.memberName')" prop="memberUserId">
            <el-input v-model="queryParams.memberUserId" placeholder="Please enter member id" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item :label="$t('memberManager.memberRole')" prop="memberRole">
            <el-input v-model="queryParams.memberRole" placeholder="Please enter member role" clearable style="width: 240px" @keyup.enter="handleQuery" />
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
            <el-button
              type="primary"
              plain
              icon="Plus"
              @click="handleAdd"
              v-hasPermi="['system:projectMember:add']"
              >{{$t('commonBtn.add')}}</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="success"
              plain
              icon="Edit"
              :disabled="single"
              @click="handleUpdate()"
              v-hasPermi="['system:projectMember:edit']"
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
              v-hasPermi="['system:projectMember:remove']"
              >{{$t('commonBtn.delete')}}</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="warning"
              plain
              icon="Download"
              @click="handleExport"
              v-hasPermi="['system:projectMember:export']"
              >{{$t('commonBtn.export')}}</el-button
            >
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="projectMemberList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column :label="$t('memberManager.projectName')" align="center" prop="projectName" />
        <el-table-column :label="$t('memberManager.memberName')" align="center" prop="userName" />
        <el-table-column :label="$t('memberManager.memberRole')" align="center" prop="memberRole">
          <template #default="scope">
            <dict-tag :options="member_role" :value="scope.row.memberRole" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('commonColumn.remark')" align="center" prop="remark" />
        <el-table-column :label="$t('commonColumn.action')" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip :content="$t('commonBtn.edit')" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:projectMember:edit']"></el-button>
            </el-tooltip>
            <el-tooltip :content="$t('commonBtn.delete')" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:projectMember:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- Add or modify project group members dialog box -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="projectMemberFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item :label="$t('memberManager.projectName')" prop="projectId">
          <el-select v-model="form.projectId" :placeholder="$t('memberManager.projectName')">
            <el-option v-for="item in projectList" :key="item.id" :label="item.projectName" :value="item.id"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('memberManager.memberName')" prop="memberUserId">
          <el-select v-model="form.memberUserId" :placeholder="$t('memberManager.memberName')">
            <el-option v-for="item in userList" :key="item.userId" :label="item.nickName" :value="item.userId"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('memberManager.memberRole')" prop="memberRole">
          <el-radio-group v-model="form.memberRole">
            <el-radio v-for="dict in member_role" :key="dict.value" :label="dict.value">
              {{ dict.label }}
            </el-radio>
          </el-radio-group>
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

<script setup name="ProjectMember" lang="ts">
import { listProjectMember, getProjectMember, delProjectMember, addProjectMember, updateProjectMember } from '@/api/system/projectMember';
import { ProjectMemberVO, ProjectMemberQuery, ProjectMemberForm } from '@/api/system/projectMember/types';
import {listAllUser} from "@/api/system/user";
import {listAllProject} from "@/api/system/project";
import {UserVO} from "@/api/system/user/types";
import {ProjectVO} from "@/api/system/project/types";
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { member_role } = toRefs<any>(proxy?.useDict("member_role"));

const projectMemberList = ref<ProjectMemberVO[]>([]);
const userList=ref<UserVO[]>([])
const projectList=ref<ProjectVO[]>([])
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const projectMemberFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ProjectMemberForm = {
  id: undefined,
  projectId: undefined,
  memberUserId: undefined,
  memberGroupId: undefined,
  memberType: undefined,
  memberRole: undefined,
  remark: undefined
}
const data = reactive<PageData<ProjectMemberForm, ProjectMemberQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    projectId: undefined,
    memberUserId: undefined,
    memberGroupId: undefined,
    memberType: undefined,
    memberRole: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "Primary key id cannot be empty", trigger: "blur" }
    ],
    projectId: [
      { required: true, message: "Project id cannot be empty", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query the list of members in the project team */
const getList = async () => {
  loading.value = true;
  const res = await listProjectMember(queryParams.value);
  projectMemberList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}


const getAllUserList= async ()=>{
  const res = await listAllUser();
  userList.value=res.data

}

const getAllProject= async ()=>{
  const res = await listAllProject();
  projectList.value=res.data

}
/** Cancel button */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** form reset */
const reset = () => {
  form.value = {...initFormData};
  projectMemberFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: ProjectMemberVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** Add button operation */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "Add members to the project group";
}

/** Modify button actions */
const handleUpdate = async (row?: ProjectMemberVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getProjectMember(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "Modify project group members";
}

/** submit button */
const submitForm = () => {
  projectMemberFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateProjectMember(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addProjectMember(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("Submitted Successfully");
      dialog.visible = false;
      await getList();
    }
  });
}

/** Delete button action */
const handleDelete = async (row?: ProjectMemberVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Confirm to delete"' + _ids + '"?').finally(() => loading.value = false);
  await delProjectMember(_ids);
  proxy?.$modal.msgSuccess("Deleted Successfully");
  await getList();
}

/** export */
const handleExport = () => {
  proxy?.download('system/projectMember/export', {
    ...queryParams.value
  }, `projectMember_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
  getAllUserList();
  getAllProject();

});
</script>
