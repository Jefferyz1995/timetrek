<template>
  <div class="p-2">
    <div class="panel">
      <h4 class="panel-title">Basic Info</h4>
      <el-form :model="form" label-width="80px" :inline="true">
        <el-row :gutter="10">
          <el-col :span="2.5">
            <el-form-item :label="$t('userManager.nickName')">
              <el-input v-model="form.nickName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="2.5">
            <el-form-item label="Account" prop="userName">
              <el-input v-model="form.userName" disabled />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div class="panel">
      <h4 class="panel-title">Role</h4>
      <div>
        <el-table
          v-loading="loading"
          :row-key="getRowKey"
          @row-click="clickRow"
          ref="tableRef"
          @selection-change="handleSelectionChange"
          :data="roles.slice((pageNum - 1) * pageSize, pageNum * pageSize)"
        >
          <el-table-column label="No." width="55" type="index" align="center">
            <template #default="scope">
              <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column type="selection" :reserve-selection="true" width="55"></el-table-column>
          <el-table-column label="ID" align="center" prop="roleId" />
          <el-table-column label="Role Name" align="center" prop="roleName" />
          <el-table-column label="Role Key" align="center" prop="roleKey" />
          <el-table-column :label="$t('commonColumn.createTime')" align="center" prop="createTime" width="180">
            <template #default="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" v-model:page="pageNum" v-model:limit="pageSize" />
        <div style="text-align: center;margin-left:-120px;margin-top:30px;">
          <el-button type="primary" @click="submitForm()">Submit</el-button>
          <el-button @click="close()">Return</el-button>
        </div>
        <div></div>
      </div>
    </div>
  </div>
</template>

<script setup name="AuthRole" lang="ts">
import { RoleVO } from "@/api/system/role/types";
import { getAuthRole, updateAuthRole } from "@/api/system/user";
import { UserForm } from "@/api/system/user/types";

const route = useRoute();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const loading = ref(true);
const total = ref(0);
const pageNum = ref(1);
const pageSize = ref(10);
const roleIds = ref<Array<string | number>>([]);
const roles = ref<RoleVO[]>([]);
const form = ref<Partial<UserForm>>({
  nickName: undefined,
  userName: "",
  userId: undefined
});

const tableRef = ref<ElTableInstance>();


const clickRow = (row: RoleVO) => {

  tableRef.value?.toggleRowSelection(row, false);
};

const handleSelectionChange = (selection: RoleVO[]) => {
  roleIds.value = selection.map(item => item.roleId);
};

const getRowKey = (row: RoleVO): string => {
  return String(row.roleId);
};

const close = () => {
  const obj = { path: "/system/user" };
  proxy?.$tab.closeOpenPage(obj);
};

const submitForm = async () => {
  const userId = form.value.userId;
  const rIds = roleIds.value.join(",");
  await updateAuthRole({ userId: userId as string, roleIds: rIds });
  proxy?.$modal.msgSuccess("Success");
  close();
};

const getList = async () => {
  const userId = route.params && route.params.userId;
  if (userId) {
    loading.value = true;
    const res = await getAuthRole(userId as string);
    Object.assign(form.value, res.data.user);
    Object.assign(roles.value, res.data.roles);
    total.value = roles.value.length;
    await nextTick(() => {
      roles.value.forEach(row => {
        if (row?.flag) {
          tableRef.value?.toggleRowSelection(row, true);
        }
      });
    });
    loading.value = false;
  }
};
onMounted(() => {
  getList();
});
</script>
