import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {Presentation,PresentationFile} from '@oai/artifact-tool';

const ROOT='C:/Users/admin/img2place_project';
const BUILD=path.join(ROOT,'ppt_build_20261029');
const TEST=path.join(ROOT,'geo_work_20261028_01');
const SKILL='C:/Users/admin/.codex/plugins/cache/openai-primary-runtime/presentations/26.1025.11240/skills/presentations';
const PHOTO=path.join(ROOT,'geo_slueth_test/terrain_test_images/test_astra_1.jpg');
const metrics=JSON.parse(await fs.readFile(path.join(BUILD,'test_metrics.json'),'utf8'));
const COPY=JSON.parse(await fs.readFile(path.join(BUILD,'korean_copy.json'),'utf8'));
const textCounters=[];
const C={orange:'#FF6F0F',ink:'#212124',gray:'#666B73',line:'#EAEBEE',soft:'#F7F8FA',warm:'#FFF5F0',white:'#FFFFFF',green:'#28725D'};
const P=Presentation.create({slideSize:{width:1280,height:720}});
P.theme.defaultFont='Pretendard';
P.theme.colorScheme={name:'Karrot editorial',themeColors:{accent1:C.orange,accent2:C.ink,accent3:C.gray,accent4:C.green,accent5:'#926447',accent6:'#A6ACB5',bg1:C.white,bg2:C.soft,tx1:C.ink,tx2:C.gray,dk1:'#000000',dk2:C.ink,lt1:C.white,lt2:C.soft,hlink:C.orange,folHlink:'#926447'}};
const contentLog=[];
function txt(s,t,x,y,w,h,size=26,bold=false,color=C.ink,align='left',raw=false){
 if(!raw){const i=P.slides.items.length-1;const j=textCounters[i]||0;t=COPY[i].texts[j];if(t===undefined)throw Error(`Missing text ${i+1}:${j}`);textCounters[i]=j+1;}
 const q=s.shapes.add({geometry:'textbox',name:t.slice(0,48),position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 q.text=t;q.text.style={fontSize:size,typeface:'Pretendard',bold,color,alignment:align,verticalAlignment:'top',autoFit:'none',wrap:'square',insets:0};return q;
}
function box(s,x,y,w,h,fill=C.soft,line='none'){return s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:line,width:line==='none'?0:1}});}
function rule(s,x,y,w,color=C.line){return box(s,x,y,w,1,color);}
function arrow(s,x,y,w=46,color=C.orange){return s.shapes.add({geometry:'rightArrow',position:{left:x,top:y,width:w,height:14},fill:color,line:{fill:'none',width:0}});}
function add(title,sub='',kind='current',sources=[]){
 const s=P.slides.add();s.background.fill=C.white;const n=P.slides.items.length;
 txt(s,title,62,45,1150,62,40,true);
 if(sub)txt(s,sub,64,115,1148,56,23,false,C.gray);
 txt(s,String(n).padStart(2,'0'),1176,682,42,21,14,false,C.gray,'right',true);
 if(kind==='proposal')txt(s,'발전 제안',1080,20,136,22,15,true,C.orange,'right');
 if(kind==='appendix')txt(s,'기술 부록',1080,20,136,22,15,true,C.orange,'right');
 s.speakerNotes.text=sources.map(z=>'출처: '+z).join('\n');
 contentLog.push({slide:n,title:COPY[n-1].texts[0],sub:COPY[n-1].texts[1],kind,sources});return s;
}
function bottom(s,t,color=C.ink){rule(s,64,633,1150);txt(s,t,64,650,1110,38,23,true,color);}
function label(s,t,x,y,w=310){txt(s,t,x,y,w,28,19,true,C.orange);}
function lines(s,items,x,y,w=340,size=25,gap=90){items.forEach((t,i)=>txt(s,t,x,y+i*gap,w,gap-14,size,false));}
async function img(s,file,x,y,w,h,alt,crop){const b=await fs.readFile(file);return s.images.add({blob:new Uint8Array(b),contentType:/\.png$/i.test(file)?'image/png':'image/jpeg',alt,fit:'contain',position:{left:x,top:y,width:w,height:h},...(crop?{crop}:{} )});}
function table(s,heads,rows,x=64,y=190,widths=[260,440,450],height=380,size=23){
 const values=COPY[P.slides.items.length-1].table,w=widths.reduce((a,b)=>a+b,0);
 const t=s.tables.add({rows:values.length,columns:heads.length,left:x,top:y,width:w,height,columnWidths:widths,values});
 t.borders.assign({fill:C.line,width:0.8,style:'solid'});
 for(let r=0;r<values.length;r++){
  t.rows[r].height=r===0?48:(height-48)/(values.length-1);
  for(let c=0;c<heads.length;c++){
   const cell=t.getCell(r,c);cell.fill=r===0?C.soft:C.white;
   cell.text.style={fontSize:r===0?size-1:size,typeface:'Pretendard',bold:r===0,color:C.ink,verticalAlignment:'middle',alignment:'left',wrap:'square',insets:{left:12,right:12,top:9,bottom:9}};
  }
 }return t;
}
function io(s,input,process,output,opts={}){
 const y=opts.y||205;const cols=[64,473,882],w=334;
 ['INPUT  입력','PROCESS  처리','OUTPUT  출력'].forEach((t,i)=>label(s,t,cols[i],y));
 [input,process,output].forEach((t,i)=>txt(s,t,cols[i],y+47,w,245,opts.size||25,false));
 arrow(s,419,y+125,34);arrow(s,828,y+125,34);
}
const GH='https://github.com/Oldcircle/geo-sleuth';
const script=f=>GH+'/blob/main/skills/geo-sleuth/scripts/'+f;
const report=path.join(TEST,'report.md');

// 01 Introduction with a real input image.
{
 const s=add('geo-sleuth 소개와 활용 방향','사진의 단서를 지도·지형·거리사진과 대조하는 위치 조사 스킬','current',[GH,report,PHOTO]);
 txt(s,'사진 한 장에서\n장소 후보를 좁히고\n근거까지 남깁니다',64,225,470,190,43,true);
 txt(s,'핵심 설명\n처리 단계별 입력과 출력\n실제 테스트와 발전 방향',67,470,440,125,25,false,C.gray);
 await img(s,PHOTO,573,210,641,361,'실제 테스트 입력 사진, 벚꽃과 동탄 방향 조망');
 txt(s,'2026.10.29  /  실제 테스트 2026.10.28',64,650,1050,30,18,false,C.gray);
}
// 02 End-to-end interface.
{
 const s=add('입력은 사진, 출력은 근거가 있는 위치 정보','사용자가 주는 정보와 스킬이 만들어 내는 결과를 먼저 구분합니다','current',[GH+'/blob/main/skills/geo-sleuth/SKILL.md']);
 io(s,'사진 파일\n선택: 국가·지역 힌트\n선택: 촬영 시각·예산\n\nGPS가 없어도 시작 가능','단서 추출\n후보 생성·순위화\n지도·이미지·기하 검증\n\n외부 자료의 좌표와 연결','장소·WGS84 좌표\n촬영 방향·오차 반경\n수준별 신뢰도\n증거 이미지·대안 후보');
 bottom(s,'같은 장소라는 근거와 촬영점의 정밀도를 함께 확인합니다');
}
// 03 Pipeline overview.
{
 const s=add('전체 처리 흐름과 단계별 산출물','사진에 따라 일부 단계를 건너뛰거나 후보 탐색으로 돌아갑니다','current',[GH+'/blob/main/skills/geo-sleuth/SKILL.md']);
 const stages=[['01','사진 정리','exif.json\n확대·분할 이미지'],['02','단서 기록','ocr.json\nclues·검색 결과'],['03','후보 생성','pois.json\n후보 좌표·GeoJSON'],['04','후보 관리','board.json\n순위·다음 행동'],['05','경로별 비교','지형 오차\n위성·거리사진 순위'],['06','위치 검증','투영 오차\n위치·방향·반경'],['07','결과 보고','result.json\nevidence.jpg']];
 stages.forEach((v,i)=>{const row=i<4?0:1,j=i<4?i:i-4,x=64+j*294,y=200+row*208;
  txt(s,v[0],x,y,50,38,26,true,C.orange);txt(s,v[1],x,y+45,255,40,28,true);txt(s,v[2],x,y+95,255,68,21,false,C.gray);
  if((row===0&&j<3)||(row===1&&j<2))arrow(s,x+246,y+64,30);
 });
 box(s,1216,364,1.3,24,C.line);box(s,52,388,1165,1.3,C.line);box(s,52,388,1.3,88,C.line);arrow(s,52,469,12,C.orange);
 txt(s,'比較結果で候補を更新',950,452,245,40,22,true,C.orange);
 txt(s,'不一致なら前の段階へ戻る',950,497,245,65,21,false,C.gray);
 bottom(s,'処理の途中結果を保存し、どの根拠で絞ったかを追跡します');
}
// 04 Responsibilities.
{
 const s=add('AIとスクリプトが役割を分担します','AIの解釈と、実際のデータ取得・数値計算を分けて扱います','current',[GH+'/blob/main/skills/geo-sleuth/SKILL.md']);
 table(s,['役割','受け取る情報','行うこと・返すもの'],[
 ['AIエージェント','写真、上位候補の画像\n各ツールの計算結果','物体や環境を解釈\n仮説・検索条件・照合判断を作る'],
 ['Pythonスクリプト','座標、領域、画像、測定値\nAIが選んだ条件','検索・幾何計算・画像順位付け\nJSONと比較画像を保存'],
 ['外部データ','地名、範囲、候補地点','座標付きの地図・標高・画像\n写真の内容を現実の場所に結ぶ']
 ],64,198,[225,440,485],365,25);
 bottom(s,'画像の印象だけで確定せず、外部資料と計算結果で確認します');
}
// 05 Intake.
{
 const s=add('① 写真を整え、基本情報を読みます','intake.py が初期調査をまとめて実行し、次の段階へ渡します','current',[script('intake.py'),script('exif.py'),script('ocr.py'),path.join(TEST,'intake/intake.md')]);
 io(s,'photo.jpg\n画像の画素・EXIF\n\n指定例\n--out-dir intake/\n--no-rev で逆検索を省略','EXIF・画像回転を確認\n四辺・四隅を切り出す\n全体・拡大・分割でOCR\n許可時に外部逆画像検索','exif.json\nocr.json / ocr.png\nedges/ / variants/\nrev/ の検索結果\nintake.md / intake.json',{size:24});
 bottom(s,'テストではGPSなし・OCR文字なし。逆画像検索は利用できませんでした');
}
// 06 Clues.
{
 const s=add('② 観察を検索可能な単位で記録します','見えた事実、読めた文字、推測、計算で確認した結果を区別します','current',[script('board.py'),script('ocr.py'),report]);
 table(s,['INPUT  写真の情報','PROCESS  解釈・照合','OUTPUT  単位化した手がかり'],[
 ['中央に4本の高層建物','輪郭と高さの順序を比較','observed: 4本の塔\n仮説: 動画・公開写真で施設名を確認'],
 ['塔の右側に緑色の網','施設種別を仮定して地図へ','inferred: ゴルフ練習場の可能性\n後続の座標・視線比較へ渡す'],
 ['OCRで文字を検出できない','読めない状態をそのまま記録','ocr.json の items: []\n文字以外の調査経路へ進む']
 ],64,195,[355,330,465],360,23);
 bottom(s,'board.json に手がかりの種類・根拠ファイル・状態を保存します');
}
// 07 Candidates.
{
 const s=add('③ 地名と施設条件から候補を作ります','地名検索と地図の空間検索で、画像の特徴を座標の集合に変換します','current',[script('poi.py'),script('osm.py'),script('gazetteer.py')]);
 io(s,'地名・施設名\n候補の地域境界 bbox\n施設条件と位置関係\n\n例: 鉄道橋の近くに送電線','poi.py: 地名を座標へ\nosm.py: OSM属性検索\n近接・交差・沿線を探索\ngazetteer.py: 行政区域列挙','候補ID / 名前\nWGS84 の緯度・経度\n検索範囲 bbox\n道路・建物のGeoJSON',{size:24});
 box(s,64,535,1150,58,C.warm);txt(s,'bbox = 南・西・北・東の境界値。GeoJSONの座標配列は経度・緯度の順です',80,550,1115,34,21,false);
 bottom(s,'地図に載っていない施設は検索できないため、空の結果だけで除外しません');
}
// 08 Board.
{
 const s=add('④ 候補の証拠を更新し、次の行動を選びます','board.py が候補・手がかり・根拠ファイルの関係を管理します','current',[script('board.py')]);
 table(s,['INPUT','PROCESS','OUTPUT'],[
 ['候補ID・階層・範囲\n手がかりIDと状態\n支持・反証の重みと根拠','証拠の重みを累積\n推測の重みを制限\n除外には検証結果を要求','rank: 候補の順位・相対比重\nnext: 次の比較・探索\ncheck: 未確認点・根拠不足']
 ],64,200,[360,380,410],210,24);
 txt(s,'候補の得点は、初期値に証拠の重みを掛けて更新',66,447,1140,48,28,true);
 txt(s,'仮説は重みを下げられても、計算根拠なしに候補を消せません。\n表示される比重は、現在の候補内の相対値であり、校正済みの正解確率ではありません。',66,510,1140,90,23,false,C.gray);
 bottom(s,'入力データに戻れる候補台帳を持ち、調査の飛躍を防ぎます');
}
// 09 Branching.
{
 const s=add('⑤ 写真にある単書から分析経路を選びます','すべての経路を必ず実行するわけではありません','current',[GH+'/blob/main/skills/geo-sleuth/SKILL.md']);
 table(s,['使える単書','選ぶ経路・技術','追加で必要な入力 / 得られる出力'],[
 ['山の輪郭・遠景','地形: DEM・能力線比較','能力線の画素位置 / 候補別の形状誤差'],
 ['運動場・工場などの施設','衛星: CLIPの画像・文類似度','範囲と施設説明 / 施設らしさの順位'],
 ['建物・道路の細部','距離写真: DINOv2 + SIFT','候補地点の画像 / 類似度と対応点数'],
 ['位置を知る基準点・影','幾何: 投影・視線・太陽位置','画素と地図の対応 / 位置・方向・整合性']
 ],64,190,[300,365,485],389,23);
 bottom(s,'今回のテストは公開写真・距離写真・幾何確認が中心',C.orange);
}
// 10 Terrain.
{
 const s=add('地形経路では、山の能力線を計算で照合します','terrain.py の scan / ridge / fit。写真に山が見える場合の経路です','current',[script('terrain.py'),report]);
 io(s,'候補座標・探索範囲\nDEM: 周囲の標高データ\n写真の能力線(x, y)\n方向・焦点距離の探索範囲','候補から見える地形を計算\n画像の明暗差から能力線抽出\n位置・方向・画角を探索\n上下ずれ・左右傾きを補正','scan: 候補地点とクラスタ\nridge.json: 能力線の点列\nfit.json: 位置と誤差の順位\n上位候補の重ね合わせ画像',{size:23});
 box(s,64,535,1150,58,C.warm);txt(s,'計算の要点: 高さ角 ≈ arctan((地形高 − カメラ高) / 距離)',80,548,1115,35,24,true);
 bottom(s,'今回のテストは標高照会のみ。DEMによる能力線の全域探索は実行していません');
}
// 11 CLIP.
{
 const s=add('衛星経路では、CLIPで施設候補を順位付けします','sat_scan.py が範囲を格子に分け、上空から見た施設の特徴を探します','current',[script('sat_scan.py'),report]);
 label(s,'INPUT',64,195);txt(s,'bbox・ズーム・衛星タイル\n探す施設の説明文\n比較用の別施設の説明文',64,239,360,142,24);
 label(s,'PROCESS',473,195);txt(s,'画像と文をベクトル化\n類似度をsoftmaxで比較\n目標文の点数を合算\n必要なら複数の倍率で評価',473,239,340,180,24);
 label(s,'OUTPUT',882,195);txt(s,'格子・候補座標ごとの点数\n順位JSON\n上位画像の一覧・ヒートマップ',882,239,334,145,24);
 arrow(s,419,295,34);arrow(s,828,295,34);
 rule(s,64,465,1150);txt(s,'説明文の例',64,490,210,35,23,true,C.orange);txt(s,'「赤い陸上トラックのある学校を上から見た画像」',284,488,920,44,27,true);
 txt(s,'地上写真の内容を、上空から確認できる特徴へ言い換えて検索します。',64,552,1145,44,23,false,C.gray);
 bottom(s,'この経路は今回のテストでは未実行。追加比較の候補です');
}
// Street-view acquisition is a separate input/output boundary.
{
 const s=add('거리사진 수집의 입력과 출력','후보 좌표와 촬영 조건을 실제 비교 이미지로 바꿉니다','current',[script('gsv.py'),script('baidu_pano.py'),script('match.py'),path.join(TEST,'road.index.json')]);
 io(s,'후보 좌표와 탐색 반경\n살펴볼 방향 heading\n상하 각도 pitch·화각 fov\n필요한 촬영 시기','gsv.py / baidu_pano.py\n주변 파노라마 지점 조회\n지점의 좌표·날짜·ID 확인\n방향·화각에 맞춰 이미지 생성','파노라마 ID와 위치 목록\n방향·시기·좌표의 인덱스\n비교에 사용할 JPEG 이미지\nmatch.py에 넘길 items 목록',{size:23});
 box(s,64,535,1150,58,C.warm);txt(s,'거리사진의 좌표는 그 이미지를 찍은 지점입니다. 원본 사진의 정확한 촬영점과는 다를 수 있습니다',80,548,1115,36,22,true);
 bottom(s,'좌표가 있는 비교 이미지가 준비되어야, 이미지 유사도를 실제 장소 후보와 연결할 수 있습니다');
}
// 12 DINO / SIFT.
{
 const s=add('距離写真は全体の類似度と細部の対応で比較します','match.py が検索候補を並べ、確認すべき上位画像を返します','current',[script('match.py'),path.join(TEST,'road_matches.json')]);
 const nodes=[['INPUT','原画像・比較領域\n座標付き参考画像'],['DINOv2 / CLIP','画像の特徴を抽出\nコサイン類似度で順位化'],['SIFT + RANSAC','上位の特徴点を対応付け\n幾何的に一致する点を数える'],['OUTPUT','score_global / inliers\n順位JSONと比較一覧']];
 nodes.forEach((n,i)=>{let x=64+i*294;label(s,n[0],x,207,270);txt(s,n[1],x,258,260,130,24);if(i<3)arrow(s,x+270,300,18);});
 rule(s,64,425,1150);txt(s,'実測したテストの最上位',64,456,450,40,28,true);
 txt(s,'全体類似度 0.5864',64,513,500,45,31,true,C.orange);txt(s,'SIFTインライア 0個',650,513,550,45,31,true,C.ink);
 bottom(s,'類似度は確認順序です。構造物を見て、同じ場所かを別途判断します');
}
// 13 Geometry.
{
 const s=add('⑥ 同じ場所かを確認し、撮影点を絞ります','カメラ位置と向きから、地図上の点が画像のどこに映るかを計算します','current',[script('pose.py'),script('geo.py'),script('sun.py')]);
 io(s,'基準点の画像座標(x, y)\n同じ点の緯度・経度・高さ\n画像サイズと初期位置\n既知なら画角・カメラ高','pose.py: 投影誤差を最小化\n位置・向き・傾き等を調整\ngeo.py: 視線交差・構造物間隔\nsun.py: 影と太陽で方向を制約','カメラ座標・高さ\nheading / pitch / roll\n画角・再投影誤差\n条件付きの推定オフセット',{size:23});
 box(s,64,535,1150,58,C.warm);txt(s,'自由位置推定には十分な基準点が必要。固定位置の再投影は「その地点との整合性」の確認です',80,548,1115,36,22,true);
 bottom(s,'位置を固定した低い画像誤差だけで、独立に撮影点を決定したとは言えません');
}
// 14 Output report.
{
 const s=add('⑦ 位置情報と検証の範囲を一緒に返します','board.py report と evidence.py が結果の根拠を整理します','current',[GH+'/blob/main/skills/geo-sleuth/SKILL.md',path.join(TEST,'result.json')]);
 table(s,['OUTPUT','値の例・形式','利用者が確認する意味'],[
 ['place / lat / lon / datum','独山城周辺 / 37.1843 / 127.0223 / WGS84','どこまで場所を特定したか'],
 ['radius_m / heading_deg','150m / 61°（今回の報告値）','位置範囲と撮影方向'],
 ['confidence','市・地域・道路・正確な点の段階別','地域の確信と撮影点の確信を分ける'],
 ['evidence / alternatives','比較画像・根拠ファイル・別候補','何で確認し、何が未解決か']
 ],64,190,[330,420,400],375,23);
 bottom(s,'今回の150mは大まかな探索許容範囲で、統計的な信頼区間ではありません');
}
// 15 Actual test input.
{
 const s=add('実際のテストは、GPSも読める文字もない写真です','2026.10.28実行の保存済みレポートを使用。今回は再推定せず結果を分析します','current',[report,PHOTO,path.join(TEST,'intake/ocr.json')]);
 await img(s,PHOTO,64,198,850,478,'テスト入力の原画像');
 label(s,'写真から使えた情報',948,210,265);txt(s,'4本の高層建物\n緑色の網\n右側の集合住宅\n近景の小屋根',948,258,270,185,25,true);
 label(s,'既知の正解座標',948,467,265);txt(s,'北緯 37.18428°\n東経 127.02244°',948,512,270,88,26,true,C.orange);
 txt(s,'正解座標は今回の事後評価に使用',948,610,270,48,18,false,C.gray);
}
// 16 Actual artifacts.
{
 const s=add('テストで実際に受け渡した入力と出力','一般的な処理と、このケースで動いた処理を混同しないように並べます','current',[report,path.join(TEST,'result.json')]);
 table(s,['処理','INPUT','OUTPUT・確認結果'],[
 ['初期読取','1440 × 810pxの写真','exif: GPSなし / ocr.items: []'],
 ['公開写真照合','原画像の指定領域 + 参考写真24枚','matches.json・matches.jpg'],
 ['地図・水平角確認','建物・網の座標 + 画像の水平位置','metapolis.geojson・horizontal_scan.json'],
 ['近傍の距離写真比較','原画像 + 20枚の座標付き画像','road_matches.json・street_top.jpg'],
 ['固定位置の投影確認','代表位置・建物高・画像上の点','final_pose.json・RMS 約0.81px'],
 ['最終報告','比較結果 + 候補台帳','result.json・evidence.jpg・report.md']
 ],64,184,[255,405,490],416,21);
 txt(s,'逆画像検索は利用不可。衛星CLIP検索・DEM能力線探索の実行結果は含みません。',64,640,1150,42,21,true,C.orange);
}
// 17 Visual comparison.
{
 const s=add('24枚の参考写真と20枚の距離写真を比較しました','最上位を開き、4種類の持続的な構造物の並びを目視で照合しました','current',[report,path.join(TEST,'photo_annotated.jpg'),path.join(TEST,'street_annotated.jpg'),path.join(TEST,'road_matches.json')]);
 label(s,'入力写真の確認領域',64,193,540);label(s,'候補地点の公開距離写真',658,193,556);
 await img(s,path.join(TEST,'photo_annotated.jpg'),64,231,556,313,'入力写真で確認した高層建物・網・集合住宅・屋根');
 await img(s,path.join(TEST,'street_annotated.jpg'),658,231,556,313,'公開距離写真の同じ構造物');
 txt(s,'高層建物群 / 緑色の網 / 右側の集合住宅 / 手前の小屋根',64,574,1150,42,25,true);
 bottom(s,'樹木や撮影時点の違いがあるため、同じ木・足元の正確な位置は未確定です');
}
// 18 Ground truth evaluation.
{
 const s=add('代表座標と実際の座標の距離は約12.6mでした','ユーザー提供の正解座標と、保存済みresult.jsonの代表座標を事後比較','current',[path.join(TEST,'result.json'),path.join(BUILD,'test_metrics.json'),'正解座標: ユーザー提供 37.18428, 127.02244']);
 txt(s,metrics.distance_m.toFixed(1),64,220,480,138,108,true,C.orange);txt(s,'m',400,287,130,70,45,true,C.orange);
 txt(s,'今回の代表点と正解点の直線距離',68,380,500,80,29,true);
 table(s,['座標','北緯','東経'],[['正解座標','37.18428°','127.02244°'],['報告の代表点','37.18430°','127.02230°']],620,210,[185,185,224],245,23);
 txt(s,'計算: WGS84の緯度・経度を球面距離に換算\nHaversine式、地球半径 6,371,008.8m\n参考: 最上位距離写真の点までは約10.7m',620,491,590,102,21,false,C.gray);
 bottom(s,'単一事例の事後誤差です。一般的な精度や、12.6mの保証を示す値ではありません');
}
// 19 Limits with actual projection image.
{
 const s=add('地域は一致し、精密な撮影点には課題が残りました','近い代表点が得られたことと、独立した精密測位が成立したことを分けます','current',[report,path.join(TEST,'final_pose.json')]);
 await img(s,path.join(TEST,'pose_selfcheck.jpg'),64,203,690,388,'固定した候補位置で高層建物の位置を再投影した実際の画像');
 label(s,'RMS 約0.81px',800,205,400);txt(s,'代表位置を固定した整合性検査\n独立した位置推定の精度ではない',800,246,416,80,24);
 label(s,'SIFTインライア 0個',800,354,400);txt(s,'自動点対応では確認できず\n上位画像の構造物を直接比較',800,395,416,80,24);
 label(s,'遠方の塔がほぼ一直線',800,501,400);txt(s,'自由な位置推定が不安定\n近距離・別方向の基準点が必要',800,543,416,80,24);
 txt(s,'test implementation note',64,605,690,62,19,false,C.gray);
}
// 20 Improvement from evidence.
{
 const s=add('テストの制約を、改善する入出力に結びます','既存の課題から開発案を導きます。以下は未実装の提案です','proposal',[report]);
 table(s,['確認した制約','追加・改善する処理','新たに扱う入力と出力'],[
 ['近景の基準点が不足','同じ場所の追加写真を要求\n近距離の固定物を対応付け','INPUT: 別角度写真・固定物座標\nOUTPUT: 幾何的に安定した位置候補'],
 ['SIFTが0個でも候補は有効','領域指定・季節差の比較\n目視確認の理由を保存','INPUT: 注目領域・複数時点画像\nOUTPUT: 構造物別の一致・不一致'],
 ['外部サービス依存・送信制約','画像を送らない経路を標準化\n利用権を確認した資料を検索','INPUT: 送信可否・データ利用範囲\nOUTPUT: 実行経路・未実行理由'],
 ['単一事例で精度を評価','正解を伏せた別写真で検証','INPUT: 写真と非公開の正解\nOUTPUT: 誤差分布・失敗率・時間']
 ],64,188,[265,400,485],409,22);
 bottom(s,'改善の効果は、新しい評価写真で確認してから判断します');
}
// 21 Proposed API.
{
 const s=add('発展案は、各段階の入出力をAPIで固定します','現在はスキルとCLI群。ジョブ管理APIと画面を追加する構成案です','proposal',[GH+'/blob/main/skills/geo-sleuth/SKILL.md',report]);
 const xs=[64,457,850];
 [['受付','image_ref / hint / budget\nallow_external_upload: false'],['段階実行','status / stage / artifacts\ncandidates / evidence_refs'],['結果・確認','place / coordinates / radius\nconfidence / alternatives']].forEach((v,i)=>{label(s,v[0],xs[i],207,350);txt(s,v[1],xs[i],260,350,130,24);if(i<2)arrow(s,xs[i]+342,306,33);});
 rule(s,64,421,1150);txt(s,'追加するのは、処理をつなぐ制御と確認の仕組み',64,452,1150,45,29,true);
 txt(s,'実行段階と失敗理由を保存し、使える経路で再開\n画像・座標・根拠ファイルのIDをひも付けて追跡\n自動順位付けと人の確認結果を別フィールドで保持',64,515,1150,111,25);
}
// 22 Uses.
{
 const s=add('まずは、写真の位置を検討する業務に使います','位置候補と証拠を返し、利用者が結果を確認する使い方から始めます','proposal',[report]);
 table(s,['利用場面','INPUT','OUTPUT・人が確認する点'],[
 ['社内の写真整理','位置情報のない写真\n対象の地域・施設リスト','候補地点と根拠画像\n写真に位置タグを付ける判断'],
 ['現地・施設写真の確認','提出写真・申告された場所\n施設の地図・過去写真','申告場所と一致する構造物\n不一致や追加写真の必要性'],
 ['公開写真の場所の検証','利用許諾のある写真\n記事・施設名・地域情報','候補と出典・照合記録\n公開前に根拠と不確実性を確認']
 ],64,198,[295,385,470],355,24);
 bottom(s,'常時の人物追跡ではなく、権限のある写真の場所確認を対象にします');
}
// 23 Plan.
{
 const s=add('開発は入出力の固定と、別写真での評価から始めます','実施順序の提案です。担当・日程・達成精度はまだ確定していません','proposal',[report]);
 table(s,['順序','実装・整備するもの','次へ進むために確認すること'],[
 ['1  処理の再現性','入力JSON・中間ファイル・結果JSON\n実行履歴と失敗時の再開','同じ条件で各段階を再実行できる'],
 ['2  データの確保','国内の施設・地形・参考写真\n取得方法と保存・表示の利用条件','必要な地域を調べられ、権利を説明できる'],
 ['3  精度と費用の評価','正解を事前に伏せた新しい写真\n地域・地形・施設別に集計','誤差中央値・距離閾値内の割合\n失敗率・処理時間・利用費を把握'],
 ['4  業務向けの画面','候補地図・根拠比較・追加写真受付','利用者が結論と未確定点を判断できる']
 ],64,190,[220,470,460],400,23);
 bottom(s,'小さな検証ツールとして使い、評価結果を見て対象業務を広げます');
}
// 24 Actual schema.
{
 const s=add('実ファイルで確認した入出力フィールド','保存済みテストの項目を抜粋。提案APIの仕様とは区別します','appendix',[path.join(TEST,'intake/ocr.json'),path.join(TEST,'board.json'),path.join(TEST,'road_matches.json'),path.join(TEST,'final_pose.json'),path.join(TEST,'result.json')]);
 table(s,['ファイル','主なフィールド','実測値・意味'],[
 ['intake/ocr.json','image / size / backend / items','[1440, 810] / rapidocr / []'],
 ['board.json','candidates / clues / evidence / falsify','候補・手がかり・重み・反証条件をひも付け'],
 ['road_matches.json','rank / score_global / inliers / wgs','1 / 0.5864 / 0 / 座標配列'],
 ['final_pose.json','location / heading / hfov / rms_px','位置固定 / 約60.5° / 約66.7° / 約0.81px'],
 ['result.json','lat / lon / radius_m / confidence','37.1843 / 127.0223 / 150 / 段階別']
 ],64,190,[290,450,410],392,22);
 bottom(s,'空配列は「検出なし」、未実行は別の状態として扱います');
}
// 25 Algorithms and limitations.
{
 const s=add('アルゴリズムごとに、判断できることが違います','点数の種類を混ぜず、次の段階へ渡す値と用途を明確にします','appendix',[script('sat_scan.py'),script('match.py'),script('terrain.py'),script('pose.py')]);
 table(s,['技術','数値・出力の意味','その値だけで判断できないこと'],[
 ['OCR','文字列・文字領域・認識の確からしさ','文字が正しいか、同名施設のどれか'],
 ['CLIP / DINOv2','説明文や画像の類似度・順位','同じ場所であること、撮影点の精度'],
 ['SIFT + RANSAC','変換に整合する特徴点の数','季節・視点差が大きい候補の完全な否定'],
 ['DEM能力線比較','候補から見える能力線との形状誤差','同じ視線上の前後の位置の一意決定'],
 ['カメラ投影・最小二乗','画像上の基準点との残差\n条件に応じた位置・姿勢','誤った基準点や固定位置の正当性']
 ],64,190,[280,420,450],396,23);
 bottom(s,'AIは上位候補の画像を読み、複数の独立した根拠が同時に合うか確認します');
}
// 26 Data and rights.
{
 const s=add('データの出所と利用条件を管理します','ソースコードの利用条件と、画像・地図の取得・保存・表示条件は別です','appendix',[GH+'/blob/main/LICENSE',GH+'/blob/main/skills/geo-sleuth/data/README.md','https://www.openstreetmap.org/copyright','https://cloud.google.com/maps-platform/terms',report]);
 table(s,['対象','条件・管理する内容','利用時の扱い'],[
 ['geo-sleuthのコード','MIT / 著作権表示と許諾文を保持','商用開発に利用可能'],
 ['同梱の一部データ表','Wikipedia由来はCC BY-SA 4.0','帰属・変更表示・同一条件を確認'],
 ['OpenStreetMap','ODbL / 出典表示・派生DBの条件','データ利用と公共APIの負荷制限を分ける'],
 ['地形・衛星・距離写真','各提供元の利用条件と取得日時','自動取得・分析・保存・再配布を確認'],
 ['ユーザーの写真・正解','使用目的・外部送信の可否・保持期間','今回の入力画像は外部逆検索へ送信せず']
 ],64,190,[280,450,420],392,22);
 bottom(s,'実装前に、対象地域で使える資料と、許可された利用経路を確保します');
}
// 27 Reproduction references.
{
 const s=add('テストの根拠と再現に使うファイル','調査フォルダ: geo_work_20261028_01。実行条件と限界はreport.mdに保存','appendix',[report,path.join(TEST,'evidence.jpg'),path.join(TEST,'result.json')]);
 table(s,['確認する内容','ファイル','実行済みの処理'],[
 ['入力と初期状態','intake/intake.md / exif.json / ocr.json','intake.py'],
 ['画像を比較した順序','matches.json / road_matches.json','match.py rank'],
 ['施設配置・水平角','metapolis.geojson / horizontal_scan.json','osm.py geom / geometry_scan.py'],
 ['候補と投影の整合性','final_points.json / final_pose.json\npose_selfcheck.jpg','terrain.py elev / pose.py project'],
 ['結論と代案・未解決点','board.json / result.json\nevidence.jpg / report.md','board.py check・report / evidence.py']
 ],64,190,[300,490,360],392,22);
 txt(s,'正解座標はユーザー提供。12.6mは今回の事後距離計算で、元レポートの主張を書き換えていません。',64,641,1150,43,21,true);
}

for(let i=0;i<COPY.length;i++){if(textCounters[i]!==COPY[i].texts.length)throw Error(`Unused copy ${i+1}: ${textCounters[i]} / ${COPY[i].texts.length}`);}
await fs.mkdir(path.join(BUILD,'artifact_preview'),{recursive:true});
await fs.writeFile(path.join(BUILD,'outline.json'),JSON.stringify(contentLog,null,2));
const candidate=path.join(BUILD,'candidate.pptx');
await (await PresentationFile.exportPptx(P)).save(candidate);
console.log('EXPORTED',P.slides.items.length,candidate);
// Render a small representative subset in the authoring renderer first.
for(const i of [0,2,4,9,11,17,23]){
 try{const blob=await P.export({slide:P.slides.items[i],format:'png',scale:1});await fs.writeFile(path.join(BUILD,'artifact_preview',`slide-${i+1}.png`),new Uint8Array(await blob.arrayBuffer()));console.log('PREVIEW',i+1);}catch(e){console.log('PREVIEW_ERROR',i+1,String(e).slice(0,240));}
}
await fs.writeFile(path.join(BUILD,'authoring-complete.json'),JSON.stringify({slides:P.slides.items.length,candidate}));
