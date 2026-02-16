import middleware from "next-auth/middleware";

export default function proxy(req: any, event: any) {
  return middleware(req, event);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
