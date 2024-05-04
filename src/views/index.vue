<template>
  <div class="app-container home">
    <h2>TimeTrek Roster System</h2>
    <el-divider />
    <el-row>
      <!--      上班-->
      <el-button @click="handleSignIn">Sign In</el-button>
      <!--      下班-->
      <el-button @click="handleSignOut">Sign Out</el-button>
    </el-row>
    <el-row>
      <el-calendar>
        <template #date-cell="{ data }">
          <p>
            {{ data.day.split('-').slice(1).join('-') }}
          </p>
          <span v-for="(item, index) in calenderData" :key="index">
            {{
              formatData(data.day,item)
            }}
          </span>
        </template>
      </el-calendar>
    </el-row>
  </div>
</template>

<script setup name="Index" lang="ts">
import { initWebSocket } from '@/utils/websocket';
import {getProjectTask} from "@/api/calendar";
import {signIn,sighOut} from "@/api/system/sign";
import {ElMessage} from "element-plus";

const value = ref('')
onMounted(() => {
  let protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://'
  initWebSocket(protocol + window.location.host + import.meta.env.VITE_APP_BASE_API + "/resource/websocket");
});
const calenderData = ref([])
const goTarget = (url:string) => {
  window.open(url, '__blank')
}

const formatData = (day: string,item:object) => {
  const dayDate = new Date(day);
  const taskStartTime = new Date(item.taskStartTime);
  const taskEndTime = new Date(item.taskEndTime);

  return dayDate >= taskStartTime && dayDate <= taskEndTime ? item.taskName + `,` : ''
}

const getData = () => {
  getProjectTask().then(res => {
    calenderData.value = res.data
  })
}
getData()
const handleSignIn = () => {
  signIn().then(res=>{
    if(res.code === 200){
      ElMessage.success("签到成功")
    }else{
      ElMessage.error("签到失败")
    }
  })
}

const handleSignOut = () => {
  sighOut().then(res=>{
    if(res.code === 200){
      ElMessage.success("签到成功")
    }else{
      ElMessage.error("签到失败")
    }
  })
}
</script>

<style scoped lang="scss">
.home {
  blockquote {
    padding: 10px 20px;
    margin: 0 0 20px;
    font-size: 17.5px;
    border-left: 5px solid #eee;
  }
  hr {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 0;
    border-top: 1px solid #eee;
  }
  .col-item {
    margin-bottom: 20px;
  }

  ul {
    padding: 0;
    margin: 0;
  }

  font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 13px;
  color: #fff;
  overflow-x: hidden;

  ul {
    list-style-type: none;
  }

  h4 {
    margin-top: 0px;
  }

  h2 {
    margin-top: 10px;
    font-size: 26px;
    font-weight: 100;
  }

  p {
    margin-top: 10px;

    b {
      font-weight: 700;
    }
  }

  .update-log {
    ol {
      display: block;
      list-style-type: decimal;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0;
      margin-inline-end: 0;
      padding-inline-start: 40px;
    }
  }
}
</style>
