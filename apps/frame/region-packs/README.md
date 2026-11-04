# Local geo-sleuth region extensions

`kr/` is a starter South Korea pack using geo-sleuth's documented region-pack contract. FRAME adds this directory to `GEO_SLEUTH_REGIONS` for child processes. The installed global skill remains unchanged. Existing externally configured pack directories are retained and can override this local pack.

Pack contents: region.json (manifest), clues.md (six evidence-aware clues), services.md (source selection, public roadview links and limits). This is data/documentation, not model training or a new map API integration.

For a separate PowerShell session, set:

```powershell
$env:GEO_SLEUTH_REGIONS='C:\Users\admin\Documents\ChatGPT\새로운 프로젝트 선정\frame-location\region-packs'
uv run 'C:\Users\admin\.codex\skills\geo-sleuth\scripts\regions.py' lint kr
uv run 'C:\Users\admin\.codex\skills\geo-sleuth\scripts\regions.py' show kr
```

Use the actual skill directory if yours differs. No photos, model calls or network access are needed for these pack checks. In FRAME's worker environment, both `regions.py show kr` and `regions.py show 대한민국` resolve this pack.
