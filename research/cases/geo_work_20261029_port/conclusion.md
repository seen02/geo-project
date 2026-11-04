# Photo geolocation result

Supported location: Yurikamome railway, Shibaura loop at the mainland end of Rainbow Bridge, Minato City, Tokyo, Japan.

Representative WGS84 coordinate: 35.6366,139.7574. Reporting radius: 300m, a conservative search extent, not a statistical confidence interval. The exact moving-train camera position has not been solved. Camera view is approximately south toward the port; travel direction and whether the front or rear window was used are unresolved.

Confidence: Tokyo high; Shibaura loop area high; railway segment high from the distinctive guideway and repeated permanent waterfront structures; exact point low.

## Evidence

- Intake: no EXIF location or time; OCR640 on guideway wall. Reverse search was disabled with --no-rev. No query photo was submitted to a reverse-search service.
- Keyword discovery followed by local comparison of eight public reference images. DINOv2/SIFT ranking in reference_final.json: reference07 first, global similarity0.7767,22 inliers from60 matched features. These are comparison metrics, not a probability of location.
- Public reference: https://jnsforum.s3.amazonaws.com/monthly_2025_01/IMG_7612.JPG.f19f617f95e39c4cc2bece9620dee164.JPG. Source page https://jnsforum.com/community/topic/20751-ed75s-random-japanese-trip-photos/page/3/ was intermittently403; the image itself was downloaded successfully.
- Independent georeferenced street panorama near35.63656,139.75763: same factory/conveyor group; see loop_view.jpg and actual_loop_match.json. Road camera is offset from train guideway.
- z18 satellite map: loop_detail.jpg and matching georeference JSON. Evidence panel generated with evidence.py evidence_spec.json --out evidence.jpg.
- Operator confirms the Rainbow Bridge/Shibaura loop route: https://www.yurikamome.co.jp/special/30th_anniversary/history/pageindices/index31.html.

## Limits and alternative candidates

Kobe Port Liner and Osaka New Tram were initial candidate systems. Sampled views and public reference photos did not reproduce the same permanent structures; these cities were down-weighted, not exhaustively excluded.

The wall marker640 is read but its numbering scheme is not verified and it was not used to calculate a distance. The left white waterfront structure matches visually but its facility name is not established. No capture date is inferred from the file name, posting date or sky color.

pose.py project was run with explicitly assumed camera altitude30m, HFOV70 and a rough distant-water row625. Projected quay points lack verified pixel correspondences, so this is only a diagnostic and does not establish a position, height or heading. The script's sanity horizon text uses the opposite pitch sign to its projection function; see pose_limits.txt. Fine pose remains unresolved. board.py check passed; K1 remains listed as unused even though K3 resolves its scene hypothesis.
