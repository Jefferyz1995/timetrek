<template>
  <el-row>
    <el-dialog title="Select User" v-model="visible" width="800px" top="5vh" append-to-body>
      <el-form :model="queryParams" ref="queryFormRef" :inline="true">
        <el-form-item :label="$t('userManager.userName')" prop="userName">
          <el-input v-model="queryParams.userName" :placeholder="$t('userManager.userName')" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item :label="$t('userManager.phonenumber')" prop="phonenumber">
          <el-input v-model="queryParams.phonenumber" :placeholder="$t('userManager.phonenumber')" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">{{$t('commonBtn.search')}}</el-button>
          <el-button icon="Refresh" @click="resetQuery">{{$t('commonBtn.reset')}}</el-button>
        </el-form-item>
      </el-form>
      <el-row>
        <el-table @row-click="clickRow" ref="tableRef" :data="userList" @selection-change="handleSelectionChange" height="260px">
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column :label="$t('userManager.userName')" prop="userName" :show-overflow-tooltip="true" />
          <el-table-column :label="$t('userManager.nickName')" :show-overflow-tooltip="true" />
          <el-table-column :label="$t('userManager.email')" prop="email" :show-overflow-tooltip="true" />
          <el-table-column :label="$t('userManager.phonenumber')" prop="phonenumber" :show-overflow-tooltip="true" />
          <el-table-column :label="$t('commonColumn.status')" align="center" prop="status">
            <template #default="scope">
              <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
            </template>
          </el-table-column>
          <el-table-column :label="$t('commonColumn.createTime')" align="center" prop="createTime" width="180">
            <template #default="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-if="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
      </el-row>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSelectUser">{{$t('commonBtn.submit')}}</el-button>
          <el-button @click="visible = false">{{$t('commonBtn.cancel')}}</el-button>
        </div>
      </template>
    </el-dialog>
  </el-row>
</template>

<script setup name="SelectUser" lang="ts">
import { authUserSelectAll, unallocatedUserList } from "@/api/system/role";
import { UserVO } from '@/api/system/user/types';
import { UserQuery } from '@/api/system/user/types';


const props = defineProps({
  roleId: {
    type: [Number, String]
  }
})

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable } = toRefs<any>(proxy?.useDict('sys_normal_disable'));

const userList = ref<UserVO[]>([]);
const visible = ref(false);
const total = ref(0);
const userIds = ref<Array<string | number>>([]);

const queryParams = reactive<UserQuery>({
  pageNum: 1,
  pageSize: 10,
  roleId: undefined,
  userName: undefined,
  phonenumber: undefined
})

const tableRef = ref<ElTableInstance>();
const queryFormRef = ref<ElFormInstance>();

const show = () => {
  queryParams.roleId = props.roleId;
  getList();
  visible.value = true;
}

/**
 * Select row
 */
const clickRow = (row: any) => {

  tableRef.value?.toggleRowSelection(row, false);
}
/** Multiple selection box selected data */
const handleSelectionChange = (selection: UserVO[]) => {
  userIds.value = selection.map((item: UserVO) => item.userId);
}

/** Query data */
const getList = async () => {
  const res = await unallocatedUserList(queryParams);
  userList.value = res.rows;
  total.value = res.total;
}
/** Search button action */
const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
}
/** reset button action */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  getList();
}

const emit = defineEmits(["ok"]);
/**Select authorized user operations */
const handleSelectUser = async () => {
  const roleId = queryParams.roleId;
  const ids = userIds.value.join(',');
  if (ids == "") {
    proxy?.$modal.msgError('Please select a user to assign');
    return;
  }
  await authUserSelectAll({ roleId, userIds: ids });
  proxy?.$modal.msgSuccess('Done');
  emit('ok');
  visible.value = false;
}

defineExpose({
  show,
});
</script>

<style scoped></style>
