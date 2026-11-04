import json,pathlib,math
s=json.loads(pathlib.Path('evidence-spec.json').read_text(encoding='utf-8'))
s['labels']=[{'at':[37.1926194,127.0277161],'text':'Estimate: radius 35 m','dx':-150,'dy':110},{'at':[37.1927387,127.0273697],'text':'Jangjunha Hall (18)','dx':-330,'dy':-120},{'at':[37.1927944,127.0280188],'text':'Crossing','dx':90,'dy':-45}]
s['panels'][0]['caption']='Original / satellite layout (Google, z19)'
s['panels'][1]['caption']='Original / official exterior (Hanshin University)'
pathlib.Path('evidence-spec.json').write_text(json.dumps(s,indent=2),encoding='utf-8')
x=json.loads(pathlib.Path('verification-log.json').read_text(encoding='utf-8'))
x['geometry']['rejection_reason']='At hfov 45.8, portrait vfov is about 73.7 deg. Fitted pitch -58.1 deg points even top ray below horizontal, conflicting with extensive sky in reference. Do not use fitted height or radius.'
x['geometry']['pose_sanity_note']='Tool sanity horizon sign formula differs from its projection convention; rejection uses actual optical axis/top-ray geometry, not its printed horizon row.'
pathlib.Path('verification-log.json').write_text(json.dumps(x,ensure_ascii=False,indent=2),encoding='utf-8')
