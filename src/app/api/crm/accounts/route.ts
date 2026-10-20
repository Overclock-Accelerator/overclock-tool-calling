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
    const status = searchParams.get('status');
    const region = searchParams.get('region');

    const { data, error } = await rows(sql`
      SELECT row_to_json(a) AS row
      FROM accounts a
      WHERE (${query || null}::text IS NULL OR a.name ILIKE '%' || ${query || null}::text || '%')
        AND (${status || null}::text IS NULL OR a.status = ${status || null}::text)
        AND (${region || null}::text IS NULL OR a.region = ${region || null}::text)
      ORDER BY a.name
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
    const {
      name,
      industry_segment,
      region,
      annual_contract_value,
      status,
      primary_contact_name,
      primary_contact_email,
      notes,
    } = body;

    const { data, error } = await insertRow('accounts', {
      name,
      industry_segment,
      region,
      annual_contract_value,
      status,
      primary_contact_name,
      primary_contact_email,
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
