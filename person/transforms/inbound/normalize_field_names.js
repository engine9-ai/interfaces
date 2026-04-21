export async function transform({ batch }) {
  batch.forEach((row) => {
    const normalized = {};
    Object.entries(row).forEach(([key, value]) => {
      const normalizedKey = String(key).toLowerCase().replace(/[^a-z0-9_]/g, '_');
      normalized[normalizedKey] = value;
    });
    Object.keys(row).forEach((key) => delete row[key]);
    Object.assign(row, normalized);
  });
}

export default {
  transform
};
