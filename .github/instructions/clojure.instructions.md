---
description: 'Clojure-specific coding patterns, inline def usage, code block templates, and namespace handling for Clojure development.'
applyTo: '**/*.{clj,cljs,cljc,bb,edn.mdx?}'
---

# Clojure Development Instructions

## Code Evaluation Tool usage

"Use the repl" means to use the **Evaluate Clojure Code** tool from Calva Backseat Driver.

- Always stay inside Calva's REPL instead of launching a second one from the terminal.
- If there is no REPL connection, ask the user to connect the REPL.

## Interactive Programming (a.k.a. REPL Driven Development)

### Align Data Structure Elements for Bracket Balancing
**Always align multi-line elements vertically in all data structures. Misalignment causes the bracket balancer to close brackets incorrectly.**

```clojure
;; ✅ Correct - aligned vector elements
(select-keys m [:key-a
                :key-b
                :key-c])

;; ✅ Correct - aligned map entries
{:name "Alice"
 :age 30
 :city "Oslo"}
```

### REPL Dependency Management
Use `clojure.repl.deps/add-libs` for dynamic dependency loading during REPL sessions.

```clojure
(require '[clojure.repl.deps :refer [add-libs]])
(add-libs '{dk.ative/docjure {:mvn/version "1.15.0"}})
```

## Inline Def Pattern

Prefer inline def debugging over println/console.log.

```clojure
(defn process-instructions [instructions]
  (def instructions instructions)
  (let [grouped (group-by :status instructions)]
    grouped))
```

## Rich Comment Forms (RCF) for Documentation

Use RCFs to **document usage patterns and examples** for functions.

```clojure
(defn process-user-data
  "Processes user data with validation"
  [{:user/keys [name email] :as user-data}]
  ;; implementation
  )

(comment
  ;; Basic usage
  (process-user-data {:user/name "John" :user/email "john@example.com"})
  :rcf)
```

## Testing

### Run Tests from the REPL
```clojure
(require '[my.project.some-test] :reload)
(clojure.test/run-tests 'my.project.some-test)
```
