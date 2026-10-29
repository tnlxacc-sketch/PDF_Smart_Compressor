# PDF Smart Compressor V5 — Full Automated Regression UAT

**Date:** 29/10/2026 (Asia/Bangkok)  
**Repository:** https://github.com/tnlxacc-sketch/PDF_Smart_Compressor  
**Run:** https://github.com/tnlxacc-sketch/PDF_Smart_Compressor/actions/runs/40837904572  
**Source:** V5, tested against built static GitHub Pages artifact on Chromium (Playwright)  
**Test outcome:** 29/29 PASS — 100% **of the explicitly executed 29-case automated suite**  
**Production acceptance:** **NOT YET APPROVED** (see pending gates below)

## Executive summary

- Independent browser regression UAT: **29 PASS, 0 FAIL, 0 SKIPPED**.
- Original existing suite also passed: 12-page selectable-text document, signed/malformed PDF rejection, embedded JPEG synthetic scans and PNG/Flate full-page raster fallback.
- Synthetic embedded JPEG scan: **High 50.9%, Balanced 66.5%, Small 81.0%** in this fixture only.
- Synthetic PNG/Flate image-only scan: **Balanced 73.2%** in this fixture only.
- **A 43-page generated text PDF was tested. This was NOT the user's 33.54 MB / 43-page real original.**
- Network instrumentation in Chromium observed no forbidden outbound document requests during the covered scenarios; this is **not** a security penetration test.

## Individual results

| TC | Scenario / expected behavior | Observed evidence | Result |
|---|---|---|---|
| U01 | HTTP static app and engine ready | Assertions completed in Chromium | PASS |
| U02 | Upload control initially disabled | Assertions completed in Chromium | PASS |
| U03 | Default mode Balanced = 30% | Assertions completed in Chromium | PASS |
| U04 | Three modes available 10/30/50 | Assertions completed in Chromium | PASS |
| U05 | Consent is unchecked by default | Assertions completed in Chromium | PASS |
| U06 | PDF filename and size displayed safely | Assertions completed in Chromium | PASS |
| U07 | Reject non-PDF extension even if bytes are PDF | Assertions completed in Chromium | PASS |
| U08 | Reject empty file | Assertions completed in Chromium | PASS |
| U09 | Reject PDF under 100 bytes | Assertions completed in Chromium | PASS |
| U10 | Reject file above 80 MB | Assertions completed in Chromium | PASS |
| U11 | Filename HTML injection not executed | Assertions completed in Chromium | PASS |
| U12 | Valid selectable-text PDF with no consent processed | Assertions completed in Chromium | PASS |
| U13 | Download shown only if real saving meets 30% | saving=29.8%, download=false | PASS |
| U14 | Selecting another file clears previous output/download | Assertions completed in Chromium | PASS |
| U15 | Malformed claimed PDF rejected without result | Assertions completed in Chromium | PASS |
| U16 | Digital signature marker refused | Assertions completed in Chromium | PASS |
| U17 | AcroForm PDF refused | Assertions completed in Chromium | PASS |
| U18 | PDF attachments refused | Assertions completed in Chromium | PASS |
| U19 | PDF OpenAction key refused | Assertions completed in Chromium | PASS |
| U20 | Over 120 pages refused | Assertions completed in Chromium | PASS |
| U21 | 43-page real PDF text rendering / page count | Assertions completed in Chromium | PASS |
| U22 | High mode targets 10% (not falsified) | Assertions completed in Chromium | PASS |
| U23 | Small mode targets 50% (not falsified) | Assertions completed in Chromium | PASS |
| U24 | Switching from scan consent to no consent resets checkbox | Assertions completed in Chromium | PASS |
| U25 | CSP denies network API / external scripts | Assertions completed in Chromium | PASS |
| U26 | No JavaScript runtime exceptions | Assertions completed in Chromium | PASS |
| U27 | Mobile visual layout no horizontal overflow | Assertions completed in Chromium | PASS |
| U28 | App assets on same host | Assertions completed in Chromium | PASS |
| U29 | No outgoing document requests during tests | Assertions completed in Chromium | PASS |

## Remaining Production UAT blockers / risk register

| ID | Severity | Remaining test | Why it matters | Status |
|---|---|---|---|---|
| P01 | Critical | Test the user's actual 33.54 MB / 43-page PDF locally (no upload) in High/Balanced/Small | Real-world compression and text/image clarity cannot be inferred from generated fixtures | PENDING |
| P02 | High | Compare every page and sensitive numbers on real invoices, Thai fonts, scanned text and stamped PDF documents | Lossy JPEG/DPI changes pixels; numeric correctness cannot be certified 100% by similarity threshold | PENDING |
| P03 | High | Google Sites embedded URL full test on the user's site | Same-origin standalone Chromium is not the actual cross-origin Google Sites iframe | PENDING |
| P04 | High | Microsoft Edge current, desktop managed browser and representative devices | Playwright Chromium passing does not certify Edge enterprise policies/mobile | PENDING |
| P05 | High | Evaluate real 33 MB-80 MB PDF performance, memory and browser crash behavior | A large-file rejection test is not a large-file success/performance test | PENDING |
| P06 | High | Independently audit network/security, PDF edge cases and compromised dependency supply chain | CSP and one-run network instrumentation do not prove universal no-exfiltration under all configurations | PENDING |
| P07 | High | Signed/encrypted PDF variants and atypical attachments/forms | Simplified markers & documented refusal rules do not guarantee recognition of all PDF constructs | PENDING |

## Acceptance criteria

- The preset percentages **10% / 30% / 50% are targets**, not a guarantee that all PDFs can meet them.
- Failing to meet a preset must produce factual size comparison and **no download approval**, not misleading success.
- User originals remain unmodified; no PDF should be uploaded to GitHub as part of business UAT.
- Documents subject to digital signing and high-risk interactive PDF structures should be refused.
- For image-only scans requiring Lossy compression, document text inside pixels must be visually checked by the user. The system **cannot guarantee 100% numeric readability after lossy downsampling**.

## Decision

**Automated UAT within the executed 29 cases: PASS 100%.**  
**Full business / real-document / Google Sites UAT: NOT 100%; Production status: HOLD.**

This distinction is deliberate: an automated passing fixture cannot replace real-document acceptance.
