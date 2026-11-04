# Steps 0–3 report: reference.jpg

Total time 34s; per step: variants 0.4s, exif 0.4s, edges 0.7s, ocr 7.5s, rev-yandex 25.6s, rev-baidu 26.1s

Next: record clues on board.py (`clue`), lookup clues with `apply`; list the candidates in full first (`children`), then rank.

## Metadata

No metadata (common for forwarded images, screenshots, rephotographed images). Raw output: `{"file": "C:\\Users\\admin\\Documents\\ChatGPT\\새로운 프로젝트 선정\\frame-location\\.local-data\\requests\\FR-20261102-C4ABF2\\runs\\1\\reference.jpg", "size": [1440, 810]}`

## OCR text (second reader; pass=up/tile was only read after zooming, treat it as an assumption)

| Conf | Pass | Box (px) | Text |
|---|---|---|---|
| 0.58 | tile | [449, 227, 555, 260] | mihl |

Phone numbers, plates, proper names on road signs, issuing authorities: first `clues.py lookup`, then `board.py apply`.

## Reverse image search

- baidu: ok
- yandex: ok

### Similar images (Baidu; open the contact sheet first)

A near-duplicate photo is the fastest route to a location: the same object or scene has often been photographed by others and posted on Dianping, Douyin, Xiaohongshu, and the source page's shop name, scenic-area name or location tag gives the place directly. Open the contact sheet and compare each cell with the query image in the top-left corner on **fixed features** (shapes of structural parts, soot and damage, the mountains/buildings/bridges/pylons behind); merely the same kind of object doesn't count. For a near-duplicate: number i is `similar[i]` in that image's JSON, `from` is the source page, `site` is the site; look through the other images on the same source page too. For sources that need a login, don't log in and don't bypass verification; instead do a keyword search from image features + site type. Look at the original image's sheet first; look at the variants' sheets only if the original's has no near-duplicate.

- **reference**: 90 images (douyin.com 36, meipian.cn 12, xiaohongshu.com 11, h5.weishi.qq.com 6, club.autohome.com.cn 5, mbd.baidu.com 3, bilibili.com 3, quanmin.baidu.com 2); contact sheet `rev/reference_baidu_similar.jpg` (first 24); source list in `similar` of `rev/reference_baidu.json`
- **full_flip**: 90 images (douyin.com 41, meipian.cn 16, xiaohongshu.com 7, h5.weishi.qq.com 5, mbd.baidu.com 3, club.autohome.com.cn 3, quanmin.baidu.com 2, dianping.com 2); contact sheet `rev/full_flip_baidu_similar.jpg` (first 24); source list in `similar` of `rev/full_flip_baidu.json`

### Tiered vote count (several variants from one engine naming the same city count as one vote; conflicting specific places don't cancel city votes)

- City level: none
- Specific place level: none

### Each image, each engine

**full_flip / baidu** (screenshot `rev/full_flip_baidu.png`, always open it)
- Similar images: 90, contact sheet `rev/full_flip_baidu_similar.jpg` (see above)
- Tag: 图中可能是沙滩夜跑
- [m.dianping.com] 沙滩不是只有蓝天白云大海\\n还有夜晚的 大众点评 — http://m.dianping.com/ugcdetail/123162016?sceneType=0&bizType=29&msource=baiduappugc

**full_flip / yandex** (screenshot `rev/full_flip_yandex.png`, always open it)
- Tag: Image appears to contain: the beach at night / пляж ночь / ночной пляж / пляжные фотографии / beach night / Similar images / Show more similar images
- [i.pinimg.com] 736×1308 — https://i.pinimg.com/736x/cb/db/f0/cbdbf0e4592c69e34a074942a081c451.jpg
- [fi.pinterest.com] Pin de Luana Matsui em praia Foto de computador, Fotos de jacaré, Fotos de trein — https://fi.pinterest.com/pin/ghim-ca-rivohtrill4-trn-minhas-fotos--736971926541772472/?utm_medium=or
- [i.pinimg.com] 1134×2016 — https://i.pinimg.com/originals/cb/db/f0/cbdbf0e4592c69e34a074942a081c451.jpg
- [id.pinterest.com] Nighttime Beach Scene with Lights in the Sky Foto de computador, Parede de futeb — https://id.pinterest.com/pin/ghim-ca-rivohtrill4-trn-minhas-fotos--736971926541772472/?utm_medium=or
- [br.pinterest.com] Nighttime Beach Scene with Lights in the Sky Parede de futebol, Foto de computad — https://br.pinterest.com/pin/644296290463809771/?utm_medium=organic&utm_source=yandexsmartcamera
- [www.scenacriminis.com] 640×1136 — https://www.scenacriminis.com/wp-content/uploads/sb-instagram-feed-images/739895050_1003749509216491
- [www.scenacriminis.com] Bullying may have long-term Health Consequences - Scena Criminis — https://www.scenacriminis.com/forensic-sciences/bullying-may-have-long-term-health-consequences/?noa

**reference / baidu** (screenshot `rev/reference_baidu.png`, always open it)
- Similar images: 90, contact sheet `rev/reference_baidu_similar.jpg` (see above)
- Tag: 图中可能是沙滩夜跑
- [m.dianping.com] 沙滩不是只有蓝天白云大海\\n还有夜晚的 大众点评 — http://m.dianping.com/ugcdetail/123162016?sceneType=0&bizType=29&msource=baiduappugc
- [m.dianping.com] 海景房里的难忘体验 大众点评 — http://m.dianping.com/ugcdetail/262660358?sceneType=0&bizType=29&msource=baiduappugc

**reference / yandex** (screenshot `rev/reference_yandex.png`, always open it)
- Tag: Image appears to contain: the beach at night / пляж ночь / ночной пляж / пляж / copacabana beach / Similar images / Show more similar images
- [i.pinimg.com] 736×1308 — https://i.pinimg.com/736x/cb/db/f0/cbdbf0e4592c69e34a074942a081c451.jpg
- [fi.pinterest.com] Pin de Luana Matsui em praia Foto de computador, Fotos de jacaré, Fotos de trein — https://fi.pinterest.com/pin/ghim-ca-rivohtrill4-trn-minhas-fotos--736971926541772472/?utm_medium=or
- [i.pinimg.com] 1134×2016 — https://i.pinimg.com/originals/cb/db/f0/cbdbf0e4592c69e34a074942a081c451.jpg
- [id.pinterest.com] Nighttime Beach Scene with Lights in the Sky Foto de computador, Parede de futeb — https://id.pinterest.com/pin/ghim-ca-rivohtrill4-trn-minhas-fotos--736971926541772472/?utm_medium=or
- [br.pinterest.com] Nighttime Beach Scene with Lights in the Sky Parede de futebol, Foto de computad — https://br.pinterest.com/pin/644296290463809771/?utm_medium=organic&utm_source=yandexsmartcamera
- [cdn4.cdn-telegram.org] 800×527 — https://cdn4.cdn-telegram.org/file/m4AbzJDzOl7nRxaTyWKkFPsFQ_N8kGG4djtiWSUCx8iFx5F96OTPMlLBCdWTEAjAQ
- [t.me] YIGAL LEVIN 🇮 🇱 🇺 🇦 - Telegram — https://t.me/s/yigal_levin/69264?utm_medium=organic&utm_source=yandexsmartcamera

## Output files

- Edge crops: `edges/` (8 images; look at the four edges and four corners one by one)
- Variants: `variants/` (3 images)
- OCR annotated image: `ocr.png`
- Image-search screenshots: `rev/` (4 images)
- Baidu similar-image contact sheets: `rev/*_baidu_similar.jpg` (2)

## Status

- variants: ok
- exif: ok
- edges: ok
- ocr: ok
- rev-yandex: ok
- rev-baidu: ok