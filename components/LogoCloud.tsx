const logos = ["Fluxora", "Anchorpoint", "Verdant", "Halcyon Labs", "Kestrel"];

export default function LogoCloud() {
  return (
    <section className="py-10 px-5 sm:px-6 border-t border-b border-line">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between flex-wrap gap-6">
        <p className="font-mono text-[12.5px] text-mist tracking-wide">
          TRUSTED BY TEAMS AT
        </p>
        <div className="flex gap-6 sm:gap-11 flex-wrap opacity-55">
          {logos.map((name) => (
            <span key={name} className="font-display font-semibold text-[15px]">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
