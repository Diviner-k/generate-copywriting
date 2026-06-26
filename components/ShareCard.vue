<template>
  <view v-if="visible" class="share-overlay" @click="close">
    <view class="share-modal" @click.stop>
      <text class="share-modal__title">🖼️ 精美分享卡片</text>

      <!-- Hidden canvas for old-API fallback -->
      <canvas
        canvas-id="shareCanvas"
        style="
          position: fixed;
          left: -9999px;
          top: -9999px;
          width: 320px;
          height: 460px;
        "
      ></canvas>

      <view v-if="generating" class="share-modal__loading">
        <text class="share-modal__loading-text">⏳ 生成中...</text>
      </view>
      <image
        v-else-if="previewImage"
        class="share-modal__preview"
        :src="previewImage"
        mode="widthFix"
        @click="preview"
      />

      <view class="share-modal__actions" v-if="!generating">
        <view
          class="share-modal__btn share-modal__btn--share"
          @click="handleShare"
        >
          <text>📤 分享给朋友</text>
        </view>
        <view
          class="share-modal__btn share-modal__btn--save"
          @click="handleSave"
        >
          <text>💾 保存到相册</text>
        </view>
      </view>
      <view class="share-modal__close" @click="close">
        <text>关闭</text>
      </view>
    </view>
  </view>
</template>

<script>
import { drawShareCard, saveToAlbum } from "@/utils/share-card.js";

export default {
  name: "ShareCard",
  data() {
    return {
      visible: false,
      generating: false,
      saving: false,
      previewImage: "",
      tempPath: "",
    };
  },
  methods: {
    open(resultData) {
      this.visible = true;
      this.generating = true;
      this.previewImage = "";
      this.tempPath = "";
      this.$nextTick(() => {
        this.generate(resultData);
      });
    },
    close() {
      this.visible = false;
      this.previewImage = "";
      this.tempPath = "";
    },
    async generate(resultData) {
      try {
        const cardData = {
          topic: resultData.topic || '',
          style: resultData.style || ''
        }
        const tempPath = await drawShareCard(cardData)
        this.tempPath = tempPath
        this.previewImage = tempPath
      } catch (e) {
        console.error("ShareCard generate error:", e);
        uni.showToast({
          title: "卡片生成失败，请重试",
          icon: "none",
          duration: 3000,
        });
      } finally {
        this.generating = false;
      }
    },
    preview() {
      if (this.previewImage) {
        uni.previewImage({
          urls: [this.previewImage],
          current: this.previewImage,
        });
      }
    },
    handleShare() {
      if (!this.tempPath) return;
      if (wx.showShareImageMenu) {
        wx.showShareImageMenu({
          path: this.tempPath,
          success: () => {
            this.close();
          },
          fail: () => {
            this.handleSave();
          },
        });
      } else {
        this.handleSave();
      }
    },
    async handleSave() {
      if (this.saving || !this.tempPath) return;
      this.saving = true;
      try {
        await saveToAlbum(this.tempPath);
        uni.showToast({ title: "已保存到相册 ✨", icon: "success" });
        this.close();
      } catch (e) {
        console.error("Save error:", e);
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

<style scoped>
.share-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999; display: flex; align-items: center; justify-content: center;
  padding: var(--g-space-4);
}
.share-modal {
  background: var(--g-bg-300);
  border-radius: var(--g-radius-md);
  padding: var(--g-space-8);
  width: 90%; max-width: 360px;
  display: flex; flex-direction: column; align-items: center;
  box-shadow: var(--g-shadow-modal);
}
.share-modal__title {
  font-size: 16px; font-weight: 600; color: var(--g-primary);
  margin-bottom: var(--g-space-6); letter-spacing: -0.32px;
}
.share-modal__loading {
  width: 320px; height: 460px;
  display: flex; align-items: center; justify-content: center;
  background: var(--g-gray-100); border-radius: var(--g-radius-sm);
}
.share-modal__loading-text { font-size: 14px; color: var(--g-gray-700); }
.share-modal__preview {
  width: 320px;
  display: block; border-radius: var(--g-radius-sm);
  box-shadow: var(--g-shadow-card);
}
.share-modal__actions { display: flex; gap: var(--g-space-2); margin-top: var(--g-space-6); width: 100%; }
.share-modal__btn {
  flex: 1; height: 40px; border-radius: var(--g-radius-sm);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 500;
}
.share-modal__btn--share { background: var(--g-primary); color: var(--g-bg-100); }
.share-modal__btn--save { background: var(--g-bg-100); color: var(--g-primary); border: 1px solid var(--g-primary); }
.share-modal__close { margin-top: var(--g-space-4); font-size: 13px; color: var(--g-gray-700); }
</style>
