let lastUpdate = Date.now()
const pointGrowthFactor = 33/1000

displayPrestigeGainText = "Reach 1e40 Points first to reset"

softcapLevelLabel = [
    Format(getMulti(multi.points.softcap_start['1'])),
    Format(getMulti(multi.points.softcap_start['2'])),
    `${Format('1.79e308')} fr`,
    Format('1e1000'),
    "inf"
]

softcapLevelFormulas = [
    function() {multi.points.div_softcap1 = player.points.amount.div(getMulti(multi.points.softcap_start['1'])).root(8)},
    function() {multi.points.div_softcap2 = player.points.amount.log10().sub(getMulti(multi.points.softcap_start['2']).log10().sub(1)).pow(2)},
    function() {multi.points.div_softcap3 = player.points.amount.add(1).log10().sub(308.25).pow(100)},
    function() {multi.points.div_softcap4 = player.points.amount.log(1.01).pow(2)},
    function() {return},
]

function ResetUpgradesUnderPath(path) {
    for (const upgId in path) {
        let upgrade = path[upgId]
        upgrade.level = E(0)
        upgrade.cost = upgrade.baseCost
    }
}

function PrestigeReset() {
    player.points.amount = E(1)
    player.points.best = E(1)
    player.points.levelXp = E(0)
    player.points.level = E(0)
    ResetUpgradesUnderPath(player.upgrades.points)
}

function prestige() {
    if (!player.points.amount.gte(1e40)) return
    if (!player.unlocks.prestige) return
    let doReset = false

    if (player.options.confirms.prestige) {
        doReset = confirm("Are you sure you want to do Prestige?")
    } else {
        doReset = true
    }

    if (!doReset) return

    player.prestige.prestiged = true
    player.prestige.points = player.prestige.points.add(nonSavePlayer.prestigePointGain)
    player.prestige.total = player.prestige.total.add(nonSavePlayer.prestigePointGain)
    player.prestige.best = player.prestige.points.gt(player.prestige.best) ? player.prestige.points : player.prestige.best

    player.prestige.levelXp = player.prestige.prestiged ? player.prestige.levelXp.add(getMulti(multi.prestige.xp)) : E(0)

    PrestigeReset()
}

function openTab(id, type) {
    let tabs = document.querySelectorAll(".tab-"+type);
    
    tabs.forEach(function(tab) {
        tab.style.display = "none";
    });

    document.getElementById(id + "-tab").style.display = "block";
}

function update(){
    //every tick (0.033s)
    if (player.points.amount.gte('1e1000')) {
        nonSavePlayer.softcapLevel = 4
    } else if (player.points.amount.gte('1.79e308')) {
        nonSavePlayer.softcapLevel = 3
    } else if (player.points.amount.gte(getMulti(multi.points.softcap_start['2']))) {
        nonSavePlayer.softcapLevel = 2
    } else if (player.points.amount.gte(getMulti(multi.points.softcap_start['1']))) {
        nonSavePlayer.softcapLevel = 1
    } else {
        nonSavePlayer.softcapLevel = 0
    }

    for (i = 0; i < nonSavePlayer.softcapLevel; i++) {
        softcapLevelFormulas[i]()
    }

    let normalPointXPReq = E(2).pow(player.points.level).mul(10)
    let normalPrestigeXPReq = E(2).pow(player.prestige.level).mul(10)

    player.points.level = player.points.levelXp.div(10).add(1).log(2).floor()
    player.prestige.level = player.prestige.levelXp.div(10).add(1).log(2).floor()

    nonSavePlayer.prestigePointGain = player.points.amount.gte(1e40) ? player.points.amount.div(1e40).log(1.12).mul(getMulti(multi.prestige)) : E(0)
    nonSavePlayer.pointXpReq = player.points.level.eq(0) ? E(10) : normalPointXPReq
    nonSavePlayer.pointXpCur = player.points.level.eq(0) ? player.points.levelXp : player.points.levelXp.add(10).sub(normalPointXPReq)
    nonSavePlayer.prestigeXpReq = player.prestige.level.eq(0) ? E(10) : normalPrestigeXPReq
    nonSavePlayer.prestigeXpCur = player.prestige.level.eq(0) ? player.prestige.levelXp : player.prestige.levelXp.add(10).sub(normalPrestigeXPReq)

    displayPrestigeGainText = player.points.amount.gte(1e40) ? `+${Format(nonSavePlayer.prestigePointGain)} Prestige Points` : "Reach 1e40 Points first to reset"

    multi.points.xp.add_base = player.prestige.prestiged ? player.points.amount.add(1).log(100) : E(0)
    multi.prestige.xp.add_base = player.prestige.points.add(1).log(1.3)

    multi.points.mul_prestigeBonus = player.prestige.points.add(1).pow(0.7)
    multi.points.mul_pointLevelBonus = E(1.05).pow(player.points.level)
    multi.points.xp.mul_prestigeLevelBonus = E(1.5).pow(player.prestige.level)
    multi.points.softcap_start['1'].mul_pointLevelBonus = E(1.2).pow(player.points.level)
    multi.points.softcap_start['2'].mul_pointLevelBonus = E(1.5).pow(player.points.level)
    multi.prestige.mul_prestigeLevelBonus = E(1.04).pow(player.prestige.level)

    multi.points.mul_upg_p1 = (E(1.4).add(player.prestige.level.div(100))).pow(player.upgrades.points['1'].level)
    multi.points.softcap_start['1'].mul_upg_p2 = E(5).pow(player.upgrades.points['2'].level)
    multi.points.xp.mul_upg_p3 = E(1.3).pow(player.upgrades.points['3'].level)
    multi.points.mul_upg_pr1 = (E(1.75).add(player.prestige.level.div(100))).pow(player.upgrades.prestige['1'].level)
    multi.points.xp.mul_upg_pr2 = E(2).pow(player.upgrades.prestige['2'].level)

    document.getElementById("point-level-bar").style.width = ((nonSavePlayer.pointXpCur.div(nonSavePlayer.pointXpReq).mul(100).toNumber())-1)+"%"
    document.getElementById("prestige-level-bar").style.width = ((nonSavePlayer.prestigeXpCur.div(nonSavePlayer.prestigeXpReq).mul(100).toNumber())-1)+"%"
}

function update2(){
    //every 0.2s
    if (nonSavePlayer.softcapLevel === 3) {
        multi.points.root_softcap4 = E(1)
    } else if (nonSavePlayer.softcapLevel === 2) {
        multi.points.root_softcap4 = E(1)
        multi.points.div_softcap3 = E(1)
    } else if (nonSavePlayer.softcapLevel === 1) {
        multi.points.root_softcap4 = E(1)
        multi.points.div_softcap3 = E(1)
        multi.points.div_softcap2 = E(1)
    } else {
        multi.points.root_softcap4 = E(1)
        multi.points.div_softcap3 = E(1)
        multi.points.div_softcap2 = E(1)
        multi.points.div_softcap1 = E(1)
    }

    softcapLevelLabel[0] = Format(getMulti(multi.points.softcap_start['1']))
    softcapLevelLabel[1] = Format(getMulti(multi.points.softcap_start['2']))

    player.prestige.best = player.prestige.points.gt(player.prestige.best) ? player.prestige.points : player.prestige.best

    if (!player.unlocks.prestige && nonSavePlayer.softcapLevel >= 2) {
        player.unlocks.prestige = true
    }

    let prest = document.querySelectorAll(".prestige")
    prest.forEach(function(tab) {
        if (tab.id === "locked") {
            tab.style.display = player.unlocks.prestige ? "none" : "block";
        } else if (tab.id === "unlocked") {
            tab.style.display = player.unlocks.prestige ? "block" : "none";
        }
    });

    document.querySelector(".prestige-levels").style.display = player.prestige.prestiged ? "inline-block" : "none"
    document.querySelector("#points-3").style.display = player.prestige.prestiged ? "inline-block" : "none"
    document.querySelector("#prestige-2").style.display = player.prestige.prestiged ? "inline-block" : "none"

    for (const layer in player.upgrades) {
        for (const upgradeId in player.upgrades[layer]) {
            const id = layer+"-"+upgradeId
            const upgradeElement = document.getElementById(id)
            const upgrade = player.upgrades[layer][upgradeId]
            const curPath = currencyStringValues[upgrade.currency]
            const currency = unpackStringToStat(curPath)
            
            if (upgrade.level.gte(upgrade.levelCap)) {
                upgradeElement.className = "maxed"
            } else {
                if (currency.gte(upgrade.cost)) {
                    upgradeElement.className = "canafford"
                } else {
                    upgradeElement.className = "cannotafford"
                }
            }
        }
    }
}

function unpackStringToStat(str) {
    let path = player
    let spl = str.split(".")

    for (let i = 0; i < spl.length; i++) {
        path = path[spl[i]]
    }

    return path
}

function setStringToStatValueTo(str, val) {
    eval(`player.${str} = E(${val})`)
}

function buyUpgrade(type, id) {
    const upgrade = player.upgrades[type][id]
    const curPath = currencyStringValues[upgrade.currency]
    const cost = upgrade.cost
    const currency = unpackStringToStat(curPath)
    const doCost = upgrade.doCost
    const upgradeForm = upgradeFormulas[type][id]

    if (currency.lt(cost)) return
    if (upgrade.level.gte(upgrade.levelCap)) return
    console.log(type, id)

    let lvlForm = upgradeForm.levelForm().min(upgrade.levelCap)
    upgrade.level = lvlForm

    upgrade.cost = upgradeForm.costForm()

    if (doCost === 2) {
        setStringToStatValueTo(curPath, upgrade.resetTo)
    } else if (doCost === 1) {
        setStringToStatValueTo(curPath, unpackStringToStat(curPath).sub(upgradeForm.costForm(1)))
    }
}

function gain(diff) {
    // Points
    player.points.amount = player.points.amount.mul(getMulti(multi.points).pow(pointGrowthFactor))
    player.points.levelXp = player.prestige.prestiged ? player.points.levelXp.add(getMulti(multi.points.xp).mul(diff)) : E(0)

    player.points.best = player.points.amount.gt(player.points.best) ? player.points.amount : player.points.best
}

function tick() {
    let diff = Math.min((Date.now()-lastUpdate)/1000, 1)
    gain(diff)
    update()
    lastUpdate = Date.now()
}

load()

setTimeout(function() {
    setInterval(tick, 33)
    setInterval(update2, 200)

    setInterval(save, 3000)
}, 500)