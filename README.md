# PDF Smart Compressor V3 — Secure Client-Side Edition

**Status: pre-release / NOT approved for confidential production documents until real-document UAT is completed.**

A Thai-language PDF optimizer designed for embedding into Google Sites. PDF contents are processed locally in the user's browser. The deployed site does not use an upload API, external JavaScript CDN, analytics or a database.

## Compression capability and safety limits
- This version reorganizes PDF structure without recompressing JPEG scans. A 33 MB scanned PDF may remain ~33 MB; the program must **not** present a negligible gain as successful compression.
- A release-time safety guard requires at least **1.0%** reduction before displaying the download action. The interface shows exact byte difference for very small gains.
- Significant compression of already-compressed scanned pages generally requires changed image data (lossy recompression). That is NOT activated because the requested policy prioritizes original image/text integrity.
- Passing PDF text/pixel checks at configured inspection resolution is NOT a mathematical 100% guarantee for arbitrary PDF documents.

## User interface
1. Select or drag in a PDF (up to 80 MB).
2. Select High Quality or Balanced. Small File is intentionally disabled pending evidence that its implementation preserves document information.
3. Click **เริ่มปรับขนาด PDF** and wait for both compression and validation.
4. Review original size, result size, saving percentage and validation message.
5. Download only if validation passes AND the result is smaller.

PDF files with signatures, forms, attachments and high-risk features are refused. **This tool cannot certify mathematical 100% semantic equivalence for every PDF**. An unchanged original remains essential for authoritative records.

## Source and deployment
The version-controlled V3 source snapshot is stored as five contiguous Base64 chunks under `release/SOURCE_ARCHIVE.b64.part01`–`part05`. The security-gated GitHub Action at `.github/workflows/publish.yml` concatenates them, verifies SHA-256, extracts the source, installs pinned PDF libraries, audits dependencies, and runs static, mock and real Chromium PDF tests before allowing GitHub Pages deployment. The original source is available separately in the accompanying ZIP from the project author.

`compat/pdfjs-map-shim.mjs` is a feature-detected compatibility shim for PDF.js in Chromium browsers; the workflow copies it into both PDF.js modules *before* building the deployment, so generated asset checksums remain consistent.

**Security caveat:** GitHub Pages publicly hosts HTML and JavaScript, not the PDFs selected by users. Client-side privacy still requires browser/network and Google Sites iframe UAT in the actual corporate environment.

## GitHub Actions
[Inspect current build and deployment status](https://github.com/tnlxacc-sketch/PDF_Smart_Compressor/actions)

## Google Sites
After the Actions job **deploy** succeeds, use the URL shown on that job under `page_url` with Google Sites → Insert → Embed → URL. Do not embed `src/index.html` via a `file://` local path.

## V5 (29/10/2026): DPI/JPEG adjustment for scanned-image PDFs
- User-selected High/Balanced/Small targets are 10%/30%/50% minimum savings. **These are targets, not guaranteed results for every source.**
- JPEG stream optimization remains available for supported RGB-DCT images.
- **New:** if the PDF is an image-only scan with no PDF text layer or interactive/vector features, explicit Lossy consent allows locally rendering pages and lowering DPI/JPEG quality to compress scanned images even when the scanner stored them as PNG/Flate instead of JPEG.
- V5 intentionally refuses whole-page raster fallback for selectable text/OCR layers, annotations, signatures, rotated pages, or unsupported drawing features so it will not silently destroy PDF searchability or interactive content.
- Pixel values change in Lossy DPI mode: **not suitable to claim 100% correctness of digits contained only inside a scanned image**. Always visually review outputs and preserve originals.
- No document upload API. Runtime scripts are hosted with the app and CSP denies outgoing browser API connections.
- [Successful automated V5 test and deployment](https://github.com/tnlxacc-sketch/PDF_Smart_Compressor/actions/runs/40830923396): simulated PNG/Flate scan compressed 73.2% in Balanced; this **does not prove** the user's actual 43-page PDF will achieve 30%, or certify corporate UAT.
