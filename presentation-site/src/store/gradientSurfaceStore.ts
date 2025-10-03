import { create } from "zustand";
import type { GradientSurfacePoint } from "@/lib/gradientSurface";

export type GradientSurfaceMeta = {
  learningRate: number;
  steps: number;
  source: "neural-controller" | "manual";
  timestamp: number;
  label?: string;
};

export type GradientSurfaceSnapshot = {
  id: string;
  path: GradientSurfacePoint[];
  meta: GradientSurfaceMeta;
};

export type GradientAnnotation = {
  id: string;
  point: GradientSurfacePoint;
  label: string;
  color: string;
};

type GradientSurfaceState = {
  snapshots: GradientSurfaceSnapshot[];
  activeSnapshotId: string | null;
  annotations: GradientAnnotation[];
  addSnapshot: (snapshot: GradientSurfaceSnapshot) => void;
  setActiveSnapshot: (snapshotId: string) => void;
  addAnnotation: (annotation: GradientAnnotation) => void;
  removeAnnotation: (annotationId: string) => void;
  clearAnnotations: () => void;
  clearSnapshots: () => void;
};

export const useGradientSurfaceStore = create<GradientSurfaceState>((set) => ({
  snapshots: [],
  activeSnapshotId: null,
  annotations: [],
  addSnapshot: (snapshot) =>
    set((state) => {
      const filtered = state.snapshots.filter((existing) => existing.id !== snapshot.id).slice(0, 4);
      const snapshots = [snapshot, ...filtered];
      return {
        snapshots,
        activeSnapshotId: snapshot.id,
      };
    }),
  setActiveSnapshot: (snapshotId) => set({ activeSnapshotId: snapshotId }),
  addAnnotation: (annotation) =>
    set((state) => ({ annotations: [annotation, ...state.annotations].slice(0, 12) })),
  removeAnnotation: (annotationId) =>
    set((state) => ({ annotations: state.annotations.filter((annotation) => annotation.id !== annotationId) })),
  clearAnnotations: () => set({ annotations: [] }),
  clearSnapshots: () => set({ snapshots: [], activeSnapshotId: null }),
}));
