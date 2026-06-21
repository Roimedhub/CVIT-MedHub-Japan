import './Materials.css'

const categories = [
  {
    id: 'papers',
    title: 'Papers',
    icon: '📄',
    color: '#0e7490',
    links: [
      {
        label: 'MedHub Japan — Papers Folder',
        url: 'https://medhub-my.sharepoint.com/personal/yarden_medhub-ai_com/_layouts/15/onedrive.aspx?id=%2Fpersonal%2Fyarden%5Fmedhub%2Dai%5Fcom%2FDocuments%2FMedhub%20Japan%20Marketing%20Materials%2FPapers&viewid=f3d15183%2D664f%2D4dbb%2D80c7%2D507b913a430a&sharingv2=true&fromShare=true&at=9&clickparams=eyAiWC1BcHBOYW1lIiA6ICJNaWNyb3NvZnQgT3V0bG9vayIsICJYLUFwcFZlcnNpb24iIDogIjE2LjAuMTk5MjkuMjAxNzIiLCAiT1MiIDogIldpbmRvd3MiIH0%3D&CID=b0f618a2%2D3076%2D1001%2D7def%2D9524c0e9893a&cidOR=SPO&FolderCTID=0x012000959ED9974976BB45A617D1736A22B69C&view=0',
      },
    ],
  },
  {
    id: 'autocath-ffr',
    title: 'AutocathFFR Product Information',
    icon: '💓',
    color: '#003087',
    links: [
      {
        label: 'AutocathFFR Product Information Folder',
        url: 'https://medhub-my.sharepoint.com/personal/yarden_medhub-ai_com/_layouts/15/onedrive.aspx?id=%2Fpersonal%2Fyarden%5Fmedhub%2Dai%5Fcom%2FDocuments%2FMedhub%20Japan%20Marketing%20Materials%2FAutocathFFR%20Product%20Information&viewid=f3d15183%2D664f%2D4dbb%2D80c7%2D507b913a430a&sharingv2=true&fromShare=true&at=9&clickparams=eyAiWC1BcHBOYW1lIiA6ICJNaWNyb3NvZnQgT3V0bG9vayIsICJYLUFwcFZlcnNpb24iIDogIjE2LjAuMTk5MjkuMjAxNzIiLCAiT1MiIDogIldpbmRvd3MiIH0%3D&CID=b0f618a2%2D3076%2D1001%2D7def%2D9524c0e9893a&cidOR=SPO&FolderCTID=0x012000959ED9974976BB45A617D1736A22B69C&view=0',
      },
    ],
  },
  {
    id: 'autocath-ffr-videos',
    title: 'AutocathFFR Videos',
    icon: '🎬',
    color: '#c8102e',
    links: [
      {
        label: 'AutocathFFR Videos Folder',
        url: 'https://medhub-my.sharepoint.com/personal/yarden_medhub-ai_com/_layouts/15/onedrive.aspx?id=%2Fpersonal%2Fyarden%5Fmedhub%2Dai%5Fcom%2FDocuments%2FMedhub%20Japan%20Marketing%20Materials%2FAutocathFFR%20Videos&viewid=f3d15183%2D664f%2D4dbb%2D80c7%2D507b913a430a&sharingv2=true&fromShare=true&at=9&clickparams=eyAiWC1BcHBOYW1lIiA6ICJNaWNyb3NvZnQgT3V0bG9vayIsICJYLUFwcFZlcnNpb24iIDogIjE2LjAuMTk5MjkuMjAxNzIiLCAiT1MiIDogIldpbmRvd3MiIH0%3D&CID=b0f618a2%2D3076%2D1001%2D7def%2D9524c0e9893a&cidOR=SPO&FolderCTID=0x012000959ED9974976BB45A617D1736A22B69C&view=0',
      },
    ],
  },
  {
    id: 'autocath-llm',
    title: 'AutocathLLM',
    icon: '🤖',
    color: '#7c3aed',
    links: [],
  },
  {
    id: 'finance',
    title: 'Finance',
    icon: '💴',
    color: '#b45309',
    links: [
      {
        label: 'Finance Folder',
        url: 'https://medhub-my.sharepoint.com/personal/yarden_medhub-ai_com/_layouts/15/onedrive.aspx?id=%2Fpersonal%2Fyarden%5Fmedhub%2Dai%5Fcom%2FDocuments%2FMedhub%20Japan%20Marketing%20Materials%2FFinance&viewid=f3d15183%2D664f%2D4dbb%2D80c7%2D507b913a430a&sharingv2=true&fromShare=true&at=9&clickparams=eyAiWC1BcHBOYW1lIiA6ICJNaWNyb3NvZnQgT3V0bG9vayIsICJYLUFwcFZlcnNpb24iIDogIjE2LjAuMTk5MjkuMjAxNzIiLCAiT1MiIDogIldpbmRvd3MiIH0%3D&CID=b0f618a2%2D3076%2D1001%2D7def%2D9524c0e9893a&cidOR=SPO&FolderCTID=0x012000959ED9974976BB45A617D1736A22B69C&view=0',
      },
    ],
  },
]

export default function Materials() {
  const hasAny = categories.some((c) => c.links.length > 0)

  return (
    <div className="page mat-page">
      <div className="page-header">
        <h1 className="page-title">Materials</h1>
      </div>

      {!hasAny && (
        <div className="mat-empty-banner">
          <div className="mat-empty-icon">📎</div>
          <div>
            <div className="mat-empty-title">Links will be added here before the conference</div>
            <div className="mat-empty-sub">Each category below will hold relevant documents, decks, and references for the team.</div>
          </div>
        </div>
      )}

      <div className="mat-grid">
        {categories.map((cat) => (
          <div key={cat.id} className="mat-card">
            <div className="mat-card-header" style={{ borderLeft: `4px solid ${cat.color}` }}>
              <span className="mat-card-icon">{cat.icon}</span>
              <span className="mat-card-title" style={{ color: cat.color }}>{cat.title}</span>
              {cat.links.length > 0 && (
                <span className="mat-count" style={{ background: cat.color + '18', color: cat.color }}>
                  {cat.links.length}
                </span>
              )}
            </div>

            <div className="mat-links">
              {cat.links.length === 0 ? (
                <div className="mat-empty-cat">No links yet</div>
              ) : (
                cat.links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mat-link"
                  >
                    <div className="mat-link-icon" style={{ color: cat.color }}>↗</div>
                    <div className="mat-link-body">
                      <div className="mat-link-label">{link.label}</div>
                      {link.desc && <div className="mat-link-desc">{link.desc}</div>}
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
