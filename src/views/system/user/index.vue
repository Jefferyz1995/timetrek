<template>
  <div class="p-2">
    <el-row :gutter="20">

      <el-col :lg="4" :xs="24" style="">
        <el-card shadow="hover">
          <el-input v-model="deptName" :placeholder="$t('userManager.deptName')" prefix-icon="Search" clearable />
          <el-tree
            class="mt-2"
            ref="deptTreeRef"
            node-key="id"
            :data="deptOptions"
            :props="{ label: 'label', children: 'children' }"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            highlight-current
            default-expand-all
            @node-click="handleNodeClick"
          />
        </el-card>
      </el-col>
      <el-col :lg="20" :xs="24">
        <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
          <div class="mb-[10px]" v-show="showSearch">
            <el-card shadow="hover">
              <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="100px">
                <el-form-item :label="$t('userManager.userName')" prop="userName">
                  <el-input
                    v-model="queryParams.userName"
                    :placeholder="$t('userManager.userName')"
                    clearable
                    style="width: 240px"
                    @keyup.enter="handleQuery"
                  />
                </el-form-item>
                <el-form-item :label="$t('userManager.phonenumber')" prop="phonenumber">
                  <el-input
                    v-model="queryParams.phonenumber"
                    :placeholder="$t('userManager.phonenumber')"
                    clearable
                    style="width: 240px"
                    @keyup.enter="handleQuery"
                  />
                </el-form-item>

                <el-form-item :label="$t('commonColumn.status')" prop="status">
                  <el-select v-model="queryParams.status" :placeholder="$t('userManager.status')" clearable style="width: 240px">
                    <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
                  </el-select>
                </el-form-item>
                <el-form-item :label="$t('commonColumn.createTime')" style="width: 308px;">
                  <el-date-picker
                    v-model="dateRange"
                    value-format="YYYY-MM-DD"
                    type="daterange"
                    range-separator="-"
                    :start-placeholder="$t('commonColumn.startTime')"
                    :end-placeholder="$t('commonColumn.endTime')"
                  ></el-date-picker>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleQuery" icon="Search">{{$t('commonBtn.search')}}</el-button>
                  <el-button @click="resetQuery" icon="Refresh">{{$t('commonBtn.reset')}}</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </div>
        </transition>

        <el-card shadow="hover">
          <template #header>
            <el-row :gutter="10">
              <el-col :span="1.5">
                <el-button type="primary" plain @click="handleAdd()" v-has-permi="['system:user:add']" icon="Plus">{{$t('commonBtn.add')}}</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="success" plain @click="handleUpdate()" :disabled="single" v-has-permi="['system:user:add']" icon="Edit">
                  {{$t('commonBtn.edit')}}
                </el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="danger" plain @click="handleDelete()" :disabled="multiple" v-has-permi="['system:user:delete']" icon="Delete">
                  {{$t('commonBtn.delete')}}
                </el-button>
              </el-col>
              <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns" :search="true"></right-toolbar>
            </el-row>
          </template>

          <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column label="用户编号" align="center" key="userId" prop="userId" v-if="columns[0].visible" />
            <el-table-column
              :label="$t('userManager.userName')"
              align="center"
              key="userName"
              prop="userName"
              v-if="columns[1].visible"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              :label="$t('userManager.nickName')"
              align="center"
              key="nickName"
              prop="nickName"
              v-if="columns[2].visible"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              :label="$t('userManager.deptName')"
              align="center"
              key="deptName"
              prop="dept.deptName"
              v-if="columns[3].visible"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              :label="$t('userManager.phonenumber')"
              align="center"
              key="phonenumber"
              prop="phonenumber"
              v-if="columns[4].visible"
              width="120"
            />
            <el-table-column :label="$t('userManager.status')" align="center" key="status" v-if="columns[5].visible">
              <template #default="scope">
                <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @change="handleStatusChange(scope.row)"></el-switch>
              </template>
            </el-table-column>

            <el-table-column :label="$t('userManager.createTime')" align="center" prop="createTime" v-if="columns[6].visible" width="160">
              <template #default="scope">
                <span>{{ scope.row.createTime }}</span>
              </template>
            </el-table-column>

            <el-table-column :label="$t('userManager.action')" fixed="right" width="180" class-name="small-padding fixed-width">
              <template #default="scope">
                <el-tooltip :content="$t('commonBtn.edit')" placement="top" v-if="scope.row.userId !== 1">
                  <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:user:edit']"></el-button>
                </el-tooltip>
                <el-tooltip :content="$t('commonBtn.delete')" placement="top" v-if="scope.row.userId !== 1">
                  <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:user:remove']"></el-button>
                </el-tooltip>
                <el-tooltip content="Reset Password" placement="top" v-if="scope.row.userId !== 1">
                  <el-button link type="primary" icon="Key" @click="handleResetPwd(scope.row)" v-hasPermi="['system:user:resetPwd']"></el-button>
                </el-tooltip>

                <el-tooltip content="Assign Role" placement="top" v-if="scope.row.userId !== 1">
                  <el-button link type="primary" icon="CircleCheck" @click="handleAuthRole(scope.row)" v-hasPermi="['system:user:edit']"></el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>

          <pagination
            v-show="total > 0"
            :total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="getList"
          />
        </el-card>
      </el-col>
    </el-row>


    <el-dialog ref="formDialogRef" :title="dialog.title" v-model="dialog.visible" width="600px" append-to-body @close="closeDialog">
      <el-form :model="form" :rules="rules" ref="userFormRef" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('userManager.nickName')" prop="nickName">
              <el-input v-model="form.nickName" :placeholder="$t('userManager.nickName')" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('userManager.deptName')" prop="deptId">
              <el-tree-select
                v-model="form.deptId"
                :data="deptOptions"
                :props="{ value: 'id', label: 'label', children: 'children' }"
                value-key="id"
                :placeholder="$t('userManager.deptName')"
                check-strictly
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('userManager.phonenumber')" prop="phonenumber">
              <el-input v-model="form.phonenumber" :placeholder="$t('userManager.phonenumber')" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('userManager.email')" prop="email">
              <el-input v-model="form.email" :placeholder="$t('userManager.email')" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item v-if="form.userId == undefined" :label="$t('userManager.userName')" prop="userName">
              <el-input v-model="form.userName" :placeholder="$t('userManager.userName')" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.userId == undefined" :label="$t('userManager.password')" prop="password">
              <el-input v-model="form.password"  :placeholder="$t('userManager.password')" type="password" maxlength="20" show-password />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('userManager.sex')">
              <el-select v-model="form.sex"  :label="$t('userManager.sex')">
                <el-option v-for="dict in sys_user_sex" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('commonColumn.status')">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">{{
                  dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('userManager.post')">
              <el-select v-model="form.postIds" multiple  :label="$t('userManager.post')">
                <el-option
                  v-for="item in postOptions"
                  :key="item.postId"
                  :label="item.postName"
                  :value="item.postId"
                  :disabled="item.status == '1'"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('userManager.role')">
              <el-select v-model="form.roleIds" multiple :placeholder="$t('userManager.role')">
                <el-option
                  v-for="item in roleOptions"
                  :key="item.roleId"
                  :label="item.roleName"
                  :value="item.roleId"
                  :disabled="item.status == '1'"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$t('commonColumn.remark')">
              <el-input v-model="form.remark" type="textarea" placeholder="Please input remark"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">{{$t('commonBtn.submit')}}</el-button>
          <el-button @click="cancel()">{{$t('commonBtn.cancel')}}</el-button>
        </div>
      </template>
    </el-dialog>


    <el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>
      <el-upload
        ref="uploadRef"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <el-icon class="el-icon--upload">
          <i-ep-upload-filled />
        </el-icon>
        <div class="el-upload__text">Drap the file here, or<em>upload</em></div>
        <template #tip>
          <div class="text-center el-upload__tip">
            <div class="el-upload__tip"><el-checkbox v-model="upload.updateSupport" />Confirm to update the existing user data</div>
            <span>xls、xlsx</span>
            <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" @click="importTemplate">下载模板</el-link>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">{{$t('commonBtn.submit')}}</el-button>
          <el-button @click="upload.open = false">{{$t('commonBtn.cancel')}}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="User" lang="ts">
import api from "@/api/system/user"
import { UserForm, UserQuery, UserVO } from '@/api/system/user/types';
import { treeselect } from "@/api/system/dept";
import { DeptVO } from "@/api/system/dept/types";
import { RoleVO } from "@/api/system/role/types";
import { PostVO } from "@/api/system/post/types";
import { to } from "await-to-js";
import { globalHeaders } from "@/utils/request";

const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance
const { sys_normal_disable, sys_user_sex } = toRefs<any>(proxy?.useDict('sys_normal_disable', 'sys_user_sex'));

const userList = ref<UserVO[]>();
const loading = ref(true);
const showSearch = ref(true)
const ids = ref<Array<number | string>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRange = ref<[DateModelType, DateModelType]>(['', '']);
const deptName = ref('');
const deptOptions = ref<DeptVO[]>([]);
const initPassword = ref<string>('');
const postOptions = ref<PostVO[]>([]);
const roleOptions = ref<RoleVO[]>([]);

const upload = reactive<ImportOption>({

  open: false,

  title: "",

  isUploading: false,

  updateSupport: 0,

  headers: globalHeaders(),

  url: import.meta.env.VITE_APP_BASE_API + "/system/user/importData"
})

const columns = ref<FieldOption[]>([
  { key: 0, label: `User ID`, visible: false,children: [] },
  { key: 1, label: `User Name`, visible: true,children: [] },
  { key: 2, label: `User Name`, visible: true,children: [] },
  { key: 3, label: `Dept`, visible: true,children: [] },
  { key: 4, label: `Contack No.`, visible: true,children: [] },
  { key: 5, label: `Status`, visible: true,children: [] },
  { key: 6, label: `Creation Time`, visible: true,children: [] }
])


const deptTreeRef = ref<ElTreeInstance>();
const queryFormRef = ref<ElFormInstance>();
const userFormRef = ref<ElFormInstance>();
const uploadRef = ref<ElUploadInstance>();
const formDialogRef = ref<ElDialogInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: UserForm = {
  userId: undefined,
  deptId: undefined,
  bankNum:undefined,
  userName: '',
  nickName: undefined,
  password: '',
  phonenumber: undefined,
  email: undefined,
  sex: undefined,
  status: "0",
  remark: '',
  postIds: [],
  roleIds: []
}
const data = reactive<PageData<UserForm, UserQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userName: '',
    phonenumber: '',
    status: '',
    deptId: ''
  },
  rules: {
    userName: [{ required: true, message: "User ID", trigger: "blur" }, ],
    nickName: [{ required: true, message: "User Code", trigger: "blur" }],
    password: [{ required: true, message: "Password", trigger: "blur" },],
    email: [{ type: "email", message: "Email", trigger: ["blur", "change"] }],
  }
})

const { queryParams, form, rules } = toRefs<PageData<UserForm, UserQuery>>(data)


const filterNode = (value: string, data: any) => {
  if (!value) return true
  return data.label.indexOf(value) !== -1
}

watchEffect(
  () => { deptTreeRef.value?.filter(deptName.value); },
  {
    flush: 'post'
  }
);


const getTreeSelect = async () => {
  const res = await api.deptTreeSelect();
  deptOptions.value = res.data;
};


const getList = async () => {
  loading.value = true;
  const res = await api.listUser(proxy?.addDateRange(queryParams.value, dateRange.value));
  loading.value = false;
  userList.value = res.rows;
  total.value = res.total;
}


const handleNodeClick = (data: DeptVO) => {
  queryParams.value.deptId = data.id;
  handleQuery()
}



const handleQuery = () => {
  queryParams.value.pageNum = 1
  getList()
}

const resetQuery = () => {
  dateRange.value = ['', '']
  queryFormRef.value?.resetFields();
  queryParams.value.pageNum = 1;
  queryParams.value.deptId = undefined;
  deptTreeRef.value?.setCurrentKey(undefined);
  handleQuery();
}


const handleDelete = async (row?: UserVO) => {
  const userIds = row?.userId || ids.value;
  const [err] = await to(proxy?.$modal.confirm('Confirm to delete"' + userIds + '"?') as any);
  if (!err) {
    await api.delUser(userIds);
    await getList();
    proxy?.$modal.msgSuccess("Successfully deleted");
  }
}

/** Change the user status  */
const handleStatusChange = async (row: UserVO) => {
  let text = row.status === "0" ? "Enable" : "Disable"
  try {
    await proxy?.$modal.confirm('Confirm to"' + text + '""' + row.userName + '"?');
    await api.changeUserStatus(row.userId, row.status);
    proxy?.$modal.msgSuccess(text + "Success");
  } catch (err) {
    row.status = row.status === "0" ? "1" : "0";
  }
}

const handleAuthRole = (row: UserVO) => {
  const userId = row.userId;
  router.push("/system/user-auth/role/" + userId);
}

/** reset password */
const handleResetPwd = async (row: UserVO) => {
  const [err, res] = await to(ElMessageBox.prompt('Please enter"' + row.userName + '" new password', "Reminder", {
    confirmButtonText: "Confirm",
    cancelButtonText: "Cancel",
    closeOnClickModal: false,
    inputPattern: /^.{5,20}$/,
    inputErrorMessage: "Password length must be between 5 and 20 5 和 20 之间",
  }))
  if (!err) {
    await api.resetUserPwd(row.userId, res.value);
    proxy?.$modal.msgSuccess("Success, new password is " + res.value);
  }
}


const handleSelectionChange = (selection: UserVO[]) => {
  ids.value = selection.map((item) => item.userId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** import */
const handleImport = () => {
  upload.title = "Import";
  upload.open = true;
}
/** Export */
const handleExport = () => {
  proxy?.download("system/user/export", {
    ...queryParams.value,
  }, `user_${new Date().getTime()}.xlsx`);
};
/** Download template */
const importTemplate = () => {
  proxy?.download("system/user/importTemplate", {
  }, `user_template_${new Date().getTime()}.xlsx`);
}

/**文件上传中处理 */
const handleFileUploadProgress = () => {
  upload.isUploading = true;
}

const handleFileSuccess = (response: any, file: UploadFile) => {
  upload.open = false;
  upload.isUploading = false;
  uploadRef.value?.handleRemove(file);
  ElMessageBox.alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", { dangerouslyUseHTMLString: true });
  getList();
}

/** upload */
function submitFileForm() {
  uploadRef.value?.submit();
}


const initTreeData = async () => {

  if (deptOptions.value === undefined) {
    const { data } = await treeselect();
    deptOptions.value = data;
  }
}


/** reset */
const reset = () => {
  form.value = { ...initFormData };
  userFormRef.value?.resetFields();
}
/** Cancel */
const cancel = () => {
  dialog.visible = false;
  reset();
}

/** Add */
const handleAdd = async () => {
  reset();
  const { data } = await api.getUser();
  dialog.visible = true;
  dialog.title = "Add User";
  await initTreeData();
  postOptions.value = data.posts;
  roleOptions.value = data.roles;
  form.value.password = initPassword.value.toString();
}
/** Modify */
const handleUpdate = async (row?: UserForm) => {
  reset();
  const userId = row?.userId || ids.value[0]
  const { data } = await api.getUser(userId)
  dialog.visible = true;
  dialog.title = "Modify User";
  await initTreeData();
  Object.assign(form.value, data.user);
  postOptions.value = data.posts;
  roleOptions.value = data.roles;
  form.value.postIds = data.postIds;
  form.value.roleIds = data.roleIds;
  form.value.password = "";
}

/** submit */
const submitForm = () => {
  userFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      form.value.userId ? await api.updateUser(form.value) : await api.addUser(form.value);
      proxy?.$modal.msgSuccess("Success");
      dialog.visible = false;
      await getList();
    }
  })
}


/**
 * close
 */
const closeDialog = () => {
  dialog.visible = false;
  resetForm();
}

/**
 * reset
 */
const resetForm = () => {
  userFormRef.value?.resetFields();
  userFormRef.value?.clearValidate();

  form.value.id = undefined;
  form.value.status = '1';
}
onMounted(() => {
  getTreeSelect()
  getList()
  proxy?.getConfigKey("sys.user.initPassword").then(response => {
    initPassword.value = response.data;
  });
});
</script>

<style lang="scss" scoped></style>
