import Link from "next/link";
import { Reveal } from "./motion";
import { TopicLink } from "./topic-link";
import { Arrow } from "./site-chrome";
import { topics } from "@/lib/site";
import { services } from "@/lib/services";

export function PricingSection() {
  return (
    <section className="section pricing-section" id="pricing" aria-labelledby="pricing-title">
      <div className="container">
        <Reveal>
          <p className="section-label"><span>05</span>3つのテーマの基本料金</p>
          <div className="section-heading-row">
            <h2 id="pricing-title">頼みたい作業を、<br /><span className="accent">ひとつから。</span></h2>
            <p>基本料金を、テーマごとに。<br />対応範囲と追加オプションは、各詳細ページで。</p>
          </div>
          <p className="pricing-tax-note">表示金額はすべて税込です。</p>
        </Reveal>
        <div className="pricing-menu" aria-label="基本料金">
          {services.map((service, index) => (
            <Reveal key={service.path} className="pricing-item">
              <div className="pricing-item-heading">
                <span className="pricing-index">0{index + 1}</span>
                <h3>{service.name}</h3>
              </div>
              <div className="pricing-item-detail">
                <p>{service.summary}</p>
                <Link className="text-link pricing-service-detail" href={service.path}>
                  対応範囲・追加オプションを見る<Arrow />
                </Link>
              </div>
              <div className="pricing-item-action">
                {service.basePrices.map(price => (
                  <div className="pricing-base-price" key={price.label}>
                    {service.basePrices.length > 1 && <p className="pricing-price-label">{price.label}</p>}
                    <p className="pricing-amount"><strong>{price.price.toLocaleString("ja-JP")}</strong><span>円</span></p>
                  </div>
                ))}
                <TopicLink topic={topics[service.topicIndex]}>この作業を相談する</TopicLink>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="pricing-footer">
          <p>作業内容・総額・納期を確認し、合意いただいてから始めます。どのメニューに当てはまるか分からない場合も、ご相談ください。</p>
          <TopicLink topic={topics[3]}>その他の作業・料金について相談する</TopicLink>
        </Reveal>
      </div>
    </section>
  );
}
