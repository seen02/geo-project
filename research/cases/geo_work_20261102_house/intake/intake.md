# Steps 0–3 report: query.jpg

Total time 8s; per step: exif 0.3s, variants 0.3s, edges 0.8s, ocr 8.4s

Next: record clues on board.py (`clue`), lookup clues with `apply`; list the candidates in full first (`children`), then rank.

## Metadata

No metadata (common for forwarded images, screenshots, rephotographed images). Raw output: `{"file": "C:\\Users\\admin\\img2place_project\\geo_work_20261102_house\\query.jpg", "size": [1440, 1080]}`

## OCR text (second reader; pass=up/tile was only read after zooming, treat it as an assumption)

| Conf | Pass | Box (px) | Text |
|---|---|---|---|
| 0.98 | full | [1, 813, 137, 855] | 14909569 |
| 0.57 | tile | [25, 751, 111, 790] | 公 |

Phone numbers, plates, proper names on road signs, issuing authorities: first `clues.py lookup`, then `board.py apply`.

## Reverse image search

Not done (--no-rev). This is not "searched, nothing found".
## Output files

- Edge crops: `edges/` (8 images; look at the four edges and four corners one by one)
- Variants: `variants/` (3 images)
- OCR annotated image: `ocr.png`



## Status

- exif: ok
- variants: ok
- edges: ok
- ocr: ok