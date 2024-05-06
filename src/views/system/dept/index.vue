<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="mb-[10px]" v-show="showSearch">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="100px">
            <el-form-item :label="$t('deptManager.deptName')" prop="deptName">
              <el-input v-model="queryParams.deptName" :placeholder="$t('deptManager.deptName')" clearable style="width: 240px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item :label="$t('commonColumn.status')" prop="status">
              <el-select v-model="queryParams.status" :placeholder="$t('commonColumn.status')" clearable>
                <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
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
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd()" v-hasPermi="['system:dept:add']">{{$t('commonBtn.add')}} </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="Sort" @click="handleToggleExpandAll">Unfold/fold</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table
        v-loading="loading"
        :data="deptList"
        row-key="deptId"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        ref="deptTableRef"
        :default-expand-all="isExpandAll"
      >
        <el-table-column prop="deptName" :label="$t('deptManager.deptName')" width="260"></el-table-column>
        <el-table-column prop="orderNum" align="center" :label="$t('deptManager.orderNum')" width="200"></el-table-column>
        <el-table-column prop="status" align="center" :label="$t('commonColumn.status')" width="100">
          <template #default="scope">
            <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('commonColumn.createTime')" align="center" prop="createTime" width="200">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" align="center" :label="$t('commonColumn.action')">
          <template #default="scope">
            <el-tooltip :content="$t('commonBtn.edit')" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:dept:edit']" />
            </el-tooltip>
            <el-tooltip :content="$t('commonBtn.add')" placement="top">
              <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['system:dept:add']" />
            </el-tooltip>
            <el-tooltip :content="$t('commonBtn.delete')" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:dept:remove']" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="dialog.title" v-model="dialog.visible" destroy-on-close append-to-body width="600px">
      <el-form ref="deptFormRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24" v-if="form.parentId !== 0">
            <el-form-item :label="$t('deptManager.parent')" prop="parentId">
              <el-tree-select
                v-model="form.parentId"
                :data="deptOptions"
                :props="{ value: 'deptId', label: 'deptName', children: 'children' }"
                value-key="deptId"
                :placeholder="$t('deptManager.parent')"
                check-strictly
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('deptManager.deptName')" prop="deptName">
              <el-input v-model="form.deptName" :placeholder="$t('deptManager.deptName')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('deptManager.orderNum')" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('deptManager.leader')" prop="leader">
              <el-select v-model="form.leader" :placeholder="$t('deptManager.leader')">
                <el-option v-for="item in deptUserList" :key="item.userId" :label="item.userName" :value="item.userId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('commonColumn.status')">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label
                }}</el-radio>
              </el-radio-group>
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

<script setup name="Dept" lang="ts">
import { listDept, getDept, delDept, addDept, updateDept, listDeptExcludeChild } from "@/api/system/dept"
import { DeptForm, DeptQuery, DeptVO } from "@/api/system/dept/types";
import {UserVO} from "@/api/system/user/types";
import {listUserByDeptId} from "@/api/system/user";

interface DeptOptionsType {
  deptId: number | string;
  deptName: string;
  children: DeptOptionsType[];

}

const { proxy } = getCurrentInstance() as ComponentInternalInstance
const { sys_normal_disable } = toRefs<any>(proxy?.useDict("sys_normal_disable"));

const deptList = ref<DeptVO[]>([])
const loading = ref(true)
const showSearch = ref(true)
const deptOptions = ref<DeptOptionsType[]>([])
const isExpandAll = ref(true)
const deptUserList = ref<UserVO[]>([]);

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const deptTableRef = ref<ElTableInstance>();
const queryFormRef = ref<ElFormInstance>();
const deptFormRef = ref<ElFormInstance>();

const initFormData: DeptForm = {
  deptId: undefined,
  parentId: undefined,
  deptName: undefined,
  orderNum: 0,
  leader: undefined,
  phone: undefined,
  email: undefined,
  status: "0"
}
const data = reactive<PageData<DeptForm, DeptQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    deptName: undefined,
    status: undefined
  },
  rules: {
    parentId: [{ required: true, message: "The parent department cannot be empty", trigger: "blur" }],
    deptName: [{ required: true, message: "Dept name cannot be empty", trigger: "blur" }],
    orderNum: [{ required: true, message: "Sorting number cannot be empty", trigger: "blur" }],
    email: [{ type: "email", message: "Please enter the correct email", trigger: ["blur", "change"] }],
    phone: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "Please enter the correct number", trigger: "blur" }]
  },
})

const { queryParams, form, rules } = toRefs<PageData<DeptForm, DeptQuery>>(data)

/** Query menu list */
const getList = async () => {
  loading.value = true;
  const res = await listDept(queryParams.value);
  const data = proxy?.handleTree<DeptVO>(res.data, "deptId")
  if (data) {
    deptList.value = data
  }
  loading.value = false
}

/** Query all users in the current department */
async function getDeptAllUser(deptId: any) {
  if (deptId !== null && deptId !== "" && deptId !== undefined) {
    const res = await listUserByDeptId(deptId);
    deptUserList.value = res.data;
  }
}

/** Cancel button */
const cancel = () => {
  reset()
  dialog.visible = false
}
/** form reset */
const reset = () => {
  form.value = { ...initFormData };
  deptFormRef.value?.resetFields();
}

/** Search button action */
const handleQuery = () => {
  getList();
}
/** reset button action */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery()
}

/** Unfold/fold */
const handleToggleExpandAll = () => {
  isExpandAll.value = !isExpandAll.value;
  toggleExpandAll(deptList.value, isExpandAll.value)
}
/** Unfold/fold all */
const toggleExpandAll = (data: DeptVO[], status: boolean) => {
  data.forEach((item) => {
    deptTableRef.value?.toggleRowExpansion(item, status)
    if (item.children && item.children.length > 0) toggleExpandAll(item.children, status)
  })
}

/** Add button operation */
const handleAdd = async (row?: DeptVO) => {
  reset();
  const res = await listDept();
  const data = proxy?.handleTree<DeptOptionsType>(res.data, "deptId");
  if (data) {
    deptOptions.value = data
    if (row && row.deptId) {
      form.value.parentId = row?.deptId;
    }
    dialog.visible = true;
    dialog.title = "Add Dept";
  }
}

/** Modify button actions */
const handleUpdate = async (row: DeptVO) => {
  reset();
  //Query all users in the current department
  getDeptAllUser(row.deptId);
  const res = await getDept(row.deptId);
  form.value = res.data
  const response = await listDeptExcludeChild(row.deptId);
  const data = proxy?.handleTree<DeptOptionsType>(response.data, "deptId")
  if (data) {
    deptOptions.value = data;
    if (data.length === 0) {
      const noResultsOptions: DeptOptionsType = {
        deptId: res.data.parentId,
        deptName: res.data.parentName,
        children: []
      };
      deptOptions.value.push(noResultsOptions);
    }
  }
  dialog.visible = true;
  dialog.title = "Edit Dept";
}
/** submit button */
const submitForm = () => {
  deptFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      form.value.deptId ? await updateDept(form.value) : await addDept(form.value);
      proxy?.$modal.msgSuccess("Submitted Successfully");
      dialog.visible = false;
      await getList();
    }
  })
}
/** Delete button action */
const handleDelete = async (row: DeptVO) => {
  await proxy?.$modal.confirm('Confirm delete"' + row.deptName + '?');
  await delDept(row.deptId);
  await getList();
  proxy?.$modal.msgSuccess("Deleted Successfully");
}

onMounted(() => {
  getList();
});
</script>
