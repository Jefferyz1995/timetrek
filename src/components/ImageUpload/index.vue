<template>
  <div class="component-upload-image">
    <el-upload
      multiple
      :action="uploadImgUrl"
      list-type="picture-card"
      :on-success="handleUploadSuccess"
      :before-upload="handleBeforeUpload"
      :limit="limit"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      ref="imageUpload"
      :before-remove="handleDelete"
      :show-file-list="true"
      :headers="headers"
      :file-list="fileList"
      :on-preview="handlePictureCardPreview"
      :class="{ hide: fileList.length >= limit }"
    >
      <el-icon class="avatar-uploader-icon">
        <plus />
      </el-icon>
    </el-upload>
    <!-- upload notification -->
    <div class="el-upload__tip" v-if="showTip">
      Please upload
      <template v-if="fileSize">
        a file no larger than <b style="color: #f56c6c">{{ fileSize }}MB</b>
      </template>
      <template v-if="fileType">
        a file format in <b style="color: #f56c6c">{{ fileType.join("/") }}</b>
      </template>
    </div>

    <el-dialog v-model="dialogVisible" title="Preview" width="800px" append-to-body>
      <img :src="dialogImageUrl" style="display: block; max-width: 100%; margin: 0 auto" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { listByIds, delOss } from "@/api/system/oss";
import { ComponentInternalInstance } from "vue";
import { OssVO } from "@/api/system/oss/types";
import { propTypes } from '@/utils/propTypes';
import {globalHeaders} from "@/utils/request";

const props = defineProps({
    modelValue: [String, Object, Array],
    // image qty limit
    limit: propTypes.number.def(5),
    // Size limit(MB)
    fileSize: propTypes.number.def(5),
    // File types, such as['png', 'jpg', 'jpeg']
    fileType: propTypes.array.def(["png", "jpg", "jpeg"]),
    // whether display notification
    isShowTip: {
        type: Boolean,
        default: true
    },
});

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const emit = defineEmits(['update:modelValue']);
const number = ref(0);
const uploadList = ref<any[]>([]);
const dialogImageUrl = ref("");
const dialogVisible = ref(false);

const baseUrl = import.meta.env.VITE_APP_BASE_API;
const uploadImgUrl = ref(baseUrl + "/resource/oss/upload"); // server address to upload the image
const headers = ref(globalHeaders());

const fileList = ref<any[]>([]);
const showTip = computed(
    () => props.isShowTip && (props.fileType || props.fileSize)
);

const imageUploadRef = ref<ElUploadInstance>();

watch(() => props.modelValue, async val => {
    if (val) {
        // convert the value into an array
        let list: OssVO[] = [];
        if (Array.isArray(val)) {
            list = val as OssVO[];
        } else {
            const res = await listByIds(val as string)
            list = res.data
        }
        // Then convert the array into an object array
        fileList.value = list.map(item => {
            let itemData;
            if (typeof item === "string") {
                itemData = { name: item, url: item };
            } else {
                itemData = { name: item.ossId, url: item.url, ossId: item.ossId };
            }
            return itemData;
        });
    } else {
        fileList.value = [];
        return [];
    }
}, { deep: true, immediate: true });

/** loading before uploading */
const handleBeforeUpload = (file: any) => {
    let isImg = false;
    if (props.fileType.length) {
        let fileExtension = "";
        if (file.name.lastIndexOf(".") > -1) {
            fileExtension = file.name.slice(file.name.lastIndexOf(".") + 1);
        }
        isImg = props.fileType.some((type: any) => {
            if (file.type.indexOf(type) > -1) return true;
            if (fileExtension && fileExtension.indexOf(type) > -1) return true;
            return false;
        });
    } else {
        isImg = file.type.indexOf("image") > -1;
    }
    if (!isImg) {
        proxy?.$modal.msgError(
            `The file format is incorrect, please upload a ${props.fileType.join("/")}image format file!`
        );
        return false;
    }
    if (props.fileSize) {
        const isLt = file.size / 1024 / 1024 < props.fileSize;
        if (!isLt) {
            proxy?.$modal.msgError(`The size of the uploaded image cannot exceed ${props.fileSize} MB!`);
            return false;
        }
    }
    proxy?.$modal.loading("Uploading pictures, please wait...");
    number.value++;
}

// The qty of files exceeds
const handleExceed = () => {
    proxy?.$modal.msgError(`The number of uploaded files cannot exceed  ${props.limit} !`);
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
        imageUploadRef.value?.handleRemove(file);
        uploadedSuccessfully();
    }
}

// delete image
const handleDelete = (file: UploadFile): boolean => {
    const findex = fileList.value.map(f => f.name).indexOf(file.name);
    if (findex > -1 && uploadList.value.length === number.value) {
        let ossId = fileList.value[findex].ossId;
        delOss(ossId);
        fileList.value.splice(findex, 1);
        emit("update:modelValue", listToString(fileList.value));
        return false;
    }
    return true;
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

// upload failed
const handleUploadError = () => {
    proxy?.$modal.msgError("Failed to upload image");
    proxy?.$modal.closeLoading();
}

// preview
const handlePictureCardPreview = (file: any) => {
    dialogImageUrl.value = file.url;
    dialogVisible.value = true;
}

// Convert the object to the specified string delimited
const listToString = (list: any[], separator?: string) => {
    let strs = "";
    separator = separator || ",";
    for (let i in list) {
        if (undefined !== list[i].ossId && list[i].url.indexOf("blob:") !== 0) {
            strs += list[i].ossId + separator;
        }
    }
    return strs != "" ? strs.substring(0, strs.length - 1) : "";
}
</script>

<style scoped lang="scss">
// .el-upload--picture-card 
:deep(.hide .el-upload--picture-card) {
    display: none;
}
</style>
