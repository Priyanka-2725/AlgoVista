import { InteractiveLesson, TraceStep } from '@/features/interactive-lesson/types';
import { TableMemoryState } from '@/features/interactive-lesson/renderers/TableMemoryRenderer';

function generateAcidTraces(controls: Record<string, any>): TraceStep<TableMemoryState>[] {
  const steps: TraceStep<TableMemoryState>[] = [];
  
  const enableTxn = controls['enableTxn'] !== false; // default true
  const crashMidTransfer = controls['crashMidTransfer'] === true;

  let aliceBalance = 10000;
  let bobBalance = 5000;
  let log: { id: string, cells: string[] }[] = [];

  const getState = (
    highlightAlice: boolean = false, 
    highlightBob: boolean = false, 
    crash: boolean = false, 
    recovered: boolean = false
  ): TableMemoryState => {
    return {
      tables: [
        {
          id: 'db_accounts',
          title: 'Bank Accounts Table',
          headers: ['Account', 'Balance', 'Status'],
          rows: [
            { id: 'alice', cells: ['Alice', `Rs. ${aliceBalance}`, 'Active'], status: highlightAlice ? 'highlight' : (crash ? 'error' : 'normal') },
            { id: 'bob', cells: ['Bob', `Rs. ${bobBalance}`, 'Active'], status: highlightBob ? 'highlight' : (crash ? 'error' : 'normal') }
          ]
        },
        {
          id: 'wal',
          title: 'Write-Ahead Log (WAL)',
          headers: ['Txn ID', 'Operation', 'State'],
          rows: [...log]
        }
      ],
      memoryBlocks: crash ? [
        { id: 'db_engine', label: 'Database Engine', type: 'code', content: ['FATAL ERROR', 'Power Loss Detected', 'Shutting down...'], status: 'crashed' }
      ] : recovered ? [
        { id: 'db_engine', label: 'Database Engine', type: 'code', content: ['Recovery Manager Active', 'Replaying WAL...', 'Consistency Restored'], status: 'active' }
      ] : []
    };
  };

  steps.push({
    step: 0,
    state: getState(),
    narration: 'Initial State: Alice has Rs. 10000, Bob has Rs. 5000. Alice wants to transfer Rs. 5000 to Bob.'
  });

  if (enableTxn) {
    log.push({ id: 'log1', cells: ['T1', 'BEGIN', 'Started'] });
    steps.push({
      step: 1,
      state: getState(),
      narration: 'Transactions ON: Engine writes [BEGIN T1] to the Write-Ahead Log.'
    });
  }

  // Deduct from Alice
  aliceBalance -= 5000;
  if (enableTxn) {
    log.push({ id: 'log2', cells: ['T1', 'UPDATE Alice -5000', 'Pending'] });
  }
  steps.push({
    step: 2,
    state: getState(true, false),
    narration: 'Deducted Rs. 5000 from Alice.'
  });

  if (crashMidTransfer) {
    steps.push({
      step: 3,
      state: getState(false, false, true),
      narration: 'CRASH! Power failure. The server goes completely dead.'
    });

    if (enableTxn) {
      // Recovery phase
      aliceBalance += 5000; // UNDO
      log.push({ id: 'log3', cells: ['T1', 'CRASH DETECTED', 'Aborted'] });
      log.push({ id: 'log4', cells: ['T1', 'UNDO UPDATE Alice', 'Rolled Back'] });
      steps.push({
        step: 4,
        state: getState(true, false, false, true),
        narration: 'RESTART: Database boots up. It reads the WAL, sees T1 never committed, and UNDOES the deduction (Atomicity!).'
      });
      return steps; // Ended safely via rollback
    } else {
      steps.push({
        step: 4,
        state: getState(true, true, true), // broken state
        narration: 'RESTART: Without Transactions, the database has no memory of the half-finished transfer. Rs. 5000 vanished into thin air! (Inconsistent State)'
      });
      return steps; // Ended in failure
    }
  }

  // Credit to Bob
  bobBalance += 5000;
  if (enableTxn) {
    log.push({ id: 'log3', cells: ['T1', 'UPDATE Bob +5000', 'Pending'] });
  }
  steps.push({
    step: 3,
    state: getState(false, true),
    narration: 'Credited Rs. 5000 to Bob.'
  });

  if (enableTxn) {
    log.push({ id: 'log4', cells: ['T1', 'COMMIT', 'Success'] });
    steps.push({
      step: 4,
      state: getState(),
      narration: 'COMMIT: The transaction is saved permanently (Durability). Transfer successful.'
    });
  } else {
    steps.push({
      step: 4,
      state: getState(),
      narration: 'Transfer completed. (But without a transaction, we were lucky it didn\'t crash midway).'
    });
  }

  return steps;
}

export const acidPropertiesLesson: InteractiveLesson<TableMemoryState> = {
  id: 'dbms_acid',
  subject: 'Database Systems',
  title: 'ACID Properties',
  difficulty: 'Medium',
  estMinutes: 20,
  prerequisites: [],
  hook: {
    scenario: 'Rs. 5,000 is deducted from your account. Before it reaches your friend\'s account, the bank\'s server loses power. Is your money gone forever?',
    rendererId: 'TableMemoryRenderer',
    initialState: { tables: [] }
  },
  predict: {
    question: 'The server crashes exactly after the debit, but before the credit. What happens when the server turns back on?',
    options: ['The money is lost forever.', 'The database undoes the debit automatically.', 'The database finishes the credit automatically.', 'The bank calls you to apologize.'],
    correctIndex: 1,
    whyExplanation: 'Due to the "Atomicity" property (the A in ACID), a transaction is "All or Nothing". It uses a Write-Ahead Log (WAL) to Undo partial work upon restart.'
  },
  play: {
    rendererId: 'TableMemoryRenderer',
    controls: [
      { id: 'enableTxn', label: 'Enable Transactions (ACID)', type: 'toggle', defaultValue: true },
      { id: 'crashMidTransfer', label: 'Crash Server Mid-Transfer', type: 'toggle', defaultValue: false }
    ],
    presets: [
      { name: 'Normal Transfer', state: { enableTxn: true, crashMidTransfer: false } },
      { name: 'Safe Crash (Atomicity)', state: { enableTxn: true, crashMidTransfer: true } },
      { name: 'Lost Money Bug', state: { enableTxn: false, crashMidTransfer: true } }
    ],
    traceGenerator: generateAcidTraces
  },
  breakIt: {
    goal: 'Make the money vanish! Turn OFF Transactions and trigger a Server Crash midway to violate Consistency.',
    successCondition: (state: TableMemoryState) => {
      // Check if both crash is true and alice + bob balance != 15000
      const accTable = state.tables?.find(t => t.id === 'db_accounts');
      if (!accTable) return false;
      const aliceRow = accTable.rows.find(r => r.id === 'alice');
      const bobRow = accTable.rows.find(r => r.id === 'bob');
      if (aliceRow && bobRow) {
        const aBal = parseInt(aliceRow.cells[1].replace('Rs. ', ''));
        const bBal = parseInt(bobRow.cells[1].replace('Rs. ', ''));
        return aBal + bBal < 15000;
      }
      return false;
    },
    hint: 'If you do NOT wrap the debit and credit in a transaction (BEGIN ... COMMIT), the database has no safety net when it crashes.'
  },
  explain: {
    keyPoints: [
      'Atomicity: All or Nothing. (No partial transfers).',
      'Consistency: The database rules (like sum of money) remain valid before and after.',
      'Isolation: Concurrent transactions don\'t interfere with each other.',
      'Durability: Once committed, it survives power loss (via Write-Ahead Logging).'
    ],
    complexity: {
      time: 'O(1) overhead for WAL',
      space: 'O(log entries) on disk'
    },
    analogy: 'Atomicity is like buying a coffee. You don\'t hand over the money, wait 5 minutes, and then get the coffee. It\'s a single atomic swap at the counter. If the barista drops the cup, they hand the money back.'
  },
  code: {
    starterCode: `-- SQL Transaction Example\nBEGIN TRANSACTION;\n\nUPDATE accounts SET balance = balance - 5000 WHERE name = 'Alice';\n-- CRASH HAPPENS HERE\nUPDATE accounts SET balance = balance + 5000 WHERE name = 'Bob';\n\nCOMMIT;`,
    language: ['sql'],
    testCases: []
  },
  viva: {
    aiPromptContext: 'You are an interviewer. Ask the candidate how databases actually implement Atomicity and Durability (hint: Write Ahead Log).',
    seedQuestions: [
      'How does the database know what to UNDO when it restarts after a crash?',
      'Can you explain what the Write-Ahead Log (WAL) is?'
    ]
  },
  xp: {
    base: 150,
    predictBonus: 50,
    breakItBonus: 150
  }
};
