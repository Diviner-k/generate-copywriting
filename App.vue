<script>
export default {
  onLaunch() {
    // TODO: 替换为你的 CloudBase 云环境 ID（在微信开发者工具 → 云开发 → 设置 中查看）
    wx.cloud.init({
      env: "cloud1-8gj9jkegffb548e6",
      traceUser: true,
    });
  },
};
</script>

<style>
page {
  background-color: #fafafa;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #1f2937;
  font-size: 28rpx;
}
</style>
