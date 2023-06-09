import { serverFuncs } from "/jjy";

/** @param {NS} ns **/
export async function main(ns) {
    serverFuncs(ns);
    const args = ns.flags([
        ["h", false],
        ["m", false],
        ["d", false],
        ["s", false],
        ["l", false],
        ["a", false],
        ["u", false],
        ["first", 100],
        ["last", 100],
        ["k", false]]);
    if (args.h) {
        ns.tprint(`
Lists info for all cracked servers.
Usage: run ${ns.getScriptName()}
Example:
> run ${ns.getScriptName()} -mds
Flags: 
    -m (memory) 
    -d (money/dollars) 
    -s (security info) 
    -l (lockfiles)
    -c (continuous)
    -a (all)
No flags = -dsl.
`);
        return;
    }
    if (!args.m && !args.d && !args.s && !args.a) {
        args.d = args.s = args.l = true;
    }

    do {
        const allServers = Object.keys(ns.jjy.servers.all());
        const hosts = ns.jjy.servers.hosts(allServers);
        const targets = ns.jjy.servers.targets(allServers);
        const serversSet = new Set();
        function includeIfFlag(flag, servers) {
            if (flag) servers.forEach(server => serversSet.add(server));
        }
        includeIfFlag(args.a, allServers);
        includeIfFlag(args.m, hosts);
        includeIfFlag(args.d || args.s, targets);

        const servers = Array.from(serversSet)
            .sort((a, b) => ns.getServerMaxMoney(a) - ns.getServerMaxMoney(b))
            .slice(0, args.first)
            .slice(-args.last);
        ns.ui.clearTerminal();
        let output = "~~~~~~~~ SERVER INFO ~~~~~~~~\n";
        for (let server of servers) {
            output += (server).padEnd(18, " ") +
                (args.m ? memInfo(server) : "") +
                (args.d ? dolInfo(server) : "") +
                (args.s ? secInfo(server) : "") +
                (args.l ? timInfo(server) : "") + "\n";
        }
        ns.tprint(output);
        await ns.sleep(100);
    } while (args.u);

    function memInfo(server) {
        const used = ns.getServerUsedRam(server);
        const max = ns.getServerMaxRam(server);
        const mempr = max === 0 ? "" :
            `(${(used / max * 100).toFixed(1)}%)`;
        return formatGB(used, 1).padStart(8, " ") + " / " +
            formatGB(max).padStart(6, " ") +
            mempr.padStart(9, " ");
    }
    function dolInfo(server) {
        const money = ns.getServerMoneyAvailable(server);
        const maxMoney = ns.getServerMaxMoney(server);
        const monpr = maxMoney === 0 ? "" :
            `(${(money / maxMoney * 100).toFixed(1)}%)`;
        const growth = ns.nFormat(ns.getServerGrowth(server), "0a");
        return ns.nFormat(money, "$0.0a").padStart(9, " ") + " / " +
            ns.nFormat(maxMoney, "$0.0a").padStart(7, " ") +
            monpr.padStart(10, " ") +
            " ⬆: " + growth.padStart(2, " ");
    }
    function secInfo(server) {
        const sec = ns.getServerSecurityLevel(server);
        const minSec = ns.getServerMinSecurityLevel(server);
        const lev = ns.getServerRequiredHackingLevel(server).toString();
        const tim = formatTime(ns.getWeakenTime(server) / 1000);
        const scr = `${sec.toFixed(1)} / ${minSec.toFixed(1)}`;
        // const chn = `\t(${(ns.hackAnalyzeChance(server) * 100).toFixed(2)}%)`;
        return `  lv: ` + lev.padStart(4, " ") +
            `  ◔: ` + tim.padStart(7, " ") +
            `  🌡: ` + scr.padStart(12, " ");
    }
    function timInfo(server) {
        const info = ns.read(`/lock/_lock/${server}.txt`);
        if (info === "") return "";
        const lines = info.split("\n");
        const start = lines[0];
        const duration = lines[1];
        const action = lines[2];
        const timeLeft = (duration - (Date.now() - start)) / 1000;
        return formatTime(timeLeft).padStart(8, " ") + " " + action;
    }
    function formatGB(gb, decimals = 0) {
        if (gb === 0) return '0 GB';
        const k = 1000;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = ~~(Math.log(gb) / Math.log(k));
        return parseFloat((gb / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    }
    function formatTime(seconds) {
        return (
            (seconds > 60 ?
                `${~~(seconds / 60)}m ` :
                "") +
            (seconds > 10 ?
                (seconds % 60).toFixed(0) :
                (seconds % 60).toFixed(2))
                .padStart(2, "0") + "s"
        );
    }
}
