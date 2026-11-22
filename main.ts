// Tiny stack VM: 32-bit wrapping ints, 256-value stack, 64 calls, 256 words.
// One run answers every instance in /input as /output/<id>/{stdout.bin,exit.txt}.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const I = process.env.MAKEFUN_INPUT_DIR ?? '/input', O = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const E = new TextEncoder();
function run(p, q) {
 const D = new Int32Array(256); let s = 0;
 const C = new Int32Array(64); let c = 0;
 const M = new Int32Array(256);
 const o = new Uint8Array(65536); let l = 0, j = 0, pc = 0, t = 0;
 const n = p.length, done = e => ({ o: o.subarray(0, l), e });
 for (;;) {
  if (t === 1e6) return done(10);
  if (pc < 0 || pc >= n) return done(9);
  const op = p[pc++];
  t++;
  if (op >= 0x10 && op <= 0x22 && op !== 0x17 && op !== 0x1b && op !== 0x1f) {
   if (s < 2) return done(2);
   const b = D[s - 1], a = D[s - 2];
   let r;
   if (op === 0x13 || op === 0x14 || op === 0x15 || op === 0x16) {
    if (!b) return done(4);
    r = op === 0x13 ? (a / b) | 0 : op === 0x14 ? (a % b) | 0 : op === 0x15 ? Math.floor((a >>> 0) / (b >>> 0)) | 0 : ((a >>> 0) % (b >>> 0)) | 0;
   } else r = op === 0x10 ? (a + b) | 0 : op === 0x11 ? (a - b) | 0 : op === 0x12 ? Math.imul(a, b) : op === 0x18 ? a & b : op === 0x19 ? a | b : op === 0x1a ? a ^ b : op === 0x1c ? a << (b & 31) : op === 0x1d ? a >> (b & 31) : op === 0x1e ? (a >>> (b & 31)) | 0 : op === 0x20 ? (a === b ? 1 : 0) : op === 0x21 ? (a < b ? 1 : 0) : ((a >>> 0) < (b >>> 0) ? 1 : 0);
   s -= 2; D[s++] = r;
   continue;
  }
  switch (op) {
   case 0x00: return done(0);
   case 0x01:
    if (pc >= n) return done(9);
    if (s > 255) return done(3);
    D[s++] = (p[pc++] << 24) >> 24;
    break;
   case 0x02:
    if (pc + 3 >= n) return done(9);
    if (s > 255) return done(3);
    D[s++] = p[pc] | (p[pc + 1] << 8) | (p[pc + 2] << 16) | (p[pc + 3] << 24);
    pc += 4;
    break;
   case 0x03:
    if (!s) return done(2);
    s--;
    break;
   case 0x04:
    if (!s) return done(2);
    if (s > 255) return done(3);
    D[s] = D[s - 1]; s++;
    break;
   case 0x05:
    if (s < 2) return done(2);
    { const v = D[s - 1]; D[s - 1] = D[s - 2]; D[s - 2] = v; }
    break;
   case 0x06:
    if (s < 2) return done(2);
    if (s > 255) return done(3);
    D[s] = D[s - 2]; s++;
    break;
   case 0x07:
    if (s < 3) return done(2);
    { const v = D[s - 3]; D[s - 3] = D[s - 2]; D[s - 2] = D[s - 1]; D[s - 1] = v; }
    break;
   case 0x17: case 0x1b:
    if (!s) return done(2);
    D[s - 1] = op === 0x17 ? -D[s - 1] | 0 : ~D[s - 1];
    break;
   case 0x30: case 0x31: case 0x32: {
    if (pc + 1 >= n) return done(9);
    const rel = ((p[pc] | (p[pc + 1] << 8)) << 16) >> 16;
    pc += 2;
    let take = true;
    if (op !== 0x30) {
     if (!s) return done(2);
     const v = D[--s];
     take = op === 0x31 ? v === 0 : v !== 0;
    }
    if (take) pc += rel;
    break;
   }
   case 0x33: {
    if (pc + 1 >= n) return done(9);
    const tgt = p[pc] | (p[pc + 1] << 8);
    pc += 2;
    if (c === 64) return done(7);
    C[c++] = pc;
    pc = tgt;
    break;
   }
   case 0x34:
    if (!c) return done(8);
    pc = C[--c];
    break;
   case 0x40: {
    if (!s) return done(2);
    const addr = D[s - 1];
    if (addr < 0 || addr > 255) return done(6);
    D[s - 1] = M[addr];
    break;
   }
   case 0x41: {
    if (s < 2) return done(2);
    const addr = D[s - 1], v = D[s - 2];
    if (addr < 0 || addr > 255) return done(6);
    s -= 2; M[addr] = v;
    break;
   }
   case 0x50: {
    if (!s) return done(2);
    const b = E.encode(String(D[s - 1]));
    if (l + b.length > 65536) return done(11);
    s--; o.set(b, l); l += b.length;
    break;
   }
   case 0x51:
    if (!s) return done(2);
    if (l + 1 > 65536) return done(11);
    o[l++] = D[--s] & 255;
    break;
   case 0x52:
    if (s > 255) return done(3);
    D[s++] = j < q.length ? q[j++] : -1;
    break;
   case 0x53:
    if (!s) return done(2);
    return done(D[--s] & 255);
   default: return done(5);
  }
 }
}
for (const id of readdirSync(I).sort()) {
 const R = f => readFileSync(join(I, id, f));
 const r = run(R('program.bin'), R('input.bin'));
 mkdirSync(join(O, id), { recursive: true });
 writeFileSync(join(O, id, 'stdout.bin'), r.o);
 writeFileSync(join(O, id, 'exit.txt'), r.e + '\n');
}
