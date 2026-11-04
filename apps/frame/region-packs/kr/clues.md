# South Korea: starter clues

Version: 2026-11-03. This is a small, manually authored starter pack, not a complete Korean database. Use only after South Korea becomes a justified candidate. Korean writing alone does not establish the country. Keep the skill's evidence and precision rules.

## Address and place clues

### Road name plus building number on an address plate
- Look for: a legible road name and building number, plus any visible city, district or neighborhood; preserve the exact Hangul and digits from a crop.
- Points to: candidate street or building in South Korea when the complete address is matched in the official address search.
- Strength: medium for a partial address; strong for a complete official address plus matching physical building features.
- Counterexamples: the same road name can occur in different municipalities; a photographed business card or sign may advertise another branch; a partial OCR reading is a hypothesis. A building's official address is not the photographer's position.
- Sources: https://www.juso.go.kr/ ; https://juso.go.kr/addrlink/addrMobileLinkUrlSearch.do

### Same-name shops and landmarks
- Look for: exact business, temple, park or attraction names on signs, and any readable branch or locality qualifiers.
- Points to: a pool of named POI candidates; combine the name with the visible municipality before choosing a branch.
- Strength: medium; promote only after ground-level structure and surrounding layout match.
- Counterexamples: chain branches, repeated temple names, relocated shops, old signs and romanization variants. Do not infer a precise camera coordinate from a POI marker.
- Sources: https://apis.map.kakao.com/web/guide/ ; https://www.juso.go.kr/

## Ground-level verification

### Roadview position and foreground correspondence
- Look for: the same foreground roof, wall, railing, road bend or pole layout in public ground-level photographs; also compare distant landmarks.
- Points to: a candidate road segment or camera neighborhood, subject to coverage and viewpoint differences.
- Strength: medium for several invariant matches; exact footing needs independent geometric constraints as required by the core skill.
- Counterexamples: the nearest returned panorama is not necessarily at the query coordinate; acquisition year, season, occlusion and road-versus-footpath viewpoints vary. A working link or an image-search caption is not a verified visual match.
- Sources: https://apis.map.kakao.com/web/documentation/#RoadviewClient_getNearestPanoId ; https://apis.map.kakao.com/web/documentation/#Roadview_getPosition

### Missing Google imagery is a service limitation
- Look for: a failed or empty Google panorama lookup at a candidate in South Korea.
- Points to: a need to check another available source such as Kakao Roadview or public local photographs, not a conclusion about the location.
- Strength: weak as location evidence; this is a workflow clue only.
- Counterexamples: TLS failure, rate limiting, an unsupported endpoint, or no road coverage can all look like an empty result. If no browser or supported API is available, record that blocker; never claim to have inspected a view from its URL alone.
- Sources: https://apis.map.kakao.com/web/guide/ ; https://apis.map.kakao.com/web/documentation/#RoadviewClient

## Coordinates and orientation

### Latitude/longitude versus projected coordinates
- Look for: whether the source identifies WGS84 longitude/latitude, a map pixel or another projected coordinate system.
- Points to: the correct interpretation of a Korean map or POI candidate before it is used on the board or in an overlay.
- Strength: strong for interpreting a documented coordinate type; not independent evidence of the photo location.
- Counterexamples: Kakao LatLng uses latitude then longitude; some services return x as longitude and y as latitude. WCONGNAMUL, CONGNAMUL, WTM and TM must be converted, not relabeled as WGS84. Preserve the original coordinate and source.
- Sources: https://apis.map.kakao.com/web/documentation/#LatLng ; https://apis.map.kakao.com/web/documentation/#services_Geocoder_transCoord

### Camera heading versus panorama center
- Look for: the ground-level image's returned panorama position and viewpoint, and bearings to identified landmarks.
- Points to: a camera-heading hypothesis at a specific candidate location; report its basis separately from location uncertainty and horizontal field of view.
- Strength: medium until image/landmark geometry is checked; a source's viewpoint value alone is insufficient.
- Counterexamples: a panorama's default view, a map-link coordinate and a landmark marker may refer to different points. A radius in meters is not an angle. Exact tree position or camera footing can remain unresolved even when the road segment matches.
- Sources: https://apis.map.kakao.com/web/documentation/#Roadview_getViewpoint ; https://apis.map.kakao.com/web/documentation/#Roadview_getPosition
