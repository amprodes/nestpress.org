---
applyTo: '*'
description: 'The most comprehensive, practical, and engineer-authored performance optimization instructions for all languages, frameworks, and stacks. Covers frontend, backend, and database best practices with actionable guidance, scenario-based checklists, troubleshooting, and pro tips.'
---

# Performance Optimization Best Practices

## General Principles

- **Measure First, Optimize Second:** Always profile and measure before optimizing. Use benchmarks, profilers, and monitoring tools to identify real bottlenecks.
- **Optimize for the Common Case:** Focus on optimizing code paths that are most frequently executed.
- **Avoid Premature Optimization:** Write clear, maintainable code first; optimize only when necessary.
- **Minimize Resource Usage:** Use memory, CPU, network, and disk resources efficiently.
- **Prefer Simplicity:** Simple algorithms and data structures are often faster and easier to optimize.
- **Document Performance Assumptions:** Clearly comment on any code that is performance-critical.
- **Automate Performance Testing:** Integrate performance tests and benchmarks into your CI/CD pipeline.
- **Set Performance Budgets:** Define acceptable limits for load time, memory usage, API latency, etc.

## Frontend Performance

### Rendering and DOM
- **Minimize DOM Manipulations:** Batch updates where possible. Frequent DOM changes are expensive.
- **Virtual DOM Frameworks:** Use React, Vue, or similar efficiently—avoid unnecessary re-renders.
- **Avoid Inline Styles:** Inline styles can trigger layout thrashing. Prefer CSS classes.
- **CSS Animations:** Use CSS transitions/animations over JavaScript for smoother effects.

### Asset Optimization
- **Image Compression:** Use tools like ImageOptim, Squoosh, or TinyPNG. Prefer modern formats (WebP, AVIF).
- **Minification and Bundling:** Use Webpack, Rollup, or esbuild to bundle and minify JS/CSS.
- **Lazy Loading:** Use `loading="lazy"` for images, and dynamic imports for JS modules.
- **Font Optimization:** Use only the character sets you need. Subset fonts and use `font-display: swap`.

### Network Optimization
- **Reduce HTTP Requests:** Combine files, use image sprites, and inline critical CSS.
- **HTTP/2 and HTTP/3:** Enable these protocols for multiplexing and lower latency.
- **CDNs:** Serve static assets from a CDN close to your users.
- **Defer/Async Scripts:** Use `defer` or `async` for non-critical JS to avoid blocking rendering.

## Backend Performance

### Algorithm and Data Structure Optimization
- **Choose the Right Data Structure:** Arrays for sequential access, hash maps for fast lookups.
- **Efficient Algorithms:** Use binary search, quicksort, or hash-based algorithms where appropriate.
- **Batch Processing:** Process data in batches to reduce overhead.
- **Streaming:** Use streaming APIs for large data sets to avoid loading everything into memory.

### Concurrency and Parallelism
- **Asynchronous I/O:** Use async/await, callbacks, or event loops to avoid blocking threads.
- **Thread/Worker Pools:** Use pools to manage concurrency and avoid resource exhaustion.
- **Avoid Race Conditions:** Use locks, semaphores, or atomic operations where needed.

### Caching
- **Cache Expensive Computations:** Use in-memory caches (Redis, Memcached) for hot data.
- **Cache Invalidation:** Use time-based (TTL), event-based, or manual invalidation.
- **Distributed Caching:** For multi-server setups, use distributed caches.

## Database Performance

### Query Optimization
- **Indexes:** Use indexes on columns that are frequently queried, filtered, or joined.
- **Avoid SELECT *:** Select only the columns you need.
- **Parameterized Queries:** Prevent SQL injection and improve plan caching.
- **Query Plans:** Analyze and optimize query execution plans.
- **Avoid N+1 Queries:** Use joins or batch queries to avoid repeated queries in loops.

### Schema Design
- **Normalization:** Normalize to reduce redundancy, but denormalize for read-heavy workloads if needed.
- **Data Types:** Use the most efficient data types.
- **Partitioning:** Partition large tables for scalability.
- **Archiving:** Regularly archive or purge old data.
