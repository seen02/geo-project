# Steps 0–3 report: reference.jpg

Total time 60s; per step: exif 0.4s, variants 1.1s, edges 1.6s, ocr 12.6s, rev-yandex 40.1s, rev-baidu 46.8s

Next: record clues on board.py (`clue`), lookup clues with `apply`; list the candidates in full first (`children`), then rank.

## Metadata

No metadata (common for forwarded images, screenshots, rephotographed images). Raw output: `{"file": "C:\\Users\\admin\\Documents\\ChatGPT\\새로운 프로젝트 선정\\frame-location\\.local-data\\requests\\FR-20261103-3711BC\\runs\\1\\reference.jpg", "size": [2866, 5095]}`

## OCR text (second reader; pass=up/tile was only read after zooming, treat it as an assumption)

| Conf | Pass | Box (px) | Text |
|---|---|---|---|
| 0.57 | tile | [1395, 1769, 1457, 1787] | tpir |

Phone numbers, plates, proper names on road signs, issuing authorities: first `clues.py lookup`, then `board.py apply`.

## Reverse image search

- baidu: ok
- yandex: ok

### Similar images (Baidu; open the contact sheet first)

A near-duplicate photo is the fastest route to a location: the same object or scene has often been photographed by others and posted on Dianping, Douyin, Xiaohongshu, and the source page's shop name, scenic-area name or location tag gives the place directly. Open the contact sheet and compare each cell with the query image in the top-left corner on **fixed features** (shapes of structural parts, soot and damage, the mountains/buildings/bridges/pylons behind); merely the same kind of object doesn't count. For a near-duplicate: number i is `similar[i]` in that image's JSON, `from` is the source page, `site` is the site; look through the other images on the same source page too. For sources that need a login, don't log in and don't bypass verification; instead do a keyword search from image features + site type. Look at the original image's sheet first; look at the variants' sheets only if the original's has no near-duplicate.

- **reference**: 90 images (mbd.baidu.com 11, weibo.com 7, xiaohongshu.com 6, veer.com 6, xsj.699pic.com 6, mafengwo.cn 5, baijiahao.baidu.com 4, sohu.com 3); contact sheet `rev/reference_baidu_similar.jpg` (first 24); source list in `similar` of `rev/reference_baidu.json`
- **full_flip**: 90 images (mbd.baidu.com 10, mafengwo.cn 9, weibo.com 7, veer.com 7, xiaohongshu.com 4, douyin.com 4, zhuanlan.zhihu.com 3, huaban.com 3); contact sheet `rev/full_flip_baidu_similar.jpg` (first 24); source list in `similar` of `rev/full_flip_baidu.json`
- **full_gray**: 90 images (meipian.cn 14, nipic.com 7, sohu.com 6, 163.com 4, weibo.com 4, xiaohongshu.com 3, ls.mala.cn 3, douban.com 3); contact sheet `rev/full_gray_baidu_similar.jpg` (first 24); source list in `similar` of `rev/full_gray_baidu.json`

### Tiered vote count (several variants from one engine naming the same city count as one vote; conflicting specific places don't cancel city votes)

- City level **seoul south korea**: 1 votes (yandex)
- City level **seoul korea**: 1 votes (yandex)
- City level **韩国首尔传统街巷**: 1 votes (baidu)
- Specific place **韩国传统街巷**: 1 times (baidu/full_flip) → `poi.py "韩国传统街巷" --city <city> --region <cc>` to get coordinates; list every same-name place, then verify

### Each image, each engine

**full_flip / baidu** (screenshot `rev/full_flip_baidu.png`, always open it)
- Similar images: 90, contact sheet `rev/full_flip_baidu_similar.jpg` (see above)
- Tag: 图中可能是韩国传统街巷
- [weibo.com] #首尔##citywalk##釜山##江陵##庆州##韩国# 微博 — http://weibo.com/3787942764/NgN7EE40j
- [travel.sohu.com] 快乐重启！在9月初秋的首尔来一场Citywalk！花式逛吃嗨玩购物天花板！必须喊上闺蜜组局来炫！_出口_钟路_历史 搜狐旅游 — http://travel.sohu.com/a/714901413_121117478

**full_flip / yandex** (screenshot `rev/full_flip_yandex.png`, always open it)
- Tag: Image appears to contain: seoul south korea / seoul korea / южная корея город / улицы южной кореи / capital of south korea / Similar images / Show more similar images
- [ru.wikipedia.org] ru.wikipedia.org — https://ru.wikipedia.org/wiki/%D0%A1%D0%B5%D1%83%D0%BB?utm_medium=organic&utm_source=yandexsmartcame
- [ak-d.tripcdn.com] 640×854 — https://ak-d.tripcdn.com/images/1mi4a424x98fzxg3r379C_W_640_0_R5_Q80.jpg?proc=source/trip
- [ru.trip.com] Сеульские ночные виды с башни N Seoul Tower Trip.com - Южная Корея — https://ru.trip.com/moments/detail/south-korea-100042-142242074?utm_medium=organic&utm_source=yandex
- [assets.wonderplan.ai] 1920×3413 — https://assets.wonderplan.ai/bukchon.webp
- [wonderplan.ai] Top 10 Must-See Attractions in Seoul for First-Time Visitors Wonderplan — https://wonderplan.ai/blog/top-10-must-see-attractions-seoul-first-time-visitors?utm_medium=organic&
- [images.template.net] 1200×1198 — https://images.template.net/328603/3-Day-Seoul-Itinerary-Template-edit-online-5.jpg
- [www.template.net] Free 3 Day Seoul Itinerary Template to Edit Online — https://www.template.net/edit-online/328603/3-day-seoul-itinerary?utm_medium=organic&utm_source=yand
- [judyer.com] 1000×1333 — https://judyer.com/wp-content/uploads/20230823184056_76.jpg

**full_gray / baidu** (screenshot `rev/full_gray_baidu.png`, always open it)
- Similar images: 90, contact sheet `rev/full_gray_baidu_similar.jpg` (see above)
- Tag: 图中可能是临夏八坊十三巷

**full_gray / yandex** (screenshot `rev/full_gray_yandex.png`, always open it)
- Tag: Image appears to contain: seoul south korea / южная корея сеул / улицы южной кореи / сеул город / capital of south korea / In other sizes / 2880×5120
- [ru.wikipedia.org] ru.wikipedia.org — https://ru.wikipedia.org/wiki/%D0%A1%D0%B5%D1%83%D0%BB?utm_medium=organic&utm_source=yandexsmartcame
- [images.unsplash.com] 2880×5120 — https://images.unsplash.com/photo-1630135199928-55a43e87350d?auto=format&fit=crop&w=2880
- [assets.wonderplan.ai] 1920×3413 — https://assets.wonderplan.ai/bukchon.webp
- [miro.medium.com] 1358×2414 — https://miro.medium.com/v2/resize:fit:1358/1*IYak22bHgd5tTm4mZVOr8Q.jpeg
- [humbo.s3.eu-north-1.amazonaws.com] 1238×2200 — https://humbo.s3.eu-north-1.amazonaws.com/place-photo/65b7c64659acd03706b280ac/dwn-QhFsEd.jpeg
- [images.unsplash.com] 1080×1920 — https://images.unsplash.com/photo-1630135199928-55a43e87350d?auto=format&fit=crop&w=1080
- [lbposter.ru] 1100×1465 — https://lbposter.ru/image/cache/catalog/i/of/bf/2f74acba029479ff7a402f0ec7d8f41a-1100x0.jpg
- [tripeditor.com] 1200×758 — https://tripeditor.com/wp-content/uploads/2025/07/09192646/clement-ozwuhSnFaiM-unsplash-1200x758.jpg

**reference / baidu** (screenshot `rev/reference_baidu.png`, always open it)
- Similar images: 90, contact sheet `rev/reference_baidu_similar.jpg` (see above)
- Tag: 图中可能是韩国首尔传统街巷
- [weibo.com] #首尔##citywalk##釜山##江陵##庆州##韩国# 微博 — http://weibo.com/3787942764/NgN7EE40j
- [travel.sohu.com] 快乐重启！在9月初秋的首尔来一场Citywalk！花式逛吃嗨玩购物天花板！必须喊上闺蜜组局来炫！_出口_钟路_历史 搜狐旅游 — http://travel.sohu.com/a/714901413_121117478
- [www.douyin.com] #分享异国风情 春节后的第一场旅行，一起去韩国吧！ - 抖音 — http://www.douyin.com/note/7329391038190161189

**reference / yandex** (screenshot `rev/reference_yandex.png`, always open it)
- Tag: Image appears to contain: улицы южной кореи / seoul south korea / сеул город / южная корея сеул / южная корея город / In other sizes / 2880×5120
- [ru.wikipedia.org] ru.wikipedia.org — https://ru.wikipedia.org/wiki/%D0%A1%D0%B5%D1%83%D0%BB?utm_medium=organic&utm_source=yandexsmartcame
- [images.unsplash.com] 2880×5120 — https://images.unsplash.com/photo-1630135199928-55a43e87350d?auto=format&fit=crop&w=2880
- [assets.wonderplan.ai] 1920×3413 — https://assets.wonderplan.ai/bukchon.webp
- [miro.medium.com] 1358×2414 — https://miro.medium.com/v2/resize:fit:1358/1*IYak22bHgd5tTm4mZVOr8Q.jpeg
- [humbo.s3.eu-north-1.amazonaws.com] 1238×2200 — https://humbo.s3.eu-north-1.amazonaws.com/place-photo/65b7c64659acd03706b280ac/dwn-QhFsEd.jpeg
- [images.unsplash.com] 1080×1920 — https://images.unsplash.com/photo-1630135199928-55a43e87350d?auto=format&fit=crop&w=1080
- [lbposter.ru] 1100×1465 — https://lbposter.ru/image/cache/catalog/i/of/bf/2f74acba029479ff7a402f0ec7d8f41a-1100x0.jpg
- [tripeditor.com] 1200×758 — https://tripeditor.com/wp-content/uploads/2025/07/09192646/clement-ozwuhSnFaiM-unsplash-1200x758.jpg

## Output files

- Edge crops: `edges/` (8 images; look at the four edges and four corners one by one)
- Variants: `variants/` (3 images)
- OCR annotated image: `ocr.png`
- Image-search screenshots: `rev/` (6 images)
- Baidu similar-image contact sheets: `rev/*_baidu_similar.jpg` (3)

## Status

- exif: ok
- variants: ok
- edges: ok
- ocr: ok
- rev-yandex: ok
- rev-baidu: ok