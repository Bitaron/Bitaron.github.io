# Repository Guidelines

## Project Structure & Module Organization

This is a Jekyll-based static site hosted on GitHub Pages, using the Minimal Mistakes theme via remote_theme.

```
├── _config.yml          # Site configuration (theme, plugins, author, SEO, etc.)
├── _data/
│   └── resume.yml       # Structured resume data
├── _posts/              # Blog posts (Markdown with front matter)
├── _includes/           # Theme overrides / partials (currently empty)
├── _layouts/            # Custom layouts (currently empty)
├── _sass/               # Custom Sass (currently empty)
├── assets/              # Static assets (images, CSS, JS) - add as needed
├── Gemfile              # Ruby dependencies (github-pages, jekyll-include-cache)
├── Gemfile.lock         # Locked dependencies
├── .ruby-version        # Ruby 3.0.0
└── resume.md            # Resume page content
```

Posts go in `_posts/` with filenames like `YYYY-MM-DD-title.md`. Pages can be added at the root or in `_pages/` (included in config).

## Build, Test, and Development Commands

| Command | Description |
|---------|-------------|
| `bundle install` | Install Ruby dependencies |
| `bundle exec jekyll serve` | Run local dev server at http://localhost:4000 |
| `bundle exec jekyll serve --future` | Include future-dated posts |
| `bundle exec jekyll build` | Build production site to `_site/` |
| `bundle exec jekyll doctor` | Check for configuration issues |
| `bundle update` | Update all gems to latest compatible versions |

## Coding Style & Naming Conventions

- **Markdown**: Use GFM (GitHub Flavored Markdown) with kramdown. Front matter required for all posts/pages.
- **Front matter**: Use YAML with consistent keys (`layout`, `title`, `date`, `categories`, `tags`, `author_profile`).
- **Indentation**: 2 spaces for YAML, Markdown, HTML, Sass.
- **File naming**: Lowercase with hyphens (`my-post-title.md`).
- **Sass**: Place custom styles in `_sass/`; override theme variables before `@import "minimal-mistakes"`.
- **Liquid**: Use standard Liquid syntax; prefer `{% include %}` over raw HTML for reusable components.

## Testing Guidelines

- **No formal test suite** — this is a static site. Validate by:
  - Running `bundle exec jekyll doctor` for config errors
  - Running `bundle exec jekyll build` to verify clean build
  - Checking `bundle exec htmlproofer ./_site` (add to Gemfile if needed) for broken links
- **Manual review**: Preview locally with `jekyll serve` before committing.

## Commit & Pull Request Guidelines

- **Commit messages**: Use imperative mood (`Add resume page`, not `Added resume page`). Keep under 72 chars.
- **Reference issues**: Include `#issue-number` in commit body when applicable.
- **Branching**: Work on feature branches (`feature/resume-page`, `fix/typo-homepage`).
- **Pull requests**: 
  - Clear title and description of changes
  - Link related issues
  - Include screenshots for visual changes
  - Verify `jekyll build` passes locally

## Security & Configuration Tips

- **Never commit secrets** (API keys, tokens) — use GitHub Pages environment variables or repository secrets.
- **Theme updates**: Update `remote_theme` version in `_config.yml` to pin Minimal Mistakes releases.
- **GitHub Pages**: Deploys from `main` branch automatically. Ensure `_config.yml` has correct `url` and `repository` fields.
- **Plugins**: Only whitelisted plugins work on GitHub Pages (see `whitelist` in `_config.yml`). Custom plugins require local build + commit of `_site/` or GitHub Actions workflow.

## Architecture Overview

- **Theme**: Minimal Mistakes (remote_theme) — overrides via `_includes/`, `_layouts/`, `_sass/`, `assets/`
- **Content**: Markdown posts in `_posts/`, data-driven content in `_data/`
- **Deployment**: GitHub Pages native (Jekyll builds on push to `main`)
- **Configuration**: Centralized in `_config.yml` (site metadata, theme options, plugins, defaults)
