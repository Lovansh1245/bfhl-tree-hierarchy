/**
 * @module processor
 * @description Builds directed tree hierarchies from edge strings like "A->B".
 * Uses DFS-based three-color marking (WHITE/GRAY/BLACK) for cycle detection
 * on the directed graph, then recursively assembles nested tree objects for
 * acyclic components and flags cyclic ones.
 * @author Lovansh Sharma — 0827CS211130
 */

// ┌──────────────────────────────────────────────────────────────────────────┐
// │ TIME COMPLEXITY                                                         │
// │ • Validation + Dedup: O(n) where n = input array length                 │
// │ • Graph build: O(E) where E = unique valid edges                        │
// │ • Component discovery (BFS): O(V + E)                                   │
// │ • Cycle detection (DFS three-color): O(V + E) per component, O(V+E) tot │
// │ • Tree assembly + depth: O(V) per tree                                  │
// │ • Overall: O(n + V + E) — no O(n²) loops anywhere                      │
// │ • Handles 50+ edges in well under 3 seconds                             │
// └──────────────────────────────────────────────────────────────────────────┘

function processData(data) {
  if (!Array.isArray(data)) {
    return {
      hierarchies: [],
      invalid_entries: [],
      duplicate_edges: [],
      summary: { total_trees: 0, total_cycles: 0, largest_tree_root: '' }
    };
  }

  // ── Step 1: Validation ──
  const invalidEntries = [];
  const validRaw = [];

  for (let i = 0; i < data.length; i++) {
    const raw = typeof data[i] === 'string' ? data[i] : String(data[i]);
    const trimmed = raw.trim();

    if (!trimmed || !/^[A-Z]->[A-Z]$/.test(trimmed)) {
      invalidEntries.push(trimmed || raw);
      continue;
    }

    const [source, target] = trimmed.split('->');
    if (source === target) {
      invalidEntries.push(trimmed);
      continue;
    }

    validRaw.push(trimmed);
  }

  // ── Step 2: Deduplicate edges ──
  const seen = new Set();
  const dupSet = new Set();
  const uniqueEdges = [];

  for (const edge of validRaw) {
    if (seen.has(edge)) {
      dupSet.add(edge);
    } else {
      seen.add(edge);
      uniqueEdges.push(edge);
    }
  }

  const duplicateEdges = Array.from(dupSet);

  // ── Step 3: Build directed graph (first-parent wins for multi-parent) ──
  const edgeMap = {};       // parent → [children]  (directed adjacency)
  const parentRef = {};     // child  → parent       (reverse lookup)
  const activeNodes = new Set();

  for (const edge of uniqueEdges) {
    const [p, c] = edge.split('->');

    // Always register both nodes so discarded-parent nodes still appear
    activeNodes.add(p);
    activeNodes.add(c);

    if (c in parentRef) {
      // Multi-parent: discard silently (first parent wins)
      continue;
    }

    parentRef[c] = p;
    if (!edgeMap[p]) edgeMap[p] = [];
    edgeMap[p].push(c);
  }

  // ── Step 4: Discover connected components (undirected BFS) ──
  //    We build an undirected view only from *accepted* edges so components
  //    reflect the actual graph structure. Isolated parent nodes from
  //    discarded edges form their own singleton components.
  const undirectedAdj = {};
  for (const node of activeNodes) {
    undirectedAdj[node] = new Set();
  }
  for (const node of activeNodes) {
    for (const child of (edgeMap[node] || [])) {
      undirectedAdj[node].add(child);
      undirectedAdj[child].add(node);
    }
  }

  const componentMarked = new Set();
  const componentGroups = [];

  for (const node of activeNodes) {
    if (componentMarked.has(node)) continue;
    const group = [];
    const queue = [node];
    componentMarked.add(node);
    while (queue.length > 0) {
      const curr = queue.shift();
      group.push(curr);
      for (const nb of undirectedAdj[curr]) {
        if (!componentMarked.has(nb)) {
          componentMarked.add(nb);
          queue.push(nb);
        }
      }
    }
    componentGroups.push(group.sort());
  }

  // ── Step 5: DFS three-color cycle detection on directed edges ──
  //    WHITE (0) = unvisited, GRAY (1) = in current DFS stack, BLACK (2) = done
  //    A back-edge to a GRAY node proves a directed cycle exists.
  function hasCyclicPath(groupNodes) {
    const traversalState = {};
    for (const n of groupNodes) {
      traversalState[n] = 0; // WHITE
    }

    function dfsVisit(node) {
      traversalState[node] = 1; // GRAY — entering stack
      for (const neighbor of (edgeMap[node] || [])) {
        if (traversalState[neighbor] === 1) return true;   // back-edge → cycle
        if (traversalState[neighbor] === 0 && dfsVisit(neighbor)) return true;
      }
      traversalState[node] = 2; // BLACK — fully processed
      return false;
    }

    for (const node of groupNodes) {
      if (traversalState[node] === 0) {
        if (dfsVisit(node)) return true;
      }
    }
    return false;
  }

  // ── Step 6: Assemble hierarchies ──
  const hierarchies = [];

  for (const group of componentGroups) {
    const entryNodes = group.filter(n => !(n in parentRef));
    const isCyclic = hasCyclicPath(group);

    if (isCyclic) {
      // Cyclic group — use lex-smallest node as root (group is sorted)
      const root = entryNodes.length > 0 ? entryNodes[0] : group[0];
      hierarchies.push({ root, tree: {}, has_cycle: true });
    } else {
      // Acyclic tree — build nested structure and compute depth
      const root = entryNodes[0];

      const assembleHierarchy = (node) => {
        const branch = {};
        for (const child of (edgeMap[node] || [])) {
          branch[child] = assembleHierarchy(child);
        }
        return branch;
      };

      const computeDepth = (node) => {
        const ch = edgeMap[node] || [];
        if (ch.length === 0) return 1;
        return 1 + Math.max(...ch.map(c => computeDepth(c)));
      };

      const tree = { [root]: assembleHierarchy(root) };
      const depth = computeDepth(root);
      hierarchies.push({ root, tree, depth });
    }
  }

  // ── Step 7: Summary ──
  const nonCyclic = hierarchies.filter(h => !h.has_cycle);
  const cyclicGroups = hierarchies.filter(h => h.has_cycle);

  let largestTreeRoot = '';
  let maxDepth = 0;

  for (const t of nonCyclic) {
    if (t.depth > maxDepth || (t.depth === maxDepth && (largestTreeRoot === '' || t.root < largestTreeRoot))) {
      maxDepth = t.depth;
      largestTreeRoot = t.root;
    }
  }

  return {
    user_id: "lovansh_tewatia_1245",
    email_id: "lt4750@srmist.edu.in",
    college_roll_number: "RA2311027010106",
    hierarchies,
    invalid_entries: invalidEntries,
    duplicate_edges: duplicateEdges,
    summary: {
      total_trees: nonCyclic.length,
      total_cycles: cyclicGroups.length,
      largest_tree_root: largestTreeRoot
    }
  };
}

module.exports = { processData };
