// Stable public categories. Raw commands and credential-bearing messages stay in local logs.
export function classifyError(value='') {
  const text=String(value);
  const categories=[
    ['capacity',/selected model is at capacity|model.{0,60}(at capacity|overloaded)|server.{0,20}overloaded/i,'선택한 모델이 혼잡합니다. 잠시 기다린 뒤 이어받거나 다른 모델을 선택해 주세요.',true],
    ['model_unavailable',/model.{0,100}(not found|not supported|not available|access)|unsupported.{0,30}model|do not have access to.{0,30}model/i,'현재 계정에서 선택한 모델을 사용할 수 없습니다. 다른 모델을 선택해 주세요.',false],
    ['session_missing',/thread .{0,100}not found|no (?:saved )?session|session.{0,80}(not found|does not exist)|unable to (?:find|load).{0,30}(session|thread)/i,'이전 Codex 세션을 복구하지 못했습니다. 보존한 중간 자료로 새 세션을 연결합니다.',true],
    ['auth',/401|unauthorized|not logged|authentication|refresh.token/i,'Codex 로그인을 확인해 주세요. PowerShell에서 codex login 후 이어받을 수 있습니다.',false],
    ['quota',/quota|usage.limit|insufficient_quota/i,'Codex 사용량 한도에 도달했습니다. 계정의 사용 가능량을 확인해 주세요.',false],
    ['rate_limit',/rate.limit|\b429\b/i,'요청 횟수 제한에 도달했습니다. 잠시 후 다시 시도해 주세요.',true],
    ['tls',/schannel|SEC_E_|CERTIFICATE_VERIFY_FAILED|certificate verify|SSL certificate|curl (?:exit |\()?(?:35|60)\b|TLS/i,'HTTPS 인증서 연결에 실패했습니다. 네트워크 진단과 Python 전송 경로를 확인해 주세요.',false],
    ['network_denied',/WinError 10013|forbidden by its access permissions|socket.*permission|network.*(?:denied|disabled)/i,'조사 환경의 네트워크 접근이 차단되었습니다. 실행 권한 프로필을 확인해 주세요.',false],
    ['permission',/access.*denied|permission.*denied|액세스가 거부|os error 5|sandbox.*fail/i,'로컬 파일 또는 도구 실행 권한이 필요합니다. 일반 PowerShell에서 서버를 실행한 뒤 확인해 주세요.',false],
    ['missing_tool',/can't open file|no such file|not recognized|command not found|Failed to spawn|UNKNOWN_TOOL|지정된 파일을 찾을/i,'설치되지 않은 도구를 호출했습니다. 이 조사 폴더의 TOOL_GUIDE.md에 있는 실행기를 사용해야 합니다.',false],
    ['invalid_command',/SyntaxError|ParserError|unrecognized arguments|Missing argument|Unexpected token|invalid choice/i,'명령 형식이 올바르지 않습니다. 도구 도움말을 확인하고 복잡한 코드는 .py 파일로 실행해야 합니다.',false],
    ['encoding',/UnicodeDecodeError|UnicodeEncodeError|codec can't/i,'문자 인코딩 오류입니다. 파일과 Python 실행에 UTF-8 설정을 적용해야 합니다.',false],
    ['http_denied',/\b(?:403|406)\b|HTTP Error 40[36]/i,'자료 제공 서버가 요청을 거절했습니다. 다른 공개 자료 경로로 확인해야 합니다.',false],
    ['invalid_asset',/INVALID_ASSET|invalid result|request mismatch|incomplete result|all.tiles.failed/i,'받은 자료가 비어 있거나 손상되었습니다. 해당 자료를 검증 근거로 사용할 수 없습니다.',false],
    ['no_data',/NO_DATA|Search returned no images|no panorama|no imagery/i,'정상 응답에서 자료가 없음을 확인했습니다. 다른 위치 또는 자료 제공처를 확인합니다.',false],
    ['timeout',/timeout|timed out|time.limit/i,'실행 시간 제한에 도달했습니다. 보존한 중간 자료에서 이어받을 수 있습니다.',true],
    ['network',/ENOTFOUND|ECONNREFUSED|connection|network|error sending request|curl exit/i,'외부 서비스에 연결하지 못했습니다. 네트워크 진단을 확인해 주세요.',true],
  ];
  const found=categories.find(([,pattern])=>pattern.test(text));
  return found?{code:found[0],message:found[2],retryable:found[3]}:{code:'unknown',message:'조사를 완료하지 못했습니다. 로컬 codex.events.jsonl과 codex.stderr.log에서 원인을 확인할 수 있습니다.',retryable:false};
}

export function commandProblem(item) {
  if(item?.type!=='command_execution')return null;
  const output=String(item.aggregated_output||'');
  // Inspect failures, not source files printed by successful read commands.
  const failed=item.exit_code!==0&&item.exit_code!==null&&item.exit_code!==undefined;
  const receipt=/FRAME_TOOL_RESULT (\{[^\r\n]+\})/g;
  let parsed;for(const match of output.matchAll(receipt)){try{parsed=JSON.parse(match[1]);}catch{}}
  if(parsed&&!parsed.ok)return {kind:'warning',...classifyError(output.replace(/FRAME_TOOL_RESULT[^\r\n]+/g,'')),tool:parsed.tool};
  if(!failed)return null;
  return {kind:'warning',...classifyError(output)};
}
