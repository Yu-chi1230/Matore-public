import Link from "next/link";
import { site } from "@/lib/site";

export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={`arrow${diagonal ? " diagonal" : ""}`}
    >
      <path d="M4 12h15M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Matore ホーム">
      <span className="brand-mark" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="brand-name">
        {site.name}
        <span>{site.tagline}</span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Brand />
        <nav aria-label="メインナビゲーション">
          <Link className="header-service" href="/#support">
            支援できること
          </Link>
          {/* Native anchor restores the section position even when this hash is already active. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="header-pricing" href="/#pricing">
            料金
          </a>
          <Link className="header-contact" href="/#contact">
            相談する
            <Arrow diagonal />
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <Brand />
        <p>
          ひとりで抱える社内ITに、
          <br />
          一緒に整えるパートナーを。
        </p>
        <a href="#main" className="back-top" aria-label="ページの先頭へ">
          ↑
        </a>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} {site.name}
        </span>
        <Link href="/privacy">
          プライバシーポリシー
          <Arrow diagonal />
        </Link>
        <span className="footer-note">SMALL STEPS. BETTER OPERATIONS.</span>
      </div>
    </footer>
  );
}
