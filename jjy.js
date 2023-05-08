export function serverFuncs(ns) {
	if (ns.jjy === undefined) ns.jjy = {};
	ns.jjy.servers = {};
	ns.jjy.servers.all = function () {
		let paths = {
			"home": []
		};
		let unvisited = ["home"];
		// breadth-first search
		while (unvisited.length > 0) {
			let curr = unvisited.shift();
			paths[curr].push(curr);
			let children = ns.scan(curr);
			for (let child of children) {
				if (!paths[child]) {
					paths[child] = [...paths[curr]];
				}
				let path = paths[child];
				if (path[path.length - 1] !== child) {
					unvisited.push(child);
				}
			}
		}
		return paths;
	}
	ns.jjy.servers.targets = function (servers = undefined) {
		if (servers === undefined) servers = Object.keys(ns.jjy.servers.all());
		return servers
			.filter(target =>
				ns.serverExists(target) &&
				ns.hasRootAccess(target) &&
				ns.getServerMaxMoney(target) > 0 &&
				ns.getServerRequiredHackingLevel(target) <= ns.getHackingLevel() &&
				target !== "fulcrumassets")
			.sort((a, b) =>
				ns.getServerMaxMoney(a) - ns.getServerMaxMoney(b));
	}
	ns.jjy.servers.hosts = function (servers = undefined) {
		if (servers === undefined) servers = Object.keys(ns.jjy.servers.all());
		return servers
			.filter(host =>
				ns.serverExists(host) &&
				ns.hasRootAccess(host) &&
				!host.includes("hacknet") &&
				ns.getServerMaxRam(host) > 0)
			.sort((a, b) =>
				ns.getServerMaxRam(b) - ns.getServerMaxRam(a));
	}
}

export function scriptFuncs(ns) {
	if (ns.jjy === undefined) ns.jjy = {};
	ns.jjy.scripts = {};
	ns.jjy.scripts.maxThreads = function (host, script) {
		return Math.floor(
			(ns.getServerMaxRam(host) -
				ns.getServerUsedRam(host) -
				(host === "home" ? 64 : 0)) /
			ns.getScriptRam(script));
	}
	ns.jjy.scripts.copyAll = async function (hosts, ...scripts) {
		for (let host of hosts) {
			await ns.scp(scripts, host);
		}
	}
	ns.jjy.scripts.schedule = function (hosts, script, threads, ...args) {
		threads = Math.ceil(threads);
		if (threads <= 0) return 0;
		else if (script.includes("grow") && threads > 2 ** 15) threads = 2 ** 15;
		else if (script.includes("weaken") && threads > 2000) threads = 2000;
		for (let host of hosts) {
			try {
				let maxi = ns.jjy.scripts.maxThreads(host, script);
				if (maxi <= 0) continue;
				const amt = Math.min(maxi, threads);
				ns.exec(script, host, amt, ...args);
				threads -= maxi;
				if (threads <= 0) return 0;
			} catch (error) {
				ns.toast(error, "error", 10000);
			}
		}
		return threads;
	}
}

export function lockFuncs(ns) {
	function lockFile(server) {
		return "/lock/_lock/" + server + ".txt";
	}
	if (ns.jjy === undefined) ns.jjy = {};
	ns.jjy.lock = {};
	ns.jjy.lock.lockServer = function (server, millis, msg) {
		ns.exec("/lock/lock.js", "home", 1, lockFile(server), millis, msg);
	}
	ns.jjy.lock.isLocked = function (server) {
		return ns.fileExists(lockFile(server));
	}
	ns.jjy.lock.clearLocks = function () {
		for (let filename of ns.ls("home", "/lock/_lock/")) {
			ns.rm(filename);
		}
	}
}
