import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "このサイトについて",
  description: `${SITE.name}は、東京でWi-Fiや電源のあるカフェを紹介する個人運営のガイドです。`,
  alternates: { canonical: "/ja/about", languages: { en: "/about", ja: "/ja/about", "x-default": "/about" } },
};

export default function AboutJa() {
  return (
    <div>
      <h1>{SITE.name}について</h1>
      <p className="lede">東京のカフェで作業したい人のための、個人運営のガイドです。</p>
      <p>
        東京でフリーランスとして働くなかで、作業できる場所を見つけるのにいつも苦労していました。同じように困っている方の役に立てばと思い、このサイトを作りました。
      </p>
      <p>
        各ページでは「Wi-Fiはあるか」「電源はあるか」「ノートパソコンで作業できるか」の3点を確認しています。情報は定期的に見直し、最新の状態を保つようにしています。
      </p>
      <h2>データと出典</h2>
      <p className="muted">
        位置情報のベースデータは OpenStreetMap のコントリビューターによるものです（ODbL）。地図と経路は Google マップを利用しています。Wi-Fi・電源・作業のしやすさに関するメモは運営者によるものです。
      </p>
      <h2>お問い合わせ</h2>
      <p>
        情報が古い、または載っていないおすすめのカフェがあれば、
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a> または
        <a href="/ja/contact">お問い合わせページ</a>からご連絡ください。すべてのメッセージに目を通しています。
      </p>
    </div>
  );
}
