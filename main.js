let lastUpdate = Date.now()
const pointGrowthFactor = 33/1000

softcapLevelLabel = [
    Format(getMulti(multi.points.softcap_start['1'])),
    Format('1e40'),
    `${Format('1.79e308')} fr`,
    "inf"
]

softcapLevelFormulas = [
    function() {multi.points.div_softcap1 = player.points.div(getMulti(multi.points.softcap_start['1'])).root(8)},
    function() {multi.points.div_softcap2 = player.points.log10().sub(39).pow(1.5)},
    function() {multi.points.root_softcap3 = player.points.log10().sub(308.25).root(3)},
    function() {return},
]

function update(){
    if (player.points.gte('1.79e308')) {
        player.softcapLevel = 3
    } else if (player.points.gte('1e40')) {
        player.softcapLevel = 2
    } else if (player.points.gte(getMulti(multi.points.softcap_start['1']))) {
        player.softcapLevel = 1
    } else {
        player.softcapLevel = 0
    }

    for (i = 0; i < player.softcapLevel; i++) {
        softcapLevelFormulas[i]()
    }

    multi.points.mul_upg_p1 = E(1.4).pow(upgrades.points['1'].level)
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

    for (const layer in upgrades) {
        for (const upgradeId in upgrades[layer]) {
            const id = layer+"-"+upgradeId
            const upgradeElement = document.getElementById(id)
            const upgrade = upgrades[layer][upgradeId]
            const currency = player[layer]
            
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
    //let currency = unpackStringToStat(upgrade.currency)
    const doCost = upgrade.doCost
    const upgradeForm = upgradeFormulas[type][id]

    if (player[type].lt(cost)) return
    if (upgrade.level.gte(upgrade.levelCap)) return
    console.log(type, id)

    let lvlForm = upgradeForm.levelForm().min(upgrade.levelCap)
    upgrade.level = lvlForm

    upgrade.cost = upgradeForm.costForm()

    if (doCost === 2) {
        player[type] = upgrade.resetTo
    } else if (doCost === 1) {
        player[type] = player[type].sub(upgradeForm.costForm(1))
    }
}

function gain(diff) {
    // Points
    let base = getMulti(multi.points).pow(diff)
    player.points = player.points.mul(base)
}

function tick() {
    let diff = (Date.now()-lastUpdate)/1000
    gain(diff)
    update()
    lastUpdate = Date.now()
}

load()

setInterval(tick, 33)
setInterval(update2, 200)

setInterval(save, 3000)