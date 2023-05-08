import { serverFuncs, scriptFuncs } from "/jjy";

/** @param {NS} ns **/
export async function main(ns) {
    serverFuncs(ns);
    scriptFuncs(ns);
    const args = ns.flags([["help", false], ["numThreads", 0]]);
    if (args._.length < 2 || args.help) {
        ns.tprint(`
Executes the given script + args on all available servers.
Usage: run ${ns.getScriptName()} SCRIPT ...ARGS
Example:
> run ${ns.getScriptName()} basic_hack.js n00dles`);
        return;
    }
    let script = args._[0];
    let script_args = args._.slice(1);
    while (true) {
        const hosts = ns.jjy.servers.hosts();
        await ns.jjy.scripts.copyAll(hosts, script);
        for (let host of hosts) {
            let threads = ns.jjy.scripts.maxThreads(host, script);
            if (host === "home") { threads -= 4 };
            if (threads <= 0) { continue; }
            ns.exec(script, host, threads, ...script_args);
        }
        await ns.sleep(1000);
    }
}

export function autocomplete(data, args) {
    return [...data.servers, ...data.scripts];
}
