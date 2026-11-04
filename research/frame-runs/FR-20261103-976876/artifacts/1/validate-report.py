import json,jsonschema,pathlib
jsonschema.validate(json.loads(pathlib.Path('report-draft.json').read_text(encoding='utf-8')),json.loads(pathlib.Path('report.schema.json').read_text(encoding='utf-8')))
print('Schema validation passed')
