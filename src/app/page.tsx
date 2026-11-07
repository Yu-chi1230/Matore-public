import { Arrow } from "@/components/site-chrome";
import { WorkMap } from "@/components/work-map";
import { Reveal } from "@/components/motion";
import { TopicLink } from "@/components/topic-link";
import { ContactForm } from "@/components/contact-form";
import { topics } from "@/lib/site";
import { MotionScene } from "@/components/page-motion";
import { MotionRibbon } from "@/components/motion-ribbon";
import { OutcomeStory } from "@/components/outcome-story";
import { PricingSection } from "@/components/pricing-section";
import Link from "next/link";
import { site } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { services } from "@/lib/services";

export const metadata = pageMetadata(site.title, site.description, "/");

function SectionLabel({
  number,
  children,
}: {
  number: string;
  children: React.ReactNode;
}) {
  return (
    <p className="section-label">
      <span>{number}</span>
      {children}
    </p>
  );
}

const entrances = [
  {
    tag: "Excel・スプレッドシートの改善",
    title: (
      <>
        毎日使う表を、
        <br />
        使いやすく。
      </>
    ),
    desc: "数式のエラー、入力しづらい表、手計算の集計。今あるファイルを確認し、必要なところから直します。",
    artifact: "修正・改善したファイル ＋ 使い方",
    icon: "sheet",
  },
  {
    tag: "データ集計・加工の自動化",
    title: (
      <>
        毎月の集計を、
        <br />
        繰り返せる仕組みに。
      </>
    ),
    desc: "CSVを開いて、貼り付けて、集計する。その手順と出したい結果を確認し、毎回使える処理にまとめます。",
    artifact: "集計・加工の仕組み ＋ 操作手順",
    icon: "routine",
  },
  {
    tag: "Googleサービスの連携・自動化",
    title: (
      <>
        入力の、その先も
        <br />
        つながる。
      </>
    ),
    desc: "フォームの回答からメールを送る、予定を登録する。Googleサービス間の作業をGASなどでつなぎます。",
    artifact: "連携の設定・スクリプト ＋ 使い方",
    icon: "connection",
  },
];

function EntranceDrawing({ type }: { type: string }) {
  return (
    <svg
      className="entrance-drawing"
      viewBox="0 0 180 92"
      fill="none"
      aria-hidden="true"
    >
      {type === "sheet" ? (
        <>
          <rect x="30" y="13" width="110" height="65" rx="2" className="icon-fill" />
          <path d="M30 33h110M30 55h110M68 13v65M104 13v65m-65-33h18m20 0h18m18 0h18m-92 22h18m20 0h18m18 0h18" />
        </>
      ) : type === "routine" ? (
        <>
          <path d="M43 21h75l15 16m0-16v16h-16M133 69H58L43 53m0 16V53h16" />
          <rect
            x="60"
            y="33"
            width="56"
            height="28"
            rx="2"
            className="icon-fill"
          />
          <path d="m81 42-6 5 6 5m14-10 6 5-6 5m-5-11-5 13" />
        </>
      ) : (
        <>
          <rect
            x="63"
            y="8"
            width="52"
            height="24"
            rx="2"
            className="icon-fill"
          />
          <path d="M89 32v15H45v13m44-13h44v13" />
          <rect x="23" y="60" width="44" height="24" rx="2" />
          <rect x="111" y="60" width="44" height="24" rx="2" />
          <path d="M76 20h25M34 72h22m67 0h20" />
        </>
      )}
    </svg>
  );
}

export default function HomePage() {
  return (
    <MotionScene>
      <section className="hero container" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">
            <span />
            平日夜・土日の、リモート業務改善
          </p>
          <h1 id="hero-title">
            <span className="hero-line">
              <span>日中の業務を</span>
            </span>
            <span className="hero-line">
              <span>止めずに、</span>
            </span>
            <span className="hero-line">
              <span>
                <em>手作業を</em>
                <br className="mobile-break" />
                <em>減らす。</em>
              </span>
            </span>
          </h1>
          <p className="hero-description">
            Excel・スプレッドシートの改善から、
            <br className="desktop-break" />
            集計・転記・通知の自動化まで。
            <br className="desktop-break" />
            平日夜・土日に、仕組みを整えます。
          </p>
          <a href="#contact" className="cta">
            まずは文章で相談する
            <Arrow diagonal />
          </a>
          <p className="cta-note">
            フォームはいつでも送信可
            <br />
            原則2営業日以内にメールで返信
          </p>
        </div>
        <div className="hero-visual">
          <p className="hero-side-note">LESS CHAOS, MORE CLARITY.</p>
          <WorkMap />
          <p className="hero-caption">
            <span>離れていても、同じ目線で。</span>
            次からの作業が楽になる仕組みを、一緒につくります。
          </p>
        </div>
        <div className="hero-foot">
          <span>IT OPERATIONS, WITH YOU.</span>
          <a href="#concerns">
            SCROLL TO EXPLORE<span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      <MotionRibbon />

      <section id="concerns" className="section container empathy">
        <Reveal className="section-split">
          <div>
            <SectionLabel number="01">こんな状況、ありませんか</SectionLabel>
            <h2>
              日々の対応は
              <br />
              回っていても、
              <br />
              <span className="accent">改善は後回しに</span>
              <br />
              なっていませんか？
            </h2>
          </div>
          <div className="empathy-body">
            <p className="section-intro">
              今日も、コピーと貼り付けを繰り返して夕方。
              <br />
              直したかった集計表は、また明日。
            </p>
            <p>
              本業や会議の合間に、毎月の集計や入力も進める。
              <br />
              日々の仕事を回しながら、改善まで手を回す。
              <br />
              それは、思っている以上に大変なことです。
            </p>
            <ul className="concern-list">
              <li>
                <span>01</span>表の数式が複雑で、直し方が分からない
              </li>
              <li>
                <span>02</span>毎月、同じ転記や集計を繰り返している
              </li>
              <li>
                <span>03</span>フォームの回答後、通知や登録が手作業になる
              </li>
            </ul>
            <p className="empathy-closing">
              全部を一度に変えなくても、大丈夫。
              <br />
              <strong>いま詰まっているところから、一緒に整えましょう。</strong>
            </p>
          </div>
        </Reveal>
      </section>

      <section className="section entrances-section" id="entrances">
        <div className="container">
          <Reveal>
            <SectionLabel number="02">困りごとから、相談する</SectionLabel>
            <div className="section-heading-row">
              <h2>
                まずは、気になることを
                <br />
                ひとつから。
              </h2>
              <p>
                うまく説明できなくても大丈夫です。
                <br />
                近いと感じるものから、お聞かせください。
              </p>
            </div>
          </Reveal>
          <div className="entrance-grid">
            {entrances.map((item, index) => (
              <Reveal key={item.tag} className="entrance">
                <div className="entrance-top">
                  <span>0{index + 1}</span>
                  <EntranceDrawing type={item.icon} />
                </div>
                <p className="entrance-tag">{item.tag}</p>
                <h3>{item.title}</h3>
                <p className="entrance-desc">{item.desc}</p>
                <div className="artifact">
                  <span>たとえば、こんな形に</span>
                  <p>{item.artifact}</p>
                </div>
                <TopicLink topic={topics[index]} />
                  <Link className="text-link service-detail-link" href={services[index].path}>
                    {services[index].shortName}について詳しく見る
                    <Arrow />
                  </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <OutcomeStory />

      <section className="section scope-section" id="support">
        <div className="container">
          <Reveal>
            <SectionLabel number="04">
              支援できること・できないこと
            </SectionLabel>
            <div className="section-heading-row">
              <h2>
                離れていても、
                <br />
                整えられることがあります。
              </h2>
              <p>
                平日夜・土日に進められる、
                <br />
                整理・改善の支援に集中しています。
              </p>
            </div>
          </Reveal>
          <Reveal className="scope-layout">
            <div className="scope-yes">
              <h3>
                <span className="scope-symbol">↗</span>
                リモートで、一緒に整えること
              </h3>
              <ul>
                {[
                  "Excel・スプレッドシートの数式や入力設定の修正",
                  "既存ファイルの集計方法・入力方法の改善",
                  "CSVなどのデータ取り込み・整形・集計の自動化",
                  "Googleフォーム・スプレッドシート等の連携",
                  "GASによるメール通知・予定登録などの自動化",
                  "納品する仕組みの初期設定・操作説明",
                ].map((text) => (
                  <li key={text}>
                    <span aria-hidden="true">✓</span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="scope-no">
              <h3>お受けしていないこと</h3>
              <ul>
                <li>緊急障害対応・当日対応・日中常駐</li>
                <li>PCキッティング・回収、配線</li>
                <li>Wi-Fi・プリンターなどの物理作業</li>
                <li>対面でのサポート</li>
              </ul>
              <p>
                使用ソフトや実行環境、作業内容を確認して対応可否をご案内します。掲載外の作業も、まずは内容をお聞かせください。
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <PricingSection />

      <section className="section container process" id="process">
        <Reveal>
          <SectionLabel number="06">ご相談から、支援開始まで</SectionLabel>
          <div className="section-heading-row">
            <h2>
              最初の一歩は、
              <br />
              文章で大丈夫です。
            </h2>
            <p>
              ヒアリングシートと文章で確認。
              <br />
              必要に応じて、オンラインでも。
            </p>
          </div>
          <ol className="process-grid">
            {[
              [
                "01",
                "フォームから相談",
                "困っている作業を、まずは短くお送りください。原則2営業日以内にメールで返信します。",
                "フォームはいつでも送信できます。",
              ],
              [
                "02",
                "シートで内容を確認",
                "メニュー別のヒアリングシートをメールでご案内します。分かる範囲でご記入いただき、不足点を文章で確認します。",
                "必要に応じて、平日夜・土日にオンラインで。",
              ],
              [
                "03",
                "総額・納期に合意",
                "対応できる作業範囲、基本料金とオプションの内訳、総額、納期をご案内します。内容に合意いただいてから支援を始めます。",
                "必要な範囲から、小さく始めます。",
              ],
            ].map(([n, title, desc, note]) => (
              <li key={n}>
                <div className="step-number">
                  <span>{n}</span>
                  <Arrow />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
                <small>{note}</small>
              </li>
            ))}
          </ol>
          <aside className="estimate-note" aria-labelledby="estimate-title">
            <div>
              <span className="eyebrow">HOW WE TALK</span>
              <h3 id="estimate-title">文面でも、オンラインでも。</h3>
            </div>
            <div>
              <p>
                文章で進めたい方は、シートとメールでやり取りできます。画面を一緒に確認したい場合は、平日夜・土日のオンラインヒアリングをご案内します。
              </p>
              <p className="estimate-small">
                ご相談の時点で、支援のご依頼を決める必要はありません。
              </p>
            </div>
          </aside>
        </Reveal>
      </section>

      <section className="contact-section" id="contact">
        <div className="container contact-layout">
          <div className="contact-copy">
            <SectionLabel number="07">まずは、文章で相談する</SectionLabel>
            <h2>
              毎日の作業の
              <br />
              「ちょっと困った」、
              <br />
              <em>聞かせてください。</em>
            </h2>
            <p>
              何から手をつければいいか分からない。
              <br />
              そんな段階から、ご相談いただけます。
            </p>
            <div className="contact-promise">
              <p>
                <span>受付</span>フォームはいつでも送信可
              </p>
              <p>
                <span>返信</span>原則2営業日以内にメールで
              </p>
              <p>
                <span>対応</span>平日夜・土日／フルリモート
              </p>
            </div>
            <p className="contact-caution">
              ※緊急障害対応・当日対応・日中常駐は承っていません。
            </p>
          </div>
          <ContactForm />
        </div>
      </section>

      <section className="section container about" id="about">
        <Reveal className="about-layout">
          <div>
            <SectionLabel number="08">お手伝いする人</SectionLabel>
            <div className="operator-name">
              Yu-chi<span>IT運用の伴走パートナー</span>
            </div>
          </div>
          <div>
            <h2>
              整えて、使われて、
              <br />
              はじめて意味がある。
            </h2>
            <p>
              社内情報システム・業務システム・業務改善に携わっています。
              <br />
              得意なのは、散らばった情報を構造化し、繰り返し使える仕組みにすること。
            </p>
            <p>
              立派な仕組みをつくることよりも、明日の業務で使えること。
              <br />
              あなたの現場のやり方を聞きながら、無理なく続けられる形を一緒に考えます。
            </p>
            <span className="operator-sign">Yu-chi</span>
          </div>
        </Reveal>
      </section>
    </MotionScene>
  );
}
