<template>
  <view class="page">
    <view class="content">
      <!-- Daily Fortune + Topics -->
      <view class="daily-hero">
        <text class="daily-hero__title">🔮 今日运势</text>
        <view class="fortune-bar">
          <text class="fortune-bar__icon">{{ fortune.icon }}</text>
          <view class="fortune-bar__text">
            <text
              class="fortune-bar__level"
              :style="{ color: fortune.color }"
              >{{ fortune.level }}</text
            >
            <text class="fortune-bar__desc">{{ fortune.desc }}</text>
          </view>
          <view class="fortune-bar__tags">
            <text class="fortune-bar__tag">{{ fortune.luckyColor }}</text>
            <text class="fortune-bar__tag">{{ fortune.luckyNum }}</text>
          </view>
          <text class="fortune-bar__advice">{{ fortune.advice }}</text>
        </view>

        <text class="daily-hero__title">🔥 今日话题</text>

        <view class="topics-row">
          <view
            v-for="(t, i) in dailyTopics"
            :key="i"
            class="topics-row__chip"
            @click="selectTopic(t)"
            >{{ t }}</view
          >
        </view>
      </view>

      <!-- Input -->
      <view
        class="input-section"
        :class="{ 'input-section--focused': textareaFocused }"
      >
        <textarea
          class="input-section__textarea"
          v-model="topic"
          placeholder="✨ 写点什么吧，一句话，生成你的社交文案。比如：今天吃了火锅..."
          placeholder-style="color: #999; font-size: 16px;"
          maxlength="200"
          @focus="textareaFocused = true"
          @blur="textareaFocused = false"
        />
      </view>

      <!-- Image Picker (disabled)
      <view class="image-row">
        <view
          class="image-picker"
          :class="{ 'image-picker--has': imageUrl }"
          @click="chooseImage"
        >
          <template v-if="!imageUrl">
            <text class="image-picker__icon">📷</text>
            <text class="image-picker__hint">添加图片（选填）</text>
          </template>
          <template v-else>
            <image
              class="image-picker__preview"
              :src="imageUrl"
              mode="aspectFill"
            />
            <view class="image-picker__remove" @click.stop="removeImage">
              <text>✕</text>
            </view>
          </template>
        </view>
      </view>
      -->

      <!-- Style Selection -->
      <view class="style-section">
        <text class="style-section__label">🎨 选个风格吧 ✨</text>
        <scroll-view scroll-y class="style-section__list">
          <view class="style-section__grid">
            <StyleSelect
              v-for="s in styles"
              :key="s.value"
              :icon="s.icon"
              :label="s.label"
              :color="s.color"
              :selected="selectedStyle === s.value"
              @select="selectedStyle = s.value"
            />
          </view>
        </scroll-view>
      </view>

      <!-- Generate Button -->
      <view class="action">
        <button
          class="action__btn"
          :class="{ 'action__btn--loading': loading }"
          :disabled="!canGenerate || loading"
          hover-class="action__btn--press"
          @click="generate"
        >
          {{ loading ? "生成中..." : "✨ 一键生成" }}
        </button>
      </view>
    </view>

    <TabBar />
  </view>
</template>

<script>
import StyleSelect from "@/components/StyleSelect.vue";
import TabBar from "@/components/TabBar.vue";
import { getDailyContent } from "@/utils/daily-content.js";

export default {
  components: { StyleSelect, TabBar },
  data() {
    return {
      topic: "",
      selectedStyle: "",
      loading: false,
      textareaFocused: false,
      imageUrl: "",
      uploading: false,
      fortune: {
        level: "",
        icon: "⏳",
        color: "#B890A0",
        desc: "",
        luckyColor: "",
        luckyNum: 0,
        advice: "",
      },
      dailyTopics: [],
      styles: [
        { value: "高级感", label: "高级感", icon: "✨", color: "#B347FF" },
        { value: "种草", label: "种草", icon: "🌿", color: "#5EFF7E" },
        { value: "emo", label: "emo", icon: "😢", color: "#00E5FF" },
        { value: "可爱", label: "可爱", icon: "🎀", color: "#FF2D78" },
        { value: "幽默", label: "幽默", icon: "😂", color: "#FFD23F" },
        { value: "治愈", label: "治愈", icon: "🧘", color: "#3ED4C4" },
        { value: "励志", label: "励志", icon: "💪", color: "#FF9500" },
        { value: "毒舌", label: "毒舌", icon: "🔥", color: "#FF3B30" },
        { value: "温柔", label: "温柔", icon: "🌸", color: "#FFB3C1" },
        { value: "爆款模式", label: "爆款模式", icon: "🔥", color: "#FF4500" },
        { value: "自拍文案", label: "自拍文案", icon: "📸", color: "#FF1493" },
        { value: "美食文案", label: "美食文案", icon: "🍜", color: "#F5A623" },
        { value: "旅行文案", label: "旅行文案", icon: "✈️", color: "#4A90D9" },
        { value: "宠物文案", label: "宠物文案", icon: "🐶", color: "#F7B731" },
        { value: "情侣文案", label: "情侣文案", icon: "💕", color: "#E91E63" },
        { value: "晚安文案", label: "晚安文案", icon: "🌙", color: "#6C5CE7" },
        {
          value: "学生党文案",
          label: "学生党文案",
          icon: "🎓",
          color: "#00B894",
        },
      ],
    };
  },
  computed: {
    canGenerate() {
      return this.topic.trim() && this.selectedStyle;
    },
  },
  async created() {
    const content = await getDailyContent();
    this.fortune = content.fortune;
    this.dailyTopics = content.topics;
  },
  methods: {
    async chooseImage() {
      if (this.uploading || this.loading) return;
      try {
        const res = await uni.chooseImage({
          count: 1,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"],
        });
        const tempPath = res.tempFilePaths[0];
        this.uploading = true;
        uni.showLoading({ title: "上传中..." });
        const uploadRes = await wx.cloud.uploadFile({
          cloudPath:
            "copywriter/" +
            Date.now() +
            "-" +
            Math.random().toString(36).slice(2) +
            ".jpg",
          filePath: tempPath,
        });
        const urlRes = await wx.cloud.getTempFileURL({
          fileList: [uploadRes.fileID],
        });
        this.imageUrl = urlRes.fileList[0].tempFileURL;
      } catch (e) {
        console.error("Image upload failed:", e);
        uni.showToast({ title: "图片上传失败", icon: "none" });
      } finally {
        this.uploading = false;
        uni.hideLoading();
      }
    },
    removeImage() {
      this.imageUrl = "";
    },
    selectTopic(topic) {
      this.topic = topic;
    },
    async generate() {
      if (!this.canGenerate || this.loading) return;
      this.loading = true;
      try {
        const res = await wx.cloud.callFunction({
          name: "generate-text",
          data: {
            topic: this.topic.trim(),
            style: this.selectedStyle,
            imageUrl: this.imageUrl || undefined,
          },
        });
        const data = res.result;
        if (data.error) {
          uni.showToast({ title: data.message, icon: "none", duration: 3000 });
          return;
        }
        if (!data.result) {
          uni.showToast({ title: "生成失败，请重试", icon: "none" });
          return;
        }
        let url =
          "/pages/result/result?data=" +
          encodeURIComponent(JSON.stringify(data.result)) +
          "&topic=" +
          encodeURIComponent(this.topic.trim()) +
          "&style=" +
          encodeURIComponent(this.selectedStyle);
        if (this.imageUrl) {
          url += "&imageUrl=" + encodeURIComponent(this.imageUrl);
        }
        uni.navigateTo({ url });
      } catch (e) {
        console.error("Generate failed:", e);
        const msg = e.errMsg || e.message || "生成失败，请重试";
        uni.showToast({ title: msg, icon: "none", duration: 4000 });
      } finally {
        this.loading = false;
      }
    },
  },
  onShareAppMessage() {
    return {
      title: "文案大师 - 一键生成小红书朋友圈文案 🌈",
      path: "/pages/index/index",
    };
  },
};
</script>

<style scoped>
.page {
  position: relative;
  height: 100vh;
  background: var(--g-bg-200);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ── Content ── */
.content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  padding: var(--g-space-6) var(--g-space-4) var(--g-space-4);
  flex: 1;
  overflow: hidden;
}

/* ── Daily Hero ── */
.daily-hero {
  margin-bottom: var(--g-space-6);
  flex-shrink: 0;
}
.daily-hero__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--g-primary);
  margin-bottom: var(--g-space-2);
  display: block;
  letter-spacing: -0.26px;
}

/* Fortune bar */
.fortune-bar {
  display: flex;
  align-items: center;
  gap: var(--g-space-3);
  padding: var(--g-space-3) var(--g-space-4);
  border-radius: var(--g-radius-md);
  margin-bottom: var(--g-space-3);
  background: var(--g-bg-050);
  border: 1px solid var(--g-gray-200);
}
.fortune-bar__icon {
  font-size: 32rpx;
  flex-shrink: 0;
}
.fortune-bar__text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.fortune-bar__level {
  font-size: 13px;
  font-weight: 600;
}
.fortune-bar__desc {
  font-size: 12px;
  color: var(--g-gray-700);
}
.fortune-bar__tags {
  display: flex;
  gap: var(--g-space-1);
  flex-shrink: 0;
}
.fortune-bar__tag {
  font-size: 11px;
  color: var(--g-gray-700);
  background: var(--g-gray-100);
  padding: 2px 8px;
  border-radius: var(--g-radius-full);
}
.fortune-bar__advice {
  font-size: 11px;
  color: var(--g-gray-700);
  white-space: nowrap;
  flex-shrink: 0;
}

/* Topics row */
.topics-row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--g-space-2);
}
.topics-row__chip {
  font-size: 13px;
  color: var(--g-accent);
  background: rgba(0, 172, 150, 0.06);
  padding: 6px 14px;
  border-radius: var(--g-radius-full);
  border: 1px solid rgba(0, 172, 150, 0.15);
  white-space: nowrap;
  transition: all 150ms var(--g-easing);
}
.topics-row__chip:active {
  background: rgba(0, 172, 150, 0.15);
  transform: scale(0.97);
}

/* ── Input ── */
.input-section {
  margin-bottom: var(--g-space-4);
  border-radius: var(--g-radius-sm);
  background: var(--g-bg-100);
  border: 1.5px solid var(--g-gray-400);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  transition:
    border-color 150ms var(--g-easing),
    box-shadow 150ms var(--g-easing);
}
.input-section--focused {
  border-color: var(--g-accent);
  box-shadow: 0 0 0 3px rgba(0, 172, 150, 0.15);
}
.input-section__textarea {
  width: 100%;
  height: 180rpx;
  padding: var(--g-space-3);
  font-size: 15px;
  color: var(--g-primary);
  background: transparent;
  border-radius: var(--g-radius-sm);
  line-height: 1.6;
}

/* ── Image picker ── */
.image-row {
  margin-bottom: var(--g-space-4);
}
.image-picker {
  display: flex;
  align-items: center;
  justify-content: center;
  height: var(--g-space-10);
  border-radius: var(--g-radius-sm);
  background: var(--g-bg-300);
  border: 1px dashed var(--g-gray-300);
  transition: border-color 150ms var(--g-easing);
}
.image-picker:active {
  border-color: var(--g-tertiary);
}
.image-picker--has {
  height: auto;
  padding: var(--g-space-2);
  border-style: solid;
  border-color: var(--g-gray-200);
  position: relative;
}
.image-picker__icon {
  font-size: 20px;
  margin-right: var(--g-space-2);
}
.image-picker__hint {
  font-size: 13px;
  color: var(--g-gray-700);
}
.image-picker__preview {
  width: 80rpx;
  height: 80rpx;
  border-radius: var(--g-radius-sm);
  display: block;
}
.image-picker__remove {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--g-red-800);
  color: #fff;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Style section ── */
.style-section {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
  margin-bottom: var(--g-space-3);
}
.style-section__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--g-primary);
  margin-bottom: var(--g-space-3);
  display: block;
  flex-shrink: 0;
}
.style-section__list {
  flex: 1;
  min-height: 0;
}
.style-section__grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
  gap: var(--g-space-3);
  align-content: flex-center;
}

/* ── Action button ── */
.action {
  display: flex;
  justify-content: center;
  padding-top: var(--g-space-3);
  flex-shrink: 0;
}
.action__btn {
  width: 100%;
  height: 48px;
  border-radius: var(--g-radius-sm);
  background: var(--g-primary);
  color: var(--g-bg-100);
  font-size: 14px;
  font-weight: 500;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 150ms var(--g-easing);
  letter-spacing: -0.28px;
}
.action__btn:active {
  background: var(--g-secondary);
}
.action__btn--loading {
  opacity: 0.7;
  pointer-events: none;
}
.action__btn[disabled] {
  background: var(--g-gray-100);
  color: var(--g-gray-500);
}
.action__btn--loading[disabled] {
  background: var(--g-primary);
  color: var(--g-bg-100);
  opacity: 0.7;
}
</style>
