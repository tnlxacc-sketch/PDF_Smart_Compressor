# PDF Smart Compressor V3 — Deployment & UAT Record

**Date:** 29/10/2026 (Asia/Bangkok)
**Repository:** https://github.com/tnlxacc-sketch/PDF_Smart_Compressor
**Production release:** NOT APPROVED
**GitHub Pages:** DEPLOYED — https://tnlxacc-sketch.github.io/PDF_Smart_Compressor/ (verified from GitHub Actions deployment logs; direct external browser and Google Sites embed UAT still pending)

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

## Successful deployment evidence
- [Run 3, rerun attempt 2 — verified and deployed](https://github.com/tnlxacc-sketch/PDF_Smart_Compressor/actions/runs/40825041564): verify-build and deploy jobs both concluded success; `actions/deploy-pages` reports `Reported success!` and the environment URL `https://tnlxacc-sketch.github.io/PDF_Smart_Compressor/`.

## Still NOT verified
- Real corporate scanned and Thai-language invoice PDFs in Edge/Chrome across employee devices
- Corporate network restrictions or Google Sites embedding
- Large-file performance and exhaustive PDF features
- 100% identity for arbitrary PDF documents (not technically guaranteed)

## Google Sites next steps
1. Open https://tnlxacc-sketch.github.io/PDF_Smart_Compressor/ in a user browser to check visual and functional load.
2. In Google Sites choose Insert → Embed → URL and paste the confirmed deployment URL.
3. Perform corporate-PDF Edge/Chrome and iframe testing before approving Production.

**Important:** Passing automated test fixtures does not certify exact semantic equivalence for arbitrary PDFs, nor prove the site's confidentiality in every runtime environment. Do not use confidential production PDFs until local security/UAT checks pass.

## 29/10/2026: truthful size-comparison update
- [Verified deploy](https://github.com/tnlxacc-sketch/PDF_Smart_Compressor/actions/runs/40827008920): build, tests, artifact upload and GitHub Pages deployment succeeded.
- Real-world user test revealed **33.54 MB → 33.54 MB (0.0%)**, while the previous interface still offered download because of a negligible underlying byte difference.
- New policy: show the actual saved bytes, show `ตรวจผ่าน แต่บีบอัดไม่ได้ผล` if reduction <1%, and hide download for insignificant savings.
- **No new image-recompression algorithm was introduced.** For JPEG-scan-heavy PDFs, meaningful compression remains limited without sacrificing pixel-level identity. Do not claim the product currently matches V1 compression ratios.
- Google Sites and corporate-document UAT remain pending. Do not represent the result as 100% accurate for arbitrary PDF files.
