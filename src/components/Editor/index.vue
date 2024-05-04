<template>
  <div>
    <el-upload
      :action="upload.url"
      :before-upload="handleBeforeUpload"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadError"
      class="editor-img-uploader"
      name="file"
      :show-file-list="false"
      :headers="upload.headers"
      ref="uploadRef"
      v-if="type === 'url'"
    >
    </el-upload>
    <div class="editor">
      <quill-editor
        ref="quillEditorRef"
        v-model:content="content"
        contentType="html"
        @textChange="(e: any) => $emit('update:modelValue', content)"
        :options="options"
        :style="styles"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { QuillEditor, Quill } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import { propTypes } from '@/utils/propTypes';
import { globalHeaders } from "@/utils/request";

const props = defineProps({
  /* Editor content */
  modelValue: propTypes.string,
  /* height */
  height: propTypes.number.def(400),
  /* minimum height */
  minHeight: propTypes.number.def(400),
  /* readonly */
  readOnly: propTypes.bool.def(false),
  /* Upload file size limit (MB) */
  fileSize: propTypes.number.def(5),
  /* Type (base64 format, url format) */
  type: propTypes.string.def('url')
});

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const upload = reactive<UploadOption>({
  headers: globalHeaders(),
  url: import.meta.env.VITE_APP_BASE_API + '/resource/oss/upload'
})
const quillEditorRef = ref();

const options = ref({
  theme: "snow",
  bounds: document.body,
  debug: "warn",
  modules: {
    // Toolbar configuration
    toolbar: {
      container: [
        ["bold", "italic", "underline", "strike"],
        ["blockquote", "code-block"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ size: ["small", false, "large", "huge"] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ["clean"],
        ["link", "image", "video"]
      ],
      handlers: {
        image: function (value: any) {
          if (value) {
            // Call element image upload
            (document.querySelector(".editor-img-uploader>.el-upload") as HTMLDivElement)?.click();
          } else {
            Quill.format("image", true);
          }
        },
      },
    }
  },
  placeholder: "Please Input Content",
  readOnly: props.readOnly,
});

const styles = computed(() => {
  let style: any = {};
  if (props.minHeight) {
    style.minHeight = `${props.minHeight}px`;
  }
  if (props.height) {
    style.height = `${props.height}px`;
  }
  return style;
})

const content = ref("");
watch(() => props.modelValue, (v) => {
  if (v !== content.value) {
    content.value = v === undefined ? "<p></p>" : v;
  }
}, { immediate: true });

// Image upload is successful and the image address is returned
const handleUploadSuccess = (res: any) => {
  // If the upload is successful
  if (res.code === 200) {
    // Get rich text instance
    let quill = toRaw(quillEditorRef.value).getQuill();
    // Get cursor position
    let length = quill.selection.savedRange.index;
    // Insert a picture, res is the picture link address returned by the server
    quill.insertEmbed(length, "image", res.data.url);
    // Adjust the cursor to the end
    quill.setSelection(length + 1);
    proxy?.$modal.closeLoading();
  } else {
    proxy?.$modal.loading(res.msg);
    proxy?.$modal.closeLoading();
  }
}

// handle images before uploading
const handleBeforeUpload = (file: any) => {
  const type = ["image/jpeg", "image/jpg", "image/png", "image/svg"];
  const isJPG = type.includes(file.type);
  //Check file format
  if (!isJPG) {
    proxy?.$modal.msgError(`Image Format Error!`);
    return false;
  }
  // check file size
  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize;
    if (!isLt) {
      proxy?.$modal.msgError(`Upload file size cannot exceed ${props.fileSize} MB!`);
      return false;
    }
  }
  proxy?.$modal.loading('Uploading files, Please Wait...');
  return true;
}

// handle images error
const handleUploadError = (err: any) => {
  console.error(err);
  proxy?.$modal.msgError('File upload failed');
}
</script>

<style>
.editor-img-uploader {
  display: none;
}
.editor,
.ql-toolbar {
  white-space: pre-wrap !important;
  line-height: normal !important;
}
.quill-img {
  display: none;
}
.ql-snow .ql-tooltip[data-mode="link"]::before {
  content: "Please enter the link address:";
}
.ql-snow .ql-tooltip.ql-editing a.ql-action::after {
  border-right: 0;
  content: "Save";
  padding-right: 0;
}
.ql-snow .ql-tooltip[data-mode="video"]::before {
  content: "Please enter the video address:";
}
.ql-snow .ql-picker.ql-size .ql-picker-label::before,
.ql-snow .ql-picker.ql-size .ql-picker-item::before {
  content: "14px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="small"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="small"]::before {
  content: "10px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="large"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="large"]::before {
  content: "18px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="huge"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="huge"]::before {
  content: "32px";
}
.ql-snow .ql-picker.ql-header .ql-picker-label::before,
.ql-snow .ql-picker.ql-header .ql-picker-item::before {
  content: "Text";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="1"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="1"]::before {
  content: "Head 1";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="2"]::before {
  content: "Head 2";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="3"]::before {
  content: "Head 3";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="4"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="4"]::before {
  content: "Head 4";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="5"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="5"]::before {
  content: "Head 5";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="6"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="6"]::before {
  content: "Head 6";
}
.ql-snow .ql-picker.ql-font .ql-picker-label::before,
.ql-snow .ql-picker.ql-font .ql-picker-item::before {
  content: "Standard Font";
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="serif"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="serif"]::before {
  content: "Serif Font";
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="monospace"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="monospace"]::before {
  content: "Monospaced Font";
}
</style>
