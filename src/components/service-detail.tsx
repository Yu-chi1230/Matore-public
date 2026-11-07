import Link from "next/link";
import { Arrow } from "./site-chrome";
import { ContactForm } from "./contact-form";
import { TopicLink } from "./topic-link";
import { StructuredData } from "./structured-data";
import { site, topics } from "@/lib/site";
import { services, type Service } from "@/lib/services";

export function ServiceDetail({ service }: { service: Service }) {
  const topic = topics[service.topicIndex];
  const money = (price: number) => price.toLocaleString("ja-JP");
  return (
    <main id="main" className="service-detail">
      <StructuredData data={{
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "Service", "@id": `${site.url}${service.path}#service`, name: service.shortName, serviceType: service.name, description: service.description, url: `${site.url}${service.path}`, provider: { "@id": `${site.url}/#organization` },
            offers: service.basePrices.map(item => ({ "@type": "Offer", name: item.label, price: item.price, priceCurrency: "JPY", url: `${site.url}${service.path}#service-pricing`, description: `${item.scope} 税込。ヒアリング、制作・動作確認、初期設定、簡単な操作説明を含む。追加作業は別料金。` })),
          },
          { "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: "ホーム", item: `${site.url}/` },
            { "@type": "ListItem", position: 2, name: service.shortName, item: `${site.url}${service.path}` },
          ] },
        ],
      }} />
      <div className="container">
        <nav className="service-breadcrumb" aria-label="パンくずリスト"><ol><li><Link href="/">ホーム</Link></li><li aria-current="page">{service.shortName}</li></ol></nav>
        <header className="service-hero">
          <div>
            <p className="eyebrow">{service.name}</p>
            <h1>{service.headline[0]}<br /><em>{service.headline[1]}</em></h1>
            <p className="service-lead">{service.intro}</p>
            <TopicLink topic={topic}>{service.shortName}を相談する</TopicLink>
            <p className="service-note">まずは文章で。原則2営業日以内にメールで返信します。<br />制作・オンラインでの確認は平日夜・土日、フルリモートで対応。</p>
          </div>
          <aside className="service-price-card" aria-label="基本料金と範囲">
            <p>基本料金・税込</p>
            {service.basePrices.map(item => <div key={item.label} className="service-card-price"><p className="service-price-label">{item.label}</p><p className="service-price"><strong>{money(item.price)}</strong>円</p></div>)}
            <ul>{service.cardNotes.map(note => <li key={note}>{note}</li>)}</ul>
            <p>作業範囲・総額・納期に合意してから始めます。</p>
            <a className="text-link" href="#service-pricing">料金・追加オプション<Arrow /></a>
          </aside>
        </header>
        <nav className="service-toc" aria-label="このページの内容"><a href="#example">具体例</a><a href="#service-pricing">料金・追加オプション</a><a href="#service-process">相談から納品</a><a href="#questions">よくあるご質問</a></nav>
        <div className="service-content">
          <section aria-labelledby="concern-title">
            <p className="section-label"><span>01</span>いまの手順から、考えます</p>
            <h2 id="concern-title">こんな作業で、困っていませんか</h2>
            <ul className="service-list">{service.concerns.map(concern => <li key={concern}>{concern}</li>)}</ul>
            <p>{service.approach}</p>
          </section>
          <section id="example" aria-labelledby="example-title">
            <p className="section-label"><span>02</span>いまの作業と、ほしい結果</p>
            <h2 id="example-title">{service.example.title}</h2>
            <p className="service-example-note">依頼内容を説明するための架空の例です。実際の受注事例ではありません。</p>
            <div className="service-example-grid">{service.example.tables.map(table => <table key={table.caption}><caption>{table.caption}</caption><thead><tr>{table.headers.map(header => <th key={header} scope="col">{header}</th>)}</tr></thead><tbody>{table.rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table>)}</div>
            <p>{service.example.explanation}</p><p>{service.example.checks}</p>
          </section>
          <section id="service-pricing" aria-labelledby="service-pricing-title">
            <p className="section-label"><span>03</span>必要な範囲を、ひとつから</p>
            <h2 id="service-pricing-title">料金と、お渡しするもの</h2>
            <div className="service-base-prices">{service.basePrices.map(item => <div key={item.label}><h3>{item.label}<span>{money(item.price)}円（税込）</span></h3><p>{item.scope}</p></div>)}</div>
            <dl className="service-scope">{service.scope.map(([label, text]) => <div key={label}><dt>{label}</dt><dd>{text}</dd></div>)}</dl>
            <p>基本料金には、ヒアリング、合意した内容の制作・動作確認、対象環境への初期設定、簡単な操作説明を含みます。合意した仕様どおりに動かない不具合の修正に、追加料金はかかりません。</p>
            <p>{service.delivery}</p>
            <h3>追加オプションと料金</h3>
            <dl className="service-scope service-options">{service.options.map(option => <div key={option.name}><dt>{option.name}<span>{option.scope}</span></dt><dd>{money(option.price)}円<span>／{option.unit}・税込</span></dd></div>)}</dl>
            <p>{service.optionNote}</p>
            <p>対応内容を確認し、必要な作業と総額をご案内します。基本料金に含まれる処理や、同じ追加作業を重複して請求しません。</p>
            <p>別の課題や独立した機能には該当する基本メニューを適用します。合意後の仕様変更も、掲載範囲なら同じ単価です。全体の作り直しなど、範囲に収まらない作業は個別見積もりです。</p>
            <p>追加作業の内容・料金・納期、有料の外部サービスが必要な場合の費用は事前にご案内し、ご了承いただいてから対応します。</p>
            <Link className="text-link" href="/#pricing">3つのテーマの基本料金を見る<Arrow /></Link>
          </section>
          <section id="service-process" aria-labelledby="service-process-title">
            <p className="section-label"><span>04</span>文章から始められます</p>
            <h2 id="service-process-title">ご相談から納品まで</h2>
            <ol className="service-steps">
              <li><h3>困っている作業を、フォームで送る</h3><p>今している操作と、どうなってほしいかを、まずは短くお送りください。初回の相談にファイルは必要ありません。</p></li>
              <li><h3>いまの手順と、完成形を確認する</h3><p>{service.hearing}不明な項目は、そのままで構いません。</p></li>
              <li><h3>作業範囲・総額・納期を決める</h3><p>対応できる範囲、基本料金と追加作業の内訳、納品物、確認方法をご案内します。内容に合意いただいてから制作を始めます。</p></li>
              <li><h3>動作を確認し、使い方と一緒に渡す</h3><p>{service.handover}</p></li>
            </ol>
            <p>文章でのやり取りを中心に進められます。必要に応じて平日夜・土日にオンラインで確認します。緊急・当日対応・日中常駐・訪問での作業は承っていません。</p>
          </section>
          <section id="questions" aria-labelledby="questions-title">
            <p className="section-label"><span>05</span>ご相談の前に</p>
            <h2 id="questions-title">よくあるご質問</h2>
            <dl className="service-faq">{service.questions.map(([question, answer]) => <div key={question}><dt>{question}</dt><dd>{answer}</dd></div>)}</dl>
          </section>
          <nav className="service-related" aria-label="ほかの支援メニュー"><p>ほかの支援メニュー</p>{services.filter(item => item.path !== service.path).map(item => <Link key={item.path} className="text-link" href={item.path}>{item.shortName}<Arrow /></Link>)}</nav>
          <p className="service-operator">運営者はYu-chi。社内情報システム・業務システム・業務改善に携わっています。<br /><Link className="text-link" href="/#about">Matoreについて・運営者を見る<Arrow /></Link></p>
        </div>
      </div>
      <section className="contact-section" id="contact" aria-labelledby="service-contact-title">
        <div className="container contact-layout">
          <div className="contact-copy">
            <p className="section-label"><span>06</span>{service.shortName}を相談する</p>
            <h2 id="service-contact-title">{service.contactHeadline}</h2>
            <p>{service.contactIntro}</p>
            <div className="contact-promise"><p><span>受付</span>フォームはいつでも送信可</p><p><span>返信</span>原則2営業日以内にメールで</p><p><span>対応</span>平日夜・土日／フルリモート</p></div>
            <p className="contact-caution">ファイル共有の方法は返信後にご案内します。機密情報・個人情報・ログイン情報は相談内容欄に記載しないでください。</p>
          </div>
          <ContactForm initialTopic={topic} />
        </div>
      </section>
    </main>
  );
}
