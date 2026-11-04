# Steps 0–3 report: test_sol_3.jpg

Total time 11s; per step: exif 0.9s, variants 2.0s, edges 2.4s, ocr 10.5s

Next: record clues on board.py (`clue`), lookup clues with `apply`; list the candidates in full first (`children`), then rank.

## Metadata

No metadata (common for forwarded images, screenshots, rephotographed images). Raw output: `{"file": "C:\\Users\\admin\\img2place_project\\geo_slueth_test\\terrain_test_images\\test_sol_3.jpg", "size": [1440, 810]}`

## OCR text (second reader; pass=up/tile was only read after zooming, treat it as an assumption)

| Conf | Pass | Box (px) | Text |
|---|---|---|---|
| 0.58 | tile | [449, 227, 555, 260] | mihl |

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