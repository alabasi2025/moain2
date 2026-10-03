import type { Matrix } from './types';
type RawCell = number | { qty: number; note: string | null };
/** Normalise server/snapshot matrix: product.by_branch cells may be {qty,note}; notes get branch_id; order notes use branch_name. */
export function normalizeMatrix<T extends Matrix>(m: T): T {
  const byName = new Map(m.branches.map((b) => [b.name, b.id]));
  return {
    ...m,
    order_notes: m.order_notes.map((n) => { const r = n as unknown as { branch_id: string; branch?: string; branch_name?: string; note: string }; return { branch_id: r.branch_id, branch: r.branch ?? r.branch_name ?? '', note: r.note }; }),
    categories: m.categories.map((c) => ({
      ...c,
      products: c.products.map((p) => {
        const by: Record<string, number> = {};
        const notes = [...p.notes];
        for (const [b, v] of Object.entries(p.by_branch as Record<string, RawCell>)) by[b] = typeof v === 'number' ? v : v.qty;
        return { ...p, by_branch: by, notes: notes.map((n) => ({ ...n, branch_id: n.branch_id ?? byName.get(n.branch) ?? '' })) };
      }),
    })),
  };
}
