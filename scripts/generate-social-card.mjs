import sharp from "sharp";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#f8f5ef"/>
<g fill="#a24c36"><rect x="72" y="78" width="44" height="5"/><rect x="72" y="91" width="44" height="5"/><rect x="72" y="104" width="44" height="5"/></g>
<g font-family="Hiragino Kaku Gothic ProN, sans-serif" fill="#342e29">
<text x="140" y="111" font-size="48">Matore</text>
<text x="72" y="230" font-size="28" fill="#a24c36">明日の仕事が、すっと回る。</text>
<text x="72" y="325" font-size="52">Excel改善・データ集計</text>
<text x="72" y="400" font-size="52">Googleサービスの自動化支援</text>
<path d="M72 456H1128" stroke="#d8d0c5"/>
<text x="72" y="526" font-size="26">平日夜・土日 ／ フルリモート</text>
<text x="1128" y="558" text-anchor="end" font-size="22" fill="#756b61">matore.jp</text>
</g></svg>`;

await sharp(Buffer.from(svg)).png().toFile(new URL("../public/og-matore.png", import.meta.url).pathname);
console.log("Generated public/og-matore.png (1200 × 630)");
