/**
 * Robust document text extraction for PDF, DOCX, TXT, and Markdown files.
 * Handles client-side extraction with fallback to binary text stream parsing.
 */

// Fallback PDF text stream parser in case pdfjs worker is unavailable
function extractTextFromPdfBinary(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const textDecoder = new TextDecoder('utf-8', { fatal: false });
  const rawString = textDecoder.decode(bytes);

  // Strategy 1: Extract text in parentheses between BT (Begin Text) and ET (End Text)
  // or (string) Tj / TJ operators
  const textChunks: string[] = [];
  const textBlockRegex = /BT[\s\S]*?ET/g;
  let match: RegExpExecArray | null;

  while ((match = textBlockRegex.exec(rawString)) !== null) {
    const block = match[0];
    // Find strings in (parentheses) followed by Tj or TJ
    const tjRegex = /\(([^)]+)\)\s*(?:Tj|'|")/g;
    let tjMatch: RegExpExecArray | null;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      if (tjMatch[1]) {
        textChunks.push(tjMatch[1]);
      }
    }

    // Also look for array notation [(str)(str)] TJ
    const arrayTjRegex = /\[([^\]]+)\]\s*TJ/g;
    let arrayMatch: RegExpExecArray | null;
    while ((arrayMatch = arrayTjRegex.exec(block)) !== null) {
      const inner = arrayMatch[1];
      const strParts = inner.match(/\(([^)]+)\)/g);
      if (strParts) {
        strParts.forEach((p) => textChunks.push(p.replace(/[()]/g, '')));
      }
    }
  }

  if (textChunks.length > 10) {
    return textChunks.join(' ');
  }

  // Strategy 2: Extract printable ASCII sequences (fallback)
  const printableRegex = /[\x20-\x7E\t\n\r]{4,}/g;
  const matches = rawString.match(printableRegex) || [];
  const filtered = matches.filter((s) => {
    const trimmed = s.trim();
    return (
      trimmed.length > 5 &&
      !trimmed.startsWith('/Filter') &&
      !trimmed.startsWith('/Length') &&
      !trimmed.startsWith('endobj') &&
      !trimmed.startsWith('xref') &&
      !trimmed.startsWith('/Root') &&
      !trimmed.startsWith('trailer')
    );
  });

  return filtered.join('\n');
}

/**
 * Extracts clean plain text from an uploaded file (PDF, TXT, DOCX, MD)
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  // 1. Text & Markdown files: Read directly as text
  if (extension === 'txt' || extension === 'md' || extension === 'csv' || file.type.startsWith('text/')) {
    return await file.text();
  }

  // 2. PDF files: Use pdfjs-dist if possible, with stream fallback
  if (extension === 'pdf' || file.type === 'application/pdf') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Try importing pdfjs-dist dynamically
      const pdfjs = await import('pdfjs-dist');
      if (pdfjs && pdfjs.getDocument) {
        // Set worker if needed or disable worker
        if (pdfjs.GlobalWorkerOptions && !pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version || '4.0.379'}/build/pdf.worker.min.mjs`;
        }

        const loadingTask = pdfjs.getDocument({
          data: new Uint8Array(arrayBuffer),
          useSystemFonts: true,
        });

        const pdf = await loadingTask.promise;
        const pageTexts: string[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          let pageText = '';
          let lastY: number | null = null;

          for (const rawItem of textContent.items) {
            const item = rawItem as { str?: string; hasEOL?: boolean; transform?: number[] };
            const str = item.str || '';
            if (!str) continue;

            const currentY = item.transform && item.transform.length >= 6 ? item.transform[5] : null;
            const hasEol = Boolean(item.hasEOL);

            // Newline if vertical position changed significantly or EOL flag set
            if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 5) {
              pageText += '\n' + str;
            } else if (hasEol) {
              pageText += str + '\n';
            } else {
              if (pageText.length > 0 && !pageText.endsWith('\n') && !pageText.endsWith(' ')) {
                pageText += ' ';
              }
              pageText += str;
            }

            if (currentY !== null) {
              lastY = currentY;
            }
          }

          pageTexts.push(pageText.trim());
        }

        const fullExtracted = pageTexts.join('\n\n').trim();
        if (fullExtracted.length > 50) {
          return fullExtracted;
        }
      }

      // Fallback
      const fallbackText = extractTextFromPdfBinary(arrayBuffer);
      if (fallbackText && fallbackText.length > 50) {
        return fallbackText;
      }
    } catch (err) {
      console.warn('PDF.js parsing failed, attempting binary stream extraction fallback:', err);
      try {
        const arrayBuffer = await file.arrayBuffer();
        return extractTextFromPdfBinary(arrayBuffer);
      } catch (fallbackErr) {
        console.error('Binary stream extraction failed:', fallbackErr);
      }
    }
  }

  // 3. Fallback: Read as text
  return await file.text();
}
