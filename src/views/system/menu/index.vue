<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="mb-[10px]" v-show="showSearch">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="100px">
            <el-form-item :label="$t('menuManager.menuName')" prop="menuName">
              <el-input v-model="queryParams.menuName" :placeholder="$t('menuManager.menuName')" clearable style="width: 240px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item :label="$t('commonColumn.status')" prop="status">
              <el-select v-model="queryParams.status" :placeholder="$t('menuManager.status')" clearable>
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd()" v-hasPermi="['system:menu:add']">{{$t('commonBtn.add')}}</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="Sort" @click="handleToggleExpandAll">Unfold/fold</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table
        v-loading="loading"
        :data="menuList"
        row-key="menuId"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        ref="menuTableRef"
        :default-expand-all="isExpandAll"
      >
        <el-table-column prop="menuName" :label="$t('menuManager.menuName')" :show-overflow-tooltip="true" width="160"></el-table-column>
        <el-table-column prop="icon" :label="$t('menuManager.icon')" align="center" width="100">
          <template #default="scope">
            <svg-icon :icon-class="scope.row.icon" />
          </template>
        </el-table-column>
        <el-table-column prop="orderNum" :label="$t('menuManager.orderNum')" width="60"></el-table-column>
        <el-table-column prop="perms" :label="$t('menuManager.perms')" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="component" :label="$t('menuManager.component')" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="status" :label="$t('commonColumn.status')" width="80">
          <template #default="scope">
            <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('commonColumn.createTime')" align="center" prop="createTime">
          <template #default="scope">
            <span>{{ scope.row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" :label="$t('commonColumn.action')" width="180">
          <template #default="scope">
            <el-tooltip :content="$t('commonBtn.edit')" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:menu:edit']" />
            </el-tooltip>
            <el-tooltip :content="$t('commonBtn.Add')" placement="top">
              <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['system:menu:add']" />
            </el-tooltip>
            <el-tooltip :content="$t('commonBtn.delete')" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:menu:remove']" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="dialog.title" v-model="dialog.visible" destroy-on-close append-to-bod width="750px">
      <el-form ref="menuFormRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$t('menuManager.parent')">
              <el-tree-select
                v-model="form.parentId"
                :data="menuOptions"
                :props="{ value: 'menuId', label: 'menuName', children: 'children' }"
                value-key="menuId"
                :placeholder="$t('menuManager.parent')"
                check-strictly
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('menuManager.menuType')" prop="menuType">
              <el-radio-group v-model="form.menuType">
                <el-radio label="M">Directory</el-radio>
                <el-radio label="C">Menu</el-radio>
                <el-radio label="F">Button</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="form.menuType !== 'F'">
            <el-form-item :label="$t('menuManager.icon')" prop="icon">
              <!-- 图标选择器 -->
              <icon-select v-model="form.icon" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('menuManager.menuName')" prop="menuName">
              <el-input v-model="form.menuName" :placeholder="$t('menuManager.menuName')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('menuManager.orderNum')" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType !== 'F'">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip content="If you choose an external link, the routing address needs to start with `http(s)://`" placement="top">
                    <el-icon>
                      <question-filled />
                    </el-icon>
                  </el-tooltip>
                  {{$t('menuManager.isFrame')}}
                </span>
              </template>
              <el-radio-group v-model="form.isFrame">
                <el-radio label="0">YES</el-radio>
                <el-radio label="1">NO</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType !== 'F'">
            <el-form-item prop="path">
              <template #label>
                <span>
                  <el-tooltip
                    content="The accessed routing address, such as: `user`, if the external network address requires internal link access, it starts with `http(s)://`"
                    placement="top"
                  >
                    <el-icon>
                      <question-filled />
                    </el-icon>
                  </el-tooltip>
                  {{$t('menuManager.path')}}
                </span>
              </template>
              <el-input v-model="form.path" :placeholder="$t('menuManager.path')" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType === 'C'">
            <el-form-item prop="component">
              <template #label>
                <span>
                  <el-tooltip
                    content="Accessed component path, such as: `system/user/index`, which is in the `views` directory by default"
                    placement="top"
                  >
                    <el-icon>
                      <question-filled />
                    </el-icon>
                  </el-tooltip>
                  {{$t('menuManager.component')}}
                </span>
              </template>
              <el-input v-model="form.component" :placeholder="$t('menuManager.component')" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType !== 'M'">
            <el-form-item>
              <el-input v-model="form.perms" :placeholder="$t('menuManager.perms')" maxlength="100" />
              <template #label>
                <span>
                  <el-tooltip content="控制器中定义的权限字符，如：@SaCheckPermission('system:user:list')" placement="top">
                    <el-icon>
                      <question-filled />
                    </el-icon>
                  </el-tooltip>
                  {{$t('menuManager.perms')}}
                </span>
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType === 'C'">
            <el-form-item>
              <el-input v-model="form.queryParam" :placeholder="$t('menuManager.queryParam')" maxlength="255" />
              <template #label>
                <span>
                  <el-tooltip content='The default passing parameters for access routes, such as: `{"id": 1, "name": "ry"}' placement="top">
                    <el-icon>
                      <question-filled />
                    </el-icon>
                  </el-tooltip>
                  {{$t('menuManager.queryParam')}}
                </span>
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType === 'C'">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip
                    content="If you select yes, it will be cached by `keep-alive`. The `name` and address of the matching component need to be consistent."
                    placement="top"
                  >
                    <el-icon>
                      <question-filled />
                    </el-icon>
                  </el-tooltip>
                  {{$t('menuManager.isCache')}}
                </span>
              </template>
              <el-radio-group v-model="form.isCache">
                <el-radio label="0">cache</el-radio>
                <el-radio label="1">Not cache</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType !== 'F'">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip content="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问" placement="top">
                    <el-icon>
                      <question-filled />
                    </el-icon>
                  </el-tooltip>
                  {{$t('menuManager.visible')}}
                </span>
              </template>
              <el-radio-group v-model="form.visible">
                <el-radio v-for="dict in sys_show_hide" :key="dict.value" :label="dict.value">{{ dict.label }} </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip content="If you choose to disable it, the route will not appear in the sidebar and cannot be accessed." placement="top">
                    <el-icon>
                      <question-filled />
                    </el-icon>
                  </el-tooltip>
                  {{$t('commonColumn.status')}}
                </span>
              </template>
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">
                  {{ dict.label }}
                </el-radio>
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

<script setup name="Menu" lang="ts">
import { addMenu, delMenu, getMenu, listMenu, updateMenu } from '@/api/system/menu';
import { MenuForm, MenuQuery, MenuVO } from '@/api/system/menu/types';
import { MenuTypeEnum } from '@/enums/MenuTypeEnum';

interface MenuOptionsType {
  menuId: number;
  menuName: string;
  children: MenuOptionsType[] | undefined;
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance
const { sys_show_hide, sys_normal_disable } = toRefs<any>(proxy?.useDict("sys_show_hide", "sys_normal_disable"));

const menuList = ref<MenuVO[]>([])
const loading = ref(true)
const showSearch = ref(true)
const menuOptions = ref<MenuOptionsType[]>([])
const isExpandAll = ref(false)

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const queryFormRef = ref<ElFormInstance>();
const menuFormRef = ref<ElFormInstance>();
const initFormData = {
  path: '',
  menuId: undefined,
  parentId: 0,
  menuName: '',
  icon: '',
  menuType: MenuTypeEnum.M,
  orderNum: 1,
  isFrame: "1",
  isCache: "0",
  visible: "0",
  status: "0"
}
const data = reactive<PageData<MenuForm, MenuQuery>>({
  form: { ...initFormData },
  queryParams: {
    menuName: undefined,
    status: undefined
  },
  rules: {
    menuName: [{ required: true, message: "菜单名称不能为空", trigger: "blur" }],
    orderNum: [{ required: true, message: "菜单顺序不能为空", trigger: "blur" }],
    path: [{ required: true, message: "路由地址不能为空", trigger: "blur" }]
  },
})

const menuTableRef = ref<ElTableInstance>();

const { queryParams, form, rules } = toRefs<PageData<MenuForm, MenuQuery>>(data)
/** 查询菜单列表 */
const getList = async () => {
  loading.value = true
  const res = await listMenu(queryParams.value);
  const data = proxy?.handleTree<MenuVO>(res.data, "menuId")
  if (data) {
    menuList.value = data
  }
  loading.value = false
}
/** 查询菜单下拉树结构 */
const getTreeselect = async () => {
  menuOptions.value = []
  const response = await listMenu();
  const menu: MenuOptionsType = { menuId: 0, menuName: "主类目", children: [] }
  menu.children = proxy?.handleTree<MenuOptionsType>(response.data, "menuId")
  menuOptions.value.push(menu)
}
/** 取消按钮 */
const cancel = () => {
  reset()
  dialog.visible = false
}
/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  menuFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  getList();
}
/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
}
/** 新增按钮操作 */
const handleAdd = (row?: MenuVO) => {
  reset();
  getTreeselect();
  row && row.menuId ? form.value.parentId = row.menuId : form.value.parentId = 0;
  dialog.visible = true;
  dialog.title = "Add Menu";
}
/** Unfold/fold操作 */
const handleToggleExpandAll = () => {
  isExpandAll.value = !isExpandAll.value;
  toggleExpandAll(menuList.value, isExpandAll.value)
}
/** Unfold/fold所有 */
const toggleExpandAll = (data: MenuVO[], status: boolean) => {
  data.forEach((item: MenuVO) => {
    menuTableRef.value?.toggleRowExpansion(item, status)
    if (item.children && item.children.length > 0) toggleExpandAll(item.children, status)
  })
}
/** 修改按钮操作 */
const handleUpdate = async (row: MenuVO) => {
  reset();
  await getTreeselect();
  if (row.menuId) {
    const { data } = await getMenu(row.menuId);
    form.value = data;
  }
  dialog.visible = true;
  dialog.title = "Modify Menu";
}
/** 提交按钮 */
const submitForm = () => {
  menuFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      form.value.menuId ? await updateMenu(form.value) : await addMenu(form.value);
      proxy?.$modal.msgSuccess("Successful operation");
      dialog.visible = false;
      await getList();
    }
  })
}
/** 删除按钮操作 */
const handleDelete = async (row: MenuVO) => {
  await proxy?.$modal.confirm('Confirm Delete"' + row.menuName + '?');
  await delMenu(row.menuId);
  await getList();
  proxy?.$modal.msgSuccess("Successfully deleted");
}

onMounted(() => {
  getList();
});
</script>
