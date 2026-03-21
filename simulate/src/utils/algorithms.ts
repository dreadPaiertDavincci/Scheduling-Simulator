export interface Process {
  id: number;
  arrival: number;
  burst: number;
  priority?: number;
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
