const assert = require("node:assert/strict");
const { test } = require("node:test");
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

function dashboard() {
  const definitions = new Map();
  const frames = new Map();
  let frameId = 0;
  const context = vm.createContext({
    HTMLElement: class {
      attachShadow() { return { querySelector: () => null }; }
    },
    customElements: { get: (name) => definitions.get(name), define: (name, value) => definitions.set(name, value) },
    window: {}, console: { info() {} },
    requestAnimationFrame: (callback) => { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame: (id) => frames.delete(id),
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../src/ha-ubiquiti-dashboard.js"), "utf8"), context);
  return { card: new (definitions.get("ha-ubiquiti-dashboard"))(), frames };
}

test("automatic theme follows Home Assistant while explicit themes stay fixed", () => {
  const { card } = dashboard();
  const node = {};
  card._root.querySelector = () => node;
  card._config = { theme: "auto" };
  card._hass = { themes: { darkMode: false } };
  card._refreshTheme();
  assert.equal(node.className, "network-card theme-light");
  card._hass.themes.darkMode = true;
  card._refreshTheme();
  assert.equal(node.className, "network-card theme-dark");
  card._config.theme = "light";
  card._refreshTheme();
  assert.equal(node.className, "network-card theme-light");
});

test("metric updates refresh values without rebuilding devices; status and names rebuild", () => {
  const { card } = dashboard();
  card._config = { access_points: [{ entity: "sensor.ap", clients: "sensor.clients" }], switches: [] };
  let renders = 0;
  let refreshes = 0;
  card._render = () => renders++;
  card._refreshDynamicValues = () => refreshes++;
  const hass = (status, clients, name = "AP") => ({ states: {
    "sensor.ap": { state: status, attributes: { friendly_name: name } },
    "sensor.clients": { state: clients },
  } });
  card.hass = hass("on", "1");
  card.hass = hass("on", "2");
  assert.equal(renders, 1);
  assert.equal(refreshes, 1);
  card.hass = hass("off", "2");
  card.hass = hass("off", "2", "Renamed AP");
  assert.equal(renders, 3);
});

test("wire redraws are coalesced and pending work is cancelled on disconnect", () => {
  const { card, frames } = dashboard();
  card.isConnected = true;
  let draws = 0;
  card._drawWires = () => draws++;
  card._scheduleWires();
  card._scheduleWires();
  assert.equal(frames.size, 1);
  const callback = frames.values().next().value;
  frames.clear();
  callback();
  assert.equal(draws, 1);
  card._scheduleWires();
  card.disconnectedCallback();
  assert.equal(frames.size, 0);
  card.isConnected = false;
  card._scheduleWires();
  assert.equal(frames.size, 0);
});

test("unchanged live text does not replace text nodes", () => {
  const { card } = dashboard();
  card._hass = { states: { "sensor.clients": { state: "7" } } };
  let writes = 0;
  const node = {
    dataset: { liveEntity: "sensor.clients", liveFormat: "value" },
    get textContent() { return "7"; },
    set textContent(value) { writes++; },
  };
  card._refreshLiveNode(node);
  assert.equal(writes, 0);
});

test("load colors follow throughput thresholds and recover from missing values", () => {
  const { card } = dashboard();
  const port = { speed_entity: "sensor.speed", rx_entity: "sensor.rx" };
  card._hass = { states: {
    "sensor.speed": { state: "1", attributes: { unit_of_measurement: "Gbit/s" } },
    "sensor.rx": { state: "50", attributes: { unit_of_measurement: "MB/s" } },
  } };
  assert.equal(card._wireLoad(port).color, "green");
  card._hass.states["sensor.rx"].state = "75";
  assert.equal(card._wireLoad(port).color, "amber");
  card._hass.states["sensor.rx"].state = "110";
  assert.equal(card._wireLoad(port).color, "red");
  card._hass.states["sensor.rx"].state = "unavailable";
  assert.equal(card._wireLoad(port), null);
});

test("release checks accept the package version and reject a mismatched tag", () => {
  const { version } = require("../package.json");
  const check = (tag) => spawnSync(process.execPath, [path.join(__dirname, "../scripts/build.js"), "--check"], {
    env: { ...process.env, GITHUB_REF_TYPE: "tag", GITHUB_REF_NAME: tag }, encoding: "utf8",
  });
  assert.equal(check(`v${version}`).status, 0);
  const mismatch = check("v0.0.0");
  assert.notEqual(mismatch.status, 0);
  assert.match(mismatch.stderr, /does not match/);
});
