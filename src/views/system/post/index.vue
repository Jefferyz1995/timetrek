<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="mb-[10px]" v-show="showSearch">
        <el-card shadow="hover">
          <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="100">
            <el-form-item :label="$t('postManager.postCode')" prop="postCode">
              <el-input v-model="queryParams.postCode" :placeholder="$t('postManager.postCode')" clearable style="width: 200px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item :label="$t('postManager.postName')" prop="postName">
              <el-input v-model="queryParams.postName" :placeholder="$t('postManager.postName')" clearable style="width: 200px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item :label="$t('commonColumn.status')" prop="status">
              <el-select v-model="queryParams.status" :placeholder="$t('commonColumn.status')" clearable style="width: 200px">
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
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:post:add']">{{$t('commonBtn.add')}}</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="success"
              plain
              icon="Edit"
              :disabled="single"
              @click="handleUpdate()"
              v-hasPermi="['system:post:edit']"
              >{{$t('commonBtn.edit')}}</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:post:remove']">
              {{$t('commonBtn.delete')}}</el-button
            >
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="postList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="Post ID" align="center" prop="postId" v-if="false" />
        <el-table-column :label="$t('postManager.postCode')" align="center" prop="postCode" />
        <el-table-column :label="$t('postManager.postName')" align="center" prop="postName" />
        <el-table-column :label="$t('postManager.postSort')" align="center" prop="postSort" />
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
        <el-table-column :label="$t('commonColumn.action')" width="180" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip :content="$t('commonBtn.edit')" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:post:edit']"></el-button>
            </el-tooltip>
            <el-tooltip :content="$t('commonBtn.delete')" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:post:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- Add or modify post dialog box -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="postFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item :label="$t('postManager.postName')" prop="postName">
          <el-input v-model="form.postName" :placeholder="$t('postManager.postName')" />
        </el-form-item>
        <el-form-item :label="$t('postManager.postCode')" prop="postCode">
          <el-input v-model="form.postCode" :placeholder="$t('postManager.postCode')" />
        </el-form-item>
        <el-form-item :label="$t('postManager.postSort')" prop="postSort">
          <el-input-number v-model="form.postSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item :label="$t('commonColumn.status')" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('commonColumn.remark')" prop="remark">
          <el-input v-model="form.remark" type="textarea" :placeholder="$t('commonColumn.remark')" />
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

<script setup name="Post" lang="ts">
import { listPost, addPost, delPost, getPost, updatePost } from "@/api/system/post";
import { PostForm, PostQuery, PostVO } from "@/api/system/post/types";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable } = toRefs<any>(proxy?.useDict("sys_normal_disable"));

const postList = ref<PostVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<number | string>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const postFormRef = ref<ElFormInstance>();
const queryFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: PostForm = {
  postId: undefined,
  postCode: '',
  postName: '',
  postSort: 0,
  status: "0",
  remark: ''
}

const data = reactive<PageData<PostForm, PostQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    postCode: '',
    postName: '',
    status: ''
  },
  rules: {
    postName: [{ required: true, message: "Post Name cannot be empty", trigger: "blur" }],
    postCode: [{ required: true, message: "Post ID cannot be empty", trigger: "blur" }],
    postSort: [{ required: true, message: "Post sorting cannot be empty", trigger: "blur" }],
  }
});

const { queryParams, form, rules } = toRefs<PageData<PostForm, PostQuery>>(data);

/** Query post list */
const getList = async () => {
  loading.value = true;
  const res = await listPost(queryParams.value);
  postList.value = res.rows;
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
  postFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: PostVO[]) => {
  ids.value = selection.map(item => item.postId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
/** Add button operation */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "Add Post";
}
/** Modify button actions */
const handleUpdate = async (row?: PostVO) => {
  reset();
  const postId = row?.postId || ids.value[0];
  const res = await getPost(postId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "Modify Post";
}
/** submit button */
const submitForm = () => {
  postFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      form.value.postId ? await updatePost(form.value) : await addPost(form.value);
      proxy?.$modal.msgSuccess("Submitted Successfully");
      dialog.visible = false;
      await getList();
    }
  });
}
/** Delete button action */
const handleDelete = async (row?: PostVO) => {
  const postIds = row?.postId || ids.value;
  await proxy?.$modal.confirm('Confirm delete"' + postIds + '"？');
  await delPost(postIds);
  await getList();
  proxy?.$modal.msgSuccess("Successfully deleted");
}
/** Export button action */
const handleExport = () => {
  proxy?.download("system/post/export", {
    ...queryParams.value
  }, `post_${new Date().getTime()}.xlsx`);
}

onMounted(() => {
  getList();
});
</script>
