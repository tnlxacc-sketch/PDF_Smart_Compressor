// Browser compatibility shim for PDF.js 6.4.x.
// Applied to BOTH pdf.mjs and pdf.worker.mjs at build time.
// Newer PDF.js calls Map.getOrInsertComputed; Chromium 141 lacks it.
// This feature-detection shim does not read files or contact any network.
if (typeof Map.prototype.getOrInsertComputed !== "function") {
  Object.defineProperty(Map.prototype, "getOrInsertComputed", {
    configurable: true,
    writable: true,
    value: function(key, callback) {
      if (this.has(key)) return this.get(key);
      const value = callback(key);
      this.set(key, value);
      return value;
    }
  });
}
if (typeof Map.prototype.getOrInsert !== "function") {
  Object.defineProperty(Map.prototype, "getOrInsert", {
    configurable: true,
    writable: true,
    value: function(key, defaultValue) {
      if (this.has(key)) return this.get(key);
      this.set(key, defaultValue);
      return defaultValue;
    }
  });
}
