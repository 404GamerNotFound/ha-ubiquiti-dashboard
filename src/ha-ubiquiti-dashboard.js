/*
 * Ubiquiti Network Dashboard
 * SPDX-License-Identifier: MIT
 */

const CARD_TYPE = "ha-ubiquiti-dashboard";
const EDITOR_TYPE = CARD_TYPE + "-editor";
const CARD_VERSION = "1.10.0";
const OFFLINE = new Set(["off", "unavailable", "unknown", "disconnected", "down", "false", "none"]);
const ONLINE = new Set(["on", "online", "connected", "up", "true", "running"]);
const LINK_COLORS = ["cyan", "violet", "green", "amber", "blue", "pink"];
const WIRE_COLOR_KEYS = [...LINK_COLORS, "red"];

const STYLE = [
  ":host{display:block}",
  "*{box-sizing:border-box}",
  ".network-card{--net-bg:#08151f;--net-panel:#0d202d;--net-border:rgba(88,212,247,.24);--net-text:#edf9ff;--net-muted:#9bb4c1;--net-cyan:#26d5fb;--net-green:#45e49a;--net-amber:#ffc958;--net-red:#ff7184;--net-violet:#b286ff;position:relative;overflow:hidden;color:var(--net-text);background:radial-gradient(circle at 50% -45%,#1d5268 0,transparent 42%),var(--net-bg);font-family:var(--primary-font-family,sans-serif)}",
  ".theme-light{--net-bg:#edf5f8;--net-panel:#fff;--net-border:rgba(18,115,150,.23);--net-text:#163141;--net-muted:#547181;background:radial-gradient(circle at 50% -45%,#bcecf8 0,transparent 42%),var(--net-bg)}",
  ".card-header{display:flex;gap:18px;align-items:flex-start;justify-content:space-between;padding:22px 24px 18px;border-bottom:1px solid var(--net-border)}",
  ".eyebrow{margin:0 0 5px;color:var(--net-cyan);font-size:.68rem;font-weight:800;letter-spacing:.16em}",
  "h1{margin:0;font-size:1.45rem;line-height:1.1;font-weight:700;color:var(--net-text)}",
  ".header-stats{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;color:var(--net-muted);font-size:.76rem}",
  ".header-stats span{display:inline-flex;align-items:center;gap:4px;padding:6px 8px;border:1px solid var(--net-border);border-radius:999px;background:rgba(10,37,51,.3)}",
  "ha-icon{--mdc-icon-size:18px;width:18px;height:18px;color:var(--net-cyan)} .header-stats ha-icon{--mdc-icon-size:15px;width:15px;height:15px}",
  ".topology{position:relative;isolation:isolate;container-type:inline-size;padding:20px 20px 14px;min-height:300px}.wires{position:absolute;inset:0;z-index:3;pointer-events:none;overflow:visible}",
  ".wire{fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;opacity:.82;filter:drop-shadow(0 0 4px currentColor)}.wire.cyan{stroke:var(--net-cyan);color:var(--net-cyan)}.wire.violet{stroke:var(--net-violet);color:var(--net-violet)}.wire.green{stroke:var(--net-green);color:var(--net-green)}.wire.amber{stroke:var(--net-amber);color:var(--net-amber)}.wire.blue{stroke:#6db7ff;color:#6db7ff}.wire.pink{stroke:#ff79c5;color:#ff79c5}.wire.red{stroke:var(--net-red);color:var(--net-red)}",
  ".access-points{position:relative;z-index:1;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,320px));justify-content:center;gap:14px;align-items:start}.access-points.access-points-dense{grid-template-columns:repeat(auto-fit,minmax(210px,280px))}",
  "button{font:inherit}.device{position:relative;display:flex;flex-direction:column;align-items:center;height:264px;padding:13px;border:1px solid var(--net-border);border-radius:16px;background:linear-gradient(150deg,rgba(17,48,64,.86),rgba(7,20,30,.9));color:var(--net-text);text-align:center;cursor:pointer;transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease}.theme-light .device{background:linear-gradient(150deg,#fff,#edf8fb)}.device:hover,.switch-title:hover,.port:hover{border-color:var(--net-cyan);transform:translateY(-2px);box-shadow:0 8px 22px rgba(18,193,239,.12)}.device:focus-visible,.switch-title:focus-visible,.port:focus-visible{outline:2px solid var(--net-cyan);outline-offset:2px}",
  ".device-topline{display:flex;width:100%;align-items:center;justify-content:space-between;gap:8px;color:var(--net-muted);font-size:.66rem}.device-kind{display:inline-flex;align-items:center;gap:4px}.device-kind ha-icon{--mdc-icon-size:15px;width:15px;height:15px}",
  ".state-pill{display:inline-flex;align-items:center;gap:5px;padding:4px 7px;border-radius:999px;background:rgba(255,255,255,.07);font-size:.65rem;font-weight:700;white-space:nowrap}.state-pill i,.legend i{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--net-muted)}.state-pill.online i,.legend .online{background:var(--net-green);box-shadow:0 0 7px var(--net-green)}.state-pill.offline i,.legend .offline{background:var(--net-red)}.state-pill.unknown i,.legend .unknown{background:var(--net-amber)}",
  ".ap-disc{position:relative;display:grid;place-items:center;width:78px;height:78px;margin:12px 0 9px;border:5px solid #eaf7fa;border-radius:50%;background:radial-gradient(circle at 40% 35%,#fff,#cfe2e7);box-shadow:0 0 0 2px rgba(77,227,155,.45),0 0 22px rgba(38,213,251,.36)}.ap-disc.offline{box-shadow:0 0 0 2px rgba(255,113,132,.5),0 0 20px rgba(255,113,132,.2)}.ap-disc.unknown{box-shadow:0 0 0 2px rgba(255,201,88,.5),0 0 20px rgba(255,201,88,.2)}.ap-disc span{color:#254555;font-size:1.8rem;font-weight:300}.ap-disc i{position:absolute;right:7px;bottom:8px;width:10px;height:10px;border:2px solid #efffff;border-radius:50%;background:var(--net-green)}.ap-disc.offline i{background:var(--net-red)}.ap-disc.unknown i{background:var(--net-amber)}",
  ".device-name{max-width:100%;overflow:hidden;color:var(--net-text);font-size:.96rem;font-weight:750;text-overflow:ellipsis;white-space:nowrap}.model{margin-top:3px;color:var(--net-muted);font-size:.72rem}.client-count{display:flex;align-items:center;gap:4px;margin-top:8px;color:var(--net-muted);font-size:.72rem}.client-count ha-icon{--mdc-icon-size:16px;width:16px;height:16px}.client-count strong{color:var(--net-text);font-size:.9rem}.band-metrics{display:flex;flex-wrap:wrap;justify-content:center;gap:4px 10px;margin-top:7px;color:var(--net-muted);font-size:.68rem}.band-metrics strong{color:var(--net-green)}",
  ".uplink{position:relative;display:flex;align-items:center;gap:5px;margin-top:auto;padding-top:9px;color:var(--net-muted);font-size:.66rem}.uplink ha-icon{--mdc-icon-size:14px;width:14px;height:14px}.wire-dot{position:absolute;z-index:4;width:10px;height:10px;border:2px solid var(--net-bg);border-radius:50%;box-shadow:0 0 8px currentColor}.uplink .wire-dot{left:50%;bottom:-18px;transform:translateX(-50%)}.wire-dot.cyan{background:var(--net-cyan);color:var(--net-cyan)}.wire-dot.violet{background:var(--net-violet);color:var(--net-violet)}.wire-dot.green{background:var(--net-green);color:var(--net-green)}.wire-dot.amber{background:var(--net-amber);color:var(--net-amber)}.wire-dot.blue{background:#6db7ff;color:#6db7ff}.wire-dot.pink{background:#ff79c5;color:#ff79c5}.wire-dot.red{background:var(--net-red);color:var(--net-red)}",
  ".switches{position:relative;z-index:1;display:flex;flex-wrap:wrap;gap:16px;margin-top:46px}.switch-node{flex:0 1 var(--switch-basis,100%);max-width:var(--switch-basis,100%);min-width:280px;border:1px solid var(--net-border);border-radius:16px;background:rgba(5,18,27,.74);overflow:hidden;box-shadow:0 10px 24px rgba(0,0,0,.16)}.theme-light .switch-node{background:rgba(255,255,255,.8)}.switch-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 14px;border-bottom:1px solid var(--net-border)}.switch-title{display:flex;align-items:center;gap:9px;padding:0;border:0;background:none;color:var(--net-text);text-align:left;cursor:pointer}.switch-icon{display:grid;place-items:center;width:32px;height:32px;border:1px solid var(--net-border);border-radius:9px;background:rgba(38,213,251,.12)}.switch-title strong,.switch-title small{display:block}.switch-title strong{font-size:.9rem}.switch-title small{margin-top:2px;color:var(--net-muted);font-size:.68rem}.switch-summary{display:flex;align-items:center;gap:9px;color:var(--net-muted);font-size:.7rem}",
  ".switch-face{display:flex;align-items:center;gap:20px;min-height:116px;padding:20px 28px;background:linear-gradient(135deg,#d7e1e5,#f7fbfc 47%,#c8d4d9);color:#173542}.theme-light .switch-face{background:linear-gradient(135deg,#cbd7dc,#fff 47%,#d8e5e9)}.switch-brand{display:flex;flex-direction:column;align-items:center;gap:1px;min-width:46px}.switch-brand b{font-size:2.25rem;font-weight:400;line-height:.9}.switch-brand span{font-size:.43rem;font-weight:800;letter-spacing:.13em}.ports{display:grid;grid-template-columns:repeat(auto-fit,minmax(64px,1fr));flex:1;gap:10px}.port{position:relative;display:flex;flex-direction:column;align-items:center;gap:5px;min-width:0;padding:0;border:0;background:none;color:#193843;cursor:pointer}.port-connector{position:relative;display:flex;align-items:flex-end;justify-content:center;width:100%;height:43px;border:2px solid #395563;border-radius:6px;background:#071b25;box-shadow:inset 0 -10px #142e3b}.port.online .port-connector{border-color:#28c77e;box-shadow:0 0 9px rgba(40,199,126,.45),inset 0 -10px #142e3b}.port.offline .port-connector{border-color:#e66b78}.port.unknown .port-connector{border-color:#d69b37}.port-led{position:absolute;top:6px;left:7px;width:6px;height:6px;border-radius:50%;background:#657984}.port.online .port-led{background:#41e996;box-shadow:0 0 6px #41e996}.port.offline .port-led{background:#ff7184}.port.unknown .port-led{background:#ffc958}.port b{margin-bottom:6px;color:#b8d1d9;font-size:.67rem}.port em{position:absolute;right:3px;top:3px}.port em ha-icon{--mdc-icon-size:13px;width:13px;height:13px;color:var(--net-amber)}.port-dot{top:-7px;left:50%;transform:translateX(-50%)}.port-source-dot{top:auto;bottom:-7px}.port-name{display:block;width:100%;overflow:hidden;color:#38515a;font-size:.68rem;line-height:1.2;text-align:center}.port-name ha-icon{--mdc-icon-size:13px;width:13px;height:13px;color:#557781}.port-name span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.port-metrics{display:flex;flex-wrap:wrap;justify-content:center;gap:2px 6px;min-height:.78rem}.port small{color:#66818a;font-size:.62rem}.port small.poe-power{color:#946e20;font-weight:750}",
  ".empty-ports{grid-column:1/-1;padding:15px;color:#5e7780;text-align:center;font-size:.78rem}.empty-state{display:flex;align-items:center;gap:16px;margin:20px;padding:28px;border:1px dashed var(--net-border);border-radius:16px;color:var(--net-muted)}.empty-state h2{margin:0 0 5px;color:var(--net-text);font-size:1rem}.empty-state p{max-width:480px;margin:0;font-size:.82rem;line-height:1.5}.empty-icon{display:grid;place-items:center;flex:0 0 auto;width:48px;height:48px;border-radius:50%;background:rgba(38,213,251,.13)}.empty-icon ha-icon{width:25px;height:25px}",
  "footer{display:flex;justify-content:space-between;gap:12px;padding:10px 20px 13px;border-top:1px solid var(--net-border);color:var(--net-muted);font-size:.66rem}.legend{display:flex;align-items:center;gap:5px}.legend i{margin-left:5px;width:6px;height:6px}",
  "@container (max-width:680px){.access-points{grid-template-columns:repeat(auto-fit,minmax(220px,280px))}.switch-node{flex-basis:var(--switch-basis-mobile,100%);max-width:var(--switch-basis-mobile,100%)}}",
  "@container (max-width:590px){.access-points,.access-points.access-points-dense{grid-template-columns:minmax(0,280px)}.wires,.wire-dot{display:none}.switches{margin-top:18px}.switch-face{align-items:flex-start;padding:18px 14px;gap:12px}.switch-brand{min-width:38px}.ports{grid-template-columns:repeat(4,minmax(43px,1fr));gap:8px}.switch-summary{display:none}}",
  "@media(max-width:650px){.card-header{flex-direction:column;padding:18px}.header-stats{justify-content:flex-start}.topology{padding:14px}.device{height:254px}.empty-state{margin:14px;padding:20px}footer{padding:10px 14px;flex-direction:column}}",
  ".switch-group{display:grid;gap:10px;flex:1 1 100%}.switch-group-heading{display:flex;align-items:center;gap:7px;padding:2px 4px;color:var(--net-cyan);font-size:.72rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.switch-group-heading ha-icon{--mdc-icon-size:16px;width:16px;height:16px}.switch-group-nodes{display:flex;flex-wrap:wrap;gap:16px}.switch-heading-actions{display:flex;align-items:center;gap:9px}.collapse-toggle{display:grid;place-items:center;width:30px;height:30px;padding:0;border:1px solid var(--net-border);border-radius:8px;background:rgba(38,213,251,.08);color:var(--net-cyan);cursor:pointer}.collapse-toggle ha-icon{--mdc-icon-size:17px;width:17px;height:17px}.switch-node.collapsed .switch-face{display:none}",
  ".client-value{color:var(--net-text);font-size:.9rem;font-weight:750}.band-value{color:var(--net-green);font-weight:700}.port-metrics span{color:#66818a;font-size:.62rem}.port-metrics span.poe-power{color:#946e20;font-weight:750}",
  ".gateway-node{margin-top:26px}.gateway-face{background:linear-gradient(135deg,#123145,#1b435c 47%,#0d2635);color:#eaf7fb}.theme-light .gateway-face{background:linear-gradient(135deg,#d7ecf5,#fff 47%,#cfe8f2);color:#123145}.gateway-brand{display:grid;place-items:center;min-width:46px}.gateway-brand ha-icon{--mdc-icon-size:34px;width:34px;height:34px;color:var(--net-cyan)}.gateway-metrics{display:flex;flex-wrap:wrap;gap:10px 16px;color:inherit;opacity:.85;font-size:.78rem;font-weight:650}.gateway-metrics span{display:inline-flex;align-items:center;gap:4px}.gateway-metrics ha-icon{--mdc-icon-size:15px;width:15px;height:15px}",
  ".header-gateway-chip.online{color:var(--net-green)}.header-gateway-chip.offline{color:var(--net-red)}.header-gateway-chip.unknown{color:var(--net-amber)}.header-gateway-chip ha-icon{color:inherit}",
  ".header-stats span.header-alert-chip{color:var(--net-red);border-color:rgba(255,113,132,.5);background:rgba(255,113,132,.14);font-weight:700}.header-alert-chip ha-icon{color:var(--net-red)}",
].join("");

const EDITOR_STYLE = [
  ":host{display:block;color:var(--primary-text-color,#e1e1e1)}*{box-sizing:border-box}.editor{display:grid;gap:16px;padding:12px 4px;font-family:var(--primary-font-family,sans-serif)}.editor-header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.editor-header h2{margin:0;font-size:1.1rem}.editor-header p{margin:4px 0 0;color:var(--secondary-text-color,#888);font-size:.85rem;line-height:1.4}.editor-section{display:grid;gap:12px;padding:14px;border:1px solid var(--divider-color,rgba(127,127,127,.25));border-radius:12px;background:var(--card-background-color,transparent)}.editor-section-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.editor-section-head h3{margin:0;font-size:.95rem}.editor-section-head p{margin:3px 0 0;color:var(--secondary-text-color,#888);font-size:.78rem}.editor-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.editor-field{display:grid;gap:5px;min-width:0;color:var(--secondary-text-color,#888);font-size:.75rem;font-weight:600}.editor-field input,.editor-field select{width:100%;min-width:0;height:38px;padding:0 10px;border:1px solid var(--divider-color,rgba(127,127,127,.35));border-radius:7px;outline:none;background:var(--secondary-background-color,#18242c);color:var(--primary-text-color,#e1e1e1);font:inherit;font-weight:400}.editor-field input:focus,.editor-field select:focus{border-color:var(--primary-color,#03a9f4);box-shadow:0 0 0 1px var(--primary-color,#03a9f4)}.editor-list{display:grid;gap:10px}.editor-item{display:grid;gap:10px;padding:12px;border-radius:9px;background:color-mix(in srgb,var(--secondary-background-color,#18242c) 80%,transparent)}.editor-item-head{display:flex;align-items:center;justify-content:space-between;gap:8px}.editor-item-head strong{font-size:.86rem}.editor-item-toggle{display:flex;align-items:center;gap:6px;min-width:0;padding:0;border:0;background:none;color:var(--primary-text-color,#e1e1e1);font:inherit;cursor:pointer;text-align:left}.editor-item-toggle ha-icon{--mdc-icon-size:18px;width:18px;height:18px;color:var(--secondary-text-color,#888);flex:0 0 auto}.editor-item-toggle strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.editor-item-actions{display:flex;align-items:center;justify-content:space-between;gap:8px}.editor-button{min-height:34px;padding:0 11px;border:1px solid var(--primary-color,#03a9f4);border-radius:7px;background:transparent;color:var(--primary-color,#03a9f4);font:inherit;font-size:.78rem;font-weight:650;cursor:pointer}.editor-button:hover{background:color-mix(in srgb,var(--primary-color,#03a9f4) 12%,transparent)}.editor-button.danger{border-color:var(--error-color,#db4437);color:var(--error-color,#db4437)}.editor-button.secondary{border-color:var(--divider-color,rgba(127,127,127,.35));color:var(--primary-text-color,#e1e1e1)}.editor-empty{padding:10px;border:1px dashed var(--divider-color,rgba(127,127,127,.35));border-radius:8px;color:var(--secondary-text-color,#888);font-size:.8rem;text-align:center}.uplink-fields{padding:10px;border-left:2px solid var(--primary-color,#03a9f4);background:color-mix(in srgb,var(--primary-color,#03a9f4) 5%,transparent)}@media(max-width:600px){.editor-grid{grid-template-columns:1fr}.editor-header{flex-direction:column}.editor-section{padding:12px}}",
].join("");

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = String(text);
  return node;
}

function icon(name) {
  const node = document.createElement("ha-icon");
  node.setAttribute("icon", "mdi:" + name);
  return node;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

class UbiquitiNetworkDashboardEditor extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this._expandedPorts = new Set();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) this._render();
  }

  setConfig(config) {
    const nextConfig = clone(config || {});
    nextConfig.title = nextConfig.title || "UniFi Network";
    nextConfig.theme = nextConfig.theme || "auto";
    nextConfig.access_points = Array.isArray(nextConfig.access_points) ? nextConfig.access_points : [];
    nextConfig.switches = Array.isArray(nextConfig.switches) ? nextConfig.switches : [];
    const signature = JSON.stringify(nextConfig);
    this._config = nextConfig;
    if (signature === this._configSignature) return;
    this._configSignature = signature;
    this._render();
  }

  _emitConfigChanged() {
    this._configSignature = JSON.stringify(this._config);
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: clone(this._config) },
      bubbles: true,
      composed: true,
    }));
  }

  _entityList() {
    const list = document.createElement("datalist");
    list.id = "unifi-dashboard-entities";
    Object.entries((this._hass && this._hass.states) || {}).sort(([left], [right]) => left.localeCompare(right)).forEach(([entityId, state]) => {
      const option = document.createElement("option");
      option.value = entityId;
      option.label = (state.attributes && state.attributes.friendly_name) || entityId;
      list.append(option);
    });
    return list;
  }

  _switchList() {
    const list = document.createElement("datalist");
    list.id = "unifi-dashboard-switches";
    this._config.switches.forEach((switchConfig) => {
      if (!switchConfig.name) return;
      const option = document.createElement("option");
      option.value = switchConfig.name;
      list.append(option);
    });
    if (this._config.gateway && this._config.gateway.name) {
      const option = document.createElement("option");
      option.value = this._config.gateway.name;
      list.append(option);
    }
    return list;
  }

  _field(labelText, value, options = {}) {
    const field = element("label", "editor-field");
    field.append(element("span", "", labelText));
    const control = document.createElement(options.options ? "select" : "input");
    if (options.options) {
      options.options.forEach(([optionValue, optionLabel]) => {
        const option = document.createElement("option");
        option.value = optionValue;
        option.textContent = optionLabel;
        option.selected = String(value || "") === optionValue;
        control.append(option);
      });
    } else {
      control.type = options.type || "text";
      control.value = value === undefined || value === null ? "" : String(value);
      if (options.placeholder) control.placeholder = options.placeholder;
      if (options.entity) control.setAttribute("list", "unifi-dashboard-entities");
      if (options.switchName) control.setAttribute("list", "unifi-dashboard-switches");
      if (options.type === "number") {
        control.min = "1";
        control.step = "1";
      }
    }
    control.dataset.editorKey = options.key || "";
    control.dataset.editorKind = options.kind || "general";
    if (options.index !== undefined) control.dataset.editorIndex = String(options.index);
    if (options.switchIndex !== undefined) control.dataset.editorSwitchIndex = String(options.switchIndex);
    if (options.portIndex !== undefined) control.dataset.editorPortIndex = String(options.portIndex);
    if (options.bandIndex !== undefined) control.dataset.editorBandIndex = String(options.bandIndex);
    if (options.type === "number") control.dataset.valueType = "number";
    if (options.valueType) control.dataset.valueType = options.valueType;
    field.append(control);
    return field;
  }

  _button(label, action, options = {}) {
    const button = element("button", "editor-button" + (options.kind ? " " + options.kind : ""), label);
    button.type = "button";
    button.dataset.editorAction = action;
    if (options.index !== undefined) button.dataset.editorIndex = String(options.index);
    if (options.switchIndex !== undefined) button.dataset.editorSwitchIndex = String(options.switchIndex);
    if (options.portIndex !== undefined) button.dataset.editorPortIndex = String(options.portIndex);
    if (options.bandIndex !== undefined) button.dataset.editorBandIndex = String(options.bandIndex);
    return button;
  }

  _section(title, description) {
    const section = element("section", "editor-section");
    const head = element("div", "editor-section-head");
    const copy = document.createElement("div");
    copy.append(element("h3", "", title), element("p", "", description));
    head.append(copy);
    section.append(head);
    return section;
  }

  _apEditor(ap, index) {
    const item = element("article", "editor-item");
    const head = element("div", "editor-item-head");
    head.append(element("strong", "", "Access Point " + (index + 1)), this._button("Entfernen", "remove-ap", { index, kind: "danger" }));
    const grid = element("div", "editor-grid");
    grid.append(
      this._field("Name", ap.name, { kind: "ap", index, key: "name", placeholder: "z. B. Wohnzimmer AP" }),
      this._field("Modell", ap.model, { kind: "ap", index, key: "model", placeholder: "z. B. U7 Pro" }),
      this._field("Status-Entität", ap.status_entity || ap.entity, { kind: "ap", index, key: "status_entity", entity: true, placeholder: "binary_sensor..." }),
      this._field("Clients-Entität", ap.clients_entity || ap.clients, { kind: "ap", index, key: "clients_entity", entity: true, placeholder: "sensor..." })
    );
    const uplink = element("div", "uplink-fields editor-grid");
    uplink.append(
      this._field("Uplink-Switch", ap.uplink && ap.uplink.switch, { kind: "ap", index, key: "uplink.switch", switchName: true, placeholder: "Switch auswählen" }),
      this._field("Uplink-Port", ap.uplink && ap.uplink.port, { kind: "ap", index, key: "uplink.port", type: "number", placeholder: "z. B. 7" })
    );
    const bands = Array.isArray(ap.bands) ? ap.bands : [];
    const bandList = element("div", "editor-list");
    if (bands.length) bands.forEach((band, bandIndex) => bandList.append(this._bandEditor(band, index, bandIndex)));
    else bandList.append(element("div", "editor-empty", "Keine Band-Metriken konfiguriert."));
    const actions = element("div", "editor-item-actions");
    actions.append(this._button("Band-Metrik hinzufügen", "add-band", { index, kind: "secondary" }));
    item.append(head, grid, uplink, element("strong", "", "Band-Metriken (optional)"), bandList, actions);
    return item;
  }

  _bandEditor(band, apIndex, bandIndex) {
    const item = element("article", "editor-item");
    const head = element("div", "editor-item-head");
    head.append(element("strong", "", "Band " + (bandIndex + 1)), this._button("Entfernen", "remove-band", { index: apIndex, bandIndex, kind: "danger" }));
    const grid = element("div", "editor-grid");
    grid.append(
      this._field("Bezeichnung", band.label, { kind: "band", index: apIndex, bandIndex, key: "label", placeholder: "z. B. 5 GHz" }),
      this._field("Client-Entität", band.entity, { kind: "band", index: apIndex, bandIndex, key: "entity", entity: true, placeholder: "sensor..." })
    );
    item.append(head, grid);
    return item;
  }

  _portEditor(port, switchIndex, portIndex) {
    const key = "switch:" + switchIndex + ":" + portIndex;
    const expanded = this._expandedPorts.has(key);
    const item = element("article", "editor-item");
    const head = element("div", "editor-item-head");
    const toggle = element("button", "editor-item-toggle");
    toggle.type = "button";
    toggle.dataset.editorAction = "toggle-port";
    toggle.dataset.editorSwitchIndex = String(switchIndex);
    toggle.dataset.editorPortIndex = String(portIndex);
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.append(icon(expanded ? "chevron-down" : "chevron-right"), element("strong", "", "Port " + (port.number || portIndex + 1) + (port.name ? " · " + port.name : "")));
    head.append(toggle, this._button("Entfernen", "remove-port", { switchIndex, portIndex, kind: "danger" }));
    item.append(head);
    if (expanded) {
      const grid = element("div", "editor-grid");
      grid.append(
        this._field("Portnummer", port.number, { kind: "port", switchIndex, portIndex, key: "number", type: "number" }),
        this._field("Name", port.name, { kind: "port", switchIndex, portIndex, key: "name", placeholder: "z. B. Access Point" }),
        this._field("Status-Entität", port.status_entity || port.entity, { kind: "port", switchIndex, portIndex, key: "status_entity", entity: true, placeholder: "switch..." }),
        this._field("Geschwindigkeits-Entität", port.speed_entity || port.speed, { kind: "port", switchIndex, portIndex, key: "speed_entity", entity: true, placeholder: "sensor..." }),
        this._field("RX-Entität", port.rx_entity || port.rx, { kind: "port", switchIndex, portIndex, key: "rx_entity", entity: true, placeholder: "sensor..." }),
        this._field("TX-Entität", port.tx_entity || port.tx, { kind: "port", switchIndex, portIndex, key: "tx_entity", entity: true, placeholder: "sensor..." }),
        this._field("PoE-Entität", port.poe_entity || port.poe, { kind: "port", switchIndex, portIndex, key: "poe_entity", entity: true, placeholder: "binary_sensor..." }),
        this._field("PoE-Leistungs-Entität", port.poe_power_entity || port.poe_power, { kind: "port", switchIndex, portIndex, key: "poe_power_entity", entity: true, placeholder: "sensor..." }),
        this._field("Symbol (optional)", port.icon, { kind: "port", switchIndex, portIndex, key: "icon", placeholder: "z. B. server" })
      );
      item.append(grid);
    }
    return item;
  }

  _switchEditor(switchConfig, index) {
    const item = element("article", "editor-item");
    const head = element("div", "editor-item-head");
    head.append(element("strong", "", "Switch " + (index + 1)), this._button("Entfernen", "remove-switch", { index, kind: "danger" }));
    const grid = element("div", "editor-grid");
    grid.append(
      this._field("Name", switchConfig.name, { kind: "switch", index, key: "name", placeholder: "z. B. Heizungsraum" }),
      this._field("Modell", switchConfig.model, { kind: "switch", index, key: "model", placeholder: "z. B. USW Lite 8 PoE" }),
      this._field("Status-Entität", switchConfig.status_entity || switchConfig.entity, { kind: "switch", index, key: "status_entity", entity: true, placeholder: "sensor..." }),
      this._field("Gruppe / Bereich", switchConfig.group || switchConfig.area, { kind: "switch", index, key: "group", placeholder: "z. B. Dachgeschoss" }),
      this._field("Startansicht", switchConfig.collapsed ? "true" : "false", { kind: "switch", index, key: "collapsed", valueType: "boolean", options: [["false", "Ausgeklappt"], ["true", "Eingeklappt"]] }),
      this._field("Breite Desktop (%)", switchConfig.width, { kind: "switch", index, key: "width", type: "number", placeholder: "z. B. 50" }),
      this._field("Breite Mobil (%)", switchConfig.width_mobile, { kind: "switch", index, key: "width_mobile", type: "number", placeholder: "leer = volle Breite" })
    );
    const poeOverview = element("div", "uplink-fields editor-grid");
    poeOverview.append(
      this._field("PoE-Budget-Entität", switchConfig.poe_budget_entity, { kind: "switch", index, key: "poe_budget_entity", entity: true, placeholder: "sensor..." }),
      this._field("PoE-Budget (W)", switchConfig.poe_budget, { kind: "switch", index, key: "poe_budget", type: "number", placeholder: "z. B. 60" }),
      this._field("PoE-Gesamtverbrauch-Entität", switchConfig.poe_usage_entity || switchConfig.poe_usage, { kind: "switch", index, key: "poe_usage_entity", entity: true, placeholder: "sensor..." })
    );
    const uplink = element("div", "uplink-fields editor-grid");
    uplink.append(
      this._field("Ziel-Switch", switchConfig.uplink && switchConfig.uplink.switch, { kind: "switch", index, key: "uplink.switch", switchName: true, placeholder: "Switch auswählen" }),
      this._field("Ziel-Port", switchConfig.uplink && switchConfig.uplink.port, { kind: "switch", index, key: "uplink.port", type: "number", placeholder: "z. B. 3" }),
      this._field("Eigener Uplink-Port", switchConfig.uplink && (switchConfig.uplink.local_port || switchConfig.uplink.source_port), { kind: "switch", index, key: "uplink.local_port", type: "number", placeholder: "z. B. 1" })
    );
    const ports = Array.isArray(switchConfig.ports) ? switchConfig.ports : [];
    const portList = element("div", "editor-list");
    if (ports.length) ports.forEach((port, portIndex) => portList.append(this._portEditor(port, index, portIndex)));
    else portList.append(element("div", "editor-empty", "Noch keine Ports hinzugefügt."));
    const actions = element("div", "editor-item-actions");
    actions.append(this._button("Port hinzufügen", "add-port", { switchIndex: index, kind: "secondary" }));
    item.append(head, grid, element("strong", "", "PoE-Übersicht (optional)"), poeOverview, uplink, element("strong", "", "Ports"), portList, actions);
    return item;
  }

  _gatewayPortEditor(port, portIndex) {
    const key = "gateway:" + portIndex;
    const expanded = this._expandedPorts.has(key);
    const item = element("article", "editor-item");
    const head = element("div", "editor-item-head");
    const toggle = element("button", "editor-item-toggle");
    toggle.type = "button";
    toggle.dataset.editorAction = "toggle-gateway-port";
    toggle.dataset.editorPortIndex = String(portIndex);
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.append(icon(expanded ? "chevron-down" : "chevron-right"), element("strong", "", "Port " + (port.number || portIndex + 1) + (port.name ? " · " + port.name : "")));
    head.append(toggle, this._button("Entfernen", "remove-gateway-port", { portIndex, kind: "danger" }));
    item.append(head);
    if (expanded) {
      const grid = element("div", "editor-grid");
      grid.append(
        this._field("Portnummer", port.number, { kind: "gateway-port", portIndex, key: "number", type: "number" }),
        this._field("Name", port.name, { kind: "gateway-port", portIndex, key: "name", placeholder: "z. B. Core Switch" }),
        this._field("Status-Entität", port.status_entity || port.entity, { kind: "gateway-port", portIndex, key: "status_entity", entity: true, placeholder: "switch..." }),
        this._field("Geschwindigkeits-Entität", port.speed_entity || port.speed, { kind: "gateway-port", portIndex, key: "speed_entity", entity: true, placeholder: "sensor..." })
      );
      item.append(grid);
    }
    return item;
  }

  _gatewayEditor() {
    const gateway = this._config.gateway;
    const section = this._section("Internet-Gateway", "Optionale WAN-Ansicht unterhalb der Switches. Switches können ihren Uplink auf den Gateway-Namen setzen.");
    if (!gateway) {
      const actions = element("div", "editor-item-actions");
      actions.append(this._button("Gateway hinzufügen", "add-gateway"));
      section.append(element("div", "editor-empty", "Kein Gateway konfiguriert."), actions);
      return section;
    }
    const grid = element("div", "editor-grid");
    grid.append(
      this._field("Name", gateway.name, { kind: "gateway", key: "name", placeholder: "z. B. Internet-Gateway" }),
      this._field("Modell", gateway.model, { kind: "gateway", key: "model", placeholder: "z. B. UDM Pro" }),
      this._field("Status-Entität", gateway.status_entity || gateway.entity, { kind: "gateway", key: "status_entity", entity: true, placeholder: "binary_sensor..." }),
      this._field("WAN-IP-Entität", gateway.wan_ip_entity, { kind: "gateway", key: "wan_ip_entity", entity: true, placeholder: "sensor..." }),
      this._field("Download-Entität", gateway.download_entity || gateway.download, { kind: "gateway", key: "download_entity", entity: true, placeholder: "sensor..." }),
      this._field("Upload-Entität", gateway.upload_entity || gateway.upload, { kind: "gateway", key: "upload_entity", entity: true, placeholder: "sensor..." }),
      this._field("Latenz-Entität", gateway.latency_entity || gateway.latency, { kind: "gateway", key: "latency_entity", entity: true, placeholder: "sensor..." }),
      this._field("Clients-Entität", gateway.clients_entity || gateway.clients, { kind: "gateway", key: "clients_entity", entity: true, placeholder: "sensor..." })
    );
    const ports = Array.isArray(gateway.ports) ? gateway.ports : [];
    const portList = element("div", "editor-list");
    if (ports.length) ports.forEach((port, portIndex) => portList.append(this._gatewayPortEditor(port, portIndex)));
    else portList.append(element("div", "editor-empty", "Noch keine LAN-Ports hinzugefügt."));
    const actions = element("div", "editor-item-actions");
    actions.append(this._button("LAN-Port hinzufügen", "add-gateway-port", { kind: "secondary" }), this._button("Gateway entfernen", "remove-gateway", { kind: "danger" }));
    section.append(grid, element("strong", "", "LAN-Ports (optional, für Switch-Uplinks)"), portList, actions);
    return section;
  }

  _editorTarget(control) {
    const kind = control.dataset.editorKind;
    if (kind === "ap") return this._config.access_points[Number(control.dataset.editorIndex)];
    if (kind === "band") {
      const ap = this._config.access_points[Number(control.dataset.editorIndex)];
      return ap && ap.bands && ap.bands[Number(control.dataset.editorBandIndex)];
    }
    if (kind === "switch") return this._config.switches[Number(control.dataset.editorIndex)];
    if (kind === "port") {
      const switchConfig = this._config.switches[Number(control.dataset.editorSwitchIndex)];
      return switchConfig && switchConfig.ports && switchConfig.ports[Number(control.dataset.editorPortIndex)];
    }
    if (kind === "gateway") return this._config.gateway;
    if (kind === "gateway-port") {
      return this._config.gateway && this._config.gateway.ports && this._config.gateway.ports[Number(control.dataset.editorPortIndex)];
    }
    return this._config;
  }

  _updateValue(control) {
    const target = this._editorTarget(control);
    const key = control.dataset.editorKey;
    if (!target || !key) return;
    let value = control.value;
    if (control.dataset.valueType === "number") value = control.value === "" ? undefined : Number(control.value);
    if (control.dataset.valueType === "boolean") value = control.value === "true";
    const [group, property] = key.split(".");
    if (property) {
      if (value === undefined || value === "") {
        if (target[group]) {
          delete target[group][property];
          if (!Object.keys(target[group]).length) delete target[group];
        }
      } else {
        target[group] = target[group] || {};
        target[group][property] = value;
      }
    } else if (value === undefined || value === "") {
      delete target[group];
    } else {
      target[group] = value;
    }
    this._emitConfigChanged();
  }

  _deviceName(key) {
    const parts = String(key).split("_").filter((part, index, all) => index === 0 || part !== all[index - 1]);
    return parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
  }

  _findDeviceEntity(records, key, matcher) {
    const prefix = key + "_";
    const record = records.find((item) => item.objectId.startsWith(prefix) && !/_port_\d+/.test(item.objectId) && matcher(item));
    return record && record.entityId;
  }

  _discoverNetworkDevices() {
    const records = Object.entries((this._hass && this._hass.states) || {}).map(([entityId, state]) => {
      const [domain, objectId] = entityId.split(".");
      const friendlyName = (state.attributes && state.attributes.friendly_name) || "";
      return { entityId, state, domain, objectId, descriptor: (objectId + " " + friendlyName).toLowerCase() };
    });
    const switchCandidates = new Map();
    records.forEach((record) => {
      const match = record.objectId.match(/^(.+?)_port_(\d+)(?:_(.*))?$/);
      if (!match) return;
      const [, key, portNumber, suffix = ""] = match;
      const candidate = switchCandidates.get(key) || { key, ports: new Map() };
      const port = candidate.ports.get(portNumber) || { number: Number(portNumber), name: "Port " + portNumber };
      const descriptor = record.descriptor;
      const isPoePower = /poe.*(leistung|power|watt)|(leistung|power|watt).*poe/.test(descriptor);
      const isPoe = /poe/.test(descriptor);
      const isSpeed = /verbindungsgeschwindigkeit|link[_ ]?speed|\bspeed\b/.test(descriptor);
      const isRx = /(^|[_ ])(rx|download|received)([_ ]|$)/.test(descriptor);
      const isTx = /(^|[_ ])(tx|upload|sent)([_ ]|$)/.test(descriptor);
      if (isPoePower) port.poe_power_entity = record.entityId;
      else if (isPoe) port.poe_entity = record.entityId;
      else if (isSpeed) port.speed_entity = record.entityId;
      else if (isRx) port.rx_entity = record.entityId;
      else if (isTx) port.tx_entity = record.entityId;
      else if ((record.domain === "switch" || record.domain === "binary_sensor") && (!suffix || !port.status_entity)) port.status_entity = record.entityId;
      candidate.ports.set(portNumber, port);
      switchCandidates.set(key, candidate);
    });
    const switches = [...switchCandidates.values()].map((candidate) => {
      const statusEntity = this._findDeviceEntity(records, candidate.key, (item) => /(?:_|^)(zustand|status|state)$/.test(item.objectId));
      const clientsEntity = this._findDeviceEntity(records, candidate.key, (item) => /(?:_|^)(clients|client_count)$/.test(item.objectId));
      const switchConfig = {
        name: this._deviceName(candidate.key),
        ports: [...candidate.ports.values()].sort((left, right) => left.number - right.number),
      };
      if (statusEntity) switchConfig.status_entity = statusEntity;
      if (clientsEntity) switchConfig.clients_entity = clientsEntity;
      return switchConfig;
    });
    const accessPoints = records.reduce((suggestions, record) => {
      const match = record.objectId.match(/^(.+?)_(?:clients|client_count)$/);
      if (!match || record.domain !== "sensor" || switchCandidates.has(match[1])) return suggestions;
      const key = match[1];
      const attributes = record.state.attributes || {};
      const isAccessPoint = /(^|[_ ])(ap|access[_ ]?point|u[4-9])([_ ]|$)/.test(record.descriptor) || attributes.device_type === "uap" || attributes.type === "uap";
      if (!isAccessPoint) return suggestions;
      const statusEntity = this._findDeviceEntity(records, key, (item) => /(?:_|^)(zustand|status|state)$/.test(item.objectId));
      const accessPoint = { name: this._deviceName(key), clients_entity: record.entityId };
      if (statusEntity) accessPoint.status_entity = statusEntity;
      if (attributes.model || attributes.model_name) accessPoint.model = attributes.model || attributes.model_name;
      suggestions.push(accessPoint);
      return suggestions;
    }, []);
    return { switches, accessPoints };
  }

  _acceptDiscovery(kind) {
    const suggestions = this._discovery && this._discovery[kind] ? this._discovery[kind] : [];
    const target = kind === "switches" ? this._config.switches : this._config.access_points;
    suggestions.forEach((suggestion) => {
      const statusEntity = suggestion.status_entity || suggestion.entity;
      const exists = target.some((item) => (statusEntity && (item.status_entity || item.entity) === statusEntity) || String(item.name || "").toLowerCase() === String(suggestion.name || "").toLowerCase());
      if (!exists) target.push(clone(suggestion));
    });
  }

  _handleAction(button) {
    const action = button.dataset.editorAction;
    const index = Number(button.dataset.editorIndex);
    const switchIndex = Number(button.dataset.editorSwitchIndex);
    const portIndex = Number(button.dataset.editorPortIndex);
    const bandIndex = Number(button.dataset.editorBandIndex);
    let configChanged = false;
    if (action === "toggle-port") {
      const key = "switch:" + switchIndex + ":" + portIndex;
      if (this._expandedPorts.has(key)) this._expandedPorts.delete(key);
      else this._expandedPorts.add(key);
    }
    if (action === "toggle-gateway-port") {
      const key = "gateway:" + portIndex;
      if (this._expandedPorts.has(key)) this._expandedPorts.delete(key);
      else this._expandedPorts.add(key);
    }
    if (action === "scan-entities") this._discovery = this._discoverNetworkDevices();
    if (action === "accept-switches") {
      this._acceptDiscovery("switches");
      configChanged = true;
    }
    if (action === "accept-access-points") {
      this._acceptDiscovery("accessPoints");
      configChanged = true;
    }
    if (action === "add-ap") {
      this._config.access_points.push({ name: "Neuer Access Point" });
      configChanged = true;
    }
    if (action === "remove-ap") {
      this._config.access_points.splice(index, 1);
      configChanged = true;
    }
    if (action === "add-band") {
      const bands = this._config.access_points[index].bands || (this._config.access_points[index].bands = []);
      bands.push({ label: "Neues Band" });
      configChanged = true;
    }
    if (action === "remove-band") {
      this._config.access_points[index].bands.splice(bandIndex, 1);
      configChanged = true;
    }
    if (action === "add-switch") {
      this._config.switches.push({ name: "Neuer Switch", ports: [] });
      configChanged = true;
    }
    if (action === "remove-switch") {
      this._config.switches.splice(index, 1);
      configChanged = true;
    }
    if (action === "add-port") {
      const ports = this._config.switches[switchIndex].ports || (this._config.switches[switchIndex].ports = []);
      const nextNumber = ports.reduce((largest, port) => Math.max(largest, Number(port.number) || 0), 0) + 1;
      ports.push({ number: nextNumber, name: "Nicht zugeordnet" });
      this._expandedPorts.add("switch:" + switchIndex + ":" + (ports.length - 1));
      configChanged = true;
    }
    if (action === "remove-port") {
      this._config.switches[switchIndex].ports.splice(portIndex, 1);
      configChanged = true;
    }
    if (action === "add-gateway") {
      this._config.gateway = { name: "Internet-Gateway" };
      configChanged = true;
    }
    if (action === "remove-gateway") {
      delete this._config.gateway;
      configChanged = true;
    }
    if (action === "add-gateway-port") {
      const ports = this._config.gateway.ports || (this._config.gateway.ports = []);
      const nextNumber = ports.reduce((largest, port) => Math.max(largest, Number(port.number) || 0), 0) + 1;
      ports.push({ number: nextNumber, name: "Nicht zugeordnet" });
      this._expandedPorts.add("gateway:" + (ports.length - 1));
      configChanged = true;
    }
    if (action === "remove-gateway-port") {
      this._config.gateway.ports.splice(portIndex, 1);
      configChanged = true;
    }
    if (configChanged) this._emitConfigChanged();
    this._render();
  }

  _render() {
    if (!this._config) return;
    this._rendered = true;
    this._root.replaceChildren();
    this._root.append(element("style", "", EDITOR_STYLE));
    const editor = element("div", "editor");
    const header = element("div", "editor-header");
    const headerCopy = document.createElement("div");
    headerCopy.append(element("h2", "", "Ubiquiti Network Dashboard"), element("p", "", "Geräte, Ports und deren Uplinks direkt im visuellen Editor konfigurieren."));
    header.append(headerCopy);
    const general = this._section("Allgemein", "Titel und Farbdarstellung der Karte.");
    const generalGrid = element("div", "editor-grid");
    generalGrid.append(
      this._field("Titel", this._config.title, { key: "title", placeholder: "UniFi Network" }),
      this._field("Theme", this._config.theme, { key: "theme", options: [["auto", "Automatisch"], ["dark", "Dunkel"], ["light", "Hell"]] })
    );
    general.append(generalGrid);
    const discovery = this._section("Automatische Erkennung", "Durchsucht vorhandene Home-Assistant-Entitäten und erstellt unverbindliche Vorschläge.");
    const discoveryList = element("div", "editor-list");
    if (this._discovery) {
      const discoveredSwitches = this._discovery.switches || [];
      const discoveredAccessPoints = this._discovery.accessPoints || [];
      if (!discoveredSwitches.length && !discoveredAccessPoints.length) {
        discoveryList.append(element("div", "editor-empty", "Keine passenden UniFi-Entitäten gefunden. Prüfe, ob die UniFi-Integration Entitäten bereitstellt."));
      } else {
        if (discoveredSwitches.length) discoveryList.append(element("div", "editor-empty", "Switches: " + discoveredSwitches.map((item) => item.name + " (" + item.ports.length + " Ports)").join(", ")));
        if (discoveredAccessPoints.length) discoveryList.append(element("div", "editor-empty", "Access Points: " + discoveredAccessPoints.map((item) => item.name).join(", ")));
      }
    } else {
      discoveryList.append(element("div", "editor-empty", "Die Erkennung verändert deine Konfiguration erst, nachdem du passende Vorschläge übernimmst."));
    }
    const discoveryActions = element("div", "editor-item-actions");
    discoveryActions.append(this._button("Entitäten analysieren", "scan-entities", { kind: "secondary" }));
    if (this._discovery && this._discovery.switches.length) discoveryActions.append(this._button(this._discovery.switches.length + " Switches übernehmen", "accept-switches"));
    if (this._discovery && this._discovery.accessPoints.length) discoveryActions.append(this._button(this._discovery.accessPoints.length + " APs übernehmen", "accept-access-points"));
    discovery.append(discoveryList, discoveryActions);
    const aps = this._section("Access Points", "Der Uplink verbindet einen AP mit einem Port eines Switches.");
    const apList = element("div", "editor-list");
    if (this._config.access_points.length) this._config.access_points.forEach((ap, index) => apList.append(this._apEditor(ap, index)));
    else apList.append(element("div", "editor-empty", "Noch keine Access Points hinzugefügt."));
    const apActions = element("div", "editor-item-actions");
    apActions.append(this._button("Access Point hinzufügen", "add-ap"));
    aps.append(apList, apActions);
    const switches = this._section("Switches", "Ports und optionale Switch-zu-Switch-Uplinks konfigurieren.");
    const switchList = element("div", "editor-list");
    if (this._config.switches.length) this._config.switches.forEach((switchConfig, index) => switchList.append(this._switchEditor(switchConfig, index)));
    else switchList.append(element("div", "editor-empty", "Noch keine Switches hinzugefügt."));
    const switchActions = element("div", "editor-item-actions");
    switchActions.append(this._button("Switch hinzufügen", "add-switch"));
    switches.append(switchList, switchActions);
    editor.append(header, general, discovery, aps, switches, this._gatewayEditor(), this._entityList(), this._switchList());
    this._root.append(editor);
    if (this._listenersAttached) return;
    this._listenersAttached = true;
    this._root.addEventListener("input", (event) => this._updateValue(event.target));
    this._root.addEventListener("change", (event) => {
      if (event.target && event.target.tagName === "SELECT") this._updateValue(event.target);
    });
    this._root.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-editor-action]");
      if (button) this._handleAction(button);
    });
  }
}

class UbiquitiNetworkDashboard extends HTMLElement {
  static getStubConfig() {
    return { title: "UniFi Network", access_points: [], switches: [] };
  }

  static getConfigElement() {
    return document.createElement(EDITOR_TYPE);
  }

  setConfig(config) {
    if (!config || typeof config !== "object") throw new Error("Eine Kartenkonfiguration wird benötigt.");
    if (config.access_points && !Array.isArray(config.access_points)) throw new Error("access_points muss eine Liste sein.");
    if (config.switches && !Array.isArray(config.switches)) throw new Error("switches muss eine Liste sein.");
    if (config.gateway && typeof config.gateway !== "object") throw new Error("gateway muss ein Objekt sein.");
    const nextConfig = Object.assign({ title: "UniFi Network", theme: "auto", access_points: [], switches: [] }, clone(config));
    nextConfig.access_points = Array.isArray(nextConfig.access_points) ? nextConfig.access_points : [];
    nextConfig.switches = Array.isArray(nextConfig.switches) ? nextConfig.switches : [];
    const configSignature = JSON.stringify(nextConfig);
    if (configSignature === this._configSignature) return;
    this._config = nextConfig;
    this._configSignature = configSignature;
    this._stateSignature = this._hassStateSignature(this._hass);
    this._render();
  }

  set hass(hass) {
    const stateSignature = this._hassStateSignature(hass);
    this._hass = hass;
    if (stateSignature === this._stateSignature) {
      this._refreshDynamicValues();
      return;
    }
    this._stateSignature = stateSignature;
    this._render();
  }

  connectedCallback() {
    this.style.display = "block";
    this._resizeObserver = new ResizeObserver(() => this._drawWires());
    this._resizeObserver.observe(this);
    this._render();
  }

  disconnectedCallback() {
    this._resizeObserver && this._resizeObserver.disconnect();
  }

  getCardSize() {
    const apCount = this._config && this._config.access_points ? this._config.access_points.length : 0;
    const switchCount = this._config && this._config.switches ? this._config.switches.length : 0;
    const gatewayBonus = this._config && this._config.gateway ? 2 : 0;
    return Math.max(4, Math.ceil((apCount * 2 + switchCount * 3) / 2) + gatewayBonus);
  }

  getGridOptions() {
    return { columns: "full", min_columns: 6, min_rows: 4 };
  }

  _hassStateSignature(hass) {
    if (!this._config || !hass || !hass.states) return "";
    const entityIds = new Set();
    const add = (entityId) => {
      if (entityId) entityIds.add(entityId);
    };
    this._config.access_points.forEach((ap) => {
      add(ap.status_entity || ap.entity);
    });
    this._config.switches.forEach((switchConfig) => {
      add(switchConfig.status_entity || switchConfig.entity);
      (switchConfig.ports || []).forEach((port) => {
        add(port.status_entity || port.entity);
        add(port.poe_entity || port.poe);
      });
    });
    if (this._config.gateway) {
      const gateway = this._config.gateway;
      add(gateway.status_entity || gateway.entity);
      (gateway.ports || []).forEach((port) => {
        add(port.status_entity || port.entity);
        add(port.poe_entity || port.poe);
      });
    }
    return [...entityIds].map((entityId) => {
      const state = hass.states[entityId];
      return [entityId, state && state.state].join("\u001f");
    }).join("\u001e");
  }

  _state(entityId) {
    return entityId && this._hass && this._hass.states ? this._hass.states[entityId] : undefined;
  }

  _switchStateKey(switchConfig, index) {
    return switchConfig.id || switchConfig.name || switchConfig.status_entity || switchConfig.entity || String(index);
  }

  _isSwitchCollapsed(switchConfig, index) {
    this._collapsedSwitches = this._collapsedSwitches || new Map();
    const key = this._switchStateKey(switchConfig, index);
    return this._collapsedSwitches.has(key) ? this._collapsedSwitches.get(key) : Boolean(switchConfig.collapsed);
  }

  _online(entityId) {
    const state = this._state(entityId);
    if (!state) return null;
    const value = String(state.state).toLowerCase();
    if (OFFLINE.has(value)) return false;
    if (ONLINE.has(value)) return true;
    return value !== "";
  }

  _health(entityId) {
    const online = this._online(entityId);
    if (online === true) return { key: "online", label: "Online" };
    if (online === false) return { key: "offline", label: "Offline" };
    return { key: "unknown", label: "Nicht verbunden" };
  }

  _value(entityId, fallback) {
    const state = this._state(entityId);
    if (!state || OFFLINE.has(String(state.state).toLowerCase())) return fallback;
    return state.state;
  }

  _liveText(entityId, format, fallback = "", prefix = "") {
    const node = element("span");
    node.dataset.liveEntity = entityId || "";
    node.dataset.liveFormat = format;
    node.dataset.liveFallback = fallback;
    node.dataset.livePrefix = prefix;
    this._refreshLiveNode(node);
    return node;
  }

  _refreshLiveNode(node) {
    const entityId = node.dataset.liveEntity;
    const format = node.dataset.liveFormat;
    let value = "";
    if (format === "value") value = this._value(entityId, node.dataset.liveFallback || "");
    if (format === "speed") value = this._speed(entityId);
    if (format === "traffic") value = this._traffic(entityId);
    if (format === "poe-power") value = this._poePower(entityId);
    if (format === "latency") value = this._latency(entityId);
    node.textContent = value === "" ? (node.dataset.liveFallback || "") : (node.dataset.livePrefix || "") + value;
  }

  _totalClientCount() {
    return (this._config.access_points || []).reduce((sum, ap) => {
      const value = Number.parseFloat(String(this._value(ap.clients_entity || ap.clients, "0")).replace(",", "."));
      return sum + (Number.isFinite(value) ? value : 0);
    }, 0);
  }

  _refreshDynamicValues() {
    if (!this.isConnected || !this._config) return;
    this.querySelectorAll("[data-live-entity]").forEach((node) => this._refreshLiveNode(node));
    this.querySelectorAll("[data-live-total-clients]").forEach((node) => {
      node.textContent = this._totalClientCount() + " Clients";
    });
    this.querySelectorAll("[data-live-switch-poe-index]").forEach((node) => {
      const switchConfig = this._config.switches[Number(node.dataset.liveSwitchPoeIndex)];
      node.textContent = switchConfig ? this._switchPoeSummary(switchConfig, switchConfig.ports || []) : "";
    });
  }

  _speed(entityId) {
    const state = this._state(entityId);
    if (!state || OFFLINE.has(String(state.state).toLowerCase())) return "";
    const value = String(state.state);
    const unit = state.attributes && state.attributes.unit_of_measurement;
    if (unit) return value + " " + unit;
    const numeric = Number.parseFloat(value.replace(",", "."));
    if (!Number.isFinite(numeric)) return value;
    if (numeric >= 1000) return (numeric / 1000).toLocaleString("de-DE", { maximumFractionDigits: 1 }) + " Gbit/s";
    return numeric.toLocaleString("de-DE", { maximumFractionDigits: 0 }) + " Mbit/s";
  }

  _poePower(entityId) {
    const state = this._state(entityId);
    if (!state || OFFLINE.has(String(state.state).toLowerCase())) return "";
    const value = String(state.state);
    const unit = state.attributes && state.attributes.unit_of_measurement;
    if (unit) return value + " " + unit;
    const numeric = Number.parseFloat(value.replace(",", "."));
    if (!Number.isFinite(numeric)) return value;
    return numeric.toLocaleString("de-DE", { maximumFractionDigits: 2 }) + " W";
  }

  _traffic(entityId) {
    const state = this._state(entityId);
    if (!state || OFFLINE.has(String(state.state).toLowerCase())) return "";
    const value = String(state.state);
    const unit = state.attributes && state.attributes.unit_of_measurement;
    return unit ? value + " " + unit : value;
  }

  _speedMbps(entityId) {
    const state = this._state(entityId);
    if (!state || OFFLINE.has(String(state.state).toLowerCase())) return null;
    const numeric = Number.parseFloat(String(state.state).replace(",", "."));
    if (!Number.isFinite(numeric) || numeric <= 0) return null;
    const unit = String((state.attributes && state.attributes.unit_of_measurement) || "").toLowerCase();
    if (unit.includes("gbit")) return numeric * 1000;
    if (unit.includes("kbit")) return numeric / 1000;
    return numeric;
  }

  _trafficMbps(entityId) {
    const state = this._state(entityId);
    if (!state || OFFLINE.has(String(state.state).toLowerCase())) return null;
    const numeric = Number.parseFloat(String(state.state).replace(",", "."));
    if (!Number.isFinite(numeric)) return null;
    const unit = String((state.attributes && state.attributes.unit_of_measurement) || "").toLowerCase();
    if (unit.includes("gbit")) return numeric * 1000;
    if (unit.includes("kbit")) return numeric / 1000;
    if (unit.includes("mbit") || unit.includes("mbps")) return numeric;
    if (unit.includes("gb/s") || unit.includes("gbyte")) return numeric * 8000;
    if (unit.includes("mb/s") || unit.includes("mbyte")) return numeric * 8;
    if (unit.includes("kb/s") || unit.includes("kbyte")) return numeric * 8 / 1000;
    if (unit.includes("byte/s") || unit === "b/s") return numeric * 8 / 1e6;
    return numeric;
  }

  _findUplinkPort(uplink) {
    if (!uplink || !uplink.switch) return null;
    const targetName = String(uplink.switch).toLowerCase();
    const owner = (this._config.switches || []).find((sw) => String(sw.name || "").toLowerCase() === targetName)
      || (this._config.gateway && String(this._config.gateway.name || "").toLowerCase() === targetName ? this._config.gateway : null);
    if (!owner || !Array.isArray(owner.ports)) return null;
    return owner.ports.find((port) => String(port.number) === String(uplink.port)) || null;
  }

  _wireLoad(port) {
    if (!port) return null;
    const speed = this._speedMbps(port.speed_entity || port.speed);
    if (!speed) return null;
    const rx = this._trafficMbps(port.rx_entity || port.rx);
    const tx = this._trafficMbps(port.tx_entity || port.tx);
    if (rx === null && tx === null) return null;
    const ratio = Math.max(rx || 0, tx || 0) / speed;
    const color = ratio >= 0.85 ? "red" : ratio >= 0.6 ? "amber" : "green";
    return { color, title: "Auslastung: " + Math.round(ratio * 100) + "%" };
  }

  _latency(entityId) {
    const state = this._state(entityId);
    if (!state || OFFLINE.has(String(state.state).toLowerCase())) return "";
    const value = String(state.state);
    const unit = state.attributes && state.attributes.unit_of_measurement;
    return value + " " + (unit || "ms");
  }

  _watts(entityId) {
    const state = this._state(entityId);
    if (!state || OFFLINE.has(String(state.state).toLowerCase())) return null;
    const value = Number.parseFloat(String(state.state).replace(",", "."));
    if (!Number.isFinite(value)) return null;
    const unit = String((state.attributes && state.attributes.unit_of_measurement) || "W").toLowerCase();
    if (unit === "kw") return value * 1000;
    if (unit === "mw") return value / 1000;
    return value;
  }

  _formatWatts(value) {
    return value.toLocaleString("de-DE", { maximumFractionDigits: 2 }) + " W";
  }

  _switchPoeSummary(switchConfig, ports) {
    let usage = this._watts(switchConfig.poe_usage_entity || switchConfig.poe_usage);
    if (usage === null) {
      const portUsage = ports.map((port) => this._watts(port.poe_power_entity || port.poe_power)).filter((value) => value !== null);
      usage = portUsage.length ? portUsage.reduce((sum, value) => sum + value, 0) : null;
    }
    let budget = this._watts(switchConfig.poe_budget_entity);
    if (budget === null && switchConfig.poe_budget !== undefined && switchConfig.poe_budget !== "") {
      const configuredBudget = Number.parseFloat(String(switchConfig.poe_budget).replace(",", "."));
      budget = Number.isFinite(configuredBudget) ? configuredBudget : null;
    }
    if (usage === null && budget === null) return "";
    if (budget !== null) return "⚡ " + this._formatWatts(usage || 0) + " / " + this._formatWatts(budget);
    return "⚡ " + this._formatWatts(usage);
  }

  _name(entityId, fallback) {
    const state = this._state(entityId);
    return state && state.attributes && state.attributes.friendly_name ? state.attributes.friendly_name : fallback;
  }

  _offlineDeviceCount() {
    const accessPoints = this._config.access_points || [];
    const switches = this._config.switches || [];
    let count = 0;
    accessPoints.forEach((ap) => {
      if (this._health(ap.status_entity || ap.entity).key === "offline") count++;
    });
    switches.forEach((switchConfig) => {
      if (this._health(switchConfig.status_entity || switchConfig.entity).key === "offline") count++;
    });
    if (this._config.gateway && this._health(this._config.gateway.status_entity || this._config.gateway.entity).key === "offline") count++;
    return count;
  }

  _linkTargetId(switchName, portNumber) {
    const accessPointIndex = this._config.access_points.findIndex((ap) => {
      return ap.uplink && String(ap.uplink.switch || "").toLowerCase() === String(switchName).toLowerCase() && String(ap.uplink.port) === String(portNumber);
    });
    if (accessPointIndex >= 0) return "ap-" + accessPointIndex;
    const switchIndex = this._config.switches.findIndex((item) => {
      return item.uplink && String(item.uplink.switch || "").toLowerCase() === String(switchName).toLowerCase() && String(item.uplink.port) === String(portNumber);
    });
    return switchIndex >= 0 ? "switch-" + switchIndex : "";
  }

  _clickable(node, entityId) {
    if (!entityId) return;
    node.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("hass-more-info", { bubbles: true, composed: true, detail: { entityId } }));
    });
  }

  _badge(health) {
    const badge = element("span", "state-pill " + health.key);
    badge.append(element("i"), document.createTextNode(health.label));
    return badge;
  }

  _accessPoint(ap, index) {
    const entityId = ap.status_entity || ap.entity;
    const health = this._health(entityId);
    const item = element("button", "device ap-device");
    item.type = "button";
    this._clickable(item, entityId);

    const line = element("div", "device-topline");
    const kind = element("span", "device-kind");
    kind.append(icon("access-point"), document.createTextNode("Access Point"));
    line.append(kind, this._badge(health));
    item.append(line);

    const disc = element("div", "ap-disc " + health.key);
    disc.append(element("span", "", "U"), element("i"));
    item.append(disc, element("div", "device-name", ap.name || this._name(entityId, "Access Point")));
    if (ap.model) item.append(element("span", "model", ap.model));

    const clients = element("div", "client-count");
    const clientValue = this._liveText(ap.clients_entity || ap.clients, "value", "–");
    clientValue.className = "client-value";
    clients.append(icon("account-group"), clientValue, document.createTextNode("Clients"));
    item.append(clients);

    if (Array.isArray(ap.bands) && ap.bands.length) {
      const metrics = element("div", "band-metrics");
      ap.bands.forEach((band) => {
        const metric = element("span");
        const bandValue = this._liveText(band.entity, "value", "–");
        bandValue.className = "band-value";
        metric.append(document.createTextNode((band.label || "Band") + ": "), bandValue);
        metrics.append(metric);
      });
      item.append(metrics);
    }

    if (ap.uplink && (ap.uplink.switch || ap.uplink.port)) {
      const link = element("div", "uplink");
      const load = this._wireLoad(this._findUplinkPort(ap.uplink));
      const dot = element("span", "wire-dot " + (load ? load.color : LINK_COLORS[index % LINK_COLORS.length]));
      if (load) dot.title = load.title;
      dot.dataset.wireFrom = "ap-" + index;
      link.append(dot, icon("arrow-down"), document.createTextNode((ap.uplink.switch || "Switch") + (ap.uplink.port ? " · Port " + ap.uplink.port : "")));
      item.append(link);
    }
    return item;
  }

  _port(port, switchConfig, switchIndex, portIndex) {
    const entityId = port.status_entity || port.entity;
    const health = this._health(entityId);
    const switchName = switchConfig.name || this._name(switchConfig.status_entity || switchConfig.entity, "UniFi Switch");
    const portButton = element("button", "port " + health.key);
    portButton.type = "button";
    this._clickable(portButton, entityId);
    const connector = element("span", "port-connector");
    connector.append(element("i", "port-led"), element("b", "", port.number || portIndex + 1));
    if (this._online(port.poe_entity || port.poe) === true) {
      const poe = element("em");
      poe.title = "PoE aktiv";
      poe.append(icon("flash"));
      connector.append(poe);
    }
    const targetId = this._linkTargetId(switchName, port.number);
    if (targetId) {
      const dot = element("span", "wire-dot port-dot");
      dot.dataset.wireTo = targetId;
      connector.append(dot);
    }
    const localUplinkPort = switchConfig.uplink && (switchConfig.uplink.local_port || switchConfig.uplink.source_port);
    if (localUplinkPort !== undefined && String(localUplinkPort) === String(port.number)) {
      const load = this._wireLoad(this._findUplinkPort(switchConfig.uplink)) || this._wireLoad(port);
      const color = load ? load.color : LINK_COLORS[(this._config.access_points.length + switchIndex) % LINK_COLORS.length];
      const dot = element("span", "wire-dot port-dot port-source-dot " + color);
      if (load) dot.title = load.title;
      dot.dataset.wireFrom = "switch-" + switchIndex;
      connector.append(dot);
    }
    const label = element("span", "port-name");
    label.title = port.name || this._name(entityId, "Nicht belegt");
    if (port.icon) label.append(icon(port.icon));
    label.append(element("span", "", port.name || this._name(entityId, "Nicht belegt")));
    portButton.append(connector, label);
    const speedEntity = port.speed_entity || port.speed;
    const rxEntity = port.rx_entity || port.rx;
    const txEntity = port.tx_entity || port.tx;
    const poePowerEntity = port.poe_power_entity || port.poe_power;
    if (speedEntity || rxEntity || txEntity || poePowerEntity) {
      const metrics = element("div", "port-metrics");
      if (speedEntity) metrics.append(this._liveText(speedEntity, "speed"));
      if (rxEntity) metrics.append(this._liveText(rxEntity, "traffic", "", "↓ "));
      if (txEntity) metrics.append(this._liveText(txEntity, "traffic", "", "↑ "));
      if (poePowerEntity) {
        const poePower = this._liveText(poePowerEntity, "poe-power", "", "⚡ ");
        poePower.className = "poe-power";
        metrics.append(poePower);
      }
      portButton.append(metrics);
    }
    return portButton;
  }

  _switchWidthBasis(value) {
    if (value === undefined || value === null || value === "") return null;
    const numeric = Number.parseFloat(String(value).replace(",", "."));
    if (!Number.isFinite(numeric)) return null;
    const width = Math.min(100, Math.max(10, numeric));
    const gapDeduction = (16 * (100 - width) / 100).toFixed(2);
    return "calc(" + width + "% - " + gapDeduction + "px)";
  }

  _applySwitchWidth(node, switchConfig) {
    const desktopBasis = this._switchWidthBasis(switchConfig.width);
    if (desktopBasis) node.style.setProperty("--switch-basis", desktopBasis);
    const mobileBasis = this._switchWidthBasis(switchConfig.width_mobile);
    if (mobileBasis) node.style.setProperty("--switch-basis-mobile", mobileBasis);
  }

  _switch(switchConfig, index) {
    const entityId = switchConfig.status_entity || switchConfig.entity;
    const health = this._health(entityId);
    const ports = Array.isArray(switchConfig.ports) ? switchConfig.ports : [];
    const stateKey = this._switchStateKey(switchConfig, index);
    const collapsed = this._isSwitchCollapsed(switchConfig, index);
    const node = element("section", "switch-node " + health.key + (collapsed ? " collapsed" : ""));
    this._applySwitchWidth(node, switchConfig);
    const heading = element("div", "switch-heading");
    const title = element("button", "switch-title");
    title.type = "button";
    this._clickable(title, entityId);
    const switchIcon = element("span", "switch-icon");
    switchIcon.append(icon("switch"));
    const titleText = element("span");
    titleText.append(element("strong", "", switchConfig.name || this._name(entityId, "UniFi Switch")), element("small", "", switchConfig.model || "Switch"));
    title.append(switchIcon, titleText);
    const activePorts = ports.filter((port) => this._online(port.status_entity || port.entity) === true).length;
    const summary = element("div", "switch-summary");
    summary.append(this._badge(health), document.createTextNode(activePorts + "/" + ports.length + " aktive Ports"));
    const hasPoeSummary = switchConfig.poe_budget_entity || switchConfig.poe_budget !== undefined || switchConfig.poe_usage_entity || switchConfig.poe_usage || ports.some((port) => port.poe_power_entity || port.poe_power);
    if (hasPoeSummary) {
      const poeSummary = element("span", "poe-summary", this._switchPoeSummary(switchConfig, ports));
      poeSummary.dataset.liveSwitchPoeIndex = String(index);
      summary.append(poeSummary);
    }
    const collapse = element("button", "collapse-toggle");
    collapse.type = "button";
    collapse.title = collapsed ? "Switch ausklappen" : "Switch einklappen";
    collapse.setAttribute("aria-expanded", String(!collapsed));
    collapse.append(icon(collapsed ? "chevron-down" : "chevron-up"));
    collapse.addEventListener("click", () => {
      const nextCollapsed = !node.classList.contains("collapsed");
      node.classList.toggle("collapsed", nextCollapsed);
      this._collapsedSwitches.set(stateKey, nextCollapsed);
      collapse.title = nextCollapsed ? "Switch ausklappen" : "Switch einklappen";
      collapse.setAttribute("aria-expanded", String(!nextCollapsed));
      collapse.replaceChildren(icon(nextCollapsed ? "chevron-down" : "chevron-up"));
      requestAnimationFrame(() => this._drawWires());
    });
    const headingActions = element("div", "switch-heading-actions");
    headingActions.append(summary, collapse);
    heading.append(title, headingActions);

    const face = element("div", "switch-face");
    const brand = element("div", "switch-brand");
    brand.append(element("b", "", "U"), element("span", "", "NETWORK"));
    const portsNode = element("div", "ports");
    if (!ports.length) {
      portsNode.append(element("div", "empty-ports", "Noch keine Ports konfiguriert"));
    } else {
      ports.forEach((port, portIndex) => portsNode.append(this._port(port, switchConfig, index, portIndex)));
    }
    face.append(brand, portsNode);
    node.append(heading, face);
    return node;
  }

  _gatewayPortsSection(gateway) {
    const ports = Array.isArray(gateway.ports) ? gateway.ports : [];
    if (!ports.length) return null;
    const portsNode = element("div", "ports");
    ports.forEach((port, portIndex) => portsNode.append(this._port(port, gateway, "gateway", portIndex)));
    return portsNode;
  }

  _gateway() {
    const gateway = this._config.gateway;
    if (!gateway) return null;
    const entityId = gateway.status_entity || gateway.entity;
    const health = this._health(entityId);
    const node = element("section", "switch-node gateway-node " + health.key);
    const heading = element("div", "switch-heading");
    const title = element("button", "switch-title");
    title.type = "button";
    this._clickable(title, entityId);
    const gatewayIcon = element("span", "switch-icon");
    gatewayIcon.append(icon("web"));
    const titleText = element("span");
    titleText.append(element("strong", "", gateway.name || this._name(entityId, "Internet-Gateway")), element("small", "", gateway.model || "Gateway"));
    title.append(gatewayIcon, titleText);
    const summary = element("div", "switch-summary");
    summary.append(this._badge(health));
    if (gateway.wan_ip_entity) summary.append(this._liveText(gateway.wan_ip_entity, "value"));
    if (gateway.latency_entity || gateway.latency) summary.append(this._liveText(gateway.latency_entity || gateway.latency, "latency", "", "↝ "));
    const headingActions = element("div", "switch-heading-actions");
    headingActions.append(summary);
    heading.append(title, headingActions);

    const face = element("div", "switch-face gateway-face");
    const brand = element("div", "switch-brand gateway-brand");
    brand.append(icon("earth"));
    face.append(brand);

    const downloadEntity = gateway.download_entity || gateway.download;
    const uploadEntity = gateway.upload_entity || gateway.upload;
    const clientsEntity = gateway.clients_entity || gateway.clients;
    if (downloadEntity || uploadEntity || clientsEntity) {
      const metrics = element("div", "gateway-metrics");
      if (downloadEntity) metrics.append(this._liveText(downloadEntity, "traffic", "", "↓ "));
      if (uploadEntity) metrics.append(this._liveText(uploadEntity, "traffic", "", "↑ "));
      if (clientsEntity) {
        const clientMetric = element("span");
        clientMetric.append(icon("account-group"), this._liveText(clientsEntity, "value"));
        metrics.append(clientMetric);
      }
      face.append(metrics);
    }

    const portsNode = this._gatewayPortsSection(gateway);
    if (portsNode) face.append(portsNode);

    node.append(heading, face);
    return node;
  }

  _captureScrollPositions() {
    const positions = [];
    let node = this.parentNode;
    while (node) {
      if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        node = node.host;
        continue;
      }
      if (node.scrollHeight > node.clientHeight) positions.push([node, node.scrollTop]);
      node = node.parentNode;
    }
    const scrollingElement = document.scrollingElement || document.documentElement;
    if (scrollingElement) positions.push([scrollingElement, scrollingElement.scrollTop]);
    return positions;
  }

  _restoreScrollPositions(positions) {
    positions.forEach(([node, scrollTop]) => {
      if (node.scrollTop !== scrollTop) node.scrollTop = scrollTop;
    });
  }

  _render() {
    if (!this.isConnected || !this._config) return;
    const scrollPositions = this._captureScrollPositions();
    this.replaceChildren();
    const card = element("ha-card", "network-card theme-" + (["light", "dark"].includes(this._config.theme) ? this._config.theme : "auto"));
    card.style.display = "block";
    card.append(element("style", "", STYLE));
    const accessPoints = this._config.access_points || [];
    const switches = this._config.switches || [];
    const totalClients = this._totalClientCount();
    const header = element("div", "card-header");
    const heading = element("div");
    heading.append(element("p", "eyebrow", "NETZWERKTOPOLOGIE"), element("h1", "", this._config.title || "UniFi Network"));
    const stats = element("div", "header-stats");
    [[ "access-point", accessPoints.length + " APs" ], [ "switch", switches.length + " Switches" ]].forEach((stat) => {
      const chip = element("span");
      chip.append(icon(stat[0]), document.createTextNode(stat[1]));
      stats.append(chip);
    });
    const clientsChip = element("span");
    const clientsTotal = element("span", "", totalClients + " Clients");
    clientsTotal.dataset.liveTotalClients = "";
    clientsChip.append(icon("account-group"), clientsTotal);
    stats.append(clientsChip);
    if (this._config.gateway) {
      const gatewayHealth = this._health(this._config.gateway.status_entity || this._config.gateway.entity);
      const label = gatewayHealth.key === "online" ? "Online" : gatewayHealth.key === "offline" ? "Offline" : "Unbekannt";
      const chip = element("span", "header-gateway-chip " + gatewayHealth.key);
      chip.append(icon("web"), document.createTextNode("Internet " + label));
      stats.append(chip);
    }
    const offlineCount = this._offlineDeviceCount();
    if (offlineCount > 0) {
      const alertChip = element("span", "header-alert-chip");
      alertChip.append(icon("alert"), document.createTextNode(offlineCount + (offlineCount === 1 ? " Gerät offline" : " Geräte offline")));
      stats.append(alertChip);
    }
    header.append(heading, stats);
    card.append(header);

    if (!accessPoints.length && !switches.length && !this._config.gateway) {
      const empty = element("div", "empty-state");
      const emptyIcon = element("div", "empty-icon");
      emptyIcon.append(icon("switch"));
      const emptyText = element("div");
      emptyText.append(element("h2", "", "Deine Netzwerkansicht ist bereit"), element("p", "", "Füge Access Points und Switches in der YAML-Konfiguration dieser Karte hinzu. Ein vollständiges Beispiel steht in der README."));
      empty.append(emptyIcon, emptyText);
      card.append(empty);
    } else {
      const topology = element("main", "topology");
      const wires = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      wires.classList.add("wires");
      topology.append(wires);
      if (accessPoints.length) {
        const apSection = element("section", "access-points" + (accessPoints.length >= 3 ? " access-points-dense" : ""));
        accessPoints.forEach((ap, index) => apSection.append(this._accessPoint(ap, index)));
        topology.append(apSection);
      }
      if (switches.length) {
        const switchSection = element("section", "switches");
        const hasGroups = switches.some((switchConfig) => switchConfig.group || switchConfig.area);
        if (!hasGroups) {
          switches.forEach((switchConfig, index) => switchSection.append(this._switch(switchConfig, index)));
        } else {
          const groups = new Map();
          switches.forEach((switchConfig, index) => {
            const groupName = String(switchConfig.group || switchConfig.area || "Weitere Geräte");
            if (!groups.has(groupName)) groups.set(groupName, []);
            groups.get(groupName).push([switchConfig, index]);
          });
          groups.forEach((groupSwitches, groupName) => {
            const group = element("section", "switch-group");
            const groupHeading = element("div", "switch-group-heading");
            groupHeading.append(icon("folder-network"), document.createTextNode(groupName));
            const nodes = element("div", "switch-group-nodes");
            groupSwitches.forEach(([switchConfig, index]) => nodes.append(this._switch(switchConfig, index)));
            group.append(groupHeading, nodes);
            switchSection.append(group);
          });
        }
        topology.append(switchSection);
      }
      const gatewayNode = this._gateway();
      if (gatewayNode) topology.append(gatewayNode);
      card.append(topology);
    }
    const footer = element("footer");
    const legend = element("span", "legend");
    [[ "online", "Online" ], [ "offline", "Offline" ], [ "unknown", "Unbekannt" ]].forEach((state) => {
      legend.append(element("i", state[0]), document.createTextNode(state[1]));
    });
    footer.append(legend, element("span", "", "Ubiquiti Network Dashboard"));
    card.append(footer);
    this.append(card);
    this._restoreScrollPositions(scrollPositions);
    requestAnimationFrame(() => {
      this._drawWires();
      this._restoreScrollPositions(scrollPositions);
      requestAnimationFrame(() => this._restoreScrollPositions(scrollPositions));
    });
  }

  _drawWires() {
    const topology = this.querySelector(".topology");
    const svg = this.querySelector(".wires");
    if (!topology || !svg) return;
    const bounds = topology.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    svg.setAttribute("viewBox", "0 0 " + bounds.width + " " + bounds.height);
    svg.setAttribute("width", String(bounds.width));
    svg.setAttribute("height", String(bounds.height));
    svg.replaceChildren();
    this.querySelectorAll("[data-wire-from]").forEach((from) => {
      const to = this.querySelector("[data-wire-to='" + from.dataset.wireFrom + "']");
      if (!to) return;
      if (from.closest(".switch-node.collapsed") || to.closest(".switch-node.collapsed")) return;
      const start = from.getBoundingClientRect();
      const end = to.getBoundingClientRect();
      const x1 = start.left - bounds.left + start.width / 2;
      const y1 = start.top - bounds.top + start.height / 2;
      const x2 = end.left - bounds.left + end.width / 2;
      const y2 = end.top - bounds.top + end.height / 2;
      const fromNode = from.closest(".ap-device, .switch-node");
      const targetNode = to.closest(".ap-device, .switch-node");
      const intermediateNodes = [...this.querySelectorAll(".ap-device, .switch-node:not(.collapsed)")].filter((node) => {
        if (node === targetNode || node === fromNode) return false;
        const rect = node.getBoundingClientRect();
        const top = rect.top - bounds.top;
        const bottom = rect.bottom - bounds.top;
        const left = rect.left - bounds.left;
        const right = rect.right - bounds.left;
        const verticallyBetween = top > Math.min(y1, y2) && bottom < Math.max(y1, y2);
        const horizontallyInPath = right > Math.min(x1, x2) && left < Math.max(x1, x2);
        return verticallyBetween && horizontallyInPath;
      });
      const hasPortRowAbove = (dot) => {
        const port = dot.closest(".port");
        const grid = port && port.closest(".ports");
        if (!grid) return false;
        const portTop = port.getBoundingClientRect().top;
        return [...grid.children].some((sibling) => sibling !== port && sibling.getBoundingClientRect().top < portTop - 1);
      };
      const obstacleRects = intermediateNodes.map((node) => node.getBoundingClientRect());
      if (targetNode && hasPortRowAbove(to)) obstacleRects.push(targetNode.getBoundingClientRect());
      if (fromNode && hasPortRowAbove(from)) obstacleRects.push(fromNode.getBoundingClientRect());
      const wire = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
      const color = WIRE_COLOR_KEYS.find((item) => from.classList.contains(item)) || "cyan";
      wire.setAttribute("class", "wire " + color);
      if (obstacleRects.length) {
        const firstTop = Math.min(y1, y2, ...obstacleRects.map((rect) => rect.top - bounds.top)) - 12;
        const lastBottom = Math.max(y1, y2, ...obstacleRects.map((rect) => rect.bottom - bounds.top)) + 12;
        const leftRail = Math.max(8, Math.min(...obstacleRects.map((rect) => rect.left - bounds.left)) - 12);
        const rightRail = Math.min(bounds.width - 8, Math.max(...obstacleRects.map((rect) => rect.right - bounds.left)) + 12);
        const rail = Math.abs(x1 - leftRail) + Math.abs(x2 - leftRail) <= Math.abs(x1 - rightRail) + Math.abs(x2 - rightRail) ? leftRail : rightRail;
        wire.setAttribute("points", x1 + "," + y1 + " " + x1 + "," + firstTop + " " + rail + "," + firstTop + " " + rail + "," + lastBottom + " " + x2 + "," + lastBottom + " " + x2 + "," + y2);
      } else {
        const middle = y1 + (y2 - y1) * 0.5;
        wire.setAttribute("points", x1 + "," + y1 + " " + x1 + "," + middle + " " + x2 + "," + middle + " " + x2 + "," + y2);
      }
      svg.append(wire);
    });
  }
}

if (!customElements.get(EDITOR_TYPE)) customElements.define(EDITOR_TYPE, UbiquitiNetworkDashboardEditor);
if (!customElements.get(CARD_TYPE)) customElements.define(CARD_TYPE, UbiquitiNetworkDashboard);
window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === CARD_TYPE)) {
  window.customCards.push({
    type: CARD_TYPE,
    name: "Ubiquiti Network Dashboard",
    description: "Visualisiert UniFi Access Points, Switches und Port-Verbindungen.",
    documentationURL: "https://github.com/404GamerNotFound/ha-ubiquiti-dashboard",
  });
}
console.info("%c UBIQUITI NETWORK DASHBOARD %c v" + CARD_VERSION + " ", "color:#19d7ff;font-weight:700;background:#10212d", "color:#fff;font-weight:700;background:#10212d");
