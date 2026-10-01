import { NextRequest } from 'next/server';
import { sql, rows } from '@/lib/db';

/**
 * Server-side proxy for the CRM dashboard page.
 * This avoids exposing the CRM API key in client-side code.
 */
export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type');

  try {
    if (type === 'accounts') {
      const { data, error } = await rows(sql`
        SELECT row_to_json(a) AS row FROM accounts a ORDER BY a.name
      `);

      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
      return Response.json(data);
    }

    if (type === 'pipeline') {
      const { data: opportunities, error } = await rows(sql`
      SELECT row_to_json(t) AS row
      FROM (
        SELECT o.*,
          CASE WHEN a.id IS NULL THEN NULL ELSE json_build_object('name', a.name) END AS accounts
        FROM opportunities o
        LEFT JOIN accounts a ON a.id = o.account_id
      ) t
      `);

      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }

      const allDeals = (opportunities ?? []) as {
        value: number | null;
        stage: string | null;
      }[];
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
