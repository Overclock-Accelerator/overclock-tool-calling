import { NextRequest } from 'next/server';
import { sql, rows, insertRow } from '@/lib/db';
import { validateCrmApiKey } from '@/lib/crm-auth';

export async function GET(request: NextRequest) {
  if (!validateCrmApiKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('account_id');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') ?? '20', 10);

    // Embedded relations accounts(name), contacts(name) -> LEFT JOINs that
    // yield { name } or null, matching the PostgREST shape.
    const { data, error } = await rows(sql`
      SELECT row_to_json(t) AS row
      FROM (
        SELECT act.*,
          CASE WHEN a.id IS NULL THEN NULL ELSE json_build_object('name', a.name) END AS accounts,
          CASE WHEN c.id IS NULL THEN NULL ELSE json_build_object('name', c.name) END AS contacts
        FROM activities act
        LEFT JOIN accounts a ON a.id = act.account_id
        LEFT JOIN contacts c ON c.id = act.contact_id
        WHERE (${accountId || null}::uuid IS NULL OR act.account_id = ${accountId || null}::uuid)
          AND (${type || null}::text IS NULL OR act.type = ${type || null}::text)
      ) t
      ORDER BY t."date" DESC
      LIMIT ${limit}
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
    const { type, account_id, contact_id, opportunity_id, summary, next_steps } =
      body;

    // Insert the activity
    const { data, error } = await insertRow('activities', {
      type,
      account_id,
      contact_id,
      opportunity_id,
      summary,
      next_steps,
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Update the account's last_activity_date
    if (account_id) {
      await rows(sql`
        UPDATE accounts SET last_activity_date = ${new Date().toISOString()}::timestamptz
        WHERE id = ${account_id}::uuid
      `);
    }

    return Response.json(data, { status: 201 });
  } catch (err) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
