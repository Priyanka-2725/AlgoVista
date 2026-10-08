import { InteractiveLesson, TraceStep } from '@/features/interactive-lesson/types';
import { ArrayState } from '@/features/interactive-lesson/renderers/ArrayRenderer';

function generateOsiTraces(controls: Record<string, any>): TraceStep<ArrayState>[] {
  const steps: TraceStep<ArrayState>[] = [];
  const action = controls['action'] || 'send'; // 'send' or 'receive'

  const getPacketState = (headers: string[], activeIdx: number): ArrayState => {
    return {
      array: headers.map((h, i) => ({
        value: h,
        status: i === activeIdx ? 'comparing' : 'sorted'
      })),
      pointers: { 'Current Layer': activeIdx },
      stats: { 'Packet Size': headers.length * 20 + ' Bytes' }
    };
  };

  let stepCount = 0;

  if (action === 'send') {
    // Encapsulation (Top to Bottom)
    steps.push({
      step: stepCount++,
      state: getPacketState(['Data Payload'], 0),
      narration: 'You click "Send" on an email. The Application Layer creates the raw Data Payload.'
    });

    steps.push({
      step: stepCount++,
      state: getPacketState(['HTTP/SMTP', 'Data Payload'], 0),
      narration: 'Application Layer (L7) adds protocol headers so the receiving app knows how to read it.'
    });

    steps.push({
      step: stepCount++,
      state: getPacketState(['TCP Port 80', 'HTTP/SMTP', 'Data Payload'], 0),
      narration: 'Transport Layer (L4) adds port numbers to ensure it goes to the right background process (not your game).'
    });

    steps.push({
      step: stepCount++,
      state: getPacketState(['IP: 142.250', 'TCP Port 80', 'HTTP/SMTP', 'Data Payload'], 0),
      narration: 'Network Layer (L3) adds the destination IP address so routers can navigate the global internet.'
    });

    steps.push({
      step: stepCount++,
      state: getPacketState(['MAC: 0A:B2', 'IP: 142.250', 'TCP Port 80', 'HTTP/SMTP', 'Data Payload'], 0),
      narration: 'Data Link Layer (L2) adds the physical MAC address to get it to the very next router hop.'
    });
    
    steps.push({
      step: stepCount++,
      state: getPacketState(['MAC: 0A:B2', 'IP: 142.250', 'TCP Port 80', 'HTTP/SMTP', 'Data Payload'], -1),
      narration: 'Physical Layer (L1) converts it all to 1s and 0s and blasts it over fiber optics! This is Encapsulation.'
    });
  } else {
    // Decapsulation (Bottom to Top)
    steps.push({
      step: stepCount++,
      state: getPacketState(['MAC: 0A:B2', 'IP: 142.250', 'TCP Port 80', 'HTTP/SMTP', 'Data Payload'], 0),
      narration: 'Server receives 1s and 0s on the wire. Data Link Layer (L2) reads the MAC address to confirm it belongs here.'
    });

    steps.push({
      step: stepCount++,
      state: getPacketState(['IP: 142.250', 'TCP Port 80', 'HTTP/SMTP', 'Data Payload'], 0),
      narration: 'Network Layer (L3) strips L2 header and reads the IP address.'
    });

    steps.push({
      step: stepCount++,
      state: getPacketState(['TCP Port 80', 'HTTP/SMTP', 'Data Payload'], 0),
      narration: 'Transport Layer (L4) strips the IP header and looks at the Port to know which application to send it to.'
    });

    steps.push({
      step: stepCount++,
      state: getPacketState(['HTTP/SMTP', 'Data Payload'], 0),
      narration: 'Application Layer (L7) strips the port header and parses the HTTP request.'
    });

    steps.push({
      step: stepCount++,
      state: getPacketState(['Data Payload'], 0),
      narration: 'The server finally gets the raw data and reads your email. This is Decapsulation!'
    });
  }

  return steps;
}

export const osiLesson: InteractiveLesson<ArrayState> = {
  id: 'cn_osi_model',
  subject: 'Computer Networks',
  title: 'The OSI Model (Encapsulation)',
  difficulty: 'Easy',
  estMinutes: 15,
  prerequisites: ['Networking Basics'],
  hook: {
    scenario: 'You send a message. Your computer adds a massive wrapper of meta-data around your tiny text. Without it, the internet falls apart. Let\'s see how a packet is built.',
    rendererId: 'ArrayRenderer',
    initialState: { array: [], pointers: {} }
  },
  predict: {
    question: 'Which layer is responsible for attaching IP Addresses (like 192.168.1.1)?',
    options: ['Application Layer', 'Transport Layer', 'Network Layer', 'Data Link Layer'],
    correctIndex: 2,
    whyExplanation: 'The Network Layer (Layer 3) handles global routing via IP addresses. Transport (L4) handles Ports. Data Link (L2) handles local MAC addresses.'
  },
  play: {
    rendererId: 'ArrayRenderer',
    controls: [
      { id: 'action', label: 'Action', type: 'radio', options: ['send', 'receive'], defaultValue: 'send' }
    ],
    presets: [
      { name: 'Sending Data (Encapsulate)', state: { action: 'send' } },
      { name: 'Receiving Data (Decapsulate)', state: { action: 'receive' } }
    ],
    traceGenerator: generateOsiTraces
  },
  breakIt: {
    goal: 'See what the server does when it receives the packet. Play the "Receiving Data" preset to watch Decapsulation.',
    successCondition: (state: ArrayState) => state.array.length === 1 && state.array[0].value === 'Data Payload',
    hint: 'Switch to the Receive preset.'
  },
  explain: {
    keyPoints: [
      'Encapsulation: As data goes DOWN the OSI model (Sender), each layer wraps the data in its own header.',
      'Decapsulation: As data goes UP the OSI model (Receiver), each layer unwraps its specific header.',
      'Layer 4 (Transport) = Ports (TCP/UDP).',
      'Layer 3 (Network) = IP Addresses (Global Routing).',
      'Layer 2 (Data Link) = MAC Addresses (Local Hop-to-Hop).'
    ],
    complexity: {
      time: 'O(1) per layer',
      space: 'Adds ~40-60 bytes of overhead per packet'
    },
    analogy: 'Sending a letter. Payload = The Letter. L7 = Envelope. L4 = Apartment Number. L3 = Street Address. L2 = Mail Truck moving it to the next post office.'
  },
  code: {
    starterCode: `// Pseudo-code of Encapsulation\nfunction sendData(payload) {\n  let packet = addAppHeader(payload);\n  packet = addTcpHeader(packet, 80);\n  packet = addIpHeader(packet, '142.250.0.1');\n  packet = addMacHeader(packet, '0A:B2:C3');\n  return transmitOverWire(packet);\n}`,
    language: ['javascript', 'python'],
    testCases: []
  },
  viva: {
    aiPromptContext: 'You are an interviewer. Ask the candidate what the difference between a MAC address and an IP address is, referencing the OSI model.',
    seedQuestions: [
      'What is the difference between a MAC address (L2) and an IP address (L3)?',
      'Why do we need both ports and IP addresses?'
    ]
  },
  xp: {
    base: 100,
    predictBonus: 50,
    breakItBonus: 50
  }
};
