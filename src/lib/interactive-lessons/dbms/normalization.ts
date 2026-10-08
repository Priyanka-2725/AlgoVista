import { InteractiveLesson, TraceStep } from '@/features/interactive-lesson/types';
import { TableMemoryState } from '@/features/interactive-lesson/renderers/TableMemoryRenderer';

function generateNormalizationTraces(controls: Record<string, any>): TraceStep<TableMemoryState>[] {
  const steps: TraceStep<TableMemoryState>[] = [];
  
  const action = controls['action'] || 'none'; // 'none', 'insert_anomaly', 'update_anomaly', 'normalize_3nf'

  const getUnnormalizedState = (highlightRow?: string, highlightCol?: number, anomalyMsg?: string): TableMemoryState => {
    return {
      tables: [
        {
          id: 'messy_table',
          title: 'Unnormalized Orders Table',
          headers: ['OrderID', 'CustomerName', 'CustomerPhone', 'ProductID', 'ProductName'],
          rows: [
            { id: '1', cells: ['101', 'Alice', '555-0100', 'P1', 'Laptop'], status: highlightRow === '1' ? 'highlight' : 'normal' },
            { id: '2', cells: ['102', 'Alice', '555-0100', 'P2', 'Mouse'], status: highlightRow === '2' ? 'highlight' : 'normal' },
            { id: '3', cells: ['103', 'Bob', '555-0200', 'P1', 'Laptop'] }
          ].map(r => {
             if (highlightCol !== undefined && r.status === 'highlight') {
                 r.cells[highlightCol] = `[ ${r.cells[highlightCol]} ]`;
             }
             return r;
          })
        }
      ],
      memoryBlocks: anomalyMsg ? [
        { id: 'err', label: 'Anomaly Detected!', type: 'data', content: [anomalyMsg], status: 'crashed' }
      ] : []
    };
  };

  const getNormalizedState = (): TableMemoryState => {
    return {
      tables: [
        {
          id: 'customers',
          title: 'Customers (3NF)',
          headers: ['CustomerID', 'CustomerName', 'CustomerPhone'],
          rows: [
            { id: 'c1', cells: ['C1', 'Alice', '555-0100'], status: 'success' },
            { id: 'c2', cells: ['C2', 'Bob', '555-0200'], status: 'success' }
          ]
        },
        {
          id: 'products',
          title: 'Products (3NF)',
          headers: ['ProductID', 'ProductName'],
          rows: [
            { id: 'p1', cells: ['P1', 'Laptop'], status: 'success' },
            { id: 'p2', cells: ['P2', 'Mouse'], status: 'success' }
          ]
        },
        {
          id: 'orders',
          title: 'Orders (3NF)',
          headers: ['OrderID', 'CustomerID', 'ProductID'],
          rows: [
            { id: 'o1', cells: ['101', 'C1', 'P1'], status: 'success' },
            { id: 'o2', cells: ['102', 'C1', 'P2'], status: 'success' },
            { id: 'o3', cells: ['103', 'C2', 'P1'], status: 'success' }
          ]
        }
      ]
    };
  };

  steps.push({
    step: 0,
    state: getUnnormalizedState(),
    narration: 'A messy, unnormalized spreadsheet. Notice how Alice\'s phone number and the product "Laptop" are duplicated.'
  });

  if (action === 'update_anomaly') {
    steps.push({
      step: 1,
      state: getUnnormalizedState('1', 2), // highlight Alice's phone on row 1
      narration: 'Alice changes her phone number to 555-9999. You update Order 101...'
    });
    steps.push({
      step: 2,
      state: getUnnormalizedState('2', 2, 'Inconsistent Data! Alice has two different phone numbers now.'),
      narration: 'UPDATE ANOMALY: You forgot to update Order 102! Now the database thinks Alice has two different phone numbers.'
    });
  } else if (action === 'insert_anomaly') {
    steps.push({
      step: 1,
      state: getUnnormalizedState(undefined, undefined, 'Cannot insert Product without an Order! (Primary Key violation)'),
      narration: 'INSERT ANOMALY: We want to add a new Product "Keyboard" to our catalog, but nobody has ordered it yet. The OrderID is the primary key. We can\'t insert it!'
    });
  } else if (action === 'normalize_3NF') {
    steps.push({
      step: 1,
      state: getNormalizedState(),
      narration: 'Normalized to 3NF! We split the data into 3 tables linked by Foreign Keys. No more duplication. If Alice changes her phone number, we only update it in exactly ONE place.'
    });
  }

  return steps;
}

export const normalizationLesson: InteractiveLesson<TableMemoryState> = {
  id: 'dbms_normalization',
  subject: 'Database Systems',
  title: 'Database Normalization',
  difficulty: 'Easy',
  estMinutes: 15,
  prerequisites: ['Tables'],
  hook: {
    scenario: 'You build a store using one giant Excel-like table. A customer changes their address, and suddenly their past orders ship to the wrong house, but new ones ship correctly. What went wrong?',
    rendererId: 'TableMemoryRenderer',
    initialState: { tables: [] }
  },
  predict: {
    question: 'If you store `CustomerID, CustomerName, OrderID, Total` in a single table, what happens when you delete the only order a customer ever made?',
    options: ['Nothing, the customer stays in the system.', 'DELETE ANOMALY: You accidentally delete the Customer entirely.', 'The database refuses the deletion.', 'The total becomes negative.'],
    correctIndex: 1,
    whyExplanation: 'Because the Customer data is tied directly to the Order row, deleting the order deletes the customer. This is why we split data into separate tables!'
  },
  play: {
    rendererId: 'TableMemoryRenderer',
    controls: [
      { id: 'action', label: 'Action to Perform', type: 'radio', options: ['none', 'update_anomaly', 'insert_anomaly', 'normalize_3NF'], defaultValue: 'none' }
    ],
    presets: [
      { name: 'Messy Table', state: { action: 'none' } },
      { name: 'Trigger Update Anomaly', state: { action: 'update_anomaly' } },
      { name: 'Fix with 3NF Normalization', state: { action: 'normalize_3NF' } }
    ],
    traceGenerator: generateNormalizationTraces
  },
  breakIt: {
    goal: 'Expose the flaws of a messy table! Trigger an "Update Anomaly" to corrupt the data.',
    successCondition: (state: TableMemoryState) => {
      const err = state.memoryBlocks?.find(b => b.id === 'err');
      return err !== undefined && err.content[0].includes('Inconsistent Data');
    },
    hint: 'Select "Trigger Update Anomaly" from the Presets to see how duplicated data falls out of sync.'
  },
  explain: {
    keyPoints: [
      '1NF: Ensure every column has atomic values (no lists) and a primary key exists.',
      '2NF: Remove Partial Dependencies. Every column must depend on the ENTIRE primary key.',
      '3NF: Remove Transitive Dependencies. Columns shouldn\'t depend on non-key columns (e.g., CustomerPhone depends on CustomerName, not OrderID).'
    ],
    complexity: {
      time: 'Queries are slower due to JOINs',
      space: 'Significantly less wasted storage'
    },
    analogy: 'Normalization is like organizing your closet. Instead of throwing shirts, pants, and socks into one giant box, you create a drawer for each. It takes slightly longer to get dressed (JOINs), but you never lose a sock (Anomalies).'
  },
  code: {
    starterCode: `-- 3NF Table Creation\nCREATE TABLE Customers (\n  CustomerID INT PRIMARY KEY,\n  Name VARCHAR(100),\n  Phone VARCHAR(20)\n);\n\nCREATE TABLE Orders (\n  OrderID INT PRIMARY KEY,\n  CustomerID INT FOREIGN KEY REFERENCES Customers(CustomerID),\n  ProductID INT\n);`,
    language: ['sql'],
    testCases: []
  },
  viva: {
    aiPromptContext: 'You are an interviewer. Ask the candidate to define Boyce-Codd Normal Form (BCNF) or explain the downside of over-normalization.',
    seedQuestions: [
      'What is the performance trade-off of normalizing to 3NF or beyond?',
      'Can you give an example of an Insert Anomaly?'
    ]
  },
  xp: {
    base: 100,
    predictBonus: 50,
    breakItBonus: 50
  }
};
