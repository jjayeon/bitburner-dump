import { serverFuncs } from "/jjy";

/** @param {NS} ns **/
export async function main(ns) {
    serverFuncs(ns);
    const args = ns.flags([["help", false]]);
    if (args.help) {
        ns.tprint("This script helps you find an unsolved coding contract.");
        ns.tprint(`Usage: run ${ns.getScriptName()}`);
        ns.tprint("Example:");
        ns.tprint(`> run ${ns.getScriptName()}`);
        return;
    }

    let servers = ns.jjy.servers.all();
    const hosts = Object.keys(servers).filter(s => ns.ls(s).find(f => f.endsWith(".cct")))
    for (let hostname of hosts) {
        ns.tprint(`Found coding contract on '${hostname}'.`);
        ns.tprint(servers[hostname]);
    }
}
