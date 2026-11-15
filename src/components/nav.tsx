import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site";
import { NavMenu } from "@/components/nav-menu";

export async function Nav() {
  const [session, settings] = await Promise.all([getSession(), getSiteSettings()]);

  let studentName: string | null = null;
  if (session?.role === "student") {
    const student = await prisma.student.findUnique({
      where: { id: session.studentId },
      select: { name: true },
    });
    studentName = student?.name ?? null;
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur print:hidden">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <Link href="/" className="truncate font-semibold">
          🏫 {settings.siteTitle}
        </Link>
        <NavMenu
          role={session?.role ?? null}
          studentName={studentName}
        />
      </div>
    </header>
  );
}
