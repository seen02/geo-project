# Unresolved photo geolocation

Supported country: South Korea (high visual confidence from Hangul vehicle registration and infrastructure). No city, district, address or camera coordinate has been established. No defensible coordinate/error radius or heading is available.

The user states that they own the house and that this is a location-estimation test. Investigation proceeded on that basis. Reverse image search was disabled throughout; no query image was uploaded to a search service. Only keyword searches and local comparisons of downloaded public photos were used.

## Actual checks

- intake.py query.jpg --out-dir intake --no-rev: no GPS or other EXIF metadata; OCR found registration-number digits. Vehicle identity was not investigated.
- Reviewed every edge/corner crop. Enlarged building, right vegetation, blue wall plate and right edge strip. The potentially useful blue plate is largely covered by a person; no road name or building number can be read reliably.
- Brown standing-seam roofs and dark timber/siding walls, a deck, sculpted multi-stem pine, yellow-green garden trees, pale blue metal fence, gravel court and wooded slopes are visible. These are common enough that they do not fix a region.
- Loquat is a vegetation hypothesis, not verified species identification. It does not establish a southern-coastal location.
- Keyword searches for cabin/gravel/pine landscaping and loquat-related accommodation produced public reference properties. No reverse image search was used.
- Downloaded five mostly night-scene photos and eight small site icons from an initial lodging page; these were not useful building references. The first numerical ranking therefore has little geographic value.
- Subsequently downloaded eight public exterior photos and ran match.py rank --query query.jpg --images exteriors --refine sift --top8 --out exterior_match.json --sheet exterior_match.jpg. All eight were visually checked after ranking. None matched the roof, facade, openings/deck and pine arrangement. Scores alone were not used to exclude any city or region.
- No streetview or satellite sweep was justified because no verified search region or named anchor emerged. No country-wide scan was performed. A coordinate was not invented to satisfy the output format.

## Missing discriminating information

One coarse geographic hint (province/city), an unoccluded address plate/road sign, a view of the approach road, or an original file retaining GPS would materially change the search. The current result is unresolved beyond country. A map/evidence heading wedge is omitted because a camera location is not established.
