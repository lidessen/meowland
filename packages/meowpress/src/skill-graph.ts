import {
  Graph,
  layout,
  type EdgeLabel,
  type GraphLabel,
  type NodeLabel,
  type Point,
} from "@dagrejs/dagre";
import type { Skill } from "./skills";

export type SkillGraphDirection = "LR" | "TB";

interface SkillGraphNodeLabel extends NodeLabel {
  path: string;
  name: string;
  role: string;
  detail: string;
  external: boolean;
  kind: string;
}

interface SkillGraphEdgeLabel extends EdgeLabel {
  label: string;
  external: boolean;
}

export interface SkillGraphNode extends SkillGraphNodeLabel {
  x: number;
  y: number;
}

export interface SkillGraphEdge {
  source: string;
  target: string;
  label: string;
  labelX: number;
  labelY: number;
  path: string;
  external: boolean;
}

export interface SkillGraphLayout {
  width: number;
  height: number;
  nodes: SkillGraphNode[];
  edges: SkillGraphEdge[];
}

function fileName(path: string): string {
  const name = path.endsWith("/") ? path : (path.split("/").at(-1) ?? path);
  return name.length > 20 ? `${name.slice(0, 19)}…` : name;
}

function edgePath(points: Point[], direction: SkillGraphDirection): string {
  const start = points[0];
  const end = points.at(-1);
  if (!start || !end) return "";
  if (points.length > 2) {
    const segments = [`M ${start.x} ${start.y}`];
    for (let index = 1; index < points.length - 1; index += 1) {
      const point = points[index];
      const next = points[index + 1];
      segments.push(`Q ${point.x} ${point.y}, ${(point.x + next.x) / 2} ${(point.y + next.y) / 2}`);
    }
    segments.push(`L ${end.x} ${end.y}`);
    return segments.join(" ");
  }
  if (direction === "LR") {
    const middle = (start.x + end.x) / 2;
    return `M ${start.x} ${start.y} C ${middle} ${start.y}, ${middle} ${end.y}, ${end.x} ${end.y}`;
  }
  const middle = (start.y + end.y) / 2;
  return `M ${start.x} ${start.y} C ${start.x} ${middle}, ${end.x} ${middle}, ${end.x} ${end.y}`;
}

export function layoutSkillGraph(skill: Skill, direction: SkillGraphDirection): SkillGraphLayout {
  const nodeWidth = direction === "LR" ? 174 : 150;
  const nodeHeight = 64;
  const graph = new Graph<GraphLabel, SkillGraphNodeLabel, SkillGraphEdgeLabel>({
    directed: true,
  });
  graph.setGraph({
    rankdir: direction,
    ranksep: direction === "LR" ? 96 : 66,
    nodesep: direction === "LR" ? 34 : 24,
    edgesep: 22,
    marginx: direction === "LR" ? 30 : 18,
    marginy: 28,
  });
  graph.setDefaultEdgeLabel(() => ({ label: "", external: false }));

  for (const file of skill.files) {
    graph.setNode(file.path, {
      path: file.path,
      name: fileName(file.path),
      role: file.role,
      detail: file.detail,
      external: false,
      kind: file.reachable ? "file" : "unreferenced",
      width: nodeWidth,
      height: nodeHeight,
    });
  }
  for (const node of skill.externalNodes) {
    graph.setNode(node.path, {
      path: node.path,
      name: fileName(node.path),
      role: node.role,
      detail: node.detail,
      external: true,
      kind: node.kind,
      width: nodeWidth,
      height: nodeHeight,
    });
  }

  const externalPaths = new Set(skill.externalNodes.map((node) => node.path));
  for (const relation of skill.relations) {
    graph.setEdge(relation.source, relation.target, {
      label: relation.label,
      external: externalPaths.has(relation.source) || externalPaths.has(relation.target),
      width: Math.max(34, relation.label.length * 13 + 12),
      height: 20,
    });
  }

  layout(graph);

  const graphLabel = graph.graph();
  const layoutWidth = Math.ceil(graphLabel.width ?? 0);
  const width = direction === "TB" ? Math.max(320, layoutWidth) : layoutWidth;
  const xOffset = (width - layoutWidth) / 2;
  const nodes = graph.nodes().map((path) => {
    const node = graph.node(path);
    return {
      ...node,
      x: (node.x ?? 0) + xOffset,
      y: node.y ?? 0,
    };
  });
  const edges = graph.edges().map((edge) => {
    const label = graph.edge(edge);
    const points = (label.points ?? []).map((point) => ({
      x: point.x + xOffset,
      y: point.y,
    }));
    return {
      source: edge.v,
      target: edge.w,
      label: label.label,
      labelX: (label.x ?? 0) + xOffset,
      labelY: label.y ?? 0,
      path: edgePath(points, direction),
      external: label.external,
    };
  });

  return {
    width,
    height: Math.ceil(graphLabel.height ?? 0),
    nodes,
    edges,
  };
}
