import {
  DIMENSION_META,
  EMPLOYEES,
  hasCompletedAssessment,
  LEADER_STATS,
  type DimensionName,
  type DimensionScores,
  type ReadinessLevel,
} from './dashboard';

export type OrgNodeType = 'company' | 'division' | 'department';

export type OrgNode = {
  id: string;
  name: string;
  type: OrgNodeType;
  children?: OrgNode[];
  /** Present on leaf department nodes — maps to EmployeeRecord.department */
  department?: string;
};

export type DimensionMetric = {
  key: keyof DimensionScores;
  label: DimensionName;
  /** 0–100 scale for executive display */
  score100: number;
  /** Raw 1–5 average */
  score5: number;
  /** Max − min across assessed people (0–100) */
  spread100: number;
};

export type OrgNodeMetrics = {
  totalCount: number;
  assessedCount: number;
  avgScore: number | null;
  participationPct: number;
  trendDelta: number;
  levelDistribution: Record<ReadinessLevel, number>;
  dimensions: DimensionMetric[];
  strongest: DimensionMetric | null;
  lowest: DimensionMetric | null;
  largestSpread: DimensionMetric | null;
};

export const ORG_ROOT: OrgNode = {
  id: 'company',
  name: 'SoCal Edison IT',
  type: 'company',
  children: [
    {
      id: 'div-ets',
      name: 'ETS',
      type: 'division',
      children: [
        { id: 'ets-cloud', name: 'Infrastructure & Cloud', type: 'department', department: 'Infrastructure & Cloud' },
        { id: 'ets-apps', name: 'Application Services', type: 'department', department: 'Application Services' },
        { id: 'ets-network', name: 'Network & Security', type: 'department', department: 'Network & Security' },
        { id: 'ets-service', name: 'Service Desk', type: 'department', department: 'Service Desk' },
      ],
    },
    {
      id: 'div-dpt',
      name: 'DPT',
      type: 'division',
      children: [
        { id: 'dpt-process', name: 'Process Excellence', type: 'department', department: 'Process Excellence' },
        { id: 'dpt-automation', name: 'Automation & AI', type: 'department', department: 'Automation & AI' },
        { id: 'dpt-change', name: 'Change Enablement', type: 'department', department: 'Change Enablement' },
        { id: 'dpt-portfolio', name: 'Portfolio Ops', type: 'department', department: 'Portfolio Ops' },
      ],
    },
    {
      id: 'div-dgs',
      name: 'DGS',
      type: 'division',
      children: [
        { id: 'dgs-platforms', name: 'Data Platforms', type: 'department', department: 'Data Platforms' },
        { id: 'dgs-analytics', name: 'Analytics & Insights', type: 'department', department: 'Analytics & Insights' },
        { id: 'dgs-governance', name: 'Governance & Quality', type: 'department', department: 'Governance & Quality' },
        { id: 'dgs-integration', name: 'Integration Services', type: 'department', department: 'Integration Services' },
      ],
    },
  ],
};

const EMPTY_LEVELS: Record<ReadinessLevel, number> = {
  Beginner: 0,
  Learner: 0,
  Familiar: 0,
  Skilled: 0,
};

function walkNodes(node: OrgNode, fn: (n: OrgNode) => void): void {
  fn(node);
  for (const child of node.children ?? []) walkNodes(child, fn);
}

const NODE_BY_ID = new Map<string, OrgNode>();
walkNodes(ORG_ROOT, n => NODE_BY_ID.set(n.id, n));

export function getOrgNode(id: string): OrgNode | undefined {
  return NODE_BY_ID.get(id);
}

/** All department names under this node (inclusive). */
export function getDepartmentsForNode(node: OrgNode): string[] {
  if (node.department) return [node.department];
  const depts: string[] = [];
  for (const child of node.children ?? []) {
    depts.push(...getDepartmentsForNode(child));
  }
  return depts;
}

export function getDepartmentsForSelection(selectedIds: Iterable<string>): string[] {
  const depts = new Set<string>();
  for (const id of selectedIds) {
    const node = getOrgNode(id);
    if (node) getDepartmentsForNode(node).forEach(d => depts.add(d));
  }
  return [...depts];
}

function toScore100(score5: number): number {
  return Math.round((score5 / 5) * 100);
}

function computeDimensionMetrics(
  assessed: ReturnType<typeof EMPLOYEES.filter>,
): {
  dimensions: DimensionMetric[];
  strongest: DimensionMetric | null;
  lowest: DimensionMetric | null;
  largestSpread: DimensionMetric | null;
} {
  if (assessed.length === 0) {
    return { dimensions: [], strongest: null, lowest: null, largestSpread: null };
  }

  const dimensions: DimensionMetric[] = DIMENSION_META.map(({ key, label }) => {
    const vals = assessed.map(e => e.dimensions[key]);
    const avg5 = vals.reduce((s, v) => s + v, 0) / vals.length;
    const min5 = Math.min(...vals);
    const max5 = Math.max(...vals);
    return {
      key,
      label,
      score5: Math.round(avg5 * 10) / 10,
      score100: toScore100(avg5),
      spread100: toScore100(max5) - toScore100(min5),
    };
  });

  const byScore = [...dimensions].sort((a, b) => b.score100 - a.score100);
  const bySpread = [...dimensions].sort((a, b) => b.spread100 - a.spread100);

  return {
    dimensions,
    strongest: byScore[0] ?? null,
    lowest: byScore[byScore.length - 1] ?? null,
    largestSpread: bySpread[0] ?? null,
  };
}

export function computeMetricsForDepartments(departments: string[] | null): OrgNodeMetrics {
  const pool = departments?.length
    ? EMPLOYEES.filter(e => departments.includes(e.department))
    : EMPLOYEES;

  const assessed = pool.filter(hasCompletedAssessment);
  const levelDistribution = { ...EMPTY_LEVELS };
  for (const e of assessed) {
    if (e.level) levelDistribution[e.level]++;
  }

  const avgScore = assessed.length
    ? Math.round((assessed.reduce((s, e) => s + (e.finalScore ?? 0), 0) / assessed.length) * 10) / 10
    : null;

  const participationPct = pool.length
    ? Math.round((assessed.length / pool.length) * 100)
    : 0;

  const dim = computeDimensionMetrics(assessed);

  return {
    totalCount: pool.length,
    assessedCount: assessed.length,
    avgScore,
    participationPct,
    trendDelta: LEADER_STATS.scoreGainInRollout,
    levelDistribution,
    ...dim,
  };
}

export function computeMetricsForNode(node: OrgNode): OrgNodeMetrics {
  return computeMetricsForDepartments(getDepartmentsForNode(node));
}

/** All descendant node ids including self. */
export function getDescendantIds(node: OrgNode): string[] {
  const ids = [node.id];
  for (const child of node.children ?? []) {
    ids.push(...getDescendantIds(child));
  }
  return ids;
}

export type SelectionState = 'none' | 'partial' | 'all';

export function getSelectionState(node: OrgNode, selectedIds: Set<string>): SelectionState {
  const ids = getDescendantIds(node);
  const selected = ids.filter(id => selectedIds.has(id)).length;
  if (selected === 0) return 'none';
  if (selected === ids.length) return 'all';
  return 'partial';
}

// ─── Graph layout (top-down tree) ─────────────────────────────────────────────

export const GRAPH_NODE_WIDTH: Record<OrgNodeType, number> = {
  company: 220,
  division: 168,
  department: 152,
};

export const GRAPH_NODE_HEIGHT = 96;
export const GRAPH_H_SPACING = 28;
export const GRAPH_V_SPACING = 88;
export const GRAPH_PADDING = 40;

export type GraphLayoutBox = {
  id: string;
  orgNode: OrgNode;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type GraphLayoutEdge = {
  fromId: string;
  toId: string;
};

export type OrgGraphLayout = {
  boxes: GraphLayoutBox[];
  edges: GraphLayoutEdge[];
  width: number;
  height: number;
};

type LayoutTreeNode = {
  orgNode: OrgNode;
  children: LayoutTreeNode[];
  subtreeWidth: number;
  x: number;
  y: number;
};

function nodeWidth(node: OrgNode): number {
  return GRAPH_NODE_WIDTH[node.type];
}

function buildLayoutTree(node: OrgNode): LayoutTreeNode {
  const children = (node.children ?? []).map(buildLayoutTree);
  const selfW = nodeWidth(node);

  let subtreeWidth: number;
  if (children.length === 0) {
    subtreeWidth = selfW;
  } else {
    const childrenSpan =
      children.reduce((sum, c) => sum + c.subtreeWidth, 0) +
      GRAPH_H_SPACING * (children.length - 1);
    subtreeWidth = Math.max(selfW, childrenSpan);
  }

  return { orgNode: node, children, subtreeWidth, x: 0, y: 0 };
}

function assignLayoutX(tree: LayoutTreeNode, left: number): number {
  if (tree.children.length === 0) {
    tree.x = left;
    return left + tree.subtreeWidth;
  }

  let cursor = left;
  for (let i = 0; i < tree.children.length; i++) {
    cursor = assignLayoutX(tree.children[i], cursor);
    if (i < tree.children.length - 1) cursor += GRAPH_H_SPACING;
  }

  const first = tree.children[0];
  const last = tree.children[tree.children.length - 1];
  const centerX = (first.x + last.x + nodeWidth(last.orgNode)) / 2;
  tree.x = centerX - nodeWidth(tree.orgNode) / 2;

  return left + tree.subtreeWidth;
}

function assignLayoutY(tree: LayoutTreeNode, depth: number, nodeHeight: number): void {
  tree.y = depth * (nodeHeight + GRAPH_V_SPACING);
  for (const child of tree.children) assignLayoutY(child, depth + 1, nodeHeight);
}

function flattenLayout(tree: LayoutTreeNode, nodeHeight: number): GraphLayoutBox[] {
  const boxes: GraphLayoutBox[] = [
    {
      id: tree.orgNode.id,
      orgNode: tree.orgNode,
      x: tree.x,
      y: tree.y,
      width: nodeWidth(tree.orgNode),
      height: nodeHeight,
    },
  ];
  for (const child of tree.children) boxes.push(...flattenLayout(child, nodeHeight));
  return boxes;
}

function collectLayoutEdges(tree: LayoutTreeNode): GraphLayoutEdge[] {
  const edges: GraphLayoutEdge[] = [];
  for (const child of tree.children) {
    edges.push({ fromId: tree.orgNode.id, toId: child.orgNode.id });
    edges.push(...collectLayoutEdges(child));
  }
  return edges;
}

export function computeOrgGraphLayout(
  root: OrgNode = ORG_ROOT,
  nodeHeight: number = GRAPH_NODE_HEIGHT,
): OrgGraphLayout {
  const tree = buildLayoutTree(root);
  assignLayoutX(tree, 0);
  assignLayoutY(tree, 0, nodeHeight);

  const boxes = flattenLayout(tree, nodeHeight);
  const edges = collectLayoutEdges(tree);

  const maxX = Math.max(...boxes.map(b => b.x + b.width));
  const maxY = Math.max(...boxes.map(b => b.y + b.height));

  return {
    boxes,
    edges,
    width: maxX + GRAPH_PADDING * 2,
    height: maxY + GRAPH_PADDING * 2,
  };
}

export function graphBoxCenterBottom(box: GraphLayoutBox): { x: number; y: number } {
  return { x: box.x + box.width / 2, y: box.y + box.height };
}

export function graphBoxCenterTop(box: GraphLayoutBox): { x: number; y: number } {
  return { x: box.x + box.width / 2, y: box.y };
}

/** Orthogonal connector from parent bottom to child top. */
export function graphEdgePath(from: GraphLayoutBox, to: GraphLayoutBox): string {
  const start = graphBoxCenterBottom(from);
  const end = graphBoxCenterTop(to);
  const midY = start.y + (end.y - start.y) / 2;
  return `M ${start.x} ${start.y} L ${start.x} ${midY} L ${end.x} ${midY} L ${end.x} ${end.y}`;
}
