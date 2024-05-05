<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="mb-[10px]" v-show="showSearch">
        <el-card shadow="hover">
          <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
            <el-form-item label="Notice Title" prop="noticeTitle">
              <el-input v-model="queryParams.noticeTitle" placeholder="Please enter notice title" clearable style="width: 200px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Creator" prop="createByName">
              <el-input v-model="queryParams.createByName" placeholder="Please the creator name" clearable style="width: 200px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Type" prop="noticeType">
              <el-select v-model="queryParams.noticeType" placeholder="Notice Type" clearable style="width: 200px">
                <el-option v-for="dict in sys_notice_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:notice:add']">{{$t('commonBtn.add')}}</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['system:notice:edit']"
              >{{$t('commonBtn.edit')}}</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:notice:remove']">
              {{$t('commonBtn.delete')}}</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="noticeList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="No." align="center" prop="noticeId" width="100" v-if="false" />
        <el-table-column label="Notice Title" align="center" prop="noticeTitle" :show-overflow-tooltip="true" />
        <el-table-column label="Notice Type" align="center" prop="noticeType" width="100">
          <template #default="scope">
            <dict-tag :options="sys_notice_type" :value="scope.row.noticeType" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('commonColumn.status')" align="center" prop="status" width="100">
          <template #default="scope">
            <dict-tag :options="sys_notice_status" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="Creator" align="center" prop="createByName" width="100" />
        <el-table-column :label="$t('commonColumn.createTime')" align="center" prop="createTime" width="100">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('commonColumn.action')" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip :content="$t('commonBtn.edit')" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:notice:edit']"></el-button>
            </el-tooltip>
            <el-tooltip :content="$t('commonBtn.delete')" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:notice:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- Add or modify notice dialog box -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="780px" append-to-body>
      <el-form ref="noticeFormRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="Notice Title" prop="noticeTitle">
              <el-input v-model="form.noticeTitle" placeholder="Please enter notice title" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Notice Type" prop="noticeType">
              <el-select v-model="form.noticeType" placeholder="Select">
                <el-option v-for="dict in sys_notice_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('commonColumn.status')">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_notice_status" :key="dict.value" :label="dict.value">{{ dict.label
                }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Content">
              <editor v-model="form.noticeContent" :min-height="192" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">{{$t('commonBtn.submit')}}</el-button>
          <el-button @click="cancel">{{$t('commonBtn.cancel')}}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Notice" lang="ts">
import { listNotice, getNotice, delNotice, addNotice, updateNotice } from "@/api/system/notice";
import { NoticeForm, NoticeQuery, NoticeVO } from "@/api/system/notice/types";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_notice_status, sys_notice_type } = toRefs<any>(proxy?.useDict("sys_notice_status", "sys_notice_type"));

const noticeList = ref<NoticeVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const noticeFormRef = ref<ElFormInstance>();


const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: NoticeForm = {
  noticeId: undefined,
  noticeTitle: '',
  noticeType: '',
  noticeContent: '',
  status: "0",
  remark: '',
  createByName: ''
}
const data = reactive<PageData<NoticeForm, NoticeQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    noticeTitle: '',
    createByName: '',
    status: '',
    noticeType: ''
  },
  rules: {
    noticeTitle: [{ required: true, message: "Notice title cannot be empty", trigger: "blur" }],
    noticeType: [{ required: true, message: "Notice type cannot be empty", trigger: "change" }]
  },
});

const { queryParams, form, rules } = toRefs(data);

/** Query announcement list */
const getList = async () => {
  loading.value = true;
  const res = await listNotice(queryParams.value);
  noticeList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}
/** Cancel button */
const cancel = () => {
  reset();
  dialog.visible = false;
}
/** form reset */
const reset = () => {
  form.value = { ...initFormData };
  noticeFormRef.value?.resetFields();
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
/** Multiple selection box selected data */
const handleSelectionChange = (selection: NoticeVO[]) => {
  ids.value = selection.map(item => item.noticeId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
/** Add button operation */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "Add Notice";
}
/**Modify button actions */
const handleUpdate = async (row?: NoticeVO) => {
  reset();
  const noticeId = row?.noticeId || ids.value[0];
  const { data } = await getNotice(noticeId);
  Object.assign(form.value, data);
  dialog.visible = true;
  dialog.title = "Modify Notice";
}
/** submit button */
const submitForm = () => {
  noticeFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      form.value.noticeId ? await updateNotice(form.value) : await addNotice(form.value);
      proxy?.$modal.msgSuccess("Modify Done");
      dialog.visible = false;
      await getList();
    }
  });
}
/** Delete button action */
const handleDelete = async (row?: NoticeVO) => {
  const noticeIds = row?.noticeId || ids.value
  await proxy?.$modal.confirm('Confirm to delete"' + noticeIds + '"?');
  await delNotice(noticeIds);
  await getList();
  proxy?.$modal.msgSuccess("Deleted Successfully");
}

onMounted(() => {
  getList();
})
</script>
