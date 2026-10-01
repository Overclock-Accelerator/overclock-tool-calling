import { NextRequest } from 'next/server';
import { sql, rows, insertRow } from '@/lib/db';
import { validateCrmApiKey } from '@/lib/crm-auth';

export async function GET(request: NextRequest) {
  if (!validateCrmApiKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const accountId = searchParams.get('account_id');

    const { data, error } = await rows(sql`
      SELECT row_to_json(t) AS row
      FROM (
        SELECT c.*,
          CASE WHEN a.id IS NULL THEN NULL ELSE json_build_object('name', a.name) END AS accounts
        FROM contacts c
        LEFT JOIN accounts a ON a.id = c.account_id
        WHERE (
            ${query || null}::text IS NULL
            OR c.name ILIKE '%' || ${query || null}::text || '%'
            OR c.title ILIKE '%' || ${query || null}::text || '%'
            OR c.email ILIKE '%' || ${query || null}::text || '%'
          )
          AND (${accountId || null}::uuid IS NULL OR c.account_id = ${accountId || null}::uuid)
      ) t
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
    const { name, title, email, phone, account_id, notes } = body;

    const { data, error } = await insertRow('contacts', {
      name,
      title,
      email,
      phone,
      account_id,
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
