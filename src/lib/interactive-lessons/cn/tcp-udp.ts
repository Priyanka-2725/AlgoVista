import { InteractiveLesson, TraceStep } from '@/features/interactive-lesson/types';
import { TimelineState } from '@/features/interactive-lesson/renderers/TimelineRenderer';

function generateTcpUdpTraces(controls: Record<string, any>): TraceStep<TimelineState>[] {
  const steps: TraceStep<TimelineState>[] = [];
  const networkCondition = controls['network'] || 'perfect'; // 'perfect', 'packet_loss'

  const getState = (time: number, msg: string, tcpItems: any[], udpItems: any[], isBroken: boolean = false): TimelineState => {
    return {
      timeRange: [0, 8],
      currentTime: time,
      lanes: [
        { id: 'TCP', label: 'TCP Connection (Reliable)', items: [...tcpItems] },
        { id: 'UDP', label: 'UDP Connection (Fast)', items: [...udpItems] }
      ],
      globalStatus: isBroken ? 'deadlock' : 'running',
      message: msg
    };
  };

  let tcp: any[] = [];
  let udp: any[] = [];
  let stepCount = 0;

  // Step 0: Start
  steps.push({
    step: stepCount++,
    state: getState(0, 'Initializing video stream. Client wants to receive data from Server.', tcp, udp),
    narration: 'We are starting a video stream. Watch how TCP and UDP approach sending the data.'
  });

  // Step 1: Handshake vs Instant Send
  tcp.push({ id: 'syn', label: 'SYN (Hello?)', start: 0, end: 1, status: 'blocked' });
  udp.push({ id: 'pkt1', label: 'Packet 1 (Video)', start: 0, end: 1, status: 'success' });
  steps.push({
    step: stepCount++,
    state: getState(1, 'TCP starts 3-way handshake. UDP just sends Data 1.', tcp, udp),
    narration: 'TCP is polite. It sends a SYN packet to ask if the server is ready. UDP just blindly blasts the first video packet!'
  });

  // Step 2: Handshake continues vs More Data
  tcp.push({ id: 'synack', label: 'SYN-ACK (Yes!)', start: 1, end: 2, status: 'blocked' });
  udp.push({ id: 'pkt2', label: 'Packet 2 (Video)', start: 1, end: 2, status: 'success' });
  steps.push({
    step: stepCount++,
    state: getState(2, 'TCP gets SYN-ACK. UDP sends Data 2.', tcp, udp),
    narration: 'Server replies to TCP with SYN-ACK. Meanwhile, UDP has already sent the second video frame.'
  });

  // Step 3: Handshake completes vs More Data
  tcp.push({ id: 'ack', label: 'ACK (Got it)', start: 2, end: 3, status: 'blocked' });
  udp.push({ id: 'pkt3', label: 'Packet 3 (Video)', start: 2, end: 3, status: 'success' });
  steps.push({
    step: stepCount++,
    state: getState(3, 'TCP finishes Handshake. UDP sends Data 3.', tcp, udp),
    narration: 'TCP finally finishes the 3-way handshake! It took 3 time units just to say hello. UDP is already streaming.'
  });

  // Step 4: TCP starts sending Data
  tcp.push({ id: 't_pkt1', label: 'Packet 1 (Data)', start: 3, end: 4, status: 'success' });
  if (networkCondition === 'perfect') {
    udp.push({ id: 'pkt4', label: 'Packet 4', start: 3, end: 4, status: 'success' });
    steps.push({
      step: stepCount++,
      state: getState(4, 'TCP starts sending data. Network is perfect.', tcp, udp),
      narration: 'TCP finally sends its first packet! UDP sends packet 4.'
    });

    tcp.push({ id: 't_ack1', label: 'ACK (Received 1)', start: 4, end: 5, status: 'success' });
    udp.push({ id: 'pkt5', label: 'Packet 5', start: 4, end: 5, status: 'success' });
    steps.push({
      step: stepCount++,
      state: getState(5, 'TCP acknowledges receipt. All good.', tcp, udp),
      narration: 'TCP receives an ACK from the client confirming Packet 1 arrived safely. If the network is perfect, TCP is just slower UDP.'
    });
  } else {
    // Packet Loss Scenario
    udp.push({ id: 'pkt4', label: 'Packet 4 (LOST)', start: 3, end: 4, status: 'error' });
    steps.push({
      step: stepCount++,
      state: getState(4, 'NETWORK GLITCH! Packet loss occurred.', tcp, udp, true),
      narration: 'A router dropped packets! UDP Packet 4 is gone forever. The video will have a glitch.'
    });

    // Step 5: TCP handles the loss
    tcp.push({ id: 't_pkt1_lost', label: 'Packet 1 (LOST)', start: 3, end: 4, status: 'error' }); // Retroactive label update for visual
    tcp[tcp.length-1].status = 'error';
    udp.push({ id: 'pkt5', label: 'Packet 5', start: 4, end: 5, status: 'success' });
    steps.push({
      step: stepCount++,
      state: getState(5, 'TCP detects missing ACK. UDP ignores the loss.', tcp, udp, true),
      narration: 'TCP also lost its packet! But because the server didn\'t receive an ACK, TCP knows it failed. UDP doesn\'t care and keeps sending Packet 5.'
    });

    // Step 6: TCP Retransmits
    tcp.push({ id: 't_pkt1_retry', label: 'RETRANSMIT Pkt 1', start: 5, end: 6, status: 'success' });
    udp.push({ id: 'pkt6', label: 'Packet 6', start: 5, end: 6, status: 'success' });
    steps.push({
      step: stepCount++,
      state: getState(6, 'TCP retransmits the lost packet!', tcp, udp),
      narration: 'TCP retransmits Packet 1! This guarantees 100% data delivery, but causes a major delay (buffering) in the stream.'
    });
  }

  return steps;
}

export const tcpUdpLesson: InteractiveLesson<TimelineState> = {
  id: 'cn_tcp_udp',
  subject: 'Computer Networks',
  title: 'TCP vs UDP',
  difficulty: 'Easy',
  estMinutes: 15,
  prerequisites: ['Networking Basics'],
  hook: {
    scenario: 'You are watching a live football game. Suddenly, the screen pixelates and glitches for 1 second, but then continues normally. Why didn\'t the video pause to load the missing frame?',
    rendererId: 'TimelineRenderer',
    initialState: { timeRange: [0, 8], currentTime: 0, lanes: [], globalStatus: 'running' }
  },
  predict: {
    question: 'If you are sending an email, and 1 packet out of 100 drops in the ocean, what happens if you use UDP?',
    options: ['The email arrives with a missing word.', 'The router automatically resends it.', 'The email waits in an outbox.', 'The server crashes.'],
    correctIndex: 0,
    whyExplanation: 'UDP provides NO guarantees! It fires and forgets. If you use UDP for email, dropped packets mean missing data. This is why Emails/Websites use TCP (which retransmits), and Live Video/Gaming uses UDP (glitches are better than lag).'
  },
  play: {
    rendererId: 'TimelineRenderer',
    controls: [
      { id: 'network', label: 'Network Condition', type: 'radio', options: ['perfect', 'packet_loss'], defaultValue: 'perfect' }
    ],
    presets: [
      { name: 'Perfect Network', state: { network: 'perfect' } },
      { name: 'Unstable Wi-Fi (Packet Loss)', state: { network: 'packet_loss' } }
    ],
    traceGenerator: generateTcpUdpTraces
  },
  breakIt: {
    goal: 'Force the network to drop packets. Watch how TCP guarantees delivery at the cost of time, while UDP sacrifices data for speed.',
    successCondition: (state: TimelineState) => state.globalStatus === 'deadlock', // using deadlock as visual trigger
    hint: 'Switch the network condition to Packet Loss.'
  },
  explain: {
    keyPoints: [
      'TCP (Transmission Control Protocol) is Connection-Oriented. It requires a 3-way handshake (SYN, SYN-ACK, ACK) before sending anything.',
      'TCP guarantees delivery. If a packet drops, it waits and retransmits it. Great for files, emails, and web pages.',
      'UDP (User Datagram Protocol) is Connectionless. It just blasts data. If a packet drops, it is gone forever. Great for live video, VoIP, and fast-paced gaming.'
    ],
    complexity: {
      time: 'TCP adds RTT latency',
      space: 'TCP requires connection state memory'
    },
    analogy: 'TCP is like sending a certified letter where the receiver must sign for it. UDP is like throwing water balloons at someone from a moving car.'
  },
  code: {
    starterCode: `// Creating a TCP Server in Node.js\nconst net = require('net');\n\nconst server = net.createServer((socket) => {\n  console.log('TCP Handshake complete! Client connected.');\n  socket.write('Hello via TCP!');\n});\n\nserver.listen(8080);`,
    language: ['javascript', 'python'],
    testCases: []
  },
  viva: {
    aiPromptContext: 'You are an interviewer. Ask the candidate which protocol they would choose for a multiplayer First-Person Shooter game and why.',
    seedQuestions: [
      'Why do multiplayer games use UDP instead of TCP?',
      'Can you explain the 3-way handshake in TCP?'
    ]
  },
  xp: {
    base: 100,
    predictBonus: 50,
    breakItBonus: 50
  }
};
