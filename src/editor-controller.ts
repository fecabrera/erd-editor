import {
  parseSchema,
  layoutSchema,
  graphBounds,
  describeError,
  tableIdsInRectangle,
  tableTargetAtPoint,
} from "./schema";
import type { Point, Scene, Schema } from "./schema";
import { createDiagramHistory, type TableMoveStart } from "./diagram-history";
import {
  drawGraph,
  drawGrid,
  drawSelectionBox,
  fonts,
  hoverAtPoint,
  invalidateConnectorPaths,
  readPalette,
} from "./draw";
import type { DiagramHover, Palette } from "./draw";
import { example } from "./example";
import { exportImageShortcut, isMacPlatform } from "./keyboard-shortcuts";
import { systemThemeQuery, themeColors, themeStorageKey } from "./theme";

const DRAG_THRESHOLD = 4;
const MIDDLE_MOUSE_BUTTON = 1;
const MIDDLE_MOUSE_BUTTON_MASK = 4;
const sourceStorageKey = "schema-studio:source";

type CanvasDrag = {
  id: number;
  origin: Point;
  moved: boolean;
  middleButton: boolean;
} & (
  | { kind: "select"; end: Point }
  | { kind: "pan"; start: Point; clearOnTap: boolean }
  | {
      kind: "move";
      tableId: string;
      starts: TableMoveStart[];
    }
);

export function mountEditor(onTablesChanged: (tables: Schema["tables"]) => void) {
  const listeners = new AbortController();
  function find<T extends HTMLElement = HTMLElement>(id: string): T {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Missing editor element: ${id}`);
    return element as T;
  }

  function on<K extends keyof HTMLElementEventMap>(
    target: HTMLElement | Document,
    type: K,
    listener: (event: HTMLElementEventMap[K]) => void,
    options?: AddEventListenerOptions,
  ) {
    target.addEventListener(
      type,
      (event: Event) => listener(event as HTMLElementEventMap[K]),
      { ...options, signal: listeners.signal },
    );
  }

  const editor = find<HTMLTextAreaElement>("dbml");
  const editorPane = find("editor-pane");
  const diagramInfo = find("diagram-info");
  const diagramToolbar = find("diagram-toolbar");
  const undoButton = find<HTMLButtonElement>("diagram-undo");
  const redoButton = find<HTMLButtonElement>("diagram-redo");
  const pointerTool = find<HTMLButtonElement>("diagram-tool-pointer");
  const handTool = find<HTMLButtonElement>("diagram-tool-hand");
  const diagramNavigation = find("diagram-navigation");
  const zoomInput = find<HTMLInputElement>("zoom-level");
  const highlight = find("highlight");
  const lineNumbers = find("line-numbers");
  const canvas = find<HTMLCanvasElement>("diagram");
  const canvasContext = canvas.getContext("2d");
  if (!canvasContext) return;
  const context = canvasContext;
  const workspaceMenu = find("workspace-menu");
  const menuButton = find("toggle-menu");
  const menuPanel = find("menu-panel");
  const systemTheme = window.matchMedia(systemThemeQuery);
  const swatches = document.querySelectorAll<HTMLButtonElement>(
    "[data-theme-choice]",
  );
  const errorText = find("syntax-error");
  const exportDialog = find<HTMLDialogElement>("export-dialog");
  const exportForm = find<HTMLFormElement>("export-form");
  const openExport = find<HTMLButtonElement>("open-export");
  const downloadExport = find<HTMLButtonElement>("download-export");
  const themeBackground = find<HTMLInputElement>("theme-background");
  const transparentBackground = find<HTMLInputElement>(
    "transparent-background",
  );
  const status = find("schema-status");
  const isMac = isMacPlatform();
  const diagramHistory = createDiagramHistory();
  const frame = { width: 0, height: 0, ratio: 1 };
  const view = { x: 0, y: 0, scale: 1 };
  let scene: Scene = { tables: [], links: [], byId: new Map() };
  let selectedTableIds = new Set<string>();
  let themePreference = normalizeTheme(load(themeStorageKey));
  let palette: Palette;
  let pngBackground = "theme";
  let activeDrag: CanvasDrag | undefined;
  let handToolSelected = false;
  let spacePressed = false;
  let hoverPosition: Point | undefined;
  let hovered: DiagramHover | undefined;
  let parseTimer: number | undefined;
  let toastTimer: number | undefined;
  let renderFrame: number | undefined;

  function load(key: string) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function save(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* storage is optional */
    }
  }

  function normalizeTheme(value: string | null | undefined): keyof typeof themeColors | "system" {
    return value === "light" || value === "dark" ? value : "system";
  }

  function changeTheme(next: string | undefined) {
    themePreference = normalizeTheme(next);
    save(themeStorageKey, themePreference);
    applyTheme();
  }

  function applyTheme() {
    const theme =
      themePreference === "system"
        ? systemTheme.matches
          ? "dark"
          : "light"
        : themePreference;
    document.documentElement.dataset.theme = theme;
    palette = readPalette(getComputedStyle(document.documentElement));
    for (const button of swatches)
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.themeChoice === themePreference),
      );
    const themeMeta = document.querySelector<HTMLMetaElement>(
      "meta[name=theme-color]",
    );
    if (themeMeta) themeMeta.content = themeColors[theme];
    repaint();
  }

  function repaint() {
    if (renderFrame !== undefined) return;
    renderFrame = requestAnimationFrame(() => {
      renderFrame = undefined;
      if (!frame.width || !frame.height) return;
      context.setTransform(frame.ratio, 0, 0, frame.ratio, 0, 0);
      drawGrid(context, view, frame.width, frame.height, palette);
      context.translate(view.x, view.y);
      context.scale(view.scale, view.scale);
      hovered =
        hoverPosition &&
        hoverAtPoint(context, scene, diagramPoint(hoverPosition), view.scale);
      const box =
        activeDrag?.kind === "select" && activeDrag.moved ? activeDrag : undefined;
      drawGraph(
        context,
        scene,
        palette,
        hovered,
        box ? tablesInBox(box) : selectedTableIds,
      );
      if (box) {
        context.setTransform(frame.ratio, 0, 0, frame.ratio, 0, 0);
        drawSelectionBox(context, box.origin, box.end, palette);
      }
      if (document.activeElement !== zoomInput) zoomInput.value = zoomValue();
    });
  }

  function resize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    if (
      width === frame.width &&
      height === frame.height &&
      ratio === frame.ratio
    )
      return;
    Object.assign(frame, { width, height, ratio });
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    centerDiagram();
  }

  function visibleDiagramArea() {
    const canvasBox = canvas.getBoundingClientRect();
    const editorBox = editorPane.getBoundingClientRect();
    const stacked = editorBox.width > frame.width / 2;
    const left = stacked ? 14 : editorBox.right - canvasBox.left + 16;
    const right = frame.width - 14;
    const top = diagramToolbar.getBoundingClientRect().bottom - canvasBox.top + 14;
    const bottom =
      Math.min(
        diagramInfo.getBoundingClientRect().top,
        diagramNavigation.getBoundingClientRect().top,
      ) - canvasBox.top - 14;
    return {
      left,
      top,
      width: Math.max(1, right - left),
      height: Math.max(1, bottom - top),
    };
  }

  function centerDiagram(fitToViewport = false) {
    if (scene.tables.length && frame.width && frame.height) {
      const bounds = graphBounds(scene, 22);
      const area = visibleDiagramArea();
      if (fitToViewport) {
        view.scale = Math.min(
          1.14,
          area.width / bounds.width,
          area.height / bounds.height,
        );
      }
      view.x =
        area.left +
        (area.width - bounds.width * view.scale) / 2 -
        bounds.x * view.scale;
      view.y =
        area.top +
        (area.height - bounds.height * view.scale) / 2 -
        bounds.y * view.scale;
    }
    repaint();
  }

  function setZoom(next: number, x?: number, y?: number) {
    if (x === undefined || y === undefined) {
      const area = visibleDiagramArea();
      x = area.left + area.width / 2;
      y = area.top + area.height / 2;
    }
    view.x = x - ((x - view.x) * next) / view.scale;
    view.y = y - ((y - view.y) * next) / view.scale;
    view.scale = next;
    repaint();
  }

  function zoom(factor: number, x?: number, y?: number) {
    const next = Math.min(
      3,
      Math.max(Math.min(0.02, view.scale), view.scale * factor),
    );
    setZoom(next, x, y);
  }

  function zoomValue() {
    return String(Math.max(0.1, Math.round(view.scale * 1000) / 10));
  }

  function commitZoom() {
    const current = zoomValue();
    const entry = zoomInput.value.trim();
    if (entry === current) {
      zoomInput.value = current;
      return;
    }

    const normalized = entry.replace(/\s*%$/, "").replace(",", ".");
    const percentage = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)
      ? Number(normalized)
      : NaN;
    if (Number.isFinite(percentage) && percentage > 0) {
      setZoom(Math.min(3, Math.max(0.001, percentage / 100)));
    } else {
      notice("Enter a zoom percentage greater than 0.");
    }
    zoomInput.value = zoomValue();
  }

  function syncScroll() {
    highlight.scrollTop = editor.scrollTop;
    highlight.scrollLeft = editor.scrollLeft;
    lineNumbers.scrollTop = editor.scrollTop;
  }

  function highlightCode() {
    const source = editor.value;
    const count = source.split("\n").length;
    lineNumbers.textContent = Array.from(
      { length: count },
      (_, index) => index + 1,
    ).join("\n");
    find("line-count").textContent =
      `${count} ${count === 1 ? "line" : "lines"}`;
    const fragment = document.createDocumentFragment();
    const tokenizer =
      /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")|\b(TableGroup|Table|Enum|Project|Ref|Note|indexes|as|pk|not null|unique|default|increment)\b|\b(integer|bigint|varchar|text|boolean|timestamp|date|decimal|numeric|jsonb|uuid)\b/g;
    let previous = 0;
    while (true) {
      const token = tokenizer.exec(source);
      if (!token) break;
      fragment.append(source.slice(previous, token.index));
      const span = document.createElement("span");
      span.className = token[1]
        ? "text-ui-comment"
        : token[2]
          ? "text-ui-string"
          : token[3]
            ? "text-ui-keyword font-[650]"
            : "text-ui-type";
      span.textContent = token[0];
      fragment.append(span);
      previous = tokenizer.lastIndex;
    }
    fragment.append(source.slice(previous) + "\n");
    highlight.replaceChildren(fragment);
    syncScroll();
  }

  function parseEditor() {
    try {
      const schema = parseSchema(editor.value);
      const next = layoutSchema(schema, (text, font) => {
        context.font = fonts[font];
        return context.measureText(text).width;
      });
      const signature = JSON.stringify(
        next.tables.map(({ id, fields }) => [id, fields]),
      );
      const changed = scene.signature !== signature;
      if (changed || activeDrag?.kind === "move") finishDrag();
      if (changed) {
        diagramHistory.clear();
        updateHistoryControls();
      }
      if (!changed) {
        for (const table of next.tables) {
          const previous = scene.byId.get(table.id);
          if (previous?.moved)
            Object.assign(table, { x: previous.x, y: previous.y, moved: true });
        }
      }
      scene = {
        ...next,
        signature,
        byId: new Map(next.tables.map((table) => [table.id, table])),
      };
      for (const id of selectedTableIds) {
        if (!scene.byId.has(id)) selectedTableIds.delete(id);
      }
      const tables = scene.tables.length;
      const links = scene.links.length;
      errorText.hidden = true;
      editor.removeAttribute("aria-invalid");
      editor.removeAttribute("aria-describedby");
      status.removeAttribute("data-invalid");
      find("schema-status-text").textContent = tables
        ? "Valid schema"
        : "No tables yet";
      find("diagram-summary").textContent = tables
        ? `${tables} ${tables === 1 ? "table" : "tables"} · ${links} ${links === 1 ? "relationship" : "relationships"}`
        : "No tables";
      updateCanvasLabel();
      find("empty").hidden = tables > 0;
      openExport.disabled = downloadExport.disabled = tables === 0;
      if (changed) {
        onTablesChanged(schema.tables);
        centerDiagram();
      } else repaint();
    } catch (error) {
      status.setAttribute("data-invalid", "");
      editor.setAttribute("aria-invalid", "true");
      editor.setAttribute("aria-describedby", "syntax-error");
      find("schema-status-text").textContent = "DBML needs attention";
      errorText.textContent = describeError(error);
      errorText.hidden = false;
      find("diagram-summary").textContent = scene.tables.length
        ? "Last valid diagram"
        : "No tables";
      openExport.disabled = downloadExport.disabled = true;
    }
  }

  function sourceChanged() {
    highlightCode();
    save(sourceStorageKey, editor.value);
    clearTimeout(parseTimer);
    openExport.disabled = downloadExport.disabled = true;
    parseTimer = window.setTimeout(parseEditor, 180);
  }

  function notice(message: string) {
    const toast = find("toast");
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 3000);
  }

  function exportDiagram(format: "png" | "jpg", includeBackground: boolean) {
    if (!scene.tables.length || !errorText.hidden) return;
    const bounds = graphBounds(scene);
    const image = document.createElement("canvas");
    const density = Math.min(
      2,
      8192 / Math.max(bounds.width, bounds.height),
      Math.sqrt(26_000_000 / (bounds.width * bounds.height)),
    );
    image.width = Math.max(1, Math.ceil(bounds.width * density));
    image.height = Math.max(1, Math.ceil(bounds.height * density));
    const output = image.getContext("2d");
    if (!output) {
      notice("Could not export the diagram.");
      return;
    }
    if (format === "jpg" || includeBackground) {
      output.fillStyle = palette.background;
      output.fillRect(0, 0, image.width, image.height);
    }
    output.setTransform(
      density,
      0,
      0,
      density,
      -bounds.x * density,
      -bounds.y * density,
    );
    drawGraph(output, scene, palette);
    image.toBlob(
      (blob) => {
        if (listeners.signal.aborted) return;
        if (!blob) {
          notice("Could not export the diagram.");
          return;
        }
        const url = URL.createObjectURL(blob);
        const download = document.createElement("a");
        download.href = url;
        download.download = `schema-diagram.${format}`;
        document.body.append(download);
        download.click();
        download.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        notice(`${format.toUpperCase()} downloaded`);
      },
      format === "jpg" ? "image/jpeg" : "image/png",
      0.94,
    );
  }

  function pointer(event: MouseEvent) {
    const bounds = canvas.getBoundingClientRect();
    return { x: event.clientX - bounds.x, y: event.clientY - bounds.y };
  }

  function diagramPoint({ x, y }: Point) {
    return { x: (x - view.x) / view.scale, y: (y - view.y) / view.scale };
  }

  function updateCanvasLabel() {
    let label = scene.tables.length
      ? `Schema diagram with ${scene.tables.length} tables and ${scene.links.length} relationships. Scroll, drag with Space or the middle mouse button held, or use arrow keys to pan. Use plus or minus to zoom.`
      : "No tables in the diagram.";
    if (selectedTableIds.size === 1) {
      const [id] = selectedTableIds;
      label += ` Selected table: ${scene.byId.get(id)?.name}.`;
    } else if (selectedTableIds.size > 1) {
      label += ` ${selectedTableIds.size} tables selected.`;
    }
    if (selectedTableIds.size) label += " Press Escape to clear the selection.";
    canvas.setAttribute("aria-label", label);
  }

  function selectTables(ids = new Set<string>()) {
    selectedTableIds = ids;
    updateCanvasLabel();
    repaint();
  }

  function tablesInBox(box: Extract<CanvasDrag, { kind: "select" }>) {
    return tableIdsInRectangle(
      scene.tables,
      diagramPoint(box.origin),
      diagramPoint(box.end),
    );
  }

  function finishDrag() {
    if (!activeDrag) return;
    const drag = activeDrag;
    activeDrag = undefined;
    if (canvas.hasPointerCapture(drag.id)) canvas.releasePointerCapture(drag.id);
    delete canvas.dataset.drag;
    if (drag.middleButton) updateDiagramTool();
    if (drag.kind === "move" && drag.moved) {
      diagramHistory.record(drag.starts);
      updateHistoryControls();
    }
    repaint();
  }

  function updateHistoryControls() {
    undoButton.disabled = !diagramHistory.canUndo;
    redoButton.disabled = !diagramHistory.canRedo;
  }

  function changeHistory(action: "undo" | "redo") {
    if (activeDrag || !diagramHistory[action](scene.byId)) return false;
    invalidateConnectorPaths(scene);
    updateHistoryControls();
    repaint();
    return true;
  }

  function setSpacePressed(pressed: boolean) {
    spacePressed = pressed;
    updateDiagramTool();
  }

  function setHandTool(active: boolean) {
    handToolSelected = active;
    updateDiagramTool();
  }

  function isHandToolActive() {
    return handToolSelected || spacePressed || activeDrag?.middleButton === true;
  }

  function updateDiagramTool() {
    const active = isHandToolActive();
    pointerTool.setAttribute("aria-pressed", String(!active));
    handTool.setAttribute("aria-pressed", String(active));
    canvas.classList.toggle("pan-ready", active);
    if (active) updateHover();
  }

  function updateHover(position?: Point) {
    hoverPosition = isHandToolActive() ? undefined : position;
    const target =
      hoverPosition &&
      hoverAtPoint(context, scene, diagramPoint(hoverPosition), view.scale);
    if (
      target?.table?.tableId !== hovered?.table?.tableId ||
      target?.table?.fieldName !== hovered?.table?.fieldName ||
      target?.connection !== hovered?.connection
    ) {
      repaint();
    }
  }

  on(canvas, "pointerdown", (event) => {
    const middleButton = event.button === MIDDLE_MOUSE_BUTTON;
    if (middleButton) event.preventDefault();
    if (activeDrag || (event.button !== 0 && !middleButton)) return;
    const origin = pointer(event);
    updateHover();
    const start = { id: event.pointerId, origin, moved: false, middleButton };
    const panning = middleButton || isHandToolActive();
    const tableId = panning
      ? undefined
      : tableTargetAtPoint(scene.tables, diagramPoint(origin))?.tableId;
    if (panning || (tableId === undefined && event.pointerType === "touch")) {
      activeDrag = {
        ...start,
        kind: "pan",
        start: { x: view.x, y: view.y },
        clearOnTap: !panning,
      };
    } else if (tableId !== undefined) {
      const ids = selectedTableIds.has(tableId) ? selectedTableIds : [tableId];
      const starts = [];
      for (const id of ids) {
        const table = scene.byId.get(id);
        if (table)
          starts.push({
            table,
            position: { x: table.x, y: table.y, moved: table.moved },
          });
      }
      activeDrag = { ...start, kind: "move", tableId, starts };
    } else {
      activeDrag = { ...start, kind: "select", end: origin };
    }
    canvas.setPointerCapture(event.pointerId);
    if (middleButton) updateDiagramTool();
  });
  on(canvas, "auxclick", (event) => {
    if (event.button === MIDDLE_MOUSE_BUTTON) event.preventDefault();
  });

  function moveDrag(drag: CanvasDrag, point: Point) {
    const dx = point.x - drag.origin.x;
    const dy = point.y - drag.origin.y;
    if (!drag.moved) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      drag.moved = true;
      canvas.dataset.drag = drag.kind;
      if (drag.kind === "move" && !selectedTableIds.has(drag.tableId))
        selectTables(new Set([drag.tableId]));
    }
    switch (drag.kind) {
      case "select":
        drag.end = point;
        break;
      case "pan":
        view.x = drag.start.x + dx;
        view.y = drag.start.y + dy;
        break;
      case "move":
        for (const { table, position } of drag.starts) {
          table.x = position.x + dx / view.scale;
          table.y = position.y + dy / view.scale;
          table.moved = true;
        }
        invalidateConnectorPaths(scene);
        break;
    }
    repaint();
  }

  on(canvas, "pointermove", (event) => {
    if (activeDrag?.id === event.pointerId) {
      moveDrag(activeDrag, pointer(event));
      if (
        activeDrag.middleButton &&
        (event.buttons & MIDDLE_MOUSE_BUTTON_MASK) === 0
      )
        finishDrag();
    } else if (!activeDrag && event.pointerType !== "touch") {
      updateHover(pointer(event));
    }
  });
  on(canvas, "pointerup", (event) => {
    const drag = activeDrag;
    if (drag?.id !== event.pointerId) return;
    const position = pointer(event);
    moveDrag(drag, position);
    finishDrag();
    if (drag.kind === "select") {
      selectTables(drag.moved ? tablesInBox(drag) : undefined);
    } else if (!drag.moved) {
      if (drag.kind === "move") selectTables(new Set([drag.tableId]));
      else if (drag.clearOnTap) selectTables();
    }
    if (!drag.moved && event.pointerType !== "touch") updateHover(position);
  });
  on(canvas, "pointerleave", () => updateHover());
  on(canvas, "lostpointercapture", (event) => {
    if (activeDrag?.id === event.pointerId) finishDrag();
  });
  on(document, "keydown", (event) => {
    const key = event.key.toLowerCase();
    const primaryModifier = isMac
      ? event.metaKey && !event.ctrlKey
      : event.ctrlKey && !event.metaKey;
    if (
      key === exportImageShortcut.key.toLowerCase() &&
      event.shiftKey === exportImageShortcut.shift &&
      primaryModifier &&
      !event.altKey
    ) {
      if (
        event.repeat || event.isComposing || openExport.disabled || exportDialog.open
      )
        return;
      event.preventDefault();
      openExport.click();
      return;
    }
    const target = event.target;
    const editing =
      target instanceof HTMLElement &&
      (target.isContentEditable || target.closest("input, textarea, select"));
    if (
      primaryModifier &&
      !event.altKey &&
      !event.isComposing &&
      !exportDialog.open &&
      !editing &&
      key === "z"
    ) {
      if (changeHistory(event.shiftKey ? "redo" : "undo"))
        event.preventDefault();
      return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.code === "Space") {
      setSpacePressed(true);
      if (document.activeElement === canvas) event.preventDefault();
      return;
    }
    if ((key !== "v" && key !== "m") || event.isComposing || exportDialog.open)
      return;
    if (editing) return;
    setHandTool(key === "m");
    event.preventDefault();
  });
  on(document, "keyup", (event) => {
    if (event.code === "Space") setSpacePressed(false);
  });
  window.addEventListener(
    "blur",
    () => {
      setSpacePressed(false);
      if (activeDrag?.middleButton) finishDrag();
    },
    { signal: listeners.signal },
  );
  on(
    canvas,
    "wheel",
    (event) => {
      if (!scene.tables.length) return;
      event.preventDefault();
      const line = event.deltaMode === WheelEvent.DOM_DELTA_LINE;
      const page = event.deltaMode === WheelEvent.DOM_DELTA_PAGE;
      const dy = event.deltaY * (line ? 16 : page ? frame.height : 1);
      if (event.ctrlKey || (isMac && event.metaKey)) {
        const { x, y } = pointer(event);
        zoom(Math.exp(-Math.max(-200, Math.min(200, dy)) * 0.0018), x, y);
      } else {
        const horizontalDelta = event.shiftKey
          ? event.deltaX || event.deltaY
          : event.deltaX;
        view.x -= horizontalDelta * (line ? 16 : page ? frame.width : 1);
        if (!event.shiftKey) view.y -= dy;
        repaint();
      }
    },
    { passive: false },
  );
  on(canvas, "keydown", (event) => {
    const directions: Record<string, [number, number] | undefined> = {
      ArrowUp: [0, 40],
      ArrowDown: [0, -40],
      ArrowLeft: [40, 0],
      ArrowRight: [-40, 0],
    };
    const move = directions[event.key];
    if (move) {
      view.x += move[0];
      view.y += move[1];
      repaint();
    } else if (event.key === "+" || event.key === "=") zoom(1.2);
    else if (event.key === "-") zoom(1 / 1.2);
    else if (event.key === "0") centerDiagram(true);
    else if (event.key === "Escape" && activeDrag?.kind === "select") finishDrag();
    else if (event.key === "Escape" && selectedTableIds.size && !activeDrag)
      selectTables();
    else return;
    event.preventDefault();
  });

  editor.value = load(sourceStorageKey) ?? example;
  on(editor, "input", sourceChanged);
  on(editor, "scroll", syncScroll);
  for (const button of swatches)
    on(button, "click", () => changeTheme(button.dataset.themeChoice));
  undoButton.setAttribute("aria-keyshortcuts", isMac ? "Meta+Z" : "Control+Z");
  redoButton.setAttribute(
    "aria-keyshortcuts",
    isMac ? "Shift+Meta+Z" : "Shift+Control+Z",
  );
  on(undoButton, "click", () => changeHistory("undo"));
  on(redoButton, "click", () => changeHistory("redo"));
  on(pointerTool, "click", () => setHandTool(false));
  on(handTool, "click", () => setHandTool(true));
  on(find("zoom-out"), "click", () => zoom(1 / 1.2));
  on(find("zoom-in"), "click", () => zoom(1.2));
  on(find("fit"), "click", () => centerDiagram(true));
  on(zoomInput, "focus", () => zoomInput.select());
  on(zoomInput, "blur", commitZoom);
  on(find("zoom-form"), "submit", (event) => {
    event.preventDefault();
    zoomInput.blur();
  });
  on(zoomInput, "keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      zoomInput.value = zoomValue();
      zoomInput.blur();
    }
  });
  function setMenuOpen(open: boolean) {
    menuButton.setAttribute("aria-expanded", String(open));
    menuPanel.hidden = !open;
  }

  on(menuButton, "click", () => setMenuOpen(menuPanel.hidden));
  on(workspaceMenu, "keydown", (event) => {
    if (event.key === "Escape" && !menuPanel.hidden) {
      event.preventDefault();
      setMenuOpen(false);
      menuButton.focus();
    }
  });
  on(workspaceMenu, "focusout", (event) => {
    if (
      event.relatedTarget instanceof Node &&
      !workspaceMenu.contains(event.relatedTarget)
    ) {
      setMenuOpen(false);
    }
  });
  on(document, "pointerdown", (event) => {
    if (
      !menuPanel.hidden &&
      event.target instanceof Node &&
      !workspaceMenu.contains(event.target)
    ) {
      setMenuOpen(false);
    }
  });
  on(openExport, "click", () => {
    setMenuOpen(false);
    exportDialog.showModal();
  });
  on(exportDialog, "close", () => menuButton.focus());
  on(find("cancel-export"), "click", () => exportDialog.close());
  on(exportForm, "change", (event) => {
    if (!(event.target instanceof HTMLInputElement)) return;
    const { name, value } = event.target;
    if (name === "format") {
      const isJpg = value === "jpg";
      transparentBackground.disabled = isJpg;
      find("background-hint").hidden = !isJpg;
      if (isJpg || pngBackground === "theme") themeBackground.checked = true;
      else transparentBackground.checked = true;
    } else if (name === "background") {
      pngBackground = value;
    }
  });
  on(exportForm, "submit", (event) => {
    event.preventDefault();
    const options = new FormData(exportForm);
    exportDialog.close();
    exportDiagram(
      options.get("format") === "jpg" ? "jpg" : "png",
      options.get("background") === "theme",
    );
  });

  systemTheme.addEventListener(
    "change",
    () => {
      if (themePreference === "system") applyTheme();
    },
    { signal: listeners.signal },
  );
  applyTheme();
  highlightCode();
  parseEditor();
  const observer = new ResizeObserver(resize);
  observer.observe(find("viewport"));
  resize();

  return () => {
    listeners.abort();
    observer.disconnect();
    clearTimeout(parseTimer);
    clearTimeout(toastTimer);
    if (renderFrame !== undefined) cancelAnimationFrame(renderFrame);
  };
}
