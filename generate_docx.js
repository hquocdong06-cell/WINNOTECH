const fs = require('fs');
const path = require('path');
const docx = require('docx');

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType,
  PageBreak,
} = docx;

const mdFilePath = path.join(__dirname, 'BAO_CAO_DU_AN_TOT_NGHIEP_WINNOTECH.md');
const docxFilePath = path.join(__dirname, 'BAO_CAO_DU_AN_TOT_NGHIEP_WINNOTECH.docx');

const content = fs.readFileSync(mdFilePath, 'utf8');
const lines = content.split('\n');

const children = [];

// Helper styling constants
const FONT_FAMILY = 'Times New Roman';
const COLOR_PRIMARY = '1A365D'; // Dark Navy Blue
const COLOR_SECONDARY = '2B6CB0'; // Slate Blue
const COLOR_TEXT = '2D3748'; // Dark Gray
const COLOR_BG_HEADER = '2B6CB0'; // Table header blue

let inCodeBlock = false;
let codeBuffer = [];
let inTable = false;
let tableRowsData = [];

function parseInlineFormatting(text, baseStyle = {}) {
  // Regex to match bold (**text** or __text__), italic (*text*), code (`text`), math ($...$)
  const runs = [];
  let remaining = text;

  // Simple tokenizing for bold, inline code, italic
  const tokens = [];
  const regex = /(\*\*.*?\*\*|`.*?`|\*.*?\*)/g;
  let match;
  let lastIdx = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      tokens.push({ type: 'text', val: text.substring(lastIdx, match.index) });
    }
    const full = match[0];
    if (full.startsWith('**') && full.endsWith('**')) {
      tokens.push({ type: 'bold', val: full.slice(2, -2) });
    } else if (full.startsWith('`') && full.endsWith('`')) {
      tokens.push({ type: 'code', val: full.slice(1, -1) });
    } else if (full.startsWith('*') && full.endsWith('*')) {
      tokens.push({ type: 'italic', val: full.slice(1, -1) });
    }
    lastIdx = regex.lastIndex;
  }
  if (lastIdx < text.length) {
    tokens.push({ type: 'text', val: text.substring(lastIdx) });
  }

  if (tokens.length === 0) {
    return [new TextRun({ text, font: FONT_FAMILY, size: 26, color: COLOR_TEXT, ...baseStyle })];
  }

  for (const token of tokens) {
    if (token.type === 'bold') {
      runs.push(new TextRun({ text: token.val, bold: true, font: FONT_FAMILY, size: 26, color: COLOR_TEXT, ...baseStyle }));
    } else if (token.type === 'italic') {
      runs.push(new TextRun({ text: token.val, italics: true, font: FONT_FAMILY, size: 26, color: COLOR_TEXT, ...baseStyle }));
    } else if (token.type === 'code') {
      runs.push(new TextRun({ text: token.val, font: 'Consolas', size: 22, color: 'C53030', ...baseStyle }));
    } else {
      runs.push(new TextRun({ text: token.val, font: FONT_FAMILY, size: 26, color: COLOR_TEXT, ...baseStyle }));
    }
  }
  return runs;
}

function flushTable() {
  if (tableRowsData.length === 0) return;

  const tableRows = [];
  tableRowsData.forEach((row, rowIndex) => {
    const isHeader = rowIndex === 0;
    const cells = row.map((cellText) => {
      const cleanCell = cellText.trim();
      return new TableCell({
        children: [
          new Paragraph({
            children: parseInlineFormatting(cleanCell, {
              bold: isHeader,
              color: isHeader ? 'FFFFFF' : COLOR_TEXT,
            }),
            alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
            spacing: { before: 100, after: 100 },
          }),
        ],
        shading: isHeader ? { fill: COLOR_BG_HEADER, val: ShadingType.CLEAR } : (rowIndex % 2 === 1 ? { fill: 'F7FAFC', val: ShadingType.CLEAR } : undefined),
        margins: { top: 120, bottom: 120, left: 150, right: 150 },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E0' },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E0' },
          left: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E0' },
          right: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E0' },
        },
      });
    });
    tableRows.push(new TableRow({ children: cells }));
  });

  children.push(
    new Table({
      rows: tableRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    })
  );
  children.push(new Paragraph({ spacing: { after: 200 } }));
  tableRowsData = [];
  inTable = false;
}

for (let i = 0; i < lines.length; i++) {
  let line = lines[i].trimEnd();

  // Code Block Handling
  if (line.startsWith('```')) {
    if (inCodeBlock) {
      // Flush code block
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: codeBuffer.join('\n'),
              font: 'Consolas',
              size: 20,
              color: '2D3748',
            }),
          ],
          shading: { fill: 'EDF2F7', val: ShadingType.CLEAR },
          spacing: { before: 150, after: 150 },
        })
      );
      codeBuffer = [];
      inCodeBlock = false;
    } else {
      inCodeBlock = true;
    }
    continue;
  }

  if (inCodeBlock) {
    codeBuffer.push(line);
    continue;
  }

  // Table Handling
  if (line.startsWith('|') && line.endsWith('|')) {
    // Check if separator line
    if (line.includes('---')) {
      continue;
    }
    const cells = line.split('|').slice(1, -1);
    tableRowsData.push(cells);
    inTable = true;
    continue;
  } else if (inTable) {
    flushTable();
  }

  // Horizontal Rule / Page Break
  if (line === '---') {
    children.push(new Paragraph({ spacing: { before: 200, after: 200 } }));
    continue;
  }

  // Headings
  if (line.startsWith('# ')) {
    const text = line.replace('# ', '');
    children.push(
      new Paragraph({
        children: [new TextRun({ text, bold: true, font: FONT_FAMILY, size: 36, color: COLOR_PRIMARY })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        alignment: AlignmentType.CENTER,
      })
    );
  } else if (line.startsWith('## ')) {
    const text = line.replace('## ', '');
    children.push(
      new Paragraph({
        children: [new TextRun({ text, bold: true, font: FONT_FAMILY, size: 30, color: COLOR_PRIMARY })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 350, after: 150 },
      })
    );
  } else if (line.startsWith('### ')) {
    const text = line.replace('### ', '');
    children.push(
      new Paragraph({
        children: [new TextRun({ text, bold: true, font: FONT_FAMILY, size: 26, color: COLOR_SECONDARY })],
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 250, after: 100 },
      })
    );
  } else if (line.startsWith('#### ')) {
    const text = line.replace('#### ', '');
    children.push(
      new Paragraph({
        children: [new TextRun({ text, bold: true, font: FONT_FAMILY, size: 26, color: COLOR_TEXT })],
        heading: HeadingLevel.HEADING_4,
        spacing: { before: 200, after: 100 },
      })
    );
  } else if (line.startsWith('* ') || line.startsWith('- ')) {
    // Bullet list item
    const text = line.replace(/^[\*\-] /, '');
    children.push(
      new Paragraph({
        children: parseInlineFormatting(text),
        bullet: { level: 0 },
        spacing: { before: 60, after: 60 },
      })
    );
  } else if (/^\d+\.\s/.test(line)) {
    // Numbered list item
    const text = line.replace(/^\d+\.\s/, '');
    children.push(
      new Paragraph({
        children: parseInlineFormatting(text),
        bullet: { level: 0 },
        spacing: { before: 60, after: 60 },
      })
    );
  } else if (line.trim() !== '') {
    // Standard Paragraph
    children.push(
      new Paragraph({
        children: parseInlineFormatting(line),
        spacing: { before: 100, after: 100, line: 312 }, // 1.3 line spacing (312/240)
      })
    );
  }
}

// Flush remaining table if file ends
if (inTable) {
  flushTable();
}

const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: 1440, // 1 inch = 1440 dxa = 2.54 cm
            bottom: 1440,
            left: 1440,
            right: 1440,
          },
        },
      },
      children,
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(docxFilePath, buffer);
  console.log('✅ Document successfully created at:', docxFilePath);
}).catch((err) => {
  console.error('❌ Error generating docx:', err);
});
