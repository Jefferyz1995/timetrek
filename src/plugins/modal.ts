import { MessageBoxData } from 'element-plus';
import { LoadingInstance } from 'element-plus/es/components/loading/src/loading';
let loadingInstance: LoadingInstance;
export default {
  // message reminder
  msg(content: any) {
    ElMessage.info(content);
  },
  // error message
  msgError(content: any) {
    ElMessage.error(content);
  },
  // success message
  msgSuccess(content: any) {
    ElMessage.success(content);
  },
  // warning message
  msgWarning(content: any) {
    ElMessage.warning(content);
  },
  // popup message
  alert(content: any) {
    ElMessageBox.alert(content, 'System Reminder');
  },
  // error message
  alertError(content: any) {
    ElMessageBox.alert(content, 'System Reminder', { type: 'error' });
  },
  // success reminder
  alertSuccess(content: any) {
    ElMessageBox.alert(content, 'System Reminder', { type: 'success' });
  },
  // warning reminder
  alertWarning(content: any) {
    ElMessageBox.alert(content, 'System Reminder', { type: 'warning' });
  },
  // notice reminder
  notify(content: any) {
    ElNotification.info(content);
  },
  // error
  notifyError(content: any) {
    ElNotification.error(content);
  },
  // success
  notifySuccess(content: any) {
    ElNotification.success(content);
  },
  // warning
  notifyWarning(content: any) {
    ElNotification.warning(content);
  },
  // Confirmation
  confirm(content: any): Promise<MessageBoxData> {
    return ElMessageBox.confirm(content, 'System Reminder', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning'
    });
  },
  // submit content
  prompt(content: any) {
    return ElMessageBox.prompt(content, 'System Reminder', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning'
    });
  },

  loading(content: string) {
    loadingInstance = ElLoading.service({
      lock: true,
      text: content,
      background: 'rgba(0, 0, 0, 0.7)'
    });
  },

  closeLoading() {
    loadingInstance.close();
  }
};
