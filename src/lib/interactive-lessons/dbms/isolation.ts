import { InteractiveLesson, TraceStep } from '@/features/interactive-lesson/types';
import { TimelineState } from '@/features/interactive-lesson/renderers/TimelineRenderer';

function generateIsolationTraces(controls: Record<string, any>): TraceStep<TimelineState>[] {
  const steps: TraceStep<TimelineState>[] = [];
  const level = controls['isolationLevel'] || 'READ_UNCOMMITTED';
  const issueToShow = controls['issue'] || 'dirty_read';

  const getState = (time: number, msg: string, isBroken: boolean = false): TimelineState => {
    return {
      timeRange: [0, 6],
      currentTime: time,
      lanes: [
        { id: 'T1', label: 'Transaction 1 (Update)', items: t1Items },
        { id: 'T2', label: 'Transaction 2 (Read)', items: t2Items }
      ],
      globalStatus: isBroken ? 'deadlock' : 'running', // hack for broken styling
      message: msg
    };
  };

  let t1Items: any[] = [];
  let t2Items: any[] = [];
  let stepCount = 0;

  if (issueToShow === 'dirty_read') {
    // T1 Updates, T2 Reads, T1 Rolls back
    steps.push({ step: stepCount++, state: getState(0, 'Initial Balance = $100'), narration: 'Starting state: Account balance is $100.' });
    
    t1Items.push({ id: 't1_1', label: 'BEGIN', start: 0, end: 1, status: 'success' });
    steps.push({ step: stepCount++, state: getState(1, 'T1 begins.'), narration: 'T1 starts.' });

    t1Items.push({ id: 't1_2', label: 'UPDATE: $200', start: 1, end: 2, status: 'success' });
    steps.push({ step: stepCount++, state: getState(2, 'T1 updates balance to $200 (Uncommitted).'), narration: 'T1 updates the balance to $200, but HAS NOT committed yet.' });

    t2Items.push({ id: 't2_1', label: 'BEGIN', start: 2, end: 3, status: 'success' });
    
    if (level === 'READ_UNCOMMITTED') {
      t2Items.push({ id: 't2_2', label: 'READ: $200', start: 3, end: 4, status: 'success' });
      steps.push({ step: stepCount++, state: getState(4, 'T2 reads $200.'), narration: 'T2 reads the uncommitted value ($200).' });

      t1Items.push({ id: 't1_3', label: 'ROLLBACK', start: 4, end: 5, status: 'error' });
      steps.push({ step: stepCount++, state: getState(5, 'T1 Rolls back to $100.', true), narration: 'T1 rolls back! The balance is actually $100. T2 just did a DIRTY READ and is using fake data!' });
    } else {
      // READ COMMITTED or higher blocks dirty read
      t2Items.push({ id: 't2_2', label: 'WAITING (Lock)', start: 3, end: 5, status: 'blocked' });
      steps.push({ step: stepCount++, state: getState(5, 'T2 blocked from reading uncommitted data.'), narration: `${level} prevents Dirty Reads. T2 must wait for T1 to finish.` });

      t1Items.push({ id: 't1_3', label: 'ROLLBACK', start: 5, end: 6, status: 'error' });
      steps.push({ step: stepCount++, state: getState(6, 'T1 Rolls back to $100.'), narration: 'T1 rolls back.' });
    }
  } else if (issueToShow === 'non_repeatable_read') {
    // T2 Reads, T1 Updates & Commits, T2 Reads again
    t2Items.push({ id: 't2_1', label: 'READ: $100', start: 0, end: 1, status: 'success' });
    steps.push({ step: stepCount++, state: getState(1, 'T2 reads $100.'), narration: 'T2 reads the balance ($100).' });

    t1Items.push({ id: 't1_1', label: 'UPDATE: $200', start: 1, end: 2, status: 'success' });
    t1Items.push({ id: 't1_2', label: 'COMMIT', start: 2, end: 3, status: 'success' });
    steps.push({ step: stepCount++, state: getState(3, 'T1 updates to $200 and commits.'), narration: 'T1 sneaks in, changes the balance to $200, and commits.' });

    if (level === 'READ_UNCOMMITTED' || level === 'READ_COMMITTED') {
      t2Items.push({ id: 't2_2', label: 'READ: $200', start: 3, end: 4, status: 'success' });
      steps.push({ step: stepCount++, state: getState(4, 'T2 reads $200 (Different from first read!).', true), narration: 'T2 reads again. It got $100 the first time, now it gets $200. NON-REPEATABLE READ!' });
    } else {
      // REPEATABLE_READ or SERIALIZABLE blocks it
      t2Items.push({ id: 't2_2', label: 'READ: $100 (Snapshot)', start: 3, end: 4, status: 'success' });
      steps.push({ step: stepCount++, state: getState(4, 'T2 reads $100.'), narration: `${level} guarantees repeatable reads. T2 reads from a snapshot and still sees $100.` });
    }
  }

  return steps;
}

export const isolationLevelsLesson: InteractiveLesson<TimelineState> = {
  id: 'dbms_isolation',
  subject: 'Database Systems',
  title: 'Isolation Levels',
  difficulty: 'Hard',
  estMinutes: 20,
  prerequisites: ['ACID Properties'],
  hook: {
    scenario: 'You query your bank balance, it says $100. Two seconds later, before you buy anything, you query it again and it says $200. Someone else deposited money while you were looking. Should your database hide this change from you until your transaction finishes?',
    rendererId: 'TimelineRenderer',
    initialState: { timeRange: [0, 6], currentTime: 0, lanes: [], globalStatus: 'running' }
  },
  predict: {
    question: 'Transaction A is calculating total sales. Halfway through, Transaction B inserts a new massive sale and commits. Should A include B\'s new sale in its final total?',
    options: ['Yes, always include the latest data.', 'No, A should only see the data as it was when A started (Snapshot).', 'A should crash and retry.', 'Yes, but only if it\'s a Read-Uncommitted level.'],
    correctIndex: 1,
    whyExplanation: 'If A includes the new row halfway through, it experiences a "Phantom Read". Higher isolation levels like Serializable or Repeatable Read (with MVCC) freeze a snapshot in time to prevent this.'
  },
  play: {
    rendererId: 'TimelineRenderer',
    controls: [
      { id: 'isolationLevel', label: 'Isolation Level', type: 'radio', options: ['READ_UNCOMMITTED', 'READ_COMMITTED', 'REPEATABLE_READ'], defaultValue: 'READ_UNCOMMITTED' },
      { id: 'issue', label: 'Transaction Interleaving Scenario', type: 'radio', options: ['dirty_read', 'non_repeatable_read'], defaultValue: 'dirty_read' }
    ],
    presets: [
      { name: 'Dirty Read Bug', state: { isolationLevel: 'READ_UNCOMMITTED', issue: 'dirty_read' } },
      { name: 'Fix Dirty Read', state: { isolationLevel: 'READ_COMMITTED', issue: 'dirty_read' } },
      { name: 'Non-Repeatable Read Bug', state: { isolationLevel: 'READ_COMMITTED', issue: 'non_repeatable_read' } },
      { name: 'Fix Non-Repeatable Read', state: { isolationLevel: 'REPEATABLE_READ', issue: 'non_repeatable_read' } }
    ],
    traceGenerator: generateIsolationTraces
  },
  breakIt: {
    goal: 'Create a Non-Repeatable Read! Make Transaction 2 read two different values ($100 then $200) within the SAME transaction.',
    successCondition: (state: TimelineState) => state.globalStatus === 'deadlock', // Reused error state styling for success
    hint: 'A Non-Repeatable read happens when T1 modifies data that T2 is currently looking at. You need an Isolation Level lower than REPEATABLE_READ.'
  },
  explain: {
    keyPoints: [
      'Dirty Read: Reading uncommitted data that might get rolled back.',
      'Non-Repeatable Read: Reading the same row twice and getting different data because another transaction updated it.',
      'Phantom Read: Running a WHERE query twice and getting a different number of rows because another transaction INSERTED a row.',
      'Higher isolation = more locks = worse performance. Trade-offs are necessary!'
    ],
    complexity: {
      time: 'Serializable is the slowest',
      space: 'MVCC uses extra space for snapshots'
    },
    analogy: 'Dirty Read is like reading your friend\'s essay over their shoulder before they submit it, using their arguments, and then they delete the whole essay.'
  },
  code: {
    starterCode: `-- Setting Isolation Level\nSET TRANSACTION ISOLATION LEVEL READ COMMITTED;\nBEGIN TRANSACTION;\n\nSELECT balance FROM accounts WHERE id = 1;\n-- Do some work...\nSELECT balance FROM accounts WHERE id = 1;\n\nCOMMIT;`,
    language: ['sql'],
    testCases: []
  },
  viva: {
    aiPromptContext: 'You are an interviewer. Ask the candidate to explain the difference between a Non-Repeatable Read and a Phantom Read.',
    seedQuestions: [
      'What is the difference between a Non-Repeatable Read and a Phantom Read?',
      'If you are building a banking app, which isolation level is appropriate for transferring funds?'
    ]
  },
  xp: {
    base: 150,
    predictBonus: 50,
    breakItBonus: 100
  }
};
