<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="mb-[10px]" v-show="showSearch">
        <el-card shadow="hover">
          <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
            <el-form-item label="Package Name" prop="packageName">
              <el-input v-model="queryParams.packageName" placeholder="Package Name" clearable style="width: 240px" @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:tenantPackage:add']"> Add </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['system:tenantPackage:edit']">
              Modify
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:tenantPackage:remove']">
              {{$t('commonBtn.delete')}}</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:tenantPackage:export']">Export </el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="tenantPackageList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="Package ID" align="center" prop="packageId" v-if="false" />
        <el-table-column :label="$t('packageManager.packageName')" align="center" prop="packageName" />
        <el-table-column :label="$t('commonColumn.remark')" align="center" prop="remark" />
        <el-table-column :label="$t('commonColumn.status')" align="center" prop="status">
          <template #default="scope">
            <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @click="handleStatusChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column :label="$t('commonColumn.action')" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip :content="$t('commonBtn.edit')" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:tenantPackage:edit']"></el-button>
            </el-tooltip>
            <el-tooltip :content="$t('commonBtn.delete')" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:tenantPackage:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- Add or modify tenant plan dialog box -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="tenantPackageFormRef" :model="form" :rules="rules" label-width="200px">
        <el-form-item :label="$t('packageManager.packageName')" prop="packageName">
          <el-input v-model="form.packageName" :placeholder="$t('packageManager.packageName')" />
        </el-form-item>
        <el-form-item  :label="$t('packageManager.associationMenu')" >
          <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">Unfold/fold</el-checkbox>
          <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">Select all/Select none </el-checkbox>
          <el-checkbox v-model="form.menuCheckStrictly" @change="handleCheckedTreeConnect($event, 'menu')">Father-son interaction </el-checkbox>
          <el-tree
            class="tree-border"
            :data="menuOptions"
            show-checkbox
            ref="menuTreeRef"
            node-key="id"
            :check-strictly="!form.menuCheckStrictly"
            empty-text="Loading, please wait"
            :props="{ label: 'label', children: 'children' }"
          ></el-tree>
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

<script setup name="TenantPackage" lang="ts">
import {
  listTenantPackage,
  getTenantPackage,
  delTenantPackage,
  addTenantPackage,
  updateTenantPackage,
  changePackageStatus
} from "@/api/system/tenantPackage";
import { treeselect as menuTreeselect, tenantPackageMenuTreeselect } from "@/api/system/menu";
import { TenantPkgForm, TenantPkgQuery, TenantPkgVO } from "@/api/system/tenantPackage/types";
import { MenuTreeOption } from "@/api/system/menu/types";
import to from "await-to-js";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tenantPackageList = ref<TenantPkgVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const menuExpand = ref(false);
const menuNodeAll = ref(false);
const menuOptions = ref<MenuTreeOption[]>([]);

const menuTreeRef = ref<ElTreeInstance>();
const queryFormRef = ref<ElFormInstance>();
const tenantPackageFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ""
});


const initFormData: TenantPkgForm = {
  packageId: undefined,
  packageName: "",
  menuIds: "",
  remark: "",
  menuCheckStrictly: true
};
const data = reactive<PageData<TenantPkgForm, TenantPkgQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    packageName: ""
  },
  rules: {
    packageId: [{ required: true, message: "Package ID cannot be empty", trigger: "blur" }],
    packageName: [{ required: true, message: "Package name cannot be empty", trigger: "blur" }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query menu tree structure */
const getMenuTreeselect = async () => {
  const { data } = await menuTreeselect();
  menuOptions.value = data;
};

// All menu node data
const getMenuAllCheckedKeys = (): any => {
  // The currently selected menu node
  let checkedKeys = menuTreeRef.value?.getCheckedKeys();
  // Half-selected menu node
  let halfCheckedKeys = menuTreeRef.value?.getHalfCheckedKeys();
  if (halfCheckedKeys) {
    checkedKeys?.unshift.apply(checkedKeys, halfCheckedKeys);
  }
  return checkedKeys;
};

/** Query the menu tree structure based on the tenant package ID */
const getPackageMenuTreeselect = async (packageId: string | number) => {
  const res = await tenantPackageMenuTreeselect(packageId);
  menuOptions.value = res.data.menus;
  return Promise.resolve(res);
};

/** Query tenant package list */
const getList = async () => {
  loading.value = true;
  const res = await listTenantPackage(queryParams.value);
  tenantPackageList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

// Tenant package status modification
const handleStatusChange = async (row: TenantPkgVO) => {
  let text = row.status === "0" ? "Enable" : "Disable";
  const [err] = await to(proxy?.$modal.confirm("Confirm to\"" + text + "\"\"" + row.packageName + "\"?") as Promise<any>);
  if (err) {
    row.status = row.status === "0" ? "1" : "0";
  } else {
    await changePackageStatus(row.packageId, row.status);
    proxy?.$modal.msgSuccess(text + "Success");
  }
};

// cancel
const cancel = () => {
  reset();
  dialog.visible = false;
};

// reset
const reset = () => {
  menuTreeRef.value?.setCheckedKeys([]);
  menuExpand.value = false;
  menuNodeAll.value = false;
  form.value = { ...initFormData };
  tenantPackageFormRef.value?.resetFields();
};

/** search */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** reset */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

// Multiple selection box selected data
const handleSelectionChange = (selection: TenantPkgVO[]) => {
  ids.value = selection.map(item => item.packageId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

// （Unfold/fold）
const handleCheckedTreeExpand = (value: CheckboxValueType, type: string) => {
  if (type == "menu") {
    let treeList = menuOptions.value;
    for (let i = 0; i < treeList.length; i++) {
      if (menuTreeRef.value) {
        menuTreeRef.value.store.nodesMap[treeList[i].id].expanded = value as boolean;
      }
    }
  }
};

// （Select all/Select none）
const handleCheckedTreeNodeAll = (value: CheckboxValueType, type: string) => {
  if (type == "menu") {
    menuTreeRef.value?.setCheckedNodes(value ? menuOptions.value as any : []);
  }
};

// （Father-son interaction）
const handleCheckedTreeConnect = (value: CheckboxValueType, type: string) => {
  if (type == "menu") {
    form.value.menuCheckStrictly = value as boolean;
  }
};

/** Add button operation */
const handleAdd = () => {
  reset();
  getMenuTreeselect();
  dialog.visible = true;
  dialog.title = "Add Package";
};

/** Modify */
const handleUpdate = async (row?: TenantPkgVO) => {
  reset();
  const _packageId = row?.packageId || ids.value[0];
  const response = await getTenantPackage(_packageId);
  form.value = response.data;
  const res = await getPackageMenuTreeselect(_packageId);
  dialog.visible = true;
  dialog.title = "Modify Package";
  res.data.checkedKeys.forEach((v) => {
    nextTick(() => {
      menuTreeRef.value?.setChecked(v, true, false);
    });
  });
};

/** Submit */
const submitForm = () => {
  tenantPackageFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      form.value.menuIds = getMenuAllCheckedKeys();
      if (form.value.packageId != null) {
        await updateTenantPackage(form.value).finally(() => buttonLoading.value = false);
      } else {
        await addTenantPackage(form.value).finally(() => buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("Success");
      dialog.visible = false;
      await getList();
    }
  });
};

/** delete */
const handleDelete = async (row?: TenantPkgVO) => {
  const _packageIds = row?.packageId || ids.value;
  await proxy?.$modal.confirm("Confirm to delete\"" + _packageIds + "\"?").finally(() => {
    loading.value = false;
  });
  await delTenantPackage(_packageIds);
  loading.value = true;
  await getList();
  proxy?.$modal.msgSuccess("Successfully deleted");
};

/** export */
const handleExport = () => {
  proxy?.download("system/tenantPackage/export", {
    ...queryParams.value
  }, `tenantPackage_${new Date().getTime()}.xlsx`);
};

onMounted(() => {
  getList();
});
</script>
