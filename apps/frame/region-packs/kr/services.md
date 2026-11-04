# KR services and limits

Checked: 2026-11-03. These are source-selection notes, not newly implemented adapters.

## Address and POI

- Official address search: https://www.juso.go.kr/ . Read the complete address and verify surrounding geometry. Public entry: https://juso.go.kr/addrlink/addrMobileLinkUrlSearch.do .
- Existing core POI tool: `uv run <skill>/scripts/poi.py "<exact Korean name>" --region kr --out pois.json`. This selects the existing OSM source and KR country filter. It does not call Kakao/Naver APIs. Read `--help` before adding other arguments. Missing OSM entries do not exclude a real place.
- Prefer Hangul names and retain locality/branch qualifiers. OSM names can also be found under name:ko or name:en.

## Public Kakao links

Official reference: https://apis.map.kakao.com/web/guide/ .

- Place search: `https://map.kakao.com/link/search/<URL-encoded query>`
- Roadview near a justified coordinate: `https://map.kakao.com/link/roadview/<latitude>,<longitude>`

Example coordinates in documentation are API examples, never evidence for a user's photo. A browser link does not guarantee a panorama exists or grant an automation tool browser access. Record the actually inspected image's position, date if available, source URL and comparison features. Roadview's nearest panorama can differ from the requested point.

## Existing street-view script

`gsv.py` remains the available Google adapter. It is not a Kakao Roadview downloader. If it fails, distinguish no coverage from network/HTTP/parser failures. Use available public ground-level references and record the unavailable route. Do not invent `kakao.py`, `net.py` or other nonexistent tools.

Kakao's official JavaScript SDK requires an application key and registered domains. This pack does not create credentials, inject an SDK, bypass service restrictions, or add a bulk-image collection service. SDK/API integration is separate implementation work.

## Network and output checks

Keep the original workflow's network diagnostics. A region pack cannot repair Windows Schannel/TLS failures or model-capacity failures. Require nonempty decodable downloads and inspect satellite metadata's failed_tiles before treating a mosaic as usable. A failed Google/curl request is not proof that the candidate is wrong.

## Provenance

Text is newly authored for this project and may be reused under CC0-1.0. Source sites, maps, photos and service terms retain their own rights. Links were checked as documentation references; no external photo dataset is bundled. This starter pack contains no numeric phone-prefix, license-plate or administrative-boundary lookup table.
