import { NextResponse } from "next/server"

export async function GET(req: Request) {
  // 🔐 Optional but recommended security
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const res = await fetch(
      "https://api2.swiv.xyz/health",
      {
        method: "GET",
        cache: "no-store",
      }
    )

    if (!res.ok) {
      throw new Error("Backend not healthy")
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "Ping failed" },
      { status: 500 }
    )
  }
}
