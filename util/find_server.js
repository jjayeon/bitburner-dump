import { serverFuncs } from "/jjy";

export function autocomplete(data, args) {
    return data.servers;
}
export async function main(ns) {
    serverFuncs(ns);
    const args = ns.flags([["help", false]]);
    let server = args._[0];
    if (!server || args.help) {
        ns.tprint("This script helps you find a server on the network and shows you the path to get to it.");
        ns.tprint(`Usage: run ${ns.getScriptName()} SERVER`);
        ns.tprint("Example:");
        ns.tprint(`> run ${ns.getScriptName()} n00dles`);
        return;
    }

    let servers = ns.jjy.servers.all();
	ns.tprint(servers[server]);
}
