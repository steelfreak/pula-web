"use client";

export default function Footer() {
  return (
    <footer
      className="border-t"
      style={{ borderColor: "#a2a9b1", backgroundColor: "#f8f9fa" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div>
            <span
              className="text-xs mb-2"
              style={{ color: "#72777d", fontSize: "10px", fontWeight: "bold" }}
            >
              Powered by
            </span>
            <a
              href="https://www.wikidata.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/66/Wikidata-logo-en.svg"
                alt="Wikidata"
                className="w-12 inline-block"
              />
            </a>
          </div>
          <div>
            <p className="text-xs mb-2" style={{ color: "#72777d", fontSize: "10px" }}>
            License for content: <span className="font-bold">CC0 for data</span>, <span className="font-bold">CC-BY-SA for text and media</span> | <a href="https://github.com/ordia-org/ordia/issues" className="underline">Report technical problems on our phabricator board.</a>
            </p>
            
          </div>
          <div>
            <div className="flex items-center space-x-4 text-xs">
              <span
                className="text-xs mb-1"
                style={{
                  color: "#72777d",
                  fontSize: "10px",
                  fontWeight: "bold",
                }}
              >
                Supported by
              </span>
              <a href="https://www.goethe.de/ins/cm/en/index.html">
                <img
                  src="/goete-institute.png"
                  alt="Goethe Institute"
                  className="w-12 inline-block"
                />
              </a>
              {/* <span style={{ color: "#a2a9b1" }}>•</span> */}
              <a
                href="https://www.wikimedia.de/"
                className="transition-colors hover:underline"
              >
                <img
                  src="/Wikimedia_Deutschland-Logo.svg"
                  alt="Wikimedia Deutschland"
                  className="w-12 inline-block"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
