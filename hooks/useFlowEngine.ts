// hooks/useFlowEngine.ts

import { useMemo } from "react";
import FlowEngine from "@/lib/FlowEngine";
import type { Flow } from "@/lib/types";

/**
 * 주어진 Flow 객체를 기반으로 FlowEngine 인스턴스를 생성합니다.
 * flow가 null이면 null을 반환하며, 이 경우 호출자는 null 체크를 해야 합니다.
 */
export function useFlowEngine(flow: Flow | null) {
  const engine = useMemo(() => {
    if (!flow) return null;
    return new FlowEngine(flow);
  }, [flow]);

  return engine;
}
