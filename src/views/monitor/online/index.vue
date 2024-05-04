<template>
  <div class="p-2">
    <div class="mb-[10px]">
      <el-card shadow="hover">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true">
          <el-form-item label="Login Address" prop="ipaddr">
            <el-input v-model="queryParams.ipaddr" placeholder="Please Enter Login Address" clearable style="width: 200px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item :label="$t('userManager.userName')" prop="userName">
            <el-input v-model="queryParams.userName" :placeholder="$t('userManager.userName')" clearable style="width: 200px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">{{$t('commonBtn.search')}}</el-button>
            <el-button icon="Refresh" @click="resetQuery">{{$t('commonBtn.reset')}}</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
    <el-card shadow="hover">
      <el-table
        v-loading="loading"
        :data="onlineList.slice((queryParams.pageNum - 1) * queryParams.pageSize, queryParams.pageNum * queryParams.pageSize)"
        style="width: 100%;"
      >
        <el-table-column label="序号" width="50" type="index" align="center">
          <template #default="scope">
            <span>{{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Session No." align="center" prop="tokenId" :show-overflow-tooltip="true" />
        <el-table-column label="Login Name" align="center" prop="userName" :show-overflow-tooltip="true" />
        <el-table-column label="Client" align="center" prop="clientKey" :show-overflow-tooltip="true" />
        <el-table-column label="Device Type" align="center">
          <template #default="scope">
            <dict-tag :options="sys_device_type" :value="scope.row.deviceType" />
          </template>
        </el-table-column>
        <el-table-column label="Department" align="center" prop="deptName" :show-overflow-tooltip="true" />
        <el-table-column label="Host" align="center" prop="ipaddr" :show-overflow-tooltip="true" />
        <el-table-column label="Login Location" align="center" prop="loginLocation" :show-overflow-tooltip="true" />
        <el-table-column label="OS" align="center" prop="os" :show-overflow-tooltip="true" />
        <el-table-column label="Browser" align="center" prop="browser" :show-overflow-tooltip="true" />
        <el-table-column label="Login Time" align="center" prop="loginTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.loginTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('commonColumn.action')" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="Force quit" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleForceLogout(scope.row)" v-hasPermi="['monitor:online:forceLogout']">
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" />
    </el-card>
  </div>
</template>

<script setup name="Online" lang="ts">
import { forceLogout, list as initData } from "@/api/monitor/online";
import { OnlineQuery, OnlineVO } from "@/api/monitor/online/types";
import api from "@/api/system/user";
import {to} from "await-to-js";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_device_type } = toRefs<any>(proxy?.useDict("sys_device_type"));

const onlineList = ref<OnlineVO[]>([]);
const loading = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();

const queryParams = ref<OnlineQuery>({
  pageNum: 1,
  pageSize: 10,
  ipaddr: '',
  userName: ''
});

/** Query login log list */
const getList = async () => {
  loading.value = true;
  const res = await initData(queryParams.value);
  onlineList.value = res.rows;
  total.value = res.total;
  loading.value = false;
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
/** Force logout */
const handleForceLogout = async (row: OnlineVO) => {
  const [err] = await to(proxy?.$modal.confirm('Confirm to force logout the user name"' + row.userName + '"?') as any);
  if (!err) {
    await forceLogout(row.tokenId);
    await getList();
    proxy?.$modal.msgSuccess("Successfully deleted");
  }
}

onMounted(() => {
  getList();
})
</script>
