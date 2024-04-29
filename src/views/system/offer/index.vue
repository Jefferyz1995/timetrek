<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item label="招聘岗位" prop="offerName">
            <el-input v-model="queryParams.offerName" placeholder="请输入招聘岗位" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="招聘标题" prop="offerTitle">
            <el-input v-model="queryParams.offerTitle" placeholder="请输入招聘标题" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="招聘人数" prop="offerNum">
            <el-input v-model="queryParams.offerNum" placeholder="请输入招聘人数" clearable style="width: 240px" @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:offer:add']">{{$t('commonBtn.add')}}</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['system:offer:edit']">{{$t('commonBtn.edit')}}</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:offer:remove']">{{$t('commonBtn.delete')}}</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:offer:export']">{{$t('commonBtn.export')}}</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="offerList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="招聘岗位" align="center" prop="offerName" />
        <el-table-column label="招聘标题" align="center" prop="offerTitle" />
        <el-table-column label="招聘介绍" align="center" prop="offerIntroduction" />
        <el-table-column label="招聘人数" align="center" prop="offerNum" />
        <el-table-column :label="$t('commonColumn.action')" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip :content="$t('commonBtn.edit')" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:offer:edit']"></el-button>
            </el-tooltip>
            <el-tooltip :content="$t('commonBtn.delete')" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:offer:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination
          v-show="total>0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
      />
    </el-card>
    <!-- 添加或修改招聘对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="offerFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="招聘岗位" prop="offerName">
          <el-input v-model="form.offerName" placeholder="请输入招聘岗位" />
        </el-form-item>
        <el-form-item label="招聘标题" prop="offerTitle">
          <el-input v-model="form.offerTitle" placeholder="请输入招聘标题" />
        </el-form-item>

        <el-form-item label="招聘介绍">
          <editor v-model="form.offerIntroduction" :min-height="192" />
        </el-form-item>
        <el-form-item label="招聘人数" prop="offerNum">
          <el-input v-model="form.offerNum" placeholder="请输入招聘人数" />
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

<script setup name="Offer" lang="ts">
import { listOffer, getOffer, delOffer, addOffer, updateOffer } from '@/api/system/offer';
import { OfferVO, OfferQuery, OfferForm } from '@/api/system/offer/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const offerList = ref<OfferVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const offerFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: OfferForm = {
  id: undefined,
  offerName: undefined,
  offerTitle: undefined,
  offerIntroduction: undefined,
  offerNum: undefined,
}
const data = reactive<PageData<OfferForm, OfferQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    offerName: undefined,
    offerTitle: undefined,
    offerIntroduction: undefined,
    offerNum: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: " 主键id不能为空", trigger: "blur" }
    ],
    offerName: [
      { required: true, message: "招聘岗位不能为空", trigger: "blur" }
    ],
    offerTitle: [
      { required: true, message: "招聘标题不能为空", trigger: "blur" }
    ],
    offerIntroduction: [
      { required: true, message: "招聘介绍不能为空", trigger: "blur" }
    ],
    offerNum: [
      { required: true, message: "招聘人数不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询招聘列表 */
const getList = async () => {
  loading.value = true;
  const res = await listOffer(queryParams.value);
  offerList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** 表单重置 */
const reset = () => {
  form.value = {...initFormData};
  offerFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: OfferVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加招聘";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: OfferVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getOffer(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改招聘";
}

/** 提交按钮 */
const submitForm = () => {
  offerFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateOffer(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addOffer(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("修改成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: OfferVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除招聘编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delOffer(_ids);
  proxy?.$modal.msgSuccess("Successfully deleted");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('system/offer/export', {
    ...queryParams.value
  }, `offer_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
