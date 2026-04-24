import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { fcfs, sjf, srtf, roundRobin, priorityNonPreemptive, priorityPreemptive, hrrn, ljf, lrtf, priorityRR, spt, lpt, edd, muf, rms, dms, edl, tbs, drr } from '../utils/algorithms';
import type { Process, SimulationStep, ProcessStats } from '../utils/algorithms';

export type SimulationStatus = 'idle' | 'running' | 'paused' | 'finished';

interface SimulationContextType {
  currentTime: number;
  status: SimulationStatus;
  processes: Process[];
  setProcesses: React.Dispatch<React.SetStateAction<Process[]>>;
  selectedAlgo: string;
  setSelectedAlgo: (algo: string) => void;
  quantum: number;
  setQuantum: (q: number) => void;
  result: { steps: SimulationStep[], processStats: ProcessStats[] } | null;
  runSimulation: () => void;
  play: () => void;
  pause: () => void;
  reset: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  // Derived state
  currentStep: SimulationStep | null;
  readyQueue: Process[];
  eventLog: string[];
  currentProcesses: Process[];
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [status, setStatus] = useState<SimulationStatus>('idle');
  const [processes, setProcesses] = useState<Process[]>([]);
  const [selectedAlgo, setSelectedAlgo] = useState('');
  const [quantum, setQuantum] = useState(2);
  const [result, setResult] = useState<{ steps: SimulationStep[], processStats: ProcessStats[] } | null>(null);
  
  const timerRef = useRef<number | null>(null);

  const runSimulation = useCallback(() => {
    if (processes.length === 0 || !selectedAlgo) return;

    let res;
    switch (selectedAlgo) {
      case "First Come First Served (FCFS)":
        res = fcfs(processes);
        break;
      case "Shortest Job First (SJF)":
        res = sjf(processes);
        break;
      case "Shortest Remaining Time First (SRTF)":
        res = srtf(processes);
        break;
      case "Round Robin (RR)":
        res = roundRobin(processes, quantum);
        break;
      case "Priority Scheduling":
      case "Non-Preemptive Priority Scheduling":
        res = priorityNonPreemptive(processes);
        break;
      case "Preemptive Priority Scheduling":
        res = priorityPreemptive(processes);
        break;
      case "Highest Response Ratio Next (HRRN)":
        res = hrrn(processes);
        break;
      case "Longest Job First (LJF)":
        res = ljf(processes);
        break;
      case "Longest Remaining Time First (LRTF)":
        res = lrtf(processes);
        break;
      // ── New algorithms ──────────────────────────────────────
      case "Priority Round Robin (Priority RR)":
        res = priorityRR(processes, quantum);
        break;
      case "Shortest Processing Time (SPT)":
        res = spt(processes);
        break;
      case "Longest Processing Time (LPT)":
        res = lpt(processes);
        break;
      case "Earliest Due Date (EDD)":
        res = edd(processes);
        break;
      case "Maximum Urgency First (MUF)":
        res = muf(processes);
        break;
      case "Rate Monotonic Scheduling (RMS)":
        res = rms(processes);
        break;
      case "Deadline Monotonic Scheduling (DMS)":
        res = dms(processes);
        break;
      case "Earliest Deadline Late (EDL)":
        res = edl(processes);
        break;
      case "Total Bandwidth Server (TBS)":
        res = tbs(processes);
        break;
      case "Deficit Round Robin (DRR)":
        res = drr(processes, quantum);
        break;
      default:
        res = fcfs(processes); // Fallback
    }
    
    setResult(res);
    setCurrentTime(0);
    setStatus('paused');
  }, [processes, selectedAlgo]);

  const play = useCallback(() => {
    if (!result) runSimulation();
    setStatus('running');
  }, [result, runSimulation]);

  const pause = useCallback(() => {
    setStatus('paused');
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setCurrentTime(0);
    setResult(null);
  }, []);

  const stepForward = useCallback(() => {
    if (result && currentTime < result.steps.length) {
      setCurrentTime(prev => prev + 1);
    }
  }, [result, currentTime]);

  const stepBackward = useCallback(() => {
    if (currentTime > 0) {
      setCurrentTime(prev => prev - 1);
    }
  }, [currentTime]);

  useEffect(() => {
    if (status === 'running' && result) {
      timerRef.current = window.setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= result.steps.length) {
            setStatus('finished');
            return prev;
          }
          return prev + 1;
        });
      }, 500); // 500ms per step
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status, result]);
  
  // Auto-reset simulation when processes, algorithm or quantum change
  useEffect(() => {
    reset();
  }, [processes, selectedAlgo, quantum]);

  // Derive Current State
  const currentStep = result && currentTime > 0 ? result.steps[currentTime - 1] : null;

  const readyQueue = result ? processes.filter(p => {
    const hasArrived = p.arrival < currentTime;
    const pStat = result.processStats.find(s => s.id === p.id);
    const isDone = pStat ? pStat.finishTime <= (currentTime - 1) : false;
    const isRunning = currentStep?.processId === p.id;
    return hasArrived && !isDone && !isRunning;
  }) : [];

  const eventLog: string[] = [];
  if (result) {
    processes.forEach(p => {
      if (p.arrival < currentTime) {
        eventLog.push(`[t=${p.arrival}] P${p.id} arrived in Ready Queue.`);
      }
      const pStat = result.processStats.find(s => s.id === p.id);
      if (pStat && pStat.finishTime < currentTime) {
        eventLog.push(`[t=${pStat.finishTime}] P${p.id} completed execution.`);
      }
    });
    // Add scheduling events
    for (let t = 0; t < currentTime; t++) {
        const step = result.steps[t];
        const prevStep = t > 0 ? result.steps[t-1] : null;
        if (step.type === 'running' && (!prevStep || prevStep.processId !== step.processId)) {
            eventLog.push(`[t=${t}] Scheduler assigned P${step.processId} to CPU.`);
        }
    }
  }
  eventLog.sort((a, b) => {
    const ta = parseInt(a.match(/t=(\d+)/)?.[1] || '0');
    const tb = parseInt(b.match(/t=(\d+)/)?.[1] || '0');
    return ta - tb;
  });

  // Calculate live process states
  const currentProcesses = React.useMemo(() => {
    if (!result) return processes;
    return processes.map(p => {
      const stats = result.processStats.find(s => s.id === p.id);
      const isDone = stats ? stats.finishTime <= (currentTime - 1) : false;
      const isRunning = currentStep?.processId === p.id;
      const hasArrived = p.arrival < currentTime;
      
      let status = 'NEW';
      if (isDone) status = 'DONE';
      else if (isRunning) status = 'RUNNING';
      else if (hasArrived) status = 'READY';

      // Current wait time
      let currentWait = 0;
      if (hasArrived) {
        const burstConsumed = result.steps.slice(0, currentTime).filter(s => s.processId === p.id && s.type === 'running').length;
        // Correct logic: Wait time = Time since arrival - Time spent running
        currentWait = Math.max(0, (currentTime) - p.arrival - burstConsumed);
        if (isDone && stats) currentWait = stats.waitingTime;
      }

      return { ...p, status, wait: currentWait };
    });
  }, [processes, result, currentTime, currentStep]);

  return (
    <SimulationContext.Provider value={{
      currentTime, status, processes, setProcesses, selectedAlgo, setSelectedAlgo,
      quantum, setQuantum,
      result, runSimulation, play, pause, reset, stepForward, stepBackward,
      currentStep, readyQueue, eventLog, currentProcesses
    }}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) throw new Error("useSimulation must be used within SimulationProvider");
  return context;
};
