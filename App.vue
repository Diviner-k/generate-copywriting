<script>
export default {
  onLaunch() {
    // TODO: 替换为你的 CloudBase 云环境 ID（在微信开发者工具 → 云开发 → 设置 中查看）
    wx.cloud.init({
      env: '你的云环境ID',
      traceUser: true
    })
  }
}
</script>

<style>
page {
  background-color: #FAFAFA;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1F2937;
  font-size: 28rpx;
}
</style>
