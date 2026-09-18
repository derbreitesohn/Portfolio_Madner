// The museum's walkways and causeways are laid as separate stones, and the gaps
// between them are wide enough to drop through into the pool. Rather than
// editing the sculpt, we close those gaps in the collision world only: nothing
// here is ever rendered.
//
// Everything works off ONE height field: the highest walkable surface in each
// cell of the courtyard. Each storey is then closed morphologically — dilate,
// erode — so a gap narrower than twice the radius is bridged while an opening
// wider than that, the pool or a stairwell, reopens and is left alone.
//
// The single height field is what keeps the filler honest. An earlier version
// closed each storey against its own grid, which happily stacked three or four
// invisible floors over the same spot and wedged the player between them. A
// cell can now receive at most one filler, and only where there is a real hole
// beneath it.

/** Grid resolution in scene units. Half the player capsule's diameter. */
const CELL = 0.25;
/** Gaps narrower than twice this are bridged. The pool is far wider. */
const CLOSE_RADIUS = 1.25;
/** Within ~25 degrees of horizontal counts as a surface worth standing on. */
const FLAT_NORMAL_Y = 0.9;
/** Surfaces closer together than this belong to the same storey. */
const LEVEL_TOLERANCE = 0.2;
/** And no storey may span more than this, or every height chains into one. */
const MAX_LEVEL_SPAN = 0.3;
/** Below this a storey is a bench or a kerb, not a floor. */
const MIN_LEVEL_AREA = 6;
/** How far a cell must fall below a storey before it counts as a hole in it.
 *  Generous on purpose: bridging a kerb-height lip would put an invisible step
 *  in the middle of a walkway, which is worse than the hole it closed. */
const MIN_DROP = 0.6;
/** Keeps a pathological bounding box from allocating an enormous grid. */
const MAX_CELLS_PER_AXIS = 640;

type Face = {
  y: number; area: number;
  ax: number; az: number; bx: number; bz: number; cx: number; cz: number;
};

/** True when the cell centre falls inside the triangle, projected to XZ. */
function covers(px: number, pz: number, f: Face) {
  const d1 = (px - f.bx) * (f.az - f.bz) - (f.ax - f.bx) * (pz - f.bz);
  const d2 = (px - f.cx) * (f.bz - f.cz) - (f.bx - f.cx) * (pz - f.cz);
  const d3 = (px - f.ax) * (f.cz - f.az) - (f.cx - f.ax) * (pz - f.az);
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
}

/** Square-element dilation (grow) or erosion, separated into two passes.
 *  Everything outside the grid reads as empty, which is why the grid is padded. */
function morph(src: Uint8Array, w: number, h: number, r: number, grow: boolean) {
  const hit = grow ? 1 : 0;
  const pass = (from: Uint8Array, alongX: boolean) => {
    const to = new Uint8Array(w * h);
    for (let z = 0; z < h; z++) {
      for (let x = 0; x < w; x++) {
        let found = false;
        for (let k = -r; k <= r && !found; k++) {
          const xx = alongX ? x + k : x, zz = alongX ? z : z + k;
          const outside = xx < 0 || xx >= w || zz < 0 || zz >= h;
          // Outside the grid is empty: it dilates nothing and erodes everything.
          if (outside ? hit === 0 : from[zz * w + xx] === hit) found = true;
        }
        to[z * w + x] = found ? hit : 1 - hit;
      }
    }
    return to;
  };
  return pass(pass(src, true), false);
}

/** Merge a mask into as few rectangles as it reasonably can, greedily.
 *  Consumes the mask. */
function rectangles(mask: Uint8Array, w: number, h: number) {
  const found: [number, number, number, number][] = [];
  for (let z = 0; z < h; z++) {
    for (let x = 0; x < w; x++) {
      if (!mask[z * w + x]) continue;
      let x1 = x;
      while (x1 + 1 < w && mask[z * w + x1 + 1]) x1++;
      let z1 = z;
      grow: while (z1 + 1 < h) {
        for (let k = x; k <= x1; k++) if (!mask[(z1 + 1) * w + k]) break grow;
        z1++;
      }
      for (let zz = z; zz <= z1; zz++) for (let xx = x; xx <= x1; xx++) mask[zz * w + xx] = 0;
      found.push([x, z, x1, z1]);
    }
  }
  return found;
}

/** Collision-only triangles that close the gaps in the walkable surfaces.
 *  `walkLevel` is the height the visitor actually walks at; nothing above it is
 *  bridged. */
export function bridgeGaps(triangles: number[], walkLevel: number) {
  const faces: Face[] = [];
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (let i = 0; i < triangles.length; i += 9) {
    const ax = triangles[i], ay = triangles[i + 1], az = triangles[i + 2];
    const bx = triangles[i + 3], by = triangles[i + 4], bz = triangles[i + 5];
    const cx = triangles[i + 6], cy = triangles[i + 7], cz = triangles[i + 8];
    const ux = bx - ax, uy = by - ay, uz = bz - az;
    const vx = cx - ax, vy = cy - ay, vz = cz - az;
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const length = Math.hypot(nx, ny, nz);
    if (length < 1e-9 || Math.abs(ny) / length < FLAT_NORMAL_Y) continue;
    faces.push({ y: (ay + by + cy) / 3, area: length / 2, ax, az, bx, bz, cx, cz });
    minX = Math.min(minX, ax, bx, cx); maxX = Math.max(maxX, ax, bx, cx);
    minZ = Math.min(minZ, az, bz, cz); maxZ = Math.max(maxZ, az, bz, cz);
  }
  if (!faces.length) return [];

  // One grid for the whole museum, so a cell has one answer, not one per storey.
  const pad = CLOSE_RADIUS * 2;
  minX -= pad; minZ -= pad; maxX += pad; maxZ += pad;
  const span = Math.max(maxX - minX, maxZ - minZ);
  const cell = Math.max(CELL, span / MAX_CELLS_PER_AXIS);
  const w = Math.ceil((maxX - minX) / cell), h = Math.ceil((maxZ - minZ) / cell);
  if (w < 3 || h < 3) return [];

  const top = new Float32Array(w * h).fill(-Infinity);
  for (const f of faces) {
    const x0 = Math.max(0, Math.floor((Math.min(f.ax, f.bx, f.cx) - minX) / cell));
    const x1 = Math.min(w - 1, Math.ceil((Math.max(f.ax, f.bx, f.cx) - minX) / cell));
    const z0 = Math.max(0, Math.floor((Math.min(f.az, f.bz, f.cz) - minZ) / cell));
    const z1 = Math.min(h - 1, Math.ceil((Math.max(f.az, f.bz, f.cz) - minZ) / cell));
    for (let z = z0; z <= z1; z++) {
      for (let x = x0; x <= x1; x++) {
        if (top[z * w + x] >= f.y) continue;
        if (covers(minX + (x + 0.5) * cell, minZ + (z + 0.5) * cell, f)) top[z * w + x] = f.y;
      }
    }
  }

  // Group the surfaces into storeys, capped so a museum with a surface every
  // 0.1 units cannot chain every height into one.
  const sorted = [...faces].sort((a, b) => a.y - b.y);
  const storeys: { low: number; high: number; y: number }[] = [];
  let group: Face[] = [];
  const flush = () => {
    if (!group.length) return;
    const total = group.reduce((sum, f) => sum + f.area, 0);
    if (total >= MIN_LEVEL_AREA) {
      // Weight the height by area so the filler sits flush with the dominant
      // surface of the storey rather than with a stray sliver.
      let seen = 0, y = group[group.length - 1].y;
      for (const face of group) { seen += face.area; if (seen >= total / 2) { y = face.y; break; } }
      storeys.push({ low: group[0].y - 0.05, high: group[group.length - 1].y + 0.05, y });
    }
    group = [];
  };
  for (const face of sorted) {
    if (group.length && (face.y - group[group.length - 1].y > LEVEL_TOLERANCE
      || face.y - group[0].y > MAX_LEVEL_SPAN)) flush();
    group.push(face);
  }
  flush();

  // Only the ground bridges. Anything above the walking level is a roof, a
  // ledge or an upper gallery, and closing those drops an invisible floor into
  // the headroom of the walkway below, shoving the player upwards out of
  // nowhere. Area cannot stand in for this: the single largest flat surface in
  // the museum is the floor of the pool, well below where anyone walks.
  const ceiling = walkLevel + 0.1;

  // Close each storey against the shared height field. A cell keeps only the
  // LOWEST filler offered to it — the storey just above the hole it sits in —
  // so nothing is ever stacked and no invisible lip lands on a higher floor.
  const r = Math.max(1, Math.round(CLOSE_RADIUS / cell));
  const fill = new Float32Array(w * h).fill(Infinity);
  let filled = false;
  for (const storey of storeys) {
    if (storey.y > ceiling) continue;
    const mask = new Uint8Array(w * h);
    for (let i = 0; i < mask.length; i++) {
      if (top[i] >= storey.low && top[i] <= storey.high) mask[i] = 1;
    }
    const closed = morph(mask, w, h, r, true);
    for (let i = 0; i < closed.length; i++) {
      if (!closed[i] || mask[i]) continue;
      // Only a real hole gets a floor, and only from the nearest storey above.
      if (top[i] >= storey.y - MIN_DROP) continue;
      if (storey.y < fill[i]) { fill[i] = storey.y; filled = true; }
    }
  }
  if (!filled) return [];

  const heights = [...new Set(Array.from(fill).filter((y) => y !== Infinity))];
  const out: number[] = [];
  for (const y of heights) {
    const mask = new Uint8Array(w * h);
    for (let i = 0; i < fill.length; i++) if (fill[i] === y) mask[i] = 1;
    for (const [x0, z0, x1, z1] of rectangles(mask, w, h)) {
      const ax = minX + x0 * cell, az = minZ + z0 * cell;
      const bx = minX + (x1 + 1) * cell, bz = minZ + (z1 + 1) * cell;
      out.push(ax, y, az, ax, y, bz, bx, y, bz, ax, y, az, bx, y, bz, bx, y, az);
    }
  }
  return out;
}
