<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item label="User ID" prop="userId">
            <el-input v-model="queryParams.userId" placeholder="User ID" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="askDays" prop="askDays">
            <el-input v-model="queryParams.askDays" placeholder="askDays" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="askStartTime" prop="askStartTime">
            <el-date-picker clearable v-model="queryParams.askStartTime" type="date" value-format="YYYY-MM-DD" placeholder="askStartTime" />
          </el-form-item>
          <el-form-item label="askEndTime" prop="askEndTime">
            <el-date-picker clearable v-model="queryParams.askEndTime" type="date" value-format="YYYY-MM-DD" placeholder="askEndTime" />
          </el-form-item>
          <el-form-item label="approveUserId" prop="approveUserId">
            <el-input v-model="queryParams.approveUserId" placeholder="approveUserId" clearable style="width: 240px" @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:askHoliday:add']">{{$t('commonBtn.add')}}</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['system:askHoliday:edit']"
              >{{$t('commonBtn.edit')}}</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:askHoliday:remove']"
              >{{$t('commonBtn.delete')}}</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:askHoliday:export']">{{$t('commonBtn.export')}}</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="askHolidayList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="User ID" align="center" prop="reqUserName" />
        <el-table-column label="askDays" align="center" prop="askDays" />
        <el-table-column label="askStartTime" align="center" prop="askStartTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.askStartTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="askEndTime" align="center" prop="askEndTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.askEndTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="askStatus" align="center" prop="askStatus">
          <template #default="scope">
            <dict-tag :options="ask_holiday_status" :value="scope.row.askStatus" />
          </template>
        </el-table-column>
        <el-table-column label="askReason" align="center" prop="askReason" />
        <el-table-column label="approvalOpinion" align="center" prop="approvalOpinion" />
        <el-table-column label="approveUserName" align="center" prop="approveUserName" />
        <el-table-column :label="$t('commonColumn.remark')" align="center" prop="remark" />
        <el-table-column :label="$t('commonColumn.action')" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip :content="$t('commonBtn.edit')" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:askHoliday:edit']"></el-button>
            </el-tooltip>
            <el-tooltip :content="$t('commonBtn.delete')" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:askHoliday:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改请假申请对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="askHolidayFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="askReason" prop="askReason">
          <el-input type="textarea" v-model="form.askReason" placeholder="askReason" />
        </el-form-item>
        <el-form-item label="askDays" prop="askDays">
          <el-input v-model="form.askDays" placeholder="askDays" />
        </el-form-item>

        <el-form-item label="askStartTime" prop="askStartTime">
          <el-date-picker clearable v-model="form.askStartTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="askStartTime">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="askEndTime" prop="askEndTime">
          <el-date-picker clearable v-model="form.askEndTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="askEndTime">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="askStatus" prop="askStatus" v-hasPermi="['system:askHoliday:approve']">
          <el-radio v-model="form.askStatus" v-for="dict in ask_holiday_status" :key="dict.value" :label="dict.value">
            {{ dict.label }}
          </el-radio>
        </el-form-item>
        <el-form-item label="approvalOpinion" prop="approvalOpinion" v-hasPermi="['system:askHoliday:approve']">
          <el-input type="textarea" v-model="form.approvalOpinion" placeholder="approvalOpinion" />
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

<script setup name="AskHoliday" lang="ts">
import { listAskHoliday, getAskHoliday, delAskHoliday, addAskHoliday, updateAskHoliday } from '@/api/system/askHoliday';
import { AskHolidayVO, AskHolidayQuery, AskHolidayForm } from '@/api/system/askHoliday/types';
import {listAllUser} from "@/api/system/user";
import {UserVO} from "@/api/system/user/types";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { ask_holiday_status } = toRefs<any>(proxy?.useDict("ask_holiday_status"));

const askHolidayList = ref<AskHolidayVO[]>([]);
const userList = ref<Array<UserVO>>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const askHolidayFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: AskHolidayForm = {
  id: undefined,
  userId: undefined,
  askDays: undefined,
  askStartTime: undefined,
  askEndTime: undefined,
  askStatus: undefined,
  askReason: undefined,
  approvalOpinion: undefined,
  approveUserId: undefined,
  remark: undefined
}
const data = reactive<PageData<AskHolidayForm, AskHolidayQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userId: undefined,
    askDays: undefined,
    askStartTime: undefined,
    askEndTime: undefined,
    askStatus: undefined,
    askReason: undefined,
    approvalOpinion: undefined,
    approveUserId: undefined,
    params: {
    }
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询请假申请列表 */
const getList = async () => {
  loading.value = true;
  const res = await listAskHoliday(queryParams.value);
  askHolidayList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}
const getAllUserLit = async ()=>{
  const res=await listAllUser();
  userList.value=res.data
}
/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** 表单重置 */
const reset = () => {
  form.value = {...initFormData};
  askHolidayFormRef.value?.resetFields();
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

/** 多选框选中数据 */
const handleSelectionChange = (selection: AskHolidayVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加请假申请";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: AskHolidayVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getAskHoliday(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改请假申请";
}

/** 提交按钮 */
const submitForm = () => {
  askHolidayFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateAskHoliday(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addAskHoliday(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("Modified successfully");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: AskHolidayVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除请假申请编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delAskHoliday(_ids);
  proxy?.$modal.msgSuccess("Successfully deleted");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('system/askHoliday/export', {
    ...queryParams.value
  }, `askHoliday_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
  getAllUserLit();
});
</script>
