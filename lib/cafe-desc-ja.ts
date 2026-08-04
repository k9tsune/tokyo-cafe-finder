import descriptions from "@/data/cafe-descriptions-ja.json";

// Japanese cafe descriptions. Two sources, checked in order:
//  1) a per-cafe researched description (data/cafe-descriptions-ja.json, keyed by
//     slug) — original Japanese prose written from Japanese-language research.
//  2) a per-chain description — chains share a consistent character, so one
//     accurate Japanese description covers all their branches. (Per-branch facts
//     like Wi-Fi/outlets are still shown from the structured data on the page.)
// If neither matches, the page falls back to the factual one-liner.

const PER_CAFE = descriptions as Record<string, string>;

const CHAIN_DESC: { re: RegExp; text: string }[] = [
  { re: /starbucks|スターバックス/i, text: "世界的に知られるシアトル系のコーヒーチェーンです。フリーWi-Fiが使え、電源のある席を備えた店舗も多いため、ノートパソコン作業の定番として人気です。混み合う時間帯は席が埋まりやすいので、時間をずらすのがおすすめです。" },
  { re: /doutor|ドトール/i, text: "手頃な価格で気軽に立ち寄れる、定番のコーヒーチェーンです。店舗によって設備は異なりますが、電源席やWi-Fiが使えるところもあり、短時間の作業や休憩にぴったりです。" },
  { re: /tully|タリーズ/i, text: "落ち着いた雰囲気で人気のコーヒーチェーンです。多くの店舗でWi-Fiが使え、電源席を備えた店舗もあるため、ゆっくり作業したいときに向いています。" },
  { re: /komeda|コメダ/i, text: "名古屋発の喫茶店チェーンで、ゆったりとしたソファ席と居心地のよさが魅力です。長居しやすくモーニングも人気で、店舗によってはWi-Fiや電源も利用できます。" },
  { re: /excelsior|エクセルシオール/i, text: "ドトール系列の、少し落ち着いた雰囲気のカフェチェーンです。店舗によりますが電源席やWi-Fiが使えることもあり、街なかでの作業や休憩に便利です。" },
  { re: /\bpronto\b|プロント/i, text: "昼はカフェ、夜はバーとして使える二毛作スタイルのチェーンです。店舗によってはWi-Fiや電源も使え、時間帯を問わず立ち寄りやすいお店です。" },
  { re: /veloce|ベローチェ/i, text: "リーズナブルな価格が魅力の定番カフェチェーンです。店舗によって設備は異なりますが、電源やWi-Fiが使えるところもあり、気軽な作業や休憩に向いています。" },
  { re: /st\.? ?marc|サンマルク/i, text: "焼きたてのチョコクロで知られるカフェチェーンです。店舗によってはWi-Fiや電源席があり、買い物や外出の合間の休憩・作業に使いやすいお店です。" },
  { re: /renoir|ルノアール/i, text: "ゆったりとした座席とおしぼりのサービスで知られる、老舗の喫茶店チェーンです。電源やWi-Fiを備えた店舗が多く、打ち合わせや落ち着いた作業に向いています。" },
  { re: /ueshima|上島|\bucc\b/i, text: "ネルドリップのコーヒーが楽しめる、落ち着いた雰囲気の喫茶チェーンです。店舗によってはWi-Fiや電源も使え、ゆっくり過ごしたいときにおすすめです。" },
  { re: /self ?cafe|セルフカフェ/i, text: "Wi-Fiと電源を完備した、セルフサービス型のワークスペース・カフェです。全席で電源が使え、静かに集中して作業できる環境が整っています。時間制で気軽に利用できます。" },
  { re: /mcdonald|マクドナルド/i, text: "手軽に利用できるファストフード店です。多くの店舗でフリーWi-Fiが使え、電源のある席を備えた店舗もあるため、短時間の作業や充電に便利です。" },
  { re: /cafe de crie|カフェ・?ド・?クリエ|ド・クリエ/i, text: "手頃な価格で気軽に立ち寄れる、セルフサービス式のカフェチェーンです。多くの店舗でフリーWi-Fiと電源席が使え、待ち合わせや短時間の作業・休憩に便利です。" },
  { re: /kohikan|珈琲館/i, text: "ネルドリップのコーヒーと厚切りトーストで知られる、老舗の喫茶店チェーンです。落ち着いた雰囲気で長居しやすく、店舗によってはWi-Fiや電源も使えます。" },
  { re: /dean ?& ?deluca|ディーン ?& ?デルーカ|ディーン&デルーカ/i, text: "ニューヨーク発の、上質な食材やデリを扱うおしゃれなカフェです。洗練された空間でフリーWi-Fiが使え、カウンターなどに電源のある店舗もあります。買い物や外出の合間の作業・休憩に。" },
  { re: /share ?lounge|シェアラウンジ/i, text: "蔦屋書店などに併設された、有料制のワークラウンジです。ドリンクやスナックが飲み放題で、高速Wi-Fiと全席電源を完備。腰を据えて集中したいときにぴったりです。" },
  { re: /\bkfc\b|ケンタッキー/i, text: "手軽に利用できるファストフード店です。店舗によってはフリーWi-Fiや電源席があり、短時間の作業や充電、休憩に便利です。電源が使えない席や時間帯もあるのでご注意ください。" },
  { re: /jonathan|ジョナサン/i, text: "すかいらーくグループのファミリーレストランです。フリーWi-Fiとドリンクバーが使え、電源のある席も多いため、長時間の作業や勉強に向いています。深夜まで営業する店舗も多く便利です。" },
  { re: /\bgusto\b|ガスト/i, text: "すかいらーくグループの、リーズナブルなファミリーレストランです。フリーWi-Fiとドリンクバーが使え、電源のある席を備えた店舗も多いため、長時間の作業や勉強にぴったりです。" },
  { re: /kaikatsu|快活/i, text: "マンガとインターネットが楽しめる、24時間営業の複合カフェです。フリーWi-Fiに加え、鍵付きの防音個室や全席電源、シャワーを備え、集中作業や長時間の滞在に向いています。時間制の料金です。" },
  { re: /burger king|バーガーキング/i, text: "直火焼きのワッパーで知られるファストフード店です。多くの店舗でフリーWi-Fiと電源が使え、短時間の作業や休憩、充電に便利です。" },
  { re: /mos burger|モスバーガー/i, text: "国産食材にこだわる日本発のハンバーガーチェーンです。多くの店舗でフリーWi-Fiが使え、カウンター席に電源やUSBポートを備えた店舗もあり、短時間の作業や休憩に向いています。" },
  { re: /brooklyn roasting|ブルックリン ?ロースティング/i, text: "ニューヨーク・ブルックリン発の、フェアトレードの豆にこだわるロースタリーカフェです。フリーWi-Fiと電源が使える席もありますが、混雑時は2時間制になることがあります。" },
];

export function cafeDescJa(slug: string, name = "", nameJa = ""): string | undefined {
  if (PER_CAFE[slug]) return PER_CAFE[slug];
  const hay = `${name} ${nameJa}`;
  const chain = CHAIN_DESC.find((c) => c.re.test(hay));
  return chain?.text;
}
