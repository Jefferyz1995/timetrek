<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="mb-[10px]">
        <el-card shadow="hover">
          <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="180px">
            <el-form-item :label="$t('operateLog.operIp')" prop="operIp">
              <el-input v-model="queryParams.operIp" ::placeholder="$t('operateLog.operIp')" clearable style="width: 240px;" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item :label="$t('operateLog.title')" prop="title">
              <el-input v-model="queryParams.title" :placeholder="$t('operateLog.title')" clearable style="width: 240px;" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item :label="$t('operateLog.operName')" prop="operName">
              <el-input v-model="queryParams.operName" :placeholder="$t('operateLog.operName')" clearable style="width: 240px;" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item :label="$t('operateLog.businessType')" prop="businessType">
              <el-select v-model="queryParams.businessType" :placeholder="$t('operateLog.businessType')" clearable style="width: 240px">
                <el-option v-for="dict in sys_oper_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('commonColumn.status')" prop="status">
              <el-select v-model="queryParams.status" :placeholder="$t('commonColumn.status')" clearable style="width: 240px">
                <el-option v-for="dict in sys_common_status" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('operateLog.operTime')" style="width: 308px">
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
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['monitor:operlog:remove']">
              {{$t('commonBtn.delete')}}</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="WarnTriangleFilled" @click="handleClean" v-hasPermi="['monitor:operlog:remove']">清空</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="warning"
              plain
              icon="Download"
              @click="handleExport"
              v-hasPermi="['monitor:operlog:export']"
              >{{$t('commonBtn.export')}}</el-button
            >
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table
        ref="operLogTableRef"
        v-loading="loading"
        :data="operlogList"
        @selection-change="handleSelectionChange"
        :default-sort="defaultSort"
        @sort-change="handleSortChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column :label="$t('operateLog.title')" align="center" prop="title" :show-overflow-tooltip="true" />
        <el-table-column :label="$t('operateLog.businessType')" align="center" prop="businessType">
          <template #default="scope">
            <dict-tag :options="sys_oper_type" :value="scope.row.businessType" />
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('operateLog.operName')"
          align="center"
          width="110"
          prop="operName"
          :show-overflow-tooltip="true"
          sortable="custom"
          :sort-orders="['descending', 'ascending']"
        />
        <el-table-column :label="$t('operateLog.deptName')" align="center" prop="deptName" width="130" :show-overflow-tooltip="true" />
        <el-table-column :label="$t('operateLog.operIp')" align="center" prop="operIp" width="130" :show-overflow-tooltip="true" />
        <el-table-column :label="$t('commonColumn.status')" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="sys_common_status" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('operateLog.operTime')" align="center" prop="operTime" width="180" sortable="custom" :sort-orders="['descending', 'ascending']">
          <template #default="scope">
            <span>{{ parseTime(scope.row.operTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('operateLog.costTime')"
          align="center"
          prop="costTime"
          width="110"
          :show-overflow-tooltip="true"
          sortable="custom"
          :sort-orders="['descending', 'ascending']"
        >
          <template #default="scope">
            <span>{{ scope.row.costTime }}ms</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('commonColumn.action')" fixed="right" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="Detail" placement="top">
              <el-button link type="primary" icon="View" @click="handleView(scope.row)" v-hasPermi="['monitor:operlog:query']"> </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 操作日志详细 -->
    <el-dialog title="操作日志详细" v-model="dialog.visible" width="700px" append-to-body>
      <el-form :model="form" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="Info：">{{ form.operName }} / {{form.deptName}} / {{ form.operIp }} / {{ form.operLocation }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="ReqInfo：">{{ form.requestMethod }} {{ form.operUrl }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Title：">{{ form.title }} / {{ typeFormat(form) }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Method：">{{ form.method }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="OperParam：">{{ form.operParam }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="JsonResult：">{{ form.jsonResult }}</el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Status：">
              <div v-if="form.status === 0">Success</div>
              <div v-else-if="form.status === 1">Fail</div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="CostTime：">{{ form.costTime }}毫秒</el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="OperTime：">{{ parseTime(form.operTime) }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Error：" v-if="form.status === 1">{{ form.errorMsg }}</el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialog.visible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Operlog" lang="ts">
import { list, delOperlog, cleanOperlog } from '@/api/monitor/operlog';
import { OperLogForm, OperLogQuery, OperLogVO } from '@/api/monitor/operlog/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_oper_type, sys_common_status } = toRefs<any>(proxy?.useDict("sys_oper_type", "sys_common_status"));

const operlogList = ref<OperLogVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<number | string>>([]);
const multiple = ref(true);
const total = ref(0);
const dateRange = ref<[DateModelType, DateModelType]>(['', '']);
const defaultSort = ref<any>({ prop: "operTime", order: "descending" });

const operLogTableRef = ref<ElTableInstance>();
const queryFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});


const data = reactive<PageData<OperLogForm, OperLogQuery>>({
  form: {
    operId: undefined,
    tenantId: undefined,
    title: '',
    businessType: 0,
    businessTypes: undefined,
    method: '',
    requestMethod: '',
    operatorType: 0,
    operName: '',
    deptName: '',
    operUrl: '',
    operIp: '',
    operLocation: '',
    operParam: '',
    jsonResult: '',
    status: 0,
    errorMsg: '',
    operTime: '',
    costTime: 0
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    operIp: '',
    title: '',
    operName: '',
    businessType: '',
    status: '',
    orderByColumn: defaultSort.value.prop,
    isAsc: defaultSort.value.order
  },
  rules: {}
});

const { queryParams, form } = toRefs(data);

/** 查询登录日志 */
const getList = async () => {
  loading.value = true;
  const res = await list(proxy?.addDateRange(queryParams.value, dateRange.value));
  operlogList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}
/** 操作日志类型字典翻译 */
const typeFormat = (row: OperLogForm) => {
  return proxy?.selectDictLabel(sys_oper_type.value, row.businessType);
}
/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}
/** 重置按钮操作 */
const resetQuery = () => {
  dateRange.value = ['', ''];
  queryFormRef.value?.resetFields();
  queryParams.value.pageNum = 1;
  operLogTableRef.value?.sort(defaultSort.value.prop, defaultSort.value.order);
}
/** 多选框选中数据 */
const handleSelectionChange = (selection: OperLogVO[]) => {
  ids.value = selection.map(item => item.operId);
  multiple.value = !selection.length;
}
/** 排序触发事件 */
const handleSortChange = (column: any) => {
  queryParams.value.orderByColumn = column.prop;
  queryParams.value.isAsc = column.order;
  getList();
}
/** 详细按钮操作 */
const handleView = (row: OperLogVO) => {
  dialog.visible = true;
  form.value = row;
}
/** 删除按钮操作 */
const handleDelete = async (row?: OperLogVO) => {
  const operIds = row?.operId || ids.value;
  await proxy?.$modal.confirm('是否确认删除日志编号为"' + operIds + '?');
  await delOperlog(operIds);
  await getList();
  proxy?.$modal.msgSuccess("Successfully deleted");
}

/** 清空按钮操作 */
const handleClean = async () => {
  await proxy?.$modal.confirm("是否确认清空所有操作日志数据项?");
  await cleanOperlog();
  await getList();
  proxy?.$modal.msgSuccess("清空成功");
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download("monitor/operlog/export", {
    ...queryParams.value,
  }, `config_${new Date().getTime()}.xlsx`);
}
onMounted(() => {
  getList();
})
</script>
