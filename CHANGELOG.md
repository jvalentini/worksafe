# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Complete offline rewriting with enhanced detection and UI improvements (#8) — thanks @jvalentini
  - Advanced profanity/insult detection with fuzzy matching
  - Sarcasm detection (opt-in, dictionary mode)
  - Token-based adjacency rules for nuanced language patterns
  - Sentence segmentation for clause-level rewrites
  - Protected tokens (URLs, @handles, #channels)
  - Friendlier replacement text (friend/friends)
  - Redesigned compact right sidebar settings panel
  - Mobile drawer for settings
  - Conditional API config (shows only when AI enabled)
  - Post-it note aesthetics with rotated elements
  - Ctrl+Enter auto-scroll to output section
  - Improved cursor visibility with red caret

### Changed
- Updated README with new features and UI changes

### Fixed
- Added safe localStorage wrappers with error handling
- Removed unused parameter in detector helper function