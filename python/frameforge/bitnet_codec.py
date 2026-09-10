"""Packed ternary weights. Stdlib only."""
from __future__ import annotations
MAGIC = b"FFBN"

def pack_header(rows: int, cols: int, scale: float, blob: bytes) -> bytes:
    import struct
    return MAGIC + struct.pack("<HHfI", rows, cols, float(scale), len(blob)) + blob

def unpack_header(buf: bytes):
    import struct
    if len(buf) < 16 or buf[:4] != MAGIC:
        raise ValueError("not an FFBN sidecar")
    rows, cols, scale, nbytes = struct.unpack_from("<HHfI", buf, 4)
    return rows, cols, scale, buf[16:16+nbytes]

def pack_ternary(weights):
    out = bytearray(); acc=0; n=0
    for w in weights:
        bit = 1 if w < 0 else (2 if w > 0 else 0)
        acc |= bit << (n*2); n += 1
        if n == 4:
            out.append(acc); acc=0; n=0
    if n: out.append(acc)
    return bytes(out)

def unpack_ternary(blob, count):
    table = (0,-1,1,0); vals=[]
    for byte in blob:
        for shift in (0,2,4,6):
            if len(vals) >= count: return vals
            vals.append(table[(byte>>shift)&3])
    return vals[:count]

def matvec(weights, rows, cols, vec, scale):
    out=[0.0]*rows
    for r in range(rows):
        acc=0.0; base=r*cols
        for c in range(cols):
            w=weights[base+c]
            if w: acc += vec[c] if w>0 else -vec[c]
        out[r]=acc*scale
    return out
