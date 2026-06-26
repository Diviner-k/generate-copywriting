<script>
export default {
  onLaunch() {
    wx.cloud.init({
      env: "cloud1-8gj9jkegffb548e6",
      traceUser: true,
    });
  },
};
</script>

<style>
/* ===== Geist Design System — Global Tokens ===== */

page {
  /* Colors */
  --g-primary: #171717;
  --g-secondary: #4d4d4d;
  --g-tertiary: #00ac96;
  --g-tertiary-hover: #00927f;
  --g-bg-050: #ddfef6;
  --g-bg-050-p3: oklch(97.06% 0.0347 180.66);
  --g-bg-100: #ffffff;
  --g-bg-200: #ccf9f1;
  --g-bg-200-p3: oklch(94.92% 0.0478 182.07);
  --g-bg-300: #b1f7ec;
  --g-bg-300-p3: oklch(92.76% 0.0718 183.78);
  --g-bg-400: #00e3c4;
  --g-bg-400-p3: oklch(81.5% 0.161 178.96);
  --g-neutral: #f2f2f2;
  --g-gray-100: #f2f2f2;
  --g-gray-200: #ebebeb;
  --g-gray-300: #e6e6e6;
  --g-gray-400: #eaeaea;
  --g-gray-500: #c9c9c9;
  --g-gray-600: #a8a8a8;
  --g-gray-700: #8f8f8f;
  --g-gray-800: #7d7d7d;
  --g-gray-900: #4d4d4d;
  --g-gray-1000: #171717;
  --g-gray-alpha-100: rgba(0, 0, 0, 0.05);
  --g-gray-alpha-200: rgba(0, 0, 0, 0.08);
  --g-gray-alpha-300: rgba(0, 0, 0, 0.10);
  --g-gray-alpha-400: rgba(0, 0, 0, 0.08);
  --g-gray-alpha-500: rgba(0, 0, 0, 0.21);
  --g-gray-alpha-600: rgba(0, 0, 0, 0.24);
  --g-accent: #00ac96;
  --g-accent-hover: #00927f;
  --g-red-700: #fc0035;
  --g-red-800: #ea001d;
  --g-green-700: #28a948;
  --g-amber-700: #ffae00;
  --g-focus-ring: 0 0 0 2px #ffffff, 0 0 0 4px var(--g-accent);

  /* Typography */
  --g-font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --g-font-mono: "SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace;

  /* Spacing (4px base) */
  --g-space-1: 4px;
  --g-space-2: 8px;
  --g-space-3: 12px;
  --g-space-4: 16px;
  --g-space-6: 24px;
  --g-space-8: 32px;
  --g-space-10: 40px;
  --g-space-16: 64px;
  --g-space-24: 96px;

  /* Radius */
  --g-radius-sm: 6px;
  --g-radius-md: 12px;
  --g-radius-lg: 16px;
  --g-radius-full: 9999px;

  /* Shadows */
  --g-shadow-card: 0 2px 2px rgba(0, 0, 0, 0.04);
  --g-shadow-popover: 0 1px 1px rgba(0, 0, 0, 0.02), 0 4px 8px -4px rgba(0, 0, 0, 0.04), 0 16px 24px -8px rgba(0, 0, 0, 0.06);
  --g-shadow-modal: 0 1px 1px rgba(0, 0, 0, 0.02), 0 8px 16px -4px rgba(0, 0, 0, 0.04), 0 24px 32px -8px rgba(0, 0, 0, 0.06);

  /* Focus ring */
  --g-focus-ring: 0 0 0 2px #ffffff, 0 0 0 4px var(--g-blue-700);

  /* Transitions */
  --g-easing: cubic-bezier(0.175, 0.885, 0.32, 1.1);
}

page,
page *,
scroll-view,
button,
textarea,
input,
image,
view,
text,
navigator,
swiper,
swiper-item,
canvas,
video,
map,
picker,
picker-view,
form,
label,
checkbox,
radio,
slider,
switch,
progress,
rich-text,
editor,
icon,
cover-view,
cover-image,
movable-view,
movable-area {
  box-sizing: border-box;
}

page {
  background-color: var(--g-bg-200);
  background-color: var(--g-bg-200-p3, var(--g-bg-200));
  font-family: var(--g-font-sans);
  color: var(--g-primary);
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
}
</style>
