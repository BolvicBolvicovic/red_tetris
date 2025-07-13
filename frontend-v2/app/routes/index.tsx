export default function Index() {
  return (
    <section className="flex flex-row justify-between items-center w-[70lvh] h-[50lvh] text-center">
      <a
        href="solo"
        className="w-[10lvh] flex flex-col hover:text-sky-200 hover:scale-110 transition-transform duration-100"
      >
        <h1>solo</h1>
      </a>
      <a
        href="multiplayer"
        className="w-[10lvh] flex flex-col hover:text-sky-200 hover:scale-110 transition-transform duration-100"
      >
        <h1>multiplayer</h1>
      </a>
    </section>
  );
}
