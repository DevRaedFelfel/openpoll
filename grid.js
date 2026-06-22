// Cell id convention:
//   rows AND cols -> `${rowId}__${colId}`
//   rows only     -> rowId
//   cols only     -> colId
export function cellIdFor(rowId, colId, hasRows, hasCols) {
  if (hasRows && hasCols) return `${rowId}__${colId}`;
  if (hasRows) return rowId;
  return colId;
}

// Builds an empty grid scaffold and returns { wrapper, cells } where
// `cells` maps cellId -> the drop/display <div class="cell"> for that cell.
// Works for a 2D grid, a single column (rows only), or a single row (cols only).
export function buildGrid(rows, cols) {
  const hasRows = rows && rows.length > 0;
  const hasCols = cols && cols.length > 0;
  const wrapper = document.createElement("div");
  wrapper.className = "grid";
  const cells = {};

  const colCount = hasCols ? cols.length : 1;
  // CSS grid columns: optional row-header column + one per data column
  wrapper.style.gridTemplateColumns =
    (hasRows ? "minmax(96px,auto) " : "") + `repeat(${colCount}, 1fr)`;

  // Column header row
  if (hasCols) {
    if (hasRows) wrapper.appendChild(corner());
    cols.forEach((c) => wrapper.appendChild(headerCell(c.label, "col")));
  }

  const rowList = hasRows ? rows : [{ id: null, label: null }];
  rowList.forEach((r) => {
    if (hasRows) wrapper.appendChild(headerCell(r.label, "row"));
    const colList = hasCols ? cols : [{ id: null }];
    colList.forEach((c) => {
      const id = cellIdFor(r.id, c.id, hasRows, hasCols);
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.cell = id;
      wrapper.appendChild(cell);
      cells[id] = cell;
    });
  });

  return { wrapper, cells };
}

function corner() {
  const d = document.createElement("div");
  d.className = "ghead corner";
  return d;
}
function headerCell(label, kind) {
  const d = document.createElement("div");
  d.className = "ghead " + kind;
  d.textContent = label;
  return d;
}

// Mobile-friendly drop layout for the audience: a vertical stack of
// full-width, labelled drop zones. Same cellId keys as buildGrid.
export function buildZones(rows, cols) {
  const hasRows = rows && rows.length > 0;
  const hasCols = cols && cols.length > 0;
  const wrap = document.createElement("div");
  wrap.className = "zones";
  const cells = {};
  const rowList = hasRows ? rows : [{ id: null, label: null }];
  rowList.forEach((r) => {
    const colList = hasCols ? cols : [{ id: null, label: null }];
    colList.forEach((c) => {
      const id = cellIdFor(r.id, c.id, hasRows, hasCols);
      const zone = document.createElement("div");
      zone.className = "zone";
      const lab = document.createElement("div");
      lab.className = "zlabel";
      lab.textContent = zoneLabel(rows, cols, r, c, hasRows, hasCols);
      const drop = document.createElement("div");
      drop.className = "cell drop";
      drop.dataset.cell = id;
      zone.appendChild(lab);
      zone.appendChild(drop);
      wrap.appendChild(zone);
      cells[id] = drop;
    });
  });
  return { wrapper: wrap, cells };
}

function zoneLabel(rows, cols, r, c, hasRows, hasCols) {
  if (hasRows && hasCols) {
    if (rows.length === 1) return c.label;
    if (cols.length === 1) return r.label;
    return r.label + " · " + c.label;
  }
  return hasRows ? r.label : c.label;
}