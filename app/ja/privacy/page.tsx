import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: `${SITE.name}における、データ・Cookie・位置情報・広告の取り扱いについて。`,
  alternates: { canonical: "/ja/privacy", languages: { en: "/privacy", ja: "/ja/privacy", "x-default": "/privacy" } },
};

const UPDATED = "2026年8月2日";

export default function PrivacyJa() {
  return (
    <div>
      <h1>プライバシーポリシー</h1>
      <p className="muted">最終更新日：{UPDATED}</p>

      <p>
        {SITE.name}（以下「当サイト」）は、Wi-Fiと電源のあるカフェを紹介する個人運営のガイドです。このページでは、当サイトの利用時にどのような情報が収集され、どのように使われるかを説明します。ご不明な点は <a href={`mailto:${SITE.email}`}>{SITE.email}</a> までお問い合わせください。
      </p>

      <h2>収集する情報</h2>
      <p>
        当サイトはアカウント登録を求めておらず、氏名・メールアドレス・支払い情報を直接収集することはありません。多くのウェブサイトと同様に、ホスティング事業者が、セキュリティやサービス維持のために、IPアドレス・ブラウザの種類・閲覧ページなどの技術的な情報を自動的に記録する場合があります。
      </p>

      <h2>位置情報</h2>
      <p>
        「近くのカフェを探す」やページ内の経路表示などの機能は、お使いの端末の位置情報を <strong>ブラウザ内でのみ</strong>、かつ許可をいただいた場合にのみ利用し、近くのお店の並べ替えや経路表示に使います。位置情報が当サイトに送信されたり、サーバーに保存されたりすることはありません。位置情報の利用は、ブラウザの設定でいつでもオン・オフを切り替えられます。
      </p>

      <h2>Cookieと広告</h2>
      <p>
        当サイトでは <strong>Google AdSense</strong> による広告の表示を予定しています。Googleを含む第三者事業者は、Cookieを使用して、ユーザーの過去のアクセス履歴に基づいた広告を表示することがあります。Googleが広告Cookieを使用することで、Googleおよびそのパートナーは、当サイトやその他のサイトへのアクセスに基づいた広告を表示できます。
      </p>
      <p>
        パーソナライズド広告は、
        <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google広告設定</a>
        からオプトアウトできます。また、一部の第三者事業者によるパーソナライズド広告向けCookieの使用は、
        <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">aboutads.info</a>
        からオプトアウトできます。詳しくは
        <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">Googleのサービスを使用するサイトからの情報のGoogleによる使用について</a>
        をご覧ください。
      </p>
      <p>
        法令で求められる場合（例：EU・英国の訪問者、または日本の個人情報保護法（APPI）に基づく場合）には、必須ではない広告Cookieを設定する前に同意の確認を表示し、拒否できるようにします。
      </p>

      <h2>アクセス解析</h2>
      <p>
        どのページが役立っているかを把握するため、プライバシーに配慮したアクセス解析を、集計された形で利用することがあります。個人を特定する目的で解析を利用することはありません。
      </p>

      <h2>第三者のサービス</h2>
      <p>
        一部のページでは、
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google</a>
        による地図・経路・写真や、OpenStreetMapコントリビューターによるベース地図データを埋め込んでいます。これらを操作した際、各提供事業者が自社のプライバシーポリシーに基づき、IPアドレスなどの情報を受け取る場合があります。
      </p>

      <h2>お子様について</h2>
      <p>当サイトは一般の利用者を対象としており、13歳未満のお子様を対象とはしていません。</p>

      <h2>ユーザーの選択</h2>
      <p>
        ブラウザでCookieをブロック・削除したり、上記のリンクからパーソナライズド広告をオプトアウトしたり、位置情報の共有をいつでもオフにしたりできます。データの開示・削除の権利がある地域にお住まいで、その請求をご希望の場合は、メールでご連絡いただければ対応します。
      </p>

      <h2>変更について</h2>
      <p>
        サイトの成長に合わせて（例：広告の開始や新機能の追加時など）、本ポリシーを更新することがあります。重要な変更は、上部の「最終更新日」に反映します。
      </p>

      <h2>お問い合わせ</h2>
      <p>
        本ポリシーに関するご質問は <a href={`mailto:${SITE.email}`}>{SITE.email}</a> までお願いします。
      </p>
    </div>
  );
}
