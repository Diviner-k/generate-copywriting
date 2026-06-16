<script>
export default {
  onLaunch() {
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
