<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="mb-[10px]" v-show="showSearch">
        <el-card shadow="hover">
          <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
            <el-form-item label="Login Address" prop="ipaddr">
              <el-input v-model="queryParams.ipaddr" placeholder="Please Enter Login Address" clearable style="width: 240px;" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item :label="$t('userManager.userName')" prop="userName">
              <el-input v-model="queryParams.userName" :placeholder="$t('userManager.userName')" clearable style="width: 240px;" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item :label="$t('commonColumn.status')" prop="status">
              <el-select v-model="queryParams.status" placeholder="Login Status" clearable style="width: 240px">
                <el-option v-for="dict in sys_common_status" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Login Time" style="width: 308px">
              <el-date-picker
                v-model="dateRange"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="daterange"
                range-separator="-"
                :start-placeholder="$t('commonColumn.startTime')"
                :end-placeholder="$t('commonColumn.endTime')"
                :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
              ></el-date-picker>
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
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['monitor:logininfor:remove']">
              {{$t('commonBtn.delete')}}</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" @click="handleClean" v-hasPermi="['monitor:logininfor:remove']">Clear</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Unlock" :disabled="single" @click="handleUnlock" v-hasPermi="['monitor:logininfor:unlock']">
              Unlock
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['monitor:logininfor:export']">{{$t('commonBtn.export')}}</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table
        ref="loginInfoTableRef"
        v-loading="loading"
        :data="loginInfoList"
        @selection-change="handleSelectionChange"
        :default-sort="defaultSort"
        @sort-change="handleSortChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="Access No." align="center" prop="infoId" />
        <el-table-column
          :label="$t('userManager.userName')"
          align="center"
          prop="userName"
          :show-overflow-tooltip="true"
          sortable="custom"
          :sort-orders="['descending', 'ascending']"
        />
        <el-table-column label="Client" align="center" prop="clientKey" :show-overflow-tooltip="true" />
        <el-table-column label="Device Type" align="center">
          <template #default="scope">
            <dict-tag :options="sys_device_type" :value="scope.row.deviceType" />
          </template>
        </el-table-column>
        <el-table-column label="Address" align="center" prop="ipaddr" :show-overflow-tooltip="true" />
        <el-table-column label="Login Location" align="center" prop="loginLocation" :show-overflow-tooltip="true" />
        <el-table-column label="OS" align="center" prop="os" :show-overflow-tooltip="true" />
        <el-table-column label="Browser" align="center" prop="browser" :show-overflow-tooltip="true" />
        <el-table-column label="Status" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="sys_common_status" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="Description" align="center" prop="msg" :show-overflow-tooltip="true" />
        <el-table-column label="Access Time" align="center" prop="loginTime" sortable="custom" :sort-orders="['descending', 'ascending']" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.loginTime) }}</span>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
  </div>
</template>

<script setup name="Logininfor" lang="ts">
import { list, delLoginInfo, cleanLoginInfo, unlockLoginInfo } from "@/api/monitor/loginInfo";
import { LoginInfoQuery, LoginInfoVO } from "@/api/monitor/loginInfo/types";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_device_type } = toRefs<any>(proxy?.useDict("sys_device_type"));
const { sys_common_status } = toRefs<any>(proxy?.useDict("sys_common_status"));

const loginInfoList = ref<LoginInfoVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<number | string>>([]);
const single = ref(true);
const multiple = ref(true);
const selectName = ref<Array<string>>([]);
const total = ref(0);
const dateRange = ref<[DateModelType,DateModelType]>(['', '']);
const defaultSort = ref<any>({ prop: "loginTime", order: "descending" });

const queryFormRef = ref<ElFormInstance>();
const loginInfoTableRef = ref<ElTableInstance>();
// query parameters
const queryParams = ref<LoginInfoQuery>({
    pageNum: 1,
    pageSize: 10,
    ipaddr: '',
    userName: '',
    status: '',
    orderByColumn: defaultSort.value.prop,
    isAsc: defaultSort.value.order
});

/** Query login log list */
const getList = async () => {
    loading.value = true;
    const res = await list(proxy?.addDateRange(queryParams.value, dateRange.value));
    loginInfoList.value = res.rows;
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
    dateRange.value = ['', ''];
    queryFormRef.value?.resetFields();
    queryParams.value.pageNum = 1;
    loginInfoTableRef.value?.sort(defaultSort.value.prop, defaultSort.value.order);
}
/** Multiple selection box selected data */
const handleSelectionChange = (selection: LoginInfoVO[]) => {
    ids.value = selection.map(item => item.infoId);
    multiple.value = !selection.length;
    single.value = selection.length != 1;
    selectName.value = selection.map(item => item.userName);
}
/** Sorting trigger events */
const handleSortChange = (column: any) => {
    queryParams.value.orderByColumn = column.prop;
    queryParams.value.isAsc = column.order;
    getList();
}
/** Delete button action */
const handleDelete = async (row?: LoginInfoVO) => {
    const infoIds = row?.infoId || ids.value;
    await proxy?.$modal.confirm('Confirm to delete the access no."' + infoIds + '?');
    await delLoginInfo(infoIds);
    await getList();
    proxy?.$modal.msgSuccess("Successfully deleted");
}
/** Clear button action */
const handleClean = async () => {
    await proxy?.$modal.confirm("Confirm to clear all login log data?");
    await cleanLoginInfo();
    await getList();
    proxy?.$modal.msgSuccess("Cleared successfully");
}
/** Unlock button operation */
const handleUnlock = async () => {
    const username = selectName.value;
    await proxy?.$modal.confirm('Confirm to unlock the user "' + username + '" ?');
    await unlockLoginInfo(username);
    proxy?.$modal.msgSuccess("User" + username + "unlocked");
}
/** Export button action */
const handleExport = () => {
    proxy?.download("monitor/logininfor/export", {
        ...queryParams.value,
    }, `config_${new Date().getTime()}.xlsx`);
}

onMounted(() => {
    getList();
})
</script>
