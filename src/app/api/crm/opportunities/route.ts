import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
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

    let q = supabaseAdmin
      .from('opportunities')
      .select('*, accounts(name)');

    if (stage) {
      q = q.eq('stage', stage);
    }
    if (accountId) {
      q = q.eq('account_id', accountId);
    }
    if (minValue) {
      q = q.gte('value', Number(minValue));
    }
    if (owner) {
      q = q.eq('owner', owner);
    }

    q = q.order('expected_close');

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
    const { name, account_id, stage, value, expected_close, owner, notes } =
      body;

    const { data, error } = await supabaseAdmin
      .from('opportunities')
      .insert({
        name,
        account_id,
        stage,
        value,
        expected_close,
        owner,
        notes,
      })
      .select()
      .single();

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
