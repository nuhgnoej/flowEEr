// hooks/useFlowEngine.ts

import { useEffect, useMemo, useState } from "react";
import FlowEngine from "@/lib/FlowEngine";
import type { Flow } from "@/lib/types";

/**
 * 주어진 Flow 객체를 기반으로 FlowEngine 인스턴스를 생성합니다.
 * flow가 null이면 null을 반환하며, 이 경우 호출자는 null 체크를 해야 합니다.
 */
export function useFlowEngine(flow: Flow | null) {
  const [engine, setEngine] = useState<FlowEngine | null>(null);

  useEffect(() => {
    if (flow) {
      setEngine(new FlowEngine(flow));
    }
  }, [flow]);

  return {
    engine,
    refresh: (f: Flow) => engine?.refresh(f),
  };
}
