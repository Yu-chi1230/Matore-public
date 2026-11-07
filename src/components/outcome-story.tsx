"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const deliverables = [
  {
    title: "使いやすくなった表",
    lead: "いつもの表を、もっと楽に。",
    desc: "数式の修正や入力欄の改善を、今あるファイルに。どこを直したかもお伝えし、日々の作業に戻せる形でお渡しします。",
    tag: "EXCEL / GOOGLE SHEETS",
    note: "直したい箇所を、ひとつから。",
  },
  {
    title: "集計・加工の仕組み",
    lead: "次の月も、同じ手順で。",
    desc: "決まった形式のデータを取り込み、合意したルールで集計・加工。毎回の転記や計算を、繰り返し使える処理にまとめます。",
    tag: "DATA / AUTOMATION",
    note: "入力データと出力結果を、一緒に確認。",
  },
  {
    title: "Googleサービスの連携",
    lead: "入力したら、その先へ。",
    desc: "フォームへの回答や決まった時刻をきっかけに、通知・登録などを実行。設定とスクリプトを整え、動作を確認してお渡しします。",
    tag: "GOOGLE / GAS",
    note: "どの条件で、何が動くかを明確に。",
  },
  {
    title: "使い方・操作手順",
    lead: "受け取ったあとも、使える。",
    desc: "準備するデータ、実行する操作、結果の確認方法を簡潔にまとめます。対象環境での初期設定と、簡単な操作説明は基本料金に含みます。",
    tag: "GUIDE / HANDOVER",
    note: "納品物と一緒に、使い方も手元へ。",
  },
];

function PreviewSheet({ index }: { index: number }) {
  return (
    <div className={`preview-sheet preview-sheet-${index}`}>
      <div className="sheet-heading">
        <span>MATORE / WORKING NOTE</span>
        <span>見本</span>
      </div>
      <h3>{deliverables[index].title}</h3>
      {index === 0 ? (
        <div className="ledger">
          <div className="ledger-row ledger-head">
            <span>対象</span>
            <span>変更</span>
            <span>確認</span>
          </div>
          {["集計式", "入力欄", "表示形式"].map((label) => (
            <div className="ledger-row" key={label}>
              <span>{label}</span>
              <span>修正済</span>
              <span className="ledger-check">✓ 確認済</span>
            </div>
          ))}
        </div>
      ) : index === 1 ? (
        <div className="manual-lines">
          {[
            "同じ形式のCSVを用意",
            "決めたルールで自動集計",
            "月別の集計表を出力",
          ].map((label, number) => (
            <div key={label}>
              <span className="manual-box">✓</span>
              <span>
                <small>STEP 0{number + 1}</small>
                {label}
              </span>
            </div>
          ))}
        </div>
      ) : index === 2 ? (
        <div className="workflow-drawing">
          <span>フォームに回答</span>
          <i>↓</i>
          <div>
            <span>GASが処理</span>
            <i>→</i>
            <span>定型メール</span>
          </div>
          <i>↓</i>
          <span className="flow-complete">担当者へ通知 ✓</span>
        </div>
      ) : (
        <div className="manual-lines">
          {["使うデータ・設定を準備", "手順に沿って実行", "処理結果を確認"].map((label, number) => (
            <div key={label}>
              <span className="manual-box">✓</span>
              <span><small>STEP 0{number + 1}</small>{label}</span>
            </div>
          ))}
        </div>
      )}
      <div className="sheet-foot">
        <span>整理する。つなぐ。仕組みにする。</span>
        <span>0{index + 1}</span>
      </div>
    </div>
  );
}

export function OutcomeStory() {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".story-card", ref.current);
      const activationLine = () =>
        matchMedia("(max-width: 800px)").matches && window.innerHeight > 650
          ? "68%"
          : "58%";
      cards.forEach((card, index) =>
        ScrollTrigger.create({
          trigger: card,
          start: () => `top ${activationLine()}`,
          end: () => `bottom ${activationLine()}`,
          onEnter: () => setActive(index),
          onEnterBack: () => setActive(index),
        }),
      );
    }, ref);
    return () => context.revert();
  }, []);

  return (
    <section
      ref={ref}
      className="section container outcomes outcome-story"
      id="outcomes"
    >
      <div className="story-sidebar">
        <div className="story-heading">
          <p className="section-label">
            <span>03</span>支援後に、残るもの
          </p>
          <h2>
            その場の対応から、
            <br />
            <span className="accent">次回から回る</span>
            <br />
            仕組みへ。
          </h2>
          <p className="story-intro">
            実際の業務で使い続けられる形にして、
            <br />
            あなたのチームへ手渡します。
          </p>
        </div>
        <div className="story-art">
          <div
            className="story-previews"
            aria-label={`成果物のイメージ：${deliverables[active].title}`}
          >
            {deliverables.map((item, index) => (
              <div
                className="preview-panel"
                key={item.title}
                data-active={active === index}
                aria-hidden={active !== index}
              >
                <PreviewSheet index={index} />
              </div>
            ))}
          </div>
          <div className="story-controls">
            <span>お渡しするものの見本</span>
            <div role="group" aria-label="成果物の説明へ移動">
              {deliverables.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  aria-label={`${item.title}の説明へ`}
                  aria-pressed={active === index}
                  onClick={() =>
                    document
                      .getElementById(`outcome-${index}`)
                      ?.scrollIntoView({
                        behavior: matchMedia("(prefers-reduced-motion: reduce)")
                          .matches
                          ? "instant"
                          : "smooth",
                        block: "start",
                      })
                  }
                >
                  0{index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="story-cards">
        {deliverables.map((item, index) => (
          <article
            id={`outcome-${index}`}
            key={item.title}
            className="story-card"
            data-active={active === index}
          >
            <div className="story-card-top">
              <span>0{index + 1}</span>
              <span>{item.tag}</span>
            </div>
            <p className="story-lead">{item.lead}</p>
            <h3>{item.title}</h3>
            <p className="story-description">{item.desc}</p>
            <p className="story-note">{item.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
