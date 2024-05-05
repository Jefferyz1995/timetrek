<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item label="Recruitment positions" prop="offerName">
            <el-input v-model="queryParams.offerName" placeholder="Please enter the recruitment position" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="Recruitment title" prop="offerTitle">
            <el-input v-model="queryParams.offerTitle" placeholder="Please enter the recruitment title" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="Recruitment number" prop="offerNum">
            <el-input v-model="queryParams.offerNum" placeholder="Please enter the number of recruits" clearable style="width: 240px" @keyup.enter="handleQuery" />
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
        <el-table-column label="Recruitment positions" align="center" prop="offerName" />
        <el-table-column label="Recruitment title" align="center" prop="offerTitle" />
        <el-table-column label="Recruitment introduction" align="center" prop="offerIntroduction" />
        <el-table-column label="Recruitment number" align="center" prop="offerNum" />
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
    <!-- Add or modify recruitment dialog box -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="offerFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="Recruitment positions" prop="offerName">
          <el-input v-model="form.offerName" placeholder="Please enter the recruitment position" />
        </el-form-item>
        <el-form-item label="Recruitment title" prop="offerTitle">
          <el-input v-model="form.offerTitle" placeholder="Please enter the recruitment title" />
        </el-form-item>

        <el-form-item label="Recruitment introduction">
          <editor v-model="form.offerIntroduction" :min-height="192" />
        </el-form-item>
        <el-form-item label="Recruitment number" prop="offerNum">
          <el-input v-model="form.offerNum" placeholder="Please enter the number of recruits" />
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
      { required: true, message: " Primary key id cannot be empty", trigger: "blur" }
    ],
    offerName: [
      { required: true, message: "Recruitment position cannot be empty", trigger: "blur" }
    ],
    offerTitle: [
      { required: true, message: "Recruitment title cannot be empty", trigger: "blur" }
    ],
    offerIntroduction: [
      { required: true, message: "Recruitment introduction cannot be empty", trigger: "blur" }
    ],
    offerNum: [
      { required: true, message: "Recruitment number cannot be empty", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Check recruitment list */
const getList = async () => {
  loading.value = true;
  const res = await listOffer(queryParams.value);
  offerList.value = res.rows;
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
  form.value = {...initFormData};
  offerFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: OfferVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** Add button operation */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "Add recruitment";
}

/** Modify button actions */
const handleUpdate = async (row?: OfferVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getOffer(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "Modify recruitment";
}

/** submit button */
const submitForm = () => {
  offerFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateOffer(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addOffer(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("Modify Done");
      dialog.visible = false;
      await getList();
    }
  });
}

/** Delete button action */
const handleDelete = async (row?: OfferVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Confirm to delete"' + _ids + '"?').finally(() => loading.value = false);
  await delOffer(_ids);
  proxy?.$modal.msgSuccess("Successfully deleted");
  await getList();
}

/** Export button action */
const handleExport = () => {
  proxy?.download('system/offer/export', {
    ...queryParams.value
  }, `offer_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
