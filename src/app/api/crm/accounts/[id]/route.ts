import { NextRequest } from 'next/server';
import { sql, rows, single, updateRowById } from '@/lib/db';
import { validateCrmApiKey } from '@/lib/crm-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!validateCrmApiKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Fetch account
    const { data: account, error: accountError } = await single(sql`
      SELECT row_to_json(a) AS row FROM accounts a WHERE a.id = ${id}::uuid
    `);

    if (accountError) {
      return Response.json({ error: accountError.message }, { status: 404 });
    }

    // Fetch related contacts, opportunities, and activities in parallel
    const [contactsResult, opportunitiesResult, activitiesResult] =
      await Promise.all([
        rows(sql`
          SELECT row_to_json(c) AS row FROM contacts c WHERE c.account_id = ${id}::uuid
        `),
        rows(sql`
          SELECT row_to_json(o) AS row FROM opportunities o WHERE o.account_id = ${id}::uuid
        `),
        rows(sql`
          SELECT row_to_json(act) AS row
          FROM activities act
          WHERE act.account_id = ${id}::uuid
          ORDER BY act."date" DESC
          LIMIT 10
        `),
      ]);

    return Response.json({
      ...account,
      contacts: contactsResult.data ?? [],
      opportunities: opportunitiesResult.data ?? [],
      activities: activitiesResult.data ?? [],
    });
  } catch (err) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!validateCrmApiKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const { data, error } = await updateRowById('accounts', id, {
      ...body,
      updated_at: new Date().toISOString(),
    });

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!validateCrmApiKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Cascade delete is handled by the FK constraints, but let's
    // fetch the account name first for a meaningful response
    const { data: account } = await single(sql`
      SELECT json_build_object('name', a.name) AS row FROM accounts a WHERE a.id = ${id}::uuid
    `);

    const { error } = await rows(sql`
      DELETE FROM accounts WHERE id = ${id}::uuid
    `);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      message: `Account "${account?.name || id}" and all related records deleted.`,
    });
  } catch (err) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
