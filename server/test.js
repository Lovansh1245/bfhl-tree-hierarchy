const http = require('http');

const PORT = process.env.PORT || 3001;
const HOST = 'localhost';

function generateRandomEdges(count) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const edges = [];
  for (let i = 0; i < count; i++) {
    const parent = letters[Math.floor(Math.random() * letters.length)];
    let child;
    do {
      child = letters[Math.floor(Math.random() * letters.length)];
    } while (parent === child); // Avoid immediate self loops strictly in generation
    edges.push(`${parent}->${child}`);
  }
  return edges;
}

function runPerfTest() {
  const edges = generateRandomEdges(50);
  console.log(`\n--- Test 5: Performance (50 random edges) ---`);
  // console.log(JSON.stringify(edges));

  const postData = JSON.stringify({ data: edges });
  const options = {
    hostname: HOST,
    port: PORT,
    path: '/bfhl',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const startTime = Date.now();
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
      const endTime = Date.now();
      const elapsed = endTime - startTime;
      console.log(`Response status: ${res.statusCode}`);
      console.log(`Elapsed time: ${elapsed}ms`);
      if (elapsed < 3000) {
        console.log(`Result: PASS - Under 3000ms`);
      } else {
        console.log(`Result: FAIL - Over 3000ms`);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

const tests = [
  {
    name: 'Test 1 - Basic example',
    data: ["A->B","A->C","B->D","C->E","E->F","X->Y","Y->Z","Z->X","P->Q","Q->R","G->H","G->H","G->I","hello","1->2","A->"]
  },
  {
    name: 'Test 2 - Pure cycle (no natural root)',
    data: ["B->C", "C->B"]
  },
  {
    name: 'Test 3 - Diamond pattern',
    data: ["A->D","B->D","A->E"]
  },
  {
    name: 'Test 4 - All invalid',
    data: ["hello","1->2","","AB->C","A->A"]
  }
];

function runStandardTest(test) {
    return new Promise((resolve) => {
        console.log(`\n--- ${test.name} ---`);
        const postData = JSON.stringify({ data: test.data });
        const options = {
          hostname: HOST,
          port: PORT,
          path: '/bfhl',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
              const parsed = JSON.parse(data);
              console.log('Result hierarchies:', JSON.stringify(parsed.hierarchies));
              console.log('Result summary:', JSON.stringify(parsed.summary));
              console.log('Result invalid_entries:', JSON.stringify(parsed.invalid_entries));
              console.log('Result duplicate_edges:', JSON.stringify(parsed.duplicate_edges));
              resolve();
            });
          });
        req.on('error', (e) => {
          console.error(`Problem with request: ${e.message}`);
          resolve();
        });
        req.write(postData);
        req.end();
    });
}


async function runAllTests() {
  console.log("Starting server tests...");
  // Use sequential async to avoid messy console logs
  for (const test of tests) {
      await runStandardTest(test);
  }
  runPerfTest();
}

runAllTests();
