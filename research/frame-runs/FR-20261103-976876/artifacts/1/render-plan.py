import fitz,pathlib
p=fitz.open('campus-plans.pdf')
for i in [32,33]:
 p[i].get_pixmap(matrix=fitz.Matrix(1.5,1.5)).save(f'plan-floor-{i-31}.png')
 print(i,p[i].rect)
