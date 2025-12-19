"use client";

/**
 * Footer component displaying attribution, licensing information, and supporter logos.
 * Features Wikidata branding, content licensing details, and institutional supporters.
 *
 * @example
 * ```
 * <Footer />
 * ```
 *
 * @returns Footer element with responsive layout and Wikimedia-style design
 */
export default function Footer(): React.ReactElement {
  return (
    <footer
      className="border-t"
      style={{ 
        borderColor: "#a2a9b1", 
        backgroundColor: "#f8f9fa" 
      }}
      role="contentinfo"
      aria-label="Footer with attribution and licensing information"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          
          {/* Wikidata Attribution Section */}
          <div>
            <span
              className="text-xs mb-2 block"
              style={{ 
                color: "#72777d", 
                fontSize: "10px", 
                fontWeight: "bold" 
              }}
            >
              Powered by
            </span>
            <a
              href="https://www.wikidata.org/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Wikidata - structured data platform"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/66/Wikidata-logo-en.svg"
                alt="Wikidata logo"
                className="w-12 inline-block"
                width={48}
                height={48}
              />
            </a>
          </div>

          {/* Licensing Information */}
          <div>
            <p 
              className="text-xs mb-2 text-center sm:text-left"
              style={{ 
                color: "#72777d", 
                fontSize: "10px" 
              }}
            >
              License for content: 
              <span className="font-bold">CC0 for data</span>,{' '}
              <span className="font-bold">CC-BY-SA for text and media</span> |{' '}
              <a 
                href="https://github.com/ordia-org/ordia/issues" 
                className="underline hover:no-underline"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Report technical issues on GitHub"
              >
                Report technical problems on our GitHub issues
              </a>
            </p>
          </div>

          {/* Supporters Section */}
          <div>
            <div className="flex items-center space-x-4 text-xs justify-center sm:justify-end">
              <span
                className="whitespace-nowrap"
                style={{
                  color: "#72777d",
                  fontSize: "10px",
                  fontWeight: "bold",
                }}
              >
                Supported by
              </span>
              <a 
                href="https://www.goethe.de/ins/cm/en/index.html"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Goethe-Institut - cultural institute"
              >
                <img
                  src="/goete-institute.png"
                  alt="Goethe Institute logo"
                  className="w-12 inline-block"
                  width={48}
                  height={48}
                />
              </a>
              <a
                href="https://www.wikimedia.de/"
                className="transition-colors hover:underline"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Wikimedia Deutschland - Wikimedia chapter"
              >
                <img
                  src="/Wikimedia_Deutschland-Logo.svg"
                  alt="Wikimedia Deutschland logo"
                  className="w-12 inline-block"
                  width={48}
                  height={48}
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
