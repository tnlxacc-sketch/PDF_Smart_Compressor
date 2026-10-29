# PDF Smart Compressor V3 — Deployment & UAT Record

**Date:** 29/10/2026 (Asia/Bangkok)
**Repository:** https://github.com/tnlxacc-sketch/PDF_Smart_Compressor
**Production release:** NOT APPROVED
**GitHub Pages:** NOT ENABLED (owner action required)

## GitHub Actions evidence
- [Run 1 — failed real-browser UAT](https://github.com/tnlxacc-sketch/PDF_Smart_Compressor/actions/runs/40824790894): PDF.js used Map.getOrInsertComputed not available in test Chromium.
- [Run 2 — real-browser UAT passed; Pages disabled](https://github.com/tnlxacc-sketch/PDF_Smart_Compressor/actions/runs/40824954951): static checks, npm audit, build, real-browser UAT passed; configure-pages returned Pages site Not Found.
- [Run 3 — real-browser UAT passed; Pages permissions blocked](https://github.com/tnlxacc-sketch/PDF_Smart_Compressor/actions/runs/40825041564): real-browser tests passed; automatic Page creation failed: `Resource not accessible by integration`.

## Verified in run 3
- Source archive SHA-256 validation
- Exact-version dependency installation and high-severity vulnerability audit
- Syntax and mock UI / fail-closed tests
- Build with local PDF.js / pdf-lib assets
- Headless Chromium real-document test: 12-page generated invoice PDF; before/after sizes and optional download; signed-marker rejection; malformed-PDF refusal
- Test route instrumentation detected no outgoing document network requests

## Still NOT verified
- Real corporate scanned and Thai-language invoice PDFs in Edge/Chrome across employee devices
- Corporate network restrictions or Google Sites embedding
- Large-file performance and exhaustive PDF features
- 100% identity for arbitrary PDF documents (not technically guaranteed)

## Action required for GitHub Pages
Open [Repository Settings → Pages](https://github.com/tnlxacc-sketch/PDF_Smart_Compressor/settings/pages) and set **Build and deployment → Source → GitHub Actions**. Save. Then rerun the latest GitHub Actions workflow. The site URL will be taken from the actual deployment output; **do not guess or distribute a URL before success.**
