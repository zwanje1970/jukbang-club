import { supabase } from "@/lib/supabase";

export async function GET() {
  if (!supabase) {
    return Response.json(
      {
        error: {
          message:
            "Supabase가 설정되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정하세요.",
        },
      },
      { status: 503 }
    );
  }

  const { data, error } = await supabase.from("tournaments").select("*");

  if (error) {
    return Response.json({ error });
  }

  return Response.json({ data });
}
