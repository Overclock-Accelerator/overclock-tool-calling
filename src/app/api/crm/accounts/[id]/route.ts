import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
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
    const { data: account, error: accountError } = await supabaseAdmin
      .from('accounts')
      .select('*')
      .eq('id', id)
      .single();

    if (accountError) {
      return Response.json({ error: accountError.message }, { status: 404 });
    }

    // Fetch related contacts, opportunities, and activities in parallel
    const [contactsResult, opportunitiesResult, activitiesResult] =
      await Promise.all([
        supabaseAdmin
          .from('contacts')
          .select('*')
          .eq('account_id', id),
        supabaseAdmin
          .from('opportunities')
          .select('*')
          .eq('account_id', id),
        supabaseAdmin
          .from('activities')
          .select('*')
          .eq('account_id', id)
          .order('date', { ascending: false })
          .limit(10),
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

    const { data, error } = await supabaseAdmin
      .from('accounts')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

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
    const { data: account } = await supabaseAdmin
      .from('accounts')
      .select('name')
      .eq('id', id)
      .single();

    const { error } = await supabaseAdmin
      .from('accounts')
      .delete()
      .eq('id', id);

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
