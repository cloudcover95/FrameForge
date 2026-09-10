"""Classic CSR pack for ternary weights. Stdlib only."""
from __future__ import annotations
import struct
from pathlib import Path
MAGIC=b"FFCS"
def to_csr(tern, rows, cols):
    row_ptr=[0]; col_idx=[]; sign=[]
    for r in range(rows):
        for c in range(cols):
            w=tern[r*cols+c]
            if w:
                col_idx.append(c); sign.append(1 if w>0 else -1)
        row_ptr.append(len(col_idx))
    return row_ptr, col_idx, sign
def pack_csr(row_ptr, col_idx, sign, rows, cols, scale):
    nnz=len(col_idx)
    buf=bytearray(MAGIC+struct.pack("<HHfI", rows, cols, float(scale), nnz))
    buf.extend(struct.pack(f"<{len(row_ptr)}H", *row_ptr))
    if nnz:
        buf.extend(struct.pack(f"<{nnz}H", *col_idx))
        buf.extend(struct.pack(f"{nnz}b", *sign))
    return bytes(buf)
