import React, { useState, useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import {
  Network, ZoomIn, ZoomOut, Maximize2, Filter, Search,
  RefreshCw, Info, Shield, Layers, X, Sparkles, AlertTriangle
} from 'lucide-react';
import api from '../services/api';

export const AttackGraph: React.FC = () => {
  const cyRef = useRef<HTMLDivElement | null>(null);
  const cyInstance = useRef<cytoscape.Core | null>(null);

  const [graphData, setGraphData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedElement, setSelectedElement] = useState<any | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [layoutName, setLayoutName] = useState<string>('cose');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const res = await api.get('/graph', {
        params: {
          type: typeFilter !== 'ALL' ? typeFilter : undefined,
          severity: severityFilter !== 'ALL' ? severityFilter : undefined,
        },
      });
      setGraphData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, [typeFilter, severityFilter]);

  // Initialize & Update Cytoscape
  useEffect(() => {
    if (!cyRef.current || !graphData) return;

    if (cyInstance.current) {
      cyInstance.current.destroy();
    }

    const elements: any[] = [];
    (graphData.nodes || []).forEach((n: any) => {
      elements.push({ group: 'nodes', data: n.data });
    });
    (graphData.edges || []).forEach((e: any) => {
      elements.push({ group: 'edges', data: e.data });
    });

    const cy = cytoscape({
      container: cyRef.current,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'color': '#f8fafc',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'font-size': '10px',
            'font-family': 'JetBrains Mono, monospace',
            'background-color': 'data(color)',
            'shape': 'data(shape)' as any,
            'width': 28,
            'height': 28,
            'border-width': 2,
            'border-color': '#1e293b',
            'transition-property': 'background-color, line-color, target-arrow-color',
            'transition-duration': 0.3,
          },
        },
        {
          selector: 'node[severity = "CRITICAL"]',
          style: {
            'border-color': '#ef4444',
            'border-width': 4,
          },
        },
        {
          selector: 'node[type = "threat_actor"]',
          style: {
            'width': 38,
            'height': 38,
            'background-color': '#8b5cf6',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#334155',
            'target-arrow-color': '#475569',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '8px',
            'font-family': 'monospace',
            'color': '#94a3b8',
            'text-background-opacity': 0.8,
            'text-background-color': '#0b1426',
            'text-background-padding': '2px',
          },
        },
        {
          selector: '.highlighted',
          style: {
            'background-color': '#00d2ff',
            'line-color': '#00d2ff',
            'target-arrow-color': '#00d2ff',
            'border-color': '#ffffff',
            'border-width': 4,
            'z-index': 999,
          },
        },
        {
          selector: '.dimmed',
          style: {
            'opacity': 0.15,
          },
        },
      ],
      layout: {
        name: layoutName,
        animate: true,
        animationDuration: 500,
        padding: 50,
      } as any,
    });

    // Node Click Handlers
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      setSelectedElement({ type: 'node', data: node.data() });

      // Highlight neighborhood
      cy.elements().removeClass('highlighted dimmed');
      const neighborhood = node.neighborhood().add(node);
      cy.elements().difference(neighborhood).addClass('dimmed');
      neighborhood.addClass('highlighted');
    });

    cy.on('tap', 'edge', (evt) => {
      const edge = evt.target;
      setSelectedElement({ type: 'edge', data: edge.data() });
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        cy.elements().removeClass('highlighted dimmed');
        setSelectedElement(null);
      }
    });

    cyInstance.current = cy;
  }, [graphData, layoutName]);

  const handleZoomIn = () => cyInstance.current?.zoom(cyInstance.current.zoom() * 1.25);
  const handleZoomOut = () => cyInstance.current?.zoom(cyInstance.current.zoom() * 0.8);
  const handleFit = () => cyInstance.current?.fit();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cyInstance.current || !searchTerm.trim()) return;

    cyInstance.current.elements().removeClass('highlighted dimmed');
    const matched = cyInstance.current.nodes().filter((n) =>
      n.data('label').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (matched.length > 0) {
      matched.addClass('highlighted');
      cyInstance.current.center(matched);
      cyInstance.current.zoom(1.5);
      setSelectedElement({ type: 'node', data: matched[0].data() });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Interactive Attack Relationship Graph
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold">
              NETWORKX // CYTOSCAPE.JS
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualize correlated attack chains, multi-hop pivots, shared infrastructure, and exploit pathways
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <span>NODES: <strong className="text-white">{graphData?.summary?.total_nodes || 0}</strong></span>
          <span>•</span>
          <span>EDGES: <strong className="text-cyan-400">{graphData?.summary?.total_edges || 0}</strong></span>
        </div>
      </div>

      {/* Graph Control Toolbar */}
      <div className="p-3.5 rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
        <form onSubmit={handleSearch} className="flex items-center gap-2 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Find entity (e.g. 185.220..., Cobalt, MOVEit)..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
          <button type="submit" className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200">
            Find
          </button>
        </form>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Node Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">ALL TYPES</option>
            <option value="ip">IP ADDRESS</option>
            <option value="domain">DOMAIN</option>
            <option value="sha256">SHA256 HASH</option>
            <option value="cve">CVE VULNERABILITY</option>
            <option value="threat_actor">THREAT ACTOR</option>
            <option value="mitre_technique">ATT&CK TECHNIQUE</option>
          </select>

          {/* Layout Selector */}
          <select
            value={layoutName}
            onChange={(e) => setLayoutName(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="cose">LAYOUT: COSE PHYSICS</option>
            <option value="circle">LAYOUT: CIRCULAR</option>
            <option value="breadthfirst">LAYOUT: HIERARCHICAL</option>
            <option value="concentric">LAYOUT: CONCENTRIC</option>
          </select>

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
            <button onClick={handleZoomIn} title="Zoom In" className="p-1.5 text-slate-300 hover:bg-slate-800">
              <ZoomIn className="w-4 h-4" />
            </button>
            <button onClick={handleZoomOut} title="Zoom Out" className="p-1.5 text-slate-300 hover:bg-slate-800 border-l border-slate-700">
              <ZoomOut className="w-4 h-4" />
            </button>
            <button onClick={handleFit} title="Fit to Screen" className="p-1.5 text-slate-300 hover:bg-slate-800 border-l border-slate-700">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={fetchGraph}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="Reload Graph"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Graph Canvas & Inspection Split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 rounded-xl bg-[#090f1d] border border-slate-800/90 relative h-[650px] overflow-hidden shadow-inner">
          <div ref={cyRef} className="w-full h-full" />

          {/* Legend Overlay */}
          <div className="absolute bottom-3 left-3 bg-[#0b1426]/90 backdrop-blur-md p-3 rounded-lg border border-slate-800 text-[10px] font-mono space-y-1.5 shadow-xl pointer-events-none">
            <div className="text-slate-400 font-bold uppercase mb-1">Entity Legend</div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-[#00d2ff]" /> IP Address</div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" /> Domain Name</div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-[#ef4444]" /> File Hash / Malware</div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-[#f59e0b]" /> Vulnerability (CVE)</div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-[#8b5cf6]" /> Threat Actor</div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-[#10b981]" /> MITRE ATT&CK Technique</div>
          </div>
        </div>

        {/* Selected Node / Edge Evidence Drawer */}
        <div className="rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md p-5 h-[650px] overflow-y-auto">
          {selectedElement ? (
            <div className="space-y-5 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono uppercase font-bold text-white">
                    {selectedElement.type === 'node' ? 'Entity Details' : 'Relationship Evidence'}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedElement(null)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedElement.type === 'node' ? (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 uppercase font-bold">
                      {selectedElement.data.type}
                    </span>
                    <h3 className="text-base font-bold text-white font-mono break-all mt-2">
                      {selectedElement.data.label}
                    </h3>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400">CONTEXTUAL RISK SCORE</div>
                    <div className="text-xl font-bold text-cyan-400 font-mono mt-0.5">
                      {selectedElement.data.risk_score || 50} / 100
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">Threat Category</div>
                    <div className="p-2.5 rounded bg-slate-900 text-slate-200">
                      {selectedElement.data.category || 'General Telemetry'}
                    </div>
                  </div>

                  {selectedElement.data.campaign && (
                    <div>
                      <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">Associated Campaign</div>
                      <div className="p-2.5 rounded bg-purple-950/30 border border-purple-500/30 text-purple-300 font-semibold">
                        {selectedElement.data.campaign}
                      </div>
                    </div>
                  )}

                  {selectedElement.data.sources && selectedElement.data.sources.length > 0 && (
                    <div>
                      <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">Attributed Sources</div>
                      <div className="space-y-1">
                        {selectedElement.data.sources.map((src: string, idx: number) => (
                          <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                            {src}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-purple-300 uppercase font-bold">
                      {selectedElement.data.relationship_type}
                    </span>
                    <div className="text-xs font-mono text-slate-300 mt-2">
                      <span className="text-cyan-400 font-bold">{selectedElement.data.source}</span>
                      <span className="mx-1 text-slate-500">──▶</span>
                      <span className="text-white font-bold">{selectedElement.data.target}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400">CORRELATION CONFIDENCE</div>
                    <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                      {selectedElement.data.confidence}%
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">Relationship Evidence</div>
                    <div className="p-3 rounded bg-slate-900/80 border border-slate-800 text-slate-200 leading-relaxed font-sans">
                      {selectedElement.data.evidence || 'Established through shared attack campaign topology.'}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">Evidence Source Reference</div>
                    <div className="p-2 rounded bg-slate-900 text-slate-400 font-mono text-[11px]">
                      {selectedElement.data.source_ref || 'CTI Automated Correlation Engine'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Network className="w-12 h-12 text-slate-700 mb-3" />
              <p className="text-xs font-mono">
                Click any node or relationship edge in the graph to inspect detailed forensic evidence.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

