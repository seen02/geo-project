# Steps 0–3 report: KakaoTalk_20261028_142436521_01.jpg

Total time 18s; per step: exif 0.3s, variants 0.3s, edges 0.7s, ocr 6.4s, rev-baidu 5.9s, rev-yandex 11.2s

**Result: partial.** Failed: rev-baidu, rev-yandex (reasons under Status); the other steps' outputs below are usable.

Next: record clues on board.py (`clue`), lookup clues with `apply`; list the candidates in full first (`children`), then rank.

## Metadata

No metadata (common for forwarded images, screenshots, rephotographed images). Raw output: `{"file": "C:\\Users\\admin\\img2place_project\\geo_slueth_test\\terrain_test_images\\KakaoTalk_20261028_142436521_01.jpg", "size": [1440, 810]}`

## OCR text (second reader; pass=up/tile was only read after zooming, treat it as an assumption)

No text read. Maybe there really is no text, or it's too small: zoom in by hand with imgprep.py zoom and look again

## Reverse image search

- baidu: failed: r: Request failed after 3 retries in 5.7s
  cause: Failed to fetch: https://pypi.org/simple/pillow-heif/
  cause: error sending request for url (https://pypi.org/simple/pillow-heif/)
  cause: client error (Connect)
  cause: tcp connect error
  cause: 액세스 권한에 의해 숨겨진 소켓에 액세스를 시도했습니다. (os error 10013)
- yandex: failed: ror: Request failed after 3 retries in 5.3s
  cause: Failed to fetch: https://pypi.org/simple/playwright/
  cause: error sending request for url (https://pypi.org/simple/playwright/)
  cause: client error (Connect)
  cause: tcp connect error
  cause: 액세스 권한에 의해 숨겨진 소켓에 액세스를 시도했습니다. (os error 10013)

### Tiered vote count (several variants from one engine naming the same city count as one vote; conflicting specific places don't cancel city votes)

- City level: none
- Specific place level: none

### Each image, each engine

## Output files

- Edge crops: `edges/` (8 images; look at the four edges and four corners one by one)
- Variants: `variants/` (3 images)
- OCR annotated image: `ocr.png`
- Image-search screenshots: `rev/` (0 images)
- Baidu similar-image contact sheets: `rev/*_baidu_similar.jpg` (0)

## Status

- exif: ok
- variants: ok
- edges: ok
- ocr: ok
- rev-baidu: failed: r: Request failed after 3 retries in 5.7s
  cause: Failed to fetch: https://pypi.org/simple/pillow-heif/
  cause: error sending request for url (https://pypi.org/simple/pillow-heif/)
  cause: client error (Connect)
  cause: tcp connect error
  cause: 액세스 권한에 의해 숨겨진 소켓에 액세스를 시도했습니다. (os error 10013)
- rev-yandex: failed: ror: Request failed after 3 retries in 5.3s
  cause: Failed to fetch: https://pypi.org/simple/playwright/
  cause: error sending request for url (https://pypi.org/simple/playwright/)
  cause: client error (Connect)
  cause: tcp connect error
  cause: 액세스 권한에 의해 숨겨진 소켓에 액세스를 시도했습니다. (os error 10013)