<template>
  <div class="upload-file">
    <el-upload
      multiple
      :action="uploadFileUrl"
      :before-upload="handleBeforeUpload"
      :file-list="fileList"
      :limit="limit"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      :on-success="handleUploadSuccess"
      :show-file-list="false"
      :headers="headers"
      class="upload-file-uploader"
      ref="fileUploadRef"
    >
      <!-- Upload button -->
      <el-button type="primary">Select File</el-button>
    </el-upload>
    <!-- Upload prompt -->
    <div class="el-upload__tip" v-if="showTip">
      Upload
      <template v-if="fileSize">
        Size does not exceed <b style="color: #f56c6c">{{ fileSize }}MB</b>
      </template>
      <template v-if="fileType">
        File in <b style="color: #f56c6c">{{ fileType.join("/") }}</b>
      </template>
      format
    </div>
    <!-- Filelist -->
    <transition-group class="upload-file-list el-upload-list el-upload-list--text" name="el-fade-in-linear" tag="ul">
      <li :key="file.uid" class="el-upload-list__item ele-upload-list__item-content" v-for="(file, index) in fileList">
        <el-link :href="`${file.url}`" :underline="false" target="_blank">
          <span class="el-icon-document"> {{ getFileName(file.name) }} </span>
        </el-link>
        <div class="ele-upload-list__item-content-action">
          <el-link :underline="false" @click="handleDelete(index)" type="danger">{{$t('commonBtn.delete')}}</el-link>
        </div>
      </li>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { listByIds, delOss } from "@/api/system/oss";
import { propTypes } from '@/utils/propTypes';
import { globalHeaders } from "@/utils/request";

const props = defineProps({
    modelValue: [String, Object, Array],
    // Quantitative restrictions
    limit: propTypes.number.def(5),
    // Size limit(MB)
    fileSize: propTypes.number.def(5),
    // File types, such as ['png', 'jpg', 'jpeg']
    fileType: propTypes.array.def(["doc", "xls", "ppt", "txt", "pdf"]),
    // Whether to display prompts
    isShowTip: propTypes.bool.def(true),
});

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const emit = defineEmits(['update:modelValue']);
const number = ref(0);
const uploadList = ref<any[]>([]);

const baseUrl = import.meta.env.VITE_APP_BASE_API;
const uploadFileUrl = ref(baseUrl + "/resource/oss/upload"); // Upload file server address
const headers = ref(globalHeaders());

const fileList = ref<any[]>([]);
const showTip = computed(
    () => props.isShowTip && (props.fileType || props.fileSize)
);

const fileUploadRef = ref<ElUploadInstance>();

watch(() => props.modelValue, async val => {
    if (val) {
        let temp = 1;
        // convert the value into an array
        let list = [];
        if (Array.isArray(val)) {
            list = val;
        } else {
            const res = await listByIds(val as string)
            list = res.data.map((oss) => {
                const data = { name: oss.originalName, url: oss.url, ossId: oss.ossId };
                return data;
            });
        }
        // Then convert the array into an object array
        fileList.value = list.map(item => {
            item = { name: item.name, url: item.url, ossId: item.ossId };
            item.uid = item.uid || new Date().getTime() + temp++;
            return item;
        });
    } else {
        fileList.value = [];
        return [];
    }
}, { deep: true, immediate: true });

// Check format and size before uploading
const handleBeforeUpload = (file: any) => {
    // check file type
    if (props.fileType.length) {
        const fileName = file.name.split('.');
        const fileExt = fileName[fileName.length - 1];
        const isTypeOk = props.fileType.indexOf(fileExt) >= 0;
        if (!isTypeOk) {
            proxy?.$modal.msgError(`The file format is incorrect, please upload a ${props.fileType.join("/")}format file!`);
            return false;
        }
    }
    // check file size
    if (props.fileSize) {
        const isLt = file.size / 1024 / 1024 < props.fileSize;
        if (!isLt) {
            proxy?.$modal.msgError(`Upload file size cannot exceed ${props.fileSize} MB!`);
            return false;
        }
    }
    proxy?.$modal.loading("Uploading files, please wait...");
    number.value++;
    return true;
}

// The number of files exceeds
const handleExceed = () => {
    proxy?.$modal.msgError(`The number of uploaded files cannot exceed ${props.limit}`);
}

// upload failed
const handleUploadError = () => {
    proxy?.$modal.msgError("File upload failed");
}

// Upload success callback
const handleUploadSuccess = (res: any, file: UploadFile) => {
    if (res.code === 200) {
        uploadList.value.push({ name: res.data.fileName, url: res.data.url, ossId: res.data.ossId });
        uploadedSuccessfully();
    } else {
        number.value--;
        proxy?.$modal.closeLoading();
        proxy?.$modal.msgError(res.msg);
        fileUploadRef.value?.handleRemove(file);
        uploadedSuccessfully();
    }
}

// delete file
const handleDelete = (index: number) => {
    let ossId = fileList.value[index].ossId;
    delOss(ossId);
    fileList.value.splice(index, 1);
    emit("update:modelValue", listToString(fileList.value));
}

// upload completed
const uploadedSuccessfully = () => {
    if (number.value > 0 && uploadList.value.length === number.value) {
        fileList.value = fileList.value.filter(f => f.url !== undefined).concat(uploadList.value);
        uploadList.value = [];
        number.value = 0;
        emit("update:modelValue", listToString(fileList.value));
        proxy?.$modal.closeLoading();
    }
}

// get file name
const getFileName = (name: string) => {
    // If it is a url, then take the last name. If it is not returned directly,
    if (name.lastIndexOf("/") > -1) {
        return name.slice(name.lastIndexOf("/") + 1);
    } else {
        return name;
    }
}

// Convert the object to the specified string delimited
const listToString = (list: any[], separator?: string) => {
    let strs = "";
    separator = separator || ",";
    list.forEach(item => {
        if (item.ossId) {
            strs += item.ossId + separator;
        }
    })
    return strs != "" ? strs.substring(0, strs.length - 1) : "";
}
</script>

<style scoped lang="scss">
.upload-file-uploader {
    margin-bottom: 5px;
}

.upload-file-list .el-upload-list__item {
    border: 1px solid #e4e7ed;
    line-height: 2;
    margin-bottom: 10px;
    position: relative;
}

.upload-file-list .ele-upload-list__item-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: inherit;
}

.ele-upload-list__item-content-action .el-link {
    margin-right: 10px;
}
</style>
