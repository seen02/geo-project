# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///
from pathlib import Path
import json
p=Path(__file__).parent
s=json.loads((p/'control_spec.json').read_text())
b=json.loads((p/'bearing_fit.json').read_text())
s['points']=[q for q in s['points'] if not q['name'].startswith('C_')]
hotel=b['points'][-1].copy();hotel['h']=75.0
hotel['note']+=' Hotel rooftop elevation 75m is an assumption, not surveyed.'
s['points'].append(hotel)
s['fix']=['height'];s['init']['height']=4.5
s['init']['at']=b['camera_ll'];s['init']['heading']=b['heading_deg'];s['init']['hfov']=b['hfov_deg']
s['init']['pitch']=-6
(p/'full_spec.json').write_text(json.dumps(s,indent=2),encoding='utf-8')
