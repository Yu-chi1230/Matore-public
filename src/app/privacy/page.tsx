import type { Metadata } from "next";
import Link from "next/link";
import { Arrow } from "@/components/site-chrome";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata("プライバシーポリシー", "Matoreの相談フォームで取得する個人情報の利用目的、保管、アクセス解析、お問い合わせについてご案内します。", "/privacy"),
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <main id="main" className="container legal-page">
      <p className="eyebrow">PRIVACY POLICY</p>
      <h1>プライバシーポリシー</h1>
      <p className="legal-date">最終更新日：2026年10月20日</p>
      <section>
        <h2>1. 運営者と対象</h2>
        <p>
          Yu-chi（社内ITの伴走パートナー）は、本サイトを通じたご相談に関連する個人情報を、以下の方針に沿って取り扱います。
        </p>
      </section>
      <section>
        <h2>2. ご入力いただく情報と利用目的</h2>
        <p>
          ご相談フォームでは、申込区分、氏名、メールアドレス、ご相談の種類・内容を取得します。法人の方からは、会社名と立場・担当業務も取得します。ご相談への返信、内容の確認、支援内容・進め方のご案内のために使用します。
        </p>
        <p>
          相談内容には、業務上の機密、第三者の個人情報、パスワードなどのログイン情報を記載しないでください。
        </p>
      </section>
      <section>
        <h2>3. 第三者提供・委託</h2>
        <p>
          法令に基づく場合等を除き、ご本人の同意なく個人情報を第三者に提供しません。受付内容の保存にSupabase、運営者への通知にResend、サイトと受付APIの提供にCloudflareを利用します。
        </p>
      </section>
      <section>
        <h2>4. 管理と保管</h2>
        <p>
          相談対応に必要な範囲にアクセスを限定し、不正アクセス・漏えい等の防止に努めます。対応完了から1年間保管した後、定期的に削除します。未対応・対応中・対象外の情報は、対応状況を確認するまで保管します。
        </p>
      </section>
      <section>
        <h2>5. ブラウザ内の保存・アクセス解析</h2>
        <p>
          アクセス状況の把握とサイト改善のため、Cloudflare Web Analyticsを利用します。閲覧ページ、参照元、端末の種類などを集計します。アクセス解析にCookieやローカルストレージは使用せず、フォームの入力内容は解析へ送信しません。
        </p>
        <p>
          本サイト独自のアクセス解析・広告用Cookieは使用していません。フォームの入力内容はブラウザのストレージへ保存しません。受付結果の表示のため、個人情報を含まない受付時刻だけをセッションストレージへ最長10分間保存します。不正送信の制限には、IPアドレスそのものではなく、復元できないよう鍵付きハッシュ化した値を最長1時間利用します。
        </p>
      </section>
      <section>
        <h2>6. 開示・訂正・削除等のご相談</h2>
        <p>
          ご自身の個人情報に関する開示・訂正・削除等のご希望は、本サイトの相談フォームからその旨をご連絡ください。ご本人であることを確認のうえ、適用される法令に従って対応します。
        </p>
      </section>
      <section>
        <h2>7. 方針の変更</h2>
        <p>サービスや情報の取扱いに変更がある場合は、本ページを更新します。</p>
      </section>
      <Link className="text-link" href="/#contact">
        相談フォームへ戻る
        <Arrow />
      </Link>
    </main>
  );
}
