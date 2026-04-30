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
    const status = searchParams.get('status');
    const region = searchParams.get('region');

    let q = supabaseAdmin.from('accounts').select('*');

    if (query) {
      q = q.ilike('name', `%${query}%`);
    }
    if (status) {
      q = q.eq('status', status);
    }
    if (region) {
      q = q.eq('region', region);
    }

    q = q.order('name');

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

    const { data, error } = await supabaseAdmin
      .from('accounts')
      .insert({
        name,
        industry_segment,
        region,
        annual_contract_value,
        status,
        primary_contact_name,
        primary_contact_email,
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
