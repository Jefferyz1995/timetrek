<template>
  <div class="user-info-head" @click="editCropper()">
    <img :src="options.img" title="Upload Image" class="img-circle img-lg" />
    <el-dialog :title="title" v-model="open" width="800px" append-to-body @opened="modalOpened" @close="closeDialog">
      <el-row>
        <el-col :xs="24" :md="12" :style="{ height: '350px' }">
          <vue-cropper
            ref="cropper"
            :img="options.img"
            :info="true"
            :autoCrop="options.autoCrop"
            :autoCropWidth="options.autoCropWidth"
            :autoCropHeight="options.autoCropHeight"
            :fixedBox="options.fixedBox"
            :outputType="options.outputType"
            @realTime="realTime"
            v-if="visible"
          />
        </el-col>
        <el-col :xs="24" :md="12" :style="{ height: '350px' }">
          <div class="avatar-upload-preview">
            <img :src="options.previews.url" :style="options.previews.img" />
          </div>
        </el-col>
      </el-row>
      <br />
      <el-row>
        <el-col :lg="2" :md="2">
          <el-upload action="#" :http-request="requestUpload" :show-file-list="false" :before-upload="beforeUpload">
            <el-button>
              Select
              <el-icon class="el-icon--right">
                <Upload />
              </el-icon>
            </el-button>
          </el-upload>
        </el-col>
        <el-col :lg="{ span: 1, offset: 2 }" :md="2">
          <el-button icon="Plus" @click="changeScale(1)"></el-button>
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button icon="Minus" @click="changeScale(-1)"></el-button>
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button icon="RefreshLeft" @click="rotateLeft()"></el-button>
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button icon="RefreshRight" @click="rotateRight()"></el-button>
        </el-col>
        <el-col :lg="{ span: 2, offset: 6 }" :md="2">
          <el-button type="primary" @click="uploadImg()">Submit</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import "vue-cropper/dist/index.css";
import { VueCropper } from "vue-cropper";
import { uploadAvatar } from "@/api/system/user";
import useUserStore from "@/store/modules/user";

interface Options {
  img: string | any;
  autoCrop: boolean; 
  autoCropWidth: number;
  autoCropHeight: number;
  fixedBox: boolean;
  fileName: string;
  previews: any;
  outputType: string;
  visible: boolean;
}


const userStore = useUserStore();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const open = ref(false);
const visible = ref(false);
const title = ref("Change Image");

const cropper = ref<any>({});

const options = reactive<Options>({
  img: userStore.avatar,
  autoCrop: true,
  autoCropWidth: 200,
  autoCropHeight: 200,
  fixedBox: true,
  outputType: "png",
  fileName: "",
  previews: {},
  visible: false
});


const editCropper = () => {
  open.value = true;
};

const modalOpened = () => {
  visible.value = true;
};

const requestUpload = (): any => {
};

const rotateLeft = () => {
  cropper.value.rotateLeft();
};

const rotateRight = () => {
  cropper.value.rotateRight();
};

const changeScale = (num: number) => {
  num = num || 1;
  cropper.value.changeScale(num);
};

const beforeUpload = (file: any) => {
  if (file.type.indexOf("image/") == -1) {
    proxy?.$modal.msgError("Format Error，Please upload the file in JPG, PNG format");
  } else {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      options.img = reader.result;
      options.fileName = file.name;
    };
  }
};
/** Upload */
const uploadImg = async () => {
  cropper.value.getCropBlob(async (data: any) => {
    let formData = new FormData();
    formData.append("avatarfile", data, options.fileName);
    const res = await uploadAvatar(formData);
    open.value = false;
    options.img = res.data.imgUrl;
    userStore.setAvatar(options.img as string)
    proxy?.$modal.msgSuccess("Success");
    visible.value = false;
  });
};
/** Preview */
const realTime = (data: any) => {
  options.previews = data;
};
/** close */
const closeDialog = () => {
  options.img = userStore.avatar;
  options.visible = false;
};
</script>

<style lang="scss" scoped>
.user-info-head {
  position: relative;
  display: inline-block;
  height: 120px;
}

.user-info-head:hover:after {
  content: "+";
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  color: #eee;
  background: rgba(0, 0, 0, 0.5);
  font-size: 24px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  cursor: pointer;
  line-height: 110px;
  border-radius: 50%;
}
</style>
