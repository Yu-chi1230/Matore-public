// Shared by the website and the Worker so every displayed topic can be received.
export const contactTopics = Object.freeze([
  "Excel・スプレッドシートの改善",
  "データ集計・加工の自動化",
  "Googleサービスの連携・自動化",
  "その他・何から始めるか相談したい",
]);

// Keep inquiries from already-open pages valid during the service update.
export const legacyContactTopics = Object.freeze([
  "退職後のアクセスを残さない",
  "日々の対応に追われない",
  "担当者ひとりに頼らない",
]);
