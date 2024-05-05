<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="mb-[10px]" v-show="showSearch">
        <el-card shadow="hover">
          <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
            <el-form-item :label="$t('tenantManager.tenantId')" prop="tenantId">
              <el-input v-model="queryParams.tenantId" :placeholder="$t('tenantManager.tenantId')" clearable style="width: 240px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item :label="$t('tenantManager.concatPerson')" prop="contactUserName">
              <el-input v-model="queryParams.contactUserName" :placeholder="$t('tenantManager.concatPerson')" clearable style="width: 240px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item :label="$t('tenantManager.contactPhone')" prop="contactPhone">
              <el-input v-model="queryParams.contactPhone" :placeholder="$t('tenantManager.contactPhone')" clearable style="width: 240px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item :label="$t('tenantManager.companyName')" prop="companyName">
              <el-input v-model="queryParams.companyName" :placeholder="$t('tenantManager.companyName')" clearable style="width: 240px" @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:tenant:add']">{{$t('commonBtn.add')}}</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="success"
              plain
              icon="Edit"
              :disabled="single"
              @click="handleUpdate()"
              v-hasPermi="['system:tenant:edit']"
              >{{$t('commonBtn.edit')}}</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:tenant:remove']">
              {{$t('commonBtn.delete')}}</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="warning"
              plain
              icon="Download"
              @click="handleExport"
              v-hasPermi="['system:tenant:export']"
              >{{$t('commonBtn.export')}}</el-button
            >
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="tenantList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="id" align="center" prop="id" v-if="false" />
        <el-table-column :label="$t('tenantManager.tenantId')" align="center" prop="tenantId" />
        <el-table-column :label="$t('tenantManager.concatPerson')" align="center" prop="contactUserName" />
        <el-table-column :label="$t('tenantManager.contactPhone')" align="center" prop="contactPhone" />
        <el-table-column :label="$t('tenantManager.companyName')" align="center" prop="companyName" />
        <el-table-column :label="$t('tenantManager.companyNum')" align="center" prop="licenseNumber" />
        <el-table-column :label="$t('tenantManager.expireTime')" align="center" prop="expireTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.expireTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('commonColumn.status')" align="center" prop="status">
          <template #default="scope">
            <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @change="handleStatusChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column width="150" :label="$t('commonColumn.action')" align="center" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip :content="$t('commonBtn.edit')" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:tenant:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="Sync package" placement="top">
              <el-button link type="primary" icon="Refresh" @click="handleSyncTenantPackage(scope.row)" v-hasPermi="['system:tenant:edit']">
              </el-button>
            </el-tooltip>
            <el-tooltip :content="$t('commonBtn.delete')" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:tenant:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改租户对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="tenantFormRef" :model="form" :rules="rules" label-width="200px">
        <el-form-item :label="$t('tenantManager.companyName')" prop="companyName">
          <el-input v-model="form.companyName" :placeholder="$t('tenantManager.companyName')" />
        </el-form-item>
        <el-form-item :label="$t('tenantManager.concatPerson')" prop="contactUserName">
          <el-input v-model="form.contactUserName" :placeholder="$t('tenantManager.concatPerson')" />
        </el-form-item>
        <el-form-item :label="$t('tenantManager.contactPhone')" prop="contactPhone">
          <el-input v-model="form.contactPhone" :placeholder="$t('tenantManager.contactPhone')" />
        </el-form-item>
        <el-form-item v-if="!form.id" :label="$t('tenantManager.username')" prop="username">
          <el-input v-model="form.username" :placeholder="$t('tenantManager.username')" maxlength="30" />
        </el-form-item>
        <el-form-item v-if="!form.id" :label="$t('tenantManager.password')" prop="password">
          <el-input type="password" v-model="form.password" :placeholder="$t('tenantManager.password')" maxlength="20" />
        </el-form-item>
        <el-form-item :label="$t('tenantManager.packageNme')" prop="packageId">
          <el-select v-model="form.packageId" :disabled="!!form.tenantId" :placeholder="$t('tenantManager.packageNme')" clearable style="width: 100%">
            <el-option v-for="item in packageList" :key="item.packageId" :label="item.packageName" :value="item.packageId" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('tenantManager.expireTime')" prop="expireTime">
          <el-date-picker clearable v-model="form.expireTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" :placeholder="$t('tenantManager.expireTime')">
          </el-date-picker>
        </el-form-item>
        <el-form-item :label="$t('tenantManager.accountCount')"  prop="accountCount">
          <el-input v-model="form.accountCount" :placeholder="$t('tenantManager.accountCount')" />
        </el-form-item>
        <el-form-item :label="$t('tenantManager.domain')" prop="domain">
          <el-input v-model="form.domain" :placeholder="$t('tenantManager.domain')" />
        </el-form-item>
        <el-form-item :label="$t('tenantManager.address')" prop="address">
          <el-input v-model="form.address" :placeholder="$t('tenantManager.address')" />
        </el-form-item>
        <el-form-item :label="$t('tenantManager.companyNum')" prop="licenseNumber">
          <el-input v-model="form.licenseNumber" :placeholder="$t('tenantManager.companyNum')" />
        </el-form-item>
        <el-form-item :label="$t('tenantManager.intro')" prop="intro">
          <el-input type="textarea" v-model="form.intro" :placeholder="$t('tenantManager.intro')" />
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

<script setup name="Tenant" lang="ts">
import { listTenant, getTenant, delTenant, addTenant, updateTenant, changeTenantStatus, syncTenantPackage } from '@/api/system/tenant';
import { selectTenantPackage } from '@/api/system/tenantPackage';
import { TenantForm, TenantQuery, TenantVO } from '@/api/system/tenant/types';
import { TenantPkgVO } from '@/api/system/tenantPackage/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tenantList = ref<TenantVO[]>([]);
const packageList = ref<TenantPkgVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const tenantFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: TenantForm = {
  id: undefined,
  tenantId: undefined,
  contactUserName: '',
  contactPhone: '',
  username: '',
  password: '',
  companyName: '',
  licenseNumber: '',
  domain: '',
  address: '',
  intro: '',
  remark: '',
  packageId: '',
  expireTime: '',
  accountCount: 0,
  status: '0',
}
const data = reactive<PageData<TenantForm, TenantQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    tenantId: '',
    contactUserName: '',
    contactPhone: '',
    companyName: ''
  },
  rules: {
    id: [{ required: true, message: "id cannot be empty", trigger: "blur" }],
    tenantId: [{ required: true, message: "Tenant ID cannot be empty", trigger: "blur" }],
    contactUserName: [{ required: true, message: "Contact Person cannot be empty", trigger: "blur" }],
    contactPhone: [{ required: true, message: "Contact No, cannot be empty", trigger: "blur" }],
    companyName: [{ required: true, message: "Company name cannot be empty", trigger: "blur" }],
    username: [
      { required: true, message: "Username can not be empty", trigger: "blur" },
      { min: 2, max: 20, message: 'Username length must be between 2 and 20', trigger: 'blur' }
    ],
    password: [
      { required: true, message: "Password cannot be empty", trigger: "blur" },
      { min: 5, max: 20, message: 'User password length must be between 5 and 20', trigger: 'blur' }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** View all tenant packages */
const getTenantPackage = async () => {
  const res = await selectTenantPackage()
  packageList.value = res.data;
}

/** Query tenant list */
const getList = async () => {
  loading.value = true;
  const res = await listTenant(queryParams.value);
  tenantList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

// Tenant package status modification
const handleStatusChange = async (row: TenantVO) => {
  let text = row.status === "0" ? "Enable" : "Disable";
  try {
    await proxy?.$modal.confirm('Confirm to"' + text + '""' + row.companyName + '"?');
    await changeTenantStatus(row.id, row.tenantId, row.status);
    proxy?.$modal.msgSuccess(text + "Success");
  } catch {
    row.status = row.status === "0" ? "1" : "0";
  }


}

// 取消按钮
const cancel = () => {
  reset();
  dialog.visible = false;
}

// 表单重置
const reset = () => {
  form.value = { ...initFormData };
  tenantFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
}

// 多选框选中数据
const handleSelectionChange = (selection: TenantVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  getTenantPackage();
  dialog.visible = true;
  dialog.title = "Add a tenant";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: TenantVO) => {
  reset();
  await getTenantPackage();
  const _id = row?.id || ids.value[0];
  const res = await getTenant(_id);
  Object.assign(form.value, res.data)
  dialog.visible = true;
  dialog.title = "Modifying a tenant";
}

/** 提交按钮 */
const submitForm = () => {
  tenantFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateTenant(form.value).finally(() => buttonLoading.value = false);
      } else {
        await addTenant(form.value).finally(() => buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("Successful operation");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: TenantVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Do you want to delete the tenant ID"' + _ids + '？')
  loading.value = true;
  await delTenant(_ids).finally(() => loading.value = false);
  await getList();
  proxy?.$modal.msgSuccess("Successfully deleted");


}

/** 同步租户套餐按钮操作 */
const handleSyncTenantPackage = async (row: TenantVO) => {
  try {
    await proxy?.$modal.confirm(' Confirm that the tenant ID of the synchronization tenant package is"' + row.tenantId + '？');
    loading.value = true;
    await syncTenantPackage(row.tenantId, row.packageId);
    await getList();
    proxy?.$modal.msgSuccess("Synchronization succeeded");
  } catch { return } finally {
    loading.value = false;
  }
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('system/tenant/export', {
    ...queryParams.value
  }, `tenant_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
})
</script>
