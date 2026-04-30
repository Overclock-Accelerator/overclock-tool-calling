import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Server-side proxy for the CRM dashboard page.
 * This avoids exposing the CRM API key in client-side code.
 */
export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type');

  try {
    if (type === 'accounts') {
      const { data, error } = await supabaseAdmin
        .from('accounts')
        .select('*')
        .order('name');

      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
      return Response.json(data);
    }

    if (type === 'pipeline') {
      const { data: opportunities, error } = await supabaseAdmin
        .from('opportunities')
        .select('*, accounts(name)');

      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }

      const allDeals = opportunities ?? [];
      const totalPipelineValue = allDeals.reduce((sum, d) => sum + (d.value ?? 0), 0);
      const totalDeals = allDeals.length;
      const averageDealSize = totalDeals > 0 ? totalPipelineValue / totalDeals : 0;

      const dealsByStage: Record<string, { count: number; value: number }> = {};
      for (const deal of allDeals) {
        const stage = deal.stage ?? 'unknown';
        if (!dealsByStage[stage]) {
          dealsByStage[stage] = { count: 0, value: 0 };
        }
        dealsByStage[stage].count += 1;
        dealsByStage[stage].value += deal.value ?? 0;
      }

      return Response.json({
        total_pipeline_value: totalPipelineValue,
        deals_by_stage: dealsByStage,
        total_deals: totalDeals,
        average_deal_size: averageDealSize,
      });
    }

    return Response.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
