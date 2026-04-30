import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateCrmApiKey } from '@/lib/crm-auth';

export async function GET(request: NextRequest) {
  if (!validateCrmApiKey(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const accountId = searchParams.get('account_id');

    let q = supabaseAdmin
      .from('contacts')
      .select('*, accounts(name)');

    if (query) {
      q = q.or(
        `name.ilike.%${query}%,title.ilike.%${query}%,email.ilike.%${query}%`,
      );
    }
    if (accountId) {
      q = q.eq('account_id', accountId);
    }

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
    const { name, title, email, phone, account_id, notes } = body;

    const { data, error } = await supabaseAdmin
      .from('contacts')
      .insert({ name, title, email, phone, account_id, notes })
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
