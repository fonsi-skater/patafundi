export default function Footer() {
  return (
    <footer className="bg-ink text-white/60 px-6 md:px-16 py-10 text-sm">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div>
          <p className="text-white font-display font-bold text-lg mb-1 flex items-center gap-2">
            <img src="/logo-mark.svg" alt="PataKazi" className="w-6 h-6" />
            Pata<span className="text-gold">Kazi</span>
          </p>
          <p className="text-gold text-xs italic mb-2">Every Worker Feeds a Family.</p>
          <p className="max-w-xs">
            Verified workers, secure payments, real reviews — bringing structure
            to Kenya's informal labor market.
          </p>
        </div>
        <div className="flex gap-10">
          <div>
            <p className="text-white font-semibold mb-2">For Clients</p>
            <p>Find a Worker</p>
            <p>How It Works</p>
            <p>Post a Job</p>
          </div>
          <div>
            <p className="text-white font-semibold mb-2">For Workers</p>
            <p>Join PataKazi</p>
            <p>Get Verified</p>
            <p>Pricing</p>
          </div>
        </div>
      </div>
      <p className="mt-8 text-xs text-white/30">
        &copy; {new Date().getFullYear()} PataKazi. All rights reserved.
      </p>
    </footer>
  );
}
