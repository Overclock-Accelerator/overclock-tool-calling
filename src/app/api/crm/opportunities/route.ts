import { NextRequest } from 'next/server';
import { sql, rows, insertRow } from '@/lib/db';
import { validateCrmApiKey } from '@/lib/crm-auth';

export async function GET(request: NextRequest) {
  if (!validateCrmApiKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const stage = searchParams.get('stage');
    const accountId = searchParams.get('account_id');
    const minValue = searchParams.get('min_value');
    const owner = searchParams.get('owner');

    const minValueNum = minValue ? Number(minValue) : null;

    const { data, error } = await rows(sql`
      SELECT row_to_json(t) AS row
      FROM (
        SELECT o.*,
          CASE WHEN a.id IS NULL THEN NULL ELSE json_build_object('name', a.name) END AS accounts
        FROM opportunities o
        LEFT JOIN accounts a ON a.id = o.account_id
        WHERE (${stage || null}::text IS NULL OR o.stage = ${stage || null}::text)
          AND (${accountId || null}::uuid IS NULL OR o.account_id = ${accountId || null}::uuid)
          AND (${minValueNum}::numeric IS NULL OR o.value >= ${minValueNum}::numeric)
          AND (${owner || null}::text IS NULL OR o.owner = ${owner || null}::text)
      ) t
      ORDER BY t.expected_close
    `);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
  } catch (err) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!validateCrmApiKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, account_id, stage, value, expected_close, owner, notes } =
      body;

    const { data, error } = await insertRow('opportunities', {
      name,
      account_id,
      stage,
      value,
      expected_close,
      owner,
      notes,
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data, { status: 201 });
  } catch (err) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
