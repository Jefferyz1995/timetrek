<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="mb-[10px]" v-show="showSearch">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="100px">
            <el-form-item :label="$t('roleManager.roleName')" prop="roleName">
              <el-input
                v-model="queryParams.roleName"
                :placeholder="$t('roleManager.roleName')"
                clearable
                style="width: 240px"
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item :label="$t('roleManager.roleKey')" prop="roleKey">
              <el-input
                v-model="queryParams.roleKey"
                :placeholder="$t('roleManager.roleKey')"
                clearable
                style="width: 240px"
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item :label="$t('commonColumn.status')" prop="status">
              <el-select v-model="queryParams.status" :placeholder="$t('commonColumn.status')" clearable style="width: 240px">
                <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('commonColumn.createTime')" style="width: 308px">
              <el-date-picker
                v-model="dateRange"
                value-format="YYYY-MM-DD"
                type="daterange"
                range-separator="-"
                :start-placeholder="$t('commonColumn.startTime')"
                :end-placeholder="$t('commonColumn.endTime')"
                :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
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
            <el-button type="primary" plain @click="handleAdd()" icon="Plus" v-hasPermi="['system:role:add']">{{$t('commonBtn.add')}}</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="success"
              plain
              @click="handleUpdate()"
              :disabled="single"
              icon="Edit"
              v-hasPermi="['system:role:edit']"
              >{{$t('commonBtn.edit')}}</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="danger"
              plain
              :disabled="ids.length === 0"
              @click="handleDelete()"
              v-hasPermi="['system:role:delete']"
              >{{$t('commonBtn.delete')}}</el-button
            >
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table ref="roleTableRef" v-loading="loading" :data="roleList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column :label="$t('roleManager.roleName')" prop="roleName" :show-overflow-tooltip="true" width="150" />
        <el-table-column :label="$t('roleManager.roleKey')" prop="roleKey" :show-overflow-tooltip="true" width="200" />
        <el-table-column :label="$t('roleManager.roleSort')" prop="roleSort" width="100" />
        <el-table-column :label="$t('commonColumn.status')" align="center" width="100">
          <template #default="scope">
            <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @change="handleStatusChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column :label="$t('commonColumn.createTime')" align="center" prop="createTime">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>

        <el-table-column fixed="right" :label="$t('commonColumn.action')" width="180">
          <template #default="scope">
            <el-tooltip :content="$t('commonBtn.edit')" placement="top" v-if="scope.row.roleId !== 1">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:role:edit']"></el-button>
            </el-tooltip>
            <el-tooltip :content="$t('commonBtn.delete')" placement="top" v-if="scope.row.roleId !== 1">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:role:remove']"></el-button>
            </el-tooltip>
            <el-tooltip :content="$t('roleManager.roleDataScope')" placement="top" v-if="scope.row.roleId !== 1">
              <el-button link type="primary" icon="CircleCheck" @click="handleDataScope(scope.row)" v-hasPermi="['system:role:edit']"></el-button>
            </el-tooltip>
            <el-tooltip :content="$t('roleManager.roleAuthUser')" placement="top" v-if="scope.row.roleId !== 1">
              <el-button link type="primary" icon="User" @click="handleAuthUser(scope.row)" v-hasPermi="['system:role:edit']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>

    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="roleFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item :label="$t('roleManager.roleName')" prop="roleName">
          <el-input v-model="form.roleName" :placeholder="$t('roleManager.roleName')" />
        </el-form-item>
        <el-form-item prop="roleKey">
          <template #label>
            <span>
              <el-tooltip content="For example：@SaCheckRole('admin')" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
              {{$t('roleManager.roleKey')}}
            </span>
          </template>
          <el-input v-model="form.roleKey" :placeholder="$t('roleManager.roleKey')" />
        </el-form-item>
        <el-form-item :label="$t('roleManager.roleSort')" prop="roleSort">
          <el-input-number v-model="form.roleSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item :label="$t('commonColumn.status')">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">{{
              dict.label
            }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('roleManager.roleMenuPermission')">
          <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">Unfold/fold</el-checkbox>
          <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">Select all/Select none</el-checkbox>
          <el-checkbox v-model="form.menuCheckStrictly" @change="handleCheckedTreeConnect($event, 'menu')">Father-son interaction</el-checkbox>
          <el-tree
            class="tree-border"
            :data="menuOptions"
            show-checkbox
            ref="menuRef"
            node-key="id"
            :check-strictly="!form.menuCheckStrictly"
            empty-text="Loading, please wait"
            :props="{ label: 'label', children: 'children' }"
          ></el-tree>
        </el-form-item>
        <el-form-item :label="$t('commonColumn.remark')">
          <el-input v-model="form.remark" type="textarea" placeholder="Please input content"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">{{$t('commonBtn.submit')}}</el-button>
          <el-button @click="cancel">{{$t('commonBtn.cancel')}}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Assign role data permissions dialog box -->
    <el-dialog :title="dialog.title" v-model="openDataScope" width="500px" append-to-body>
      <el-form :model="form" label-width="80px" ref="dataScopeRef">
        <el-form-item :label="$t('roleManager.roleName')">
          <el-input v-model="form.roleName" :disabled="true" />
        </el-form-item>
        <el-form-item :label="$t('roleManager.roleKey')">
          <el-input v-model="form.roleKey" :disabled="true" />
        </el-form-item>
        <el-form-item :label="$t('roleManager.roleDataScope')">
          <el-select v-model="form.dataScope" @change="dataScopeSelectChange">
            <el-option v-for="item in dataScopeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('roleManager.roleMenuPermission')" v-show="form.dataScope === '2'">
          <el-checkbox v-model="deptExpand" @change="handleCheckedTreeExpand($event, 'dept')">Unfold/fold</el-checkbox>
          <el-checkbox v-model="deptNodeAll" @change="handleCheckedTreeNodeAll($event, 'dept')">Select all/Select none</el-checkbox>
          <el-checkbox v-model="form.deptCheckStrictly" @change="handleCheckedTreeConnect($event, 'dept')">Father-son interaction</el-checkbox>
          <el-tree
            class="tree-border"
            :data="deptOptions"
            show-checkbox
            default-expand-all
            ref="deptRef"
            node-key="id"
            :check-strictly="!form.deptCheckStrictly"
            empty-text="Loading, please wait"
            :props="{ label: 'label', children: 'children' }"
          ></el-tree>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitDataScope">{{$t('commonBtn.submit')}}</el-button>
          <el-button @click="cancelDataScope">{{$t('commonBtn.cancel')}}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Role" lang="ts">
import { addRole, changeRoleStatus, dataScope, delRole, getRole, listRole, updateRole, deptTreeSelect } from "@/api/system/role";
import { roleMenuTreeselect, treeselect as menuTreeselect } from '@/api/system/menu/index';
import { RoleVO, RoleForm, RoleQuery, DeptTreeOption } from '@/api/system/role/types';
import { MenuTreeOption, RoleMenuTree } from '@/api/system/menu/types';

const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable } = toRefs<any>(proxy?.useDict('sys_normal_disable'));

const roleList = ref<RoleVO[]>();
const loading = ref(true)
const showSearch = ref(true)
const ids = ref<Array<string | number>>([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const dateRange = ref<[DateModelType, DateModelType]>(['', ''])
const menuOptions = ref<MenuTreeOption[]>([])
const menuExpand = ref(false)
const menuNodeAll = ref(false)
const deptExpand = ref(true)
const deptNodeAll = ref(false)
const deptOptions = ref<DeptTreeOption[]>([])
const openDataScope = ref(false)

/** 数据范围选项*/
const dataScopeOptions = ref([
  { value: "1", label: "All data" },
  { value: "2", label: "Custom data" },
  { value: "3", label: "Dept data" },
  { value: "4", label: "Dept & Sub-Dept data" },
  { value: "5", label: "Only personal data" }
])

const queryFormRef = ref<ElFormInstance>();
const roleFormRef = ref<ElFormInstance>();
const dataScopeRef = ref<ElFormInstance>();
const menuRef = ref<ElTreeInstance>();
const deptRef = ref<ElTreeInstance>();

const initForm: RoleForm = {
  roleId: undefined,
  roleSort: 1,
  status: '0',
  roleName: '',
  roleKey: '',
  menuCheckStrictly: true,
  deptCheckStrictly: true,
  remark: '',
  dataScope: '1',
  menuIds: [],
  deptIds: [],
}

const data = reactive<PageData<RoleForm, RoleQuery>>({
  form: { ...initForm },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    roleName: '',
    roleKey: '',
    status: '',
  },
  rules: {
    roleName: [{ required: true, message: "Role name cannot be empty", trigger: "blur" }],
    roleKey: [{ required: true, message: "Permission characters cannot be empty", trigger: "blur" }],
    roleSort: [{ required: true, message: "Role order cannot be empty", trigger: "blur" }]
  }
})
const { form, queryParams, rules } = toRefs(data)

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

/**
 * Query role list
 */
const getList = () => {
  loading.value = true
  listRole(proxy?.addDateRange(queryParams.value, dateRange.value)).then(res => {
    roleList.value = res.rows
    total.value = res.total
    loading.value = false
  })
}

/**
 * Search button action
 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** reset */
const resetQuery = () => {
  dateRange.value = ['', '']
  queryFormRef.value?.resetFields();
  handleQuery();
}
/**Delete button action */
const handleDelete = async (row?: RoleVO) => {
  const roleids = row?.roleId || ids.value;
  await proxy?.$modal.confirm('Confirm to delete' + roleids + '?');
  await delRole(roleids);
  getList();
  proxy?.$modal.msgSuccess('Successfully deleted');
}

/** Export button action */
const handleExport = () => {
  proxy?.download("system/role/export", {
    ...queryParams.value,
  }, `role_${new Date().getTime()}.xlsx`)
}
/** Multiple selection box selected data */
const handleSelectionChange = (selection: RoleVO[]) => {
  ids.value = selection.map((item: RoleVO) => item.roleId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** Character status modification */
const handleStatusChange = async (row: RoleVO) => {
  let text = row.status === "0" ? "Enable" : "Disable";
  try {
    await proxy?.$modal.confirm('Confirm to"' + text + '""' + row.roleName + '"?');
    await changeRoleStatus(row.roleId, row.status);
    proxy?.$modal.msgSuccess(text + "Success");
  } catch {
    row.status = row.status === "0" ? "1" : "0";
  }
}

/** Assign users */
const handleAuthUser = (row: RoleVO) => {
  router.push("/system/role-auth/user/" + row.roleId);
}

/** Query menu tree structure */
const getMenuTreeselect = async () => {
  const res = await menuTreeselect();
  menuOptions.value = res.data;
}
/** All department node data */
const getDeptAllCheckedKeys = (): any => {
  // The currently selected department node
  let checkedKeys = deptRef.value?.getCheckedKeys();
  // Half-selected department node
  let halfCheckedKeys = deptRef.value?.getHalfCheckedKeys();
  if (halfCheckedKeys) {
    checkedKeys?.unshift.apply(checkedKeys, halfCheckedKeys);
  }
  return checkedKeys
}
/** Reset newly added forms and other data  */
const reset = () => {
  menuRef.value?.setCheckedKeys([]);
  menuExpand.value = false
  menuNodeAll.value = false
  deptExpand.value = true
  deptNodeAll.value = false
  form.value = { ...initForm };
  roleFormRef.value?.resetFields();

}

/** Add role */
const handleAdd = () => {
  reset();
  getMenuTreeselect();
  dialog.visible = true;
  dialog.title = "Add Role";
}
/** Modify role */
const handleUpdate = async (row?: RoleVO) => {
  reset();
  const roleId = row?.roleId || ids.value[0]
  const { data } = await getRole(roleId);
  Object.assign(form.value, data);
  form.value.roleSort = Number(form.value.roleSort);
  const res = await getRoleMenuTreeselect(roleId);
  dialog.title = "Modify Role";
  dialog.visible = true;
  res.checkedKeys.forEach((v) => {
    nextTick(() => {
      menuRef.value?.setChecked(v, true, false);
    })
  })

}
/** Query the menu tree structure based on role ID */
const getRoleMenuTreeselect = (roleId: string | number) => {
  return roleMenuTreeselect(roleId).then((res): RoleMenuTree => {
    menuOptions.value = res.data.menus;
    return res.data;
  })
}
/** Query department tree structure based on role ID */
const getRoleDeptTreeSelect = async (roleId: string | number) => {
  const res = await deptTreeSelect(roleId);
  deptOptions.value = res.data.depts;
  return res.data;
}
/** （Unfold/fold）*/
const handleCheckedTreeExpand = (value: boolean, type: string) => {
  if (type == "menu") {
    let treeList = menuOptions.value;
    for (let i = 0; i < treeList.length; i++) {
      if (menuRef.value) {
        menuRef.value.store.nodesMap[treeList[i].id].expanded = value;
      }
    }
  } else if (type == "dept") {
    let treeList = deptOptions.value;
    for (let i = 0; i < treeList.length; i++) {
      if (deptRef.value) {
        deptRef.value.store.nodesMap[treeList[i].id].expanded = value;
      }
    }
  }
}
/** （Select all/Select none） */
const handleCheckedTreeNodeAll = (value: any, type: string) => {
  if (type == "menu") {
    menuRef.value?.setCheckedNodes(value ? menuOptions.value as any : []);
  } else if (type == "dept") {
    deptRef.value?.setCheckedNodes(value ? deptOptions.value as any : []);
  }
}
/** （Father-son interaction） */
const handleCheckedTreeConnect = (value: any, type: string) => {
  if (type == "menu") {
    form.value.menuCheckStrictly = value;
  } else if (type == "dept") {
    form.value.deptCheckStrictly = value;
  }
}
/** All menu node data */
const getMenuAllCheckedKeys = (): any => {
  // The currently selected menu node
  let checkedKeys = menuRef.value?.getCheckedKeys();
  // Half-selected menu node
  let halfCheckedKeys = menuRef.value?.getHalfCheckedKeys();
  if (halfCheckedKeys) {
    checkedKeys?.unshift.apply(checkedKeys, halfCheckedKeys);
  }
  return checkedKeys;
}
/** submit button */
const submitForm = () => {
  roleFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      form.value.menuIds = getMenuAllCheckedKeys()
      form.value.roleId ? await updateRole(form.value) : await addRole(form.value);
      proxy?.$modal.msgSuccess("Successful operation")
      dialog.visible = false
      getList()
    }
  })
}
/** Cancel button */
const cancel = () => {
  reset()
  dialog.visible = false;
}
/** Select role permission scope to trigger */
const dataScopeSelectChange = (value: string) => {
  if (value !== "2") {
    deptRef.value?.setCheckedKeys([])
  }
}
/** Assign data permission actions */
const handleDataScope = async (row: RoleVO) => {
  const response = await getRole(row.roleId);
  Object.assign(form.value, response.data);
  const res = await getRoleDeptTreeSelect(row.roleId);
  openDataScope.value = true;
  dialog.title = "Assign data permissions";
  await nextTick(() => {
    deptRef.value?.setCheckedKeys(res.checkedKeys);
  })
}
/** Submit button (data permissions) */
const submitDataScope = async () => {
  if (form.value.roleId) {
    form.value.deptIds = getDeptAllCheckedKeys();
    await dataScope(form.value);
    proxy?.$modal.msgSuccess("Done");
    openDataScope.value = false;
    getList();
  }
}
/** Cancel button (data permissions)*/
const cancelDataScope = () => {
  dataScopeRef.value?.resetFields();
  form.value = { ...initForm };
  openDataScope.value = false;
}

onMounted(() => {
  getList();
});
</script>
