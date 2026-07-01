# 図案画像

このフォルダに図案プレート画像を配置します。ファイル名の規則:

```
<図案ID>-<仕上げ>.jpg
```

必要なファイル（全10点）:

```
ume-wood.jpg      ume-urushi.jpg
keshi-wood.jpg    keshi-urushi.jpg
sakura-wood.jpg   sakura-urushi.jpg
tsubaki-wood.jpg  tsubaki-urushi.jpg
icho-wood.jpg     icho-urushi.jpg
```

- 表示は円形（`border-radius: 50%` + `object-fit: cover`）にクリップされるので、
  正方形（例: 400×400px）で用意すると綺麗に収まります。
- 画像が無いファイルは、自動的に SVG フォールバック（`lib/patternSvg.ts`）で描画されます。
- 画像は kamakura-bori.co.jp の素材を使用予定（許可取得済みの前提）。
