export interface Process {
  id: number;
  arrival: number;
  burst: number;
  priority?: number;
  deadline?: number;  // For real-time algorithms (EDD, MUF, RMS, DMS, EDL, TBS)
  period?: number;    // For periodic real-time algorithms (RMS, DMS)
  quantum?: number;   // For DRR — deficit quantum per process
  wait?: number;
  status?: string;
}

export interface SimulationStep {
  time: number;
  processId?: number;
  type: 'running' | 'idle' | 'context_switch';
  remainingBurst?: number;
}

export interface ProcessStats {
  id: number;
  finishTime: number;
  turnaroundTime: number;
  waitingTime: number;
  responseTime: number;
}

export interface SimulationResult {
  steps: SimulationStep[];
  processStats: ProcessStats[];
}

export const fcfs = (processes: Process[]): SimulationResult => {
  const sorted = [...processes].sort((a, b) => a.arrival - b.arrival || a.id - b.id);
  const steps: SimulationStep[] = [];
  const stats: ProcessStats[] = [];
  let currentTime = 0;

  for (const p of sorted) {
    if (currentTime < p.arrival) {
      for (let t = currentTime; t < p.arrival; t++) {
        steps.push({ time: t, type: 'idle' });
      }
      currentTime = p.arrival;
    }

    const responseTime = currentTime - p.arrival;
    for (let i = 0; i < p.burst; i++) {
      steps.push({ time: currentTime, processId: p.id, type: 'running', remainingBurst: p.burst - i - 1 });
      currentTime++;
    }

    const finishTime = currentTime;
    const turnaroundTime = finishTime - p.arrival;
    const waitingTime = turnaroundTime - p.burst;

    stats.push({
      id: p.id,
      finishTime,
      turnaroundTime,
      waitingTime,
      responseTime,
    });
  }

  return { steps, processStats: stats };
};

export const sjf = (processes: Process[]): SimulationResult => {
  const steps: SimulationStep[] = [];
  const stats: ProcessStats[] = [];
  let currentTime = 0;
  const readyQueue: Process[] = [];
  const completed: number[] = [];
  const responses = new Map<number, number>();

  while (completed.length < processes.length) {
    // Add arrived processes to ready queue
    processes.forEach(p => {
      if (p.arrival <= currentTime && !readyQueue.find(q => q.id === p.id) && !completed.includes(p.id)) {
        readyQueue.push(p);
      }
    });

    if (readyQueue.length === 0) {
      steps.push({ time: currentTime, type: 'idle' });
      currentTime++;
      continue;
    }

    // Pick shortest burst
    readyQueue.sort((a, b) => a.burst - b.burst || a.arrival - a.arrival || a.id - b.id);
    const p = readyQueue.shift()!;

    if (!responses.has(p.id)) responses.set(p.id, currentTime - p.arrival);

    for (let i = 0; i < p.burst; i++) {
        steps.push({ time: currentTime, processId: p.id, type: 'running', remainingBurst: p.burst - i - 1 });
        currentTime++;
        // Check for newly arrived processes during execution (though non-preemptive)
    }

    const finishTime = currentTime;
    const turnaroundTime = finishTime - p.arrival;
    const waitingTime = turnaroundTime - p.burst;

    stats.push({
      id: p.id,
      finishTime,
      turnaroundTime,
      waitingTime,
      responseTime: responses.get(p.id)!,
    });
    completed.push(p.id);
  }

  return { steps, processStats: stats };
};

export const srtf = (processes: Process[]): SimulationResult => {
  const steps: SimulationStep[] = [];
  const stats: ProcessStats[] = [];
  let currentTime = 0;
  const procMap = new Map<number, { p: Process, remaining: number, arrived: boolean, responseTime?: number }>(
    processes.map(p => [p.id, { p, remaining: p.burst, arrived: false }])
  );

  while (stats.length < processes.length) {
    // Arrival check
    processes.forEach(p => {
      if (p.arrival <= currentTime) procMap.get(p.id)!.arrived = true;
    });

    const ready = Array.from(procMap.values()).filter(v => v.arrived && v.remaining > 0);

    if (ready.length === 0) {
      steps.push({ time: currentTime, type: 'idle' });
      currentTime++;
      continue;
    }

    ready.sort((a, b) => a.remaining - b.remaining || a.p.arrival - b.p.arrival || a.p.id - b.p.id);
    const current = ready[0];

    if (current.responseTime === undefined) current.responseTime = currentTime - current.p.arrival;

    steps.push({ time: currentTime, processId: current.p.id, type: 'running', remainingBurst: current.remaining - 1 });
    current.remaining--;
    currentTime++;

    if (current.remaining === 0) {
      const finishTime = currentTime;
      const turnaroundTime = finishTime - current.p.arrival;
      const waitingTime = turnaroundTime - current.p.burst;
      stats.push({
        id: current.p.id,
        finishTime,
        turnaroundTime,
        waitingTime,
        responseTime: current.responseTime,
      });
    }
  }

  return { steps, processStats: stats };
};

export const roundRobin = (processes: Process[], quantum: number = 2): SimulationResult => {
  const steps: SimulationStep[] = [];
  const stats: ProcessStats[] = [];
  let currentTime = 0;
  const procMap = new Map<number, { p: Process, remaining: number, firstResponse?: number }>(
    processes.map(p => [p.id, { p, remaining: p.burst }])
  );
  
  const sorted = [...processes].sort((a, b) => a.arrival - b.arrival);
  const queue: number[] = [];
  let lastArrivedIndex = 0;

  const checkArrivals = () => {
    while (lastArrivedIndex < sorted.length && sorted[lastArrivedIndex].arrival <= currentTime) {
      queue.push(sorted[lastArrivedIndex].id);
      lastArrivedIndex++;
    }
  };

  while (stats.length < processes.length) {
    checkArrivals();

    if (queue.length === 0) {
      steps.push({ time: currentTime, type: 'idle' });
      currentTime++;
      continue;
    }

    const pid = queue.shift()!;
    const state = procMap.get(pid)!;

    if (state.firstResponse === undefined) state.firstResponse = currentTime - state.p.arrival;

    const runTime = Math.min(state.remaining, quantum);
    for (let i = 0; i < runTime; i++) {
      steps.push({ time: currentTime, processId: pid, type: 'running', remainingBurst: state.remaining - 1 });
      state.remaining--;
      currentTime++;
      checkArrivals(); // Important for RR: items that arrive during the quantum go in queue BEFORE the current process is re-added
    }

    if (state.remaining > 0) {
      queue.push(pid);
    } else {
      const finishTime = currentTime;
      const turnaroundTime = finishTime - state.p.arrival;
      const waitingTime = turnaroundTime - state.p.burst;
      stats.push({
        id: pid,
        finishTime,
        turnaroundTime,
        waitingTime,
        responseTime: state.firstResponse,
      });
    }
  }

  return { steps, processStats: stats };
};

export const priorityNonPreemptive = (processes: Process[]): SimulationResult => {
  const steps: SimulationStep[] = [];
  const stats: ProcessStats[] = [];
  let currentTime = 0;
  const readyQueue: Process[] = [];
  const completed: number[] = [];
  const responses = new Map<number, number>();

  while (completed.length < processes.length) {
    processes.forEach(p => {
      if (p.arrival <= currentTime && !readyQueue.find(q => q.id === p.id) && !completed.includes(p.id)) {
        readyQueue.push(p);
      }
    });

    if (readyQueue.length === 0) {
      steps.push({ time: currentTime, type: 'idle' });
      currentTime++;
      continue;
    }

    // Sort by priority (lower number = higher priority), then arrival, then id
    readyQueue.sort((a, b) => (a.priority || 0) - (b.priority || 0) || a.arrival - b.arrival || a.id - b.id);
    const p = readyQueue.shift()!;

    if (!responses.has(p.id)) responses.set(p.id, currentTime - p.arrival);

    for (let i = 0; i < p.burst; i++) {
        steps.push({ time: currentTime, processId: p.id, type: 'running', remainingBurst: p.burst - i - 1 });
        currentTime++;
    }

    stats.push({
      id: p.id,
      finishTime: currentTime,
      turnaroundTime: currentTime - p.arrival,
      waitingTime: (currentTime - p.arrival) - p.burst,
      responseTime: responses.get(p.id)!,
    });
    completed.push(p.id);
  }
  return { steps, processStats: stats };
};

export const priorityPreemptive = (processes: Process[]): SimulationResult => {
  const steps: SimulationStep[] = [];
  const stats: ProcessStats[] = [];
  let currentTime = 0;
  const procMap = new Map<number, { p: Process, remaining: number, arrived: boolean, responseTime?: number }>(
    processes.map(p => [p.id, { p, remaining: p.burst, arrived: false }])
  );

  while (stats.length < processes.length) {
    processes.forEach(p => {
      if (p.arrival <= currentTime) procMap.get(p.id)!.arrived = true;
    });

    const ready = Array.from(procMap.values()).filter(v => v.arrived && v.remaining > 0);

    if (ready.length === 0) {
      steps.push({ time: currentTime, type: 'idle' });
      currentTime++;
      continue;
    }

    ready.sort((a, b) => (a.p.priority || 0) - (b.p.priority || 0) || a.p.arrival - b.p.arrival || a.p.id - b.p.id);
    const current = ready[0];

    if (current.responseTime === undefined) current.responseTime = currentTime - current.p.arrival;

    steps.push({ time: currentTime, processId: current.p.id, type: 'running', remainingBurst: current.remaining - 1 });
    current.remaining--;
    currentTime++;

    if (current.remaining === 0) {
      stats.push({
        id: current.p.id,
        finishTime: currentTime,
        turnaroundTime: currentTime - current.p.arrival,
        waitingTime: (currentTime - current.p.arrival) - current.p.burst,
        responseTime: current.responseTime,
      });
    }
  }
  return { steps, processStats: stats };
};

export const hrrn = (processes: Process[]): SimulationResult => {
  const steps: SimulationStep[] = [];
  const stats: ProcessStats[] = [];
  let currentTime = 0;
  const completed: number[] = [];
  const responses = new Map<number, number>();

  while (completed.length < processes.length) {
    const ready = processes.filter(p => p.arrival <= currentTime && !completed.includes(p.id));

    if (ready.length === 0) {
      steps.push({ time: currentTime, type: 'idle' });
      currentTime++;
      continue;
    }

    // RR = (W + B) / B
    const getRR = (p: Process) => {
      const wait = currentTime - p.arrival;
      return (wait + p.burst) / p.burst;
    };

    ready.sort((a, b) => getRR(b) - getRR(a) || a.arrival - b.arrival || a.id - b.id);
    const p = ready[0];

    if (!responses.has(p.id)) responses.set(p.id, currentTime - p.arrival);

    for (let i = 0; i < p.burst; i++) {
      steps.push({ time: currentTime, processId: p.id, type: 'running', remainingBurst: p.burst - i - 1 });
      currentTime++;
    }

    stats.push({
      id: p.id,
      finishTime: currentTime,
      turnaroundTime: currentTime - p.arrival,
      waitingTime: (currentTime - p.arrival) - p.burst,
      responseTime: responses.get(p.id)!,
    });
    completed.push(p.id);
  }
  return { steps, processStats: stats };
};

export const ljf = (processes: Process[]): SimulationResult => {
  const steps: SimulationStep[] = [];
  const stats: ProcessStats[] = [];
  let currentTime = 0;
  const completed: number[] = [];

  while (completed.length < processes.length) {
    const ready = processes.filter(p => p.arrival <= currentTime && !completed.includes(p.id));

    if (ready.length === 0) {
      steps.push({ time: currentTime, type: 'idle' });
      currentTime++;
      continue;
    }

    ready.sort((a, b) => b.burst - a.burst || a.arrival - b.arrival || a.id - b.id);
    const p = ready[0];

    for (let i = 0; i < p.burst; i++) {
        steps.push({ time: currentTime, processId: p.id, type: 'running', remainingBurst: p.burst - i - 1 });
        currentTime++;
    }

    stats.push({
      id: p.id,
      finishTime: currentTime,
      turnaroundTime: currentTime - p.arrival,
      waitingTime: (currentTime - p.arrival) - p.burst,
      responseTime: (currentTime - p.burst) - p.arrival,
    });
    completed.push(p.id);
  }
  return { steps, processStats: stats };
};

export const lrtf = (processes: Process[]): SimulationResult => {
    const steps: SimulationStep[] = [];
    const stats: ProcessStats[] = [];
    let currentTime = 0;
    const procMap = new Map<number, { p: Process, remaining: number, arrived: boolean, responseTime?: number }>(
      processes.map(p => [p.id, { p, remaining: p.burst, arrived: false }])
    );
  
    while (stats.length < processes.length) {
      processes.forEach(p => {
        if (p.arrival <= currentTime) procMap.get(p.id)!.arrived = true;
      });
  
      const ready = Array.from(procMap.values()).filter(v => v.arrived && v.remaining > 0);
  
      if (ready.length === 0) {
        steps.push({ time: currentTime, type: 'idle' });
        currentTime++;
        continue;
      }
  
      ready.sort((a, b) => b.remaining - a.remaining || a.p.arrival - b.p.arrival || a.p.id - b.p.id);
      const current = ready[0];
  
      if (current.responseTime === undefined) current.responseTime = currentTime - current.p.arrival;
  
      steps.push({ time: currentTime, processId: current.p.id, type: 'running', remainingBurst: current.remaining - 1 });
      current.remaining--;
      currentTime++;
  
      if (current.remaining === 0) {
        stats.push({
          id: current.p.id,
          finishTime: currentTime,
          turnaroundTime: currentTime - current.p.arrival,
          waitingTime: (currentTime - current.p.arrival) - current.p.burst,
          responseTime: current.responseTime,
        });
      }
    }
    return { steps, processStats: stats };
  };

// ─────────────────────────────────────────────────────────────
// Priority Round Robin (Priority RR)
// Processes are grouped by priority, and round robin is applied
// within each priority group.
// ─────────────────────────────────────────────────────────────
export const priorityRR = (processes: Process[], quantum: number = 2): SimulationResult => {
  const steps: SimulationStep[] = [];
  const stats: ProcessStats[] = [];
  let currentTime = 0;

  const procMap = new Map<number, { p: Process; remaining: number; firstResponse?: number }>(
    processes.map(p => [p.id, { p, remaining: p.burst }])
  );

  const sorted = [...processes].sort((a, b) => a.arrival - b.arrival || (a.priority || 0) - (b.priority || 0));
  // queue stores [pid, priority]
  const queue: number[] = [];
  let lastArrivedIndex = 0;

  const checkArrivals = () => {
    // collect newly arrived, sorted by priority then arrival
    const newArrivals: Process[] = [];
    while (lastArrivedIndex < sorted.length && sorted[lastArrivedIndex].arrival <= currentTime) {
      newArrivals.push(sorted[lastArrivedIndex]);
      lastArrivedIndex++;
    }
    newArrivals.sort((a, b) => (a.priority || 0) - (b.priority || 0) || a.arrival - b.arrival);
    newArrivals.forEach(p => queue.push(p.id));
  };

  while (stats.length < processes.length) {
    checkArrivals();

    if (queue.length === 0) {
      steps.push({ time: currentTime, type: 'idle' });
      currentTime++;
      continue;
    }

    const pid = queue.shift()!;
    const state = procMap.get(pid)!;
    if (state.firstResponse === undefined) state.firstResponse = currentTime - state.p.arrival;

    const runTime = Math.min(state.remaining, quantum);
    for (let i = 0; i < runTime; i++) {
      steps.push({ time: currentTime, processId: pid, type: 'running', remainingBurst: state.remaining - 1 });
      state.remaining--;
      currentTime++;
      checkArrivals();
    }

    if (state.remaining > 0) {
      // re-insert with same priority — find correct position
      let insertIdx = queue.length;
      for (let i = 0; i < queue.length; i++) {
        const qp = procMap.get(queue[i])!.p;
        if ((qp.priority || 0) > (state.p.priority || 0)) { insertIdx = i; break; }
      }
      queue.splice(insertIdx, 0, pid);
    } else {
      stats.push({
        id: pid,
        finishTime: currentTime,
        turnaroundTime: currentTime - state.p.arrival,
        waitingTime: currentTime - state.p.arrival - state.p.burst,
        responseTime: state.firstResponse!,
      });
    }
  }

  return { steps, processStats: stats };
};

// ─────────────────────────────────────────────────────────────
// SPT — Shortest Processing Time  (alias for SJF non-preemptive)
// ─────────────────────────────────────────────────────────────
export const spt = (processes: Process[]): SimulationResult => sjf(processes);

// ─────────────────────────────────────────────────────────────
// LPT — Longest Processing Time  (alias for LJF non-preemptive)
// ─────────────────────────────────────────────────────────────
export const lpt = (processes: Process[]): SimulationResult => ljf(processes);

// ─────────────────────────────────────────────────────────────
// EDD — Earliest Due Date
// Non-preemptive. Selects the process with the earliest deadline.
// Uses the `deadline` field; if missing, defaults to arrival + burst.
// ─────────────────────────────────────────────────────────────
export const edd = (processes: Process[]): SimulationResult => {
  const steps: SimulationStep[] = [];
  const stats: ProcessStats[] = [];
  let currentTime = 0;
  const completed: number[] = [];
  const responses = new Map<number, number>();

  while (completed.length < processes.length) {
    const ready = processes.filter(p => p.arrival <= currentTime && !completed.includes(p.id));

    if (ready.length === 0) {
      steps.push({ time: currentTime, type: 'idle' });
      currentTime++;
      continue;
    }

    ready.sort((a, b) => {
      const da = a.deadline ?? (a.arrival + a.burst);
      const db = b.deadline ?? (b.arrival + b.burst);
      return da - db || a.arrival - b.arrival || a.id - b.id;
    });

    const p = ready[0];
    if (!responses.has(p.id)) responses.set(p.id, currentTime - p.arrival);

    for (let i = 0; i < p.burst; i++) {
      steps.push({ time: currentTime, processId: p.id, type: 'running', remainingBurst: p.burst - i - 1 });
      currentTime++;
    }

    stats.push({
      id: p.id,
      finishTime: currentTime,
      turnaroundTime: currentTime - p.arrival,
      waitingTime: currentTime - p.arrival - p.burst,
      responseTime: responses.get(p.id)!,
    });
    completed.push(p.id);
  }

  return { steps, processStats: stats };
};

// ─────────────────────────────────────────────────────────────
// MUF — Maximum Urgency First
// Urgency = priority / (deadline - currentTime). Higher urgency runs first.
// Preemptive, real-time. Uses `priority` and `deadline`.
// ─────────────────────────────────────────────────────────────
export const muf = (processes: Process[]): SimulationResult => {
  const steps: SimulationStep[] = [];
  const stats: ProcessStats[] = [];
  let currentTime = 0;
  const procMap = new Map<number, { p: Process; remaining: number; arrived: boolean; responseTime?: number }>(
    processes.map(p => [p.id, { p, remaining: p.burst, arrived: false }])
  );

  while (stats.length < processes.length) {
    processes.forEach(p => { if (p.arrival <= currentTime) procMap.get(p.id)!.arrived = true; });
    const ready = Array.from(procMap.values()).filter(v => v.arrived && v.remaining > 0);

    if (ready.length === 0) { steps.push({ time: currentTime, type: 'idle' }); currentTime++; continue; }

    const urgency = (v: typeof ready[0]) => {
      const timeLeft = (v.p.deadline ?? (v.p.arrival + v.p.burst * 2)) - currentTime;
      return (v.p.priority || 1) / (timeLeft <= 0 ? 0.001 : timeLeft);
    };

    ready.sort((a, b) => urgency(b) - urgency(a) || a.p.arrival - b.p.arrival || a.p.id - b.p.id);
    const current = ready[0];

    if (current.responseTime === undefined) current.responseTime = currentTime - current.p.arrival;

    steps.push({ time: currentTime, processId: current.p.id, type: 'running', remainingBurst: current.remaining - 1 });
    current.remaining--;
    currentTime++;

    if (current.remaining === 0) {
      stats.push({
        id: current.p.id,
        finishTime: currentTime,
        turnaroundTime: currentTime - current.p.arrival,
        waitingTime: currentTime - current.p.arrival - current.p.burst,
        responseTime: current.responseTime,
      });
    }
  }

  return { steps, processStats: stats };
};

// ─────────────────────────────────────────────────────────────
// RMS — Rate Monotonic Scheduling
// Static priority assigned by period: shorter period → higher priority.
// Preemptive. Uses `period` field (defaults to arrival + burst if missing).
// ─────────────────────────────────────────────────────────────
export const rms = (processes: Process[]): SimulationResult => {
  // Assign priorities based on period (shorter period = higher priority = lower number)
  const enriched = processes.map(p => ({
    ...p,
    priority: p.period ?? (p.arrival + p.burst), // shorter period → lower value → higher priority
  }));
  return priorityPreemptive(enriched);
};

// ─────────────────────────────────────────────────────────────
// DMS — Deadline Monotonic Scheduling
// Static priority assigned by relative deadline: shorter deadline → higher priority.
// Preemptive. Uses `deadline` field.
// ─────────────────────────────────────────────────────────────
export const dms = (processes: Process[]): SimulationResult => {
  const enriched = processes.map(p => ({
    ...p,
    priority: p.deadline ?? (p.period ?? (p.arrival + p.burst)),
  }));
  return priorityPreemptive(enriched);
};

// ─────────────────────────────────────────────────────────────
// EDL — Earliest Deadline Late (Latest)
// Non-preemptive. Chooses the process whose deadline expires latest,
// i.e. the one that can afford to wait the longest.
// ─────────────────────────────────────────────────────────────
export const edl = (processes: Process[]): SimulationResult => {
  const steps: SimulationStep[] = [];
  const stats: ProcessStats[] = [];
  let currentTime = 0;
  const completed: number[] = [];
  const responses = new Map<number, number>();

  while (completed.length < processes.length) {
    const ready = processes.filter(p => p.arrival <= currentTime && !completed.includes(p.id));

    if (ready.length === 0) { steps.push({ time: currentTime, type: 'idle' }); currentTime++; continue; }

    // Pick the one with the LATEST deadline (i.e. can wait the most)
    ready.sort((a, b) => {
      const da = a.deadline ?? (a.arrival + a.burst * 3);
      const db = b.deadline ?? (b.arrival + b.burst * 3);
      return db - da || a.arrival - b.arrival || a.id - b.id;
    });

    const p = ready[0];
    if (!responses.has(p.id)) responses.set(p.id, currentTime - p.arrival);

    for (let i = 0; i < p.burst; i++) {
      steps.push({ time: currentTime, processId: p.id, type: 'running', remainingBurst: p.burst - i - 1 });
      currentTime++;
    }

    stats.push({
      id: p.id,
      finishTime: currentTime,
      turnaroundTime: currentTime - p.arrival,
      waitingTime: currentTime - p.arrival - p.burst,
      responseTime: responses.get(p.id)!,
    });
    completed.push(p.id);
  }

  return { steps, processStats: stats };
};

// ─────────────────────────────────────────────────────────────
// TBS — Total Bandwidth Server
// Aperiodic model: assigns virtual deadlines = max(prevDeadline, arrival) + burst/U_s
// where U_s is a server utilization factor (1 - sum of task utilizations, capped at 0.9).
// Then runs EDF on those virtual deadlines.
// ─────────────────────────────────────────────────────────────
export const tbs = (processes: Process[]): SimulationResult => {
  // Estimate server utilization: U_s = 1 - Σ(burst_i / period_i), floor at 0.1
  let taskUtil = 0;
  processes.forEach(p => { if (p.period) taskUtil += p.burst / p.period; });
  const Us = Math.max(0.1, 1 - taskUtil);

  // Assign virtual deadlines
  let prevDeadline = 0;
  const sorted = [...processes].sort((a, b) => a.arrival - b.arrival);
  const enriched = sorted.map(p => {
    const vd = Math.max(prevDeadline, p.arrival) + p.burst / Us;
    prevDeadline = vd;
    return { ...p, deadline: Math.round(vd) };
  });

  return edd(enriched);
};

// ─────────────────────────────────────────────────────────────
// DRR — Deficit Round Robin
// Each process has a deficit counter (starts at 0) plus a quantum (per-process
// or global). On each round, deficit += quantum; run as many units as deficit allows.
// ─────────────────────────────────────────────────────────────
export const drr = (processes: Process[], defaultQuantum: number = 3): SimulationResult => {
  const steps: SimulationStep[] = [];
  const stats: ProcessStats[] = [];
  let currentTime = 0;

  const state = new Map(processes.map(p => ({
    ...p,
    qnt: p.quantum ?? defaultQuantum,
  })).map(p => [p.id, { p, remaining: p.burst, deficit: 0, firstResponse: undefined as number | undefined }]));

  const sorted = [...processes].sort((a, b) => a.arrival - b.arrival);
  const queue: number[] = [];
  let lastArrivedIndex = 0;

  const checkArrivals = () => {
    while (lastArrivedIndex < sorted.length && sorted[lastArrivedIndex].arrival <= currentTime) {
      queue.push(sorted[lastArrivedIndex].id);
      lastArrivedIndex++;
    }
  };

  while (stats.length < processes.length) {
    checkArrivals();

    if (queue.length === 0) { steps.push({ time: currentTime, type: 'idle' }); currentTime++; continue; }

    const pid = queue.shift()!;
    const s = state.get(pid)!;
    const qnt = s.p.quantum ?? defaultQuantum;

    s.deficit += qnt;
    if (s.firstResponse === undefined) s.firstResponse = currentTime - s.p.arrival;

    while (s.deficit > 0 && s.remaining > 0) {
      steps.push({ time: currentTime, processId: pid, type: 'running', remainingBurst: s.remaining - 1 });
      s.remaining--;
      s.deficit--;
      currentTime++;
      checkArrivals();
    }

    if (s.remaining === 0) {
      s.deficit = 0;
      stats.push({
        id: pid,
        finishTime: currentTime,
        turnaroundTime: currentTime - s.p.arrival,
        waitingTime: currentTime - s.p.arrival - s.p.burst,
        responseTime: s.firstResponse!,
      });
    } else {
      queue.push(pid);
    }
  }

  return { steps, processStats: stats };
};
