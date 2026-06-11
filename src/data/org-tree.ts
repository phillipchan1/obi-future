import {
  EMPLOYEES,
  hasCompletedAssessment,
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

export type OrgNodeMetrics = {
  totalCount: number;
  assessedCount: number;
  avgScore: number | null;
  levelDistribution: Record<ReadinessLevel, number>;
};

export const ORG_ROOT: OrgNode = {
  id: 'company',
  name: 'GridTech Utilities',
  type: 'company',
  children: [
    {
      id: 'tech',
      name: 'Technology',
      type: 'division',
      children: [
        { id: 'dept-product', name: 'Product & Design', type: 'department', department: 'Product & Design' },
        { id: 'dept-engineering', name: 'Engineering', type: 'department', department: 'Engineering' },
        { id: 'dept-it', name: 'IT', type: 'department', department: 'IT' },
      ],
    },
    {
      id: 'ops-customer',
      name: 'Operations & Customer',
      type: 'division',
      children: [
        { id: 'dept-operations', name: 'Operations', type: 'department', department: 'Operations' },
        { id: 'dept-cs', name: 'Customer Success', type: 'department', department: 'Customer Success' },
      ],
    },
    {
      id: 'corporate',
      name: 'Corporate',
      type: 'division',
      children: [
        { id: 'dept-marketing', name: 'Marketing', type: 'department', department: 'Marketing' },
        { id: 'dept-finance', name: 'Finance', type: 'department', department: 'Finance' },
        { id: 'dept-hr', name: 'HR', type: 'department', department: 'HR' },
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

  return {
    totalCount: pool.length,
    assessedCount: assessed.length,
    avgScore,
    levelDistribution,
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
  company: 196,
  division: 156,
  department: 132,
};

export const GRAPH_NODE_HEIGHT = 80;
export const GRAPH_H_SPACING = 24;
export const GRAPH_V_SPACING = 72;
export const GRAPH_PADDING = 32;

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

function assignLayoutY(tree: LayoutTreeNode, depth: number): void {
  tree.y = depth * (GRAPH_NODE_HEIGHT + GRAPH_V_SPACING);
  for (const child of tree.children) assignLayoutY(child, depth + 1);
}

function flattenLayout(tree: LayoutTreeNode): GraphLayoutBox[] {
  const boxes: GraphLayoutBox[] = [
    {
      id: tree.orgNode.id,
      orgNode: tree.orgNode,
      x: tree.x,
      y: tree.y,
      width: nodeWidth(tree.orgNode),
      height: GRAPH_NODE_HEIGHT,
    },
  ];
  for (const child of tree.children) boxes.push(...flattenLayout(child));
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

export function computeOrgGraphLayout(root: OrgNode = ORG_ROOT): OrgGraphLayout {
  const tree = buildLayoutTree(root);
  assignLayoutX(tree, 0);
  assignLayoutY(tree, 0);

  const boxes = flattenLayout(tree);
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
