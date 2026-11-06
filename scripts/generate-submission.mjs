import fs from "fs";
import path from "path";
import zlib from "zlib";
import { execSync } from "child_process";

// Simple CRC32 implementation
function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

// Zero-dependency ZIP builder
export class ZipBuilder {
  constructor() {
    this.files = [];
  }

  addFile(filePath, content) {
    const data = Buffer.isBuffer(content) ? content : Buffer.from(content, "utf8");
    this.files.push({ path: filePath.replace(/\\/g, "/"), data });
  }

  toBuffer() {
    const localHeaders = [];
    const centralHeaders = [];
    let offset = 0;

    const now = new Date();
    const time = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xffff;
    const date = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xffff;

    for (const file of this.files) {
      const fileNameBuf = Buffer.from(file.path, "utf8");
      const compressed = zlib.deflateRawSync(file.data);
      const crc = crc32(file.data);

      const localHeader = Buffer.alloc(30 + fileNameBuf.length);
      localHeader.writeUInt32LE(0x04034b50, 0); // signature
      localHeader.writeUInt16LE(20, 4); // version needed
      localHeader.writeUInt16LE(0, 6); // flags
      localHeader.writeUInt16LE(8, 8); // compression: deflate
      localHeader.writeUInt16LE(time, 10);
      localHeader.writeUInt16LE(date, 12);
      localHeader.writeUInt32LE(crc, 14);
      localHeader.writeUInt32LE(compressed.length, 18);
      localHeader.writeUInt32LE(file.data.length, 22);
      localHeader.writeUInt16LE(fileNameBuf.length, 26);
      localHeader.writeUInt16LE(0, 28); // extra field length
      fileNameBuf.copy(localHeader, 30);

      const centralHeader = Buffer.alloc(46 + fileNameBuf.length);
      centralHeader.writeUInt32LE(0x02014b50, 0); // signature
      centralHeader.writeUInt16LE(20, 4); // version made by
      centralHeader.writeUInt16LE(20, 6); // version needed
      centralHeader.writeUInt16LE(0, 8); // flags
      centralHeader.writeUInt16LE(8, 10); // compression: deflate
      centralHeader.writeUInt16LE(time, 12);
      centralHeader.writeUInt16LE(date, 14);
      centralHeader.writeUInt32LE(crc, 16);
      centralHeader.writeUInt32LE(compressed.length, 20);
      centralHeader.writeUInt32LE(file.data.length, 24);
      centralHeader.writeUInt16LE(fileNameBuf.length, 28);
      centralHeader.writeUInt16LE(0, 30); // extra field length
      centralHeader.writeUInt16LE(0, 32); // comment length
      centralHeader.writeUInt16LE(0, 34); // disk number start
      centralHeader.writeUInt16LE(0, 36); // internal file attributes
      centralHeader.writeUInt32LE(0, 38); // external file attributes
      centralHeader.writeUInt32LE(offset, 42); // relative offset of local header
      fileNameBuf.copy(centralHeader, 46);

      localHeaders.push(localHeader, compressed);
      centralHeaders.push(centralHeader);

      offset += localHeader.length + compressed.length;
    }

    const centralDirectoryOffset = offset;
    let centralDirectorySize = 0;
    for (const ch of centralHeaders) {
      centralDirectorySize += ch.length;
    }

    const endOfCentralDir = Buffer.alloc(22);
    endOfCentralDir.writeUInt32LE(0x06054b50, 0); // signature
    endOfCentralDir.writeUInt16LE(0, 4); // disk number
    endOfCentralDir.writeUInt16LE(0, 6); // disk number with start of CD
    endOfCentralDir.writeUInt16LE(this.files.length, 8); // total entries on this disk
    endOfCentralDir.writeUInt16LE(this.files.length, 10); // total entries
    endOfCentralDir.writeUInt32LE(centralDirectorySize, 12);
    endOfCentralDir.writeUInt32LE(centralDirectoryOffset, 16);
    endOfCentralDir.writeUInt16LE(0, 20); // comment length

    return Buffer.concat([...localHeaders, ...centralHeaders, endOfCentralDir]);
  }
}

export function buildDocx(data) {
  const zip = new ZipBuilder();

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>Student Code: ${data.studentCode}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Full Name: ${data.fullName}</w:t></w:r></w:p>
    <w:p><w:r><w:t>GitHub Repository URL: ${data.githubUrl}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Vercel Production URL: ${data.vercelUrl}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Test account email: ${data.testEmail}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Test account password: ${data.testPassword}</w:t></w:r></w:p>
  </w:body>
</w:document>`;

  zip.addFile("[Content_Types].xml", contentTypesXml);
  zip.addFile("_rels/.rels", relsXml);
  zip.addFile("word/document.xml", documentXml);

  return zip.toBuffer();
}

// Parse args
const args = process.argv.slice(2);
const params = {
  studentCode: "QE123456",
  fullName: "Nguyen Van A",
  githubUrl: "https://github.com/username/repo-name",
  vercelUrl: "https://your-project.vercel.app",
  testEmail: "grader.qe123456@example.com",
  testPassword: "Test1234!",
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--code" && args[i + 1]) params.studentCode = args[++i];
  if (args[i] === "--name" && args[i + 1]) params.fullName = args[++i];
  if (args[i] === "--github" && args[i + 1]) params.githubUrl = args[++i];
  if (args[i] === "--vercel" && args[i + 1]) params.vercelUrl = args[++i];
  if (args[i] === "--email" && args[i + 1]) params.testEmail = args[++i];
  if (args[i] === "--password" && args[i + 1]) params.testPassword = args[++i];
}

const outDir = path.resolve(process.cwd(), "submission");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// 1. Generate .docx
const docxBuffer = buildDocx(params);
const docxPath = path.join(outDir, `${params.studentCode}.docx`);
fs.writeFileSync(docxPath, docxBuffer);
console.log(`[SUCCESS] Generated Word document: ${docxPath}`);

// 2. Generate .zip
// Allowed items according to section 4: package.json, lock file, app/, components/, public/, components.json, prisma/schema.prisma, prisma/migrations/, .env.example
const rootDir = process.cwd();
const zipBuilder = new ZipBuilder();

function addDirToZip(baseDir, currentRel = "") {
  const fullPath = path.join(baseDir, currentRel);
  if (!fs.existsSync(fullPath)) return;
  const entries = fs.readdirSync(fullPath, { withFileTypes: true });
  for (const entry of entries) {
    const rel = path.join(currentRel, entry.name);
    const abs = path.join(baseDir, rel);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") continue;
      addDirToZip(baseDir, rel);
    } else {
      if (entry.name.startsWith(".env") && entry.name !== ".env.example") continue;
      const content = fs.readFileSync(abs);
      zipBuilder.addFile(rel, content);
    }
  }
}

// Add files
const rootFiles = ["package.json", "package-lock.json", "components.json", ".env.example", "next.config.ts", "tsconfig.json"];
for (const file of rootFiles) {
  const fp = path.join(rootDir, file);
  if (fs.existsSync(fp)) {
    zipBuilder.addFile(file, fs.readFileSync(fp));
  }
}

// Add folders
const folders = ["app", "components", "context", "lib", "public", "prisma"];
for (const folder of folders) {
  addDirToZip(rootDir, folder);
}

const zipBuffer = zipBuilder.toBuffer();
const zipPath = path.join(outDir, `${params.studentCode}.zip`);
fs.writeFileSync(zipPath, zipBuffer);
console.log(`[SUCCESS] Generated Submission ZIP: ${zipPath}`);
console.log(`[READY] Place both files in your final submission folder as required by Section 4!`);

