import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // 認証不要のパス
  const publicPaths = ["/login", "/register"];
  const isPublicPath = publicPaths.some((p) => pathname.startsWith(p));

  // 未認証ユーザーを /login へリダイレクト
  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 認証済みユーザーが /login や /register にアクセスしたら /swipe へ
  if (user && isPublicPath) {
    return NextResponse.redirect(new URL("/swipe", request.url));
  }

  // プロフィール未設定チェック（/profile/setup 自体は除外）
  if (user && !pathname.startsWith("/profile/setup")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_profile_complete")
      .eq("id", user.id)
      .single();

    if (profile && !profile.is_profile_complete) {
      return NextResponse.redirect(new URL("/profile/setup", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
