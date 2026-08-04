import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: `${SITE.name}へのお問い合わせ — 修正・提案・ご質問など。`,
  alternates: { canonical: "/ja/contact", languages: { en: "/contact", ja: "/ja/contact", "x-default": "/contact" } },
};

export default function ContactJa() {
  return (
    <div>
      <h1>お問い合わせ</h1>
      <p className="lede">
        {SITE.name}は、小さな個人運営のプロジェクトです。すべてのメッセージに目を通しています。お気軽にご連絡ください。
      </p>

      <p>
        メールはこちら： <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
      </p>

      <h2>ご連絡いただきたいこと</h2>
      <p>
        <strong>情報が古いと感じたら</strong> — カフェのWi-Fiや電源の情報が違う、またはお店が閉店している場合は、お店の名前と気づいた内容をお知らせください。あらためて確認します。
      </p>
      <p>
        <strong>おすすめのカフェをご存じなら</strong> — 作業に向いたお店で載っていないものがあれば、店名と最寄り駅を教えてください。ご提案は大歓迎です。
      </p>
      <p>
        <strong>お仕事・取材のご依頼</strong> — 同じアドレスまでご連絡ください。折り返しご連絡いたします。
      </p>

      <p className="muted">
        数日以内の返信を心がけています。特定のカフェについてのご連絡は、確認をスムーズにするためリンクを添えていただけると助かります。
      </p>
    </div>
  );
}
