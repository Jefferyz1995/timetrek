<template>
  <el-form ref="basicInfoForm" :model="infoForm" :rules="rules" label-width="150px">
    <el-row>
      <el-col :span="12">
        <el-form-item label="Table name" prop="tableName">
          <el-input placeholder="Table name" v-model="infoForm.tableName" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Descrption" prop="tableComment">
          <el-input placeholder="Descrption" v-model="infoForm.tableComment" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Entity class name" prop="className">
          <el-input placeholder="Class name" v-model="infoForm.className" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Author Name" prop="functionAuthor">
          <el-input placeholder="Author Name" v-model="infoForm.functionAuthor" />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item :label="$t('commonColumn.remark')" prop="remark">
          <el-input type="textarea" :rows="3" v-model="infoForm.remark"></el-input>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup lang="ts">
import { propTypes } from "@/utils/propTypes";

const prop = defineProps({
  info: propTypes.any.def({})
});

const infoForm = computed(() => prop.info)


const rules = ref({
  tableName: [{ required: true, message: "Table Name", trigger: "blur" }],
  tableComment: [{ required: true, message: "Table Descrption", trigger: "blur" }],
  className: [{ required: true, message: "Entity Class Name", trigger: "blur" }],
  functionAuthor: [{ required: true, message: "Author", trigger: "blur" }]
});
</script>
