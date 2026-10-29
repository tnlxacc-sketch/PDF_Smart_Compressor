# PDF Smart Compressor V5 — Client-Side PDF Compression + Full Business UAT Mode

**Release:** 29/10/2026. **GitHub Pages:** https://tnlxacc-sketch.github.io/PDF_Smart_Compressor/

**Production:** NOT APPROVED until original-document Business UAT, Google Sites iframe test, and corporate IT security review are complete.

## Compression
- High: aim for ≥10%; Balanced: aim for ≥30%; Small: aim for ≥50%. Targets are **not guarantees** for arbitrary PDF files.
- PDF processing is local to the browser. No document upload API, data store, analytics, or runtime CDN.
- Text and metadata checks use PDF.js/pdf-lib; preserves selectable text when processing compatible PDFs.
- With **explicit consent**, image-only scans can be re-rendered at lower DPI/JPEG quality to reduce size; some embedded JPEGs can be recompressed without converting whole pages.
- PDF documents with signatures, forms, attachments, unsupported structures, or unverifiable changes are refused. Lossy compression changes image pixels and may alter readability of small amounts, handwriting, stamps and QR codes; always keep and verify the original.

## Full Business UAT Mode (NEW)
- Open **โหมด Full Business UAT — ตรวจเอกสารจริงและส่งออกผล** below the compression results.
- Collect actual engine results across different selected PDFs and High/Balanced/Small modes, including true original/result byte sizes, percent reduction, number of pages, elapsed processing time, and whether the target was reached.
- Users must review exported PDF files independently and mark page order, amounts/numbers, visuals, barcodes, and PDF Reader review.
- Separate **25 Business UAT cases** cover document types, targets, content, network security, Google Sites and performance. Users/IT record Pass/Fail; this is not automated acceptance.
- Download metadata-only UAT report as **JSON or CSV**. No PDF bytes, filename, PDF text, images, signatures, QR contents or content hash in the generated report. Results are stored only in browser memory and disappear after refresh.
- The JSON report always carries `productionApproval: HOLD_PENDING_CORPORATE_REVIEW` and `networkSecurity: NOT_PROVEN_BY_THIS_REPORT` to avoid false security certification.
- [Detailed Thai UAT guide](UAT_MODE_USER_GUIDE_TH.md).

## Tested
- [GitHub Actions: V5 + UAT Mode Build, Chromium tests, 29/29 automated regression and deployment PASS](https://github.com/tnlxacc-sketch/PDF_Smart_Compressor/actions/runs/40841912744).
- Browser tests include both embedded JPEG and PNG/Flate image-only PDF fixtures, report export, manual checklist recording, and checks that the JSON/CSV report excludes test filenames and PDF text.
- These fixtures do **not** prove that a real 33.54 MB/43-page corporate PDF will meet the chosen reduction threshold or retain legible amounts after lossy changes.
- Network tests in Chromium observed no unexpected document egress in covered routes. They do not constitute an independent penetration test or validation of enterprise-browser extensions/network policies.
- Original 29-case evidence: [UAT_FULL_2026-10-29_TH.md](UAT_FULL_2026-10-29_TH.md).

## Build and hosting
- The repository contains fixed source archives and sequential compatibility patches, applied by `.github/workflows/publish.yml` after SHA-256 verification.
- Packages are installed during CI; runtime JavaScript is shipped from GitHub Pages without third-party CDN calls. The deployed asset manifest includes UAT module checksums.
- GitHub Pages publicly serves **program code**, not PDFs chosen locally by users. Company security policy may still require on-prem/offline deployment and formal review.

**Do not upload confidential PDFs to GitHub or this chat to complete UAT.** Use the in-browser UAT Mode on the company's own machine and export only the redacted local result report after reviewing its fields.
