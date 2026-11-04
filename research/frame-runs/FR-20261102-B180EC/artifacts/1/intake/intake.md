# Steps 0–3 report: reference.jpg

Total time 223s; per step: exif 1.0s, variants 2.4s, edges 2.8s, ocr 11.1s, rev-yandex 51.7s, rev-baidu 211.5s

Next: record clues on board.py (`clue`), lookup clues with `apply`; list the candidates in full first (`children`), then rank.

## Metadata

No metadata (common for forwarded images, screenshots, rephotographed images). Raw output: `{"file": "C:\\Users\\admin\\Documents\\ChatGPT\\새로운 프로젝트 선정\\frame-location\\.local-data\\requests\\FR-20261102-B180EC\\runs\\1\\reference.jpg", "size": [1440, 810]}`

## OCR text (second reader; pass=up/tile was only read after zooming, treat it as an assumption)

No text read. Maybe there really is no text, or it's too small: zoom in by hand with imgprep.py zoom and look again

## Reverse image search

- baidu: ok
- yandex: ok
- Items the engine refused or failed (not the same as nothing found): full_flip/baidu: Page.goto: Timeout 60000ms exceeded.
Call log:
  - navigating to "https://graph.baidu.com/pcpage/index?tpl_from=pc", waiting until "domcontentloaded"
, full_gray/baidu: Page.goto: Timeout 60000ms exceeded.
Call log:
  - navigating to "https://graph.baidu.com/pcpage/index?tpl_from=pc", waiting until "domcontentloaded"


### Similar images (Baidu; open the contact sheet first)

A near-duplicate photo is the fastest route to a location: the same object or scene has often been photographed by others and posted on Dianping, Douyin, Xiaohongshu, and the source page's shop name, scenic-area name or location tag gives the place directly. Open the contact sheet and compare each cell with the query image in the top-left corner on **fixed features** (shapes of structural parts, soot and damage, the mountains/buildings/bridges/pylons behind); merely the same kind of object doesn't count. For a near-duplicate: number i is `similar[i]` in that image's JSON, `from` is the source page, `site` is the site; look through the other images on the same source page too. For sources that need a login, don't log in and don't bypass verification; instead do a keyword search from image features + site type. Look at the original image's sheet first; look at the variants' sheets only if the original's has no near-duplicate.

- **reference**: 90 images (meipian.cn 34, xiaohongshu.com 15, dianping.com 8, mbd.baidu.com 7, douyin.com 7, mafengwo.cn 3, weibo.com 2, baijiahao.baidu.com 2); contact sheet `rev/reference_baidu_similar.jpg` (first 24); source list in `similar` of `rev/reference_baidu.json`
- **full_flip**: Baidu error (Page.goto: Timeout 60000ms exceeded.
Call log:
  - navigating to "https://graph.), no similar images captured; doesn't count as searched with nothing found
- **full_gray**: Baidu error (Page.goto: Timeout 60000ms exceeded.
Call log:
  - navigating to "https://graph.), no similar images captured; doesn't count as searched with nothing found
- **full_wb**: 90 images (meipian.cn 37, xiaohongshu.com 11, dianping.com 9, douyin.com 9, mafengwo.cn 5, mbd.baidu.com 4, weibo.com 3, tuchong.com 2); contact sheet `rev/full_wb_baidu_similar.jpg` (first 24); source list in `similar` of `rev/full_wb_baidu.json`

### Tiered vote count (several variants from one engine naming the same city count as one vote; conflicting specific places don't cancel city votes)

- City level **south korea seoul**: 1 votes (yandex)
- City level **seoul south korea**: 1 votes (yandex)
- Specific place level: none

### Each image, each engine

**full_flip / baidu** (screenshot `rev/full_flip_baidu.png`, always open it)

**full_flip / yandex** (screenshot `rev/full_flip_yandex.png`, always open it)
- Tag: Image appears to contain: south korea seoul / capital of south korea / in south korea / в сеуле / cherry blossom / Similar images / Show more similar images
- [ru.wikipedia.org] ru.wikipedia.org — https://ru.wikipedia.org/wiki/%D0%A1%D0%B5%D1%83%D0%BB?utm_medium=organic&utm_source=yandexsmartcame
- [i.liveinmidwest.com] 695×391 — https://i.liveinmidwest.com/images/002/image-4337-5-j.webp
- [no.liveinmidwest.com] One Week in South Korea: The Ultimate Itinerary - Asia — https://no.liveinmidwest.com/17617169-one-week-in-south-korea-the-ultimate-itinerary?utm_medium=orga
- [media.gettyimages.com] 612×344 — https://media.gettyimages.com/photos/view-of-tree-with-buildings-in-background-picture-id1189502368?
- [www.gettyimages.com] Cherry Blossom Korea Photos and Premium High Res Pictures - Getty Images — https://www.gettyimages.com/photos/cherry-blossom-korea?assettype=image&license=rf&alloweduse=availa
- [ru.liveinmidwest.com] Одна неделя в Южной Корее: лучший маршрут - Азия — https://ru.liveinmidwest.com/17617169-one-week-in-south-korea-the-ultimate-itinerary?utm_medium=orga
- [blogger.googleusercontent.com] 1600×1092 — https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiEgEsaOlXszEqNgTPJk-6EO2gP2OgcFiac_erP16Z
- [sofyandkorea.blogspot.com] Моя корейская авантюра: Цветение вишни в Сеуле — https://sofyandkorea.blogspot.com/2016/04/blog-post.html?m=1&utm_medium=organic&utm_source=yandexsma

**full_gray / baidu** (screenshot `rev/full_gray_baidu.png`, always open it)

**full_gray / yandex** (screenshot `rev/full_gray_yandex.png`, always open it)
- Tag: Image appears to contain: capital of south korea / cherry blossom / парк / цветение вишни / сеул южная корея сакура / Similar images / Show more similar images
- [ru.wikipedia.org] ru.wikipedia.org — https://ru.wikipedia.org/wiki/%D0%A1%D0%B5%D1%83%D0%BB?utm_medium=organic&utm_source=yandexsmartcame
- [blogger.googleusercontent.com] 1600×1092 — https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiEgEsaOlXszEqNgTPJk-6EO2gP2OgcFiac_erP16Z
- [sofyandkorea.blogspot.com] Моя корейская авантюра: Цветение вишни в Сеуле — https://sofyandkorea.blogspot.com/2016/04/blog-post.html?m=1&utm_medium=organic&utm_source=yandexsma
- [upload.wikimedia.org] 4627×3085 — https://upload.wikimedia.org/wikipedia/commons/8/82/Cherry_Blossom_in_Yeouido_Park_-_panoramio_%283%
- [commons.wikimedia.org] File:Cherry Blossom in Yeouido Park - panoramio (3).jpg - Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Cherry_Blossom_in_Yeouido_Park_-_panoramio_(3).jpg?utm_mediu
- [myongjiblog.wordpress.com] 639×359 — https://myongjiblog.wordpress.com/wp-content/uploads/2016/05/kakaotalk_20160421_100630474.jpg
- [myongjiblog.wordpress.com] Türkçe (Turkish) - What Awaits you at Myongji — https://myongjiblog.wordpress.com/category/turkce-turkish/?utm_medium=organic&utm_source=yandexsmart
- [myongjiblog.wordpress.com] 960×540 — https://myongjiblog.wordpress.com/wp-content/uploads/2016/04/kakaotalk_20160421_100630474.jpg

**full_wb / baidu** (screenshot `rev/full_wb_baidu.png`, always open it)
- Similar images: 90, contact sheet `rev/full_wb_baidu_similar.jpg` (see above)
- Tag: 图中可能是樱花
- [www.douyin.com] 大孤山，一座孤独的山… - 抖音 — http://www.douyin.com/note/7503169506500807963

**full_wb / yandex** (screenshot `rev/full_wb_yandex.png`, always open it)
- Tag: Image appears to contain: seoul south korea / сеул южная корея / в сеуле / парк / сеул южная корея сакура / Similar images / Show more similar images
- [ru.wikipedia.org] ru.wikipedia.org — https://ru.wikipedia.org/wiki/%D0%A1%D0%B5%D1%83%D0%BB?utm_medium=organic&utm_source=yandexsmartcame
- [i.liveinmidwest.com] 695×391 — https://i.liveinmidwest.com/images/002/image-4337-5-j.webp
- [no.liveinmidwest.com] One Week in South Korea: The Ultimate Itinerary - Asia — https://no.liveinmidwest.com/17617169-one-week-in-south-korea-the-ultimate-itinerary?utm_medium=orga
- [media.gettyimages.com] 612×344 — https://media.gettyimages.com/photos/view-of-tree-with-buildings-in-background-picture-id1189502368?
- [www.gettyimages.com] Cherry Blossom Korea Photos and Premium High Res Pictures - Getty Images — https://www.gettyimages.com/photos/cherry-blossom-korea?assettype=image&license=rf&alloweduse=availa
- [ru.liveinmidwest.com] Одна неделя в Южной Корее: лучший маршрут - Азия — https://ru.liveinmidwest.com/17617169-one-week-in-south-korea-the-ultimate-itinerary?utm_medium=orga
- [blogger.googleusercontent.com] 1600×1092 — https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiEgEsaOlXszEqNgTPJk-6EO2gP2OgcFiac_erP16Z
- [sofyandkorea.blogspot.com] Моя корейская авантюра: Цветение вишни в Сеуле — https://sofyandkorea.blogspot.com/2016/04/blog-post.html?m=1&utm_medium=organic&utm_source=yandexsma

**reference / baidu** (screenshot `rev/reference_baidu.png`, always open it)
- Similar images: 90, contact sheet `rev/reference_baidu_similar.jpg` (see above)
- Tag: 图中可能是樱花
- [www.douyin.com] 大孤山，一座孤独的山… - 抖音 — http://www.douyin.com/note/7503169506500807963

**reference / yandex** (screenshot `rev/reference_yandex.png`, always open it)
- Tag: Image appears to contain: south korea seoul / capital of south korea / парк / cherry blossom / in south korea / Similar images / Show more similar images
- [ru.wikipedia.org] ru.wikipedia.org — https://ru.wikipedia.org/wiki/%D0%A1%D0%B5%D1%83%D0%BB?utm_medium=organic&utm_source=yandexsmartcame
- [i.liveinmidwest.com] 695×391 — https://i.liveinmidwest.com/images/002/image-4337-5-j.webp
- [no.liveinmidwest.com] One Week in South Korea: The Ultimate Itinerary - Asia — https://no.liveinmidwest.com/17617169-one-week-in-south-korea-the-ultimate-itinerary?utm_medium=orga
- [media.gettyimages.com] 612×344 — https://media.gettyimages.com/photos/view-of-tree-with-buildings-in-background-picture-id1189502368?
- [www.gettyimages.com] Cherry Blossom Korea Photos and Premium High Res Pictures - Getty Images — https://www.gettyimages.com/photos/cherry-blossom-korea?assettype=image&license=rf&alloweduse=availa
- [ru.liveinmidwest.com] Одна неделя в Южной Корее: лучший маршрут - Азия — https://ru.liveinmidwest.com/17617169-one-week-in-south-korea-the-ultimate-itinerary?utm_medium=orga
- [blogger.googleusercontent.com] 1600×1092 — https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiEgEsaOlXszEqNgTPJk-6EO2gP2OgcFiac_erP16Z
- [sofyandkorea.blogspot.com] Моя корейская авантюра: Цветение вишни в Сеуле — https://sofyandkorea.blogspot.com/2016/04/blog-post.html?m=1&utm_medium=organic&utm_source=yandexsma

## Output files

- Edge crops: `edges/` (8 images; look at the four edges and four corners one by one)
- Variants: `variants/` (3 images)
- OCR annotated image: `ocr.png`
- Image-search screenshots: `rev/` (6 images)
- Baidu similar-image contact sheets: `rev/*_baidu_similar.jpg` (2)

## Status

- exif: ok
- variants: ok
- edges: ok
- ocr: ok
- rev-yandex: ok
- rev-baidu: ok