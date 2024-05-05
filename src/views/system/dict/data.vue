<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="mb-[10px]" v-show="showSearch">
        <el-card shadow="hover">
          <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
            <el-form-item :label="$t('dictManager.dictType')" prop="dictType">
              <el-select v-model="queryParams.dictType" style="width: 200px">
                <el-option v-for="item in typeOptions" :key="item.dictId" :label="item.dictName" :value="item.dictType" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('dictManager.dictLabel')" prop="dictLabel">
              <el-input v-model="queryParams.dictLabel" placeholder="Please enter a dictionary tag" clearable style="width: 200px" @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:dict:add']">{{$t('commonBtn.add')}}</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['system:dict:edit']">{{$t('commonBtn.edit')}}</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:dict:remove']">
              {{$t('commonBtn.delete')}}</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:dict:export']">{{$t('commonBtn.export')}}</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Close" @click="handleClose">{{$t('commonBtn.close')}}</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column :label="$t('dictManager.dictCode')" align="center" prop="dictCode" v-if="false" />
        <el-table-column :label="$t('dictManager.dictLabel')" align="center" prop="dictLabel">
          <template #default="scope">
            <span v-if="(scope.row.listClass === '' || scope.row.listClass === 'default') && (scope.row.cssClass === '' || scope.row.cssClass == null)">{{ scope.row.dictLabel }}</span>
            <el-tag v-else :type="(scope.row.listClass === 'primary' || scope.row.listClass === 'default') ? '' : scope.row.listClass" :class="scope.row.cssClass">{{ scope.row.dictLabel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('dictManager.dictValue')" align="center" prop="dictValue" />
        <el-table-column :label="$t('dictManager.dictSort')" align="center" prop="dictSort" />
        <el-table-column :label="$t('commonColumn.remark')" align="center" prop="remark" :show-overflow-tooltip="true" />
        <el-table-column :label="$t('commonColumn.createTime')" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('commonColumn.action')" align="center" width="160" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip :content="$t('commonBtn.edit')" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:dict:edit']"></el-button>
            </el-tooltip>
            <el-tooltip :content="$t('commonBtn.delete')" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:dict:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- Add or modify parameter configuration dialog box -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="dataFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item :label="$t('dictManager.dictType')">
          <el-input v-model="form.dictType" :disabled="true" />
        </el-form-item>
        <el-form-item :label="$t('dictManager.dictLabel')" prop="dictLabel">
          <el-input v-model="form.dictLabel" :placeholder="$t('dictManager.dictLabel')" />
        </el-form-item>
        <el-form-item :label="$t('dictManager.dictValue')" prop="dictValue">
          <el-input v-model="form.dictValue" :placeholder="$t('dictManager.dictValue')" />
        </el-form-item>
        <el-form-item :label="$t('dictManager.cssClass')" prop="cssClass">
          <el-input v-model="form.cssClass" :placeholder="$t('dictManager.cssClass')" />
        </el-form-item>
        <el-form-item :label="$t('dictManager.dictSort')" prop="dictSort">
          <el-input-number v-model="form.dictSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item :label="$t('dictManager.listClass')" prop="listClass">
          <el-select v-model="form.listClass">
            <el-option
              v-for="item in listClassOptions"
              :key="item.value"
              :label="item.label + '(' + item.value + ')'"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('commonColumn.remark')" prop="remark">
          <el-input v-model="form.remark" type="textarea" :placeholder="$t('commonColumn.remark')"></el-input>
        </el-form-item>
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

<script setup name="Data" lang="ts">
import useDictStore from '@/store/modules/dict'
import { optionselect as getDictOptionselect, getType } from "@/api/system/dict/type";
import { listData, getData, delData, addData, updateData } from "@/api/system/dict/data";
import { DictTypeVO } from '@/api/system/dict/type/types';
import { DictDataForm, DictDataQuery, DictDataVO } from "@/api/system/dict/data/types";

const { proxy } = getCurrentInstance() as ComponentInternalInstance
const route = useRoute();

const dataList = ref<DictDataVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const defaultDictType = ref("");
const typeOptions = ref<DictTypeVO[]>([]);

const dataFormRef = ref<ElFormInstance>();
const queryFormRef = ref<ElFormInstance>();


const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

// Data label echo style
const listClassOptions = ref<Array<{ value: string, label: string }>>([
  { value: "default", label: "Default" },
  { value: "primary", label: "Primary" },
  { value: "success", label: "Success" },
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
  { value: "danger", label: "Danger" }
]);

const initFormData: DictDataForm = {
  dictCode: undefined,
  dictLabel: '',
  dictValue: '',
  cssClass: '',
  listClass: "default",
  dictSort: 0,
  remark: ''
}
const data = reactive<PageData<DictDataForm, DictDataQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    dictName: '',
    dictType: '',
    dictLabel: ''
  },
  rules: {
    dictLabel: [{ required: true, message: "Data label cannot be empty", trigger: "blur" }],
    dictValue: [{ required: true, message: "Data key value cannot be empty", trigger: "blur" }],
    dictSort: [{ required: true, message: "Data sequence cannot be empty", trigger: "blur" }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query dictionary type details */
const getTypes = async (dictId: string | number) => {
  const { data } = await getType(dictId);
  queryParams.value.dictType = data.dictType;
  defaultDictType.value = data.dictType;
  getList();
}

/** Query dictionary type list */
const getTypeList = async () => {
  const res = await getDictOptionselect()
  typeOptions.value = res.data;
}
/** Query dictionary data list */
const getList = async () => {
  loading.value = true;
  const res = await listData(queryParams.value);
  dataList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}
/** Cancel button */
const cancel = () => {
  dialog.visible = false;
  reset();
}
/** form reset */
const reset = () => {
  form.value = { ...initFormData };
  dataFormRef.value?.resetFields();
}
/** Search button action */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}
/** Back button action */
const handleClose = () => {
  const obj = { path: "/system/dict" };
  proxy?.$tab.closeOpenPage(obj);
}
/** reset button action */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.value.dictType = defaultDictType.value;
  handleQuery();
}
/** Add button operation */
const handleAdd = () => {
  reset();
  form.value.dictType = queryParams.value.dictType;
  dialog.visible = true;
  dialog.title = "Add dictionary data";
}
/** Multiple selection box selected data */
const handleSelectionChange = (selection: DictDataVO[]) => {
  ids.value = selection.map(item => item.dictCode);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
/** Modify button actions */
const handleUpdate = async (row?: DictDataVO) => {
  reset();
  const dictCode = row?.dictCode || ids.value[0];
  const res = await getData(dictCode);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "Modify dictionary data";
}
/** submit button */
const submitForm = () => {
  dataFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      form.value.dictCode ? await updateData(form.value) : await addData(form.value);
      useDictStore().removeDict(queryParams.value.dictType);
      proxy?.$modal.msgSuccess("Submitted Successfully");
      dialog.visible = false;
      await getList();

    }
  });
}
/** Delete button action */
const handleDelete = async (row?: DictDataVO) => {
  const dictCodes = row?.dictCode || ids.value;
  await proxy?.$modal.confirm('Confirm to delete the data with dictionary code"' + dictCodes + '"?');
  await delData(dictCodes);
  await getList();
  proxy?.$modal.msgSuccess("Successfully deleted");
  useDictStore().removeDict(queryParams.value.dictType);

}
/** Export button action */
const handleExport = () => {
  proxy?.download("system/dict/data/export", {
    ...queryParams.value
  }, `dict_data_${new Date().getTime()}.xlsx`);
}

onMounted(() => {
  getTypes(route.params && route.params.dictId as string);
  getTypeList();
})
</script>
