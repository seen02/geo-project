# Steps 0–3 report: query.jpg

Total time 8s; per step: exif 0.2s, variants 0.3s, edges 0.7s, ocr 8.4s

Next: record clues on board.py (`clue`), lookup clues with `apply`; list the candidates in full first (`children`), then rank.

## Metadata

No metadata (common for forwarded images, screenshots, rephotographed images). Raw output: `{"file": "C:\\Users\\admin\\img2place_project\\geo_work_20261029_port\\query.jpg", "size": [1081, 1440]}`

## OCR text (second reader; pass=up/tile was only read after zooming, treat it as an assumption)

| Conf | Pass | Box (px) | Text |
|---|---|---|---|
| 0.99 | full | [511, 886, 530, 904] | 640 |

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