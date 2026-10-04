---
title: "Planning Together with Distributed Agents"
description: "How we coordinate architectural plans, streaming diffs, and context before generating code."
publishDate: 2026-10-01
category: "Architecture"
featured: true
author:
  name: "Akib"
  avatar: "https://unavatar.io/github/akib35"
  handle: "@akib35"
  github: "akib35"
tags: ["Distributed Systems", "AI Agents", "Architecture"]
---

Agents can blast out a multi-thousand-line diff in seconds, but they’ll happily build the wrong thing just as efficiently if you’re not clear about what you’re building.

Before Delta, our planning happened in silos. Some made its way into a `plan.md`, while the rest stayed in someone’s head until they tried to recreate it in a prompt. The result was only a snapshot that didn’t have all the back-and-forth that got us there. At best, that slowed us down; at worst, we forgot why we’d made a decision and ended up going in circles or building the wrong thing.

Now all our planning starts in Delta.

## From Planning to Implementation

In this example, we’re in the late planning phases on a new repository that indexes the contributions of all your threads against the evolving code. Cole and I joined Antonio in the same thread to catch up and work through the plan together.

> [!TIP]
> Context might be the killer feature of the agentic era. When decisions and conversations are linked directly to syntax nodes, you never lose architectural intent.

### Code Organization and Tree Streaming

When designing tree structures for concurrent agent edits, immutable diff trees ensure linear history without lock contention[^1]:

```rust
pub struct SumTree<T: Dimension> {
    root: Option<Arc<Node<T>>>,
}

impl<T: Dimension> SumTree<T> {
    pub fn new() -> Self {
        Self { root: None }
    }

    pub fn insert(&mut self, item: T) {
        let new_root = match self.root.take() {
            Some(root) => Arc::new(root.insert_child(item)),
            None => Arc::new(Node::from_leaf(item)),
        };
        self.root = Some(new_root);
    }
}
```

### Comparative Architecture Specs

| Benchmark Component | Delta Stream Tree | Traditional Git PR |
| :--- | :--- | :--- |
| **Context Retention** | Continuous (Thread + Code) | Ephemeral / Squash |
| **Sync Latency** | < 12ms WebSocket | Batch Review |
| **Multi-Agent Coordination** | Native Subthread Isolation | Merge Conflicts |

## Exploring Data Structures

We needed a structure that could handle frequent splice operations without reallocating buffers. You can see how each contributor works on isolated subthreads:

> "Reading code still matters, and I needed a proper interface to quickly jot down my comments and iterate quickly."
> — *Delta Engineering Review*

### System Notes and Callouts

> [!WARNING]
> Do not mutate AST nodes in place during streaming token evaluation. Always clone reference pointers or write to thread-local scratchpads.

Use <kbd>Ctrl</kbd> + <kbd>P</kbd> or <kbd>⌘</kbd> + <kbd>K</kbd> to open fuzzy file navigation across workspace repositories.

[^1]: Implemented in Zed's SumTree algorithm, enabling $O(\log N)$ position lookups across millions of concurrent keystrokes.
