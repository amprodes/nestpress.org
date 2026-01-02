---
applyTo: 'wp-content/plugins/**,wp-content/themes/**,**/*.php,**/*.inc,**/*.js,**/*.jsx,**/*.ts,**/*.tsx,**/*.css,**/*.scss,**/*.json'
description: 'Coding, security, and testing rules for WordPress plugins and themes'
---

# WordPress Development — Copilot Instructions

**Goal:** Generate WordPress code that is secure, performant, testable, and compliant with official WordPress practices. Prefer hooks, small functions, dependency injection (where sensible), and clear separation of concerns.

## 1) Core Principles
- Never modify WordPress core. Extend via **actions** and **filters**.
- For plugins, always include a header and guard direct execution in entry PHP files.
- Use unique prefixes or PHP namespaces to avoid global collisions.
- Enqueue assets; never inline raw `<script>`/`<style>` in PHP templates.
- Make user‑facing strings translatable and load the correct text domain.

### Minimal plugin header & guard
```php
<?php
defined('ABSPATH') || exit;
/**
 * Plugin Name: Awesome Feature
 * Description: Example plugin scaffold.
 * Version: 0.1.0
 * Author: Example
 * License: GPL-2.0-or-later
 * Text Domain: awesome-feature
 * Domain Path: /languages
 */
```

## 2) Coding Standards (PHP, JS, CSS, HTML)
- Follow **WordPress Coding Standards (WPCS)** and write DocBlocks for public APIs.
- PHP: Prefer strict comparisons (`===`, `!==`) where appropriate. Be consistent with array syntax and spacing as per WPCS.
- JS: Match WordPress JS style; prefer `@wordpress/*` packages for block/editor code.
- CSS: Use BEM‑like class naming when helpful; avoid over‑specific selectors.
- PHP 7.4+ compatible patterns unless the project specifies higher. Avoid using features not supported by target WP/PHP versions.

## 3) Security & Data Handling
- **Escape on output, sanitize on input.**
  - Escape: `esc_html()`, `esc_attr()`, `esc_url()`, `wp_kses_post()`.
  - Sanitize: `sanitize_text_field()`, `sanitize_email()`, `sanitize_key()`, `absint()`, `intval()`.
- **Capabilities & nonces** for forms, AJAX, REST:
  - Add nonces with `wp_nonce_field()` and verify via `check_admin_referer()` / `wp_verify_nonce()`.
  - Restrict mutations with `current_user_can( 'manage_options' /* or specific cap */ )`.
- **Database:** always use `$wpdb->prepare()` with placeholders; never concatenate untrusted input.
- **Uploads:** validate MIME/type and use `wp_handle_upload()`/`media_handle_upload()`.

## 4) Internationalization (i18n)
- Wrap user‑visible strings with translation functions using your text domain:
  - `__( 'Text', 'awesome-feature' )`, `_x()`, `esc_html__()`.
- Load translations with `load_plugin_textdomain()` or `load_theme_textdomain()`.
- Keep a `.pot` in `/languages` and ensure consistent domain usage.

## 5) Performance
- Defer heavy logic to specific hooks; avoid expensive work on `init`/`wp_loaded` unless necessary.
- Use transients or object caching for expensive queries; plan invalidation.
- Enqueue only what you need and conditionally (front vs admin; specific screens/routes).
- Prefer paginated/parameterized queries over unbounded loops.

## 6) Testing
- Use **WordPress test suite** with `PHPUnit` and `WP_UnitTestCase`.
- Test: sanitization, capability checks, REST permissions, DB queries, hooks.
- Prefer factories (`self::factory()->post->create()` etc.) to set up fixtures.
