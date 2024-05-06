<template>
  <div class="p-2">
    <el-row :gutter="20">
      <el-col :span="6" :xs="24">
        <el-card class="box-card">
          <template v-slot:header>
            <div class="clearfix">
              <span>Personal Info</span>
            </div>
          </template>
          <div>
            <div class="text-center">
              <userAvatar/>
            </div>
            <ul class="list-group list-group-striped">
              <li class="list-group-item">
                <svg-icon icon-class="user" />User ID
                <div class="pull-right">{{ state.user.userName }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="phone" />Contact
                <div class="pull-right">{{ state.user.phonenumber }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="email" />Email
                <div class="pull-right">{{ state.user.email }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="tree" />Dept
                <div class="pull-right" v-if="state.user.dept">{{ state.user.dept.deptName }} / {{ state.postGroup }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="peoples" />Role
                <div class="pull-right">{{ state.roleGroup }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="date" />Created Time
                <div class="pull-right">{{ state.user.createTime }}</div>
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18" :xs="24">
        <el-card>
          <template v-slot:header>
            <div class="clearfix">
              <span>Info</span>
            </div>
          </template>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="Info" name="userinfo">
              <userInfo :user="userForm" />
            </el-tab-pane>
            <el-tab-pane label="Change Password" name="resetPwd">
              <resetPwd />
            </el-tab-pane>
            <!-- <el-tab-pane label="3rd Party" name="thirdParty">
              <thirdParty :auths="state.auths" />
            </el-tab-pane> -->
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Profile" lang="ts">
import UserAvatar from "./userAvatar.vue";
import UserInfo from "./userInfo.vue";
import ResetPwd from "./resetPwd.vue";
import ThirdParty from "./thirdParty.vue";
import { getAuthList } from "@/api/system/social/auth";
import { getUserProfile } from "@/api/system/user";

const activeTab = ref("userinfo");
const state = ref<Record<string, any>>({
    user: {},
    roleGroup: '',
    postGroup: '',
    auths: []
});

const userForm = ref({});

const getUser = async () => {
    const res = await getUserProfile();
    state.value.user = res.data.user;
    userForm.value = { ...res.data.user }
    state.value.roleGroup = res.data.roleGroup;
    state.value.postGroup = res.data.postGroup;
};

const getAuths = async () => {
    const res = await getAuthList();
    state.value.auths = res.data;
};

onMounted(() => {
    getUser();
    getAuths();
})
</script>
