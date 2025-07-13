import { Outlet } from "react-router";

export default function Main() {
  return (
    <main className="bg-red-950 w-full h-screen text-red-200 font-mono overflow-hidden">
      <section className="flex items-center justify-center h-48">
        <a href="/">
          <h1 className="text-3xl hover:text-sky-200 hover:scale-110 transition-transform duration-100 z-50">
            red-tetris
          </h1>
        </a>
      </section>
      <section className="flex justify-center items-center z-0 h-[calc(100vh-12rem)] overflow-hidden">
        <Outlet />
      </section>
    </main>
  );
}
