import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

/**
 * Neon Postgres access for the CRM routes.
 *
 * Queries select `row_to_json(...)` so Postgres does the JSON serialisation,
 * exactly as the previous PostgREST API did: numerics come back as JSON
 * numbers, timestamptz as `2026-04-30T16:29:16.34937+00:00`, dates as
 * `2026-06-30`, and embedded relations as nested objects (or null).
 */

// Lazy singleton — avoids crashing at build time when the env var isn't set.
let _sql: NeonQueryFunction<false, false> | null = null;
function getSql(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const url = process.env.NEON_DATABASE_URL;
    if (!url) throw new Error('NEON_DATABASE_URL is not set');
    _sql = neon(url);
  }
  return _sql;
}

/** Parameterized tagged-template query: sql`SELECT ... WHERE id = ${id}`. */
export function sql(strings: TemplateStringsArray, ...values: unknown[]) {
  return getSql()(strings, ...values);
}

// A JSON row as produced by row_to_json.
export type Row = Record<string, unknown>;

export type DbResult<T> =
  | { data: T; error: null }
  | { data: null; error: { message: string } };

type RowsQuery = PromiseLike<Record<string, unknown>[]>;

function toError(err: unknown): { message: string } {
  return { message: err instanceof Error ? err.message : String(err) };
}

/** Run a query whose rows have a single `row` json column; never throws. */
export async function rows(query: RowsQuery): Promise<DbResult<Row[]>> {
  try {
    const result = await query;
    return { data: result.map((r) => r.row as Row), error: null };
  } catch (err) {
    return { data: null, error: toError(err) };
  }
}

/** Like rows(), but requires exactly one row (PostgREST `.single()` semantics). */
export async function single(query: RowsQuery): Promise<DbResult<Row>> {
  const result = await rows(query);
  if (result.error) return result;
  if (result.data.length !== 1) {
    return {
      data: null,
      error: { message: 'Cannot coerce the result to a single JSON object' },
    };
  }
  return { data: result.data[0], error: null };
}

const COLUMNS = {
  accounts: [
    'id', 'name', 'industry_segment', 'region', 'annual_contract_value',
    'status', 'primary_contact_name', 'primary_contact_email',
    'last_activity_date', 'notes', 'created_at', 'updated_at',
  ],
  activities: [
    'id', 'type', 'account_id', 'contact_id', 'opportunity_id', 'date',
    'summary', 'next_steps', 'created_at',
  ],
  contacts: [
    'id', 'name', 'title', 'email', 'phone', 'account_id', 'notes',
    'created_at',
  ],
  opportunities: [
    'id', 'name', 'account_id', 'stage', 'value', 'expected_close', 'owner',
    'notes', 'created_at', 'updated_at',
  ],
} as const;

export type Table = keyof typeof COLUMNS;

/**
 * Keys whose value is undefined are dropped (as JSON.stringify did for
 * the old PostgREST client), so column defaults still apply. Column names are checked
 * against the known schema; values are always bound as parameters.
 */
function columnsFor(table: Table, values: Record<string, unknown>) {
  const allowed = COLUMNS[table] as readonly string[];
  const cols: string[] = [];
  const params: unknown[] = [];
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) continue;
    if (!allowed.includes(key)) {
      throw new Error(
        `Could not find the '${key}' column of '${table}' in the schema cache`,
      );
    }
    cols.push(key);
    params.push(value);
  }
  return { cols, params };
}

/** INSERT ... RETURNING the new row (old `.insert().select().single()`). */
export async function insertRow(
  table: Table,
  values: Record<string, unknown>,
): Promise<DbResult<Row>> {
  let text: string;
  let params: unknown[];
  try {
    const c = columnsFor(table, values);
    params = c.params;
    text = c.cols.length
      ? `INSERT INTO "${table}" (${c.cols.map((k) => `"${k}"`).join(', ')}) ` +
        `VALUES (${c.cols.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`
      : `INSERT INTO "${table}" DEFAULT VALUES RETURNING *`;
  } catch (err) {
    return { data: null, error: toError(err) };
  }
  return single(
    getSql().query(
      `WITH r AS (${text}) SELECT row_to_json(r) AS row FROM r`,
      params,
    ),
  );
}

/** UPDATE ... WHERE id = $id RETURNING the row (`.update().eq('id').select().single()`). */
export async function updateRowById(
  table: Table,
  id: string,
  values: Record<string, unknown>,
): Promise<DbResult<Row>> {
  let text: string;
  let params: unknown[];
  try {
    const c = columnsFor(table, values);
    params = [...c.params, id];
    text =
      `UPDATE "${table}" SET ${c.cols.map((k, i) => `"${k}" = $${i + 1}`).join(', ')} ` +
      `WHERE id = $${params.length} RETURNING *`;
  } catch (err) {
    return { data: null, error: toError(err) };
  }
  return single(
    getSql().query(
      `WITH r AS (${text}) SELECT row_to_json(r) AS row FROM r`,
      params,
    ),
  );
}
