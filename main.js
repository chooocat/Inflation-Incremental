let lastUpdate = Date.now()
const pointGrowthFactor = 33/1000

softcapLevelLabel = [
    Format(getMulti(multi.points.softcap_start['1'])),
    Format('1e50'),
    `${Format('1.79e308')} fr`,
    "inf"
]

function update(){
    if (player.points.gte('1.79e308')) {
        player.softcapLevel = 3
        multi.points.root_softcap3 = player.points.log10().sub(308.25).root(3)
    } else if (player.points.gte('1e50')) {
        player.softcapLevel = 2
        multi.points.div_softcap2 = player.points.log10().sub(49).pow(1.5)
    } else if (player.points.gte(getMulti(multi.points.softcap_start['1']))) {
        player.softcapLevel = 1
        multi.points.div_softcap1 = player.points.div(getMulti(multi.points.softcap_start['1'])).root(8)
    } else {
        player.softcapLevel = 0
    }

    multi.points.mul_upg_p1 = E(1.35).pow(upgrades.points['1'].level)
    multi.points.softcap_start['1'].mul_upg_p2 = E(5).pow(upgrades.points['2'].level)
    
}

function update2(){
    if (player.softcapLevel === 3) {

    } else if (player.softcapLevel === 2) {
        multi.points.root_softcap3 = E(1)
    } else if (player.softcapLevel === 1) {
        multi.points.root_softcap3 = E(1)
        multi.points.div_softcap2 = E(1)
    } else {
        multi.points.root_softcap3 = E(1)
        multi.points.div_softcap2 = E(1)
        multi.points.div_softcap1 = E(1)
    }

    softcapLevelLabel[0] = Format(getMulti(multi.points.softcap_start['1']))
}

/*function unpackStringToStat(str) {
    let path = player
    let spl = str.split(".")

    for (let i = 0; i < spl.length; i++) {
        path = path[spl]
    }

    return path
}*/

function buyUpgrade(type, id) {
    const upgrade = upgrades[type][id]
    const cost = upgrade.cost
    const level = upgrade.level
    const cap = upgrade.levelCap
    //let currency = unpackStringToStat(upgrade.currency)
    let currency = player[type]
    const doCost = upgrade.doCost

    if (currency.lt(cost)) return
    if (cap != "none") {
        if (level.gte(cap)) return
    }

    let lvlForm = upgrade.levelForm()
    if (cap != "none") {
        lvlForm = lvlForm.min(cap)
    }
    upgrade.level = lvlForm

    upgrade.cost = upgrade.costForm()

    if (doCost === 2) {
        player[type] = upgrade.resetTo
    } else if (doCost === 1) {
        player[type] = currency.sub(upgrade.costForm(1))
    }

    console.log(upgrade)
}

function gain(diff) {
    // Points
    let base = getMulti(multi.points).pow(pointGrowthFactor)
    player.points = player.points.mul(base)
}

function tick() {
    let diff = (Date.now()-lastUpdate)/1000
    gain(diff)
    update()
    lastUpdate = Date.now()
}

setInterval(tick, 33)
setInterval(update2, 200)