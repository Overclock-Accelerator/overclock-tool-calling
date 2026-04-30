import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
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

    let q = supabaseAdmin
      .from('activities')
      .select('*, accounts(name), contacts(name)');

    if (accountId) {
      q = q.eq('account_id', accountId);
    }
    if (type) {
      q = q.eq('type', type);
    }

    q = q.order('date', { ascending: false }).limit(limit);

    const { data, error } = await q;

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
    const { data, error } = await supabaseAdmin
      .from('activities')
      .insert({
        type,
        account_id,
        contact_id,
        opportunity_id,
        summary,
        next_steps,
      })
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Update the account's last_activity_date
    if (account_id) {
      await supabaseAdmin
        .from('accounts')
        .update({ last_activity_date: new Date().toISOString() })
        .eq('id', account_id);
    }

    return Response.json(data, { status: 201 });
  } catch (err) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
