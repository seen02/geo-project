# Steps 0–3 report: reference.jpg

Total time 13s; per step: exif 1.0s, variants 2.7s, edges 3.2s, ocr 13.4s

Next: record clues on board.py (`clue`), lookup clues with `apply`; list the candidates in full first (`children`), then rank.

## Metadata

No metadata (common for forwarded images, screenshots, rephotographed images). Raw output: `{"file": "C:\\Users\\admin\\Documents\\ChatGPT\\새로운 프로젝트 선정\\frame-location\\.local-data\\requests\\FR-20261102-5AB41A\\runs\\2\\reference.jpg", "size": [2000, 1333]}`

## OCR text (second reader; pass=up/tile was only read after zooming, treat it as an assumption)

No text read. Maybe there really is no text, or it's too small: zoom in by hand with imgprep.py zoom and look again

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