# Steps 0–3 report: reference.jpg

Total time 48s; per step: exif 0.3s, variants 0.7s, edges 1.2s, ocr 11.5s, rev-yandex 28.8s, rev-baidu 35.2s

Next: record clues on board.py (`clue`), lookup clues with `apply`; list the candidates in full first (`children`), then rank.

Input: EXIF orientation 6 applied, so the steps below used `work/reference.png` (2252x4000, lossless, the original's EXIF kept). Metadata was read from the original. Crops and OCR boxes are in this upright frame, the same frame every script uses when given the original, so keep passing the original photo to later commands.

## Metadata

```
{
 "file": "C:\\Users\\admin\\Documents\\ChatGPT\\새로운 프로젝트 선정\\frame-location\\.local-data\\requests\\FR-20261103-976876\\runs\\1\\reference.jpg",
 "size": [
  4000,
  2252
 ],
 "orientation": 6,
 "upright_size": [
  2252,
  4000
 ],
 "make": "samsung",
 "model": "Galaxy S24",
 "software": "S921NKSSECZCH",
 "DateTimeOriginal": "2026:11:03 13:49:03",
 "OffsetTimeOriginal": "+09:00",
 "focal_35mm": 23,
 "fov_4x3_long_short": [
  73.9,
  58.9
 ],
 "gps_wgs84": [
  37.1926194,
  127.0277161
 ],
 "gps_gcj02": [
  37.1935235,
  127.0329618
 ],
 "altitude_m": 78.0
}
```
Metadata is an assumption (it can be edited, it can be stripped): check both GPS and time against the image.

## OCR text (second reader; pass=up/tile was only read after zooming, treat it as an assumption)

| Conf | Pass | Box (px) | Text |
|---|---|---|---|
| 0.91 | tile | [1945, 1892, 2006, 1911] | 34931413 |
| 0.89 | tile | [1100, 1886, 1150, 1904] | 17598634 |
| 0.84 | tile | [888, 2527, 1082, 2556] | IHZAH |
| 0.80 | tile | [1013, 2527, 1081, 2558] | MAH |
| 0.76 | tile | [1015, 2386, 1048, 2402] | AUMI |
| 0.75 | full | [713, 2520, 872, 2576] | WIH2WAH |
| 0.64 | tile | [1340, 1897, 1403, 1916] | Z90BD95 |
| 0.64 | tile | [617, 1842, 690, 1866] | 二口 |

Phone numbers, plates, proper names on road signs, issuing authorities: first `clues.py lookup`, then `board.py apply`.

## Reverse image search

- baidu: ok
- yandex: ok

### Similar images (Baidu; open the contact sheet first)

A near-duplicate photo is the fastest route to a location: the same object or scene has often been photographed by others and posted on Dianping, Douyin, Xiaohongshu, and the source page's shop name, scenic-area name or location tag gives the place directly. Open the contact sheet and compare each cell with the query image in the top-left corner on **fixed features** (shapes of structural parts, soot and damage, the mountains/buildings/bridges/pylons behind); merely the same kind of object doesn't count. For a near-duplicate: number i is `similar[i]` in that image's JSON, `from` is the source page, `site` is the site; look through the other images on the same source page too. For sources that need a login, don't log in and don't bypass verification; instead do a keyword search from image features + site type. Look at the original image's sheet first; look at the variants' sheets only if the original's has no near-duplicate.

- **reference**: 90 images (douyin.com 10, meipian.cn 6, xiaohongshu.com 5, baijiahao.baidu.com 5, club.autohome.com.cn 5, weibo.com 4, dianping.com 4, quanmin.baidu.com 3); contact sheet `rev/reference_baidu_similar.jpg` (first 24); source list in `similar` of `rev/reference_baidu.json`
- **full_flip**: 90 images (douyin.com 12, xiaohongshu.com 9, club.autohome.com.cn 6, baijiahao.baidu.com 5, meipian.cn 4, weibo.com 4, dianping.com 3, bilibili.com 3); contact sheet `rev/full_flip_baidu_similar.jpg` (first 24); source list in `similar` of `rev/full_flip_baidu.json`

### Tiered vote count (several variants from one engine naming the same city count as one vote; conflicting specific places don't cancel city votes)

- City level **seoul national university**: 1 votes (yandex)
- City level **seoul south korea**: 1 votes (yandex)
- City level **seoul korea**: 1 votes (yandex)
- Specific place **校园停车场**: 2 times (baidu/full_flip, baidu/reference) → `poi.py "校园停车场" --city <city> --region <cc>` to get coordinates; list every same-name place, then verify

### Each image, each engine

**full_flip / baidu** (screenshot `rev/full_flip_baidu.png`, always open it)
- Similar images: 90, contact sheet `rev/full_flip_baidu_similar.jpg` (see above)
- Tag: 图中可能是校园停车场

**full_flip / yandex** (screenshot `rev/full_flip_yandex.png`, always open it)
- Tag: Image appears to contain: seoul national university / seoul south korea / seoul korea / capital of south korea / город / Similar images / Show more similar images
- [upload.wikimedia.org] 5312×2988 — https://upload.wikimedia.org/wikipedia/commons/3/30/%EB%8C%80%EC%A0%84_ETRI_-_panoramio_%284%29.jpg
- [commons.wikimedia.org] File:대전 ETRI - panoramio (4).jpg - Wikimedia Commons — https://commons.wikimedia.org/wiki/File:%EB%8C%80%EC%A0%84_ETRI_-_panoramio_(4).jpg?utm_medium=organ
- [lh3.googleusercontent.com] 1000×562 — https://lh3.googleusercontent.com/p/AF1QipMBsYfoHBvuDdBXJSUCqf8lrNM2L0D1WA3Ww91W=s1600-w1000
- [readymap.kr] 조선온천호텔, +82 54-748-5858, Південна Корея Північна провінція Кьонсан Кьонджу 보덕동 보 — https://readymap.kr/uk/106020/3960?utm_medium=organic&utm_source=yandexsmartcamera
- [2pos.kr] 조선온천호텔, South Korea Gyeongsangbuk-do Gyeongju-si 보덕동 보문로 407 — https://2pos.kr/en/53010/1980?utm_medium=organic&utm_source=yandexsmartcamera
- [2pos.kr] 조선온천호텔, Südkorea Gyeongsangbuk-do Gyeongju 보덕동 보문로 407 — https://2pos.kr/de/53010/1980?utm_medium=organic&utm_source=yandexsmartcamera

**reference / baidu** (screenshot `rev/reference_baidu.png`, always open it)
- Similar images: 90, contact sheet `rev/reference_baidu_similar.jpg` (see above)
- Tag: 图中可能是校园停车场

**reference / yandex** (screenshot `rev/reference_yandex.png`, always open it)
- Tag: Image appears to contain: seoul national university / seoul south korea / seoul korea / capital of south korea / Similar images / Show more similar images / Sites
- [upload.wikimedia.org] 5312×2988 — https://upload.wikimedia.org/wikipedia/commons/3/30/%EB%8C%80%EC%A0%84_ETRI_-_panoramio_%284%29.jpg
- [commons.wikimedia.org] File:대전 ETRI - panoramio (4).jpg - Wikimedia Commons — https://commons.wikimedia.org/wiki/File:%EB%8C%80%EC%A0%84_ETRI_-_panoramio_(4).jpg?utm_medium=organ
- [upload.wikimedia.org] 5312×2988 — https://upload.wikimedia.org/wikipedia/commons/4/48/KT_%EA%B3%A0%EC%96%91_%EC%A7%80%EC%82%AC_%EC%A3%
- [commons.wikimedia.org] File:KT 고양 지사 주차장 - panoramio.jpg - Wikimedia Commons — https://commons.wikimedia.org/wiki/File:KT_%EA%B3%A0%EC%96%91_%EC%A7%80%EC%82%AC_%EC%A3%BC%EC%B0%A8%
- [upload.wikimedia.org] 4128×3096 — https://upload.wikimedia.org/wikipedia/commons/9/98/Ji-gwan_dorm.jpg
- [commons.wikimedia.org] File:Ji-gwan dorm.jpg - Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Ji-gwan_dorm.jpg?utm_medium=organic&utm_source=yandexsmartca
- [upload.wikimedia.org] 120×90 — https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Ji-gwan_dorm.jpg/120px-Ji-gwan_dorm.jpg
- [commons.wikimedia.org] Category:Sungkyunkwan University - Wikimedia Commons — https://commons.wikimedia.org/wiki/Category:Sungkyunkwan_University?oldformat=true&utm_medium=organi

## Output files

- Edge crops: `edges/` (8 images; look at the four edges and four corners one by one)
- Variants: `variants/` (3 images)
- OCR annotated image: `ocr.png`
- Image-search screenshots: `rev/` (4 images)
- Baidu similar-image contact sheets: `rev/*_baidu_similar.jpg` (2)

## Status

- exif: ok
- variants: ok
- edges: ok
- ocr: ok
- rev-yandex: ok
- rev-baidu: ok